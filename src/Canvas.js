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
 * Each instance holds all positional data & methods necessary to draw an image
 * on the canvas using the drawImage() method from the canvas API
 * See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 */
class CanvasImage {

  /**
   * @param {number} left - left corner in px of the image to be painted within the canvas
                            expressed relative to the canvas origin
   * @param {number} top -  top corner in px of the image to be painted within the canvas,
   *                        expressed relative to the canvas dimensions
   * @param {number} width - Width in px of the image to be painted within the canvas
   * @param {number} height - Height in px of the imge to be painted within the canvas
   * @param {string} url - string URL, image source
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
   * Responsible for the initial drawing of the image on the canvas.
   * Used in componentDidMount() lifecycle method
   *
   * @param {object} ctx - See CANVAS API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage
   *                       A CanvasRenderingContext2D object, providing the draw functions
   */
  drawInit(ctx) {
    // Create new img element and draw it on the canvas when it loads
    this.img = new Image();
    this.img.addEventListener('load', () => {
      ctx.drawImage(this.img, this.center.x - this.width / 2, this.center.y - this.height / 2, this.width, this.height);
    }, false);
    this.img.src = this.url;

    // Draw a rectangle at the center of the image (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.center.x-3, this.center.y-3, 6, 6);
  }

  /**
   * Responsible for drawing an new image on the canvas whenever the mouse moves
   *
   * To achieve a parallax effect, the image's center moves linearly in the opposite
   *    direction of the mouse movement by a factor of 1/6 & 1/8 on the x and y axis resp.
   * The width and height of the drawn image grow linearly as the mouse approaches the
   *    center of the image
   *
   * @param {object} ctx - Canvas rendering context, providing the draw functions
   * @param {object} prevMouseCoords - The last recorded position of the mouse on
   *                                   the 2D canvas. Object containing x and y coords
   * @param {object} mouseCoords - Current position of the mouse on the 2D canvas
   *                               Object containing x and y coords.
   */
  draw(ctx, prevMouseCoords, mouseCoords) {

    // Parallax Effect: Move center of image in opposite direction of mouse movement
    if (prevMouseCoords.x !== 0 && prevMouseCoords.y !== 0) {
      this.center.x = this.center.x + (mouseCoords.x - prevMouseCoords.x)/6;
      this.center.y = this.center.y + (mouseCoords.y - prevMouseCoords.y)/8;
    }

    // The closer the mouse is to the image's center, the larger the image dimensions
    // This is achieved by computing a multiplication factor that
    //    1) is 1 when the mouse coordinates become equal to the images center
    //    2) decreases linearly as the distance between mouse and image center grows,
    //       reaching zero when the distance becomes larger than 300px (cuttOffDistance)
    let mFactor = getMultiplicationFactor(300, this.center, mouseCoords)
    let dynamicWidth = this.width + this.width * mFactor;
    let dynamicHeight = this.height + this.height * mFactor;

    // Draw a new image on the canvas around the new center w/ the new dimensions
    ctx.drawImage(this.img, this.center.x - dynamicWidth/2, this.center.y - dynamicHeight/2, dynamicWidth, dynamicHeight);


    // Draw rectangle center (for testing)
    ctx.fillStyle = 'rgb(40, 0, 0)';
    ctx.fillRect(this.center.x-3, this.center.y-3, 6, 6);
  }

  /**
   * Fires when region occupied by the image in the canvas is clicked
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
   * Holds last recorded mouse coordinates in the 2D canvas
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
   * Sets-up images in canvas - Initial draw
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
   * Retrieves mouse coordinates within canvas
   *
   * @param {object} evt - Event object, retrieved on click
   * @returns {object} Object containing x and y coords on mouse within the canvas
   */
  getMouseCoords = evt => {
    let canvasBox = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - canvasBox.left,
      y: evt.clientY - canvasBox.top
    };
  }

  /**
   * MouseMove Event Handler
   *
   * Computes mouse position and uses it to re-draw images on canvas
   * Each images position and dimension depend on said mouse position
   * in a way that creates a parallax and scalling effect as determined
   * in each image instance draw() menthod.
   *
   * @param {object} evt - Event object
   * REQUESTANIMATIONFRAME????
   */
  handleMouseMove = evt => {
    let ctx = this.canvas.getContext('2d');
    let mouseCoords = this.getMouseCoords(evt);

    requestAnimationFrame(() => {
      // Clear canvas
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Order canvas elements bassed on the distance of their centers from mouseCoords
      // Elements w/ centers closest to mouse Coords get placed at end of array
      this.canvasElements.sort((elem1, elem2) =>
        euclideanDistance(elem2.center, mouseCoords) - euclideanDistance(elem1.center, mouseCoords)
      )

      // Draw new images by mapping over canvas elements
      // Due to sorting, elements closest to mouse coords get painted over elements
      // that are furter away.
      this.canvasElements.map(elem =>
        elem.draw(ctx, this.prevMouseCoords, mouseCoords)
      );
    })

    // Store new mouse coords for use in next onMouseMove event
    this.prevMouseCoords = mouseCoords;

  }

  /**
   * Click Event Handler (on canvas)
   *
   * Elements drawn on canvas don't fire click events.
   * Therefore, a click is registered on the canvas and the region clicked
   * is checked against the regions of all drawn elements.
   * The closest matched element fires it's onClick() method
   *
   * @param {object} evt - Event object
   */
  handleCanvasClick = (evt) => {
    let mouseCoords = this.getMouseCoords(evt);

    // Loop over all canvas elements and retrieve their regions
    // If the mouse coords are withing image's region, it's been clicked
    let clickedElements = this.canvasElements.filter(elem => {
      // When calculating the regions, also consider the mFactor.
      // The mFactor used in draw() alters the image's dimensios, hence it's region
      let mFactor = getMultiplicationFactor(300, elem.center, mouseCoords);
      let dynamicWidth = elem.width + elem.width * mFactor;
      let dynamicHeight = elem.height + elem.height * mFactor;

      return mouseCoords.x > elem.center.x - dynamicWidth / 2 &&
      mouseCoords.x < elem.center.x + dynamicWidth / 2 &&
      mouseCoords.y > elem.center.y - dynamicHeight / 2 &&
      mouseCoords.y < elem.center.y + dynamicHeight /2
    });

    // The clickedElements array may contain multiple entries as images may overlap in the canvas.
    // Since filtered this.canvasElements array is ordered from farther to closest to the mouseCoords,
    //     so is the clickedElements array.
    // The last element of either array is the closest to the mouse coords, so consider
    // last element of clickedElements as the one that's actually clicked.
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
