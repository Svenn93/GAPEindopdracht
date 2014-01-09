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
