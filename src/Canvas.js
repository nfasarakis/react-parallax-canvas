import React from 'react';
import {euclideanDistance, getMultiplicationFactor} from './util';

/**
 * Properties of images drawn on canvas
 * Includes top, left, width, height and the image url
 * Used for testing (should be passed as props)
 */
const CANVAS_IMAGE_PROPS = [
  {left: 0.2, top: 0.2, w: 200, h: 250, url: '../Assets/Images/boat.jpg'},
  {left: 0.5, top: 0.5, w: 200, h: 250, url: '../Assets/Images/evening.jpg'},
  {left: 0.3, top: 0.8, w: 200, h: 250, url: '../Assets/Images/sunset.jpg'},
  {left: 0.8, top: 0.3, w: 200, h: 250, url: '../Assets/Images/tree1.jpg'},
  {left: 0.9, top: 0.8, w: 200, h: 250, url: '../Assets/Images/tree2.jpg'},
  {left: 0.4, top: 0.4, w: 200, h: 250, url: '../Assets/Images/tree3.jpg'},
]

/**
 * Class for images drawn on screen
 */
class CanvasImage {

  /**
   *
   */
  constructor(left, top, width, height, url) {
    this.width = width;
    this.height = height;
    this.url = url;
    this.center = {
      x: left + width / 2,
      y: top + height / 2,
    }
  }

  /**
   *
   */
  drawInit(ctx) {
    // Create new img element
    this.img = new Image();
    // Attach onload handler
    this.img.addEventListener('load', () => {
      ctx.drawImage(this.img, this.center.x - this.width / 2, this.center.y - this.height / 2, this.width, this.height);
    }, false);
    // Set source
    this.img.src = this.url; // Set source path

    // Draw rectangle center (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.center.x-3, this.center.y-3, 6, 6);
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

    // Create new img element
    ctx.drawImage(this.img, this.center.x - dynamicWidth/2, this.center.y - dynamicHeight/2, dynamicWidth, dynamicHeight);


    // Draw rectangle center (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.center.x-3, this.center.y-3, 6, 6);
  }

  /**
   *
   */
  onClick() {
    alert(`clicked ${this.url}`);
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
   * Array of elements drawn on canvas
   */
   canvasElements = [];

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

    // Create & Draw Canvas Images
    CANVAS_IMAGE_PROPS.map((img, idx) => {
        this.canvasElements[idx] = new CanvasImage(
          img.left * this.canvas.width - img.w / 2,
          img.top * this.canvas.height - img.h / 2,
          img.w, img.h, img.url);

        return this.canvasElements[idx].drawInit(ctx);
    })
  }

  /**
   *
   */
  getMouseCoords = evt => {
    let canvasBox = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - canvasBox.left,
      y: evt.clientY - canvasBox.top
    };
  }

  /**
   * Should perform animation
   * REQUESTANIMATIONFRAME????
   */
  handleMouseMove = evt => {
    let ctx = this.canvas.getContext('2d');
    let mouseCoords = this.getMouseCoords(evt);

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Order canvas elements bassed on their centers distance from mouseCoords
    // Elements w/ centers closest to mouse Coords get placed at end of array
    // This is so they are always painted on top of elements that are further away
    this.canvasElements.sort((elem1, elem2) =>
      euclideanDistance(elem2.center, mouseCoords) - euclideanDistance(elem1.center, mouseCoords)
    )

    // Draw new rectangles
    this.canvasElements.map(elem =>
      elem.draw(ctx, this.prevMouseCoords, mouseCoords)
    );

    // Store new mouse coords for use in next onMouseMove event
    this.prevMouseCoords = mouseCoords;

  }

  /**
   *
   */
  handleCanvasClick = (evt) => {
    // Find what element was clicked on
    let mouseCoords = this.getMouseCoords(evt);

    // If mouse coords is withing images bounds, it's been clicked
    // Loop over canvas elements
    let clickedElements = this.canvasElements.filter(elem => {
      // When calculating bounds, also factor in mFactor
      let mFactor = getMultiplicationFactor(300, elem.center, mouseCoords);
      let dynamicWidth = elem.width + elem.width * mFactor;
      let dynamicHeight = elem.height + elem.height * mFactor;

      return mouseCoords.x > elem.center.x - dynamicWidth / 2 &&
      mouseCoords.x < elem.center.x + dynamicWidth / 2 &&
      mouseCoords.y > elem.center.y - dynamicHeight / 2 &&
      mouseCoords.y < elem.center.y + dynamicHeight /2
    });

    // For overlapping elements, execute click handler for the one whose
    // center is clossest to the mouse coords
    // clickedElements already sorted since this.canvasElements are sorted
    clickedElements.length > 0 && clickedElements[clickedElements.length - 1].onClick();

  }


  render() {
    return (
      <canvas id = 'parallax-canvas'
              onMouseMove = {this.handleMouseMove}
              onClick = {this.handleCanvasClick}
              ref = {this.setCanvasRef}
              width = {window.innerWidth}
              height = {window.innerHeight}>
      </canvas>
    );
  }
}
