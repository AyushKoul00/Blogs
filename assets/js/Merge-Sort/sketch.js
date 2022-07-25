//Controls
let cWidth = 1200, cHeight = 400;
const size = 100;
let sleepTime = 50;

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
		await mergesort(values);
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
			case 1: //current element
				fill(255, 0, 0);
				break;
			case 2: //current range [l, r]
				fill(0, 0, 255);
				break;
			default:
				fill(180);
				break;
		}
		rect(w * i, height - values[i], w, values[i])
	}
}

async function merge(a, l, mid, r)
{

	for (let i = l; i <= r; ++i)
		state[i] = 2;

	let n1 = mid - l + 1, n2 = r - mid;
	let left = new Array(n1);
	let right = new Array(n2);

	for (let i = 0; i < n1; ++i)
		left[i] = a[l + i];
	for (let i = 0; i < n2; ++i)
		right[i] = a[mid + 1 + i];

	let i = 0, j = 0, k = l;
	while (i < n1 && j < n2)
	{
		state[k] = 1;
		if (left[i] <= right[j])
			a[k++] = left[i++];
		else
			a[k++] = right[j++];
		await sleep(sleepTime);
		state[k - 1] = 2;
	}
	while (i < n1)
	{
		state[k] = 1;
		a[k++] = left[i++];
		await sleep(sleepTime);
		state[k - 1] = 2;
	}
	while (j < n2)
	{
		state[k] = 1;
		a[k++] = right[j++];
		await sleep(sleepTime);
		state[k - 1] = 2;
	}
	for (let i = l; i <= r; ++i)
		state[i] = 0;
}

async function mergesort(a, l = 0, r = values.length - 1)
{
	if (l >= r) return;

	let mid = int(l + (r - l) / 2);
	await mergesort(a, l, mid);
	await mergesort(a, mid + 1, r);
	await merge(a, l, mid, r);
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