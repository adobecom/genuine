import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { stub } from 'sinon';

export const mockRes = ({ payload, status = 200, ok = true } = {}) => new Promise((resolve) => {
  resolve({
    status,
    ok,
    json: () => payload,
    text: () => payload,
  });
});

export const mockFetch = (payload) => stub().callsFake(() => mockRes(payload));
window.fetch = mockFetch({ payload: { data: '' } });

function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.head.innerHTML = await readFile({ path: './mocks/head-off.html' });
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('Scripts', () => {
  before(async () => {
    await import('../../genuine/scripts/scripts.js');
    delay(200);
  });

  it('Makes validation call when validate meta tag is on', () => {
    expect(document.querySelector('meta[name="validate"]').content).to.equal('off');
  });

  it('Loads genuine page when validate meta tag is off', async () => {
    document.head.innerHTML = await readFile({ path: './mocks/head-off.html' });
    expect(document.querySelector('meta[name="validate"]').content).to.equal('off');
  });
});
