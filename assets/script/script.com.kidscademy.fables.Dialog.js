$package("com.kidscademy.fables");

/**
 * Dialog class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of Dialog class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.Dialog = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	this.getByCss(".close").on("click", this._onClose, this);
};

com.kidscademy.fables.Dialog.prototype = {
	_onClose : function(ev) {
		this.hide();
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.Dialog";
	}
};
$extends(com.kidscademy.fables.Dialog, js.widget.Box);
