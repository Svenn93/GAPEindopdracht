/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, MovingPlatformUP:true, createjs:true, FPSMeter:true, 
bean:true, World:true, Player:true, Image:true, WorldTile:true, TileMap:true*/
var App = (function(){

	var boxes, platforms, movingboxes, player, keys, width, height, x;
	var ticker;
	var world;
	var deathzones;
	var checkpoints;
	var cameras, cameraVisibilities;
	var aantalSwitches;
	var aantalCheckpoints;
	var aantalSeconden;
	var counterSeconden;
	var endPoint;
	var laatsteKeyCode;

	var backgroundPos;

	var tileset;
	var map;

	var spawnX;
	var spawnY;
	var onCheckpoint;

	var currentLevel;
	var currentCheckpoint;

	var paused;
	var animated;
	var previousDirection;

	var levelDone = false;


	function App(level){
		boxes = [];
		platforms = [];
		movingboxes = [];
		keys = [];
		deathzones = [];
		cameras = [];
		checkpoints = [];
		cameras[0] = [];
		cameras[1] = [];
		cameras[2] = [];
		aantalSwitches = 0;
		aantalCheckpoints = 0;
		aantalSeconden = 0;
		counterSeconden = 0;
		laatsteKeyCode = 0;

		paused = false;
		animated = false;
		previousDirection = "right";

		cameraVisibilities = [];
		currentLevel = 1;
		currentCheckpoint = -1;
		spawnX = 0;
		spawnY = 0;
		onCheckpoint = false;

		stage = new createjs.Stage('cnvs');
		world = new World(1200, 800);

		width = stage.canvas.width;
		height = stage.canvas.height;
		world.boundH = -(world.height-height);
		world.boundW = -(world.width-width);

		initializeMap();

		window.onkeydown = keydown;
		window.onkeyup = keyup;
		$('#inGameMenuButton').click(function(){menuHandler();});

		stage.addChild(world.container);
	}

	function initializeMap(){
		if(typeof map !== 'undefined'){
			world.container.removeChild(map.displayobject);
		}
		map = new TileMap(currentLevel);
		bean.on(map, 'mapLoaded', mapLoadedHandler);
	}

	function mapLoadedHandler(){
		levelDone = false;
		boxes.length = 0;
		platforms.length = 0;
		deathzones.length = 0;
		movingboxes.length = 0;
		checkpoints.length = 0;
		cameras[0].length = 0;
		cameras[1].length = 0;
		cameras[2].length = 0;
		console.log('MAP IS GELADEN');

		laatsteKeyCode = 65; //normal camera mode
		buildBounds();
		world.addChild(map.displayobject);
		spawnX = map.spawnX;
		spawnY = map.spawnY;
		console.log(player);

		//collision logica
		boxes = boxes.concat(map.collisiontiles);
		platforms = map.platformtiles;
		console.log('map traps: ', map.traps);
		deathzones = map.deathzones.concat(map.traps);
		movingboxes = map.movingtiles;
		checkpoints = map.checkpoints;
		//camera logica
		cameras[0] = map.collisiontiles.concat(map.worldtiles, map.deathzones, map.platformtiles);
		cameras[1] = map.movingtiles;
		cameras[2] = map.traps;
		initCameras();

		endPoint = map.endPoint;

		//player altijd opnieuw aanmaken, easel ondersteund geen childIndex, numchildren. Enkel op stage = niet handig.
		if(typeof player !== 'undefined'){
			player.x = spawnX;
			player.y = spawnY;
			world.container.setChildIndex(player, world.container.getNumChildren()-1);
			
		}else{
			player = new Player(spawnX, spawnY);
			player.gravity = world.gravity;
			player.friction = world.friction;
			world.addChild(player.displayobject);
		}

		ticker = createjs.Ticker;
		ticker.setFPS('60');
		ticker.addEventListener('tick', update);

	}

	function restartLevel(){
		levelDone = false;
		laatsteKeyCode = 65;

		spawnX = map.spawnX;
		spawnY = map.spawnY;
		player.x = spawnX;
		player.y = spawnY;

		initCameras();

		for (var c = 0; c < checkpoints.length; c++) {
			checkpoints[c].update(false);
		}

		ticker = createjs.Ticker;
		ticker.setFPS('60');
		ticker.addEventListener('tick', update);
	}

	function update() {

		if(counterSeconden < 60){
			counterSeconden ++;
		}
		else if(counterSeconden === 60){
			aantalSeconden ++;
			counterSeconden = 0;
			document.getElementById("seconden").innerHTML = aantalSeconden;
		}

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
			switch(CollisionDetection.checkCollision(player, deathzones[k], "box")){

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
				player.x = spawnX;
				player.y = spawnY;
			break;
			}
		}

		for(var l = 0; l < movingboxes.length; l++) {
			movingboxes[l].update();
			var box = movingboxes[l];
			switch(CollisionDetection.checkCollision(player, box, "box")){

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

		if(CollisionDetection.checkCollisionSimple(player, endPoint)){
			
			if(!levelDone){
				currentLevel++;
				levelDone = true;
				setTimeout(showEndScreen, 500);
			}

		}

		

		if(keys[32]){
			for (var b = 0; b < checkpoints.length; b++){
			if(CollisionDetection.checkCollisionSimple(player, checkpoints[b])){
				currentCheckpoint = checkpoints[b];

				if(spawnX !== currentCheckpoint.x)
				{
					aantalCheckpoints ++;
					spawnX = currentCheckpoint.x;
					spawnY = currentCheckpoint.y;
					//checkpoints[checkpoints.indexOf(currentCheckpoint)].update(true);
					for (var c = 0; c < checkpoints.length; c++) {
						if(checkpoints[c] !== currentCheckpoint){
							checkpoints[c].update(false);
						}else{
							checkpoints[c].update(true);
						}
					}
					document.getElementById("checkpoints").innerHTML = aantalCheckpoints;
				}
			}
		}
		}

		if(keys[37] && !levelDone){
			//links
			if(player.velX > -player.speed){
				if(player.friction === 1){
					player.velX -= 2;
				}else{
					player.velX --;
					
					if(previousDirection === "left")
					{
						if(animated === false)
						{
							$("#logo").animate({left:20});
							$("#logo2").animate({left:50});
							animated = true;
						}
					}
					else if(previousDirection === "right")
					{
						previousDirection = "left";
						$("#logo").stop();
						$("#logo2").stop();
						$("#logo").animate({left:20});
						$("#logo2").animate({left:50});
						animated = true;
					}


				}
			}
		}

		if(keys[38] && !levelDone){
			//omhoog
			if(player.grounded && !player.jumping){
				player.grounded = false;
				player.jumping = true;
				player.velY = -player.speed * 2;
			}
		}

		if(keys[39] && !levelDone){
			//rechts
			if(player.velX < player.speed) {
				//Wanneer friction 1 is => zit je op moving platform left of right;
				if(player.friction === 1){
					player.velX += 2;
				}else{
					player.velX ++;

					if(previousDirection === "right")
					{
						if(animated === false)
						{
							$("#logo").animate({left:-20});
							$("#logo2").animate({left:-50});
							animated = true;
						}
					}
					else if(previousDirection === "left")
					{
						previousDirection = "right";
						$("#logo").stop();
						$("#logo2").stop();
						$("#logo").animate({left:-20});
						$("#logo2").animate({left:-50});
						animated = true;
					}
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
			if(laatsteKeyCode !== 90){
				laatsteKeyCode = 90;
				updateCameras(1, true);
				updateCameras(0, false);
				updateCameras(2, false);
				aantalSwitches++;
				document.getElementById("aantal").innerHTML = aantalSwitches;
			}
		}

		if(event.keyCode === 65){
			if(laatsteKeyCode !== 65){
				laatsteKeyCode = 65;
				updateCameras(1, false);
				updateCameras(0, true);
				updateCameras(2, false);
				aantalSwitches++;
				document.getElementById("aantal").innerHTML = aantalSwitches;
			}
		}

		if(event.keyCode === 69){
			if(cameras[2].length !== 0 && laatsteKeyCode !== 69)
			{
				laatsteKeyCode = 69;
				updateCameras(2, true);
				updateCameras(1, false);
				updateCameras(0, false);
				aantalSwitches++;
				document.getElementById("aantal").innerHTML = aantalSwitches;
			}
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
		cameraVisibilities[2] = false;

		for (var i = 0; i < cameras[1].length; i++)
		{
			cameras[1][i].displayobject.visible = false;
		}

		for (var j = 0; j < cameras[2].length; j++)
		{
			cameras[2][j].displayobject.visible = false;
		}
	}

	function updateCameras(cameraNumber, visibility){

		for(var i = 0; i < cameras[cameraNumber].length; i++)
		{
			cameras[cameraNumber][i].displayobject.visible = visibility;
			cameraVisibilities[cameraNumber] = visibility;
		}
	}

	function showEndScreen(){
		$('#endGameMenu').slideDown();

		$("#endGameMenu ul").on("click", "li", function(){
				console.log($(this).html());

				switch($(this).html())
				{
					case "Restart":
						restartLevel();
						$('#endGameMenu').slideUp();
					break;

					case "Next Level":
						setTimeout(initializeMap, 500);
						$("#endGameMenu").slideUp();
					break;
				}

			});
	}

	function menuHandler(){

		$("#inGameMenu").slideDown();

		if(paused === false)
		{
			paused = true;
			ticker.removeEventListener("tick", update);
			$("#inGameMenu ul").on("click", "li", function(){

				switch($(this).html())
				{
					case "Main menu":

					break;

					case "Restart":

					break;

					case "Continue":
						$("#inGameMenu").slideUp();
						ticker.addEventListener("tick", update);
						paused = false;
					break;
				}

			});
			
		}
		else if(paused === true)
		{
			ticker.addEventListener("tick", update);
			paused = false;
		}
	}

	return App;

})();