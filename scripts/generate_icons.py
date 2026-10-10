import os
from PIL import Image, ImageDraw

src_path = "/Users/patitpabanroy/.gemini/antigravity/brain/9de4990e-5056-4dec-ba4b-b2585c92c6f3/.user_uploaded/media_1787982924774.png"
img = Image.open(src_path).convert("RGBA")

print(f"Source image size: {img.size}")

# Android Res Path
res_dir = "/Users/patitpabanroy/Desktop/Work/Smart Gym apps/android/app/src/main/res"

densities = {
    "mipmap-mdpi": {"icon": 48, "fg": 108},
    "mipmap-hdpi": {"icon": 72, "fg": 162},
    "mipmap-xhdpi": {"icon": 96, "fg": 216},
    "mipmap-xxhdpi": {"icon": 144, "fg": 324},
    "mipmap-xxxhdpi": {"icon": 192, "fg": 432}
}

def make_round_icon(image, size):
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    
    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(resized, (0, 0), mask=mask)
    return round_img

def make_foreground_icon(image, size):
    fg_canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_size = int(size * 0.72)
    offset = (size - inner_size) // 2
    resized_inner = image.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    fg_canvas.paste(resized_inner, (offset, offset), mask=resized_inner)
    return fg_canvas

for folder, specs in densities.items():
    target_dir = os.path.join(res_dir, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    icon_sz = specs["icon"]
    fg_sz = specs["fg"]
    
    # 1. ic_launcher.png
    sq_icon = img.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    sq_icon.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
    
    # 2. ic_launcher_round.png
    rd_icon = make_round_icon(img, icon_sz)
    rd_icon.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")
    
    # 3. ic_launcher_foreground.png
    fg_icon = make_foreground_icon(img, fg_sz)
    fg_icon.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")
    
    print(f"Generated icons for {folder}: ic_launcher={icon_sz}x{icon_sz}, fg={fg_sz}x{fg_sz}")

# Public / Web / PWA directory
public_dir = "/Users/patitpabanroy/Desktop/Work/Smart Gym apps/public"
os.makedirs(public_dir, exist_ok=True)

pwa_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
pwa_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

pwa_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
pwa_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

fav_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(os.path.join(public_dir, "favicon.png"), "PNG")
fav_32.save(os.path.join(public_dir, "favicon.ico"), "ICO")

# SVG favicon for web
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="24" fill="#0B0E17"/>
  <rect x="2" y="2" width="96" height="96" rx="22" stroke="url(#borderGrad)" stroke-width="4"/>
  <path d="M22 50 H36 L44 26 L56 74 L64 42 L70 50 H78" stroke="#00F5A0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
  <defs>
    <linearGradient id="borderGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00D4FF"/>
      <stop offset="1" stop-color="#00F5A0"/>
    </linearGradient>
    <filter id="glow" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>'''

with open(os.path.join(public_dir, "favicon.svg"), "w") as f:
    f.write(svg_content)

# Splash Screens
splash_targets = {
    "drawable": (480, 320),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
}

for folder, (w, h) in splash_targets.items():
    sp_dir = os.path.join(res_dir, folder)
    os.makedirs(sp_dir, exist_ok=True)
    
    # Dark gym canvas #0B0E17
    canvas = Image.new('RGBA', (w, h), (11, 14, 23, 255))
    
    # Center logo
    logo_size = min(w, h) // 3
    logo_resized = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    pos = ((w - logo_size) // 2, (h - logo_size) // 2)
    canvas.paste(logo_resized, pos, mask=logo_resized)
    
    canvas.save(os.path.join(sp_dir, "splash.png"), "PNG")
    print(f"Generated splash screen for {folder} ({w}x{h})")

print("All Android launcher icons, splash screens, and Web/PWA assets successfully generated!")
