// $Id: XY/etc/FullSupport/etc/scripts/cvHelpFactory.js 2.0 2019/05/23 18:40:07GMT milind Exp  $ 
function CV_helpFactory() {
	// The single window that we want to keep open for help:
	this.helpWindow = null;
	this.componentName = "HelpFactory";
}

CV_helpFactory.prototype = {
	showHelp: function(helpId) {
		CVPortal.debug("Loading help page " + helpId);
		//form our request URL:
		var helpUrl = CVPortal.getURLwithBaseParams() + "&target=tools&action=show_help&location=" + helpId;

		//load the help URL from the configuration through AJAX
		$.ajax({
			type: "GET",
			url: helpUrl,
			dataType: "xml",
			success: function (xml) {
				//var string = (new XMLSerializer()).serializeToString(xml);
				//alert(string);
				$("URL", xml).each(function() {
					if(this.text != "FAIL") {
						CVPortal.helpFactory().openHelpWindow(CVPortal.getNodeText(this));
					} else {
						alert(CVPortal.getResource("error.unable.locate.requested.help.resource"));
						CVPortal.error("Help Factory failed to located requested help resource, ID " + helpId);
					}
				});
			}
		});
	},

	openHelpWindow: function(url) {
		if(this.helpWindow == null || this.helpWindow.closed == true) {
			this.helpWindow = window.open(url, 'helpWindow', 'toolbar=0,location=0,directories=0,scrollbars=1,status=0,menubar=0,resizable=1,top=10,left=10,width=700,height=' + (screen.availHeight - 100));
			this.helpWindow.focus();
		} else {
			this.helpWindow.location = url;
			this.helpWindow.focus();
		}
	},

	showNamedHelp: function(name) {
		// valid names:
		//   -about
		//   -contents
		//   -company
		//   -admininfo
		//   -releasenotes

		var helpUrl = CVPortal.getURLwithBookParams() + "&target=btnbar&action=get_" + name;
		CVPortal.helpFactory().openHelpWindow(helpUrl);
	},

	showUserGuide: function() {
		var helpUrl = CVPortal.getUrlforHttpDocs() + "help/SDL_LiveContent_S1000D_User_Guide.pdf?#navpanes=0";
		CVPortal.helpFactory().openHelpWindow(helpUrl);
	},

	processHelpButtons: function(context) {
		// checks the meta factory
		// calls hide or show on the provided context:
		if( CVPortal.metaFactory().get("META_USER_HIDE_HELP_BTN") == null){
			if(CVPortal.metaFactory().get("META_CONFIG_HELP_BTN") == 0) {
				this.hideHelpBtn(context);
			} else {
				this.showHelpBtn(context);
			}
		} else {
			if( CVPortal.metaFactory().get("META_CONFIG_HELP_BTN") == "1"){
				this.showHelpBtn(context);
			} else {
				this.hideHelpBtn(context);
			}
		}
	},

	showHelpBtn: function(context) {
		//alert("inside showHelpBtn function..");

		if(context != null ){
			$("[cvHelpButton=1]",context).each(function() {
				this.style.display = "";
			});

		} else {
			$("[cvHelpButton=1]").each(function() {
				this.style.display = "";
			});
		}
	},

	hideHelpBtn: function(context) {
		//alert("inside hideHelpBtn function..");

		if(context != null ) {
			$("[cvHelpButton=1]",context ).each(function() {
				this.style.display = "none";
			});

		} else {
			$("[cvHelpButton=1]").each(function() {
				this.style.display = "none";
			});
		}
	}
};
