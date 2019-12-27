import React from 'react';
import {getMultiplicationFactor} from './util';

/**
 * Class for rectanges drawn on screen
 */
class Rectangle {

  /**
   *
   */
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

  /**
   * Given previous & current mouse Pos, draw Rect on canvas
   * Center moves linearly with mousePos by specific factors
   * Width and height grow linearly as mouse approaches center of rectangle
   */
  draw(ctx, prevMouseCoords, mouseCoords) {
    // Move new center in opposite direction of mouse movement
    // Move by 1/6 * X difference and 1/8 Y difference in mouse position
    if (prevMouseCoords.x !== 0 && prevMouseCoords.y !== 0) {
      this.center.x = this.center.x - (mouseCoords.x - prevMouseCoords.x)/6;
      this.center.y = this.center.y - (mouseCoords.y - prevMouseCoords.y)/8;
    }

    // Get distance-related multiplication factor
    // The closer the mouse Coords are to the center, the closer the factor to 1
    let mFactor = getMultiplicationFactor(300, this.center, mouseCoords)

    // Draw rectangle (around it's center) with dimensions depending on how close
    // the mouse is to said center using the mFactor
    let dynamicWidth = this.width + this.width * mFactor;
    let dynamicHeight = this.height + this.height * mFactor;
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(this.center.x - dynamicWidth/2, this.center.y - dynamicHeight/2, dynamicWidth, dynamicHeight);

    // Draw rectangle center (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.center.x-3, this.center.y-3, 6, 6);
  }
}

/**
 *
 */
export default class Canvas extends React.Component {

  /**
   * Holds mouse coords from previous animation cycle
   */
  prevMouseCoords = {
    x: 0,
    y: 0,
  }

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

    // Draw new rectangle
    this.rect.draw(ctx, this.prevMouseCoords, mouseCoords);

    // Store new mouse coords for use in next onMouseMove event
    this.prevMouseCoords = mouseCoords;

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
