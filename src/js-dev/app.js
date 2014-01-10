/*globals stage:true, Bound:true, Platform:true, CollisionDetection:true, 
MovingPlatform:true, Menu:true, createjs:true, FPSMeter:true, 
bean:true, World:true, Player:true, Image:true, WorldTile:true, TileMap:true, Score:true*/
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
	var menu;

	var spawnX;
	var spawnY;
	var onCheckpoint;

	var currentLevel;
	var currentCheckpoint;

	var paused;
	var animated;
	var previousDirection;

	var levelDone = false;
	var timer;
	var score;

	var jump = false;


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
		laatsteKeyCode = 0;

		paused = false;
		animated = false;
		previousDirection = "right";

		cameraVisibilities = [];
		currentLevel = level - 1;
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

		if(currentLevel === 0){
			
			playVideo("video/Intro.mp4", "video/Intro.oggtheora.ogv");

		}else if(currentLevel === 4){
			playVideo("video/traps.mp4", "video/traps.oggtheora.ogv");
		}else{
			initializeMap();
			score = new Score();
			menu = new Menu();
			bean.on(menu, 'pausedStateChanged', pauseHandler);
			$("#endGameMenu ul").on("click", "li", endGameItemHandler);
		}

		window.onkeydown = keydown;
		window.onkeyup = keyup;

		stage.addChild(world.container);

		var assetsPath = "audio/";
        var manifest = [
			{src:"afterLevel.ogg", id:1},
			{src:"death.ogg", id:2},
			{src:"inGameMusic.ogg", id:3},
			{src:"jump.ogg", id:4},
            {src:"safe.ogg", id:5},
        ];

        createjs.Sound.alternateExtensions = ["mp3"];        // add other extensions to try loading if the src file extension is not supported
        createjs.Sound.addEventListener("fileload", createjs.proxy(loadedHandler, this)); // add an event listener for when load is completed
        createjs.Sound.registerManifest(manifest, assetsPath);
	}

	function playVideo(source1, source2){
		var videoplayer = $('#videoPlayer');
		videoplayer.slideDown();
		var mp4vid = $('#mp4source');
		var oggvid = $('#oggsource');

		videoplayer[0].pause();
		videoplayer[0].addEventListener('ended', videoEnded);

		$(mp4vid).attr("src", source1);
		$(oggvid).attr("src", source2);

		videoplayer[0].load();
		videoplayer[0].play();
		createjs.Sound.stop(3);
	}

	function loadedHandler(){
		if($("#videoPlayer").is(':visible'))
		{
			createjs.Sound.play(3);
			createjs.Sound.stop(3);

		}else{
			createjs.Sound.play(3);
		}
		
	}

	function videoEnded() {
		if(currentLevel < 8){
			$('#videoPlayer').slideUp();
			setTimeout(initializeMap, 600);
			score = new Score();
			menu = new Menu();
			bean.on(menu, 'pausedStateChanged', pauseHandler);
			$("#endGameMenu ul").on("click", "li", endGameItemHandler);
			createjs.Sound.play(3);
		}else{
			$('#videoPlayer').slideUp();
			setTimeout(function(){location.reload();}, 1000);
		}
	}

	function initializeMap(){
		currentLevel++;
		if(typeof map !== 'undefined'){
			world.container.removeChild(map.displayobject);
		}
		map = new TileMap(currentLevel);
		bean.on(map, 'mapLoaded', mapLoadedHandler);
	}

	function mapLoadedHandler(){
		aantalSeconden = 0;
		levelDone = false;
		boxes.length = 0;
		platforms.length = 0;
		deathzones.length = 0;
		movingboxes.length = 0;
		checkpoints.length = 0;
		cameras[0].length = 0;
		cameras[1].length = 0;
		cameras[2].length = 0;
		aantalSwitches = 0;
		aantalCheckpoints = 0;
		updateTextLabels();

		laatsteKeyCode = 65; //normal camera mode
		buildBounds();
		world.addChild(map.displayobject);
		spawnX = map.spawnX;
		spawnY = map.spawnY;

		//collision logica
		boxes = boxes.concat(map.collisiontiles);
		platforms = map.platformtiles;
		deathzones = map.deathzones.concat(map.traps);
		movingboxes = map.movingtiles;
		checkpoints = map.checkpoints;

		console.log(checkpoints);

		//camera logica
		cameras[0] = map.collisiontiles.concat(map.worldtiles, map.deathzones, map.platformtiles);
		cameras[1] = map.movingtiles;
		cameras[2] = map.traps;
		//initCameras();

		endPoint = map.endPoint;

		if(typeof player !== 'undefined'){
			player.x = spawnX;
			player.y = spawnY;
			world.container.setChildIndex(player.displayobject, world.container.getNumChildren() - 1);

		}else{
			player = new Player(spawnX, spawnY);
			player.gravity = world.gravity;
			player.friction = world.friction;
			world.container.addChild(player.displayobject);
		}

		ticker = createjs.Ticker;
		ticker.setFPS('60');
		ticker.addEventListener('tick', update);
		timer = setInterval(countSeconds, 1000);
	}

	function countSeconds(){
		aantalSeconden++;
	}

	function restartLevel(){
		clearInterval(timer);
		updateTextLabels();
		levelDone = false;
		laatsteKeyCode = 65;
		aantalSwitches = 0;
		aantalSeconden = 0;
		aantalCheckpoints = 0;

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
		timer = setInterval(countSeconds, 1000);
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
				if(!player.death){
					var death = createjs.Sound.play(2, createjs.Sound.INTERRUPT_NONE, 0, 0, false, 1);
					ticker.removeEventListener('tick', update);
					setTimeout(repositionPlayer, 200);
				}
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
				levelDone = true;
				createjs.Sound.stop(3);
				createjs.Sound.play(1, createjs.Sound.INTERRUPT_NONE, 0, 0, true, 1);
				setTimeout(showEndScreen, 500);
			}

		}

		

		if(keys[32]){
			for (var b = 0; b < checkpoints.length; b++){
			if(CollisionDetection.checkCollisionSimple(player, checkpoints[b])){
				console.log('collision aant checken');
				currentCheckpoint = checkpoints[b];
				console.log(currentCheckpoint, spawnX);
				if(spawnX !== currentCheckpoint.x)
				{
					var instance = createjs.Sound.play(5, createjs.Sound.INTERRUPT_NONE, 0, 0, false, 1);
					aantalCheckpoints ++;
					spawnX = currentCheckpoint.x;
					spawnY = currentCheckpoint.y;
					for (var c = 0; c < checkpoints.length; c++) {
						console.log(checkpoints[c]);
						if(checkpoints[c] !== currentCheckpoint){
							checkpoints[c].update(false);
						}else{
							checkpoints[c].update(true);
						}
					}
				}
			}
		}
		}

		if(keys[37] && !levelDone && !player.death){
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

		if(keys[38] && !levelDone && !player.death){
			console.log(player.grounded);

				if(player.grounded === true)
				{
					createjs.Sound.play(4, createjs.Sound.INTERRUPT_NONE, 200, 0, false, 0.5);
				}
			//omhoog
			if(player.grounded && !player.jumping){
						
				player.grounded = false;
				player.jumping = true;
				player.velY = -player.speed * 2;
			}
		}

		if(keys[39] && !levelDone && !player.death){
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
		updateTextLabels();
	}

	function repositionPlayer(){
		ticker.addEventListener('tick', update);
		player.death = false;
		player.x = spawnX;
		player.y = spawnY;
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
			}
		}

		if(event.keyCode === 65){
			if(laatsteKeyCode !== 65){
				laatsteKeyCode = 65;
				updateCameras(1, false);
				updateCameras(0, true);
				updateCameras(2, false);
				aantalSwitches++;
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
		clearInterval(timer);
		$('#endGameMenu').slideDown();
		if(currentLevel === 8){
			$('#nextLevel').html('continue');
			$('#nextLevel').on('click', showEndMovie);

		}

		$('#endGameMenu').find("span").html((aantalSeconden) + (aantalSwitches*10) + (aantalCheckpoints*20));
	}

	function showEndMovie(){
		ticker.removeEventListener('tick', update);
		stage.removeAllChildren();
		stage.update();
		playVideo("video/end.mp4", "video/end.oggtheora.ogv");
		$("#endGameMenu").slideUp();
		$("#inGameMenuButton").off("click");
	}

	function endGameItemHandler(e){
		e.preventDefault();
		
		switch($(this).html())
		{
			case "Restart":
			if(levelDone){
				restartLevel();
				createjs.Sound.stop(1);
				createjs.Sound.play(3);
				$('#endGameMenu').slideUp();
			}
			break;

			case "Next Level":
			if(levelDone && currentLevel < 8){
				if(currentLevel === 4){
					score.saveScore(currentLevel, (aantalSeconden) + (aantalSwitches*10) + (aantalCheckpoints*20));
					playVideo('video/traps.mp4', 'video/traps.oggtheora.ogv');
					$("#endGameMenu").slideUp();
				}else{
					score.saveScore(currentLevel, (aantalSeconden) + (aantalSwitches*10) + (aantalCheckpoints*20));
					setTimeout(initializeMap, 500);
					$("#endGameMenu").slideUp();
					createjs.Sound.stop(1);
					createjs.Sound.play(3);
				}
			}
			break;
		}
	}

	function pauseHandler(){
		if(menu.paused){
			clearInterval(timer);
			ticker.removeEventListener('tick', update);
		}else{
			console.log(menu.restart);
			if(menu.restart){
				restartLevel();
				menu.setRestart(false);
				console.log('RESTART', menu.restart);
				createjs.Sound.stop(1);
				createjs.Sound.play(3);
			}else{
				ticker.addEventListener('tick', update);
				timer = setInterval(countSeconds, 1000);
			}
		}
	}

	function updateTextLabels(){
		$("#seconden").html(aantalSeconden);
		$("#aantal").html(aantalSwitches);
		$("#checkpoints").html(aantalCheckpoints);
	}


	return App;

})();