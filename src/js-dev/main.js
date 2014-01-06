/*globals App:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS"];
	var timer = 0;

	function init()
	{
		menu();
		$("#levels").hide();
		$("#controls").hide();
		$("canvas").hide();

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
					$("#menu").css("margin-top","10%");
					$("#controls").fadeIn();
				break;

				case menuItems[1]:
					$("h1").html(menuItems[0]);
					$("h1").addClass("hover");
					$("#buttons").css("width","800");
					$("#levels").fadeOut();
					$("#menu").css("margin-top","20%");
				break;

				case menuItems[2]:
					$(".buttons").slideToggle();
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
					$(".buttons").slideToggle();
					$("#controls").fadeIn();
					$("h1").html(menuItems[2]);
					$("#buttons").css("width","1200");
					$("#levels").fadeOut();
				break;

				case menuItems[2]:
					$("#controls").fadeOut();
					$("h1").html(menuItems[0]);
					$("#buttons").css("width","800");
					$("h1").addClass("hover");
					$("#menu").css("margin-top","20%");
				break;
			}
		});

		$("h1").click(function(){
			if($(this).html() === menuItems[0])
			{
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
		$("canvas").show();
		changeAudio("level" + level);
	}

	function changeAudio(track)
	{
		var source = '<audio>';
		source +=  '<source id="audio_player_ogv" src=audio/"' + track + '.ogv"  type="audio/ogg" />';
		source +=  '<source id="audio_player_ogv" src=audio/"' + track + '.mp3"  type="audio/mpeg" />';
		source +=  '</audio>';
		$('audio').html(source);
		var aud = $('audio').get(0);
		aud.play();
	}

	init();

	

})();

