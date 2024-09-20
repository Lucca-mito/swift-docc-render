/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import assertIsArray from 'docc-render/utils/arrays';
import { fetchLocalJSON, fetchLocalText } from 'docc-render/utils/fetch-local-text';
import { copyPropertyIfPresent, has, mustNotHave } from 'docc-render/utils/object-properties';
import { resolveAbsoluteUrl } from 'docc-render/utils/url-helper';

/**
 * Returns whether the custom script should be run when the reader navigates to a subpage.
 * @param {object} customScript
 * @returns {boolean} Returns whether the custom script has a `run` property with a value of
 * "on-load" or "on-load-and-navigate". Also returns true if the `run` property is absent.
 */
function shouldRunOnPageLoad(customScript) {
  return !has(customScript, 'run')
    || customScript.run === 'on-load' || customScript.run === 'on-load-and-navigate';
}

/**
 * Returns whether the custom script should be run when the reader navigates to a topic.
 * @param {object} customScript
 * @returns {boolean} Returns whether the custom script has a `run` property with a value of
 * "on-navigate" or "on-load-and-navigate".
 */
function shouldRunOnNavigate(customScript) {
  return has(customScript, 'run')
    && (customScript.run === 'on-navigate' || customScript.run === 'on-load-and-navigate');
}

/**
 * Gets the URL for a local custom script given its name.
 * @param {string} customScriptName The name of the custom script as spelled in
 * custom-scripts.json. While the actual filename (in the custom-scripts directory) is always
 * expected to end in ".js", the name in custom-scripts.json may or may not include the ".js"
 * extension.
 * @returns {string} The absolute URL where the script is, accounting for baseURL.
 * @example
 * // if baseURL if '/foo'
 * urlGivenScriptName('hello-world')    // http://localhost:8080/foo/hello-world.js
 * urlGivenScriptName('hello-world.js') // http://localhost:8080/foo/hello-world.js
 */
function urlGivenScriptName(customScriptName) {
  let scriptNameWithExtension = customScriptName;

  // If the provided name does not already include the ".js" extension, add it.
  if (customScriptName.slice(-3) !== '.js') {
    scriptNameWithExtension = `${customScriptName}.js`;
  }

  return resolveAbsoluteUrl(['', 'custom-scripts', scriptNameWithExtension]);
}

/**
 * Add an HTMLScriptElement containing the custom script to the document's head, which runs the
 * script on page load.
 * @param {object} customScript The custom script, assuming it should be run on page load.
 */
function addScriptElement(customScript) {
  const scriptElement = document.createElement('script');

  copyPropertyIfPresent('type', customScript, scriptElement);

  if (has(customScript, 'url')) {
    mustNotHave(customScript, 'name', 'Custom script cannot have both `url` and `name`.');
    mustNotHave(customScript, 'code', 'Custom script cannot have both `url` and `code`.');

    scriptElement.src = customScript.url;

    copyPropertyIfPresent('async', customScript, scriptElement);
    copyPropertyIfPresent('defer', customScript, scriptElement);
  } else if (has(customScript, 'name')) {
    mustNotHave(customScript, 'code', 'Custom script cannot have both `name` and `code`.');

    scriptElement.src = urlGivenScriptName(customScript.name);

    copyPropertyIfPresent('async', customScript, scriptElement);
    copyPropertyIfPresent('defer', customScript, scriptElement);
  } else if (has(customScript, 'code')) {
    mustNotHave(customScript, 'async', 'Inline script cannot be `async`.');
    mustNotHave(customScript, 'defer', 'Inline script cannot have `defer`.');

    scriptElement.innerHTML = customScript.code;
  } else {
    throw new Error('Custom script has neither `url` nor `code`.');
  }

  document.head.appendChild(scriptElement);
}

/**
 * Run the custom script using `eval`. Useful for running a custom script anytime after page load,
 * namely when the reader navigates to a subpage.
 * @param {object} customScript The custom script, assuming it should be run on navigate.
 */
async function evalScript(customScript) {
  let codeToEval;

  if (has(customScript, 'url')) {
    mustNotHave(customScript, 'name', 'Custom script cannot have both `url` and `name`.');
    mustNotHave(customScript, 'code', 'Custom script cannot have both `url` and `code`.');

    codeToEval = await fetchLocalText(customScript.url);
  } else if (has(customScript, 'name')) {
    mustNotHave(customScript, 'code', 'Custom script cannot have both `name` and `code`.');

    codeToEval = await fetchLocalText(urlGivenScriptName(customScript.name));
  } else if (has(customScript, 'code')) {
    codeToEval = customScript.code;
  } else {
    throw new Error('Custom script has neither `url` nor `code`.');
  }

  // eslint-disable-next-line no-eval
  eval(codeToEval);
}

export async function runCustomPageLoadScripts() {
  return fetchLocalJSON('/custom-scripts.json')
    .then(assertIsArray)
    .then(customScripts => customScripts.filter(shouldRunOnPageLoad))
    .then(customScripts => customScripts.forEach(addScriptElement));
  // .catch(() => ({}));
}

export async function runCustomNavigateScripts() {
  return fetchLocalJSON('/custom-scripts.json')
    .then(assertIsArray)
    .then(customScripts => customScripts.filter(shouldRunOnNavigate))
    .then(customScripts => customScripts.forEach(evalScript));
  // .catch(() => ({}));
}
