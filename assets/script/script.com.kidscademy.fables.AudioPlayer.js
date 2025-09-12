$package("com.kidscademy.fables");

/**
 * Headless audio player used for fable voices.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct audio player element instance.
 * 
 * 
 * @param js.dom.Document ownerDoc, element owner document,
 * @param Node node, native {@link Node} instance.
 * @assert <em>ownerDoc</em> argument is not undefined or null and is instance of {@link js.dom.Document}. Also
 * <em>node</em> argument should be of <em>a</em> type.
 */
com.kidscademy.fables.AudioPlayer = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
	this._events = this.getCustomEvents();
	this._events.register("media-loaded");

	this._node.addEventListener("canplay", this._onCanPlay.bind(this));
};

com.kidscademy.fables.AudioPlayer.prototype = {
	loadMedia : function(audioTrackURL) {
		this._node.setAttribute("src", audioTrackURL);
	},

	unloadMedia : function() {
		this._node.setAttribute("src", "");
	},

	play : function() {
		this._node.play();
	},

	pause : function() {
		this._node.pause();
	},

	_onCanPlay : function(ev) {
		this._events.fire("media-loaded");
	},

	toString : function() {
		return "com.kidscademy.fables.AudioPlayer";
	}
};
$extends(com.kidscademy.fables.AudioPlayer, js.dom.Element);
$preload(com.kidscademy.fables.AudioPlayer);
