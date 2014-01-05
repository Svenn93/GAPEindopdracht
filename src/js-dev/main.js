/*globals App:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS"];
	var timer = 0;

	function init()
	{
		menu();
		$("#levels").hide();

		console.log("hello");

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
		$( "#previous").click(function(){
			switch($("h1").html())
			{
				case menuItems[0]:

					$("h1").html(menuItems[2]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1200");
				break;

				case menuItems[1]:
					$("h1").html(menuItems[0]);
					$("h1").addClass("hover");
					$("#buttons").css("width","800");
					$("#levels").fadeOut();
					$("#menu").css("margin-top","20%");
				break;

				case menuItems[2]:
					$("h1").html(menuItems[1]);
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;
			}
		});

		$("#next").click(function(){

			switch($("h1").html())
			{
				case menuItems[0]:
					$("h1").html(menuItems[1]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;

				case menuItems[1]:
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#levels").fadeOut();
				break;

				case menuItems[2]:
					$("h1").html(menuItems[0]);
					$("#buttons").css("width","800");
					$("h1").addClass("hover");
					$("#menu").css("margin-top","20%");
				break;
			}
		});

		$("h1").click(function(){
			if($(this).html() === "PLAY")
			{
					console.log("play game");
					$("#menu").remove();
					$("canvas").css("display","block");
					startGame();
			}
		});

	}

	function startGame()
	{
		var app = new App();
	}

	init();

	

})();

