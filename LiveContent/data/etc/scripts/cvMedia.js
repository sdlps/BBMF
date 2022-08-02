// $Id: XY/etc/FullSupport/etc/scripts/cvMedia.js 2.0 2019/05/23 18:43:28GMT milind Exp  $ 
/****************************
*
*  Media Handler
*
*
*
*
*****************************/
function cvMedia() {
	//set name
	this.componentName = "CV Multimedia Handler Component";
	this.current = null;
	this.tearOffCount = 0;
}
cvMedia.prototype = {
	init: function() {
		this.isParent=true;
		var media = this; // store!
		
		// load our props:
		this.resize_simple_images = this.getProp("resize_simple_images");
		
		// The images panel and the data panel
		// the cvMedia component needs BOTH data and images so that it can control the splitting and resizing:
		this.mediaPanel = this.getVirtualPanel("media");
		this.dataPanel = this.getVirtualPanel("data"); // this is NOT actually a shared panel, because the Media panel will NOT write to the data panel
		this.containerPanel = this.getVirtualPanel("container");

		this.docVisible = true;
		
		//place some divs within the mediaPanel:
		// EVIL LINE OF CODE BELOW:
		$(this.mediaPanel.getElement(this.id)).append("<div id='graphic_main'><div id='graphic_title' class='imageTitle'>Title</div><div id='graphic_legend' class='imageLegend'>Legend</div><div id='graphic_content'>Content</div></div><div id='graphic_control'>Control</div>");
		
		var em = this.mediaPanel.getElement(this.id);
		//alert("ELEM: " + em.id + em + typeof(em) + typeof(em.getElementsByTagName()));
		// get the four panels that will be used--these are stored all of the time and never "unloaded"
		var list = this.mediaPanel.getElement(this.id).getElementsByTagName("DIV");
		for(var i = 0; i < list.length; i++) {
			var elemId = list[i].id;
			this[elemId] = list[i];
		}

		// Insure the correct H / W for the DIVs inside the mediaPanel:
		$(this.mediaPanel.getElement()).on("resize", function () {
			if (CVPortal.metaFactory().get("META_WCN_POPUP") == 0) {
				// reset WCN msg positions
				$(CVPortal.components.cvDocHandler.docPanel.getElement(CVPortal.components.cvDocHandler.id)).trigger("resize-panel");
			}
			CVPortal.components.cvMedia.resizeControlBar();
		}); 
		if(this.getProp("tearOff") == 1) { 
			this.resizeControlBar(); 
			// this.mediaPanel.manual_ff_resize = true;
		}
		// load the graphic control template into the graphic_control element:
		$.ajax( { method: "GET",
			async: false,
			dataType: "html",
			url: CVPortal.fetchSkinFile("cvGraphicControl.html"),
			success: function(html) {
				$(media.graphic_control).html(html);
				CVPortal.controlFactory().seekControls(media.graphic_control);

				// get our virtual controls for all graphic controls:
				media.tearOff = media.getVirtualControl("tearOff");
				if (media.typeSelect) $(media.typeSelect.element).hide();
			}
		});

		// virtual controls:
		this.hideMedia = this.getVirtualControl("hide");

		// forward and back controls
		this.currentFig = null;
		this.currentGraphic = null;
		// is the graphic panel showing?
		this.mediaVisible = false;

		//load our LEGEND XSL
		this.cvLoadXSLT("legend", "legendXSL", false);
	},

	destroy: function(xml) {
		delete this.legendXSL;
		delete this.figLegend;
		delete this.current;
	},

	resizeControlBar: function() {  // Resizes the Graphic Pane to include a static Height Control bar!
		var h = parseInt($(this.mediaPanel.getElement()).css("height"), 10);
		var h_cbar = parseInt($(this.graphic_control).css("height"), 10);
		var h_left = h - h_cbar;
		if(h_left > 0) {
			if (((CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT") && this.mediaPanel.collapsed == 1 && this.getProp("tearOff") != 1)) {
				CVPortal.controlFactory().updateCondition("hideTearOff","true");
			} else {
				if(this.getProp("tearOff") != 1) { CVPortal.controlFactory().updateCondition("hideTearOff","false"); }
			}
			$(this.graphic_main).css("height", h_left);
			$(this.graphic_content).css("height", h_left - 21);

			if (document.getElementById("graphic_content").getElementsByTagName("svg")[0]) {
					//svg.js creates additional svg elem, so we need to specify with svg to resize
					document.getElementById("graphic_content").getElementsByTagName("svg")[0].setAttribute("height",$("#graphic_content").innerHeight());		
			}


		}
		// also ensure (for IE's benefit) that the WIDTH is also correct:
		var w = parseInt($(this.mediaPanel.getElement()).css("width"), 10);
		if ($("#graphicsPanel").hasClass("resizable-v")) w = w - $("#graphicsPanel .ui-resizable-e").width();
		$(this.graphic_main).css("width", w);
		if (this.svgLibrary && $("#graphic_content").is(":visible")) {
			this.svgLibrary.resize();
			this.svgLibrary.fit();
			this.svgLibrary.center();
		}
		if (h_left > 0) {
			var legendContentHeight = $("#legendContent").height();
			if (this.legendFound && this.legendFound == true) {
				if (legendContentHeight == null || legendContentHeight == 0){
					timerId = window.setTimeout("CVPortal.components.cvMedia.resizeControlBar()", 50);
				}

				if (legendContentHeight > h_left - 8) {
					$("#graphic_legend").css("height", h_left - 8);
				} else {
					$("#graphic_legend").css("height", "auto");
				}
			}
		}
		this.setCanvasSize();
		if (CVPortal.components.cvDocHandler) CVPortal.components.cvDocHandler.largeTableDialogAdjust();
	},
	
	loadMedia: function(xml, noFilter) {
		// store the XML for the new media document:
		this.mediaxml = xml;
		var boardNo; // the filename for our first figure, first graphic to load.
		var media = this; // store this:

		//Determine if the IETM is classified or not
		this.pubXML = CVPortal.metaFactory().getPublicationsConfiguration(CVPortal.metaFactory().get("META_COLLECTION"), CVPortal.metaFactory().get("META_BOOK"));
		this.ietm_class = $("configitem[name='classification']>value", this.pubXML).text();
		var ietmIsClassified = 0;
		if (CVPortal.metaFactory().get("META_BOOKTYPE") == "S1000D") {
			if (this.ietm_class  && (this.ietm_class !== "01" || this.ietm_class !== "u" )) {
				ietmIsClassified = 1;
			}
		} 


		//get the image title prefix from the server which gets the value from resource-xx.prop
		var tempTitlePref;
		$("img_Title_prefix", xml).each(function() { tempTitlePref = CVPortal.getNodeText(this, 1); });
		if (!tempTitlePref || tempTitlePref=="") {
			tempTitlePref = "Fig ";
		}else{
			tempTitlePref +=" ";
		}
		var figCount = 1;
		var totalGraphicCount = 0;
		$("FIGURE", xml).each(function() {
			var tempTitle;
			// get our graphic count and total for calculating sheets:
			var graphicCount = 1;
			var totalCount = $("GRAPHIC", this).length;

			// get the DM classification for this figure 
			var figDmClass = this.getAttribute("DMCLASS");

			// If this is a classified IETM, display the portion marking in the portion_mark attribute
			var portionMark = "";
			var confPortionMark;

			if(CVPortal.components.cvMedia.getProp("tearOff") === "1") {
				confPortionMark = CVPortal.components.cvMedia.showPortionMark === "1" ;
			} else {
				confPortionMark = CVPortal.metaFactory().get("META_SHOW_PORTION_MARKING") === "1";
			}
			
			if (confPortionMark && ietmIsClassified == 1 && (figDmClass !== "01" || figDmClass !== "" || figDmClass !== "u")) {
				portionMark = this.getAttribute("portion_mark") || CVPortal.getResource("style.security.portionMarking.unclassified");
			}

			// get our title:
			// 11/28/12 - passing 1 as a parameter will preserve the use of < and > in figure titles
			$("TITLE", this).each(function() { tempTitle = CVPortal.getNodeText(this, 1); });

			// set each graphic's individual title:
			var acceptedGraphics = 0;
			var figNode = this;
			$("GRAPHIC", this).each(function() {
				var graphNode = this;
				if($("#" + this.getAttribute("BOARDNO")).length > 0 || noFilter === true) {

					if(media.isParent!=undefined && media.isParent==true){
						var graphEid = graphNode.getAttribute("EID");
						$("legend", figNode).parent().each(function() {
							$("#legendContent").remove();
							if (!media.figLegend)	media.figLegend = new Object();
							media.figLegend[graphEid] = (new window.XMLSerializer()).serializeToString(this);	
						});
					}					
					var internalFigCount = figCount;
					if($("#" + this.getAttribute("SHEETNO")).attr("data-count")) {
						internalFigCount = $("#" + this.getAttribute("SHEETNO")).attr("data-count");
					}

					// alert("Filter in graphic");
					//this is to seperate the title send back to server and the one for current display
					this.setAttribute("TITLE", tempTitle);
					this.setAttribute("DISPLAY-TITLE", tempTitlePref + internalFigCount + ". " + portionMark + tempTitle);
					this.setAttribute("graphicIndex", totalGraphicCount);
					totalGraphicCount++;  	// tracking the total length of the graphic array
					graphicCount++; 		// properly track our sheets--for naming purposes only
					acceptedGraphics++;
				} else {
					this.parentNode.removeChild(this);
				}
			});
			if(acceptedGraphics > 0) {
				figCount++;
				if(acceptedGraphics > 1) {
					var gCount = 1;
					$("GRAPHIC", this).each(function() {
						var tempTitle = this.getAttribute("TITLE");
						var sheet = " (Sheet " + gCount + " of " + acceptedGraphics + ")";
						gCount++;
						this.setAttribute("TITLE", tempTitle + sheet);
					});
				}
			} else {
				this.parentNode.removeChild(this);
			}
		});
		//this.totalGraphicCount = totalGraphicCount - 1;
		this.totalGraphicCount = totalGraphicCount;

		//interface controls:
		this.tearOff.enable();
		if(totalGraphicCount > 1) {
			CVPortal.controlFactory().updateCondition("multipleGraphics","true");

		}

		if(this.getProp("tearOff") != 1) {
			$("FIGURE:first > GRAPHIC:first", xml).each(function() {
				media.setCurrentGraphic(this, 1, "", true);
			});
		}

		if($("FIGURE > GRAPHIC", xml).length > 0 && this.getProp("alwaysShowMedia") == 1) {
			// show media panel:
			this.showMediaPanel();
			CVPortal.controlFactory().updateCondition("hasGraphic","true");
			this.noShow = false;
		} else {
			this.mediaVisible = false;
			this.noShow = true;
			if($("FIGURE > GRAPHIC", xml).length == 0) {
				CVPortal.controlFactory().updateCondition("hasGraphic","false");	
			} else {
				CVPortal.controlFactory().updateCondition("hasGraphic","true");
			}
		}
	},

	unloadMedia: function() {
		// destroy the content:
		delete this.mediaxml;
		delete this.currentFig;
		delete this.currentGraphic;
		delete this.currentType;
		delete this.currentFileName;
		delete this.currentURL;
		delete this.fileExt;
		delete this.totalGraphicCount;
		if (this.svgLibrary) {
			this.svgLibrary.destroy();
			delete this.svgLibrary;
			CVPortal.controlFactory().updateCondition("svgControls","false");
		}
		CVPortal.controlFactory().updateCondition("cgmControls","false");
		this.removeCanvasScripts();
		//reset the values:
		this.mediaxml = null;
		this.currentFig = null;
		this.currentGraphic = null;
		this.totalGraphicCount = 0;
		
		// hide the media panel:
		$(this.graphic_content).empty();
		this.hideMediaPanel();
		this.mediaVisible = false;
		this.noShow = true;
		
		//toggle media --> off
		this.hideMedia.disable();
	},

	// if the media panel is currently show,
	// 1) reset the data panel to the full size
	// 2) hide the media panel
	// 3) trigger resize to culculate wcn msg position is WCN_POPUP is enabled
	hideMediaPanel: function(event) {
		if(event !== undefined){
			this.documentOnlyView = true;
		}
		if(this.mediaVisible == true) {
			// mark the panel as shown:	
			this.mediaVisible = false;
			$("#graphic_content").hide();
			CVPortal.panelFactory().collapsePanel(this.mediaPanel.id);
			CVPortal.controlFactory().updateCondition("showingGraphic","false");
			$(this.hideMedia.label).html(CVPortal.getResource("ctrl.showMedia"));

			return 1; // media was hidden:			
		}
		return 0;
	},

	// if the media panel is currently show,
	// 1) reset the data panel to the full size
	// 2) hide the media panel
	hideDocPanel: function() {
		alert("In hideDocPanel()")
		if(this.docVisible == true) {
			// mark the panel as shown:	
			this.docVisible = false;
			$("#contentPanel").hide();
			CVPortal.panelFactory().collapsePanel(CVPortal.components.cvDocHandler.docPanel.id);
			if ( ! CVPortal.getIsTablet() ) {
				CVPortal.controlFactory().updateCondition("showingDocPanel","false");
			}
			return 1; // media was hidden:			
		}
		return 0;
	},

	explicitToggleMediaPanel: function() {
		this.toggleMediaPanel();
		if (this.mediaVisible == true) {
			this.noShow = false;
		} else {
			this.noShow = true;
		}
	},


	// toggle the media panel to hidden and then visible--only work if we have figures loaded!
	toggleMediaPanel: function() {
		if(this.mediaxml) {
			if(this.mediaVisible == true) {
				this.hideMediaPanel();
				CVPortal.components.cvDocHandler.reducePanel();
			} else {
				this.showMediaPanel();
				CVPortal.components.cvDocHandler.expandPanel();
			}
		}
	},

	// if the media panel is not shown currently
	// 1) get half the size of the container
	// 2) set the data panel and media panel to that size (split the container)
	showMediaPanel: function() {
		if(this.mediaVisible == false) {
			if(this.documentOnlyView) {
				this.documentOnlyView = false;
			}
			$("#graphic_content").show();
			if(this.getProp("tearOff") == 1) { // if we are in tearoff mode...
				var cHeight = parseInt(this.containerPanel.getPanelHeight(), 10);
				// set the data panel
				this.mediaPanel.getElement().style.display = "";
				this.mediaPanel.setPanelHeight(cHeight + "px");
			} else {
				// mark the panel as shown:	
				CVPortal.panelFactory().expandPanel(this.mediaPanel.id, true);
				$(this.hideMedia.label).html(CVPortal.getResource("ctrl.hideMedia"));
				this.mediaVisible = true;
				CVPortal.controlFactory().updateCondition("showingGraphic","true");
				if(CVPortal.components["cvResourceManager"].isTablet == true) this.mediaTabletOrientation();
				CVPortal.components.cvMedia.resizeControlBar();
        //  trigger resize to calculate wcn msg position is WCN_POPUP is enabled
        if(CVPortal.metaFactory().get("META_WCN_POPUP") == 0) {
          $(CVPortal.components.cvDocHandler.docPanel.getElement(CVPortal.components.cvDocHandler.id)).trigger("resize-panel");
        }
			}
		}
	},
	
	mediaTabletOrientation: function() {
		var panelSplit = "";
		var orientation = "";
		if ($("#graphicsPanel").hasClass("resizable-v")) panelSplit = "vertical"; 
		else if ($("#graphicsPanel").hasClass("resizable-h")) panelSplit = "horizontal";
		if(window.innerHeight > window.innerWidth) orientation = "portrait";
		else if (window.innerHeight <= window.innerWidth) orientation = "landscape";
		
		if (orientation == "portrait" && panelSplit == "vertical") CVPortal.panelFactory().flipPanels("graphicsPanel");
		if (orientation == "landscape" && panelSplit == "horizontal") CVPortal.panelFactory().flipPanels("graphicsPanel");
	},

	// *********************************
	// simple Accessors:
	// *********************************
	getGraphicId: function() {
		if(this.currentGraphic) {
			return this.currentGraphic.getAttribute("BOARDNO");
		} else {
			return "";
		}
	},

	getFigureId: function() {
		if(this.currentFig) {
			return this.currentFig.getAttribute("ID");
		} else {
			return "";
		}
	},


	//
	// return a ';' delimited string of image IDs from the current media document
	getImageQueryStr: function(scope) {
		if(scope == "all") {
			if(this.mediaxml != null) {
				var qString = "";
				$("GRAPHIC", this.mediaxml).each( function() {
					var filename = this.getAttribute("BOARDNO");
					if(filename != null) {
						qString += filename + ";";
					}
				});
				return qString;
			} else {
				CVPortal.warn(" {Media} Requested image query string for a document that has no figures ");
				return null;
			}
		} else if(scope == "current") {
			if(this.currentGraphic != null) {
				var boardno = this.currentGraphic.getAttribute("BOARDNO");
				if(boardno != null) {
					boardno = boardno + ";";
					return boardno;
				}
			} else {
				CVPortal.warn(" {Media} Requested image query string for a document that has no figures ");
				return null;
			}
		}
	},

	//
	// return a ';' delimited string of image titles from the current media document
	getTitleQueryStr: function(scope) {
		if(scope == "all") {
			if(this.mediaxml != null) {
				var tString = "";
				$("TITLE", this.mediaxml).each( function() {
					var title =  CVPortal.getNodeText(this, 1);
					if(title != null) {
						tString += title + ";";
					}
				});
				return tString;
			} else {
				CVPortal.warn(" {Media} Requested title query string for a document that has no figures ");
				return null;
			}
		} else if(scope == "current") {
			if(this.currentGraphic != null) {
				var title = this.currentGraphic.getAttribute("TITLE");
				if(title != null) {
					title = title + ";";
					return title;
				}
			} else {
				CVPortal.warn(" {Media} Requested title query string for a document that has no figures ");
				return null;
			}
		}
	},

	//
	// Image controls
	//
	setTitle: function() {
		$(this.graphic_title).html(this.title);
	},


	selectNextImage: function() {
		if(this.graphicIndex < this.totalGraphicCount) {
			this.graphicIndex++;
			var media = this;
			$("GRAPHIC:eq(" + this.graphicIndex +")", this.mediaxml).each(function() {
				media.setCurrentGraphic(this, this.graphicIndex);
			});
		}
	},

	selectPrevImage: function() {
		if(this.graphicIndex > 0)  {
			this.graphicIndex--;
			var media = this;
			$("GRAPHIC:eq(" + this.graphicIndex +")", this.mediaxml).each(function() {
				media.setCurrentGraphic(this, this.graphicIndex);
			});
		}
	},

	// a general purpose handler that tries DESPERATELY to select SOME figure based on figure / graphic Ids or SheetNos
	selectFigureAndSheet: function(figureId, sheetno) {
		var media = this;
		var found = 0;
		$("FIGURE[ID='" + figureId + "']", this.mediaxml).each(function() {
			var sN = sheetno -1
			$("GRAPHIC:eq(" + sN + ")", this).each(function() {
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
			if(found == 0) {
				$("GRAPHIC:eq(0)", this).each(function() {  // unable to get by sheet No, try 1 as default.
					if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
					media.graphicIndex = this.getAttribute("graphicIndex");
					media.setCurrentGraphic(this, media.graphicIndex);
					found = 1;
				});
			}
		});
		if(found == 0) {
			$("GRAPHIC[ID='" + figureId + "']", this.mediaxml).each(function() {  // unable to get by sheet No, try 1 as default.
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
		} else if(found == 0) {
			$("GRAPHIC:eq(0)", this.mediaxml).each(function() {
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
			if(found == 0) {
				CVPortal.error(" {cvMedia} Attempted to load figure and graphic by figure id " + figureId + " and sheetNo " + sheetno + ", failed!");
			}
		}
	},
	selectFigureAndSheetNew: function(refStruct) {
		var media = this;
		var found = 0;
		if (refStruct.figureId!=null && refStruct.figureId.trim()!=""){
			$("FIGURE[ID='" + refStruct.figureId + "']", this.mediaxml).each(function() {
				var sN = refStruct.sheetNo -1
				$("GRAPHIC:eq(" + sN + ")", this).each(function() {
					if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
					media.graphicIndex = this.getAttribute("graphicIndex");
					media.setCurrentGraphic(this, media.graphicIndex);
					found = 1;
				});
				if(found == 0) {
					$("GRAPHIC:eq(0)", this).each(function() {  // unable to get by sheet No, try 1 as default.
						if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
						media.graphicIndex = this.getAttribute("graphicIndex");
						media.setCurrentGraphic(this, media.graphicIndex);
						found = 1;
					});
				}
			});
		
			if(found == 0) {
				$("GRAPHIC[ID='" + refStruct.figureId + "']", this.mediaxml).each(function() {  // unable to get by sheet No, try 1 as default.
					if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
					media.graphicIndex = this.getAttribute("graphicIndex");
					media.setCurrentGraphic(this, media.graphicIndex);
					found = 1;
				});
			}
		}
		//figureId is empty in this case: get the node with given prefix and sheetno
		if(found == 0) {
			$("GRAPHIC[BOARDNO='" + refStruct.boardNo + "']", this.mediaxml).each(function() {  // unable to get by sheet No, try 1 as default.
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
		}
		//this is another option: use boardNo, this works only when the boardNo is unique
		if(found == 0) {
			$("GRAPHIC[PREFIX='" + refStruct.prefix + "'][SHEETNO='" + refStruct.sheetNo + "']", this.mediaxml).each(function() {  // unable to get by sheet No, try 1 as default.
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
		}
		
		if(found == 0) {
			$("GRAPHIC:eq(0)", this.mediaxml).each(function() {
				if (CVPortal.components['cvMedia'].getProp("alwaysShowMedia") != 0) media.showMediaPanel();
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this, media.graphicIndex);
				found = 1;
			});
			if(found == 0) {
				CVPortal.error(" {cvMedia} Attempted to load figure and graphic by figure id " + refStruct.figureId + " and sheetNo " + refStruct.sheetNo + ", failed!");
			}
		}
	},


	selectGraphic: function(boardno) {
		var media = this;
		var found = false;
		// we are selecting a graphic, so immediately show the graphic panel!:
		this.showMediaPanel();

		if(this.boardNo != boardno) {
			// Try by Graphic BOARDNO:
			$("GRAPHIC[BOARDNO='" + boardno + "']", this.mediaxml).each(function() {
				found = true;
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this); // , media.graphicIndex);
			});
			// Try by Figure ID:
			$("FIGURE[ID='" + boardno + "']", this.mediaxml).each(function() {
				found = true;
				$("GRAPHIC:eq(0)", this).each(function() {
					media.graphicIndex = this.getAttribute("graphicIndex");
					media.setCurrentGraphic(this); // , media.graphicIndex);
				});
			});
			if (found == false) {
				// Try by Graphic BOARDNO:
				$("GRAPHIC[BOARDNO='" + boardno + "']", this.mediaxml).each(function() {
					found = true;
					media.graphicIndex = this.getAttribute("graphicIndex");
					media.setCurrentGraphic(this); // , media.graphicIndex);
				});
			}
			if (found == false) {
				// Try by Figure ID:
				$("FIGURE[ID='" + boardno + "']", this.mediaxml).each(function() {
					found = true;
					$("GRAPHIC:eq(0)", this).each(function() {
						media.graphicIndex = this.getAttribute("graphicIndex");
						media.setCurrentGraphic(this); // , media.graphicIndex);
					});
				});
			}

			if(found == false) {
				this.hideMediaPanel();
				CVPortal.warn("Unable to locate graphic, named " + boardno);
			}
		}
	},

	selectGraphicByEID: function(figureEID) {
		var media = this;
		var found = false;
		// we are selecting a graphic, so immediately show the graphic panel!:
		this.showMediaPanel();

		if(this.figEID != figureEID) {
			// Try by Graphic EID:
			$("GRAPHIC[EID='" + figureEID + "']", this.mediaxml).each(function() {
				found = true;
				media.graphicIndex = this.getAttribute("graphicIndex");
				media.setCurrentGraphic(this); // , media.graphicIndex);
			});

			if(found == false) {
				this.hideMediaPanel();
				CVPortal.warn("Unable to locate graphic, named " + boardno);
			}
		}
	},

	changeGraphicType: function(event) {
		var evt = CVPortal.fixEvent(event);
		var el = CVPortal.eventGetElement(evt);
		this.setCurrentGraphic(this.currentGraphic, this.graphicIndex, el.value);
	},

	createCanvasImage: function(html, source) {
		var media = this;
		//let's parse the html string into a DOM so that we can more easily search it for script tags which might need to be rewritten
		var parser = new DOMParser();
		var canvasDom = parser.parseFromString(html, "text/html");
		media.canvasFunctions = [];
		
		//for convenience's sake, we're going to automatically rewrite any script tags that link to outside files in order to point to the multimedia folder
		//in order to clean up after these scripts, we're also going to record all the functions that are loaded by each script, by passing the script text to logCanvasScripts
		var scriptList = canvasDom.querySelectorAll("script");
		var supportedLibraries = ["/createjs-2015.11.26.min.js", "/createjs.js", "/three.js", "/html2canvas.js", "/dvl.js", "Loco.js"];
		$("script", canvasDom).remove();
		if (scriptList.length > 0) {
			for (i = 0; i < scriptList.length; i++) {
				var newScriptTag = canvasDom.createElement("script");
				if (scriptList[i].src) {
					//these are separate JS files, so load them via jQuery getScript
					var scriptName = scriptList[i].src.slice(scriptList[i].src.lastIndexOf("/"));
					var scriptPath;
					
					if (source == "frontmatter") {
						//there doesn't seem to be an easy function call to get to the book_data folder where the front matter is, so we write our own
						scriptPath =  CVPortal.getUrlforHttpDocs() + "book_data/" + CVPortal.metaFactory().get("META_COLLECTION") + "/" + CVPortal.metaFactory().get("META_BOOK") + "" + scriptName;
					} else {
						scriptPath = CVPortal.getUrlforBookData() + "/multimedia" + scriptName;
					}
					
					var library = false;
					//IE11 doesn't support array.includes(), so we have to compare against the list of supported libraries with a for loop instead
					for (j = 0; j < supportedLibraries.length; j++) {
						if (supportedLibraries[j] == scriptName) library = true;
					}
					
					if (library == true) {
						//$.getScript(scriptPath);
						media.canvasFunctions.push(scriptName);
					} else {
						//$.getScript(scriptPath, media.logCanvasScripts);
						$.get(scriptPath, media.logCanvasScripts, "text");
					}
					newScriptTag.src = scriptPath;
					newScriptTag.async = false;
					canvasDom.head.appendChild(newScriptTag);
				} else if (scriptList[i].text) {
					//these are inline script tags, so parse their contents directly
					var scriptContent = scriptList[i].text;
					media.logCanvasScripts(scriptContent);
					
					newScriptTag.text = scriptContent;
					newScriptTag.async = false;
					canvasDom.body.appendChild(newScriptTag);
				}
			}
			//since we changed/removed some script tags, we need to convert our changed DOM back into a string
			if (CVPortal.getBrowserType() === "IE11") {
				// XMLSerializer self-closed <script /> element which case porblem in IE11
				html =  $('<div>').append(canvasDom.documentElement).html();
			} else {
				var serializer = new XMLSerializer();
				html = serializer.serializeToString(canvasDom);
			}
			return html;
		}
	},
	
	logCanvasScripts: function(data) {
		//because HTML5 canvas files create everything in global scope, loading more than one in a session can cause clashes and errors
		var media = CVPortal.components.cvMedia;
		//create a RegExp to search for "function *(" and capture the text represented by the asterisk
		var functionFinder = RegExp(/function ([A-Za-z]*)\(/g);
		var result = [];
		while (result != null) {
			result = functionFinder.exec(data);
			if (result && result[1]) media.canvasFunctions.push(result[1].trim());
		}
	},
	
	removeCanvasScripts: function() {
		var media = this;
		if (this.rhiCanvasPresent()) this.rhiCanvasClear();
		//when anything happens that would change or unload a canvas graphic, we need to wipe away the JS functions that were loaded by that canvas
		if (!media.canvasFunctions) return;
		else if (media.canvasFunctions.length < 1) return;
		var supportedLibraries = ["/createjs-2015.11.26.min.js", "/createjs.js", "/three.js", "/html2canvas.js", "/dvl.js", "Loco.js"];
		for (i = 0; i < media.canvasFunctions.length; i++) {
			var item = media.canvasFunctions[i];
			if (item == "/createjs-2015.11.26.min.js" || item == "/createjs.js") {
				//https://createjs.com/docs/easeljs/classes/Ticker.html
				//removes the "tick" event that Adobe Animate's version of createjs uses for animation
				createjs.Ticker.removeAllEventListeners();
			} else if (item == "/three.js") {
				//disables the scene autoupdate, which should stop the animation from rendering further until the underlying function is removed
				scene.autoUpdate = false;
			} else if (item == "/dvl.js" || item == "Loco.js" || item == "/Loco.js") {
				//these are already handled by the rhiCanvasClear method above
			} else {
				//set the function to undefined, which stops it from running
				window[item] = undefined;
			}
		}
		media.canvasFunctions = [];
	},

	setCurrentGraphic: function(graphic, index, img_type, firstLoad) {
		this.loadingGraphic = true;
		this.currentGraphic = graphic;
		this.currentFig = graphic.parentNode;
		this.boardNo = graphic.getAttribute("BOARDNO");
		this.figEID = graphic.getAttribute("EID");
		var mmValues = new Object();
		mmValues.mmAutoPlay = graphic.getAttribute("AUTOPLAY");
		mmValues.mmFullScreen = graphic.getAttribute("FULLSCREEN");
		mmValues.mmHeight = graphic.getAttribute("HEIGHT");
		mmValues.mmWidth = graphic.getAttribute("WIDTH");
		mmValues.mmMultimediaClass = graphic.getAttribute("MULTIMEDIACLASS");
		mmValues.mmControls = graphic.getAttribute("CONTROLS");
		mmValues.mmDuration = graphic.getAttribute("DURATION");
		//get the title which has added prefix
		this.title = graphic.getAttribute("DISPLAY-TITLE");
		if (this.svgLibrary) {
			this.svgLibrary.destroy();
			delete this.svgLibrary;
		}
		this.removeCanvasScripts();
		CVPortal.controlFactory().updateCondition("svgControls","false");
		CVPortal.controlFactory().updateCondition("cgmControls","false");
		//LCS-2939: if the title is encoded as ISO-8859, try to convert to UTF-8 using escape (which encodes as ISO-8859) and decodeURIComponent (which decodes as UTF-8)
		//LCS-3489: if that doesn't work, it might silently fail and halt execution, so we need to try-catch this, at least till the server is fixed to send proper UTF-8 in the first place
		try {
			this.title = decodeURIComponent(escape(this.title));
		} catch (e) {
			CVPortal.debug(" {Media} Failed UTF-8 conversion for title : " + this.title + " and index: " + index);
		}
		this.graphicID = graphic.getAttribute("ID");
		this.setTitle();
		
		CVPortal.debug(" {Media} Selecting the graphic boardno: " + this.boardNo + " and index: " + index);
		// if someone passed in INDEX as a parameter, then we will interpet it:
		if(index > 0) {	index--; }
		if(index != null) {	
			this.graphicIndex = index;
		} else { // ALWAYS set some sort of index:
			this.graphicIndex = this.currentGraphic.getAttribute("graphicIndex");
		}

		// show our type selector:
		$("#CVCtrl_selectType", this.graphic_content).show();

		// Legend loading:
		this.legendFound = false;
		var media = this;
		$("legend", graphic.parentNode).parent().each(function() {
			media.legendFound = true;
			var lTarget = null;
			$("#graphic_legend", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "19%"; this.style.display = ""; lTarget = this; });
			if (media.isParent !=undefined && media.isParent==true){
				media.cvTransformXML(this, "legendXSL", lTarget);
			}else{
				media.cvTransformXML(media.figLegend[graphic.getAttribute("EID")], "legendXSL", lTarget);
			}
			$("#graphic_title", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "79%"; });
			$("#graphic_content", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "79%"; });
		});
		if(media.legendFound == false) {
			$("#graphic_legend", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "0%"; this.style.display = "none"; $(this).empty(); });;
			$("#graphic_title", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "99%"; });
			$("#graphic_content", media.mediaPanel.getElement(media.id)).each(function() { this.style.width = "99%"; });
		}

		// reset our meta so it does not end up having the last images' data:
		media.currentType = "unknown";
		media.currentFilename = "unknown";

		// the URL to load the first figure and graphic:
		$(this.graphic_content).html("<div style='display: flex; align-items: center; height: 100%; width:100%; margin-left: 45%;'><img src='" + CVPortal.fetchSkinImage("processing.gif") + "'/><br/><span class='bold'>"+CVPortal.getResource("text.loading")+"</span></div>");
		var url = CVPortal.getURLwithBookParams() + "&target=main&action=image&file_name=" + this.boardNo;
		if(img_type && img_type != "") {
			url += "&img_type=" + img_type;
			media.currentType = img_type;
		}
		media.currentURL = url;
		media.currentFilename = media.boardNo;
		//media.graphic_iframe.href = url;
		$.ajax( {
			method: "GET",
			url: url,
			async: true,
			dataType: "html",
			success: function(html) {
				//html = CVPortal.stripScripts(html, true, 1);

				// STRIP OUT HEIGHT='100%' of image tags
				if(media.getProp("resize_simple_images") == null || media.getProp("resize_simple_images") == 0) {
					var index = html.indexOf("HEIGHT='100%'");
					if (index != -1) {
					var finalString = html.substr(0, index);
					finalString += html.substr(index + 13, html.length);
					html = finalString;
					}
				}
				
				// Find graphic file that matches boardno
				// Set media.filePath
				// Set media.fileExt
				media.findGraphicFile(media.boardNo);

				if(CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT" || html.indexOf("flashMovie") != -1 ) {
					var browser_name = CVPortal.getBrowserName();
					
					// make sure that it is not a NO-SUPPORT Type for Moz...
					var figFound = false;
					var figPathArray = CVPortal.metaFactory().get("META_FIGURES_PATH").split(',');
					var addSVGController = 0;
					for (var i = 0; i < figPathArray.length && figFound != true; i++) {
						var baseMMURL = figPathArray[i];
						var mmAttributes = media.findMMObject(baseMMURL);
						
						if (mmAttributes != "" && mmAttributes.mmExtension != "") {
							var mmObjectTag = media.buildMMObjectTag(mmAttributes, baseMMURL, mmValues);
							$(media.graphic_content).html(mmObjectTag);
							//media.currentType = mmAttributes[0];
							media.currentType = mmAttributes.mmExtension;
							figFound = true;
							delete html;
						} else if (media.fileExt == "cgm") {
							media.currentType = "cgm";
							figFound = true;
							media.createCgmCanvas();
							media.loadCgmGraphic(media.filePath);
							delete html;
						} else if(html.indexOf("Mobilizer") != -1) {
							$(media.graphic_content).html("<div class='graphicWarning'>" + CVPortal.getResource("text.msg.Mobilizer.browser.support1") + " "+browser_name+".  " + CVPortal.getResource("text.msg.Mobilizer.browser.support2") + "</div>");
							CVPortal.warn(" {Graphics} Attempted to load a NGrain 3ko in a "+browser_name+" browser.  User was given a warning instead.");
							media.currentType = "mbl";
							figFound = true;
							delete html;
						} else if(html.indexOf("rhiModel") != -1) {
							$(media.graphic_content).html("<div class='graphicWarning'>" + CVPortal.getResource("text.msg.rhiModel.browser.support1") + " "+browser_name+".  " + CVPortal.getResource("text.msg.rhiModel.browser.support2") + "</div>");
							CVPortal.warn(" {Graphics} Attempted to load a IsoView CGM in a "+browser_name+" browser.  User was given a warning instead.");
							media.currentType = "cgm";
							figFound = true;
							delete html;
						} else if(html.indexOf("flashMovie") != -1) {
							var ind = html.indexOf("flashMovie");
							var output = html.substr(ind, html.length);
							media.currentType = "swf";
							// FLASH, do special operations for Firefox support:
							// first retrieve JUST the SWF URL:
							var urlIndex = html.indexOf('<PARAM NAME="movie" VALUE="');
							html = html.substr(urlIndex + 27, html.length - 1);
							urlIndex = html.indexOf('"');
							html = html.substr(0, urlIndex);
							// add a workable FF flash <EMBED>
							$(media.graphic_content).html('<object id="flashMovie" classid="CLSID:D27CDB6E-AE6D-11CF-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="100%" height="100%"><param name="allowScriptAccess" value="sameDomain" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + html + '"></param><param name="quality" value="high" /><param name="bgcolor" value="#ffffff" /><embed quality="high" bgcolor="#ffffff" width="100%" height="100%" name="flashMovie" swliveconnect="true" allowScriptAccess="sameDomain" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="' + html + '"></embed></object>');
							figFound = true;
						} else if(media.filePath != "" && media.fileExt != "" && media.fileExt == "rh") { // SPECIAL SAP Viewer Processing:
								$(media.graphic_content).html('<object id="rhiModel" height="100%" width="100%" border="0" classid="CLSID:1110E0D7-D33E-438C-88A4-1FA6A88F9A6B"> <param name="FileName" value="' + media.filePath + '"/> <param name="BackStyle" value="0" /> <param name="FillColor" value="16777215" /> <div align="center">'+ CVPortal.getResource("text.msg.rhiModel.viewer.not.installed1") + '<br /> '+ CVPortal.getResource('text.msg.rhiModel.viewer.not.installed2') + ':<br /> <a href="http://sap.com" target="_blank">http://sap.com </a><br /> ' + CVPortal.getResource("text.msg.rhiModel.viewer.not.installed3") + '<br />' + CVPortal.getResource("text.msg.rhiModel.viewer.not.installed4") + '.<br />'+ CVPortal.getResource('text.msg.rhiModel.viewer.not.installed5') + '<br /></div></object>');
								media.currentType = "rhi";
								delete html;
						} else if(media.filePath != "" && media.fileExt != "" && media.fileExt == "vds") { // SPECIAL HTML5 SAP Viewer Processing:
								$(media.graphic_content).empty();
								var sapCanvas = document.createElement("canvas");
								sapCanvas.id = "sapCanvas";
								media.graphic_content.appendChild(sapCanvas);
								media.currentType = "vds";
								media.rhiCreateContext(media.filePath);
								delete html;
						} else if (mmAttributes == "") {
							//if it's not a media type with a prebuilt tag from buildMMObjectTag, let's check for HTML/XML-based filetypes
							//first, we check for SVGs, and build a tag for them
							if (html.indexOf("showSVG(\"")>0){
								var temp = html.substring(html.indexOf("showSVG(\"")+9);
								temp = temp.substring(0,temp.indexOf("\""));
								var imgName = temp.split('').reverse();
								var title = imgName.slice(imgName.indexOf('.')+1, imgName.indexOf('/')).reverse().join('');
								media.currentType="svg";
								//alert("return html>>\n" + temp);
								html= "<div align=\"center\" valign=\"middle\" class=\"svgimage\" style=\"width:100%;height:100%;overflow:hidden;\">" + getSVGText(temp, title) + "</div>";
								addSVGController = 1;
							}
							//next, we check for HTML5 canvas graphics
							else if (media.fileExt == "html" || media.fileExt == "htm") {
								media.currentType="canvas";
								html = media.createCanvasImage(html);
							}
							$(media.graphic_content).html(html);

							if (addSVGController == 1) {
								media.addSVGControls();
								if(!$(media.graphic_content).find('a').length) {
									CVPortal.controlFactory().updateCondition("svgHotspots","false");
									if(!$(media.graphic_content).find('text.ishotspot').length) {
										CVPortal.controlFactory().updateCondition("svgHotspots","true");
									}
								} else {
									CVPortal.controlFactory().updateCondition("svgHotspots","true");
								}		
								// refactor this part to marge svg part for ie and webkit, FF
								if (!document.getElementById("annotationIcon") && document.getElementById("redliningGroup")) {
										media.redliningAnnotationPatternIcon();
								}
							}
							media.setCanvasSize();
							figFound = true;
							CVPortal.info(" {Graphics} Loaded a graphic of type " + media.currentType + " in "+browser_name);
						}
					}
				} else {
					var specialMedia = false;
					if(html.indexOf("rhiModel") != -1 || media.fileExt == "rh") { // SPECIAL SAP Viewer Processing:
						if (media.filePath != "" && media.fileExt != "" && media.fileExt == "rh") {
							$(media.graphic_content).html('<object id="rhiModel" height="100%" width="100%" border="0" classid="CLSID:1110E0D7-D33E-438C-88A4-1FA6A88F9A6B"> <param name="FileName" value="' + media.filePath + '"/> <param name="BackStyle" value="0" /> <param name="FillColor" value="16777215" /> <div align="center">'+ CVPortal.getResource("text.msg.rhiModel.viewer.not.installed1") + '<br /> '+ CVPortal.getResource('text.msg.rhiModel.viewer.not.installed2') + ':<br /> <a href="http://sap.com" target="_blank">http://sap.com </a><br /> ' + CVPortal.getResource("text.msg.rhiModel.viewer.not.installed3") + '<br />' + CVPortal.getResource("text.msg.rhiModel.viewer.not.installed4") + '.<br />'+ CVPortal.getResource('text.msg.rhiModel.viewer.not.installed5') + '<br /> 		</div> 		</object>');
							media.currentType = "rhi";
							delete html;
							//cannot init RHI Model here as this gets called while graphic is still loading - init later
						}
					} else if(media.filePath != "" && media.fileExt != "" && media.fileExt == "vds") { // SPECIAL HTML5 SAP Viewer Processing:
						$(media.graphic_content).empty();
						var sapCanvas = document.createElement("canvas");
						sapCanvas.id = "sapCanvas";
						media.graphic_content.appendChild(sapCanvas);
						media.currentType = "vds";
						media.rhiCreateContext(media.filePath);
						delete html;
					} else {
						var baseMMURL = media.filePath;
						var mmAttributes = media.findMMObject(baseMMURL);
						if (mmAttributes != "" && mmAttributes.mmExtension != "") {
							var mmObjectTag = media.buildMMObjectTag(mmAttributes, baseMMURL, mmValues);
							$(media.graphic_content).html(mmObjectTag);
							media.currentType = mmAttributes.mmExtension;
							delete html;
						}
						// IE can support all these wierd types:
						if (mmAttributes == "") {
							if (html.indexOf("showSVG(\"")>0){
								var temp = html.substring(html.indexOf("showSVG(\"")+9);
								temp = temp.substring(0,temp.indexOf("\""));
								var imgName = temp.split('').reverse();
								var title = imgName.slice(imgName.indexOf('.')+1, imgName.indexOf('/')).reverse().join('');
								media.currentType="svg";
								html= "<div align=\"center\" valign=\"middle\" class=\"svgimage\" style=\"width:100%;height:100%;overflow:hidden;\">" + getSVGText(temp, title) + "</div>";
								addSVGController = 1;
							} else if (media.fileExt == "cgm") {
								//if the configured CGM viewer is NOT set to IsoView, load HTML5 CGM viewer
								if(html.indexOf("IsoView") == -1) {
									media.currentType = "cgm";
									figFound = true;
									media.createCgmCanvas();
									media.loadCgmGraphic(media.filePath);
									delete html;
									specialMedia = true;
								}
								//otherwise, do nothing and follow the default logic of just inserting whatever HTML the server provides
							} else if (media.fileExt == "html" || media.fileExt == "htm") {
								media.currentType = "canvas";
								html = media.createCanvasImage(html);
							}
							if (specialMedia == false) {
								$(media.graphic_content).html(html);
							}
							if (addSVGController == 1) {
								media.addSVGControls();
								if(!$(media.graphic_content).find('a').length) {
									CVPortal.controlFactory().updateCondition("svgHotspots","false");
								} else {
									CVPortal.controlFactory().updateCondition("svgHotspots","true");
								}

								if (!document.getElementById("annotationIcon") && document.getElementById("redliningGroup")) {
										media.redliningAnnotationPatternIcon();
								}
							} 
							media.setCanvasSize();
							CVPortal.info(" {Graphics} Loaded a graphic of type " + media.currentType + " in Internet Explorer");
						}
					}
				}

				// Load any Image Maps for this GRAPHIC:
				$("map[name='"+media.boardNo+"']", media.dataPanel.getElement()).each(function() {
					CVPortal.debug(" {Media} Loading image Map for " + media.boardNo);
					$("#MAIN > img", media.graphic_main).each(function() {
						$(this).attr("usemap", "#" + media.boardNo);
						$(this).attr("IMAGE_MAP", "1");
					});
					if(CVPortal.getBrowserType() == "IE" || navigator.userAgent.toLowerCase().match(/trident/i)) {
						$("#MAIN", media.graphic_main).each(function() {
							var copy = $(this).html();
							$(this).html("").html(copy);
						});								
					}
				});
				// complete the Media Loading process:
				media.finishLoad(mmValues);
			}
		});
		
		this.resizeControlBar();
		
		////////////////////////////////////////////////////////
		// turn on and off next and previous image buttons:
		////////////////////////////////////////////////////////
		if(this.graphicIndex < (this.totalGraphicCount - 1)) { // if there are still more images...
			CVPortal.controlFactory().updateCondition("multipleGraphics","true");
		} else {
			CVPortal.controlFactory().updateCondition("multipleGraphics","false");
		}
		if(this.graphicIndex > 0) { // if there are still more images...
			 CVPortal.controlFactory().updateCondition("firstGraphics","false");
		} else {
			CVPortal.controlFactory().updateCondition("firstGraphics","true");
		}
	},

	tearOffGraphic: function() {
		var url =  CVPortal.fetchSkinFile("cvGraphicTearoff.html");
		this.tearOffCount++;
		var figWin = window.open(url, 'figWin' + this.tearOffCount,
			'toolbar=0,location=0,directories=0,scrollbars=0,status=1,menubar=0,resizable=1,top=0,left=0,width=' + screen.width + ',height=' + screen.height);
	    figWin.opener = window;
	},
	
	//
	// Hotspot handling for graphic tearoff
	//
	handle_xref: function(xrefid, xidtype, event, stepID) {
		var media = this;
		var evt;
		var el = null;
		var target = null;
		var currentID = null;	// NV Harmonization
		var xref_target = null;

		if(event) { // if the event exists, process it:
			evt = CVPortal.fixEvent(event);
			el = CVPortal.eventGetElement(evt);
			target = el.getAttribute("target");
			if(target == null) {
				target = el.getAttribute("xref_target");
			}
			if(xref_target == null) {
				xref_target = el.getAttribute("xref_target");
				media.referredFragment = xref_target;
			}
			currentID = el.getAttribute("EID");	// NV Harmonization
		}

		if(el == null && xrefid != null) { // if the EL was not provided...
			$("#" + xrefid, media.docPanel.getElement(media.id)).each(function() {
				el = this;
			});
		}

		if(xrefid == null || xrefid == "") {  // if arguments are null, get the information from the event-element
			if(el) {
				xrefid = "";
				xidtype = el.getAttribute("xidtype");
				xrefid = el.getAttribute("xrefid");
			}
    }

    if(xrefid == null) { // still null?  error:
      CVPortal.error(" {cvMedia} Failed to follow an XREF with the id " + xrefid + " and type " + xidtype);
      CVPortal.debugAlert(" System unable to follow xref with xrefid: " + xrefid);
      return;
		}

		if(event && el) {
			this.selectXrefText(el);
		}
		
		if(xidtype == "hotspot" || xidtype == "irtt11") {
			var found = 0;
			$("hotspot", this.docPanel.getElement(this.docHandlerId)).each(function() {
				if(xrefid == this.getAttribute("id") || xrefid == this.getAttribute("xrefid")) {
					// retrieve some graphic oriented attributes:
					found = 1;
					var graphicICN = this.getAttribute("graphicICN");
					var figureID = this.getAttribute("figureId");
					if (media.docType == "ipc"){
						// ipc graphic element doesn't have key, so figureIDs are autogenerated on the fly and can be different each time
						figureID = CVPortal.components.cvMedia.getFigureId();
					}
					CVPortal.debug(" {cvMedia} Hotspot Xref: ID " + xrefid + ", APSID: " + this.getAttribute("apsid") + ", APSNAME: " + this.getAttribute("apsname"));

					// we must first load the graphic and THEN activate the hotspot... timing!
					if(graphicICN != media.getGraphicId() || figureID != media.getFigureId()) {
						// pass in the TRUE flag for a delay
						media.selectFigureAndSheet(figureID , this.getAttribute("graphicIndex"));
						//call HotspotHandler replaces direct call to highlightHotspot - handles different hotspot types
						media.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),true, xidtype);
					} else {
						// Highlight the hotspot:
						//call HotspotHandler replaces direct call to highlightHotspot - handles different hotspot types
						if (media.svgLibrary) media.svgLibrary.reset();
						media.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),false, xidtype);
					}
				}
			});
			if(found === 0) {
				CVPortal.debugAlert("Unable to find hotspot with reference : " + xrefid);
			}
		}
	},

	callDelayedHsHighlight: function(hsID, hsName, xidtype) {
		// wait for graphic to be loaded before trying to highlight HS or play step
		if(this.loadingGraphic == true || this.currentType == "unknown") {
			timerId = setTimeout("CVPortal.components.cvDocHandler.callDelayedHsHighlight('" + hsID + "', '" + hsName + "', '" + xidtype + "')", 500);
		} else {
			this.callHotspotHandler(hsID, hsName, false, xidtype);
		}
	},

	selectXrefText: function(el) {
		if(el && !$(el).hasClass("revisions_link")) {
			if(this.currentXrefSelected) {
				try{
					this.currentXrefSelected.style.fontWeight = "normal";
				} catch (e){
			 		// its possible the highlighted text was in a tear off that no longer exists, so ignore error
				}
			}
			this.currentXrefSelected = el;
			el.style.fontWeight = "bold";
		}
	},
	
	callHotspotHandler: function(hsID, hsName, delay, xidtype){
		// handle hotspots depending on type and graphic type
		// alert("callHotspotHandler " + hsID + ", " + hsName + ", " + delay + ", " + xidtype);
		if(delay == true || this.loadingGraphic == true) {
			this.callDelayedHsHighlight(hsID, hsName, xidtype);
		} else {
			var mediaType = this.currentType;
			if (mediaType == "cgm"){
				if (xidtype != "hotspot" && xidtype != "irtt11"){
					CVPortal.debugAlert("Ref type " + xidtype + " not supported for CGM graphics");
				} else {
					this.highlightHotspot(hsID, hsName, delay);
				}
			} else if (mediaType == "rhi" || this.rhiCanvasPresent()){
				this.rhiHsHandler(hsName, xidtype);
			} else if (mediaType == "svg") {
				this.highlightHotspotSVG(hsID, hsName, delay);
			} else if (mediaType != ""){
				CVPortal.debugAlert("Hotspot highlighting not implemented for type " + mediaType);
			}
		}
	},

	//
	// Graphic has been loaded, do some additional work based on type, figure_xml, etc
	finishLoad: function(currMMAtributes) {
		var media = this;
		media.currentCGMViewer = "unknown";
		$(media.typeSelect.element).hide()
		// Retreive our Image Type;

		$("#MAIN", this.graphic_content).each(function() {
			$(this).show();
			media.currentType = this.getAttribute("img_type");
		});

		// Retrieve our current IMAGE BOARD NO / or FILE NAME...
		$("#META_FILE_NAME", this.graphic_content).each(function() {
			media.currentFilename = this.getAttribute("CONTENT");
		});

		if (this.getProp("tearOff") === "1" && CVPortal.components.cvMedia.dmBannerSecurityClass) {
			var dmBannerContainer = document.getElementById("dmSecurityBanner"), classification;
			if (this.dmBannerPrevClass) {
				$("#dmSecurityBanner").removeClass(this.dmBannerPrevClass);
			}
			if (media.currentGraphic.getAttribute("CLASSIFICATION")) {
				classification = media.currentGraphic.getAttribute("CLASSIFICATION");
				dmBannerContainer.className += " security-dm-banner" + classification;
				dmBannerContainer.children[0].innerText = CVPortal.getResource("dm.security.banner.classification.level" + classification);
				// LAM:2021-10-14 revised
				var secLbl = CVPortal.getResource("dm.security.banner.classification.level" + classification);
				dmBannerContainer.children[0].innerHTML = ('' + secLbl) === '' ? '' : '<span class="dmSecurityInfo">' + secLbl + '</span>';
			} else if (media.currentGraphic.getAttribute("FIGCLASSIFICATION")) {
				classification = media.currentGraphic.getAttribute("FIGCLASSIFICATION");
				dmBannerContainer.className += " security-dm-banner" + classification;
				// LAM:2021-10-14 revised
				var secLbl = CVPortal.getResource("dm.security.banner.classification.level" + classification);
				// dmBannerContainer.children[0].innerText = CVPortal.getResource("dm.security.banner.classification.level" + classification);
				dmBannerContainer.children[0].innerHTML = ('' + secLbl) === '' ? '' : '<span class="dmSecurityInfo">' + secLbl + '</span>';
			} else {
				classification = CVPortal.components.cvMedia.dmBannerSecurityClass;
				dmBannerContainer.className += " security-dm-banner" + classification;
				// LAM:2021-10-14 revised
				var secLbl = CVPortal.components.cvMedia.dmSecurityInfo;
				//dmBannerContainer.children[0].innerText = CVPortal.components.cvMedia.dmSecurityInfo;
				dmBannerContainer.children[0].innerHTML = ('' + secLbl) === '' ? '' : '<span class="dmSecurityInfo">' + secLbl + '</span>';
			}
			this.dmBannerPrevClass = " security-dm-banner" + classification;
			dmBannerContainer.style.display = "block";
			CVPortal.panelFactory().applyVariedDimensions(true);
		}
		// Load the FIGURES XML:
		if(media.currentFilename != "unknown") {
			var url = CVPortal.getUrlforBookData() + "/figures_xml/" + media.currentFilename + ".xml";
			$.ajax( {
				url: url,
				dataType: "xml",
				async: true,
				method: "GET",
				success: function(xml) {
					if($("media-item", xml).length > 1) {
						$(media.typeSelect.element).empty();
						$("media-item", xml).each(function() {
							$(media.typeSelect.element).append("<option animation='"+ this.getAttribute("animation") +"' selected='selected' value='" + this.getAttribute("type") + "'>" + this.getAttribute("type") + "</option>");
						});
						$("option[value='" + media.currentType + "']", media.typeSelect.element).each(function() {
							this.selected = true;
							media.currentTypeSelect = this;
						});
						$(media.typeSelect.element).show();
						media.typeSelect.element.disabled = false;
					}


					//alert("CT: " + media.currentType + ", att: " + media.currentTypeSelect.getAttribute("animation"));
					if(media.currentType == "swf" && (media.currentTypeSelect.getAttribute("animation") == 1)) {
						// hide our play animations controls:
						CVPortal.controlFactory().updateCondition("showAnimation","true");
					} else {
						// hide our play animations controls:
						CVPortal.controlFactory().updateCondition("showAnimation","false");
					}
				},
				error: function() {
					CVPortal.debug(" {cvMedia} Unable to fetch media companion file: " + media.currentFilename + ".xml");
				}
			});
		}
		// controls for buttons added, depending on graphic type and document type
		CVPortal.controlFactory().updateCondition("waitRHIShow","false");
		CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
		CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
		if (((media.currentType == "rhi") || this.rhiCanvasPresent()) && (CVPortal.components.cvDocHandler)){
			var doctype = CVPortal.components.cvDocHandler.current.docType;
			this.rhiStepEventHandlerSet=false;
			this.rhiHighLightNode=undefined;
			this.rhiHighLightNodeID="";
			if ((doctype == "illustratedPartsCatalog")|| (doctype == "ipc")){
				CVPortal.controlFactory().updateCondition("RHIXrayOn","false");
				CVPortal.controlFactory().updateCondition("showSAPControls","false");
			} else {
				CVPortal.controlFactory().updateCondition("showSAPControls","true");
				CVPortal.controlFactory().updateCondition("prevSAPEnable","false");
			}
			//this.tearOff.hide();
			CVPortal.controlFactory().updateCondition("showSAPGraphic","true");
			
			if (currMMAtributes.mmAutoPlay != null && currMMAtributes.mmAutoPlay == "1" && ((doctype != "illustratedPartsCatalog") && (doctype != "ipc"))) {
				/************************************
					this.rhiPlayAllSteps();
				************************************/
			}
		} else {
			CVPortal.controlFactory().updateCondition("showSAPControls","false");
			if(this.getProp("tearOff") != 1) { // if we are in tearoff mode...
				CVPortal.controlFactory().updateCondition("hideTearOff","false");
			}
			CVPortal.controlFactory().updateCondition("showSAPGraphic","false");
			// If our type is CGM, perform some special type translation:
			if(media.currentType == "cgm") {
				// Figure out which viewer we are using:
				var type = CVPortal.metaFactory().get("META_CGM_CONTROL");
				if(type == 1) {
					media.currentCGMViewer = "ACTIVECGM";
				} else if(type == 2) {
					media.currentCGMViewer = "ISOVIEW";
				} else if(type == 3) {
					media.currentCGMViewer = "LARSON";
				} else {
					media.currentCGMViewer = "unknown";
				}
			}
		}

		// WCN pop-up should be triggered after graphic was loaded
		if(this.getProp("tearOff") !== "1" && !CVPortal.components.cvDocHandler.scrollWithBtn && !$("#modalDialog").is(":visible")) {
			CVPortal.components.cvDocHandler.popWCN() 
		}
	},

	//****************************
	//
	//  CGM Viewer AGNOSTIC Hotspot handling:
	//
	//****************************
	highlightHotspot: function(apsid, apsname, delay) {
		this.showMediaPanel();
		CVPortal.debug(" {cvMedia} A hotspot with id " + apsid + " and name " + apsname + " has been activated.");
		if(delay == true) {
			this.DelayedHsHighlight(apsid, apsname);
		} else {
			if (CVPortal.getBrowserType() == "IE11" && this.currentCGMViewer == "ISOVIEW") {
				this.IsoViewHighlightHotspot(apsid, apsname);
			} else {
				this.cgmHighlightHotspot(apsid);
			}
		}
	},

	DelayedHsHighlight: function(aspid, aspname) {
		if(this.loadingGraphic == true) {
			CVPortal.debug("[cvMedia Hotspot] Delaying hotspot.");
			timerId = window.setTimeout("CVPortal.components.cvMedia.DelayedHsHighlight('" + aspid + "', '" + aspname + "', true)", 500);
		} else {
			//alert("hitting it!");
			this.highlightHotspot(aspid, aspname);
		}
	},

	DelayedHsHighlightSVG: function(aspid, aspname) {
		if(this.loadingGraphic == true) {
			CVPortal.debug("[cvMedia Hotspot] Delaying hotspot.");
			timerId = window.setTimeout("CVPortal.components.cvMedia.DelayedHsHighlightSVG('" + aspid + "', '" + aspname + "', true)", 500);
		} else {
			//alert("hitting it!");
			this.highlightHotspotSVG(aspid, aspname);
		}
	},

	highlightHotspotSVG: function(apsid, apsname, delay) {
		var mH = this;
		this.showMediaPanel();
		CVPortal.debug(" {cvMedia} A hotspot with id " + apsid + " and name " + apsname + " has been activated.");
		if(delay == true) {
			this.DelayedHsHighlightSVG(apsid, apsname);
		} else {
			$("svg", this.graphic_content).each(function() {
				// Larson CGM to Vector converter SVG support
				$("g[apsname='" + apsname +"']", this).each(function() {
					mH.lightHotspotSVG(this);
				});
				// SDI ConvertPro converter SVG support
				if (CVPortal.getBrowserType() == "IE" || CVPortal.getBrowserType() == "IE11") {
					$("g", this).each(function() {
						for (var i = 0; i < this.attributes.length; i++) {
							var attName = this.attributes[i];
							if (attName.name.indexOf("webcgm:name")) {
								if (attName.value == apsname) {
									mH.lightHotspotSVG(this);
								}
							}
						}
					});
					$("text", this).each(function() {
						mH.resetTextHotspot(this);
					});
					$("text", this).each(function() {
						for (var i = 0; i < this.attributes.length; i++) {
							var attr = this.attributes[i];
							var attrName = ('' + attr.name);
							if (attrName.indexOf("webcgm:name") > -1) {
								var attrVal = ('' + attr.value);
								if (attrVal === apsname) {
									mH.lightTextHotspotSVG(this);
								}
							}
						}
					});
				} else {
					$("g[webcgm\\:name=" + apsname +"]", this).each(function() {
						mH.lightHotspotSVG(this);
					});
					$("text[webcgm\\:name]", this).each(function() {
						mH.resetTextHotspot(this);
					});
					$("text[webcgm\\:name=" + apsname +"]", this).each(function() {
						mH.lightTextHotspotSVG(this);
					});
				}
			});
		}
	},
	
	resetTextHotspot: function(element) {
		var newClassVal = '';
		var oldClassVal = '';
		for (var i = 0; i < element.attributes.length; i++) {
			var attr = element.attributes[i];
			var attrName = ('' + attr.name);
			if (attrName === 'class') {
				oldClassVal = ('' + attr.value);
				// Remove class 'hotspothighlight'
				if (oldClassVal.indexOf("hotspothighlight")) {
					var classes = oldClassVal.split(" ");
					for (var a = 0; a < classes.length; a++) {
						var classnm = ('' + classes[a]);
						if (classnm === 'hotspothighlight') {
						} else {
							newClassVal = (newClassVal + ' ' + classnm);
						}
					}
					newClassVal = newClassVal.trim();
				}
			}
		}
		element.setAttribute('class', newClassVal);
	},

	lightTextHotspotSVG: function(element) {
		var mH = this;
		var oldClass = "";
		if (element.hasOwnProperty("class")) {
			oldClass =+ this.getAttribute("class") + " "; 
		}
		var newClass = oldClass + "hotspothighlight";
		element.setAttribute("class", newClass);
	},

	lightHotspotSVG: function(element) {
		var mH = this;
		$(element).children().each( function() {
			var subElem = this;
			var oldClass = "";
			if (this.hasOwnProperty("class")) {
				oldClass =+ this.getAttribute("class") + " "; 
			}
			var newClass = oldClass + "hotspot";
			this.setAttribute("class", newClass);
			setTimeout(function () {
				subElem.setAttribute("class", oldClass);
			}, mH.getProp("SVGHotspotDisplayTime"));
			mH.lightHotspotSVG(subElem);
		});
	},

	highlightAllHotspotSVG: function () {
		var hotspotsLink = $("svg a", this.graphic_content),
		    hotspotsList = [];

		if ($('svg[xmlns\\:webcgm]')) {
			hotspotsLink.find('g').each(function () {
				for (var i = 0; i < this.attributes.length; i++) {
					var attName = this.attributes[i];
					if (attName.name.indexOf("webcgm:name")) {
						hotspotsList.push(this);
					}
				}
			});
			hotspotsLink.find('text').each(function () { // LAM
				for (var i = 0; i < this.attributes.length; i++) {
					var attName = this.attributes[i];
					if (attName.name.indexOf("webcgm:name")) {
						hotspotsList.push(this);
					}
				}
			});
		} else {
			hotspotsList = hotspotsLink.find('g[apsname]')
		}

		this.lightHotspotSVG(hotspotsList);	
	},

	hotspotClickedSVG: function(apsname) {
		if(this.getProp("tearOff") == 1) { 
			if(CVPortal.components.cvMedia.tearOffDocId == openingWindow.CVPortal.components.cvDocHandler.current.docId) {
				openingWindow.CVPortal.components.cvMedia.hotspotClickedSVG(apsname);
			}
			return;
		}		
		var media=this;
		var highlightDone = false;
		// use our ICN to find the element in the Document:
		var targetId = CVPortal.components.cvDocHandler.id;
		$("#" + this.currentFilename, CVPortal.components.cvDocHandler.docPanel.getElement(targetId)).each(function() {
			if (highlightDone == false){
				var xref;
				var target = null;				
				var type = $(this).attr("doctype");
				var found = 0;
				var strName = null;
				$("hotspot").each(function() {
					if(apsname == this.getAttribute("apsname") && found != 1) {
						type = this.getAttribute("xidtype");
						xref = this.getAttribute("xrefid");
						target = this.getAttribute("xref_target");						
						strname = this.getAttribute("apsname");
						apsid = this.getAttribute("apsid");
						found = 1;
					}
				});
				CVPortal.debug(" {cvMedia} [SVG] Hotspot clicked, determined APSID: " + apsid + ", APSNAME: -" + strName + "-, xidtype: " + type + ", xrefid: " + xref + " found... " + found  + " in DM TYPE: " + type);
				// follow the XREF through:


				if(type == "csn") {
					CVPortal.debug(" {cvMedia} [SVG] IPC Hotspot clicked, CSN REF: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(xref, "csn");
				} else if(type == "part" || type == "ipc") {					
					CVPortal.debug(" {cvMedia} [SVG] IPC Hotspot clicked, part number: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(strName, "item");
				} else {
					highlightDone = true;
					if ((xref != undefined) && (xref != undefined)){
						media.highlightHotspotSVG(strName, strName, true);
					}
					CVPortal.components.cvDocHandler.handle_xref(xref, type, null, null, target);
				}
			}
		});
	},
	
	addSVGControls: function(target) {
		//if a specific SVG target was passed in, use that. otherwise, detect and use first available SVG
		var svgElement;
		if (target) {
			svgElement = target;
		}
		else if (document.getElementsByClassName("svgimage")[0]) {
			svgElement = document.getElementsByClassName("svgimage")[0].firstChild;
		}
		else {
			console.warn("no SVG element found!");
		}
		
		var eventsHandler;
        eventsHandler = {
			haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
			, init: function(options) {
				var instance = options.instance
					, initialScale = 1
					, pannedX = 0
					, pannedY = 0

				// Init Hammer
				// Listen only for pointer and touch events
				this.hammer = Hammer(options.svgElement, {
					//inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
				})

				// Enable pinch
				this.hammer.get('pinch').set({enable: true})

				// Handle pan
				this.hammer.on('panstart panmove', function(ev){
					// On pan start reset panned variables
					if (CVPortal.components.cvMedia.svgLibrary.isPanEnabled()) { // we disable pan for SVG redlining  
					if (ev.type === 'panstart') {
						pannedX = 0
						pannedY = 0
					}

					// Pan only the difference
					instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
					pannedX = ev.deltaX
					pannedY = ev.deltaY
					}
				})

				// Handle pinch
				this.hammer.on('pinchstart pinchmove', function(ev){
					// On pinch start remember initial zoom
					if (ev.type === 'pinchstart') {
						initialScale = instance.getZoom()
						instance.zoom(initialScale * ev.scale)
					}

					instance.zoom(initialScale * ev.scale)

				})

				// Prevent moving the page on some devices when panning over SVG
				options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
			  }

			, destroy: function(){
				this.hammer.destroy()
			}
        }
		
		//LCS-3695: iPad: Click on hotspot does not navigate to the reference inside the content
		var preventDefaultEvents = true;
		if (CVPortal.getIsTablet() == true) {
			//normally, the library prevents default event behaviors on the SVG to ensure that the only things happening in response to mouse/touch movements are library functions...
			//...but on the iPad, this also disables hotspot links! so we turn that off on tablets
			preventDefaultEvents = false;
			svgElement.parentNode.ontouchmove = function(e) {e.stopPropagation();};
		}
		
		//using the SVG-Pan-Zoom library, see https://github.com/ariutta/svg-pan-zoom for doc
		if ($("#graphic_content").is(":visible")) {
			this.svgLibrary = svgPanZoom(svgElement, {
					panEnabled: true,
					dblClickZoomEnabled: false
					, mouseWheelZoomEnabled: true
					,preventMouseEventsDefault: preventDefaultEvents
					, customEventsHandler: eventsHandler
				});	
			CVPortal.controlFactory().updateCondition("svgControls","true");
			CVPortal.controlFactory().updateCondition("displayRedliningIcons","false");
		}
	},

	panSVG: function(direction) {
		var coordinates;
		switch (direction) {
			case "left":
				coordinates = {x: -50, y: 0};
				break;
			case "right":
				coordinates = {x: 50, y: 0};
				break;
			case "up":
				coordinates = {x: 0, y: -50};
				break;
			case "down":
				coordinates = {x: 0, y: 50};
				break;
			default:
				coordinates = {x: 0, y: 0};
				console.error("invalid SVG pan direction");
				break;
		}
		CVPortal.components.cvMedia.svgLibrary.panBy(coordinates);
	},

	createCgmCanvas: function() {
		if (document.getElementById('canvas3')) {
			console.log("CGM viewer already loaded, using existing viewer")
			return;
		}
		var width = $(this.graphic_content).width();
		var height = $(this.graphic_content).height();
		var canvasString = "";
		//add the link template for downloading exported SVG
		canvasString += '<a id="download_link" style="display:none" download="reddline.svg" href="">export</a>';
		//add the form template used for entering annotations
		canvasString += '<form action="javascript:void(0);" id="sdiAnnotationPopup" style="position: fixed; display: none; margin-top:200px; z-index:4">' +
		'<textarea id="sdiNoteForm" data_input="true"></textarea>' +
		'<button type="button" value="Save" id="saveAnnotation" onclick="saveTextBox()">Save</button>' +
		'<button type="button" value="Cancel" id="cancelAnnotation" onclick="hideTextBox()">Cancel</button></form>';

		//add three canvas layers to use for displaying the main CGM
		canvasString += '<div style="position:absolute">';
		for (var i = 1; i < 4; i++) {
			canvasString += '<canvas class="cgm" ';
			//canvasString += 'width="' + width + '" height="' + height + '" ';
			canvasString += 'id="canvas' + i + '" tabindex=' + i + ' ';
			canvasString += 'style="position:absolute;background:transparent;left:0;right:0;margin:auto;"></canvas>';
		}
		canvasString+='</div>';
		$(this.graphic_content).html(canvasString);
		initapp(width, height);
		setpanmode();
	},
	
	loadCgmGraphic: function(cgmUrl) {
		openCGMfile(cgmUrl);
		CVPortal.controlFactory().updateCondition("cgmControls","true");
		CVPortal.controlFactory().updateCondition("displayCgmRedliningIcons","false");

		CVPortal.components.cvResourceManager.newResource("genericforms-RedlineSvgImages", "RedlineSvgImages");

		var addRedlining = CVPortal.components.cvResourceManager.getRedliningSvg(this.currentGraphic.getAttribute("TITLE"));
		
		if(addRedlining !== undefined) {
			addRedlining = addRedlining.getElementsByTagName('form-data')[0].textContent;
			sdiLoadRedLine(addRedlining);
		}

		this.loadingGraphic = false;
	},
	
	cgmZoom: function(type) {
		switch (type) {
			case "in":
				setzoomin();
				break;
			case "out":
				setzoomout();
				break;
			case "reset":
				setfit();
				break;
			default:
				break;
		}

		//LCS-9408: SDI code resets the drag mode, turning off drag-to-pan, so we need to catch that and turn pan back on
		if (!this.isRedliningActive) {
			this.cgmRemoveHighlights();
			startSelectionButton();
			setpanmode();
		}
	},

	cgmPan: function(type) {
		var x = 0;
		var y = 0;
		switch (type) {
			case "up":
				y = -50;
				break;
			case "down":
				y = 50;
				break;
			case "left":
				x = -50;
				break;
			case "right":
				x = 50;
				break;
			default:
				break;
		}

		//pt = c.ctx.transformedPoint(x, y);
		var vpt = c.fcanvas.viewportTransform;
		vpt[4] += x;
		vpt[5] += y;
		c.fcanvas.requestRenderAll();
		 
		var dx = x;
		var dy = y;

		c.w2.x += (c.vdcppx * dx * -1);
		c.w2.y += (c.vdcppy * dy);
		c.w1.x += (c.vdcppx * dx * -1);
		c.w1.y +=(c.vdcppy * dy);

		redraw();
		c.fcanvas.setViewportTransform(c.fcanvas.viewportTransform);
	},

	hotspotClickedCGM: function(apsname, apsid) {
		if(this.getProp("tearOff") == 1) { 
			if(CVPortal.components.cvMedia.tearOffDocId == openingWindow.CVPortal.components.cvDocHandler.current.docId) {
				openingWindow.CVPortal.components.cvMedia.hotspotClickedCGM(apsname, apsid);
			}
			return;
		}		
		var media=this;
		var highlightDone = false;
		// use our ICN to find the element in the Document:
		var targetId = CVPortal.components.cvDocHandler.id;
		$("#" + this.currentFilename, CVPortal.components.cvDocHandler.docPanel.getElement(targetId)).each(function() {
			if (highlightDone == false){
				var xref;
				var target = null;				
				var type = $(this).attr("doctype");
				var found = 0;
				var strName = null;
				$("hotspot").each(function() {
					if(apsname == this.getAttribute("apsname") && found != 1) {
						type = this.getAttribute("xidtype");
						xref = this.getAttribute("xrefid");
						target = this.getAttribute("xref_target");						
						strname = this.getAttribute("apsname");
						apsid = this.getAttribute("apsid");
						found = 1;
					}
				});
				CVPortal.debug(" {cvMedia} [CGM] Hotspot clicked, determined APSID: " + apsid + ", APSNAME: -" + strName + "-, xidtype: " + type + ", xrefid: " + xref + " found... " + found  + " in DM TYPE: " + type);
				// follow the XREF through:


				if(type == "csn") {
					CVPortal.debug(" {cvMedia} [CGM] IPC Hotspot clicked, CSN REF: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(xref, "csn");
				} else if(type == "part" || type == "ipc") {					
					CVPortal.debug(" {cvMedia} [CGM] IPC Hotspot clicked, part number: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(strName, "item");
				} else {
					highlightDone = true;
					if ((xref != undefined) && (xref != undefined)){
						//media.highlightHotspotSVG(strName, strName, true);
						media.cgmHighlightHotspot(apsid);
					}
					CVPortal.components.cvDocHandler.handle_xref(xref, type, null, null, target);
				}
			}
		});
	},
	
	cgmHighlightHotspot: function(id) {
		highlightID(id);
		setTimeout(this.cgmRemoveHighlights, 1000);
	},

	cgmHighlightHotspotsAll: function() {
		this.cgmHighlightHotspot(0);
	},

	cgmRemoveHighlights: function() {
		clearlinks();
	},

	cgmRedliningMode: function(type) {
		switch (type) {
			case "pencil":
				startDrawing('FreeFormLine');
				break;
			case "line":
				startDrawing('FreeFormLine2');
				break;
			case "rect":
				startDrawing('Rectangle');
				break;
			case "circle":
				startDrawing('Circle');
				break;
			default:
				startSelection();
				break;
		}
	},

	cgmRedliningText: function() {
		startDrawing('Text');
	},

	cgmRedliningDelete: function() {
		deleteObject();
	},

	cgmExport: function() {
		saveRedline();
	},
	
	cgmSaveRedlining: function() {
		redliningJson = sdiSaveRedLine();

		CVPortal.components.cvResourceManager.newResource("genericforms-RedlineSvgImages", "RedlineSvgImages");
		this.savedImage = "<form-data>" + redliningJson + "</form-data>";
		this.savedImageTitle = this.currentGraphic.getAttribute("TITLE")
		CVPortal.components.cvResourceManager.saveForm();
	},
	
	cgmRedliningIconsDisplay: function() {

		if (this.isRedliningActive === true) {
			this.isRedliningActive = false;
			CVPortal.controlFactory().updateCondition("displayCgmRedliningIcons", "false");

			if (document.getElementById("sdiAnnotationPopup")) {
				saveTextBox();
			}
			this.cgmRemoveHighlights();
			startSelectionButton();
			setpanmode();

			if (CVPortal.getIsTablet()) {
				CVPortal.controlFactory().updateCondition("cgmRedliningActive", "false");
			}

		} else {
			this.isRedliningActive = true;
			CVPortal.controlFactory().updateCondition("displayCgmRedliningIcons", "true");

			if (CVPortal.getIsTablet()) {
				CVPortal.controlFactory().updateCondition("cgmRedliningActive", "true");
			}
			startSelection();
		}
	},

	setCgmCanvasSize: function() {
		//no need to support CGM front matter, so graphicPanel will always be graphic_content
		var graphicPanel = document.getElementById("graphic_content");

		//hiding the graphics panel sets its height or width to 0, which messes up our aspect calculations, and we don't need to resize a non-visible canvas anyway
		if (graphicPanel.clientWidth <= 1 || graphicPanel.clientHeight <= 1) {
			return;
		} else if (!document.getElementById('canvas3')) {
			return;
		} else {
			sdiSetCanvasSize(graphicPanel.clientWidth, graphicPanel.clientHeight);
		}
	},
	
	setCanvasSize: function() {
		if (this.fileExt == "cgm") {
			this.setCgmCanvasSize();
			return;
		} else if (this.canvasFunctions == undefined || !(this.fileExt == "htm" || this.fileExt == "html" || this.fileExt == "vds")) return;
		//resizing canvas images via CSS percentages requires that we only size them by height OR width, not both - otherwise, the aspect ratio of the image is lost
		//this function handles that by determining which direction the sizing should be applied to
		var canvasElement = document.getElementsByTagName("canvas")[0];
		var graphicPanel;
		if (CVPortal.components.cvDocHandler) {
			if (CVPortal.components.cvDocHandler.inHome == true) {
				graphicPanel = document.getElementById("contentPanel");	
			} else graphicPanel = document.getElementById("graphic_content");
		} else graphicPanel = document.getElementById("graphic_content");
		
		if (canvasElement == null || graphicPanel == null) return;

		var canvasAspect = canvasElement.clientWidth / canvasElement.clientHeight;
		var graphicAspect = graphicPanel.clientWidth / graphicPanel.clientHeight;
		
		//hiding the graphics panel sets its height or width to 0, which messes up our aspect calculations, and we don't need to resize a non-visible canvas anyway
		if (!canvasAspect || !graphicAspect || canvasAspect == Infinity) return;
		
		var aspectRatio;
		if (this.rhiCanvasPresent()) 
			aspectRatio = false;
		else
			aspectRatio = true;
		
		if (aspectRatio == true) {
		canvasElement.style.width = "";
			canvasElement.style.height = "";
		var result;
		//console.log("graphicAspect: %s | canvasAspect: %s", graphicAspect, canvasAspect);

		//to determine sizing, compare the graphics panel aspect ratio to the canvas image aspect ratio
		if (graphicAspect <= canvasAspect || graphicAspect == canvasAspect) {
			result = "width";
		}
		else if (graphicAspect >= canvasAspect) {
			result = "height";
		}
		else {
			console.log("setCanvasSize condition not covered");
			result = "width";
		}

		if (result == "width") {
			if (graphicPanel.id == "contentPanel") canvasElement.style.width = graphicPanel.style.width;
			else canvasElement.style.width = "100%";
		}
		else if (result == "height") {
			if (graphicPanel.id == "contentPanel") canvasElement.style.height = graphicPanel.style.height;
			else canvasElement.style.height = "100%";
		}
		//else console.log("INVALID RESULT: %s", result);
		}
		else if (aspectRatio == false) {
			canvasElement.style.width = "100%";
			canvasElement.style.height = "100%";
		}
		else console.error("aspectRatio was neither true nor false");
		
		//when a WebGL canvas has a different CSS size from its element size, then it throws off the canvas' internal coordinate system and causes clicks to land on the wrong place
		//so we need to resize the canvas element to match its CSS size, and we also need to provide that updated size to the SAP renderer function
		//this is a WebGL problem, not a SAP-specific problem, so there's a possibility of this occuring in other interactive 3D canvas stuff too
		if (this.rhiCanvasPresent()) {
			var oDvl = this.oDvl;
			sapCanvas.width = sapCanvas.clientWidth;sapCanvas.height = sapCanvas.clientHeight;
			oDvl.Renderer.SetDimensions(sapCanvas.width, sapCanvas.height);
			//and it doesn't work quite right the first time (I'm guessing it's due to subpixel rendering), so we do it a second time, which works perfectly
			sapCanvas.width = sapCanvas.clientWidth;sapCanvas.height = sapCanvas.clientHeight;
			oDvl.Renderer.SetDimensions(sapCanvas.width, sapCanvas.height);
			
			//LCS-5623: SAP's Loco gesture library saves the size/position of the target element and doesn't expect it to be resized, so we have to manually update its values
			if (sap.ve.Loco) {
				var that = this.track;
				var target = sapCanvas;
				that.targetPosition.minX = that._getOffset(target).left;
				that.targetPosition.minY = that._getOffset(target).top;
				that.targetPosition.maxX = that.targetPosition.minX + that._getDimensions(target).width;
				that.targetPosition.maxY = that.targetPosition.minY + that._getDimensions(target).height;
			}
		}
	},

	disableSvgEraseBtn: function () {
		if (document.querySelectorAll(".redlining-elem").length || document.querySelectorAll(".redlining-annotation").length) {
			CVPortal.controlFactory().updateCondition("disabledRedliningErase", "false");
		} else {
			CVPortal.controlFactory().updateCondition("disabledRedliningErase", "true");
		}
	},

	redliningSvg: function (elem) {
		var media = this,
			groupEl,
			shapes = [],
			index = 0,
			shape,
			draw = media.svgEl;

		if (document.getElementById("redliningGroup")) {
			groupEl = SVG.get("#redliningGroup");
		} else {
			var wrapper = document.querySelector(".svg-pan-zoom_viewport") ? draw.select(".svg-pan-zoom_viewport").first() : draw; // check if svg use svg-pan-zoom plagin
			groupEl = wrapper.group().attr("id", "redliningGroup");
		}

		$(document.getElementsByClassName("svgimage")).off("click"); // remove redlining annotation event from svg
		$(".redlining-elem").off("click"); // remove highlight pn click event
		media.drawElem.off("panstart panmove panend");
		if (media.moveElem) {
			media.moveElem.off("panstart panmove panend"); // remove moving elem event
		}


		media.redliningSvgRemoveHighlighting();  // remove highlight styles event

		var getDrawObject = function () {
			shape = elem;
			var option = {
				"class": "redlining-elem"
			};

			switch (shape) {
				case "pencil":
					return groupEl.polyline().attr(option);
				case "circle":
					return groupEl.circle().attr(option);
				case "rect":
					return groupEl.rect().attr(option);
				case "line":
					return groupEl.line().attr(option);
			}
			return null;
		}


		media.drawElem.on("panstart", function (event) {
			setpanmode();
			event.preventDefault();

			var shape = getDrawObject();

			shapes[index] = shape;
			shapes[index].draw(event);
		});


		media.drawElem.on("panmove", function (event) {
			event.preventDefault();

			if (shape === "pencil" && shapes[index]) {
				shapes[index].draw("point", event);
			}
		});


		media.drawElem.on("panend", function (event) {
			event.preventDefault();

			//library recognize tablets zoom as panend event so we need to check if el exist in array
			if(shapes[index] === undefined) {
				return null;
			}
			if (shape === "pencil") {
				shapes[index].draw("stop", event);
			} else {
				shapes[index].draw(event);
			}
			media.disableSvgEraseBtn();
			media.saveChangesSvg();
			index++;
		});
	},

	svgTextMultiline: function (i, lH, val, textColor) {
		var width = 650;
		var commentWidth;

		// get the text and add index
		var text = i + ") " + decodeURIComponent(val);

		// split the words into array
		var words = text.split(' ');
		var line = '';

		// Make a text for testing 
		var lineH = lH;
		for (var n = 0; n < words.length; n++) {
			var commentLine = line + words[n] + " ";
			var testElem = SVG.get("PROCESSING");
			//  Add line in testElement
			testElem.node.textContent = commentLine;

			// Messure textElement
			var metrics = testElem.bbox();
			commentWidth = metrics.width;

			if (commentWidth > width && n > 0) {
				lineH += 20;
				SVG.get("textGroup").plain(line).fill(textColor).x(10).dy(lineH);
				line = words[n] + ' ';
			} else {
				line = commentLine;
			}
		}

		lineH += 20;
		SVG.get("textGroup").plain(line).fill(textColor).x(10).dy(lineH);

		$("#PROCESSING").remove();
		return lineH;
	},

	redliningSvgExport: function () {
		var link = document.createElement("a"),
			media = this,
			svgImage = media.svgEl,
			imgTitle = svgImage.node.attributes.title.nodeValue,
			moveH = svgImage.height(),
			blob,
			line = 0,
			textColor,
			redliningStyles,
			redliningElemList,
			getLines;

		// remove highlight styles event
		media.redliningSvgRemoveHighlighting();  
		// Hide icons
		$(".redlining-annotation rect").hide();
		// remove images pattern as img url give xml parser error
		$("#annotationIcon, #annotationIconSelected").remove();

		// Create group for annotation
		var textWrapper = svgImage.group().translate(0, moveH).attr("id", "textGroup");

		if (document.getElementsByClassName("annotation-text").length) {
			textColor = getComputedStyle(document.getElementsByClassName("annotation-text")[0]).fill;
		}

		// Get annotations text and push them to the group
		$("#redliningGroup").find(".redlining-annotation text").each(function (index) {
			var value = this.textContent;


			textWrapper.plain("replace text").attr("id", "PROCESSING");

			var i = index + 1;
			line = getLines ? getLines : line + 20;

			getLines = media.svgTextMultiline(i, line, value, textColor);
		});
		// Set SVG height
		var commentsHeight = getLines ? getLines : 0;
		svgImage.height(moveH + commentsHeight + 10);

		if (document.querySelectorAll(".redlining-elem").length) {
				redliningStyles = getComputedStyle(document.getElementsByClassName("redlining-elem")[0]),
				redliningElemList = document.querySelectorAll(".redlining-elem");

			for (var i = 0; i < redliningElemList.length; i++) {
				redliningElemList[i].style.cssText = "fill:" + redliningStyles.fill + ";fill-opacity:" + redliningStyles.fillOpacity + ";stroke:" + redliningStyles.stroke + ";stroke-width:" + redliningStyles.strokeWidth + ";"
			}
		}

		link.style.display = "none";
		document.body.appendChild(link);
		var parser = new XMLSerializer(),
		svgString;


		if (CVPortal.getBrowserName() === "Internet Explorer") {
			var svgIE = document.getElementById("graphic_content").getElementsByTagName("svg")[0];
			// to make exported svg valid we need to remove extra attr that IE add for SVG 
			for (var x = svgIE.attributes.length - 1; x >= 0; x--) {
				var attribute = svgIE.attributes[x];
				var name = (attribute.name || attribute.nodeName);
				var value = (attribute.value || attribute.nodeValue);
				if (value == "" || name.indexOf("ns1") != -1) {
					svgIE.removeAttribute(name);
				}
			}
	
			svgString = "<div style='overflow: scroll;'>" +  parser.serializeToString(svgIE) + "</div>";

			blob = new Blob([svgString], { type: "text/xml" });
			window.navigator.msSaveOrOpenBlob(blob, imgTitle + ".svg");

		} else {
			svgString = "<div style='overflow: scroll;'>" +  parser.serializeToString(document.getElementById("graphic_content").getElementsByTagName("svg")[0]) + "</div>";
			blob = new Blob([svgString], { type: "text/xml" });
			link.href = URL.createObjectURL(blob);
			link.download = imgTitle + ".svg";
		}

		link.click();
		// remove changes that we add for export svg
		if (redliningElemList) {
			for (var i = 0; i < redliningElemList.length; i++) {
				redliningElemList[i].removeAttribute("style");
			}
		}
		svgImage.height(moveH);

		if (document.getElementById("redliningGroup")) {
			media.redliningAnnotationPatternIcon(); //add back images pattern 
		}
		$(".redlining-annotation rect").show(); 
		textWrapper.remove();
	},

	redliningAnnotationPatternIcon: function () {
		// we need to create patterns with images for relining annotation
		this.patternIcon = SVG.get("#redliningGroup").pattern(1, 1, function (add) {
			add.image(CVPortal.fetchSkinImage("redlining_annotation_32.png"), 32, 32)
		}).attr({ "patternUnits": "objectBoundingBox", "id": "annotationIcon" });

		this.patternIconSelected = SVG.get("#redliningGroup").pattern(1, 1, function (add) {
			add.image(CVPortal.fetchSkinImage("redlining_annotation_32_selected.png"), 32, 32)
		}).attr({ "patternUnits": "objectBoundingBox", "id": "annotationIconSelected" });
	},

	redliningSvgErase: function () {
		var media = this,
			svgName = document.getElementById("graphic_content").getElementsByTagName("svg")[0].getAttribute("title");

		$(".redlining-elem, .redlining-annotation, .svgimage").off("click");
		media.drawElem.off("panstart panmove panend");


		media.redliningSvgRemoveHighlighting();

		$(".redlining-elem, .redlining-annotation").on("click", function (e) {
			e.preventDefault();

			if (e.target.parentNode.className.baseVal === "redlining-annotation") {
				$(e.target).parent().remove();
			} else {
				$(e.target).remove();
			}

			if (document.getElementById("redliningGroup") && document.getElementById("redliningGroup").children || document.getElementById("redliningGroup") && document.getElementById("redliningGroup").childNodes) {
				media.saveChangesSvg();
			} else {
				CVPortal.components.cvResourceManager.newResource("genericforms-RedlineSvgImages", "RedlineSvgImages");
				CVPortal.components.cvResourceManager.deleteRedliningSvg(svgName);
			}
			media.disableSvgEraseBtn();
		});
	},


	saveChangesSvg: function () {
		if (!document.getElementById("redliningGroup")) {
			return null;
		}

		this.redliningSvgRemoveHighlighting();

		var svgElem = $("<div>").append($("svg #redliningGroup").clone()).html(); // because IE can't get html from svg 

		CVPortal.components.cvResourceManager.newResource("genericforms-RedlineSvgImages", "RedlineSvgImages");
		this.savedImage = "<form-data>" + svgElem + "</form-data>";
		this.savedImageTitle = document.getElementById("graphic_content").getElementsByTagName("svg")[0].getAttribute("title");
		CVPortal.components.cvResourceManager.saveForm();
	},

	redliningSvgMoveElem: function (elemH) {

		this.moveElem = new Hammer(elemH);

		var svgEl = document.getElementById("graphic_content").getElementsByTagName("svg")[0],
			media = this,
			elem = media.moveElem,
			selectedElement = false,
			offset,
			matrix,
			svgElCoord,
			startPoint,
			transform;

		elem.get('pan').set({ direction: Hammer.DIRECTION_ALL });
		svgElCoord = media.svgEl.node.createSVGPoint();


		function transformPoint(x, y) {
			svgElCoord.x = x - (offset.x - window.pageXOffset);
			svgElCoord.y = y - (offset.y - window.pageYOffset);

			return svgElCoord.matrixTransform(matrix);
		}

		elem.on("panstart", function (event) {
			event.preventDefault();

			if (media.svgLibrary.isPanEnabled() || !document.getElementById("highlight")) {
				elem.off("panstart panmove panend");
				return null;
			}

			selectedElement = event.target;

			// we save the current scrolling-offset here
			offset = { x: window.pageXOffset, y: window.pageYOffset };
			matrix = selectedElement.getScreenCTM().inverse();
			startPoint = transformPoint(event.center.x, event.center.y);

			var transforms = selectedElement.transform.baseVal;

			// Ensure the first transform is a translate transform
			if (transforms.numberOfItems === 0 || transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {

				// Create an transform that translates by (0, 0)
				var translate = svgEl.createSVGTransform();
				translate.setTranslate(0, 0);
				// Add the translation to the front of the transforms list
				selectedElement.transform.baseVal.insertItemBefore(translate, 0);
			}

			// Get initial translation amount
			transform = transforms.getItem(0);

			startPoint.x -= transform.matrix.e;
			startPoint.y -= transform.matrix.f;

		});

		elem.on("panmove", function (event) {
			event.preventDefault();

			if (selectedElement) {
				var coord = transformPoint(event.center.x, event.center.y)
				transform.setTranslate(coord.x - startPoint.x, coord.y - startPoint.y);
			}
		});

		elem.on("panend", function (event) {
			event.preventDefault();

			selectedElement = null;

			elem.off("panstart panmove panend");
			media.saveChangesSvg();
		});

	},

	redliningSvgRemoveHighlighting: function () {
		if (document.getElementById("highlight")) {

			if (document.getElementById("highlight").className.baseVal === "redlining-annotation") {
				document.getElementById("highlight").getElementsByTagName("rect")[0].setAttribute("fill", "url(#annotationIcon)");
			}
			document.getElementById("highlight").removeAttribute("id");
		}
	},

	redliningSelectElem: function () {
		var media = this;
		$(".redlining-elem, .redlining-annotation, .svgimage").off("click");


		$(".redlining-elem, .redlining-annotation").on("click", function () {
			media.redliningSvgRemoveHighlighting();
			if(media.moveElem) {
				media.moveElem.off("panstart panmove panend");
			}	

			this.setAttribute("id", "highlight");
			if (this.className.baseVal === "redlining-annotation") {
				this.getElementsByTagName("rect")[0].setAttribute("fill", "url(#annotationIconSelected)");
			}
			media.redliningSvgMoveElem(document.getElementById("highlight"));
		});

	},

	redliningSvgAnnotation: function () {
		var media = this,
			draw = media.svgEl,
			popupForm,
			groupEl,
			elemClick;

		media.annotationCoord = media.svgEl.node.createSVGPoint();
		media.redliningSvgRemoveHighlighting();

		// Remove other events on svg
		$(".redlining-elem, .redlining-annotation, .svgimage").off("click");
		media.drawElem.off("panstart panmove panend");

		if(document.getElementById("saveAnnotation")) {
			$("#saveAnnotation").off("click");
		}

		// Define SVG for addAnnotation function
		if (document.getElementById("redliningGroup")) {
			groupEl = SVG.get("#redliningGroup");
		} else {
			var wrapper = document.querySelector(".svg-pan-zoom_viewport") ? draw.select(".svg-pan-zoom_viewport").first() : draw; // check if svg use svg-pan-zoom plagin
			groupEl = wrapper.group().attr("id", "redliningGroup");
		}

		// create patterns with images for relining annotation
		if (!document.getElementById("annotationIcon")) {
			this.redliningAnnotationPatternIcon();
		}

		$(".svgimage").on("click", function (event) {
			event.preventDefault();
			elemClick = event.target;

			// Create popup for annotation if form not exist or show popup
			if (document.getElementById("annotationPopup")) {
				document.getElementById("saveAnnotation").setAttribute("disabled", "disabled");
				$("#saveAnnotation").off("click");
				document.getElementById("annotationPopup").style.display = "block";
			} else {
				var annotationPopup = document.createElement("form");
				var textarea = document.createElement("textarea");
				var addBtn = document.createElement("button");
				var cancelBtn = document.createElement("button");
				textarea.setAttribute("data_input","true");
				addBtn.setAttribute("type", "button");
				addBtn.setAttribute("value", "Save");
				addBtn.setAttribute("id", "saveAnnotation");
				addBtn.setAttribute("disabled", "disabled");
				addBtn.innerHTML = CVPortal.getResource("ctrl.media.save");
				cancelBtn.setAttribute("type", "button");
				cancelBtn.setAttribute("value", "Cancel");
				cancelBtn.setAttribute("id", "cancelAnnotation");
				cancelBtn.innerHTML = CVPortal.getResource("ctrl.cancel");
				annotationPopup.setAttribute("id", "annotationPopup");
				annotationPopup.appendChild(textarea);
				annotationPopup.appendChild(addBtn);
				annotationPopup.appendChild(cancelBtn);

				document.getElementById("graphic_content").appendChild(annotationPopup);
			}

			popupForm = document.getElementById("annotationPopup");

			// Save mouse click coordinates
			media.annotationCoord.x = event.clientX - window.pageXOffset;
			media.annotationCoord.y = event.clientY - window.pageYOffset;

			// Disable "Save" btn if texarea is empty
			popupForm.getElementsByTagName("textarea")[0].addEventListener("input", function () {
				if (popupForm.getElementsByTagName("textarea")[0].value !== "") {
					document.getElementById("saveAnnotation").removeAttribute("disabled", "disabled");
				} else {
					document.getElementById("saveAnnotation").setAttribute("disabled", "disabled");
				}
			})


			// Call function to create annotation on click "Save" btn
			$("#saveAnnotation").on("click", addAnnotation);

			// Hide annotation form and cleare textarea text on click "Cancel" btn
			document.getElementById("cancelAnnotation").addEventListener("click", function () {
				popupForm.getElementsByTagName("textarea")[0].value = "";
				popupForm.style.display = "none";
			});


			// Insert annotation text if click was on redlining-annotation elem
			if (elemClick.parentNode.className.baseVal === "redlining-annotation") {
				var annotationText = elemClick.nextSibling.textContent;
				popupForm.getElementsByTagName("textarea")[0].value = decodeURIComponent(annotationText);
			}
		});

		function addAnnotation(e) {
			e.preventDefault();
			var m = 0,
				coord = 0,
				text,
				wrapper;


			// edit existed annotation
			if (elemClick.parentNode.className.baseVal === "redlining-annotation") {
				elemClick.nextSibling.textContent = encodeURIComponent(popupForm.getElementsByTagName("textarea")[0].value);
				popupForm.style.display = "none";
				media.saveChangesSvg();
				return null;
			}

			wrapper = groupEl.group().addClass("redlining-annotation").size(32, 32);

			text = encodeURIComponent(popupForm.firstChild.value);

			popupForm.style.display = "none";
			popupForm.firstChild.value = "";

			m = wrapper.node.getScreenCTM().inverse();
			coord = media.annotationCoord.matrixTransform(m);

			wrapper.rect(32, 32).fill(media.patternIcon).x(coord.x).y(coord.y);
			wrapper.plain(text).addClass("annotation-text").x(coord.x).y(coord.y).hide();

			media.disableSvgEraseBtn();
			media.saveChangesSvg();
		}
	},

	svgRedliningIconsDisplay: function () {
		var svgElem,
			media = this;
			media.svgEl = SVG.adopt(document.getElementsByClassName("svgimage")[0].firstChild);

		if (this.isRedliningActive === false) {
			this.isRedliningActive = true;
			CVPortal.controlFactory().updateCondition("displayRedliningIcons", "false");
			media.drawElem.destroy();

			if (document.getElementById("redliningGroup") && document.getElementById("redliningGroup").children || document.getElementById("redliningGroup") && document.getElementById("redliningGroup").childNodes) {
				$(".redlining-elem, .redlining-annotation, .svgimage").off("click");
			}

			if (document.getElementById("annotationPopup")) {
				$("#annotationPopup").remove();
			}

			if (document.getElementById("highlight")) {
				this.redliningSvgRemoveHighlighting();
				this.saveChangesSvg();
			}

			if (media.svgLibrary) {
				media.svgLibrary.enablePan();
				media.svgLibrary.enableZoom();
			}

			if (CVPortal.getIsTablet()) {
				CVPortal.controlFactory().updateCondition("svgRedliningActive", "false");
			}

		} else {
			this.isRedliningActive = false;
			CVPortal.controlFactory().updateCondition("displayRedliningIcons", "true");

			if (media.svgLibrary) {
				media.svgLibrary.disablePan();
				media.svgLibrary.disableZoom();
			}


			if (CVPortal.getBrowserName() === "Internet Explorer" || CVPortal.getBrowserName() === "Edge") { //we need to set diff elem to make it work on IE11
				svgElem = document.getElementById("graphic_content");
			} else {
				svgElem = document.getElementsByClassName("svgimage")[0].firstChild;
			}

			media.drawElem = new Hammer(svgElem);
			media.drawElem.get('pan').set({ direction: Hammer.DIRECTION_ALL });
			media.disableSvgEraseBtn();
			media.redliningSelectElem();

			if (CVPortal.getIsTablet()) {
				CVPortal.controlFactory().updateCondition("svgRedliningActive", "true");
			}
		}

	},

	getRGB: function ( r, g, b ) {
		return ( r + g*256 + b*65536 );
	},

	//****************************
	//
	//  ISO VIEW CGM VIEWER specifc code...
	//
	//****************************
	initIsoView: function() {
		// NADA!!
	},

	IsoInitFinished: function() {
		this.currentType = "cgm";
		this.loadingGraphic = false;
	},

	IsoViewHotSpotClicked: function(nMouseBtn, lRefID, strName, strViewPortName, strViewPortFile) {
		if(this.getProp("tearOff") == 1) { 
			if(CVPortal.components.cvMedia.tearOffDocId == openingWindow.CVPortal.components.cvDocHandler.current.docId) {
				openingWindow.CVPortal.components.cvMedia.IsoViewHotSpotClicked(nMouseBtn, lRefID, strName, strViewPortName, strViewPortFile);
			}
			return;
		}		
		if(nMouseBtn == 0 && lRefID == 0 && strName == 0 && strViewPortName == 0) {
			// DO NOTHING for now...
		} else if(nMouseBtn == 0) {
			// just mousing over... ignore!
		} else if (nMouseBtn == 1) {
		var media=this;
			var highlightDone = false;
			// use our ICN to find the element in the Document:
			var targetId = CVPortal.components.cvDocHandler.id;
			$("#" + this.currentFilename, CVPortal.components.cvDocHandler.docPanel.getElement(targetId)).each(function() {
			if (highlightDone == false){
				var xref;
				var target = null;				var type = $(this).attr("doctype");

				var found = 0;
				$("hotspot", this).each(function() {
					if(strName == this.getAttribute("apsname") && found != 1) {
						// alert("Found the hotspot element to match one!");
						type = this.getAttribute("xidtype");
						xref = this.getAttribute("xrefid");
						target = this.getAttribute("xref_target");						
						found = 1;
					}
				});
				CVPortal.debug(" {cvMedia} [IsoView] Hotspot clicked, determined APSID: " + lRefID + ", APSNAME: -" + strName + "-, xidtype: " + type + ", xrefid: " + xref + " found... " + found  + " in DM TYPE: " + type);
				// follow the XREF through:


				if(type == "csn") {
					CVPortal.debug(" {cvMedia} [IsoView] IPC Hotspot clicked, CSN REF: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(xref, "csn");
				} else if(type == "part" || type == "ipc") {					
					CVPortal.debug(" {cvMedia} [IsoView] IPC Hotspot clicked, part number: " + strName);					
					CVPortal.components.cvDocHandler.showSinglePartByAttr(strName, "item");
				} else {
					highlightDone = true;
					if ((xref != undefined) && (xref != undefined)){
						media.IsoViewHighlightHotspot(strName, strName, true);
					}
					CVPortal.components.cvDocHandler.handle_xref(xref, type, null, null, target);
				}
			}
			});
		}
	},

	IsoViewHighlightHotspot: function(apsid, apsname) {
		var media = this;
		$("#IsoViewCGM", this.graphic_content).each(function() {
			this.HighlightHotspot(0, apsname, 8, media.getRGB(255, 0, 0));
		});
	},

	//****************************
	//
	//  Animation Controls specifc code...
	//
	//****************************
	playAnimation: function() {
		var media = this;
		if(this.currentType == "swf") {
			if(CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT") {
				$("embed[name='flashMovie']", this.graphic_content).each(function() {
					if(this.getAttribute("CV_isPaused") != 1) {
						this.GotoFrame(2);
					}
					this.setAttribute("CV_isPaused", 0);
					this.Play();
				});

			} else { // assume IE:
				$("#flashMovie", this.graphic_content).each(function() {
					if(this.getAttribute("CV_isPaused") != 1) {
						if(CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT") {
							this.goToFrame(2);
						} else {
							this.GoToFrame(2);
						}
					}
					this.setAttribute("CV_isPaused", 0);
					this.play();
				});
			}
			// controls:
			CVPortal.controlFactory().updateCondition("playingAnimation","true");
		} else {
			CVPortal.warn(" {cvMedia} Attempted to play a graphic type that does not support animations: " + this.currentType);
		}
	},

	pauseAnimation: function() {
		var media = this;
		if(this.currentType == "swf") {
			if(CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT") {
				$("embed[name='flashMovie']", this.graphic_content).each(function() { this.StopPlay(); this.setAttribute("CV_isPaused", 1);});
			} else { // assume IE:
				$("#flashMovie", this.graphic_content).each(function() { this.stopPlay(); this.setAttribute("CV_isPaused", 1);});
			}
			// controls:
			CVPortal.controlFactory().updateCondition("pauseAnimation","true");
		} else {
			CVPortal.warn(" {cvMedia} Attempted to pause a graphic type that does not support animations: " + this.currentType);
		}
	},

	rewindAnimation: function() {
		var media = this;
		if(this.currentType == "swf") {
			if(CVPortal.getBrowserType() == "MOZ" || CVPortal.getBrowserType() == "WEBKIT") {
				$("embed[name='flashMovie']", this.graphic_content).each(function() { this.GotoFrame(2); this.Play(); });
			} else { // assume IE:
				$("#flashMovie", this.graphic_content).each(function() { this.GoToFrame(2); this.play(); });
			}
			// controls:
			CVPortal.controlFactory().updateCondition("playingAnimation","true");
		} else {
			CVPortal.warn(" {cvMedia} Attempted to rewind a graphic type that does not support animations: " + this.currentType);
		}
	},

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// rhi specific routines:
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	getMediaType: function() {
		// get and return the media type
		//this.showMediaPanel();
		if (this.currentType == "unknown"){
			alert(CVPortal.getResource("alert.getMediaType.error"));
			return("");
		} else {
			return(this.currentType);
		}
	},
	
	rhiCreateContext: function(filePath) {
		this.canvasFunctions = ["/dvl.js", "Loco.js"];
		if (this.track) this.track.destroy();
		var devicePixelRatio = window.devicePixelRatio || 1;
		var oDvl = this.requestSapInstance();
		oDvl.CreateCoreInstance("someUniqueString");
		oDvl.Core.Init(oDvl.Core.GetMajorVersion(), oDvl.Core.GetMinorVersion());

		var canvas = document.getElementById("sapCanvas");
		var graphicPanel = document.getElementById("graphic_content");
		canvas.width = graphicPanel.clientWidth;
		canvas.height = graphicPanel.clientHeight;
		var webGLContext = oDvl.Core.CreateWebGLContext(canvas, { antialias: true, alpha: true });
		
		oDvl.Core.InitRenderer();
		oDvl.Renderer.SetDimensions(canvas.width, canvas.height);
		oDvl.Renderer.SetBackgroundColor(0.2, 0.2, 0.2, 1, 0.8, 0.8, 0.8, 1);
		
		oDvl.Renderer.SetOptionF(sap.ve.dvl.DVLRENDEROPTIONF.DVLRENDEROPTIONF_DPI, 96 * devicePixelRatio);
		oDvl.Core.StartRenderLoop();
		
		var ajax = new XMLHttpRequest();
		ajax.onload = function() {
			oDvl.Core.CreateFileFromArrayBuffer(ajax.response, filePath, "remote");
			var sceneId = oDvl.Core.LoadSceneByUrl(filePath, null, "remote");
			oDvl.Renderer.AttachScene(sceneId);
			oDvl.Scene.Release(sceneId);
			//document.getElementById("sapStatus").style.display = "none";
			CVPortal.components.cvMedia.track = new sap.ve.Loco(oDvl, canvas, false);
			//if (this.canvasFunctions) media.setCanvasSize();
			CVPortal.components.cvMedia.rhiInitFinished();
		};
		ajax.open("GET", filePath);
		ajax.responseType = "arraybuffer";
		ajax.send();
	},
	
	rhiCheckPlayAllSteps: function(){
		// part of "play all steps" - call be RH event handler at the end of a step
		// to see if the next one should be played
		// SAP plugin only
		if ((this.rhiPlayingAllSteps) && (! this.rhiIsPaused)){
			var stepNo =this.scene.CurrentStep;
			var stepCount = this.scene.steps.Count; 
			if (stepCount > stepNo+1){
				this.rhiPlayStep(stepNo+1);
			} else {
				this.rhiPlayingAllSteps = false;
			}
		}
	},
	rhiPlayAllHandler: function(params) {
		//called by an event handler attached by rhiPlayAllSteps
		//SAP canvas only
		if ((this.rhiPlayingAllSteps) && (! this.rhiIsPaused) && params.type == 2){
			var stepNo =this.rhiGetCurrStepNum();
			var stepCount = this.rhiGetStepsList().length; 
			if (stepCount > stepNo+1){
				this.rhiPlayStep(stepNo+1);
			} else {
				this.rhiEndPlayAll();
			}
		}
		if ((this.rhiPlayingAllSteps) && (! this.rhiIsPaused)){
			/*if (params.type == 2) {
				//when playing multiple steps, type is 0 when the first step starts, 1 when one step ends and the next begins, and 2 when the last step finishes
				//when playing a single step, type is 0 when the step starts and 2 when the step finishes
				this.rhiPlayingAllSteps = false;
				CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
				this.oDvl.Client.detachStepEvent(this.rhiPlayAllHandler, this);
			}*/
			}
	},
	
	rhiEndPlayAll: function() {
		//SAP canvas only
		//since there are multiple places in the logic where "Play All" might be ended, we'll point them all to here
		this.rhiPlayingAllSteps = false;
		CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
		this.oDvl.Client.detachStepEvent(this.rhiPlayAllHandler, this);
	},
	
	rhiGetCurrStepId: function() {
		//gets the step id for the current step and returns it. utility function for other RHI methods. currently only used by the new canvas-version functionality
		var results = this.oDvl.Scene.RetrieveSceneInfo(this.oDvl.Renderer.GetAttachedScenePtr(), 16);
		return results.StepId;
	},
	
	rhiGetStepsList: function() {
		//gets the array listing the steps, and returns it. utility function for other RHI methods. currently only used by the new canvas-version functionality
		if (this.rhiCanvasPresent()) {
			var info = this.oDvl.Scene.RetrieveProcedures(this.oDvl.Renderer.GetAttachedScenePtr());
			if (info.procedures.length == 1) {
			return info.procedures[0].steps;
		} else {
				var result = info.procedures[0].steps;
				for (var i = 1; i < info.procedures.length; i++) {
					result = result.concat(info.procedures[i].steps);
				}
				return result;
			}
		}
	},
	
	rhiGetCurrStepNum: function() {
		//gets the step number (not ID) for the current step. utility function for other RHI methods.
		if (this.rhiCanvasPresent()) { //SAP canvas
			var id = this.rhiGetCurrStepId();
			var list = this.rhiGetStepsList();
			var result;
			for (i = 0; i < list.length; i++) {
				if (list[i].id == id) {
					result = i;
					break;
				}
			}
			//if no step has been played yet, the stepid will be iffffffffffffffff, which will not be present in the step list, so let's default in step 0
			if (result == undefined) result = 0;
		}
		else if (this.rhiInitContext()) { //SAP plugin
			result = this.scene.CurrentStep;
		}
		return result;
	},
	
	rhiGetStepByNum: function(input) {
		var list = this.rhiGetStepsList();
		if (input < list.length) return list[input];
	},
	
	rhiGetCurrStepDesc : function(stepNo){
		// get and return the description associated with the step in RH
		if (this.rhiCanvasPresent()) {  
			//SAP Canvas
			var step = this.rhiGetStepByNum(this.rhiGetCurrStepNum());
			var desc = step.description;
			if (desc == undefined) {
				var sName = step.name;
				if (sName == undefined) {
					desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.orName.for.step") + " " + stepNo;
				} else {
					desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.for.step") + " " + sName;
				}
			}
		} else {  
			//SAP plugin
      if (this.rhiInitContext()){
        var html = "";
        if (stepNo == -1){
          //value after initial load
          stepNo = 0;
        }
        var desc = this.scene.steps.GetByIndex(stepNo).Description;
        if (desc == ""){
          var sName = this.scene.steps.GetByIndex(stepNo).Name;
          if (sName == ""){
            desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.orName.for.step") + " " + stepNo;
          } else {
            desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.for.step") + " " + sName;
          }
        }
      }
		}
		//common functionality
		if (desc != undefined) {
		html = "<p id=\"CV_YELLOW_ARROW_TEXT\"><b>" +  desc  + "</b></p>"; 
			return(html);
		}	
	},	
	
	rhiHighlightHS : function(linkName){
		// highlight a node in the RH model, based on the node name
		if (this.rhiCanvasPresent()) {
			//SAP canvas
			var scene = this.oDvl.Renderer.GetAttachedScenePtr();
			var searchResult = this.oDvl.Scene.FindNodes(scene, 0, 0, linkName);
			var nodeTarget
			if (searchResult.nodes.length) {
				nodeTarget = searchResult.nodes[0];
				//ChangeNodeFlags(sceneId, dvlId, flags, flagoperation)
				//flag 2 controls selection state
				//flagoperation 0 sets flag to true, flagoperation 1 sets it to false
				this.oDvl.Scene.ChangeNodeFlags(scene, nodeTarget, 2, 0);
			} else {
				CVPortal.debugAlert("Part named " + linkName + " not found");
			}
		}
		if (this.rhiInitContext()){
			//SAP plugin
			if (this.scene.CurrentStep > -1){
				var Step = this.scene.Steps.GetByIndex(this.scene.CurrentStep);
				var Assignments = Step.Assignments;
				var AssignmentCount = Assignments.Count;
				var selectedNode;
				if (AssignmentCount > 0){
					//alert("graphic has assignments");
					for (var iasg=0; iasg<AssignmentCount; iasg++){
						var assignment = Step.Assignments.Item(iasg);
						assignment.HighlightNodes(false);
                		var nodeCount = assignment.Nodes.Count;
						for (var inc=0; inc<nodeCount; inc++){
							var currNode = assignment.Nodes.GetByIndex(inc);  
							if (currNode.Name == linkName){
								selectedNode = currNode;
								inc=nodeCount;
								iasg=AssignmentCount;
							}               
	                	}
    	        	}
				} else {			
					//alert("NO assignments");
					selectedNode = this.scene.Nodes.GetByName(linkName);
				}
			} else {
				selectedNode = this.scene.Nodes.GetByName(linkName);
			}	
			if (this.rhiHighLightNode != undefined){
				this.rhiHighLightNode.Selected=0;
			}
			if ((this.rhiHighLightNodeID != undefined) && (this.rhiHighLightNodeID != "")){
				var oldHighlight = this.scene.nodes.GetByID(this.rhiHighLightNodeID);
				if (oldHighlight != null){
					oldHighlight.Selected=0;
				}
				this.rhiHighLightNodeID="";	
			}	
			if (selectedNode != null){
				this.rhiHighlightHSSelection = true;
				this.rhiHighLightNode=selectedNode;
				selectedNode.Selected=1;
				//zoom into selected object
				document.getElementById("rhiModel").ExecuteCommand("M1166");
			} else {
				CVPortal.debugAlert("Part named " + linkName + " not found");
			}
		}		
	},	

	rhiCheckStepInDoc: function(hotspotID) {
		var strName;
		if (this.rhiCanvasPresent()) { //SAP canvas
			strName = this.rhiGetStepByNum(hotspotID).name;
		}
		else if (this.rhiInitContext()) { //SAP plugin
		strName = this.scene.steps.GetByIndex(hotspotID).Name;
		}
		var checkDone = false;
		var stepIsInDoc = false;
		var targetId = CVPortal.components.cvDocHandler.id;
		$("#" + this.currentFilename, CVPortal.components.cvDocHandler.docPanel.getElement(targetId)).each(function() {
			if (checkDone == false){
				var found = 0;
				$("hotspot", this).each(function() {
					if(strName == this.getAttribute("apsname") && found != 1) {
						stepIsInDoc = true;
						found = 1;
					}
				});
				checkDone = true;						
			}
		});
		return(stepIsInDoc);
	},
		
	rhiHighlightHotSpotRef: function(hotspotID, IDisName) {
		// highlight the XML text associated with an RH step or node
		var Media = this;
		var docxidtype = CVPortal.components.cvDocHandler.currentXRefType;
		if (docxidtype == "graflink"){
			CVPortal.components.cvDocHandler.currentXRefType="";
			return;
		} else {
			if (IDisName){
					strName = hotspotID;
			} else { 
				//SAP canvas
				if (this.rhiCanvasPresent()) strName = this.rhiGetStepByNum(hotspotID).name;
				//SAP plugin
				else if (this.rhiInitContext()) strName = this.scene.steps.GetByIndex(hotspotID).Name;
			}
			var highlightDone = false;
			
			var targetId = CVPortal.components.cvDocHandler.id;
			$("#" + this.currentFilename, CVPortal.components.cvDocHandler.docPanel.getElement(targetId)).each(function() {
				if (highlightDone == false){
					var xref;
					var target = null;
					var type = $(this).attr("doctype");
					var found = 0;
					$("hotspot", this).each(function() {
						if(strName == this.getAttribute("apsname") && found != 1) {
							type = this.getAttribute("xidtype");
							xref = this.getAttribute("xrefid");
							target = this.getAttribute("xref_target");
							found = 1;
						}
					});
					CVPortal.debug(" {cvMedia} [RH] Hotspot clicked, determined APSID: " + ", APSNAME: -" + strName + "-, xidtype: " + type + ", xrefid: " + xref + " found... " + found  + " in DM TYPE: " + type);
					if(type == "part" || type == "ipc") {
						CVPortal.debug(" {cvMedia} [RH] IPC Hotspot clicked, part number: " + strName);
						highlightDone = true;
						if (xref == "NextStep"){
							if (this.rhiCanvasPresent()) { //SAP canvas
								if (this.rhiGetCurrStepId() != "iffffffffffffffff") {
									var stepCount = this.rhiGetStepsList.length;
									var nextStep = this.rhiGetCurrStepNum + 1;
									if (nextStep < stepCount){
										xref = this.rhiGetStepByNum(nextStep).name;
									}
								}
							} else if (this.rhiInitContext()) { //SAP plugin
							if ((Media.scene) && (Media.scene.CurrentStep > -1)){
								var stepCount = Media.scene.steps.Count;
								var nextStep = Media.scene.CurrentStep + 1;
								if (nextStep < stepCount){
									xref = Media.scene.steps.GetByIndex(nextStep).Name;
								}
							}
							}
						}
						if (xref == "NextStep"){
							CVPortal.debugAlert("Hotspot link is pointing to NextStep. Unable to find next step in graphic");
						} else  {
							CVPortal.components.cvDocHandler.handle_xref(xref, type, "" , hotspotID);
						}
					} else {
						highlightDone = true;						
						if (! CVPortal.components.cvMedia.rhiHighlightHSSelection){
							if(CVPortal.components.cvDocHandler.currentXrefSelected) {
								CVPortal.components.cvDocHandler.currentXrefSelected.style.fontWeight = "normal";
								CVPortal.components.cvDocHandler.currentXrefSelected = false;
							} else 	if(this.currentXrefSelected) {
								this.currentXrefSelected.style.fontWeight = "normal";
								this.cvDocHandler.currentXrefSelected = false;
							}
						}
						CVPortal.components.cvMedia.rhiHighlightHSSelection=false;
						if (xref != undefined){
							CVPortal.components.cvDocHandler.handle_xref(xref, type, "" , hotspotID);
							CVPortal.components.cvMedia.rhiHighLightName=strName;
						} else {
							CVPortal.info(" {cvMedia} [RH] Hotspot reference not defined for: " + strName);
							CVPortal.components.cvMedia.rhiRemoveYellowArrow();
							CVPortal.components.cvMedia.rhiHighLightName=strName;
						}
					}
				}
			});
			
		}
	},

	rhiInitContext: function(leaveYellowArrow){
		// init RH object
		if (!document.getElementById("rhiModel")) return false;
		
		this.showMediaPanel();
		var res = false;
		var scene;
		var runtime;
		var media = this;
		if (! leaveYellowArrow){
			this.rhiRemoveYellowArrow();
		}
		if ( (document.getElementById("rhiModel") != undefined) && typeof(runtime) == "undefined")
			runtime = document.getElementById("rhiModel").runtime;
		if ( (document.getElementById("rhiModel") != undefined) && typeof(scene) == "undefined")
			scene = document.getElementById("rhiModel").Scene;
		res = (typeof(runtime) != "undefined") && (typeof(scene) != "undefined");
		this.scene = scene;
		this.runtime=runtime;		
/*	
TURN OFF TOOLBARS: Available toolbar names are:	
"left_toolbar" Sets the visibility of the toolbar that docks at the left edge of the control. 
"right_toolbar" Sets the visibility of the toolbar that docks at the right edge of the control. 
"top_toolbar" Sets the visibility of the toolbar that docks at the top edge of the control. 
"bottom_toolbar" Sets the visibility of the toolbar that docks at the bottom edge of the control. 
"right_click_menu" Sets the visibility of the context menu that can be shown when the control is right clicked with the mouse. 
"HOTSPOT_TOOLTIP" Sets the visibility of the HOTSPOT_TOOLTIP which is used for showing certain status messages. Ordinary tooltips that would normally be shown when hovering over nodes are not shown when the HOTSPOT_TOOLTIP is enabled. 
*/	
		document.getElementById("rhiModel").ShowGuiElement("left_toolbar",true);
		document.getElementById("rhiModel").ShowGuiElement("bottom_toolbar",false);
		if (res)
			res = (runtime != null) && (scene != null);
		if (! res){
			alert(CVPortal.getResource("alert.rhiInitContext.error"));
		}
		return res;
	},

	rhiInitFinished: function() {
		// called by RH via cvCompatLib when model is load is complete
		cvMedia = CVPortal.components.cvMedia;
		if (this.oDvl) this.oDvl.Renderer.SetDimensions(sapCanvas.width, sapCanvas.height);
		cvMedia.loadingGraphic = false;
		if (cvMedia.rhiInitContext() || cvMedia.rhiCanvasPresent()){
			var firstStepID = cvMedia.rhiGetNextStep(-1);
			if (firstStepID == -1){
				// no steps with links to this doc module
				CVPortal.controlFactory().updateCondition("multipleRHISteps","false");
				CVPortal.controlFactory().updateCondition("RHIStepsExist","false");
				CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
			} else if (cvMedia.rhiGetNextStep(firstStepID) == -1){
				//only one step
				CVPortal.controlFactory().updateCondition("multipleRHISteps","false");
				CVPortal.controlFactory().updateCondition("RHIStepsExist","true");
				CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
			} else {
				// more than one step
				CVPortal.controlFactory().updateCondition("multipleRHISteps","true");
				CVPortal.controlFactory().updateCondition("RHIStepsExist","true");
				CVPortal.controlFactory().updateCondition("nextSAPEnable","true");
			}
	   }
	   if (CVPortal.components.cvDocHandler){
		   var doctype = CVPortal.components.cvDocHandler.current.docType;
		   var stepName = CVPortal.components.cvDocHandler.current.docId;
		   var foundStep = false;
			if (cvMedia.rhiCanvasPresent()) {
				var stepCount = cvMedia.rhiGetStepsList().length;
		   for (var idx = 0; idx <stepCount; idx ++){
					if (stepName == cvMedia.rhiGetStepByNum(idx).name){
					foundStep=true;
						var step = cvMedia.rhiGetStepByNum(idx);
						cvMedia.oDvl.Scene.ActivateStep(cvMedia.oDvl.Renderer.GetAttachedScenePtr(), step.id);
						idx=stepCount;
					}
				}
				if (! foundStep){
					stepName = cvMedia.graphicID;
					if (stepName != undefined){
						for (var idx = 0; idx <stepCount; idx ++){
							if (stepName == cvMedia.rhiGetStepByNum(idx).name){
								foundStep=true;
								var step = cvMedia.rhiGetStepByNum(idx);
								cvMedia.oDvl.Scene.ActivateStep(cvMedia.oDvl.Renderer.GetAttachedScenePtr(), step.id);
								idx=stepCount;
							}
						}
					}
					if (stepName != undefined && !foundStep && this.rhiLoadStep) {
						window.setTimeout(function() {
							var cvMedia = CVPortal.components.cvMedia;
							cvMedia.rhiPlayStep(cvMedia.rhiLoadStep);
							cvMedia.rhiLoadStep = undefined;
							debugger;
						}, 500);
					}
				}
			}
			if (cvMedia.rhiInitContext()) {
				var stepCount = cvMedia.scene.steps.Count;
				for (var idx = 0; idx <stepCount; idx ++){
					if (stepName == cvMedia.scene.steps.GetByIndex(idx).Name){
						foundStep=true;
						var step = cvMedia.scene.steps.GetByIndex(idx);
					step.play();
					idx=stepCount;
				}
			}
			if (! foundStep){
					stepName = cvMedia.graphicID;
				if (stepName != undefined){
					for (var idx = 0; idx <stepCount; idx ++){
							if (stepName == cvMedia.scene.steps.GetByIndex(idx).Name){
							foundStep=true;
								var step = cvMedia.scene.steps.GetByIndex(idx);
							step.play();
							idx=stepCount;
						}
					}
				}
			}
			}
			
			// No step with boardno as ID, so check if there's a step with the graphic ID//
			
			
			if (! foundStep){
				// CVPortal.debugAlert("Unable to open graphic at step named " + stepName);
			}
		}
	},
	
	rhiCanvasPresent: function() {
		var result = false;
		if (typeof this.oDvl != "undefined") {
			//&& this.oDvl.Renderer.GetAttachedScenePtr() != "s0000000000000000"
			if (this.oDvl.Core.GetRendererPtr() != -10) result = true;
		}
		return result;
	},
	
	rhiCanvasClear: function() {
		this.oDvl.Client.detachStepEvent(this.rhiPlayAllHandler, this);
		this.track.destroy();
		this.oDvl.Core.StopRenderLoop();
		this.oDvl.Core.DoneRenderer();
		this.oDvl.Core.Release();
	},
	
	//requestSapInstance is a rhi method
	requestSapInstance: function() {
		//to prevent multiple VE instances from being created and sucking up memory, we create one and reuse it
		//canvas files should request use of the runtime via this function
		CVPortal.controlFactory().updateCondition("showSAPControls","true");
		if (typeof oDvl == "object" || this.oDvl == "object") {
			//a runtime has already been created, so use it
			return this.oDvl;
		}
		else if (typeof sap == "undefined") {
			//no runtime exists, and the library used to create it is not accessible
			console.error("SAP Visual Enterprise Viewer Application libraries not found");
			return false;
		}
		else {
			//no runtime exists, so create one, save it to cvMedia, and return it to the canvas file that requested it
			if (sap.ve.dvl) {
				//we'll create our runtime with 64MB of memory for now, since the documentation gives no guidance as to what's appropriate and the example used a clearly absurd 128MB
				this.oDvl = sap.ve.dvl.createRuntime({ totalMemory: 64 * 1024 * 1024 });
				return this.oDvl;
			}
		}
	},
	
	rhiListAllSteps : function(){
		// routine to get names of all steps and display in pop-up window for step selection
		if (this.rhiCanvasPresent()) {
			//SAP canvas
			var list = this.rhiGetStepsList();
			var html = "";
			var stepCount = list.length;
			for (var idx = 0; idx <stepCount; idx ++){
				if (this.rhiCheckStepInDoc(idx)) {
					var desc = this.rhiGetStepByNum(idx).description;
					if (!desc){
						var sName = this.rhiGetStepByNum(idx).name;
						if (sName == ""){
							desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.orName.for.step") + " " + idx;
						} else {
							desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.for.step") + " " + sName;
						}
					}
					html = html + "<tr><td class=\"rhi_do_step\" " +
					"onclick=\"CVPortal.components['cvResourceManager'].rhiDoStep('" + idx +
					"')\">" +  desc  + "</td></tr>"; 
				}
			}
		}
		if (this.rhiInitContext()){
			//SAP plugin
			var stepCount = this.scene.steps.Count;
			var html = "";
			for (var idx = 0; idx <stepCount; idx ++){
				if (this.rhiCheckStepInDoc(idx)){
					var desc = this.scene.steps.GetByIndex(idx).Description;
					if (desc == ""){
						var sName = this.scene.steps.GetByIndex(idx).Name;
						if (sName == ""){
							desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.orName.for.step") + " " + idx;
						} else {
							desc = CVPortal.getResource("text.rhiGetCurrStepDesc.no.description.for.step") + " " + sName;
						}
					}	
					html = html + "<tr><td class=\"rhi_do_step\" " +
					"onclick=\"CVPortal.components['cvResourceManager'].rhiDoStep('" + idx +
					"')\">" +  desc  + "</td></tr>"; 
				}
			}
		}
		//common code
			if (html == ""){
				html = "<div><span>" + CVPortal.getResource("text.listAllSteps.no.steps.defined") + "</span></div>";
			} else {
				html = "<div class=\"rhi_content\"><table>" + html + "</table></div>";
			}
			return(html);
	},
	
	rhiOpacityOff : function(){
		// routine to turn opacity off for all nodes - currently not used because of performance
		CVPortal.controlFactory().updateCondition("RHIXRayPossible","false");
		
		if (confirm("***** WARNING *****\n" + CVPortal.getResource("confirm.wait.several.minutes"))){
			CVPortal.controlFactory().updateCondition("waitRHIShow","true");
			if (this.rhiInitContext()){
				var nodeCount = this.scene.nodes.Count;
				for (var idx = 0; idx <nodeCount; idx ++){
					this.scene.nodes.getByIndex(idx).Opacity=1;		
				}
				CVPortal.controlFactory().updateCondition("RHIXRayOn","false");
			}
			CVPortal.controlFactory().updateCondition("waitRHIShow","false");
		}
		CVPortal.controlFactory().updateCondition("RHIXRayPossible","true");
	},
	
	rhiOpacityOn : function(){
		// routine to turn opacity on for all but the selected node - currently not used - looking for alternate method
		// could be helpful to show node for IPC when node is hidden by others
		CVPortal.controlFactory().updateCondition("RHIXRayPossible","false");
		
		if (confirm("***** WARNING *****\n" + CVPortal.getResource("confirm.wait.several.minutes"))){
			CVPortal.controlFactory().updateCondition("waitRHIShow","true");
			if (this.rhiInitContext()){
				this.scene.Update();
				var nodeCount = this.scene.nodes.Count;
				for (var idx = 0; idx <nodeCount; idx ++){
					if (this.scene.nodes.getByIndex(idx).Selected){
						this.scene.nodes.getByIndex(idx).Visible=1;
						this.scene.nodes.getByIndex(idx).Opacity=1;
					} else {
						this.scene.nodes.getByIndex(idx).Opacity=0.1;
					}
				}
				CVPortal.controlFactory().updateCondition("RHIXRayOn","true");
			}
			CVPortal.controlFactory().updateCondition("waitRHIShow","false");
		} else {
			CVPortal.controlFactory().updateCondition("RHIXRayCancel","true");
		}
		CVPortal.controlFactory().updateCondition("RHIXRayPossible","true");
	},
	
	rhiPauseStep: function(){
		// routine to pause/resume "play all"
		// mostly shared code, with a few specific lines set aside for only canvas or only plugin
		if (this.rhiIsPaused){ //if paused, then resume
			//common code
				this.rhiIsPaused = false;
				CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
				CVPortal.controlFactory().updateCondition("pauseRHIPossible","true");
				this.rhiPlayingAllSteps=true;
			if (this.rhiCanvasPresent()) { //SAP canvas
				//this.oDvl.Scene.ActivateStep(this.oDvl.Renderer.GetAttachedScenePtr(), this.rhiGetCurrStepId(), false, true);
				this.oDvl.Client.attachStepEvent(this.rhiPlayAllHandler, this);
				this.rhiPlayCurrStep();
			} else if (this.rhiInitContext(true)) { //SAP plugin
				this.rhiPlayNextStep();
			}
		} else { //if not paused, then pause
			//common code
			if (this.rhiGetNextStep(this.rhiGetCurrStepNum()) != -1){
					// still more steps
					CVPortal.controlFactory().updateCondition("resumeRHIPossible","true");
				} else {
					CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
				}
				CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
				this.rhiPlayingAllSteps = false;
				this.rhiIsPaused=true;
			if (this.rhiCanvasPresent()) { //SAP canvas
				this.oDvl.Scene.PauseCurrentStep(this.oDvl.Renderer.GetAttachedScenePtr());
				this.oDvl.Client.detachStepEvent(this.rhiPlayAllHandler, this);
			}
			//no elseif needed here for SAP plugin - the event handlers will catch the changed variables and stop playing
		}
	},
	
	rhiPlayAllSteps: function(){
		// "play all" steps - uses event handler to detect end of step and determine if next should be played
			this.rhiPlayingAllSteps = true;
			this.rhiIsPaused = false;
			CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
			CVPortal.controlFactory().updateCondition("pauseRHIPossible","true");
		if (this.rhiCanvasPresent()) {
			//SAP canvas
			var stepList = this.rhiGetStepsList();
			
			//API reference: attachStepEvent(callback, context)
			this.oDvl.Client.attachStepEvent(this.rhiPlayAllHandler, this);
			
			//this.oDvl.Scene.ActivateStep(this.oDvl.Renderer.GetAttachedScenePtr(), stepList[0].id, true, true);
			//even though ActivateStep lets us play all steps in one call, we can't do that because LCS Play All only plays the steps with doc hotspots
			this.rhiPlayStep(0);
		}
		if (this.rhiInitContext() ){
			//SAP plugin
	        if (this.rhiStepEventHandlerSet != true){
				var stepEventHandler = document.getElementById("rhiModel").Creator.StepEventHandler.create();
				stepEventHandler.onEvent = CVPortal.components.cvMedia.rhiStepEvent;
				this.runtime.AddEventHandler(stepEventHandler);
				this.rhiStepEventHandlerSet=true;
			}
			this.rhiPlayStep(0);
		}
	},
	
	rhiPlayCurrStep : function(){
		// play current step
		//the same code is used for both SAP canvas and SAP plugin, with utility functions like GetCurrStepNum handling the differences
			var stepNo = this.rhiGetCurrStepNum();
			if (stepNo == -1){
				stepNo = 0;
			}
			if (! this.rhiCheckStepInDoc(stepNo)) {
				stepNo = this.rhiGetNextStep(stepNo);
			}
			this.rhiPlayStep(stepNo);
	},
	
	rhiPlayLastStep : function(){
		// play the last step in the sequence - used during testing - otherwise limited use
		var stepCount;
		//SAP canvas
		if (this.rhiCanvasPresent()) stepCount = this.rhiGetStepsList().length;
		//SAP plugin
		else if (this.rhiInitContext()) stepCount = this.scene.steps.Count;
		//common code
			this.rhiPlayStep(stepCount - 1);
	},
	
	rhiPlayNextStep : function(){
		// play the next step
		//the same code is used for both SAP canvas and SAP plugin, with utility functions like GetCurrStepNum handling the differences
		if (this.rhiInitContext() || this.rhiCanvasPresent()){
			var stepNo = this.rhiGetCurrStepNum() + 1;
			if (! this.rhiCheckStepInDoc(stepNo)) {
				stepNo = this.rhiGetNextStep(stepNo);
			}
			this.rhiPlayStep(stepNo);
		}
	},
	
	rhiPlayPrevStep : function(){
		// play the previous step
		//the same code is used for both SAP canvas and SAP plugin, with utility functions like GetCurrStepNum handling the differences
			var stepNo = this.rhiGetCurrStepNum() - 1;
			if (! this.rhiCheckStepInDoc(stepNo)) {
				stepNo = this.rhiGetPrevStep(stepNo);
			}
			this.rhiPlayStep(stepNo);
	},
	
	rhiPlayStep: function(idx){
		// play the step defined by idx
		// wait for graphic to finish loading
		if(this.loadingGraphic == true && !this.rhiCanvasPresent()) {
			CVPortal.debug("[cvMedia Hotspot] Delaying hotspot.");
			//timerId = window.setTimeout("CVPortal.components.cvMedia.rhiPlayStep('" + idx + "')", 500);
			this.rhiLoadStep = idx;
		} else {
			if (this.rhiCanvasPresent()) {
				//SAP canvas
				if (! this.rhiPlayingAllSteps || idx == this.rhiGetStepsList().length - 1) {
					CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
					CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
				}
				if (0 <= idx && this.rhiGetStepsList().length > idx){
					if (! this.rhiCheckStepInDoc(idx)){
						//alert("step " + idx + " not in doc");
						if ((this.rhiPlayingAllSteps) && (! this.rhiIsPaused)){
							idx++;
							if (this.rhiGetStepsList().length > idx){
								this.rhiPlayStep(idx);
							} else {
								this.rhiEndPlayAll();
							}
							}
					} 
					else {
						this.rhiRemoveYellowArrow();
						var step = this.rhiGetStepByNum(idx);
						this.rhiHighlightHotSpotRef(idx);
						//API reference: ActivateStep(sceneId, dvlId, fromTheBeginning, continueToTheNext, stepTime)
						this.oDvl.Scene.ActivateStep(this.oDvl.Renderer.GetAttachedScenePtr(), step.id, false, false);	
						if (idx == 0){
							CVPortal.controlFactory().updateCondition("prevSAPEnable","false");
							CVPortal.controlFactory().updateCondition("nextSAPEnable","true");
						} else if (idx == this.rhiGetStepsList().length -1) {
							CVPortal.controlFactory().updateCondition("prevSAPEnable","true");
							CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
						} else {
							if (this.rhiGetNextStep(idx)>-1){
								CVPortal.controlFactory().updateCondition("nextSAPEnable","true");
							} else {
								CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
							}
							if (this.rhiGetPrevStep(idx)>-1){
								CVPortal.controlFactory().updateCondition("prevSAPEnable","true");
							} else {
								CVPortal.controlFactory().updateCondition("prevSAPEnable","false");
							}
						}
					}
				} 
				else {
					CVPortal.debugAlert("Step " + idx + " not found in graphic");
				}
			}
			if (this.rhiInitContext(true)){
				if ((! this.rhiPlayingAllSteps) || (idx == this.scene.steps.Count -1)) {
					CVPortal.controlFactory().updateCondition("resumeRHIPossible","false");
					CVPortal.controlFactory().updateCondition("pauseRHIPossible","false");
				}			
				if (0 <= idx && this.scene.steps.Count > idx){
					if (! this.rhiCheckStepInDoc(idx)){
						//alert("step " + idx + " not in doc");
						if ((this.rhiPlayingAllSteps) && (! this.rhiIsPaused)){
							idx++;
							if (this.scene.steps.Count > idx){
								this.rhiPlayStep(idx);
							} else {
								this.rhiPlayingAllSteps = false;
							}
						}
					} else {
						this.rhiRemoveYellowArrow();
						var step = this.scene.steps.GetByIndex(idx);
						this.rhiHighlightHotSpotRef(idx);
						step.play();	
						if (idx == 0){
							CVPortal.controlFactory().updateCondition("prevSAPEnable","false");
							CVPortal.controlFactory().updateCondition("nextSAPEnable","true");
						} else if (idx == this.scene.steps.Count -1) {
							CVPortal.controlFactory().updateCondition("prevSAPEnable","true");
							CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
						} else {
							if (this.rhiGetNextStep(idx)>-1){
								CVPortal.controlFactory().updateCondition("nextSAPEnable","true");
							} else {
								CVPortal.controlFactory().updateCondition("nextSAPEnable","false");
							}
							if (this.rhiGetPrevStep(idx)>-1){
								CVPortal.controlFactory().updateCondition("prevSAPEnable","true");
							} else {
								CVPortal.controlFactory().updateCondition("prevSAPEnable","false");
							}
						}
					}
				} else {
					CVPortal.debugAlert("Step " + idx + " not found in graphic");
				}
			}
		}
	},
	
	rhiGetNextStep: function(currentID){
		var stepCount;
		//SAP Canvas
		if (this.rhiCanvasPresent()) stepCount = this.rhiGetStepsList().length;
		//SAP plugin
		else if (this.rhiInitContext()) stepCount = this.scene.steps.Count;
		//common code
		var nextStepNo = -1;
		for (var idx = (currentID * 1) + 1; idx <stepCount; idx++){
			if (this.rhiCheckStepInDoc(idx)){
				nextStepNo = idx;
				idx = stepCount;
			}
		}
		return(nextStepNo);
	},
	
	rhiGetPrevStep: function(currentID){
		//the same code is used for both SAP canvas and SAP plugin. no code appears to need changing
		var prevStepNo;
		prevStepNo = -1;
		for (var idx = currentID-1 ; idx>-1 ; idx--){
			if (this.rhiCheckStepInDoc(idx)){
				prevStepNo = idx;
				idx = -1;
			}
		}
		return(prevStepNo);
	},
	
	
	rhiPlayStepByName: function(stepName){
		// play the step named stepName
		var stepCount;
			var foundStep = false;

		if (this.rhiCanvasPresent()) {
			stepCount = this.rhiGetStepsList().length;
			for (var idx = 0; idx <stepCount; idx ++){
				if (stepName == this.rhiGetStepByNum(idx).name){
					foundStep=true;
					this.rhiPlayStep(idx);
					idx=stepCount;
				}
			}
		}
		if (this.rhiInitContext()){
			stepCount = this.scene.steps.Count;
			for (var idx = 0; idx <stepCount; idx ++){
				if (stepName == this.scene.steps.GetByIndex(idx).Name){
					foundStep=true;
					this.rhiPlayStep(idx);
					idx=stepCount;
				}
			}
		}

			if (! foundStep){
				//CVPortal.debugAlert("Unable to find step named " + stepName);
		}
	},
		
	rhiRemoveYellowArrow: function(){
		// remove the yellow arrow in the XML that points to the text associated with node/step
		if (CVPortal.components.cvDocHandler.yellowArrow){
			$(CVPortal.components.cvDocHandler.yellowArrow).remove();
			CVPortal.components.cvDocHandler.yellowArrowTarget = null;
		}
	},
	
	rhiStepEvent: function(evnt){
		// event triggered by end of step in RH model. Part of play all steps logic
		if (evnt.isStepFinished){
			CVPortal.components.cvMedia.rhiCheckPlayAllSteps();
		}				
	},

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Locate and Identify Image File and Type:
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	findGraphicFile: function(boardno) {
	
		var media = this;
		media.filePath = "";
		media.fileExt = "";
		var url = CVPortal.getURLwithBookParams() + "&target=main&action=imageurl&file_name=" + boardno;
		$.ajax( {
			method: "GET",
			url: url,
			async: false,
			dataType: "xml",
			success: function(xml) {
				$("status", xml).each(function() {
					if ($(this).text() == "true") {
						media.filePath = decodeURIComponent($("imageurl", xml).first().text());
						// only for legacy LCS
						var filePathArray = media.filePath.split('.');
						if (filePathArray.length > 1) {
							media.fileExt = filePathArray[filePathArray.length - 1].toLowerCase();
						} else { //NextGen
              media.fileExt = media.filePath.slice(media.filePath.lastIndexOf("/")+1, media.filePath.indexOf("?")).toLowerCase();
						}
          }
				});
			},
			error: function(xml) {
				CVPortal.debug(" {cvMedia} [findGraphicFile] Problem searching for figure: " + boardno);					
			}
		});
	},
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Multimedia Support:
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	loadMMObjectAttributes: function() {

		// Create an array of objects containing multimedia "OBJECT" tag attributes
		var mmObjectAttributes = [
				{
					"mmExtension": "mov",
					"mmCatagory": "video",
					"mmType": "video/quicktime",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "mpg",
					"mmCatagory": "video",
					"mmType": "video/mpeg",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "mpeg",
					"mmCatagory": "video",
					"mmType": "video/mpeg",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "avi",
					"mmCatagory": "video",
					"mmType": "video/x-msvideo",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "wmv",
					"mmCatagory": "video",
					"mmType": "video/x-ms-wmv",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "AutoStart",
					"fullscreen": "fullScreen",
					"controls": "controller",
					"mediapath": "FileName",
					"activex": "1"
				},
				{
					"mmExtension": "mp4",
					"mmCatagory": "video",
					"mmType": "video/mp4",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "fullscreen",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "swf",
					"mmCatagory": "flash",
					"mmType": "application/x-shockwave-flash",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "play",
					"fullscreen": "scale",
					"controls": "",
					"mediapath": "movie",
					"activex": "1"
				},
				{
					"mmExtension": "wav",
					"mmCatagory": "audio",
					"mmType": "audio/x-wav",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "mp3",
					"mmCatagory": "audio",
					"mmType": "audio/x-mpeg",
					"mmClassId": "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B",
					"mmCodebase": "http://www.apple.com/qtactivex/qtplugin.cab",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "wma",
					"mmCatagory": "audio",
					"mmType": "audio/x-ms-wma",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "AutoStart",
					"fullscreen": "fullScreen",
					"controls": "controller",
					"mediapath": "FileName",
					"activex": "1"
				},
				{
					"mmExtension": "pdf",
					"mmCatagory": "other",
					"mmType": "application/pdf",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "",
					"fullscreen": "",
					"controls": "",
					"mediapath": "src",
					"activex": "1"
				},
				{
					"mmExtension": "aac",
					"mmCatagory": "audio",
					"mmType": "audio/aac",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "webm",
					"mmCatagory": "video",
					"mmType": "video/webm",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "ogg",
					"mmCatagory": "video",
					"mmType": "video/ogg",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "ogv",
					"mmCatagory": "video",
					"mmType": "video/ogg",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				},
				{
					"mmExtension": "oga",
					"mmCatagory": "audio",
					"mmType": "audio/ogg",
					"mmClassId": "",
					"mmCodebase": "",
					"autoplay": "autoplay",
					"fullscreen": "",
					"controls": "controller",
					"mediapath": "src",
					"activex": "1",
					"native": "1"
				}
			];
		return(mmObjectAttributes);
	},

	findMMObject: function(baseURL) {

		var mmTypeCollection = this.loadMMObjectAttributes();
		return(this.getMMObject(mmTypeCollection, baseURL));
	},

	getMMObject: function(mmCollection, baseURL) {
		
		var mediaObject = this;
		var multimediaAttributes = "";

		if (mmCollection != "") {
			// Pop off current first element in array of objects. mmCollection = mmCollection - first array element

			// Create full URL for possible multimedia file
			for (var i = 0; i < mmCollection.length && multimediaAttributes == ""; ++i)
			{
				if (mediaObject.fileExt == mmCollection[i].mmExtension.toLowerCase()){
					multimediaAttributes = mmCollection[i];
				}
			}
		}
		return(multimediaAttributes);
	},

	buildMMObjectTag: function(mmAttributes, baseURL, currAttributes) {

		var mmObjectTag = "";

		if (mmAttributes != "" && mmAttributes.mmExtension != "") {
			
			var mmHeight = "100%";
			var mmWidth = "100%";
			
			this.activex = mmAttributes.activex;

			if (currAttributes.mmHeight != null && currAttributes.mmHeight != "") {
				mmHeight = currAttributes.mmHeight;
			}
			if (currAttributes.mmWidth != null && currAttributes.mmWidth != "") {
				mmWidth = currAttributes.mmWidth;
			}
			
			var media_file = baseURL;
			//the "native" flag signifies that we should use HTML5 media tags
			if (mmAttributes.native == "1") {
				mmObjectTag = "<div align=\"center\" valign=\"middle\" style='height: " + mmHeight + "; width: " + mmWidth+ "; overflow: hidden;'>";
				if (mmAttributes.mmCatagory == "video") {
					mmObjectTag += "<video src='" + this.filePath + "' height='" + mmHeight + "' width='" + mmWidth + "' controls>This media file is not supported in this browser!</video>";
				} else if (mmAttributes.mmCatagory == "audio") {
					mmObjectTag += "<audio src='" + this.filePath + "' height='" + mmHeight + "' width='" + mmWidth + "' controls>This media file is not supported in this browser!</audio>";
				}
				mmObjectTag += "</div>";
			}
			//otherwise, use the complicated old-style code to create an appropriate <object> tag
			else {
				if (( navigator.userAgent.toLowerCase().match(/trident/i)) && mmAttributes.mmClassId != "") {
					mmObjectTag = "<div align=\"center\" valign=\"middle\" ><object ";
					if (mmAttributes.mmClassId != "") {
						mmObjectTag += "classid='" + mmAttributes.mmClassId + "' ";
					}
					if (mmAttributes.mmCodebase != "") {
						mmObjectTag += "codebase='" + mmAttributes.mmCodebase + "' ";
					}
					mmObjectTag += "height='" + mmHeight + "' width='" + mmWidth + "' >";
				} else {
					if (mmAttributes.mmCodebase != "") {
						mmObjectTag = "<div align=\"center\" valign=\"middle\" style=\"width:99%;height:99%;\"><object data='" + media_file + "' type='" + mmAttributes.mmType + "' codebase='" + mmAttributes.mmCodebase + "' height='" + mmHeight + "' width='" + mmWidth + "' >";
					} else {
						mmObjectTag = "<div align=\"center\" valign=\"middle\" style=\"width:99%;height:99%;\"><object data='" + this.filePath + "' type='" + mmAttributes.mmType + "' height='" + mmHeight + "' width='" + mmWidth + "' >";
					}
				}
				if (mmAttributes.mmExtension != "pdf" && mmAttributes.mmExtension != "svg") {
					mmObjectTag += "<param name='" + mmAttributes.mediapath + "' value='" + media_file + "' />";
					if (mmAttributes.autoplay != "" && currAttributes.mmAutoPlay != null && currAttributes.mmAutoPlay != "") {
						if (currAttributes.mmAutoPlay == "0") {
							mmObjectTag += "<param name='" + mmAttributes.autoplay + "' value='false' />";
						} else {
							mmObjectTag += "<param name='" + mmAttributes.autoplay + "' value='true' />";
						}
					}
					if (mmAttributes.fullscreen != "" && currAttributes.mmFullScreen != null && currAttributes.mmFullScreen != "") {
						if (currAttributes.mmFullScreen == "0") {
							mmObjectTag += "<param name='" + mmAttributes.fullscreen + "' value='false' />";
						} else {
							mmObjectTag += "<param name='" + mmAttributes.fullscreen + "' value='true' />";
						}
					}
					if (mmAttributes.controls != "" && currAttributes.mmControls != null && currAttributes.mmControls != "") {
						var show = "true";
						var hide = "false";
						if (mmAttributes.controls == "uiMode") {
							show = "full";
							hide = "none";
						}
						if (currAttributes.mmControls.toLowerCase() == "hide") {
							mmObjectTag += "<param name='" + mmAttributes.controls + "' value='" + hide + "' />";
						} else {
							mmObjectTag += "<param name='" + mmAttributes.controls + "' value='" + show + "' />";
						}
					}
					mmObjectTag += "</object></div>";
				} else {
					if (mmAttributes.mmExtension == "pdf") {
						mmObjectTag += "<embed type=\"application/pdf\" " + mmAttributes.mediapath + "=" + media_file + " width=\"100%\" height=\"" + $(this.graphic_content).css("height") + "\"/>";
						mmObjectTag += "</object></div>";
					}else if (mmAttributes.mmExtension == "svg") {
						mmObjectTag = "<div align=\"center\" valign=\"middle\" class=\"svgimage\" style=\"width:100%;height:100%;overflow:hidden;\">" + getSVGText(media_file) + "</div>";
					}                
				}
			}
        }
		return(mmObjectTag);
	}
};
function getSVGText(media_url, title){
	var ret="";

    $.ajax( {
	        method: "GET",
	        async: false,
	        dataType: "html",
	        url: media_url,
	        cache: false,
	        success: function(html) {
                ret = html.substring(html.indexOf("<svg"));
	        },
            // Failed IN AJAX load:
            error: function(xmlHttp, msg, excep) {
                            alert("msg>>" + msg);                                   
            }
                    
    });
	//convert returned XML string to DOM object in order to change attributes
	ret = "<div id='temporary'>" + ret + "</div>";
	var test = $(ret)[0];
	test.getElementsByTagName("svg")[0].setAttribute("title", title);
	test.getElementsByTagName("svg")[0].setAttribute("height",$("#graphic_content").innerHeight());
	test.getElementsByTagName("svg")[0].setAttribute("width","100%");
	test.getElementsByTagName("svg")[0].setAttribute("preserveAspectRatio","xMidYMid meet");
	//namespace declarations should be added to increase compatibility with Firefox
	test.getElementsByTagName("svg")[0].setAttribute("xmlns","http://www.w3.org/2000/svg");
	test.getElementsByTagName("svg")[0].setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");
	
	//scan all hotspots in the DM and insert links into any SVG elements that match them
	var hotspotList = document.getElementsByTagName("hotspot");
	if(CVPortal.components.cvMedia.getProp("tearOff") == 1) { 
		if(CVPortal.components.cvMedia.tearOffDocId == openingWindow.CVPortal.components.cvDocHandler.current.docId) {
			hotspotList = openingWindow.document.getElementsByTagName("hotspot");
		}
	}		
	var processhs = []; // LAM:2021-03-12: fixes an issue with graphics with same hotspot name across different SVGs in same DM
	for (i = 0; i < hotspotList.length; i++) {
		var apsname = hotspotList[i].getAttribute("apsname");
		if (processhs.includes(apsname)) continue; // LAM:2021-03-12
		var resultsList = $("g[apsname='" + apsname + "']", test);
		//SVG links in Firefox must be declared with xlink:href rather than href, and the namespaces must be set, as done above
		$(resultsList).wrapAll("<a xlink:href='javascript:CVPortal.components.cvMedia.hotspotClickedSVG(\"" + apsname + "\")'></a>");
		if (resultsList.length == 0) {
			resultsList = $(test).find("g[webcgm\\:name='" + apsname + "']");
			$(resultsList).wrapAll("<a xlink:href='javascript:CVPortal.components.cvMedia.hotspotClickedSVG(\"" + apsname + "\")'></a>");
		}
		if (resultsList.length == 0) {
			resultsList = $(test).find("text[webcgm\\:name='" + apsname + "']");
			$(resultsList).wrapAll("<a xlink:href='javascript:CVPortal.components.cvMedia.hotspotClickedSVG(\"" + apsname + "\")'></a>");
		}
		if (resultsList.length > 0) { // LAM:2021-03-12
			processhs.push(apsname);
		}
	}

	CVPortal.components.cvResourceManager.newResource("genericforms-RedlineSvgImages", "RedlineSvgImages");

	var addRedlining = CVPortal.components.cvResourceManager.getRedliningSvg(title);
	
	if(addRedlining !== undefined) {
		var redliningElem =  addRedlining.getElementsByTagName('form-data')[0].getElementsByTagName('g')[0];
		test.getElementsByTagName("svg")[0].appendChild(redliningElem);
	}
	
	//convert back to string, then return
	ret = test.innerHTML;
	CVPortal.components.cvMedia.loadingGraphic = false;
    return ret;
}
