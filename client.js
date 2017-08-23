var keyBinds = [87, 83, 65, 68, 81, 69, 32, 13];
var keys = [];

var W, H, player, world, canvas, ctx, trees, treesCount, camera;

function initGame() {
	$('#name').hide();
	$('#menu').hide();
	$('#canvas').show();

	$('body, html, canvas').css({
		'position': 'absolute',
		'padding': '0',
		'margin': '0'
	});

	var canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	W = canvas.width;
	H = canvas.height;

	var name = $('#input-name').val();

	Game(canvas, name);
}

function showOptions() {
	$('#options').show();
	$('#name').hide();
	$('#menu').hide();
}

function hideOptions() {
	$('#options').hide();
	$('#name').show();
	$('#menu').show();
}

function random(min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function isColliding(a, b) {
	if((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) < (a.r + b.r) * (a.r + b.r)) {
		return true;
	}
	else {
		return false;
	}
}

function distance(a, b) {
	return Math.sqrt(Math.abs((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)));
}
function distanceSq(a, b) {
	return Math.abs((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function Player(x, y, r, spd, color, name) {
	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.spd = spd;
	this.r = r;
	this.color = color;
	this.name = name;

	this.update = function() {
		if(keys[keyBinds[0]]) {
			this.velY--;
		}
		if(keys[keyBinds[1]]) {
			this.velY++;
		}
		if(keys[keyBinds[2]]) {
			this.velX--;
		}
		if(keys[keyBinds[3]]) {
			this.velX++;
		}

		this.x += this.velX;
		this.y += this.velY;

		this.velX *= 0.9;
		this.velY *= 0.9;
	}

	this.render = function() {
		ctx.beginPath();
		ctx.arc(this.x - camera.x, this.y - camera.y, this.r, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.font = '15px Arial';
		ctx.fillStyle = '#000000';
		ctx.textAlign = 'center';
		ctx.fillText(this.name, W/2, H/2 - this.r * 2);
	}
}

function Tree(x, y, r) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.color = '#000000';

	this.render = function() {
		ctx.beginPath();
		ctx.arc(this.x - camera.x, this.y - camera.y, this.r, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

function Camera(x, y) {
	this.x = x;
	this.y = y;
	this.angle = 0;

	this.update = function(pl) {
		this.x = pl.x - W/2;
		this.y = pl.y - H/2;
	}
}

function Game(c, n) {
	console.log('Game Started');

	canvas = c;
	ctx = canvas.getContext("2d");

	world = {
		w: 5000,
		h: 5000
	}

	player = new Player(random(0, world.w), random(0, world.h), 20, 3, '#2135ED', n);

	trees = [];
	treesCount = 100;
	var treeMinSize = 35;
	var treeMaxSize = 75;

	for(var i = 0; i < treesCount; i++) {
		trees.push(new Tree(random(0, world.w), random(0, world.h), random(treeMinSize, treeMaxSize)));
	}

	camera = new Camera(0, 0);

	gameLoop();
}

function update() {
	player.update();
	camera.update(player);

	for(var i = 0; i < treesCount; i++) {
		if(isColliding(player, trees[i])) {
			mX = (player.x + trees[i].x) /2;
			mY = (player.y + trees[i].y) /2;

			var dist = distance(player, trees[i]);

			player.x = mX + (player.r + trees[i].r) * 0.55 * (player.x - trees[i].x) / dist;
			player.y = mY + (player.r + trees[i].r) * 0.55 * (player.y - trees[i].y) / dist;
		}
	}
}

function render() {
	ctx.clearRect(0, 0, W, H);

	player.render();

	for(var i = 0; i < treesCount; i++) {
		trees[i].render();
	}
}

function gameLoop() {
	update();
	render();

	requestAnimationFrame(gameLoop);
}

$(window).keydown(function(e) {
	keys[e.which] = true;
});

$(window).keyup(function(e) {
	keys[e.which] = false;
});