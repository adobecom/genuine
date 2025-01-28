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

  let formBody = [];
  for (const [key, value] of Object.entries({ gid, gtoken })) {
    formBody.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }
  formBody = formBody.join('&');

  try {
    const opts = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
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
  const { getConfig, loadScript } = await import(`${miloLibs}/utils/utils.js`);
  const {
    env,
    bfp: { apiKey, prodURL, stageURL },
  } = getConfig();
  const isStage = env === 'stage';

  try {
    await loadScript(isStage ? stageURL : prodURL);
    if (!BFPJS) throw 'Cannot load BFPJS script';

    async function getVisitorData() {
      const fp = await BFPJS.load({
        debug: isStage,
        xApiKey: apiKey,
        env: env,
      });
      return await fp.get();
    }

    const payload = await getVisitorData();
    const params = new URLSearchParams(window.location.search);
    const umi = params.get('umi');
    if (umi) {
      payload.deviceId = {
        type: 'umi',
        value: umi,
      };
    }
    
    await BFPJS.publish(payload);
  } catch (err) {
    window.lana?.log(`Browser Fingerprint load failed: ${err}`);
  }
}
