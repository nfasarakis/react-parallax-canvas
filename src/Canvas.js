import React from 'react';
import {euclideanDistance} from './util';

/**
 * Properties of images drawn on canvas
 * Includes top, left, width, height and the image url
 * Used for testing (should be passed as props)
 */
const CANVAS_IMAGE_PROPS = [
  {left: 0.2, top: 0.2, w: 200, h: 250, url: '../Assets/Images/boat.jpg'},
  {left: 0.6, top: 0.4, w: 200, h: 250, url: '../Assets/Images/evening.jpg'},
  {left: 0.28, top: 0.83, w: 200, h: 250, url: '../Assets/Images/sunset.jpg'},
  {left: 0.8, top: 0.3, w: 200, h: 250, url: '../Assets/Images/tree1.jpg'},
  {left: 0.9, top: 0.8, w: 200, h: 250, url: '../Assets/Images/tree2.jpg'},
  {left: 0.4, top: 0.25, w: 200, h: 250, url: '../Assets/Images/tree3.jpg'},
  {left: 0.57, top: 0.87, w: 200, h: 250, url: '../Assets/Images/boat.jpg'},
  {left: 0.89, top: 0.1, w: 200, h: 250, url: '../Assets/Images/evening.jpg'},
  {left: 0.12, top: 0.17, w: 200, h: 250, url: '../Assets/Images/sunset.jpg'},
  {left: 0.48, top: 0.74, w: 200, h: 250, url: '../Assets/Images/tree1.jpg'},
  {left: 0.03, top: 0.66, w: 200, h: 250, url: '../Assets/Images/tree2.jpg'},
  {left: 0.68, top: 0.59, w: 200, h: 250, url: '../Assets/Images/tree3.jpg'},
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
    // Used for easing animations in this.draw() method
    this.currentValue = 2000;
    this.speed = 0;
  }

  /**
   * Responsible for the initial drawing of the image on the canvas.
   *
   * @param {object} ctx - A CanvasRenderingContext2D object, providing the draw functions
   *                       See CANVAS API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage
   */
  drawInit(ctx) {
    // Create new image element and draw it on the canvas when it loads
    this.img = new Image();
    this.img.addEventListener('load', () => {
      ctx.drawImage(this.img,
          Math.floor(this.center.x - this.width / 2),
          Math.floor(this.center.y - this.height / 2),
          Math.floor(this.width),
          Math.floor(this.height));
    }, false);
    this.img.src = this.url;
  }

  /**
   * Responsible for drawing an new image on the canvas.
   * The dimensions of the drawn image depend linerly on the distance between
   * the image's center and the currect mouse position.
   *
   * This function is called within an animation loop.
   * Each time the draw() method is called, the image's dimensions
   * animate to the distance-dependant new value using an easing function.
   *
   * This implementation uses "Non-deterministic easing". See this excelent SO post:
   * https://stackoverflow.com/questions/37966505/how-to-rotate-a-canvas-object-following-mouse-move-event-with-easing
   *
   * What this means is that the destination value of the animation is not always known,
   * as it may change due to new user input, therefore deterministic easing cannot be applied
   * In our case users moving the mouse changes destination value (image dimensions)
   * since it depends on the distance between the image center and the mouse coords.
   * As such, the only thing we can really control is the rate of change.
   *
   * Therefore, this method works as follows
   *    1) First it determines the amount of change per time step, called speed.
   *       This value depends on the destinationValue, i.e the distance between the
   *       image's center and the current mouse position.
   *       For simplicity, assume the mouse position (& therefore the destinationValue)
   *       is fixed for now.
   *    2) It then multiplies the speed by an accelaration factor, determines
   *       if the rate of change is positive or negative and adds the speed to the
   *       currentValue tracked by the animation
   *    3) As the currentValue approaches the destinationValue, the image's dimensions animate.
   *       More specifically, the image's dimensions grow to double as the currentValue aproaches
   *       the destinationValue using a linear transformation if the currentValue.
   *    4) If at any point, the destinationValue changes, i.e due to the user moving the
   *       mouse, the speed adjusts dynamically and the proccess loops back to 1)
   *
   *
   * @param {object} ctx - Canvas rendering context, providing the draw functions
   * @param {object} mouseCoords - Current position of the mouse on the 2D canvas
   *                               Object containing x and y coords.
   */
  draw(ctx, mouseCoords) {

    // Value we want to reach as we animate
    let destinationValue = euclideanDistance(this.center, mouseCoords);

    // If the current animation value is equal to the destinationValue, do nothing
    if (Math.round(Math.abs(this.currentValue - destinationValue)) > this.speed) {
      // Compute rate of change based on the destinationValue and currentValue
      // Animation slows down as currentValue approaches destinationValue
      // Note the accelaration factor of 0.1
      this.speed = Math.abs(destinationValue - this.currentValue) * 0.1;
      // Is the rate of change positive or negative?
      let sign = (this.currentValue < destinationValue) ? 1 : -1;
      // Move currentValue towards destinationValue
      this.currentValue = this.currentValue + sign * this.speed;
    }

    // Transform currentValue (expressing distance) into a number in [0,1]
    // If it's greater than cutOffDistance, return zero
    // i.e dimensions do not animate if currentValue is more than 600px away than
    // images center. The choise of 600px is arbitrary
    // NOTE: Maybe ill make this function exponential and remove cutOffDistance
    let cutOffDistance = 600;
    let mFactor = 0;
    if (this.currentValue < cutOffDistance) {
      // Linear f(distance) = (-1 / cutOffDistance) * distance + 1
      //    - As distance aproaches cutOffDistance => f(distance) approaches 0
      //    - As distnce aproaches 0               => f(distance) approaches 1
      mFactor = (-1 / cutOffDistance) * this.currentValue + 1;
    }

    // Compute new width of images based on above linear transformation
    let dynamicWidth = Math.floor(this.width + this.width * mFactor);
    let dynamicHeight = Math.floor(this.height + this.height * mFactor);

    // Draw a new image on the canvas w/ the new dimensions
    ctx.drawImage(this.img,
      Math.floor(this.center.x - dynamicWidth/2),
      Math.floor(this.center.y - dynamicHeight/2),
      dynamicWidth, dynamicHeight);
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


  // Array of elements drawn on canvas
  canvasElements = [];

  // Most recently recorder mouseCoords
   mouseCoords = {
     x: 2000,
     y: 2000.
   }

   // Keep's tack of canvas origin
   canvasOrigin = {
     x: 0,
     y: 0,
   }

  /**
   * Retrieves ref to canvas DOM element via ref callback attached in render()
   * This ref is guaranteed to be up-to-date before lifecycle methods fire.
   *
   * @param {object} element - HTML DOM element the ref callback is attached to
   */
  setCanvasRef = (element) => {
    this.canvas = element
  }

  /**
   * Sets-up images in canvas (initial draw) and starts animation loop
   */
  componentDidMount() {
    let ctx = this.canvas.getContext('2d', { alpha: false });

    // Create & Draw Canvas Images
    CANVAS_IMAGE_PROPS.map((img, idx) => {
        this.canvasElements[idx] = new CanvasImage(
          img.left * this.canvas.width - img.w / 2,
          img.top * this.canvas.height - img.h / 2,
          img.w, img.h, img.url);

        return this.canvasElements[idx].drawInit(ctx);
    });

    // Start animation
    this.animate();

  }

  /**
   * Clears the canvas and re-draws images, animating their dimensions
   * based on the distance of their centers to the mouse position
   */
  animate() {
    let ctx = this.canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Order canvas elements bassed on the distance of their centers from mouseCoords
    // Elements w/ centers closest to mouse Coords get placed at end of array
    this.canvasElements.sort((elem1, elem2) =>
      euclideanDistance(elem2.center, this.mouseCoords) - euclideanDistance(elem1.center, this.mouseCoords)
    )

    // Draw new images by mapping over canvas elements
    // Due to sorting, elements closest to mouse coords get painted over elements
    // that are furter away.
    this.canvasElements.map(elem =>
      elem.draw(ctx, this.mouseCoords)
    );

    // Loop animation
    requestAnimationFrame(()=>this.animate());
  }

  /**
   * MouseMove Event Handler - Retrieve mouse coordinates
   *
   * @param {object} evt - Event object
   */
  handleMouseMove = evt => {
    let canvasBox = this.canvas.getBoundingClientRect();
    this.mouseCoords = {
      x: evt.clientX - canvasBox.left,
      y: evt.clientY - canvasBox.top
    };
  }

  /**
   * Click Event Handler (on canvas)
   *
   * Elements drawn on canvas don't fire click events.
   * Therefore, a click is registered on the canvas and the region clicked
   * is checked against the regions of all drawn elements.
   * The closest matched element fires its onClick() method
   *
   * @param {object} evt - Event object
   */
  handleCanvasClick = (evt) => {

    // Loop over all canvas elements and retrieve their regions
    // If the mouse coords are withing image's region, it's been clicked
    let clickedElements = this.canvasElements.filter(elem => {
      // When calculating the regions, also consider their dynamic dimensions.
      // Each images dimension is altered in their draw() method
      // Therefore, compute the region using these altered dimensions (see draw())
      let cutOffDistance = 600;
      let mFactor = 0;
      if (elem.currentValue < cutOffDistance) {
        mFactor = ((-1 / cutOffDistance) * elem.currentValue + 1);
      }
      let dynamicWidth = Math.floor(elem.width + elem.width * mFactor);
      let dynamicHeight = Math.floor(elem.height + elem.height * mFactor);

      // Is the mouse within the image's region?
      return this.mouseCoords.x > elem.center.x - dynamicWidth / 2 &&
             this.mouseCoords.x < elem.center.x + dynamicWidth / 2 &&
             this.mouseCoords.y > elem.center.y - dynamicHeight / 2 &&
             this.mouseCoords.y < elem.center.y + dynamicHeight /2
    });

    // The clickedElements array may contain multiple entries as images may overlap in the canvas.
    // However the this.canvasElements array that was filtered to obtain the clickedElements
    // has element already ordered from farther to closest to the mouseCoords (see this.animate())
    // Select the last element
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
