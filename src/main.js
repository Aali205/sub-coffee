import '@fontsource-variable/alexandria';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/fraunces';
import '@fontsource/reem-kufi/500.css';
import '@fontsource/reem-kufi/700.css';
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

import { applyLang, getLang, saveLang, t } from './i18n.js';
import { initCursor, initMagnetic, initTilt, finePointer } from './fx.js';
import { menu, categories, signature, instagram, MAPS } from './data.js';
import {
  logo,
  bean,
  pourScene,
  sigCup,
  journeyArt,
  menuIcons,
  arrow,
  igIcon,
  pinIcon,
} from './svg.js';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lang = getLang();
let activeCat = 'all';
let scenes; // gsap.context holding everything that depends on language / layout
let heroLines = [];
const isRtl = () => lang === 'ar';

/* =========================================================
   Static artwork
   ========================================================= */
function mountStatic() {
  $$('[data-logo]').forEach((el) => (el.innerHTML = logo()));
  $('[data-pour]').innerHTML = pourScene;
  $('[data-cup]').innerHTML = sigCup;
  $$('[data-bean]').forEach((el) => (el.innerHTML = bean));
  $$('[data-arrow]').forEach((el) => (el.innerHTML = arrow));
  $$('[data-ig]').forEach((el) => (el.innerHTML = igIcon));
  $$('[data-pin]').forEach((el) => (el.innerHTML = pinIcon));
  $$('[data-clock]').forEach((el) => (el.innerHTML = menuIcons.clock));
  $$('[data-map]').forEach((el) => (el.href = MAPS[el.dataset.map]));
  $('[data-year]').textContent = new Date().getFullYear();

  // Beans scattered around the pour scene, kept clear of the copy. Offsets are measured
  // from the inline-end edge (where the artwork sits), so they mirror with the language.
  // [end%, top%, size px, rotation, depth]
  const spots = [
    [3, 22, 30, -30, 1.4],
    [8, 78, 22, 40, 0.9],
    [30, 8, 18, 10, 0.6],
    [44, 88, 34, -60, 1.6],
    [46, 30, 16, 70, 0.5],
    [22, 60, 14, -80, 0.4],
    [96, 94, 26, 25, 1.1],
    [62, 14, 20, -15, 0.7],
  ];
  $('.hero-beans').innerHTML = spots
    .map(
      ([x, y, s, r, d]) =>
        `<span class="bean" data-depth="${d}" style="inset-inline-end:${x}%;top:${y}%;width:${s}px;rotate:${r}deg">${bean}</span>`,
    )
    .join('');
}

/* =========================================================
   Language-dependent markup
   ========================================================= */
function renderMarquee() {
  const words = t(lang, 'marquee');
  const star = `<svg class="star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z"/></svg>`;
  const group = `<div class="marquee-group">${words
    .map((w) => `<span class="marquee-item">${w}${star}</span>`)
    .join('')}</div>`;
  $('[data-marquee]').innerHTML = group.repeat(4);
}

function renderSig() {
  $('[data-sig-texts]').innerHTML = signature
    .map(
      (_, i) => `
      <article class="sig-item" data-i="${i}">
        <h3 class="sig-name">${t(lang, `sig.${i + 1}.name`)}</h3>
        <p class="sig-desc">${t(lang, `sig.${i + 1}.desc`)}</p>
        <p class="sig-quote">${t(lang, `sig.${i + 1}.quote`)}</p>
        <div class="tags">${t(lang, `sig.${i + 1}.tags`)
          .map((x) => `<span class="tag">${x}</span>`)
          .join('')}</div>
      </article>`,
    )
    .join('');
}

function renderJourney() {
  const nums =
    lang === 'ar'
      ? ['٠١', '٠٢', '٠٣', '٠٤', '٠٥']
      : ['01', '02', '03', '04', '05'];
  $('[data-journey]').innerHTML =
    `<span class="journey-line"></span>` +
    journeyArt
      .map(
        (art, i) => `
      <article class="step">
        <div class="step-art">${art}</div>
        <span class="step-num">${nums[i]}</span>
        <h3>${t(lang, `journey.${i + 1}.t`)}</h3>
        <p>${t(lang, `journey.${i + 1}.d`)}</p>
      </article>`,
      )
      .join('');
}

