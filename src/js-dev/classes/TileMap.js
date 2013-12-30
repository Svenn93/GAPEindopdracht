/*globals createjs:true, Tile:true, bean:true*/
var TileMap = (function(){

	function Map(currentLevel){
		this.currentLevel = currentLevel;
		this.mapData = "";
		this.worldtiles = [];
		this.collisiontiles = [];
		this.deathzones = [];
		this.platformtiles = [];
		this.displayobject = new createjs.Container();
		this.draw();
	}

	Map.prototype.draw = function() {
		var self = this;
		var jsonURL = 'maps/level' + 1 + '/level.json';
		/** JSON VAN HET JUISTE LEVEL INLADEN **/
		$.ajax({
			context:this,
			url:jsonURL,
			success:self.jsonLoaded}
		);
		console.log('json inladen');
	};

	Map.prototype.jsonLoaded = function( data ){
		var self = this;
		this.mapData = data;
		this.tileset = new Image();
		this.tileset.src = this.mapData.tilesets[0].image;
		console.log('json ingeladen', this.mapData.tilesets[0]);
		this.tileset.onLoad = self.initLayers();
	};

	Map.prototype.initLayers = function(){
		/** DE JUISTE LAYER UIT HET JSONBESTAND OPHALEN **/
		var self = this;
		console.log(this);
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

		bean.fire(self, 'mapLoaded');

		/** DE MOVING PLATFORMS WORDEN VOORLOPIG HANDMATIG TOEGEVOEGD **/
		/*var movingBox1 = new MovingPlatform(850, world.height - 150, 100, 15, '#E3D3C6', 300, 850, 'l', 5000);
		boxes.push(movingBox1);
		stage.addChild(movingBox1.shape);
		//cameras[1].push(movingBox1);
		//initCameras();
		console.log('alle boxes gemaakt');*/
	};

	Map.prototype.initLayer = function(layerData, tilesetSheet, tilewidth, tileheight) {
		var self=this;
		var platformteller= 0;
		for (var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				var cellBitmap = new createjs.Sprite(tilesetSheet);
				var idx = x + y * layerData.width;
				cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				if(x === 0){
					cellBitmap.x = x * tilewidth;
					cellBitmap.y = y * tileheight;
				}else{
					cellBitmap.x = x * (tilewidth);
					cellBitmap.y = y * (tileheight);
				}
				
				/** VISUEEL DE TILES WEERGEVEN **/
				// add bitmap to stage
				//cameras[0].push(cellBitmap);
				//TODO: cellbitmap koppelen ana de view van de Physics body;
				/** COLLISION LOGICA, OBJECTEN '''NIET''' TOEVOEGEN AAN STAGE (enkel voor developement)**/
				
				if(layerData.data[idx] !== 0)
				{
					platformteller++;
					var name = "platform" + platformteller;
					var worldTile = "";
					switch (layerData.name)
					{
						case "World":

							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.worldtiles.push(worldTile);
							//cameras[0].push(boxWorld);
						break;

						case "Collision":

							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("collision worldtile added");
							this.displayobject.addChild(worldTile.displayobject);
							this.collisiontiles.push(worldTile);
							//cameras[0].push(boxDeath);
						break;

						case "Deadzone":
							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("deadzone added");
							this.displayobject.addChild(worldTile.displayobject);
							this.deathzones.push(worldTile);
						break;

						case "Platform":
							worldTile = new Tile(cellBitmap, name, tilewidth, tileheight);
							console.log("platform  added");
							this.displayobject.addChild(worldTile.displayobject);
							this.platformtiles.push(worldTile);
						break;

					}
				}


			}
		}
	};

	return Map;

})();