$package("com.kidscademy.fables");

/**
 * Data source utility class for content loaders.
 * 
 * @author Iulian Rotaru
 * @since 1.0
 */
com.kidscademy.fables.DataSource = {
	/**
	 * Fables data repository URL.
	 * 
	 * @type String
	 */
	//DATA_URL : "https://js-lib.com/apps/fables/data/",
	DATA_URL : "data/",

	//SITE_URL : "https://js-lib.com/apps/fables/",
	SITE_URL : "",

	loadDescriptors : function(callback, scope) {
		var url = this.DATA_URL + "panorama.json";
		js.lang.JSON.load(url, callback, scope);
	},

	loadTags : function(callback, scope) {
		var url = this.DATA_URL + "tags.json";
		js.lang.JSON.load(url, callback, scope);
	},

	loadFable : function(fableName, callback, scope) {
		var url = this.DATA_URL + "fables/" + fableName + "/fable_en.json";
		js.lang.JSON.load(url, function(fable) {
			fable.picture = this.DATA_URL + fable.picturePath;
			callback.call(scope, fable);
		}, this);
	},

	loadDevelopers : function(callback, scope) {
		var url = this.DATA_URL + "/developers.json";
		js.lang.JSON.load(url, function(developers) {
			developers.forEach(function(developer) {
				developer.picture = this.DATA_URL + developer.picturePath;
			}, this);
			callback.call(scope, developers);
		}, this);
	},

	getSiteURL : function() {
		return this.SITE_URL;
	},

	getFileURL : function(file) {
		return this.SITE_URL + file;
	},

	getFablePageURL : function(fableName) {
		return js.net.URL(this.SITE_URL + "fable.htm", {
			name : fableName
		})
	},

	getFablePictureURL : function(fableName) {
		return this.DATA_URL + "fables/" + fableName + "/picture.jpg";
	},

	/**
	 * Return the image URL for fable tile. Tile picture represent the fable on the grid from fables section.
	 * 
	 * @param String fableName fable name.
	 * @return String fable tile URL.
	 */
	getFableTileURL : function(fableName) {
		return this.DATA_URL + "fables/" + fableName + "/tile.jpg";
	},

	getFableIconURL : function(fableName) {
		return this.DATA_URL + "fables/" + fableName + "/icon.jpg";
	},

	getVoiceURL : function(voicePath) {
		return voicePath === null ? null : this.DATA_URL + voicePath;
	},

	getTagIconURL : function(tagIconPath) {
		return this.DATA_URL + tagIconPath;
	},

	/**
	 * Class string representation.
	 * 
	 * @return this class string representation.
	 */
	toString : function() {
		return "com.kidscademy.fables.DataSource";
	}
};
