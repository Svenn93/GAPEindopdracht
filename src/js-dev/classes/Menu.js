/*globals bean:true*/
var Menu = (function(){

	function Menu(){
		this.paused = false;
		this.restart = false;
		$('#inGameMenuButton').click($.proxy(this.menuHandler, this));
		$("#inGameMenu ul").on("click", "li", $.proxy(this.menuItemHandler, this));


	}

	Menu.prototype.menuItemHandler = function(e){
		e.preventDefault();
		switch($(e.currentTarget).html())
		{
			/*case "Main menu":

			break;*/

			case "Restart":
				if(this.paused){
					$("#inGameMenu").slideUp();
					this.setRestart(true);
					this.setPaused(false);
				}
			break;

			case "Continue":
			if(this.paused){
				$("#inGameMenu").slideUp();
				this.setPaused(false);
			}
			break;
		}

	};

	Menu.prototype.menuHandler = function() {
		$("#inGameMenu").slideDown();
		if(!this.paused)
		{
			this.setPaused(true);
		}

	};

	Menu.prototype.setPaused = function(state) {
		if(this.paused !== state){
			this.paused = state;
			bean.fire(this, 'pausedStateChanged');
		}
	};

	Menu.prototype.setRestart = function(state) {
		if(this.restart !== state){
			this.restart = state;
		}
	};

	return Menu;
})();