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
		var self = this;
		this.running = false;
		self.initCharacter();
	}

	Player.prototype.initCharacter = function() {
		var spritesheet = new createjs.SpriteSheet({
			"images": ["images/character.png"],
			"frames": {"width":20, "height":38, "count":7, "regX": 0, "regY":0},
			"animations": {
				run: {
					frames:[0, 1, 2, 1],
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

		this.playerSprite = new createjs.Sprite(spritesheet, "run");
		this.displayobject.addChild(this.playerSprite);
		this.displayobject.width = this.width = 20;
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
	};
	return Player;

})();