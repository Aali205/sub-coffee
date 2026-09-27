import logoRaw from './assets/logo.svg?raw';

// Inner <path> elements of the traced logo, reusable anywhere (fill = currentColor).
export const logoPaths = logoRaw.match(/<path[^>]*\/>/g).join('');
export const logo = (cls = '') =>
  `<svg class="logo ${cls}" viewBox="0 0 597 251" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${logoPaths}</svg>`;

export const bean = `<svg viewBox="0 0 40 56" aria-hidden="true"><ellipse cx="20" cy="28" rx="16" ry="24" fill="currentColor"/><path d="M20 6C11 20 29 36 20 50" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3" stroke-linecap="round"/></svg>`;

/* ---------- Hero: gooseneck kettle pouring into a V60 ---------- */
export const pourScene = `
<svg class="pour" viewBox="0 0 560 640" aria-hidden="true">
  <defs>
    <linearGradient id="coffeeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8A4A22"/>
      <stop offset=".25" stop-color="#4A220F"/>
      <stop offset="1" stop-color="#1E0D05"/>
    </linearGradient>
    <linearGradient id="ceramic" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFF4EA"/>
      <stop offset=".6" stop-color="#FFE3CB"/>
      <stop offset="1" stop-color="#E7C3A3"/>
    </linearGradient>
    <linearGradient id="kettleGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1E3F3B"/>
      <stop offset="1" stop-color="#0A1F1D"/>
    </linearGradient>
    <clipPath id="serverClip">
      <path d="M186 432 L314 432 Q356 470 350 522 Q344 578 300 586 L200 586 Q156 578 150 522 Q144 470 186 432Z"/>
    </clipPath>
  </defs>

  <ellipse cx="250" cy="600" rx="170" ry="12" fill="#000" opacity=".35"/>

  <!-- server -->
  <g class="server">
    <g clip-path="url(#serverClip)">
      <g class="pour-liquid">
        <path class="pour-wave" d="M100 0 Q125 -8 150 0 T200 0 T250 0 T300 0 T350 0 T400 0 T450 0 V200 H100Z" fill="url(#coffeeGrad)"/>
      </g>
    </g>
    <path d="M186 432 L314 432 Q356 470 350 522 Q344 578 300 586 L200 586 Q156 578 150 522 Q144 470 186 432Z" fill="rgba(255,244,234,.07)" stroke="rgba(255,227,203,.55)" stroke-width="2.5"/>
    <path d="M178 426 H322" stroke="rgba(255,227,203,.7)" stroke-width="5" stroke-linecap="round"/>
    <path d="M346 470 Q392 472 390 516 Q388 556 342 560" fill="none" stroke="rgba(255,227,203,.5)" stroke-width="7" stroke-linecap="round"/>
    <path d="M166 480 Q158 520 176 560" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="4" stroke-linecap="round"/>
  </g>

  <!-- drip -->
  <circle class="drip" cx="250" cy="416" r="3.6" fill="#4A220F"/>

  <!-- dripper -->
  <g class="dripper">
    <path d="M340 318 Q378 320 374 352 Q370 378 330 372" fill="none" stroke="#FFE3CB" stroke-width="12" stroke-linecap="round"/>
    <path d="M154 300 L216 404 L284 404 L346 300Z" fill="url(#ceramic)"/>
    <path d="M190 322 L226 392 M250 322 V396 M310 322 L274 392" stroke="rgba(13,110,116,.18)" stroke-width="2"/>
    <rect x="164" y="402" width="172" height="12" rx="6" fill="#FFE3CB"/>
    <ellipse cx="250" cy="300" rx="96" ry="14" fill="#FFF4EA"/>
    <ellipse class="bed" cx="250" cy="302" rx="84" ry="10" fill="#5B2A12"/>
    <g class="bloom" fill="#A9683A">
      <circle cx="232" cy="301" r="3"/><circle cx="262" cy="304" r="2.4"/><circle cx="248" cy="298" r="2"/><circle cx="275" cy="300" r="1.8"/><circle cx="222" cy="305" r="1.6"/>
    </g>
    <g transform="translate(214 334) scale(.12)" fill="#0D6E74" fill-rule="evenodd">${logoPaths}</g>
  </g>

  <!-- steam -->
  <g class="steam" fill="none" stroke="rgba(255,244,234,.55)" stroke-width="3" stroke-linecap="round">
    <path d="M214 282 C200 258 228 244 212 214"/>
    <path d="M286 282 C272 256 300 242 284 208"/>
    <path d="M232 276 C222 254 244 240 232 222"/>
  </g>

  <!-- stream -->
  <path class="stream" d="M262 124 C259 170 254 232 251 298" fill="none" stroke="#6B3517" stroke-width="5" stroke-linecap="round"/>
  <path class="stream-shine" d="M262 124 C259 170 254 232 251 298" fill="none" stroke="rgba(255,227,203,.55)" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="10 22"/>

  <!-- kettle: outer group for the entrance, inner group for the idle rocking -->
  <g class="kettle-in"><g class="kettle">
    <path d="M364 162 C316 168 300 118 290 98 C282 84 268 92 262 120" fill="none" stroke="url(#kettleGrad)" stroke-width="11" stroke-linecap="round"/>
    <path d="M364 162 C316 168 300 118 290 98 C282 84 268 92 262 120" fill="none" stroke="rgba(255,227,203,.35)" stroke-width="2" stroke-linecap="round"/>
    <path d="M362 72 Q362 50 384 50 L468 50 Q490 50 490 72 L500 168 Q500 186 482 186 L368 186 Q350 186 350 168Z" fill="url(#kettleGrad)" stroke="rgba(255,227,203,.4)" stroke-width="2"/>
    <path d="M394 50 Q426 26 458 50" fill="#132F2C" stroke="rgba(255,227,203,.4)" stroke-width="2"/>
    <circle cx="426" cy="30" r="7" fill="#FFE3CB"/>
    <path d="M492 76 Q544 80 534 132 Q526 168 498 166" fill="none" stroke="#0A1F1D" stroke-width="12" stroke-linecap="round"/>
    <path d="M372 80 Q368 120 378 170" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6" stroke-linecap="round"/>
    <g transform="translate(386 108) scale(.14)" fill="#FFE3CB" fill-rule="evenodd" opacity=".85">${logoPaths}</g>
  </g></g>
</svg>`;

