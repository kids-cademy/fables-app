$package("js.event");

/**
 * KeyEvents class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an KeyEvents instance.
 */
js.event.KeyEvents = function() {
	this.$super(arguments);

	/**
	 * Elements to event types hash table. This map contains key event types for registered elements. It is used by
	 * {@link #hasListener(js.dom.Element, String)} predicate.
	 * 
	 * @type Object
	 */
	this._elementEvents = {};

	for ( var key in js.event.KeyEvents.KEYS) {
		this.register(js.event.KeyEvents.KEYS[key]);
	}
};

/**
 * Keys table. This hash table maps key codes to synthetic key event types. It is platform dependent.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
js.event.KeyEvents.KEYS = {
	"13" : "key-enter",
	"27" : "key-escape",
	"37" : "key-left",
	"39" : "key-right",
	"38" : "key-up",
	"40" : "key-down",
	"112" : "key-f1",
	"113" : "key-f2",
	"114" : "key-f3",
	"115" : "key-f4"
};

if (typeof Common !== "undefined") {
	js.event.KeyEvents.KEYS = {
		"29443" : "key-enter",
		"88" : "key-escape",
		"4" : "key-left",
		"5" : "key-right",
		"29460" : "key-up",
		"29461" : "key-down",
		"108" : "key-f1",
		"20" : "key-f2",
		"21" : "key-f3",
		"22" : "key-f4"
	};
}

js.event.KeyEvents.prototype = {
	/**
	 * Get key event type associated to requested key code. Returns null if requested key code has no event type
	 * associated. See {@link js.event.KeyEvents.KEYS} for supported key event types.
	 * 
	 * @param Number key code.
	 * @return String key event type or null.
	 */
	getType : function(key) {
		var type = js.event.KeyEvents.KEYS[key.toString()];
		return typeof type !== "undefined" ? type : null;
	},

	/**
	 * Add key event listener. This method delegates super
	 * {@link js.event.CustomEvents#addListener(String, Function, Object)} and update {@link #_elementEvents}. Element
	 * parameter should be a document element otherwise this method is NOP.
	 * <p>
	 * Listener method should accept a parameter of type {@link js.event.Event} and return boolean true if it does
	 * process key event, see signature below. If listener does not return boolean true, i.e. return false or undefined,
	 * events manager will try to locate an ancestor to process the event.
	 * 
	 * <pre>
	 * 	Boolean listener(js.event.Event);
	 * </pre>
	 * 
	 * @param String type key event type,
	 * @param Function listener event listener,
	 * @param js.dom.Element element document element owning listener method.
	 * @assert <code>element</code> parameter is a document element and all assertions inherited from
	 * {@link js.event.CustomEvents#addListener(String, Function, Object)}.
	 */
	addListener : function(type, listener, element) {
		$assert(js.lang.Types.isElement(element), "js.event.KeyEvents#addListener", "Element parameter is not a document element.");
		if (!js.lang.Types.isElement(element)) {
			return;
		}
		this.$super("addListener", type, listener, element);

		var eventTypes = this._elementEvents[element.hashCode()];
		if (typeof eventTypes === "undefined") {
			eventTypes = [];
			this._elementEvents[element.hashCode()] = eventTypes;
		}
		eventTypes.push(type);
	},

	/**
	 * Determine if element has listener for key event type.
	 * 
	 * @param js.dom.Element element document element to test for key event registration,
	 * @param String type key event type.
	 * @return Boolean true if <code>element</code> is registered for key event <code>type</code>.
	 */
	hasListener : function(element, type) {
		var eventTypes = this._elementEvents[element.hashCode()];
		if (typeof eventTypes === "undefined") {
			return false;
		}
		return eventTypes.indexOf(type) !== -1;
	},

	/**
	 * Fire key event type on element. This method searched for event handler of specified key event type and with scope
	 * equal with <code>element</code> and invoke registered listener. If <code>element</code> has not a registered
	 * listener or is null this method does nothing.
	 * 
	 * @param js.dom.Element element document element in charge with event processing,
	 * @param String type key event type.
	 * @return Boolean true if element key event listener does process the event.
	 */
	fire : function(element, type) {
		$assert(type, "js.event.KeyEvents#fire", "Undefined, null or empty key event type.");

		var handlers = this._events[type];
		$assert(handlers, "js.event.KeyEvents#fire", "Trying to fire not registered key event |%s|.", type);
		if (!handlers) {
			return;
		}

		var it = new js.lang.Uniterator(handlers), h, result;
		while (it.hasNext()) {
			h = it.next();
			if (h.scope !== element) {
				continue;
			}

			try {
				h.running = true;
				var event = {
					type : type,
					target : element,
					timeStamp : Date.now()
				}
				result = h.listener.apply(h.scope, event, $args(arguments, 2));
				h.running = false;
			} catch (er) {
				js.ua.System.error(er);
			}
			break;
		}
		return result;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "js.event.KeyEvents";
	}
};
$extends(js.event.KeyEvents, js.event.CustomEvents);
