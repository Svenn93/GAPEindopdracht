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
			context:this,
			url: Util.api + "/"+ JSON.parse(localStorage.getItem('facebook')),
			success: function(data)
			{
				if(data === "[]")
				{
						for (var u=1; u<= this.aantalLevels;u++)
						{
							level = 'level' +u;
							postData = {userid:JSON.parse(localStorage.getItem('facebook')),level:u,score:parseInt(this.scores[level])};

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
					for (var i=1; i<= this.aantalLevels;i++)
					{
						level = 'level' +i;
						postData = {level:i,score:parseInt(this.scores[level])};

						$.ajax({
						type:"POST",
						context:this,
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
	};

	return Score;

})();