var keyBinds = [87, 83, 65, 68, 81, 69, 16, 32, 13];
var keys = [];
var mouse = {
	x: 0,
	y: 0,
	left: false,
	right: false
}

var W, H, player, world, canvas, ctx, trees, treesCount, camera, minimap, friction, titans, titansCount, titanMinSpd, titanMaxSpd, titanMinSize, titanMaxSize;

var lastUpdate = Date.now();

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
function length(a) {
	return Math.sqrt(Math.abs((a.x * a.x) + (a.y * a.y)));
}
function normalize(a) {
	var lng = length(a);
	var nx = a.x / lng;
	var ny = a.y / lng;
	return {x: nx, y: ny};
}

function getForce(a, b) {
	var magnitude = b.r / distance(a, b);
	var direction = {
		x: a.x - b.x,
		y: a.y - b.y
	}
	var normDir = normalize(direction);
	direction.x = normDir.x;
	direction.y = normDir.y;
	direction.x *= magnitude;
	direction.y *= magnitude;
	return direction;
}
function vectorField(a, b) {
	var force = {
		x: 0,
		y: 0
	}
	for (var i = 0; i < b.length; i++) {
		var obstacleForce = getForce(a, b[i]);
		force.x += obstacleForce.x;
		force.y += obstacleForce.y;
	}
	return force;
}

function Hook(owner) {
	this.x = 0;
	this.y = 0;

	this.owner = owner;

	this.r = 5;

	this.length = 0;
	this.maxLength = 750;

	this.speed = 0.5;
	this.hookSpeed = 25;

	this.shooted = false;
	this.hooked = false;
	this.target = {
		x: null,
		y: null
	}

	this.update = function() {
		if(this.shooted && !this.hooked) {
			if(this.x < this.target.x) this.x += this.hookSpeed;
			if(this.x > this.target.x) this.x -= this.hookSpeed;
			if(this.y < this.target.y) this.y += this.hookSpeed;
			if(this.y > this.target.y) this.y -= this.hookSpeed;		

			this.length	= distance(this.owner, this);
			if(this.length > this.maxLength) {
				this.shooted = false;
				this.hooked = false;
				this.target.x = null;
				this.target.y = null;
				this.x = null;
				this.y = null;
			}
		}
		if(this.hooked) {
			var angle = Math.atan2(this.x - this.owner.x, -(this.y - this.owner.y));
			var vx = this.speed * Math.sin(angle);
			var vy = this.speed * -Math.cos(angle);

			this.owner.velX += vx;
			this.owner.velY += vy;

			if(this.owner.gas < 150) {
				this.owner.jump(150);
			}
		}
	}

	this.render = function() {
		if(this.shooted) {
			ctx.beginPath();
			ctx.moveTo(this.owner.x - camera.x, this.owner.y - camera.y);
			ctx.lineTo(this.x - camera.x, this.y - camera.y);
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 5;
			ctx.stroke();
		}
	}
}

