import React from 'react';
import {euclideanDistance, getEasing} from './util';

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
 * @class representing images drawn on screen
 *  Each instance holds all positional data & methods necessary to draw and
 *  animate an image on an HTML5 canvas using the drawImage() method from the canvas API
 *  See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 */
class CanvasImage {

  /**
   * Represents an image and all positional data needed for painting on an HTML5 canvas
   * Also initializes data used for easing image animations
   * @constructor
   *
   * @param {number} left - Image's left corner (in px) relative to the canvas origin
   * @param {number} top -  Image's top corner (in px) relative to the canvas origin
   * @param {number} width - Width (in px) the image will occupy in the canvas
   * @param {number} height - Height (in px) the imge will occupy in the canvas
   * @param {string} url - Source of the image
   */
  constructor(left, top, width, height, url) {
    this.width = width;
    this.height = height;
    this.url = url;
    this.center = {
      x: left + width / 2,
      y: top + height / 2,
    }
    /* Used for easing animations in the draw() method */
    this.currentValue = 2000;
    this.speed = 0;
  }

  /**
   * Loads & draws an image on the canvas without animations
   *
   * @param {object} ctx - Canvas rendering context object
   */
  drawInit(ctx) {
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
   * Redraws an image on the canvas while animating the image's dimensions.
   * The dimensions of the drawn image depend linerly on the distance between
   * the image's center and the mouse position. The closer the mouse gets to
   * the image's center, the more the image's dimensions grow (up to 2x size)
   *
   * This function is called within an animation loop. At each time step,
   * the image's dimensions slowly animate towards their final value using an easing function.
   * Try moving the mouse. You'll notice the animation lingers even after the mouse
   * stops moving, offering a smoother experience.
   *
   * @param {object} ctx - Canvas rendering context object
   * @param {object} mouseCoords - Object containing x and y coords of the mouse
   *                               relative to the canvas origin
   */
  draw(ctx, mouseCoords) {

    // Value we want to reach as we animate - Expresses distance
    let dest = euclideanDistance(this.center, mouseCoords);
    // Value at current time step - Expresses distance
    let curr = this.currentValue;
    // Current rate of change
    let speed = this.speed;
    // Accelaration coefficient
    let acc_coef = 0.05;
    // Function used to compare how close the currect value is to the destination value
    let compareFunction = (a,b) => Math.abs(a - b);
    // Apply easing
    [this.currentValue, this.speed] = getEasing(dest, curr, speed, acc_coef, compareFunction);

    // Linearly interpolate currentValue from [cutOffDistance, 0] to [0,1]
    // where cutOffDistance = 600px (for performance reasons)
    // Linear f(distance) = (-1 / cutOffDistance) * distance + 1
    let cutOffDistance = 600;
    let mFactor = (-1 / cutOffDistance) * this.currentValue + 1;
    if (this.currentValue > cutOffDistance) { mFactor = 0;}

    // Compute new width of images based on above linear transformation
    let width = Math.floor(this.width + this.width * mFactor);
    let height = Math.floor(this.height + this.height * mFactor);

    // Draw a new image on the canvas w/ the new dimensions
    ctx.drawImage(this.img, this.center.x - width/2, this.center.y - height/2, width, height);
  }

  /**
   * Fires when region occupied by the image in the canvas is clicked
   */
  onClick() {
    alert(`clicked ${this.url}`);
  }

}

/**
 * @class component that renders an HTML5 canvas covering the entire screen
 * @extends React.Component
 */
export default class Canvas extends React.Component {


  /**
   * @instance {array} - Contains all elements currently drawn on the canvas
   */
  canvasElements = [];

  /**
   * @typedef {object} mouseCoords
   * @instance {object} - Contains the most recent mouse position as well as
   *                      the total relative distance the mouse has traveled
   *                      in the X and Y axises
   */
   mouseCoords = {
     x: 2000,
     y: 2000,
     totalMovementX: 0,
     totalMovementY: 0,
   }

   /**
    * @instance {object} - Contains the previous position of the mouse
    *                      before the last update to {@link mouseCoords}
    */
   prevMouseCoords = {
     x: undefined,
     y: undefined,
   }

