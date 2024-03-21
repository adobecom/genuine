function passParams(button) {
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  button.href = `${button.href}?gtoken=${gtoken}&gid=${gid}`
}

export function decorateButton() {
  const buttons = document.querySelectorAll('a, .con-button');
  buttons.forEach(button => passParams(button));
}