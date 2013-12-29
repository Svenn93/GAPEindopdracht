/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, MovingPlatformUP:true, createjs:true, FPSMeter:true, 
Reward:true, Physics:true, Player:true, Image:true, WorldTile:true*/
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
	var square;


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
		//nieuwe wereld
		world = Physics();

		width = stage.canvas.width;
		height = stage.canvas.height;

		//bounds van de wereld
		var bounds = Physics.aabb(0, 0, width, height);

		//zwaartekracht van de wereld
		var gravity = Physics.behavior('constant-acceleration', {
			acc:{x:0, y:0.0004}
		});
		world.add(gravity);

		//restitution: hardheid vloeg (trampoline vs beton)
		var edge = Physics.behavior('edge-collision-detection', {
			aabb:bounds,
			restitution: 0.3
		});
		world.add(edge);

		world.add(Physics.behavior('body-collision-detection'));
		world.add(Physics.behavior('sweep-prune'));
		world.add(Physics.behavior('body-impulse-response'));
			
		buildLevel();
		//aanmaken player + adden
		player = new Player(200, 200, 20, 20);
		player.gravity = world.gravity;
		//world.addChild(player.shape);
		//ticker, voor stage refresh.
		Physics.util.ticker.subscribe(update);
		Physics.util.ticker.start();

		window.onkeydown = keydown;
		window.onkeyup = keyup;

		//stage.addChild(world.container);
	}

	function update(time, dt) {
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

		//player.grounded = false;

		/*for (var i = 0; i < boxes.length ; i++) {
			
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
		}*/
		//player.update();
		world.step(time);
		updateCanvas();
	}

	function updateCanvas() {
		for(var i = 0; i < world._bodies.length; i++){
			var body = world._bodies[i];

			stage.getChildByName(body.view).obj.update(body);
		}
		stage.update();
	}

	function keydown(event) {
		keys[event.keyCode] = true;

		if(event.keyCode === 90){
			for (var i = 0; i < cameras[1].length; i++)
			{
				cameras[1][i].setVisibility(true);
			}
			for (var d = 0; d < cameras[0].length; d++)
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

		/** DE MOVING PLATFORMS WORDEN VOORLOPIG HANDMATIG TOEGEVOEGD **/
		/*var movingBox1 = new MovingPlatform(850, world.height - 150, 100, 15, '#E3D3C6', 300, 850, 'l', 5000);
		boxes.push(movingBox1);
		stage.addChild(movingBox1.shape);
		//cameras[1].push(movingBox1);
		//initCameras();
		console.log('alle boxes gemaakt');*/

		var boxWorld = new Platform(200, 300 , 50, 50, '#0000FF', 'test');
		stage.addChild(boxWorld.displayobject);

		var boxWorldobj = Physics.body('convex-polygon', {
			x:100,
			y:300,
			vertices: [
				{x: 0, y: 50},
				{x: 50, y: 50},
				{x: 50, y: 0},
				{x: 0, y: 0}
			],
			cof:1,
			mass: 1,
			restitution: 0,
			fixed:false,
			view: 'test'
		});
		world.add(boxWorldobj);

	}


	function initLayer(layerData, tilesetSheet, tilewidth, tileheight) {
		var platformteller= 0;
		for (var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;
				cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				if(x === 0){
					cellBitmap.x = x * tilewidth;
					cellBitmap.y = y * tileheight;
				}else{
					cellBitmap.x = x * (tilewidth);
					cellBitmap.y = y * (tileheight);
				}
				
				/** VISUEEL DE TILES WEERGEVEN **/
				// add bitmap to stage
				//cameras[0].push(cellBitmap);
				//TODO: cellbitmap koppelen ana de view van de Physics body;
				/** COLLISION LOGICA, OBJECTEN '''NIET''' TOEVOEGEN AAN STAGE (enkel voor developement)**/
				if(layerData.data[idx] !== 0)
				{
					platformteller++;
		
					switch (layerData.name)
					{
						case "world":
							var name = "platform" + platformteller;

							var worldTile = new WorldTile(cellBitmap, name, tilewidth, tileheight);
							stage.addChild(worldTile.displayobject);
							console.log(worldTile.displayobject.x, worldTile.displayobject.y);
							var boxWorldobj = Physics.body('convex-polygon', {
								x:worldTile.displayobject.x,
								y:worldTile.displayobject.y,
								vertices: [
									{x: 1, y: 49},
									{x: 49, y: 49},
									{x: 49, y: 1},
									{x: 1, y: 1}
								],
								cof:1,
								restitution:0,
								fixed:true,
								mass:1,
								view: name
							});
							world.add(boxWorldobj);
							console.log("platform added");
							//cameras[0].push(boxWorld);
						break;

						/*case "Death":
							var boxDeath = new Platform(cellBitmap.x,cellBitmap.y ,50, 50, '#FF0000');
							deathzones.push(boxDeath);
							world.addChild(boxDeath.shape);
							//cameras[0].push(boxDeath);
						break;*/

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