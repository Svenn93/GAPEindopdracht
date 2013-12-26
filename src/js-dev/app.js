/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, MovingPlatformUP:true, createjs:true, Reward:true, World:true, Player:true, Image:true*/
var App = (function(){

	var boxes, movingboxes, player, keys, width, height, x;
	var ticker;
	var world;
	var deathzones;
	var cameras, cameraVisibilities;
	var aantalSwitches;
	var mapDataJson;

	var tileset;
	var mapData;

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
		stage = new createjs.Stage('cnvs');
		world = new World(1200, 800);

		//dimensions van het canvas
		width = stage.canvas.width;
		height = stage.canvas.height;
		world.boundH = -(world.height-height);
		world.boundW = -(world.width-width);

		buildBounds();
		buildPlatforms();
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

	
	function buildPlatforms() {
		/**TILED EXPERIMENTJE**/
		$.getJSON('maps/level1/level1.json', jsonLoaded);
		
		//var box1 = new Platform(0, height-40 ,200, 40, '#000000');
		//var box2 = new Platform(500, height-40, 200, 40, '#000000');
		//var box3 = new Platform(700, 40, 150, height-40, '#000000');
		
		//var box4 = new Platform(580, height-280, 20, 140, '#000000');
		//var box5 = new Platform(0, height - 200, 580, 60, '#000000');

		//var box10 = new Platform(100, height - 370, 100, 20, '#000000');
		//var box11 = new Platform(80, 0, 20, 350, '#000000');
		//var box12 = new Platform(250, height - 330, 50, 20, '#000000');


		//ladder
		//var box6 = new Platform(650, height -100, 50, 20, '#000000');
		//var box7 = new Platform(600, height -160, 50, 20, '#000000');
		//var box8 = new Platform(650, height -220, 50, 20, '#000000');
		//var box9 = new Platform(600, height -280, 50, 20, '#000000');

		//Rewards
		//var reward = new Reward(10, 10, 15, "#ffd700");

		var movingBox1 = new MovingPlatform(850, world.height - 150, 100, 15, '#E3D3C6', 300, 850, 'l', 5000);
		//var movingBox2 = new MovingPlatform(80, height - 310, 100, 20, '#00ff00', 80, 500, 'r', 4500);
		//var movingBox3 = new MovingPlatformUP(0, height - 310, 80, 20, '#00ff00', height - 310, 50, 'u', 4500);

		//var deathzone1 = new Platform(200, height - 40, 300, 40, '#ff0000');
		//var deathzone2 = new Platform(0, height - 260, 580, 60, '#ff0000');

		//******VISUEEL WEERGEVEN****////
		//world.addChild(box1.shape);
		//world.addChild(box2.shape);
		//world.addChild(box3.shape);
		//world.addChild(box4.shape);
		//world.addChild(box5.shape);
		//world.addChild(box6.shape);
		//world.addChild(box7.shape);
		//world.addChild(box8.shape);
		//world.addChild(box9.shape);
		//world.addChild(box10.shape);
		//world.addChild(box11.shape);
		//world.addChild(box12.shape);
		//world.addChild(deathzone1.shape);
		//world.addChild(deathzone2.shape);
		stage.addChild(movingBox1.shape);
		//world.addChild(movingBox2.shape);
		//world.addChild(movingBox3.shape);
		//world.addChild(reward.shape);

		//****COLLISION LOGICA*******/
		boxes.push(movingBox1);
		//deathzones.push(deathzone1, deathzone2);


		//*******CAMERA LOGICA******//
		//stilstaande platforms + deathzones
		//cameras[0].push(box1, box2, box3, box4, box5, box6, box7, box8, box9, box10, box11, box12, deathzone1, deathzone2);

		//bewegende platforms
		cameras[1].push(movingBox1);

		for(var i = 0; i<deathzones.length; i++)
		{
			deathzones[i].setVisibility(false);
		}

		initCameras();
	}

	function jsonLoaded( data ) {
		mapData = data;
		tileset = new Image();
		tileset.src = mapData.tilesets[0].image;
		tileset.onLoad = initLayers();
	}

	function initLayers() {
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