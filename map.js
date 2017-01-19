
	// wrapper for our game "classes", "methods" and "objects"
	window.Game = {};	

	// wrapper for function random
	(function(){
		function random(min, max) {

			return Math.floor(Math.random()*(max-min+1)+min);

		}
		
		// add function random to our Game object
		Game.random = random;
		
	})();

	// wrapper for function approxEq
	(function(){
		function approxEq(v1, v2, epsilon) {

			return Math.abs(v1 - v2) < epsilon;

		}
		
		// add function approxEq to our Game object
		Game.approxEq = approxEq;
		
	})();	

	// wrapper for function collision
	(function(){
		function isColliding(a, b) {

			var distance = Math.sqrt( ( (a.x - b.x) * (a.x - b.x) ) + ( (a.y - b.y) * (a.y - b.y) ) );

			if (distance <= a.r + b.r) {
			    
				return true;

			}

		}
		
		// add "class" isColliding to our Game object
		Game.isColliding = isColliding;
		
	})();	

	// wrapper for "class" Wave
	(function(){
		function Wave(x, y, r, angle, speed) {

			this.x = x - r * -Math.sin(angle);
			this.y = y - r * Math.cos(angle);

			this.r = r;

			this.velX = 0;
			this.velY = 0;

			this.speed = speed * 3;

			this.angle = angle;

			this.dead = false;

			var THIS = this;

			setTimeout(function() {

				THIS.dead = true;

			}, 1000);

		}
		
		Wave.prototype.update = function(){
			
			this.velX = this.speed * -Math.sin(this.angle);
			this.velY = this.speed * Math.cos(this.angle);

			this.x += this.velX;
			this.y += this.velY;

		}
		
		Wave.prototype.draw = function(ctx, xView, yView){		

			var x = this.x - xView;
			var y = this.y - yView;

			ctx.save();

			ctx.beginPath();
			ctx.ellipse(x, y, this.r, this.r, this.angle - Math.PI/4, 0.5*Math.PI, 1*Math.PI);

			ctx.strokeStyle = '#0099ff';
			ctx.lineWidth = this.r / 6;
			ctx.stroke();

			ctx.beginPath();
			ctx.ellipse(x, y, this.r, this.r, this.angle - Math.PI/4, 0.5*Math.PI, 1*Math.PI);

			ctx.strokeStyle = '#4db8ff';
			ctx.lineWidth = this.r / 18;
			ctx.stroke();			

			ctx.restore();
			
		}
		
		// add "class" Wave to our Game object
		Game.Wave = Wave;
		
	})();	

	// wrapper for "class" Player
	(function(){
		function Player(x, y, r, animal){

			// position
			this.x = x;
			this.y = y;				
			
			// speed
			this.maxSpeed = 5;
			this.speed = 5;	

			// velocity
			this.velX = 0;
			this.velY = 0;	

			// radius
			this.r = r;

			// angle
			this.angle = 0;

			// animal
			this.animal = animal;

			// special abiliti arrays
			this.wave = null;

			// image of the animal
			this.image = new Image();

			if(this.animal == 'orca') this.image.src = 'http://mope.io/skins/killerwhale.png';

			// boolean variables
			this.underwater = false;

			this.underIce = false;

			this.onLand = false;

			this.boostEnabled = true;
			this.boostOn = false;

			this.canUseAbility = true;

		}
		
		Player.prototype.update = function(worldWidth, worldHeight, xView, yView, mouseX, mouseY){

			// image
			if(this.underwater) {

				this.image.src = 'http://mope.io/img/ability_dive.png';

			}
			else {

				if(this.animal == 'orca') this.image.src = 'http://mope.io/skins/killerwhale.png';

			}

			// speed decreasement / increasement
			if(this.speed > this.maxSpeed) this.speed--;
			if(this.speed < this.maxSpeed) this.speed++;

			// boost update
			if(this.boostOn) this.boost();

			// check if is on land
			this.y - this.r < worldHeight / 7 ? this.onLand = true : this.onLand = false;

			// slow down if on land
			if(this.onLand) {

				this.maxSpeed = 3

			}
			else {

				this.maxSpeed = 5;

			}

			// angle calculating			
			this.angle = Math.atan2(-( mouseX - ( this.x - xView ) ), ( mouseY - ( this.y - yView ) ));	

			// velocity calculating
			this.velX = this.speed * -Math.sin(this.angle);
			this.velY = this.speed * Math.cos(this.angle);

    		// moving
			this.x += this.velX;
			this.y += this.velY;		
			
			// don't let player leaves the world's boundary
			if(this.x - this.r < 0){
				this.x = this.r;
			}
			if(this.y - this.r < 0){
				this.y = this.r;
			}
			if(this.x + this.r > worldWidth){
				this.x = worldWidth - this.r;
			}
			if(this.y + this.r > worldHeight){
				this.y = worldHeight - this.r;
			}

		}	

		Player.prototype.ability = function(){
			
			if(this.canUseAbility) {

				if(this.animal == 'orca') {

					this.wave = new Game.Wave(this.x, this.y, this.r * 3, this.angle, this.speed);	

					this.speed += 20;	

					this.canUseAbility = false;

					var THIS = this;

					setTimeout(function() {

						THIS.canUseAbility = true;

					}, 100);

				}

			}

		}

		Player.prototype.boost = function(){
			
			if(this.boostEnabled) {	

				this.speed += 10;	

				this.boostEnabled = false;

				var THIS = this;

				setTimeout(function() {

					THIS.boostEnabled = true;

				}, 1000);


			}

		}		
		
		Player.prototype.draw = function(ctx, xView, yView){		

			var x = this.x - xView;
			var y = this.y - yView;

			ctx.save();

			ctx.translate(x, y);
			ctx.rotate(this.angle);

			ctx.drawImage(this.image, 0 - this.r, 0 - this.r, this.r * 2, this.r * 2);

			ctx.restore();
			
		}
		
		// add "class" Player to our Game object
		Game.Player = Player;
		
	})();

	// wrapper for "class" Seal
	(function(){
		function Seal(home){

			this.home = home;	

			this.x = home.x;
			this.y = home.y;

			this.r = 60;

			this.angle = 0;

			this.velX = 0;
			this.velY = 0;

			this.speed = 4;

			this.onIce = true;

			this.comingHome = false;

			this.range = {
				x: 0,
				y: 0,
				r: 500
			}

			this.image = new Image();
			this.image.src = 'http://mope.io/skins/arctic/walrus.png';

		}
		
		Seal.prototype.update = function(worldWidth, worldHeight, follower){	

			this.range.x = this.x;
			this.range.y = this.y;	

			if(this.comingHome) {

				if( Game.approxEq(this.x, this.home.x, 10) && Game.approxEq(this.y, this.home.y, 10) ) {

					this.comingHome = false;

				}

			}

			if( Game.isColliding(this.home, this) ) {

				this.onIce = true;

			}
			else {

				this.onIce = false;

			}

			if(this.onIce) {

				if(!this.comingHome) {

					this.patrol();

				}

			}
			else {


				if( Game.isColliding(this.range, follower) ) {

					this.run(follower);

				}
				else {

					this.goBack();

				}

			}

			// calculate velocity
			this.velX = this.speed * -Math.sin(this.angle);
			this.velY = this.speed * Math.cos(this.angle);

			// moving
			this.x += this.velX;
			this.y += this.velY;
			
			// don't let player leaves the world's boundary
			if(this.x - this.r < 0){
				this.x = this.r;
			}
			if(this.y - this.r < 0){
				this.y = this.r;
			}
			if(this.x + this.r > worldWidth){
				this.x = worldWidth - this.r;
			}
			if(this.y + this.r > worldHeight){
				this.y = worldHeight - this.r;
			}

		}	

		Seal.prototype.patrol = function(){

			this.angle += Math.PI/30;

		}	

		Seal.prototype.goBack = function(){

			this.angle = Math.atan2( -( this.home.x - this.x ), ( this.home.y - this.y ) );

			this.comingHome = true;

		}		

		Seal.prototype.run = function(follower){
			
			this.angle = Math.atan2( ( follower.x - this.x ), -( follower.y - this.y ) );

		}		
		
		Seal.prototype.draw = function(ctx, xView, yView){		

			var x = this.x - xView;
			var y = this.y - yView;

			ctx.save();

			ctx.translate(x, y);
			ctx.rotate(this.angle);

			ctx.drawImage(this.image, 0 - this.r, 0 - this.r, this.r * 2, this.r * 2);

			ctx.restore();
			
		}
		
		// add "class" Seal to our Game object
		Game.Seal = Seal;
		
	})();	

	// wrapper for "class" Minimap
	(function(){
		function Minimap(rWidth, rHeight, cWidth, cHeight){

			this.width = cWidth /5;
			this.height = cWidth /5 * ( rHeight / rWidth );

			this.x = cWidth - this.width * 1.1;
			this.y = this.height * 0.1;

			this.playerX = 0;
			this.playerY = 0;

			this.arcticW = this.width;
			this.arcticH = this.height /7;

			this.iceFloes = [];

			this.seals = [];

		}

		Minimap.prototype.generate = function(rWidth, rHeight, iceFloes, seals) {

			for (var i = 0; i < iceFloes.length; i++) {

				this.iceFloes.push( {x: 0, y: 0, r: 0} );

			}				

			for (var i = 0; i < this.iceFloes.length; i++) {

				this.iceFloes[i].x = this.x + iceFloes[i].x / ( rWidth / this.width );
				this.iceFloes[i].y = this.y + iceFloes[i].y / ( rHeight / this.height );

				this.iceFloes[i].r = iceFloes[i].r / 50;

			}

			for (var i = 0; i < seals.length; i++) {

				this.seals.push( {x: 0, y: 0, r: 0} );

			}				

			for (var i = 0; i < this.seals.length; i++) {

				this.seals[i].x = this.x + seals[i].x / ( rWidth / this.width );
				this.seals[i].y = this.y + seals[i].y / ( rHeight / this.height );

				this.seals[i].r = seals[i].r / 25;

			}

		}
		
		Minimap.prototype.update = function(rWidth, rHeight, player, seals){
			
			this.playerX = this.x + player.x / ( rWidth / this.width );
			this.playerY = this.y + player.y / ( rHeight / this.height );

			for (var i = 0; i < this.seals.length; i++) {

				if(this.seals[i] != undefined && seals[i] != undefined) {

					this.seals[i].x = this.x + seals[i].x / ( rWidth / this.width );
					this.seals[i].y = this.y + seals[i].y / ( rHeight / this.height );				

				}

			}

		}
		
		Minimap.prototype.draw = function(ctx){		

			ctx.save();

			// arctic
			ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
			ctx.fillRect(this.x, this.y, this.arcticW, this.arcticH);

			// ocean
			ctx.fillStyle = 'rgba(0, 102, 255, 0.7)';
			ctx.fillRect(this.x, this.y + this.arcticH, this.width, this.height - this.arcticH);

			// player
			ctx.beginPath();
			ctx.arc(this.playerX, this.playerY, 3, 0, 2*Math.PI);
			ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
			ctx.fill();

			// ice floes
			for (var i = 0; i < this.iceFloes.length; i++) {

				ctx.beginPath();
				ctx.arc(this.iceFloes[i].x, this.iceFloes[i].y, this.iceFloes[i].r, 0, 2*Math.PI);
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.fill();

			}

			// seals
			for (var i = 0; i < this.seals.length; i++) {

				if(this.seals[i] != undefined) {

					ctx.beginPath();
					ctx.arc(this.seals[i].x, this.seals[i].y, this.seals[i].r, 0, 2*Math.PI);
					ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
					ctx.fill();				

				}

			}
			
		}
		
		// add "class" Minimap to our Game object
		Game.Minimap = Minimap;
		
	})();	

	// wrapper for "class" iceFloe
	(function(){
		function IceFloe(x, y, r){

			this.x = x;
			this.y = y;

			this.r = r;

		}
		
		IceFloe.prototype.draw = function(ctx, xView, yView){		

			ctx.save();

			ctx.beginPath();
			ctx.arc(this.x - xView, this.y - yView, this.r, 0, 2*Math.PI);
			ctx.fillStyle = '#f5f5fa';
			ctx.fill();

			ctx.restore();
			
		}
		
		// add "class" iceFloe to our Game object
		Game.IceFloe = IceFloe;
		
	})();	

	// wrapper for "class" Map
	(function(){
		function Map(width, height){
			// map dimensions
			this.width = width;
			this.height = height;
			
			// map texture
			this.image = null;
		}
		
		// generate an example of a large map
		Map.prototype.generate = function(){
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			canvas.width = this.width;
			canvas.height = this.height;

			var W = this.width,
				H = this.height;		
			
			ctx.save();

			ctx.fillStyle = '#1aa3ff';
			ctx.fillRect(0, 0, this.width, this.height);


			/*// green fields biome of circle 1
			ctx.beginPath();
			ctx.arc(W*0.275, H/2, W*0.20, 1.95*Math.PI, 1.05*Math.PI);			
			ctx.fillStyle = '#0afa1b';
			ctx.fill();	

			// forest biome of circle 1
			ctx.beginPath();
			ctx.arc(W*0.275, H/2, W*0.20, 1.05*Math.PI, 1.95*Math.PI);
			ctx.fillStyle = '#04a20e';
			ctx.fill();		

			// savanna biome of circle 2
			ctx.beginPath();
			ctx.arc(W*0.725, H/2, W*0.20, 0.95*Math.PI, 2.05*Math.PI);
			ctx.fillStyle = '#dfff0a';
			ctx.fill();	

			// jungle biome of circle 2
			ctx.beginPath();
			ctx.arc(W*0.725, H/2, W*0.20, 2.05*Math.PI, 0.95*Math.PI);
			ctx.fillStyle = '#118700';
			ctx.fill();	

			// mountain biome
			ctx.beginPath();
			ctx.arc(W/2, H/2, W*0.12, 0, 2*Math.PI);
			ctx.fillStyle = '#949494';
			ctx.fill();	*/	

			// arctic biome
			ctx.fillStyle = '#f5f5fa';	
			ctx.fillRect(0, 0, W, H / 7)				
			
			// store the generate map as this image texture
			this.image = new Image();
			this.image.src = canvas.toDataURL("image/png");					
			
			// clear context
			ctx = null;
		}
		
		// draw the map adjusted to camera
		Map.prototype.draw = function(context, xView, yView){					
			
			var sx, sy, dx, dy;
            var sWidth, sHeight, dWidth, dHeight;
			
			// offset point to crop the image
			sx = xView;
			sy = yView;
			
			// dimensions of cropped image			
			sWidth =  context.canvas.width;
			sHeight = context.canvas.height;

			// if cropped image is smaller than canvas we need to change the source dimensions
			if(this.image.width - sx < sWidth){
				sWidth = this.image.width - sx;
			}
			if(this.image.height - sy < sHeight){
				sHeight = this.image.height - sy; 
			}
			
			// location on canvas to draw the croped image
			dx = 0;
			dy = 0;
			// match destination with source to not scale the image
			dWidth = sWidth;
			dHeight = sHeight;									
			
			context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);			
		}
		
		// add "class" Map to our Game object
		Game.Map = Map;
		
	})();

	// Game Script
	function game(){
		// prepaire our game canvas
		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;		

		// game settings:	
		var FPS = 30;
		var INTERVAL = 1000/FPS; // milliseconds
		
		// setup an object that represents the room
		var room = {
			width: 5000,
			height: 3500,
			map: new Game.Map(5000, 3500)
		};

		var mouseX = 0;
		var mouseY = 0;
		
		// generate a large image texture for the room
		room.map.generate();
		 
		// setup player
		var player = new Game.Player( Game.random(1, room.width), Game.random(1, room.height), 85, 'orca');		
		
		// setup the camera
		var camera = {
			x: 0,
			y: 0
		}		

		// ice floes
		var iceFloes = [];
		for (var i = 0; i < 20; i++) {

			iceFloes.push( new Game.IceFloe( Game.random(1, room.width), Game.random(room.height /7, room.height), Game.random(150, 225) ) );
			
		}

		// seals
		var seals = [];
		for (var i = 0; i < iceFloes.length; i += 2) {

			seals.push( new Game.Seal(iceFloes[i]) );

		}

		// make a minimap
		var minimap = new Game.Minimap(room.width, room.height, canvas.width, canvas.height);		
		minimap.generate(room.width, room.height, iceFloes, seals);
		
		// Game update function
		var update = function(){	

			player.update(room.width, room.height, camera.x, camera.y, mouseX, mouseY);	

			if(player.wave != null) {

				player.wave.update();

				if(player.wave.dead) {

					player.wave = null;

				}	

			}		

			for (var i = 0; i < iceFloes.length; i++) {

				if( Game.isColliding(iceFloes[i], player) ) {

					player.underIce = true;

				}
				else {

					player.underIce = false;

				}

			}		

			if(player.wave != null) {

				for (var i = 0; i < seals.length; i++) {

					if(seals[i] != undefined) {

						if( Game.isColliding(player.wave, seals[i]) ) {

							seals[i].x += player.wave.velX;
							seals[i].y += player.wave.velY;

						}

					}

				}

			}		

			for (var i = 0; i < seals.length; i++) {

				if(seals[i] != undefined) {

					seals[i].update(room.width, room.height, player);

				}

			}

			for (var i = 0; i < seals.length; i++) {

				if(seals[i] != undefined) {

					if(!player.underwater && !player.underIce) {

						if( Game.isColliding(seals[i], player) ) {

							seals.splice(i, 1);

						}

					}

				}

			}

			camera.x = player.x - canvas.width /2;
			camera.y = player.y - canvas.height /2;

			minimap.update(room.width, room.height, player, seals);

		}
			
		// Game draw function
		var draw = function(){

			context.clearRect(0, 0, canvas.width, canvas.height);
			
			room.map.draw(context, camera.x, camera.y);		

			player.draw(context, camera.x, camera.y);

			if(player.wave != null) player.wave.draw(context, camera.x, camera.y);			

			for (var i = 0; i < iceFloes.length; i++) {

				iceFloes[i].draw(context, camera.x, camera.y);

			}

			for (var i = 0; i < seals.length; i++) {

				if(seals[i] != undefined) {

					seals[i].draw(context, camera.x, camera.y);

				}

			}

			minimap.draw(context);

		}
		
		// Game Loop
		var gameLoop = function(){        				
			update();
			draw();
		}

		var int = setInterval(gameLoop, INTERVAL);

		$(window).mousemove(function(event) {

			mouseX = event.pageX;
			mouseY = event.pageY;

		});

		$(window).mousedown(function(event) {

			if(event.which == 1) {

				player.boostOn = true;

			}

			if(event.which == 3) {

				if(!player.onLand) {

					player.underwater = true;

					player.ability();					

				} 

			}

		});		

		$(window).mouseup(function(event) {

			if(event.which == 1) {

				player.boostOn = false;

			}			

			if(event.which == 3) {

				player.underwater = false;

			}

		});		

		$(window).contextmenu(function(event) {

			event.preventDefault();

		});				
		
	}


	// start the game when page is loaded
	window.onload = function(){	
		game();
	}