   /**
    * @instance {object} - Contains data used for easing canvas origin animations
    *                      in {@link Canvas#animate}
    *
    * @param {number} currentLeft - Most up-to-date value of the left-most point of the canvas
    * @param {number} speedLeft - Rate of change of the left-most point of the canvas
    * @param {number} currentTop - Most up-to-date value of the top-most point of the canvas
    * @param {number} speedTop - Rate of change of the left-most point of the canvas
    * @param {number} coefficient - Controls impact of animation in {@link Canvas#animate}
    */
   origin = {
     currentLeft: 0,
     speedLeft: 0,
     currentTop: 0,
     speedTop: 0,
     coefficient: 1/4,
   }

   /**
    * @instance {number} - The ID of the last requested animation frame retrieved
    *                      via requestAnimationFrame. Used for cleanup
    */
   animationID = undefined;

  /**
   * Retrieves ref to canvas DOM element via ref callback attached in render()
   * This ref is guaranteed to be up-to-date before lifecycle methods fire.
   *
   * @param {object} element - HTML DOM element the ref callback is attached to
   */
  setCanvasRef = (element) =>
    this.canvas = element

  /**
   * Clears the canvas completelly
   *
   * @param {object} ctx - Canvas rendering context object
   */
   clearCanvas = (ctx) => {
     ctx.save();
     ctx.globalCompositeOperation = 'copy';
     ctx.strokeStyle = 'transparent';
     ctx.beginPath();
     ctx.lineTo(0, 0);
     ctx.stroke();
     ctx.restore();
   }

  /**
   * Clears the canvas and applies a paralax effect by animating the canvas's origin,
   * based on the current mouse coordinates.
   * It then re-draws images, animating their dimensions based on the distance of
   * their centers to the mouse position - see {@link CanvasImage#draw} method
   *
   * At each time step, the canva's origin animates towards its final value using
   * an easing function. Try moving the mouse and you'll notice the animation
   * lingers even after the mouse stops moving, offering a smoother experience.
   */
  animate() {
    let ctx = this.canvas.getContext('2d');

    // Clear canvas
    this.clearCanvas(ctx);

    // Destination values for canva's origin in the x and y plane resp.
    let destLeft = this.mouseCoords.totalMovementX;
    let destTop = this.mouseCoords.totalMovementY;
    // Values at current time step
    let currLeft = this.origin.currentLeft;
    let currTop = this.origin.currentTop;
    // Rate of change at current time step
    let speedLeft = this.origin.speedLeft;
    let speedTop = this.origin.speedTop;
    // Accelaration coefficient
    let acc_coef = 0.05;
    // Function used to compare how close the currect value is to the destination value
    let compareFunction = (a,b) => Math.abs(a - b);

    // Apply easing and store results for next loop
    [this.origin.currentLeft, this.origin.speedLeft] =
      getEasing(destLeft, currLeft, speedLeft, acc_coef, compareFunction);
    [this.origin.currentTop, this.origin.speedTop] =
      getEasing(destTop, currTop, speedTop, acc_coef, compareFunction);


    // Translate canvas to it's new position
    // Move in the opposite direction of the mouse by a factor of origin.coefficient
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(
      Math.floor(-this.origin.currentLeft * this.origin.coefficient),
      Math.floor(-this.origin.currentTop * this.origin.coefficient),
    );

    // Apply changes to mouseCoords so they match the new translated canvas origin
    // ! Do not directly modify mouseCoords instance
    let translatedMouseCoords = {
      x: this.mouseCoords.x + Math.floor(this.origin.currentLeft * this.origin.coefficient),
      y: this.mouseCoords.y + Math.floor(this.origin.currentTop * this.origin.coefficient),
    };

    // Order canvas elements bassed on the distance of their centers from the translated mouseCoords
    // Elements w/ centers closest to translated mouse Coords get placed at end of array
    this.canvasElements.sort((elem1, elem2) =>
      euclideanDistance(elem2.center, translatedMouseCoords) - euclideanDistance(elem1.center, translatedMouseCoords)
    )

    // Draw new images by mapping over the sorted canvas elements
    // Elements closest to the translated mouse coords get painted over elements
    // that are furter away.
    this.canvasElements.map(elem =>
      elem.draw(ctx, translatedMouseCoords)
    );

    // Loop animation and store its id
    this.animationID = requestAnimationFrame(()=>this.animate());
  }

