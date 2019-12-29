import React from 'react';
import gsap from 'gsap';
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
 * @class representing images drawn on screen
 *  Each instance holds all positional data & methods necessary to draw and
 *  animate an image on an HTML5 canvas using the drawImage() method from the canvas API
 *  See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 */
class CanvasImage {

  /**
   * Represents an image and all positional data needed for painting on an HTML5 canvas
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
    /*Scale of the image drawn on the canvas*/
    this.scale = 1;
    /*Opacity of the image drawn on the canvas*/
    this.globalAlpha = 0;
    /*Offset from the image's center used for parallax effect */
    this.offsetX = 0;
    this.offsetY = 0;
    /** Boolean denoting whether on not image has finished loading */
    this.hasLoaded = false;
  }

  /**
   * Loads an image for use on the canvas
   */
  loadImage() {
    this.img = new Image();
    this.img.addEventListener('load', () => {
      // Added a delay to simulate network conditions
      setTimeout(() => {
          this.hasLoaded = true;
          this.fadeIn();
      }, 1000 * Math.random());
    }, false);
    this.img.src = this.url;
  }

  /**
   * Redraws an image on the canvas
   *
   * @param {object} ctx - Canvas rendering context object
   */
  draw(ctx) {

    // Draw a new image on the canvas w/ set opacity & offset
    ctx.globalAlpha = this.globalAlpha;
    ctx.drawImage(this.img,
        this.center.x + this.offsetX - this.scale * this.width / 2,
        this.center.y + this.offsetY - this.scale * this.height / 2,
        this.scale * this.width,
        this.scale * this.height,
      );
    ctx.globalAlpha = 1;
  }

  /**
   * Animates/tweens the images scale and position on the canvas
   * Both scale and position depend on the current mouse position
   *  scale: depends linearly on the position of the image's center
   *         from the mouse coordinates
   *  position: (via offset) depends linearly on the total mouse movement
   *
   * @param {mouseCoords} mouseCoords - Object containing positional info for
   *                                    the mouse, including coordinates relative
   *                                    to the canvas origin & total movement
   */
  animateScaleOnMouseMove(mouseCoords) {
    let imgCenter = {
      x: this.center.x + this.offsetX,
      y: this.center.y + this.offsetY,
    }
    let distanceToMouse = euclideanDistance(imgCenter, mouseCoords);

    /* Linearly transform distanceToMouse to value in [0,1]
       Linear f(distance) = (-1 / cutOffDistance) * distance + 1
       where cutOffDistance = 600px (for performance reasons) */
    let cutOffDistance = 400;
    let mFactor = (-1/ cutOffDistance) * distanceToMouse + 1;
    if (distanceToMouse > cutOffDistance) { mFactor = 0;}

    /* Animate scale & position (via offset) using GSAP*/
    gsap.to(this,
      {
        scale: 1 + mFactor,
        offsetX: - mouseCoords.totalMovementX * 0.25,
        offsetY: - mouseCoords.totalMovementY * 0.25,
        duration: 0.8,
        ease: 'power1.out',
      }
    );

  }

  /**
   * Animates/tweens the image's opacity to provide a fadein effect
   */
   fadeIn() {
     gsap.to(this, {globalAlpha: 1, duration: 0.5, ease: 'power1.in'});
   }

  /**
   * Fires when the region occupied by the image in the canvas is clicked
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
   * @instance {object} - Contains the most recent mouse position relative to the
   *                      origin of the canvas, as well as the total relative
   *                      distance the mouse has traveled in the X and Y axises
   */
   mouseCoords = {
     x: 2 * window.innerWidth,
     y: 2 * window.innerHeight,
     prevx: undefined,
     prevy: undefined,
     totalMovementX: 0,
     totalMovementY: 0,
   }
   mouseMoved = false;

   /**
    * @instance {boolean} - Boolean detoting if the initial animation that first
    *                       draws images has completed. Used in {@link Canvas#animate}
    */
   hasInitAnimationFinished = true;

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
     ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   }

   /**
    * Draws canvas @ 60FPS in an animation loop initiated by
    * {@link Canvas#componentDidMount}
    */
   animate = () => {
     // Get canvas context
     let ctx = this.canvas.getContext('2d', { alpha: false });

     // Clear canvas
     this.clearCanvas(ctx);

     // If the mouse is moving
     if (this.mouseMoved) {
       // Order canvas elements bassed on the distance of their centers from the mouseCoords
       // Elements w/ centers closest to the mouse position get placed at end of array
       // and are therefore painted last
       this.canvasElements.sort((elem1, elem2) =>
         euclideanDistance(elem2.center, this.mouseCoords) - euclideanDistance(elem1.center, this.mouseCoords)
       )

       // Start individual animations
       this.canvasElements.forEach(elem =>
         elem.animateScaleOnMouseMove(this.mouseCoords)
       );

       this.mouseMoved = false;
    }

    // Draw all elements
    this.canvasElements.forEach(elem => elem.draw(ctx));


   }

  /**
   * Event Handler - Retrieve mouse coordinates and movement relative to canvas
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
    if (this.mouseCoords.prevx === undefined) {
      this.mouseCoords.prevx = mx;
      this.mouseCoords.prevy = my;
    }

    // Store coordinates and update total movement
    this.mouseCoords = {
      x: mx,
      y: my,
      totalMovementX: this.mouseCoords.totalMovementX + (mx - this.mouseCoords.prevx),
      totalMovementY: this.mouseCoords.totalMovementY + (my - this.mouseCoords.prevy),
      prevx: mx,
      prevy: my,
    };

    // Set mouse as moving
    this.mouseMoved = true;
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
    let clickedElements = this.canvasElements.filter(elem => {

      // Is the mouse within the image's region?
      return this.mouseCoords.x > elem.center.x + elem.offsetX - elem.scale * elem.width / 2 &&
             this.mouseCoords.x < elem.center.x + elem.offsetX + elem.scale * elem.width / 2 &&
             this.mouseCoords.y > elem.center.y + elem.offsetY - elem.scale * elem.height / 2 &&
             this.mouseCoords.y < elem.center.y + elem.offsetY + elem.scale * elem.height / 2
    });

    // The clickedElements array may contain multiple entries as images may overlap in the canvas.
    // However canvasElements array is sorted => clickedElements is also sorted
    // Select last element.
    clickedElements.length > 0 && clickedElements[clickedElements.length - 1].onClick();
  }

  /**
   * Loads the images and starts the animation loop {@link Canvas#animate()}
   */
  componentDidMount() {
    // Create image instances
    CANVAS_IMAGE_PROPS.forEach((img, idx) => {
        this.canvasElements[idx] = new CanvasImage(
          img.left * this.canvas.width - img.w / 2,
          img.top * this.canvas.height - img.h / 2,
          img.w, img.h, img.url);
    });
    // Load images
    this.canvasElements.forEach(elem => elem.loadImage());
    // Start animation loop
    gsap.ticker.add(this.animate);
  }

  /**
   * Cancels the animation loo initiated by {@link Canvas#componentDidMount}
   */
  componentWillUnmount() {
    gsap.ticker.remove(this.animate);
  }

  /**
   * Renders a fullscreen canvas that gets re-painted @ 60FPS
   */
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
