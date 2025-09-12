$package("com.kidscademy.fables");

/**
 * Fables section view has an header and a grid and controls attached fables list and view.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of FablesSection class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.SectionView = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Section descriptor contains section indices and fable descriptors.
	 * 
	 * @type Object
	 */
	this._section = null;

	/**
	 * Section header view.
	 * 
	 * @type com.kidscademy.fables.SectionHeader
	 */
	this._headerView = this.getByClass(com.kidscademy.fables.SectionHeader);
	this._headerView.on("collapse", this._onCollapse, this);
	this._headerView.on("menu", this._onMenu, this);

	/**
	 * Fables grid view.
	 * 
	 * @type com.kidscademy.fables.SectionGrid
	 */
	this._gridView = this.getByClass(com.kidscademy.fables.SectionGrid);
	this._gridView.on("load", this._onGridLoaded, this);
	this._gridView.on("click", this._onFableClick, this);
	this._gridView.on("select", this._onFableSelect, this);
	this._gridView.on("unselect", this._onFableUnselect, this);

	/**
	 * Fables list view attached to this section.
	 * 
	 * @type com.kidscademy.fables.FablesListView
	 */
	this._fablesListView = null;

	/**
	 * Fable view attached to this section.
	 * 
	 * @type com.kidscademy.fables.FableView
	 */
	this._fableView = null;

	var eventManager = WinMain.page.getEventManager();
	eventManager.on("key-down", this._onKeyDown, this);
	eventManager.on("key-up", this._onKeyUp, this);
};

com.kidscademy.fables.SectionView.prototype = {
	setObject : function(section) {
		this._section = section;

		this._headerView.setIndices(section);
		this._gridView.load(section.descriptors);

		this._fablesListView = this._getFablesList();
		this._fableView = this._getFableView();

		this._fablesListView.setFableView(this._fableView);
		this._fablesListView.on("close", this._onFablesListClose, this);
		return this;
	},

	setFocus : function() {
		this._headerView.setFocus();
		return this;
	},

	/**
	 * Open named fable into this section fable view and return the fable view reference.
	 * 
	 * @param String fableName name of the fable to open.
	 * @return fable view reference.
	 */
	openFable : function(fableName) {
		this._onFableClick(fableName, false);
		return this._fableView;
	},

	_onGridLoaded : function() {
		this.style.setWidth(this._gridView.style.getWidth());
		this.addCssClass("opened");
	},

	_onCollapse : function() {
		this.toggleCssClass("collapsed");
	},

	_onMenu : function(keyEvent) {
		if (!this._fablesListView.isOpened()) {
			this._fablesListView.open(keyEvent);
		}
		else {
			this._fablesListView.close();
			if (keyEvent) {
				this._gridView.setFocus();
			}
		}
	},

	_onFablesListClose : function() {
		var rect = this.style.getClientRect();
		// using WinMain.doc.getByCssClass(js.widget.Panorama) results in circular dependency
		WinMain.doc.getByCssClass("js-panorama").moveX(rect.left);
		this.setFocus();
	},

	_onFableClick : function(fableName, keyEvent) {
		if (this._fableView.isOpened() && keyEvent) {
			this._fableView.setFocus();
		}
		else {
			this._headerView.clearCaption();
		}
		this._fableView.open(fableName, this);
	},

	_onFableSelect : function(descriptor) {
		if (this._fableView.isOpened()) {
			this._fableView.open(descriptor.name, this);
		}
		else {
			this._headerView.setCaption(descriptor.title);
		}
	},

	onFableClose : function(keyEvent) {
		if (keyEvent) {
			var rect = this.style.getClientRect();
			// using WinMain.doc.getByCssClass(js.widget.Panorama) results in circular dependency
			WinMain.doc.getByCssClass("js-panorama").moveX(rect.left);
			this._gridView.setFocus();
		}
	},

	_onFableUnselect : function(descriptor) {
		this._headerView.setCaption(descriptor.title);
		this._fableView.close();
	},

	_onKeyDown : function(ev) {
		if (this._gridView.hasFocus()) {
			return false;
		}
		this._gridView.setFocus();
		return true;
	},

	_onKeyUp : function(ev) {
		if (this._headerView.hasFocus()) {
			return false;
		}
		this._headerView.setFocus();
		return true;
	},

	_getFablesList : function() {
		var fablesListTemplate = WinMain.doc.getByCss(".components .fables-list");
		if (fablesListTemplate == null) {
			return;
		}
		var fablesListView = fablesListTemplate.clone(true);
		fablesListView.setDescriptors(this._section.descriptors);

		var nextSibling = this.getNextSibling();
		if (nextSibling != null) {
			nextSibling.insertBefore(fablesListView);
		}
		else {
			this.getParent().addChild(fablesListView);
		}

		return fablesListView;
	},

	_getFableView : function() {
		// create fable view element from components template
		var fableViewTemplate = WinMain.doc.getByCss(".components .fable-view");
		if (fableViewTemplate == null) {
			return;
		}
		var fableView = fableViewTemplate.clone(true);

		// get next section or null if current one is the last
		var nextSection = this.getNextSibling();
		while (nextSection != null && !nextSection.hasCssClass("fables-section")) {
			nextSection = nextSection.getNextSibling();
		}

		// insert fable view before next section, if any, or at parent end
		if (nextSection != null) {
			nextSection.insertBefore(fableView);
		}
		else {
			this.getParent().addChild(fableView);
		}

		return fableView;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.SectionView";
	}
};
$extends(com.kidscademy.fables.SectionView, js.dom.Element);
$implements(com.kidscademy.fables.SectionView, com.kidscademy.fables.FableCloseListener);
