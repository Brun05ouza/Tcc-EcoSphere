let lockCount = 0;
let savedScrollY = 0;
let lenisInstance = null;

export function registerLenis(lenis) {
  lenisInstance = lenis ?? null;
}

export function lockBodyScroll() {
  lockCount += 1;
  if (lockCount !== 1) return;

  savedScrollY = window.scrollY || window.pageYOffset || 0;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';

  lenisInstance?.stop();
}

export function unlockBodyScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount !== 0) return;

  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';

  window.scrollTo(0, savedScrollY);
  lenisInstance?.start();
}
