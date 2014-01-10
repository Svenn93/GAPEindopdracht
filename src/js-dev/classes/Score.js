var Score = (function(){
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
		console.log('fb shit');
	};
	return Score;

})();