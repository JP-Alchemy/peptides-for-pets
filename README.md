# Peptides for Pets: website prototype

Static, mobile-first build of wireframe v5 and copy deck v4, restyled to the Burg Design Studio identity (P4P Logo + P4P Design PDFs).

## Run it

```bash
python3 build.py                                  # builds src/ into docs/
python3 -m http.server 8437 --directory docs      # then open http://localhost:8437
```

Edit pages in `src/pages/`, shared header, footer and cart in `src/partials/`, styles in `src/assets/css/site.css`. Always edit `src/` and rebuild; `docs/` is generated (and is what GitHub Pages serves, so commit it after rebuilding).

## Pages

| Page | File |
|---|---|
| Homepage | `index.html` |
| Shop | `shop.html` |
| Product pages (not in menu) | `skin-coat-dogs-cats.html`, `skin-coat-horses.html` |
| Learn | `what-is-a-copper-peptide.html`, `30-day-skin-plan.html`, `how-its-made.html`, `our-story.html` |
| Help | `faq.html`, `contact.html`, `info.html` (delivery, guarantee, legal) |
| After checkout | `thank-you.html` |

## Review notes

Every `[TO CONFIRM]` and `[PROOF NEEDED]` from the copy deck is shown as an orange chip. Sections that are built but switched off until real proof exists (owner results, unapproved FAQs) show with a dashed "Hidden at launch" outline. They are **off by default**; use the **Review notes** button in the footer to show them (the choice is remembered per browser). FAQ numbers close up with no gaps.

## Brand

- Logo: the Burg "P" mark, redrawn as SVG (`src/assets/svg/logo-mark.svg`, `logo.svg`). **Swap in Burg's official vector files** before launch, because the wordmark here is set in Barlow as a stand-in for their typeface.
- The P shape doubles as a speech bubble. The hero text sits inside it: the animal can't tell you, so the bubble speaks for them.
- Colours: forest `#2B4739`, mist `#E6E7E8`, off-white/cream label stock, silver foil. Copper `#B87333` is kept only for things about the copper peptide (GHK-Cu specs, diagram, batch circle).
- The bottle (`bottle-30.svg`, `bottle-50.svg`) is an illustration of the retail label layout: amber Boston round, black pump, cream label, green device, silver band. Replace with real product photos when available.

## Images

These are free Unsplash photos (Unsplash licence), used as stand-ins. `src/assets/img/credits.tsv` lists each file, its Unsplash photo ID and the photographer. Founders, polo heritage and label shots **must be real photos** before launch, and each placeholder is marked on the page.
