import { getLibs } from './utils.js';

const miloLibs = getLibs('/libs');

export async function isTokenValid() {
  const { default: getServiceConfig } = await import(
    `${miloLibs}/utils/service-config.js`
  );
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  const serviceName = urlParams.get('serviceName') || 'genuine';
  const serviceConf = await getServiceConfig(window.location.origin);

  const formBody = Object.entries({ gid, gtoken })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  try {
    const opts = {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
      method: 'POST',
    };

    const response = await fetch(serviceConf[serviceName].url, opts);
    return response.ok;
  } catch (err) {
    return false;
  }
}

export async function loadBFP() {
  try {
    const { getConfig, loadScript } = await import(`${miloLibs}/utils/utils.js`);
    const {
      prodDomains,
      bfp: { apiKey, prodURL, stageURL },
    } = getConfig();
    let env = 'stage';
    if (window.origin.includes(prodDomains[0])) env = 'prod';
    else if (window.origin.includes('localhost')) env = 'dev';

    const isProd = env === 'prod';
    const scriptURL = isProd ? prodURL : stageURL;

    const loadBFPScript = () => loadScript(scriptURL, undefined, { mode: 'defer' })
      .then(() => {
        if (!window.BFPJS) throw new Error('Cannot load BFPJS script');

        return window.BFPJS.load({ debug: !isProd, xApiKey: apiKey, env });
      })
      .then((fp) => fp.get())
      .then(({ components, version }) => {
        const payload = { ...components, version };
        const umi = new URLSearchParams(window.location.search).get('umi');
        if (umi) payload.deviceId = { type: 'umi', value: umi };

        return window.BFPJS.publish(payload);
      })
      .catch((err) => window?.lana?.log(`Browser Fingerprint load failed: ${err}`));

    setTimeout(loadBFPScript, 1);
  } catch (err) {
    window?.lana?.log(`Browser Fingerprint load failed: ${err}`);
  }
}
