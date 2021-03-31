/*
 * Global variables
 */
var meshResolution;

// Particle states
var mass;
var vertexPosition, vertexNormal;
var vertexVelocity;
var vertexPrevPosition; 

// Spring properties
var K, restLength; 

// Force parameters
var Cd;
var uf;
var Wind, Angle; 
var Time; 
var Integrator; 


/*
 * Getters and setters
 */
function getPosition(i, j) {
    var id = i*meshResolution + j;
    return vec3.create([vertexPosition[3*id], vertexPosition[3*id + 1], vertexPosition[3*id + 2]]);
}

function setPosition(i, j, x) {
    var id = i*meshResolution + j;
    vertexPosition[3*id] = x[0]; vertexPosition[3*id + 1] = x[1]; vertexPosition[3*id + 2] = x[2];
}

function getPrevPosition(i, j) {
    var id = i*meshResolution + j;
    return vec3.create([vertexPrevPosition[3*id], vertexPrevPosition[3*id + 1], vertexPrevPosition[3*id + 2]]);
}

function setPrevPosition(i, j, x) {
    var id = i*meshResolution + j;
    vertexPrevPosition[3*id] = x[0]; vertexPrevPosition[3*id + 1] = x[1]; vertexPrevPosition[3*id + 2] = x[2];
}

function getNormal(i, j) {
    var id = i*meshResolution + j;
    return vec3.create([vertexNormal[3*id], vertexNormal[3*id + 1], vertexNormal[3*id + 2]]);
}

function getVelocity(i, j) {
    var id = i*meshResolution + j;
    return vec3.create(vertexVelocity[id]);
}

function setVelocity(i, j, v) {
    var id = i*meshResolution + j;
    vertexVelocity[id] = vec3.create(v);
}


/*
 * Provided global functions (you do NOT have to modify them)
 */
function computeNormals() {
    var dx = [1, 1, 0, -1, -1, 0], dy = [0, 1, 1, 0, -1, -1];
    var e1, e2;
    var i, j, k = 0, t;
    for ( i = 0; i < meshResolution; ++i )
        for ( j = 0; j < meshResolution; ++j ) {
            var p0 = getPosition(i, j), norms = [];
            for ( t = 0; t < 6; ++t ) {
                var i1 = i + dy[t], j1 = j + dx[t];
                var i2 = i + dy[(t + 1) % 6], j2 = j + dx[(t + 1) % 6];
                if ( i1 >= 0 && i1 < meshResolution && j1 >= 0 && j1 < meshResolution &&
                     i2 >= 0 && i2 < meshResolution && j2 >= 0 && j2 < meshResolution ) {
                    e1 = vec3.subtract(getPosition(i1, j1), p0);
                    e2 = vec3.subtract(getPosition(i2, j2), p0);
                    norms.push(vec3.normalize(vec3.cross(e1, e2)));
                }
            }
            e1 = vec3.create();
            for ( t = 0; t < norms.length; ++t ) vec3.add(e1, norms[t]);
            vec3.normalize(e1);
            vertexNormal[3*k] = e1[0];
            vertexNormal[3*k + 1] = e1[1];
            vertexNormal[3*k + 2] = e1[2];
            ++k;
        }
}


var clothIndex, clothWireIndex;
function initMesh() {
    var i, j, k;

    vertexPosition = new Array(meshResolution*meshResolution*3);
    vertexPrevPosition = new Array(meshResolution*meshResolution*3);
    vertexNormal = new Array(meshResolution*meshResolution*3);
    clothIndex = new Array((meshResolution - 1)*(meshResolution - 1)*6);
    clothWireIndex = [];

    vertexVelocity = new Array(meshResolution*meshResolution);
    restLength[0] = 4.0/(meshResolution - 1);
    restLength[1] = Math.sqrt(2.0)*4.0/(meshResolution - 1);
    restLength[2] = 2.0*restLength[0];

    for ( i = 0; i < meshResolution; ++i )
        for ( j = 0; j < meshResolution; ++j ) {
            setPosition(i, j, [-2.0 + 4.0*j/(meshResolution - 1), -2.0 + 4.0*i/(meshResolution - 1), 0.0]);
            setVelocity(i, j, vec3.create());

            if ( j < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, i*meshResolution + j + 1);
            if ( i < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, (i + 1)*meshResolution + j);
            if ( i < meshResolution - 1 && j < meshResolution - 1 )
                clothWireIndex.push(i*meshResolution + j, (i + 1)*meshResolution + j + 1);
        }
    computeNormals();

    k = 0;
    for ( i = 0; i < meshResolution - 1; ++i )
        for ( j = 0; j < meshResolution - 1; ++j ) {
            clothIndex[6*k] = i*meshResolution + j;
            clothIndex[6*k + 1] = i*meshResolution + j + 1;
            clothIndex[6*k + 2] = (i + 1)*meshResolution + j + 1;
            clothIndex[6*k + 3] = i*meshResolution + j;
            clothIndex[6*k + 4] = (i + 1)*meshResolution + j + 1;            
            clothIndex[6*k + 5] = (i + 1)*meshResolution + j;
            ++k;
        }
}


/*
 * KEY function: simulate one time-step using Euler's method
 */

function getSpringForce(i, j, s){
    var Fs = vec3.create(0, 0, 0);
    var pq = vec3.subtract(vec3.create(i), j);
    return vec3.scale(pq, K[s] * (restLength[s] - vec3.length(pq)) * (1 / vec3.length(pq)));
}

