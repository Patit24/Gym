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

  // Web desktop fallback: programmatic file input with direct camera or gallery capture
  return new Promise<string | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') {
      input.capture = 'environment';
    }

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
