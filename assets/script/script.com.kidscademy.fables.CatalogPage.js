$package("com.kidscademy.fables");

/**
 * CatalogPage class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of CatalogPage class.
 */
com.kidscademy.fables.CatalogPage = function() {
	this.$super();

	/**
	 * Fables collection contains all fables no mater tags filtering is active.
	 * 
	 * @type Array
	 */
	this._fables = [];

	/**
	 * List view for search tags.
	 * 
	 * @type js.dom.Element
	 */
	this._tagsListView = WinMain.doc.getByCss(".catalog .tags");
	this._tagsListView.on("click", this._onTagsClick, this);

	/**
	 * Current select tag view.
	 * 
	 * @type js.dom.Element
	 */
	this._selectedTagView = null;

	this._fablesView = WinMain.doc.getByCss(".catalog .fables");
	this._fablesView.on("click", this._onFableClick, this);

	com.kidscademy.fables.DataSource.loadTags(this._onTagsLoad, this);
};

com.kidscademy.fables.CatalogPage.prototype = {
	_onTagsLoad : function(tags) {
		tags.forEach(function(tag) {
			tag.icon = com.kidscademy.fables.DataSource.getTagIconURL(tag.iconPath);
		}, this);
		
		this._tagsListView.setObject(tags);
		
		com.kidscademy.fables.DataSource.loadDescriptors(this._onDescriptorsLoad, this);
	},

	_onDescriptorsLoad : function(descriptors) {
		this._fables = [];
		descriptors.forEach(function(sectionDescriptor) {
			sectionDescriptor.descriptors.forEach(function(fableDescriptor) {
				this._fables.push({
					name : fableDescriptor.name,
					icon : com.kidscademy.fables.DataSource.getFableIconURL(fableDescriptor.name),
					title : fableDescriptor.title,
					tags : fableDescriptor.tags
				});
			}, this);
		}, this);
	},

	_onTagsClick : function(ev) {
		var tagView = ev.target.getParentByTag("li");

		if (this._selectedTagView !== null) {
			this._selectedTagView.removeCssClass("active");
		}
		this._selectedTagView = tagView;
		this._selectedTagView.addCssClass("active");

		var tag = tagView.getAttr("data-tag");

		var fables = [];
		this._fables.forEach(function(fable) {
			if (fable.tags.indexOf(tag) !== -1) {
				fables.push(fable);
			}
		});
		this._fablesView.show();
		this._fablesView.setObject(fables);
	},

	_onFableClick : function(ev) {
		var fableName = ev.target.getParentByTag("li").getAttr("data-fable");
		WinMain.assign("play.htm", {
			fable : fableName
		});
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.CatalogPage";
	}
};
$extends(com.kidscademy.fables.CatalogPage, com.kidscademy.fables.Page);
