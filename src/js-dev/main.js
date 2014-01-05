/*globals App:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","SCORES"];
	var timer = 0;

	function init()
	{
		menu();

		setInterval(function(){
			animation();
		},1000);


	}

	function animation()
	{
		if(timer < 9)
		{
			$("#guy").attr("src","images/guyNormal.png");
			timer +=1;
		}
		else if(timer === 9)
		{
			$("#guy").attr("src","images/guyDrink.png");
			timer = 0;
		}
		
	}

	function menu()
	{
		$("#previous").click(function(){

			switch($(this).next().html())
			{
				case menuItems[0]:
					$(this).next().html(menuItems[2]);
				break;

				case menuItems[1]:
					$(this).next().html(menuItems[0]);
				break;

				case menuItems[2]:
					$(this).next().html(menuItems[1]);
				break;
			}
		});

		$("#next").click(function(){

			switch($(this).prev().html())
			{
				case menuItems[0]:
					$(this).prev().html(menuItems[1]);
				break;

				case menuItems[1]:
					$(this).prev().html(menuItems[2]);
				break;

				case menuItems[2]:
					$(this).prev().html(menuItems[0]);
				break;
			}
		});

		$("li").click(function(){
			switch($(this).html())
			{
				case menuItems[0]:
					console.log("play game");
					$("#menu").remove();
					$("canvas").css("display","block");
					startGame();
				break;

				case menuItems[1]:
					console.log("select level");
				break;

				case menuItems[2]:
					console.log("leaderbord");
				break;
			}
		});

	}

	function startGame()
	{
		var app = new App();
	}

	init();

	

})();

