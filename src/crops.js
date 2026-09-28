import '@fontsource-variable/alexandria';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/fraunces';
import '@fontsource/reem-kufi/500.css';
import '@fontsource/reem-kufi/700.css';
import './style.css';
import './crops.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

import { applyLang, getLang, saveLang, t } from './i18n.js';
import { initCursor, initMagnetic, initTilt, finePointer } from './fx.js';
import {
  crops,
  roasters,
  origins,
  processes,
  ORDER_URL,
} from './crops-data.js';
import { logo, bean, arrow, igIcon } from './svg.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lang = getLang();
let activeOrigin = 'all';
let scenes; // gsap.context for everything rebuilt on a language switch
let stageIndex = -1;

const tr = (obj) => obj[lang];
const imgSrc = (c, small) =>
  `./images/crops-web/${c.img}${small ? '-sm' : ''}.webp`;
const fmt = (n, digits = 1) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-SY' : 'en-US', {
    minimumIntegerDigits: digits,
    useGrouping: false,
  }).format(Math.round(n));
const notes = (c) => (lang === 'ar' ? c.notesAr : c.notesEn);
// Ranges like 1950–2300 must stay left-to-right inside Arabic text
const altitude = (c) => `<bdi dir="ltr">${c.alt}</bdi> ${t(lang, 'crops.alt')}`;
const metaLine = (c) =>
  [tr(origins[c.origin]), c.process && tr(processes[c.process])]
    .filter(Boolean)
    .join(' · ');

const originCounts = crops.reduce((acc, c) => {
  acc[c.origin] = (acc[c.origin] || 0) + 1;
  return acc;
}, {});
const originOrder = Object.keys(originCounts)
  .filter((o) => o !== 'blend')
  .sort((a, b) => originCounts[b] - originCounts[a])
  .concat(originCounts.blend ? ['blend'] : []);
const STATS = {
  count: crops.length,
  roasters: new Set(crops.map((c) => c.roaster)).size,
  origins: originOrder.filter((o) => o !== 'blend').length,
};

/* =========================================================
   Static markup (language-independent)
   ========================================================= */
// Bags fanned out in the hero, picked for a spread of colours
const FAN = ['11', '08', '23', '04', '28', '21', '25'];

function mountStatic() {
  $$('[data-logo]').forEach((el) => (el.innerHTML = logo()));
  $$('[data-arrow]').forEach((el) => (el.innerHTML = arrow));
  $$('[data-ig]').forEach((el) => (el.innerHTML = igIcon));
  $$('[data-order]').forEach((el) => (el.href = ORDER_URL));
  $('[data-year]').textContent = new Date().getFullYear();

  $('[data-fan]').innerHTML = FAN.map((id) => {
    const c = crops.find((x) => x.img === id);
    return `<div class="ch-card"><div class="ch-card-in"><img src="${imgSrc(c, true)}" alt="" width="480" height="720" /></div></div>`;
  }).join('');

  const spots = [
    [6, 18, 34, -30],
    [14, 72, 22, 40],
    [82, 14, 26, 10],
    [90, 64, 38, -60],
    [48, 86, 18, 70],
    [70, 40, 16, -80],
  ];
  $('.crops-cta-beans').innerHTML = spots
    .map(
      ([x, y, s, r]) =>
        `<span class="bean" style="inset-inline-start:${x}%;top:${y}%;width:${s}px;rotate:${r}deg">${bean}</span>`,
    )
    .join('');
}

/* =========================================================
   Language-dependent markup
   ========================================================= */
function renderMarquee() {
  const names = [...new Set(crops.map((c) => c.roaster))].map((r) =>
    tr(roasters[r]),
  );
  const star = `<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z"/></svg>`;
  const group = `<div class="marquee-group">${names
    .map((w) => `<span class="marquee-item">${w}${star}</span>`)
    .join('')}</div>`;
  $('[data-marquee]').innerHTML = group.repeat(3);
}

