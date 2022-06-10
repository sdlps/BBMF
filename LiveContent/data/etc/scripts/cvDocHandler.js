// $Id: XY/etc/FullSupport/etc/scripts/cvDocHandler.js 2.0 2019/05/23 18:36:40GMT milind Exp  $ 
/****************************
*
*  Document Handler
*
*****************************/
function cvDocHandler() {
	//set name
	this.componentName = "CV Document Handler Component";
	this.current = {};
	this.loadingDocument = false;
	
	//stored yellow arrow:
	this.yellowArrow = null;
	this.wcn_array = {};
	this.wcn_acceptSC = {};
	this.extRefCount = 0;
	this.ceid_array = [];
	this.findDlg = null;
	this.searchTerm = null;  // Current search term
											     // defined by the Find button
	this.searchHits = null;  // Array of all the found search hits
	this.searchCount = 0;	   // Total count of hits in the document
	this.currPoint = -1;		 // Current hit in the table section	
	this.currSection=0;		   //store the current section for the larger table
	this.tblSections = null; //store ceid/section(page) number pair
	this.secToCeids=null;    //store section(page) number/ceid pair
	this.currSecOnly=false;
	this.mainDocLoad=false;
	//this.newSearch=false;
	this.startNext=false; //control if the next is the first one for a give section(page)
	this.sectionCounts=null; //store section(page) number/found count pair
	// required for S1000D Process DMs:
	CVPortal.rootThread = new pdmRoot();
	
	//LCS-1692
	this.searchResultMap = null;
	this.searchIterator = 0;

	// NV Harmonization: Procedure step tracking
	this.currStepEID = null;
	this.nextStepEID = null;
	this.prevStepStack = [];
	this.completedStepsStack = [];
	this.hasSteps = false;

	// NV Harmonization: storage for PDM values
	this.inPDM = null;
	this.pdmTOCselect = null;
	this.pdmDocidLoad = null;
	this.pdmAutoRef = false;
	this.pdmReal = null;
	this.pdmLastType = null;
}

