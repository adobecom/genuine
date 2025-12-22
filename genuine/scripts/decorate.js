import { getUrlParams } from './utils.js';

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

export function decorateButton() {
  // Include links in header-localnav and main
  const links = document.querySelectorAll('header.local-nav a:not([href^="tel:"]), main a:not([href^="tel:"])');
  const cache = document.head.querySelector('meta[name="cache"]');
  const paramsValue = getUrlParams();
  if (cache?.content === 'on' && Object.keys(paramsValue).length > 0) {
    links.forEach((link) => goCartLinkAppend(link, paramsValue));
  }
}

export default {};
