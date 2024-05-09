let bpmSlider;
let containerWidth;
let containerHeight;
let bpm;
let buttons = [];

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    containerWidth = canvasContainer.offsetWidth;
    containerHeight = canvasContainer.offsetHeight;
    createCanvas(containerWidth, containerHeight).parent(canvasContainer);


    angleMode(DEGREES);
    textSize(32)
    textAlign(CENTER, CENTER);

    bpmSlider = createSlider(0, 255, 95);
    bpmSlider.position(0, height * 0.82);
    bpmSlider.size(width - 5)

    button_minus_five = new My_Button('-5', width * 0.015, height * 0.7, width * 0.15, height * 0.1, -5)
    buttons.push(button_minus_five)

    button_minus_one = new My_Button('-1', width * 0.2, height * 0.7, width * 0.15, height * 0.1, -1)
    buttons.push(button_minus_one)

    button_plus_one = new My_Button('+1', width * (1 - 0.2 - 0.15), height * 0.7, width * 0.15, height * 0.1, +1)
    buttons.push(button_plus_one)

    button_plus_five = new My_Button('+5', width * (1 - 0.015 - 0.15), height * 0.7, width * 0.15, height * 0.1, +5)
    buttons.push(button_plus_five)
}

function draw() {

    bpm = bpmSlider.value();
    background("#feca57")
    fill('#fd9644')
    stroke(0);
    strokeWeight(5)
    textSize(85)
    text(bpm, width / 2, height * 0.74);
    textSize(32)

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].draw()
    }

}

function mouseClicked() {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].is_within_bounds(mouseX, mouseY)) {
            buttons[i].update()
            console.log(buttons[i].name)
        }
    }
}

class My_Button {
    potential_colors = ['#fc5c65', '#fd9644', '#fed330', '#26de81', '#2bcbba', '#778ca3', '#d1d8e0', '#a55eea']
    jumpSize = 10

    constructor(name, x, y, width, height, bpm_increment, color = undefined) {
        this.name = name;
        this.x = x
        this.y = y
        this.w = width
        this.h = height
        this.color = color
        this.bpm_increment = bpm_increment
        this.isJumped = false
        if (color === undefined) {
            this.updateToRandomColor()
        }
    }

    update() {
        this.updateBpm()
        this.updateToRandomColor()
        this.jump()

    }

    jump() {
        if (this.isJumped) {
            this.isJumped = false
            this.y += this.jumpSize

        }
        else {
            this.isJumped = true
            this.y -= this.jumpSize
        }
    }

    updateToRandomColor() {
        console.log('updatecolor')
        let current = this.color
        while (current === this.color) {
            console.log('while')
            this.color = this.potential_colors[floor(random(this.potential_colors.length))]
        }
        this.secondary_color = this.potential_colors[floor(random(this.potential_colors.length))]
    }
    updateBpm() {
        bpmSlider.value(bpmSlider.value() + this.bpm_increment)
    }

    is_within_bounds(x, y) {
        if (!(x >= this.x && x <= this.x + this.w)) {
            return false
        }

        if (!(y >= this.y && y <= this.y + this.h)) {
            return false
        }

        return true
    }

    draw() {
        fill(this.color);
        rect(this.x, this.y, this.w, this.h, 10);

        fill(this.secondary_color)
        text(this.name, this.x + this.w / 2, this.y + this.h / 2)
    }
}

// <!-- #fc5c65, #fd9644, #fed330, #26de81, #2bcbba, #778ca3, #d1d8e0,#a55eea -->
