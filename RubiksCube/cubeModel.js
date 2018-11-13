// Grabbed from https://github.com/esangel/WebGL
"use strict";

function cubeModel(color){

  var results={};

  var NumVertices  = 36;

  var points = [];
  var colors = [];

  var originalVertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
  ];
  var vertices =[
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
  ];
  
  var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 1.0, 1.0, 1.0 ],  // white
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
  ];

  function initializeVertices(){
    for (var i=0; i<vertices.length; i++){
      for (var j=0; j<4; j++){
        vertices[i][j] = originalVertices[i][j];
      }
    }
  }

  function cube()
  {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
  }

  function quad(a, b, c, d)
  {
    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    // points is a shallow-copy of vertices so changes to vertices affects all the values in points
    var rgba = color || vertexColors[a];
    for ( var i = 0; i < indices.length; ++i ) {
      points.push( vertices[indices[i]] );
      //colors.push( vertexColors[indices[i]] );
      colors.push(rgba);

    }
  }
  
  function translate(dx, dy, dz){
    for(var i=0; i<8; i++) {
      vertices[i][0] += dx;
      vertices[i][1] += dy;
      vertices[i][2] += dz;
    };
  }

  function scale(sx, sy, sz){
    for(var i=0; i<8; i++) {
      vertices[i][0] *= sx;
      vertices[i][1] *= sy;
      vertices[i][2] *= sz;
    };
  };


  function rotate( angle, axis) {

    var d = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);

    var x = axis[0]/d;
    var y = axis[1]/d;
    var z = axis[2]/d;

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var mat = [
      [ x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s ],
      [ x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s ],
      [ x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c ]
    ];

    for(var i=0; i< vertices.length; i++) {
      var t = [0, 0, 0];
      for( var j =0; j<3; j++)
        for( var k =0 ; k<3; k++)
          t[j] += mat[j][k]*vertices[i][k];
      for( var j =0; j<3; j++) vertices[i][j] = t[j];
    };

  }

  cube();

  results.points = points;

  results.colors = colors;
  results.translate = translate;
  results.rotate = rotate;
  results.scale = scale;
  results.numVertices = 36;
  results.reset = initializeVertices;


  return results;

};
