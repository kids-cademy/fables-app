$package("com.kidscademy.fables");

/**
 * Fables section grid displays fable tiles and handle mouse click and navigation key events.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of FablesGrid class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.SectionGrid = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Fable descriptors list.
	 * 
	 * @type Array
	 */
	this._descriptors = null;

	/**
	 * Grid matrix, that is, two dimensions fable descriptors array. Created dynamically at fables list loading, see
	 * {@link #setObject(Array)}. Contains references to fable descriptors stored into {@link #_descriptors} but
	 * organized on two dimensions.
	 * 
	 * @type Array
	 */
	this._matrix = null;

	/**
	 * Left index for current selected grid cell.
	 * 
	 * @type Number
	 */
	this._leftIndex = 0;

	/**
	 * Top index for current selected grid cell.
	 * 
	 * @type Number
	 */
	this._topIndex = 0;

	/**
	 * Number of images to wait for loading. It is used in conjunction with loaded images count, see
	 * {@link #_imagesLoaded}.
	 * 
	 * @type Number
	 */
	this._imagesCount = 0;

	/**
	 * Loaded images count. Method {@link #_onImageLoaded(js.event.Event)} compare this value with {@link #_imagesCount}
	 * and finalize grid initialization when they are equal.
	 * 
	 * @type Number
	 */
	this._imagesLoaded = 0;

	var events = this.getCustomEvents();
	events.register("load", "click", "select", "unselect");

	this._eventManager = WinMain.page.getEventManager();
	this._eventManager.on("click", this._onClick, this);
	this._eventManager.on("key-down", this._onKeyDown, this);
	this._eventManager.on("key-up", this._onKeyUp, this);
	this._eventManager.on("key-left", this._onKeyLeft, this);
	this._eventManager.on("key-right", this._onKeyRight, this);
	this._eventManager.on("key-enter", this._onKeyEnter, this);
	this._eventManager.on("key-escape", this._onKeyEscape, this);
};

