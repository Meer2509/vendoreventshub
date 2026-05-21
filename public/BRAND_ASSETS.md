# VendorEventsHub brand assets

Built-in V mark icons are already wired for launch:

- `src/app/icon.svg` — browser favicon (App Router)
- `src/app/apple-icon.svg` — Apple touch icon

## Optional higher-resolution uploads

Replace or add these files for sharper displays (keep aspect ratio 1:1, do not stretch):

| File | Purpose |
|------|---------|
| `public/favicon.ico` | Legacy browsers (32×32 or multi-size ICO) |
| `public/icon.png` | 512×512 PNG for metadata / PWA |
| `public/apple-touch-icon.png` | 180×180 PNG for iOS home screen |
| `public/og-image.png` | 1200×630 Open Graph fallback |

After uploading PNGs, update `src/app/layout.tsx` `metadata.icons` and `openGraph.images` if you use custom filenames.