function renderStage() {
  $('[data-track]').innerHTML = crops
    .map(
      (c, i) => `
      <div class="s-slot">
        <button class="s-card" type="button" data-open="${i}" data-cursor="view" aria-label="${tr(roasters[c.roaster])} — ${c[lang]}">
          <img src="${imgSrc(c)}" alt="" width="900" height="1350" decoding="async" />
          <span class="s-shade"></span>
          <span class="s-tag">${tr(roasters[c.roaster])}</span>
        </button>
      </div>`,
    )
    .join('');
  $('[data-ticks]').innerHTML = crops.map(() => '<i></i>').join('');
  $('[data-stage-of]').textContent = `/ ${fmt(crops.length, 2)}`;
  stageIndex = -1;
}

function infoHTML(c, i) {
  return `
    <div class="si">
      <div class="si-main">
        <p class="si-roaster si-r">${tr(roasters[c.roaster])}</p>
        <h2 class="si-name si-r">${c[lang]}</h2>
        <p class="si-meta si-r">${metaLine(c)}${c.alt ? ` · ${altitude(c)}` : ''}</p>
      </div>
      <div class="si-notes si-r">
        <span class="si-label">${t(lang, 'crops.stage.notes')}</span>
        <ul>${notes(c)
          .map((n) => `<li>${n}</li>`)
          .join('')}</ul>
      </div>
      <button class="btn btn-cream btn-sm magnetic si-r si-open" type="button" data-open="${i}" data-cursor="hover"><span>${t(lang, 'crops.view')}</span><i>${arrow}</i></button>
    </div>`;
}

function renderOrigins() {
  const max = Math.max(...Object.values(originCounts));
  $('[data-origins]').innerHTML = originOrder
    .map((o, k) => {
      const list = crops.filter((c) => c.origin === o);
      return `
      <li class="origin" style="--share:${originCounts[o] / max}" data-origin="${o}" data-cursor="hover">
        <span class="o-idx">${fmt(k + 1, 2)}</span>
        <span class="o-name">${tr(origins[o])}</span>
        <span class="o-bar"><i></i></span>
        <span class="o-count" data-to="${originCounts[o]}">${fmt(0)}</span>
        <span class="o-thumbs">${list
          .slice(0, 5)
          .map((c) => `<img src="${imgSrc(c, true)}" alt="" loading="lazy" />`)
          .join('')}</span>
      </li>`;
    })
    .join('');
}

function renderShop() {
  const tabs = ['all', ...originOrder];
  $('[data-tabs]').innerHTML =
    `<span class="tab-pill"></span>` +
    tabs
      .map((o) => {
        const label = o === 'all' ? t(lang, 'crops.all') : tr(origins[o]);
        const n = o === 'all' ? crops.length : originCounts[o];
        return `<button class="tab${o === activeOrigin ? ' is-active' : ''}" role="tab" aria-selected="${o === activeOrigin}" data-origin="${o}" data-cursor="hover">${label}<sup>${fmt(n)}</sup></button>`;
      })
      .join('');

  $('[data-grid]').innerHTML = crops
    .map(
      (c, i) => `
      <article class="crop tilt${activeOrigin !== 'all' && c.origin !== activeOrigin ? ' is-hidden' : ''}" data-origin="${c.origin}" style="--tone:${c.tone}">
        <button class="crop-media" type="button" data-open="${i}" data-cursor="view" aria-label="${tr(roasters[c.roaster])} — ${c[lang]}">
          <img src="${imgSrc(c, true)}" alt="" width="480" height="720" loading="lazy" decoding="async" />
          <span class="crop-num">${fmt(i + 1, 2)}</span>
        </button>
        <div class="crop-body">
          <p class="crop-roaster">${tr(roasters[c.roaster])}</p>
          <h3>${c[lang]}</h3>
          <p class="crop-meta">${metaLine(c)}</p>
          <ul class="crop-notes">${notes(c)
            .slice(0, 3)
            .map((n) => `<li>${n}</li>`)
            .join('')}</ul>
        </div>
      </article>`,
    )
    .join('');
  requestAnimationFrame(() => movePill(false));
}

function renderAll() {
  applyLang(lang);
  renderMarquee();
  renderStage();
  renderOrigins();
  renderShop();
  $$('[data-num]').forEach((el) => (el.textContent = fmt(0)));
}

/* =========================================================
   Smooth scroll + nav
   ========================================================= */
