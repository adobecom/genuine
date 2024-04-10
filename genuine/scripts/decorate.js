import { getUrlParams } from './utils';

function goCartLinkAppend(link) {
  const paramsValue = getUrlParams();
  const appendString = Object.keys(GOCART_APPEND_LINK_PARAM_STORE)
    .map(key => `${key}=${paramsValue[key]}`)
    .join('&');

  let url;
  try {
    url = new URL(link.getAttribute('href'));
  } catch (error) {
    console.log(`goCartLinkAppend: Could not append link for ${link}, invalid URL`);
    return;
  }
  const divider = (url.search !== '') ? '&' : '?';
  link.setAttribute('href', `${url.origin}${url.pathname}${url.search}${appendString ? divider : ''}${appendString}${url.hash}`);
}

export function decorateButton() {
  const buttons = document.querySelectorAll('a, .con-button');
  buttons.forEach(button => goCartLinkAppend(button));
}