"""Xuất nền lobby và ô nền rừng từ ảnh gốc; không sửa bộ actor v3."""
from pathlib import Path
from hashlib import sha256
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).parent / "sources"
TARGET = ROOT / "public/assets/v4/maps"
TARGET.mkdir(parents=True, exist_ok=True)
entries = []
for name in ["lobby-alchemy", "lobby-forge", "lobby-cultivate", "lobby-pets"]:
    image = Image.open(SOURCE / f"{name}.png").convert("RGB")
    image = image.resize((1600, 900), Image.Resampling.LANCZOS)
    path = TARGET / f"{name}.png"
    image.save(path, optimize=True)
    entries.append({"id": name, "file": path.relative_to(ROOT / "public").as_posix(),
                    "type": "background", "size": [1600, 900],
                    "sha256": sha256(path.read_bytes()).hexdigest()})

# Ghép mép đối diện để tile không hiện đường nối khi trải trên map lớn.
tile = Image.open(SOURCE / "forest-floor-tile.png").convert("RGB")
pixels = np.array(tile.resize((512, 512), Image.Resampling.LANCZOS), dtype=float)
band = 20
for axis in [1, 0]:
    original = pixels.copy()
    for distance in range(band):
        mix = (1 - distance / band) * .5
        if axis == 1:
            pixels[:, distance] = original[:, distance] * (1 - mix) + original[:, -distance - 1] * mix
            pixels[:, -distance - 1] = original[:, -distance - 1] * (1 - mix) + original[:, distance] * mix
        else:
            pixels[distance] = original[distance] * (1 - mix) + original[-distance - 1] * mix
            pixels[-distance - 1] = original[-distance - 1] * (1 - mix) + original[distance] * mix
tile = Image.fromarray(np.rint(pixels).clip(0, 255).astype("uint8"))
path = TARGET / "forest-floor-tile.png"
tile.save(path, optimize=True)
entries.append({"id": "forest-floor-tile", "file": path.relative_to(ROOT / "public").as_posix(),
                "type": "terrain-tile", "size": [512, 512],
                "sha256": sha256(path.read_bytes()).hexdigest()})
qa = Path(__file__).parent / "qa"
qa.mkdir(exist_ok=True)
sheet = Image.new("RGB", (1024, 1024))
for x in [0, 512]:
    for y in [0, 512]:
        sheet.paste(tile, (x, y))
sheet.save(qa / "terrain-repeat.png")
pixels = np.asarray(tile)
assert np.array_equal(pixels[:, 0], pixels[:, -1])
assert np.array_equal(pixels[0], pixels[-1])
manifest = {"version": 4, "status": "prepared", "sharedAssets": entries}
(ROOT / "public/assets/v4/environment-manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print(f"Đã xuất {len(entries)} nền; tile khớp cả bốn mép.")
