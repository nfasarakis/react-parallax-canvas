import React from 'react';

/**
 * Move to util file
 */
let euclideanDistance = (p1,p2) => {
    let xdiff = Math.pow((p1.x-p2.x),2);
    let ydiff = Math.pow((p1.y-p2.y),2);
   return Math.sqrt( xdiff + ydiff);
}

/**
 * Move to util file
 * returns number between [0,1] depending on how close p1 is to p2
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

/**
 * Class for rectanges drawn on screen
 */
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.center = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }
  }
}

/**
 *
 */
export default class Canvas extends React.Component {

  /**
   * Retrieves ref to canvas DOM element via ref callback
   */
  setCanvasRef = (element) => {
    this.canvas = element
  }

  /**
   * Should set-up elements/shapes in canvas
   */
  componentDidMount() {
    // Draw function
    let ctx = this.canvas.getContext('2d');

    // Create Rectange (add to data struct later)
    this.rect = new Rectangle(0.5 * this.canvas.width - 70, 0.5 * this.canvas.height - 100, 140, 200);

    // Draw Rectangle(s)
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }

  /**
   *
   */
  getMouseCoords = evt => {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  /**
   * Should perform animation
   */
  handleMouseMove = evt => {
    let ctx = this.canvas.getContext('2d');
    let mouseCoords = this.getMouseCoords(evt);

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Get distance-related multiplication factor
    // The closer the mouse Coords are to the center, the closer the factor to 1
    let mFactor = getMultiplicationFactor(300, this.rect.center, mouseCoords)

    // Draw rectangle (around it's center) with dimensions depending on how close
    // the mouse is to said center using the mFactor
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(this.rect.center.x - (this.rect.width + this.rect.width * mFactor)/2,
                 this.rect.center.y - (this.rect.height + this.rect.height * mFactor)/2,
                 this.rect.width + this.rect.width * mFactor,
                 this.rect.height + this.rect.height * mFactor);

    // Draw rectangle center (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.rect.center.x, this.rect.center.y, 2, 2);

    // Draw mouse rectangle
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(mouseCoords.x, mouseCoords.y, 10, 10);
  }


  render() {
    return (
      <canvas id = 'parallax-canvas'
              onMouseMove = {this.handleMouseMove}
              ref = {this.setCanvasRef}
              width = {window.innerWidth}
              height = {window.innerHeight}>
      </canvas>
    );
  }
}
