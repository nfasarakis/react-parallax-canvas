/**
 * Calculates the Euclidean distance between two 2D points
 *
 * @param {object} p1 - Object containing x and y coord values
 * @param {object} p2 - Object containing x and y coord values
 *
 * @returns The Euclidean distance between points p1 and p2, ||p1-p2||
 */
let euclideanDistance = (p1,p2) => {
    let xdiff = Math.pow((p1.x-p2.x),2);
    let ydiff = Math.pow((p1.y-p2.y),2);
   return Math.sqrt( xdiff + ydiff);
}

/**
 * Non deterministic easing
 * https://stackoverflow.com/questions/37966505/how-to-rotate-a-canvas-object-following-mouse-move-event-with-easing
 *
 * Unlike deterministic easing, where ...
 */
let applyNonDeterministicEaseOut = (destinationValue, currentValue, speed, accelaration_coefficient, compareFunction) => {

  // If the current animation value is equal to the destinationValue, do nothing
  if (compareFunction(currentValue, destinationValue) - speed > accelaration_coefficient) {
    // Compute rate of change based on the destinationValue and currentValue
    // Animation slows down as currentValue approaches destinationValue
    speed = compareFunction(currentValue, destinationValue) * accelaration_coefficient;
    // Is the rate of change positive or negative?
    let sign = (currentValue < destinationValue) ? 1 : -1;
    // Move currentValue towards destinationValue
    currentValue += sign * speed;
  }
  return [currentValue, speed];

}

export {euclideanDistance, applyNonDeterministicEaseOut}
