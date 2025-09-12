$package("com.kidscademy.fables");

/**
 * Generic Kids Fables page.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of page class.
 */
com.kidscademy.fables.Page = function () {
	this.$super();

	this._installMenu = this.getByCss("nav a.install");
	this._userDismiss = false;
	this._deferredPrompt = null;

	window.addEventListener('beforeinstallprompt', this._onBeforeInstallPrompt.bind(this));

	/**
	 * Global event manager instance.
	 * @type js.event.Manager
	 */
	this._eventManager = new js.event.Manager();
};

com.kidscademy.fables.Page.prototype = {
	getEventManager: function () {
		return this._eventManager;
	},

	_onBeforeInstallPrompt: function (event) {
		// Prevent Chrome 67 and earlier from automatically showing the prompt
		event.preventDefault();
		if (this._userDismiss) {
			return;
		}
		// Stash the event so it can be triggered later.
		this._deferredPrompt = event;
		this._installMenu.show();

		this._installMenu.on('click', () => {
			this._installMenu.hide();
			this._deferredPrompt.prompt();
			this._deferredPrompt.userChoice.then((choiceResult) => {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the A2HS prompt');
				} else {
					console.log('User dismissed the A2HS prompt');
					this._userDismiss = true;
				}
				this._deferredPrompt = null;
			});
		});
	},

	toString: function () {
		return "com.kidscademy.fables.Page";
	}
};
$extends(com.kidscademy.fables.Page, js.ua.Page);
