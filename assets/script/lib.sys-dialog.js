$package("js.widget");

/**
 * System dialogs base class. This abstract class is the base for all system dialogs; subclasses should implement
 * {@link #open} method and may use methods supplied by this class.
 * 
 * @constructor Construct system dialog instance. Initialize common internal state like message element and dialog
 *              title.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 */
js.widget.SysDialog = function (ownerDoc, node) {
    this.$super(ownerDoc, node);

    /**
     * System dialog message.
     * 
     * @type String
     */
    this._message = this.getByTag("p");

    /**
     * On close callback. Function invoked after this dialog closes.
     * 
     * @type Function
     */
    this._onCloseCallback = null;

    /**
     * On close scope. This is the {@link #_onCloseCallback} run-time scope.
     * 
     * @type Object
     */
    this._onCloseScope = null;

    /**
     * Prevent system dialogs display checkbox.
     * 
     * @type js.dom.Checkbox
     */
    this._preventCheckbox = this.getByCss(".prevent input");

    this.getByTag("h1").setText(WinMain.getTitle());
};

js.widget.SysDialog.prototype = {
    /**
     * Abstract open method.
     */
    open : function () {
    },

    /**
     * Message setter. Given message may contain common HTML format tags like <b>em</b> or <b>strong</b>.
     * 
     * @param String message message text.
     */
    setMessage : function (message) {
        this._message.setHTML(message);
    },

    /**
     * Show this system dialog. Remove <em>hidden</em> CSS class and register document key press event listener.
     */
    show : function () {
        WinMain.doc.on("keypress", this._onKeyPress, this);
        this.removeCssClass("hidden");
    },

    /**
     * Hide this system dialog. Add <em>hidden</em> CSS class and dismiss document key press event listener.
     */
    hide : function () {
        this.addCssClass("hidden");
        WinMain.doc.un("keypress", this._onKeyPress);
        if (this._onCloseCallback !== null) {
            this._onCloseCallback.call(this._onCloseScope, this._preventCheckbox.checked());
            this._onCloseCallback = null;
            this._onCloseScope = null;
        }
    },

    /**
     * Set on close listener. Register a function to be invoked at this dialog close. Uses by system dialogs queue to
     * open new dialog when current closes.
     * 
     * @param Function callback function to be invoked on dialog close,
     * @param Object scope optional callback run-time scope, default to global scope.
     */
    setOnCloseListener : function (callback, scope) {
        this._onCloseCallback = callback;
        this._onCloseScope = scope || window;
    },

    enablePreventCheckbox : function () {
        this.getByCssClass("prevent").removeCssClass("hidden");
    },

    /**
     * Key press event listener. Invoke enter or escape key handler if user pressed enter, respective escape.
     * 
     * @param js.event.Event ev key press event.
     */
    _onKeyPress : function (ev) {
        switch (ev.key) {
        case js.event.Key.ENTER:
            this._onEnter();
            ev.halt();
            break;
        case js.event.Key.ESCAPE:
            this._onEscape();
            ev.halt();
            break;
        }
    },

    /**
     * Default handler for enter key.
     */
    _onEnter : function () {
    },

    /**
     * Default handler for escape key.
     */
    _onEscape : function () {
    },

    /**
     * System dialog string representation.
     * 
     * @return String this dialog string representation.
     */
    toString : function () {
        return "js.widget.SysDialog";
    }
};
$extends(js.widget.SysDialog, js.widget.Box);

/**
 * Persistent message dialog. Show message dialog and wait for user to close it. It is invoked via
 * {@link js.ua.System#alert}, like below:
 * 
 * <pre>
 *  js.ua.System.alert("Formatted %s.", "message");
 *  // above code display alert dialog and return immediately
 * </pre>
 * 
 * Please note system alert is asynchronous, it returns immediately after alert dialog display.
 * 
 * @constructor Construct system alert instance. Pretty simple, just register inherited {@link js.widget.SysDialog#hide}
 *              as listener for OK button click event.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 */
js.widget.AlertDialog = function (ownerDoc, node) {
    this.$super(ownerDoc, node);

    /**
     * This alert dialog OK button.
     * 
     * @type js.dom.Element
     */
    this._button = this.getByTag("button");
    this._button.on("click", this.hide, this);
};

js.widget.AlertDialog.prototype = {
    /**
     * Open system alert. Set message, after formatting if necessary then show the dialog.
     * 
     * @param String message alert message,
     * @param Object... args optional arguments, if message is formatted.
     */
    open : function (message) {
        this.setMessage(arguments.length === 1 ? message : $format(arguments));
        this.show();
    },

    /**
     * Enter key handler. Just hide system alert dialog.
     */
    _onEnter : function () {
        this.hide();
    },

    /**
     * Escape key handler. Just hide system alert dialog.
     */
    _onEscape : function () {
        this.hide();
    },

    /**
     * Class string representation.
     * 
     * @return String class string representation.
     */
    toString : function () {
        return "js.widget.AlertDialog";
    }
};
$extends(js.widget.AlertDialog, js.widget.SysDialog);

