(function(){

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
			
			var videoplayer = $('#videoPlayer');
			videoplayer.slideDown();
			var mp4vid = $('#mp4source');
			var oggvid = $('#oggsource');

			videoplayer[0].pause();
			videoplayer[0].addEventListener('ended', videoEnded);

			$(mp4vid).attr("src", "video/Intro.mp4");
			$(oggvid).attr("src", "video/Intro.oggtheora.ogv");

			videoplayer[0].load();
			videoplayer[0].play();

		}else{
			initializeMap();
		}

		score = new Score();

		menu = new Menu();
		bean.on(menu, 'pausedStateChanged', pauseHandler);
		$("#endGameMenu ul").on("click", "li", endGameItemHandler);

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
        createjs.Sound.addEventListener("fileload"); // add an event listener for when load is completed
        createjs.Sound.registerManifest(manifest, assetsPath);
	}

	function videoEnded() {
		$('#videoPlayer').slideUp();
		setTimeout(initializeMap, 600);
		createjs.Sound.play(3);
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
		console.log('einde');
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
				score.saveScore(currentLevel, (aantalSeconden) + (aantalSwitches*10) + (aantalCheckpoints*20));
				setTimeout(initializeMap, 500);
				$("#endGameMenu").slideUp();
				createjs.Sound.stop(1);
				createjs.Sound.play(3);
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

var Bound = (function(){

	function Bound(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	return Bound;

})();

/*globals createjs:true*/
var Checkpoint = (function(){

	function Checkpoint(sprite, tilewidth, tileheight){
		this.sprite = sprite;
		this.width = tilewidth;
		this.height = tileheight;
		this.displayobject = new createjs.Container();
		this.x = this.displayobject.x = this.sprite.x;
		this.y = this.displayobject.y = this.sprite.y;
		this.displayobject.obj = this;
		this.displayobject.width = this.width;
		this.displayobject.height = this.height;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.saved = false;
		this.displayobject.addChild(this.sprite);
	}

	Checkpoint.prototype.update = function(save) {
		if(save){
			if(!this.saved){
				this.sprite.gotoAndStop(this.sprite.currentFrame - 2);
				this.saved = true;
			}
		}else{
			if(this.saved){
				this.sprite.gotoAndStop(this.sprite.currentFrame + 2);
				this.saved = false;
			}
		}
	};

	return Checkpoint;

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

	CollisionDetection.checkCollisionSimple = function(shapeA, shapeB){
		var vX = (shapeA.x + (shapeA.width/2)) - (shapeB.x + (shapeB.width/2));
		var vY = (shapeA.y + (shapeA.height/2)) - (shapeB.y + (shapeB.height/2));
		var hWidths = (shapeA.width/2) + (shapeB.width/2);
		var hHeights = (shapeA.height/2) + (shapeB.height/2);

		if(Math.abs(vX) < hWidths && Math.abs(vY) < hHeights){
			return true;
		}else{
			return false;
		}
	};

	return CollisionDetection;

})();

/*globals bean:true*/
var Menu = (function(){

	function Menu(){
		this.paused = false;
		this.restart = false;
		$('#inGameMenuButton').click($.proxy(this.menuHandler, this));
		$("#inGameMenu ul").on("click", "li", $.proxy(this.menuItemHandler, this));


	}

	Menu.prototype.menuItemHandler = function(e){
		e.preventDefault();
		switch($(e.currentTarget).html())
		{
			/*case "Main menu":

			break;*/

			case "Restart":
				if(this.paused){
					$("#inGameMenu").slideUp();
					this.setRestart(true);
					this.setPaused(false);
				}
			break;

			case "Continue":
			if(this.paused){
				$("#inGameMenu").slideUp();
				this.setPaused(false);
			}
			break;
		}

	};

	Menu.prototype.menuHandler = function() {
		$("#inGameMenu").slideDown();
		if(!this.paused)
		{
			this.setPaused(true);
		}

	};

	Menu.prototype.setPaused = function(state) {
		if(this.paused !== state){
			this.paused = state;
			bean.fire(this, 'pausedStateChanged');
		}
	};

	Menu.prototype.setRestart = function(state) {
		if(this.restart !== state){
			this.restart = state;
		}
	};

	return Menu;
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
		this.death = false;
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

var Score = (function(){
	function Score(){
		this.aantalLevels = 8;
		this.scores = {};

		if(localStorage && localStorage.getItem('scores')){
			this.scores = JSON.parse(localStorage.getItem('scores'));
		}else{
			for(var i = 1; i <= this.aantalLevels; i++)
			{
				var level = 'level' +i;
				this.scores[level] = 0;
			}
		}
		
	}

	Score.prototype.saveScore = function(level, score) {
		var levelString = "level" + level;
		this.scores[levelString] = score;
		this.saveScoresToLocalStorage();
	};

	Score.prototype.saveScoresToLocalStorage = function() {
		localStorage.setItem('scores', JSON.stringify(this.scores));
		this.syncScores();
	};

	Score.prototype.syncScores = function() {
		console.log('fb shit');
	};
	return Score;

})();

/*globals createjs:true*/
var Tile = (function(){

	function Tile(sprite, tilewidth, tileheight){
		this.sprite = sprite;
		this.width = tilewidth;
		this.height = tileheight;
		this.displayobject = new createjs.Container();
		this.x = this.displayobject.x = this.sprite.x;
		this.y = this.displayobject.y = this.sprite.y;
		this.displayobject.obj = this;
		this.displayobject.width = this.width;
		this.displayobject.height = this.height;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.displayobject.addChild(this.sprite);
	}

	return Tile;

})();


/*globals createjs:true, Tile:true, MovingTile:true, Checkpoint:true, bean:true*/
var TileMap = (function(){

	function Map(currentLevel){
		this.currentLevel = currentLevel;
		this.mapData = "";
		this.worldtiles = [];
		this.collisiontiles = [];
		this.deathzones = [];
		this.platformtiles = [];
		this.movingtiles = [];
		this.checkpoints = [];
		this.traps = [];
		this.displayobject = new createjs.Container();
		this.tileset = new Image();
		this.tileset.src = "maps/tilemap.png";
		this.tileset.onLoad = this.draw();
	}

	Map.prototype.draw = function() {
		/** NIEUWE CONTAINER, ALLES WORDT VERWIJDERD **/
		if(this.displayobject.children !== 0){
			this.displayobject.removeAllChildren();
		}

		/** JSON URL INSTELLEN**/
		var jsonURL = 'maps/level' + this.currentLevel + '/level.json';

		/** JSON VAN HET JUISTE LEVEL INLADEN **/
		$.ajax({
			context:this,
			url:jsonURL,
			success:this.jsonLoaded}
		);

		console.log('json inladen');
	};

	Map.prototype.jsonLoaded = function( data ){
		console.log('json loaded');
		this.mapData = data;
		this.initLayers();
	};

	Map.prototype.initLayers = function(){
		/** DE JUISTE LAYER UIT HET JSONBESTAND OPHALEN **/
		var w = this.mapData.tilesets[0].tilewidth;
		var h = this.mapData.tilesets[0].tileheight;
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

		this.spawnX = this.mapData.spawnpoint[0];
		this.spawnY = this.mapData.spawnpoint[1];
		console.log("movingtiles in tilemap: ", this.movingtiles);
		bean.fire(this, 'mapLoaded');
	};


	Map.prototype.initLayer = function(layerData, tilesetSheet, tilewidth, tileheight) {
		var platformteller= 0;
		var targetX = "";
		var targetY = "";

		for (var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;

				//wanneer het een movingtile is, array bevat spritenummer, x-target en y-target
				if(layerData.data[idx] instanceof Array){
					cellBitmap.gotoAndStop(layerData.data[idx][0] - 1);
					targetX = (x + layerData.data[idx][1]) * tilewidth;
					targetY = (y + layerData.data[idx][2]) * tileheight;
				}else{
					//wanneer het geen movingtile is
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

							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
						break;

						case "Traps":

							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
						break;

						case "Suitcase":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("platform  added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
							this.endPoint = worldTile;
						break;

						case "Collision":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("collision worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.collisiontiles.push(worldTile);
							//cameras[0].push(boxDeath);
						break;

						case "Deadzone":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("deadzone added");
							this.displayobject.addChild(worldTile.displayobject);
							this.deathzones.push(worldTile);
						break;

						case "Platform":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
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

						case "Checkpoints":
							worldTile = new Checkpoint(cellBitmap, tilewidth, tileheight);
							console.log("Checkpoint added");
							this.displayobject.addChild(worldTile.displayobject);
							this.checkpoints.push(worldTile);
						break;

						case "Trap":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							console.log("Trap added");
							this.displayobject.addChild(worldTile.displayobject);
							this.traps.push(worldTile);
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

/*globals App:true, FB:true, Konami:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS","TOP 5"];
	var timer = 0;
	var aantalLevels = 8;
	function init()
	{
		var easter_egg = new Konami(showEverything);

		
		menu();
		$("#levels").hide();
		$("#controls").hide();
		$("canvas").hide();
		$("#scores").hide();
		$("#logo").hide();
		$("#logo2").hide();
		$("#inGameMenu").hide();
		$("#endGameMenu").hide();
		$("#highscore").hide();
		$('#videoPlayer').hide();

		$("#guy").on('click', fbLogin);

		setInterval(function(){
			animation();
		},1000);
	}

	function showEverything() {
		var scores = {};
		for(var j = 1; j<= 8; j++){
			var levelstr = 'level' + j;
			scores[levelstr] = 'HXORZ';
		}
		localStorage.setItem('scores', JSON.stringify(scores));
		location.reload();
	}


	function fbLogin(){
		FB.login(function(response){
			console.log('AANT INLOGGEN');
			if (response.authResponse) {
				console.log(response);
				$('#facebookPicture').html("<img src ='http://graph.facebook.com/" + response.authResponse.userID + "/picture");
				localStorage.setItem('facebook', JSON.stringify(response.authResponse.userID));
			} else {
				console.log(response);
			}
		});
	}

	function animation()
	{
		if(timer < 9)
		{
			if(JSON.parse(localStorage.getItem('facebook')) !== "")
			{
				$("#facebookPicture").show();
				$("#guy").attr("src","images/guyFacebook.png");
			}
			else
			{
				$("#guy").attr("src","images/guyNormal.png");
			}
			timer +=1;
		}
		else if(timer === 9)
		{
			$("#guy").attr("src","images/guyDrink.png");
			$("#facebookPicture").hide();
			timer = 0;
		}
		
	}


	function menu()
	{
		$( "#previous").click(function(){
			switch($("h1").html())
			{
				case menuItems[0]:

					$("h1").html(menuItems[3]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1000");
					$("#menu").css("margin-top","5%");
					$("#highscore").fadeIn();
				break;

				case menuItems[1]:
					$("h1").html(menuItems[0]);
					$("h1").addClass("hover");
					$("#buttons").css("width","800");
					$("#levels").hide();
					$("#menu").css("margin-top","20%");
				break;

				case menuItems[2]:
					$("#controls").hide();
					$("h1").html(menuItems[1]);
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;

				case menuItems[3]:
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#controls").fadeIn();
					$("#menu").css("margin-top","10%");
					$("#highscore").hide();
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
					$("#controls").fadeIn();
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#levels").hide();
				break;

				case menuItems[2]:
					$("#controls").hide();
					$("h1").html(menuItems[3]);
					$("#buttons").css("width","1000");
					$("#menu").css("margin-top","5%");
					$("#highscore").fadeIn();
				break;

				case menuItems[3]:

					$("h1").html(menuItems[0]);
					$("#buttons").css("width","800");
					$("h1").addClass("hover");
					$("#menu").css("margin-top","20%");
					$("#highscore").hide();
				break;
			}
		});

		var levels = $('#levels li');
		var scores = {};
		var aantalLevelsUitgespeeld = 0;
		if(localStorage && localStorage.getItem('scores')){
			
			scores = JSON.parse(localStorage.getItem('scores'));
			for (var i = 1; i<= 8; i++){
				var levelString = "level" + i;
				if(scores[levelString] !== 0){
					aantalLevelsUitgespeeld++;
					$(levels[i-1]).find('span').html(scores[levelString]);
				}else{
					$(levels[i-1]).find('span').html("???");
				}
			}

			for(var j = 1; j<= aantalLevelsUitgespeeld; j++){
				$(levels[j]).addClass('show');
			}
		}

		$("h1").click(function(){
			if($(this).html() === menuItems[0])
			{
					//logica voor het ophalen van de local storage
					if(aantalLevelsUitgespeeld < aantalLevels){
						startGame(aantalLevelsUitgespeeld+1);
					}else{
						startGame(aantalLevels);
					}
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
		$("body").css("background-image","url('images/bg.jpg')");
		$("#logo").show();
		$("#logo2").show();
		$("canvas").show();
		$("#scores").slideDown();
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