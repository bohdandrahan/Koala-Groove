function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let containerWidth = canvasContainer.offsetWidth;
    let containerHeight = canvasContainer.offsetHeight;
    createCanvas(containerWidth, containerHeight).parent(canvasContainer);
}

function draw() {
    background("#feca57")

    translate(width / 2, height / 2);

    // Rotate the canvas by radians
    rotate(frameCount / 30);

    // Set text properties
    textAlign(CENTER, CENTER);
    textSize(32);
    fill('red');

    // Display rotated text
    text("Work in Progress", 0, 0);
}

function update() {

}

