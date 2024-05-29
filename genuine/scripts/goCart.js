export async function isTokenValid(miloLibs) {
  const { default: getServiceConfig } = await import(
    `${miloLibs}/utils/service-config.js`
  );
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  const serviceName =  urlParams.get('serviceName') || 'genuine';
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
