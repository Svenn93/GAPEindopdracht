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
		this.shape.graphics.f(this.color);
		this.shape.graphics.dr(0, 0, this.width, this.height);
		this.shape.graphics.ef();
	};

	Platform.prototype.setVisibility = function(visible) {
		this.shape.visible = visible;
	};

	return Platform;

})();