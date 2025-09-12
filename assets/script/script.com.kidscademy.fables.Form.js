$package("com.kidscademy.fables");

/**
 * Form class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of Form class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.Form = function(ownerDoc, node) {
	this.$super(ownerDoc, node);
	this._textAreaControls = this.findByTag("textarea");
};

com.kidscademy.fables.Form.prototype = {
	show : function() {
		this.$super("show");
		this._textAreaControls.forEach(function(control) {
			control.show();
		}, this);
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.Form";
	}
};
$extends(com.kidscademy.fables.Form, js.dom.Form);