function Player(x, y, r, speed, color, name, acceleration) {
	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.accX = 0;
	this.accY = 0;
	this.speed = speed;
	this.acceleration = acceleration;
	this.r = r;
	this.color = color;
	this.name = name;
	this.angle = 0;
	this.inAir = false;
	this.gas = 0;
	this.obstacles = [];

	this.hooks = [new Hook(this), new Hook(this)];

	this.chargeAttack = function() {

	}

	this.releaseAttack = function() {

	}

	this.hook = function(type) {
		if(!this.hooks[type].shooted) {
			var tx = camera.x + mouse.x;
			var ty = camera.y + mouse.y;

			this.hooks[type].x = this.x;
			this.hooks[type].y = this.y;

			this.hooks[type].target.x = tx;
			this.hooks[type].target.y = ty;
			this.hooks[type].shooted = true;
			this.hooks[type].hooked = false;	
		}
	}

	this.unhook = function(type) {
		this.hooks[type].target.x = null;
		this.hooks[type].target.y = null;
		this.hooks[type].shooted = false;
		this.hooks[type].hooked = false;
		this.hooks[type].x = null;
		this.hooks[type].y = null;
	}

	this.jump = function(amm) {
		this.gas += amm;
		this.inAir = true;
	}

	this.update = function(dt) {
		if(keys[keyBinds[0]]) {	// W
			if(this.accY > -this.speed) {
				this.accY -= this.acceleration;
			}
		}
		if(keys[keyBinds[1]]) {	// S
			if(this.accY < this.speed) {
				this.accY += this.acceleration;
			}
		}
		if(keys[keyBinds[2]]) {	// A
			if(this.accX > -this.speed) {
				this.accX -= this.acceleration;
			}
		}
		if(keys[keyBinds[3]]) {	// D
			if(this.accX < this.speed) {
				this.accX += this.acceleration;
			}
		}

		if(keys[keyBinds[0]] || keys[keyBinds[1]]) {
			this.acceleratingY = true;
		}
		else {
			this.acceleratingY = false;
		}

		if(keys[keyBinds[2]] || keys[keyBinds[3]]) {
			this.acceleratingX = true;
		}
		else {
			this.acceleratingX = false;
		}

		if(keys[keyBinds[4]]) {	// Q
			this.hook(0);
		}	
		else {
			this.unhook(0);
		}
		if(keys[keyBinds[5]]) {	// E
			this.hook(1);
		}	
		else {
			this.unhook(1);
		}	

		if(keys[keyBinds[6]]) {	// Shift
			if(!this.inAir) {
				this.jump(100);
			}
		}

		if(this.inAir) {
			this.gas--;
		}

		if(this.gas <= 0) {
			this.inAir = false;
			this.accX *= 0.5;
			this.accY *= 0.5;
		}

		this.angle = Math.atan2(-(mouse.x - (this.x - camera.x)), -(mouse.y - (this.y - camera.y)));

		this.velX += this.accX;
		this.velY += this.accY;

		var deltaFactor = (dt * 0.001) * (1000 / dt);

		this.x += this.velX * deltaFactor;
		this.y += this.velY * deltaFactor;

		if(this.velX < 0) {
			this.velX += friction;
		}
		if(this.velX > 0) {
			this.velX -= friction;
		}
		if(this.velY < 0) {
			this.velY += friction;
		}
		if(this.velY > 0) {
			this.velY -= friction;
		}	

		if(this.accX < 0) {
			this.accX += friction;
		}
		if(this.accX > 0) {
			this.accX -= friction;
		}
		if(this.accY < 0) {
			this.accY += friction;
		}
		if(this.accY > 0) {
			this.accY -= friction;
		}		

		if(this.x < 0) {
			this.x = 0;
			this.velX = 0;
			this.accX = 0;
		} 
		if(this.x > world.w - this.r) {
			this.x = world.w - this.r;
			this.velX = 0;
			this.accX = 0;
		}
		if(this.y < 0) {
			this.y = 0;
			this.velY = 0;
			this.accY = 0;
		}
		if(this.y > world.h - this.r) {
			this.y = world.h - this.r;
			this.velY = 0;
			this.accY = 0;
		}
		this.obstacles = [];
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

function Titan(x, y, r, spd) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.spd = spd;
	this.velX = 0;
	this.velY = 0;
	this.accX = 0;
	this.accY = 0;
	this.color = '#e2c25f';
	this.strokeColor = '#000000';
	this.strokeWidth = this.r / 10;
	this.angle = 0;
	this.target = {
		x: this.x,
		y: this.y
	}

	this.update = function(dt) {
		this.angle = Math.atan2(this.x - this.target.x, -(this.y - this.target.y));

		var deltaFactor = (dt * 0.001) * (1000 / dt);

		this.accX = this.spd * -Math.sin(this.angle) * deltaFactor;
		this.accY = this.spd * Math.cos(this.angle) * deltaFactor;

		this.velX += this.accX;
		this.velY += this.accY;

		this.x += this.velX;
		this.y += this.velY;

		if(this.x < 0) {
			this.x = 0;
			this.velX = 0;
			this.accX = 0;
		} 
		if(this.x > world.w - this.r) {
			this.x = world.w - this.r;
			this.velX = 0;
			this.accX = 0;
		}
		if(this.y < 0) {
			this.y = 0;
			this.velY = 0;
			this.accY = 0;
		}
		if(this.y > world.h - this.r) {
			this.y = world.h - this.r;
			this.velY = 0;
			this.accY = 0;
		}		
	}

	this.attack = function() {

	}

	this.render = function() {
		ctx.beginPath();
		ctx.arc(this.x - camera.x, this.y - camera.y, this.r, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.strokeColor;
		ctx.lineWidth = this.strokeWidth;
		ctx.stroke();
	}
}

function Tree(x, y, r) {
	this.x = x;
	this.y = y;
	this.r = r;
	this.color = '#6a4611';

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

function Minimap(w, xoff, yoff) {
	this.w = w;
	this.h = world.h * this.w / world.w;

	this.xoff = xoff;
	this.yoff = yoff;

	this.x = W - this.w - this.xoff;
	this.y = H - this.h - this.yoff;

	this.objects = [];
	this.objects2 = [];

	this.player = [this.x + player.x / (world.w / this.w), this.y + player.y / (world.h / this.h), player.r / 10];

	this.generate = function(obj, obj2) {
		for(var i = 0; i < obj.length; i++) {
			this.objects.push([this.x + obj[i].x / (world.w / this.w), this.y + obj[i].y / (world.h / this.h), obj[i].r / 20]);
		}
		for(var i = 0; i < obj2.length; i++) {
			this.objects2.push([this.x + obj2[i].x / (world.w / this.w), this.y + obj2[i].y / (world.h / this.h), obj2[i].r / 20]);
		}
	} 

	this.update = function(p, t) {
		this.player[0] = this.x + p.x / (world.w / this.w);
		this.player[1] = this.y + p.y / (world.h / this.h);

		for(var i = 0; i < t.length; i++) {
			this.objects2[0] = this.x + t[i].x / (world.w / this.w);
			this.objects2[1] = this.y + t[i].y / (world.h / this.h);
		}
	}

	this.render = function() {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
		ctx.fillRect(this.x, this.y, this.w, this.h);

		for (var i = 0; i < this.objects.length; i++) {
			ctx.beginPath();
			ctx.arc(this.objects[i][0], this.objects[i][1], this.objects[i][2], 0, 2*Math.PI);
			ctx.fillStyle = '#000000';
			ctx.fill();
		}

		for (var i = 0; i < this.objects2.length; i++) {
			ctx.beginPath();
			ctx.arc(this.objects[i][0], this.objects[i][1], this.objects[i][2], 0, 2*Math.PI);
			ctx.fillStyle = '#FF0000';
			ctx.fill();
		}

		ctx.beginPath();
		ctx.arc(this.player[0], this.player[1], this.player[2], 0, 2*Math.PI);
		ctx.fillStyle = '#FFFFFF';
		ctx.fill();
	}
}

function World(w, h) {
	this.w = w;
	this.h = h;

	this.render = function() {
		ctx.fillStyle = '#586d26';
		if(camera.x < W) {
			ctx.fillRect(-50 - player.r - camera.x, 0, 50, H);
		}
		if(camera.x > this.w - W) {
			ctx.fillRect(this.w - camera.x, 0, 50, H);
		}
		if(camera.y < H) {
			ctx.fillRect(0, -50 - player.r - camera.y, W, 50);
		}
		if(camera.y > this.h - H) {
			ctx.fillRect(0, this.h - camera.y, W, 50);
		}
	}
}

function Game(c, n) {
	console.log('Game Started');

	canvas = c;
	ctx = canvas.getContext("2d");

	world = new World(20000, 14000);

	player = new Player(random(0, world.w), random(0, world.h), 20, 0.1, '#2135ED', n, 0.01);

	trees = [];
	treesCount = 300;
	var treeMinSize = 35;
	var treeMaxSize = 75;

	for(var i = 0; i < treesCount; i++) {
		trees.push(new Tree(random(0, world.w), random(0, world.h), random(treeMinSize, treeMaxSize)));
	}

	titans = [];
	titansCount = 5;
	titanMinSpd = 1;
	titanMaxSpd = 3;
	titanMinSize = 25;
	titanMaxSize = 85;

	for (var i = 0; i < titansCount; i++) {
		titans.push(new Titan(random(0, world.w), random(0, world.h), random(titanMinSize, titanMaxSize), random(titanMinSpd, titanMaxSpd)));
	}
	console.log(titans);

	camera = new Camera(0, 0);

	minimap = new Minimap(250, 50, 50);

	minimap.generate(trees, titans);

	friction = 0.005;

	gameLoop();
}

function update(dt) {
	player.update(dt);
	camera.update(player);

	for (var i = 0; i < titans.length; i++) {
		titans[i].update(dt);
		titans[i].target = player;
	}

	minimap.update(player, titans);

	for (var i = 0; i < player.hooks.length; i++) {
		player.hooks[i].update();
	}

	for (var i = 0; i < trees.length; i++) {
		for (var j = 0; j < player.hooks.length; j++) {
			if(isColliding(trees[i], player.hooks[j])) {
				player.hooks[j].hooked = true;
			}
		}
	}

	for (var i = 0; i < titans.length; i++) {
		for (var j = 0; j < player.hooks.length; j++) {
			if(isColliding(titans[i], player.hooks[j])) {
				player.hooks[j].hooked = true;
				player.hooks[j].x = titans[i].x;
				player.hooks[j].y = titans[i].y;
			}
		}
	}

	for (var i = 0; i < titans.length; i++) {
		for (var j = 0; j < titans.length; j++) {
			if(i == j) continue;

			if(titans[i], titans[j]) {
				var obstacles = [titans[j]];
				var collisionForce = vectorField(titans[i], obstacles);
				titans[i].velX = collisionForce.x * 10;
				titans[i].velY = collisionForce.y * 10;
				titans[i].accX = 0.2;
				titans[i].accY = 0.2;				
			}
		}
	}

	for (var i = 0; i < titans.length; i++) {
		for (var j = 0; j < trees.length; j++) {
			if(isColliding(titans[i], trees[j])) {
				var obstacles = [trees[j]];				
				var collisionForce = vectorField(titans[i], obstacles);
				titans[i].velX = collisionForce.x * 10;
				titans[i].velY = collisionForce.y * 10;
				titans[i].accX = 0.2;
				titans[i].accY = 0.2;
			}
		}
	}

	for(var i = 0; i < treesCount; i++) {
		if(isColliding(player, trees[i])) {
			var obstacles = [trees[i]];
			var collisionForce = vectorField(player, obstacles);
			player.velX = collisionForce.x;
			player.velY = collisionForce.y;
			player.accX *= 0.2;
			player.accY *= 0.2;
		}
	}

	for(var i = 0; i < titansCount; i++) {
		if(isColliding(player, titans[i])) {
			var obstacles = [titans[i]];
			var collisionForce = vectorField(player, obstacles);
			player.velX = collisionForce.x;
			player.velY = collisionForce.y;
			player.accX *= 0.2;
			player.accY *= 0.2;			

			titans[i].velX = collisionForce.x;
			titans[i].velY = collisionForce.y;
			titans[i].accX *= 0.2;
			titans[i].accY *= 0.2;	
		}
	}
}

function render() {
	ctx.clearRect(0, 0, W, H);

	world.render();

	for (var i = 0; i < player.hooks.length; i++) {
		player.hooks[i].render();
	}

	player.render();

	for(var i = 0; i < treesCount; i++) {
		if(trees[i].x + trees[i].r > camera.x && trees[i].x - trees[i].r < camera.x + W && trees[i].y + trees[i].r > camera.y && trees[i].y - trees[i].r < camera.y + H) {
			trees[i].render();
		}
	}

	for (var i = 0; i < titans.length; i++) {
		titans[i].render();
	}

	minimap.render();
}

function gameLoop() {
	var now = Date.now();
	var dt = now - lastUpdate;
	lastUpdate = now;

	update(dt);
	render();

	requestAnimationFrame(gameLoop);
}

$(window).keydown(function(e) {
	keys[e.which] = true;
});

$(window).keyup(function(e) {
	keys[e.which] = false;
});

$(window).mousemove(function(e) {
	mouse.x = e.pageX;
	mouse.y = e.pageY;
});

$(window).mousedown(function(e) {
	if(e.which == 1) {
		mouse.left = true;
	}
	else if(e.which == 2) {
		mouse.right = true;
	}
});

$(window).mouseup(function(e) {
	mouse.left = false;
	mouse.right = false;
});