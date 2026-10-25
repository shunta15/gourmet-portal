#!/usr/bin/env python3
"""写真の候補(cand/*.jpg)を、番号つきの一覧画像 1 枚(作業フォルダの sheet.jpg)にまとめる。
書き手が写真を 1 枚ずつ開かずに済むようにして、使う量を減らすため。使い方: python3 contact-sheet.py <作業フォルダ>"""
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
work = sys.argv[1]
files = sorted(glob.glob(os.path.join(work, "cand", "*.jpg")))
files = [f for f in files if os.path.basename(f) != "sheet.jpg"]
if not files:
    sys.exit(0)
W, H, COLS = 300, 225, 4
rows = (len(files) + COLS - 1) // COLS
sheet = Image.new("RGB", (W * COLS, H * rows), "white")
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)
except Exception:
    font = ImageFont.load_default()
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB")
    im.thumbnail((W - 6, H - 6))
    x, y = (i % COLS) * W, (i // COLS) * H
    sheet.paste(im, (x + (W - im.width) // 2, y + (H - im.height) // 2))
    label = os.path.splitext(os.path.basename(f))[0]
    d.rectangle([x + 3, y + 3, x + 78, y + 40], fill="black")
    d.text((x + 8, y + 6), label, fill="yellow", font=font)
sheet.save(os.path.join(work, "sheet.jpg"), quality=78)
