//Controls
let cWidth = 1200, cHeight = 400;
const size = 100;
let sleepTime = 0;

let values = new Array(size);
let state = new Array(size);
let finished = false;

function setup()
{
	createCanvas(cWidth, cHeight);
	const low = 10, high = cHeight;
	for (let i = 0; i < size; ++i)
	{
		// values[i] = int(random(low, high))
		values[i] = low + (high - low) * i / size;
		state[i] = 0;
	}
	shuffle(values);
	display();
	const SORT = async () =>
	{
		await bubblesort(values);
		finished = true;
	}
	SORT();
}

function draw()
{
	display();
}

const w = cWidth / size;
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
				fill(255, 0, 0);
				break;
			case 2:
				fill(0, 255, 0);
				break;
			default:
				fill(180);
				break;
		}
		rect(w * i, height - values[i], w, values[i])
	}
}

async function bubblesort(a)
{
	
	for (let i = 0; i < a.length; ++i)
	{
		state[0] = 1;
		await sleep(sleepTime);
		state[0] = 0;
		for (let j = 0; j < a.length - 1 - i; ++j)
		{
			if (a[j] > a[j + 1])
			{
				finished = false;
				swap(a, j, j + 1);
			}
			state[j+1] = 1;
			await sleep(sleepTime);
			state[j+1] = 0;
		}
		state[a.length - 1 - i] = 2;
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