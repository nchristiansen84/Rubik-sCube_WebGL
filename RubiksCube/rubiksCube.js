"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var cubes = [];
var borders = [];

var moves = [];
var possibleMoves = ["White", "Blue", "Red", "Green", "Yellow", "Magenta"];
var cubeOffset = [-0.26, 0, 0.26];
var rubikSize = 3;
var numCubes = rubikSize*rubikSize*rubikSize;
var degrees = 90;

var rotationMatrix;
var rotationMatrixLoc;

var angle = 0.0;
var axis = [0, 0, 1];

var trackingMouse = false;
var trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

// Grabbed function from https://github.com/esangel/WebGL
function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

// Grabbed function from https://github.com/esangel/WebGL
function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	    angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);

	    axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	    axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	    axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

        lastPos[0] = curPos[0];
	    lastPos[1] = curPos[1];
	    lastPos[2] = curPos[2];
      }
    }
    render();
}

// Grabbed function from https://github.com/esangel/WebGL
function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	trackballMove=true;
}

// Grabbed function from https://github.com/esangel/WebGL
function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}

// creates the 27 cubes that make up the rubiks cube
function initCubes(){
	for(var i = 0; i<numCubes; i++){
	  for(var j = 0; j<rubikSize*rubikSize; j++){
		  for(var k = 0; k<rubikSize; k++){
			  var newCube = cubeModel();
			  newCube.scale(0.25, 0.25, 0.25);
			  newCube.translate(cubeOffset[i%3], cubeOffset[j%3], cubeOffset[k%3]);
			  cubes.push(newCube);
			  points = points.concat(newCube.points);
			  colors = colors.concat(newCube.colors);
		  }
		  j+=k;
	  }
	  i+=j;
	}
}

// not really borders, just rectangles to fill the gap between cubes
function initCubeBorders(){
	var border1 = cubeModel([0,0,0,1]);
	border1.scale(0.01, 0.77, 0.77);
	border1.translate(0.77/6,0.0,0.0);
	points = points.concat(border1.points);
	colors = colors.concat(border1.colors);
	borders.push(border1);
	
	var border2 = cubeModel([0,0,0,1]);
	border2.scale(0.01, 0.77, 0.77);
	border2.translate(-0.77/6,0.0,0.0);
	points = points.concat(border2.points);
	colors = colors.concat(border2.colors);
	borders.push(border2);
	
	var border3 = cubeModel([0,0,0,1]);
	border3.scale(0.77, 0.01, 0.77);
	border3.translate(0.0,0.77/6,0.0);
	points = points.concat(border3.points);
	colors = colors.concat(border3.colors);
	borders.push(border3);
	
	var border4 = cubeModel([0,0,0,1]);
	border4.scale(0.77, 0.01, 0.77);
	border4.translate(0.0,-0.77/6,0.0);
	points = points.concat(border4.points);
	colors = colors.concat(border4.colors);
	borders.push(border4);
	
	var border5 = cubeModel([0,0,0,1]);
	border5.scale(0.77, 0.77, 0.01);
	border5.translate(0.0,0.0,0.77/6);
	points = points.concat(border5.points);
	colors = colors.concat(border5.colors);
	borders.push(border5);

	var border6 = cubeModel([0,0,0,1]);
	border6.scale(0.77, 0.77, 0.01);
	border6.translate(0.0,0.0,-0.77/6);
	points = points.concat(border6.points);
	colors = colors.concat(border6.colors);
	borders.push(border6);
}

function reInitCubeBorders(){
	for(var i = 0; i<borders.length; ++i){
		points = points.concat(borders[i].points);
		colors = colors.concat(borders[i].colors);
	}
}

function isOnSameFace(cube1, cube2, axis){
	for(var i = 0; i<36; ++i){
		if(cube1.points[0][axis]-0.0001 < cube2.points[i][axis]
		   && cube1.points[0][axis]+0.0001 > cube2.points[i][axis]){
			return true;
		}
	}
	return false;
}