function renderMenu() {
  $('[data-tabs]').innerHTML =
    `<span class="tab-pill"></span>` +
    categories
      .map(
        (c) =>
          `<button class="tab${c === activeCat ? ' is-active' : ''}" role="tab" aria-selected="${c === activeCat}" data-cat="${c}" data-cursor="hover">${t(lang, `cat.${c}`)}</button>`,
      )
      .join('');

  const other = lang === 'ar' ? 'en' : 'ar';
  $('[data-menu]').innerHTML = menu
    .map(
      (item) => `
      <article class="item tilt${activeCat !== 'all' && item.cat !== activeCat ? ' is-hidden' : ''}" data-cat="${item.cat}">
        <div class="item-top">
          <span class="item-icon">${menuIcons[item.icon]}</span>
          ${item.sig ? `<span class="item-sig">${t(lang, 'menu.sig')}</span>` : ''}
        </div>
        <h3>${item[lang]}</h3>
        ${item[other] !== item[lang] ? `<p class="alt" lang="${other}">${item[other]}</p>` : ''}
        <p>${lang === 'ar' ? item.dAr : item.dEn}</p>
      </article>`,
    )
    .join('');
  requestAnimationFrame(() => movePill(false));
}

function renderIG() {
  const art = {
    mango: { bg: '#E8971A', fg: '#2a1605', svg: menuIcons.fruit },
    v60: { bg: '#0D6E74', fg: '#FFE3CB', svg: menuIcons.filter },
    latte: { bg: '#5B3321', fg: '#FFE3CB', svg: menuIcons.iced },
    logo: { bg: '#0A4F53', fg: '#FFE3CB', svg: logo() },
    clock: { bg: '#163a35', fg: '#5EE6F0', svg: menuIcons.clock },
    beans: {
      bg: '#F2C230',
      fg: '#2a1605',
      svg: `<div class="bean-trio">${bean}${bean}${bean}</div>`,
    },
  };
  $('[data-ig-grid]').innerHTML = instagram
    .map((p) => {
      const a = art[p.art];
      return `
      <a class="post" href="${p.url}" target="_blank" rel="noopener" style="--post-bg:${a.bg};--post-fg:${a.fg}" data-cursor="hover">
        <span class="post-light"></span>
        <span class="post-art">${a.svg}</span>
        <span class="post-view">${igIcon}${t(lang, 'ig.view')}</span>
        <span class="post-cap">${t(lang, p.key)}</span>
      </a>`;
    })
    .join('');
}

function renderStatus() {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Damascus',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
  );
  const open = hour >= 9 || hour < 1;
  $$('[data-status]').forEach((el) => {
    el.classList.toggle('is-closed', !open);
    $('.status-text', el).textContent = open
      ? `${t(lang, 'visit.open')} · ${t(lang, 'visit.closes')}`
      : t(lang, 'visit.closed');
  });
}

function renderAll() {
  applyLang(lang);
  renderMarquee();
  renderSig();
  renderJourney();
  renderMenu();
  renderIG();
  renderStatus();
  $$('[data-count]').forEach((el) => (el.textContent = formatNum(0)));
}

const formatNum = (n) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-SY' : 'en-US').format(
    Math.round(n),
  );

/* =========================================================
   Smooth scroll
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

/* =========================================================
   Nav: hide on scroll down, mobile overlay, language
   ========================================================= */
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
    if (tab) filterMenu(tab.dataset.cat);
  });
  addEventListener('resize', () => movePill(false));
}

