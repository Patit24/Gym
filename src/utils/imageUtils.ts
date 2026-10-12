import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Client-side image compression utility
 * Compresses images to compact base64 JPEG format (< 50KB) suitable for direct Firestore storage
 */
export const compressImage = (file: File, maxDim = 480, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(ev.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Universal photo capture helper:
 * - Uses native Android camera hardware via @capacitor/camera when running on mobile.
 * - Falls back seamlessly to HTML file picker if on web desktop or if native camera is unavailable.
 */
export const capturePhoto = async (
  source: 'camera' | 'photos' = 'camera',
  maxDim = 480,
  quality = 85
): Promise<string | null> => {
  // If running in native Capacitor (Android APK) or Capacitor Camera is available
  if (Capacitor.isNativePlatform()) {
    try {
      // Proactively check and request permissions if needed
      try {
        const perms = await Camera.checkPermissions();
        if (source === 'camera' && perms.camera !== 'granted') {
          const req = await Camera.requestPermissions({ permissions: ['camera'] });
          if (req.camera !== 'granted') {
            console.warn('Camera permission not granted:', req.camera);
            return null;
          }
        }
      } catch (permErr) {
        console.warn('Permission query notice:', permErr);
      }

      // Try takePhoto first for direct camera hardware if source is camera
      if (source === 'camera' && typeof (Camera as any).takePhoto === 'function') {
        try {
          const res = await (Camera as any).takePhoto({
            quality,
            targetWidth: maxDim,
            targetHeight: maxDim,
            correctOrientation: true,
          });
          if (res?.thumbnail) {
            return res.thumbnail.startsWith('data:') ? res.thumbnail : `data:image/jpeg;base64,${res.thumbnail}`;
          }
          if (res?.webPath) {
            const blob = await fetch(res.webPath).then(r => r.blob());
            const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
            return await compressImage(file, maxDim, quality / 100);
          }
        } catch (takePhotoErr: any) {
          if (takePhotoErr?.message?.includes('cancelled') || takePhotoErr?.message?.includes('User cancelled')) {
            return null;
          }
          console.warn('takePhoto notice, trying getPhoto:', takePhotoErr);
        }
      }

      // Standard getPhoto method with CameraSource.Camera or CameraSource.Photos
      const photo = await Camera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        width: maxDim,
        height: maxDim,
      });

      if (photo.dataUrl) {
        return photo.dataUrl;
      }
      if (photo.webPath) {
        const blob = await fetch(photo.webPath).then(r => r.blob());
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        return await compressImage(file, maxDim, quality / 100);
      }
      return null;
    } catch (nativeErr: any) {
      if (
        nativeErr?.message?.includes('cancelled') ||
        nativeErr?.message?.includes('User cancelled') ||
        nativeErr?.message?.includes('Canceled') ||
        nativeErr?.message?.includes('denied')
      ) {
        return null;
      }
      console.error('Native camera capture error:', nativeErr);
      // On mobile native, do NOT fall back to standard HTML file input because on Android WebViews
      // that defaults to gallery/document picker instead of hardware camera!
      return null;
    }
  }

  // Web desktop & mobile web browser:
  if (source === 'camera') {
    // Open live viewfinder modal using WebRTC getUserMedia
    return new Promise<string | null>((resolve) => {
      // Create DOM container for Web Camera modal
      const modalContainer = document.createElement('div');
      modalContainer.id = '__web_camera_modal_root__';
      document.body.appendChild(modalContainer);

      let stream: MediaStream | null = null;
      let facingMode: 'user' | 'environment' = 'user';

      const cleanup = () => {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          stream = null;
        }
        modalContainer.remove();
      };

      // HTML structure
      modalContainer.innerHTML = `
        <div style="position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 12px; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="position: relative; width: 100%; max-width: 440px; background: #0E131F; border: 1px solid rgba(6,182,212,0.4); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); display: flex; flex-direction: column;">
            
            <!-- Header -->
            <div style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); background: #080C14; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(6,182,212,0.2); color: #06B6D4; display: flex; align-items: center; justify-content: center; font-size: 14px;">📷</div>
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">Device Camera</div>
                  <div style="font-size: 10px; color: #94A3B8;">Position face clearly in viewfinder</div>
                </div>
              </div>
              <button id="__cam_close_btn__" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #CBD5E1; border: none; cursor: pointer; font-size: 14px; font-weight: bold;">✕</button>
            </div>

            <!-- Viewfinder Area -->
            <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #000000; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <video id="__cam_video__" playsinline autoplay muted style="width: 100%; height: 100%; object-fit: cover;"></video>
              <img id="__cam_preview__" style="display: none; width: 100%; height: 100%; object-fit: cover;" />
              
              <!-- Frame Overlay Guide -->
              <div id="__cam_overlay__" style="position: absolute; inset: 24px; border: 2px dashed rgba(6,182,212,0.6); border-radius: 20px; pointer-events: none; display: flex; align-items: center; justify-content: center;">
                <div style="width: 140px; height: 180px; border-radius: 50%; border: 1px solid rgba(6,182,212,0.3);"></div>
              </div>

              <!-- Flip Camera Button -->
              <button id="__cam_flip_btn__" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 16px; backdrop-filter: blur(4px);">🔄</button>

              <!-- Status Overlay -->
              <div id="__cam_status__" style="position: absolute; inset: 0; background: rgba(14,19,31,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #06B6D4; font-size: 12px; font-weight: bold; padding: 20px; text-align: center;">
                <span>Starting device camera hardware...</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div style="padding: 16px; background: #080C14; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 12px;">
              <div id="__cam_capture_controls__" style="display: flex; align-items: center; justify-content: center; width: 100%;">
                <button id="__cam_shutter_btn__" style="width: 64px; height: 64px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); background: #06B6D4; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(6,182,212,0.4); outline: none;">
                  <div style="width: 44px; height: 44px; border-radius: 50%; background: #FFFFFF;"></div>
                </button>
              </div>

              <div id="__cam_review_controls__" style="display: none; width: 100%; gap: 10px;">
                <button id="__cam_retake_btn__" style="flex: 1; padding: 10px 16px; border-radius: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #E2E8F0; font-size: 12px; font-weight: bold; cursor: pointer;">Retake</button>
                <button id="__cam_use_btn__" style="flex: 1; padding: 10px 16px; border-radius: 12px; background: #06B6D4; border: none; color: #000000; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(6,182,212,0.3);">Use Photo ✓</button>
              </div>
            </div>

          </div>
        </div>
      `;

      const video = modalContainer.querySelector('#__cam_video__') as HTMLVideoElement;
      const previewImg = modalContainer.querySelector('#__cam_preview__') as HTMLImageElement;
      const overlay = modalContainer.querySelector('#__cam_overlay__') as HTMLDivElement;
      const statusDiv = modalContainer.querySelector('#__cam_status__') as HTMLDivElement;
      const shutterBtn = modalContainer.querySelector('#__cam_shutter_btn__') as HTMLButtonElement;
      const flipBtn = modalContainer.querySelector('#__cam_flip_btn__') as HTMLButtonElement;
      const closeBtn = modalContainer.querySelector('#__cam_close_btn__') as HTMLButtonElement;
      const captureControls = modalContainer.querySelector('#__cam_capture_controls__') as HTMLDivElement;
      const reviewControls = modalContainer.querySelector('#__cam_review_controls__') as HTMLDivElement;
      const retakeBtn = modalContainer.querySelector('#__cam_retake_btn__') as HTMLButtonElement;
      const useBtn = modalContainer.querySelector('#__cam_use_btn__') as HTMLButtonElement;

      let capturedDataUrl: string | null = null;

      const initCamera = async () => {
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          stream = null;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          statusDiv.innerHTML = `
            <div style="color: #F87171; font-weight: bold; margin-bottom: 8px;">Camera not supported</div>
            <div style="color: #94A3B8; font-size: 11px;">Your browser does not support WebRTC media or you are not on HTTPS.</div>
          `;
          return;
        }

        try {
          statusDiv.style.display = 'flex';
          statusDiv.innerHTML = `<span>Connecting to camera hardware...</span>`;

          const s = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          stream = s;
          video.srcObject = s;
          video.style.transform = facingMode === 'user' ? 'scaleX(-1)' : 'none';
          await video.play();

          statusDiv.style.display = 'none';
        } catch (err: any) {
          console.error('Camera access error:', err);
          let errText = 'Unable to access camera hardware.';
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errText = 'Camera permission denied. Please allow camera access in browser permissions.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errText = 'No camera device found.';
          }
          statusDiv.innerHTML = `
            <div style="color: #F87171; font-weight: bold; margin-bottom: 4px;">Camera Unavailable</div>
            <div style="color: #94A3B8; font-size: 11px; margin-bottom: 12px;">${errText}</div>
            <button id="__cam_retry_btn__" style="padding: 6px 14px; border-radius: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; font-size: 11px; font-weight: bold; cursor: pointer;">Retry</button>
          `;
          const retryBtn = modalContainer.querySelector('#__cam_retry_btn__');
          retryBtn?.addEventListener('click', initCamera);
        }
      };

      initCamera();

      // Close
      closeBtn.onclick = () => {
        cleanup();
        resolve(null);
      };

      // Flip Front/Back
      flipBtn.onclick = () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        initCamera();
      };

      // Shutter click
      shutterBtn.onclick = () => {
        if (!video.videoWidth) return;

        const canvas = document.createElement('canvas');
        let w = video.videoWidth;
        let h = video.videoHeight;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (facingMode === 'user') {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, w, h);
        capturedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);

        // Show preview
        previewImg.src = capturedDataUrl;
        previewImg.style.display = 'block';
        video.style.display = 'none';
        overlay.style.display = 'none';
        flipBtn.style.display = 'none';

        captureControls.style.display = 'none';
        reviewControls.style.display = 'flex';
      };

      // Retake
      retakeBtn.onclick = () => {
        capturedDataUrl = null;
        previewImg.style.display = 'none';
        video.style.display = 'block';
        overlay.style.display = 'flex';
        flipBtn.style.display = 'block';

        captureControls.style.display = 'flex';
        reviewControls.style.display = 'none';
      };

      // Use Photo
      useBtn.onclick = () => {
        cleanup();
        resolve(capturedDataUrl);
      };
    });
  }

  // Gallery picker fallback
  return new Promise<string | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const compressed = await compressImage(file, maxDim, quality / 100);
        resolve(compressed);
      } catch (err) {
        console.error('Photo compression error:', err);
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);

    input.click();
  });
};
