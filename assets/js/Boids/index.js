/**
 * This is a Boids simulation, based on Daniel Shiffman's CodingTrain video: https://www.youtube.com/watch?v=mhjuuHl6qHM
 * 
 * It uses:
 *   p5.js
 *   space_subdiv.js is a basic space subdivision library by me
 */

// Global variables - START ====
let DEBUG = true;
let ACCURATE = false; // If this is `false` then we are using `maxNearCount` to reduce calculation.

let width, height;

const flock = [];
const flockPool = [];
// Agent count
let count = 100;
const maxCount = 1000;
// Maximum number which is used for one agent to steer to. Statistically, it is correct and a good optimisation.
// On a 2016 MacBook Pro, 1500 agents are still 20 FPS with debug and without accurate calculation.
const maxNearCount = 100;

// Also good for speed up things, if we reduce the radius, but let leave it at 100.
const perceptionRadius = 100;
const maxForce = 0.2;
const maxSpeed = 4;

let alignSlider, cohesionSlider, separationSlider, countSlider;
let alignValue, cohesionValue, separationValue, countValue;
let aSliderValue = 1, cSliderValue = 1, sSliderValue = 1;

/**
 * Basic space subdivision - it is helpful above ~500 agent at the start when they are evenly distributed.
 * The 3rd parameter is important to use the right size buckets. So, 9 buckets will have every agent near.
 */
let subdiv;
// Global variables - END =====

function setup()
{

    const containerParent = document.getElementById('canvasContainer')

    width = containerParent.getBoundingClientRect().width;
    height = 500;
    subdiv = new SubDiv(width, height, perceptionRadius);

    createCanvas(width, height)
        .parent(containerParent);

    const settingsParent = createDiv()
        .parent(containerParent)
        .class('container-md')

    //#region Alignment
    const alignmentParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Alignment: ')
        .attribute('for', 'alignment')
        .class('form-label col')
        .parent(alignmentParent)

    alignSlider = createSlider(0, 5, aSliderValue, 0.1)
        .class('form-range w-20 col')
        .attribute('type', 'range')
        .attribute('oninput', `dispaySliderValue(alignSlider, alignValue)`)
        .parent(alignmentParent)
        .id('alignment')

    alignValue = createDiv(aSliderValue)
        .class('col')
        .parent(alignmentParent)
    //#endregion

    //#region Cohesion
    const cohesionParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Cohesion: ')
        .attribute('for', 'cohesion')
        .class('form-label col')
        .parent(cohesionParent)

    cohesionSlider = createSlider(0, 5, cSliderValue, 0.1)
        .class('form-range w-20 col')
        .attribute('type', 'range')
        .attribute('oninput', `dispaySliderValue(cohesionSlider, cohesionValue)`)
        .parent(cohesionParent)
        .id('cohesion')

    cohesionValue = createDiv(cSliderValue)
        .class('col')
        .parent(cohesionParent)
    //#endregion

    //#region Separation
    const separationParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Separation: ')
        .attribute('for', 'seperation')
        .class('form-label col')
        .parent(separationParent)

    separationSlider = createSlider(0, 5, sSliderValue, 0.1)
        .class('form-range w-20 col')
        .attribute('type', 'range')
        .attribute('oninput', `dispaySliderValue(separationSlider, separationValue)`)
        .parent(separationParent)
        .id('seperation')

    separationValue = createDiv(sSliderValue)
        .class('col')
        .parent(separationParent)
    //#endregion

    const toggleParent = createDiv()
        .class('row')
        .parent(settingsParent)

    //#region Debug Toggle
    const debugParent = createDiv()
        .class('form-check form-switch col')
        .parent(toggleParent)

    const dbgCheckbox = createElement('input')
        .parent(debugParent)
        .attribute('type', 'checkbox')
        .class('form-check-input')
        .id('DebugToggle')

    if (DEBUG)
        dbgCheckbox.attribute('checked', 'true')

    createElement('label', 'Debug')
        .class('form-check-label')
        .attribute('for', 'DebugToggle')
        .parent(debugParent)

    dbgCheckbox.changed(() => DEBUG = dbgCheckbox.elt.checked);
    //#endregion

    //#region Accurate Toggle
    const accParent = createDiv()
        .class('form-check form-switch col')
        .parent(toggleParent)

    const accCheckbox = createElement('input')
        .parent(accParent)
        .attribute('type', 'checkbox')
        .class('form-check-input')
        .id('AccurateToggle')

    if (ACCURATE)
        accCheckbox.attribute('checked', 'true')

    createElement('label', 'Accurate')
        .class('form-check-label')
        .attribute('for', 'AccurateToggle')
        .parent(accParent)

    accCheckbox.changed(() => ACCURATE = accCheckbox.elt.checked);
    //#endregion

    //#region Agent Count
    const agentCountParent = createDiv()
        .class('row')
        .parent(settingsParent)

    createElement('label', 'Agent Count: ')
        .attribute('for', 'agentCount')
        .class('form-label col')
        .parent(agentCountParent)

    countSlider = createSlider(50, maxCount, count, 50)
        .class('form-range w-20 col')
        .attribute('type', 'range')
        .attribute('oninput', `dispaySliderValue(countSlider, countValue)`)
        .parent(agentCountParent)
        .id('agentCount')

    countValue = createDiv(count)
        .class('col')
        .parent(agentCountParent)
    //#endregion

    for (let i = 0; i < maxCount; i++)
    {
        flockPool.push(new Agent());
    }

    updateCount(count);
}

function dispaySliderValue(slider, val)
{
    val.html(slider.value());

    // update all values
    aSliderValue = alignSlider.value();
    cSliderValue = cohesionSlider.value();
    sSliderValue = separationSlider.value();

    updateCount(countSlider.value());
}

function updateCount(c)
{
    if (c === flock.length) return;

    count = c;

    if (flock.length < count)
    {
        while (flock.length < count)
        {
            flock.push(flockPool[flock.length]);
        }
    } else
    {
        while (flock.length > count)
        {
            flock.pop();
        }
    }
}

function draw()
{
    background(64);
    // circle(perceptionRadius, perceptionRadius, perceptionRadius*2);
    flock.forEach(agent =>
    {
        agent.update();
    });

    if (DEBUG)
    {
        subdiv.getDebugGrid();
        subdiv.getNearItems(flock[0], true);
    }
}
