//var box1 = new Platform(0, height-40 ,200, 40, '#000000');
		//var box2 = new Platform(500, height-40, 200, 40, '#000000');
		//var box3 = new Platform(700, 40, 150, height-40, '#000000');
		
		//var box4 = new Platform(580, height-280, 20, 140, '#000000');
		//var box5 = new Platform(0, height - 200, 580, 60, '#000000');

		//var box10 = new Platform(100, height - 370, 100, 20, '#000000');
		//var box11 = new Platform(80, 0, 20, 350, '#000000');
		//var box12 = new Platform(250, height - 330, 50, 20, '#000000');


		//ladder
		//var box6 = new Platform(650, height -100, 50, 20, '#000000');
		//var box7 = new Platform(600, height -160, 50, 20, '#000000');
		//var box8 = new Platform(650, height -220, 50, 20, '#000000');
		//var box9 = new Platform(600, height -280, 50, 20, '#000000');

		//Rewards
		//var reward = new Reward(10, 10, 15, "#ffd700");

		var movingBox1 = new MovingPlatform(850, world.height - 150, 100, 15, '#E3D3C6', 300, 850, 'l', 5000);
		//var movingBox2 = new MovingPlatform(80, height - 310, 100, 20, '#00ff00', 80, 500, 'r', 4500);
		//var movingBox3 = new MovingPlatformUP(0, height - 310, 80, 20, '#00ff00', height - 310, 50, 'u', 4500);

		//var deathzone1 = new Platform(200, height - 40, 300, 40, '#ff0000');
		//var deathzone2 = new Platform(0, height - 260, 580, 60, '#ff0000');

		//******VISUEEL WEERGEVEN****////
		//world.addChild(box1.shape);
		//world.addChild(box2.shape);
		//world.addChild(box3.shape);
		//world.addChild(box4.shape);
		//world.addChild(box5.shape);
		//world.addChild(box6.shape);
		//world.addChild(box7.shape);
		//world.addChild(box8.shape);
		//world.addChild(box9.shape);
		//world.addChild(box10.shape);
		//world.addChild(box11.shape);
		//world.addChild(box12.shape);
		//world.addChild(deathzone1.shape);
		//world.addChild(deathzone2.shape);
		stage.addChild(movingBox1.shape);
		//world.addChild(movingBox2.shape);
		//world.addChild(movingBox3.shape);
		//world.addChild(reward.shape);

		//****COLLISION LOGICA*******/
		boxes.push(movingBox1);
		//deathzones.push(deathzone1, deathzone2);


		//*******CAMERA LOGICA******//
		//stilstaande platforms + deathzones
		//cameras[0].push(box1, box2, box3, box4, box5, box6, box7, box8, box9, box10, box11, box12, deathzone1, deathzone2);

		//bewegende platforms
		cameras[1].push(movingBox1);

		for(var i = 0; i<deathzones.length; i++)
		{
			deathzones[i].setVisibility(false);
		}

		initCameras();