window.addEventListener('load', main, false);

var canvas;
var gl;
var basicProgramShader;
var vertexBuffer;
var texBuffer;
var textureId;
var modelview;
var projection;
var angle = 0;

var vertex;
var texture;
var index;

var sphereElementBuffer;
var sphereVertexBuffer;

var oldMouseX;
var oldMouseY;
var moveX;
var moveY;
var mouseDown;

function initGL() {
    canvas=document.getElementById( "webglCanvas");

    gl=canvas.getContext("webgl");
    if(!gl){
        alert ( " error in initialisation of context" ) ;
    }  else {
        console.log(gl.getParameter(gl.VERSION) + " | " 
                + gl.getParameter(gl.VENDOR) +   " | " 
                + gl.getParameter(gl.RENDERER) + " | " 
                +gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    }
}

function main() {
    initGL();
    initDataGL("basic");
    initTexture("video");
    initEvent();

    loop();
}

function initEvent() {
    canvas.addEventListener("mousedown", handleMouseDown, false);
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    mouseDown = false;
	moveX=0.0;
	moveY=0.0;
	oldMouseX=0.0;
	oldMouseY=0.0;
}

function getShader(id) { 
    var shaderScript = document.getElementById(id); 
    var k = shaderScript.firstChild; 
    var str=k.textContent; 
    var shader; 
    if (shaderScript.type == "x-shader/x-fragment") { 
        shader = gl.createShader(gl.FRAGMENT_SHADER); 
    } else if (shaderScript.type == "x-shader/x-vertex") { 
        shader = gl.createShader(gl.VERTEX_SHADER); 
    } 
    gl.shaderSource(shader, str); 
    gl.compileShader(shader); 
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { 
        alert(gl.getShaderInfoLog(shader)); return null; 
    } return shader; 
} 

function createProgram(id) { 
    var programShader=gl.createProgram(); 
    var vert=getShader(id+"-vs"); 
    var frag=getShader(id+"-fs"); 
    gl.attachShader(programShader,vert); 
    gl.attachShader(programShader,frag); 
    gl.linkProgram(programShader); 
    if (!gl.getProgramParameter(programShader,gl.LINK_STATUS)) { 
        alert(gl.getProgramInfoLog(programShader)); 
        return null; 
    } 
    console.log("compilation shader ok"); return programShader; 
}

function initDataGL(id) {
    basicProgramShader=createProgram(id);
    initSphere();

    modelview = new Mat4();
    projection = new Mat4();

    projection.setFrustum(-0.1, 0.1, -0.1, 0.1, 0.1, 1000);

}


function drawScene() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    var modelviewLocation=gl.getUniformLocation(basicProgramShader, "modelview");
    var projectionLocation=gl.getUniformLocation(basicProgramShader, "projection");

    gl.useProgram(basicProgramShader);

    //association avec les attribut du shader
    var vertexLocation = gl.getAttribLocation(basicProgramShader , "vertex");
    var texCoordLocation = gl.getAttribLocation(basicProgramShader , "texCoord");
    var textureLocation = gl.getUniformLocation(basicProgramShader, "texture0");

    //gestion des attribut uniforme
    gl.uniform1i(textureLocation, 0);
    gl.uniformMatrix4fv(modelviewLocation, gl.FALSE, modelview.fv);
    gl.uniformMatrix4fv(projectionLocation, gl.FALSE, projection.fv);

    //gestion du vertex buffer
    gl.enableVertexAttribArray(vertexLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);

     //gestion de la texture 
    gl.enableVertexAttribArray(texCoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureId);

    //tracage des triangles
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereElementBuffer); 
    gl.drawElements(gl.TRIANGLES, 19*19*6, gl.UNSIGNED_SHORT, 0);

    //nettoyage
    gl.disableVertexAttribArray(vertexLocation);
    gl.disableVertexAttribArray(texCoordLocation);
    gl.useProgram (null);    
}

function updateData() {

    var imageData = document.getElementById( "video" );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, textureId );
    gl.texImage2D( gl.TEXTURE_2D, 0 , gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageData );

    modelview.setIdentity();

    modelview.rotateX(-moveY);
    modelview.rotateY(moveX);

}

function loop() {
    drawScene();
    updateData();
    window.requestAnimationFrame(loop);
}

function initTexture( id ){
     var imageData = document.getElementById( id );
     textureId = gl.createTexture();

     gl.activeTexture( gl.TEXTURE0 );
     gl.bindTexture( gl.TEXTURE_2D, textureId ) ;

     gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER , gl.LINEAR );
     gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER , gl.LINEAR );
     gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ) ;
     gl.texParameteri( gl.TEXTURE_2D, gl . TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ) ;

     gl.texImage2D ( gl.TEXTURE_2D, 0 , gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageData ) ;
 }

function initSphere() {
    vertex = new Array();
    texture = new Array();
    index = new Array();

    var nbSlice = 20;
    var nbStack = 20;

    for(var i=0; i<nbStack; i++) {

        for(var j=0; j<nbSlice; j++) {
            var theta = (2 * Math.PI * j) / (nbSlice-1);
            var phi = (Math.PI * i) / (nbStack-1);

            var x = Math.cos(theta) * Math.sin(phi);
            var y = Math.cos(phi);
            var z = Math.sin(theta) * Math.sin(phi);

            vertex.push(x, y, z);
			texture.push(1-theta/(2*Math.PI), phi/(Math.PI));
        }
    }

    sphereVertexBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);

    texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture), gl.STATIC_DRAW);

    var nbPoint = nbSlice * nbStack;
    for(var k=0; k<nbPoint; k++) {
        index.push(k+nbSlice);
        index.push(k);
        index.push(k+1);
        index.push(k+1);
        index.push(k+1+nbSlice);
        index.push(k+nbSlice);
    }

    sphereElementBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereElementBuffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

}

function handleMouseDown(event) {
 
    oldMouseX = event.layerX - canvas.offsetLeft;
    oldMouseY = (canvas.height - 1.0) - (event.layerY - canvas.offsetTop);

    mouseDown = true;

}

function handleMouseMove(event) {

    if(mouseDown) {

        var mouseX = event.layerX - canvas.offsetLeft;
        var mouseY = (canvas.height - 1.0) - (event.layerY - canvas.offsetTop);
        
	    moveX += (mouseX - oldMouseX)/100;
        moveY += (mouseY - oldMouseY)/100;

        oldMouseX = mouseX;
        oldMouseY = mouseY;

   }
}

function handleMouseUp(event) {

    mouseDown = false;

}

