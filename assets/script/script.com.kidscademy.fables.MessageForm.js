$package("com.kidscademy.fables");

/**
 * Suggestion form takes care to save on server normalized suggestion message.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of MessageForm class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.MessageForm = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Underlying form.
	 * 
	 * @type js.dom.Form
	 */
	this._form = this.getByTag("form");

	this._events = this.getCustomEvents();
	this._events.register("submitted");
	this._events.register("canceled");

	this.getByCss(".submit").on("click", this._onSubmit, this);
	this.getByCss(".cancel").on("click", this._onCancel, this);
};

com.kidscademy.fables.MessageForm.prototype = {
	reset : function() {
		this._form.reset();
	},

	/**
	 * Get form data and if message present save suggestion to server. Takes care to normalize suggestion message, see
	 * {@link #_normalize(String)}.
	 * 
	 * @param js.event.Event ev mouse click event.
	 */
	_onSubmit : function(ev) {
		var message = this._form.getObject();
		var text = this._normalize(message.text);
		if (text) {
			message.text = text;
			com.kidscademy.fables.Controller.sendDeveloperMessage(null, message, function() {
				this._form.reset();
				this._events.fire("submitted");
			}, this);
		}
	},

	/**
	 * Cancel form reset both message and email address, if any.
	 * 
	 * @param js.event.Event ev mouse click event.
	 */
	_onCancel : function(ev) {
		this._form.reset();
		this._events.fire("canceled");
	},

	/**
	 * Convert plain text into HTML formatted text. Current implementation just uses line break as separator for
	 * paragraphs. Also paragraphs are trimmed both sides.
	 * 
	 * @param String plain text.
	 * @return String HTML formatted text.
	 */
	_normalize : function(text) {
		var html = "";
		text.split(/\n/g).forEach(function(paragraph) {
			paragraph = paragraph.trim();
			if (paragraph) {
				html += ("<p>" + paragraph + "</p>");
			}
		});
		return html;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.MessageForm";
	}
};
$extends(com.kidscademy.fables.MessageForm, com.kidscademy.fables.Form);
$preload(com.kidscademy.fables.MessageForm);
