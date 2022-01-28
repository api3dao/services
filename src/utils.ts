// TODO: Finalize and publish this package on npm and import it here
export type GoResultSuccess<T> = [null, T];
export type GoResultError<E = Error> = [E, null];
export type GoResult<T, E = Error> = GoResultSuccess<T> | GoResultError<E>;
export const GO_ERROR_INDEX = 0;
export const GO_RESULT_INDEX = 1;

export const successFn = <T>(value: T): [null, T] => [null, value];
export const errorFn = <E = Error>(err: E): [E, null] => [err, null];

export const goSync = <T>(fn: () => T): GoResult<T> => {
  try {
    return successFn(fn());
  } catch (err) {
    return errorFn(err as Error);
  }
};

export const go = async <T>(fn: Promise<T> | (() => Promise<T>)): Promise<GoResult<T>> => {
  // We need try/catch because `fn` might throw sync errors as well
  try {
    if (typeof fn === 'function') {
      return fn().then(successFn).catch(errorFn);
    }
    return fn.then(successFn).catch(errorFn);
  } catch (err) {
    return errorFn(err as Error);
  }
};

export const isGoSuccess = <T, E>(result: GoResult<T, E>): result is GoResultSuccess<T> => !result[GO_ERROR_INDEX];

export const rethrowError = (error: Error) => {
  throw error;
};

// NOTE: This needs to be written using 'function' syntax (cannot be arrow function)
// See: https://github.com/microsoft/TypeScript/issues/34523#issuecomment-542978853
export function assertGoSuccess<T>(result: GoResult<T>, onError = rethrowError): asserts result is GoResultSuccess<T> {
  if (result[0]) {
    onError(result[0]);
  }
}
