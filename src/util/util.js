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

export {euclideanDistance}