function openMobileNav() {
  const mnav = $('.mobile-nav');
  const b = $('.burger').getBoundingClientRect();
  mnav.style.setProperty('--cx', `${b.left + b.width / 2}px`);
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
   Menu filtering (Flip)
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

let flipRun; // the menu's in-flight Flip, if any

function filterMenu(cat) {
  if (cat === activeCat) return;
  activeCat = cat;
  $$('.tab').forEach((tab) => {
    const on = tab.dataset.cat === cat;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-selected', on);
  });
  movePill();

  const grid = $('[data-menu]');
  const items = $$('.item');
  // Capture where cards are right now (mid-flight if the last filter is still
  // running), then finish that run so every card is back in normal flow.
  const state = Flip.getState(items);
  const from = grid.getBoundingClientRect().height;
  flipRun?.progress(1);
  gsap.killTweensOf(grid);
  gsap.set(grid, { clearProps: 'height' });
  items.forEach((it) =>
    it.classList.toggle('is-hidden', cat !== 'all' && it.dataset.cat !== cat),
  );
  // The card stagger outlasts the height tween, so the height is only released
  // once the Flip itself has finished.
  const release = () => {
    gsap.set(grid, { clearProps: 'height' });
    ScrollTrigger.refresh();
  };
  // Hold the grid's height while Flip moves the cards out of flow, so the
  // section below doesn't jump up over them.
  const to = grid.offsetHeight;
  gsap.fromTo(
    grid,
    { height: from },
    {
      height: to,
      duration: 0.7,
      ease: 'power3.inOut',
    },
  );
  flipRun = Flip.from(state, {
    duration: 0.7,
    ease: 'power3.inOut',
    stagger: 0.03,
    absolute: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          stagger: 0.04,
          ease: 'back.out(1.4)',
        },
      ),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.35 }),
    onComplete: release,
  });
}

/* =========================================================
   Ambient loops (run once, language-independent)
   ========================================================= */
