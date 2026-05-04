import {
  decorateBlockText,
  decorateIconStack,
  applyHoverPlay,
  decorateBlockBg,
  decorateTextOverrides,
  createTag,
  getConfig,
  loadStyle,
} from '../../scripts/utils.js';

// aside-merch supports split layout only (text style sizes for decorateBlockText)
const SPLIT_BLOCK_TEXT = ['xl', 's', 'm'];
const medium = 'medium';
const large = 'large';
const FORMAT_REGEX = /^format:/i;

function decorateMedia(el) {
  if (!(el.classList.contains(medium) || el.classList.contains(large))) return;
  const allMedia = el.querySelectorAll('div > p video, div > p picture');
  [...allMedia].some((media) => {
    const parentP = media.closest('p');
    const siblingP = parentP?.nextElementSibling;
    if (!siblingP || siblingP.nodeName !== 'P') return false;
    const siblingText = siblingP.textContent;
    const hasFormats = FORMAT_REGEX.test(siblingText);
    if (!hasFormats) return false;
    const formats = siblingText.split(': ')[1]?.split(/\s+/);
    if (formats) {
      const formatClasses = [];
      formatClasses.push('format');
      if (formats.length === 3) formatClasses.push(`desktop-${formats[2]}`);
      if (formats.length >= 2) formatClasses.push(`tablet-${formats[1]}`);
      formatClasses.push(`mobile-${formats[0]}`);
      media.closest('div').classList.add(...formatClasses);
    }
    siblingP.remove();
    media.closest('div').insertBefore(media, parentP);
    parentP.remove();
    return true;
  });
}

// Priority: foreground video/media > background video/media > foreground image > background image
function findBlockMedia(el, foreground) {
  const foregroundImage = foreground.querySelector(':scope > div:not(.text) img')?.closest('div');
  const bgImage = el.querySelector(':scope > div:not(.text):not(.foreground):not(.background) img')?.closest('div');
  const foregroundMedia = foreground.querySelector(':scope > div:not(.text) :is(.video-container, video, a[href*=".mp4"], a[href*="tv.adobe.com"]), :scope > div:not(.text) iframe[src*="tv.adobe.com"]')?.closest('div:not(.video-container)');
  const bgMedia = el.querySelector(':scope > div:not(.text):not(.foreground):not(.background) video, :scope > div:not(.text):not(.foreground):not(.background) a:is([href*=".mp4"], [href*="tv.adobe.com"])')?.closest('div');
  return foregroundMedia ?? bgMedia ?? foregroundImage ?? bgImage;
}

function loadIconography() {
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  return new Promise((resolve) => { loadStyle(`${base}/styles/iconography.css`, resolve); });
}

export function handleImageLoad(el, image) {
  if (image && !image.complete) {
    el.style.visibility = 'hidden';
    image.addEventListener('load', () => {
      el.style.visibility = 'visible';
    });
    image.addEventListener('error', () => {
      image.style.visibility = 'hidden';
      el.style.visibility = 'visible';
    });
  }
}

function decorateLayout(el) {
  const elems = el.querySelectorAll(':scope > div');
  if (elems.length > 1) {
    decorateBlockBg(el, elems[0]);
  }
  const foreground = elems[elems.length - 1];
  foreground.classList.add('foreground', 'container');
  el.classList.add('split');
  decorateMedia(el);
  const text = foreground.querySelector('h1, h2, h3, h4, h5, h6, p')?.closest('div');
  text?.classList.add('text');
  const media = foreground.querySelector(':scope > div:not([class])');
  if (media) {
    media.classList.add('image');
    const video = media.querySelector('video');
    if (video) applyHoverPlay(video);
  }
  const picture = text?.querySelector('p picture');
  const iconArea = picture ? (picture.closest('p') || createTag('p', null, picture)) : null;
  if (iconArea) {
    const iconVariant = el.className.match(/-(avatar|lockup)/);
    const iconClass = iconVariant ? `${iconVariant[1]}-area` : 'icon-area';
    if (iconVariant) loadIconography();
    iconArea.classList.add(iconClass);
    const iconAreaImage = iconArea.querySelector('img');
    handleImageLoad(el, iconAreaImage);
  }
  const asideMedia = findBlockMedia(el, foreground);
  if (!asideMedia) el.classList.add('no-media');
  if (asideMedia && !asideMedia.classList.contains('text')) {
    asideMedia.classList.add('split-image');
    const position = [...asideMedia.parentNode.children].indexOf(asideMedia);
    el.classList.add(`split${!position ? '-right' : '-left'}`);
    foreground.parentElement.appendChild(asideMedia);
  } else if (!iconArea) {
    foreground?.classList.add('no-image');
  }
  decorateIconStack(el);
  const icnStk = el.querySelector('.icon-stack-area');
  if (icnStk) {
    const liELs = icnStk.querySelectorAll('li');
    [...liELs].forEach((liEl) => {
      liEl.querySelectorAll('p').forEach((pElement) => {
        while (pElement.firstChild) {
          pElement.parentNode.insertBefore(pElement.firstChild, pElement);
        }
        pElement.remove();
      });
    });
  }
  return foreground;
}

export default function init(el) {
  el.classList.add('con-block');
  const blockText = decorateLayout(el);
  const merchCardEls = [...blockText.querySelectorAll('merch-card :is(p, ul, ol, div):not([class])')];
  merchCardEls.forEach((e) => e.classList.add('merch-card-el'));
  decorateBlockText(blockText, SPLIT_BLOCK_TEXT);
  merchCardEls.forEach((e) => e.classList.remove('merch-card-el'));
  el.querySelectorAll('merch-card [slot="body-xs"] p').forEach((p) => {
    if (p.firstChild?.nodeName === 'BR') p.firstChild.remove();
  });
  decorateTextOverrides(el);
  if (el.classList.contains('l-title')) el.querySelector('[class*="detail-"]')?.classList.add('title-l');
}
