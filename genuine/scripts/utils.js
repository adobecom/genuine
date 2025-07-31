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
        !(hostname.includes('hlx.page') || hostname.includes('aem.page'))
        && !(hostname.includes('hlx.live') || hostname.includes('aem.live'))
        && !hostname.includes('localhost')
      ) {
        libs = prodLibs;
        return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') {
        libs = 'http://localhost:6456/libs';
        return libs;
      }
      if (branch.indexOf('--') > -1) {
        libs = `https://${branch}.aem.live/libs`;
        return libs;
      }
      libs = `https://${branch}--milo--adobecom.aem.live/libs`;
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

  if (Number.isNaN(timerDate.getTime())) {
    return 0;
  }

  if (timer.endsWith('d')) {
    const countdown = parseInt(timer, 10);
    return Number.isNaN(countdown) ? 0 : countdown;
  }
  const now = new Date();
  const daysRemaining = Math.round((timerDate - now) / (24 * 3600 * 1000));
  return Math.max(daysRemaining, 0);
}

function getParamValue(val) {
  let paramValue = (new URLSearchParams(window.location.search)).get(val);
  if (val === 'timer' && paramValue) {
    paramValue = getCountdown(paramValue);
  }
  return paramValue;
}

export function getUrlParams() {
  return GOCART_PARAM_KEYS.reduce((acc, key) => {
    const paramValue = getParamValue(key);
    if (paramValue) acc[key] = paramValue;
    return acc;
  }, {});
}