function initAmbient() {
  if (reduceMotion) {
    gsap.set('.pour-liquid', { y: 520 });
    return;
  }
  gsap.to('.stream-shine', {
    strokeDashoffset: -64,
    duration: 0.55,
    repeat: -1,
    ease: 'none',
  });
  gsap.to('.pour-wave', { x: -100, duration: 1.6, repeat: -1, ease: 'none' });
  gsap.fromTo(
    '.drip',
    { y: 0, opacity: 1 },
    {
      y: 96,
      opacity: 0.2,
      duration: 0.6,
      repeat: -1,
      repeatDelay: 0.35,
      ease: 'power2.in',
    },
  );
  gsap.to('.kettle', {
    rotation: 1.4,
    svgOrigin: '430 120',
    duration: 2.4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
  gsap.to('.bloom circle', {
    scale: 1.6,
    opacity: 0.4,
    transformOrigin: 'center',
    stagger: { each: 0.3, repeat: -1, yoyo: true },
    duration: 1.2,
  });
  $$('.pour .steam path').forEach((p, i) =>
    gsap.fromTo(
      p,
      { y: 14, opacity: 0 },
      {
        keyframes: { y: [14, -8, -34], opacity: [0, 0.9, 0] },
        duration: 3,
        repeat: -1,
        delay: i * 0.9,
        ease: 'sine.inOut',
      },
    ),
  );
  gsap.to('.cup-wave', { x: -80, duration: 2, repeat: -1, ease: 'none' });
  gsap.to('.cup-ice rect', {
    y: -6,
    rotation: 4,
    svgOrigin: '160 160',
    duration: 2.2,
    yoyo: true,
    repeat: -1,
    stagger: 0.3,
    ease: 'sine.inOut',
  });
  $$('.cup-steam path').forEach((p, i) =>
    gsap.fromTo(
      p,
      { strokeDashoffset: 0 },
      {
        strokeDashoffset: -200,
        duration: 3,
        repeat: -1,
        ease: 'none',
        delay: i * 0.4,
      },
    ),
  );

  // Beans: float + mouse parallax
  $$('.hero-beans .bean').forEach((b, i) => {
    gsap.to(b, {
      y: '+=14',
      rotation: `+=${i % 2 ? 12 : -12}`,
      duration: 2.6 + i * 0.3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  });
  if (finePointer) {
    const beans = $$('.hero-beans .bean').map((b) => ({
      d: +b.dataset.depth,
      x: gsap.quickTo(b, 'x', { duration: 1.2, ease: 'power3' }),
    }));
    const sx = gsap.quickTo('.hero-scene', 'x', {
      duration: 1.4,
      ease: 'power3',
    });
    const sy = gsap.quickTo('.hero-scene', 'y', {
      duration: 1.4,
      ease: 'power3',
    });
    $('.hero').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      beans.forEach((b) => b.x(nx * 60 * b.d));
      sx(nx * -14);
      sy(ny * -10);
    });
  }

  // Marquee reacts to scroll velocity
  const track = $('[data-marquee]');
  const loop = gsap.to(track, {
    xPercent: -25,
    duration: 22,
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
}

/* =========================================================
   Loader + hero entrance
   ========================================================= */
function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const counter = { v: 0 };
  const L = (s) => `.loader-logo ${s}`;

  // The long Arabic stroke is drawn right-to-left, the way it is written.
  gsap.set(L('.lg-arabic'), { scaleX: 0, transformOrigin: '100% 50%' });
  gsap.set([L('.lg-damma-ar'), L('.lg-damma-en')], { y: -80, opacity: 0 });
  gsap.set([L('.lg-sub'), L('.lg-coffee')], { y: 40, opacity: 0 });

  const dur = reduceMotion ? 0.3 : 2.4;
  tl.to(counter, {
    v: 100,
    duration: dur,
    ease: 'power2.inOut',
    onUpdate: () => ($('.loader-count').textContent = formatNum(counter.v)),
  })
    .to(
      '.loader-fill',
      { yPercent: -100, y: 0, duration: dur, ease: 'power2.inOut' },
      0,
    )
    .to(
      L('.lg-arabic'),
      { scaleX: 1, duration: 1.2, ease: 'power4.inOut' },
      0.2,
    )
    .to(L('.lg-sub'), { y: 0, opacity: 1, duration: 1 }, 0.9)
    .to(L('.lg-coffee'), { y: 0, opacity: 1, duration: 1 }, 1.1)
    .to(
      [L('.lg-damma-ar'), L('.lg-damma-en')],
      { y: 0, opacity: 1, duration: 0.9, ease: 'bounce.out', stagger: 0.12 },
      1.2,
    )
    .to(
      '.loader-meta',
      { opacity: 0, y: 10, duration: 0.4, ease: 'power2.in' },
      '+=0.15',
    )
    .to(
      '.loader-logo',
      { scale: 0.9, opacity: 0, duration: 0.6, ease: 'power3.in' },
      '<',
    )
    .to(
      '.loader',
      { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' },
      '-=0.2',
    )
    .add(() => {
      $('.loader').remove();
      document.body.classList.remove('is-loading');
      lenis.start();
      // Arriving from the crops page with e.g. #menu
      const target = location.hash && $(location.hash);
      if (target) lenis.scrollTo(target, { duration: 1.6 });
    })
    .add(heroEntrance(), '-=0.7');
}

function heroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 } });
  tl.from('.nav > *', { y: -40, opacity: 0, stagger: 0.08, duration: 1.2 })
    .from('.eyebrow', { y: 20, opacity: 0 }, 0.1)
    .from(heroLines, { yPercent: 110, stagger: 0.12, duration: 1.3 }, 0.15)
    .from(
      ['.hero-sub', '.hero-ctas > *', '.hero .status-chip'],
      { y: 30, opacity: 0, stagger: 0.08 },
      0.45,
    )
    .from('.pour .server', { y: 60, opacity: 0 }, 0.2)
    .from('.pour .dripper', { y: -40, opacity: 0 }, 0.35)
    .from(
      '.pour .kettle-in',
      { x: 90, y: -70, opacity: 0, duration: 1.6 },
      0.45,
    )
    .from(
      ['.stream', '.stream-shine'],
      { drawSVG: '0% 0%', duration: 0.9, ease: 'power2.in' },
      1.25,
    )
    .fromTo(
      '.pour-liquid',
      { y: 590 },
      { y: 522, duration: 4, ease: 'power1.out' },
      1.8,
    )
    .from(
      '.hero-beans .bean',
      { scale: 0, opacity: 0, stagger: 0.06, ease: 'back.out(2)', duration: 1 },
      0.5,
    )
    .from(
      '.badge',
      { scale: 0, rotation: -90, opacity: 0, ease: 'back.out(1.6)' },
      0.9,
    )
    .from('.hero-scroll', { opacity: 0, y: 20 }, 1);
  return tl;
}

/* =========================================================
   Scroll scenes (rebuilt whenever the language changes)
   ========================================================= */