com.kidscademy.fables.SectionGrid.prototype = {
	/**
	 * Image pixels unit for fable tile. Tile image size is a multiple of this value. It is used to determine the number
	 * of cells a fable tile may need for display.
	 * 
	 * @type Number
	 */
	_TILE_UNIT : 128,

	/**
	 * Grid cell margin.
	 * 
	 * @type Number
	 */
	_CELL_MARGIN : 2,

	/**
	 * Custom attribute for fable name.
	 * 
	 * @type String
	 */
	_FABLE_ATTR : "data-fable",

	/**
	 * Load fables list.
	 * 
	 * @param Array descriptors fable descriptors list.
	 * @return com.kidscademy.fables.SectionGrid this object.
	 */
	load : function(descriptors) {
		$assert(descriptors.length > 0, "com.kidscademy.fables.SectionGrid#load", "Empty fable descriptors list.");

		this._descriptors = descriptors;
		var CELL_SIZE = this._TILE_UNIT + this._CELL_MARGIN;

		// TODO re-think race condition: what if all images are loaded before assigning images count?
		this._imagesCount = Number.MAX_VALUE;
		var imagesCount = 0;

		// traverse fable descriptors and create grid tile image at defined left and top indices
		descriptors.forEach(function(descriptor) {
			var img = this._ownerDoc.createElement("img");
			this.addChild(img);
			++imagesCount;

			img.on("load", this._onImageLoaded, this);
			img.setSrc(com.kidscademy.fables.DataSource.getFableTileURL(descriptor.name));
			img.setAttr(this._FABLE_ATTR, descriptor.name);
			img.setAttr("title", descriptor.title);
			img.addCssClass("fable");
			img.style.setLeft(CELL_SIZE * descriptor.leftIndex);
			img.style.setTop(CELL_SIZE * descriptor.topIndex);

			descriptor.element = img;
		}, this);

		this._imagesCount = imagesCount;
		return this;
	},

	/**
	 * Keep track of loaded images and finalize this grid initialization when all images loading is complete.
	 * <p>
	 * Add <code>opened</code> CSS class and fires <code>load</code> event after grid initialization completes.
	 * 
	 * @param js.event.Event ev event object.
	 */
	_onImageLoaded : function(ev) {
		// wait till all images are loaded
		++this._imagesLoaded;
		if (this._imagesCount > this._imagesLoaded) {
			return;
		}

		// initialize fable descriptors matrix and compute grid columns count
		this._matrix = [];
		var i, gridColumnsCount = 0;
		this._descriptors.forEach(function(descriptor) {
			if (typeof this._matrix[descriptor.topIndex] === "undefined") {
				this._matrix[descriptor.topIndex] = [];
			}

			var fableColumnsCount = Math.floor(descriptor.element.style.getWidth() / this._TILE_UNIT);
			var fableRowsCount = Math.floor(descriptor.element.style.getHeight() / this._TILE_UNIT);
			descriptor.element.addCssClass($format("s%dx%d", fableColumnsCount, fableRowsCount));

			for (i = 0; i < fableColumnsCount; ++i) {
				this._matrix[descriptor.topIndex][descriptor.leftIndex + i] = descriptor;
				if (gridColumnsCount < descriptor.leftIndex + i) {
					gridColumnsCount = descriptor.leftIndex + i;
				}
			}

			for (i = 1; i < fableRowsCount; ++i) {
				if (typeof this._matrix[descriptor.topIndex + i] === "undefined") {
					this._matrix[descriptor.topIndex + i] = [];
				}
				this._matrix[descriptor.topIndex + i][descriptor.leftIndex] = descriptor;
			}
		}, this);
		++gridColumnsCount;

		// create empty cells content and initialize grid top and left indices with first not empty cell coordinates
		var firstFound = false;
		for (var topIndex = 0, leftIndex; topIndex < this._matrix.length; ++topIndex) {
			for (leftIndex = 0; leftIndex < gridColumnsCount; ++leftIndex) {

				if (typeof this._matrix[topIndex][leftIndex] !== "undefined") {
					if (!firstFound) {
						// initialize current left and top indices with first fable coordinates
						firstFound = true;
						this._leftIndex = leftIndex;
						this._topIndex = topIndex;
					}
					continue;
				}

				var icon = this._ownerDoc.createElement("span");
				this.addChild(icon);
				icon.addCssClass("empty");
				icon.addCssClass("fable");
				icon.style.setLeft(leftIndex * (this._TILE_UNIT + this._CELL_MARGIN));
				icon.style.setTop(topIndex * (this._TILE_UNIT + this._CELL_MARGIN));

				this._matrix[topIndex][leftIndex] = {
					element : icon,
					empty : true
				}
			}
		}

		// set grid width and height considering both cell size and margin
		function size(count, size, margin) {
			return count * size + (count - 1) * margin;
		}
		this.style.setWidth(size(gridColumnsCount, this._TILE_UNIT, this._CELL_MARGIN));
		this.style.setHeight(size(this._matrix.length, this._TILE_UNIT, this._CELL_MARGIN));

		this.addCssClass("opened");
		this.getCustomEvents().fire("load");
	},

	/**
	 * Set focus on current cell and if cell is not empty fires <code>fable-select</code> event. Grid current cell is
	 * that pointed by grid top and left indices that should be properly initialized before invoking this method.
	 * 
	 * @return Boolean always returns true.
	 */
	setFocus : function() {
		var descriptor = this._matrix[this._topIndex][this._leftIndex];
		descriptor.element.setFocus();
		if (!descriptor.empty) {
			this.getCustomEvents().fire("select", descriptor);
		}
		return true;
	},

	_onClick : function(ev) {
		if (ev.target.hasCssClass("fable")) {
			var fableName = ev.target.getAttr(this._FABLE_ATTR);
			if (fableName != null) {
				this.getCustomEvents().fire("click", fableName);
			}
		}
	},

	_onKeyEnter : function(ev) {
		var descriptor = this._matrix[this._topIndex][this._leftIndex];
		this.getCustomEvents().fire("click", descriptor.name, true);
		return true;
	},

	_onKeyEscape : function(ev) {
		var descriptor = this._matrix[this._topIndex][this._leftIndex];
		this.getCustomEvents().fire("unselect", descriptor);
		return true;
	},

	_onKeyUp : function(ev) {
		for (var topIndex = this._topIndex - 1; topIndex >= 0; --topIndex) {
			if (this._accept(topIndex, this._leftIndex)) {
				return this._move(topIndex, this._leftIndex);
			}
		}
		return false;
	},

	_onKeyDown : function(ev) {
		for (var topIndex = this._topIndex + 1; topIndex < this._matrix.length; ++topIndex) {
			if (this._accept(topIndex, this._leftIndex)) {
				return this._move(topIndex, this._leftIndex);
			}
		}
		return false;
	},

	_onKeyLeft : function(ev) {
		for (var leftIndex = this._leftIndex - 1; leftIndex >= 0; --leftIndex) {
			if (this._accept(this._topIndex, leftIndex)) {
				return this._move(this._topIndex, leftIndex);
			}
		}
		return true;
	},

	_onKeyRight : function(ev) {
		for (var leftIndex = this._leftIndex + 1; leftIndex < this._matrix[this._topIndex].length; ++leftIndex) {
			if (this._accept(this._topIndex, leftIndex)) {
				return this._move(this._topIndex, leftIndex);
			}
		}
		return true;
	},

	// ----------------------------------------------------
	// Helper methods for arrow keys event handlers

	/**
	 * Predicate to detect if cell from given indices is acceptable for move to. A cell is acceptable for move if its
	 * content is not the same object as current one; this may be the case for objects spanning multiple cells. Also
	 * empty cells are rejected, if grid navigation is configured to skip empty cells.
	 * 
	 * @param Number topIndex cell vertical index,
	 * @param Number leftIndex cell horizontal index.
	 * @return Boolean true if accept move to requested cell.
	 */
	_accept : function(topIndex, leftIndex) {
		if (this._matrix[topIndex][leftIndex].empty) {
			// return false if empty cells should be skipped and true to accept empty cells
			return false;
		}
		return this._matrix[topIndex][leftIndex] !== this._matrix[this._topIndex][this._leftIndex];
	},

	/**
	 * Move current selected cell to newly indices. This method updates grid current top and left indices and focus to
	 * object on newly selected cell. Delegates {@link #_focus()}.
	 * 
	 * @param Number topIndex cell vertical index,
	 * @param Number leftIndex cell horizontal index.
	 * @return Boolean always returns true.
	 */
	_move : function(topIndex, leftIndex) {
		this._topIndex = topIndex;
		this._leftIndex = leftIndex;
		return this.setFocus();
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.SectionGrid";
	}
};
$extends(com.kidscademy.fables.SectionGrid, js.dom.Element);
