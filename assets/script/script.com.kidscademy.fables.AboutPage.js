$package("com.kidscademy.fables");

/**
 * AboutPage class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of AboutPage class.
 */
com.kidscademy.fables.AboutPage = function() {
	this.$super();

	/**
	 * Developers list view.
	 * 
	 * @type js.dom.Element
	 */
	this._developerListView = this.getByCss(".about .developers");

	/**
	 * Developer message form.
	 * 
	 * @type com.kidscademy.fables.MessageForm
	 */
	this._messageForm = this.getByClass(com.kidscademy.fables.MessageForm);
	this._messageForm.on("submitted", this._onMessageFormDone, this);
	this._messageForm.on("canceled", this._onMessageFormDone, this);

	/**
	 * Immutable control from message form that stores developer name.
	 * 
	 * @type js.dom.Element
	 */
	this._developerNameControl = this._messageForm.getByCss("[name=developerName]");

	com.kidscademy.fables.DataSource.loadDevelopers(this._onDevelopersLoad, this);
};

com.kidscademy.fables.AboutPage.prototype = {
	_onDevelopersLoad: function(developers) {
		this._developerListView.setObject(developers);
		this.findByCss(".developer .email").on("click", this._onEmailClick, this);
	},
	
	_onEmailClick : function(ev) {
		this._messageForm.show();
		this._messageForm.reset();
		this._developerNameControl.setValue(ev.target.getParent("a").getAttr("data-to"));
		WinMain.scrollTo(this._messageForm);
	},

	_onMessageFormDone : function() {
		this._messageForm.hide();
		WinMain.scrollTo(this._developerListView, 140);
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.AboutPage";
	}
};
$extends(com.kidscademy.fables.AboutPage, com.kidscademy.fables.Page);
