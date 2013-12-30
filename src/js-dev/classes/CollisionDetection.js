var CollisionDetection = (function(){

	function CollisionDetection(){

	}

	CollisionDetection.checkCollision = function(shapeA, shapeB, type){
		//verschil in x en y van de twee shapes;
		var vX = (shapeA.x + (shapeA.width/2)) - (shapeB.x + (shapeB.width/2));
		var vY = (shapeA.y + (shapeA.height/2)) - (shapeB.y + (shapeB.height/2));
		var hWidths = (shapeA.width/2) + (shapeB.width/2);
		var hHeights = (shapeA.height/2) + (shapeB.height/2);
		var colDir = "";

		if(Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
			var oX = hWidths - Math.abs(vX);
			var oY = hHeights - Math.abs(vY);
			if(oX >= oY)
			{
				//top of bottom :')
				if(vY > 0){
					colDir = "t";
					if(type === "box"){
						shapeA.y += oY;
					}
			
				}else{
					colDir = "b";
					shapeA.y -= oY;
				}

			}else{
				
				if(vX > 0){
					colDir = "l";
					if(type === "box"){
						shapeA.x += oX;
					}
				}else{
					colDir = "r";
					if(type === "box"){
						shapeA.x -= oX;
					}
				}

			}

			return colDir;
		}
	};

	return CollisionDetection;

})();