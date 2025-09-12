$package("com.kidscademy.fables");

/**
 * Index page.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of IndexPage class.
 */
com.kidscademy.fables.IndexPage = function() {
	this.$super();
};

com.kidscademy.fables.IndexPage.prototype = {
	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString: function() {
		return "com.kidscademy.fables.IndexPage";
	}
};
$extends(com.kidscademy.fables.IndexPage, com.kidscademy.fables.Page);