function doMove(color, degree, axis){
	var cubesOnFace = [];
	
	for(var i = 0; i<numCubes; ++i){
		if(color == "White"){
			if(isOnSameFace(cubes[12], cubes[i], 2)){
				cubesOnFace.push(cubes[i]);
			}
		}
		else if(color == "Blue"){
			if(isOnSameFace(cubes[10], cubes[i], 1)){
				cubesOnFace.push(cubes[i]);
			}
		}
		else if(color == "Red"){
			if(isOnSameFace(cubes[14], cubes[i], 2)){
				cubesOnFace.push(cubes[i]);
			}
		}
		else if(color == "Green"){
			if(isOnSameFace(cubes[22], cubes[i], 0)){
				cubesOnFace.push(cubes[i]);
			}
		}
		else if(color == "Yellow"){
			if(isOnSameFace(cubes[4], cubes[i], 0)){
				cubesOnFace.push(cubes[i]);
			}
		}
		else if(color == "Magenta"){
			if(isOnSameFace(cubes[16], cubes[i], 1)){
				cubesOnFace.push(cubes[i]);
			}
		}
	}
	
	for(var i = 0; i<cubesOnFace.length; ++i){
		cubesOnFace[i].rotate(degree, axis);
	}
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function makeRandomMove(){
	var move = [possibleMoves[getRandomInt(0,6)], degrees];
	
	if(move[0] == "White"){
		doMove(move[0], move[1], [0,0,1]);
	}
	else if(move[0] == "Blue"){
		doMove(move[0], move[1], [0,1,0]);
	}
	else if(move[0] == "Red"){
		doMove(move[0], move[1], [0,0,1]);
	}
	else if(move[0] == "Green"){
		doMove(move[0], move[1], [1,0,0]);
	}
	else if(move[0] == "Yellow"){
		doMove(move[0], move[1], [1,0,0]);
	}
	else if(move[0] == "Magenta"){
		doMove(move[0], move[1], [0,1,0]);
	}
	
	return move;
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	initCubes();
	initCubeBorders();
	
	NumVertices = 36 * (numCubes + 6);
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 0.9 );
	
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

	// Grabbed from https://github.com/esangel/WebGL
    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

	// Grabbed from https://github.com/esangel/WebGL
    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

	// Grabbed from https://github.com/esangel/WebGL
    canvas.addEventListener("mousemove", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );
	
	document.getElementById("Rotate90").onclick = function(){
		if(degrees > 0){
			degrees = 90;
		} else {
			degrees = -90;
		}
	};
	
	document.getElementById("Rotate180").onclick = function(){
		if(degrees > 0){
			degrees = 180;
		} else {
			degrees = -180;
		}
	};
	
	document.getElementById("Rotate270").onclick = function(){
		if(degrees > 0){
			degrees = 270;
		} else {
			degrees = -270;
		}
	};
	
	document.getElementById("RotateClockwise").onclick = function(){
		if(degrees < 0){
			degrees = -degrees;
		}
	};
	
	document.getElementById("RotateCounterClockwise").onclick = function(){
		if(degrees > 0){
			degrees = -degrees;
		}
	};
	
	document.getElementById("RotateWhiteFace").onclick = function(){
		var move = ["White", -degrees];
		doMove(move[0], move[1], [0,0,1]);
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[White], degrees["+degrees+"]");
	};
	
	document.getElementById("RotateBlueFace").onclick = function(){
		var move = ["Blue", -degrees];
		doMove(move[0], move[1], [0,1,0]);
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[Blue], degrees["+degrees+"]");
	};
	
	document.getElementById("RotateRedFace").onclick = function(){
		var move = ["Red", degrees];
		doMove(move[0], move[1], [0,0,1]);
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[Red], degrees["+degrees+"]");
	};
	
	document.getElementById("RotateGreenFace").onclick = function(){
		var move = ["Green", degrees];
		doMove(move[0], move[1], [1,0,0]);
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[Green], degrees["+degrees+"]");
	};
	
	document.getElementById("RotateYellowFace").onclick = function(){
		var move = ["Yellow", -degrees];
		doMove(move[0], move[1], [1,0,0])
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[Yellow], degrees["+degrees+"]");
	};
	
	document.getElementById("RotateMagentaFace").onclick = function(){
		var move = ["Magenta", degrees];
		doMove(move[0], move[1], [0,1,0]);
		moves.push(move);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
		console.log("User: move[Magenta], degrees["+degrees+"]");
	};
	
	document.getElementById("Randomize").onclick = function(){
		var numRandomMoves = document.getElementById("InputField").value;
		
		for(var i = 0; i<numRandomMoves; ++i){
			var move = makeRandomMove();
			moves.push(move);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
			console.log("Random: move["+move[0]+"], degrees["+move[1]+"]");
		}
		console.log("Random moves finished.");
	};
	
	document.getElementById("Solve").onclick = function(){
		for(var i = moves.length-1; i>=0; --i){
			var move = moves[i];
			
			if(move[0] == "White"){
				doMove(move[0], -move[1], [0,0,1]);
			}
			else if(move[0] == "Blue"){
				doMove(move[0], -move[1], [0,1,0]);
			}
			else if(move[0] == "Red"){
				doMove(move[0], -move[1], [0,0,1]);
			}
			else if(move[0] == "Green"){
				doMove(move[0], -move[1], [1,0,0]);
			}
			else if(move[0] == "Yellow"){
				doMove(move[0], -move[1], [1,0,0]);
			}
			else if(move[0] == "Magenta"){
				doMove(move[0], -move[1], [0,1,0]);
			}
			
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
			console.log("Solve: move["+move[0]+"], degrees["+move[1]+"]");
		}
		moves = [];
		console.log("Solve moves finished.");
	};
	
	document.getElementById("Reset").onclick = function(){
		angle = 0.0;
		axis = [0, 0, 1];
		lastPos = [0, 0, 0];

		cubes = [];
		points = [];
		colors = [];
		moves = [];
		degrees = 90;

		initCubes();
		reInitCubeBorders();

		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
	};
	
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(trackballMove) {
      axis = normalize(axis);
      rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
      gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame( render );
}
