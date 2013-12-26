(function(){

/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, MovingPlatformUP:true, createjs:true, Reward:true, World:true, Player:true, Image:true*/
var App = (function(){

	var boxes, movingboxes, player, keys, width, height, x;
	var ticker;
	var world;
	var deathzones;
	var cameras, cameraVisibilities;
	var aantalSwitches;

	var tileset;
	var mapData;

	var currentLevel;

	function App(){
		boxes = [];
		movingboxes = [];
		keys = [];
		deathzones = [];
		cameras = [];
		cameras[0] = [];
		cameras[1] = [];
		cameras[2] = [];
		aantalSwitches = 0;
		cameraVisibilities = [];
		currentLevel = 1;

		stage = new createjs.Stage('cnvs');
		world = new World(1200, 800);

		//dimensions van het canvas
		width = stage.canvas.width;
		height = stage.canvas.height;
		world.boundH = -(world.height-height);
		world.boundW = -(world.width-width);

		buildBounds();
		buildLevel();
		//aanmaken player + adden
		player = new Player(50, world.height - 200, 20, 20);
		player.gravity = world.gravity;
		player.friction = world.friction;
		world.addChild(player.shape);
		//ticker, voor stage refresh.
		ticker = createjs.Ticker;
		ticker.setFPS('60');
		ticker.addEventListener("tick", update);

		window.onkeydown = keydown;
		window.onkeyup = keyup;

		stage.addChild(world.container);
	}

	function update() {

		if(keys[37]){
			//links
			if(player.velX > -player.speed){
				player.velX --;
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
				player.velX ++;
			}
		}

		player.grounded = false;

		for (var i = 0; i < boxes.length ; i++) {
			
			switch(CollisionDetection.checkCollision(player, boxes[i])){
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

		for (var j = 0; j < deathzones.length; j++) {
			switch(CollisionDetection.checkCollision(player, deathzones[j])){

			case "l":
				player.velX = 0;
				player.x = 50;
				player.y = world.height - 200;
			break;
			case "r":
				player.velX = 0;
				player.x = 50;
				player.y = world.height - 200;
			break;
			case "t":
				player.velY *= -1;
				player.x = 50;
				player.y = world.height - 200;
			break;
			case "b":
				player.grounded = true;
				player.jumping = false;
				player.x = 50;
				player.y = world.height - 200;
			break;
			}
		}

		player.update();
		stage.update();
	}

	function keydown(event) {
		keys[event.keyCode] = true;

		if(event.keyCode === 90){
			for (var i = 0; i < cameras[1].length; i++)
			{
				cameras[1][i].setVisibility(true);
			}
			for (var d = 0; i < cameras[0].length; d++)
			{
				cameras[0][d].alpha = 0;
			}
			aantalSwitches++;
		//document.getElementById("aantal").innerHTML = aantalSwitches;
		}

		if(event.keyCode === 65){
			for (var r = 0; r < cameras[1].length; r++)
			{
				cameras[1][r].setVisibility(false);
			}
			for (var p = 0; p < cameras[0].length; p++)
			{
				cameras[0][p].alpha = 1;
			}
			aantalSwitches++;
		//document.getElementById("aantal").innerHTML = aantalSwitches;
		}
	}

	function keyup(event) {
		keys[event.keyCode] = false;
	}

	function buildBounds(){
		boxes.push(new Bound(0, world.height-1, world.width, 1));
		boxes.push(new Bound(0, 0, world.width, 1));
		boxes.push(new Bound(0, 0, 1, world.height));
		boxes.push(new Bound(world.width-1, 0, 1, world.height));
	}

	
	function buildLevel() {
		switch(currentLevel) {
			case 1: var jsonURL = 'maps/level1/level1.json';
			break;
		}
		/** JSON VAN HET JUISTE LEVEL INLADEN **/
		$.getJSON(jsonURL, jsonLoaded);
	}

	function jsonLoaded( data ) {
		mapData = data;
		tileset = new Image();
		tileset.src = mapData.tilesets[0].image;
		tileset.onLoad = initLayers();
	}

	function initLayers() {
		/** DE JUISTE LAYER UIT HET JSONBESTAND OPHALEN **/
		var w = mapData.tilesets[0].tilewidth;
		var h = mapData.tilesets[0].tileheight;
		var imageData = {
			images: [ tileset ],
			frames: {
				width: w,
				height: h
			}
		};

		console.log('ImageData: ', imageData);

		var tilesetSheet = new createjs.SpriteSheet(imageData);

		for(var idx = 0; idx < mapData.layers.length; idx++) {
			var layerData = mapData.layers[idx];
			if(layerData.type === "tilelayer"){
				initLayer(layerData, tilesetSheet, mapData.tilewidth, mapData.tileheight);
			}
		}
		var movingBox1 = new MovingPlatform(850, world.height - 150, 100, 15, '#E3D3C6', 300, 850, 'l', 5000);
		boxes.push(movingBox1);
		stage.addChild(movingBox1.shape);
		cameras[1].push(movingBox1);
		initCameras();
	}


	function initLayer(layerData, tilesetSheet, tilewidth, tileheight) {
		for (var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;
				cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				cellBitmap.x = x * tilewidth;
				cellBitmap.y = y * tilewidth;
				console.log(cellBitmap);
				
				// add bitmap to stage
				world.addChild(cellBitmap);
				cameras[0].push(cellBitmap);


				/*LOGICA TILED KOPPELEN AAN COLLISIONDETECTION, DEADZONE, EN MOVING PLATFORM*/
				if(layerData.data[idx] !== 0)
				{
					switch (layerData.name)
					{
						case "World":
							var boxWorld = new Platform(cellBitmap.x,cellBitmap.y ,50, 50);
							boxes.push(boxWorld);
						break;

						case "Death":
							var boxDeath = new Platform(cellBitmap.x,cellBitmap.y ,50, 50);
							deathzones.push(boxDeath);
						break;

					}
				}
			}
		}
	}

	function initCameras(){
		console.log("init cameras");
		cameraVisibilities[0] = true;
		cameraVisibilities[1] = false;
		console.log(cameras);

		for (var i = 0; i < cameras[1].length; i++)
		{
			cameras[1][i].setVisibility(false);
		}
	}

	function updateCameras(cameraNumber, visibility){

		for(var i = 0; i < cameras[cameraNumber].length; i++)
		{
			cameras[cameraNumber][i].setVisibility(visibility);
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

	CollisionDetection.checkCollision = function(shapeA, shapeB){
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
					shapeA.y += oY;
			
				}else{
					colDir = "b";
					shapeA.y -= oY;
				}

			}else{
				
				if(vX > 0){
					colDir = "l";
					shapeA.x += oX;
				}else{
					colDir = "r";
					shapeA.x -= oX;
				}

			}

			return colDir;
		}
	};

	return CollisionDetection;

})();

/*globals createjs:true*/
var MovingPlatform = (function(){

	function MovingPlatform(x, y, width, height, color, leftBound, rightBound, startOrientation, speed){
		this.x = x;
		this.y = y;
		this.color = color;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.orientation = startOrientation;
		this.leftBound = leftBound;
		this.rightBound = rightBound;
		this.shape = new createjs.Shape();
		this.shape.x = this.x;
		this.shape.y = this.y;
		var self = this;
		self.draw();
	}

	MovingPlatform.prototype.draw = function() {
		this.shape.graphics.c();
		this.shape.graphics.f(this.color);
		this.shape.graphics.dr(0, 0, this.width, this.height);
		this.shape.graphics.ef();
		this.move();
	};

	MovingPlatform.prototype.move = function() {
		if(this.orientation === 'l'){
			createjs.Tween.get(this).to({x:this.leftBound}, this.speed).call(this.changeOrientation);
			createjs.Tween.get(this.shape).to({x:this.leftBound}, this.speed);
			console.log(this.x);
		}else{
			createjs.Tween.get(this).to({x:this.rightBound}, this.speed).call(this.changeOrientation);
			createjs.Tween.get(this.shape).to({x:this.rightBound}, this.speed);
		}
	};

	MovingPlatform.prototype.changeOrientation = function() {
		if(this.orientation === 'l') {
			this.orientation = 'r';
		} else {
			this.orientation = 'l';
		}
		this.move();
	};

	MovingPlatform.prototype.setVisibility = function(visible) {
		this.shape.visible = visible;
	};



	return MovingPlatform;

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

/*globals createjs:true */
var Platform = (function(){
	
	function Platform(x, y, width, height, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.width = width;
		this.height = height;
		this.shape = new createjs.Shape();
		this.shape.x = this.x;
		this.shape.y = this.y;
		this.draw();
	}

	Platform.prototype.draw = function() {
		this.shape.graphics.c();
		//this.shape.graphics.f(this.color);
		this.shape.graphics.dr(0, 0, this.width, this.height);
		this.shape.graphics.ef();
	};

	Platform.prototype.setVisibility = function(visible) {
		this.shape.visible = visible;
	};

	return Platform;

})();

/*globals createjs:true*/
var Player = (function(){

	function Player(x, y, width, height){
		this.x = x;
		this.y = y;
		this.velX = 0;
		this.velY = 0;
		this.speed = 3;
		this.friction = 0.8;
		this.gravity = 0.3;
		this.grounded = false;
		this.jumping = false;
		this.width = width;
		this.height = height;
		this.shape = new createjs.Shape();
		this.shape.x = this.x;
		this.shape.y = this.y;

		var self = this;
		self.draw();
	}

	Player.prototype.draw = function() {
		this.shape.graphics.f('#79CDCD	');
		this.shape.graphics.dr(0, 0, this.width, this.height);
		this.shape.graphics.ef();
	};

	Player.prototype.update = function() {
		if(this.grounded){
			this.velY = 0;
		}
		this.y += this.velY;
		this.x += this.velX;
		this.shape.x = this.x;
		this.shape.y = this.y;
		//vertraagt de player, als de velocity niet meer geupdate wordt
		this.velX *= this.friction;
		this.velY += this.gravity;
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
	var menuItems = ["PLAY","LEVELS","SCORES"];
	var timer = 0;


	function init()
	{
		menu();

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
		$("#previous").click(function(){

			switch($(this).next().html())
			{
				case menuItems[0]:
					$(this).next().html(menuItems[2]);
				break;

				case menuItems[1]:
					$(this).next().html(menuItems[0]);
				break;

				case menuItems[2]:
					$(this).next().html(menuItems[1]);
				break;
			}
		});

		$("#next").click(function(){

			switch($(this).prev().html())
			{
				case menuItems[0]:
					$(this).prev().html(menuItems[1]);
				break;

				case menuItems[1]:
					$(this).prev().html(menuItems[2]);
				break;

				case menuItems[2]:
					$(this).prev().html(menuItems[0]);
				break;
			}
		});

		$("li").click(function(){
			switch($(this).html())
			{
				case menuItems[0]:
					console.log("play game");
					$("#menu").remove();
					$("canvas").css("display","block");
					startGame();
				break;

				case menuItems[1]:
					console.log("select level");
				break;

				case menuItems[2]:
					console.log("leaderbord");
				break;
			}
		});

	}

	function startGame()
	{
		var app = new App();
	}

init();

})();



})();