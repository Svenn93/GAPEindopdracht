/*globals createjs:true*/
var WorldTile = (function(){

	function WorldTile(sprite, name, tilewidth, tileheight){
		this.sprite = sprite;
		this.name = name;
		this.tilewidth = tilewidth;
		this.tileheight = tileheight;
		this.displayobject = new createjs.Container();
		this.displayobject.name = name;
		this.displayobject.obj = this;
		this.displayobject.x = this.sprite.x;
		this.displayobject.y = this.sprite.y;
		this.displayobject.width = tilewidth;
		this.displayobject.height = tileheight;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.displayobject.addChild(this.sprite);
	}

	WorldTile.prototype.update = function(body) {
		this.displayobject.x = body.state.pos.get(0);
		this.displayobject.y = body.state.pos.get(1);
		this.displayobject.regX = this.displayobject.width/2;
		this.displayobject.regY = this.displayobject.height/2;
		var angle = body.state.angular.pos * (180/Math.PI);
		if(angle > 360) {
			angle = angle % 360;
		}else if(angle < -360) {
			angle = angle % -360;
		}
		//this.displayobject.rotation = angle;
		this.displayobject.regX = 0;
		this.displayobject.regY = 0;
	};

	return WorldTile;

})();
