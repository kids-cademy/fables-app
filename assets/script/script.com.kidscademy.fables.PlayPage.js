$package("com.kidscademy.fables");

/**
 * Play page.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of PlayPage class.
 */
com.kidscademy.fables.PlayPage = function() {
	this.$super();
	WinMain.on("dom-ready", this._onDomReady, this);
};

com.kidscademy.fables.PlayPage.prototype = {
	bindings : function() {
		return {
			"html>body" : "com.kidscademy.fables.PlayPage.Events"
		}
	},

	_onDomReady : function(ev) {
		WinMain.doc.getByClass(com.kidscademy.fables.SectionViewGroup).load();
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.PlayPage";
	}
};
$extends(com.kidscademy.fables.PlayPage, com.kidscademy.fables.Page);

com.kidscademy.fables.PlayPage.Events = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	var eventManager = WinMain.page.getEventManager();
	eventManager.on("key-down", this._onKeyDown, this);
	eventManager.on("key-up", this._onKeyUp, this);
};

com.kidscademy.fables.PlayPage.Events.prototype = {
	_onKeyDown : function(ev) {
		alert('page down')
	},

	_onKeyUp : function(ev) {
		alert('page up')
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.PlayPage.Events";
	}
};
$extends(com.kidscademy.fables.PlayPage.Events, js.dom.Element);
$preload(com.kidscademy.fables.PlayPage.Events);