const lenis = new Lenis({
  lerp: reduceMotion ? 1 : 0.09,
  smoothWheel: !reduceMotion,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#top' ? 0 : $(id);
  if (target === null) return;
  e.preventDefault();
  closeMobileNav();
  lenis.scrollTo(target, {
    duration: 1.6,
    easing: (x) => 1 - Math.pow(1 - x, 4),
  });
});

function initNav() {
  const nav = $('.nav');
  let last = 0;
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('is-scrolled', scroll > 40);
    if (!document.body.classList.contains('nav-open')) {
      nav.classList.toggle('is-hidden', scroll > last && scroll > 400);
    }
    last = scroll;
    $('.progress span').style.transform = `scaleX(${lenis.progress || 0})`;
  });
  $('.burger').addEventListener('click', () =>
    document.body.classList.contains('nav-open')
      ? closeMobileNav()
      : openMobileNav(),
  );
  $('.lang-btn').addEventListener('click', switchLang);
  $('[data-tabs]').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) filterShop(tab.dataset.origin);
  });
  $('[data-origins]').addEventListener('click', (e) => {
    const row = e.target.closest('.origin');
    if (!row) return;
    filterShop(row.dataset.origin);
    lenis.scrollTo('#shop', { duration: 1.4, offset: -40 });
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) openSheet(+btn.dataset.open, btn);
  });
  addEventListener('resize', () => movePill(false));
}

function openMobileNav() {
  const mnav = $('.mobile-nav');
  const b = $('.burger').getBoundingClientRect();
  document.body.classList.add('nav-open');
  $('.burger').setAttribute('aria-expanded', 'true');
  mnav.setAttribute('aria-hidden', 'false');
  lenis.stop();
  gsap.set(mnav, { visibility: 'visible' });
  gsap.to(mnav, {
    clipPath: `circle(150% at ${b.left + b.width / 2}px 40px)`,
    duration: 0.9,
    ease: 'power3.inOut',
  });
  gsap.fromTo(
    $$('.mobile-nav nav a'),
    { yPercent: 100, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      stagger: 0.06,
      delay: 0.3,
      duration: 0.8,
      ease: 'expo.out',
    },
  );
}

function closeMobileNav() {
  if (!document.body.classList.contains('nav-open')) return;
  const mnav = $('.mobile-nav');
  const b = $('.burger').getBoundingClientRect();
  document.body.classList.remove('nav-open');
  $('.burger').setAttribute('aria-expanded', 'false');
  mnav.setAttribute('aria-hidden', 'true');
  lenis.start();
  gsap.to(mnav, {
    clipPath: `circle(0% at ${b.left + b.width / 2}px 40px)`,
    duration: 0.7,
    ease: 'power3.inOut',
    onComplete: () => gsap.set(mnav, { visibility: 'hidden' }),
  });
}

function switchLang() {
  const wipe = document.createElement('div');
  wipe.className = 'wipe';
  wipe.innerHTML = logo();
  document.body.appendChild(wipe);
  const y = lenis.scroll;
  gsap
    .timeline({ onComplete: () => wipe.remove() })
    .fromTo(
      wipe,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'power3.inOut' },
    )
    .add(() => {
      lang = lang === 'ar' ? 'en' : 'ar';
      saveLang(lang);
      scenes?.revert();
      renderAll();
      buildScenes();
      $$('[data-num]').forEach(
        (el) => (el.textContent = fmt(STATS[el.dataset.num])),
      );
      ScrollTrigger.refresh();
      lenis.scrollTo(y, { immediate: true, force: true });
    })
    .to(wipe, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.6,
      ease: 'power3.inOut',
      delay: 0.1,
    });
}

/* =========================================================
   Shop filtering (Flip)
   ========================================================= */
function movePill(animate = true) {
  const active = $('.tab.is-active');
  const pill = $('.tab-pill');
  if (!active || !pill) return;
  const props = {
    x: active.offsetLeft,
    y: active.offsetTop,
    width: active.offsetWidth,
    height: active.offsetHeight,
  };
  animate
    ? gsap.to(pill, { ...props, duration: 0.6, ease: 'expo.out' })
    : gsap.set(pill, { ...props, left: 0, top: 0 });
}

