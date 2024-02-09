let mic;

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let containerWidth = canvasContainer.offsetWidth;
    let containerHeight = canvasContainer.offsetHeight;
    createCanvas(containerWidth, containerHeight).parent(canvasContainer);
}

function draw() {
    background("#feca57")
    // Your drawing logic (if needed)
}

function StartRecording(){
    console.log('Start')
    mic = new p5.AudioIn();
    mic.start()
}

