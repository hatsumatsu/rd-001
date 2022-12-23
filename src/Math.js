/**
 * Clamp value
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }

  return value;
}

/**
 * Linear interpolation between to values
 * @param {number} value1 - Range start
 * @param {number} value2 - Range end
 * @param {number} amount - Amount 0...1
 * @returns {number} Interpolated value
 */
function lerp(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;

  return amount === 0
    ? value1
    : amount === 1
    ? value2
    : value1 + (value2 - value1) * amount;
}

/**
 * Map value from one range to another
 * @param {number} value - The value to map
 * @param {Object[]} input - Array of min and max value to map from
 * @param {number} input[0] - Minimum value of input range
 * @param {number} input[1] - Maximum value of input range
 * @param {Object[]} output - Array of min and max value to map to
 * @param {number} output[0] - Minimum value of output range
 * @param {number} output[1] - Maximum value of output range
 * @returns {number} Mapped value
 */
function map(value = 0, input = [0, 0], output = [0, 0]) {
  return (
    ((value - input[0]) * (output[1] - output[0])) / (input[1] - input[0]) +
    output[0]
  );
}

/**
 * Easing functions
 */
const easing = {
  // no easing, no acceleration
  linear: (t) => t,
  // accelerating from zero velocity
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  // decelerating to zero velocity
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  // acceleration until halfway, then deceleration
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  // accelerating from zero velocity
  easeInQuad: (t) => t * t,
  // decelerating to zero velocity
  easeOutQuad: (t) => t * (2 - t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // accelerating from zero velocity
  easeInCubic: (t) => t * t * t,
  // decelerating to zero velocity
  easeOutCubic: (t) => --t * t * t + 1,
  // acceleration until halfway, then deceleration
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity
  easeInQuart: (t) => t * t * t * t,
  // decelerating to zero velocity
  easeOutQuart: (t) => 1 - --t * t * t * t,
  // acceleration until halfway, then deceleration
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // accelerating from zero velocity
  easeInQuint: (t) => t * t * t * t * t,
  // decelerating to zero velocity
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  // acceleration until halfway, then deceleration
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
};

export { clamp, lerp, map, easing };