/* ---------- Signature: a clear branded cup whose layers are re-poured per drink ---------- */
const CUP = 'M40 70 L280 70 L251 440 Q250 452 238 452 L82 452 Q70 452 69 440Z';
export const sigCup = `
<svg class="cup" viewBox="0 0 320 480" aria-hidden="true">
  <defs>
    <clipPath id="cupClip"><path d="${CUP}"/></clipPath>
    <filter id="melt" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/>
      <stop offset=".18" stop-color="#fff" stop-opacity=".04"/>
      <stop offset=".8" stop-color="#fff" stop-opacity=".02"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".16"/>
    </linearGradient>
  </defs>
  <g class="cup-steam" fill="none" stroke="rgba(255,244,234,.5)" stroke-width="5" stroke-linecap="round">
    <path d="M120 58 C104 30 136 14 118 -18"/>
    <path d="M200 58 C184 30 216 14 198 -18"/>
    <path d="M160 52 C146 28 174 12 160 -8"/>
  </g>
  <rect class="cup-straw" x="196" y="-40" width="16" height="300" rx="8" fill="#141414" transform="rotate(12 204 110)"/>
  <g clip-path="url(#cupClip)">
    <g filter="url(#melt)">
      <rect class="lay lay-0" x="0" y="452" width="320" height="0"/>
      <rect class="lay lay-1" x="0" y="452" width="320" height="0"/>
      <rect class="lay lay-2" x="0" y="452" width="320" height="0"/>
    </g>
    <path class="cup-wave" d="M-40 0 Q-20 -9 0 0 T40 0 T80 0 T120 0 T160 0 T200 0 T240 0 T280 0 T320 0 T360 0 T400 0 V14 H-40Z"/>
    <g class="cup-ice" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.6)" stroke-width="2">
      <rect x="78" y="120" width="56" height="52" rx="10" transform="rotate(-14 106 146)"/>
      <rect x="150" y="104" width="60" height="56" rx="10" transform="rotate(9 180 132)"/>
      <rect x="112" y="176" width="52" height="50" rx="10" transform="rotate(22 138 200)"/>
      <rect x="186" y="170" width="48" height="46" rx="10" transform="rotate(-8 210 192)"/>
    </g>
  </g>
  <path d="${CUP}" fill="url(#glass)" stroke="rgba(255,244,234,.55)" stroke-width="3"/>
  <rect x="30" y="60" width="260" height="14" rx="7" fill="rgba(255,244,234,.65)"/>
  <path d="M62 96 L86 420" stroke="rgba(255,255,255,.35)" stroke-width="7" stroke-linecap="round"/>
  <g class="cup-print" transform="translate(94 236) scale(.22)" fill="#0D6E74" fill-rule="evenodd">${logoPaths}</g>
</svg>`;

