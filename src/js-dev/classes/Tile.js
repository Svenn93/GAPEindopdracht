/*globals createjs:true*/
var Tile = (function(){

	function Tile(sprite, name, tilewidth, tileheight){
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

	return Tile;

})();
