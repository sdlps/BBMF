// $Id: XY/etc/FullSupport/etc/scripts/cvExtensionLibrary.js 2.0 2019/05/23 18:38:18GMT milind Exp  $ 

// Extension for cvDocHandler
// Registered in \skins\BBMFskin\templates\config\components.xml <item extension="bbmf_cvDocHandler"/>

var loadingDiv = null;
function updateProgress(msg) {
  if (loadingDiv == null) {
    loadingDiv = document.querySelector("#loaderMsgTxt");
  }
  loadingDiv.innerHTML = msg;
}
function showHideControls(show) {
  if (loadingDiv == null) {
    loadingDiv = document.getElementById("loaderMsgTxt");
  }
  if (show == 1) {
    document.querySelector("#loader").style.display = "block";
    document.querySelector("#loaderMsg").style.display = "block";
    document.querySelector("#longTaskProgressContainer").style.display = "block";
    loadingDiv.style.visibility = "visible";
  } else {
    updateProgress("...");
    document.querySelector("#loader").style.display = "none"; 
    document.querySelector("#loaderMsg").style.display = "none"; 
    document.querySelector("#longTaskProgressContainer").style.display = "none";
  }
}
var modalUI;
var closeUI;
var MSGBOXTYPEINF = 1;
var MSGBOXTYPEWRN = 2;
var MSGBOXTYPEQST = 3;
function getModal(title,body,buttons,type) {
	var htmlcontent = '';
	htmlcontent += '<div id="modalui" class="modal">';
  htmlcontent += '<div id="modaluicontent" class="modal-content" style="border:4px solid ' + (type == MSGBOXTYPEWRN ? "#c00":"#888") + '">'; // border:4px solid #888;
  //htmlcontent += '<div id="modaluicontent" class="modal-content" style="border:4px solid ' + (type == MSGBOXTYPEQST ? "#fa0":"#888") + '">'; // border:4px solid #888;
  htmlcontent += '<div style="background-color:#888; color:#fff; padding:6px;"><span id="titleui"><b>' + title + '</b></span>';
  // htmlcontent += '<span id="closeui" class="close">&times;</span>';
  htmlcontent += '</div>';
  htmlcontent += '<div style="padding:20px">';
  htmlcontent += '<p>' + body + '</p><center>';
  for (a in buttons) {
    var button = buttons[a];
    htmlcontent += '<button class="modlabtn" id="' + button.id + '">' + button.label + '</button>&#0160';
  }
  htmlcontent += '</center></div></div>';
  htmlcontent += '</div>';
  document.body.insertAdjacentHTML( 'beforeend', htmlcontent);
  modalUI = document.querySelector("#modalui");
  /*
  closeUI = document.querySelector("#closeui");
  closeUI.onclick = function() {
    modalUI.remove();
  }
  */
  dragElement(document.getElementById("modaluicontent"));
}
function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

const USERUSER = 10;
const USERVALD = 25;
const USERSPUS = 50;
const USERADMN = 100;

function bbmf_cvDocHandler() {
  this.componentName= "Custom Document Handler";
  this.shoppingList = [];
  this.addthispart = false;
  this.thispartqty = 0;
  this.form765items = [];
  this.formContainerId = 'form765container';
  this.form765name = 'BUFR';
  this.form765dmidentf = ''; // based on the dmc
  this.form765dmcissid = ''; // based on the dmc_issue_inwork
  this.form765instance = ''; // ID assigned by LCS; CVPortal.components.cvDocHandler.form765instance
  this.form765orgowner = ''; // Person who created the form, only they can re-save it
  this.form765legacy = [];
  this.form765matchs = []; // CVPortal.components.cvDocHandler.form765matchs
  this.form765legacydoc = null;
  this.form765maxct = 0;
  this.user = CVPortal.metaFactory().get("META_USER");
  this.userGroup = CVPortal.metaFactory().get("META_USERGROUP");
  this.beamsbuilddate = '2022-07-25'; // CVPortal.components.cvDocHandler.beamsbuilddate;
}