function getForce(x, y){
    if(Integrator == 2){
        console.log("stuck");

    }
    var F = vec3.create(0, 0, 0);

    // structural spring
	if((x+1) <meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x+1,y),0));
	}
	if((x-1)>= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x-1,y),0));
	}
    if((y+1) <meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x,y+1),0));
	}
	if((y-1)>= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x,y-1),0));
	}
	
	// shear spring
	if((x-1) >= 0 && (y-1) >= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x-1,y-1),1));
	}
	if((x-1) >= 0 && (y+1) < meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x-1,y+1),1));
	}
    if((x+1) < meshResolution && (y-1) >= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x+1,y-1),1));
	}
    if((x+1) < meshResolution && (y+1) < meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x+1,y+1),1));
	}

    // bend spring
    if((x+2) < meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x+2,y), 2));
	}
	if((x-2) >= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x-2,y), 2));
	}
	if((y+2) < meshResolution){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x,y+2), 2));
	}
	if((y-2) >= 0){
		vec3.add(F,getSpringForce(getPosition(x,y),getPosition(x,y-2), 2));
	}
	

    var v = Wind; 
    // gravitational force 
    // var Fg = vec3.create();
    // Fg[1] = (-9.81) * mass; 
    // vec3.add(F, Fg);

    // gravitational force with wind 
	var pressure = 0.00256*v*v;
    var Fg = vec3.create();
	Fg[0] = pressure*Math.sin(Angle*Math.PI*(1/180));
	Fg[1] = -9.81 *mass;
	Fg[2] = pressure*Math.cos(Angle*Math.PI*(1/180));
	vec3.add(F,Fg);

    // damping force 
    var vv = vec3.create(getVelocity(x, y));
    var Fd = vec3.create();
    Fd = vec3.scale(vv, -Cd); 
    vec3.add(F, Fd); 

    return F; 
}

function simulate(stepSize) {
    stepSize = Time * 0.001; 
    // console.log(stepSize);
    // console.log(vertexPrevPosition);
    // euler 
    if(Integrator == 0){
        // console.log("euler");
        var x, y; 
        for (x = 0; x < meshResolution; x++){
            for (y = 0; y < meshResolution; y++){
                var F = getForce(x, y);
                vec3.scale(F, 1/mass);
                vec3.scale(F, stepSize);
                var updateVelocity = vec3.add(F, getVelocity(x, y));
                setVelocity(x, y, updateVelocity);
            }
        }
        var pin1 = getPosition(meshResolution-1,0);
        var pin2 = getPosition(meshResolution-1,meshResolution-1);
        for (x = 0; x < meshResolution; x++){
            for (y = 0; y < meshResolution; y++){
                var currVelocity = getVelocity(x, y);
                vec3.scale(currVelocity, stepSize);
                var updatePosition = vec3.add(currVelocity, getPosition(x,y));
                setPosition(x, y, updatePosition); 
            }
        }
        setPosition(meshResolution-1,0,pin1);
        setPosition(meshResolution-1,meshResolution-1,pin2);	
    }
    else if (Integrator == 1){
        console.log("semi-implicit euler");
        var pin1 = getPosition(meshResolution-1,0);
        var pin2 = getPosition(meshResolution-1,meshResolution-1);
        var x, y; 
        for (x = 0; x < meshResolution; x++){
            for (y = 0; y < meshResolution; y++){
                var currVelocity = getVelocity(x, y);
                vec3.scale(currVelocity, stepSize);
                var updatePosition = vec3.add(currVelocity, getPosition(x,y));
                setPosition(x, y, updatePosition); 
            }
        }
        setPosition(meshResolution-1,0,pin1);
        setPosition(meshResolution-1,meshResolution-1,pin2);	
        for (x = 0; x < meshResolution; x++){
            for (y = 0; y < meshResolution; y++){
                var F = getForce(x, y);
                vec3.scale(F, 1/mass);
                vec3.scale(F, stepSize);
                var updateVelocity = vec3.add(F, getVelocity(x, y));
                setVelocity(x, y, updateVelocity);
            }
        }
        
    }
    else{
        var x, y; 
        for(x = 0; x < meshResolution; x++){
            for(y = 0; y < meshResolution; y++){
                setPrevPosition(x,y, vec3.create(getPosition(x,y)));
            } 
        }
        console.log("verlet");
        var pin1 = getPosition(meshResolution-1,0);
        var pin2 = getPosition(meshResolution-1,meshResolution-1);
        for (x = 0; x < meshResolution; x++){
            for (y = 0; y < meshResolution; y++){
                var temp = getPosition(x, y); 
                var currPosition = getPosition(x,y); 
                vec3.scale(currPosition, 2); 
                var prevPosition; 
                prevPosition = getPrevPosition(x,y);
                vec3.scale(prevPosition, -1); 
                var F = getForce(x, y);
                vec3.scale(F, 1/mass);

                vec3.scale(F, stepSize*stepSize); 

                var updatePosition = vec3.add(currPosition, prevPosition);

                updatePosition = vec3.add(updatePosition, F); 
                setPosition(x, y, updatePosition); 
                setPrevPosition(x, y, temp);
            }
        }
        setPosition(meshResolution-1,0,pin1);
        setPosition(meshResolution-1,meshResolution-1,pin2);
    }
}

