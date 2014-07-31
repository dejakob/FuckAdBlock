/*
FuckAdBlock 3.0.0
http://github.com/sitexw/FuckAdBlock
*/

(function(window) {
	if(window.fuckAdBlock !== undefined) {
		return;
	}
	
	var FuckAdBlock = function(options) {
		if(options !== undefined) {
			this.setOption(options);
		}
		
		var self = this;
		window.addEventListener('load', function() {
			setTimeout(function() {
				if(self._options.checkOnLoad === true) {
					self.check();
				}
			}, 1);
		}, false);
	};
	FuckAdBlock.prototype._options = {
		checkOnLoad:		true,
		resetOnEnd:			true,
		loopCheckTime:		50,
		loopMaxNumber:		5,
		baitClass:			'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links',
		baitStyle:			'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;',
	};
	FuckAdBlock.prototype._var = {
		bait:				null,
		checking:			false,
		loop:				null,
		loopNumber:			0,
		event:				{
								detected:		[],
								notDetected:	[]
							}
	};
	FuckAdBlock.prototype._bait = null;
	
	FuckAdBlock.prototype.setOption = function(options, value) {
		if(value !== undefined) {
			var key = options;
			options = {};
			options[key] = value;
		}
		for(option in options) {
			this._options[option] = options[option];
		}
		return this;
	};
	
	FuckAdBlock.prototype._creatBait = function() {
		this._var.bait = document.createElement('div');
		this._var.bait.setAttribute('class', this._options.baitClass);
		this._var.bait.setAttribute('style', this._options.baitStyle);
		window.document.body.appendChild(this._var.bait);
	};
	FuckAdBlock.prototype._destroyBait = function() {
		window.document.body.removeChild(this._var.bait);
		this._var.bait = null;
	};
	
	FuckAdBlock.prototype.check = function(loop) {
		if(loop === undefined) {
			loop = true;
		}
		
		if(this._var.checking === true) {
			return false;
		}
		this._var.checking = true;
		
		var self = this;
		this._var.loopNumber = 0;
		if(loop === true) {
			this._var.loop = setInterval(function() {
				self._checkBait(loop);
			}, this._options.loopCheckTime);
		}
		this._checkBait(loop);
		
		return true;
	};
	FuckAdBlock.prototype._checkBait = function(loop) {
		if(this._var.bait === null) {
			this._creatBait();
		}
		
		var detected = false;
		
		if(this._var.bait.offsetParent === null
		|| this._var.bait.offsetHeight == 0
		|| this._var.bait.offsetLeft == 0
		|| this._var.bait.offsetTop == 0
		|| this._var.bait.offsetWidth == 0
		|| this._var.bait.clientHeight == 0
		|| this._var.bait.clientWidth == 0) {
			detected = true;
		}
		if(window.getComputedStyle !== undefined) {
			var baitTemp = window.getComputedStyle(this._var.bait, null);
			if(baitTemp.getPropertyValue('display') == 'none'
			|| baitTemp.getPropertyValue('visibility') == 'hidden') {
				detected = true;
			}
		}
		
		if(loop === true) {
			this._var.loopNumber++;
			if(this._var.loopNumber >= this._options.loopMaxNumber) {
				clearInterval(this._var.loop);
				this._var.loop = null;
				this._var.loopNumber = 0;
			}
		}
		
		if(detected === true) {
			if(loop === true) {
				this._var.checking = false;
			}
			this.emitEvent(true);
		} else if(this._var.loop === null || loop === false) {
			if(loop === true) {
				this._var.checking = false;
			}
			this.emitEvent(false);
		}
	};
	
	FuckAdBlock.prototype.emitEvent = function(detected) {
		var fns = this._var.event[(detected===true?'detected':'notDetected')];
		for(i in fns) {
			fns[i]();
		}
		if(this._options.resetOnEnd === true) {
			this.clearEvent();
		}
		return this;
	};
	FuckAdBlock.prototype.clearEvent = function() {
		this._var.event.detected = [];
		this._var.event.notDetected = [];
	};
	
	FuckAdBlock.prototype.on = function(detected, fn) {
		this._var.event[(detected===true?'detected':'notDetected')].push(fn);
		return this;
	};
	FuckAdBlock.prototype.onDetected = function(fn) {
		return this.on(true, fn);
	};
	FuckAdBlock.prototype.onNotDetected = function(fn) {
		return this.on(false, fn);
	};
	
	window.fuckAdBlock = new FuckAdBlock();
})(window);