/**
 * Event notification dialog. Display a volatile message dialog for a brief {@link #_DEF_TIMEOUT period } of time. This
 * dialog hides itself, contrasting {@link js.widget.AlertDialog} which need to be closed by button click. Default
 * displaying period can be changed via {@link #setDelay}. It is invoked via {@link js.ua.System#toast}, like below:
 * 
 * <pre>
 *  js.ua.System.toast("Formatted %s.", "message");
 *  // above code display toast dialog and return immediately
 * </pre>
 * 
 * Please note system toast is asynchronous, it returns immediately after dialog display.
 * 
 * @constructor Construct system toast instance. This constructor just creates internal timeout instance and register
 *              inherited {@link js.widget.SysDialog#hide} method as callback.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 */
js.widget.ToastDialog = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
    /**
     * Toast displaying timer.
     * 
     * @type js.util.Timeout
     */
    this._timeout = new js.util.Timeout(this._DEF_TIMEOUT);
    this._timeout.setCallback(this._onTimeout, this);
};

js.widget.ToastDialog.prototype = {
    /**
     * Default message visibility period is 2 seconds.
     * 
     * @type Number
     */
    _DEF_TIMEOUT : 2000,

    /**
     * Open toast dialog. Set message, after formatting if necessary, show dialog and start toast timeout.
     * 
     * @param String message volatile user notification,
     * @param Object... args optional arguments, if message is formatted.
     */
    open : function (message) {
        this.setMessage(arguments.length === 1 ? message : $format(arguments));
        this.show();
        this._timeout.start();
    },

    /**
     * Set toast timeout. Set toast visibility period.
     * 
     * @param Number timeout new value for toast timeout.
     */
    setTimeout : function (timeout) {
        this._timeout.set(timeout);
    },

    /**
     * Toast timeout handler. Just hide this toast; if toast is moving keep it visible for a new period.
     */
    _onTimeout : function () {
        if (this.hasCssClass("moving")) {
            this._timeout.start();
        }
        else {
            this.hide();
        }
    },

    /**
     * Enter key handler. Just hide system alert dialog.
     */
    _onEnter : function () {
        this.hide();
    },

    /**
     * Escape key handler. Just hide system alert dialog.
     */
    _onEscape : function () {
        this.hide();
    },

    /**
     * Class string representation.
     * 
     * @return String class string representation.
     */
    toString : function () {
        return "js.widget.ToastDialog";
    }
};
$extends(js.widget.ToastDialog, js.widget.SysDialog);

/**
 * System confirm dialog. This dialog is used to get user confirmation before executing critical sections of code. It
 * has a message about action to be confirmed and two buttons: OK and cancel. It is invoked via
 * {@link js.ua.System#confirm} like in snippet below:
 * 
 * <pre>
 *  js.ua.System.confirm("Please confirm action...", function(ok) {
 *      if(ok) {
 *          // perform critical action
 *      }
 *  }); 
 * </pre>
 * 
 * Since confirm dialog is asynchronous it has a callback function invoked with boolean true if user press OK button or
 * false on cancel.
 * 
 * @constructor Construct system confirm instance.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 */
js.widget.ConfirmDialog = function (ownerDoc, node) {
    this.$super(ownerDoc, node);

    /**
     * This confirm dialog OK button.
     * 
     * @type js.dom.Element
     */
    this._okButton = this.getByCssClass("ok");
    this._okButton.on("click", this._onOK, this);

    /**
     * This confirm dialog cancel button.
     * 
     * @type js.dom.Element
     */
    this._cancelButton = this.getByCssClass("cancel");
    this._cancelButton.on("click", this._onCancel, this);
};

