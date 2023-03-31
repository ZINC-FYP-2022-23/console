/**
 * @file Utilities related to object manipulation.
 */

/**
 * Recursively converts fields with value `null` to `undefined`.
 *
 * This can make modelling the object with TypeScript type definitions easier because we can simply
 * mark nullable fields with `?:` operator instead of `| null`.
 *
 * @param plainObj This should be a **plain** object (i.e. does not contain any class instances such as
 * `Map` or `Set`). This object will not be modified.
 */
export function nullToUndefined(plainObj: any): unknown {
  return JSON.parse(JSON.stringify(plainObj), (_, v) => (v === null ? undefined : v)) as unknown;
}

/**
 * Recursively converts fields with value `undefined` to `null`.
 *
 * @param plainObj This should be a **plain** object (i.e. does not contain any class instances such as
 * `Map` or `Set`). This object will not be modified.
 */
export function undefinedToNull(plainObj: any): unknown {
  const outputObjString = JSON.stringify(plainObj, (_, v) => (v === undefined ? null : v));
  return JSON.parse(outputObjString) as unknown;
}
