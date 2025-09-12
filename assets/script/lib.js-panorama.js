$package("js.widget");

js.widget.Panorama = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
	this.addCssClass("js-panorama").addCssClass("no-select");

	this._startLeft = 0;
	this._left = 0;
	this._moving = false;
	this._roller = this.getByCssClass("roller");

	this._eventManager = WinMain.page.getEventManager();
	this._eventManager.on("move-x-start", this._onMoveXStart, this);
	this._eventManager.on("move-x", this._onMoveX, this);
	this._eventManager.on("move-x-end", this._onMoveXEnd, this);
};

js.widget.Panorama.prototype = {
	_SNAP_ANIM_DURATION : 500,

	moveX : function(deltaX, callback, scope) {
		this._left -= deltaX;
		this._roller.style.setLeft(this._left);
	},

	_onMoveXStart : function() {
		this._left = this._startLeft = parseInt(this._roller.style.get('left'));
		this._moving = true;
		this._render();
	},

	_onMoveX : function(deltaX) {
		this._left = this._startLeft + deltaX;
	},

	_onMoveXEnd : function() {
		this._moving = false;
		if (this._left > 0) {
			this._snapLeft();
		}
		else if (this._left < WinMain.getWidth() - this._roller.style.getWidth()) {
			if (WinMain.getWidth() > this._roller.style.getWidth()) {
				// if panorama content is smaller that viewport width snap always to left
				this._snapLeft();
			}
			else {
				this._snapRight();
			}
		}
	},

	_render : function() {
		this._roller.style.setLeft(this._left);
		if (this._moving) {
			window.requestAnimationFrame(this._render.bind(this));
		}
	},

	_snapLeft : function() {
		var anim = new js.fx.Anim({
			el : this._roller,
			style : "left",
			duration : this._SNAP_ANIM_DURATION,
			from : this._left,
			to : 0,
			ttf : js.fx.TTF.Logarithmic
		});
		anim.start();
	},

	_snapRight : function() {
		var anim = new js.fx.Anim({
			el : this._roller,
			style : "left",
			duration : this._SNAP_ANIM_DURATION,
			from : this._left,
			to : WinMain.getWidth() - this._roller.style.getWidth(),
			ttf : js.fx.TTF.Logarithmic
		});
		anim.start();
	},

	toString : function() {
		return "js.widget.Panorama";
	}
};
$extends(js.widget.Panorama, js.dom.Element);

js.widget.EventManager = function(panorama) {
	this._startPageX = 0;
	this._startPageY = 0;
	this._moving = this._NO_MOVE;

	this._moveEvents = new js.event.CustomEvents();
	this._moveEvents.register(this.X_MOVE_START, this.X_MOVE, this.X_MOVE_END, this.Y_MOVE_START, this.Y_MOVE, this.Y_MOVE_END);

	/**
	 * Hash table for registered click event listeners.
	 * 
	 * @type Object
	 */
	this._clickListeners = {};

	panorama.on("mousedown", this._onMouseDown, this);
	panorama.on("touchstart", this._onMouseDown, this);
};

js.widget.EventManager.prototype = {
	X_MOVE_START : "x-move-start",
	X_MOVE : "x-move",
	X_MOVE_END : "x-move-end",
	Y_MOVE_START : "y-move-start",
	Y_MOVE : "y-move",
	Y_MOVE_END : "y-move-end",

	_MOVING_OFFSET : 10,
	_NO_MOVE : 0,
	_X_MOVE : 1,
	_Y_MOVE : 2,

	/**
	 * Mark CSS class for event handler.
	 * 
	 * @type String
	 */
	_EVENT_HANDLER_CSS : "event-handler",

	/**
	 * Register listener for both move and click events. Events manager handler two kinds of events: move and click
	 * events.
	 * <p>
	 * Note that for click events only child descendants of given scope are fired. In this case scope is and event
	 * handler that is a document element.
	 * 
	 * @param String type even type,
	 * @param Function listener event listener to register,
	 * @param Object scope listener run-time scope.
	 * @assert parameters are of proper type and not undefined, null or empty.
	 */
	on : function(type, listener, scope) {
		$assert(type, "js.widget.EventManager#on", "Event type is undefined, null or empty.");
		$assert(js.lang.Types.isString(type), "js.widget.EventManager#on", "Event type is not a string.");
		$assert(listener, "js.widget.EventManager#on", "Listener is undefined or null.");
		$assert(js.lang.Types.isFunction(listener), "js.widget.EventManager#on", "Listener is not a function.");
		$assert(js.lang.Types.isObject(scope), "js.widget.EventManager#on", "Scope is not an object.");

		if (type === "click") {
			$assert(scope.hasCssClass(this._EVENT_HANDLER_CSS), "js.widget.EventManager#on", "Scope for click is not an event handler. Missing '%s' CSS class.", this._EVENT_HANDLER_CSS);
			this._clickListeners[scope.hashCode()] = listener;
		}
		else {
			// do not assert here the event type since custom events takes care
			this._moveEvents.addListener(type, listener, scope);
		}
	},

	_onMouseDown : function(ev) {
		ev.halt();
		this._startPageX = ev.pageX;
		this._startPageY = ev.pageY;
		
		WinMain.doc.on("mousemove", this._onMouseMove, this);
		WinMain.doc.on("touchmove", this._onMouseMove, this);
		
		WinMain.doc.on("mouseup", this._onMouseUp, this);
		WinMain.doc.on("touchend", this._onMouseUp, this);
	},

	_onMouseMove : function(ev) {
		var deltaX, deltaY, absDeltaX, absDeltaY;

		deltaX = ev.pageX - this._startPageX;
		deltaY = ev.pageY - this._startPageY;

		if (this._moving === this._NO_MOVE) {
			absDeltaX = Math.abs(deltaX);
			absDeltaY = Math.abs(deltaY);
			if (absDeltaX < this._MOVING_OFFSET && absDeltaY < this._MOVING_OFFSET) {
				return;
			}
			if (Math.abs(deltaX) >= Math.abs(deltaY)) {
				this._moveEvents.fire(this.X_MOVE_START);
				this._moving = this._X_MOVE;
			}
			else {
				this._moveEvents.fire(this.Y_MOVE_START);
				this._moving = this._Y_MOVE;
			}
			return;
		}

		if (this._moving === this._X_MOVE) {
			this._moveEvents.fire(this.X_MOVE, deltaX);
		}
		if (this._moving === this._Y_MOVE) {
			this._moveEvents.fire(this.Y_MOVE, deltaY);
		}
	},

	_onMouseUp : function(ev) {
		WinMain.doc.un('mousemove', this._onMouseMove);
		WinMain.doc.un('touchmove', this._onMouseMove);
		
		WinMain.doc.un('mouseup', this._onMouseUp);
		WinMain.doc.un('touchend', this._onMouseUp);

		var moving = this._moving;
		this._moving = this._NO_MOVE;
		switch (moving) {
		case this._X_MOVE:
			this._moveEvents.fire(this.X_MOVE_END);
			return;
		case this._Y_MOVE:
			this._moveEvents.fire(this.Y_MOVE_END);
			return;
		}

		if (ev.isRightClick()) {
			return;
		}
		var eventHandler = ev.target.getParentByCssClass(this._EVENT_HANDLER_CSS);
		if (eventHandler == null) {
			return;
		}
		var listener = this._clickListeners[eventHandler.hashCode()];
		if (listener != null) {
			listener.call(eventHandler, ev.target);
		}
	},

	toString : function() {
		return "js.widget.EventManager";
	}
};
$extends(js.widget.EventManager, Object);
