// $Id: XY/etc/FullSupport/etc/scripts/cvTOC.js 2.0 2019/05/23 19:04:33GMT milind Exp  $ 
/****************************
*
*  Table of Contents Component
*
*
*
*
*****************************/
function cvTOC() {
	//set name
	this.componentName = "CV Table of Contents Component";
	this.currentContainer = null;
}

/*
<span class="normal" onclick="CVPortal.components['cvTOC'].toggleExpand(event)"><img class="link" id="I_7296" src="/servlets3/wietmsd?date=1645639534701&amp;id=1645639535530&amp;target=resource&amp;action=image&amp;file_name=aircraft/_bbmf_toc_folder_open.png"><span class="counter" style="display:none" id="CNTR_7296">0</span><span class="normal" cvtoctitle="1" id="S_7296" style="font-weight: bold;">&nbsp;External publications</span></span>
*/


cvTOC.prototype = {
	init: function() {
		//
		// On INIT:
		//  - load our XSL for all time...
		//	- load our toc XML into that panel
		this.tocInit = 0;
		// Virtual Panels
		// TOC:
		this.tocPanel = this.getVirtualPanel("toc");
		$(this.tocPanel.getElement(this.id)).html("<div class='toc_processing'><center><img src='" + CVPortal.fetchSkinImage("processing.gif") + "' width='64px' /></center></div>");
		// BTNBAR:
		this.btnBarPanel = this.getVirtualPanel("btnbar");
		this.model = CVPortal.metaFactory().get("META_MODEL");
		this.setLocation(this.model + " \\ ");
		
		// NATO: create placeholders for currently selected @EID and @LASTEID
		// a value of -1 indicates no selection
		this.searchScope_EID = -1;
		this.searchScope_LASTEID = -1;

		// Figure out our Virtual Controls:
		this.syncToc = this.getVirtualControl("syncToc");
		this.toggleToc = this.getVirtualControl("toggleToc");
		this.toggleCodes = this.getVirtualControl("toggleCodes");

		this.syncToc.enable();
		this.toggleToc.enable();
		this.toggleCodes.enable();
			
		this.syncToc.setClickEvent('CVPortal.components["cvTOC"].synchronizeTOC();');
		this.toggleToc.setClickEvent('CVPortal.components.cvTOC.togglePanel();');
		this.toggleCodes.setClickEvent('CVPortal.components.cvTOC.toggleCodeValues();');
		this.codeType = "ABC";
		
		// If set to 1, don't calculate or display search hit counts in TOC
		this.disableHitCount = this.getProp("disableTOCHitCount");

		// set up our TOC tab:
		this.tocTab = this.getVirtualControl("tocTab");
		this.tocTab.highlight();
		this.tocTab.setClickEvent('CVPortal.components["cvTOC"].tocPanel.selectShared("cvTOC");CVPortal.components["cvTOC"].tocTab.highlight();');
		// select this panel!
		this.tocPanel.selectShared(this.id);
		//load our XSL:
		this.loadXSL();
	},

	setLocation: function(str) {
		if(str == null && this.currentItem) { // create our own string from the location in TOC
			str = this.model + " \\ ";
			var temp = this.currentItem;
			var tempStr = "";
			var first = 0;
			var tocParentName = 0;
			while(temp.id != "TOC_MAIN_TREE") {
				if(temp.className == "tocItem" || temp.className == "tocSelected") {
					var tTemp = $("* > span[cvTocTitle='1']", temp).html();
					tTemp = $.trim(tTemp);
					if(first == 0) {
						first = 1;
						tempStr = tTemp;
					} else {
						tempStr = tTemp + " \\ " + tempStr;
						tocParentName++;
					}
				}
				temp = temp.parentNode;
				if(tocParentName == 1) { //Runs only for DM's immediate parent TOC branch, passes the branch name to TOC branch search box
					var tempName = tTemp.replace("&nbsp;","");
					$(".TOCFilterTitle").html(tempName);
					tocParentName = 2;
				}
			}
			str += tempStr; // + $("span[cvTocTitle='1']", this.currentContainer).html();
		}
		if(str.length > 160) {
			str = "..." + str.substr(str.length - 160, str.length);
		}
		$("#tocLocation", this.btnBarPanel.getElement(this.id)).html(" " + str);
	},

	destroy: function() {
		if(CVPortal.getBrowserType() == "MOZ") {
			delete this.XSLProc;
		}
		delete this.XSL;
	},

	loadXSL: function() {
		// In our creation, get our XSL style sheet from the server:
		this.cvLoadXSLT("toc", "tocXSL", false, 'CVPortal.components.cvTOC.loadTocXML(CVPortal.components.cvTOC.tocPanel.getElement(CVPortal.components.cvTOC.id), "root", ' + this.getProp('tocLevel') + ');');
	},

	callbackLoadToc: function() {
		CVPortal.components.cvTOC.loadTocXML(CVPortal.components.cvTOC.tocPanel.getElement(CVPortal.components.cvTOC.id), "root", this.getProp('tocLevel'));
	},
	
	loadTocXML: function(targetNode, eid, levels) {
		// Require XSL for this process to go through:
		if(! this.tocXSL) {
			this.errorNoXSL();
			return;
		}

		// Form our URL to get the new TOC pieces
		var url = CVPortal.getURLwithBookParams() + "&target=toc&action=tree&eid=" + eid + "&levels=" + levels;
		var toc = this;
		$.ajax({
			type: "GET",
			url: url,
			async: false,
			cache: false,
			dataType: "html",
			success: function (html) {
				// toc.cvTransformXML(xml, "tocXSL", targetNode);
				// alert(html);
				$(targetNode).html(html);

				if(toc.tocInit == 0) {
					toc.tocInit = 1;
				}

				toc.showCodeValues(targetNode);
				if(toc.hitCountXML) {
					toc.showHitCounts();
				}
				// If tablet device add TOC controls for toggling Title/DMC and syncing TOC
				if ( ! $("#tocTabletControls").length > 0) {
					// LAM: 2020-11-24
					var controlsStr = "";
					controlsStr = controlsStr + "<div id='tocTabletControls'>";
					controlsStr = controlsStr +   "<div class='tocTabletTitleToggleButtonEnabled simpleClickable' id='tocTabletTitleToggle' onClick='CVPortal.components.cvTOC.toggleCodeValues();' >";
					controlsStr = controlsStr +     "<div id='tocTabletTitleToggleText' class='searchButtonText'/>";
					controlsStr = controlsStr +   "</div>";
					controlsStr = controlsStr +   "<div class='tocTabletSyncButtonEnabled simpleClickable' id='tocTabletSync' onClick='CVPortal.components.cvTOC.synchronizeTOC();' >";
					controlsStr = controlsStr +     "<div id='tocTabletSyncText' class='searchButtonText' />";
					controlsStr = controlsStr +   "</div>";
					controlsStr = controlsStr + "</div>";
					$("#TOC_MAIN_TREE").before(controlsStr);
					$("#tocTabletTitleToggleText").text(CVPortal.getResource("ctrl.toggleCodes"));
					$("#tocTabletSyncText").text(CVPortal.getResource("ctrl.syncToc"));
				}
				CVPortal.components["cvSearch"].adjustTOCPanelHeight();
			},
			// Failed iN AJAX load:
			error: function(xmlHttp, msg, excep) {
				CVPortal.error(" { TOC } Failed to fetch XML toc content from EID: " + eid + " with " + levels + " levels: " + msg);
			}
		});
		return;
	},

	
	/***************************
	*
	*   Expanding, Collapsing, Selecting TOC Nodes:
	*
	****************************/
	selectDocument: function(event) {
		// fix our event:
		event = CVPortal.fixEvent(event);
		// no bubbling:
		event.cancelBubble = true;

		//retrieve the element that was clicked on:
		var pDiv = CVPortal.eventGetElement(event);
		while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
			//pDiv = pDiv.parentNode;
			pDiv = $(pDiv).parent().get(0);
		}

		// highlight this element:
		if(pDiv) {
			this.selectTocItem(pDiv);

			//
			// LOAD THE DOCUMENT:
			// call cvDocHandler with the document id and document type:
			if(CVPortal.components["cvDocHandler"]) {
				// NV Harmonization: Intercept TOC selections from PDMs and add RefStruct item
				if(CVPortal.rootThread.currentPDM && CVPortal.rootThread.currentPDM != null) {
					// ensure that if in a PDM, another PDM is not selected
					if(pDiv.getAttribute("DOCTYPE") == "process") {
						alert(CVPortal.getResource("alert.troubleshooting.session.is.already.active"));
						return;
					}
					var refStruct = new Object();
					refStruct.pdmTOCselect = true;
					CVPortal.components["cvDocHandler"].loadDocumentByCeId(pDiv.getAttribute("REFID"),refStruct);
				} else {
					CVPortal.components["cvDocHandler"].loadDocumentByCeId(pDiv.getAttribute("REFID"));
				}
			} else {
				CVPortal.error(" {TOC} Failed to load document from TOC because cvDocHandler component is not defined.");
			}
		}
	},

	selectDocumentContainer: function(event) {
		// fix our event:
		event = CVPortal.fixEvent(event);
		// no bubbling:
		event.cancelBubble = true;

		//retrieve the element that was clicked on:
		var pDiv = CVPortal.eventGetElement(event);
		while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
			//pDiv = pDiv.parentNode;
			pDiv = $(pDiv).parent().get(0);
		}

		if (pDiv) {
			// highlight this element:
		 	this.selectTocContainer(pDiv);

			// if this container is not open... open it!
			if(pDiv.isOpen != 1) {
				this.toggleExpand(null, pDiv);
			}

			// manually set and unset our "currentItem"
			if(this.currentItem && pDiv != this.currentItem) {
				this.currentItem.className = "tocItem";
			}
			this.currentItem = pDiv;

			//
			// LOAD THE DOCUMENT:
			// call cvDocHandler with the document id and document type:
			if(CVPortal.components["cvDocHandler"]) {
				CVPortal.components["cvDocHandler"].loadDocumentByCeId(pDiv.getAttribute("SYSDOCEID"));
			} else {
				CVPortal.error(" {TOC} Failed to load document from TOC because cvDocHandler component is not defined.");
			}

		}
	},

	//mark a document as Unselected:
	selectTocItem: function(pDiv) {
		pDiv.className = "tocSelected";
		if(this.currentItem && pDiv != this.currentItem) {
			this.currentItem.className = "tocItem";
		}
		this.currentItem = pDiv;
		this.setLocation();
		// unselect any documentSystemContainers:
		this.unselectTocContainer();
	},

	selectTocContainer: function(pDiv) {
		var cvTOC = this;
		$("span[id='S_" + pDiv.id + "']", pDiv).each(function() {
			//
			// This strange block of code (the if, if-else repeat) is to correct an UNEXPLAINABLE bug, where the
			// toc.currentContainer leaves this function as a SPAN, and next time it is called it has become a DIV
			//  .... toc.currentContainer is not mentioned anywhere else!
			//
			if(cvTOC.currentContainer != null) {
				if(cvTOC.currentContainer.nodeName == "DIV") {
					$("span[id='S_" + cvTOC.currentContainer.id + "']", cvTOC.currentContainer).each(function() {
						this.style.fontWeight = "normal";
					});
				} else {
					cvTOC.currentContainer.style.fontWeight = "normal";
				}
			}
			cvTOC.currentContainer = this;
			cvTOC.currentContainer.style.fontWeight = "bold";
			if(pDiv.getAttribute("SYSDOCEID")) {
				cvTOC.unselectTocItem();
			}
		});
		// NATO: also store EID and LASTEID (SDL tperry 2013/03/15)
		this.searchScope_EID = parseInt($(pDiv).attr("EID"), 10);
		this.searchScope_LASTEID = parseInt($(pDiv).attr("LASTEID"), 10);

		// NATO: display TOC branch name (SDL tperry 2013/03/19)
		$(".TOCFilterTitle").html($("* > span[cvTocTitle='1']", pDiv).html());
	},

	// Simple "UNSELECT" functions for
	// tocItem and tocContainers:
	unselectTocItem: function() {
		if(this.currentItem) {
			this.currentItem.className = "tocItem";
			this.currentItem = null;
		}
	},

	unselectTocContainer: function() {
		var cvTOC = this;
		if(cvTOC.currentContainer != null) {
			// alert("NULL? " + cvTOC.currentContainer.nodeName + " with HTML: " + $(cvTOC.currentContainer).html());
			if(cvTOC.currentContainer.nodeName == "DIV") {
				$("span[id='S_" + cvTOC.currentContainer.id + "']", cvTOC.currentContainer).each(function() {
					this.style.fontWeight = "normal";
				});
			} else {

				cvTOC.currentContainer.style.fontWeight = "normal";
			}
			this.currentContainer = null;
		}
		// NATO: also clear EID and LASTEID (SDL tperry 2013/03/15)
		this.searchScope_EID = -1;
		this.searchScope_LASTEID = -1;

		// NATO: clear TOC branch name (SDL tperry 2013/03/19)
		//$(".TOCFilterTitle").html("");
	},


	// Expands or collapses a branch of the TOC:
	toggleExpand: function(evt, element) {
		var comp = this;
		// fix our event:
		var pDiv = element;
		if(evt) {
			evt = CVPortal.fixEvent(evt);
			// no bubbling:
			evt.cancelBubble = true;
			//retrieve the element that was clicked on:
			var pDiv = CVPortal.eventGetElement(evt);
			while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
				//pDiv = pDiv.parentNode;
				pDiv = $(pDiv).parent().get(0);
			}
		}
		//this.currentContainer = pDiv;
		this.selectTocContainer(pDiv);

		CVPortal.debug(" {cvTOC} " + pDiv.id + " is toggling an Expand: open flag, " + pDiv.isOpen);
		//toggle our display:
		if(pDiv.isOpen == 1) { // currently open, close:
			CVPortal.warn(" {cvTOC} Found toc container already open, will not open again!.  Closing!");
			$(pDiv).find("div[id = 'D_" +pDiv.id + "']").slideUp("fast");
			$(pDiv).find("span img[id = '" + "I_" + pDiv.id + "']").each(function() { 
				//this.src = CVPortal.fetchSkinImage("plus.png");
				// LAM:2020-10-22 use folder icon
				this.src = CVPortal.fetchSkinImage("aircraft/_bbmf_toc_folder_closed.png");
			});
			pDiv.isOpen = 0;
		} else { //currently closed, open now.
			//we are opening a new branch--make sure that it is not EMPTY, if so, attempt to fill it:
			$(pDiv).find("div[id = 'D_" +pDiv.id + "']").each(function() {
				if($(this).children().length == 0) {
					CVPortal.warn(" {cvTOC} Requires adding some new nodes to the TOC.");
					// add some new nodes to the TOC tree:
					comp.loadTocXML(this, pDiv.id, comp.getProp("tocLevel"));
				}
			});
			CVPortal.debug(" {cvToc} Opening the TOC node: " + pDiv.id + " of class " + pDiv.className + " with display: " + pDiv.style.display) ;
			// once any required nodes have been added, open the TOC tree
			pDiv.isOpen = 1; // set our flag to OPEN.
			$(pDiv).show();
			$(pDiv).find("div[id = 'D_" +pDiv.id + "']").slideDown("fast");
			$(pDiv).find("span img[id = '" + "I_" + pDiv.id + "']").each(function() {
				//this.setAttribute("src", CVPortal.fetchSkinImage("minus.png"));
				// LAM:2020-10-22 use folder icon
				this.setAttribute("src", CVPortal.fetchSkinImage("aircraft/_bbmf_toc_folder_open.png"));
			});
		}
	},

	//
	//Collapse the Entire TOC:
	collapseAll: function() {
		$("div.tocContainer", this.tocPanel.getElement()).each(function() {
				//alert("GOT A TOC CONTAINER..." + $(this).html());
				$(this).hide();
		});
		
		// remove the selected item:
		if(this.currentItem) {
			$(".activityList", this.currentItem).html("");
			this.currentItem.className = "tocItem";
		}
		
		$("div.tocItem", this.tocPanel.getElement()).each(function() { // removed div.tocSelected from select filter
			if(this.isOpen == 1) {
				this.isOpen = 0;
				$(this).find("div[id='D_" + this.id + "']").hide();
				$(this).find("span img[id = '" + "I_" + this.id + "']").each(function() { this.setAttribute("src", CVPortal.fetchSkinImage("plus.png"));  });
			}
		});
	},

	// NOTE: when calling this function from the TOC titles search handler, set tocRefId to null
	synchronizeTOC: function(tocParentId, tocRefId) {
		CVPortal.debug(" {cvTOC} Engaging in synchronize TOC");
		//first collapse the TOC:
		this.collapseAll();
		if(tocParentId == null || CVPortal.trim(tocParentId) == "") {
			// sync to the existing document:
			if(CVPortal.components.cvDocHandler.isDocumentOpen()) { // if something is selected:
				tocParentId = CVPortal.components.cvDocHandler.getDocumentProperty("tocParent");
				tocRefId = CVPortal.components.cvDocHandler.getDocumentProperty("tocRef");
			} else {
				CVPortal.warn(" {cvToc} Refusing to synchronize because a document is not open.");
				return;  // unable to run this function from params, and no docs are open!
			}
		}

		CVPortal.debug(" {cvTOC} Located target: " + tocParentId + " with document child: " + tocRefId);
		var url = CVPortal.getURLwithBookParams("time") + "&target=toc&action=path_eid&eid=" + tocParentId;
		var toc = this;
		$.ajax({
			method: "GET",
			url: url,
			async: true,
			cache: false,
			dataType: "xml",
			success: function(xml) {
				// Expand the system folders
				var finalDiv = toc.expandToc(xml);
				if(finalDiv && finalDiv.getAttribute("DOCID") && tocRefId == null) {
					tocRefId = finalDiv.getAttribute("DOCID");
					if(finalDiv.getAttribute("SYSDOCEID")) {
						toc.selectTocContainer(finalDiv);
					} else {
						toc.selectTocItem(finalDiv);
					}
					$("#cvTOC").animate({scrollTop: $(finalDiv).offset().top - $("#tocPanel").offset().top - $("#tocPanel").height()/2},{duration: '50', easing: 'swing'});
					CVPortal.debug(" {cvToc} Selected final document in Synchronize from TocRefId");
				} else {
					// select the actual document, and unselect any other doc:
					if(tocRefId != null) {
						$("#" + tocRefId, toc.tocPanel.getElement(toc.id)).each(function() {
							CVPortal.info(" {cvTOC} Selecting final document: " + tocRefId + " in syncrhonized");
							toc.selectTocItem(this);
							if ($("#TOC_MAIN_TREE").css("max-height") != "none") {
								$("#TOC_MAIN_TREE").animate({scrollTop: $(this).offset().top - $("#tocPanel").offset().top - $("#tocPanel").height()/2},{duration: '50', easing: 'swing'});
							} else {
								$("#cvTOC").animate({scrollTop: $(this).offset().top - $("#tocPanel").offset().top - $("#tocPanel").height()/2},{duration: '50', easing: 'swing'});
							}
							CVPortal.debug(" {cvToc} Selected final document in Synchronize from TocRefId");
						});
					}
				}
			}
		});
	},

	expandToc: function(xml) {
		// expands a set of nodes who are listed in as <EID>nodeID</EID> elements in the XML parameter:
		var toc = this;
		var divRet;
		$("EID", xml).each(function() {
			var id = CVPortal.getNodeText(this);
			CVPortal.debug(" {cvToc} Expanding TOC Branch, by TocParentId:  " + id);
			$("#" + id, toc.tocPanel.getElement(toc.id)).each(function() {
				var pDiv = this;
				divRet = pDiv;
				while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
					//pDiv = pDiv.parentNode;
					pDiv = $(this).parent().get(0);
				}
				if(pDiv.getAttribute("type") != "DOCUMENT") {
					toc.selectTocContainer(pDiv);
					toc.toggleExpand(null, pDiv);
				}
			});
		});
		return divRet;
	},

	// toggle the TOC panel in and out of sight:
	togglePanel: function() {
		if(this.hidden == 1) {
			this.hidden = 0;
			// set padding value back
			$("#tocPanel").css("padding-right", "19px")
			// change the mouse over on the button
			$(this.toggleToc.element).attr("title", CVPortal.getResource("ctrl.hideToc"));
			$(this.toggleToc.element).attr("alt", CVPortal.getResource("ctrl.hideToc"));
			
			// show the other TOC based controls:
			CVPortal.controlFactory().updateCondition("showTOCPanel","true");
			
			// show the panel
			CVPortal.panelFactory().expandPanel(this.tocPanel.id);
		} else {
			this.hidden = 1;
			// padding gives extra space on the right of document
			$("#tocPanel").css("padding-right", "0")
			CVPortal.panelFactory().collapsePanel(this.tocPanel.id);
			// change the mouse over on the button
			$(this.toggleToc.element).attr("title", CVPortal.getResource("ctrl.showToc"));
			$(this.toggleToc.element).attr("alt", CVPortal.getResource("ctrl.showToc"));

			// hide the other TOC based controls:
			CVPortal.controlFactory().updateCondition("showTOCPanel","false");
		}
		
		//since we can't attach resize events to individual elements, and we don't want to explicitly name every single thing that needs to adjust to panel resizing...
		//we fire a window-resize event to trick those things into thinking we resized the window!
		var resizeEvent;
		if (typeof window.Event == "function"){	//modern way of creating events: Edge, Firefox, Chrome only
			resizeEvent = new UIEvent('resize');
		}
		else { 		//deprecated way of creating events: Internet Explorer only
			resizeEvent = document.createEvent("UIEvent");
			resizeEvent.initUIEvent('resize', true, true, window, 1);
		}
		window.dispatchEvent(resizeEvent);
	},

	// repetitive Error conditions:
	errorNoXSL: function() {
		CVPortal.error(" {TOC} Request made requiring XSLT.  XSLT is not loaded!");
	},

	showHitCounts: function(xml) {
		if (this.disableHitCount != 1) {
			if(!xml) {
				xml = this.hitCountXML;
			} else {
				this.hitCountXML = xml;
			}
			var toc = this;
			$("TOC_RESULTS TOCENTRY", xml).each(function() {
				//alert(this.getAttribute("TOCEID"));
				$("#CNTR_" + this.getAttribute("TOCEID"), toc.tocPanel.getElement(toc.id)).html(this.getAttribute("COUNTER")).show();
			});
		}
	},

	clearHitCounts: function() {
		this.hitCountXML = null;
		$(".counter", this.tocPanel.getElement(this.id)).empty().hide();
	},

	toggleCodeValues: function() {
		if(this.codeType == "ABC") {
			$(this.toggleCodes.label).html(CVPortal.getResource("ctrl.justCodes"));
			this.codeType = "ABC123";
			$(".codeBit", this.tocPanel.getElement(this.id)).show();
			$(".titleBit", this.tocPanel.getElement(this.id)).show();
		} else if(this.codeType == "ABC123") {
			$(this.toggleCodes.label).html(CVPortal.getResource("ctrl.justTitles"));
			this.codeType = "123";
			$(".titleBit", this.tocPanel.getElement(this.id)).hide();
		} else if(this.codeType == "123") {
			$(this.toggleCodes.label).html(CVPortal.getResource("ctrl.toggleCodes"));
			this.codeType = "ABC";
			$(".titleBit", this.tocPanel.getElement(this.id)).show();
			$(".codeBit", this.tocPanel.getElement(this.id)).hide();
		}
	},

	showCodeValues: function(target) {
		if(this.codeType == "ABC") {
			$(".codeBit", target).hide();
			$(".titleBit", target).show();
		} else if(this.codeType == "ABC123") {
			$(".codeBit", target).show();
			$(".titleBit", target).show();
		} else if(this.codeType == "123") {
			$(".titleBit", target).hide();
			$(".codeBit", target).show();
		}
	}
};
//this function will be called in this file hide any chapter which has not child content
//under it: ..\data\httpdocs\styles\toc_server.xsl

function reSetDisplay(){	
	$('#TOC_MAIN_TREE div[type="SYSTEM"][TOP=""][ROOT="not"]').each(function (index){
		var id = $(this).attr("id");
		$('#' + id).hide();
		$(this).find('div[TOP="1"]:first').each(function(){			
			$('#' + id).show();
			return true;
		});
		$('div[type="DOCUMENT"]',this).each(function(index){
			$('#' + id).show();
			//alert( index + ": " + $(this).attr("DOCTYPE") );
			return true;
		});
		$('div[type="SYSDOCEID"]',this).each(function(index){
			$('#' + id).show();
			return true;
		});
	});	
}	




