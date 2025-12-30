export default function decorate(block) {
  if (!block) return;
  const allParas = block.querySelectorAll('p');
  block.replaceChildren(...allParas);
}
