/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { fetchLocalJSON } from 'docc-render/utils/fetch-local-text';
import get from 'docc-render/utils/get';

/**
 * Theme settings state.
 * Overwritten with data, fetched at boot time.
 */
export const themeSettingsState = {
  meta: {},
  theme: {},
  features: {},
};
export const { baseUrl } = window;

/**
 * Fetch the theme settings and store in local module state.
 * Method is called before Vue boots in `main.js`.
 * @return {Promise<{}>}
 */
export async function fetchThemeSettings() {
  return fetchLocalJSON('/theme-settings.json')
    .catch(() => {});
}

export const getSetting = (path, fallback) => get(themeSettingsState, path, fallback);
