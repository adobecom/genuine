import { getUrlParams } from './utils.js';

function goCartLinkAppend(link, paramsValue) {
  const appendString = Object.keys(paramsValue)
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

function passParams(button) {
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  button.href = `${button.href}?gtoken=${gtoken}&gid=${gid}`
}

export function decorateButton() {
  const buttons = document.querySelectorAll('a.con-button');
  const paramsValue = getUrlParams();
  buttons.forEach(button => goCartLinkAppend(button, paramsValue));
}