#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path

from PIL import Image, ImageOps, ImageFilter
import pytesseract

TESS_LANG_MAP = {
    "pt": "por",
    "ar": "ara",
    "por": "por",
    "ara": "ara",
    "arabic": "ara",
}

ARABIC_CHAR_MAP = {
    'ا': 'ā', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': 'ʾ', 'ؤ': 'ʾ', 'ئ': 'ʾ',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
    'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'h',
    'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 'ٍ': 'in',
    'ْ': '', 'ّ': '', 'ٰ': 'ā',
}


@dataclass
class PageOCR:
    page: int
    image: str
    layout: str
    rotation_applied: int
    pt_region: str
    ar_region: str
    pt_text: str
    ar_text: str
    ar_translit: str


def normalize_whitespace(text: str) -> str:
    text = text.replace('\u200f', '').replace('\u200e', '')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def transliterate_arabic(text: str) -> str:
    out = []
    for ch in text:
        out.append(ARABIC_CHAR_MAP.get(ch, ch))
    return normalize_whitespace(''.join(out))


def preprocess(img: Image.Image, threshold: int | None = None) -> Image.Image:
    gray = ImageOps.grayscale(img)
    gray = ImageOps.autocontrast(gray)
    gray = gray.filter(ImageFilter.MedianFilter(size=3))
    gray = gray.filter(ImageFilter.SHARPEN)
    if threshold is not None:
        gray = gray.point(lambda p: 255 if p > threshold else 0)
    return gray


def ocr(img: Image.Image, lang: str, psm: int = 6) -> str:
    tess_lang = TESS_LANG_MAP.get(lang, lang)
    cfg = f'--psm {psm}'
    return normalize_whitespace(pytesseract.image_to_string(img, lang=tess_lang, config=cfg))


def iter_images(input_path: Path):
    if input_path.is_file():
        return [input_path]
    exts = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'}
    return sorted([p for p in input_path.iterdir() if p.suffix.lower() in exts])


def rotate_image(img: Image.Image, degrees: int) -> Image.Image:
    if degrees % 360 == 0:
        return img
    return img.rotate(degrees, expand=True)


def split_top_bottom(img: Image.Image, split_ratio: float = 0.5):
    w, h = img.size
    split = int(h * split_ratio)
    top = img.crop((0, 0, w, split))
    bottom = img.crop((0, split, w, h))
    return top, bottom


def split_left_right(img: Image.Image, split_ratio: float = 0.5):
    w, h = img.size
    split = int(w * split_ratio)
    left = img.crop((0, 0, split, h))
    right = img.crop((split, 0, w, h))
    return left, right


def detect_orientation_from_aspect(img: Image.Image) -> int:
    w, h = img.size
    if h > w:
        return 90
    return 0


def detect_script_score(text: str):
    arabic = sum(1 for ch in text if '\u0600' <= ch <= '\u06ff')
    latin = sum(1 for ch in text if ('a' <= ch.lower() <= 'z') or ('À' <= ch <= 'ÿ'))
    return arabic, latin


