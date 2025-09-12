$package("com.kidscademy.fables");

/**
 * Section header view has collapse and menu actions and views for section start and end indices. While section is in
 * <em>navigation</em> mode header display current fable title instead, see {@link com.kidscademy.fables.SectionView}.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * @constructor Construct an instance of SectionHeader class.
 * 
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.SectionHeader = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Controls view group contains start and end index views.
	 * 
	 * @type js.dom.Element
	 */
	this._controlsViewGroup = this.getByCssClass("controls");

	/**
	 * Start index view.
	 * 
	 * @type js.dom.Element
	 */
	this._startIndexView = this.getByCss(".indices .start");

	/**
	 * End index view.
	 * 
	 * @type js.dom.Element
	 */
	this._endIndexView = this.getByCss(".indices .end");

	/**
	 * Header caption view displays current fable title while section is in <em>navigation</em> mode. While caption
	 * view is active controls view group is disabled.
	 * 
	 * @type js.dom.Element
	 * @see com.kidscademy.fables.SectionView
	 */
	this._captionView = this.getByCssClass("caption");

	/**
	 * Custom events fired by section header.
	 * 
	 * @type js.event.CustomEvent
	 */
	this._events = this.getCustomEvents();
	this._events.register("collapse", "menu");

	var eventManager = WinMain.page.getEventManager();
	eventManager.on("click", this._onClick, this);
	eventManager.on("key-enter", this._onKeyEnter, this);
	eventManager.on("key-escape", this._onKeyEscape, this);
};

com.kidscademy.fables.SectionHeader.prototype = {
	/**
	 * Mark CSS class for menu action.
	 * 
	 * @type String
	 */
	_MENU_CSS : "menu",

	/**
	 * Mark CSS class for collapse action.
	 * 
	 * @type String
	 */
	_COLLAPSE_CSS : "collapse",

	setIndices : function(sectionDescriptor) {
		this._startIndexView.setText($format("%03d", sectionDescriptor.startIndex + 1));
		this._endIndexView.setText($format("%03d", sectionDescriptor.endIndex));
	},

	setCaption : function(caption) {
		this._captionView.setText(caption);
		this._captionView.show();
		this._controlsViewGroup.hide();
	},

	clearCaption : function() {
		this._captionView.hide();
		this._controlsViewGroup.show();
	},

	setFocus : function() {
		this.$super("setFocus");
		this.clearCaption();
	},

	_onClick : function(ev) {
		if (ev.target.hasCssClass(this._MENU_CSS)) {
			this._events.fire("menu");
		}
		else if (ev.target.hasCssClass(this._COLLAPSE_CSS)) {
			this._events.fire("collapse");
		}
	},

	_onKeyEnter : function() {
		this._events.fire("menu", true);
		return true;
	},

	_onKeyEscape : function() {
		this._events.fire("collapse");
		return true;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.SectionHeader";
	}
};
$extends(com.kidscademy.fables.SectionHeader, js.dom.Element);
