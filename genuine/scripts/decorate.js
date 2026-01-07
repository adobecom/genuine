import { getUrlParams } from './utils.js';

const DISABLED_HASH = '#_disabled';

function processDisabledLink(link) {
  const href = link.getAttribute('href');
  if (!href?.includes(DISABLED_HASH)) return false;

  link.classList.add('link-disabled');
  link.setAttribute('href', href.replace(DISABLED_HASH, ''));
  link.setAttribute('aria-disabled', 'true');
  link.setAttribute('tabindex', '-1');

  const img = link.querySelector('img');
  const ariaLabel = img?.alt ? `${img.alt}` : 'disabled link';

  link.setAttribute('aria-label', ariaLabel);
  return true;
}

function goCartLinkAppend(link, paramsValue) {
  try {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    const urlSearchParams = new URLSearchParams(url.search);

    Object.keys(paramsValue).forEach((key) => {
      if (!urlSearchParams.has(key)) {
        urlSearchParams.append(key, paramsValue[key]);
      }
    });

    const searchParamsString = urlSearchParams.toString();
    link.setAttribute('href', `${url.origin}${url.pathname}?${searchParamsString}${url.hash}`);
  } catch (error) {
    window?.lana?.log(`goCartLinkAppend: Could not append link for ${link}, invalid URL`);
  }
}

export function decorateLinks() {
  // Include links in header-localnav and main
  const links = document.querySelectorAll('header.local-nav a:not([href^="tel:"]), main a:not([href^="tel:"])');
  const cache = document.head.querySelector('meta[name="cache"]');
  const paramsValue = getUrlParams();
  const shouldAppendParams = cache?.content === 'on' && Object.keys(paramsValue).length > 0;

  links.forEach((link) => {
    if (!processDisabledLink(link) && shouldAppendParams) {
      goCartLinkAppend(link, paramsValue);
    }
  });

  const observer = new MutationObserver((_, obs) => {
    const localNav = document.querySelector('header.local-nav');
    if (!localNav) return;
    document.querySelectorAll('header.local-nav a:not([href^="tel:"])').forEach((link) => {
      if (!processDisabledLink(link) && shouldAppendParams) {
        goCartLinkAppend(link, paramsValue);
      }
    });
    obs.disconnect();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export default {};
