function createDiv(className) {
  const div = document.createElement('div');
  div.className = className;
  return div;
}

export default function decorate(block) {
  if (!block) return;

  const img = block.querySelector('img');
  const link = block.querySelector('a[href]');
  const textPara = block.querySelector('p:last-of-type');

  if (!img || !link || !textPara) return;

  img.alt = link.textContent.trim();

  const logoWrapper = createDiv('ribbon__logo');
  const titleWrapper = createDiv('ribbon__title');

  const logoLink = document.createElement('a');
  logoLink.className = 'ribbon__logo-link';
  logoLink.href = link.href;

  logoLink.append(img);
  logoWrapper.append(logoLink);
  titleWrapper.append(textPara);

  block.replaceChildren(logoWrapper, titleWrapper);
}