def auto_detect_layout(img: Image.Image, psm: int = 6):
    candidates = []
    for rotation in [0, 90]:
        rotated = rotate_image(img, rotation)
        for layout in ['top-bottom-ar-pt', 'top-bottom-pt-ar', 'left-right-ar-pt', 'left-right-pt-ar']:
            if layout.startswith('top-bottom'):
                a, b = split_top_bottom(rotated, 0.5)
            else:
                a, b = split_left_right(rotated, 0.5)

            a_small = preprocess(a.resize((max(400, a.width // 3), max(400, a.height // 3))))
            b_small = preprocess(b.resize((max(400, b.width // 3), max(400, b.height // 3))))
            text_a = ocr(a_small, 'ar', psm=psm) + "\n" + ocr(a_small, 'pt', psm=psm)
            text_b = ocr(b_small, 'ar', psm=psm) + "\n" + ocr(b_small, 'pt', psm=psm)

            ar_a, la_a = detect_script_score(text_a)
            ar_b, la_b = detect_script_score(text_b)

            if layout.endswith('ar-pt'):
                score = (ar_a - la_a) + (la_b - ar_b)
            else:
                score = (la_a - ar_a) + (ar_b - la_b)

            candidates.append((layout, rotation, score))

    best = max(candidates, key=lambda x: x[2])
    return best[0], best[1]


def extract_regions(img: Image.Image, layout: str):
    if layout == 'top-bottom-ar-pt':
        top, bottom = split_top_bottom(img, 0.5)
        return bottom, top, 'bottom', 'top'
    if layout == 'top-bottom-pt-ar':
        top, bottom = split_top_bottom(img, 0.5)
        return top, bottom, 'top', 'bottom'
    if layout == 'left-right-ar-pt':
        left, right = split_left_right(img, 0.5)
        return right, left, 'right', 'left'
    if layout == 'left-right-pt-ar':
        left, right = split_left_right(img, 0.5)
        return left, right, 'left', 'right'
    raise ValueError(f'Unknown layout: {layout}')


def resolve_layout(args_layout: str):
    presets = {
        'compline': ('left-right-pt-ar', None),
        'akathist': ('top-bottom-ar-pt', 90),
        'liturikon': ('top-bottom-ar-pt', 90),
        'top-bottom-ar-pt': ('top-bottom-ar-pt', None),
        'top-bottom-pt-ar': ('top-bottom-pt-ar', None),
        'left-right-ar-pt': ('left-right-ar-pt', None),
        'left-right-pt-ar': ('left-right-pt-ar', None),
        'auto': ('auto', None),
    }
    if args_layout not in presets:
        raise ValueError(f'Unknown layout preset: {args_layout}')
    return presets[args_layout]


def cmd_extract_pages(args):
    paths = iter_images(Path(args.input))
    out_data = []

    for idx, path in enumerate(paths, start=1):
        img = Image.open(path)

        if args.rotate == 'auto':
            initial_rotation = detect_orientation_from_aspect(img)
        else:
            initial_rotation = int(args.rotate)

        img = rotate_image(img, initial_rotation)

        layout, forced_extra_rotation = resolve_layout(args.layout)
        if forced_extra_rotation is not None:
            img = rotate_image(img, forced_extra_rotation)
            applied_rotation = (initial_rotation + forced_extra_rotation) % 360
        else:
            applied_rotation = initial_rotation

        if layout == 'auto':
            detected_layout, extra_rotation = auto_detect_layout(img, psm=args.psm)
            img = rotate_image(img, extra_rotation)
            layout = detected_layout
            applied_rotation = (applied_rotation + extra_rotation) % 360

        pt_img, ar_img, pt_region, ar_region = extract_regions(img, layout)

        pt_proc = preprocess(pt_img, threshold=args.threshold)
        ar_proc = preprocess(ar_img, threshold=args.threshold)

        pt_text = ocr(pt_proc, 'pt', psm=args.psm)
        ar_text = ocr(ar_proc, 'ar', psm=args.psm)
        ar_translit = transliterate_arabic(ar_text)

        out_data.append(PageOCR(
            page=idx,
            image=path.name,
            layout=layout,
            rotation_applied=applied_rotation,
            pt_region=pt_region,
            ar_region=ar_region,
            pt_text=pt_text,
            ar_text=ar_text,
            ar_translit=ar_translit,
        ))

    Path(args.output).write_text(
        json.dumps([asdict(x) for x in out_data], ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    print(f'Wrote {args.output} with {len(out_data)} pages.')


def cmd_review_md(args):
    pages = json.loads(Path(args.pages).read_text(encoding='utf-8'))
    lines = ['# OCR Review', '']
    for page in pages:
        lines.extend([
            f"## Page {page['page']} — {page['image']}",
            '',
            f"- layout: {page.get('layout', 'unknown')}",
            f"- rotation_applied: {page.get('rotation_applied', 'unknown')}",
            f"- pt_region: {page.get('pt_region', 'unknown')}",
            f"- ar_region: {page.get('ar_region', 'unknown')}",
            '',
            '### Portuguese',
            '',
            page.get('pt_text') or '_empty_',
            '',
            '### Arabic',
            '',
            page.get('ar_text') or '_empty_',
            '',
            '### Transliteration (auto)',
            '',
            page.get('ar_translit') or '_empty_',
            '',
        ])
    Path(args.output).write_text('\n'.join(lines), encoding='utf-8')
    print(f'Wrote {args.output}.')


def build_parser():
    parser = argparse.ArgumentParser(description='Liturgical OCR pipeline v3')
    sub = parser.add_subparsers(dest='cmd', required=True)

    sp = sub.add_parser('extract-pages', help='OCR page images into JSON')
    sp.add_argument('input', help='Image file or folder')
    sp.add_argument('output', help='Output JSON path')
    sp.add_argument(
        '--layout',
        default='auto',
        choices=[
            'auto',
            'compline',
            'akathist',
            'liturikon',
            'top-bottom-ar-pt',
            'top-bottom-pt-ar',
            'left-right-ar-pt',
            'left-right-pt-ar',
        ],
        help='Layout preset or explicit geometry'
    )
    sp.add_argument(
        '--rotate',
        default='auto',
        choices=['auto', '0', '90', '180', '270'],
        help='Initial rotation before layout handling'
    )
    sp.add_argument('--psm', type=int, default=6, help='Tesseract page segmentation mode')
    sp.add_argument('--threshold', type=int, default=180, help='Binarization threshold, 0-255')
    sp.set_defaults(func=cmd_extract_pages)

    sp = sub.add_parser('review-md', help='Generate markdown review from OCR JSON')
    sp.add_argument('pages', help='Input OCR JSON')
    sp.add_argument('output', help='Output markdown')
    sp.set_defaults(func=cmd_review_md)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
