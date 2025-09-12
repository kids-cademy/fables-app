$package("js.widget");

/**
 * Moveable box. A movable box has a descendant element with <em>caption</em> CSS class. User can press on it, hold
 * and move mouse to change box position within the page. While moving the box, a CSS class named <em>moving</em> is
 * active. It can be used to hide box content if the box is too heavy, considering user agent should redraw the box
 * following mouse movement; <em>moving</em> CSS class can be also used to mark somehow the box so that user to be
 * aware he can move it.
 * <p>
 * If box has a descendant element with <em>box-close</em> CSS class register {@link #_onBoxClose} which will add
 * <em>hidden</em> CSS class to entire box, of course on user click.
 * <p>
 * Also this class supplies getters for box width and height, values that include padding and borders but does not
 * include margin.
 * 
 * @constructor Construct a movable box.
 * @param js.widget.Document ownerDoc owner document,
 * @param Node node native node instance.
 * @assert box element is fixed positioned and has a child with class <em>caption</em>.
 */
js.widget.Box = function (ownerDoc, node) {
    this.$super(ownerDoc, node);

    /**
     * This box caption. Used by use to drag the box on page.
     * 
     * @type js.widget.Element
     */
    this._caption = this.getByCssClass(this._CAPTION);
    $assert(this._caption !== null, "js.widget.Box#Box", "Invalid Box. Caption element missing.");
    if (this._caption === null) {
        return;
    }
    this._caption.on("mousedown", this._onCaptionMouseDown, this);
    this._caption.on("mouseup", this._onCaptionMouseUp, this);

    $assert(this.style.getPosition() === "fixed", "js.widget.Box#Box", "Element is not fixed positioned.");
    if (this.style.getPosition() !== "fixed") {
        this.style.setPosition("fixed");
    }

    /**
     * Moving state delay. On mouse down box enter moving state but after a delay to avoid unwilling moves.
     * 
     * @type js.util.Timeout
     */
    this._movingStateDelay = new js.util.Timeout(this._MOVING_STATE_DELAY);
    this._movingStateDelay.setCallback(this._onStartMoving, this);

    this.style.setLeft((WinMain.getWidth() - this.getWidth()) / 2).setTop(WinMain.getHeight() / 4);

    var boxClose = this.getByCss(".box-close");
    if (boxClose !== null) {
        boxClose.on("click", this._onBoxClose, this);
    }

    this._x = 0;
    this._y = 0;
    this._FRAME_REQUEST_CALLBACK = this._moveBox.bind(this);
};

