/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * Genuine pages param keys
 */
export const GOCART_PARAM_KEYS = ['gid', 'gtoken', 'sdid', 'cohortid', 'timer', 'gcsrc', 'gcprog', 'gcprogcat', 'gcpagetype', 'language', 'productname', 'daysremaining'];

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, force = false) => {
      if (force) {
        libs = prodLibs;
        return libs;
      }
      const { hostname } = window.location;
      if (
        !hostname.includes('hlx.page') &&
        !hostname.includes('hlx.live') &&
        !hostname.includes('localhost')
      ) {
        libs = prodLibs;
        return libs;
      }
      const branch =
        new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') {
        libs = 'http://localhost:6456/libs';
        return libs;
      }
      if (branch.indexOf('--') > -1) {
        libs = `https://${branch}.hlx.live/libs`;
        return libs;
      }
      libs = `https://${branch}--milo--adobecom.hlx.live/libs`;
      return libs;
    },
    () => libs,
  ];
})();

const miloLibs = setLibs('/libs');

const { createTag, localizeLink } = await import(`${miloLibs}/utils/utils.js`);
export { createTag, localizeLink };

function getCountdown(timer) {
  const timerDate = new Date(timer);

  if (isNaN(timerDate.getTime())) {
    return 0;
  }

  if (timer.endsWith('d')) {
    const countdown = parseInt(timer, 10);
    return isNaN(countdown) ? 0 : countdown;
  } else {
    const now = new Date();
    const daysRemaining = Math.round((timerDate - now) / (24 * 3600 * 1000));
    return Math.max(daysRemaining, 0); 
  }
}

function getParamValue(val) {
  let paramValue = (new URLSearchParams(window.location.search)).get(val);
  if (val === 'timer' && paramValue ) {
    paramValue = getCountdown(paramValue);
  }
  return paramValue;
}

export function getUrlParams() {
  const params = {};
  for (const key of GOCART_PARAM_KEYS) {
    const paramValue = getParamValue(key);
    if (paramValue) {
      params[key] = paramValue;
    }
  }
  return params;
}

export async function isTokenValid() {
  const { default: getServiceConfig } = await import(
    `${miloLibs}/utils/service-config.js`
  );
  const urlParams = new URLSearchParams(window.location.search);
  const gtoken = urlParams.get('gtoken');
  const gid = urlParams.get('gid');
  const { gocart } = await getServiceConfig(window.location.origin);

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

    const response = await fetch(gocart.url, opts);
    return response.ok;
  } catch (err) {
    return false;
  }
}

