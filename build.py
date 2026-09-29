#!/usr/bin/env python3
"""Tiny static site builder for Peptides for Pets.

Each page in src/pages/*.html starts with a front-matter comment:

    <!--
    title: Shop Skin & Coat
    description: One Spray Gel, two sizes.
    nav: shop            (which menu item is active; optional)
    chrome: full         (full = announcement bar, header, footer, cart, WhatsApp; vet = plain)
    robots: noindex, nofollow   (optional)
    -->

The builder wraps the page in the shared partials and writes it to docs/.
Run:  python3 build.py
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "docs"  # GitHub Pages serves main:/docs

NAV = [
    ("shop", "shop.html", "Shop"),
    ("copper", "what-is-a-copper-peptide.html", "What is a copper peptide?"),
    ("plan", "30-day-skin-plan.html", "30-day skin plan"),
    ("made", "how-its-made.html", "How It’s Made"),
    ("story", "our-story.html", "Our Story"),
    ("faq", "faq.html", "FAQs"),
]


def read(p):
    return (SRC / p).read_text(encoding="utf-8")


def parse(page_text):
    m = re.match(r"\s*<!--(.*?)-->", page_text, re.S)
    meta = {}
    body = page_text
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = page_text[m.end():]
    return meta, body


def nav_links(active):
    out = []
    for key, href, label in NAV:
        cur = ' aria-current="page"' if key == active else ""
        out.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return "\n".join(out)


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "assets", OUT / "assets")

    partials = {n: read(f"partials/{n}.html") for n in
                ["head", "header", "footer", "vet-header", "icons"]}

    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse(page.read_text(encoding="utf-8"))
        chrome = meta.get("chrome", "full")
        robots = meta.get("robots", "index, follow")
        head = (partials["head"]
                .replace("{{title}}", meta.get("title", "Peptides for Pets"))
                .replace("{{description}}", meta.get("description", ""))
                .replace("{{robots}}", robots))
        if chrome == "vet":
            top, bottom = partials["vet-header"], ""
        else:
            nav = nav_links(meta.get("nav", ""))
            top = partials["header"].replace("{{nav}}", nav)
            bottom = partials["footer"]
        body_class = meta.get("bodyclass", "")
        html = (
            "<!doctype html>\n<html lang=\"en-ZA\">\n<head>\n" + head + "\n</head>\n"
            f"<body class=\"{body_class}\">\n" + partials["icons"] + "\n" + top +
            "\n<main id=\"main\">\n" + body.strip() + "\n</main>\n" + bottom +
            "\n<script src=\"assets/js/site.js\" defer></script>\n</body>\n</html>\n"
        )
        (OUT / page.name).write_text(html, encoding="utf-8")
        print("built", page.name)
    (OUT / ".nojekyll").write_text("")


if __name__ == "__main__":
    build()
