$package("com.kidscademy.fables");

/**
 * Panoramic fable view, organized into variable number of sections flowing horizontally. It has a heading section for
 * title, image and moral and text section organized into variable number of text columns.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of FableView class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.FableView = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Fable content view. A fable may have many alternative variants, although not usually, besides the base variant.
	 * On fable load first, aka base, variant is displayed, see {@link #_onFableLoaded}.
	 * 
	 * @type js.dom.Element
	 */
	this._contentView = this.getByCssClass("content");

	/**
	 * Container for variant indices list. Variant index is an user interface clue for current variant and an action to
	 * trigger variant loading.
	 * 
	 * @type js.dom.Element
	 */
	this._variantIndices = this.getByCssClass("variant-indices");

	/**
	 * Current index on variants list.
	 * 
	 * @type Number
	 */
	this._variantIndex = 0;

	this._columnText = this.getByClass(com.kidscademy.fables.ColumnText);

	this._columnsIndex = 0;

	/**
	 * Current loaded fable object.
	 * 
	 * @type Object
	 */
	this._fable = null;

	/**
	 * Play icon.
	 * 
	 * @type js.dom.Element
	 */
	this._playIcon = this.getByCss(".icon.play");

	/**
	 * Headless audio player.
	 * 
	 * @type com.kidscademy.fables.AudioPlayer
	 */
	this._audioPlayer = WinMain.doc.getByTag("audio");
	this._audioPlayer.on("ended", this._onVoiceEnded, this);

	/**
	 * Fable view close listener.
	 * 
	 * @type com.kidscademy.fables.FableCloseListener
	 */
	this._closeListener = null;

	var eventManager = WinMain.page.getEventManager();
	eventManager.on("click", this._onClick, this);
	eventManager.on("key-enter", this._onKeyEnter, this);
	eventManager.on("key-escape", this._onKeyEscape, this);
	eventManager.on("key-left", this._onKeyLeft, this);
	eventManager.on("key-right", this._onKeyRight, this);
	eventManager.on("key-up", this._onKeyUp, this);
	eventManager.on("key-down", this._onKeyDown, this);
};

com.kidscademy.fables.FableView.prototype = {
	/**
	 * Open fable view and load fable content.
	 * 
	 * @param String fableName fable name,
	 * @param com.kidscademy.fables.FableCloseListener closeListener fable view close listener.
	 */
	open : function(fableName, closeListener) {
		$assert(fableName, "com.kidscademy.fables.FableView#open", "Fable name is undefined, null or empty.");
		$assert(typeof closeListener !== "undefined", "com.kidscademy.fables.FableView#open", "Close listener is undefined.");
		$assert(js.lang.Types.isFunction(closeListener.onFableClose), "com.kidscademy.fables.FableView#open", "Invalid close listener instance.");

		this._closeListener = closeListener;
		com.kidscademy.fables.DataSource.loadFable(fableName, this._onFableLoaded, this);
	},

	_onFableLoaded : function(fable) {
		this._fable = fable;

		this._loadedVoice = null;
		this._audioPlayer.unloadMedia();
		this._playIcon.addCssClass("play").removeCssClass("pause");

		this.getByTag("img").setSrc(fable.picture);
		this._variantIndex = 0;

		if (fable.content.length > 1) {
			var variantIndices = [];
			var greeks = "αβγδεζ";
			for (var i = 0; i < fable.content.length; ++i) {
				variantIndices.push({
					index : i.toString(),
					label : greeks.charAt(i)
				});
			}
			this._variantIndices.show();
			this._variantIndices.getFirstChild().removeCssClass("active");
			this._variantIndices.setObject(variantIndices);
		}
		else {
			this._variantIndices.hide();
		}

		this._loadVariant();
		this.removeCssClass("closed");
	},

	isOpened : function() {
		return !this.hasCssClass("closed");
	},

	close : function() {
		this.addCssClass("closed");
	},

	/**
	 * Set the focus on this fable view and align fable view to viewport left edge.
	 * 
	 * @return com.kidscademy.fables.FableView this object.
	 */
	setFocus : function() {
		this.getByTag("img").setFocus();
		var rect = this.style.getClientRect();
		WinMain.doc.getByCss(".js-panorama").moveX(rect.left);
		return this;
	},

	_loadVariant : function() {
		this._columnsIndex = 0;
		this._contentView.setObject(this._fable.content[this._variantIndex]);
		var indices = this._variantIndices.getChildren();
		indices.removeCssClass("active");
		indices.item(this._variantIndex).addCssClass("active");
		this._playIcon.show(this._fable.content[this._variantIndex].voicePath);
	},

	_onClick : function(ev) {
		var el = ev.target;
		if (el.hasCssClass("close")) {
			this._audioPlayer.unloadMedia();
			this._playIcon.removeCssClass("pause").addCssClass("play");
			this.addCssClass("closed");
			this._invokeCloseListener(false);
		}
		else if (el.hasCssClass("share")) {
			var sharingDialog = WinMain.doc.getByCss(".sharing-dialog");
			sharingDialog.open(this._fable);
		}
		else if (el.hasCssClass("play")) {
			this._audioPlayer.loadMedia(com.kidscademy.fables.DataSource.getVoiceURL(this._fable.content[this._variantIndex].voicePath));
			this._audioPlayer.play();
			this._playIcon.removeCssClass("play").addCssClass("pause");
		}
		else if (el.hasCssClass("pause")) {
			this._audioPlayer.pause();
			this._playIcon.removeCssClass("pause").addCssClass("play");
		}
		else if (el.hasCssClass("variant-index")) {
			this._audioPlayer.unloadMedia();
			this._playIcon.removeCssClass("pause").addCssClass("play");
			this._variantIndex = Number(el.getAttr("data-index"));
			this._loadVariant();
		}
	},

	_onKeyEnter : function(ev) {
		this._audioPlayer.loadMedia(com.kidscademy.fables.DataSource.getVoiceURL(this._fable.content[this._variantIndex].voicePath));
		this._audioPlayer.play();
		this._playIcon.removeCssClass("play").addCssClass("pause");
		return true;
	},

	_onKeyEscape : function(ev) {
		this._audioPlayer.unloadMedia();
		this._playIcon.removeCssClass("pause").addCssClass("play");
		// true parameter signals it is a key event
		this._invokeCloseListener(true);
		return true;
	},

	_invokeCloseListener : function(keyEvent) {
		var pictureElement = this.getByCss(".picture img");
		pictureElement.on("transitionend", function() {
			this._closeListener.onFableClose(keyEvent);
		}, this);
	},

	_onKeyLeft : function(ev) {
		if (this._columnsIndex < this._columnText.getColumnsCount() - 1) {
			++this._columnsIndex;
			this._columnText.setOffset(this._columnsIndex);
		}
		return true;
	},

	_onKeyRight : function(ev) {
		if (this._columnsIndex > 0) {
			--this._columnsIndex;
			this._columnText.setOffset(this._columnsIndex);
		}
		return true;
	},

	_onKeyUp : function(ev) {
		if (this._variantIndex > 0) {
			--this._variantIndex;
			this._loadVariant();
		}
		return true;
	},

	_onKeyDown : function(ev) {
		if (this._variantIndex < this._fable.content.length - 1) {
			++this._variantIndex;
			this._loadVariant();
		}
		return true;
	},

	_onVoiceEnded : function(ev) {
		ev.halt();
		this._playIcon.removeCssClass("pause").addCssClass("play");
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.FableView";
	}
};
$extends(com.kidscademy.fables.FableView, js.dom.Element);
