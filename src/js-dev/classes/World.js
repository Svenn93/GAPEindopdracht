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