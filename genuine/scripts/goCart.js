import { getLibs, getConfig } from './utils.js';

const miloLibs = getLibs('/libs');

const setApiKeyHeader = (opts, serviceName, envName) => {
  const keys = {
    gc: { stage: 'TargetingServiceInternal', prod: 'TargetingServiceInternal' },
    ic: { stage: 'ic-non-prod', prod: 'ic-prod' },
  };

  if (keys[serviceName] && keys[serviceName][envName]) {
    opts.headers['x-api-key'] = keys[serviceName][envName];
  }
};

export async function isTokenValid() {
  const { default: getServiceConfig } = await import(
    `${miloLibs}/utils/service-config.js`
  );
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  const serviceName = urlParams.get('serviceName') || 'genuine';
  const envName = urlParams.get('env');
  const { codeRoot } = getConfig();
  const serviceConf = await getServiceConfig(codeRoot);

  const formBody = Object.entries({ gid, gtoken })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  try {
    const opts = {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: formBody,
      method: 'POST',
    };

    setApiKeyHeader(opts, serviceName, envName);

    const response = await fetch(serviceConf[serviceName].url, opts);
    return response.ok;
  } catch (err) {
    return false;
  }
}

export async function loadBFP(umi) {
  try {
    const { loadScript } = await import(`${miloLibs}/utils/utils.js`);
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
        const deviceId = { type: 'umi', value: umi };
        components.metaData = {
          ...components.metaData,
          meta: {deviceId: JSON.stringify(deviceId)},
        };
        const payload = { ...components, version };
        return window.BFPJS.publish(payload);
      })
      .catch((err) => window?.lana?.log(`Browser Fingerprint load failed: ${err}`));

    setTimeout(loadBFPScript, 200);
  } catch (err) {
    window?.lana?.log(`Browser Fingerprint load failed: ${err}`);
  }
}
