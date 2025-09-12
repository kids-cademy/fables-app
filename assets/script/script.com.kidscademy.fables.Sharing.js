$package("com.kidscademy.fables");

/**
 * Sharing class.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 * 
 * @constructor Construct an instance of Sharing class.
 * @param js.dom.Document ownerDoc element owner document,
 * @param Node node native {@link Node} instance.
 * @assert assertions imposed by {@link js.dom.Element#Element(js.dom.Document, Node)}.
 */
com.kidscademy.fables.Sharing = function(ownerDoc, node) {
	this.$super(ownerDoc, node);

	/**
	 * Immutable site sharing Open Graph object.
	 * 
	 * @type Object
	 */
	this._siteSharingObject = {
		url : com.kidscademy.fables.DataSource.getSiteURL(),
		image : com.kidscademy.fables.DataSource.getFileURL("../media/res-asset_sharing-logo.jpg"),
		title : "Kids Fables",
		description : "Fables for kids, small and big alike."
	};

	/**
	 * Optional Open Graph object used to share current fable, default to null. If not null used this object to share a
	 * certain fable instead of entire site.
	 * 
	 * @type Object
	 */
	this._fableSharingObject = null;

	this.getByCss(".facebook").on("click", this._onFacebook, this);
	this.getByCss(".twitter").on("click", this._onTwitter, this);
	this.getByCss(".email").on("click", this._onEmail, this);

	this._events = this.getCustomEvents();
	this._events.register("sent");
};

com.kidscademy.fables.Sharing.prototype = {
	setFable : function(fable) {
		this._fableSharingObject = {
			url : com.kidscademy.fables.DataSource.getFablePageURL(fable.name),
			image : com.kidscademy.fables.DataSource.getFablePictureURL(fable.name),
			title : fable.content[0].title,
			description : js.util.Strings.toPlainText(fable.content[0].text, 0, 120) + " ... \r\n\r\n" + fable.content[0].moral
		};
	},

	_onFacebook : function(ev) {
		this._events.fire("sent");

		var objectToLike = {
			object : this._getOpenGraphObject()
		};
		FB.ui({
			method : 'share_open_graph',
			action_type : 'og.shares',
			action_properties : JSON.stringify(objectToLike)
		});
	},

	_onTwitter : function(ev) {
		this._events.fire("sent");

		var isFable = this._fableSharingObject !== null;
		var openGraphObject = this._getOpenGraphObject();
		var text;
		if (isFable) {
			text = $format("Read \"%s\" on Kids Fables:", openGraphObject.title)
		}
		else {
			text = $format("%s. %s", openGraphObject.title, openGraphObject.description);
		}

		// https://dev.twitter.com/web/tweet-button/web-intent
		WinMain.open("https://twitter.com/intent/tweet", {
			text : text,
			url : openGraphObject.url
		}, {
			top : 200,
			left : 200,
			width : 600,
			height : 400,
			menubar : false,
			toolbar : false
		});
	},

	_onEmail : function(ev) {
		this._events.fire("sent");

		var openGraphObject = this._getOpenGraphObject();
		WinMain.assign("mailto:", {
			// uses the same subject for both site and fable sharing; site sharing title is site name
			subject : this._siteSharingObject.title,
			body : $format("%s\r\n\r\n%s", openGraphObject.description, openGraphObject.url)
		});
	},

	_getOpenGraphObject : function() {
		var openGraphObject = this._fableSharingObject !== null ? this._fableSharingObject : this._siteSharingObject;
		// ensure fable sharing object is used only once
		this._fableSharingObject = null;
		return openGraphObject;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.Sharing";
	}
};
$extends(com.kidscademy.fables.Sharing, js.dom.Element);
$preload(com.kidscademy.fables.Sharing);
