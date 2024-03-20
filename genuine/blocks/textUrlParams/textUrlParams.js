
export default async function init(el) {
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');

  el.innerHTML = 'Url params replacer';
  return el;
}
