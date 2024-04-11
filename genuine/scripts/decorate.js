import { getUrlParams } from './utils.js';

function goCartLinkAppend(link, paramsValue) {
  try {
    const url = new URL(link.getAttribute('href'));
    const urlSearchParams = new URLSearchParams(url.search);
    
    Object.keys(paramsValue).forEach(key => {
      if (!urlSearchParams.has(key)) {
        urlSearchParams.append(key, paramsValue[key]);
      }
    });
    
    const searchParamsString = urlSearchParams.toString();
    const divider = (searchParamsString !== '') ? '&' : '?';
    link.setAttribute('href', `${url.origin}${url.pathname}${url.search}${divider}${searchParamsString}${url.hash}`);
  } catch (error) {
    console.log(`goCartLinkAppend: Could not append link for ${link}, invalid URL`);
  }
}

export function decorateButton() {
  const buttons = document.querySelectorAll('a.con-button');
  const paramsValue = getUrlParams();
  buttons.forEach(button => goCartLinkAppend(button, paramsValue));
}