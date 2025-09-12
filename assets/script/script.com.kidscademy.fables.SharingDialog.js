$package("com.kidscademy.fables");

/**
 * SharingDialog class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of SharingDialog class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.SharingDialog = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	this._sharing = this.getByCss(".sharing");
	this._sharing.on("sent", this._onSharingSent, this);
};

com.kidscademy.fables.SharingDialog.prototype = {
	open : function(fable) {
		this._sharing.setFable(fable);
		this.show();
	},

	_onSharingSent : function() {
		this.hide();
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.SharingDialog";
	}
};
$extends(com.kidscademy.fables.SharingDialog, com.kidscademy.fables.Dialog);
