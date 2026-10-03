/**
 * Higher-order async handler wrapper for Express routes.
 * Catches rejected promises and forwards errors to centralized errorHandler middleware.
 *
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express route handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
