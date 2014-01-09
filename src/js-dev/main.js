/*globals App:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS","TOP 5"];
	var timer = 0;

	function init()
	{
		menu();
		$("#levels").hide();
		$("#controls").hide();
		$("canvas").hide();
		$("#scores").hide();
		$("#logo").hide();
		$("#logo2").hide();
		$("#inGameMenu").hide();
		$("#endGameMenu").hide();
		$("#highscore").hide();

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

					$("h1").html(menuItems[3]);
					$("h1").removeClass("hover");
					$("#buttons").css("width","1000");
					$("#menu").css("margin-top","5%");
					$("#highscore").fadeIn();
				break;

				case menuItems[1]:
					$("h1").html(menuItems[0]);
					$("h1").addClass("hover");
					$("#buttons").css("width","800");
					$("#levels").hide();
					$("#menu").css("margin-top","20%");
				break;

				case menuItems[2]:
					$("#controls").hide();
					$("h1").html(menuItems[1]);
					$("#buttons").css("width","1000");
					$("#levels").fadeIn();
					$("#menu").css("margin-top","10%");
				break;

				case menuItems[3]:
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#controls").fadeIn();
					$("#menu").css("margin-top","10%");
					$("#highscore").hide();
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
					$("#controls").fadeIn();
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#levels").hide();
				break;

				case menuItems[2]:
					$("#controls").hide();
					$("h1").html(menuItems[3]);
					$("#buttons").css("width","1000");
					$("#menu").css("margin-top","5%");
					$("#highscore").fadeIn();
				break;

				case menuItems[3]:

					$("h1").html(menuItems[0]);
					$("#buttons").css("width","800");
					$("h1").addClass("hover");
					$("#menu").css("margin-top","20%");
					$("#highscore").hide();
				break;
			}
		});

		$("h1").click(function(){
			if($(this).html() === menuItems[0])
			{
					//logica voor het ophalen van de local storage
					startGame(1);

			}
		});

		$("#levels li").click(function(){

			if ($(this).hasClass("show"))
			{
				startGame($(this).index() + 1);
			}

		});

	}

	function startGame(level)
	{
		$("#menu").remove();
		var app = new App(level);
		$("body").css("background-image","url('images/bg.jpg')");
		$("#logo").show();
		$("#logo2").show();
		$("canvas").show();
		$("#scores").slideDown();
		changeAudio("level" + level);

	}

	function changeAudio(track)
	{
		var myAudio=$("#audio");
        var audioSub = myAudio.get(0);
        var playmode=audioSub.paused;
		myAudio.attr('src','audio/'+ track + '.ogg');
        playmode = true;
        audioSub.play();
	}

	init();

	

})();

