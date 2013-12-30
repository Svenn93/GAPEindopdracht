/*globals createjs:true*/
var Tile = (function(){

	function Tile(sprite, name, tilewidth, tileheight){
		this.sprite = sprite;
		this.name = name;
		this.width = tilewidth;
		this.height = tileheight;
		this.displayobject = new createjs.Container();
		this.x = this.displayobject.x = this.sprite.x;
		this.y = this.displayobject.y = this.sprite.y;
		this.displayobject.name = name;
		this.displayobject.obj = this;
		this.displayobject.width = this.width;
		this.displayobject.height = this.height;
		this.sprite.x = 0;
		this.sprite.y = 0;
		this.displayobject.addChild(this.sprite);
	}

	return Tile;

})();
