//Controls
let cWidth = 600, cHeight = 400;
const size = 20;
let sleepTime = 0;

let values = new Array(size);
let state = new Array(size);
let finished = false;
let w;
function setup()
{
    const containerParent = document.getElementById('canvasContainer')

    cWidth = containerParent.getBoundingClientRect().width;
    w = cWidth / size;
    createCanvas(cWidth, cHeight)
        .parent(containerParent);
        
    const low = 10, high = cHeight;
    for (let i = 0; i < size; ++i)
    {
        // values[i] = int(random(low, high))
        values[i] = low + (high - low) * i / size;
        state[i] = 0;
    }
    state[0] = 2;
    shuffle(values);
    display();
    const SORT = async () =>
    {
        await insertsort(values);
        finished = true;
    }
    SORT();
}

function draw()
{
    display();
}


function display()
{
    background(0)
    if (finished)
    {
        fill(0, 255, 0)
        for (let i = 0; i < size; ++i)
            rect(w * i, height - values[i], w, values[i])
        noLoop();
        return;
    }

    for (let i = 0; i < size; ++i)
    {
        switch (state[i])
        {
            case 1:
                fill(255, 0, 0); //current element
                break;
            case 2: //sorted so far range
                fill(0, 255, 0);
                break;
            default:
                fill(180);
                break;
        }
        rect(w * i, height - values[i], w, values[i])
    }
}

async function insertsort(a)
{
    let i, key, j;
    for (i = 1; i < a.length; i++)
    {
        key = a[i];
        j = i - 1;

        state[i] = 1;
        await sleep(sleepTime)
        state[i] = 2;

        while (j >= 0 && a[j] > key)
        {
            state[j] = 1;
            swap(a, j, j + 1);
            await sleep(sleepTime)
            state[j] = 2;
            j = j - 1;
        }
        // state[i] = 0;
    }
}

function swap(a, i, j)
{
    let t = a[i];
    a[i] = a[j];
    a[j] = t;
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Fisher-Yates Algorithm
const shuffle = array =>
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}