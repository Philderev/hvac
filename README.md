# Vega Climate — Futuristic HVAC Website (Las Vegas)

A fictional, production-grade HVAC company website built as a $10k-tier template. Dark, futuristic design with a video hero, parallax and scroll animations — engineered to score high on PageSpeed and pass Google Search Console cleanly.

**Live demo:** https://philderev.github.io/hvac/

## Highlights

- **Hero video** — HVAC service montage (Pexels footage), encoded as WebM (VP9) + H.264 MP4 fallback so background video plays everywhere: iPhone, Mac, Windows, Android. Poster image protects LCP; sources attach after `load`.
- **Brand system** — custom "Vega" logo (SVG + PNG icons), electric-cyan / solar-amber palette used consistently across every page, self-hosted Space Grotesk variable font.
- **12 pages** — Home, 6 service pages, service areas, pricing, about, contact, custom 404.
- **SEO** — unique titles/descriptions, canonicals, Open Graph image, `HVACBusiness` + `Service` + `BreadcrumbList` JSON-LD, `sitemap.xml`, `robots.txt`.
- **Performance** — WebP images with lazy loading, single ~30KB CSS, ~5KB vanilla JS, zero third-party requests, `prefers-reduced-motion` support.

## Structure

```
index.html            # home
services/*.html       # 6 service sub-pages
service-areas.html    # valley coverage
pricing.html          # plans + honest ranges
about.html  contact.html  404.html
assets/css|js|img|video|fonts|icons
sitemap.xml  robots.txt  site.webmanifest  favicon.svg
```

## Deploy (GitHub Pages)

Push to `main`, then in repo **Settings → Pages** choose *Deploy from a branch* → `main` / root.
After it's live: verify the property in Google Search Console and submit `sitemap.xml`.

## Credits

Stock footage & photography: [Pexels](https://www.pexels.com) (free license). Fictional business — names, numbers and reviews are demo content.
# hvac
