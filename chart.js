const fileInput = document.querySelector('input');
const chartCanvas = document.getElementById("chartCanvas");
const instruction = document.getElementById("instruction");
const ctx = chartCanvas.getContext('2d');
const inputOriginX = document.getElementById("originXVal");
const inputOriginY = document.getElementById("originYVal");
const inputMaxX = document.getElementById("maxXVal");
const inputMaxY = document.getElementById("maxYVal");
const resultTable = document.getElementById('resultTable');

chartOrigin = {}
chartMaxXPoint = {}
chartMaxYPoint = {}

instruction.innerHTML = "Select chart image.";

fileInput.addEventListener('input', onFileInput);
chartCanvas.addEventListener('mousedown', function(e){
    getCursorPosition(chartCanvas, e);
});


inputOriginX.addEventListener("change", inputChange);
inputOriginY.addEventListener("change", inputChange);
inputMaxX.addEventListener("change", inputChange);
inputMaxY.addEventListener("change", inputChange);



function onFileInput(e){
    var img = new Image();
    img.onload = drawImage;
    img.onerror = drawImageFailed;
    img.src = URL.createObjectURL(e.target.files[0]);
}

function drawImage(){
    //Ref: https://stackoverflow.com/questions/23104582/scaling-an-image-to-fit-on-canvas
    var img_x_ratio = chartCanvas.width  / this.width;
    var img_y_ratio =  chartCanvas.height / this.height;
    var ratio  = Math.min ( img_x_ratio, img_y_ratio );
    var centerShift_x = ( chartCanvas.width - this.width*ratio ) / 2;
    var centerShift_y = ( chartCanvas.height - this.height*ratio ) / 2;  
    ctx.clearRect(0,0,chartCanvas.width, chartCanvas.height);
    ctx.drawImage(this, 0,0, this.width, this.height, centerShift_x,centerShift_y,this.width*ratio, this.height*ratio);  
    instruction.innerHTML = "Select origin on chart.";
}

function drawImageFailed(){
    console.error("The provided file couldn\'t be loaded as an Image media");
}

//TODO: https://roblouie.com/article/617/transforming-mouse-coordinates-to-canvas-coordinates/
function getCursorPosition(canvas, event){
    const rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    testCursorPosition(x, y);
}



function drawPointEntity(x, y, type){
    ctx.beginPath();    
    if(type == "REF"){
        ctx.arc(x, y, 6, 0, 2*Math.PI);
        ctx.strokeStyle="#0000ff";
    }
    else{
        var side =10;
        ctx.rect(x-side/2, y-side/2, side, side);
        ctx.strokeStyle = "#ff0000";
    }
    
    ctx.lineWidth=2;
    ctx.stroke();
}

function testCursorPosition(x, y){
    if(isObjectEmpty(chartOrigin)){
        chartOrigin = {"x": x, "y": y};
        instruction.innerHTML = "Select max. known point on horizontal x-axis.";
        document.getElementById("originPointX").innerHTML = Math.round(x) + " px";
        document.getElementById("originPointY").innerHTML = Math.round(y) + " px";
        drawPointEntity(x, y, "REF");
    }
    else if (isObjectEmpty(chartMaxXPoint)){
        chartMaxXPoint = {"x": x, "y": y};
        document.getElementById("maxXPointX").innerHTML = Math.round(x) + " px";
        document.getElementById("maxXPointY").innerHTML = Math.round(y) + " px";
        instruction.innerHTML = "Select max. known point on vertical y-axis.";
        drawPointEntity(x, y, "REF");
    }
    else if (isObjectEmpty(chartMaxYPoint)){
        chartMaxYPoint = {"x": x, "y": y};
        document.getElementById("maxYPointX").innerHTML = Math.round(x) + " px";
        document.getElementById("maxYPointY").innerHTML = Math.round(y) + " px";
        instruction.innerHTML = "Enter values for reference points in chart units."
        drawPointEntity(x, y, "REF");
    }
    else if (inputOriginX.value != "" && inputOriginY.value != "" && inputMaxX.value != "" && inputMaxY.value != ""){
        drawPointEntity(x, y, "INTER");
        var point = computeInterpolatedPoint(x, y);
        insertResultTableRow(point);
    }
    else{
        instruction.innerHTML = "Chart values have not been entered.  Enter values in yellow input boxes.";
    }
}

function insertResultTableRow(point){
    var tableBody = resultTable.children[1];
    var id = tableBody.children.length +1;
    var row = tableBody.insertRow(-1);
    var idCell = row.insertCell(0);
    idCell.innerHTML = id;

    var xCell = row.insertCell(1);
    xCell.innerHTML = point.x.toFixed(3);

    var yCell = row.insertCell(2);
    yCell.innerHTML = point.y.toFixed(3);
}

function computeInterpolatedPoint(x, y){
    var res_x = 0
    var res_y = 0
    if(x >= chartOrigin.x && x <= chartMaxXPoint.x){
        res_x = linearInterpolate(chartOrigin.x, parseFloat(inputOriginX.value), chartMaxXPoint.x, parseFloat(inputMaxX.value), x);
    }else{
        res_x = linearExtrapolate(chartOrigin.x, parseFloat(inputOriginX.value), chartMaxXPoint.x, parseFloat(inputMaxX.value), x);
    }

    if(y <= chartOrigin.y && y >= chartMaxYPoint.y){
        res_y = linearInterpolate(chartOrigin.y, parseFloat(inputOriginY.value), chartMaxYPoint.y, parseFloat(inputMaxY.value), y);
    }else{
        res_y = linearExtrapolate(chartOrigin.y, parseFloat(inputOriginY.value), chartMaxYPoint.y, parseFloat(inputMaxY.value), y);
    }


    return {"x": res_x, "y": res_y};
}

function linearInterpolate(u0, v0, u1, v1, u_i){
    if(u1-u0 != 0){
        return ((v1 - v0)/(u1 - u0))*(u_i - u0) + v0;
    }
    else{
        return NaN;
    }
}

function linearExtrapolate(u0, v0, u1, v1, u2){
    if(u1-u0 != 0){
        return ((v1-v0)/(u1-u0))*(u2-u1)+v1;
    }else{
        return NaN;
    }
}



function inputChange(input, event){
    if(inputOriginX.value != "" && inputOriginY.value != "" && inputMaxX.value != "" && inputMaxY.value != ""){
        instruction.innerHTML = "Select points on curve.";
    }
}


function isObjectEmpty(obj){
    if(Object.keys(obj).length === 0 && obj.constructor === Object){
        return true;
    }
    return false;
}



