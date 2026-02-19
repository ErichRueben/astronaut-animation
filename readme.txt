===============================================================================
                        SPACE SCENE ANIMATION
                      A WebGL-based Interactive Scene
===============================================================================

OVERVIEW
--------
This application displays an interactive 3D animation rendered using WebGL and 
JavaScript. The scene features a space environment with a playful Space Jelly 
character, an astronaut, and an animated starfield. The entire scene is rendered
in real-time with smooth animations and realistic lighting.

FEATURES
--------
• Space Jelly Character
  - Detailed modeling with a segmented body (two scaled spheres)
  - Three evenly-spaced tentacles, each composed of 5 ellipses
  - Realistic tentacle animation using wave functions
  - Orbital movement around the astronaut in a circular path
  - Dynamic alignment with the orbital tangent

• Astronaut Model
  - Fully detailed character including:
    * Helmet with transparent visor
    * Two articulated arms with rotating animation
    * Two articulated legs with kicking motion
    * NASA mission patch
    * Various suit inlets and outlets
  - Body oscillation in x and y directions for lifelike movement

• Starfield Background
  - 100 randomly positioned and sized stars
  - Continuous parallax scrolling effect
  - Stars reset when moving off-screen to create an infinite space effect

• Rendering Specifications
  - 512x512 canvas resolution
  - Professional lighting with ambient, diffuse, and specular components
  - Real-time animation synchronized with system clock
  - Proper Phong illumination model for realistic material appearance

TECHNICAL DETAILS
-----------------
• Graphics API: WebGL (OpenGL ES)
• Language: JavaScript with GLSL shaders
• Animation: Frame-based with real-time delta timing
• Geometry: Procedurally generated using sphere subdivision
• Lighting: Multi-light system with configurable material properties

HOW TO USE
----------
Open main.html in a WebGL-compatible web browser to view the animation.
The scene will automatically start playing with no user interaction required.

FILES INCLUDED
--------------
• main.html        - Primary HTML file containing the WebGL context
• main.js          - Main animation loop and scene management
• objects.js       - 3D object definitions and rendering functions
• Common/          - Utility libraries:
  - initShaders.js   - WebGL shader compilation utilities
  - MV.js            - Matrix and vector mathematics library
  - webgl-utils.js   - WebGL utility functions

STUDENT SUBMISSION
------------------
Author: Erich Rueben Justiniano