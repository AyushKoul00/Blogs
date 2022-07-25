//https://github.com/jshrake/p5js-vertex-shader/blob/master/step-0/sketch.js
//https://www.packt.com/webgl-20-what-you-need-know/
const WIDTH = 600, HEIGHT = 500;

let theShader;
function preload()
{
  // load the shader
  theShader = loadShader('/Blogs/assets/js/Ray-Marching/shader.vert', '/Blogs/assets/js/Ray-Marching/shader.frag');
}

function setup() 
{
  pixelDensity(1);
  // shaders require WEBGL mode to work
  const containerParent = document.getElementById('canvasContainer')
  createCanvas(WIDTH, HEIGHT, WEBGL).parent(containerParent);
  noStroke();
}

function draw() {  
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform('u_time', millis()/1000.0);
  
  shader(theShader);
  
  beginShape(TRIANGLES);
    // triangle 1
    vertex(-1.0 ,-1.0);
    vertex(-1.0, 1.0);
    vertex(1.0, 1.0);
  endShape();
}

function windowResized(){
  resizeCanvas(WIDTH, HEIGHT);
}

p5.RendererGL.prototype._initContext = function() {
  this.drawingContext = false ||
    this.canvas.getContext('webgl2', this.attributes) ||
    this.canvas.getContext('webgl', this.attributes) ||
    this.canvas.getContext('experimental-webgl', this.attributes);
  let gl = this.drawingContext;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};