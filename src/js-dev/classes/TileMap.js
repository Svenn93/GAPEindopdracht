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

	};

	Map.prototype.jsonLoaded = function( data ){
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


		var tilesetSheet = new createjs.SpriteSheet(imageData);

		for(var idx = 0; idx < this.mapData.layers.length; idx++) {
			var layerData = this.mapData.layers[idx];
			if(layerData.type === "tilelayer"){
				this.initLayer(layerData, tilesetSheet, this.mapData.tilewidth, this.mapData.tileheight);
			}
		}

		this.spawnX = this.mapData.spawnpoint[0];
		this.spawnY = this.mapData.spawnpoint[1];
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
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
						break;

						case "Traps":

							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
						break;

						case "Suitcase":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
							this.endPoint = worldTile;
						break;

						case "Collision":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.collisiontiles.push(worldTile);
							//cameras[0].push(boxDeath);
						break;

						case "Deadzone":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.deathzones.push(worldTile);
						break;

						case "Platform":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.platformtiles.push(worldTile);
						break;

						case "MovingPlatform":
							var speed = layerData.speed;
							worldTile = new MovingTile(cellBitmap, tilewidth, tileheight, targetX, targetY, speed);
							this.displayobject.addChild(worldTile.displayobject);
							this.movingtiles.push(worldTile);
						break;

						case "Checkpoints":
							worldTile = new Checkpoint(cellBitmap, tilewidth, tileheight);
							this.displayobject.addChild(worldTile.displayobject);
							this.checkpoints.push(worldTile);
						break;

						case "Trap":
							worldTile = new Tile(cellBitmap, tilewidth, tileheight);
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