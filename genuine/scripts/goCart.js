import { getLibs, getConfig } from './utils.js';

const miloLibs = getLibs('/libs');

function getServiceURL(data, serviceName, envName) {
  if (!data || !serviceName || !envName) return null;
  const keyToFind = `${envName}.${serviceName}.url`;
  const urlValue = data.find((item) => item.key === keyToFind);
  return urlValue ? urlValue.value : null;
}
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
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  const serviceName = urlParams.get('serviceName') || 'gc';
  const envName = urlParams.get('env') || getConfig().env.name || 'prod'; // Priority: Query Param -> Milo Env -> Prod
  const endptURL = '/genuine-shared/endpoints.json';
  const res = await fetch(endptURL);
  const response = await res.json();
  const { data } = response;

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

    const url = getServiceURL(data, serviceName, envName);
    const responseUrl = await fetch(url, opts);
    return responseUrl.ok;
  } catch (err) {
    return false;
  }
}

export async function loadBFP() {
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
    const umi = new URLSearchParams(window.location.search).get('umi');
    // trigger the BFP load only if umi is present
    const loadBFPScript = () => loadScript(scriptURL, undefined, { mode: 'defer' })
      .then(() => {
        if (!window.BFPJS) throw new Error('Cannot load BFPJS script');
        if (!umi) {
          window?.lana?.log('Skipping BFPJS load because UMI is missing', { severity: 'w' });
          return Promise.resolve();
        }
        return window.BFPJS.load({ debug: !isProd, xApiKey: apiKey, env });
      })
      .then((fp) => fp.get())
      .then(({ components, version }) => {
        const deviceId = { type: 'umi', value: umi };
        components.metaData = {
          ...components.metaData,
          meta: { deviceId: JSON.stringify(deviceId) },
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
