const MAX_POINTS = 10;
let nCr = Array(MAX_POINTS + 1).fill(0).map(x => Array(MAX_POINTS + 1).fill(0));;
function preload()
{
    //populate the nCr array
    for (i = 0; i <= MAX_POINTS; i++)
    {
        for (j = 0; j <= i; j++)
        {
            // Base Cases
            if (j == 0 || j == i)
                nCr[i][j] = 1;
            // Calculate value using previously stored values
            else
                nCr[i][j] = nCr[i - 1][j - 1] + nCr[i - 1][j];
        }
    }
}

let points = [];
let pClicked = -1;
let parameter, speed, parameterValue, pVal;

// function displaySliderValue(slider, val)
// {
//     val.html(slider.value());

//     // update all values
//     parameterValue = parameter.value();
// }

function setup()
{
    colorMode(HSB, 100);

    const containerParent = document.getElementById('canvasContainer')

    createCanvas(containerParent.getBoundingClientRect().width, 500)
        .parent(containerParent);

    const settingsParent = createDiv()
        .parent(containerParent)
        .class('container-md')

    //#region Parameter Slider
    const parameterParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Parameter: ')
        .attribute('for', 'parameter')
        .class('form-label col')
        .parent(parameterParent)

    parameter = createSlider(0, 1, .5, .001)
        .attribute('type', 'range')
        .id('parameter')
        .class('form-range w-20 col')
        .parent(parameterParent)
    // .attribute('oninput', 'displaySliderValue(parameter, pVal)');

    if (ANIMATE)
        parameter.attribute('disabled', 'true')

    parameterValue = parameter.value();
    //#endregion

    //#region Speed Slider
    const speedParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Speed: ')
        .attribute('for', 'speed')
        .class('form-label col')
        .parent(speedParent)

    // parameter = createSlider(0, 1, .5, .001)
    speed = createSlider(.005, .03, .002, .001)
        .attribute('type', 'range')
        .id('speed')
        .class('form-range w-20 col')
        .parent(speedParent)

    if (!ANIMATE)
        speed.attribute('disabled', 'true')
    //#endregion

    //#region Toggles

    const toggleParent = createDiv()
        .class('row')
        .parent(settingsParent)

    //#region Debug Toggle
    const debugParent = createDiv()
        .class('form-check form-switch col')
        .parent(toggleParent)

    const debugCB = createElement('input')
        .parent(debugParent)
        .attribute('type', 'checkbox')
        .class('form-check-input')
        .id('DebugToggle')

    if (DEBUG)
        debugCB.attribute('checked', 'true')

    createElement('label', 'Show Lerp Lines')
        .class('form-check-label')
        .attribute('for', 'DebugToggle')
        .parent(debugParent)

    debugCB.changed(() => DEBUG = debugCB.elt.checked);
    //#endregion

    //#region Animate Toggle
    const animateParent = createDiv()
        .class('form-check form-switch col')
        .parent(toggleParent)

    const animateCB = createElement('input')
        .attribute('type', 'checkbox')
        .class('form-check-input')
        .id('animateToggle')
        .parent(animateParent)

    if (ANIMATE)
        animateCB.attribute('checked', 'true')

    createElement('label', 'Animate')
        .class('form-check-label')
        .attribute('for', 'animateToggle')
        .parent(animateParent)

    animateCB.changed(() =>
    {
        ANIMATE = animateCB.elt.checked

        if (!ANIMATE)
        {
            parameter.removeAttribute('disabled')
            speed.attribute('disabled', 'true')
        }
        else
        {
            parameter.attribute('disabled', 'true')
            speed.removeAttribute('disabled')
        }
    });
    //#endregion

    //#endregion

    //#region Buttons
    const btnParent = createDiv()
        .class('row')
        .parent('canvasContainer')

    const resetBtn = createButton('Reset')
        .class('btn btn-danger me-md-2 col')
        .parent(btnParent)
    resetBtn.mouseClicked(() => points = []);

    const delBtn = createButton('Delete Last Point')
        .class('btn btn-warning col')
        .parent(btnParent)
    delBtn.mouseClicked(() => points.pop());
    //#endregion

    noFill()
}

let ANIMATE = true, DEBUG = true;
let thresh = 0;
function draw()
{
    background(30);

    if (pClicked != -1)
        points[pClicked].x = mouseX, points[pClicked].y = mouseY;

    if (ANIMATE)
    {
        thresh += speed.value();
        thresh %= 1;
        DEBUG ? recursive_bez(points, thresh) : drawPoints()
        drawCurve(thresh)
    }
    else
    {
        DEBUG ? recursive_bez(points, parameter.value()) : drawPoints()
        drawCurve()
    }
}

function drawPoints()
{
    stroke(0, 100, 100);
    if (points.length > 0)
        Point(points[0]);
    for (let i = 1; i < points.length; ++i)
    {
        Line(points[i], points[i - 1]);
        Point(points[i]);
    }
}

function drawCurve(t = parameter.value())
{
    if (points.length < 1) return;
    stroke(255)
    strokeWeight(3);
    // let t = parameter.value();
    let p;
    beginShape()
    for (let i = 0; i <= t; i += .001)
    {
        p = getBezierPoint(i);
        vertex(p.x, p.y)
    }
    endShape()
    Point(p);
}

function recursive_bez(arr, t, level = 0, original_size = null)
{
    if (arr.length < 1) return
    const ret_arr = [];
    if (!original_size)
        original_size = arr.length
    if (arr.length == 1)
        return
    let col = map(original_size - level, 1, original_size, 100, 1)
    stroke(col, 100, 100);
    for (let i = 0; i < arr.length - 1; i++)
    {
        // strokeWeight(10 - level)
        Point(arr[i], arr.length == points.length ? 20 : 10)
        Point(arr[i + 1], arr.length == points.length ? 20 : 10)
        Line(arr[i], arr[i + 1])
        ret_arr.push(p5.Vector.lerp(arr[i], arr[i + 1], t));
    }
    recursive_bez(ret_arr, t, level + 1, original_size)
}

function getBezierPoint(t = 0)
{
    if (t < 0 || t > 1) return;
    if (points.length < 1) return;
    if (points.length == 1) return points[0];
    let n = points.length - 1;
    if (t == 0) return points[0];
    if (t == 1) return points[n];
    let p = createVector(0, 0);
    let pow_t = 1, pow_one_minus_t = Math.pow(1 - t, n);
    for (let i = 0; i <= n; ++i)
    {
        // let factor = Math.pow(t, i) * Math.pow(1-t, n-i) * nCr[n][i];
        let factor = pow_t * pow_one_minus_t * nCr[n][i];
        pow_t *= t;
        pow_one_minus_t /= (1 - t);
        p.add(p5.Vector.mult(points[i], factor))
    }
    return p;
}

function mouseInScreen()
{
    return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

function mousePressed()
{
    if (!mouseInScreen()) return;
    for (let i = 0; i < points.length; ++i)
    {
        if (dist(points[i].x, points[i].y, mouseX, mouseY) < 10)
        {
            pClicked = i;
            // console.log(pClicked);
            // return;
        }
    }
    if (pClicked == -1)
    {
        if(points.length == MAX_POINTS)
            alert("Max points reached")
        else
            points.push(createVector(mouseX, mouseY));

    }
}

function mouseReleased()
{
    pClicked = -1;
}

function Line(v1, v2, w = 3)
{
    strokeWeight(w);
    line(v1.x, v1.y, v2.x, v2.y);
}

function Point(v, w = 20)
{
    strokeWeight(w);
    point(v.x, v.y)
}