js.widget.ConfirmDialog.prototype = {
    /**
     * Open system confirm dialog. Save callback and scope then set message and show dialog.
     * 
     * @param String message user message asking for confirmation,
     * @param Function callback function to invoke with user selection,
     * @param Object scope optional callback scope, default to global.
     */
    open : function (message, callback, scope) {
        /**
         * Callback function.
         * 
         * @type Function
         */
        this._callback = callback;

        /**
         * Callback run-time scope.
         * 
         * @type Object
         */
        this._scope = scope || window;

        this.setMessage(message);
        this.show();
    },

    /**
     * OK button click listener. Close this dialog with true value signaling user agreement.
     * 
     * @param js.event.Event ev mouse click event.
     */
    _onOK : function (ev) {
        this._close(true);
    },

    /**
     * Cancel button click listener. Close this dialog with false value.
     * 
     * @param js.event.Event ev mouse click event.
     */
    _onCancel : function (ev) {
        this._close(false);
    },

    /**
     * Conclude system confirm dialog. Hide this dialog and invoke callback with given value.
     * 
     * @param Object value callback value.
     */
    _close : function (value) {
        this.hide();
        if (this._callback !== undefined) {
            this._callback.call(this._scope, value);
        }
    },

    /**
     * Handle enter key. Delegates OK button event listener.
     */
    _onEnter : function () {
        this._onOK();
    },

    /**
     * Handle escape key. Delegates cancel button event listener.
     */
    _onEscape : function () {
        this._onCancel();
    },

    /**
     * Confirm dialog string representation.
     * 
     * @return String object string representation.
     */
    toString : function () {
        return "js.widget.ConfirmDialog";
    }
};
$extends(js.widget.ConfirmDialog, js.widget.SysDialog);

/**
 * System prompt dialog. This system dialog has, beside the message, a text input used to collect data from user.
 * Message instructs the user to fill the text input and other specific info like input valid format, etc. It is invoked
 * via {@link js.ua.System#prompt}, like in below snippet:
 * 
 * <pre>
 *  js.ua.System.prompt("Please enter a value.", function(value) {
 *      if(value === undefined) {
 *          // some action on user cancel
 *      }
 *      if(value == null) {
 *          // some action on user ok but no text input
 *      }
 *      if(value) {
 *          // value is not null and OK button was pressed
 *      }
 *  });
 * </pre>
 * 
 * Prompt dialog has two buttons: OK and cancel. On OK callback is invoked with the text input value, or null if user
 * enter no text. On cancel callback is invoked with undefined value. This way, a true boolean test on value means user
 * enter some text and OK button was pressed.
 * 
 * @constructor Construct system prompt dialog instance.
 * @param js.dom.Document ownerDoc owner document,
 * @param Node node native node instance.
 */
js.widget.PromptDialog = function (ownerDoc, node) {
    this.$super(ownerDoc, node);
    /**
     * Text input used to collect user data.
     * 
     * @type js.dom.Control
     */
    this._input = this.getByTag("input");
};

js.widget.PromptDialog.prototype = {
    /**
     * Open system prompt dialog. Reset this prompt dialog text input and call
     * {@link js.widget.ConfirmDialog#open super}.
     * 
     * @param String message user message asking for confirmation,
     * @param Function callback function to invoke with user selection,
     * @param Object scope optional callback scope, default to global.
     */
    open : function (message, callback, scope) {
        this._input.reset();
        this.$super("open", arguments);
        this._input.focus();
    },

    /**
     * OK button click listener. Close system prompt dialog and invoke callback with input value or null if user did not
     * enter any text.
     * 
     * @param js.event.Event ev mouse click event
     */
    _onOK : function (ev) {
        this._close(this._input.getValue());
    },

    /**
     * Cancel button click listener. Close system prompt dialog and invoke callback with undefined value.
     * 
     * @param js.event.Event ev mouse click event
     */
    _onCancel : function (ev) {
        this._close();
    },

    /**
     * Class string representation.
     * 
     * @return String class string representation.
     */
    toString : function () {
        return "js.widget.PromptDialog";
    }
};
$extends(js.widget.PromptDialog, js.widget.ConfirmDialog);

/**
 * System dialogs factory. This utility class is a factory for system dialogs: it creates dialogs based on predefined
 * HTML layout and CSS styles, behavior being implemented by {@link js.widget.SysDialog} and subclasses. This factory
 * also supports user defined dialogs via {@link #setDialog}.
 */
js.widget.DialogsFactory = {
    /**
     * Predefined dialog names. Recognized system dialog names are:
     * <ul>
     * <li>alert - displays an alert box with a message and an OK button,
     * <li>toast - a box with a message without any button that is displayed for a limited amount of time,
     * <li>confirm - displays a dialog box with a message and an OK and a Cancel button,
     * <li>prompt - displays a dialog box that prompts the user for input.
     * </ul>
     * 
     * @type Array
     */
    DIALOG_NAMES : [ "alert", "toast", "confirm", "prompt" ],

    /**
     * Retrieve named system dialog. Returns system dialog identified by {@link #DIALOG_NAMES predefined name}.
     * Requested dialog name should be a predefined one otherwise assertion is thrown; if assertions are disabled and
     * dialog name is not valid returns null.
     * 
     * @param String dialogName predefined system dialog name.
     * @return js.dom.Element system dialog.
     * @see js.widget.DialogsFactory#DIALOG_NAMES
     */
    getDialog : function (dialogName) {
        var dialog = WinMain.doc.getById($format("js-sys-%s-id", dialogName));
        if (dialog === null) {
            js.ua.System.print("System dialog not found: " + dialogName);
        }
        return dialog;
    }
};

