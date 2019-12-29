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
   * This function is called within an animation loop. At each time step,
   * the image's dimensions slowly animate towards their final value using an easing function.
   * Try moving the mouse. You'll notice the animation lingers even after the mouse
   * stops moving, offering a smoother experience.
   *
   * @param {object} ctx - Canvas rendering context, providing the draw functions
   * @param {object} mouseCoords - Current position of the mouse on the 2D canvas
   *                               Object containing x and y coords.
   */
  draw(ctx, mouseCoords) {

    // Value we want to reach as we animate
    let dest = euclideanDistance(this.center, mouseCoords);
    // Value at current time step
    let curr = this.currentValue;
    // Current rate of change
    let speed = this.speed;
    // Accelaration coefficient
    let acc_coef = 0.05;
    // Function used to compare how close the currect value is to the destination value
    let compareFunction = (a,b) => Math.abs(a - b);
    // Apply easing
    [this.currentValue, this.speed] = getEasing(dest, curr, speed, acc_coef, compareFunction);

    // Transform currentValue (expressing distance) into a number in [0,1]
    let cutOffDistance = 600;
    let mFactor = 0;
    if (this.currentValue < cutOffDistance) {
      // Linear f(distance) = (-1 / cutOffDistance) * distance + 1
      //    - As distance aproaches cutOffDistance => f(distance) approaches 0
      //    - As distance aproaches 0               => f(distance) approaches 1
      mFactor = (-1 / cutOffDistance) * this.currentValue + 1;
    }

    // Compute new width of images based on above linear transformation
    let dynamicWidth = Math.floor(this.width + this.width * mFactor);
    let dynamicHeight = Math.floor(this.height + this.height * mFactor);


    // Draw a new image on the canvas w/ the new dimensions
    ctx.drawImage(this.img,
      (this.center.x - dynamicWidth/2),
      (this.center.y - dynamicHeight/2),
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

  // Most recently recorded mouse coordinates
   mouseCoords = {
     x: 2000,
     y: 2000,
     // Total mouse movement
     totalMovementX: 0,
     totalMovementY: 0,
   }
   // Prev value of mouse coordinates
   prevMouseCoords = {
     x: undefined,
     y: undefined,
   }

   // Object containing properties used for paralax animation
   // Rename to left and top
   parallax = {
     currentOffsetX: 0,
     speedOffsetX: 0,
     currentOffsetY: 0,
     speedOffsetY: 0,
     coefficient: 1/4,
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

  //
  // DONT FORGET TO KILL ANIMATION!!!!
  //
  componentWillUnmount() {
    alert('You forgot to kill the animation');
  }

  /**
   * Clears the canvas and applies a paralax effect by animating the canvas's origin,
   * based on the current mouse coordinates.
   * It then re-draws images, animating their dimensions based on the distance of
   * their centers to the mouse position - see draw() method
   *
   * This function is called within an animation loop. At each time step,
   * the canva's origin animates towards its final value using an easing function.
   * Try moving the mouse. You'll notice the animation lingers even after the mouse
   * stops moving, offering a smoother experience.
   */
  animate() {
    let ctx = this.canvas.getContext('2d');

    // Clear canvas
    ctx.save();
    ctx.globalCompositeOperation = 'copy';
    ctx.strokeStyle = 'transparent';
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();

    // Destination values for canva's origin in the x and y plane resp.
    let destLeft = this.mouseCoords.totalMovementX;
    let destTop = this.mouseCoords.totalMovementY;
    // Values at current time step
    let currLeft = this.parallax.currentOffsetX;
    let currTop = this.parallax.currentOffsetY;
    // Rate of change at current time step
    let speedLeft = this.parallax.speedOffsetX;
    let speedTop = this.parallax.speedOffsetY;
    // Accelaration coefficient
    let acc_coef = 0.05;
    // Function used to compare how close the currect value is to the destination value
    let compareFunction = (a,b) => Math.abs(a - b);

    // Apply easing and store results for next loop
    [this.parallax.currentOffsetX, this.parallax.speedOffsetX] =
      getEasing(destLeft, currLeft, speedLeft, acc_coef, compareFunction);
    [this.parallax.currentOffsetY, this.parallax.speedOffsetY] =
      getEasing(destTop, currTop, speedTop, acc_coef, compareFunction);


    // Translate canvas to it's new position that depends on the mouseCoords
    // Move in the opposite direction of the mouse by a factor of parallax.coefficient
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(
      Math.floor(-this.parallax.currentOffsetX * this.parallax.coefficient),
      Math.floor(-this.parallax.currentOffsetY * this.parallax.coefficient),
    );

    // Apply changes to mouseCoords so they match new canvas origin
    // ! Do not directly modify mouseCoords instance
    let translatedMouseCoords = {
      x: this.mouseCoords.x + Math.floor(this.parallax.currentOffsetX * this.parallax.coefficient),
      y: this.mouseCoords.y + Math.floor(this.parallax.currentOffsetY * this.parallax.coefficient),
    };

    // Order canvas elements bassed on the distance of their centers from the translated mouseCoords
    // Elements w/ centers closest to translated mouse Coords get placed at end of array
    this.canvasElements.sort((elem1, elem2) =>
      euclideanDistance(elem2.center, translatedMouseCoords) - euclideanDistance(elem1.center, translatedMouseCoords)
    )

    // Draw new images by mapping over canvas elements
    // Due to sorting, elements closest to the translated mouse coords get
    // painted over elements that are furter away.
    this.canvasElements.map(elem =>
      elem.draw(ctx, translatedMouseCoords)
    );

    // Loop animation
    requestAnimationFrame(()=>this.animate());
  }

  /**
   * MouseMove Event Handler - Retrieve mouse coordinates and movement
   *
   * For the mouse movement, evt.movementX & evt.movementY are not used sinse
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
   * Elements drawn on canvas don't fire click events.
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
      x: this.mouseCoords.x + Math.floor(this.parallax.currentOffsetX * this.parallax.coefficient),
      y: this.mouseCoords.y + Math.floor(this.parallax.currentOffsetY * this.parallax.coefficient),
    };

    let clickedElements = this.canvasElements.filter(elem => {
      // When calculating the regions, also consider their dynamic dimensions.
      // Each images dimension is altered in their draw() method. See draw()
      let cutOffDistance = 600;
      let mFactor = 0;
      if (elem.currentValue < cutOffDistance) {
        mFactor = ((-1 / cutOffDistance) * elem.currentValue + 1);
      }
      let dynamicWidth = Math.floor(elem.width + elem.width * mFactor);
      let dynamicHeight = Math.floor(elem.height + elem.height * mFactor);

      // Is the mouse within the image's region?
      return translatedMouseCoords.x > elem.center.x - dynamicWidth / 2 &&
             translatedMouseCoords.x < elem.center.x + dynamicWidth / 2 &&
             translatedMouseCoords.y > elem.center.y - dynamicHeight / 2 &&
             translatedMouseCoords.y < elem.center.y + dynamicHeight /2
    });

    // The clickedElements array may contain multiple entries as images may overlap in the canvas.
    // However the this.canvasElements array that was filtered to obtain the clickedElements
    // has element already ordered - see this.animate(). Select last element.
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