/* ---------- Journey line illustrations ---------- */
const j = (body) =>
  `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const journeyArt = [
  j(`<path d="M20 172C70 142 112 118 182 38"/>
     <path d="M70 142C58 112 80 94 102 100C100 126 86 140 70 142Z"/>
     <path d="M122 102C126 70 152 62 168 72C158 96 142 104 122 102Z"/>
     <path d="M96 124C122 126 138 146 132 168C108 162 96 146 96 124Z"/>
     <circle cx="146" cy="112" r="12"/><circle cx="166" cy="126" r="11"/><circle cx="140" cy="136" r="10"/>
     <path d="M146 100C146 94 150 90 154 88"/>`),
  j(`<circle cx="100" cy="96" r="54"/><circle cx="100" cy="96" r="38"/>
     <ellipse cx="88" cy="88" rx="7" ry="10" transform="rotate(-30 88 88)"/><ellipse cx="112" cy="100" rx="7" ry="10" transform="rotate(25 112 100)"/><ellipse cx="96" cy="112" rx="7" ry="10" transform="rotate(70 96 112)"/>
     <path d="M82 42L72 16H128L118 42"/><path d="M154 96H182"/>
     <path d="M62 146L50 184M138 146L150 184M36 184H164"/>
     <path d="M88 178C82 168 92 162 90 152C100 162 102 170 96 178"/><path d="M110 178C104 168 114 162 112 152C122 162 124 170 118 178"/>`),
  j(`<path d="M58 88H142L132 58H68Z"/><rect x="64" y="88" width="72" height="88" rx="10"/>
     <path d="M100 58V38H158"/><circle cx="166" cy="38" r="9"/>
     <path d="M80 144H120"/><circle cx="100" cy="144" r="3" fill="currentColor"/>
     <path d="M84 110H116"/>`),
  j(`<path d="M138 26H186L182 74H142Z"/><path d="M140 62C122 64 124 42 112 44C104 46 104 60 100 84"/>
     <path d="M100 92V114" stroke-dasharray="4 8"/>
     <path d="M52 122H148L118 166H82Z"/><path d="M44 122H156"/>
     <path d="M70 172H130L124 194H76Z"/>`),
  j(`<path d="M48 92H152L142 170Q140 182 128 182H72Q60 182 58 170Z"/>
     <path d="M150 106Q182 108 176 136Q170 160 142 156"/>
     <path d="M80 72C68 56 90 46 78 24"/><path d="M100 72C88 56 110 46 98 24"/><path d="M120 72C108 56 130 46 118 24"/>
     <path d="M100 152C82 138 84 120 95 120C99 120 100 124 100 126C100 124 101 120 105 120C116 120 118 138 100 152Z"/>
     <path d="M30 190H170"/>`),
];

/* ---------- Menu icons ---------- */
const m = (body) =>
  `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const menuIcons = {
  hot: m(
    `<path d="M12 28H48L45 50Q44 54 40 54H20Q16 54 15 50Z"/><path d="M48 32Q58 32 56 40Q54 47 46 46"/><path d="M24 20C21 16 27 13 24 8M32 20C29 16 35 13 32 8M40 20C37 16 43 13 40 8"/>`,
  ),
  iced: m(
    `<path d="M16 14H48L44 56H20Z"/><rect x="22" y="22" width="9" height="9" rx="2"/><rect x="33" y="26" width="9" height="9" rx="2"/><rect x="26" y="34" width="9" height="9" rx="2"/><path d="M36 14L42 4"/>`,
  ),
  filter: m(
    `<path d="M12 18H52L40 36H24Z"/><path d="M8 18H56"/><path d="M32 38V44" stroke-dasharray="2 4"/><path d="M20 46H44L42 58H22Z"/>`,
  ),
  fruit: m(
    `<path d="M16 18H48L44 56H20Z"/><path d="M34 18L40 4"/><circle cx="46" cy="16" r="8"/><path d="M46 8V24M38 16H54"/><path d="M19 32H45"/>`,
  ),
  shake: m(
    `<path d="M18 26H46L42 58H22Z"/><path d="M16 26Q16 12 32 12Q48 12 48 26"/><path d="M36 12L42 2"/><circle cx="26" cy="20" r="1.5" fill="currentColor"/><circle cx="36" cy="19" r="1.5" fill="currentColor"/><path d="M20 38H44"/>`,
  ),
  sweet: m(
    `<ellipse cx="32" cy="30" rx="22" ry="8"/><path d="M10 30V38Q32 50 54 38V30"/><path d="M18 36V43M26 38V46M34 38V47M42 37V45M50 34V41"/><circle cx="26" cy="29" r="2.5" fill="currentColor"/><circle cx="36" cy="31" r="2.5" fill="currentColor"/><circle cx="31" cy="26" r="2" fill="currentColor"/>`,
  ),
  clock: m(`<circle cx="32" cy="32" r="22"/><path d="M32 18V32L42 38"/>`),
};

export const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12H19M13 6L19 12L13 18"/></svg>`;
export const igIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>`;
export const pinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21S5 14.5 5 9.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