cvDocHandler.prototype = {
	init: function() {
		// Data Panel and Nav Panel (tables, figures, activity lists)
		this.docPanel = this.getVirtualPanel("data");
		dH = this;
		// WCN Pop UPs on SCROLL or RESIZE:
		$(this.docPanel.getElement(this.id)).on("scroll", function() {
			if(!dH.scrollWithBtn && !dH.isRestoredDM){
				dH.popWCN() 
			}
			});
		// Reset wcn position when panel was resize	
		$(this.docPanel.getElement(this.id)).on("resize-panel", function() { 
			CVPortal.components.cvDocHandler.bindWCN() 
		});
	// Reset wcn position when window was resize	
		$(window).on("resize", function() { 
			CVPortal.components.cvDocHandler.bindWCN() 
		});
		
		this.navPanel = this.getVirtualPanel("nav");
		this.panel = this.getVirtualPanel("panel", "modalContent");
		// setup our our resource centric tabs ( ACTIVITY, TABLES, FIGURES):
		this.activityInTOC = this.getProp("activityInTOC");
		this.setupResourceInfo();

		// turn on or off automatically changing figures in graphic_panel when landing on step with figure
		this.autoLoadFigure = this.getProp("AutoLoadFigure");
		this.iPadAutoLoadFigure = this.getProp("iPadAutoLoadFigure");
		

		// close modal control:
		this.closeModal = this.getVirtualControl("closeModal");

		// find text control:
		this.modalPanel = this.getVirtualPanel("modalPanel");

		// Doc Info: list of tabs dynamically generated from components.xml (REFMAT, MATREQ, etc)
		this.setupDocInfo();
		
		// Add huge table paging and searching controls for IETMs with large tables
		if(CVPortal.metaFactory().get("META_HASLARGETABLE") == "true") {
			CVPortal.controlFactory().updateCondition("largeTablesIETM","true");
		}
		
		this.loadedSectionCeid="";//store the loaded section ceid
		this.matchCase =false;
		this.wholeWord=false;
		this.findDialog=null;
		this.totalfound=0;
		this.CEIDS="";
		this.foundindoc=0;
		this.navDiv=null;//set it when the find in table is clicked
		this.firstSecCEID="firstSecCEID";
		this.lastSecCEID="lastSecCEID";
		this.testvalue = "test string";

		// NV Harmonization: capture conditionalization properties
	  this.pdmRequireUndo = this.getProp("require_pdm_undo_confirm");
		this.pdmProcStepping = this.getProp("require_pdm_proc_stepping");
		this.showProcAnchors = this.getProp("show_procanchor_points");
		this.showStepAnchors = this.getProp("show_stepanchor_points");
	  this.showStepsCheckbox = CVPortal.metaFactory().get("META_SHOW_STEPS_CHECKBOX") || 0;

		// security banner and portion marking
		this.showSecurityBanners = CVPortal.metaFactory().get("META_SHOW_SECURITY_BANNERS") || 0;
		this.showPortionMarking = CVPortal.metaFactory().get("META_SHOW_PORTION_MARKING") || 0;

		// add the CLASSIFICATION AND DISTRIBUTION into the XML STATE TABLE:
		this.updateXMLStateTable();

		//Add publication security banner
		if (this.showSecurityBanners === "1") {
			this.addPublicSecurityBanner();
		}
		
		//load HOME or a DOCUMENT by DOCID after all this is complete:
		if(CVPortal.metaFactory().getUrlParam("docid")) {
			this.loadDocumentByDocId(CVPortal.metaFactory().getUrlParam("docid"), null);		
		} else {
			this.loadHome();			
		}
	},

	destroy: function() {
		// Destroy resource list XSL
		if(this.resInfo) {
			for(var i = 0; i < this.resInfo.length; i++) {
				var name = "delete this." + this.resInfo[i] + "XSL;";
				eval(name);
			}
		}
	},

	//***********************
	//  Load an external document:
	//***********************
	externalReference: function(pubcode, refdm) {	
		// first check to see if we are referencing an external HTTP website, or a S1000D Figure:
		if(refdm.indexOf("URN:HTTP:") != -1) { 
			this.extRefCount++;
			var httpUrl = refdm.substring(9, refdm.length);
			var tpArgument = 'toolbar=1,location=1,directories=0,scrollbars=1,status=1,menubar=1,resizable=1,top=10,left=10,width=600,height=800';
			var reftp_win = window.open(httpUrl, "HTTP_REFTP_WINDOW_" + this.extRefCount, tpArgument);
		} else if(refdm.indexOf("URN:ICN:") != -1) {
			this.extRefCount++;
			var icnUrl = refdm.substring(8, refdm.length);
			icnUrl = CVPortal.getUrlforBookData() + "/figures/" + icnUrl;
			var tpArgument = 'toolbar=1,location=1,directories=0,scrollbars=1,status=1,menubar=1,resizable=1,top=10,left=10,width=600,height=800';
			var reftp_win = window.open(icnUrl, "ICN_REFTP_WINDOW_" + this.extRefCount, tpArgument);			
		} else {
			// load the XML from the collections (wietmsd.xml):
			var xml = CVPortal.metaFactory().getPublicationsConfiguration();
			
			// modify the pub code:
			pubcode = pubcode.replace(/-/g, '_');
			
			// confirm that the pubcode matches a listed book
			
			if($("book-item[name='"+pubcode+"']", xml).length > 0) {
				$("book-item[name='"+pubcode+"']", xml).each(function () {
					// get the collection name from the XML (wietmsd.xml)
					var collection = $(this.parentNode).attr("name");
					// form the appropriate URL
					var url = CVPortal.getURLwithMainSessIDParams("date") + "&target=main&action=host_win&book="+pubcode+"&collection="+collection;
					
					// if a specific document has been requested, add it to the URL:
					if(refdm) {
						// first, transform the refdm:
						if(refdm.indexOf("URN:S1000D:DMC-") != -1) {
							refdm = refdm.substring(15, refdm.length);
							
							// add dashes between DISCODE[2] and DISCODEV and INFOCODE[3] and INFOCODEV
							var results = refdm.split(/-/);
							var discode  = results[5].substring(0, 2) + "-" + results[5].substring(2, results[5].length);
							var infocode = results[6].substring(0, 3) + "-" + results[6].substring(3, results[6].length);
							results[5] = discode;
							results[6] = infocode;
							refdm = results.join("-");
						}
						// add the DOCID to the URL:
						url += "&docid=" + refdm;
					}

					// open a new window to the publication
					var bookname = pubcode + "_" + collection + "_" + new Date().getTime();
					var book_win = window.open(url, bookname, "toolbar=0,location=0,directories=0,scrollbars=0,status=1,menubar=0,resizable=1'");
				});
			} else {
				// if the pubcode does not match a listed book, pop an alert and abort:
				alert(CVPortal.getResource('alert.unable.toLocate.referenced.publication') + " (" + pubcode + ")");
			}
		}
	},
	showFindDialog: function(event) {
		var ceid = CVPortal.components["cvDocHandler"].isDocumentOpen();
		event = CVPortal.fixEvent(event);
		// no bubbling:
		event.cancelBubble = true;
		var dH = this;
		//retrieve the element that was clicked on:
		var pDiv = CVPortal.eventGetElement(event);
		while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
			//pDiv = pDiv.parentNode;
			pDiv = $(pDiv).parent().get(0);
		}		
		this.navDiv=pDiv;
		//CVPortal.components["cvDocHandler"].findWord("better", false, false, this, false,CVPortal.getURLwithBookParams() + "&target=query&action=find&ceid=" + ceid,ceid,false) ;  
		if(ceid != false ) {
			var pageUrl = CVPortal.fetchSkinFile("find_dlg.html");
			//get the doc CEID for all the table docs and pass to the popup
			this.DocCEID = ceid;
			var findkw = this;
			this.findUrl = CVPortal.getURLwithBookParams() + "&target=query&action=find&ceid=" + ceid;

			argArray = new Array(4);
			
			argArray[0]=CVPortal;
			argArray[1]="";
			argArray[2]=this.findUrl;
			argArray[3]=ceid;
			if (this.findDlg == null)	{
				this.findDlg = showModalDialog(encodeURI(pageUrl), argArray, "dialogWidth=340px;dialogHeight=220px;center=yes;border=thin;help=no;status=no");
			} else if (findDlg.closed == true) {
				this.findDlg = showModalDialog(encodeURI(pageUrl), argArray, "dialogWidth=340px;dialogHeight=220px;center=yes;border=thin;help=no;status=no");
			} else {
				this.findDlg.focus();
				this.findDlg.startSearchFor(searchFor) ;
			}		
		} else {
			alert(CVPortal.getResource("message.requiresDocumentOpen"));
			CVPortal.error(" { find keyword } Failed to find as a document is not open");
	
		}
	},	
	cancelFindDialog: function() {
		CVPortal.components["cvModalHandler"].hideModal();
	},	
	//***********************
	//  Load and show FIND MODAL DIALOG:
	//***********************
	findText: function() {
		var url = CVPortal.fetchSkinFile("cvFindDialog.html");

		var dH = this;
		$.ajax( {
			method: "GET",
			async: true,
			dataType: "html",
			url: url,
			cache: false,
			success: function(html) {
				//alert("html "+html);
				dH.modalPanel.setContent(html, dH.id);
				CVPortal.controlFactory().seekControls(dH.modalPanel.getElement(dH.id));

				// get our virtual controls :
				dH.okButton = dH.getVirtualControl("okButton");
				dH.cancelButton = dH.getVirtualControl("cancelButton");

				dH.okButton.enable();
				dH.okButton.setClickEvent("CVPortal.components['cvDocHandler'].searchForText();");

				dH.cancelButton.enable();
				dH.cancelButton.setClickEvent("CVPortal.components['cvModalHandler'].hideModal();");

				// show the modal dialog for user interaction:
				CVPortal.components["cvModalHandler"].setTitle("Find Text");
				CVPortal.components["cvModalHandler"].openModal();
			}
		});
	},

	searchForText: function() {
		var ready = true;
		var term = "";
		var dH = this;
		$("#findQuery", dH.modalPanel.getElement(dH.id)).each( function() {
			if(this.value == "") {
				ready = false;
			}
			term = this.value;
		});

		if(ready == true) {
			var refStruct = new Object();
			refStruct.searchTerm1 = term;
			refStruct.searchWholeWords = false;
			refStruct.searchIgnoreCase = false;
			dH.refreshDocument(refStruct);
			CVPortal.components['cvModalHandler'].hideModal();
		} else {
			alert(CVPortal.getResource("alert.you.must.enter.aTerm.toFind"));
		}
	},

	//***********************
	//  Current Document Properties:
	//***********************
	isDocumentOpen: function() {
		if(this.current == null) { return false; }
		return this.current.ceid;
	},
	isLargeTable: function() {
		if(this.current == null) { return false; }
		return this.current.largertableId;
	},
	getLargeTableSectionSize: function() {
		if(this.current == null) { return 200; }
		return this.current.largertablesectionsize;
	},
	getLargeTableTotalSections: function() {
		if(this.current == null) { return 2; }
		return this.current.largertabletotalsections;
	},	

	getDocumentProperty: function(propertyName) {
		if(this.current == null) { return false; }
		return this.current[propertyName];
	},

	//***********************
	// Document Loading....
	//***********************
	loadDocumentByDocId: function(docId, refStruct, noAuditFlag) {
		if(! docId || docId == "") {
			CVPortal.error(" { DocHandler } Failed to load document: Missing Doc Id");
			alert(" { DocHandler} Unable to load document.  You have activated a broken link!");
			return;
		}

		// NV Harmonization
		if(CVPortal.rootThread.currentPDM && CVPortal.rootThread.currentPDM != null) {
			if(typeof refStruct === 'undefined' ) {
				var refStruct = new Object();
			}
			refStruct.pdmDocidLoad = true;
		}

		var url = CVPortal.getURLwithBookParams() + "&target=utility&action=xref&xrefid=" + docId;
		var dH = this; // store for later
		$.ajax( {
			type: "GET",
			url: url,
			dataType: "xml",
			async: true,
			cache: false,
			success: function (xml) {
				var trgList = xml.getElementsByTagName("INDEX-ITEM") ;
				if (trgList.length == 0)	{
          alert(CVPortal.getResource("alert.unable.toLoad.theDocument.byDocID") + docId) ;
          return;
				}
				trgEl = trgList.item(0);
   				//var trgTag = trgEl.getAttribute("TAGNAME") ;
				var cEid = trgEl.getAttribute("CEID") ;
				if (dH != undefined && dH.current != undefined && dH.current.eid != null && dH.current.eid == cEid){
          console.debug('loadDocumentByDocId[2A]'); // LAM
					if(dH.current.docType == "process") {
						// for process DMs, links often go to the same place, so load it anyway:
            console.debug('loadDocumentByDocId[2Aa]'); // LAM
						dH.loadDocumentByCeId(cEid, refStruct, noAuditFlag);
					} else {
            console.debug('loadDocumentByDocId[2Ab]'); // LAM
						// prevent links to the same document:
						
						// atrese - 9/23/2011 - removed alert because it is popped at times like opening bookmarks
						//alert("Warning, link is to current document position");
            CVPortal.components.cvDocHandler.setUpBufrForm(); // LAM: Need to check for form, the document may already onep and not have ICON
					}
				} else {
					dH.loadDocumentByCeId(cEid, refStruct, noAuditFlag);
				}
			}

		});
	},
	largeTableDialog:function() {
		//on iPad, move large table dialogs to avoid Safari fixed-position layering bug which layers the navbars over the dialogs
		if(CVPortal.getBrowserPlatform() == "IPAD") {
			//now that media is supported on iPad, we might need to move large table dialogs again to avoid running into the same Safari layering bug with the graphics panel
			$("#currceid").css("right","0px");
			$("#findDialog").css("right","0px");
			
			//we also need to shrink them so that they fit into the iPad layout better with the graphics panel enabled
			$("#currceid").css("width","280px");
			$("#findDialog").css("width","280px");
			
			//vertical positioning is handled by a separate helper function
			this.largeTableDialogAdjust();
		}

		$('#currceid').toggle();
		$('#findDialog').toggle();
		//LCS-5980 splitter overlays large table menu, so we need to change z-index value while large table menu is open 
		if($('#findDialog').is(':visible')) {
			$('#cvDocHandler.contentPanel').css('z-index', '101');
		} else {
			$('#cvDocHandler.contentPanel').css('z-index', '');
		}
		
	},
	largeTableDialogAdjust:function() {
		//this should only run when large table DMs are open, and only on the iPad
		if(CVPortal.getBrowserPlatform() != "IPAD" || this.withLargeTable != true) {
			return;
		}
		//due to Safari layering bugs, the large table dialogs will be layered under the navbar and graphics panel
		//this function avoids this by moving them out of the way and keeping them inside the content panel, where Safari will layer them correctly
		var navPaging = $("#primaryNav").height() + $("#toolbar").height();
		var navFinder = navPaging + $('#currceid').height();
		var largeTablesOffset = 0;
		if (CVPortal.components["cvMedia"].mediaVisible == true) {
			if ($("#graphicsPanel").hasClass("resizable-h")) largeTablesOffset = $("#graphicsPanel").height();
		}
		$("#currceid").css("top", navPaging + largeTablesOffset + "px");
		$("#findDialog").css("top", navFinder + largeTablesOffset + "px");
	},
	
	getTableSec:function(event,prevNext,firstcEID) {
		//TODO: get the table section data and put it into the existing table to display. it may be in current session.
		event = CVPortal.fixEvent(event);
		// no bubbling:
		event.cancelBubble = true;
		
		if (prevNext == "first") {
			$("#currpage").val("1");
			prevNext = "goto";
		}
		if (prevNext == "last") {
			$("#currpage").val($("#totalpages").html());
			prevNext = "goto";
		}
		//retrieve the element that was clicked on:
		var pDiv = document.getElementById("currceid");
		while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
			pDiv = $(pDiv).parent().get(0);
		}		
		var selectedPage="";
		var currcEid = pDiv.getAttribute("currceid");
		if (currcEid=="" || isNaN(currcEid)) currcEid = pDiv.getAttribute("currCEID");
		var dH = this; // store for later
		var newEidIdx=0;
		var ceidList=dH.ceid_array[firstcEID];
		if ( ceidList==undefined) ceidList = pDiv.getAttribute("ceidlist");
			var newCeid="";
		if ( ceidList==undefined || ceidList==""){			
				lturl=CVPortal.getURLwithBookParams("time") + "&target=text&action=get_tablesections&eid=" + firstcEID + "&idsonly=true";
			//idsonly will only return the ceid for all the sections docs
			
			$.ajax( {
				method: "GET",
				async: false,
				dataType: "html",
				url: lturl,
				cache:false,
				success: function(html) {
					ceidList = html.replace(/^\s+|\s+$/g, '');
					dH.ceid_array[firstcEID] = ceidList;
					pDiv.setAttribute("ceidlist",ceidList);
				}
			});	
		}
		var arrCeid =ceidList.split(",");
		if (arrCeid.length>1 && prevNext=="goto"){
			var inputs = pDiv.getElementsByTagName("input");
			var l=inputs.length;
			for (var k=0;k<l;k++){
				var inpt = inputs.item(k);
				if (inpt.getAttribute("name") =="currpage"){
					selectedPage=inpt.value;
					break;
				}
			}			
//			var test= pDiv.getElementById("goto").value;
			if (selectedPage=="" || isNaN(selectedPage) || selectedPage<1 || selectedPage>arrCeid.length) {	
				alert(CVPortal.getResource("alert.please.enter.aValid.page.number.between") + " " + arrCeid.length);
				return;
			}	
			newEidIdx =selectedPage-1;
			newCeid = arrCeid[newEidIdx];
			if (newCeid==undefined) newCeid =firstcEID;		
		}else{
			var currcEidIdx = arrCeid.indexOf(currcEid);
			
			if (currcEidIdx>=0){
				if (prevNext.indexOf("next")==0){
					newEidIdx = currcEidIdx+1;
				}else if (prevNext.indexOf("prev")==0){
					newEidIdx = currcEidIdx-1;
				}else{
					if (selectedPage<1 || selectedPage>arrCeid.length) {	
						alert(CVPortal.getResource("alert.please.enter.aValid.page.number.between") + " " + arrCeid.length);
						return;
					}					
					//currcEid is page number
					newEidIdx = currcEidIdx-1;
				}
				newCeid = arrCeid[newEidIdx];
				if (newCeid==undefined) newCeid =firstcEID;
			}
		}
		if (newCeid!=""){
			var tableDiv = $(pDiv).parent().get(0);
			//check to see the the section is exist in the cache
			var tbdyList = tableDiv.getElementsByTagName("tbody");
			var sectionExist =false;
			var tbdyTobedisplayed="";
			var l = tbdyList.length;
			for (var i=0;i<l;i++){
				var tbdy = tbdyList.item(i);
				if(tbdy.getAttribute("table_id")!=null){
					if (tbdy.getAttribute("ceid") == newCeid){
						sectionExist=true;						
						tbdyTobedisplayed = tbdy;
						break;
					}
				}
			}
						if (sectionExist){
				for (var k=0;k<l;k++){
					var tbdy = tbdyList.item(k);
					if(tbdy.getAttribute("table_id")!=null && tbdy.style.display !="none"){
							tbdy.style.display="none";
							pDiv.setAttribute("currceid",newCeid);
							CVPortal.components['cvDocHandler'].updateNavigationSetting(pDiv,newEidIdx);								
						tbdyTobedisplayed.style.display="";
						CVPortal.components.cvDocHandler.resetCurrentSection(tbdyTobedisplayed.getAttribute("currentpage"),"next");						
						break;						
						}
					}
				}
			}
			if (!sectionExist){
				//need to get the section from server
				var url = CVPortal.getURLwithBookParams("time") + "&target=text&action=text&eid=" + newCeid + "&sectiontype=" + prevNext;
				$.ajax( {
					method: "GET",
					async: false,
					cache:false,
					dataType: "html",
					url: url,
					success: function(html) {
						//TODO:return the table dbody, insert it into the table and show
						var tempDiv = document.createElement('div');
						tempDiv.innerHTML = html;
						var newtbdy="";
						var newtbodyList = tempDiv.getElementsByTagName("tbody");
						for (var j=0;j<newtbodyList.length;j++){
							newtbdy = newtbodyList.item(j);
							if (newtbdy.getAttribute("ceid")==newCeid)
								break;
							else
								newtbdy="";
						}	
					this.loadedSectionCeid += newCeid +",";
					var currShowntbdy = null;
					var tbdy = null;
					var newtbdyAdded =false;
					for (var i=0;i<tbdyList.length;i++){
						tbdy = tbdyList.item(i);
						if(tbdy.getAttribute("table_id")!=null && tbdy.getAttribute("table_id")!=""){
							if (tbdy.style.display !="none" && tbdy.getAttribute("ceid")!=newCeid){
								currShowntbdy = tbdy;
								tbdy.style.display ="none"
									pDiv.setAttribute("currceid",newCeid);
									CVPortal.components['cvDocHandler'].updateNavigationSetting(pDiv,newEidIdx);
								if (newtbdyAdded) break;
							}	
/* 									if( !tbdy.nextSibling )
										tbdy.parentNode.appendChild(newtbdy);
									else
										tbdy.parentNode.insertBefore(newtbdy, tbdy.nextSibling );									
*/							if(!newtbdyAdded){		
								var tbdyCeid= parseInt(tbdy.getAttribute("ceid"));
								var newtbdyCeid= parseInt(newtbdy.getAttribute("ceid"));
								//alert("1old==" + tbdyCeid + "  new==" + newtbdyCeid);
								if( tbdyCeid <newtbdyCeid){
									var ndList = tbdy.parentNode.getElementsByTagName("tbody");
									if(ndList.length>1){
										var sibling = tbdy.nextSibling;
										while (sibling!=null && sibling.nodeType!=1)
										  {
										  sibling=sibling.nextSibling;
							}
										var appended=false;
										while (sibling!=null && parseInt(sibling.getAttribute("ceid"))<newtbdyCeid && sibling.nextSibling){
											sibling = sibling.nextSibling;
											while (sibling!=null && sibling.nodeType!=1)
											  {
											  sibling=sibling.nextSibling;
						}
						
											if (parseInt(sibling.getAttribute("ceid"))>newtbdyCeid){
												//the new tbody should be in between
												sibling.parentNode.insertBefore(newtbdy,sibling);
												appended = true;
												break;
			}
		}
	
										if (!appended && parseInt(sibling.getAttribute("ceid"))<newtbdyCeid) {
											sibling.parentNode.appendChild(newtbdy);
										}else if (!appended && parseInt(sibling.getAttribute("ceid"))>newtbdyCeid){
											sibling.parentNode.insertBefore(newtbdy,sibling);
			}	
		}else{
										tbdy.parentNode.appendChild(newtbdy);
					}					
								}else
									tbdy.parentNode.insertBefore(newtbdy, tbdy );
								newtbdyAdded=true;			
								}
							}
						}
					//if (currShowntbdy) currShowntbdy.style.display="none";
					CVPortal.components.cvDocHandler.resetCurrentSection(newtbdy.getAttribute("currentpage"),"next");
					}
				});	
			}else{
				//the tbody is already on the client side.
			
		}

		if(CVPortal.metaFactory().get("META_WCN_POPUP") == 0) {
			$(CVPortal.components.cvDocHandler.docPanel.getElement(CVPortal.components.cvDocHandler.id)).trigger("resize-panel");
		}
		
	},
	updateNavigationSetting: function(pDiv,newEidIdx) {
		if (!pDiv || pDiv==""){
			return;
		}
		var myIdx = newEidIdx+1;
	
		var totpages=2;
		var spanList = pDiv.getElementsByTagName("span");
		for (var k=0;k<spanList.length;k++){
			var spn = spanList.item(k);
			if (spn.getAttribute("id") =="currpage"){
				spn.innerHTML = newEidIdx+1;
			}else if (spn.getAttribute("id") =="totalpages"){
				totpages = spn.innerHTML;
			}
		
		}
		var inputList = pDiv.getElementsByTagName("input");
		for (var k=0;k<inputList.length;k++){
			var inpt = inputList.item(k);
			if (inpt.getAttribute("id") =="currpage"){
				inpt.value = newEidIdx+1;
			}
		}
		$("#ltp_first").attr('disabled', false);
		$("#ltp_prev").attr('disabled', false);
		$("#ltp_next").attr('disabled', false);
		$("#ltp_last").attr('disabled', false);
		if(newEidIdx==totpages-1) {
			$("#ltp_next").attr('disabled', true);
			$("#ltp_last").attr('disabled', true);
		}
		if(newEidIdx==0) {
			$("#ltp_first").attr('disabled', true);
			$("#ltp_prev").attr('disabled', true);
		}
	},

	loadDocumentByCeId: function(docId, refStruct, noAuditFlag, isHistory) {
		if(! docId || docId == "") {
			CVPortal.error(" { DocHandler } Failed to load document: Missing Doc Id");
			alert(CVPortal.getResource("alert.unable.toLoad.document.broken.link"));
			return;
		}

		this.inHome = false;
		var dH = this,
		url = CVPortal.getURLwithBookParams("time") + "&target=text&action=text&eid=" + docId,
			loaderTime = dH.getProp("loadingMsgDisplayTime") || 500, loadingTimeout;
		$.ajax( {
			type: "GET",
			url: url,
			dataType: "html",
			async: true,
			cache: false,
			beforeSend: function () {
				if (!dH.hideSpinnerForProcessDM) { 
					dH.modalPanel.setContent("<div><div class='loader'></div><span class='bold'>" + CVPortal.getResource("text.loading") + "</span></div>", dH.id);
					loadingTimeout = setTimeout(function () {
						dH.closeModal.hide()
						CVPortal.components["cvModalHandler"].setTitle("");
						CVPortal.components["cvModalHandler"].openModal();
					}, loaderTime);
				}			
			},
			success: function (html) {
				dH.loadingDocument = true;
				if(dH.current) {
					//Add the document to history:
					CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "exit");
				}

				delete dH.current;
				delete dH.yellowArrow;
				delete dH.scrollTop;
				dH.yellowArrowTarget = null;
				dH.currentPartIndex = 1; // for IPC, always default to opening at 1!
				dH.current = new Object();
				dH.current.eid = docId; // store our current EID
				dH.current.ceid = null;
				CVPortal.controlFactory().updateCondition("hasDocument","true");
				CVPortal.components["cvMedia"].unloadMedia();
				
				dH.docPanel.setContent(html, dH.id);
				$(dH.docPanel.getElement(dH.id)).trigger("focus");
				dH.docPanel.getElement(dH.id).scrollTop = 0;
				var tblList = document.getElementsByTagName("table");
				var lgtable=null;
				for (var j=0;j<tblList.length;j++){
					lgtable = tblList.item(j);
					if (lgtable.getAttribute("table_id")!=null && lgtable.getAttribute("table_id")!=""){
						//get all the possible table contents into client side
						break;					
					}
					lgtable=null;
				}
				// get all the document metadata:
				dH.loadDocumentProperties(noAuditFlag);
				CVPortal.info(" {DocHandler} Loaded " + dH.current.docId + " with CEID " + dH.current.ceid + " of type " + dH.current.docType);

				// if there is a DTD/Schema specific handler, call it:
				if(dH[CVPortal.metaFactory().get("META_BOOKTYPE") + "Handler"]) {
					dH[CVPortal.metaFactory().get("META_BOOKTYPE") + "Handler"](refStruct);
				}

				// if there is a docType specific EarlyCheck function, call it.
				// if it returns false, do NOT load the rest of the AJAX requests:
				var continueLoad = true;
				if(dH[dH.current.docType + "EarlyCheck"]) {					
					continueLoad = dH[dH.current.docType + "EarlyCheck"]();				
				}
				
				if( continueLoad ) {
					// do "document on load" functionality:
					// will retrieve information about annotations, wcn, eracs, change data, location, etc
					dH.loadAuxInfo();
					dH.loadAllResourceInfo();
					dH.loadAllDocumentInfo();
				}

				//Add the document to history:
				CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "enter", isHistory);
				// if there is a Document Type specific handler, call it:
				if(dH[dH.current.docType + "Handler"]) {					
					dH[dH.current.docType + "Handler"]();				
				}
				
				// document is officially loaded:
				delete dH.wcn_array_doc_level;
				dH.loadingDocument = false;
				
				// at this time, consider popping WCNs
				dH.loadLargeTable();
				if (dH.current.docType != "maintPlanning" && (document.getElementById("REFMAT_DIV") != null || document.getElementById("MATREQ_DIV") != null || document.getElementById("SUPTEQT_DIV") != null)) {
					CVPortal.controlFactory().updateCondition("hasPrelReqs","true");
				} else {
					CVPortal.controlFactory().updateCondition("hasPrelReqs","false");
				}
				if ($("#rightPanel").is(":visible") == true) {
					var resourceM = CVPortal.components["cvResourceManager"];
					if(resourceM.typeObj) {
						if (resourceM.typeObj.type == "annot") {
							if ($("#resourceTitle").html() == "Notes") resourceM.viewTabletResource("notes");
							if ($("#resourceTitle").html() == "Bookmarks") resourceM.viewTabletResource("bookmarks");
						}
					}
					if ($("#resourceTitle").html() == "Preliminary Reqs") CVPortal._panelFactory.tabletResourcePanelToggle("hide");
					if ($("#rightDialog #form_container").attr("form_name") == "SuspendSession") CVPortal.components.cvResourceManager.viewTabletResource("suspend");

				}
				// handle any refstruct that we were given:
				dH.processRefStruct(refStruct);
				
				if(CVPortal.metaFactory().get("META_HASLARGETABLE") == "true") {
					if ($("#MAIN_CONTENT").attr("tabletotalsections") === "") {
						dH.withLargeTable = 1;
					} else {
						dH.withLargeTable = 2;
					}
				} else {
					dH.withLargeTable = 0;
				}
				if (CVPortal.components["cvMedia"].totalGraphicCount > 0) {
					CVPortal.controlFactory().updateCondition("hasGraphic","true");
				} else {
					CVPortal.controlFactory().updateCondition("hasGraphic","false");
				}
				// if ( ! CVPortal.getIsTablet() && document.getElementById("REFMAT_DIV") != null ) {
				if (document.getElementById("REFMAT_DIV") != null ) {
					CVPortal.controlFactory().updateCondition("hasReferences","true");
				// } else if ( ! CVPortal.getIsTablet() && document.getElementById("REFMAT_DIV") == null) {
				} else if (document.getElementById("REFMAT_DIV") == null) {
					CVPortal.controlFactory().updateCondition("hasReferences","false");
				}					
				if (dH.withLargeTable == 1) {
					CVPortal.controlFactory().updateCondition("hasLargeTable","false");
					//dH.printCtrl.setClickEvent('CVPortal.components.cvDocHandler.showMenu("prtMenu");');
					dH.withLargeTable = false;
				} else if (dH.withLargeTable == 2) {
					CVPortal.controlFactory().updateCondition("hasLargeTable","true");
					//dH.printCtrl.setClickEvent('CVPortal.components.cvPrinter.showPrintDialog();');
					dH.withLargeTable = true;
				}

				if(dH.showSecurityBanners === "1" && dH.classification !== "01" && dH.classification !== "u" && dH.classification !== "") {
					dH.addDMSecurityBanner();
				}
				dH.addDMSecurityBanner();
        
				// Sync TOC if user load DM from Resourse Manager
				if (CVPortal.components.cvResourceManager && CVPortal.components.cvResourceManager.rMsyncTOC) {
					CVPortal.components.cvTOC.synchronizeTOC();
					CVPortal.components.cvResourceManager.rMsyncTOC = false;
					CVPortal.components["cvDocHandler"].navPanel.selectShared("cvTOC");
				}
				
				dH.scrollWithBtn = false;
				dH.bindWCN();
				CVPortal._panelFactory.resizeIpcTable();
			},
			// Failed IN AJAX load:
			error: function(xmlHttp, msg, excep) {
				CVPortal.error(" { DocHandler } Failed to load document by docId: " + docId + ", error msg: " + msg);
			},
			complete: function () {
				if ($("#modalDialog").find(".loader").length) {
					CVPortal.components["cvModalHandler"].hideModal();
					clearTimeout(loadingTimeout);
					dH.closeModal.show();
				}
			}
		});

		if(dH.hideSpinnerForProcessDM && dH.current && dH.current.docType !== "process") {
			dH.hideSpinnerForProcessDM = false;
		}
	},

	bindWCN: function() {
		if(this.inPop != 1) {
			var negative_flag = false;
			// build the list of WCNs and get their Y Positions:	
			this.wcn_array_doc_level = {};
			var comp = this;

			$(".warning_container, .caution_container", this.docPanel.getElement(this.id)).each(function(index) {
					var obj = {};
					obj.topEl = $(this).offset().top - $(comp.docPanel.getElement(this.id)).offset().top;
					obj.heightEl = $(this).outerHeight();
					obj.elem = this;
					obj.index = index; 
					obj.safetyConditions = $(this).parent().attr("id") === "safety-condition-wrapper";
					obj.eid = $("div[wcn]:first", this).attr("eid");
					comp.wcn_array_doc_level[obj.eid] = obj;
					CVPortal.info("[WCN] " + obj.top);
			});

			// make sure nothing needs to be popped right now:
			this.popWCN();
		}
	},
	
	loadLargeTable:function(){
		var allTables = document.getElementsByTagName("table");
		var lgtable=null;
		for (var k=0;k<allTables.length;k++){
			lgtable = allTables[k];
			if (lgtable.getAttribute("table_id")!=null && lgtable.getAttribute("table_id")!="")
				break;
			lgtable=null;
		}
		if (lgtable){
			
			
		}
	},

	createWCNpopup:function(elem, index, isSafetyCond) {
		var comp = this,
		messageBlock = $(elem).clone(),
		i = index;

	
		var mElem = comp.modalPanel.getElement(comp.id);
		if(!$(".wcn_holder", mElem).length) {
			$(mElem).html("<div class='wcn_holder'></div>");
		}

		$(".wcn_inside", messageBlock).append("<input type='button' onClick='CVPortal.components.cvDocHandler.acknowledgeWCN(this," + isSafetyCond +");' value='"+ CVPortal.getResource('alert.acknowledgeWarnings.button') +"'/>");
		
		if(messageBlock[0].getElementsByClassName("wcnPara").length) {
			messageBlock[0].getElementsByClassName("wcnPara")[0].innerHTML = elem.getElementsByClassName("wcnPara")[0].innerText;
		} else {
			messageBlock[0].getElementsByClassName("block")[0].innerHTML = elem.getElementsByClassName("block")[0].innerText;
		}
		
		$(mElem).find(".wcn_holder").append(messageBlock);

			if(!isSafetyCond) {
			comp.wcn_array[comp.current.docId + "-" + i] = 1;
		}
		
	},

	popSafetyConditions: function () {
		var comp = this;
		var showPopup;

			for (var i in comp.wcn_array_doc_level) {
				var obj = comp.wcn_array_doc_level[i];

				// Show SC after user resume session even if they was acknowledged
				if(CVPortal.components.cvDocHandler.isRestoredDM && obj.safetyConditions) {
					comp.createWCNpopup(obj.elem, i, true);
					showPopup = true;
				} else if(obj.safetyConditions && 	comp.wcn_acceptSC[comp.current.docId] != 1) {
					comp.createWCNpopup(obj.elem, i, true);
					showPopup = true;
				}
		}

		if(showPopup && !$("#modalDialog").is(":visible")) {
			this.closeModal.hide()
			comp.wcn_acceptSC[comp.current.docId] = 1;
			CVPortal.components.cvModalHandler.setTitle("");
			CVPortal.components.cvModalHandler.openModal();
		}
	},


	popWCN: function () {
		if (CVPortal.metaFactory().get("META_WCN_POPUP") == 0 && this.inPop != 1) {
				if (this.loadingDocument == false && this.current && this.current.docId && (CVPortal.components["cvMedia"] && CVPortal.components["cvMedia"].currentType !== "unknown")) {
				var comp = this;
				var acknowledge;

				
				if (document.getElementById("safety-condition-wrapper") && comp.wcn_acceptSC[comp.current.docId] != 1) {
					comp.popSafetyConditions();
					return null;
				}

				// ***********************************
				// calculate the current scroll position:
				// ***********************************				
				var scrollTop = $(this.docPanel.getElement(this.id)).scrollTop();
				var height = $(this.docPanel.getElement(this.id)).innerHeight();
				var parentTop = $(this.docPanel.getElement(this.id)).offset().top;
				var fullPos = scrollTop + height;
				// ************************************
				// for each WCN in the list, if the scroll position is above the WCN's TOP, force an acknowledge
				// ************************************

				for (var i in comp.wcn_array_doc_level) {
		
					var obj = comp.wcn_array_doc_level[i];
					// var eid = obj.index;
					var eid = i;
					var wcn_id = comp.current.docId + "-" + eid;


					if (comp.wcn_array[wcn_id] != 1 && !obj.safetyConditions) {
						CVPortal.info("[WCN] Checking: " + eid + ", " + scrollTop + " vs. " + obj.top);


						if (fullPos > obj.topEl + 10) {
							this.createWCNpopup(obj.elem, eid)
							acknowledge = 1;
						}
					}
				}


				if (acknowledge == 1 && !$("#modalDialog").is(":visible")) {
					this.closeModal.hide()
					
					CVPortal.components.cvModalHandler.setTitle("");
					CVPortal.components.cvModalHandler.openModal();
				
				}
			}
		}
	},

	acknowledgeWCN: function (event) {
		var comp = this;

		// CREATE OUR AUDIT EVENT:
		var auditObj = new Object();				
		auditObj.acknowledgeType = $(event).siblings("span").text().trim();
		auditObj.acknowledgeText = encodeURIComponent($(event).siblings("div").text().trim());
		auditObj.docLoadId = this.docLoadId;
		CVPortal.createAuditEvent("acknowledgeWCN", auditObj);

		// remove msg after user acknowledge it
		$(event).parents(".wcn_inside").parent().remove();

		if ($(".wcn_inside", "#modalContent").length == 0) {
			CVPortal.components.cvModalHandler.hideModal();
			this.inPop = 0;
		}
		// reset var to show wcn with scroll after user nav with prev/next btn
		comp.scrollWithBtn = false;
		
		// if user resume session 
		if(comp.isRestoredDM) {
			comp.isRestoredDM = false;
		}
	},

	/**********************
	*
	* a struct that can contain A LOT of information about what a document should do after loading
	*	-- used for history and XREFing across docs
	*
	***********************/
	processRefStruct: function(refStruct) {
		if(refStruct) {
			var dH = this;

			// If DM is filtered out by applicability, do not process refStruct
			if ($(".non_applic").is(":parent")) {
				CVPortal.debug(" {DocHandler} Data moduled filtered by applicability.");
			} else {
				if(refStruct.partEID) {
					this.showSinglePartByAttr(refStruct.partEID, "EID");
				}
				if(refStruct.xrefid) {
					this.handle_xref(refStruct.xrefid, refStruct.xidtype);
				}
				if(refStruct.xidtype=="ipc"){
					//alert("XIDT " + refStruct.xidtype);
					var refName = refStruct.refName;
					this.callHotspotHandler(refName,refName,true,"hotspot");
				}
				
				if(refStruct.documentTab) {
					this.selectDocumentInfo(refStruct.documentTab);
				}				
				if(refStruct.partIndex && refStruct.partIndex != 1) {
					this.currentPartIndex = refStruct.partIndex;
					this.showParts(refStruct.partIndex, false);
				}
				if(refStruct.yellowArrowID || refStruct.yellowArrowEID) {
					var found = 0;
					$("#" + refStruct.yellowArrowID.replace(/\./g,'\\.'), dH.docPanel.getElement(dH.id)).each(function() {
						found = 1;
						dH.selectXrefDocumentTab(this);
						dH.addYellowArrow(this);
					});
					if(found == 0) {
						$("*[EID='" + refStruct.yellowArrowEID + "']", dH.docPanel.getElement(dH.id)).each(function() {
							found = 1;
							dH.addYellowArrow(this);
							dH.selectXrefDocumentTab(this);
						});
					}
				}
				if(refStruct.scrollTop) {
					dH.scrollTop = $(dH.docPanel.getElement(dH.id)).scrollTop(refStruct.scrollTop);
				}

				if(refStruct.currentGraphicEID) {
					if (refStruct.docId == dH.current.docId) {
						CVPortal.components.cvMedia.selectGraphicByEID(refStruct.currentGraphicEID);
					}
				} else if(refStruct.currentGraphic) {
					if (refStruct.docId == dH.current.docId) {
						CVPortal.components.cvMedia.selectGraphic(refStruct.currentGraphic);
					}
				}
				//
				// figuresID and sheet no within that figure:
				if(refStruct.figureId || refStruct.sheetNo) {
					CVPortal.components.cvMedia.selectFigureAndSheetNew(refStruct);
				}
				// play saved RH animation step if saved
				if(refStruct.rhiCurrStep && CVPortal.components.cvMedia) {
					CVPortal.components.cvMedia.rhiPlayStep(refStruct.rhiCurrStep);
				}
				//  SEARCH HANDLING:
				var flags = 0;
				if(refStruct.searchTerm1 || refStruct.searchTerm2) {	//always first blank any highlights if we are dealing with search
					$(dH.docPanel.getElement(dH.id)).removeHighlight();
				}
				if(refStruct.searchTerm1) {
					dH.highlightSearchTerm(refStruct.searchTerm1, refStruct.searchWholeWords, refStruct.searchIgnoreCase);
				}
				if(refStruct.searchTerm2) {
					dH.highlightSearchTerm(refStruct.searchTerm2, refStruct.searchWholeWords, refStruct.searchIgnoreCase);
				}

				// step targets for proced document types:
				if(refStruct.stepTarget || refStruct.stepTarget === 0) {
					// remember the step we were on:
					if(refStruct.stepTarget > 0) {
						this.stepSelected = true;
						this.stepTarget = refStruct.stepTarget - 1;
						this.nextProcedStep();
					} else {
						this.nextProcedStep();
					}

				}

				// insert the process DM control bar if this is a PDM:
				dH.pdmAutoRef = false;
				if(refStruct.processdm == true) { 
					dH.pdmAutoRef = true;
					//alert("Loading PDM reference");
					CVPortal.rootThread.advanceThreadToChild(refStruct, $(".metadata", this.docPanel.getElement(this.id)).get(0));
				}
			}

			// NV Harmonization: set document PDM values
			if(CVPortal.rootThread.currentPDM && CVPortal.rootThread.currentPDM != null) {
				dH.inPDM = true;
				dH.pdmLastType = CVPortal.rootThread.currentPDM.lastType;
				if(CVPortal.components["cvHistory"].fromBack == 1) {
					// if backing up, let last_type reflect the chronologically previous DM type
					var hhix = CVPortal.components["cvHistory"].hix;
					var hcur = (CVPortal.components["cvHistory"].HST[hhix].current) - 1;
					var hrec = CVPortal.components["cvHistory"].HST[hhix].history[hcur];
					dH.pdmLastType = hrec.docType;
				}
			} else {
				dH.inPDM = false;
				dH.pdmLastType = null;
			}
			dH.pdmTOCselect = (refStruct && refStruct.pdmTOCselect == true) ? true : false;
			dH.pdmDocidLoad = (refStruct && refStruct.pdmDocidLoad == true) ? true : false;
			dH.pdmReal = (refStruct && refStruct.real_pdmc != null) ? refStruct.real_pdmc : null;

			// NV Harmonization: Reset proc step nav status
			if(refStruct && refStruct.stepTargetReset) {
				dH.stepTarget = refStruct.stepTargetReset;
			}
			if(refStruct && refStruct.prevStepStack) {
				dH.prevStepStack = refStruct.prevStepStack.slice();
			}
			if(refStruct && refStruct.prevStepString) {
				// from saved session
				dH.prevStepStack = refStruct.prevStepString.split(',');
			}

			if(refStruct && refStruct.completedStepsStack) {
				if(typeof refStruct.completedStepsStack === "string") {
					dH.completedStepsStack = refStruct.completedStepsStack.split(",");
				} else {
					dH.completedStepsStack = refStruct.completedStepsStack;
				}		
			}
			if(refStruct && (typeof refStruct.currStepEID !== 'undefined')) {
				dH.currStepEID = refStruct.currStepEID;
			}
			if(refStruct && (typeof refStruct.nextStepEID !== 'undefined')) {
				dH.nextStepEID = refStruct.nextStepEID;
			}

			if(refStruct && (typeof refStruct.wcn_array !== 'undefined')) {
				dH.wcn_array = JSON.parse(refStruct.wcn_array);
			}

			// NV Harmonization: record if steps are present in this doc
			dH.hasSteps = (dH.nextStepEID != null || dH.prevStepStack.length) ? true : false;

			// NV Harmonization: set initial button status
			if(refStruct && refStruct.backButton == 1) {
				CVPortal.controlFactory().updateCondition("hasPrevDM","true");
			} else {
				CVPortal.controlFactory().updateCondition("hasPrevDM","false");
			}
			if(refStruct && refStruct.forwardButton == 1) {
				CVPortal.controlFactory().updateCondition("hasNextDM","true");
			} else {
				CVPortal.controlFactory().updateCondition("hasNextDM","false");
			}
			if(refStruct && refStruct.prevButton == 1) {
				this.enablePrevStep();
			} else {
				this.disablePrevStep();
			}
			if(refStruct && refStruct.nextButton == 1) {
				this.enableNextStep();
			} else {
				this.disableNextStep();
			}

			// NV Harmonization: Select proper document tab
			if(refStruct && refStruct.documentTab) {
				this.selectDocumentInfo(refStruct.documentTab);
			}

			//	Manage History (Back / Forward) navigation
			CVPortal.components["cvHistory"].updateHistoryButtons();

			if(this.current.docType == "procedure" || this.current.docType == "proced" ||  this.current.docType == "process") {
				if(dH.completedStepsStack != null) {
					Object.keys(dH.completedStepsStack).forEach(function(item) {
						$("input[eid='" + dH.completedStepsStack[item] + "']").prop("checked", "checked");
					});
				}
			}

			// Select current step
			if(this.current.docType == "procedure" ||
				 this.current.docType == "proced" ||
				 this.current.docType == "faultIsolation" ||
				 this.current.docType == "afi" ||
				 this.current.docType == "crew" ||
				 this.current.docType == "process") {

				 if(dH.currStepEID != null) {
					$("span[step_type='1'][eid='" + dH.currStepEID + "']").each(function() {
						dH.selectProcStep(this,true,false);
					});
				}

				// Manage Step (Previous / Next) navigation
				if(dH.pdmAutoRef == true && dH.currStepEID != null && dH.currStepEID != "") {
					dH.nextStepEID = dH.determineNextStep(dH.currStepEID);
				}
				dH.updateStepButtons();

				// Manage Process Step (Proceed / Undo) navigation
				if(this.current.docType == "process" || dH.pdmAutoRef == true) {
					CVPortal.rootThread.enableProcessButtons();
					if(dH.pdmProcStepping == 1 && dH.hasSteps) {
						if(dH.nextStepEID == null || dH.nextStepEID == "") {
							CVPortal.controlFactory().updateCondition("pdmEnableNext","true");
						} else {
							CVPortal.controlFactory().updateCondition("pdmEnableNext","false");
						}
					}
				} else if((this.current.docType == "proced" || this.current.docType == "procedure")
							  && dH.inPDM == true
							  && (dH.hasSteps && (dH.nextStepEID == null || dH.nextStepEID == ""))) {
						CVPortal.controlFactory().updateCondition("pdmEnableNext","true");
				} else {
					if(dH.pdmProcStepping == 1) {
						CVPortal.controlFactory().updateCondition("pdmEnableNext","false");
					}
					if(!CVPortal.rootThread.currentPDM) {
						CVPortal.controlFactory().updateCondition("pdmEnablePrev","false");
					}
				}
			}

			// NV Harmonization: position to yellow arrow if indicated
			var ya = null;
			if(refStruct.yellowArrowID || refStruct.yellowArrowEID) {
				ya = refStruct.yellowArrowID ? refStruct.yellowArrowID : refStruct.yellowArrowEID;
				var yaEl = null;
				$("*[EID='" + ya + "']", dH.docPanel.getElement(dH.id)).each(function() {
					yaEl = this;
				});
				if(yaEl) {
					yaEl.scrollIntoView();
				}
			}
	     			
			// NV Harmonization: Sync TOC if indicated
			if (refStruct.doSyncToc) {
				CVPortal.components["cvTOC"].synchronizeTOC();
			}
		}
	},

	/**********************
	*
	* Activate an XREF of one sort or another:
	***********************/
	// stepID added to signature to allow RH step description to be added to yellow arrow during referencing
	handle_xref: function(xrefid, xidtype, event, stepID, referredFragment) {
    console.info('handle_xref[1]: ' + xrefid + ' : ' + xidtype + ' : ' + stepID + ' : ' + referredFragment);
		var dH = this;
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
				dH.referredFragment = xref_target;
			}
			currentID = el.getAttribute("EID");	// NV Harmonization
		}

		if(el == null && xrefid != null) { // if the EL was not provided...
			$("#" + xrefid, dH.docPanel.getElement(dH.id)).each(function() {
				el = this;
			});
		}

		if(referredFragment) {
			target = referredFragment; // target from hotspot to other DM
		}

		if(xrefid == null || xrefid == "") {  // if arguments are null, get the information from the event-element
			if(el) {
				xrefid = "";
				xidtype = el.getAttribute("xidtype");
				xrefid = el.getAttribute("xrefid");
			}
		}
    console.info('handle_xref[2]: ' + xrefid);

		if(xrefid == null) { // still null?  error:
			CVPortal.error(" {DocHandler} Failed to follow an XREF with the id " + xrefid + " and type " + xidtype);
			if(this.yellowArrow) {
				$(this.yellowArrow).remove();
				dH.yellowArrow = null;
				dH.yellowArrowTarget = null;
			}
			CVPortal.debugAlert(" System unable to follow xref with xrefid: " + xrefid);
			return;
		}
		if(xidtype) {
			// CREATE OUR AUDIT EVENT:
			var auditObj = new Object();						
			auditObj.xrefid = xrefid;						
			auditObj.xidtype = xidtype;						
			if(el) { 		
				auditObj.xrefText = $(el).text();	
				// replace any bad characters in the text string with nice characters:
				auditObj.xrefText = escape(auditObj.xrefText);				
			}			
			
			auditObj.docLoadId = this.docLoadId;						
			CVPortal.createAuditEvent("SelectXref", auditObj);	
			var originalXREF = xrefid;
			xrefid = xrefid.replace(/\./g, '\\.');
			if(event && el) {
				dH.selectXrefText(el);
			}
			CVPortal.debug(" {DocHandler} Attempting XREF ( " + xrefid + ") by Type (" + xidtype +").");
			// FIGURES:
			if(xidtype == "figure" || xidtype == "irtt01") {  //***: Figures:
				CVPortal.components["cvMedia"].selectGraphic(originalXREF);
				dH.selectXrefText(el);
			} else if(xidtype == "catalogSeqNumber" || xidtype == "table" || xidtype == "irtt02" || xidtype == "text" || xidtype == "step" || xidtype == "irtt08" || xidtype == "para" || 
			          xidtype == "irtt07" || xidtype == "irtt12" || xidtype == "other" || xidtype == "item" || xidtype == "name" || xidtype == "prcitem") { //***: text refs
				var found = 0;
				$("#" + xrefid).each(function() {
					found = 1;
					dH.selectXrefDocumentTab(this);
					var doctype = CVPortal.components.cvDocHandler.current.docType;
					var mediaType = CVPortal.components["cvMedia"].getMediaType();
					if (((($("#rhiModel") != undefined) && (mediaType == "rhi")) || CVPortal.components["cvMedia"].rhiCanvasPresent()) && 
					     (xidtype == "para" || xidtype == "irtt07" || xidtype == "irtt12") && (doctype != "illustratedPartsCatalog")){
						dH.rhiAddYellowArrow(this, stepID);
					} else {
						// NV Harmonization: 
						if(xidtype == "step") {
							// Link to step
							dH.linkProcedStep(this);
						} else {
							// this.currStepEID = null; this.nextStepEID = null;
							dH.linkInternal(this,el,currentID,0)	// NV Harmonization
						}
					}
				});
				if(found == 0) { // xref was not located by ID, try EID
					$("[EID='" + xrefid + "']").each(function() {
						found = 1;
						dH.selectXrefDocumentTab(this);
						// NV Harmonization: 
						if(xidtype == "step") {
							// Link to step
							dH.linkProcedStep(this);
						} else if ($("#rightPanel").length > 0 && $("#rightPanel [EID='" + xrefid + "']").length > 0) {
							var lastItem = $("#rightPanel [EID='" + xrefid + "']").length - 1;
							dH.addYellowArrow($("#rightPanel [EID='" + xrefid + "']")[lastItem]);
						} else {
							dH.linkInternal(this,el,currentID,0)	// NV Harmonization
						}
					});
					
					//LCS-3498: sometimes there can be duplicate EIDs. sometimes one instance is the parent of the other.
					//this can cause problems with the above code, so we need to check for various edge cases
					var rightPanelPresent = ($("#rightPanel").length > 0 && $("#rightPanel [EID='" + xrefid + "']")) ? true : false;
					var duplicateEids;
					if (rightPanelPresent) {
						duplicateEids = $("#rightPanel [EID='" + xrefid + "']") > 2 ? true : false;
					} else {
						duplicateEids = $("[EID='" + xrefid + "']") > 2 ? true : false;
					}
					if (duplicateEids && $("span#EID\\." + xrefid).length > 0) {
						$("span#EID\\." + xrefid).each(function() {
							dH.addYellowArrow(this);
						});
					}
				}
        console.info('1367:handle_xref:xrefid=' + xrefid  + '; xidtype=' + xidtype + '; found=' + found);
				if(found === 0) {
					CVPortal.debugAlert("Unable to find XREF target: " + xrefid);
				} 
			} else if(xidtype == "supequip" || xidtype == "irtt05" || xidtype == "spares" || xidtype == "irtt06" || xidtype == "supply" || xidtype == "irtt04") {  //s1000d specific references
				$("#" + xrefid, this.docPanel.getElement(this.id)).each(function() {
					dH.selectXrefDocumentTab(this);			//select the proper document tab
					if ($("#rightPanel").length > 0 && $("#rightPanel").is(":visible")) {
						dH.addYellowArrow($("#rightPanel #" + xrefid)[0]);
					} else {
						//dH.addYellowArrow(this);
						dH.linkInternal(this,el,currentID,1);	// NV Harmonization
					}
				});
			} else if(xidtype == "xref" || xidtype == "XREF") { // another document
				// NV Harmonization
				var target_doctype = null;
				if (el){
					// note position so back button returns here rather than top of DM
					dH.yellowArrowTarget = el;
					dH.yellowArrowTarget.id =  currentID;
					dH.yellowArrowTarget.setAttribute("EID", currentID);
					// determine dmref doctype
					target_doctype = dH.getRefDmTargetDoctype(el);  
				}
				if(CVPortal.rootThread.currentPDM &&
					CVPortal.rootThread.currentPDM != null && 
					target_doctype == "process") {
					// ensure that if in a PDM, another PDM is not linked to
					alert(CVPortal.getResource("alert.troubleshooting.session.is.already.active"));
						return;
				}
				if(target == null && stepID != null) {
					target = stepID;
				}
				if(target != null) {
					var refStruct = new Object();
					refStruct.yellowArrowID = target;
					refStruct.doSyncToc = true;
					// figureId is new in LCS 5.3.1 so setting it here blindly
					refStruct.figureId = target;
					if(target_doctype == "description" || target_doctype == "descript" || target_doctype == "illustratedPartsCatalog" || target_doctype == "ipd" || referredFragment) {
						// Attempt to get the target type (SDL 2013-05-16 tperry)
						var target_type = null;
						if(el) {          
							var target_type = dH.getRefDmTargetType(el); 
							//alert("target_type: " + target_type);
						}      
						// Isolate figure and graphic targets that have a boardno tacked on
						var boardno = "";
						if(target_type && (target_type.substring(0,7) == 'figure:')) {
							refStruct.currentGraphic = target_type.substring(7);
						} else if(target_type && (target_type.substring(0,8) == 'graphic:')) {
							refStruct.currentGraphic = target_type.substring(8);
						}
						dH.loadDocumentByDocId(xrefid, refStruct);
					} else {
						dH.loadDocumentByDocId(xrefid);
					}
				} else {
					dH.loadDocumentByDocId(xrefid);
				}
			} else if (xidtype == "ipc") {
				CVPortal.components["cvMedia"].loadingGraphic == true;
				var refStruct = new Object();
				refStruct.xidtype="ipc";
				refStruct.refName=stepID;
				dH.synchTOC=true;
				dH.loadDocumentByDocId(xrefid, refStruct);
			} else if(xidtype == "refdm") { // a refdm
				dH.scrollTop = $(dH.docPanel.getElement(dH.id)).scrollTop();
				if(xref_target != null) {
					var refStruct = new Object();
					refStruct.yellowArrowID = xref_target;
					//alert("refStruct.yellowArrowID(xref_target)=" + refStruct.yellowArrowID);
					dH.loadDocumentByCeId(xrefid, refStruct);
				} else if(target != null) {
					var refStruct = new Object();
					refStruct.yellowArrowID = target;
					dH.loadDocumentByCeId(xrefid, refStruct);
				} else {
					dH.loadDocumentByCeId(xrefid);
				}
			} else if(xidtype == "multisheethotspot" || xidtype == "hotspot" || xidtype == "irtt11") { // LAM: Custom to highlight
				// <hotspot id="..." xrefid="29000101021" xidtype="csn" apsid="..." apsname="21" graphicICN="..." graphicIndex="1" figureId="F0001"/>
				// <span id="..." class="xref" onclick="..." xrefid="..." xidtype="hotspot" apsname="2">002</span>
				var found = 0;
				var ind = 1;
				try {
					ind = parseInt(CVPortal.components.cvMedia.graphicIndex,10) + 1;
				} catch(e) {
					ind = -1;
				}
				if(xidtype == "multisheethotspot") {
					var apsname = el.getAttribute("apsname");
					// <div id="..." style="display:none;" doctype="illustratedPartsCatalog" data-count="1." graphic="1">
					$("hotspot", $("div[data-count='" + ind + ".']")).each(function() {
						var hotspot = this;
						if (hotspot.getAttribute("apsname") == apsname) {
							found = 1;
							figureID = CVPortal.components.cvMedia.getFigureId();
							CVPortal.components.cvMedia.selectFigureAndSheet(CVPortal.components.cvMedia.getFigureId(), ind);
							// setCurrentGraphic: function(graphic, index, img_type, firstLoad);
							dH.callHotspotHandler(hotspot.getAttribute("apsid"), apsname,true, "hotspot");
							CVPortal.components.cvMedia.graphicIndex = (ind - 1);
						}
					});
				}
				if (found == 0) {
					$("hotspot", this.docPanel.getElement(this.id)).each(function() {
						if(xrefid == this.getAttribute("id") || xrefid == this.getAttribute("xrefid")) {
							// retrieve some graphic oriented attributes:
							found = 1;
							var graphicICN = this.getAttribute("graphicICN");
							var figureID = this.getAttribute("figureId");
							if (dH.current.docType == "ipc"){
								// ipc graphic element doesn't have key, so figureIDs are autogenerated on the fly and can be different each time
								figureID = CVPortal.components.cvMedia.getFigureId();
							}
							CVPortal.debug(" {cvDocHandler} Hotspot Xref: ID " + xrefid + ", APSID: " + this.getAttribute("apsid") + ", APSNAME: " + this.getAttribute("apsname"));

							// we must first load the graphic and THEN activate the hotspot... timing!
							if(graphicICN != CVPortal.components.cvMedia.getGraphicId() || figureID != CVPortal.components.cvMedia.getFigureId()) {
								// pass in the TRUE flag for a delay
								CVPortal.components.cvMedia.selectFigureAndSheet(figureID , this.getAttribute("graphicIndex"));
								//call HotspotHandler replaces direct call to highlightHotspot - handles different hotspot types
								dH.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),true, xidtype);
								// Set the graphic index so the screen's are sync'd
								CVPortal.components.cvMedia.graphicIndex = (parseInt(this.getAttribute("graphicIndex"),10) - 1);
							} else {
								// Highlight the hotspot:
								//call HotspotHandler replaces direct call to highlightHotspot - handles different hotspot types
								if (CVPortal.components.cvMedia.svgLibrary) CVPortal.components.cvMedia.svgLibrary.reset();
								dH.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),false, xidtype);
							}
						}
					});
				}
				if(found === 0) {
					CVPortal.debugAlert("Unable to find hotspot with reference : " + xrefid);
				}
			} else if(xidtype == "multimedia" || xidtype == "irtt10") {
				// code added for handling multimedia refs
				$("hotspot", this.docPanel.getElement(this.id)).each(function() {
					if(xrefid == this.getAttribute("id") || xrefid == this.getAttribute("xrefid")) {
						// retrieve some graphic oriented attributes:
						var graphicICN = this.getAttribute("graphicICN");
						var figureID = this.getAttribute("figureId");

						CVPortal.debug(" {cvDocHandler} Hotspot Xref: ID " + xrefid + ", APSID: " + this.getAttribute("apsid") + ", APSNAME: " + this.getAttribute("apsname"));
						// we must first load the graphic and THEN activate the hotspot... timing!
						if ((graphicICN != CVPortal.components.cvMedia.getGraphicId()) || figureID != CVPortal.components.cvMedia.getFigureId()) {
							//alert("multimedia Select F&S : " + figureID + ", " + this.getAttribute("graphicIndex"));
							CVPortal.components.cvMedia.selectFigureAndSheet(figureID, this.getAttribute("graphicIndex"));
							dH.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),true, xidtype);
						} else {
							dH.callHotspotHandler(this.getAttribute("apsid"), this.getAttribute("apsname"),false, xidtype);
						}
					} 
				});
			} else if(xidtype == "graflink") {
				var sheetNo = el.getAttribute("sheetno");
				var figureId = el.getAttribute("figureId");
				var refName = el.getAttribute("refname");
				CVPortal.debug(" {DocHandler} Hotspot to Figure w/ ID " + figureId + ", to sheet " + sheetNo);
				//alert("graflink Select F&S : " + figureId + ", " + sheetNo + ", " + refName);
				CVPortal.components.cvMedia.selectFigureAndSheet(figureId, sheetNo);
				this.currentXRefType = xidtype;
				this.callHotspotHandler(refName, refName, true, xidtype);
			} else if(xidtype == "sheet" || xidtype == "irtt09") {
				var sheetNo = el.getAttribute("sheetno");
				var figureId = el.getAttribute("figureId");
				CVPortal.debug(" {DocHandler} Hotspot to Figure w/ ID " + figureId + ", to sheet " + sheetNo);
				CVPortal.components.cvMedia.selectFigureAndSheet(figureId, sheetNo);
			} else {
				CVPortal.debugAlert("Unable to handle XREF of unknown type, " + xidtype);
			}
		} else {
			CVPortal.debugAlert("Unable to handle XREF without an XID Type");
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

   /*********************************************************************************
    * DocHandler EXTENSION: getRefDmDoctype	(PROCNAV)
    *********************************************************************************/
   getRefDmTargetDoctype: function(element) {
      // Use xpath_query to get target document doctype
      var dH = this;
      var targetDmCode = element.getAttribute("LC_System_Get_Target_LinkType");
      var query = new Array();
      query.push(".");
      var xml = dH.xpath_query(targetDmCode, query);
      var target_doctype = element.getAttribute("TARGETDOCTYPE");
			if (target_doctype == null) {
				try {
					 $("DOCUMENT", xml).each(function() {
							target_doctype = this.getAttribute("DOCTYPE");
					 });
				} catch (err) {
					 target_doctype = "notfound";
				}
			}
      return target_doctype;
   },

   /*********************************************************************************
    * DocHandler EXTENSION: getRefDmTargetType      NAVSEA tperry 5/16/2013
    *********************************************************************************/
   getRefDmTargetType: function(element) {
      // Use xpath_query to get target element's name (target type)
      var dH = this;
      var targetDmCode = element.getAttribute("LC_System_Get_Target_LinkType");
      var targetId = element.getAttribute("xref_target");
      var query = new Array();
      query.push(".//*[@id='" + targetId + "']");
      var xml = dH.xpath_query(targetDmCode, query);
      var target_type = null;
      try {
         $("#" + targetId, xml).each(function() {
            target_type = this.nodeName;
         });
      } catch (err) {
         target_type = "notfound";
      } 
      // If the target is a figure or a graphic, get the boardno
      var boardno = "";
      if(target_type == 'figure') {
         $("graphic:first", xml).each(function() {
            boardno = this.getAttribute("infoEntityIdent");
            if(boardno == '') {
               boardno = this.getAttribute("boardno");
            }
         });      
      } else if(target_type == 'graphic') {
         $("graphic", xml).each(function() {
            boardno = this.getAttribute("infoEntityIdent");
            if(boardno == '') {
               boardno = this.getAttribute("boardno");
            }
         });      
      }
      // For a figure or a graphic, tack the ICN to the type
      if(boardno != "") {
         target_type += ":" + boardno;
      }
      return target_type;
   },
   
	selectXrefDocumentTab: function(xrefElem) {
		var dH = this;
		var parent = xrefElem.parentNode;
		while(parent) {
			if(parent.getAttribute("cvDocumentTab") == 1) {
				var tabId = parent.id;
				//new prelReq ids are slightly longer, need to have a bit more removed
				var trimLength = parent.className == "prelReqItem" ? 5 : 4;
				tabId = tabId.substr(0, tabId.length - trimLength);
				if(this.current.documentTab == tabId.toLowerCase()) { return; }
				if ($("#rightPanel").length > 0) {
				// if ($("#rightPanel").length > 0 && $("#rightPanel").is(":visible")) {
					this.openTabletDocumentInfo(tabId.toLowerCase());
          dH.current.documentTab = tabId.toLowerCase();
				}
				break;
			}
			parent = parent.parentNode;
		}
	},

	// NV Harmonization: remove yellow arrow:
	removeYellowArrows: function() {
		var dH = this;
		// Hunt down and remove any previous yellow arrow in the document
		$("#CV_YELLOW_ARROW", dH.docPanel.getElement(dH.id)).each(function() {
			dH.yellowArrow = this;
			$(dH.yellowArrow).remove();
			dH.yellowArrow = null;
			dH.yellowArrowTarget = null;
		});
		if(this.yellowArrowText) {
			$(this.yellowArrowText).remove();
		}
	},

	// adding and managing the yellow arrow:
	addYellowArrow: function(element) {
		var dH = this;
		//whack the old arrow
		if(this.yellowArrow) {
			$(this.yellowArrow).remove();
			dH.yellowArrow = null;
			dH.yellowArrowTarget = null;
		}
		if(this.yellowArrowText) {
			$(this.yellowArrowText).remove();
		}
		//insert a new arrow:
		element.innerHTML = '<img id="CV_YELLOW_ARROW" src="' + CVPortal.fetchSkinImage("yellow_arrow.gif") + '"/>' + element.innerHTML;
		dH.yellowArrowTarget = element;
		$("#CV_YELLOW_ARROW").each(function() {
			dH.yellowArrow = this;
			CVPortal.scrollToElement(this);
		});
	},

	// load our XML document that
	loadAuxInfo: function() {
		var url = CVPortal.getURLwithBookParams("time") + "&target=text&action=onload&eid=" + this.current.ceid + "&act_ref=" + this.current.activityRef + "&docid=" + this.current.docId;
		if(this.current.tocRef) {
			url += "&toc_ref=" + this.current.tocRef;
		}
		var dH = this; // store for later
		$.ajax( {
			type: "GET", url: url, dataType: "xml",
			async: true, cache: false,
			success: function (xml) {
				// store this XML for another time:
				dH.auxXML = xml;
				// set our doc properties:
				$("LOCATION", xml).each(function() {
					dH.current.location = CVPortal.metaFactory().get("META_BOOK") + CVPortal.toHtmlText(this.getAttribute("VALUE"));
				});
				// a uniqiness hash:
				var unique = new Object();
				$("ANNITEM", xml).each(function() {
					var offset = CVPortal.getNodeText(CVPortal.getNamedChild(this, "OFFSET"));
					var type = CVPortal.getNodeText(CVPortal.getNamedChild(this, "TYPE"));
					var title = CVPortal.getNodeText(CVPortal.getNamedChild(this, "TITLE"));
					var visibility = CVPortal.getNodeText(CVPortal.getNamedChild(this, "VISIBILITY"));
					if(unique[offset +"_"+type] != 1) {
						dH.createAnnotIcon(offset, type, title, false, visibility);
						unique[offset +"_"+type] = 1;
					} else {
						// do not REDISPLAY annotations twice!
					}
					//dH.current.location = CVPortal.metaFactory().get("META_BOOK") + this.getAttribute("VALUE");
				});
				delete unique;
			},
			error: function() {
				CVPortal.error(" {DocHandler} Failed to fetch auxillary info XML document.");
			}
		});
		//window.open(url, 'debugWindow', 'toolbar=0,location=0,directories=0,scrollbars=1,status=1,menubar=0,resizable=1,top=10,left=10,width=570,height=550');
	},

	loadDocumentProperties: function(noAuditFlag) {
		var dh = this;
		// get our top level DIV:
		this.current.mainDiv = this.docPanel.getElement(this.id);
		$("#MAIN_CONTENT", this.current.mainDiv).each(function() {
			// extract the rest of the properties:
			dh.current.mainDiv = this;
			dh.current.ceid = this.getAttribute("CEID");
			dh.mainDocLoad = false;
			dh.current.tocRef = this.getAttribute("TOCREFID");
			dh.current.tocParent = this.getAttribute("TOCPARENT");
			dh.current.activityRef = this.getAttribute("ACTREFID");
			dh.current.figuresRef = this.getAttribute("FIGREFID");
			dh.current.tablesRef = this.getAttribute("TABREFID");
			dh.current.docType = this.getAttribute("DOCTYPE");
			dh.current.docId = this.getAttribute("DOCUMENT_ID");
			
			//alert(dh.current.docId);
			CVPortal.info(" {DocHandler} dh.current.docId  was " + dh.current.docId);
			if (dh.current.docId == "") {
				CVPortal.info(" {DocHandler} Using dh.current.docId  was EMPTY. Using DMC");
				// switch to DMC since DOCUMENT_ID is not reliable
				// convert DMC
				//S1000DBIKE-AAA-D00-00-00-00AA-041A-A
				// to DOCUMENT_ID
				//S1000DBIKE-AAA-D00-00-00-00-AA-041-A-A
				dmc = this.getAttribute("DMC");
				//alert("dmc was " +dmc);
				var idx = dmc.lastIndexOf('-');
				var tmp = dmc.substring(0, idx);
				// S1000DBIKE-AAA-D00-00-00-00AA-041A //tmp
				var idx2 = tmp.lastIndexOf('-');
				var tmp2 = dmc.substring(0, idx2-2);
				// S1000DBIKE-AAA-D00-00-00-00  // tmp2
				var tmp3=tmp.substring(idx2-2, tmp.length-1);
				//AA-041	//tmp3
				var tmp4=tmp.substring(tmp.length-1, tmp.length);
				//A 		//tmp4
				var newdmc = tmp2 + '-' + tmp3 + '-' + tmp4 + dmc.substring(idx, dmc.length);;
				//alert("newdmc was " + newdmc);
				// NOW store the DMC modified to DOCUMENT_ID format ERMG 8/3/2016
				dh.current.docId = newdmc;
			}
			dh.current.infocode = this.getAttribute("INFOCODE");
			dh.current.largertableId = this.getAttribute("LARGERTABLE_ID");
			dh.current.largertabletotalsections = this.getAttribute("TABLETOTALSECTIONS")
			dh.current.largertablesectionsize = this.getAttribute("TABLESECTIONSIZE")
			dh.current.model = this.getAttribute("MODEL");
			dh.current.security = this.getAttribute("security");
			dh.current.dmCaveat = this.getAttribute("caveat");
			dh.current.handlingrestrictions = this.getAttribute("caveat");

		});
		// set the document title:
		$("#DOCUMENT_TITLE", this.current.mainDiv).each(function() {
			dh.current.title = $(this).text();
		});
		if(noAuditFlag != true && dh.current && dh.current.docId) {						
			// CREATE OUR AUDIT EVENT:								
			var auditObj = new Object();						
			auditObj.docId = dh.current.docId;						
			auditObj.title = dh.current.title;						
			auditObj.docType = dh.current.docType;						
			auditObj.ceid = dh.current.ceid;						
			auditObj.tocRef = dh.current.tocRef;						
			var date = new Date;						
			auditObj.docLoadId = date.getTime();						
			this.docLoadId = auditObj.docLoadId;						
			CVPortal.createAuditEvent("OpenDocument", auditObj);						
		}		
		// default our offsetEid
		dh.current.eidOffset = 0;
	},

	writeDocAuditEvent: function(eventType, refStruct) {		
		if(refStruct != null) {						
			this.storedRefStruct = refStruct;				
		}				
		if(this.current != null) {						
			this.storedRefStruct.title = CVPortal.components.cvDocHandler.current.title;			
			this.storedRefStruct.docId = CVPortal.components.cvDocHandler.current.docId;						
			this.storedRefStruct.docType = CVPortal.components.cvDocHandler.current.docType;						
			CVPortal.createAuditEvent(eventType, this.storedRefStruct);
		} else {						
			timerId = window.setTimeout("CVPortal.components.cvDocHandler.writeDocAuditEvent('"+eventType+"', null)", 500);
		}		
	},

	refreshDocument: function(refStruct, noAuditFlag) {		
		if(this.current && this.current.ceid) {
			this.loadDocumentByCeId(this.current.ceid, refStruct, noAuditFlag);
		} else {
			CVPortal.warn(" {DocHandler} Attempted to refresh a document when one was not selected!");
		}
	},

	loadHome: function() {
		if(this.current) {
			CVPortal.components.cvHistory.prepareHistoryRecord(this, "exit");
		}
		
    if($("#cvHistory").is(":visible")) {
      $("#cvHistory").hide();
      $('#cvTOC').show();
    }

    if($("#cvEmergencyProcedures").is(":visible")) {
      $("#cvEmergencyProcedures").hide();
      $('#cvTOC').show();
    }

    if($("#cvLeftNav").is(":visible")) {
      $("#cvLeftNav").hide();
      $('#cvTOC').show();
    }

    if ($("#setupMenu").is(":visible")) {
      this.hideMenu("setupMenu");
    }
    if ($("#infoMenu").is(":visible")) {
      this.hideMenu("infoMenu");
    }
    if ($("#auxMenu").is(":visible")) {
      this.hideMenu("auxMenu");
      this.showFlashPanel();
    }
    if ($("#rptMenu").is(":visible")) {
      this.hideMenu("rptMenu");
      this.showFlashPanel();
    }
    if ($("#prtMenu").is(":visible")) {
      this.hideMenu("prtMenu");
    }

		// disable all the tabs:
		this.disableResourceInfo();
		this.disableDocumentInfo();

		// disable the graphics panel:
		CVPortal.components.cvMedia.unloadMedia();

		// Collapse the TOC:
		CVPortal.components.cvTOC.collapseAll();

		var url = CVPortal.getURLwithBookParams() + "&target=text";
		var dH = this;
		$.ajax( {
			method: "GET",
			url: url,
			cache: false,
			async: false,
			dataType: "html",
			success: function(html) {
				if (html.indexOf("createjs") != -1 || html.indexOf("Adobe_Animate_CC") != -1) {
					html = CVPortal.components.cvMedia.createCanvasImage(html, "frontmatter");
				} else { 
          html = CVPortal.stripScripts(html, true, 1000);
				}
				delete dH.current;
				dH.current = null;
				dH.inHome = true;
				CVPortal.controlFactory().updateCondition("hasDocument","false");
				CVPortal.controlFactory().updateCondition("hasGraphic","false");
				CVPortal.components.cvTOC.setLocation(CVPortal.metaFactory().get("META_MODEL")) + " \\ ";
				//var html = CVPortal.stripScripts(html);
				dH.docPanel.setContent(html, dH.id);
				//load our intro metadata:
				CVPortal.metaFactory().loadMetaDataFromChunk(dH.docPanel.getElement(dH.id));
				$("#MAIN", dH.docPanel.getElement(dH.id)).each(function() {
					this.style.display = "";
				});
				
				//was intended to resize front matter canvas images, but not needed for Adobe Animate files since they come with their own resizing
				/*if (CVPortal.components.cvMedia.canvasFunctions.length > 0) {
					setTimeout(function() {CVPortal.components.cvMedia.setCanvasSize();},100);
				}*/
				//if we have a flash video to play, load it now:
				if(CVPortal.metaFactory().get("META_INTRO_TYPE") == "flash") {
					dH.homeType = "SWF";
					var movieUrl;
					if(CVPortal.metaFactory().get("META_INTRO") == 1) {
						movieUrl = CVPortal.metaFactory().get("META_MEDIA_PATH") + "navigate.swf";
					} else {
						movieUrl = CVPortal.metaFactory().get("META_MEDIA_PATH") + "navigate.swf";
					}

					if(CVPortal.getBrowserType() == "IE") { //works for IE9/10 but NOT IE11, which must follow the "else" block instead
						$("#flashMovie", dH.docPanel.getElement(dH.id)).each(function() {
							if(navigator.mimeTypes["application/x-shockwave-flash"] == undefined || navigator.mimeTypes["application/x-shockwave-flash"]) {
								this.setVariable("rootOfPath", CVPortal.metaFactory().get("META_MEDIA_PATH"));
								this.loadMovie(1, movieUrl);
							}
						});
					} else {
						$("#flashMovie", dH.docPanel.getElement(dH.id)).each(function() {
							var embedTag = '<embed quality="high" bgcolor="#ffffff" width="100%" height="100%" name="flashMovie" swliveconnect="true" allowScriptAccess="sameDomain" allowFullScreen="false" base="'+CVPortal.metaFactory().get("META_MEDIA_PATH")+'" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="' + movieUrl + '"></embed> ';
							this.innerHTML += embedTag;
						});
					}
				}
			}
		});

		//window.open(url, 'sourceWindow','toolbar=0,location=0,directories=0,scrollbars=1,status=0,menubar=0,resizable=1,top=10,left=10,width=700,height='+ (screen.availHeight - 100));
		//this.sourceWindow.focus();
		CVPortal.controlFactory().updateCondition("hasPrevDM","false");
		CVPortal.controlFactory().updateCondition("hasNextDM","false");
	},


	toggleSettingsMenu: function() {
		CVPortal.components["cvUserPrefs"].getDisplayHighlights();
		if($("#setupMenu").is(":visible")) {
			this.hideMenu("setupMenu");
		} else {
			if($("#infoMenu").is(":visible")) {
				//this.hideMenu("infoMenu");
				this.toggleInfoMenu();
			}
			this.showMenu("setupMenu");
		}
		return;
	},

	toggleInfoMenu: function() {
		if($("#infoMenu").is(":visible")) {
			this.hideMenu("infoMenu");
			this.showFlashPanel();
		} else {
			if($("#setupMenu").is(":visible")) {
				//this.hideMenu("setupMenu");
				this.toggleSettingsMenu();
			}
			this.showMenu("infoMenu");
		}
		return;
	},

	toggleAuxMenu: function() {
		if($("#auxMenu").is(":visible")) {
			this.hideMenu("auxMenu");
			if( ! $("#rptMenu").is(":visible")) {
				this.showFlashPanel();
			}
		} else {
			if($("#rptMenu").is(":visible")) {
				this.hideMenu("rptMenu");
			}
			this.showMenu("auxMenu");
			this.hideFlashPanel();
		}
		return;
	},

	toggleRptMenu: function() {
		if($("#rptMenu").is(":visible")) {
			this.hideMenu("rptMenu");
			if( ! $("#auxMenu").is(":visible")) {
				this.showFlashPanel();
			}
		} else {
			if($("#auxMenu").is(":visible")) {
				this.hideMenu("auxMenu");
			}
			this.showMenu("rptMenu");
			this.hideFlashPanel();
		}
		return;
	},

	hideAllMenus: function(selector) {
		this.hideMenu("setupMenu");
		this.hideMenu("infoMenu");
		this.hideMenu("auxMenu");
		this.hideMenu("rptMenu");
		this.hideMenu("prtMenu");
	},

	hideMenu: function(selector) {
		if (selector == "infoMenu" && $("#infoMenu").is(":visible")) {
			this.hideMenu("auxMenu");
			this.hideMenu("rptMenu");
		}
		if (selector == "auxMenu" || selector == "rptMenu") {
			this.showFlashPanel();
		}
		var id = "#" + selector;
		if ($(id).is(":visible")) {
			$(id).hide();
		}
		return;
	},

	showMenu: function(selector) {
		var id = "#" + selector;
		if (!$(id).is(":visible")) {
			$(id).show();
		}
	},
	
	hideFlashPanel: function() {
		if ("ActiveXObject" in window) {
			if ($("#META_INTRO_TYPE").attr("content") == "flash") {
				$("#cvDocHandler.contentPanel").hide();
			}
			if (CVPortal.components["cvMedia"].activex == "1" || $("#MAIN > object").attr("classid") !== undefined || $("#graphic_content > object").attr("classid") !== undefined) {
				$("#graphic_content").hide();
			}
		}
	},

	showFlashPanel: function() {
		if ("ActiveXObject" in window) {
			if ($("#META_INTRO_TYPE").attr("content") == "flash" && ! $("#cvDocHandler.contentPanel").is(":visible")) {
				$("#cvDocHandler.contentPanel").show();
			}
			if (CVPortal.components["cvMedia"].activex == "1" || $("#MAIN > object").attr("classid") !== undefined || $("#graphic_content > object").attr("classid") !== undefined) {
				$("#graphic_content").show();
			}
		}
	},
	
	loadPrimarySkin: function() {
		if (CVPortal.metaFactory().get("META_SKIN_ALT")) {
			var primarySkin = CVPortal.metaFactory().get("META_SKIN_ALT");
			var url = CVPortal.getURLwithBookParams("time") + "&target=main&action=change_mode&skin_name=" + primarySkin + "&customer_mode=1";
			$.ajax( {
				type: "GET",
				url: url,
				async: false,
				cache: false,
				success: function () {
					CVPortal.info(" {DocHandler} Changing to primary skin: " + primarySkin);
					location.href = CVPortal.getURLwithBaseParams() + "&target=main&&action=host_win&book=" + $("#META_BOOK").attr("content") 
						+ "&collection="+$("#META_COLLECTION").attr("content");
					
				},
				error: function(data) {
					CVPortal.error(" {DocHandler} Unable to load skin: " + primarySkin);
				}
			});
		} else {
			CVPortal.error(" {DocHandler} Primary skin not defined: " + primarySkin);
			alert(CVPortal.getResource("alert.skin.isUndefined1") + " " + primarySkin + " " + CVPortal.getResource("alert.skin.isUndefined2"));
		}
		if($("#setupMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleSettingsMenu();
		}
		if($("#infoMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleInfoMenu();
		}
		if($("#auxMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleAuxMenu();
		}
		if($("#rptMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleRptMenu();
		}
		location.reload();
	},
	
	loadAltSkin: function() {
		if (CVPortal.metaFactory().get("META_SKIN_ALT")) {
			//var altSkin = CVPortal.metaFactory().get("META_SKIN_ALT");
			var altSkin = "CarbonM";
			var url = CVPortal.getURLwithBookParams("time") + "&target=main&action=change_mode&skin_name=" + altSkin + "&customer_mode=1";
			$.ajax( {
				type: "GET",
				url: url,
				dataType: "xml",
				async: false,
				cache: false,
				success: function () {
					
					CVPortal.info(" {DocHandler} Changing to primary skin: " + altSkin);
				},
				error: function() {
					CVPortal.error(" {DocHandler} Unable to load skin: " + altSkin);
				}
			});
		} else {
			CVPortal.error(" {DocHandler} Primary skin not defined: " + altSkin);
			alert(CVPortal.getResource("alert.skin.isUndefined1") + " " + altSkin +  " " + CVPortal.getResource("alert.skin.isUndefined2"));
		}
		if($("#setupMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleSettingsMenu();
		}
		if($("#infoMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleInfoMenu();
		}
		if($("#auxMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleAuxMenu();
		}
		if($("#rptMenu").is(":visible")) {
			CVPortal.components.cvDocHandler.toggleRptMenu();
		}
		location.reload();
	},

	/***********************
	*
	* Resource List tabs...
	************************/
	//
	// Resource-List Centric functionality:
	//
	setupResourceInfo: function() {
		var tList = this.getProp("resourceTabList");
		// Create a temporary list of ResourceInfo tabs,
		// only push onto the official this.resInfo[] array if there is a registered control!
		resInfoTemp = new Array();
		this.resInfo = new Array();
		resInfoTemp = tList.split("|");

		//also load the XSL in advance for this processing:
		for(var i = 0; i < resInfoTemp.length; i++) {
			//  Resouce Centric tab sets:
			// get the virtual control:
			var tempTab = this.getVirtualControl(resInfoTemp[i]);
			if(tempTab != null) {
				this.resInfo.push(resInfoTemp[i]);
				this[resInfoTemp[i] + "Tab"] = tempTab;
				this[resInfoTemp[i] + "Tab"].disable(); // disable:
				// set their clicks:
				this[resInfoTemp[i] + "Tab"].setClickEvent('CVPortal.components["cvDocHandler"].navPanel.selectShared("cvDocHandler");CVPortal.components["cvDocHandler"].selectResourceInfo("' + resInfoTemp[i] + '");CVPortal.components["cvDocHandler"]["' + resInfoTemp[i] + 'Tab"].highlight();');

				this[resInfoTemp[i] + "Current"] = null;
				// load the respective XSL for this resouce list
				var xslName = resInfoTemp[i];
				if(xslName == "activity" && this.activityInTOC == 1) {
					this.cvLoadXSLT("activityInTOC", resInfoTemp[i] + "XSL", false);
				} else {
					this.cvLoadXSLT(resInfoTemp[i], resInfoTemp[i] + "XSL", false);
				}
				$(this.navPanel.getElement(this.id)).append("<div id='" + resInfoTemp[i] + "' style='display:none;'></div>");
			} else {
				CVPortal.error(" {DocHandler} A tab (" + resInfoTemp[i][i] + ") was included in the &lt;prop name='resourceTabList'&gt; that is not a registered control!");
			}
		}
	},

	// attempt to load the three resource-lists who have been pushed onto the resInfo list
	loadAllResourceInfo: function() {
		// load resource lists
		for(var i = 0; i < this.resInfo.length; i++) {
			this[this.resInfo[i] + "Current"] = null;
			this.loadResourceInfo(this.resInfo[i]);
		}
	},

	// load an individual resource info tab
	loadResourceInfo: function(type) {
		var dh = this;
		// dh[type + "Tab"].disable();
		
		// skip tables now, as tables are included in the activity XML:
		if(type == "tables") return;
		
		if(dh.current[type + "Ref"]) {
			$(this.navPanel.getElement(this.id)).children("div[id = " + type + "]").each(function() {
				var tNode = this;
				var url;
				var requestType;
				
				if (type == "activity") {
					requestType = "html";
					url = CVPortal.getURLwithBookParams("time") + "&target=text&action=" + type + "&server=1&eid=" + dh.current.ceid + "&refid=" + dh.current[type + "Ref"];
				} else {
					requestType = "xml";
					url = CVPortal.getURLwithBookParams("time") + "&target=text&action=" + type + "&eid=" + dh.current.ceid + "&refid=" + dh.current[type + "Ref"];
				}
				$.ajax( {
					type: "GET",
					url: url,
					dataType: requestType,
					async: false,
					cache: false,
					success: function (response) {
						if(type == "figures") {
							CVPortal.components["cvMedia"].loadMedia(response, false);
						}

						if(type == "activity" && dh.activityInTOC == 1) {
							if(CVPortal.components.cvTOC.currentItem) {
								var container;
								var key_att;
								if(CVPortal.components.cvTOC.currentItem.getAttribute("SYSDOCEID")) {
									key_att = CVPortal.components.cvTOC.currentItem.getAttribute("SYSDOCEID");
									container = CVPortal.components.cvTOC.currentItem;
									// alert("SYSDOC!");
								} else {
									key_att = CVPortal.components.cvTOC.currentItem.getAttribute("REFID");
									// alert("DOC!" + key_att);
									container = CVPortal.components.cvTOC.currentItem;
								}
								
								if(dh.current.ceid == key_att) {
									//load the auxillary lists:
									if (dh.currentActivity && dh.activityInTOC == 1) {
										// leave the current activity list in place until it is changed:
										dh.currentActivity.style.display="none";
										$(dh.currentActivity).empty();
										dh.currentActivity=null;
									}
								
									$("#ACT_" + key_att, container).each(function(){
										$(this).html(response);
										//dh.cvTransformXML(response, type + "XSL", this);
										this.style.display="";
										dh.currentActivity=this;
									});
								} else {
									// the TOC is NOT synchronized, do not load this information in!
								}
								// Display the TOC item portion marking code if in a classified IETM
								if (CVPortal.metaFactory().get("META_BOOKTYPE") == "S1000D") {
									if (dh.classification == "02" || dh.classification == "03" || dh.classification == "04" || dh.classification == "05") {
										$(".itemMark", CVPortal.components.cvTOC.tocPanel.getElement(CVPortal.components.cvTOC.id)).show();
									}
								} 
							}
							return;
						}
						// ===========================================
						// skip taking over the tabs (tables, figures) and let them by IETM-wide lists!
						// ===========================================
						return;

					},
					error: function() {
						CVPortal.error(" {DocHandler} Failed while loading a resouce list, of type " + type);
					}
				});
			});
		}
	},

	//********************************************
	//**
	//**		Opens and Closes document List of Illustration and List of Tables groups:
	//**
	//********************************************
	toggleActivityGroup: function(event) {
		// retrieve the event
		var element = CVPortal.eventGetElement(CVPortal.fixEvent(event));

		var oldElement = element;
		var element = element.parentNode;

		while (element.nodeName != "DIV") {
			element = element.parentNode;	      
		}

		if($("div[act_group]", element).css("display") == "none") {
			$("div[act_group]", element).show();
			$(element).css("font-weight", "bold");
			$("img.plusbutton", element).each(function() { this.setAttribute("src", CVPortal.fetchSkinImage("minus.png"));  });
		} else {
			$("div[act_group]", element).hide();
			$(element).css("font-weight", "normal");		
			$("img.plusbutton", element).each(function() { this.setAttribute("src", CVPortal.fetchSkinImage("plus.png"));  });		
		}
	},
	
	// when we click on a tab, the panel factory will select the docHandler shared panel, but within that shared panel, we need to display the inner-div (tables, acvitity, figures)
	selectResourceInfo: function(type) {
		var saved = null;
		$(this.navPanel.getElement(this.id)).children("div").each(function() {
			if(this.getAttribute("id") == type) {
				saved = this;
			} else {
				this.style.display = "none";
			}
		});
		if(saved) {
			saved.style.display = "";
		}
	},


	disableResourceInfo: function() {
		for(var i = 0; i < this.resInfo.length; i++) {
			this[this.resInfo[i] + "Tab"].disable();
		}
	},

	/***********************
	*
	* Document tabs...
	************************/
	setupDocInfo: function() {
		var tList = this.getProp("documentTabList");
		// Create a temporary list of DocInfo tabs,
		// only push onto the official this.docInfo[] array if there is a registered control!
		docInfoTemp = new Array();
		this.docInfo = new Array();
		docInfoTemp = tList.split("|");

		// Document centric tab sets:
		// for Reference Materials, Materials Required, and Supporting Equipment
		// -get a virtual control for each tab from our components.xml
		for(var i = 0; i < docInfoTemp.length; i++) {
			var tempTab = this.getVirtualControl(docInfoTemp[i]);
			if(tempTab != null) {
				this.docInfo.push(docInfoTemp[i]);
				this[docInfoTemp[i] + "Tab"] = tempTab;
				// save the current scroll on the tab:
				this[docInfoTemp[i] + "Tab"].scrollSave = 0;
				this[docInfoTemp[i] + "Tab"].setClickEvent('CVPortal.components["cvDocHandler"].selectDocumentInfo("' + docInfoTemp[i] + '");');
			} else {
				CVPortal.error(" {DocHandler} A tab (" + docInfoTemp[i] + ") was included in the &lt;prop name='documentTabList'&gt; that is not a registered control!");
			}
		}
		// clean up the temp array explicity:
		delete docInfoTemp;

		// ready our tabs--start by highlighting the main tab:
		this.mainTab.highlight();
		// ... all other tabs start disabled.
	},
	
	loadAllDocumentInfo: function() {
		//enable tabs document tabs if...
		var activeTabs = 0;
				
		for(var i = 0; i < this.docInfo.length; i++) {
			if($("#" + this.docInfo[i].toUpperCase() + "_DIV", this.docPanel.getElement()).length) {
				this[this.docInfo[i] + "Tab"].enable();
				activeTabs++;
			} else {
				this[this.docInfo[i] + "Tab"].disable();
			}
			// set the scroll for all of these back to 0:
			this[this.docInfo[i] + "Tab"].scrollSave = 0;
		}
		// Only activate doc info dropdown if there are options to choose
		this.current.documentTab = this.docInfo[this.docInfo.length - 1];
		// always highlight the Task tab:
		this[this.docInfo[this.docInfo.length - 1]+"Tab"].highlight();
	},

	selectDocumentInfo: function(type) {
		var dH = this;
		var saved = null;
		
		// store and restore the scrolling on the document pane:
		var currentScroll = $(dH.docPanel.getElement(dH.id)).scrollTop();
		var targetScroll = 0;
		
		// store and restore scrolling
		for(var i = 0; i < this.docInfo.length; i++) {
			if(dH[dH.docInfo[i] + "Tab"].disabled == -1) {
				dH[dH.docInfo[i] + "Tab"].scrollSave = currentScroll;
			}		
		}
		
		for(i = 0; i < this.docInfo.length; i++) {
			$("#" + dH.docInfo[i].toUpperCase() + "_DIV", dH.docPanel.getElement()).each(function() {
				if(dH.docInfo[i] != type) {
					$(this).hide();
				} else {
					dH[type + "Tab"].highlight();
					targetScroll = dH[type + "Tab"].scrollSave;
					saved = this;
				}
			});
		}
		$(saved).show();
		this.current.documentTab = type;
		
		// finally, set the scroll in the pane to the saved-scroll:
		dH.docPanel.getElement(dH.id).scrollTop = targetScroll;
	},

	disableDocumentInfo: function() {
/* 		for(var i = 0; i < this.docInfo.length; i++) {
			this[this.docInfo[i] + "Tab"].disable();
		}
 */	},
	
	//tablet doc tabs (Preliminary Requirements)
	openTabletDocumentInfo: function(type) {
		var refMat = document.getElementById("REFMAT_DIV");
		var matReq = document.getElementById("MATREQ_DIV");
		var suptEqt = document.getElementById("SUPTEQT_DIV");
		if (!CVPortal.components.cvDocHandler.current) {
			alert(CVPortal.getResource("alert.noData.module.selected"));
			return;
		}
		else if (refMat == null && matReq == null && suptEqt == null) {
			alert(CVPortal.getResource('alert.thisData.module.has.noPreliminary.requirements.information'));
			return;
		}
		$("#rightTitle").empty();$("[cvResourceAction='1']").hide();$("#rightButtons").empty();
		$("#rightDialog").empty();
		$("#rightList").empty();
		var prelImage = CVPortal.fetchSkinImage("tools.view-frontend.32-disabled.png");
		var htmlString = "";
		$("#rightTitle").html("<div id='resourceTitle' style='border:0px;'>Preliminary Reqs</div>");
		if (refMat != null) {
			htmlString += "<div class='prelReqItem' id='refMatTitle' cvDocumentTab='1' onclick='$(&quot;#refMatTitle .prelReqContent&quot;).toggle()'><div class='prelReqTitle'>" + CVPortal.getResource("openTabletDocumentInfo.reference.materials") + "<span class='prelReqAccordion'>V</span></div>";
			htmlString += "<div class='prelReqContent'>";
			$("#REFMAT_DIV > div").each(function(index) {htmlString += this.outerHTML});
			htmlString += "</div></div>";
		}
		if (matReq != null) {
			htmlString += "<div class='prelReqItem' id='matReqTitle' cvDocumentTab='1' onclick='$(&quot;#matReqTitle .prelReqContent&quot;).toggle()'><div class='prelReqTitle'>" + CVPortal.getResource("openTabletDocumentInfo.required.materials") + "<span class='prelReqAccordion'>V</span></div>";
			htmlString += "<div class='prelReqContent'>";
			$("#MATREQ_DIV > div").each(function(index) {htmlString += this.outerHTML});
			htmlString += "</div></div>";
		}
		if (suptEqt != null) {
			htmlString += "<div class='prelReqItem' id='suptEqtTitle' cvDocumentTab='1' onclick='$(&quot;#suptEqtTitle .prelReqContent&quot;).toggle()'><div class='prelReqTitle'>" + CVPortal.getResource("openTabletDocumentInfo.support.equipment") + "<span class='prelReqAccordion'>V</span></div>";
			htmlString += "<div class='prelReqContent'>";
			$("#SUPTEQT_DIV > div").each(function(index) {htmlString += this.outerHTML});
			htmlString += "</div></div>";
		}
		$("#rightHidden").html(htmlString);
		if(type) {
			if (type == "refmat") $("#refMatTitle").trigger("click");
			if (type == "matreq") $("#matReqTitle").trigger("click");
			if (type == "supteqt") $("#suptEqtTitle").trigger("click");
		}
		CVPortal._panelFactory.tabletResourcePanelLayout("hide");
		CVPortal._panelFactory.tabletResourcePanelToggle("show");
	},

	/******************************
	*
	*  Annotation functions--those which the document is in control of
	*
	********************************/
	createAnnotIcon: function(offset, type, title, hasAttachments, visibility) {
		var dH = this; // save the reference for later use..
		$("#MAIN_DIV", dH.docPanel.getElement(dH.id)).each(function() {
			var htmlString = "";
			var annotImg;
			if(type == "B") { // for Bookmarks type..
				if(visibility == "PUBLIC") {
					annotImg = CVPortal.fetchSkinImage("publicbookmark.gif");
				} else {
					annotImg = CVPortal.fetchSkinImage("bookmark.gif");
				}

				htmlString = "<span class='annotationIcon' id='BM_" + offset + "' onClick='CVPortal.components.cvDocHandler.clickOnBookmark(event);' OFFSET='" + offset + "'><img id='BM_ICON_" + offset +"' src='" + annotImg + "' alt='Bookmark: " + title + "' title='Bookmark: " + title + "'/></span>";
			} else if(type == "N") {
				if(visibility == "PUBLIC") {
					annotImg = CVPortal.fetchSkinImage("publicnote.gif");
				} else {
					annotImg = CVPortal.fetchSkinImage("note.gif");
				}

				htmlString = "<span class='annotationIcon' id='NOTE_" + offset + "' onClick='CVPortal.components.cvDocHandler.clickOnNote(event);'><img id='NOTE_ICON_" + offset +"' src='" + annotImg + "' alt='Note: " + decodeURIComponent(title) + "' title='Note: " + decodeURIComponent(title) + "'/></span>";
			}else if(type == "A") {
				if(visibility == "PUBLIC") {
					annotImg = CVPortal.fetchSkinImage("attach.gif");
				} else {
					annotImg = CVPortal.fetchSkinImage("attach.gif");
				}

				htmlString = "<span class='annotationIcon' id='ATT' onClick='CVPortal.components.cvDocHandler.clickOnAttachment(event);'><img id='ATT_ICON_' src='" + annotImg + "' title='Attachment'/></span>";
			}
			$(this).prepend(htmlString);

		});
	},

	clickOnBookmark: function() {
		if(CVPortal.components["cvResourceManager"].isTablet) CVPortal.components['cvResourceManager'].viewTabletResource('bookmarks');
		else CVPortal.components["cvResourceManager"].showBookmarkDialog('edit');
	},

	clickOnNote: function() {
		if(CVPortal.components["cvResourceManager"].isTablet) {
			CVPortal.components['cvResourceManager'].viewTabletResource('notes');
		} else  {
			CVPortal.components["cvResourceManager"].showNotesDialog('edit');
		}
	},

	clickOnAttachment: function() {
		//we don't want attachments to work on tablets
		if(CVPortal.components["cvResourceManager"].isTablet) return;
		else CVPortal.components["cvResourceManager"].showAttachmentDialog('edit', true);
	},
	
	editAnnotIcon: function(eidOffset,type, title, hasAttachments, visibility) {
		var dH = this;
		var htmlString;
		console.info('editAnnotIcon................');
		if(type == "B") {
			$("#BM_"+eidOffset, dH.docPanel.getElement(dH.id)).each(function() {
				var annotImg;
				$("#BM_ICON_" + eidOffset, this).each(function() {  annotImg = this; });
				annotImg.alt = "Bookmark: "+title;
				annotImg.setAttribute("title", "Bookmark: " + title);
				if (visibility == "PUBLIC")
				{
					annotImg.src = CVPortal.fetchSkinImage("publicbookmark.gif");
					annotImg.style.width = 32;
				} else {
					annotImg.src = CVPortal.fetchSkinImage("bookmark.gif");
					annotImg.style.width = 16;
				}
			});
			if ($("#BM_"+eidOffset, dH.docPanel.getElement(dH.id)).length == 0) {
				this.createAnnotIcon(eidOffset,type, title, hasAttachments, visibility);
			}
		} else if(type == "N"){

			$("#NOTE_"+eidOffset, dH.docPanel.getElement(dH.id)).each(function() {
				var annotImg;
				$("#NOTE_ICON_" + eidOffset, this).each(function() {  annotImg = this; });
				annotImg.alt = "Note: "+title;
				annotImg.setAttribute("title", "Note: "+title);
				if (visibility == "PUBLIC") {
						annotImg.src = CVPortal.fetchSkinImage("publicnote.gif");
						annotImg.style.width = 32;
				} else {
					annotImg.src = CVPortal.fetchSkinImage("note.gif");
					annotImg.style.width = 16;
				}
			});
			if ($("#NOTE_"+eidOffset, dH.docPanel.getElement(dH.id)).length == 0) {
				this.createAnnotIcon(eidOffset,type, title, hasAttachments, visibility);
			}
		} else if(type == "A") {
			if ($("#ATT", dH.docPanel.getElement(dH.id)).length == 0) {
				this.createAnnotIcon(null,type, title, hasAttachments, visibility);
			}
		}
	},

	deleteAnnotIcon: function(eid, type, eidOffset) {
		var dH = this;
		if(eid != "" && type != "" && type != "A"){ //  deleting single annotation...
			if (!this.current) return;
			if(this.current.docId == eid){ //delete the annotation icon if the curent document has any..
				var annotName;
				if(type == "B") {
					annotName = "BM";
				} else if(type== "N") {
					annotName = "NOTE";
				}
				$("#" + annotName + "_" + eidOffset, dH.docPanel.getElement(dH.id)).each(function() {
					this.parentNode.removeChild(this);
				});
			}

		} else { // deleting all annotations..
			var ceid = this.isDocumentOpen();
			if(ceid != false) { //delete icon only a document is open...
				var deleteList = new Array();
				if (type == "B" || type == "") {
					$("#BM_0", dH.docPanel.getElement(dH.id)).each(function() {
						this.parentNode.removeChild(this);
					});
				}
				if (type == "N" || type == "") {
					$("#NOTE_0", dH.docPanel.getElement(dH.id)).each(function() {
						this.parentNode.removeChild(this);
					});
				}
				if (type == "A" || type == "") {
					$("#ATT", dH.docPanel.getElement(dH.id)).each(function() {
						this.parentNode.removeChild(this);
					});
				}
			}
		}
	},

	//***********************************
	//
	// Responding to Searching
	//  --highlight term, for example:
	//
	//***********************************
	highlightSearchTerm: function(term, wholewords, ignorecase) {
		// strip things like " out of the search term:
		// must replace beginning and ending space or will not get hits
		term = term.replace(/"/, '').replace(/"/, ''); // replace up to two "
		// alert("-" + term + "-");
		//the highlight function from version 3 has api changed.
		//$.highlight($(this.docPanel.getElement(this.id)).get(0), term.toUpperCase());
		// note - copied and modified jquery.highlight-1.js highlight code
		// to handle whole words. Included new funtion in this script - ERMG 11/11/2015
		if (wholewords==true) {
			$.highlightwhole($(this.docPanel.getElement(this.id)).get(0), term.toUpperCase());
		}
		else {
			$($(this.docPanel.getElement(this.id)).get(0)).highlight(term);
		}
		$(".highlight:eq(0)", this.docPanel.getElement(this.id)).each(function() {
			this.scrollIntoView();
		});
	},

	//***********************************
	//
	// DocType Specific Handlers:
	//
	// PROCESS
	// CONTAINER
	//***********************************
	processHandler: function() {
		// auto-proceed to the next step, preset, or post-set with a process DM:
		$("#SYSTEM_PROCESSDM_AUTO_PROCEED:eq(0)", this.docPanel.getElement(this.id)).each(function() {
			if($(this).val() == "TRUE") {
				var nType = $(this).attr("node_type");
				if(nType == "applic" || nType == "refdm") {
					// ignore applic'ed out dm-nodes
				} else if(nType == "initialize" || nType == "init" || nType == "preset" || nType == "postset") {
					submitProcessDM(1);
				} else {
					CVPortal.error("Error: PDM returned an unrecognized SYSTEM_PROCESSDM_AUTO_PROCEED key.");
					// submitProcessDM(0);
				}
			}
		});		
	},

	containerHandler: function() {
		var comp = this;
		$("#MAIN_DIV span.xref:first", this.docPanel.getElement(this.id)).each(function() {
			comp.handle_xref(null, null, {srcElement: this});
		});
	},

	// if the process DM is going to auto-proceed, skip the rest of the AJAX calls
	processEarlyCheck: function() {
		var ec = true;
		$("#SYSTEM_PROCESSDM_AUTO_PROCEED", this.docPanel.getElement(this.id)).each(function() {
			if($(this).val() == "TRUE") {
				ec = false;
			}
		});
		return ec;
	},
	
	//***********************************
	//
	// DocType Specific Handlers:
	//
	// IPC
	//***********************************
	ipcHandler: function() {
		if(this.getProp("S1000D_IPC_ShowFullList") != 1) {
			$("#PARTS_LIST", this.docPanel.getElement(this.id)).show();
			$("#PARTS_SCROLL", this.docPanel.getElement(this.id)).show();
			if(this.currentPartIndex) {
				this.showParts(this.currentPartIndex, false);
			} else {
				this.showParts(1, false);
			}
		}
	},

	showParts: function(index, showAll) {
		var dH = this;
		var found = 0;
		$("#PARTS_LIST", this.docPanel.getElement(this.id)).each(function() {
			var i = 0;
			$("tr", this).each(function(i) {
				if(i > 0) { // skip the header row:
					if(index == i || showAll == true) {
						found = 1;
						dH.currentPartIndex = i;
						$(this).show();
					} else {
						if(dH.getProp("S1000D_IPC_ShowFullList") != 1) {
							$(this).hide();
						}
					}
				}
				i++;
			});
		});
		if(found == 0) {
			this.showParts(this.currentPartIndex, false);
		}
	},

	showSinglePartByAttr: function(id, attr) {
		// do not strip leading 00's if csn, they are allowed
		if(attr != "csn") {
			// if not csn, always try to strip leading 00's
			id = this.replaceLeadingZeros(id);
		}

		var dH = this;
		var found = 0;
		$("#PARTS_LIST", this.docPanel.getElement(this.id)).each(function() {

			// this code is simpler and works great for CSN refs:
			if(attr != "item") {
				$("tr[id='" + attr + "." + id + "']", this).each(function() {
					$("td:eq(0)", this).each(function() {
						dH.addYellowArrow(this);
						found = 1;
					});				
				});
				if (!found) {
					$("tr["+attr+"='"+id+"']", this).each(function() {
						$("td:eq(0)", this).each(function() {
							dH.addYellowArrow(this);
							found = 1;
						});				
					});
				}
			} else {
				// this specifically works for attr="item"
				var i = 0;
				var itemFound = false;
				$("tr", this).each(function(i) {
					if(i > 0 && itemFound == false) { // skip the header row:
						var attrVal = this.getAttribute(attr);
						attrVal = dH.replaceLeadingZeros(attrVal);
						num_id = parseInt(id, 10);
						num_attrVal = parseInt(attrVal, 10);
						if(id == attrVal || (num_id == num_attrVal && ! isNaN(num_id))) {
							found = 1;
							dH.currentPartIndex = i;
							if(dH.getProp("S1000D_IPC_ShowFullList") == 1) {
								$(this).show();
							}
							$("td:eq(0)", this).each(function() {
								dH.addYellowArrow(this);
								itemFound = true;
							});
						}  else {
							if(dH.getProp("S1000D_IPC_ShowFullList") != 1) {
								$(this).hide();
							}
						}
					}
					i++;
				});
			}
		});
		if(found == 0) {
			this.showParts(this.currentPartIndex, false);
			alert(CVPortal.getResource("alert.unable.toFind.part") + " " + id);
		}
	},

	showPartButton: function(attr) {
		var dH = this;
		$("#itemNo", this.docPanel.getElement(this.id)).each(function() {
			dH.showSinglePartByAttr(jQuery.trim(this.value), attr);
		});
	},

	showPartRelative: function(indexMod) {  // expected to be a -1 or 1
		this.showParts(this.currentPartIndex + indexMod, false);
	},

	// helper to get a part # without its 0's
	replaceLeadingZeros: function(result) {
		while(result && result.charAt(0)=='0') {
			result = result.substring(1);
		}
		return result;
	},

	//***********************************
	//
	// Step paging -- next and previous steps...
	//
	//
	//***********************************

	// NV Harmonization: determine next procedure step
	determineNextStep: function(stepEid) {
		var dH = this;
		var targetCntr = 0;  
		var nextEID = null;
		$("span[step_type='1']").each(function(i) {
			i++;
			if(targetCntr) {
				// Don't consider procanchors if not designated
				if($(this).attr("step_target") == "procanchor"  && dH.showProcAnchors != 1) {
					return true;
				}
				// Don't consider stepanchors if not designated
				if($(this).attr("step_target") == "stepanchor"  && dH.showStepAnchors != 1) {
					return true;
				}
				nextEID = $(this).attr("eid");
				return false;
			}
			if($(this).attr("eid") == stepEid) {
				targetCntr = i;
				return true;
			}
		});
		return nextEID;
	},
	
	// NV Harmonization: determine if proc updating is allowed
	isProcUpdateAllowed: function() {
		if((this.current.docType == "procedure" ||
			 this.current.docType == "proced" ||
			 this.current.docType == "faultIsolation" ||
			 this.current.docType == "afi" ||
			 this.current.docType == "crew" ||
			 this.current.docType == "process") &&
			(this.nextStepEID != null ||
			 this.prevStepStack.length || this.completedStepsStack.length)) {
			return true;
		} else {
			return false;
		}			
	},

	// NV Harmonization: enable next procedure step
	//		Enable NEXT step if allowed; else disable.
	//		additionally, if in a PDM, disable Proceed.
	enableNextStep: function() {
		if(this.isProcUpdateAllowed() == true) {
			//this.nextStep.enable();
			// Enable next step via this counter-intuitive condition:
			if(this.hasSteps) CVPortal.controlFactory().updateCondition("lastStep","false");
		} else {
			//this.nextStep.disable();
			// Disable next step via this counter-intuitive condition:
			CVPortal.controlFactory().updateCondition("lastStep","true");
		}
		if(this.pdmProcStepping == 1 && CVPortal.rootThread.currentPDM && CVPortal.rootThread.currentPDM != null) {
			CVPortal.controlFactory().updateCondition("pdmEnableNext","false");
		}
	},

	// NV Harmonization: Enable previous procedure step
	//		Enable PREV step if allowed; else disable.
	enablePrevStep: function() {
		if(this.isProcUpdateAllowed() == true) {
			//this.prevStep.enable();
			// Enable prev step via this counter-intuitive condition:
			if(this.hasSteps) CVPortal.controlFactory().updateCondition("firstStep","false");
		} else {
			//this.prevStep.disable();
			// Disable prev step via this counter-intuitive condition:
			CVPortal.controlFactory().updateCondition("firstStep","true");
		}
	},

	// NV Harmonization: disable next procedure step
	//		Disabling NEXT step.
	//		additionally, if in a PDM, enable Proceed.
	disableNextStep: function() {
		//this.nextStep.disable();
		// Disable next step via this counter-intuitive condition:
		CVPortal.controlFactory().updateCondition("lastStep","true");
		if(CVPortal.rootThread.currentPDM && CVPortal.rootThread.currentPDM != null) {
			// enable Proceed if not on a side trip
			if(this.pdmTOCselect != true && this.pdmDocidLoad != true) {
				CVPortal.controlFactory().updateCondition("pdmEnableNext","true");
			}
			// enable Proceed if autoref or in a PDM
			if(this.pdmAutoRef == true || this.inPDM == true) {
				CVPortal.controlFactory().updateCondition("pdmEnableNext","true");
			}
			// enable Proceed if can't go back either
			if(this.prevStepStack.length <= 1) {
				CVPortal.controlFactory().updateCondition("pdmEnableNext","true");
			}
		}
	},

   // NV Harmonization: disable previous procedure step
	disablePrevStep: function() {
		//this.prevStep.disable();
		// Disable prev step via this counter-intuitive condition:
		CVPortal.controlFactory().updateCondition("firstStep","true");
	},

	// NV Harmonization: update step buttons
	updateStepButtons: function() {
		var dH = this;
		// Update the Prev Step button
		if(dH.prevStepStack.length > 1) {
			dH.enablePrevStep();
		} else {
			dH.disablePrevStep();
		}
		// Update the Next Step button
		if(dH.nextStepEID != null && dH.nextStepEID != "") {
			dH.enableNextStep();
		} else {
			dH.disableNextStep();
		}
	},

	// NV Harmonization: unselect procedure step
	unSelectProcStep: function(step) {
		var dH = this;
		// Remove previous yellow arrows
		dH.removeYellowArrows();
		// Unselect the given step
		if($(step).attr("step_target") == "step" || $(step).attr("step_target") == "stepanchor") {
			step.className = "stepLabel";
			if($(step).attr("step_target") == "stepanchor") {
				var anchorId = $(step).attr("step_id");
				$(".stepAnchor[anchor_id='" + anchorId + "']").each(function() {
					$(this).hide();
				});
			}      
		} else if($(step).attr("step_target") == "procanchor") {
			$(step).closest(".procAnchor").hide();
		}
	},

	// NV Harmonization: select procedure step
	selectProcStep: function(step,scroll,arrow) {
		// Select the given step
		var dH = this;

		// save step position to skip steps that user already pass
		if(dH.isRestoredDM) {
			dH.showPopups = $(step).offset().top;
		}

		if(dH.current.documentTab != "main") {
			// If changing tabs, select main tab and close resource manager
			dH.selectXrefDocumentTab(step); 
			CVPortal.components['cvResourceManager'].closeResourceManager(true);
		}     
		if($(step).attr("step_target") == "step" || $(step).attr("step_target") == "stepanchor") {
			step.className = "stepLabelHighlight";
			if(scroll && $(step).attr("step_target") == "step") {
				step.scrollIntoView();
				if(arrow) {
					dH.addYellowArrow(step);
				}
			}
			if ($(step).attr("step_figure") && ((CVPortal.getBrowserPlatform() == "IPAD" && dH.iPadAutoLoadFigure != 0) || (CVPortal.getBrowserPlatform() != "IPAD" && dH.autoLoadFigure != 0))) {
				CVPortal.components.cvMedia.selectGraphic($(step).attr("step_figure"));
			}
			if($(step).attr("step_target") == "stepanchor") {
				var anchorId = $(step).attr("step_id");
				$(".stepAnchor[anchor_id='" + anchorId + "']").each(function() {
					$(this).find("span.getResource").each(function() {
						if($(this).text().trim().substr(0,5) == "proc.") {
							// $(this).text(CVPortal.getResource($(this).text().trim()) + " ");
							$(this).text("Safety information for Step ");
						}
					});
					$(this).show();
					var getParent =	$(step).parent().parent();
					if(getParent.prev().hasClass("wcn-msg")) {
						dH.popWCN();// show WCN popup if user navigates with NEXT/PREV btn when step was selected
					}
					this.scrollIntoView();
					if(arrow) {
						$(this).find(".stepAnchorLabel").each(function() {
							dH.addYellowArrow(this);
						});
					}
				});
			}      
		} else if($(step).attr("step_target") == "procanchor") {
			$(step).closest(".procAnchor").each(function() {
				$(this).find("span.getResource").each(function() {
					if($(this).text().trim().substr(0,5) == "proc.") {
						$(this).text(CVPortal.getResource($(this).text().trim()));
					}
				});
				$(this).show();
			});
			if(scroll) {
				step.scrollIntoView();
				if(arrow) {
					dH.addYellowArrow(step);    
				}
			}
			dH.popWCN();
		}
	},

	toggleProcedureActionIndicator: function(event) {
		var comp = this;
		var target = event.target;
		var state = target.checked;
		var val;

		var text = $(target).parent().parent().find(".stepDiv span").text().trim();

		if (text.length > 40) {
			text =  text.substring(0,40)+'...';
		}
		
		if(state) {
			comp.completedStepsStack.push(target.attributes["eid"].value);
			val = CVPortal.getResource("audittrail.msg.proced.step.checked");
		} else {
			val = CVPortal.getResource("audittrail.msg.proced.step.unchecked");
			comp.completedStepsStack = comp.completedStepsStack.filter(function(item) {
				return item !== target.attributes["eid"].value;
			});
		}
    // CREATE OUR AUDIT EVENT:
    var auditObj = new Object();						
    auditObj.xrefid = $(target).next().text();						
    auditObj.xidstate = val;						
    auditObj.xrefText = encodeURIComponent(text);

    auditObj.docLoadId = comp.docLoadId;						
    CVPortal.createAuditEvent("actionCompleteIndicator", auditObj);	
	},
	// NV Harmonization: go to next procedure step
	nextProcedStep: function() {
		var comp = this;
		if(comp.nextStepEID != null) {
			// If there is a currently selected step, un-select it
			if(comp.currStepEID != null) {
				$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
					comp.unSelectProcStep(this);
				});
			}
			// Designated next step becomes current step
			comp.currStepEID = comp.nextStepEID;
			// Determine the new designated next step
			comp.nextStepEID = comp.determineNextStep(comp.currStepEID);
			// Select the current step
			$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
				comp.selectProcStep(this,true,false);
			});
			// Track the current step
			comp.prevStepStack.push(comp.currStepEID);
			// Update step navigation buttons
			comp.updateStepButtons();
			comp.scrollWithBtn = true;
		}
	},

	// NV Harmonization: link to next procedure step
	linkProcedStep: function(step) {
		var comp = this;
		// Check for a valid linkable step
		var linkStepEID = $(step).attr("eid");
		if(linkStepEID != null) {
			// If there is a currently selected step, un-select it
			if(comp.currStepEID != null) {
				$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
					comp.unSelectProcStep(this);
				});
			}
			// The link step now becomes the current step
			comp.currStepEID = linkStepEID;
			// Determine the new designated next step
			comp.nextStepEID = comp.determineNextStep(linkStepEID);
			// Select the current step
			$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
				comp.selectProcStep(this,true,true);
			});
			// Track the current step
			comp.prevStepStack.push(comp.currStepEID);
			// Update step navigation buttons
			comp.updateStepButtons();
		}
	},

	// NV Harmonization: go to previous procedure step
	prevProcedStep: function(event) {
		var comp = this;
		// Check for a previous step to go to
		if(comp.prevStepStack.length > 1) {
			var comp = this; // store the component
			// If there is a currently selected step, un-select it
			if(comp.currStepEID != null) {
				$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
					comp.unSelectProcStep(this);
				});
			}
			// The previous step in the step stack becomes the current step
      var a1 = comp.prevStepStack.length;
			var prevStepEID = comp.prevStepStack[comp.prevStepStack.length - 2];
			// Pop the step stack
			comp.prevStepStack.pop();
      var a2 = comp.prevStepStack.length;
			// The retrieved previous step now becomes the current step
			comp.currStepEID = prevStepEID;
			// Determine the new designated next step
			comp.nextStepEID = comp.determineNextStep(comp.currStepEID);
			// Select the current step
      console.info('3399:prevProcedStep:selectProcStep:' + comp.currStepEID + ' > prevStepEID=' + prevStepEID + '|' + a1 + ':' + a2);
			$("span[step_type='1'][eid='" + comp.currStepEID + "']").each(function() {
				comp.selectProcStep(this,true,false);
			});
			// No need to push previous step, it's already there
			// Update step navigation buttons
			comp.updateStepButtons();
		}
	}, 

	// NV Harmonization: link to internal destination
	linkInternal: function(elem,el,cid,tabsel) {
		var dH = this;
		if (el){
			// note position so back button returns here rather than top of DM
			dH.yellowArrowTarget = el;
			if (cid) {
				//if we get here with a null cid, this code wipes the id and EID from the element, so let's check for that
			dH.yellowArrowTarget.id =  cid;
			dH.yellowArrowTarget.setAttribute("EID", cid);
		}
		}
		CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "exit");
		if(tabsel && tabsel > 0) {
			dH.selectXrefDocumentTab(elem);  //select the proper document tab
		}
		dH.addYellowArrow(elem);            // add the yellow arrow
		CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "enter");
	},

	//***********************************
	//
	// Reactions to hide / show the Media Panel:
	//
	//
	//***********************************
	expandPanel: function() { // doc panel is getting bigger
		if(this.current && this.current.docType == "ipc") {
			this.ipcHandler();
		}
	},

	reducePanel: function() { // doc panel is getting smaller
		if(this.current && this.current.docType == "ipc") {
			$("#PARTS_SCROLL", this.docPanel.getElement(this.id)).hide();
			this.showParts(0, true);
		}
	},
	
	hideDocPanel: function() {
		if (CVPortal.components["cvMedia"].mediaVisible == true) {
			$(this.docPanel).hide();
		}
	},

	//***********************************
	//
	// DTD / Schema Specific Handlers:
	//
	//
	//***********************************
	S1000DHandler: function(refStruct) {

		// if there is a docType specific EarlyCheck function, call it.
		// if it returns false, do NOT load the rest of the AJAX requests:
		var continueLoad = true;
		if(this[this.current.docType + "EarlyCheck"]) {
			continueLoad = this[this.current.docType + "EarlyCheck"]();
			if(continueLoad == false) return;
		}

		// *****************************************************
		// Hide or show the Next and Prev Step Buttons if Proced or not:
		// *****************************************************
		if(this.current.docType == "procedure" || this.current.docType == "proced" || 
			this.current.docType == "faultIsolation" || this.current.docType == "afi" ||
			(this.current.docType == "crew" && $("span[step_type='1']").length) || 
			this.current.docType == "process") {
			// NV Harmonization: Initialize step navigation on entering procedure
			if(this.pdmAutoRef != true) {
				this.currStepEID = null;
				this.nextStepEID = null;
			this.prevStepStack = [];
			this.completedStepsStack = [];
			this.hasSteps = false;
			}
			var s1000dDoctype = this.current.docType;
			var dH = this;

			if(dH.showStepsCheckbox === "1") {
				$(".checkbox-step").css("display", "inline");
			}
			$("span[step_type='1']").each(function() {
				// Don't consider procanchors if not designated
				if($(this).attr("step_target") == "procanchor"  && dH.showProcAnchors != 1) {
					return true;
				}
				// Don't consider stepanchors if not designated
				if($(this).attr("step_target") == "stepanchor"  && dH.showStepAnchors != 1) {
					return true;
				}
				dH.nextStepEID = $(this).attr("eid");
				dH.hasSteps = true;
				return false;
			});
			//this.prevStep.disable();
			CVPortal.controlFactory().updateCondition("firstStep","true");
			//this.nextStep.disable();
			CVPortal.controlFactory().updateCondition("lastStep","true");
			if(this.nextStepEID != null) {
				this.enableNextStep();
			}

			// show and enable the step counters
			CVPortal.controlFactory().updateCondition("firstStep","true");
			if(this.hasSteps) CVPortal.controlFactory().updateCondition("lastStep","false");
			this.stepSelected = false;
			this.stepTarget = 0;
			this.stepTop = $("span[step_type='1']").length;
			this.stepTop = this.stepTop - 1;

			if(s1000dDoctype == "process" && this.stepTop < 0) {
				CVPortal.rootThread.enableProcessButtons();
			}
		} else {
			// hide the step counters
			this.stepSelected = false;
			this.stepTarget = 0;
			this.stepTop = 0;
			if(this.current.docType == "process") CVPortal.rootThread.enableProcessButtons();
			CVPortal.controlFactory().updateCondition("firstStep","true");
			CVPortal.controlFactory().updateCondition("lastStep","true");
		}

		// *****************************************************
		// Find any REFDMs that do not have titles and insert them:
		// *****************************************************
		if(this.getProp("S1000D_ReplaceDMCwithDMTitle") == 1) {
			var qArray = new Array();
			// first get our unique list:
			$("span[CV_System_DM_Needs_Title]", this.docPanel.getElement(this.id)).each(function() {
				var found = false;
				for(var i = 0; i < qArray.length && found != true; i++) {
					if(qArray[i].dmc == this.getAttribute("CV_System_DM_Needs_Title")) {
						// store the target element into the qArray instead of another lookup:
						qArray[i].elements.push(this);
						found = true;
					}
				}
				if(found == false) {
					// store the DMC, the version, and the element into the qArray to avoid future looks ups
					var obj = {};
					obj.spec_version = this.getAttribute("spec_version");
					obj.elements = new Array();
					obj.elements.push(this);
					obj.dmc = this.getAttribute("CV_System_DM_Needs_Title")
					qArray.push(obj);
				}
			});

			// now for each DM go and get its title:
			var dId = this.current.docId;
			var queries = new Array();
			var queries4 = new Array();
			queries.push(".//idstatus/dmaddres/dmtitle");
			queries4.push(".//identAndStatusSection/dmAddress//dmTitle");
			for(var i = 0; i < qArray.length; i++) {
				var xml =null;
				if(qArray[i].spec_version == "4") {
					xml = this.xpath_query(qArray[i].dmc, queries4)
				} else {
					xml = this.xpath_query(qArray[i].dmc, queries);
				}
				var title = "";
				var techname = 0;

				try {
					$("techname,techName", xml).each(function() {
						var text = CVPortal.getNodeText(this);
						if(text != "" && text != null) {
							title += CVPortal.getNodeText(this);
							techname = 1;
						}
					});
					$("infoname,infoName", xml).each(function() {
						var text = CVPortal.getNodeText(this);
						if(text != "" && text != null) {
							if(techname == 1) {
								title += " - ";
							}
							title += text;
						}
					});

					// insert the title into every element that was registered with this DMC
					if(title != "") {
						// replace any actual '<' characters with &lt; so they don't get treated as markup
						title = title.replace(/</g,"&lt;");					
						CVPortal.debug("{DocHandler} For S1000D, switching the DMC " + qArray[i].dmc + " out for the title: " + title);
						for(var x = 0; x < qArray[i].elements.length; x++) {
							$(qArray[i].elements[x]).html(title);
						}
					}
				} catch(err) {
					// do nothing with an error -- move on to the next reference
				}
			}
		}
		//LCS-4681: this line causes some bugs and doesn't appear to actually be needed for anything, so commenting it out
		//$("#MAIN_DIV").each(function() { this.scrollIntoView(); });
	},

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// rhi specific routines:
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	callDelayedHsHighlight: function(hsID, hsName, xidtype) {
		// wait for graphic to be loaded before trying to highlight HS or play step
		if(CVPortal.components.cvMedia.loadingGraphic == true || CVPortal.components.cvMedia.currentType == "unknown") {
			timerId = setTimeout("CVPortal.components.cvDocHandler.callDelayedHsHighlight('" + hsID + "', '" + hsName + "', '" + xidtype + "')", 500);
		} else {
			this.callHotspotHandler(hsID, hsName, false, xidtype);
		}
	},
	
	callHotspotHandler: function(hsID, hsName, delay, xidtype){
		// handle hotspots depending on type and graphic type
		if(delay == true || CVPortal.components.cvMedia.loadingGraphic == true) {
			this.callDelayedHsHighlight(hsID, hsName, xidtype);
		} else {
			var mediaType = CVPortal.components["cvMedia"].currentType;
			if (mediaType == "cgm"){
				if (xidtype != "hotspot" && xidtype != "irtt11"){
					CVPortal.debugAlert("Ref type " + xidtype + " not supported for CGM graphics");
				} else {
					CVPortal.components["cvMedia"].highlightHotspot(hsID, hsName, delay);
				}
			} else if (mediaType == "rhi" || CVPortal.components["cvMedia"].rhiCanvasPresent()){
				this.rhiHsHandler(hsName, xidtype);
			} else if (mediaType == "svg") {
				CVPortal.components["cvMedia"].highlightHotspotSVG(hsID, hsName, delay);
			}
			else if (mediaType != ""){
				CVPortal.debugAlert("Hotspot highlighting not implemented for type " + mediaType);
			}
		}
	},
	
	rhiAddYellowArrow: function(element, stepID) {
		// add yellow arrow that points to text referenced by RH step or node.
		// If it's a step, add the step description below the referenced text
		var dH = this;
		//whack the old arrow
		if(this.yellowArrow) {
			$(this.yellowArrow).remove();
			dH.yellowArrow = null;
			dH.yellowArrowTarget = null;
		}
		if(this.yellowArrowText) {
            $(this.yellowArrowText).remove();
            dH.yellowArrowText = null;
        }
		if ( this.current.docType != "ipc"){
	        var stepDesc = CVPortal.components["cvMedia"].rhiGetCurrStepDesc(stepID);
			//insert a new arrow:
			element.innerHTML = '<img id="CV_YELLOW_ARROW" src="' + CVPortal.fetchSkinImage("yellow_arrow.gif") + '" />'+ element.innerHTML  + stepDesc;
			dH.yellowArrowTarget = element;
			$("#CV_YELLOW_ARROW", dH.docPanel.getElement(dH.id)).each(function() {
				dH.yellowArrow = this;
				this.scrollIntoView();
			});
			$("#CV_YELLOW_ARROW_TEXT", dH.docPanel.getElement(dH.id)).each(function() {
				dH.yellowArrowText = this;
			});
		} else {
			element.innerHTML = '<img id="CV_YELLOW_ARROW" src="' + CVPortal.fetchSkinImage("yellow_arrow.gif") + '" />'+ element.innerHTML; //  + stepDesc;
			dH.yellowArrowTarget = element;
			$("#CV_YELLOW_ARROW", dH.docPanel.getElement(dH.id)).each(function() {
				dH.yellowArrow = this;
				this.scrollIntoView();
			});
		}		
	},
	
	rhiHsHandler: function(hotspotID, xidtype){
		// handle references to the RH model		
		if (xidtype == "multimedia" || xidtype == "irtt10"){
			if (hotspotID == "All"){
	    		CVPortal.components["cvMedia"].rhiPlayAllSteps();
			} else if (hotspotID == "Last"){
    			CVPortal.components["cvMedia"].rhiPlayLastStep();
			} else {
				CVPortal.components["cvMedia"].rhiPlayStepByName(hotspotID);
			}
		} else {
			CVPortal.components["cvMedia"].rhiHighlightHS(hotspotID);
		}
	},
	
	//findWord: function(searchText, matchCase, wholeWord, findDialog,searchUrl,ceid,currSecOnly){
	findWord: function(event){			
		var ceid = CVPortal.components["cvDocHandler"].isDocumentOpen();
		event = CVPortal.fixEvent(event);
		// no bubbling:
		event.cancelBubble = true;
		var dH = this;
		//retrieve the element that was clicked on:
		var pDiv = CVPortal.eventGetElement(event);
		while(pDiv.tagName != "DIV") { // Ensure we have reached the DIV
			//pDiv = pDiv.parentNode;
			pDiv = $(pDiv).parent().get(0);
		}		
		this.navDiv=pDiv;
		var inpt = pDiv.getElementsByTagName("input");
		var searchText = "";
		for (var k =0;k<inpt.length;k++)
		{
			var el = inpt[k];
			if (el.getAttribute("id") =="SRCHTERM") {
				searchText = el.value;
			}
		}
		
		if ((searchText != null) && (searchText.trim() != ""))
		{
			var matchCase = document.getElementById("MATCHCASE").checked ;
			var wholeWord = document.getElementById("WHOLEWORD").checked ;
			// search current table section only	
			var currSecOnly = document.getElementById("CURRSECTION").checked ;
			
	   }else {
			alert(CVPortal.getResource("alert.enter.search.term.toStart"));
			return;
	   }
		
		dH=this;
		this.searchTerm = searchText ;
		this.matchCase =matchCase;
		this.wholeWord=wholeWord;
		//this.findDialog=findDialog;
		var ignoreCase=true;
		if (matchCase) ignoreCase=false;
			// this is a new search
		if (!currSecOnly){	
			this.currSecOnly=false;
			var searchUrl = CVPortal.getURLwithBookParams() + "&target=query&action=find&ceid=" + ceid;
			var url = searchUrl + "&search=" + searchText  + "&op1=&term2=&ignore_case=" + ignoreCase + "&whole_words=" + wholeWord;
			// /servlets3/wietemsd?id=24180241804&book=bike-41&collection=default&target=query&action=find&ceid=5&search=mingli&op1=&term2=&ignore_case=true&whole_words=false
			//get the total count for the term from server for the whole table
			var obj = new Object();
			var rethtml="";
			$.ajax( {
				method: "GET",
				async: false,
				dataType: "html",
				cache:false,
				url: url,
				success: function(html) {
					//will populate the tblSections array for later use
					//TODO:return the table dbody, insert it into the table and show
					rethtml=html;
				}
			});				
			if (rethtml==undefined || rethtml==""){
				this.searchResultMap = null;
				alert (CVPortal.getResource("alert.find.noMatch.for.search.text") + " " + searchText + ".");
				return;
			}else{
				this.searchResultMap = getTotalWordCountAllSection(rethtml);//LCS-1692
				this.searchIterator = 0; //LCS-1692
				var tempDiv = document.createElement('div');				
				tempDiv.innerHTML = rethtml;
				var reslist = tempDiv.getElementsByTagName("RESULT-COUNT");
				if (reslist.length==0){
					alert (CVPortal.getResource("alert.find.noMatch.for.search.text") + " " + searchText + ".");
					return;
				}
				this.searchCount = 0 ;
				this.currPoint = -1 ;
				var cnt=0;
				if (this.tblSections ==null || this.tblSections ==undefined) this.tblSections = new Object();
				if (this.secToCeids ==null || this.secToCeids ==undefined) this.secToCeids = new Object();
				if (this.sectionCounts ==null || this.sectionCounts ==undefined) this.sectionCounts = new Object();
				if (!this.mainDocLoad) {
					this.tblSections = new Object();
					this.secToCeids = new Object();
					this.sectionCounts = new Object();
					this.mainDocLoad=true;
				}
				var hasFirstSec = false;
				var foundFirstSec="10000";
				var foundLastSec=1;
				for (var jj=0;jj<reslist.length;jj++){
					var el = reslist.item(jj);
					cnt++;
					if (Number(el.getAttribute("CURRENTPAGE"))<Number(foundFirstSec)){
						foundFirstSec = el.getAttribute("CURRENTPAGE");
						dH.firstSecCEID=el.getAttribute("CEID");
					}
					if (Number(el.getAttribute("CURRENTPAGE"))>Number(foundLastSec)){
						foundLastSec = el.getAttribute("CURRENTPAGE");
						dH.lastSecCEID=el.getAttribute("CEID");
					}
					this.tblSections[el.getAttribute("CEID")] = el.getAttribute("CURRENTPAGE");
					
					this.secToCeids[el.getAttribute("CURRENTPAGE")] = el.getAttribute("CEID");
					this.sectionCounts[el.getAttribute("CURRENTPAGE")] = el.childNodes[0].nodeValue;
				}	
				var ttNode = tempDiv.getElementsByTagName("TOTAL").item(0);
				this.total = ttNode.childNodes[0].nodeValue;
				var ceidsNode = tempDiv.getElementsByTagName("CEIDS").item(0);
				this.CEIDS = ceidsNode.childNodes[0].nodeValue;
				//this is for none IE browser to control the highlighting
				if (tempDiv.getElementsByTagName("FOUND-IN-DOC").length > 0) this.foundindoc = tempDiv.getElementsByTagName("FOUND-IN-DOC").item(0).childNodes[0].nodeValue;
				//if (Number(this.total)>1) alert("Find " + this.total + " matches for " + searchText + ".");
				$("#tableSearchResults").show();
				$("#lt_totalresults").html(this.total);
				$("#lt_searchresults").html("1");
					
				var currCEID = document.getElementById("currceid").getAttribute("currceid");
				// if the visible section is not the first section switch to the first section.
				if (this.firstSecCEID!=currCEID) CVPortal.components.cvDocHandler.showSelectedSection(this.firstSecCEID,"next"); 
				CVPortal.components.cvDocHandler.resetCurrentSection(foundFirstSec,"next");
				this.currSection=foundFirstSec;
				if(cnt>1)enableAction("lt_next");
			}
		}else{
			this.currSecOnly =true;
			CVPortal.components.cvDocHandler.resetCurrentSection("current","next");
		}
		disableAction("lt_prev");
		//LCS-1692
		if(getBrowserType()!="IE") {
			$("tbody[currentpage='" + this.currSection + "']").removeHighlight();
			$("tbody[currentpage='" + this.currSection + "']").highlight(this.searchTerm);
			this.searchIterator = 0;
			$("span.highlight")[this.searchIterator].scrollIntoView();
		}
		
		
	},
	resetCurrentSection: function(currSection,nextprev)
	{		
	if (navigator.appName=="Opera") {
	  alert (CVPortal.getResource("alert.opera.browsers.not.supported"))
	  return;
	 }else 	if (getBrowserType()=="IE") {

		// Clean up old search results
		if (this.searchHits != null)	{
			delete this.searchHits ;
		}
		//var findDialog = this.findDialog;
		this.searchCount = 0 ;
		this.currPoint = -1 ;
		
		// Create new array
		this.searchHits = null ;
		this.searchHits = new Array() ;
		var tableList = document.getElementsByTagName("table");
		var wantedTable=null;
		for (var j=0;j<tableList.length;j++){
			wantedTable = tableList.item(j);
			if (wantedTable.getAttribute("class")=="content_table" && wantedTable.getAttribute("table_id")!=null && wantedTable.getAttribute("table_id")!=""){
				//LCS-1864
				wantedTable = getCurrentSectionTbody(wantedTable, currSection);
				break;
			}
			wantedTable=null;
		}
		if (wantedTable==null) return;
		enableAction("lt_next");
		var textRange;
		var tempRange; 
			textRange = document.body.createTextRange() ;
			tempRange = document.body.createTextRange() ; 
			textRange.moveToElementText (wantedTable);
	//               textRange.select ();
			tempRange.moveToElementText (wantedTable);
	//               tempRange.select ();			
	
		var cuurFoundEl ;

		var iFlag = 0;

		if(this.matchCase)
		{
		   iFlag += 4;
		}

		if(this.wholeWord)
		{
		   iFlag += 2;
		}

		while (textRange.findText(this.searchTerm, 0, iFlag)) {
			// Add the hit only if the element is visible
			cuurFoundEl = textRange.parentElement() ;
			if (this.isVisible(cuurFoundEl)) {
				// save the current hit
				this.searchHits[this.searchCount] = textRange.duplicate() ;
				this.searchCount = this.searchCount + 1 ;

				// Move the range boundaries
				tempRange.setEndPoint("StartToEnd", textRange) ;
				textRange = tempRange.duplicate() ;
			}
			else {
				// Just skip it. Move the range boundaries
				tempRange.setEndPoint("StartToEnd", textRange) ;
				textRange = tempRange.duplicate() ;
			}
		}
		if (this.searchTerm == null) this.searchCount = 0;
		if (this.searchCount > 0) {
			
			document.getElementById("SRCHTERM").style.backgroundColor = "white";
			document.getElementById("SRCHTERM").style.color = "black";
			
			//find number of first search result on this page
			this.currSection = currSection;
			if (this.sectionCounts != null) {
			var newSearchNumber = 1;
			for (var p = 1; p < this.currSection; p++) {
				if (this.sectionCounts[p] != undefined) {
					newSearchNumber = newSearchNumber + parseInt(this.sectionCounts[p]);
				}
			}
			//if moving to previous page, add current page's result count (minus one) to get the number for the last result on new page
			if (nextprev == "prev") newSearchNumber = newSearchNumber + parseInt(this.sectionCounts[p]) - 1;
				
			$("#lt_searchresults").html(newSearchNumber);
			enableAction("lt_prev");
			enableAction("lt_next");
			if (newSearchNumber == 1) disableAction("lt_prev");
			if (newSearchNumber == this.total) disableAction("lt_next");
			}
			
			if (nextprev=="next"){
				// If found use the first hit
				this.currPoint = 0 ;
			}else if (nextprev=="prev"){
				// If found use the last hit
				this.currPoint = this.searchCount -1 ;				
			}
			textRange = this.searchHits[this.currPoint].duplicate() ;

			// hilight the found text
			textRange.select() ;
			textRange.scrollIntoView() ;

		   //enableAction("lt_next");
		   if (this.currSecOnly){
				if (this.searchCount == 1)
				{
					alert(CVPortal.getResource("alert.found.searchCount.occurrences1") + " " + this.searchCount + " " + CVPortal.getResource("alert.found.searchCount.occurrences2"));
				}
				else
				{
					alert(CVPortal.getResource("alert.found.searchCount.occurrences1") + " " + this.searchCount + " " + CVPortal.getResource("alert.found.searchCount.occurrences2"));
				}
		   }
		}
		else
		{
			//text_global.doc_contains="Document does not contain "

			if (document.selection) document.selection.empty();
			disableAction("lt_next");
			disableAction("lt_prev");
			$("#lt_searchresults").html("-");
			
			if (this.sectionCounts != null) {
				var newSearchNumber = 0;
				var p = 1;
				for (p = 1; p < currSection; p++) {
					if (this.sectionCounts[p] != undefined) newSearchNumber = newSearchNumber + parseInt(this.sectionCounts[p]);
				}
				if (newSearchNumber != 0) {
					enableAction("lt_prev");
				}
	//			else{
					//because there is no found in the prev sections, we will remove the count from this section because of applicabilty filtered out.
	//				delete this.sectionCounts[p];
	//			}
				
				newSearchNumber = 0;
				for (p = parseInt($("#lt_totalresults").html()); p > currSection; p--) {
					if (this.sectionCounts[p] != undefined) newSearchNumber = newSearchNumber + parseInt(this.sectionCounts[p]);
				}
				if (newSearchNumber != 0) enableAction("lt_next");
			}
			
		}
	}else{
		// CODE FOR BROWSERS THAT SUPPORT window.find (firefox, chrome)
		if (nextprev=="next"){
			enableAction("lt_next");
			this.startNext=true;
		}else if (nextprev=="prev"){
			enableAction("lt_prev");
		}
		this.currSection = currSection;//LCS-1692
	}
	
	},
	resetStartPoint:function (){
		var extr=0;
			extr=1;
		if (this.foundindoc>0){
			var tt = (Number(this.foundindoc) + extr);
			for (var idx=0;idx<tt;idx++){
				strFound=self.find(this.searchTerm,0,0,0,this.wholeWord);
			}
		}
	},
	/*************************************************************
	 This function checks if the element is visible on the page.
	 That is if element has any parent with style.display=="none"
	*************************************************************/
	isVisible: function (el)
	{
	   var isVisible = true;
		 
		parentEl = el;
	   while((parentEl!=null) && (parentEl.nodeType==1))
		{
		   if(parentEl.style.display!=undefined && (parentEl.style.display.toLowerCase()=="none" || parentEl.style.visibility.toLowerCase()=="hidden"))
			{
			   isVisible = false;  
				break;
			}
			
			if(parentEl.tagName.toLowerCase()=="body")
			{
			   break;
			} 
					
			parentEl = parentEl.parentNode;
		}
		
		return isVisible;
	},
	findNext: function (event)
	{
		if (document.getElementById("lt_next").DISABLED == '1') {
			return ;
		}		
	if (navigator.appName=="Opera") {
	  alert (CVPortal.getResource("alert.opera.browsers.not.supported"))
	  return;
	 }
	 else if (getBrowserType()=="IE") {
		//disable the button first			
		 disableAction("lt_next");

		// !!!!Never cross the boundaries
		if (parseInt($("#lt_searchresults").html()) == this.total)	{
			return ;
		}

		this.currPoint = this.currPoint + 1 ;


		var resultNumber = $("#lt_searchresults").html();
		
		if (isNaN(resultNumber)) {
			resultNumber ="-";
		}else{
			resultNumber = parseInt(resultNumber) + 1;	
		}
		$("#lt_searchresults").html(resultNumber);
			
		// If found highlight the first hit
		if (this.currPoint < this.searchCount && (this.searchHits[this.currPoint]!=undefined && this.searchHits[this.currPoint]!=null))	{
			textRange = this.searchHits[this.currPoint].duplicate() ;

			// hilight the found text
			textRange.select() ;
			textRange.scrollIntoView() ;
			
			enableAction("lt_next");
		}
	   if (this.currPoint>-1) {
		   enableAction("lt_prev");
	   }else{
		   enableAction("lt_next");
	   }
	   if (this.currPoint == this.searchCount)
		{
			if (this.currSecOnly){
				//this is the last section			
				disableAction("lt_next");
			}
			else {
				//check if there is still next section
				//to get next section we need to know: curent section position 
				var currCEID = document.getElementById("currceid").getAttribute("currceid");
				if (this.lastSecCEID != currCEID){
					var idx = this.tblSections[currCEID];
					var newIdx = Number(idx)+1;
					while (isNaN(newIdx)) {
						currCEID++;
						newIdx = this.tblSections[currCEID];
					}
					var tempCEID = this.secToCeids[newIdx];
					while ((tempCEID==undefined || tempCEID=="" ) && newIdx<10000){
						newIdx++;
						tempCEID = this.secToCeids[newIdx];							
					}
					CVPortal.components.cvDocHandler.showSelectedSection(tempCEID,"next");
					CVPortal.components.cvDocHandler.resetCurrentSection(newIdx,"next");
				}
			}
		}
	}
	else{
	 
		//LCS-1692
		this.currPoint = parseInt($("#lt_searchresults").html());
		this.searchCount = parseInt($("#lt_totalresults").html());
		if(this.currPoint == this.searchCount) {
			disableAction("lt_next");
			return;
		} else {
			enableAction("lt_next");
		}
		
		var totalSectionSearchCount = this.searchResultMap[this.currSection];
		if(this.searchIterator + 1 < totalSectionSearchCount) {
			this.searchIterator++;
			this.currPoint++;
			$("#lt_searchresults").html(this.currPoint);//update the value
			$("span.highlight")[this.searchIterator].scrollIntoView();
		} else {
			$("tbody").removeHighlight();
			this.searchIterator = 0;
			this.currPoint++;
			$("#lt_searchresults").html(this.currPoint);//update the value
			var currCEID = document.getElementById("currceid").getAttribute("currceid");
			var idx = this.tblSections[currCEID];
			var newIdx = Number(idx)+1;
			while (isNaN(newIdx)) {
				currCEID++;
				newIdx = this.tblSections[currCEID];
			}
			var tempCEID = this.secToCeids[newIdx];
			while ((tempCEID==undefined || tempCEID=="" ) && newIdx<10000){
				newIdx++;
				tempCEID = this.secToCeids[newIdx];							
			}
			CVPortal.components.cvDocHandler.showSelectedSection(tempCEID,"next");
			CVPortal.components.cvDocHandler.resetCurrentSection(newIdx,"next");
			$("tbody[currentpage='" + this.currSection + "']").highlight(this.searchTerm);
			$("span.highlight")[this.searchIterator].scrollIntoView();
			
		}
		
		if(this.currPoint == this.searchCount) {
			disableAction("lt_next");
		}
		if(this.currPoint == 1) {
			disableAction("lt_prev");
		} else {
			enableAction("lt_prev");
		}
	 }
	},

	//LCS-1820
	highlightSelectOnClick: function() {
		if (CVPortal.getIsTablet()) {
			var highlightedObjects = $("span.highlight");
			if(highlightedObjects != null && highlightedObjects.length > 0) {
				highlightedObjects.addClass("no_highlight").removeClass("highlight");
				CVPortal.controlFactory().searchHighlight.disable();
				return;
			}
			var noHighlightObjects = $("span.no_highlight");
			if(noHighlightObjects != null && noHighlightObjects.length > 0) {
				noHighlightObjects.addClass("highlight").removeClass("no_highlight");
				CVPortal.controlFactory().searchHighlight.enable();
				return;
			}
		} else {
			var highlightedObjects = $("span.highlight");
			if(highlightedObjects != null && highlightedObjects.length > 0) {
				highlightedObjects.addClass("no_highlight").removeClass("highlight");
				return;
			}
			var noHighlightObjects = $("span.no_highlight");
			if(noHighlightObjects != null && noHighlightObjects.length > 0) {
				noHighlightObjects.addClass("highlight").removeClass("no_highlight");
				return;
			}
		}
	},

	findPrev:function (event)
	{
		if (document.getElementById("lt_prev").DISABLED == '1') {
			return ;
		}
		if (navigator.appName=="Opera") {
		  alert (CVPortal.getResource("alert.opera.browsers.not.supported"))
		  return;
		 }else if (getBrowserType()=="IE"){	
			//disable the button first			
			 disableAction("lt_prev");
		 
			var resultNumber = parseInt($("#lt_searchresults").html());
			 
			// !!!!Never cross the boundaries
			if (resultNumber <= 1)	{
				return ;
			}

			this.currPoint = this.currPoint - 1 ;

			resultNumber = resultNumber - 1;
			if (isNaN(resultNumber)) resultNumber ="-";
			$("#lt_searchresults").html(resultNumber);

			if (this.currPoint > -1) {
				// If found highlight the first hit
				textRange = this.searchHits[this.currPoint].duplicate() ;

				// hilight the found text
				textRange.select() ;
				textRange.scrollIntoView() ;
				if (parseInt($("#lt_searchresults").html()) != 1) enableAction("lt_prev");
			}
			enableAction("lt_next");
			if (this.currPoint < 0)
			{
				if (this.currSecOnly){
					//this is the first section			
					 disableAction("lt_prev") ;
				}else{
					//go to prev section?
					//check if there is prev section
					//to get next section we need to know: curent section position 
					var currCEID = document.getElementById("currceid").getAttribute("currceid");
					if (this.firstSecCEID != currCEID){
						var idx = this.tblSections[currCEID];
						var newIdx = Number(idx)-1;
						while (isNaN(newIdx)) {
							currCEID--;
							newIdx = this.tblSections[currCEID];
						}
						//alert("idx===" + idx + " currCEID ==" +currCEID);
						var tempCEID = this.secToCeids[newIdx];
						while ((tempCEID==undefined || tempCEID=="") && newIdx>1){
							newIdx--;
							tempCEID = this.secToCeids[newIdx];							
						}
						CVPortal.components.cvDocHandler.showSelectedSection(tempCEID,"prev");
						CVPortal.components.cvDocHandler.resetCurrentSection(newIdx,"prev");
						enableAction("lt_prev");
					}
				}

			}
		}else{
			//LCS-1692
			this.currPoint = parseInt($("#lt_searchresults").html());
			this.searchCount = parseInt($("#lt_totalresults").html());
			if(this.currPoint <= 1) {
				disableAction("lt_prev");
				return;
			} else {
				enableAction("lt_prev");
			}
			var totalSectionSearchCount = this.searchResultMap[this.currSection];
			if(this.searchIterator - 1 >= 0 && this.searchIterator - 1 < totalSectionSearchCount) {
				this.currPoint--;
				this.searchIterator--;
				$("#lt_searchresults").html(this.currPoint);//update the value
				$("span.highlight")[this.searchIterator].scrollIntoView();
			} else {
				$("tbody").removeHighlight();
				var currCEID = document.getElementById("currceid").getAttribute("currceid");
				var idx = this.tblSections[currCEID];
				var newIdx = Number(idx)-1;
				while (isNaN(newIdx)) {
					currCEID--;
					newIdx = this.tblSections[currCEID];
				}
				var tempCEID = this.secToCeids[newIdx];
				while ((tempCEID==undefined || tempCEID=="") && newIdx>1){
					newIdx--;
					tempCEID = this.secToCeids[newIdx];							
				}
				CVPortal.components.cvDocHandler.showSelectedSection(tempCEID,"prev");
				CVPortal.components.cvDocHandler.resetCurrentSection(newIdx,"prev");
				this.searchIterator = this.searchResultMap[this.currSection] - 1;
				this.currPoint--;
				$("#lt_searchresults").html(this.currPoint);//update the value
				$("tbody[currentpage='" + this.currSection + "']").highlight(this.searchTerm);
				$("span.highlight")[this.searchIterator].scrollIntoView();
			}
			
			if(this.currPoint == 1) {
				disableAction("lt_prev");
			}
			if(this.currPoint < this.searchCount) {
				enableAction("lt_next");
			} else {
				disableAction("lt_next");
			}
		}
	},
	displayTableSection:function(newCeid,newEidIdx,nextPrev){
		var pDiv = document.getElementById("currceid");
		var prevNext = nextPrev;
		var tableDiv = $(pDiv).parent().get(0);
		//check to see the the section is exist in the cache
		var tbdyList = tableDiv.getElementsByTagName("tbody");
		var sectionExist =false;
		var tbdyTobedisplayed="";
		var l = tbdyList.length;
		for (var i=0;i<l;i++){
			var tbdy = tbdyList.item(i);
			if(tbdy.getAttribute("table_id")!=null){
				if (tbdy.getAttribute("ceid") ==newCeid){
					sectionExist=true;						
					tbdyTobedisplayed = tbdy;
					break;
				}
			}
		}
		if (sectionExist){
			for (var k=0;k<l;k++){
				var tbdy = tbdyList.item(k);
				if(tbdy.getAttribute("table_id")!=null && tbdy.style.display !="none"){
					tbdy.style.display="none";						
					pDiv.setAttribute("currceid",newCeid);
					CVPortal.components['cvDocHandler'].updateNavigationSetting(pDiv,newEidIdx);								
					break;						
				}
			}
			tbdyTobedisplayed.style.display="";
	}

		if (!sectionExist){
			//need to get the section from server
			var url = CVPortal.getURLwithBookParams("time") + "&target=text&action=text&eid=" + newCeid + "&sectiontype=" + prevNext;
			$.ajax( {
				method: "GET",
				async: false,
				cache:false,
				dataType: "html",
				url: url,
				success: function(html) {
					//TODO:return the table dbody, insert it into the table and show
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = html;
					var newtbdy="";
					var newtbodyList = tempDiv.getElementsByTagName("tbody");
					for (var j=0;j<newtbodyList.length;j++){
						newtbdy = newtbodyList.item(j);
						if (newtbdy.getAttribute("ceid")==newCeid)								
							break;
						else
							newtbdy="";
					}	
					this.loadedSectionCeid += newCeid +",";
					//var currShowntbdy = null;
					var tbdy = null;
					var newtbdyAdded =false;
					for (var i=0;i<tbdyList.length;i++){
						tbdy = tbdyList.item(i);
						if(tbdy.getAttribute("table_id")!=null && tbdy.getAttribute("table_id")!=""){
							var tbdyCeid= parseInt(tbdy.getAttribute("ceid"));
							var newtbdyCeid= parseInt(newtbdy.getAttribute("ceid"));							
							if (tbdy.style.display !="none" && tbdyCeid!=newtbdyCeid){
								tbdy.style.display="none";
								pDiv.setAttribute("currceid",newCeid);
								CVPortal.components['cvDocHandler'].updateNavigationSetting(pDiv,newEidIdx);
								if (newtbdyAdded) break;
							}	
							if(!newtbdyAdded){		
								var tbdyCeid= parseInt(tbdy.getAttribute("ceid"));
								var newtbdyCeid= parseInt(newtbdy.getAttribute("ceid"));
								//alert("1old==" + tbdyCeid + "  new==" + newtbdyCeid);
								if( tbdyCeid <newtbdyCeid){
									var ndList = tbdy.parentNode.getElementsByTagName("tbody");
									if(ndList.length>1){
										var sibling = tbdy.nextSibling;
										while (sibling!=null && sibling.nodeType!=1)
										  {
										  sibling=sibling.nextSibling;
										  }
										var appended=false;
										while (sibling!=null && parseInt(sibling.getAttribute("ceid"))<newtbdyCeid && sibling.nextSibling){
											sibling = sibling.nextSibling;
											while (sibling!=null && sibling.nodeType!=1)
											  {
											  sibling=sibling.nextSibling;
											  }
											
											if (parseInt(sibling.getAttribute("ceid"))>newtbdyCeid){
												//the new tbody should be in between
												sibling.parentNode.insertBefore(newtbdy,sibling);
												appended = true;
												break;
											}
										}
										
										if (!appended && parseInt(sibling.getAttribute("ceid"))<newtbdyCeid) {
											sibling.parentNode.appendChild(newtbdy);
										}else if (!appended && parseInt(sibling.getAttribute("ceid"))>newtbdyCeid){
											sibling.parentNode.insertBefore(newtbdy,sibling);
										}
									}else{
										tbdy.parentNode.appendChild(newtbdy);
									}
								}else
									tbdy.parentNode.insertBefore(newtbdy, tbdy );
								newtbdyAdded=true;			
							}								
						}
					}
				}
			});	
		}
	},
	showSelectedSection:function(currCEID,nextPrev){
		var idx = this.tblSections[currCEID];
		CVPortal.components['cvDocHandler'].displayTableSection(currCEID,Number(idx)-1, nextPrev);
	},



	getSecurityConfiguration: function (type, classification, caveat, caveatOther) {
		var handlingrestrictions = "",
			securityClassficationLevel,
			docType = type,
			classificationVal = classification || "",
			caveatVal = caveat || "",
			caveatOtherVal = caveatOther || "",
			secInfoObject = {};

		// set translation key according to DistRestrictionCaveat value
		switch (caveatVal) {
			case "other":
				handlingrestrictions = caveatOther;
				break;
			case "cv51":
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveatCv51");
				break;
			case "cv56":
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveatCv56");
				break;
			case "cv57":
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveatCv57");
				break;
			case "cv58":
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveatCv58");
				break;
			case "cv59":
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveatCv59");
				break;
			case "none":
			case "":
				handlingrestrictions = '';
				break;
			default:
				handlingrestrictions = CVPortal.getResource(docType + ".security.banner.restriction.caveat") + " " + caveatVal;
		}

		// create msg with translation key for classification value and DistRestrictionCaveat value
		switch (classificationVal) {
			case "05":
				securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level05");
				break;
			case "04":
			case "s":
				securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level04");
				break;
			case "03":
			case "c":
				securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level03");
				break;
			case "02":
				securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level02");
				break;
			case "01":
			case "u":
				// securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level01");
				securityClassficationLevel = '';
				break;
			case "":
				securityClassficationLevel = "";
				break;
			default:
				securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level") + " " + classificationVal;
		}

		secInfoObject.classification = classificationVal;
		secInfoObject.distRestrictionCaveat = caveatVal;
		secInfoObject.handlingrestrictions = handlingrestrictions;
		secInfoObject.securityClassficationMsg = handlingrestrictions ? ((securityClassficationLevel == '' ? '' : securityClassficationLevel + " - ") + handlingrestrictions) : securityClassficationLevel;
		secInfoObject.distRestrictionOtherhandling = caveatOther;

		return secInfoObject;
	},

	getXMLsecurityVal: function () {
		var pubXML = CVPortal.metaFactory().getPublicationsConfiguration(CVPortal.metaFactory().get("META_COLLECTION"), CVPortal.metaFactory().get("META_BOOK"));
		this.pmCaveat = $("configitem[name='DistRestrictionCaveat.value']>value", pubXML).text();
		this.pmCaveatOther = $("configitem[name='DistRestrictionOtherhandling.value']>value", pubXML).text();

		this.classification = $("configitem[name='classification']>value", pubXML).text();
		this.distribution = $("configitem[name='distribution']>value", pubXML).text();
	},

	addPublicSecurityBanner: function () {
		var getSecInfo,
			pubBannerContainer = document.getElementById("pubSecBanner");

		if (!this.classification && !this.distribution) {
			return null;
		}
		CVPortal.panelFactory().applyVariedDimensions(true);
		getSecInfo = this.getSecurityConfiguration("publication", this.classification, this.pmCaveat, this.pmCaveatOther);

		pubBannerContainer.parentNode.style.display = "block";
		pubBannerContainer.parentNode.className += " security-pub-banner security-pub-banner" + getSecInfo.classification;
		pubBannerContainer.innerText = getSecInfo.securityClassficationMsg ? getSecInfo.securityClassficationMsg + " - " + CVPortal.getResource("publication.security.banner.distribution.statement") + " " + this.distribution : CVPortal.getResource("publication.security.banner.distribution.statement") + " " + this.distribution;

	},

	addDMSecurityBanner: function () {
		var dmBannerContainer = document.getElementById("dmSecurityBanner"),
			dh = this,
			oldClass = dh.dmBannerSecurityClass,
			getSecInfo = dh.getSecurityConfiguration("dm", dh.current.security, dh.current.dmCaveat);
			dh.dmBannerSecurityClass = " security-dm-banner security-dm-banner" + getSecInfo.classification;
		dmBannerContainer.style.display = "block";
		if (oldClass) {
			$("#dmSecurityBanner").removeClass(oldClass);
		}
		dmBannerContainer.className += dh.dmBannerSecurityClass;
		dh.dmSecurityInfo = getSecInfo.classification ? getSecInfo.securityClassficationMsg : getSecInfo.handlingrestrictions;
		dmBannerContainer.children[0].innerText = dh.dmSecurityInfo;
	},
  
	updateXMLStateTable: function () {
		this.getXMLsecurityVal();
		// ======================================================================
		// add the CLASSIFICATION AND DISTRIBUTION into the XML STATE TABLE:
		// ======================================================================
		var xmlData = "<filterdata>";

		//  Insert the top-level classification settings and show/hide value for show portion marking so they are available to documents 
		xmlData += "<cond name='pub_settings-ietm_class'><item>" + this.classification + "</item></cond>";
		xmlData += "<cond name='pub_settings-ietm_dist'><item>" + this.distribution + "</item></cond>";
		xmlData += "<cond name='pub_settings-show_portion_marking'><item>" + this.showPortionMarking + "</item></cond>";
		// // Also add Navy Organization -tperry 2013-01-30
		// xmlData += "<cond name='pub_settings-ietm_navyorg'><item>"+this.navyorg+"</item></cond>";

		// finish and set:
		xmlData += "</filterdata>";

		// ======================================
		//  store the update XML STATE TABLE:
		// ======================================          
		var setUrl = CVPortal.getURLwithBookParams("uniqid") + "&target=applicability&action=set_config";
		// create an XML dom object for either IE or mozilla to send to the server:

		// call CVPortal cross-browser functionality:
		CVPortal.ajaxPostXMLData(setUrl, xmlData);
	},

};

