import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FONTS = Path(__file__).resolve().parent.parent / "src" / "assets" / "fonts"

LATIN = [
    (0x0020, 0x007E),
    (0x00A0, 0x00FF),
    (0x0131, 0x0131),
    (0x0152, 0x0153),
    (0x02C6, 0x02C6),
    (0x02DA, 0x02DA),
    (0x02DC, 0x02DC),
    (0x2000, 0x206F),
    (0x2074, 0x2074),
    (0x20AC, 0x20AC),
    (0x2122, 0x2122),
    (0x2190, 0x2193),
    (0x2212, 0x2212),
    (0x2215, 0x2215),
    (0xFEFF, 0xFEFF),
    (0xFFFD, 0xFFFD),
]

PERSIAN = [
    (0x060C, 0x060C),
    (0x061B, 0x061B),
    (0x061F, 0x061F),
    (0x0621, 0x063A),
    (0x0640, 0x0655),
    (0x0660, 0x066D),
    (0x0670, 0x0670),
    (0x067E, 0x067E),
    (0x0686, 0x0686),
    (0x0698, 0x0698),
    (0x06A9, 0x06A9),
    (0x06AF, 0x06AF),
    (0x06C0, 0x06C0),
    (0x06CC, 0x06CC),
    (0x06F0, 0x06F9),
    (0xFB56, 0xFB59),
    (0xFB7A, 0xFB7D),
    (0xFB8A, 0xFB8B),
    (0xFB8E, 0xFB95),
    (0xFBFC, 0xFBFF),
    (0xFE70, 0xFEFC),
]

LINE_METRICS = {
    "hhea": ["ascent", "descent", "lineGap", "caretSlopeRise", "caretSlopeRun", "caretOffset"],
    "OS/2": [
        "sTypoAscender",
        "sTypoDescender",
        "sTypoLineGap",
        "usWinAscent",
        "usWinDescent",
        "sxHeight",
        "sCapHeight",
        "yStrikeoutSize",
        "yStrikeoutPosition",
        "ySubscriptXSize",
        "ySubscriptYSize",
        "ySubscriptXOffset",
        "ySubscriptYOffset",
        "ySuperscriptXSize",
        "ySuperscriptYSize",
        "ySuperscriptXOffset",
        "ySuperscriptYOffset",
    ],
    "post": ["underlinePosition", "underlineThickness"],
}

WEB_FONTS = [
    ("vazirmatn/vazirmatn-variable.woff2", "vazirmatn/vazirmatn-web.woff2", LATIN + PERSIAN, (400, 900)),
    ("estedad/estedad-variable.woff2", "estedad/estedad-web.woff2", LATIN + PERSIAN, (700, 900)),
    (
        "jetbrains-mono/jetbrains-mono-latin-variable.woff2",
        "jetbrains-mono/jetbrains-mono-web.woff2",
        LATIN,
        (400, 700),
    ),
]

LOGO_FONT = ("kufam/kufam-extrabold.woff2", "kufam/kufam-logo.woff2", "ماندگار Mandegar MANDEGAR")


def codepoints(ranges):
    return [point for start, end in ranges for point in range(start, end + 1)]


def subsetter(**populate):
    options = subset.Options()
    options.layout_features = ["*"]
    tool = subset.Subsetter(options)
    tool.populate(**populate)
    return tool


def reopened(font):
    buffer = io.BytesIO()
    font.flavor = None
    font.save(buffer)
    buffer.seek(0)
    return TTFont(buffer)


def keep_line_metrics(font, original):
    for table, fields in LINE_METRICS.items():
        for field in fields:
            setattr(font[table], field, getattr(original[table], field))
    if "MVAR" in font:
        del font["MVAR"]


def save_woff2(font, target):
    font.flavor = "woff2"
    font.save(FONTS / target)
    print(f"{target}: {(FONTS / target).stat().st_size:,} bytes")


def build_web_font(source, target, ranges, weights):
    original = TTFont(FONTS / source)
    font = TTFont(FONTS / source)
    subsetter(unicodes=codepoints(ranges)).subset(font)
    font = instancer.instantiateVariableFont(reopened(font), {"wght": weights})
    keep_line_metrics(font, original)
    save_woff2(font, target)


def build_logo_font(source, target, text):
    font = TTFont(FONTS / source)
    subsetter(text=text).subset(font)
    save_woff2(font, target)


if __name__ == "__main__":
    for web_font in WEB_FONTS:
        build_web_font(*web_font)
    build_logo_font(*LOGO_FONT)
