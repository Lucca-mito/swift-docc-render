/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { resolveAbsoluteUrl } from 'docc-render/utils/url-helper';

/**
 * Fetch the contents of a local file, such as a local custom script, as text.
 * @param {string} filepath The file path.
 * @returns {Promise<string>} The text contents of the file. The promise must be error-handled at
 * the call site.
 */
export async function fetchLocalText(filepath) {
  const url = resolveAbsoluteUrl(filepath);
  return fetch(url)
    .then(r => r.text());
}

/**
 * Fetch the contents of a local JSON file and decode them into an object.
 *
 * Exceptions that occur while the promise is being fulfilled, such as if the file does not exist
 * or does not contain valid JSON, are not caught in this function.
 *
 * @param {string} filepath The file path.
 * @return {Promise<{}>} The decoded object. The promise must be error-handled at the call site.
 */
export async function fetchLocalJSON(filepath) {
  const url = resolveAbsoluteUrl(filepath);
  return fetch(url)
    .then(r => r.json());
}