function buildScenes() {
  scenes = gsap.context(() => {
    const rtl = isRtl();
    const mm = gsap.matchMedia();

    // Hero title lines (used by the entrance; on language switch they just sit in place)
    heroLines = SplitText.create('.hero-title', {
      type: 'lines',
      mask: 'lines',
    }).lines;

    // Hero parallax out
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      .to('.hero-copy', { y: -120, opacity: 0.2, ease: 'none' }, 0)
      .to('.hero-art', { y: 90, scale: 0.94, ease: 'none' }, 0)
      .to('.hero-light', { y: 120, ease: 'none' }, 0);
    $$('.hero-beans .bean').forEach((b) =>
      gsap.to(b, {
        yPercent: -260 * b.dataset.depth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      }),
    );

    // Generic line reveals for headings
    $$('[data-split]:not(.hero-title)').forEach((el) => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines' });
      gsap.from(s.lines, {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    $$('.kicker').forEach((el) =>
      gsap.from(el, {
        x: rtl ? 30 : -30,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      }),
    );

    // Story: words light up with scroll
    const story = $('[data-scrub]');
    story.innerHTML = story.textContent
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(' ');
    gsap.to($$('.w', story), {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: story,
        start: 'top 78%',
        end: 'bottom 45%',
        scrub: 0.6,
      },
    });
    gsap.fromTo(
      '.story-logo',
      { xPercent: rtl ? -8 : 8 },
      {
        xPercent: rtl ? 8 : -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.story',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );

    buildSignature(rtl);
    buildJourney(rtl);

    // Menu cards
    ScrollTrigger.batch('.item', {
      start: 'top 90%',
      once: true,
      onEnter: (els) =>
        gsap.from(els, {
          y: 60,
          opacity: 0,
          rotateX: -12,
          stagger: 0.07,
          duration: 1,
          ease: 'expo.out',
          clearProps: 'transform,opacity',
        }),
    });
    gsap.from('.tab', {
      y: 20,
      opacity: 0,
      stagger: 0.05,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.tabs', start: 'top 88%' },
      onComplete: () => movePill(false),
    });

    // Stats count up
    $$('[data-count]').forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, {
        v: +el.dataset.count,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => (el.textContent = formatNum(o.v)),
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    gsap.from('.stat', {
      y: 60,
      opacity: 0,
      stagger: 0.1,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.stats', start: 'top 80%' },
    });

    // Visit
    gsap.from('.branch', {
      y: 80,
      opacity: 0,
      rotateX: -18,
      stagger: 0.12,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.branches', start: 'top 85%' },
    });

    // Instagram tiles
    gsap.from('.post', {
      y: 80,
      opacity: 0,
      scale: 0.92,
      stagger: 0.08,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.ig-grid', start: 'top 85%' },
    });
    mm.add('(min-width: 1025px)', () => {
      $$('.post').forEach((p, i) =>
        gsap.to(p, {
          y: i % 3 === 1 ? -60 : 30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.ig-grid',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }),
      );
    });

    // Footer logo rises letter-group by letter-group
    gsap.from('.footer-logo .logo path', {
      yPercent: 60,
      opacity: 0,
      stagger: 0.08,
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.footer-logo', start: 'top 95%' },
    });

    // Active nav link
    ['story', 'signature', 'menu', 'visit'].forEach((id) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) =>
          $(`.nav-links a[href="#${id}"]`)?.classList.toggle(
            'is-active',
            self.isActive,
          ),
      });
    });
  });
}

function layerGeometry(drink) {
  // Cup interior runs from y=70 (rim) to y=452 (base). Rects are painted top layer first.
  const H = 382;
  const base = 452;
  let acc = 0;
  const tops = drink.layers.map(([, share]) => {
    acc += share;
    return base - acc * H;
  });
  const order = [2, 1, 0];
  return {
    rects: order.map((k) => ({
      y: tops[k],
      height: base - tops[k] + 20,
      fill: drink.layers[k][0],
    })),
    waveY: tops[2] - 2,
    waveFill: drink.layers[2][0],
  };
}

function buildSignature(rtl) {
  const sig = $('.sig');
  const rects = $$('.cup .lay');
  const items = $$('.sig-item');
  const setDrink = (i, tl, at) => {
    const d = signature[i];
    const g = layerGeometry(d);
    const vars = tl ? { duration: 1, ease: 'power2.inOut' } : { duration: 0 };
    rects.forEach((r, k) =>
      tl
        ? tl.to(r, { attr: g.rects[k], ...vars }, at)
        : gsap.set(r, { attr: g.rects[k] }),
    );
    const waveProps = { y: g.waveY, fill: g.waveFill };
    tl
      ? tl.to('.cup-wave', { ...waveProps, ...vars }, at)
      : gsap.set('.cup-wave', waveProps);
    const toggles = [
      ['.cup-ice', { opacity: d.ice ? 1 : 0, y: d.ice ? 0 : -40 }],
      ['.cup-straw', { opacity: d.straw ? 1 : 0, y: d.straw ? 0 : -120 }],
      ['.cup-steam', { opacity: d.steam ? 1 : 0 }],
      [sig, { '--sig-bg': d.bg, '--sig-accent': d.accent }],
    ];
    toggles.forEach(([el, props]) =>
      tl ? tl.to(el, { ...props, ...vars }, at) : gsap.set(el, props),
    );
  };

  setDrink(0);
  gsap.set(items, { autoAlpha: 0, y: 40 });
  gsap.set(items[0], { autoAlpha: 1, y: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.sig',
      start: 'top top',
      end: '+=280%',
      pin: '.sig-pin',
      scrub: 0.8,
      onUpdate: (self) => {
        const idx = Math.min(2, Math.round(self.progress * 2));
        $('.sig-num').textContent = String(idx + 1).padStart(2, '0');
        gsap.set('.sig-bar span', { scaleX: 1 / 3 + (self.progress * 2) / 3 });
      },
    },
  });

  tl.to({}, { duration: 0.6 });
  [1, 2].forEach((i) => {
    const at = tl.duration();
    tl.to(
      items[i - 1],
      { autoAlpha: 0, y: -40, duration: 0.5, ease: 'power2.in' },
      at,
    )
      .to(
        '.cup',
        {
          rotation: rtl ? 6 : -6,
          y: -20,
          duration: 0.5,
          ease: 'power2.inOut',
          transformOrigin: '50% 90%',
        },
        at,
      )
      .to(
        '.cup',
        { rotation: 0, y: 0, duration: 0.5, ease: 'power2.inOut' },
        at + 0.5,
      );
    setDrink(i, tl, at);
    tl.fromTo(
      items[i],
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      at + 0.5,
    ).to({}, { duration: 0.6 });
  });

  gsap.from('.sig-cup', {
    y: 120,
    opacity: 0,
    scale: 0.9,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.sig', start: 'top 70%' },
  });
}

function buildJourney(rtl) {
  const track = $('.journey-track');
  const distance = () => Math.max(0, track.scrollWidth - innerWidth);

  // Each card draws itself in once it slides into view. Checked against the viewport
  // rather than via containerAnimation so it behaves the same in RTL and LTR.
  const reveals = $$('.step').map((step) => ({
    step,
    tl: gsap
      .timeline({ paused: true })
      .from(
        $$(
          '.step-art path, .step-art circle, .step-art ellipse, .step-art rect',
          step,
        ),
        {
          drawSVG: 0,
          duration: 1.6,
          stagger: 0.05,
          ease: 'power2.inOut',
        },
      )
      .from(
        $$('h3, p, .step-num', step),
        { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out' },
        0.3,
      ),
  }));
  const check = () =>
    reveals.forEach(({ step, tl }) => {
      const r = step.getBoundingClientRect();
      const visible =
        r.left < innerWidth * 0.92 &&
        r.right > innerWidth * 0.08 &&
        r.top < innerHeight * 0.85;
      if (visible && !tl.isActive() && tl.progress() < 1) tl.play();
    });

  gsap.to(track, {
    x: () => (rtl ? distance() : -distance()),
    ease: 'none',
    scrollTrigger: {
      trigger: '.journey',
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: '.journey-pin',
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
    onUpdate: check,
  });
  ScrollTrigger.create({
    trigger: '.journey',
    start: 'top 75%',
    end: 'bottom top',
    onUpdate: check,
    onEnter: check,
  });

  gsap.fromTo(
    '.journey-line',
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.journey',
        start: 'top 60%',
        end: () => `+=${distance() + innerHeight * 0.6}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    },
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
setInterval(renderStatus, 60_000);

document.fonts.ready.then(() => {
  buildScenes();
  ScrollTrigger.refresh();
  playIntro();
});
