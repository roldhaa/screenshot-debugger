#!/usr/bin/env python3
"""Render compact terminal-style error PNGs for the hackathon demo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "examples" / "demo-captures"
PUBLIC = ROOT / "public" / "fixtures"
WIDTH = 1600
HEIGHT = 280
BG = (30, 30, 30)
RED = (241, 76, 76)
GRAY = (212, 212, 212)
BLUE = (156, 220, 254)

CAPTURES = [
    {
        "id": "01-react-map",
        "lines": [
            ("TypeError: Cannot read properties of undefined (reading 'map')", RED),
            ("at renderNames (App.jsx:12:16)", GRAY),
            ("return users.map((user) => user.name);", GRAY),
            ("React  |  liste avant le chargement", BLUE),
        ],
    },
    {
        "id": "02-null-length",
        "lines": [
            ("TypeError: Cannot read properties of null (reading 'length')", RED),
            ("at validateForm (form.ts:8:18)", GRAY),
            ("if (email.length === 0) {", GRAY),
            ("TypeScript  |  champ email null", BLUE),
        ],
    },
    {
        "id": "03-not-a-function",
        "lines": [
            ("TypeError: items.filter is not a function", RED),
            ("at ProductList (ProductList.jsx:9:22)", GRAY),
            ("return items.filter((item) => item.inStock);", GRAY),
            ("React  |  items n'est pas un tableau", BLUE),
        ],
    },
    {
        "id": "04-json-parse",
        "lines": [
            ("SyntaxError: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON", RED),
            ("at JSON.parse (<anonymous>)", GRAY),
            ("at loadConfig (config.js:4:23)", GRAY),
            ("JavaScript  |  réponse HTML au lieu de JSON", BLUE),
        ],
    },
    {
        "id": "05-not-defined",
        "lines": [
            ("ReferenceError: count is not defined", RED),
            ("at Counter (Counter.jsx:6:10)", GRAY),
            ("setCount(count + 1);", GRAY),
            ("React  |  variable oubliée hors du state", BLUE),
        ],
    },
    {
        "id": "06-set-undefined",
        "lines": [
            ("TypeError: Cannot set properties of undefined (setting 'name')", RED),
            ("at updateUser (user.js:3:14)", GRAY),
            ("user.name = nextName;", GRAY),
            ("JavaScript  |  objet user manquant", BLUE),
        ],
    },
    {
        "id": "07-module-not-found",
        "lines": [
            ("Error: Cannot find module './utils/formatDate'", RED),
            ("Require stack:", GRAY),
            ("- /app/src/index.js", GRAY),
            ("Node.js  |  chemin d'import incorrect", BLUE),
        ],
    },
    {
        "id": "08-promise-rejection",
        "lines": [
            ("UnhandledPromiseRejectionWarning: Error: Network request failed", RED),
            ("at fetchProfile (api.js:11:11)", GRAY),
            ("await fetch('/api/me');", GRAY),
            ("JavaScript  |  promesse sans catch", BLUE),
        ],
    },
    {
        "id": "09-assignment-const",
        "lines": [
            ("TypeError: Assignment to constant variable.", RED),
            ("at bump (stats.js:5:9)", GRAY),
            ("total = total + 1;", GRAY),
            ("JavaScript  |  const modifiée", BLUE),
        ],
    },
    {
        "id": "10-react-key",
        "lines": [
            ("Warning: Each child in a list should have a unique \"key\" prop.", RED),
            ("Check the render method of `TodoList`.", GRAY),
            ("todos.map((todo) => <li>{todo.title}</li>)", GRAY),
            ("React  |  clé manquante dans la liste", BLUE),
        ],
    },
]


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype("/System/Library/Fonts/Monaco.ttf", size)
    except OSError:
        return ImageFont.load_default()


def render(capture: dict) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(image)
    title = font(28)
    body = font(24)
    y = 48
    for index, (text, color) in enumerate(capture["lines"]):
        draw.text((32, y), text, fill=color, font=title if index == 0 else body)
        y += 52 if index == 0 else 48
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for capture in CAPTURES:
        path = OUT / f"{capture['id']}.png"
        render(capture).save(path, format="PNG", optimize=True)
        print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")
    # Public fixtures for the three demo buttons.
    mapping = {
        "01-react-map.png": "demo-1-react-map.png",
        "02-null-length.png": "demo-2-null-length.png",
        "03-not-a-function.png": "demo-3-not-a-function.png",
    }
    for source_name, dest_name in mapping.items():
        source = OUT / source_name
        dest = PUBLIC / dest_name
        dest.write_bytes(source.read_bytes())
        print(f"copied {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