function filterShop(origin) {
  if (origin === activeOrigin) return;
  activeOrigin = origin;
  $$('.tab').forEach((tab) => {
    const on = tab.dataset.origin === origin;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-selected', on);
  });
  movePill();

  const items = $$('.crop');
  const state = Flip.getState(items);
  items.forEach((it) =>
    it.classList.toggle(
      'is-hidden',
      origin !== 'all' && it.dataset.origin !== origin,
    ),
  );
  Flip.from(state, {
    duration: 0.75,
    ease: 'power3.inOut',
    stagger: 0.02,
    absolute: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, scale: 0.85, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          delay: 0.2,
          stagger: 0.04,
          ease: 'back.out(1.4)',
        },
      ),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.35 }),
    onComplete: () => ScrollTrigger.refresh(),
  });
}

/* =========================================================
   Product sheet
   ========================================================= */
let lastFocus = null;

function openSheet(i, from) {
  const c = crops[i];
  const sheet = $('[data-sheet]');
  lastFocus = from;
  sheet.style.setProperty('--tone', c.tone);

  const rows = [
    ['roaster', tr(roasters[c.roaster])],
    ['origin', tr(origins[c.origin])],
    ['process', c.process && tr(processes[c.process])],
    ['alt', c.alt && altitude(c)],
    ['variety', c.variety],
    ['weight', c.weight],
  ].filter(([, v]) => v);

  $('[data-sheet-media]').innerHTML =
    `<img src="${imgSrc(c)}" alt="${tr(roasters[c.roaster])} — ${c[lang]}" width="900" height="1350" />`;
  $('[data-sheet-body]').innerHTML = `
    <p class="sheet-kicker sb">${fmt(i + 1, 2)} / ${fmt(crops.length, 2)}</p>
    <p class="sheet-roaster sb">${tr(roasters[c.roaster])}</p>
    <h2 class="sheet-name sb" id="sheet-name">${c[lang]}</h2>
    <p class="sheet-alt sb" lang="${lang === 'ar' ? 'en' : 'ar'}">${c[lang === 'ar' ? 'en' : 'ar']}</p>
    <div class="sheet-notes sb">
      <span class="si-label">${t(lang, 'crops.stage.notes')}</span>
      <ul>${notes(c)
        .map((n) => `<li>${n}</li>`)
        .join('')}</ul>
    </div>
    <dl class="sheet-spec sb">${rows
      .map(
        ([k, v]) =>
          `<div><dt>${t(lang, `crops.d.${k}`)}</dt><dd${k === 'variety' || k === 'weight' ? ' dir="ltr"' : ''}>${v}</dd></div>`,
      )
      .join('')}</dl>
    <a class="btn btn-cream magnetic sb" href="${ORDER_URL}" target="_blank" rel="noopener" data-cursor="hover"><i>${igIcon}</i><span>${t(lang, 'crops.order')}</span></a>`;

  sheet.classList.add('is-open');
  sheet.setAttribute('aria-hidden', 'false');
  lenis.stop();

  gsap.killTweensOf(['.sheet-backdrop', '.sheet-panel', '.sheet-media img']);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('.sheet-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.5 })
    .fromTo(
      '.sheet-panel',
      { clipPath: 'inset(100% 0% 0% 0% round 28px)', y: 60 },
      {
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        y: 0,
        duration: reduceMotion ? 0.01 : 1,
      },
      0,
    )
    .fromTo('.sheet-media img', { scale: 1.25 }, { scale: 1, duration: 1.4 }, 0)
    .from(
      '.sheet-body .sb',
      { y: 30, opacity: 0, stagger: 0.05, duration: 0.8 },
      0.25,
    );
  $('.sheet-close').focus({ preventScroll: true });
}

function closeSheet() {
  const sheet = $('[data-sheet]');
  if (!sheet.classList.contains('is-open')) return;
  gsap
    .timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        sheet.classList.remove('is-open');
        sheet.setAttribute('aria-hidden', 'true');
      },
    })
    .to('.sheet-panel', {
      clipPath: 'inset(0% 0% 100% 0% round 28px)',
      y: -30,
      duration: 0.6,
    })
    .to('.sheet-backdrop', { opacity: 0, duration: 0.4 }, 0.2);
  lenis.start();
  lastFocus?.focus({ preventScroll: true });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeSheet();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSheet();
});