bbmf_cvDocHandler.prototype = {

  // Extension initfunction (must have)
  extensionInit: function() {
    if (!CVPortal.components.cvResourceManager.isuseroffline) {
      CVPortal.controlFactory().updateCondition("Form765Enabled","false");
    }
  },
  
  aboutBeams: function() {
		var versionInfo = '';
		$.ajax( {
			method: "GET",
			url: CVPortal.getURLwithBaseParams() + "&target=interface&action=config_item&item_name=ietm_version.value",
			dataType: "xml",
			success: function(xml) {
        /* <results>
        <status>SUCCESS</status>
        <message>Success!!!</message>
        <request name="config_item"><item-name>ietm_version.value</item-name></request>
        <reply><config-info>Version 5.11</config-info></reply></results> */
        versionInfo = $("config-info", xml).text();
        console.debug('aboutBeams[' + versionInfo + ']' + CVPortal.components.cvDocHandler.getXmlString(xml));
        var buttons = [ {"label":"OK", "id":"yayBtn"} ];
        var msg = '';
        msg = msg + '<table border="0" cellpadding="0" cellspacing="0"><tr>';
        msg = msg + '<td><img style="width:120px; height:120px;" src="' + CVPortal.fetchSkinImage("aircraft/BEAMS_Logo_SVG_ISSUE_01.svg") + '"></td>';
        msg = msg + '<td><div style="font-size:15px; font-variant:small-caps">BBMF Electronc Aircraft Manual System</div><br>';
        msg = msg + '<div style="font-size:15px;">BEAMS application: ' + CVPortal.components.cvDocHandler.beamsbuilddate + '</div><br>';
        msg = msg + '<div style="font-size:15px;">RWS LiveContent S1000D ' + versionInfo + '</div>';
        msg = msg + '</td></tr></table>';
        getModal('About BEAMS',msg,buttons,MSGBOXTYPEINF);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
          return;
        }
			}, error: function(e) {
        console.debug('Error aboutBeams:' + e);
      }
		});
  },
  
  getXmlDoc: function(xmlStr) {
    return (new DOMParser()).parseFromString(xmlStr, "text/xml");
  },
  getXmlString: function(doc) { // CVPortal.components.cvDocHandler.getXmlString(doc)
    return (new XMLSerializer().serializeToString(doc));
  },
  
  getUserLevel: function() {
    switch (CVPortal.components.cvDocHandler.userGroup) {
      case 'ADMINISTRATOR': 
        return USERADMN;
      case 'SUPERUSER': 
      case 'SUPERUSEROFFLINE': 
        return USERSPUS;
      case 'VALIDATOR': 
        return USERVALD;
      case 'USER': 
      case 'USEROFFLINE': 
        return USERUSER;
      case 'DEVELOPER': 
      case 'EDITOR': 
      case 'BUYER': 
      case 'GUEST': 
        return 1;
      default:
        return 0;
    }
  },
  
  // BUFR Form XSLT functions
  // #txt_origReference
  // CVPortal.components.cvDocHandler.setOrigReference()
  setOrigReference: function() {
    return "BUFR/" + CVPortal.metaFactory().get("META_MODEL") + "/" + pad((form765maxct + 1), 5);
  },
  // / BUFR Form XSLT functions

  /** Updated 2022-07-14 to use <dataHandling> instead of issue number */
  loadDocumentByCeId: function(docId, refStruct, noAuditFlag, isHistory) {
    // Data Module access
		/* <restrictionInstructions>
			Blank: Access To LiveContent = Administrators|Super Users
				<dataHandling></dataHandling>
			Approved User: Access To LiveContent = Administrators|Super Users|Approved Users
				<dataHandling>Approved User</dataHandling> or <dataHandling>ApprovedUser</dataHandling> or <dataHandling>AU</dataHandling> or <dataHandling>A</dataHandling>
			Validator: Access To LiveContent = Administrators|Super Users|Approved Users|Validators
				<dataHandling>Validator</dataHandling> or <dataHandling>V</dataHandling>
			User: Access To LiveContent = Administrators|Super Users|Approved Users|Validators|Users
				<dataHandling>User</dataHandling> or <dataHandling>U</dataHandling>
		</restrictionInstructions> */

		// ADMINISTRATOR|SUPERUSER|SUPERUSEROFFLINE|APPROVEDUSER|VALIDATOR|USER|USEROFFLINE

    var userLevel = CVPortal.components.cvDocHandler.getUserLevel();
    var iss = '000';
    var inw = '00';
		var dataHandling = '';
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=tools&action=show_xml';
    url += '&eid=' + docId;
    
    var ret = 0;
    $.ajax( {
      type:"GET", url:url, dataType:"xml", async:false, cache:false,
      success: function (xmlDoc,status,xhr) {
        // <ERROR><MESSAGE>Failed to find TEXT node.</MESSAGE></ERROR>
        var err = $("ERROR > MESSAGE", xmlDoc);
        try {
          err = $(err).text();
        } catch(e) { err = ""; }
        if (err != "") {
          console.error('loadDocumentByCeId:error loading XML for ' + docId);
        } else {
          iss = $("issueInfo:first", xmlDoc).attr('issueNumber');
          inw = $("issueInfo:first", xmlDoc).attr('inWork');
          dataHandling = $("dataHandling:first", xmlDoc).text();
        }
      }, error: function(error) {
        console.error('loadDocumentByCeId:error:' + error);
      },
    });
		if (dataHandling == null) {
			dataHandling = '';
		}
		dataHandling = dataHandling.toUpperCase();
		var ug = CVPortal.components.cvDocHandler.userGroup.toUpperCase();
		console.debug('You are in: ' + ug + '; Looking at a DM: ' + iss + '-' + inw + '; dataHandling=' + dataHandling);
		var goodtogo = false;
		if ((dataHandling == '') &&
		    (ug == 'ADMINISTRATOR' || ug == 'SUPERUSER' || ug == 'SUPERUSEROFFLINE')) {
			/* Blank: Access To LiveContent = Administrators|Super Users
				<dataHandling></dataHandling> */
			goodtogo = true;
		} else if ((dataHandling == 'APPROVED USER' || dataHandling == 'APPROVEDUSER' || dataHandling == 'AU' || dataHandling == 'A') &&
		           (ug == 'ADMINISTRATOR' || ug == 'SUPERUSER' || ug == 'SUPERUSEROFFLINE' || ug == 'APPROVEDUSER')) {
		/* Approved User: Access To LiveContent = Administrators|Super Users|Approved Users
			<dataHandling>Approved User</dataHandling> or <dataHandling>ApprovedUser</dataHandling> or <dataHandling>AU</dataHandling> or <dataHandling>A</dataHandling> */
			goodtogo = true;
		} else if ((dataHandling == 'VALIDATOR' || dataHandling == 'V') &&
		           (ug == 'ADMINISTRATOR' || ug == 'SUPERUSER' || ug == 'SUPERUSEROFFLINE' || ug == 'APPROVEDUSER' || ug == 'VALIDATOR')) {
			/* Validator: Access To LiveContent = Administrators|Super Users|Approved Users|Validators
				<dataHandling>Validator</dataHandling> or <dataHandling>V</dataHandling> */
			goodtogo = true;
		} else if ((dataHandling == 'USER' || dataHandling == 'U') &&
		           (ug == 'ADMINISTRATOR' || ug == 'SUPERUSER' || ug == 'SUPERUSEROFFLINE' || ug == 'APPROVEDUSER' || ug == 'VALIDATOR' || ug == 'USER' || ug == 'USEROFFLINE')) {
			/* User: Access To LiveContent = Administrators|Super Users|Approved Users|Validators|Users
				<dataHandling>User</dataHandling> or <dataHandling>U</dataHandling> */
			goodtogo = true;
		} else {
		}
		if (!goodtogo) {
      var msg = '';
      msg = '<b>';
      switch(ug) {
        case 'ADMINISTRATOR':
        case 'SUPERUSER':
        case 'SUPERUSEROFFLINE':
          break;
        case 'APPROVEDUSER':
          msg = msg + 'As an APPROVED USER you have limited Data Module Access privileges.<br>';
          msg = msg + 'You do not have access rights to this Data Module.<br>';
          msg = msg + 'It is still in the authoring phase.';
          break;
        case 'VALIDATOR':
          msg = msg + 'As a VALIDATOR you have limited Data Module Access privileges.<br>';
          msg = msg + 'You do not have access rights to this Data Module.<br>';
          msg = msg + 'It is not ready for Validation.';
          break;
        case 'USER':
        case 'USEROFFLINE':
          msg = msg + 'As a USER you have limited Data Module Access privileges.<br>';
          msg = msg + 'You do not have access rights to this Data Module.<br>';
          msg = msg + 'You will be granted access once it has completed Validation.';
          break;
        default:
          break;
      }
      msg = msg + '</b>';
      var buttons = [
        {"label":"OK", "id":"yayBtn"},
      ];
      getModal('Data Module Access Control',msg,buttons,MSGBOXTYPEWRN);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        return;
      }
3		} else {
			cvDocHandler.prototype.loadDocumentByCeId.call(this, docId, refStruct, noAuditFlag, isHistory);
      if (!CVPortal.components.cvResourceManager.isuseroffline) CVPortal.controlFactory().updateCondition("Form765Enabled","true");
		}
  },
  loadDocumentByCeId_ORIG: function(docId, refStruct, noAuditFlag, isHistory) { // 2022-07-15: Should be deprecated, keeping in case we regress
    // Data Module access
    /*
    Admin     |Access to all documents in all issue states        |DMs and legacy docs
    Super User|Access to all documents in all issue states        |DMs and legacy docs
    Validator |Access to Data Modules from iss/inw: 001-00 onwards|DMs only
    User      |Access to Data Modules from iss/inw: 002-00 onwards|DMs only
    <div id="MAIN_CONTENT" doctype="description" document_id="SPITFIRE-AAAA-28-00-00-00-AA-040-A-A" dmc="SPITFIRE-AAAA-28-00-00-00AA-040A-A"
      issuenumber="000" issueinwork="10" infocode="" model="---" security="01" caveat="">
    */
    var userLevel = CVPortal.components.cvDocHandler.getUserLevel();
    var iss = '000';
    var inw = '00';
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=tools&action=show_xml';
    url += '&eid=' + docId;
    
    var ret = 0;
    $.ajax( {
      type:"GET", url:url, dataType:"xml", async:false, cache:false,
      success: function (xmlDoc,status,xhr) {
        // <ERROR><MESSAGE>Failed to find TEXT node.</MESSAGE></ERROR>
        var err = $("ERROR > MESSAGE", xmlDoc);
        try {
          err = $(err).text();
        } catch(e) { err = ""; }
        if (err != "") {
          console.error('loadDocumentByCeId:error loading XML for ' + docId);
        } else {
          iss = $("issueInfo:first", xmlDoc).attr('issueNumber');
          inw = $("issueInfo:first", xmlDoc).attr('inWork');
        }
      }, error: function(error) {
        console.error('loadDocumentByCeId:error:' + error);
      },
    });
    console.info('You are in: ' + CVPortal.components.cvDocHandler.userGroup + '; Looking at a DM [' + docId + ']: ' + iss + '-' + inw);
    if (userLevel < USERSPUS) {
      // Get the DM XML and read the metadata
      var n1 = 0, n2 = 0;
      try {
        n1 = parseInt(iss,10);
        n2 = parseInt(inw,10);
      } catch(e) { }
      if (n1 < 2 && userLevel < USERVALD) {        // USER
        var msg = 'Users cannot access Data Modules at issue/inwork:<br><br>' + iss + '-' + inw;
        var buttons = [
          {"label":"OK", "id":"yayBtn"},
        ];
        getModal('Data Module access',msg,buttons,MSGBOXTYPEWRN);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
          return;
        }
        // alert('Users cannot access Data Modules at issue/inwork:\n\n' + iss + '-' + inw);
        return;
      } else if (n1 < 2 && userLevel < USERSPUS) { // VALIDATOR
        var msg = 'Validators cannot access Data Modules at issue/inwork:<br><br>' + iss + '-' + inw;
        var buttons = [
          {"label":"OK", "id":"yayBtn"},
        ];
        getModal('Data Module access',msg,buttons,MSGBOXTYPEWRN);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
          return;
        }
        // alert('Validators cannot access Data Modules at issue/inwork:\n\n' + iss + '-' + inw);
        return;
      }
    }
    cvDocHandler.prototype.loadDocumentByCeId.call(this, docId, refStruct, noAuditFlag, isHistory);
    CVPortal.controlFactory().updateCondition("Form765Enabled","true");
  },
  addDMSecurityBanner: function() {
    var dmBannerContainer = document.getElementById("dmSecurityBanner"),
      dh = this,
      oldClass = dh.dmBannerSecurityClass,
      getSecInfo = dh.getSecurityConfiguration("dm", dh.current.security, dh.current.dmCaveat);
    // LAM revised: 2020-10-01
    dh.dmBannerSecurityClass = " security-dm-banner security-dm-banner" + getSecInfo.classification + " caveat-dm-banner caveat-dm-banner" + getSecInfo.distRestrictionCaveat;
    dmBannerContainer.style.display = "block";
    if (oldClass) {
      $("#dmSecurityBanner").removeClass(oldClass);
    }
    dmBannerContainer.className += dh.dmBannerSecurityClass;
    dh.dmSecurityInfo = getSecInfo.classification ? getSecInfo.securityClassficationMsg : getSecInfo.handlingrestrictions;
    // dmBannerContainer.children[0].innerText = dh.dmSecurityInfo;
    // LAM revised
    dmBannerContainer.children[0].innerHTML = ('' + dh.dmSecurityInfo) === '' ? '' : '<span class="dmSecurityInfo">' + dh.dmSecurityInfo + '</span>';
    CVPortal.components.cvDocHandler.setUpBufrForm();
  },
  setUpBufrForm: function() {
    var root = $("#MAIN_CONTENT");
    CVPortal.components.cvDocHandler.form765dmidentf = $(root).attr("dmc");
    CVPortal.components.cvDocHandler.form765dmcissid = ($(root).attr("dmc") + "_" + $(root).attr("issuenumber") + "-" + $(root).attr("issueinwork"));
    console.debug('35: ' + CVPortal.components.cvDocHandler.form765dmidentf + ' : ' + CVPortal.components.cvDocHandler.form765dmcissid);
    // Load a FORM icon?
    CVPortal.components.cvDocHandler.initForm765();
    try {
      $("span.bbmfIcon").each(function() {
        $(this).remove();
      });
    } catch(e) {}
    if (CVPortal.components.cvDocHandler.form765instance != null) {
      // 2022-04-04 build more detailed label about BUFR forms
      var bufrlabel = (form765matchs.length > 0 ? "&#0160;(" + (form765matchs.length == 1 ? "1 BUFR Form":form765matchs.length + " BUFR Forms") + ")":"");
      var html = "<span class='bbmfIcon' id='ATT' onClick='CVPortal.components.cvDocHandler.clickOnBufr765Form(event, \"" + CVPortal.components.cvDocHandler.form765instance + "\");'>";
      html += "<img id='ATT_ICON_' src='" + CVPortal.fetchSkinImage("aircraft/bufr765.16.png") + "' title='" + CVPortal.components.cvDocHandler.form765name + "'/>" + bufrlabel + "</span>";
      $("#MAIN_DIV").prepend(html);
    }
  },
  externalReference: function(pubcode, refdm) {
    // LAM: custom logic to stop access for guest/user groups
    var userLevel = CVPortal.components.cvDocHandler.getUserLevel();
    /* USERUSER = 10; USERVALD = 25; USERSPUS = 50; USERADMN = 100;
    BBMF want to restrict access to the unstructured data based on the user roles  
    Admin      | S1000D data, Topic 2, Topic 5, Legacy manuals and Training videos
    Super User | S1000D data, Topic 2, Topic 5, Legacy manuals and Training videos
    Validator   | S1000D data
    User       | S1000D data, Topic 2, Topic 5, and Training videos
    ###################################################
    User	           | Group
    -------------------------------------
    devison          | SUPERUSER        
    dburrows         | SUPERUSER        
    sbest            | ADMINISTRATOR    
    UserOffline      | USEROFFLINE      
    tgeorge          | USER             
    SuperUserOffline | SUPERUSEROFFLINE 
    tdavis           | USER             
    admin            | ADMINISTRATOR    
    mwilson          | ADMINISTRATOR    
    tfrawley         | VALIDATOR        
    -------------------------------------
    */
    var ttl = CVPortal.components["cvTOC"].currentChapterTitle.toLowerCase();
    if ((userLevel == USERVALD) || (userLevel == USERUSER && (ttl != 'topic 2' && ttl != 'topic 5' && ttl != 'training videos'))) {
      var msg = 'Restricted access: No access for ' + CVPortal.components.cvDocHandler.userGroup + ' users';
      var buttons = [
        {"label":"OK", "id":"yayBtn"},
      ];
      getModal('Legacy publication access access',msg,buttons,MSGBOXTYPEWRN);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        return;
      }
      // alert('Restricted access: No access for ' + CVPortal.components.cvDocHandler.userGroup + ' users');
      return;
    }
    cvDocHandler.prototype.externalReference.call(this, pubcode, refdm);
  },
  selectXrefDocumentTab: function(xrefElem) {
    var dH = this;
    var parent = xrefElem.parentNode;
    while (parent) {
      try { // LAM: 2020-09-17
        if (parent.getAttribute("cvDocumentTab") == 1) {
          var tabId = parent.id;
          //new prelReq ids are slightly longer, need to have a bit more removed
          var trimLength = parent.className == "prelReqItem" ? 5 : 4;
          tabId = tabId.substr(0, tabId.length - trimLength);
          if (this.current.documentTab == tabId.toLowerCase()) { return; }
          if ($("#rightPanel").length > 0) {
            this.openTabletDocumentInfo(tabId.toLowerCase());
            dH.current.documentTab = tabId.toLowerCase();
          }
          break;
        }
      } catch(e) {}
      parent = parent.parentNode;
    }
  },
  // adding and managing the yellow arrow:
  addYellowArrow: function(element) {
    var dH = this;
    //whack the old arrow
    if (this.yellowArrow) {
      $(this.yellowArrow).remove();
      dH.yellowArrow = null;
      dH.yellowArrowTarget = null;
    }
    if (this.yellowArrowText) {
      $(this.yellowArrowText).remove();
    }
    // LAM: Adapted to not screw up table structures
    if (element.nodeName === 'TR') {
      var cells = element.getElementsByTagName('TD');
      if (cells != null && cells.length > 0) {
        var cell = cells[0];
        //insert a new arrow into first cell:
        cell.innerHTML = '<img id="CV_YELLOW_ARROW" src="' + CVPortal.fetchSkinImage("yellow_arrow.gif") + '"/>' + cell.innerHTML;
      }
    } else {
      //insert a new arrow:
      element.innerHTML = '<img id="CV_YELLOW_ARROW" src="' + CVPortal.fetchSkinImage("yellow_arrow.gif") + '"/>' + element.innerHTML;
    }
    dH.yellowArrowTarget = element;
    $("#CV_YELLOW_ARROW").each(function(i, o) {
      dH.yellowArrow = this;
      this.scrollIntoView(); // remove parameters block: 'start',  behavior: 'smooth' because chrome does not support them
    });
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
      // <input LASTEID="400" EID="329" class="checkbox-step" step_target="step" step_id="proceduralStep-3" onClick="..." type="checkbox"/>
      // LAM: Move the next Step GoTo to this point
      if (elem.hasAttribute('step_target')) {
        console.info('3422:linkInternal: ' + elem.getAttribute('EID') + ' : ' + elem.hasAttribute('step_target'));
        dH.nextStepEID = elem.getAttribute('EID');
        dH.prevStepStack.push(dH.currStepEID); // LAM: 2020-09-21: Needed to add this to prev steps otherwise pressing previous step after going via link misses out a step
      }
    }
    CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "exit");
    if (tabsel && tabsel > 0) {
      dH.selectXrefDocumentTab(elem);  //select the proper document tab
    }
    dH.addYellowArrow(elem);            // add the yellow arrow
    CVPortal.components["cvHistory"].prepareHistoryRecord(dH, "enter");
  },
  getSecurityConfiguration: function (type, classification, caveat, caveatOther) {
    var secInfoObject = cvDocHandler.prototype.getSecurityConfiguration.call(this, type, classification, caveat, caveatOther);
    var caveatVal = caveat || "";
    var classificationVal = classification || "";
    var securityClassficationLevel = '';
    if (caveatVal == 'cv67') {
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
        case "":
          securityClassficationLevel = "";
          break;
        default:
          securityClassficationLevel = CVPortal.getResource(docType + ".security.banner.classification.level") + " " + classificationVal;
      }
      var handlingrestrictions = "DATA MODULE NOT YET VALIDATED"
      secInfoObject.handlingrestrictions = handlingrestrictions;
      secInfoObject.securityClassficationMsg = handlingrestrictions ?
        ((securityClassficationLevel == '' ? '' : securityClassficationLevel + " - ") + handlingrestrictions) : securityClassficationLevel;
    }
    return secInfoObject;
  },
  loadHome: function() {
    if ($("#dmSecurityBanner").is(":visible")) {
      $("#dmSecurityBanner").hide();
    }
    if ($("#dmReviewComments").is(":visible")) {
      $("#dmReviewComments").hide();
    }
    if ($("#ipcShoppingCart").is(":visible")) {
      $("#ipcShoppingCart").hide();
    }
    if ($("#panelForm765").is(":visible")) {
      $("#panelForm765").hide();
    }
    cvDocHandler.prototype.loadHome.call(this);
    CVPortal.components.cvDocHandler.bbmfLoad();
    CVPortal.controlFactory().updateCondition("Form765Enabled","false");
  },
  // END Core function overrides

  // LAM: SHOPPING CART
  inputToggle: function(csn, pnr, nsn, mfc, dsc, dmc) {
    var dH = this;
    var eInput = document.getElementById(csn);
    if (eInput != null) {
      var isdisabled = eInput.style.display==='none';
      var bg = ('' + eInput.style.backgroundColor);
      var isactive = (bg !== '#fff' && bg !== '');
      if (isdisabled) {
        eInput.style.display='';
        eInput.style.border='1 solid #000';
        try {
          eInput.focus;
          eInput.setActive;
          eInput.select();
        } catch(e) {
          console.error('Error setting up selection: ' + e);
        }
        dH.addthispart = true;
      } else {
        eInput.style.display='none';
        eInput.style.backgroundColor='';
        if (isactive) {
          dH.addthispart = false;
          dH.buyPart(pnr, nsn, mfc, dsc, eInput.value, dmc);
        }
      }
    }
    dH.resetCartCondition();
  },
  resetCartCondition: function() {
    var dH = this;
    var ct = 0;
    for (var a = 0; a < dH.shoppingList.length; a++) {
      var thispo = dH.shoppingList[a];
      var num = parseInt(thispo.qty,10);
      if (num > 0) {
        ct++;
      }
    }
    if (ct > 0) {
      CVPortal.controlFactory().updateCondition("shoppingCartEmpty","false");
    } else {
      CVPortal.controlFactory().updateCondition("shoppingCartEmpty","true");
    }
    dH.updateShoppingCartList(ct);
    return ct;
  },
  updateShoppingCartList: function(ct) {
    var htmltext = '';
    if (ct > 0) {
      htmltext += "<table style='border-collapse:collapse;' cellpadding='3' width='98%'>";
      htmltext += "<col width='45%'><col width='45%'><col width='8%'>";
      htmltext += "<thead><tr><th>PNR (MFC) / NSN</th><th>Description</th><th>QTY</th></tr></thead>";
      htmltext += "<tbody>";
      ct = 0;
      for (var a = 0; a < dH.shoppingList.length; a++) {
        var thispo = dH.shoppingList[a];
        var num = parseInt(thispo.qty,10);
        if (num > 0) {
          ct++;
          var pnrStr = '';
          if (thispo.pnr != null && thispo.pnr.length > 0) {
            pnrStr += thispo.pnr;
            var mfc = thispo.mfc;
            if (mfc != null && mfc.length > 0 && (('' + mfc) !== '.....')) {
              pnrStr += ' (' + mfc + ')';
            }
          }
          if (thispo.nsn != null && thispo.nsn.length > 0) {
            pnrStr += (pnrStr.length > 0 ? '<br>':'') + thispo.nsn;
          }
          htmltext += "<tr><td>" + pnrStr + "</td><td>" + thispo.dsc + "</td><td>" + num + "</td></tr>";
        }
      }
      htmltext += "</tbody></table>";
      if (ct == 0) {
        htmltext = '';
      }
      $("#shoppingCartOrderOrderbtn").prop('disabled',false);
    } else {
      $("#shoppingCartOrderOrderbtn").prop('disabled',true);
    }
    $("#shoppingCartList").html(htmltext);
  },
  buyPart: function(pnr, nsn, mfc, dsc, qty, dmc, csn) {
    var dH = this;
    alert((dH.addthispart ? 'Order':'Remove') + ' ' + qty + ' unit(s) of ' + pnr + ' for\n\n' + dmc);
    for (var a = 0; a < dH.shoppingList.length; a++) {
      var thispo = dH.shoppingList[a];
      var thispnr = thispo.pnr;
      var thisnsn = thispo.nsn;
      var thismfc = thispo.mfc;
      console.debug('2925[' + a + ']:' + thispnr + '|' + (thispnr === pnr && thismfc === mfc));
      if ((thispnr === pnr && thismfc === mfc) || (thisnsn !== '' && thisnsn === nsn)) {
        qty = parseInt(qty, 10);
        console.debug('2927:' + qty);
        if (dH.addthispart) {
          if (thispo.dmc.includes(dmc)) {
            thispo.qty = qty;
          } else {
            thispo.qty = parseInt(thispo.qty + qty, 10);
          }
          thispo.dmc[thispo.dmc.length] = dmc;
        } else {
          // Reduce qty by dH.thispartqty
          thispo.qty = (thispo.qty - qty);
          // Remove ref from dmc array
          var thesedmcs = thispo.dmc;
          for (var b = 0; b < thesedmcs.length; b++) {
            if (thesedmcs[b] === dmc) {
              delete thesedmcs[b];
              break;
            }
          }
        }
        dH.shoppingList.splice(a, 1, dH.partOrder(pnr, nsn, mfc, thispo.dsc, thispo.qty, dmc, thispo.csn));
        dH.resetCartCondition();
        return;
      }
    }
    dH.shoppingList[dH.shoppingList.length] = dH.partOrder(pnr, nsn, mfc, dsc, qty, dmc, csn);
    dH.resetCartCondition();
  },
  
  isPartSelected: function(csn) {
    var dH = this;
    for (var a = 0; a < dH.shoppingList.length; a++) {
      var thispo = dH.shoppingList[a];
      var thiscsn = ('' + thispo.csn);
      if (thiscsn === csn) {
        return thispo.qty;
      }
    }
    return -1;
  },
  
  partOrder: function(pnr, nsn, mfc, dsc, qty, dmc, csn) {
    var obj = new Object();
    obj.pnr = pnr;
    obj.nsn = nsn;
    obj.mfc = mfc;
    obj.dsc = dsc;
    obj.qty = qty;
    var dmcs = [];
    dmcs[0] = dmc;
    obj.dmc = dmcs;
    obj.csn = csn;
    return obj;
  },
  
  ShowParts: function() {
    $("#ipcShoppingCart").attr('style','display:block');
    $("#shoppingCart").attr('style','display:block');
  },
  OrderParts: function() {
    var dH = this;
    var htmltext = "";
    htmltext += "<div style='font-family:sans-serif;'>";
    if (dH.shoppingList.length > 0) {
      htmltext += "<p><button onclick='window.print()'>Print This Page</button></p>";
      htmltext += "<table style='border-collapse:collapse;' cellpadding='12' border='1' width='95%'>";
      htmltext += "<col width='30%'><col width='30%'><col width='10%'><col width='30%'>";
      htmltext += "<thead><tr><th>PNR (MFC) / NSN</th><th>Description</th><th>QTY</th><th>Ref(s)</th></tr></thead>";
      htmltext += "<tbody>";
      var ct = dH.resetCartCondition();
      if (ct > 0) {
        for (var a = 0; a < dH.shoppingList.length; a++) {
          var thispo = dH.shoppingList[a];
          var num = parseInt(thispo.qty,10);
          var pnrStr = '';
          if (thispo.pnr != null && thispo.pnr.length > 0) {
            pnrStr += thispo.pnr;
            var mfc = thispo.mfc;
            if (mfc != null && mfc.length > 0 && (('' + mfc) !== '.....')) {
              pnrStr += ' (' + mfc + ')';
            }
          }
          if (thispo.nsn != null && thispo.nsn.length > 0) {
            pnrStr += (pnrStr.length > 0 ? '<br>':'') + thispo.nsn;
          }
          htmltext += "<tr><td>" + pnrStr + "</td><td>" + thispo.dsc + "</td><td>" + num + "</td><td>";
          for (var b = 0; b < thispo.dmc.length; b++) {
            htmltext += "<div>" + thispo.dmc[b] + "</div>";
          }
          htmltext += "</td></tr>";
        }
      } else {
        htmltext += "<tr><td colspan='4'>You have tracked zero parts</td></tr>";
      }
      htmltext += "</tbody></table>";
    } else {
      htmltext += "<p>You have tracked zero parts</p>";
    }
    htmltext += "</div>";
    var h = screen.height - 400;
    var w = screen.width - 400;
    var win = window.open("", "SDL LiveContent S1000D: Parts Order", "height=" + h + ",width=" + w + ",scrollbars=yes,resizable=yes");
    $(win.document.body).html(htmltext);
  },

  PartsOrder: function() {
    var tStyle = "style='border-collapse:collapse;border:1px solid black' cellspacing='0' cellpadding='3'";
    var hReport="";
    hReport += "<div style='padding-top:20px'> The following parts have been ordered:</div>";
    hReport += "<div style='padding-top:20px'><table width='100%' "+tStyle+"><tbody>"
    hReport += "<tr style='border-collapse:collapse;border:1px solid black'><th>Part Num</th><th>Qty</th></tr>";
    $("tr[csn]:has(input.cart:visible)").each(function(i, o) {
      var pNum, units;
      $( this ).find("td[partnumber='1']").each(function(i, o) {
        pNum = this.innerHTML;
      });
      $( this ).find("input.cart").each(function(i, o) {
        units = this.value;
        this.style.display = "none";
      });
      hReport += "<tr "+tStyle+"><td style='text-align:center'"+tStyle+">"+pNum+"</td><td style='text-align:center'"+tStyle+">"+units+"</td></tr>";
    });
    hReport += "</tbody></table></div>";
    hReport += "<div style='text-align:center;padding-top:20px'><input type='submit' value='Close' onclick='window.close()'/></div>"
    var win = window.open("","","height=300,width=400,scrollbars=yes,resizable=yes");
    $(win.document.body).html(hReport);
  },  
  
  partToggle: function(csn) {
    var eInput = event.target.nextElementSibling;
    if (eInput.style.display === "") {
      eInput.style.display = "none";
    } else if (eInput.style.display === "none") {
      eInput.style.display = "";
      eInput.style.width = "24px";
    }
  },
  // END LAM: SHOPPING CART

  // LAM: 765 form
  set765FormCondition: function() {
    CVPortal.controlFactory().updateCondition("Form765Enabled","true");
  },
  getThisRefNumber: function(o, currentmax) {
    try {
      var txt;
      if (typeof o === 'string' || o instanceof String) {
        txt = o;
      } else {
        txt = $(o).text();
      }
      return CVPortal.components.cvDocHandler.getTheRefNumber(txt.split(":")[3]);
    } catch(e) {
      console.error('getThisRefNumber:error ' + e);
      return currentmax;
    }
  },
  getTheRefNumber: function(txt) { // CVPortal.components.cvDocHandler.getTheRefNumber(txt);
    txt = txt.replaceAll('%2F','/');
    // console.debug('getTheRefNumber? ' + txt + ' : ' + parseInt(txt.split("/")[2],10));
    return parseInt(txt.split("/")[2],10);
  },
  checkXmlInstances: function(doc) {
    var res = 0;
    form765matchs = [];
    form765maxct = 0;
    try {
      $("instance", doc).each(function(i, o) {
        var refno = CVPortal.components.cvDocHandler.getThisRefNumber(o, form765maxct);
        form765maxct = refno > form765maxct ? refno:form765maxct;
        try {
          CVPortal.components.cvDocHandler.checkFormInstance(this);
        } catch(ex) {
          console.error("Error running checkFormInstance " + ex);
        }
      });
    } catch(e) {
      res = -1
      console.error("Error parsing doc for instances:" + e);
    }
    console.debug("form765matches? " + form765matchs.length + "; form765maxct: " + form765maxct);
    // Look at form765matchs
    if (form765matchs.length > 0) {
      var mymatch = false;
      for (a in form765matchs) {
        var form765match = form765matchs[a]; // o.: usr|dmc|iss|instance|match
        // console.debug("form765match[" + a + "]:" + form765match.usr + " : " + form765match.dmc + " : " + form765match.iss + " : " + form765match.instance + " : " + form765match.match);
        if (form765match.match) {
          CVPortal.components.cvDocHandler.setFormInstance(form765match.instance, form765match.usr);
          mymatch = true;
          // break; Don't break, allow it to get the latest form instance, otherwise it will get the first
        }
      }
      if (!mymatch) {
        var form765match = form765matchs[0]; // o.: usr|dmc|iss|instance|match
        CVPortal.components.cvDocHandler.setFormInstance(form765match.instance, form765match.usr)
      }
    }
    showHideControls(0);
    return res;
  },
  setFormInstance: function(instance, user) {
    CVPortal.components.cvDocHandler.form765instance = instance;
    CVPortal.components.cvDocHandler.form765orgowner = user;
    console.debug('setFormInstance set ' + instance);
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    url += '&instance_name=' + instance + '&instance_id=' + instance;
    $.ajax( {
      type: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function (result,status,xhr) {
        CVPortal.components.cvDocHandler.form765orgowner = user;
        CVPortal.components.cvDocHandler.form765legacydoc = result;
      },
    });
  },
  getFormDataFromTitle: function(e) {
    var thisformStr = '';
    var instance = e.getAttribute("name");
    var refText = $(e).text();
    var refs = refText.split(":");
    var usr = refs[0];
    var dmc = refs[1];
    var iss = refs[2];
    var ref = refs[3];
    var doc = refs[4];
    var dte = refs[5];
    var why = refs[6];
    var how = refs[7];
    var dmt = refs[8];
    var elm = refs[9];
    var spr = refs[10];
    //console.debug('getFormDataFromTitle:' + usr + '|' + dmc + '|' + iss + '|' + ref + '|' + doc + '|' + dte);
    thisformStr += '<form-instance><form-header>';
    thisformStr += '<form-id>' + instance + '</form-id>';
    thisformStr += '<user>' + usr + '</user>';
    thisformStr += '</form-header><form-data>';
    thisformStr += '<cond id="hidden_lcsdmcxref"><item>' + doc + '</item></cond>';
    thisformStr += '<cond id="txt_origdate"><item>' + dte + '</item></cond>';
    thisformStr += '<cond id="txt_origReference"><item>' + ref + '</item></cond>';
    thisformStr += '<cond id="txt_docRefDmc"><item>' + dmc + '</item></cond>';
    thisformStr += '<cond id="txt_docRefIssueInw"><item>' + iss + '</item></cond>';
    thisformStr += '<cond id="txt_docRefTitle"><item>' + dmt + '</item></cond>';
    thisformStr += '<cond id="txt_docRefElementLevel"><item>' + elm + '</item></cond>';
    thisformStr += '<cond id="ta_report1"><item>' + why + '</item></cond>';
    thisformStr += '<cond id="ta_report2"><item>' + how + '</item></cond>';
    thisformStr += '<cond id="chk_suppressionreason"><item>' + spr + '</item></cond>';
    thisformStr += '</form-data></form-instance>';
    return thisformStr;
  },
  checkFormInstance: function(e){
    var ret = 0;
    var refText = $(e).text();
    var dmciss;
    var instance = e.getAttribute("name");
    var refs = refText.split(":");
    var usr = refs[0];
    var dmc = refs[1];
    var iss = refs[2];
    var spr = refs[10];
    //var ref = refs[3];
    //var doc = refs[4];
    //var dte = refs[5];
    // console.debug('checkFormInstance:' + refText + '[' + usr + '|' + CVPortal.components.cvResourceManager.user + ']' + dmc + '|' + iss + '|' + instance + '|' + CVPortal.components.cvDocHandler.form765dmidentf + '|' + CVPortal.components.cvDocHandler.form765dmcissid);
    if (dmc && (dmc != null && dmc !== '')) {
      if (dmc == CVPortal.components.cvDocHandler.form765dmidentf) {
        dmciss = dmc + '_' + iss;
        if (spr == 'true') { // 2022-07-15: Suppressed, hide from list
        } else if (dmciss == CVPortal.components.cvDocHandler.form765dmcissid) {
          //  CVPortal.components.cvResourceManager.user
          var o = new Object();
          o.usr = usr;
          o.dmc = dmc;
          o.iss = iss;
          o.instance = instance;
          o.match = (CVPortal.components.cvResourceManager.user == usr);
          form765matchs.push(o);
        }
      }
    }
    return ret;
  },
  initForm765: function() {
    var root = $("#MAIN_CONTENT");
    CVPortal.components.cvDocHandler.form765dmidentf = $(root).attr("dmc");
    CVPortal.components.cvDocHandler.form765dmcissid = ($(root).attr("dmc") + "_" + $(root).attr("issuenumber") + "-" + $(root).attr("issueinwork"));
    CVPortal.components.cvDocHandler.form765items = [];
    CVPortal.components.cvDocHandler.form765legacy = [];
    CVPortal.components.cvDocHandler.form765orgowner = null
    CVPortal.components.cvDocHandler.form765legacydoc = null;
    CVPortal.components.cvDocHandler.form765instance = null;
    showHideControls(1);
    updateProgress("Checking BUFR forms ...");
    console.debug('loadForm765: looking for ' + CVPortal.components.cvDocHandler.form765dmcissid);
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form_instances';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    $.ajax({
      type: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function (result,status,xhr) {
        updateProgress("Checking BUFR form instances ...");
        var chk = CVPortal.components.cvDocHandler.checkXmlInstances(result);
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error + ' | ' + CVPortal.components.cvDocHandler.getXmlString(xhr));
      }
    });
    //console.info('Kill off form765legacy...');
    //for (a in CVPortal.components.cvDocHandler.form765legacy) {
      //console.info('Kill off form765legacy: ' + CVPortal.components.cvDocHandler.form765legacy[a]);
      //CVPortal.components.cvDocHandler.removeOldForm765(CVPortal.components.cvDocHandler.form765legacy[a]);
    //}
  },
  loadForm765: function() {
    CVPortal.components.cvDocHandler.loadNewForm765(true);
  },
  removeOldForm765: function(instance) {
    console.info('removeOldForm765: ' + instance);
    form765items = [];
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=delete_form_instance';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    url += '&instance_name=' + instance + '&instance_id=' + instance;
    $.ajax( {
      type: "GET", url: url, dataType: "html",
      async: false, cache: false,
      success: function (result,status,xhr) {
        // console.info(status + ": " + result);
        console.info(status + ": removed form instance " + instance);
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
        alert('Error (' + error + ') could not remove legacy form ' + instance);
      }
    });
  },
  loadNewForm765: function(prompt) {
    form765items = [];
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=form_dlg';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    $.ajax( {
      type: "GET", url: url, dataType: "html",
      async: false, cache: false,
      success: function (result,status,xhr) {
        CVPortal.components.cvDocHandler.raiseBufrForm(result, prompt);
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
        alert('Error (' + error + ') could not raise a BUFR form');
      }
    });
  },
  loadOldForm765: function(instance) {
    form765items = [];
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    url += '&instance_name=' + instance + '&instance_id=' + instance;
    $.ajax( {
      type: "GET", url: url, dataType: "html",
      async: false, cache: false,
      success: function (result,status,xhr) {
        CVPortal.components.cvDocHandler.form765instance = instance;
        CVPortal.components.cvDocHandler.form765legacydoc = result;
        CVPortal.components.cvDocHandler.setFormOwner();
        CVPortal.components.cvDocHandler.loadNewForm765(false);
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
        alert('Error (' + error + ') could not raise BUFR form ' + instance);
      }
    });
  },
  
  setFormOwner: function() {
    var doc = CVPortal.components.cvDocHandler.getXmlDoc(CVPortal.components.cvDocHandler.form765legacydoc);
    CVPortal.components.cvDocHandler.form765orgowner = $("user", doc).text();
    console.debug('setFormOwner:' + CVPortal.components.cvDocHandler.form765orgowner);
  },
  
  makehtmlDocument: function (content) {
    let doc = document.implementation.createHTMLDocument("New Document");
    let div = doc.createElement("div");
    div.innerHTML = content;
    try {
      doc.body.appendChild(div);
    } catch(e) {
      console.log(e);
    }
    return doc;
  },
  
  getUserDetails: function(userName) {
    var url = CVPortal.getURLwithBookParams("uniqid");
    // /servlets3/wietmsd?id=1459755986251&book=s1000d_bike_41&collection=default&target=admin&action=user_dlg&user_name=newuser
    url += '&target=admin&action=user_dlg';
    url += '&user_name=' + CVPortal.metaFactory().get("META_USER");
    var o = new Object();
    $.ajax( {
      type: "GET", url: url, dataType: "html",
      async: false, cache: false,
      success: function (result,status,xhr) {
        // console.info(status + ": " + result);
        var hdoc = CVPortal.components.cvDocHandler.makehtmlDocument(result);
        if (hdoc) {
          try {
            o.first_name = hdoc.getElementById("META_FIRST_NAME").getAttribute("content");
          } catch(e) {}
          try {
            o.last_name = hdoc.getElementById("META_LAST_NAME").getAttribute("content");
          } catch(e) {}
          try {
            o.company = hdoc.getElementById("META_COMPANY").getAttribute("content");
          } catch(e) {}
          try {
            o.email = hdoc.getElementById("META_EMAIL").getAttribute("content");
          } catch(e) {}
        }
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
        alert('Error (' + error + ') could not raise a BUFR form');
      }
    });
    return o;
  },
  
  raiseBufrForm: function(data, prompt) {
    data = '<div id="' + this.formContainerId + '"><script id="panelForm765Script">' + $("#panelForm765Script").html() + '</script>' + data + '</div>';
    $("#panelForm765").html(data);
    $("#panelForm765").attr('style','display:block');
    $("#" + this.formContainerId).attr('style','display:block; visible:yes;');
    CVPortal.components.cvDocHandler.catchForm765items(prompt);
  },
  
  closeBufrForm: function() {
    // Need to prompt then clear the form before closing
    $("#" + this.formContainerId).attr('style','display:none; visible:no;');
    $("#panelForm765").attr('style','display:none; visible:no;');
  },
  
  setRequiredForms: function() { // CVPortal.components.cvDocHandler.setRequiredForms()
    form765items = [];
    $("#panelForm765 *[formtype='form765']").each(function(i, o){
      var o = new Object();
      o.id = this.id;
      o.required = this.hasAttribute("required") ? (this.getAttribute("required") == 'true' ? true:false) : false;
      o.pairedto = this.hasAttribute("pairedto") ? this.getAttribute("pairedto") : null;
      form765items.push(o);
    });
  },
  
  catchForm765items: function(prompt) {
    CVPortal.components.cvDocHandler.setRequiredForms();
    var reset = false;
    var newinstance = false;
    if (CVPortal.components.cvDocHandler.form765legacydoc) {
      newinstance = true;
      if (prompt) {
        //var msg = "NOTE: There is an existing BUFR form for this Data Module issue number:\n\n" + CVPortal.components.cvDocHandler.form765dmcissid;
        //msg += "\n\n• Press 'OK' to re-open the previous form\n\n• Or 'Cancel' to launch a new form."
        //reset = confirm(msg);
        var btn1 = "Existing";
        var btn2 = "New";
        var msg = "NOTE: There is an existing BUFR form for this Data Module issue number:<br><br>" + CVPortal.components.cvDocHandler.form765dmcissid;
        msg += "<br><br>• Press <b>" + btn1 + "</b> to re-open the previous form<br><br>• Or <b>" + btn2 + "</b> to launch a new form."
        var buttons = [
          {"label":btn1, "id":"nayBtn"},
          {"label":btn2, "id":"yayBtn"},
        ];
        getModal('Reload existing BUFR form',msg,buttons,MSGBOXTYPEQST);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
          CVPortal.components.cvDocHandler.presetForm765items(newinstance);
        }
        document.querySelector("#nayBtn").onclick = function() {
          modalUI.remove();
          CVPortal.components.cvDocHandler.resetForm765items();
        }
        return;
      } else {
        reset = true;
      }
    }
    if (reset) {
      CVPortal.components.cvDocHandler.resetForm765items();
    } else {
      CVPortal.components.cvDocHandler.presetForm765items(newinstance);
    }
  },
  
  resetForm765items: function() {
    console.debug('resetForm765items(form765instance?): ' + CVPortal.components.cvDocHandler.form765instance);
    $("#form_container").attr("instance_name", $("#form_container item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#ta_origtitleaddress").val($("#ta_origtitleaddress item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#txt_origdate").val($("#txt_origdate item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#txt_origReference").val($("#txt_origReference item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#txt_origUnitPOC").val($("#txt_origUnitPOC item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // Originator full name
    $("#txt_origEmail").val($("#txt_origEmail item", CVPortal.components.cvDocHandler.form765legacydoc).text());   // Originator email
    $("#txt_docRefDmc").val($("#txt_docRefDmc item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Technical Information (TI) Reference) DMC
    $("#txt_docRefIssueInw").val($("#txt_docRefIssueInw item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Amendment/Revision/Issue State)
    $("#txt_docRefTitle").val($("#txt_docRefTitle item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Title)
    $("#txt_docRefElementLevel").val($("#txt_docRefElementLevel item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Element)
    $("#txt_AircraftType").val($("#txt_AircraftType item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Ac Type)
    $("#slt_AircraftMark").val($("#slt_AircraftMark item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Ac Mark)
    $("#txt_AircraftMarkOther").val($("#txt_AircraftMarkOther item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Other Types/Marks which may be affected)
    //$("#chk_report3").prop({ 'checked': ($("#chk_report3 item", CVPortal.components.cvDocHandler.form765legacydoc).text() == 'true') });
    $("#ta_report1").val($("#ta_report1 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Unsatisfactory feature(s))
    $("#ta_report2").val($("#ta_report2 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Recommended Change (use continuation sheet(s) if necessary))

    $("#chk_report4").prop({ 'checked': ($("#chk_report4 item", CVPortal.components.cvDocHandler.form765legacydoc).text() == 'true') });
    $("#txt_report4").val($("#txt_report4 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Other TI/LIS affect/further effects have been reported at)
    $("#chk_suppressionreason").prop({ 'checked': ($("#chk_suppressionreason item", CVPortal.components.cvDocHandler.form765legacydoc).text() == 'true') });
    $("#txt_suppressionreason").val($("#txt_suppressionreason item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // Suppression / archive text

    $("#txt_signature1").val($("#txt_signature1 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Signature)
    $("#txt_signature2").val($("#txt_signature2 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Rank/Grade and Name)
    $("#txt_signature3").val($("#txt_signature3 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Tel No)
    $("#txt_signature4").val($("#txt_signature4 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Role email address)
    $("#txt_signature5").val($("#txt_signature5 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Date)
    $("#hidden_lcsdmcxref").val($("#hidden_lcsdmcxref item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // Need to be that special DMC with extra dashes...
    CVPortal.components.cvDocHandler.checkFormIsComplete();
    CVPortal.components.cvDocHandler.setFormAsReadonly();
  },
  
  presetForm765items: function(newinstance) {
    var o = CVPortal.components.cvDocHandler.getUserDetails(CVPortal.metaFactory().get("META_USER"));
    console.debug('presetForm765items: ' + newinstance + ' : ' + (o != null ? (o.first_name + '|' + o.last_name + '|' + o.company) : '.....'));
    var datestr = (new Date()).toISOString().substring(0,10);
    var aircraft = CVPortal.metaFactory().get("META_BOOK").toUpperCase();
    aircraft = aircraft.indexOf('SPITFIRE') ? 'SPITFIRE' : 
      aircraft.indexOf('HURRICANE') ? 'HURRICANE' :  aircraft.indexOf('DAKOTA') ? 'DAKOTA' :
        aircraft.indexOf('CHIPMONK') ? 'CHIPMONK' : aircraft.indexOf('LANCASTER') ? 'LANCASTER' : '';
    var root = $("#MAIN_CONTENT");
    CVPortal.components.cvDocHandler.form765dmcissid = ($(root).attr("dmc") + "_" + $(root).attr("issuenumber") + "-" + $(root).attr("issueinwork"));
    if (!newinstance) { // We do this because we may make a duplicate form ID
      $("#form_container").attr("instance_name", CVPortal.components.cvDocHandler.form765instance);
    } else {
      CVPortal.components.cvDocHandler.form765instance = null;
    }
    $("#ta_origtitleaddress").val("Battle Of Britain Memorial Flight, RAF Coningsby, LN4 4SY");
    $("#txt_origdate").val(datestr);
    $("#txt_origReference").val(CVPortal.components.cvDocHandler.setOrigReference()); // 2022-04-05 preset to BUFR/SPITFIRE/5 Digits, 00001
    $("#txt_origUnitPOC").val(o != null ? (o.first_name + ' ' + o.last_name + (o.company != null ? ', ' + o.company:'')) : 'Unknown'); // Originator full name
    $("#txt_origEmail").val(o != null ? o.email : '');   // Originator email
    $("#txt_docRefDmc").val($(root).attr("dmc")); // (Technical Information (TI) Reference) DMC
    $("#txt_docRefIssueInw").val($(root).attr("issuenumber") + "-" + $(root).attr("issueinwork")); // (Amendment/Revision/Issue State)
    $("#txt_docRefTitle").val($("#DOCUMENT_TITLE").text()); // (Title)
    $("#txt_docRefElementLevel").val(); // (Element)
    $("#txt_AircraftType").val(aircraft); // (Ac Type)
    $("#txt_AircraftMark").val(); // (Ac Mark)
    $("#txt_AircraftMarkOther").val(); // (Other Types/Marks which may be affected)
    $("#ta_report1").val(); // (Unsatisfactory feature(s))
    $("#ta_report2").val(); // (Recommended Change (use continuation sheet(s) if necessary))
    $("#txt_report4").val(); // (Other TI/LIS affect/further effects have been reported at)
    $("#txt_suppressionreason").val(); // Suppression / archive text
    $("#txt_signature1").val(); // (Signature)
    $("#txt_signature2").val(); // (Rank/Grade and Name)
    $("#txt_signature3").val(); // (Tel No)
    $("#txt_signature4").val(o != null ? o.email : ''); // (Role email address)
    $("#txt_signature5").val(datestr); // (Date)
    $("#hidden_lcsdmcxref").val($(root).attr("document_id"));
  },
  
  enablePairedCheckBoxes: function() {
    // <input type="checkbox" id="chk_suppressionreason" label="chk_suppressionreason" value="val_suppressionreason" formtype="form765" disabled="1">
    $("#chk_report4").prop('disabled',false);
    $("#chk_suppressionreason").prop('disabled',false);
  },
  
  setFormAsReadonly: function() {
    // If CVPortal.components.cvDocHandler.form765orgowner != current user
    console.debug('setFormAsReadonly:owner: ' + CVPortal.components.cvDocHandler.form765orgowner);
    console.debug('setFormAsReadonly:user:  ' + CVPortal.components.cvDocHandler.user);
    var setasreadonly = (CVPortal.components.cvDocHandler.form765orgowner != CVPortal.components.cvDocHandler.user);
    console.debug('setFormAsReadonly:  ' + setasreadonly);
    if (setasreadonly) {
      for (a in form765items) {
        var o = form765items[a];
        var e = document.getElementById(o.id);
        $(e).prop({ disabled: true });
        $(e).css('background-color','#eee');
      }
      $("#bufrSaveBtn").button({ disabled: true });
      //CVPortal.components.cvDocHandler.setReportDivStyle(false);
    } else {
      CVPortal.components.cvDocHandler.enablePairedCheckBoxes();
    }
    $("#bufrPrt1Btn").button({ disabled: false });
    //$("#bufrPrt2Btn").button({ disabled: false });
    
  },
  /*
  <input type="hidden" id="hidden_lcsdmcxref" label="lcsdmcxref" required="true" formtype="form765" value="...">
  <textarea type="text" id="ta_origtitleaddress">Battle Of Britain Memorial Flight, RAF Coningsby, LN4 4SY</textarea>
  <input type="text" id="txt_origdate">Today's date: const d = new Date(); document.getElementById("demo").innerHTML = d;
  <input type="text" id="txt_origReference">
  <input type="text" id="txt_origUnitPOC"> (Unit Point of Contact &amp; Ext) User name
  <input type="text" id="txt_origEmail">User email
  <input type="text" id="txt_docRefDmc"> (Technical Information (TI) Reference) DMC
  <input type="text" id="txt_docRefIssueInw"> (Amendment/Revision/Issue State)
  <input type="text" id="txt_docRefTitle"> (Title)
  <input type="text" id="txt_docRefElementLevel"> (Element)
  <input type="text" id="txt_AircraftType"> (Ac Type)
  <input type="text" id="txt_AircraftMark"> (Ac Mark)
  <input type="text" id="txt_AircraftMarkOther"> (Other Types/Marks which may be affected)
  <textarea type="text" id="ta_report1"></textarea> (Unsatisfactory feature(s))
  <textarea type="text" id="ta_report2"></textarea> (Recommended Change (use continuation sheet(s) if necessary))
  <input type="text" id="txt_report4"> (Other TI/LIS affect/further effects have been reported at)
  <input type="text" id="txt_suppressionreason"> (Suppression / archive text)
  <input type="text" id="txt_signature1"> (Signature)
  <input type="text" id="txt_signature2"> (Rank/Grade and Name)
  <input type="text" id="txt_signature3"> (Tel No)
  <input type="text" id="txt_signature4"> (Role email address)
  <input type="text" id="txt_signature5"> (Date)
  */

  printBufrFormMerge: function(printall) {
    var url = CVPortal.metaFactory().get("META_APPNAME") + "?id=" + CVPortal.metaFactory().get("META_ID") + '&target=utility&action=proxy';
    console.info('printBufrForm[1]: ' + url);
    var formData = "";
    formData += "<request>";
    formData += "<data>";
    /*
    formData += "<pdffilename>C:/Data/BBMF/BBMF_IETP/data/tmp/doc_471_1646758221878.pdf</pdffilename>";
    formData += "<pdffilename>C:/Data/BBMF/BBMF_IETP/data/tmp/doc_471_1646758221879.pdf</pdffilename>";
    formData += "<pdffilename>C:\Data\BBMF\BBMF_IETP\data\tmp\doc_471_1646758221878.pdf</pdffilename>";
    formData += "<pdffilename>C:\Data\BBMF\BBMF_IETP\data\tmp\doc_471_1646758221879.pdf</pdffilename>";
    */
    formData += "<pdffilename>C:\\Data\\BBMF\\BBMF_IETP\\data\\tmp\\doc_471_1646758221878.pdf</pdffilename>";
    formData += "<pdffilename>C:\\Data\\BBMF\\BBMF_IETP\\data\\tmp\\doc_471_1646758221879.pdf</pdffilename>";
    formData += "</data>";
    formData += "</request>";
    url = "http://localhost:8080/TomcatRestfulWS/rest/hello";
    url = "http://mhdsallmarsha03:8080/TomcatRestfulWS/rest/pdfmerger";
    $.ajax({
      type: "POST",
      async: true,
      cache: false,
      url: url,
      contentType: "text/xml",
      data: formData,
      dataType: "html",
      timeout: 40000,
      success: function(xhr, textStatus) {
        console.info("Proxy:Success [" + textStatus + "]");
        console.info(xhr);
      },
      error: function(xhr, textStatus) {
        console.info("Proxy:Error ");
        console.info(xhr);
      }
    });
  },
  printBufrForm: function(printall) {
    var instance = CVPortal.components.cvDocHandler.form765instance;
    console.info('printBufrForm:instance: ' + instance);
    if (!instance) {
      alert('Cannot find the instance...');
      return;
    }
    var url = "";
    var formData = "";
    var retVal = "";
    // /servlets3/wietmsd?id=1459778897933&book=s1000d_bike_41&collection=default
    //    &target=print&action=exppdf&doctype=description&tocref=19&eid=4
    url = CVPortal.getURLwithBookParams("uniqid");
    url += '&target=forms&form_type=genforms&action=print_form';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    url += '&instance_name=' + instance + '&instance_id=' + instance;
    try {
      formData = CVPortal.components.cvDocHandler.fetchFormXML();
      updateProgress("Printing BUFR form ...");
      showHideControls(1);
      var retVal = CVPortal.ajaxPostXMLData(url, formData);
      var r = retVal.responseText;
      var doc = CVPortal.components.cvDocHandler.getXmlDoc(retVal.responseText);
      var url = $("url", doc).text();
      // <result><url>/servlets3/wietmsd/working/temp/bufr-1646654748414-1646654819978.pdf</url></result>
      showHideControls(0);
      if (url) {
        console.info('printBufrForm:url:' + url);
        var winprops = 'toolbar=0,location=0,directories=0,scrollbars=1,status=0,menubar=0,resizable=1,top=5,left=5,width=700,height='+ (screen.availHeight - 100);
        var win1 = window.open(url, CVPortal.components.cvDocHandler.form765instance, winprops);
      } else {
        alert('An error was experienced printing form\n\n' + CVPortal.components.cvDocHandler.form765instance);
      }
      // Print the DM as well
      // First get the TOC and identify the DM for this form
      // /servlets3/wietmsd?id=1566910399623&book=s1000d_bike_41&collection=default&target=toc&action=tree_xml&eid=root&levels=1
      var msg = "Press <b>Yes</b> to print the DM aswell";
      var buttons = [
        {"label":"Yes", "id":"yayBtn"},
        {"label":"No", "id":"nayBtn"},
      ];
      getModal('Print Data Module aswell?',msg,buttons,MSGBOXTYPEQST);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        CVPortal.components.cvDocHandler.printDMAswell(formData);
      }
      document.querySelector("#nayBtn").onclick = function() {
        modalUI.remove();
      }
    } catch(e) {
      console.error('printBufrForm:error:' + e);
    }
  },
  
  printDMAswell: function(formData) {
    var url = CVPortal.getURLwithBookParams();
    url += '&target=toc&action=tree_xml&eid=root&levels=10';
    var formDoc = CVPortal.components.cvDocHandler.getXmlDoc(formData);
    if (formDoc) {
      // <cond label='lcsdmcxref' id='hidden_lcsdmcxref'><item>SPITFIRE-AAAA-00-00-01-00-AA-520-A-D</item></cond>
      var docId = $("#hidden_lcsdmcxref item", formDoc).text();
      if (docId) {
        $.ajax({
          type: "GET", url: url,
          async: false, cache: false,
          contentType: "text/xml",
          success: function(xhr, textStatus) {
            console.info("Proxy:Success [" + textStatus + "]");
            // console.info(CVPortal.components.cvDocHandler.getXmlString(xhr));
            // <DOCUMENT DOCID="SPITFIRE-AAAA-28-00-00-00-AA-040-A-A" DOCTYPE="description" EID="2594" LASTEID="2596" REFID="411">
            var mytocentry = $("DOCUMENT[DOCID='" + docId + "']", xhr);
            if (mytocentry) {
              var doctype = $(mytocentry).attr("DOCTYPE");
              var tocref = $(mytocentry).attr("EID");
              var ceid = $(mytocentry).attr("REFID");
              url = CVPortal.getURLwithBookParams() + "&target=print&action=exppdf&eid=" + ceid + "&doctype=" + doctype + "&tocref=" + tocref;
              console.info('printBufrForm:ceid:' + ceid+ ':docId:' + docId+ ':printdmurl:' + url);
              var date = new Date() ;
              var winProps = 'toolbar=0,location=0,directories=0,scrollbars=1,status=0,menubar=0,resizable=1,top=10,left=10,width=700,height='+ (screen.availHeight - 100);
              var win2 = window.open(url, 'PDFWindow'+date.getTime(), winProps);
            } else {
              alert("Cannot find the Data Module for this form:\n\n" + docId);
            }
          },
          error: function(xhr, textStatus) {
            console.info("Proxy:Error ");
            console.info(xhr);
          }
        });
      }
    }
  },
  
  setReportDivStyle: function(ison) {
    var badborder = 'border:2px solid #f00';
    var e = document.getElementById('report3');
    var s = e.getAttribute('style');
    if (s != null && s.indexOf(badborder) > -1) {
      var s1 = s.substring(0,s.indexOf(badborder));
      var s2 = s.substring(s.indexOf(badborder) + badborder.length + 1);
      s = s1 + ' ' + s2;
      e.setAttribute('style', s);
    }
    if (ison) {
      e.setAttribute('style', s + '; ' + badborder + ';');
    }
  },
  
  checkFormIsComplete: function() {
    var badborder = 'border:2px solid #f00';
    var pairs = [];
    for (a in form765items) {
      var o = form765items[a];
      var e = document.getElementById(o.id);
      if (!e) continue;
      if (o.pairedto != null) {
        var p = new Object();
        p.id = o.id;
        p.pairedto = o.pairedto;
        pairs.push(p);
        continue;
      }
      var v = null;
      /*
      var s = e.getAttribute('style');
      if (s != null && s.indexOf(badborder) > -1) {
        var s1 = s.substring(0,s.indexOf(badborder));
        var s2 = s.substring(s.indexOf(badborder) + badborder.length + 1);
        s = s1 + ' ' + s2;
        e.setAttribute('style', s);
      }
      */
      if (o.id.indexOf('txt_') > -1) {
        v = e.value;
      } else if (o.id.indexOf('chk_') > -1) {
        v = '...';
      } else if (o.id.indexOf('ta_') > -1) {
        v = e.value;
      } else if (o.id.indexOf('slt_') > -1) {
        v = e.value;
      } else if (o.id.indexOf('hidden_') > -1) {
        v = e.value;
      } else {
      }
      if (o.required && (v == null || v === '' || ('' + v) === 'Undefined' || v === '---')) {
        console.info(a + ' : ERROR : ' + o.id + '=' + v);
        e.focus();
        console.debug(a + ' : ' + o.id + ' is null...');
        return false;
      }
    }
    for (a in pairs) {
      var p = pairs[a];
      var e1 = document.getElementById(p.pairedto);
      var e2 = document.getElementById(p.id);
      if ((e1 != null && e2 != null) && (e1.nodeName == 'INPUT' && e2.nodeName == 'INPUT')) {
        var e1t = e1.getAttribute('type');
        var e2t = e2.getAttribute('type');
        var chk = null;
        var txt = null;
        if (e1t == 'checkbox' && e2t == 'text') {
          chk = e1, txt = e2;
        } else if (e2t == 'checkbox' && e1t == 'text') {
          chk = e2, txt = e1;
        }
        if (chk && txt) {
          var c = $(chk).prop('checked');
          var v = $(txt).val();
          if ((c && v != '') || (!c && v == '')) {
          } else {
            console.info(a + ' : ERROR : ' + p.id + '=' + v);
            e.focus();
            console.debug(a + ' : ' + p.id + ' is null...');
            return false;
          }
          // console.debug(a + ' pair ' + $(txt).attr('id') + '|' + $(chk).attr('id') + '|' + c + ' ## ' + p.id + '|' + v);
        }
      }
    }
    $("#bufrPrt1Btn").button({ disabled: false });
    // $("#bufrPrt2Btn").button({ disabled: false }); // Combined into one btn
    return true;
  },

  saveBufrForm: function() {
    var set = CVPortal.components.cvDocHandler.checkFormIsComplete();
    if (set) {
      console.debug('saveBufrForm...');
      var msg = "All BUFR fields appear complete."
      var buttons = [
        {"label":"OK", "id":"yayBtn"},
      ];
      getModal('BUFR is ready to save',msg,buttons,MSGBOXTYPEQST);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        try {
          CVPortal.components.cvDocHandler.saveForm(CVPortal.components.cvDocHandler.form765name);
          $("#bufrSaveBtn").button({ disabled: true });
          // TODO, if legacydoc exists, need to update this
          if (CVPortal.components.cvDocHandler.form765instance) {
            CVPortal.components.cvDocHandler.setFormInstance(CVPortal.components.cvDocHandler.form765instance, CVPortal.components.cvDocHandler.form765orgowner);
          }
        } catch(e) {
          console.error('Error running cvResourceManager.saveForm: ' + e);
        }
      }
    }
  },

  saveForm: function(formName) {
    var fXML = CVPortal.components.cvDocHandler.fetchFormXML(); // List of instances
    console.info('saveForm:fXML:' + fXML);
    console.debug('CVPortal.components.cvDocHandler.form765instance: ' + CVPortal.components.cvDocHandler.form765instance)
    var doc = CVPortal.components.cvDocHandler.getXmlDoc(fXML);
    /*
    <cond label='txt_docRefDmc' id='txt_docRefDmc'><item>SPITFIRE-AAAA-28-00-01-01AA-941A-A</item></cond>
    <cond label='txt_docRefIssueInw' id='txt_docRefIssueInw'><item>000-17</item></cond>
    */
    var dmc = $("#txt_docRefDmc item", doc).text();
    var iss = $("#txt_docRefIssueInw item", doc).text();
    var ref = $("#txt_origReference item", doc).text();
    var thisrefno = CVPortal.components.cvDocHandler.getTheRefNumber(ref);
    console.debug('saveForm:thisrefno: ' + ref + '|' + thisrefno);
    var currentinstance = CVPortal.components.cvDocHandler.form765instance;
    // Need to double-check this immediately prior to saving
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form_instances';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    var isthisrefduped = false;
    $.ajax({
      type: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function (result,status,xhr) {
        form765maxct = 0;
        console.debug('saveForm?' + CVPortal.components.cvDocHandler.getXmlString(result));
        // First check to see if the curent counter is only in use once with this instance...
        try {
          $("instance", result).each(function(i, o) {
            var thisid = $(o).attr("name");
            if (thisid == currentinstance) {
              console.debug('saveForm[' + i + '|A] skip...');
              return; // continue;
            }
            var refno = CVPortal.components.cvDocHandler.getThisRefNumber(o, form765maxct);
            console.debug('saveForm[' + i + '|A] ' + thisrefno + '|' + refno);
            if (thisrefno == refno) isthisrefduped = true;
            // saveForm[0|A]BUFR%2FSPITFIRE%2F00002|1
          });
        } catch(e) { }
        if (isthisrefduped) {
          try {
            $("instance", result).each(function(i, o) {
              var thisid = $(o).attr("name");
              console.debug('saveForm[' + i + '|B]' + thisid + '|' + CVPortal.components.cvDocHandler.form765instance + '|' + (thisid == CVPortal.components.cvDocHandler.form765instance));
              // <instance name="bufr-1653938381130-1644823401130">tgeorge:SPITFIRE-AAAA-72-00-01-05AD-941A-A:000-17:BUFR/SPITFIRE/01333:SPITFIRE-AAAA-72-00-01-05-AD-941-A-A:2022-02-17:Missing alternate parts ref for item 3:We cannot always get 5433434534/PPL:3:1:1|1333</instance>
              var refno = CVPortal.components.cvDocHandler.getThisRefNumber(o, form765maxct);
              form765maxct = refno > form765maxct ? refno:form765maxct;
              // form765maxct++;
            });
          } catch(e) {
          }
          console.debug("form765maxct:" + form765maxct);
          ref = CVPortal.components.cvDocHandler.setOrigReference();
          console.debug("ref:" + ref);
          $("#txt_origReference item", doc).text(ref);
        } else {
          
        }
        fXML = CVPortal.components.cvDocHandler.getXmlString(doc)
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
      }
    });

    var dic = $("#hidden_lcsdmcxref item", doc).text();
    var dte = $("#txt_origdate item", doc).text();
    var why = $("#ta_report1 item", doc).text();
    var how = $("#ta_report2 item", doc).text();
    var dmt = $("#txt_docRefTitle item", doc).text();
    var elm = $("#txt_docRefElementLevel item", doc).text();
    var spr = $("#chk_suppressionreason item", doc).text();

    // see if we have an instance name:
    var instanceId = $("#form_container").attr("instance_id");
    if (!instanceId) {
      instanceId = CVPortal.components.cvDocHandler.form765instance;
    }
    console.debug('saveForm:instanceId:' + instanceId);
    var form_title = "";
    form_title = form_title + CVPortal.components.cvResourceManager.user + ":";
    form_title = form_title + dmc + ":" + iss + ":" + ref.replaceAll(":"," ") + ":" + dic + ":" + dte + ":";
    form_title = form_title + why.replaceAll(":"," ") + ":" + how.replaceAll(":"," ") + ":";
    form_title = form_title + dmt.replaceAll(":"," ") + ":" + elm.replaceAll(":"," ") + ":";
    form_title = form_title + spr;
    console.debug('saveForm:form_title:' + form_title);

    var url = CVPortal.getURLwithBookParams("uniqid"); // /servlets3/wietmsd?id=[ID]&book=[BOOK]&collection=[COLLECTION]&uniqid=[ID]
    url += "&target=forms&form_type=genforms&action=save_form";
    url += "&visibility=PUBLIC";
    url += "&form_name=" + formName;
    url += "&instance_title=" + encodeURIComponent(CVPortal.toHtmlText(form_title));
    if (instanceId) {
      url += "&instance_name=" + instanceId + "&instance_id=" + instanceId;
    }
    console.debug('saveForm:url:' + url);
    // post it to the server:
    var retVal = CVPortal.ajaxPostXMLData(url, fXML);
    try {
      // <RESULT><STATUS>OK</STATUS><FORMID>savedsearches-1459765901242-1459766929386</FORMID></RESULT>
      var r = retVal.responseText;
      console.debug('saveForm:r:' + r);
      var doc = CVPortal.components.cvDocHandler.getXmlDoc(r);
      var formId = $("FORMID", doc).text();
      CVPortal.components.cvDocHandler.form765instance = formId;
    } catch(e) {
      console.error('saveForm:r:error:' + e);
    }
    if (isthisrefduped) {
      var thismsg = 'The BUFR number has changed to ' + ref + ', relaunch BUFR forms to see current view.';
			console.debug(thismsg);
      var buttons = [
        {"label":"OK", "id":"yayBtn"},
      ];
      getModal('BUFR number update',thismsg,buttons,MSGBOXTYPEINF);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        return;
      }
    }
  },

  fetchFormXML: function() {
    var fXML = "<form-data>";
    for (a in form765items) {
      var o = form765items[a];
      var e = document.getElementById(o.id);
      var label = escape(e.getAttribute("label"));
      var id = o.id
      /*
      <input type="text" id="...">
      <input type="checkbox" id="..." value="...">
      <select id="..." value="...">
      <textarea type="text" id="..."></textarea>
      */
      switch(e.nodeName.toLowerCase()) {
        case 'input':
          if (e.getAttribute('type') == 'text' || e.getAttribute('type') == 'hidden') {
            var value = encodeURIComponent(e.value);
            fXML += "<cond label='" + label + "' id='" + id + "'><item>" + value + "</item></cond>";
          } else if (e.getAttribute('type') == 'checkbox') {
            fXML += "<cond label='" + label + "' id='" + id + "'><item>" + e.checked + "</item></cond>" ;
          } 
          break;
        case 'select':
          fXML += "<cond label='" + label + "' id='" + id + "'>";
          $("option", e).each(function(i, o) {
            if (this.selected === true) {
              fXML += "<item label='" + $(this).text()  + "'>" + this.value + "</item>";
            }
          });
          fXML += "</cond>";
          break;
        case 'textarea':
          fXML += "<cond label='" + label + "' id='" + id + "'><item>" + e.value + "</item></cond>";
          break;
        default:
          console.info('Unmanaged ' + e.nodeName);
          break;
      }
    }
    fXML += "</form-data>";
    // console.info('fXML: ' + fXML);
    return fXML;
  },

  closeForm: function() {
    // close the modal:
    if ($("#rightPanel").length > 0) {
      CVPortal._panelFactory.tabletResourcePanelToggle("hide");
    } else {
      if (this.managerOpen == 1) {
        CVPortal.components.cvModalHandler.hideSecondModal();
      } else {
        CVPortal.components.cvModalHandler.hideModal();
      }
    }
  },
  clickOnBufr765Form: function(event, xref) {
    CVPortal.components.cvResourceManager.showBufr765Dialog('edit', true, xref);
    try { // 2022-04-04 scroll to the selected row
      document.querySelector("tr[annotid='" + xref +"']").scrollIntoView();
    } catch(e) {
      console.debug("Error selecting " + xref + ", " + e);
    }
  },

  // END LAM: 765 form

  // LAM: 2020-10-01: Review comments
  addDocumentComments: function () {
    var dmReviewContainer = document.getElementById("dmReviewComments"), dh = this;
    dmReviewContainer.style.display = "block";
    document.getElementById("adnewcomment").addEventListener("click", adnewcomment);
    resetDocumentComments(); 
  },
  // / LAM: 2020-10-01: Review comments

  // LAM front page scripts
  // CVPortal.components.cvDocHandler.bbmfLoad()
  bbmfLoad: function() {
    CVPortal.components.cvDocHandler.setIssueAndDate(); // LAM
    CVPortal.components.cvDocHandler.getPubUpdateStatus(); // LAM
    CVPortal.components.cvDocHandler.setUserName(); // LAM
  },
  // LAM: 2021-11-11: Front cover
  // CVPortal.components.cvDocHandler.setIssueAndDate()
  setIssueAndDate: function () {
    // <span id="issuedateissue">Issue 1 (Draft)</span>; <span id="issuedatedate"></span>
    // <meta id="META_PUBDATE" content="@PUBDATE@"/>
    // <meta id="META_BOOK" content="pmc_spitfire_kcxr8_all01_01_en-us">
    var issueDate = document.getElementById('frontpageissuedate');
    if (issueDate) {
      var xml = CVPortal.metaFactory().getPublicationsConfiguration();
      if (xml) {
        //var xmlText = new XMLSerializer().serializeToString(xml);
        //console.info('xmlText : ' + xmlText);
        var meta_book = document.getElementById("META_BOOK").content;
        var book = xml.querySelector("results > reply > book-info > collection-item > book-item[name='" + meta_book + "']");
        /*
        <div id="frontpageissuedate" style="text-align: right; font-size: 11pt; margin-right: 12px;">
        <span id="frontpageissuedateissue">Issue 1 (Draft)</span>; <span id="frontpageissuedatedate"></span>
        </div>
        */

        var issueDateDate = document.getElementById('frontpageissuedatedate');
        var val = book.querySelector("configitem[name='PubDate.value'] > value");
        if (val) {
          issueDateDate.innerHTML = CVPortal.components.cvDocHandler.formatUKdate(val.textContent);
        }
        var issueDateIssue = document.getElementById('frontpageissuedateissue');
        val = book.querySelector("configitem[name='change_level'] > value");
        if (val) {
          val = val.textContent;
          if (('' + val) === '000' || ('' + val) === '00' || ('' + val) === '0') {
            val = 'Initial issue';
          } else {
            try {
              val = parseInt(val,10);
              val = 'Issue ' + val;
            } catch(e) { }
          }
          issueDateIssue.innerHTML = val;
        }
      }
    }
  },
  // CVPortal.components.cvDocHandler.formatUKdate()
  formatUKdate: function (date) {
    if (date.indexOf('/') > -1) {
      var d = date.split("/");
      return d[2] + "-" + d[0] + "-" + d[1];
    } else {
      return date;
    }
  },
  // CVPortal.components.cvDocHandler.getPubUpdateStatus()
  getPubUpdateStatus: function () {
    var url = '';
    url = CVPortal.getURLwithBookParams("date") + "&target=update&action=get_version_info";
    $.ajax( {
      method: "GET",
      url: url,
      dataType: "xml",
      success: function(xml) {
      /*
      <BOOK_LIST><COLLECTION NAME="BBMF_IETP">
        <BOOK COLNAME="BBMF_IETP" BOOKNAME="pmc_spitfire_kcxr8_all01_01_en-us" VERSION="002" DATE="05/18/2022" NOROLLBACK=""/>
      </COLLECTION></BOOK_LIST>
      */
        //try { console.info("versionInfo: " + (new XMLSerializer().serializeToString(xml))); }
        //catch(e){ console.info("versionInfo:error:" + e); }
        var model = document.getElementById("META_MODEL").content; // <meta id="META_MODEL" content="SPITFIRE">
        $("BOOK", xml).each(function(i, o) {
          var pub = this.getAttribute("BOOKNAME").toUpperCase();
          if (pub.indexOf(model) > -1) {
            var version = this.getAttribute("VERSION");
            if (version != null  && version != "" && version != "0") {
              $("div#pub-update").html("<nobr>Updated " + CVPortal.components.cvDocHandler.formatUKdate(this.getAttribute("DATE")) + "</nobr>").show();
            }
          }
        });
      }, error: function() {
        console.info("getPubUpdateStatus:error");
      },
    });
    url = CVPortal.getURLwithBookParams("date") + "&target=toc&action=tree_xml&levels=4&eid=root";
    var eid = null;
    $.ajax( {
      method: "GET",
      url: url,
      dataType: "xml",
      success: function(xml) {
        //try     { console.info("tree_xml: " + (new XMLSerializer().serializeToString(xml))); }
        //catch(e){ console.info("tree_xml:error:" + e); }
        /*
          <SYSTEM EID="7334" LASTEID="7335" ROOT="1"><TITLE EID="7335">Reference Data Modules - Hide</TITLE>
            <DOCUMENT DOCID="RWS-A-00-00-00-00-0-000-E-D" DOCTYPE="description" EID="7340" LASTEID="7342" REFID="1417">
              <TITLE EID="7341" LASTEID="7341">Spitfire Technical Information - Spitfire AMM and AIPC</TITLE>
              <DOCTITLE EID="7342" LASTEID="7342">Spitfire Technical Information - Spitfire AMM and AIPC</DOCTITLE>
            </DOCUMENT>
          </SYSTEM>
          <DOCUMENT DOCID="SPITFIRE-AAAA-29-00-00-00-AA-040-A-A" DOCTYPE="description" EID="2121" LASTEID="2123" REFID="407">
            <TITLE EID="2122" LASTEID="2122">Hydraulic power - Description</TITLE>
            <DOCTITLE EID="2123" LASTEID="2123">Hydraulic power - Description</DOCTITLE>
          </DOCUMENT>
        */
        var rscdoc = $("DOCUMENT[DOCID='RWS-A-00-00-00-00-0-000-E-D']", xml);
        if (rscdoc) {
          // eid = $(rscdoc).attr("EID");
          eid = $(rscdoc).attr("REFID");
          //console.debug("gettoc:eid:" + eid);
        } else {
          //console.debug("gettoc:eid...");
        }
      }, error: function() {
        console.info("gettoc:error");
      }, complete: function() {
        if (eid) {
          CVPortal.components.cvDocHandler.getRscDoc(eid);
        }
      }
    });
  },
  
  // CVPortal.components.cvDocHandler.getRscDoc(eid)
  getRscDoc: function(eid) {
    var url = '';
    // url = CVPortal.getURLwithBookParams(null) + '&target=tools&action=show_xml&eid=2121';
    url = 'http://localhost:2245/servlets3/wietmsd?id=1652957766273&book=pmc_spitfire_kcxr8_all01_01_en-us&collection=BBMF_IETP&target=tools&action=show_xml&eid=407&_=1652957765620';
    url = CVPortal.getURLwithBookParams(null) + '&target=tools&action=show_xml&eid=' + eid;
    $.ajax( {
      type:"GET", url:url, dataType:"xml", async:false, cache:false,
      success: function(xmlDoc) {
        var err = $("ERROR > MESSAGE", xmlDoc);
        try {
          err = $(err).text();
        } catch(e) { err = ""; }
        if (err != "") {
          console.info("err: " + err);
        } else {
          /* <dmodule ...>
          <identAndStatusSection>
            <dmAddress>
              <dmIdent>
                <issueInfo inWork="00" issueNumber="002"/>
              </dmIdent>
              <dmAddressItems>
                <issueDate day="18" month="05" year="2022"/>
                <dmTitle><techName>Spitfire Technical Information</techName><infoName>Spitfire AMM and AIPC</infoName></dmTitle>
              </dmAddressItems>
            </dmAddress>
            <dmStatus issueType="new">...</dmStatus>
          </identAndStatusSection>
          <content>
            <description>
              <para id="rfu">Updated the title for Interim Revision 002, PM issue 002.</para>
            </description>
          </content></dmodule> */
          //try     { console.info("xmlDoc: " + (new XMLSerializer().serializeToString(xmlDoc))); }
          //catch(e){ console.info("xmlDoc:error:" + e); }
          var paras = $("dmodule > content > description > para", xmlDoc);
          /*
          var issEl = $("dmodule > identAndStatusSection > dmAddress > dmIdent > issueInfo", xmlDoc);
          var isdEl = $("dmodule > identAndStatusSection > dmAddress > dmAddressItems > issueDate", xmlDoc);
          var dmtEl = $("dmodule > identAndStatusSection > dmAddress > dmAddressItems > dmTitle", xmlDoc);
          if (isdEl) {
            var dateStr = $(isdEl).attr("year") + "-" + $(isdEl).attr("month") + "-" + $(isdEl).attr("day");
            $('#frontpageissuedatedate').html(dateStr);
          }
          if (dmtEl) {
            dmtEl = $("dmodule > identAndStatusSection > dmAddress > dmAddressItems > dmTitle > techName", xmlDoc);
            $('#frontpagetitle').html(dmtEl.text())
          }
          */
          var htmlStr = '';
          $(paras).each(function(i, o) {
            htmlStr = htmlStr + $(this).text() + "<br>";
          });
          if (htmlStr != '') {
            $("#pub-update-reason").html(htmlStr).show();
          }
        }
      }, error: function() {
        console.info("xmlDoc:error");
      }
    });
  },
  // / LAM: 2021-11-11: Front cover
  // LAM: 2022-02-17: Set user name before 'iconbuttonsRightM'
  // 
  // CVPortal.components.cvDocHandler.setUserName()
  setUserName: function () {
    var myTarget = $("#iconbuttonsRightM");
    if (myTarget) {
      var thisid = "userinfospan";
      var metaUser = $("#META_USER").attr('content');
      var metaUserGroup = $("#META_USERGROUPNAME").attr('content');
      var thisStyle = 'color:#fff; font-size:14px; font-weight:bold; top:6px; bottom:0; left:0; right:0; margin:auto; position:relative';
      $("#" + thisid).remove();
      $(myTarget).before('<span id="' + thisid + '" style="' + thisStyle + '">Welcome to BEAMS: ' + metaUser + ', ' + metaUserGroup + '</span>');
    }
  },
  
   /*********************************************************************************
    * DocHandler EXTENSION: getRefDmDoctype	(PROCNAV)
    *********************************************************************************/
   getRefDmTargetDoctype: function(element) { // Override
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

};

// Extension for cvResourceManager
// Registered in \skins\BBMFskin\templates\config\components.xml <item extension="bbmf_cvResourceManager"/>
function bbmf_cvResourceManager() {
  this.componentName= "Custom cvResourceManager";
  this.bufrformcount = 0;
  this.bufrformusers = '';
  this.bufrformitems = []; // CVPortal.components.cvResourceManager.bufrformitems
  this.bufrformsrchs = []; // CVPortal.components.cvResourceManager.bufrformsrchs
  this.previousearch = -1; // CVPortal.components.cvResourceManager.previousearch
  this.currentsearch = -1; // CVPortal.components.cvResourceManager.currentsearch
  this.user = CVPortal.metaFactory().get("META_USER");
  this.userGroup = CVPortal.metaFactory().get("META_USERGROUP");
  // ADMINISTRATOR|SUPERUSER|SUPERUSEROFFLINE|APPROVEDUSER|VALIDATOR|USER|USEROFFLINE
  /* LAM: 2020-03-17: Passwords */
  // CVPortal.components.cvResourceManager.specchars
  this.specchars = [33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 123, 124, 125, 126, 163];
  this.currentbufrreportid = 'currentbufrreportid'; // CVPortal.components.cvResourceManager.currentbufrreportid
  this.isuseroffline = false; // 2022-07-15 check for offline users to remove bufr palette
}

bbmf_cvResourceManager.prototype = {

  // Extension initfunction (must have)
  extensionInit: function() {
    // 2022-07-15 check for offline users to remove bufr palette
    switch(CVPortal.metaFactory().get("META_USERGROUP")) {
      case "SUPERUSEROFFLINE":
      case "USEROFFLINE":
        CVPortal.components.cvResourceManager.isuseroffline = true;
        break;
      default:
    }
  },

  viewTabletResource: function(type, highlight, xref) { // type:bufr765forms
    CVPortal._panelFactory.tabletResourcePanelLayout("show");
    if (this.currentType) {
      this.currentType.style.backgroundColor = "white";
      this.currentType = null;
    }
    if (type=="suspend") type = "genericforms-SuspendSession";
    var typeObj = null;
    for(var i = 0; i < this.resourceTypes.length; i++) {
      if (this.resourceTypes[i].type == type) {
        typeObj = this.resourceTypes[i];
        break;
      }
    }
    if (type == "notes")        typeObj = { icon: "icon_annmgr.gif", title: "Notes", type: "annot", url: "get_annotations"};
    if (type == "bookmarks")    typeObj = { icon: "icon_annmgr.gif", title: "Bookmarks", type: "annot", url: "get_annotations"};
    if (type == "attachments")  typeObj = { icon: "icon_annmgr.gif", title: "Attachments", type: "annot", url: "get_annotations"};
    if (type == "bufr765forms") typeObj = { icon: "icon_annmgr.gif", title: "BUFR Forms", type: "annot", url: "get_annotations"};
    
    var targetType = typeObj.type;
    if (typeObj == null) { alert(CVPortal.getResource("alert.unable.toSelect.resource.type") + " " + type);  CVPortal.error(" {Resource Manager} Unable to select resource type: " + type);  return; }
    this.typeObj = typeObj;
    
    var url = "";
    if (typeObj.form_name) {                      // if a form name is associated
      url = "&form_name=" + typeObj.form_name;   // add extra information into the URL
      type = "forms";                             // get our type back to normal gen form type...
      targetType = type;
    }
    if (typeObj.type == "user") {
      url = CVPortal.getURLwithBookParams("uniqid") + "&target=admin&action=get_users";
    } else {
      url = CVPortal.getURLwithBookParams("uniqid") + "&target=" + targetType + "&action=" + typeObj.url + "&caller=rm" + url;
    }
    var cvRM = this;
    var theXML = null;
    $.ajax( {
      method: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function(xml) {
        // Need to look at this XML and add new stuff for 
        // console.info(CVPortal.components.cvDocHandler.getXmlString(xml));
        /* <ANNOTATIONS><ANNBODY>
          <ANNITEM CREATOR="mwilson" OBJECTID="SPITFIRE-AAAA-00-00-01-00-AA-040-A-D" ID="n_1644947575071_1644947791165" ANNOT_ID="n_1644947575071_1644947791165" OFFSET="0" TYPE="N" LOCATION="pmc_spitfire_kcxr8_all01_01_en-us\00: * Aircraft - General\AMM\Aircraft - Assembly 01 - Description of how it is made and its function" VISIBILITY="PUBLIC">
            <TITLE>Note for XXXXXXX</TITLE><NOTE>....</NOTE>
          </ANNITEM>
        </ANNBODY></ANNOTATIONS> */
        theXML = xml;
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
      }
    });
    if (theXML != null) {
      if (type == "bufr765forms") {
        updateProgress("Gathering BUFR forms ...");
        showHideControls(1);
        var newXML = null;
        var url = CVPortal.getURLwithBookParams(null);
        url += '&target=forms&form_type=genforms&action=get_form_instances';
        url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
        // console.info("url: " + url);
        $.ajax({
          type: "GET", url: url, dataType: "xml",
          async: false, cache: false,
          success: function (xml,status,xhr) {
            /* <form_instances form_type="genforms" form_name="BUFR"><header/><body>
              <instance name="bufr-1644950969019-1644951009591">bufr-1644950969019-1644951009591</instance>
              <instance name="bufr-1645018229643-1645019000208">bufr-1645018229643-1645019000208</instance>
            </body></form_instances> */
            newXML = xml;
          }, error: function(xhr, status, error) {
            console.error(status + ' | ' + error);
          }
        });
        if (newXML != null) {
          var formsStr = '<forms>';
          try {
            var tl = $("instance", newXML).length;
            var interval = 1;
            if (tl > 1000)     interval = 128;
            else if (tl > 500) interval = 64;
            else if (tl > 200) interval = 32;
            else if (tl > 150) interval = 16;
            else if (tl > 100) interval = 8;
            else if (tl > 50)  interval = 4;
            else if (tl > 25)  interval = 2;
            $("instance", newXML).each(function(i) {
              if ((i % interval) == 0) updateProgress("BUFR " + (i + 1) + " of " + tl + " ...");
              try {
                formsStr += CVPortal.components.cvDocHandler.getFormDataFromTitle(this);
              } catch(ex) {
                console.error("Error getting instances: " + ex);
              }
            });
            updateProgress("Gathered " + tl + " BUFR forms");
          } catch(e) {
            console.error("Error parsing doc for instances");
          }
          formsStr += '</forms>';
          /*
          var annotsXmlStr = CVPortal.components.cvDocHandler.getXmlString(theXML);
          if (annotsXmlStr.indexOf('<ANNOTATIONS') > -1) {
            annotsXmlStr = annotsXmlStr.substring(annotsXmlStr.indexOf('<ANNOTATIONS'));
            var newXmlStr = '<?xml version="1.0"?><annots>' + annotsXmlStr + formsStr + '</annots>';
            console.debug('newXmlStr:1502: ' + newXmlStr);
            theXML = CVPortal.components.cvDocHandler.getXmlDoc(newXmlStr);
          }
          */
          theXML = CVPortal.components.cvDocHandler.getXmlDoc(formsStr);
          /* CVPortal.components.cvDocHandler.getXmlDoc(xmlStr)
             CVPortal.components.cvDocHandler.getXmlString(doc) */
        }
        var gforms = new Object();
        gforms.title = "Custom Forms";
        gforms.icon = "icon_custforms.gif";
        gforms.type = type;
        gforms.url = "get_form_instances";
        // gforms.actions = new Array("view", "goto", "delete", "deleteAll");
        gforms.actions = new Array("view", "goto", "delete");
        CVPortal.components.cvResourceManager.resourceTypes.push(gforms);
        cvRM.viewTabletbufr765formsResourceList(theXML, type, xref);
        showHideControls(0);
      } else {
        cvRM.viewTabletResourceList(theXML, type);
      }
      $("#rightButtons").empty();
      if (type == "user" || type == "audittrail") $("#rightDialog").empty();
      if (type == "notes")        cvRM.viewTabletNotesDialog("edit");
      if (type == "bookmarks")    cvRM.viewTabletBookmarkDialog("edit");
      if (type == "attachments")  cvRM.viewTabletAttachmentsDialog("edit", highlight);
      if (type == "forms" && typeObj.form_name == "SuspendSession") cvRM.newResource();
      if (type == "forms" && typeObj.form_name == "SavedSearches") {
        $("#rightTitle").empty();
        $("[cvResourceAction='1']").hide();
        $("#rightButtons").empty();
        $("#rightDialog").empty();
        $("#rightDialog").html("<div>&nbsp;</div>");
        CVPortal._panelFactory.tabletResourcePanelToggle("show");
      }
      if (type == "forms" && typeObj.form_name != "SuspendSession" && typeObj.form_name != "SavedSearches") {
        cvRM.newResource();
      }

      CVPortal._panelFactory.tabletResourcePanelToggle("show");
      
      $("#rightTitle").html(typeObj.title);
      if (type == "forms") type = "genericforms-" + typeObj.form_name;
      
      // Add this form type to the resourceTypes array
      CVPortal.components.cvResourceManager.activateType(type,null,0);
      if (type == "notes" || type == "bookmarks" || type == "attachments") type = "annot";
    }
  },
  
  resetBufrListing: function() {
    $("#" + CVPortal.components.cvResourceManager.currentbufrreportid).html('');
    $("table#bufrformlisting tr").each(function(i, o) {
      $(o).css("display", "table-row");
      $(o).removeClass("highlightOODRM");
      $(o).removeClass("highlightRM");
    });
  },
  
  /* <tr class="simpleClickable" onclick="CVPortal.components.cvResourceManager.selectResource(event);" offset="0" type="F"
         xref="SPITFIRE-AAAA-06-00-00-00-AA-040-A-A" annotid="bufr-1653938380001-1644823400001" srcuser="dburrows" sys="06-00-00" date="2022-02-17" s1diss="000-02"> */
  filterBufrFormView: function(params) {
    console.info('filterBufrFormView:' + CVPortal.components.cvResourceManager.previousearch + '|' + CVPortal.components.cvResourceManager.currentsearch);
    //if ((CVPortal.components.cvResourceManager.previousearch > 0) && (CVPortal.components.cvResourceManager.previousearch == CVPortal.components.cvResourceManager.currentsearch)) {
      //CVPortal.components.cvResourceManager.resetBufrListing();
    //}
    CVPortal.components.cvResourceManager.resetBufrListing();
    var highlightedrows = [];
    var currentdisplay = 0;
    var currenthighlgt = 0;
    // o.(htmlstring|user|dmc|sys1|sys2|sys3|date|iss|ref|docid|bufrid|dmcissue|searchtext + dmissue)
    if (params) {
      if (params[0].type) {
        // Filter CVPortal.components.cvResourceManager.bufrformsrchs
        // If params.type == any existing searches, remove it
        var type = params[0].type;
        for (a in CVPortal.components.cvResourceManager.bufrformsrchs) {
          var bufrformsrch = CVPortal.components.cvResourceManager.bufrformsrchs[a][0].type;
          if (bufrformsrch && (bufrformsrch == type)) {
            CVPortal.components.cvResourceManager.bufrformsrchs.splice(a, 1);
          }
        }
      }
      CVPortal.components.cvResourceManager.bufrformsrchs.push(params);
      for (a in CVPortal.components.cvResourceManager.bufrformsrchs) {
        var bufrformsrch = CVPortal.components.cvResourceManager.bufrformsrchs[a][0];
        if (bufrformsrch.report) { // ([{"report":"oodb"}]);
          console.debug(a + ' : bufrformsrch.report : ' + bufrformsrch.report);
          var report = bufrformsrch.report.toUpperCase();
          console.debug("filterBufrFormView:report:" + report);
          if (report == 'OODB') {
            var docids = [];
            for (a in CVPortal.components.cvResourceManager.bufrformitems) {
              var bufrformitem = CVPortal.components.cvResourceManager.bufrformitems[a];
              if (bufrformitem.dmissue) {
                console.debug(a + ' : filterBufrFormView:report:OODB:' + bufrformitem.iss + '|' + bufrformitem.dmissue + '|' + (bufrformitem.iss == bufrformitem.dmissue));
                if (bufrformitem.iss != bufrformitem.dmissue) docids.push(bufrformitem.bufrid);
              }
            }
            console.debug("filterBufrFormView:report:OODB:" + report + "; docids:" + docids.length);
            if (docids.length > 0) {
              $("table#bufrformlisting tr").each(function(i, o) {
                if ($(o).css("display") == 'table-row') {
                  var thisdocid = $(o).attr("annotid");
                  console.debug(i + ' : filterBufrFormView:report:OODB:' + thisdocid + '|' + docids.includes(thisdocid));
                  if (docids.includes(thisdocid)) {
                    $(o).addClass("highlightOODRM");
                  }
                }
              });
            }
          }
        } else if (bufrformsrch.searchtext) {
          console.debug(a + ' : bufrformsrch.searchtext : ' + bufrformsrch.searchtext);
          var searchtext = bufrformsrch.searchtext.toUpperCase();
          var docids = [];
          for (a in CVPortal.components.cvResourceManager.bufrformitems) {
            var bufrformitem = CVPortal.components.cvResourceManager.bufrformitems[a];
            var test = bufrformitem.searchtext.toUpperCase().indexOf(searchtext);
            console.debug("filterBufrFormView[" + a + "]:" + bufrformitem.searchtext + ":" + searchtext + ":" + test);
            if (test > -1) {
              docids.push(bufrformitem.bufrid);
            }
          }
          console.debug("docids:" + docids.length);
          $("table#bufrformlisting tr").each(function(i, o) {
            if ($(o).css("display") == 'table-row') {
              var thisdocid = $(o).attr("annotid");
              $(o).css("display", (docids.includes(thisdocid) ? "table-row":"none"));
            }
          });
        } else if (bufrformsrch.val2) {
          console.debug(a + ' : bufrformsrch.val2 : ' + bufrformsrch.val2);
          var n1 = parseInt(bufrformsrch.val1.replaceAll("-",""),10);
          var n2 = parseInt(bufrformsrch.val2.replaceAll("-",""),10);
          $("table#bufrformlisting tr").each(function(i, o) {
            if ($(o).css("display") == 'table-row') {
              var checkval = $(o).attr(bufrformsrch.attr);
              checkval = checkval.replaceAll("-","");
              checkval = parseInt(checkval,10);
              $(o).css("display", ((checkval >= n1 && checkval <= n2) ? "table-row":"none"));
            }
          });
        } else {
          if (bufrformsrch.type == "formstatus") {
            // CVPortal.components.cvResourceManager.filterBufrFormView([{"type":"formstatus", "attr":"issuppressed", "val1":formstatus}]);
            // ALL|Active|Archive
            var formstatusselect = bufrformsrch.val1;
            $("table#bufrformlisting tr").each(function(i, o) {
              if ($(o).css("display") == 'table-row') {
                var formstatus = $(this).attr(bufrformsrch.attr);
                var show = true;
                if ((formstatusselect == 'Active' && formstatus == 'true') || 
                    (formstatusselect == 'Archive' && formstatus == 'false')) {
                  show = false;
                }
                $(o).css("display", (show ? "table-row":"none"));
              }
            });
          } else {
            $("table#bufrformlisting tr").each(function(i, o) {
              if ($(o).css("display") == 'table-row') {
                if (bufrformsrch.attrs) {
                  var chkd = false;
                  for (a in bufrformsrch.attrs) {
                    var checkval = $(o).attr(bufrformsrch.attrs[a]);
                    if (checkval == bufrformsrch.val1) chkd = true;
                  }
                  $(o).css("display", (chkd ? "table-row":"none"));
                } else if (bufrformsrch.attr) {
                  var checkval = $(o).attr(bufrformsrch.attr);
                  $(o).css("display", (checkval == bufrformsrch.val1 ? "table-row":"none"));
                } else {
                  console.debug(a + ' :[3] ' + i + ' : bufrformsrch err...');
                }
              }
            });
          }
        }
      }
      $("table#bufrformlisting tr").each(function(i, o) {
        if ($(o).css("display") == 'table-row') {
          currentdisplay++;
          if ($(o).hasClass('highlightOODRM')) {
            currenthighlgt++;
            /* <tr xref="SPITFIRE-AAAA-27-10-00-00-AA-369-C-A" annotid="bufr-1653938380198-1644823400198" srcuser="dburrows" date="2022-02-17" s1diss="000-06">
            <td style="vertical-align:top"></td>
            <td style="vertical-align:top"><div>
            <b class="bufrdmc">SPITFIRE-AAAA-27-10-00-00AA-369C-A</b>: 000-06</div><div class="bufrref">"<span class="bufrrefno">BUFR/SPITFIRE/00242</span>", (user: <b class="bufroriginator">dburrows</b>, <span class="bufrorigindate">2022-02-17</span>)</div></td></tr>
            */
            var s = $(o).find("span.bufrrefno").html() + ' for ' + $(o).attr("xref") + ', created by ' + $(o).attr("srcuser") + ' at issue ' + $(o).attr("s1diss") + ' on ' + $(o).attr("date");
            highlightedrows.push(s);
          }
        }
      });
      $("#currentbufrdisplayct").html(("" + currentdisplay));
      $("#currentbufrhighlightct").html(currenthighlgt > 0 ? ("(" + currenthighlgt + " highlighted entries) "):"(no highlighted entries) ");
      if (currenthighlgt > 0 || params[0].highlight) {
        var msg = currenthighlgt + ' highlighted ' + CVPortal.components.cvDocHandler.form765name + ' forms';
        var buttons = [
          {"label":"OK", "id":"yayBtn"},
        ];
        getModal('Highlighted ' + CVPortal.components.cvDocHandler.form765name + ' forms' ,msg, buttons, MSGBOXTYPEINF);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
        }
        // List any highlighted items CVPortal.components.cvResourceManager.currentbufrreportid
        var reporteditems = '';
        for (a in highlightedrows) {
          reporteditems = reporteditems + '• ' + highlightedrows[a] + '<br>';
        }
        $("#" + CVPortal.components.cvResourceManager.currentbufrreportid).html(reporteditems);
      }
    } else {
      CVPortal.components.cvResourceManager.bufrformsrchs = [];
      CVPortal.components.cvResourceManager.resetBufrListing();
      $("#currentbufrdisplayct").html(("All"));
      $("#currentbufrhighlightct").html((""));
    }
    CVPortal.components.cvResourceManager.previousearch = CVPortal.components.cvResourceManager.currentsearch;
  },
  
  setUpBufrFormControls: function() {
    var bufrfomrhtml = '';
    var ct = this.bufrformcount;
    var trmouse = ' onmouseover="this.style.backgroundColor=\'#eee\'" onmouseout="this.style.backgroundColor=\'#fff\'"'
    bufrfomrhtml = bufrfomrhtml + '<div>&#0160;</div><div>Showing <span id="currentbufrdisplayct">All</span> of ' + this.bufrformcount + ' ' + CVPortal.components.cvDocHandler.form765name + ' forms <span id="currentbufrhighlightct"></span>' + this.bufrformusers + '<br></div>';
    bufrfomrhtml = bufrfomrhtml + '<ul class="tight">';
    bufrfomrhtml = bufrfomrhtml + '<li>BUFRs linked to unresolved Data Modules are marked with an \'!\', for example <span style="color:#999;font-weight:bold">!SPITFIRE-AAAA-00-00-00-00AA-000A-A</span></li>';
    bufrfomrhtml = bufrfomrhtml + '<li>Archived BUFRs are marked the "broken" icon: <img src="' + CVPortal.fetchSkinImage("aircraft/bufr765suppressed.16.png") + '"></li>';
    bufrfomrhtml = bufrfomrhtml + '</ul>';

    var allsysts = [];
    var allusers = [];
    var alldates = [];
    for (a in CVPortal.components.cvResourceManager.bufrformitems) {
      var bufrformitem = CVPortal.components.cvResourceManager.bufrformitems[a];
      if (!allsysts.includes(bufrformitem.sys1)) allsysts.push(bufrformitem.sys1);
      if (!allsysts.includes(bufrformitem.sys2)) allsysts.push(bufrformitem.sys2);
      if (!allsysts.includes(bufrformitem.sys3)) allsysts.push(bufrformitem.sys3);
      if (!allusers.includes(bufrformitem.user)) allusers.push(bufrformitem.user);
      if (!alldates.includes(bufrformitem.date)) alldates.push(bufrformitem.date);
    }
    allsysts.sort();
    allusers.sort();
    alldates.sort(function(a, b){
      let x = a.toLowerCase();
      let y = b.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    var bufrsearchformfields = [];
    var bufrsearchbtns = [];
    var helpmsg = '...';
    
    var tablebdrstyletop = 'border-top:1px solid #ccc;';
    var tablebdrstylebtm = 'border-bottom:1px solid #ccc;';
    var tablebdrstylelft = 'border-left:1px solid #ccc;';
    var tablebdrstylergt = 'border-right:1px solid #ccc;';

    bufrfomrhtml = bufrfomrhtml + '<div style="margin-bottom:12px;"><br><b>BUFR filtering and reporting</b></div>';
    bufrfomrhtml = bufrfomrhtml + '<table cellpadding="0" cellspacing="0"><tbody><tr><td style="vertical-align:top;">';
    bufrfomrhtml = bufrfomrhtml + '<table cellpadding="8" cellspacing="0" id="bufrsearchfields">';
    bufrfomrhtml = bufrfomrhtml + '<tbody>';

    // Date range
    helpmsg = 'Select a date range the BUFR was raised';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstyletop + tablebdrstylelft + '"><span class="helpmsg" title="' + helpmsg + '">Date range<br>(from &gt; to)</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstyletop + '"><select name="sltBufrformsearchDat1" id="sltBufrformsearchDat1">';
    bufrfomrhtml = bufrfomrhtml + '<option value="---">---</option>';
    for (a in alldates) {
      var date = alldates[a];
      bufrfomrhtml = bufrfomrhtml + '<option value=' + date + '>' + date + '</option>';
    }
    bufrfomrhtml = bufrfomrhtml + '</select><br><select name="sltBufrformsearchDat2" id="sltBufrformsearchDat2">';
    bufrfomrhtml = bufrfomrhtml + '<option value="---">---</option>';
    for (a in alldates) {
      var date = alldates[a];
      bufrfomrhtml = bufrfomrhtml + '<option value=' + date + '>' + date + '</option>';
    }
    bufrfomrhtml = bufrfomrhtml + '</select></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstyletop + tablebdrstylergt + '"><button disabled id="btnBufrformsearchDate">&gt;</button></td></tr>';
    bufrsearchformfields.push("sltBufrformsearchDat1");
    bufrsearchformfields.push("sltBufrformsearchDat2");
    bufrsearchbtns.push('btnBufrformsearchDate');
    // / Date range

    // System
    helpmsg = 'Select the relevant aircraft system';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstylelft + '"><span class="helpmsg" title="' + helpmsg + '">System</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style=""><select name="sltBufrformsearchSyst" id="sltBufrformsearchSyst">';
    bufrfomrhtml = bufrfomrhtml + '<option value="---">---</option>';
    for (a in allsysts) {
      var sys = allsysts[a];
      bufrfomrhtml = bufrfomrhtml + '<option value=' + sys + '>' + sys + '</option>';
    }
    bufrfomrhtml = bufrfomrhtml + '</select></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylergt + '"><button disabled id="btnBufrformsearchSyst">&gt;</button></td></tr>';
    bufrsearchformfields.push("sltBufrformsearchSyst");
    bufrsearchbtns.push('btnBufrformsearchSyst');
    // / System

    // BUFR originator
    helpmsg = 'Select the BUFR originator';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstylelft + '"><span class="helpmsg" title="' + helpmsg + '">BUFR originator</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style=""><select name="sltBufrformsearchUser" id="sltBufrformsearchUser">';
    bufrfomrhtml = bufrfomrhtml + '<option value="---">---</option>';
    for (a in allusers) {
      var user = allusers[a];
      bufrfomrhtml = bufrfomrhtml + '<option value=' + user + '>' + user + '</option>';
    }
    bufrfomrhtml = bufrfomrhtml + '</select></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylergt + '"><button disabled id="btnBufrformsearchUser">&gt;</button></td></tr>';
    bufrsearchformfields.push("sltBufrformsearchUser");
    bufrsearchbtns.push('btnBufrformsearchUser');
    // / BUFR originator
    
    // Archive,active,all
    helpmsg = 'Select the active/archive status of the BUFRs';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstylelft + '"><span class="helpmsg" title="' + helpmsg + '">ALL|Active|Archive BUFRs</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style=""><select name="sltBufrformsearchArchive" id="sltBufrformsearchArchive">';
    bufrfomrhtml = bufrfomrhtml + '<option value="---">---</option>';
    bufrfomrhtml = bufrfomrhtml + '<option value="ALL">ALL</option>';
    bufrfomrhtml = bufrfomrhtml + '<option value="Active">Active</option>';
    bufrfomrhtml = bufrfomrhtml + '<option value="Archive">Archive</option>';
    bufrfomrhtml = bufrfomrhtml + '</select></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylergt + '"><button disabled id="btnBufrformsearchArchive">&gt;</button></td></tr>';
    bufrsearchformfields.push("sltBufrformsearchArchive");
    bufrsearchbtns.push('btnBufrformsearchArchive');
    // / Archive,active,all

    // Free text search
    helpmsg = 'Search from text across the BUFR content';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstylelft + tablebdrstylebtm + '"><span class="helpmsg" title="' + helpmsg + '">Keyword search</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylebtm + '"><input type="text" id="txtBufrformsearchKeyW"></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylebtm + tablebdrstylergt + '"><button disabled id="btnBufrformsearchKeyW">&gt;</button></td></tr>';
    bufrsearchformfields.push("txtBufrformsearchKeyW");
    bufrsearchbtns.push('btnBufrformsearchKeyW');
    // / Free text search

    // Reporting BUFR applicable to current DM
    helpmsg = 'Check for BUFRs that my be out of date (a Data Module may now be in a more recent issue state then the BUFR instance)';
    bufrfomrhtml = bufrfomrhtml + '<tr' + trmouse + '><td style="' + tablebdrstylelft + tablebdrstylebtm + '" colspan="2"><span class="helpmsg" title="' + helpmsg + '">Check for potential superseded Data Modules</span></td>';
    bufrfomrhtml = bufrfomrhtml + '<td style="' + tablebdrstylebtm + tablebdrstylergt + '"><button id="btnBufrformsearchOODB">&gt;</button></td></tr>';
    // / Reporting BUFR applicable to current DM

    helpmsg = 'Reset all search and reporting filters';
    bufrfomrhtml = bufrfomrhtml + '<tr><td colspan="3"><center><button style="width:100%" id="btnBufrformsearchReSt"><span class="helpmsg" title="' + helpmsg + '">Reset BUFR filters</span></button></center></td></tr>';
    bufrsearchbtns.push('btnBufrformsearchReSt');

    bufrfomrhtml = bufrfomrhtml + '</tbody></table></td><td>&#0160;</td><td style="vertical-align:top;">';
    bufrfomrhtml = bufrfomrhtml + '<div style="overflow-y:scroll; width:500px; height:400px; padding:3px; border:1px solid #ccc;" id="' + CVPortal.components.cvResourceManager.currentbufrreportid + '"></div>';
    bufrfomrhtml = bufrfomrhtml + '</td></tr><tbody></table>';
    
    $("#rightDialog").html(bufrfomrhtml);
    document.querySelector("#btnBufrformsearchDate").onclick = function() {
      CVPortal.components.cvResourceManager.filterBufrFormView(); // Need to filter this first
      var date1 = document.querySelector("#sltBufrformsearchDat1").value;
      var date2 = document.querySelector("#sltBufrformsearchDat2").value;
      if (date1 !== '---' && date2 !== '---') {
        CVPortal.components.cvResourceManager.currentsearch = 1;
        CVPortal.components.cvResourceManager.filterBufrFormView([{"type":"date", "attr":"date", "val1":date1, "val2":date2}]);
      } else {
        document.querySelector("#sltBufrformsearchDat1").focus()
      }
    }
    document.querySelector("#btnBufrformsearchSyst").onclick = function() {
      var thesys = document.querySelector("#sltBufrformsearchSyst").value;
      if (thesys !== '---') {
        CVPortal.components.cvResourceManager.currentsearch = 2;
        CVPortal.components.cvResourceManager.filterBufrFormView([{"type":"syst", "attrs":["sys1","sys2","sys3"], "val1":thesys}]);
      } else {
        document.querySelector("#sltBufrformsearchSyst").focus()
      }
    }
    document.querySelector("#btnBufrformsearchUser").onclick = function() {
      var theuser = document.querySelector("#sltBufrformsearchUser").value;
      if (theuser !== '---') {
        CVPortal.components.cvResourceManager.currentsearch = 3;
        CVPortal.components.cvResourceManager.filterBufrFormView([{"type":"user", "attr":"srcuser", "val1":theuser}]);
      } else {
        document.querySelector("#sltBufrformsearchUser").focus()
      }
    }
    document.querySelector("#btnBufrformsearchArchive").onclick = function() {
      var formstatus = document.querySelector("#sltBufrformsearchArchive").value;
      if (formstatus !== '---') {
        CVPortal.components.cvResourceManager.currentsearch = 4;
        CVPortal.components.cvResourceManager.filterBufrFormView([{"type":"formstatus", "attr":"issuppressed", "val1":formstatus}]);
      } else {
        document.querySelector("#sltBufrformsearchUser").focus()
      }
    }
    document.querySelector("#btnBufrformsearchKeyW").onclick = function() {
      var thesearchtext = document.querySelector("#txtBufrformsearchKeyW").value;
      if (thesearchtext && thesearchtext.trim() !== '') {
        CVPortal.components.cvResourceManager.currentsearch = 4;
        CVPortal.components.cvResourceManager.filterBufrFormView([{"searchtext":thesearchtext.trim()}]);
      } else {
        document.querySelector("#txtBufrformsearchKeyW").focus()
      }
    }
    document.querySelector("#btnBufrformsearchOODB").onclick = function() {
      CVPortal.components.cvResourceManager.currentsearch = -1; // Set this as -1 so we cant do reports against searches
      CVPortal.components.cvResourceManager.filterBufrFormView([{"report":"oodb", "highlight":"1"}]);
    }
    document.querySelector("#btnBufrformsearchReSt").onclick = function() {
      for (a in bufrsearchformfields) {
        var o = $("#" + bufrsearchformfields[a]);
        $(o).val($(o).prop("tagName").toLowerCase() == 'select' ? "---":"");
        $(o).trigger('change');
      }
      CVPortal.components.cvResourceManager.currentsearch = 0;
      CVPortal.components.cvResourceManager.filterBufrFormView();
    }

    var dat1set = false;
    var dat2set = false;
    document.querySelector("#sltBufrformsearchDat1").onchange = function() {
      dat1set = false;
      var val = this.value;
      if (val != '---') dat1set = true;
      document.querySelector("#btnBufrformsearchDate").disabled = (!dat1set || !dat2set);
    }
    document.querySelector("#sltBufrformsearchDat2").onchange = function() {
      dat2set = false;
      var val = this.value;
      if (val != '---') dat2set = true;
      document.querySelector("#btnBufrformsearchDate").disabled = (!dat1set || !dat2set);
    }
    document.querySelector("#sltBufrformsearchSyst").onchange = function() {
      document.querySelector("#btnBufrformsearchSyst").disabled = (this.value == '---');
    }
    document.querySelector("#sltBufrformsearchUser").onchange = function() {
      document.querySelector("#btnBufrformsearchUser").disabled = (this.value == '---');
    }
    document.querySelector("#sltBufrformsearchArchive").onchange = function() {
      document.querySelector("#btnBufrformsearchArchive").disabled = (this.value == '---');
    }
    

    document.querySelector("#txtBufrformsearchKeyW").onchange = function() {
      document.querySelector("#btnBufrformsearchKeyW").disabled = (this.value == '---');
    }
  },

  viewTabletbufr765formsResourceList: function(xml, type, xref) {
    var rM = this;
    var formType = $("form_instances", xml).attr("form_name");
    var resContent;
    $("#resourceContents", this.panel.getElement(this.id)).each(function() { resContent = this; });
    var rightList = $("#rightList");
    var htmlString = "<table width='98%' cellpadding='2' id='bufrformlisting'>";
    CVPortal.components.cvResourceManager.bufrformcount = 0;
    CVPortal.components.cvResourceManager.bufrformusers = '';
    CVPortal.components.cvResourceManager.bufrformitems = [];
    CVPortal.components.cvDocHandler.form765instance = null;
    var dminfo = [];
    var len = 0;
    if ($("form-instance", xml).length == 0) {
      htmlString += "<tr><td colspan='3'>" + CVPortal.getResource("resourceList.msg.nobufrforms") + "</td></tr>";
    } else {
      // For BUFR searching add DM-specific to these object.
      // We need to know the issue/inwork of the current DM to check for out-of-date forms
      len = $("form-instance", xml).length;
      $("form-instance", xml).each(function(i, o) {
        console.debug(i + ' : ' + CVPortal.components.cvDocHandler.getXmlString(o));
        
        var thisUser = $("user", $(this)).text();
        // 2022-05-23: Disabled this check on user, all users have access to view all forms
        //if (CVPortal.components.cvResourceManager.userGroup == 'ADMINISTRATOR' || (CVPortal.components.cvResourceManager.user == thisUser)) {
        /* <form-instance><form-header>
          <form-id>...</form-id><user>...</user>
          </form-header><form-data>
          <cond id="hidden_lcsdmcxref"><item>...</item></cond>
          <cond id="txt_origdate"><item>...</item></cond>
          <cond id="txt_origReference"><item>...</item></cond>
          <cond id="txt_docRefDmc"><item>...</item></cond>
          <cond id="txt_docRefIssueInw"><item>...</item></cond>
          <cond id="ta_report1"><item>why</item></cond>
          <cond id="ta_report2"><item>how</item></cond>
          <cond id="chk_suppressionreason"><item>spr</item></cond>
        </form-data></form-instance> */
        var bufrid = $("form-header form-id", $(this)).text();
        var thisdmc = $("#txt_docRefDmc item", $(this)).text();
        var thisdocid = $("#hidden_lcsdmcxref item", $(this)).text();
        var dmcparts = thisdmc.split("-"); // SPITFIRE-AAAA-06-00-00-00AA-040A-A
        var thissys1 = dmcparts[2];
        var thissys2 = dmcparts[2] + '-' + dmcparts[3];
        var thissys3 = dmcparts[2] + '-' + dmcparts[3] + '-' + dmcparts[4];
        var thisdate = $("#txt_origdate item", $(this)).text();
        var thisiss = $("#txt_docRefIssueInw item", $(this)).text();
        var thisref = $("#txt_origReference item", $(this)).text();
        var thisspr = $("#chk_suppressionreason item", $(this)).text();
        var searchtext = "";
        searchtext = searchtext + $("#ta_report1 item", $(this)).text() + " ";
        searchtext = searchtext + $("#ta_report2 item", $(this)).text() + " ";
        searchtext = searchtext + $("#txt_origReference item", $(this)).text() + " ";
        searchtext = searchtext + $("#slt_AircraftMark item", $(this)).text() + " ";
        searchtext = searchtext + $("#txt_docRefTitle item", $(this)).text() + " ";
        searchtext = searchtext + $("#txt_docRefElementLevel item", $(this)).text() + " ";
        console.debug(i + ' : ' + thisdmc + ' : ' + searchtext);
        if (bufrid == xref) {
          CVPortal.components.cvDocHandler.form765instance = bufrid;
        }
        var issuppressed = (thisspr == 'true');
        var shouldhighlight = (bufrid == xref);
        var shouldsemihighlight = false;
        // Also select all 'form765matchs' .semihighlightRM
        try {
          for (a in form765matchs) {
            var form765match = form765matchs[a];
            if (thisdmc == form765match.dmc) shouldsemihighlight = true;
          }
        } catch(e) {}
        // classstring = 'simpleClickable' + (issuppressed ? (' suppressedbufrRM': (shouldhighlight ? ' highlightRM':(shouldsemihighlight ? ' semihighlightRM':''))));
        var classstring = 'simpleClickable' + (issuppressed ? ' suppressedbufrRM':(shouldhighlight ? ' highlightRM':(shouldsemihighlight ? ' semihighlightRM':'')));
        CVPortal.components.cvResourceManager.bufrformcount = (CVPortal.components.cvResourceManager.bufrformcount + 1);
        var thishtmlstring = "";
        thishtmlstring += "<tr class='" + classstring + "' onclick='CVPortal.components.cvResourceManager.selectResource(event);' ";
        thishtmlstring += "offset='0' type='F' xref='" + thisdocid + "' issuppressed='" + issuppressed + "'";
        thishtmlstring += "annotid='" + bufrid + "' srcuser='" + thisUser + "' date='" + thisdate + "' s1diss='" + thisiss + "' ";
        thishtmlstring += "sys1='" + thissys1 + "' sys2='" + thissys2 + "' sys3='" + thissys3 + "' ";
        thishtmlstring += ">";
        // thishtmlstring += "<td style='vertical-align:top' class='formNumber'></td>"; // LAM:2022-06-14; removed per Mark and Stu
        thishtmlstring += "<td style='vertical-align:top'><img src='" + CVPortal.fetchSkinImage("aircraft/" + 
          (issuppressed ? 'bufr765suppressed.16.png':'bufr765.16.png')) + "'></td>";
        thishtmlstring += "<td style='vertical-align:top'>"; // + $("form-header form-id", $(this)).text();
        thishtmlstring += "<div><b class='bufrdmc'>" + thisdmc + "</b>: " + thisiss + "</div>";
        thishtmlstring += "<div class='bufrref'>\"<span class='bufrrefno'>" + thisref + "</span>\", ";
        thishtmlstring += "(user: <b class='bufroriginator'>" + thisUser + "</b>, <span class='bufrorigindate'>" + thisdate +"</span>)</div>";
        thishtmlstring += "</td></tr>";
        var o = new Object();
        o.htmlstring = thishtmlstring;
        o.user = thisUser;
        o.dmc = thisdmc;
        o.sys1 = thissys1;
        o.sys2 = thissys2;
        o.sys3 = thissys3;
        o.date = thisdate;
        o.iss = thisiss;
        o.ref = thisref;
        o.docid = thisdocid;
        o.bufrid = bufrid;
        o.dmcissue = thisdmc + '_' + thisiss;
        o.searchtext = searchtext;
        CVPortal.components.cvResourceManager.bufrformitems.push(o);
        dminfo.push(thisdocid);
        //}
      });
    }
    // Check dminfo, run call to get issue info then addback to CVPortal.components.cvResourceManager.bufrformitems
    var formData = "";
    formData = formData + "<request>";
    formData = formData + "<query>.//identAndStatusSection/dmAddress/dmIdent/issueInfo</query>";
    formData = formData + "</request>";
    for (a in dminfo) {
      var docId = dminfo[a];
      var url = CVPortal.getURLwithBookParams("time") + "&target=interface&action=xpath_query&html_entity=1&document=" + docId;
      var xmlReturn = CVPortal.ajaxPostXMLData(url, formData);
      try {
        for (b in CVPortal.components.cvResourceManager.bufrformitems) {
          var o = CVPortal.components.cvResourceManager.bufrformitems[b];
          // o.(htmlstring|user|dmc|sys1|sys2|sys3|date|iss|ref|docid|bufrid|dmcissue|searchtext)
          if (o && (o.docid == docId)) {
            var doc = CVPortal.components.cvDocHandler.getXmlDoc(xmlReturn.responseText);
            var i = doc.querySelector("item > issueInfo");
            var iss = i == null ? null:i.getAttribute("issueNumber");
            var inw = i == null ? null:i.getAttribute("inWork");
            if ((iss && iss != null) && (inw && inw != null)) {
              o.dmissue = iss + '-' + inw;
              o.valid = 1;
            } else {
              o.valid = -1;
            }
            CVPortal.components.cvResourceManager.bufrformitems[b] = o;
          }
        }
      } catch(e) {}
    }
    CVPortal.components.cvResourceManager.bufrformitems.sort(function(a, b){
      let x = a.dmcissue.toLowerCase();
      let y = b.dmcissue.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    var formusers = [];
    for (a in CVPortal.components.cvResourceManager.bufrformitems) {
      var formitem = CVPortal.components.cvResourceManager.bufrformitems[a];
      var thishtmlstring = formitem.htmlstring;
      /* LAM:2022-06-14; removed per Mark and Stu
      var thisnumber = (parseInt(a,10) + 1);
      thishtmlstring = thishtmlstring.replaceAll(
        "<td style='vertical-align:top' class='formNumber'></td>",
        "<td style='vertical-align:top' class='formNumber' ct='" + thisnumber + "'>" + thisnumber + "</td>");
      */
      if (formitem.valid == -1) {
        thishtmlstring = thishtmlstring.replaceAll("<b class='bufrdmc'>","<b class='bufrdmc' style='color:#999;' title='Unresolved Data Module Code'>!");
      }
      
      htmlString += thishtmlstring;
      if (!formusers.includes(formitem.user)) {
        formusers.push(formitem.user);
      }
    }
    htmlString += "</table>";
    updateProgress('Showing ' + CVPortal.components.cvResourceManager.bufrformcount + ' of ' + len + ' BUFR forms');
    console.info('Showing ' + CVPortal.components.cvResourceManager.bufrformcount + ' of ' + len + ' BUFR forms');
    $("#rightDialog").empty();
    if (CVPortal.components.cvResourceManager.bufrformcount == 0) {
      htmlString += "<tr><td colspan='3'><div>No " + CVPortal.components.cvDocHandler.form765name + " forms" + (CVPortal.components.cvResourceManager.userGroup == 'ADMINISTRATOR' ? "":" for user " + CVPortal.components.cvResourceManager.user) + "</div></td></tr>";
    } else {
      CVPortal.components.cvResourceManager.bufrformusers = (formusers.length > 0 ? "for users " + formusers.toString().replaceAll(",",", ") : "");
      CVPortal.components.cvResourceManager.setUpBufrFormControls();
    }
    $(rightList).html(htmlString);
    // TODO: need to set this.currentResource, which is the TR
    console.info('form765instance? ' + CVPortal.components.cvDocHandler.form765instance);
    if (CVPortal.components.cvDocHandler.form765instance) {
      CVPortal.components.cvResourceManager.currentResource = $("tr.highlightRM[annotid='" + CVPortal.components.cvDocHandler.form765instance + "']");
    }
  },

  showBufr765Dialog: function(mode, highlight, xref) {
    if ($("#rightPanel").length > 0) {
      CVPortal.components.cvResourceManager.viewTabletResource("bufr765forms", highlight, xref);
      return;
    } else {
      alert('showBufr765Dialog .........................................................')
      return;
    }
    var ceid = CVPortal.components.cvDocHandler.isDocumentOpen();

    if (ceid == false) {
      alert(CVPortal.getResource("message.requiresDocumentOpen"));
      CVPortal.error(" { Resource Mngr } Failed to add attachment as a document is not open");
      return;
    }
    // based on the Manager being open, select our appropriate modal:
    var tempPanel;
    if (this.managerOpen == 1) { tempPanel = this.secondPanel } else { tempPanel = this.panel; }

    var docId;
    var locationTitle;
    docId = CVPortal.components.cvDocHandler.getDocumentProperty("docId");
    locationTitle = CVPortal.components.cvDocHandler.getDocumentProperty("location");
    
    var dlgurl = CVPortal.getURLwithBookParams("time") + "&target=attach&action=attachments&docid="+docId+"&eid="+ceid+"&location="+locationTitle;
    console.info('327:dlgurl:' + dlgurl);
    //show the attachment dialog popup
    var cvRM = this;
    cvRM.ceid = ceid;
    cvRM.docId = docId;
    $.ajax( {
      method: "GET", dataType: "html", url: dlgurl,
      cache: false,
      success: function(html) {
        //alert("html :"+ html);
        tempPanel.setContent(html, cvRM.id);
        CVPortal.controlFactory().seekControls(tempPanel.getElement(cvRM.id));

        // get our virtual controls for "OK":
        cvRM.okButton = cvRM.getVirtualControl("okButton");

        // enable our buttons:
        cvRM.okButton.enable();
        cvRM.showAttachList();

        //function to show public check box and details..
        cvRM.checkPublicFlag();

        // post the approriate title:
        var mTitle = "Attachments";
        CVPortal.components["cvModalHandler"].setTitle(mTitle);
        CVPortal.components["cvModalHandler"].openModal();
      }
    });

    CVPortal.info(" { Resource Mngr } Successfully opened attachment Dialog for doc :"+ceid + " with manager flag: " + cvRM.managerOpen);
  },
  
  deleteBufrForm: function(thisbufr, thisitem) {
    /* <tr class="simpleClickable semihighlightRM highlightRM" onclick="CVPortal.components.cvResourceManager.selectResource(event);" offset="0" type="F" xref="SPITFIRE-AAAA-06-00-00-00-AA-040-A-A" annotid="bufr-1653938380001-1644823400001" srcuser="dburrows"> */
    console.info('Trying to remove ' + thisbufr + '...');
    var isdeleted = true;
    var url = CVPortal.getURLwithBookParams("time");
    url += "&target=forms&action=delete_form_instance&form_type=genforms";
    url += "&form_name=" + CVPortal.components.cvDocHandler.form765name;
    url += "&instance_name=" + thisbufr + "&instance_id=" + thisbufr;
    $.ajax( {
      type: "GET", url: url, dataType: "xml",
      async: true, cache: false,
      success: function (xml,status,xhr) { // console.info('1077:deleteResource:' + CVPortal.components.cvDocHandler.getXmlString(xml));
        $("instance", xml).each(function(i, o) { // <instance name="bufr-...">bufr-...</instance>
          if ($(o).attr('name') == thisbufr) isdeleted = false;
        });
        if (isdeleted) { // delete thisitem
          try {
            console.info("Deleting " + thisbufr);
            thisitem.parentNode.removeChild(thisitem);
          } catch(e) {
            console.error(thisbufr + " was not removed from the BUFR listing in the panel");
            console.error(e);
          }
        } else {
          console.info(thisbufr + " was not removed from the server");
        }
      }, error: function(xhr, status, error) {
        console.error('1071:deleteResource:' + status + ' | ' + error);
      }, complete: function() {
        console.info('1073:deleteResource:' + thisbufr + ' was deleted? ' + isdeleted);
        if (!isdeleted) {
          var msg = thisbufr + " was not deleted";
          var buttons = [
            {"label":"OK", "id":"yayBtn"},
          ];
          getModal('Unable to delete BUFR form',msg,buttons,MSGBOXTYPEWRN);
          document.querySelector("#yayBtn").onclick = function() {
            modalUI.remove();
          }
          return;
        }
      }
    });
  },

  deleteResource: function() {
    cvResourceManager.prototype.deleteResource.call(this);
    if (this.currentResource != null) {
      var thisitem = this.currentResource;
      if (this.typeObj.type == "bufr765forms") {
        var thisuser = thisitem.getAttribute("srcuser");
        // If this isn't the current user and can't in fact delete it we need to disallow this
        if (CVPortal.components.cvResourceManager.user != thisuser) {
          var msg = "Only the owner of this BUFR form (" + thisuser + ") can delete it";
          var buttons = [
            {"label":"OK", "id":"yayBtn"},
          ];
          getModal(CVPortal.components.cvResourceManager.user + ' cannot delete this BUFR form',msg,buttons,MSGBOXTYPEWRN);
          document.querySelector("#yayBtn").onclick = function() {
            modalUI.remove();
          }
          return;
        }
        var thisbufr = thisitem.getAttribute("annotid");
        var msg = "Delete this BUFR entry?<br><br>• " + thisbufr;
        var buttons = [
          {"label":"Yes", "id":"yayBtn"},
          {"label":"No",  "id":"nayBtn"},
        ];
        getModal('Delete BUFR form?',msg,buttons,MSGBOXTYPEQST);
        document.querySelector("#yayBtn").onclick = function() {
          modalUI.remove();
          CVPortal.components.cvResourceManager.deleteBufrForm(thisbufr, thisitem);
        }
        document.querySelector("#nayBtn").onclick = function() {
          modalUI.remove();
        }
      }
    }
  },
  getAllFormsInstances: function() {
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form_instances';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    $.ajax({
      type: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function (result,status,xhr) {
        // <instance name='savedsearches-1459152075302-1459152581728'>New Saved Search</instance>
        $("instance", result).each(function() {
          console.debug($(this).attr("name") + " : " + $(this).text())
        });
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
        return -1;
      }
    });
  },
  deleteAllResources: function() {
    console.info('deleteAllResources: ' + this.typeObj.type + '|' + CVPortal.components.cvDocHandler.form765name)
    if (this.typeObj.type == 'bufr765forms') {
      var msg = "Are you sure you want to remove all " + CVPortal.components.cvDocHandler.form765name + " forms?";
      var buttons = [
        {"label":"Yes", "id":"yayBtn"},
        {"label":"No",  "id":"nayBtn"},
      ];
      getModal('Delete all BUFR forms?',msg,buttons,MSGBOXTYPEQST);
      document.querySelector("#yayBtn").onclick = function() {
        modalUI.remove();
        CVPortal.components.cvResourceManager.getAllFormsInstances();
        var url = CVPortal.getURLwithBookParams("time") + "&target=forms&action=delete_all_form_instances&form_type=genforms&form_name=" + CVPortal.components.cvDocHandler.form765name;
        $.ajax({ 
          method: "GET", url: url, async: false, cache: false, dataType: "xml",
          success: function(xml) {
            if (CVPortal.metaFactory().get("META_USERGROUP") == 'ADMINISTRATOR') {
              var len = $("instance", xml).length;
              if (len > 0) {
                // TODO: use remote login and remove ALL forms by different users
                msg = "Not all BUFR forms were deleted, there are still " + len + " forms remaining";
                buttons = [
                  {"label":"OK", "id":"yayBtn"},
                ];
                getModal('Not all BUFR forms were deleted',msg,buttons,MSGBOXTYPEINF);
                document.querySelector("#yayBtn").onclick = function() {
                  modalUI.remove();
                  showHideControls(1);
                  CVPortal.components['cvResourceManager'].viewTabletResource('bufr765forms');
                  showHideControls(0);
                }
              }
            }
          }, error: function(xhr, status, error) {
            console.error('1074:deleteAllResources:' + status + ' | ' + error);
          }
        });
      }
      document.querySelector("#nayBtn").onclick = function() {
        modalUI.remove();
      }
    } else {
      cvResourceManager.prototype.deleteAllResources.call(this);
    }
  },
  
  goToResource: function() {
		var cvRM = this;
		
		if(this.currentResource != null) {
			if(this.typeObj.type == "genericforms-SavedSearches") {
				var instanceId = this.currentResource.getAttribute("xref");
				var url = CVPortal.getURLwithBookParams() + "&target=forms&action=get_form&form_type=genforms&form_name=" + this.typeObj.form_name + "&instance_name=" + instanceId + "&instance_id=" + instanceId;
				$.ajax({
					method: "GET", url: url,
					cache: false, async: false, dataType: "xml",
					success: function(xml) {
						CVPortal.components.cvSearch.restoreFromSavedSearchXML(xml);
						cvRM.closeResourceManager(true);
					}
				});
				return;
			} else {
        console.debug('this.typeObj.type? ' + this.typeObj.type);
        if(this.typeObj.type == "bufr765forms") {
          
        }
				CVPortal.components["cvDocHandler"].loadDocumentByDocId(this.currentResource.getAttribute("xref"));
				this.closeResourceManager(true);
				this.rMsyncTOC = true;
			}
		} else {
			alert(CVPortal.getResource("alert.select.object.to.goto"));
		}
  },
  
  viewResource: function(xml_flag) {
    console.debug('viewResource[1]:xml_flag:' + xml_flag + ' : ' + this.typeObj.type);
    if (this.typeObj.type == 'bufr765forms') {
      if (this.currentResource) {
        CVPortal.components.cvDocHandler.form765instance = this.currentResource.getAttribute("annotid");
      }
      console.debug('viewResource[2]:xml_flag:' + this.currentResource + ':' + CVPortal.components.cvDocHandler.form765instance);
      if (!this.currentResource && CVPortal.components.cvDocHandler.form765instance) {
        console.debug('viewResource[2A]:xml_flag:' + this.currentResource + ':' + CVPortal.components.cvDocHandler.form765instance);
        this.currentResource = $("tr.highlightRM[annotid='" + CVPortal.components.cvDocHandler.form765instance + "']");
      }
      if (this.currentResource) {
        console.debug('viewResource[3]:xml_flag:' + xml_flag + ' : ' + CVPortal.components.cvDocHandler.form765instance);
        CVPortal.components.cvDocHandler.loadOldForm765(CVPortal.components.cvDocHandler.form765instance);
      } else {
        alert('Please select the BUFR instance from the list');
      }
    } else {
      cvResourceManager.prototype.viewResource.call(this, xml_flag);
    }
  },
  /* LAM: 2020-03-17: Passwords
   At least 8 letters, 2021-07-13, At least 12 letters
   Must contain 1 * UC, 1 * num, 1 * spec char
  */
  validateModPassword: function(password,conf_password) {
    if (password.length < 12) return false;
    var goodcap = false;
    var goodnum = false;
    var goodchr = false;
    for (var a = 0; a < password.length; a++) {
      var chr = password.charAt(a);
      var n = password.charCodeAt(a);
      if (CVPortal.components.cvResourceManager.specchars.includes(n)) {
        goodchr = true;
      } else if (n < 48 || n > 255) { // bad char
        return false;
      } else if ((n > 48) && (n < 57)) { // Number
        goodnum = true;
      } else if ((n > 64) && (n < 91)) { // A-Z cap
        goodcap = true;
      }
    }
    //console.info('2262:' + password + ':' + conf_password + '|' + (password===conf_password) + '|' + (goodcap && goodnum && goodchr));
    //console.info('2262:' + password + ', goodcap ' + goodcap);
    //console.info('2262:' + password + ', goodnum ' + goodnum);
    //console.info('2262:' + password + ', goodchr ' + goodchr);
    //console.info('2262:' + password + ' = ' + (goodcap && goodnum && goodchr));

    // return (goodcap && goodnum && goodchr); LAM: 2021-07013, not necessary to have special char
    return (goodcap && goodnum);
  },

	validateUser: function() {
    this.userErrorMessage = "";
    var panel = this.secondPanel.getElement(this.id);
    if($("#rightPanel").length > 0) panel = $("#rightDialog");
    var login_name = $("#LOGIN_NAME", panel).val();
    var password = $("#PASSWORD", panel).val();
    var conf_password = $("#CONF_PASSWORD", panel).val();
    var user_group = $("#USER_GROUP", panel).val();
    var last_name = $("#LAST_NAME", panel).val();
    var first_name = $("#FIRST_NAME", panel).val();
    var middle_name = $("#MIDDLE_NAME", panel).val();
    var compCode = $("#COMP_CODE", panel).val();
    var company = $("#COMPANY", panel).val();
    var email = $("#EMAIL", panel).val();
    var conf_email = $("#CONF_EMAIL", panel).val();
    var expDate = $("#EXP_DATE", panel).val();
    var reminder = $("#REMINDER", panel).val();

		if (login_name=="") {
		   alert(CVPortal.getResource("alert.login.name.required.field"));
		   return false;
		}

		/* LAM: 2020-03-17: Passwords */
    if (!this.validateModPassword(password,conf_password)) {
      var msg = '';
      msg = msg + 'Password does not meet MOD requirements:';
      msg = msg + '\n\nMust be at least eight (12) characters in length.'; // LAM: 2021-07-13: 12 chars
      msg = msg + '\n\nMust contain both UC (A-Z) and LC (a-z) English character,';
      // msg = msg + '\na number, and a special char:\n\n'; // LAM: 2021-07-13: not necessarily a special char
      msg = msg + '\nand a number:\n\n';
      for (s in CVPortal.components.cvResourceManager.specchars) {
        msg = msg + String.fromCharCode(CVPortal.components.cvResourceManager.specchars[s]) + ' ';
      }
      msg = msg + '.';
      alert(msg);
      return false;
    }
    
    if (password.length<4) 	{ 
		   alert(CVPortal.getResource("alert.password.must.be.four.characters.long"));
		   return false;
		}
		if (password != conf_password) {
		   alert(CVPortal.getResource("alert.password.must.match.confirmation.password"));
		   return false;
		}

		if(user_group == "") {
			alert(CVPortal.getResource("alert.select.user.group"));
			return false;
		}

		if (last_name=="" || first_name == "") {
		   alert(CVPortal.getResource("alert.first.last.name.required"));
		   return false;
		}

		if (email=="") {
		   alert(CVPortal.getResource("alert.email.required.field"));
		   return false;

		} else {
			var pattern = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
			var re = new RegExp(pattern);
			var isValidEMail = re.test(email);

			if(isValidEMail == false)
			{
			   alert(CVPortal.getResource("alert.invalid.email.address"));
			  return false;
			}
		}

		if (email != conf_email) 	{
		   alert(CVPortal.getResource("alert.confirmation.email.must.match"));
		   return false;
		}

		return true;
	},

	selectResource: function(event) { 
		event = CVPortal.fixEvent(event); // fix our event:
		event.cancelBubble = true;
		var elem = CVPortal.eventGetElement(event);

		while(elem.nodeName != "TR") {
			elem = elem.parentNode;
		}

		if($(".highlightRM").length) {
			$(".simpleClickable").each(function() {
				$(this).removeClass("highlightRM");
			})
		}
		if($(".semihighlightRM").length) {
			$(".simpleClickable").each(function() {
				$(this).removeClass("semihighlightRM");
			})
		}
		$(elem).addClass("highlightRM");

		this.currentResource = elem;
		if(elem.getAttribute("type")=="A"){
			CVPortal.components['cvResourceManager'].editResource("edit");
		}
	},

};

// Extension for cvDocHandler
// Registered in \skins\BBMFskin\templates\config\components.xml <item extension="bbmf_cvTOC"/>
function bbmf_cvTOC() {
  this.currentChapterTitle = null; // CVPortal.components["cvTOC"].currentChapterTitle
}
bbmf_cvTOC.prototype = {

  extensionInit: function() {
  },

  toggleExpand: function(evt, element) {
    this.currentChapterTitle = null;
    var pDiv = element;
    if (evt) {
      //retrieve the element that was clicked on:
      var pDiv = CVPortal.eventGetElement(evt);
      while (pDiv.tagName != "DIV") {
        pDiv = $(pDiv).parent().get(0);
      }
    }
    // <span class="normal" cvtoctitle="1" id="S_7296">External publications</span>
    var chapTitle = $("span[cvtoctitle]:first", pDiv).text().trim();
    // console.debug('toggleExpand "' + chapTitle + '"');
    CVPortal.components.cvTOC.currentChapterTitle = chapTitle;
    cvTOC.prototype.toggleExpand.call(this, evt, element);
  },
  // CVPortal.components.cvTOC.somefunction()
	somefunction: function() {
    console.info('processLogin (custom)...');
	},
};

