/*globals App:true, FB:true, Konami:true*, Util:true*/

(function()
{
	var menuItems = ["PLAY","LEVELS","CONTROLS","TOP 5"];
	var timer = 0;
	var aantalLevels = 8;
	function init()
	{
		var easter_egg = new Konami(showEverything);

		
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
		$('#videoPlayer').hide();

		$("#facebookPicture").hide();


		$("#guy").on('click', fbLogin);

		setInterval(function(){
			animation();
		},1000);
	}

	function showEverything() {
		var scores = {};
		for(var j = 1; j<= 8; j++){
			var levelstr = 'level' + j;
			scores[levelstr] = '666';
		}
		localStorage.setItem('scores', JSON.stringify(scores));
		location.reload();
	}


	function fbLogin(){
		FB.login(function(response){
			console.log('AANT INLOGGEN');
			if (response.authResponse) {
				console.log(response);
				$('#facebookPicture').html("<img src ='http://graph.facebook.com/" + response.authResponse.userID + "/picture");
				localStorage.setItem('facebook', JSON.stringify(response.authResponse.userID));
			} else {
				console.log(response);
			}
		});
	}

	function animation()
	{
		if(timer < 9)
		{
			if(JSON.parse(localStorage.getItem('facebook')) !== "")
			{
				$("#facebookPicture").show();
				$("#guy").attr("src","images/guyFacebook.png");
			}
			else
			{
				$("#guy").attr("src","images/guyNormal.png");
			}
			timer +=1;
		}
		else if(timer === 9)
		{
			$("#guy").attr("src","images/guyDrink.png");
			$("#facebookPicture").hide();
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

		var levels = $('#levels li');
		var scores = {};
		var aantalLevelsUitgespeeld = 0;

				console.log(Util.api);

				if(JSON.parse(localStorage.getItem('facebook')) !== "")
				{
					$.ajax({
						type:"GET",
						url: Util.api + "/"+ JSON.parse(localStorage.getItem('facebook')),
						success: function(data)
						{
							console.log(data);
						}
					});
				}
				else
				{

					if(localStorage && localStorage.getItem('scores'))
						{
						scores = JSON.parse(localStorage.getItem('scores'));
						for (var i = 1; i<= 8; i++)
						{
							var levelString = "level" + i;
							if(scores[levelString] !== 0)
							{
								aantalLevelsUitgespeeld++;
								$(levels[i-1]).find('span').html(scores[levelString]);
							}else
							{
								$(levels[i-1]).find('span').html("???");
							}
						}

						for(var j = 1; j<= aantalLevelsUitgespeeld; j++)
						{
							$(levels[j]).addClass('show');
						}
					}

				}


		$("h1").click(function(){
			if($(this).html() === menuItems[0])
			{
					//logica voor het ophalen van de local storage
					if(aantalLevelsUitgespeeld < aantalLevels){
						startGame(aantalLevelsUitgespeeld+1);
					}else{
						startGame(aantalLevels);
					}
					

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

