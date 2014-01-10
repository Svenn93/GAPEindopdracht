/*globals Util:true*/

var Score = (function(){

	var level;
	var postData;

	function Score(){
		this.aantalLevels = 8;
		this.scores = {};

		if(localStorage && localStorage.getItem('scores')){
			this.scores = JSON.parse(localStorage.getItem('scores'));
		}else{
			for(var i = 1; i <= this.aantalLevels; i++)
			{
				var level = 'level' +i;
				this.scores[level] = 0;
			}
		}
		
	}

	Score.prototype.saveScore = function(level, score) {
		var levelString = "level" + level;
		this.scores[levelString] = score;
		this.saveScoresToLocalStorage();
	};

	Score.prototype.saveScoresToLocalStorage = function() {
		localStorage.setItem('scores', JSON.stringify(this.scores));
		this.syncScores();
	};

	Score.prototype.syncScores = function() {

		$.ajax({
			type:"GET",
			url: Util.api + "/"+ JSON.parse(localStorage.getItem('facebook')),
			success: function(data)
			{
				if(data === "[]")
				{
					console.log("empty");
					console.log("fsdfsd");
						for (var u=0; u< this.aantalLevels;u++)
						{
							console.log("for lus");
							level = 'level' +u;
							postData = {userid:JSON.parse(localStorage.getItem('facebook')),level:u,score:parseInt(this.scores[level])};
							console.log(postData);

							console.log("begin ajax");
							$.ajax({
							type:"POST",
							url: Util.api,
							data: postData,
							success: this.scorePosted()
							});
						}
				}
				else
				{
					console.log("not empty");
					for (var i=0; i< this.aantalLevels;i++)
					{
						level = 'level' +i;
						postData = {level:i,score:parseInt(this.scores[level])};
						console.log(postData);

						$.ajax({
						type:"POST",
						url: Util.api + "/" +JSON.parse(localStorage.getItem('facebook')),
						data: postData,
						success: this.scorePosted()
						});
					}
				}
			}
		});



		


		
	};

	Score.prototype.scorePosted = function(data) {
		console.log("great success");
	};

	return Score;

})();