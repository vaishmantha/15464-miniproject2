// Simulation 
function changeIntegrator(sel) {
    var id = parseInt(sel.value, 10);
    var width = 0, height = 0;
    switch ( id ) {
        case 0:
            Integrator = 0; break;

        case 1:
            Integrator = 1; break;

        case 2:
            Integrator = 2; break;

        default:
            alert("Unknown resolution!");
    }
}


function updateSliderTime(sliderAmount) {
    var value = sliderAmount*1;
    $("#sliderAmountTime").html(value.toFixed(1));
    Time = value;
}

// Animation 

function updateSliderMass(sliderAmount) {
    var value = sliderAmount*0.1;
    $("#sliderAmountMass").html(value.toFixed(1));
    mass = value;
}

function updateSliderK0(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK0").html(sliderAmount);
    K[0] = value;
}

function updateSliderK1(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK1").html(sliderAmount);
    K[1] = value;
}

function updateSliderK2(sliderAmount) {
    var value = sliderAmount*1000.0;
    $("#sliderAmountK2").html(sliderAmount);
    K[2] = value;
}

function updateSliderCd(sliderAmount) {
    var value = sliderAmount*0.1;
    $("#sliderAmountCd").html(value.toFixed(1));
    Cd = value;
}

function updateSliderWind(sliderAmount) {
    var value = sliderAmount*1;
    $("#sliderAmountWind").html(value.toFixed(1));
    Wind = value;
}

function updateSliderAngle(sliderAmount) {
    var value = sliderAmount*1;
    $("#sliderAmountAngle").html(value.toFixed(1));
    Angle = value;
}


/*
 * Page-load handler
 */
$(function() {
    webGLStart();
});
