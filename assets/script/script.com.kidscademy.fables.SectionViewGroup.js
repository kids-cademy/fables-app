$package("com.kidscademy.fables");

/**
 * Panoramic section view group is a container for all fable sections. Sections are displayed horizontally and group is
 * the moving part of the panorama view, controlled by mouse move. It also handle key navigation at section level; it
 * uses left and right keys to jump from section to section.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of section view group.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.SectionViewGroup = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Section descriptors.
	 * 
	 * @type Array
	 */
	this._descriptors = [];

	/**
	 * Fables section views created using section descriptors loaded from repository.
	 * 
	 * @type js.dom.EList
	 */
	this._sectionViews = null;

	/**
	 * Current section index.
	 * 
	 * @type Number
	 */
	this._sectionIndex = 0;

	var eventManager = WinMain.page.getEventManager();
	eventManager.on("key-left", this._onKeyLeft, this);
	eventManager.on("key-right", this._onKeyRight, this);
};

com.kidscademy.fables.SectionViewGroup.prototype = {
	/**
	 * Load section descriptors from fables repository. This method just start descriptors download;
	 * {@link #_onLoad(Array)} is invoked on download complete.
	 */
	load : function() {
		com.kidscademy.fables.DataSource.loadDescriptors(this._onDescriptorsLoad, this);
	},

	/**
	 * Create all section views using loaded descriptors. Initialize section views and current section index to first
	 * section then delegates {@link #_update()}.
	 * 
	 * @param Array descriptors section descriptors.
	 */
	_onDescriptorsLoad : function(descriptors) {
		this._descriptors = descriptors;
		this.getByCssClass("sections").setObject(descriptors);

		this._sectionViews = WinMain.doc.findByClass(com.kidscademy.fables.SectionView);
		this._sectionIndex = 0;
		this._update();

		var fableName = WinMain.url.parameters.fable;
		if (!fableName) {
			return;
		}

		function getSectionIndex(sections, fableName) {
			for (var i = 0, j; i < sections.length; ++i) {
				for (j = 0; j < sections[i].descriptors.length; ++j) {
					if (sections[i].descriptors[j].name === fableName) {
						return i;
					}
				}
			}
			return -1;
		}

		var sectionIndex = getSectionIndex(this._descriptors, fableName);
		if (sectionIndex !== -1) {
			this._sectionIndex = sectionIndex;
			this._sectionViews.item(this._sectionIndex).openFable(fableName).setFocus();
		}
	},

	/**
	 * Move to previous section, if not already first. This event handler just decrease current section index and
	 * delegates {@link #_update()}.
	 * 
	 * @param js.event.Event ev processing event.
	 * @return Boolean always true to indicate key event is processed.
	 */
	_onKeyLeft : function(ev) {
		if (this._sectionIndex > 0) {
			--this._sectionIndex;
			this._update();
		}
		return true;
	},

	/**
	 * Move to next section, if not already last. This event handler just increase current section index and delegates
	 * {@link #_update()}.
	 * 
	 * @param js.event.Event ev processing event.
	 * @return Boolean always true to indicate key event is processed.
	 */
	_onKeyRight : function(ev) {
		if (this._sectionIndex < this._sectionViews.size() - 1) {
			++this._sectionIndex;
			this._update();
		}
		return true;
	},

	/**
	 * Set focus on and move to current selected section. Delegates super panorama class for the actual move.
	 * 
	 * @see js.widget.Panorama#moveX(Number)
	 */
	_update : function() {
		this.moveX(this._sectionViews.item(this._sectionIndex).setFocus().style.getClientRect().left);
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.SectionViewGroup";
	}
};
$extends(com.kidscademy.fables.SectionViewGroup, js.widget.Panorama);