function enableAction(action)
{
	if (document.getElementById(action).DISABLED != "0"){
		document.getElementById(action).DISABLED = "0" ;
		document.getElementById(action).src = CVPortal.fetchSkinImage(action) + ".png" ;
	}
}

function disableAction(action)
{
	if (document.getElementById(action).DISABLED != "1"){
		document.getElementById(action).DISABLED = '1' ;
		document.getElementById(action).src = CVPortal.fetchSkinImage(action) + "_d.png" ;
	}
}

function check_key()
{
	// Get event from non-IE browsers or IE browsers
   event = arguments.callee.caller.arguments[0] || window.event;
   if (event.keyCode == 13) {
		CVPortal.components['cvDocHandler'].findWord(event);
	}
}

function showFindWin(){
    $(dlg_div).dialog({
		dialogClass: "no-close",
		modal:false,
		position: {my: "top right", at: "bottom left", of: "#CVCtrl_tearOff"},
		close: function(event, ui)
        {
            $(this).dialog('destroy').remove();
        }
	});
	if (getBrowserType()!="IE"){
		disableAction("lt_next");
		disableAction("lt_prev");
	}
}

function getBrowserType() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return 'IE';
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return 'Opera'+ tem[1];}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return M[0] + M[1];
}

//LCS-1692
function getTotalWordCountAllSection(html) {
	var map = new Object();
	$(html).find("RESULT-COUNT").each(function(){
		map[$(this).attr("CURRENTPAGE")] = parseInt($(this).text());
	});
	return map;
}