/* =========================================================
   Intro
   ========================================================= */
function playIntro() {
  const counter = { v: 0 };
  const dur = reduceMotion ? 0.3 : 1.6;
  const cardsIn = $$('.ch-card-in');
  gsap.set(cardsIn, { y: '120vh', rotation: (i) => (i - 3) * 14 });

  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from('.curtain-word', { yPercent: 110, duration: 1 })
    .to(
      counter,
      {
        v: crops.length,
        duration: dur,
        ease: 'power2.inOut',
        onUpdate: () => ($('.curtain-count').textContent = fmt(counter.v, 2)),
      },
      0,
    )
    .to('.curtain-inner', {
      yPercent: -40,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in',
    })
    .to(
      '.curtain',
      { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' },
      '-=0.3',
    )
    .add(() => {
      $('.curtain').remove();
      document.body.classList.remove('is-loading');
      lenis.start();
    })
    .add(heroEntrance(), '-=0.75');
}

function heroEntrance() {
  const title = SplitText.create('.ch-title', { type: 'lines', mask: 'lines' });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 } });
  tl.from('.nav > *', { y: -40, opacity: 0, stagger: 0.08, duration: 1.2 })
    .to(
      '.ch-card-in',
      {
        y: 0,
        rotation: 0,
        duration: 1.6,
        stagger: { each: 0.07, from: 'center' },
      },
      0,
    )
    .from('.ch .eyebrow', { y: 20, opacity: 0 }, 0.2)
    .from(title.lines, { yPercent: 110, stagger: 0.12 }, 0.25)
    .from(
      ['.ch-sub', '.ch-stats > div'],
      { y: 30, opacity: 0, stagger: 0.08 },
      0.5,
    )
    .from('.ch .hero-scroll', { opacity: 0, y: 20 }, 1);
  $$('[data-num]').forEach((el) => {
    const o = { v: 0 };
    tl.to(
      o,
      {
        v: STATS[el.dataset.num],
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => (el.textContent = fmt(o.v)),
      },
      0.6,
    );
  });
  return tl;
}

/* =========================================================
   Ambient (language-independent)
   ========================================================= */
function initAmbient() {
  if (reduceMotion) return;

  const track = $('[data-marquee]');
  const loop = gsap.to(track, {
    xPercent: -100 / 3,
    duration: 26,
    repeat: -1,
    ease: 'none',
  });
  loop.totalTime(loop.duration() * 50);
  // quickTo reuses one tween per property instead of creating two per scroll event
  let dir = 1;
  const speed = gsap.quickTo(loop, 'timeScale', { duration: 0.4 });
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.4 });
  lenis.on('scroll', ({ velocity }) => {
    if (Math.abs(velocity) > 0.2) dir = Math.sign(velocity);
    speed(dir * (1 + Math.min(Math.abs(velocity) * 0.12, 5)));
    skew(gsap.utils.clamp(-8, 8, -velocity * 0.4));
  });

  // The hero fan leans toward the pointer
  if (finePointer) {
    const rx = gsap.quickTo('.ch-fan', 'rotationX', {
      duration: 1.2,
      ease: 'power3',
    });
    const ry = gsap.quickTo('.ch-fan', 'rotationY', {
      duration: 1.2,
      ease: 'power3',
    });
    $('.ch').addEventListener('pointermove', (e) => {
      ry((e.clientX / innerWidth - 0.5) * 14);
      rx((0.5 - e.clientY / innerHeight) * 8);
    });
  }

  $$('.crops-cta-beans .bean').forEach((b, i) =>
    gsap.to(b, {
      y: '+=16',
      rotation: `+=${i % 2 ? 14 : -14}`,
      duration: 2.4 + i * 0.35,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    }),
  );
}

/* =========================================================
   Scroll scenes
   ========================================================= */
