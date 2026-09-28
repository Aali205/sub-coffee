# صُب SUB Coffee

Bilingual (Arabic / English) animated website for **SUB Coffee — قهوة مختصة**, a specialty coffee shop at Al-Muhafaza Square, Damascus.

**Live site:** https://aali205.github.io/sub-coffee/

## Develop

```bash
npm install
npm run dev
```

- Copy (Arabic + English): `src/i18n.js`
- Menu, signature drinks, Instagram posts: `src/data.js`
- Illustrations and logo: `src/svg.js`
- Animations (GSAP + Lenis): `src/main.js`
- Crops page (the shop's retail beans): `crops.html`, `src/crops.js`, `src/crops.css`
  - Products: `src/crops-data.js`; photos in `public/images/crops-web/` (`NN.webp` + `NN-sm.webp`)
  - To add a bag: drop a 2:3 photo in as WebP, then add one line to `crops` in `src/crops-data.js`

Pushing to `main` deploys to GitHub Pages automatically.