//LCS-1864
function getCurrentSectionTbody(table, currSection) {
	var allTbody = table.getElementsByTagName("tbody");
	for(var i = 0; i < allTbody.length; i++) {
		var tbody = allTbody[i];
		var cPage = 0;
		if(tbody.getAttribute("currentpage") != null){
			cPage = parseInt(tbody.getAttribute("currentpage"));
		}
		if(cPage == currSection) {
			return tbody;
		}
	}
	return null;
}


/* highlight code copied from jquery.highlight-1.js and renamed to highlightwhole
new routine handles whole word searching - ERMG - 11/11/2015
*/
$(function() {
 jQuery.highlightwhole = document.body.createTextRange ? 

/*
Version for IE using TextRanges.
*/
  function(node, te) {
   var r = document.body.createTextRange();
   r.moveToElementText(node);
   // note seems clunky but specifing a really large number for parameter
   // two (specifies the number of characters to search from the starting point of the range)
   // for findText was the only way to get this to work, using a , - or null
   // failed to return results - ERMG - 11/11/2015
   for (var i = 0; r.findText(te, 1000000000, 2); i++) {
    r.pasteHTML('<span class="highlight">' +  r.text + '<\/span>');
    r.collapse(false);
   }
  }

 :

/*
 (Complicated) version for Mozilla and Opera using span tags.
*/
  function(node, te) {
   var pos, skip, spannode, middlebit, endbit, middleclone;
    skip = 0;
	// if nodeType is text of element or attribute
	if (node.nodeType == 3) {
    pos = node.data.toUpperCase().indexOf(te);
    if (pos >= 0) {
		spannode = document.createElement('span');
		spannode.className = 'highlight';
		middlebit = node.splitText(pos);
		endbit = middlebit.splitText(te.length);
		middleclone = middlebit.cloneNode(true);
		spannode.appendChild(middleclone);
		middlebit.parentNode.replaceChild(spannode, middlebit);
		skip = 1;
    }
   }
   else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
     i += $.highlightwhole(node.childNodes[i], te);
    }
   }
   return skip;
  }

 ;
});

//LCS-1820
function highlightSelectOnClick() {
	var highlightedObjects = $("span.highlight");
	if(highlightedObjects != null && highlightedObjects.length > 0) {
		highlightedObjects.addClass("no_highlight").removeClass("highlight");
		return;
	}
	var noHighlightObjects = $("span.no_highlight");
	if(noHighlightObjects != null && noHighlightObjects.length > 0) {
		noHighlightObjects.addClass("highlight").removeClass("no_highlight");
		return;
	}
}
