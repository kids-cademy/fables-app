$package("js.event");

/**
 * Manager class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an Manager instance.
 */
js.event.Manager = function() {
	js.dom.Element.prototype.setFocus = function() {
		WinMain.page.getEventManager().setFocus(this);
	}

	js.dom.Element.prototype.hasFocus = function() {
		return WinMain.page.getEventManager().hasFocus(this);
	}

	this._startPageX = 0;
	this._startPageY = 0;
	this._moving = this._NO_MOVE;

	/**
	 * Mouse events.
	 * 
	 * @type js.event.CustomEvents
	 */
	this._moveEvents = new js.event.CustomEvents();
	this._moveEvents.register("move-x-start","move-x","move-x-end", "move-y-start","move-y","move-y-end");

	/**
	 * Hash table for registered click event listeners.
	 * 
	 * @type Object
	 */
	this._clickListeners = {};

	/**
	 * Key events.
	 * 
	 * @type js.event.KeyEvents
	 */
	this._keyEvents = new js.event.KeyEvents();

	/**
	 * Document element on which key events are dispatched.
	 * 
	 * @type js.dom.Element
	 */
	this._focusedElement = null;

	// disable key events for site product
	// WinMain.doc.on("keydown", this._onKeyDown, this);
};

js.event.Manager.prototype = {
	_MOVING_OFFSET : 10,
	_NO_MOVE : 0,
	_X_MOVE : 1,
	_Y_MOVE : 2,

	/**
	 * Mark CSS class for focused document element. Only one element at a time can have focus. See {@link #setFocus()}.
	 */
	_FOCUS_CSS : "focus",

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
		$assert(js.lang.Types.isElement(scope), "js.event.Manager#on", "Scope is not a document element.");

		if (type === "click") {
			this._clickListeners[scope.hashCode()] = listener;
			return;
		}

		if (this._moveEvents.hasType(type)) {
			// TODO: is possible this solution to work only for single move listener; test and refine 
			scope.on("mousedown", this._onMouseDown, this);
			scope.on("touchstart", this._onMouseDown, this);
			// do not assert here the event type since custom events takes care
			this._moveEvents.addListener(type, listener, scope);
			return;
		}

		// here we should have a key event listener and scope should be a document element
		// otherwise KeyEvents#addListener will assert
		this._keyEvents.addListener(type, listener, scope);
	},

	_onMouseDown : function(ev) {
		ev.prevent();
		this._startPageX = ev.pageX;
		this._startPageY = ev.pageY;
		
		WinMain.doc.on("mousemove", this._onMouseMove, this);
		WinMain.doc.on("touchmove", this._onMouseMove, this);
		
		WinMain.doc.on("mouseup", this._onMouseUp, this);
		WinMain.doc.on("touchend", this._onMouseUp, this);
	},

	_onMouseMove : function(ev) {
		//ev.prevent();
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
				this._moveEvents.fire("move-x-start");
				this._moving = this._X_MOVE;
			}
			else {
				this._moveEvents.fire("move-y-start");
				this._moving = this._Y_MOVE;
			}
			return;
		}

		if (this._moving === this._X_MOVE) {
			this._moveEvents.fire("move-x", deltaX);
		}
		if (this._moving === this._Y_MOVE) {
			this._moveEvents.fire("move-y", deltaY);
		}
	},

	_onMouseUp : function(ev) {
		//ev.prevent();

		WinMain.doc.un('mousemove', this._onMouseMove);
		WinMain.doc.un('touchmove', this._onMouseMove);
		
		WinMain.doc.un('mouseup', this._onMouseUp);
		WinMain.doc.un('touchend', this._onMouseUp);

		var moving = this._moving;
		this._moving = this._NO_MOVE;
		switch (moving) {
		case this._X_MOVE:
			this._moveEvents.fire("move-x-end");
			return;
		case this._Y_MOVE:
			this._moveEvents.fire("move-y-end");
			return;
		}

		if (ev.isRightClick()) {
			return;
		}

		var element = ev.target;
		while (!(element.hashCode() in this._clickListeners)) {
			element = element.getParent();
			if (element == null) {
				return;
			}
		}
		var listener = this._clickListeners[element.hashCode()];
		if (listener != null) {
			ev.type = "click";
			listener.call(element, ev);
		}
	},

	/**
	 * Set current focused element.
	 * 
	 * @param js.dom.Element element document to set element to.
	 */
	setFocus : function(element) {
		if (this._focusedElement !== null) {
			this._focusedElement.removeCssClass(this._FOCUS_CSS);
		}
		this._focusedElement = element;
		this._focusedElement.addCssClass(this._FOCUS_CSS);
	},

	hasFocus : function(element) {
		return this._focusedElement === element;
	},

	_onKeyDown : function(ev) {
		var keyEventType = this._keyEvents.getType(ev.key);
		if (keyEventType == null) {
			return;
		}
		if (this._focusedElement == null) {
			return;
		}

		ev.halt();
		var focusedElement = this._getListeningElement(this._focusedElement, keyEventType);
		if (this._keyEvents.fire(focusedElement, keyEventType) === true) {
			return;
		}

		// if current focused element did not process the event try an ancestor
		var ancestorElement = this._getListeningElement(focusedElement.getParent(), keyEventType);
		this._keyEvents.fire(ancestorElement, keyEventType);
	},

	_getListeningElement : function(element, keyEventType) {
		for (;; element = element.getParent()) {
			if (element == null) {
				return null;
			}
			if (this._keyEvents.hasListener(element, keyEventType)) {
				break;
			}
		}
		return element;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "js.event.Manager";
	}
};
$extends(js.event.Manager, Object);
