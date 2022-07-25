//Controls
let cWidth = 1200, cHeight = 400;
const size = 200;
let sleepTime = 10;
let randPiv = true;

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
		await quicksort(values);
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
			case 1: //pivot
				fill(255, 0, 0);
				break;
			case 2: //current range [l, r]
				fill(0, 0, 255);
				break;
			case 3: //sorted
				fill(0, 255, 0);
				break;
			case 4: //current element
				fill(100, 200, 100);
				break;
			default:
				fill(180);
				break;
		}
		rect(w * i, height - values[i], w, values[i])
	}
}

async function partition(a, l, r)
{
	let piv = r;
	for (let ind = l; ind <= r; ++ind)
		if (state[ind] != 3)
			state[ind] = 2;

	if (randPiv)
	{
		piv = int(random(l, r + 1));
		state[piv] = 1;
		await sleep(sleepTime);
		state[piv] = 2;
	}


	swap(a, r, piv);
	state[r] = 1;
	await sleep(sleepTime);

	let i = l;
	for (let j = l; j < r; ++j)
	{
		state[j] = 4;
		if (a[j] < a[r])
		{
			swap(a, j, i);
			await sleep(sleepTime);
			i++;
		}
		state[j] = 2;
	}
	swap(a, i, r);
	state[r] = 2;
	state[i] = 3;
	await sleep(sleepTime);

	for (let ind = l; ind <= r; ++ind)
		if (state[ind] != 3)
			state[ind] = 0;

	return i;
}

async function quicksort(a, l = 0, r = values.length - 1)
{
	if (l >= r)
	{
		state[l] = 3;
		await sleep(sleepTime);
		return;
	}

	let p = await partition(a, l, r)
	await quicksort(a, l, p - 1)
	await quicksort(a, p + 1, r)
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