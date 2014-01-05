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
		this.targetReached = false;
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
				console.log(this.x, this.targetX);
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

	MovingTile.prototype.moveToOrigin = function() {
		var self = this;
		console.log(self);
		
	};

	MovingTile.prototype.setPosition = function() {
		this.x = this.displayobject.x;
		this.y = this.displayobject.y;
	};

	return MovingTile;

})();