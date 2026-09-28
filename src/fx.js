// Pointer effects shared by every page: custom cursor, magnetic buttons, card tilt.
import gsap from 'gsap';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const finePointer = matchMedia('(pointer: fine)').matches;

export function initCursor(getLang) {
  if (!finePointer) return;
  const cursor = $('.cursor');
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  const label = $('.cursor-label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

  addEventListener('pointermove', (e) => {
    cursor.classList.add('is-live');
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest('[data-cursor], a, button');
    const mode = el?.dataset.cursor;
    const labelled = mode === 'pour' || mode === 'view';
    cursor.classList.toggle('is-hover', !!el && !labelled);
    cursor.classList.toggle('is-pour', labelled);
    if (mode === 'pour')
      label.textContent = getLang() === 'ar' ? 'صُب' : 'POUR';
    if (mode === 'view')
      label.textContent = getLang() === 'ar' ? 'شوف' : 'VIEW';
  });
  document.documentElement.addEventListener('pointerleave', () =>
    gsap.to([dot, ring], { opacity: 0 }),
  );
  document.documentElement.addEventListener('pointerenter', () =>
    gsap.to([dot, ring], { opacity: 1 }),
  );
}

export function initMagnetic() {
  if (!finePointer) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest('.magnetic');
    $$('.magnetic.is-mag').forEach((m) => {
      if (m !== el) {
        m.classList.remove('is-mag');
        gsap.to(m, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      }
    });
    if (!el) return;
    el.classList.add('is-mag');
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * 0.3,
      y: (e.clientY - (r.top + r.height / 2)) * 0.4,
      duration: 0.5,
      ease: 'power3',
    });
  });
}

export function initTilt() {
  if (!finePointer) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest('.tilt');
    $$('.tilt.is-tilting').forEach((x) => {
      if (x !== el) {
        x.classList.remove('is-tilting');
        gsap.to(x, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3' });
      }
    });
    if (!el) return;
    el.classList.add('is-tilting');
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
    gsap.to(el, {
      rotateY: (px - 0.5) * 10,
      rotateX: (0.5 - py) * 10,
      transformPerspective: 900,
      duration: 0.5,
      ease: 'power3',
    });
  });
}
