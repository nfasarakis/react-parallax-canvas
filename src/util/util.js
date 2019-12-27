/**
 *
 */
let euclideanDistance = (p1,p2) => {
    let xdiff = Math.pow((p1.x-p2.x),2);
    let ydiff = Math.pow((p1.y-p2.y),2);
   return Math.sqrt( xdiff + ydiff);
}

/**
 * returns number between [0,1] depending on how close p1 is to p2
 * Need to make this an exponential function
 */
let getMultiplicationFactor = (cutOffDistance, p1, p2) => {
  // Calculate euclidean distance between center of rect and mouse mooseCoords
  let distance = euclideanDistance(p1, p2);

  if (distance < cutOffDistance) {
    // Linear increase as centerX approaches mouseCoords.x as long as max difference is < cutOffDistance
    // y = -1/max (centerX - mooseCoords.x) + 1 where max = cutOffDistance
    return ((-1 / cutOffDistance) * distance + 1);
  } else {
    return 0;
  }
}

export {euclideanDistance, getMultiplicationFactor}
