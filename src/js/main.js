(function(){

/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, MovingPlatformUP:true, createjs:true, FPSMeter:true, 
bean:true, World:true, Player:true, Image:true, WorldTile:true, TileMap:true*/
var App = (function(){

	var boxes, platforms, movingboxes, player, keys, width, height, x;
	var ticker;
	var world;
	var deathzones;
	var cameras, cameraVisibilities;
	var aantalSwitches;
	var endPoint;

	var tileset;
	var map;

	var currentLevel;
	var square;


	function App(level){
		boxes = [];
		platforms = [];
		movingboxes = [];
		keys = [];
		deathzones = [];
		cameras = [];
		cameras[0] = [];
		cameras[1] = [];
		cameras[2] = [];
		aantalSwitches = 0;
		cameraVisibilities = [];
		currentLevel = level;

		stage = new createjs.Stage('cnvs');
		world = new World(1200, 800);

		width = stage.canvas.width;
		height = stage.canvas.height;
		world.boundH = -(world.height-height);
		world.boundW = -(world.width-width);

		buildBounds();
		
		map = new TileMap(currentLevel);
		bean.on(map, 'mapLoaded', mapLoadedHandler);

		//ticker, voor stage refresh.

		window.onkeydown = keydown;
		window.onkeyup = keyup;

		stage.addChild(world.container);
	}

	function mapLoadedHandler(){
		world.addChild(map.displayobject);
		player = new Player(50, 600);
		player.gravity = world.gravity;
		player.friction = world.friction;
		world.addChild(player.displayobject);

		//collision logica
		boxes = boxes.concat(map.collisiontiles);
		platforms = map.platformtiles;
		deathzones = map.deathzones;
		movingboxes = map.movingtiles;

		//camera logica
		cameras[0] = map.collisiontiles.concat(map.worldtiles, map.deathzones, map.platformtiles);
		console.log(cameras[0]);
		cameras[1] = map.movingtiles;
		initCameras();

		endPoint = map.endPoint;

		ticker = createjs.Ticker;
		ticker.setFPS('60');
		ticker.addEventListener('tick', update);
	}

	function update() {

		player.grounded = false;

		for (var i = 0; i < boxes.length ; i++) {
			
			switch(CollisionDetection.checkCollision(player, boxes[i], "box")){
			case "l":
				player.velX = 0;
			break;
			case "r":
				player.velX = 0;
			break;
			case "t":
				player.velY *= -1;
			break;
			case "b":
				player.grounded = true;
				player.jumping = false;
			break;
			}
		}

		for (var j = 0; j < platforms.length ; j++) {
			
			switch(CollisionDetection.checkCollision(player, platforms[j], "platform")){
			case "b":
				player.grounded = true;
				player.jumping = false;
			break;
			}
		}

		for (var k = 0; k < deathzones.length; k++) {
			switch(CollisionDetection.checkCollision(player, deathzones[k], "deathzone")){

			case "l":
				player.velX = 0;
				player.x = 50;
				player.y = 600;
			break;
			case "r":
				player.velX = 0;
				player.x = 50;
				player.y = 600;
			break;
			case "t":
				player.velY *= -1;
				player.x = 50;
				player.y = 600;
			break;
			case "b":
				player.grounded = true;
				player.jumping = false;
				player.x = 50;
				player.y = 600;
			break;
			}
		}

		for(var l = 0; l < movingboxes.length; l++) {
			movingboxes[l].update();
			var box = movingboxes[l];
			switch(CollisionDetection.checkCollision(player, box, "movingbox")){

			case "l":
				player.velX = 0;
			break;
			case "r":
				player.velX = 0;
			break;
			case "t":
				player.velY *= -1;
			break;
			case "b":
				player.grounded = true;
				player.jumping = false;
				player.movingPlatformSpeed = box.speed;
				player.onMovingPlatform = true;
				if(box.orientation === "left"){
					player.velX = -(box.speed);
					player.friction = 1;
				}else if(box.orientation === "right"){
					player.velX = box.speed;
					player.friction = 1;
				}
				//player.velX = movingboxes[l].speed;
			break;
			}
		}

		if(CollisionDetection.checkSuitcaseCollision(player, endPoint)){
			console.log('GOTTA CATCH EM ALL');
		}

		if(keys[37]){
			//links
			if(player.velX > -player.speed){
				if(player.friction === 1){
					player.velX -= 2;
				}else{
					player.velX --;
				}
			}
		}

		if(keys[38]){
			//omhoog
			if(player.grounded && !player.jumping){
				player.grounded = false;
				player.jumping = true;
				player.velY = -player.speed * 2;
			}
		}

		if(keys[39]){
			//rechts
			if(player.velX < player.speed) {
				//Wanneer friction 1 is => zit je op moving platform left of right;
				if(player.friction === 1){
					player.velX += 2;
				}else{
					player.velX ++;
				}
			}
		}

		player.update();
		player.friction = world.friction;
		stage.update();
	}

	function keydown(event) {
		keys[event.keyCode] = true;

		if(event.keyCode === 90){
			updateCameras(1, true);
			updateCameras(0, false);
			aantalSwitches++;
		//document.getElementById("aantal").innerHTML = aantalSwitches;
		}

		if(event.keyCode === 65){
			updateCameras(1, false);
			updateCameras(0, true);
			aantalSwitches++;
		//document.getElementById("aantal").innerHTML = aantalSwitches;
		}
	}

	function keyup(event) {
		keys[event.keyCode] = false;
	}

	function buildBounds(){
		boxes.push(new Bound(0, world.height-1, world.width, 1));
		//boxes.push(new Bound(0, 0, world.width, 1));
		boxes.push(new Bound(0, 0, 1, world.height));
		boxes.push(new Bound(world.width-1, 0, 1, world.height));
	}


	function initCameras(){
		console.log("init cameras");
		cameraVisibilities[0] = true;
		cameraVisibilities[1] = false;

		for (var i = 0; i < cameras[1].length; i++)
		{
			cameras[1][i].displayobject.visible = false;
		}
	}

	function updateCameras(cameraNumber, visibility){

		for(var i = 0; i < cameras[cameraNumber].length; i++)
		{
			cameras[cameraNumber][i].displayobject.visible = visibility;
			cameraVisibilities[cameraNumber] = visibility;
		}
	}

	return App;

})();

var Bound = (function(){

	function Bound(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	return Bound;

})();

var CollisionDetection = (function(){

	function CollisionDetection(){

	}

	CollisionDetection.checkCollision = function(shapeA, shapeB, type){
		//verschil in x en y van de twee shapes;
		var vX = (shapeA.x + (shapeA.width/2)) - (shapeB.x + (shapeB.width/2));
		var vY = (shapeA.y + (shapeA.height/2)) - (shapeB.y + (shapeB.height/2));
		var hWidths = (shapeA.width/2) + (shapeB.width/2);
		var hHeights = (shapeA.height/2) + (shapeB.height/2);
		var colDir = "";

		if(Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
			var oX = hWidths - Math.abs(vX);
			var oY = hHeights - Math.abs(vY);
			if(oX >= oY)
			{
				//top of bottom :')
				if(vY > 0){
					colDir = "t";
					if(type === "box"){
						shapeA.y += oY;
					}
			
				}else{
					colDir = "b";
					shapeA.y -= oY;
				}

			}else{
				
				if(vX > 0){
					colDir = "l";
					if(type === "box"){
						shapeA.x += oX;
					}
				}else{
					colDir = "r";
					if(type === "box"){
						shapeA.x -= oX;
					}
				}

			}

			return colDir;
		}
	};

	CollisionDetection.checkSuitcaseCollision = function(shapeA, shapeB){
		var vX = (shapeA.x + (shapeA.width/2)) - (shapeB.x + (shapeB.width/2));
		var vY = (shapeA.y + (shapeA.height/2)) - (shapeB.y + (shapeB.height/2));
		var hWidths = (shapeA.width/2) + (shapeB.width/2);
		var hHeights = (shapeA.height/2) + (shapeB.height/2);

		if(Math.abs(vX) < hWidths && Math.abs(vY) < hHeights){
			return true;
		}
	};

	return CollisionDetection;

})();

/*globals createjs:true*/
var MovingPlatformUP = (function(){

	function MovingPlatformUP(x, y, width, height, color, downBound, upBound, startOrientation, speed){
		this.x = x;
		this.y = y;
		this.color = color;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.orientation = startOrientation;
		this.downBound = downBound;
		this.upBound = upBound;
		this.shape = new createjs.Shape();
		this.shape.x = this.x;
		this.shape.y = this.y;
		var self = this;
		self.draw();
	}

	MovingPlatformUP.prototype.draw = function() {
		this.shape.graphics.c();
		this.shape.graphics.f(this.color);
		this.shape.graphics.dr(0, 0, this.width, this.height);
		this.shape.graphics.ef();
		this.move();
	};

	MovingPlatformUP.prototype.move = function() {
		if(this.orientation === 'u'){
			createjs.Tween.get(this).to({y:this.upBound}, this.speed).call(this.changeOrientation);
			createjs.Tween.get(this.shape).to({y:this.upBound}, this.speed);
			console.log(this.y);
		}else{
			createjs.Tween.get(this).to({y:this.downBound}, this.speed).call(this.changeOrientation);
			createjs.Tween.get(this.shape).to({y:this.downBound}, this.speed);
		}
	};

	MovingPlatformUP.prototype.changeOrientation = function() {
		if(this.orientation === 'u') {
			this.orientation = 'd';
		} else {
			this.orientation = 'u';
		}
		this.move();
	};

	MovingPlatformUP.prototype.setVisibility = function(visible) {
		this.shape.visible = visible;
	};



	return MovingPlatformUP;

})();

/*globals createjs:true*/
var MovingTile = (function(){

	function MovingTile(sprite, tilewidth, tileheight, targetX, targetY, speed){
		this.sprite = sprite;
		this.width = tilewidth;
		this.height = tileheight - 30;
		this.speed = speed;
		this.targetX = targetX;
		this.targetY = targetY;
		this.displayobject = new createjs.Container();
		this.originalX = this.x = this.displayobject.x = this.sprite.x;
		this.originalY = this.y = this.displayobject.y = this.sprite.y;
		this.displayobject.name = name;
		this.displayobject.obj = this;
		this.displayobject.width = this.width;
		this.displayobject.height = this.height;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.orientation = "";
		this.displayobject.addChild(this.sprite);
		this.calculateOrientation();
	}

	MovingTile.prototype.calculateOrientation = function(first_argument) {
		if(this.targetX < this.originalX){
			this.orientation = "left";
		}else if(this.targetX > this.originalX){
			this.orientation = "right";
		}

		if(this.targetY > this.originalY){
			this.orientation = "down";
		}else if(this.targetY < this.originalY){
			this.orientation = "up";
		}
	};

	MovingTile.prototype.update = function() {
		var temp = "";
		if(this.orientation === "left"){

			if(this.x > this.targetX) {
				this.x -= this.speed;
			}else if(this.x <= this.targetX) {
				this.orientation = "right";
				temp = this.targetX;
				this.targetX = this.originalX;
				this.originalX = temp;
			}

		}else if(this.orientation === "right"){

			if(this.x < this.targetX) {
				this.x += this.speed;
			}else if(this.x >= this.targetX) {
				this.orientation = "left";
				temp = this.targetX;
				this.targetX = this.originalX;
				this.originalX = temp;
			}
		}

		if(this.orientation === "up"){

			if(this.y > this.targetY){
				this.y -= this.speed;
			}else if (this.y <= this.targetY) {
				this.orientation = "down";
				temp = this.targetY;
				this.targetY = this.originalY;
				this.originalY = temp;
			}

		}else if(this.orientation === "down"){

			if(this.y < this.targetY) {
				this.y += this.speed;
			}else if (this.y >= this.targetY) {
				this.orientation = "up";
				temp = this.targetY;
				this.targetY = this.originalY;
				this.originalY = temp;
			}
		}

		this.displayobject.x = this.x;
		this.displayobject.y = this.y;

		//createjs.Tween.get(this.displayobject, {override:true, loop:true}).to({x:this.target.x, y: this.target.y}, 2000).to({x:this.originalX, y:this.originalY}, 2000).addEventListener("change", this.setPosition.bind(this));
		//createjs.Tween.get(self.displayobject, {override:true, loop:true}).wait(2000).to({x:self.originalX, y: self.originalY}, 2000).addEventListener("change", self.setPosition.bind(self));
	};

	return MovingTile;

})();

/*globals createjs:true */
var Platform = (function(){
	
	function Platform(x, y, width, height, color, name){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.name = name;
		this.color = color;
		this.displayobject = new createjs.Container();
		this.displayobject.name = this.name;
		this.displayobject.obj = this;
		this.displayobject.x = this.x;
		this.displayobject.y = this.y;
		
		this.draw();
	}

	Platform.prototype.update = function (body) {
		this.displayobject.x = body.state.pos.get(0);
		this.displayobject.y = body.state.pos.get(1);

		var angle = body.state.angular.pos * (180/Math.PI);

		if(angle > 360) {
			angle = angle % 360;
		}else if(angle < -360) {
			angle = angle % -360;
		}
		//this.displayobject.rotation = angle;

		

	};

	Platform.prototype.draw = function() {
		var rectangle = new createjs.Shape();
		rectangle.graphics.c();
		rectangle.graphics.f(this.color);
		rectangle.graphics.dr(0, 0, this.width, this.height);
		rectangle.graphics.ef();

		this.displayobject.addChild(rectangle);
	};

	return Platform;

})();

/*globals createjs:true*/
var Player = (function(){

	function Player(x, y){
		this.x = x;
		this.y = y;
		this.velX = 0;
		this.velY = 0;
		this.speed = 3;
		this.friction = 0.8;
		this.gravity = 0.3;
		this.grounded = false;
		this.jumping = false;
		this.width = "";
		this.height = "";
		this.displayobject = new createjs.Container();
		this.displayobject.obj = this;
		this.displayobject.x = this.x;
		this.displayobject.y = this.y;
		this.playerImg = new Image();
		this.playerSprite ="";
		this.animation = "";
		var self = this;
		this.movingPlatformSpeed = 0;
		this.onMovingPlatform = false;
		self.initCharacter();
	}

	Player.prototype.initCharacter = function() {
		var spritesheet = new createjs.SpriteSheet({
			"images": ["images/character.png"],
			"frames": {"width":20, "height":38, "count":7, "regX": 0, "regY":0},
			"animations": {
				runRight: {
					frames:[0, 1, 2, 1],
					speed: 0.1
				},
				runLeft: {
					frames:[6, 5, 4, 5],
					speed: 0.1
				},
				jump: {
					frames: [1, 2],
					speed: 0.1
				},
				idle: {
					frames: [3]
				}
			}
		});

		this.playerSprite = new createjs.Sprite(spritesheet, "idle");
		this.animation = "idle";
		this.playerSprite.x = 1;
		this.displayobject.addChild(this.playerSprite);
		this.displayobject.width = this.width = 18;
		this.displayobject.height = this.height = 38;
		console.log(this.displayobject, this.playerSprite, spritesheet);
	};

	Player.prototype.update = function(friction) {
		if(this.grounded){
			this.velY = 0;
		}
		this.y += this.velY;
		this.x += this.velX;
		this.displayobject.x = this.x;
		this.displayobject.y = this.y;
		//vertraagt de player, als de velocity niet meer geupdate wordt
	
		this.velX *= this.friction;
		this.velY += this.gravity;

		//wanneer de movingspeed = 10 dan staat player NIET op platform, platforms gaan zo rap niet



		if(!this.onMovingPlatform){
			if(this.velX > 0.1){
				if(this.animation !== 'runRight'){
					this.playerSprite.gotoAndPlay('runRight');
					this.animation = 'runRight';
				}
			}else if(this.velX < -0.1){
				if(this.animation !== 'runLeft'){
					this.playerSprite.gotoAndPlay('runLeft');
					this.animation = 'runLeft';
				}
			}else if(this.velX <= 0.1 && this.velX >= -0.1){
				if(this.animation !== 'idle'){
					this.playerSprite.gotoAndPlay('idle');
					this.animation = 'idle';
				}
			}
			//player zit op movingplatform
		}else {
			if(this.velX > (this.movingPlatformSpeed + 0.1)){
				if(this.animation !== 'runRight'){
					this.playerSprite.gotoAndPlay('runRight');
					this.animation = 'runRight';
				}
			}else if(this.velX < -(this.movingPlatformSpeed + 0.1)){
				if(this.animation !== 'runLeft'){
					this.playerSprite.gotoAndPlay('runLeft');
					this.animation = 'runLeft';
				}
			}else{
				if(this.animation !== 'idle'){
					this.playerSprite.gotoAndPlay('idle');
					this.animation = 'idle';
				}
			}
		}
		
	};
	return Player;

})();

/*globals createjs:true*/
var Reward = (function(){
	
	function Reward(x, y, radius, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
		this.shape = new createjs.Shape();
		this.shape.x = this.x;
		this.shape.y = this.y;
		this.draw();
	}

	Reward.prototype.draw = function() {
		this.shape.graphics.c();
		this.shape.graphics.f(this.color);
		this.shape.graphics.dc(this.x + (this.radius/2), this.y + (this.radius/2), this.radius);
		this.shape.graphics.ef();
	};

	Reward.prototype.setVisibility = function(visible) {
		this.shape.visible = visible;
	};

	return Reward;

})();

/*globals createjs:true*/
var Tile = (function(){

	function Tile(sprite, name, tilewidth, tileheight){
		this.sprite = sprite;
		this.name = name;
		this.width = tilewidth;
		this.height = tileheight;
		this.displayobject = new createjs.Container();
		this.x = this.displayobject.x = this.sprite.x;
		this.y = this.displayobject.y = this.sprite.y;
		this.displayobject.name = name;
		this.displayobject.obj = this;
		this.displayobject.width = this.width;
		this.displayobject.height = this.height;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.displayobject.addChild(this.sprite);
	}

	return Tile;

})();


/*globals createjs:true, Tile:true, MovingTile:true, bean:true*/
var TileMap = (function(){

	function Map(currentLevel){
		this.currentLevel = currentLevel;
		this.weather = "";
		this.mapData = "";
		this.worldtiles = [];
		this.collisiontiles = [];
		this.deathzones = [];
		this.platformtiles = [];
		this.movingtiles = [];
		this.displayobject = new createjs.Container();
		this.endPoint = "";
		this.draw();
	}

	Map.prototype.draw = function() {
		var self = this;
		var jsonURL = 'maps/level' + self.currentLevel + '/level.json';
		/** JSON VAN HET JUISTE LEVEL INLADEN **/
		$.ajax({
			context:this,
			url:jsonURL,
			success:self.jsonLoaded}
		);
		console.log('json inladen');
	};

	Map.prototype.jsonLoaded = function( data ){
		var self = this;
		this.mapData = data;
		this.tileset = new Image();
		this.tileset.src = this.mapData.tilesets[0].image;
		console.log('json ingeladen', this.mapData.tilesets[0]);
		this.tileset.onLoad = self.initLayers();
	};

	Map.prototype.initLayers = function(){
		/** DE JUISTE LAYER UIT HET JSONBESTAND OPHALEN **/
		var self = this;
		console.log(this);
		var w = this.mapData.tilesets[0].tilewidth;
		var h = this.mapData.tilesets[0].tileheight;
		this.weather = this.mapData.weather;
		var imageData = {
			images: [ this.tileset ],
			frames: {
				width: w,
				height: h
			}
		};

		console.log('ImageData: ', imageData);

		var tilesetSheet = new createjs.SpriteSheet(imageData);

		for(var idx = 0; idx < this.mapData.layers.length; idx++) {
			var layerData = this.mapData.layers[idx];
			if(layerData.type === "tilelayer"){
				this.initLayer(layerData, tilesetSheet, this.mapData.tilewidth, this.mapData.tileheight);
			}
		}

		if(this.weather === "snowy"){
			console.log('het sneeuwt');
		}

		bean.fire(self, 'mapLoaded');
	};


	Map.prototype.initLayer = function(layerData, tilesetSheet, tilewidth, tileheight) {
		var self=this;
		var platformteller= 0;
		var targetX = "";
		var targetY = "";

		for (var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;

				if(layerData.data[idx] instanceof Array){
					console.log('Moving Platform: ', layerData.data[idx]);
					cellBitmap.gotoAndStop(layerData.data[idx][0] - 1);
					targetX = (x + layerData.data[idx][1]) * tilewidth;
					targetY = (y + layerData.data[idx][2]) * tileheight;

					console.log('Target: ', targetX, targetY);
				}else{
					cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				}
				
				cellBitmap.x = x * tilewidth;
				cellBitmap.y = y * tileheight;
				
				if(layerData.data[idx] !== 0)
				{
					platformteller++;
					var name = "platform" + platformteller;
					var worldTile = "";
					switch (layerData.name)
					{
						case "World":

							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
						break;

						case "Suitcase":
							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("platform  added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
							this.endPoint = worldTile;
						break;

						case "Collision":

							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("collision worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.collisiontiles.push(worldTile);
							//cameras[0].push(boxDeath);
						break;

						case "Deadzone":
							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("deadzone added");
							this.displayobject.addChild(worldTile.displayobject);
							this.deathzones.push(worldTile);
						break;

						case "Platform":
							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("platform  added");
							this.displayobject.addChild(worldTile.displayobject);
							this.platformtiles.push(worldTile);
						break;

						case "MovingPlatform":
							var speed = layerData.speed;
							worldTile = new MovingTile(cellBitmap, tilewidth, tileheight, targetX, targetY, speed);
							console.log("movingplatform added with target: ", targetX, targetY);
							this.displayobject.addChild(worldTile.displayobject);
							this.movingtiles.push(worldTile);
						break;

					}
				}
			}
		}
	};

	return Map;

})();

/*globals createjs:true*/
var World =(function(){
	var boundH, boundW;

	function World(width, height) {
		this.friction = 0.8;
		this.gravity = 0.3;
		this.width = width;
		this.height = height;

		this.container = new createjs.Container();
	}

	World.prototype.addChild = function(element) {
		this.container.addChild(element);
	};

	/*World.prototype.followPlayerX = function(player, width, offset) {
		var x = -(player.x - (width/2)) + offset;
		if(x < this.boundW) {
			this.container.x = this.boundW;
		}else if(x > 0) {
			this.container.x = 0;
		}else {
			this.container.x = x;
		}
	};

	World.prototype.followPlayerY = function(player, height, offset) {
		var y = -(player.y - (height/2)) + offset;
		if(y < this.boundH) {
			this.container.y = this.boundH;
		}else if(y > 0) {
			this.container.y = 0;
		}else {
			this.container.y = y;
		}
	};*/

	return World;

})();

/*globals App:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS"];
	var timer = 0;

	function init()
	{
		menu();
		$("#levels").hide();
		$("#controls").hide();
		$("canvas").hide();

		setInterval(function(){
			animation();
		},1000);
	}

	function animation()
	{
		if(timer < 9)
		{
			$("#guy").attr("src","images/guyNormal.png");
			timer +=1;
		}
		else if(timer === 9)
		{
			$("#guy").attr("src","images/guyDrink.png");
			timer = 0;
		}
		
	}


	function menu()
	{
		$( "#previous").click(function(){
			switch($("h1").html())
			{
				case menuItems[0]:

					$("h1").html(menuItems[2]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1200");
					$("#menu").css("margin-top","10%");
					$("#controls").fadeIn();
				break;

				case menuItems[1]:
					$("h1").html(menuItems[0]);
					$("h1").addClass("hover");
					$("#buttons").css("width","800");
					$("#levels").fadeOut();
					$("#menu").css("margin-top","20%");
				break;

				case menuItems[2]:
					$(".buttons").slideToggle();
					$("h1").html(menuItems[1]);
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;
			}
		});

		$("#next").click(function(){

			switch($("h1").html())
			{
				case menuItems[0]:
					$("h1").html(menuItems[1]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;

				case menuItems[1]:
					$(".buttons").slideToggle();
					$("#controls").fadeIn();
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#levels").fadeOut();
				break;

				case menuItems[2]:
					$("#controls").fadeOut();
					$("h1").html(menuItems[0]);
					$("#buttons").css("width","800");
					$("h1").addClass("hover");
					$("#menu").css("margin-top","20%");
				break;
			}
		});

		$("h1").click(function(){
			if($(this).html() === menuItems[0])
			{
				startGame(1);
			}
		});

		$("#levels li").click(function(){

			if ($(this).hasClass("show"))
			{
				startGame($(this).index() + 1);
			}

		});

	}

	function startGame(level)
	{
		$("#menu").remove();
		var app = new App(level);
		$("canvas").show();
		changeAudio("level" + level);
	}

	function changeAudio(track)
	{
		var myAudio=$("#audio");
        var audioSub = myAudio.get(0);
        var playmode=audioSub.paused;
		myAudio.attr('src','audio/'+ track + '.ogg');
        playmode = true;
        audioSub.play();
	}

	init();

	

})();



})();