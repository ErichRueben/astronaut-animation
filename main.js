
var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime seconds (advance using dt)
var dt = 0.0;
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;

// Stars variables
var stars = [];
var STAR_COUNT = 100;
var STAR_POSITION_BUFFER = 1.0;

// Astronaut variables
var astroX = 0.0;
var astroY = 0.0;
var armAngle = 40.0;
var hipLeft = 40.0;
var hipRight = 10.0;
var kneeLeft = 30.0;
var kneeRight = 30.0;

var jellyRadius = 3.5;


// A random number generator used to initialize the position of the stars, and their size
// Returns a random number between a and b
function rand( a, b ) {
    return a + ( b - a ) * Math.random();
}


// Initializes the stars with random x, and y positions, and a random size between 0.01 and 0.05.
function initStars() {
    stars = [];
    for( var i = 0; i < STAR_COUNT; i++ ) {
        stars.push( {
            x: rand( left - STAR_POSITION_BUFFER, right + STAR_POSITION_BUFFER ),
            y: rand( bottom - STAR_POSITION_BUFFER, ytop + STAR_POSITION_BUFFER ),
            z: -10.0,
            s: rand( 0.01, 0.05 )
        } )
    }
}


// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes
    Cube.init(program);
    Cylinder.init(20,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    initStars();

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );


    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true;
            resetTimerFlag = true;
            window.requestAnimFrame(render);
        }
        //console.log(animFlag);
    };

    render(0);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result, x, y, and z are the translation amounts for each axis
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result, theta is the rotation amount, x, y, z are the components of an axis vector (angle, axis rotations!)
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result, x, y, and z are the scale amounts for each axis
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

// Updates the positions of the stars by moving them in the positive x and y direction. If a star moves outside
// the bounds of the screen, it is moved back to the left side with a random y position and a random size.
function updateStars() {
    const vx = 1.3;
    const vy = -0.15;
    for( const star of stars ) {
        star.x += vx * dt;
        star.y -= vy * dt;
        if( star.x > right + 1.0 ) {
            star.x = left - STAR_POSITION_BUFFER;
            star.y = rand( bottom, ytop );
            star.s = rand( 0.01, 0.05 );
        }
    }
}

// Draws the stars as spheres based on the previous values set in the stars array.
function drawStars() {
    setColor( vec4( 1.0 , 1.0, 1.0, 1.0 ) );
    for ( const star of stars ) {
        gPush();
        gTranslate( star.x, star.y, star.z );
        gScale( star.s, star.s, star.s );
        drawSphere();
        gPop();
    }
}


// Draws a single arm of the astronaut as a cube.
function drawArm( side, armAngle ) {
    gPush();
        gTranslate( 0.65 * side, 0.75 , 0.0 );
        gRotate( armAngle, 0.0, 0.0, 1.0 );
        gTranslate( 0.175 * side, -0.75 , 0.0 );
        gScale( 0.175, 0.75, 0.30 );
        setColor( vec4( 0.85, 0.85, 0.85, 1.0 ) );
        drawCube();
    gPop();
}

// Draws the thigh, shin, and foot of the astronaut as cubes. The hip and knee angles are initialized as rotations based
// on the hipLeft/hipRight and kneeLeft/kneeRight variables, defined at the top of the file.
function drawLeg( side, hipAngle, kneeAngle ) {

    gPush();

        // Rotate hip by hipAngle, and translate to the top of the thigh
        gTranslate( 0.3 * side, -1.0, 0.0 );
        gRotate( hipAngle, 1.0, 0.0, 0.0 );

        // Draw thigh
        gPush();
            gTranslate( 0.0, -0.65, 0.0 );
            gScale( 0.2, 0.65, 0.30);
            drawCube();
        gPop();

        // Rotate knee by kneeAngle, and translate to the top of the shin
        gTranslate( 0.0, -1.3, 0.0 );
        gRotate( kneeAngle, 1.0, 0.0, 0.0 );

        // Draw shin
        gPush();
            gTranslate( 0.0, -0.65, 0.0 );
            gScale( 0.2, 0.65, 0.30);
            drawCube();
        gPop();

        // Draw foot
        gPush();
            gTranslate( 0.0, -1.30, 0.20);
            gScale(0.2, 0.10, 0.50);
            drawCube();
        gPop();
    gPop();
}