// ---------------------------------------------------------
// Override j(s)-lib script library System class in order to hook system dialog widgets.

/**
 * Override alert method j(s)-lib System class.
 */
js.ua.System.alert = function (message) {
    $assert(message, "js.ua.System#alert", "Message is undefined, null or empty.");
    this._enlistDialog("alert", arguments);
};

/**
 * Override toast method j(s)-lib System class.
 */
js.ua.System.toast = function (message) {
    $assert(message, "js.ua.System#toast", "Message is undefined, null or empty.");
    this._enlistDialog("toast", arguments);
};

/**
 * Override prompt method from j(s)-lib System class.
 */
js.ua.System.prompt = function (message, callback, scope) {
    $assert(message, "js.ua.System#prompt", "Message is undefined, null or empty.");
    $assert(js.lang.Types.isFunction(callback), "js.ua.System#prompt", "Callback argument is not a function.");
    $assert(scope === undefined || js.lang.Types.isObject(scope), "js.ua.System#prompt", "Scope argument is not an object.");
    this._enlistDialog("prompt", arguments);
};

/**
 * Override confirm method from j(s)-lib System class.
 */
js.ua.System.confirm = function (message, callback, scope) {
    $assert(message, "js.ua.System#confirm", "Message is undefined, null or empty.");
    $assert(js.lang.Types.isFunction(callback), "js.ua.System#confirm", "Callback argument is not a function.");
    $assert(scope === undefined || js.lang.Types.isObject(scope), "js.ua.System#confirm", "Scope argument is not an object.");
    this._enlistDialog("confirm", arguments);
};

/**
 * System dialogs queue.
 * 
 * @type Array
 */
js.ua.System._dialogsQueue = [];

/**
 * Dialog time stamp. This is time dialog was requested to be displayed.
 * 
 * @type Date
 */
js.ua.System._dialogTimestamp = new Date();

/**
 * Dialogs flush. If system dialogs are opened too often this flag becomes true.
 * 
 * @type Boolean
 */
js.ua.System._dialogsFlush = false;

/**
 * Enlist dialog. Add dialog to dialogs queue; if is the only one opens it immediately.
 * 
 * @param String dialogName dialog predefined name,
 * @param Array args dialog invocation arguments.
 */
js.ua.System._enlistDialog = function (dialogName, args) {
    if (this._dialogsQueue === null) {
        // dialogs queue is null only if user checked prevent system dialogs checkbox
        return;
    }

    var now = new Date();
    if (this._dialogsQueue.length > 1 && now.getTime() - this._dialogTimestamp.getTime() < 10000) {
        this._dialogsFlush = true;
    }
    this._dialogTimestamp = now;

    this._dialogsQueue.push(arguments);
    if (this._dialogsQueue.length === 1) {
        this._openDialog();
    }
};

/**
 * Open dialog from queue. This method is invoked from dialog close listener or enlister method if queue has only one
 * item. Get first dialog meta from queue and open that dialog.
 */
js.ua.System._openDialog = function () {
    // dialogs meta is a two items array: 0 - dialog name, 1 - dialog invocation arguments
    var dialogMeta = this._dialogsQueue[0];
    var dialog = js.widget.DialogsFactory.getDialog(dialogMeta[0]);
    dialog.setOnCloseListener(this._onDialogClose, this);
    if (this._dialogsFlush) {
        dialog.enablePreventCheckbox();
    }
    dialog.open.apply(dialog, dialogMeta[1]);
};

/**
 * On dialog close handler. Remove first dialog meta - related to dialog that is just closing from queue. If more items
 * chain the {@link js.ua.System#_openDialog}.
 */
js.ua.System._onDialogClose = function (prevent) {
    if (prevent) {
        this._dialogsQueue = null;
        return;
    }
    this._dialogsQueue.shift();
    if (this._dialogsQueue.length > 0) {
        // 1. some time gap between dialogs display
        // 2. breaks dialogs chain since this callback is executing in current (closing) dialog
        js.util.Timeout(100, this._openDialog, this);
    }
};

js.ua.System.__getErrorMessage__ = js.ua.System._getErrorMessage;
js.ua.System._getErrorMessage = function (args) {
    return js.ua.System.__getErrorMessage__(args).replace(/\r\n/g, "<br />");
};