js.widget.Box.prototype = {
    /**
     * Caption CSS class.
     * 
     * @type String
     */
    _CAPTION : "caption",

    /**
     * Moving state delay.
     * 
     * @type Number
     */
    _MOVING_STATE_DELAY : 100,

    /**
     * Swap styles. Styles used temporarily by box width and height getters.
     * 
     * @type Object
     */
    _SWAP_STYLES : {
        position : "absolute",
        visibility : "hidden",
        display : "block"
    },

    /**
     * Get box width. Returned value include padding and borders but does not include margin.
     * 
     * @return Number this box width.
     */
    getWidth : function () {
        function width () {
            return this._node.offsetWidth;
        }
        var w = width.call(this);
        if (w === 0) {
            w = this.style.swap(this._SWAP_STYLES, width, this);
        }
        return w;
    },

    /**
     * Get box height. Returned value include padding and borders but does not include margin.
     * 
     * @return Number this box height.
     */
    getHeight : function () {
        function height () {
            return this._node.offsetHeight;
        }
        var h = height.call(this);
        if (h === 0) {
            h = this.style.swap(this._SWAP_STYLES, height, this);
        }
        return h;
    },

    /**
     * Caption mouse down event listener. Prepare internal state for moving and start moving state delay timer.
     * 
     * @param js.event.Event ev mouse down event.
     */
    _onCaptionMouseDown : function (ev) {
        ev.halt();

        /**
         * Box X coordinates at mouse down.
         * 
         * @type Number
         */
        this._boxStartX = parseInt(this.style.get("left"));

        /**
         * Box Y coordinates at mouse down.
         * 
         * @type Number
         */
        this._boxStartY = parseInt(this.style.get("top"));

        /**
         * Mouse X coordinates at mouse down.
         * 
         * @type Number
         */
        this._mouseStartX = ev.pageX;

        /**
         * Mouse Y coordinates at mouse down.
         * 
         * @type Number
         */
        this._mouseStartY = ev.pageY;

        this._ownerDoc.un("mousemove", this._onDocumentMouseMove);
        this._ownerDoc.un("mouseup", this._onDocumentMouseUp);
        this._movingStateDelay.start();
    },

    /**
     * Caption mouse up event listener. Reset moving state delay timer, if is ticking. This way the box does not enter
     * moving state if click was shorter than {@link #_MOVING_STATE_DELAY}.
     * 
     * @param js.event.Event ev mouse up event.
     */
    _onCaptionMouseUp : function (ev) {
        if (this._movingStateDelay.isTicking()) {
            this._movingStateDelay.stop();
        }
    },

    /**
     * Enter moving state. Compute maximum allowed values for X and Y coordinates, add <em>moving</em> CSS class and
     * attach mouse move and mouse up events to document.
     */
    _onStartMoving : function () {
        var boxWidth = this.getWidth();
        var boxHeight = this.getHeight();

        /**
         * Maximum value for X coordinates. When moving, box X coordinates can"t exceed this value. It is computed such
         * way that box margin can"t go out of page.
         * 
         * @type Number
         */
        this._maxX = WinMain.getWidth() - boxWidth;

        /**
         * Maximum value for Y coordinates. When moving, box Y coordinates can"t exceed this value. It is computed such
         * way that box margin can"t go out of page.
         * 
         * @type Number
         */
        this._maxY = WinMain.getHeight() - boxHeight;

        this.addCssClass("moving");
        this._ownerDoc.on("mousemove", this._onDocumentMouseMove, this);
        this._ownerDoc.on("mouseup", this._onDocumentMouseUp, this);
    },

    /**
     * Document mouse move event listener. Update box position following mouse movement.
     * 
     * @param js.event.Event ev mouse move event.
     */
    _onDocumentMouseMove : function (ev) {
        function confine (number, minim, maxim) {
            if (number < minim) {
                return minim;
            }
            if (number > maxim) {
                return maxim;
            }
            return number;
        }

        ev.halt();
        var dx = ev.pageX - this._mouseStartX;
        var dy = ev.pageY - this._mouseStartY;
        this._x = confine(this._boxStartX + dx, 0, this._maxX);
        this._y = confine(this._boxStartY + dy, 0, this._maxY);
        this._requestAnimationFrame();
    },

    /**
     * Document mouse up event listener. Exit moving state; document mouse move and mouse up events are detached and
     * <em>moving</em> CSS class is erased.
     * 
     * @param js.event.Event ev mouse up event.
     */
    _onDocumentMouseUp : function (ev) {
        ev.halt();
        this._ownerDoc.un("mousemove", this._onDocumentMouseMove);
        this._ownerDoc.un("mouseup", this._onDocumentMouseUp);
        this.removeCssClass("moving");
    },

    /**
     * On box close event listener. Triggered when user press on <em>box closing element</em>, that is, a box
     * descendant having <em>box-close</em> CSS class. This listener just add <em>hidden</em> CSS class to entire
     * box.
     * 
     * @param js.event.Event ev mouse up event.
     */
    _onBoxClose : function (ev) {
        this.addCssClass("hidden");
    },

    _requestAnimationFrame : function () {
        return window.requestAnimationFrame(this._FRAME_REQUEST_CALLBACK);
    },

    _moveBox : function () {
        this.style.setLeft(this._x).setTop(this._y);
    },

    /**
     * Instance string representation.
     * 
     * @return String string representation.
     */
    toString : function () {
        return "js.widget.Box";
    }
};
$extends(js.widget.Box, js.dom.Element);

$legacy(typeof window.requestAnimationFrame !== "function", function () {
    js.widget.Box._requestAnimationFrame = function () {
        this._moveBox();
    };
});