// Draws the entirety of the astronaut with the assistance of the drawArm and drawLeg functions, while the torso,
// helmet, visor, patch, and ports are drawn directly in this function.
function drawAstronaut() {
    // Draw torso
    gPush();
        setColor( vec4( 0.95, 0.95, 0.95, 1.0 ) );
        gScale( 0.65, 1.0, 0.5 );
        drawCube();
    gPop();

    // Draw patch
    gPush();
        gTranslate( -0.38, 0.68, 0.51 );
        setColor( vec4(0.0, 0.06, 0.65, 1.0) );
        gScale( 0.18, 0.20, 0.01 );
        drawSphere();
    gPop();

    // Draw ports
    const ports = [
        [ -0.25, 0.10, 0.41, vec4(0.0, 0.098, 1.0, 1.0) ],
        [ 0.25, 0.10, 0.41, vec4(0.0, 0.098, 1.0, 1.0) ],
        [ 0.35, -0.30, 0.41, vec4(0.780, 0.780, 0.780, 1.0) ],
        [ -0.35, -0.30, 0.41, vec4(0.780, 0.780, 0.780, 1.0) ],
        [ 0.35, -0.70, 0.41, vec4(1.0, 0.439, 0.439, 1.0) ],
        [ -0.35, -0.70, 0.41, vec4(1.0, 0.439, 0.439, 1.0) ],
    ]
    for( const port of ports ) {
        gPush();
            gTranslate( port[ 0 ], port[ 1 ], port[ 2 ] );
            setColor( port[ 3 ] );
            gScale( 0.13, 0.14, 0.12 );
            drawSphere();
        gPop();
    }

    // Draw helmet
    gPush();
        gTranslate( 0.0, 1.50, 0.0 );
        setColor( vec4( 0.95, 0.95, 0.95, 1.0 ) );
        gScale( 0.50, 0.50, 0.50 );
        drawSphere();
    gPop();

    // Draw visor
    gPush();
        gTranslate( 0.0, 1.50, 0.1);
        setColor(vec4( 0.95, 0.75, 0.15, 1.0) );
        gScale(0.475,0.40,0.50);
        drawSphere();
    gPop();

    // Draw arms and legs
    drawArm( 1.0, armAngle );
    drawArm( -1.0, -armAngle );
    drawLeg( 1.0, hipLeft, kneeLeft );
    drawLeg( -1.0, hipRight, kneeRight );
}

// Draws a single tentacle of the jellyfish as a series of spheres.
function drawTentacle( x, y, z ) {

    const segmentCount = 4; // Defines the number of segments in the tentacle
    gPush();

        gTranslate( x + 0.175, y, z );

        // Draw the first segment of the tentacle
        gPush();
            gScale( 0.35, 0.11, 0.11 );
            setColor( vec4( 0.820, 0.635, 0.165, 1.0 ) );
            drawSphere();
        gPop();

        gTranslate( 0.35, 0.0, 0.0 );

        // Draw the remaining segments of the tentacle, applying a rotation to create a waving motion
        for ( let i = 0; i < segmentCount; i++ ) {
            var angle =  30 * Math.sin( 1.0 * TIME - i * 1.3 );
            
            gRotate( angle, 0.0, 0.0, 1.0 );
            gTranslate( 0.175, 0.0, 0.0 );
            gPush();
                gScale( 0.35, 0.11, 0.11 );
                setColor( vec4( 0.820, 0.635, 0.165, 1.0 ) );
                drawSphere();
            gPop();

            gTranslate( 0.35, 0.0, 0.0 );
        }
    gPop();
}


// Draws the entirety of the jellyfish with the assistance of the drawTentacle function. The body of the jellyfish is
// drawn directly in this function.
function drawJellyfish() {
    gPush();

        // Draw the main head of the jellyfish
        gTranslate( 0.0, 1.0, 0.0 );
        gPush();
            gScale( 0.40, 0.75, 0.75 );
            setColor( vec4( 0.80, 0.106, 0.416, 1.0 ) )
            drawSphere();
        gPop();

        gTranslate( 0.40, 0.0, 0.0 );

        // Draw the second head of the jellyfish
        gPush();
            gScale( 0.30, 0.48, 0.48 );
            setColor( vec4( 0.80, 0.106, 0.416, 1.0 ) )
            drawSphere();
        gPop();

        gTranslate( 0.15, 0.0, 0.0 );

        // Draw the tentacles of the jellyfish
        drawTentacle( 0.0, -0.48, 0.0 );
        drawTentacle( 0.20, 0.0, 0.0 );
        drawTentacle( 0.0, 0.48, 0.0 );
    gPop();
}   


// Main render loop. Clears the screen, updates animation time, computes astronaut motion, and draws the full 
// animated scene.
function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    
    // set all the matrices
    setAllMatrices();
    
    // Initialize timer when animation starts
    if( resetTimerFlag ) {
        prevTime = timestamp;
        resetTimerFlag = false;
    }
	if( animFlag )
    {
		dt = (timestamp - prevTime) / 1000.0;
		prevTime = timestamp;
        if( dt > 0.05 ) {
            dt = 0.05;
        }
        TIME += dt;
	} else {
        dt = 0.0;
    }

    // Draw the stars
    if( animFlag ) {
        updateStars();
    }
    drawStars();

    // Update the position and movement of the astronaut based on the TIME variable
    astroX = 1.0 * Math.cos( 0.5 * TIME );
    astroY = 0.8 * Math.sin( 0.8 * TIME );

    armAngle = 5 * Math.sin( 2.2 * TIME ) + 30;
    hipLeft = 8 * Math.sin( 2.5 * TIME ) + 20.0;
    hipRight = 8 * Math.sin( 2.5 * TIME + 1.0 ) + 20.0;
    kneeLeft = 10 * Math.sin( 2.5 * TIME + 0.6 ) + 30.0;
    kneeRight = 15 * Math.sin( 2.5 * TIME + 2.8 ) + 30.0;

    // Draw the astronaut
    gPush();
        gTranslate( astroX, astroY, 0.0 );
        gRotate( -20, 0, 1, 0);
        gRotate( 5, 1, 0, 0);
        drawAstronaut();

        // Update the rotation of the jellyfish based on the TIME variable
        const theta = (1.2 * TIME * 180) / ( Math.PI * 8 );

        // Draw the jellyfish
        gPush();
            gRotate( theta, 0.0, 1.0, 0.0 );
            gTranslate( jellyRadius, 0.0, 0.0 );
            gRotate( -90, 0.0, 1.0, 0.0 );
            drawJellyfish();
        gPop();

    gPop();
    
    if( animFlag )
        window.requestAnimFrame(render);
}