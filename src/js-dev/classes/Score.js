var Score = (function(){
	function Score(){
		this.aantalLevels = 8;
		this.scores = {};

		for(var i = 1; i <= this.aantalLevels; i++)
		{
			var level = 'level' +i;
			this.scores[level] = 0;
		}

	}
	return Score;

})();