/** Convenient shorthand for `Object.hasOwn`. */
export const has = Object.hasOwn;

/**
 * Copies source.property, if it exists, to destination.property.
 * @param {string} property
 * @param {source} source
 * @param {destination} destination
 */
export function copyPropertyIfPresent(property, source, destination) {
  if (has(source, property)) {
    // eslint-disable-next-line no-param-reassign
    destination[source] = source[property];
  }
}

/**
 * Throws an error if `object` has the property `property`.
 * @param {object} object
 * @param {string} property
 * @param {string} errorMessage
 */
export function mustNotHave(object, property, errorMessage) {
  if (has(object, property)) {
    throw new Error(errorMessage);
  }
}
