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
 * Given tho points p1 and p2, returns a cooefficient that linearly
 *    aproaches the value of 1 the closer p1 is to p2
 *    aproaches the value of 0 as the distance of p1 & p2 aproaches the cuttOffDistance
 * i.e f(||p1-p2||) = (-1/cutOffDistance) * ||p1 - p2|| + 1 for ||p1-p2|| <= cutOffDistance
 *
 * @param {object} p1 - Object containing x and y coord values
 * @param {object} p2 - Object containing x and y coord values
 * @param {number} cutOffDistance - Distance after which the
 *                                  returned cooefficient is always zero
 *
 * @returns {number} Cooefficient/factor w/ value as specified above
 */
let getMultiplicationFactor = (cutOffDistance, p1, p2) => {
  let distance = euclideanDistance(p1, p2);

  if (distance < cutOffDistance) {
    return ((-1 / cutOffDistance) * distance + 1);
  } else {
    return 0;
  }
}

export {euclideanDistance, getMultiplicationFactor}