  /**
   * MouseMove Event Handler - Retrieve mouse coordinates and movement
   * Note: For the mouse movement, evt.movementX & evt.movementY are not used sinse
   * they seem to behave randomly for sudden mouse movements.
   *
   * @param {object} evt - Event object
   */
  handleMouseMove = evt => {
    let canvasBox = this.canvas.getBoundingClientRect();

    // Current mouse coords
    let mx = evt.clientX - canvasBox.left;
    let my = evt.clientY - canvasBox.top;

    // First time mouse moved
    if (this.prevMouseCoords.x === undefined & this.prevMouseCoords.y === undefined) {
      this.prevMouseCoords.x = mx;
      this.prevMouseCoords.y = my;
    }

    // Store coordinates and update total movement
    this.mouseCoords = {
      x: mx,
      y: my,
      totalMovementX: this.mouseCoords.totalMovementX + (mx - this.prevMouseCoords.x),
      totalMovementY: this.mouseCoords.totalMovementY + (my - this.prevMouseCoords.y),
    };

    // Movement has been calculated so update previous mouse coords
    this.prevMouseCoords = {
      x: mx,
      y: my,
    }
  }

  /**
   * Click Event Handler (on canvas)
   *
   * Elements drawn on canvas don't fire click events (they're just pixels!).
   * Therefore, a click is registered on the canvas and the region clicked
   * is checked against the regions of all drawn elements.
   * The closest matched element fires its onClick() method
   *
   * @param {object} evt - Event object
   */
  handleCanvasClick = (evt) => {

    // Apply changes to mouseCoords so they match translated canvas origin
    // See animate() function
    let translatedMouseCoords = {
      x: this.mouseCoords.x + Math.floor(this.origin.currentLeft * this.origin.coefficient),
      y: this.mouseCoords.y + Math.floor(this.origin.currentTop * this.origin.coefficient),
    };

    let clickedElements = this.canvasElements.filter(elem => {
      // When calculating the regions, also consider their dynamic dimensions.
      // Each images dimension is altered in their draw() method. See draw()
      let cutOffDistance = 600;
      let mFactor = (-1 / cutOffDistance) * elem.currentValue + 1;
      if (elem.currentValue > cutOffDistance) { mFactor = 0;}
      let width = Math.floor(elem.width + elem.width * mFactor);
      let height = Math.floor(elem.height + elem.height * mFactor);

      // Is the mouse within the image's region?
      return translatedMouseCoords.x > elem.center.x - width / 2 &&
             translatedMouseCoords.x < elem.center.x + width / 2 &&
             translatedMouseCoords.y > elem.center.y - height / 2 &&
             translatedMouseCoords.y < elem.center.y + height /2
    });

    // The clickedElements array may contain multiple entries as images may overlap in the canvas.
    // However the this.canvasElements array that was filtered to obtain the clickedElements
    // has element already ordered - see this.animate(). Select last element.
    clickedElements.length > 0 && clickedElements[clickedElements.length - 1].onClick();
  }

  /**
   * Perfoms the initial draw on the canvas using {@link CanvasImage#drawInit}
   * and starts the animation loop {@link animate()}
   */
  componentDidMount() {
    let ctx = this.canvas.getContext('2d', { alpha: false });

    CANVAS_IMAGE_PROPS.forEach((img, idx) => {
        this.canvasElements[idx] = new CanvasImage(
          img.left * this.canvas.width - img.w / 2,
          img.top * this.canvas.height - img.h / 2,
          img.w, img.h, img.url);

        this.canvasElements[idx].drawInit(ctx);
    });

    this.animate();
  }

  /**
   * Cancels the animation loo performed in {@link animate()}
   */
  componentWillUnmount() {
    cancelAnimationFrame(this.animationID);
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
