import { getUrlParams } from './utils.js';

function goCartLinkAppend(link, paramsValue) {
  try {
    const url = new URL(link.getAttribute('href'));
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
  const links = document.querySelectorAll('a.con-button, a.image-link, a');
  const paramsValue = getUrlParams();
  if (Object.keys(paramsValue).length > 0) {
    links.forEach((link) => goCartLinkAppend(link, paramsValue));
  }
}

export default {};