function buildScenes() {
  scenes = gsap.context(() => {
    const rtl = lang === 'ar';
    buildHero();
    buildStage(rtl);
    buildOrigins();
    buildShop();

    $$('[data-split]').forEach((el) => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(s.lines, {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    $$('.origins .kicker, .shop .kicker').forEach((el) =>
      gsap.from(el, {
        x: rtl ? 30 : -30,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      }),
    );

    gsap.from('.crops-cta .hero-ctas > *, .crops-cta p', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.crops-cta', start: 'top 70%' },
    });
    $$('.crops-cta-beans .bean').forEach((b, i) =>
      gsap.fromTo(
        b,
        { yPercent: 120 + i * 40 },
        {
          yPercent: -120 - i * 40,
          ease: 'none',
          scrollTrigger: {
            trigger: '.crops-cta',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      ),
    );

    gsap.from('.footer-logo .logo path', {
      yPercent: 60,
      opacity: 0,
      stagger: 0.08,
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.footer-logo', start: 'top 95%' },
    });
  });
}

// Hero: the stacked fan deals itself out into a wide arc, then lifts away.
function buildHero() {
  const cards = $$('.ch-card');
  const mid = (cards.length - 1) / 2;
  const spread = () => Math.min(innerWidth * 0.15, 230);
  gsap.set(cards, {
    x: (i) => (i - mid) * 28,
    y: (i) => Math.abs(i - mid) * 8,
    rotation: (i) => (i - mid) * 5,
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '.ch',
        start: 'top top',
        end: '+=130%',
        pin: '.ch-pin',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })
    .to(
      cards,
      {
        x: (i) => (i - mid) * spread(),
        // rise from the bottom edge into a centred arc
        y: (i) => (i - mid) ** 2 * 14 - innerHeight * 0.36,
        rotation: (i) => (i - mid) * 8,
        scale: 1.15,
        ease: 'power2.inOut',
        duration: 1,
      },
      0,
    )
    .to(
      '.ch-copy',
      { y: -140, opacity: 0, ease: 'power1.in', duration: 0.6 },
      0,
    )
    .to('.ch .hero-scroll', { opacity: 0, duration: 0.2 }, 0)
    .to(
      '.ch-glow',
      { scale: 1.8, yPercent: -30, opacity: 1, ease: 'none', duration: 1 },
      0,
    )
    .to({}, { duration: 0.25 });
}

// Stage: vertical scroll drives a horizontal 3D coverflow. The card nearest the
// centre becomes "active": background, ghost type and info panel follow it.
function buildStage(rtl) {
  const stageBg = $('.stage-bg');
  const track = $('[data-track]');
  const slots = $$('.s-slot', track);
  const cards = slots.map((s) => $('.s-card', s));
  const shades = slots.map((s) => $('.s-shade', s));
  const ticks = $$('[data-ticks] i');
  const distance = () => Math.max(0, track.scrollWidth - innerWidth);
  const trackX = () => gsap.getProperty(track, 'x');

  // Geometry is measured once per refresh; each frame is then pure arithmetic on
  // the track's x, so scrolling never forces a layout read.
  let base = 0;
  let centers = [];
  let slotW = 1;
  const measure = () => {
    base = track.getBoundingClientRect().left - trackX();
    centers = slots.map((s) => s.offsetLeft + s.offsetWidth / 2);
    slotW = slots[0].offsetWidth;
  };

  const hidden = slots.map(() => false);
  const layout = () => {
    const x = trackX();
    const vc = document.documentElement.clientWidth / 2;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < slots.length; i++) {
      const d = (base + x + centers[i] - vc) / (slotW * 1.05);
      const ad = Math.abs(d);
      if (ad < bestD) {
        bestD = ad;
        best = i;
      }
      // Cards well outside the view are hidden so they drop their GPU layers
      const off = ad > 3.4;
      if (off !== hidden[i]) {
        hidden[i] = off;
        cards[i].style.visibility = off ? 'hidden' : '';
      }
      if (off) continue;
      const near = Math.min(ad, 1);
      const rot = Math.max(-55, Math.min(55, -d * 32));
      cards[i].style.transform =
        `perspective(1300px) translate3d(0, ${(near * 26).toFixed(1)}px, ${(-Math.min(ad, 4) * 160).toFixed(1)}px) ` +
        `rotateY(${rot.toFixed(2)}deg) scale(${(1 + (1 - near) * 0.08).toFixed(3)})`;
      shades[i].style.opacity = Math.min(ad * 0.32, 0.72).toFixed(3);
    }
    setActive(best);
  };

  const setActive = (i) => {
    if (i === stageIndex) return;
    const first = stageIndex === -1;
    stageIndex = i;
    const c = crops[i];
    $('[data-stage-num]').textContent = fmt(i + 1, 2);
    ticks.forEach((tk, k) => tk.classList.toggle('is-on', k === i));
    // A flat colour fill is cheap to repaint; the lighting sits on a static layer above it
    gsap.to(stageBg, {
      backgroundColor: c.tone,
      duration: first ? 0 : 0.9,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    swapInfo(i, first);
  };

  // The panel always renders the active crop right away, then animates in, so it
  // can never fall out of sync with the centred card however fast you scroll.
  const swapInfo = (i, instant) => {
    const info = $('[data-info]');
    const ghost = $('[data-ghost]');
    const name = tr(roasters[crops[i].roaster]);
    const ghostChanged = ghost.textContent !== name;
    info.innerHTML = infoHTML(crops[i], i);
    ghost.textContent = name;
    if (instant || reduceMotion) return;
    gsap.fromTo(
      $$('.si-r', info),
      { y: 24, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
      {
        y: 0,
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        stagger: 0.04,
        duration: 0.6,
        ease: 'expo.out',
        clearProps: 'clipPath',
      },
    );
    if (ghostChanged)
      gsap.fromTo(
        ghost,
        { opacity: 0, yPercent: 12 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.8,
          ease: 'expo.out',
          overwrite: 'auto',
        },
      );
  };

  gsap.to(track, {
    x: () => (rtl ? distance() : -distance()),
    ease: 'none',
    onUpdate: layout,
    scrollTrigger: {
      trigger: '.stage',
      start: 'top top',
      end: () => `+=${distance() * 1.15}`,
      pin: '.stage-pin',
      scrub: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        measure();
        layout();
      },
    },
  });
  gsap.to('.stage-ghost span', {
    xPercent: rtl ? 18 : -18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.stage',
      start: 'top top',
      end: () => `+=${distance() * 1.15}`,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  gsap.from('.s-slot', {
    y: 160,
    opacity: 0,
    stagger: 0.06,
    duration: 1.3,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.stage', start: 'top 70%' },
  });
  measure();
  layout();
}

function buildOrigins() {
  const rows = $$('.origin');
  gsap.from(rows, {
    y: 50,
    opacity: 0,
    stagger: 0.07,
    duration: 1.1,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.origin-list', start: 'top 82%' },
  });
  rows.forEach((row) => {
    gsap.fromTo(
      $('.o-bar i', row),
      { scaleX: 0 },
      {
        scaleX: () => +getComputedStyle(row).getPropertyValue('--share'),
        ease: 'none',
        scrollTrigger: {
          trigger: row,
          start: 'top 90%',
          end: 'top 45%',
          scrub: 0.6,
        },
      },
    );
    const el = $('.o-count', row);
    const o = { v: 0 };
    gsap.to(o, {
      v: +el.dataset.to,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: row, start: 'top 85%' },
    });
  });
}

function buildShop() {
  ScrollTrigger.batch('.crop', {
    start: 'top 92%',
    once: true,
    onEnter: (els) =>
      gsap.from(els, {
        y: 80,
        opacity: 0,
        rotateX: -14,
        clipPath: 'inset(20% 0% 0% 0% round 22px)',
        stagger: 0.07,
        duration: 1.1,
        ease: 'expo.out',
        clearProps: 'transform,opacity,clipPath',
      }),
  });
  gsap.from('.shop .tab', {
    y: 20,
    opacity: 0,
    stagger: 0.04,
    duration: 0.8,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.shop .tabs', start: 'top 88%' },
    onComplete: () => movePill(false),
  });
  // Images drift inside their frames for depth
  $$('.crop-media img').forEach((img) =>
    gsap.fromTo(
      img,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    ),
  );
}

/* =========================================================
   Boot
   ========================================================= */
mountStatic();
renderAll();
initCursor(() => lang);
initMagnetic();
initTilt();
initNav();
initAmbient();

document.fonts.ready.then(() => {
  buildScenes();
  ScrollTrigger.refresh();
  playIntro();
});
