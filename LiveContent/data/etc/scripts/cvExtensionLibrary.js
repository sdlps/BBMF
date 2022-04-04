// $Id: XY/etc/FullSupport/etc/scripts/cvExtensionLibrary.js 2.0 2019/05/23 18:38:18GMT milind Exp  $ 

// Extension for cvDocHandler
// Registered in \skins\BBMFskin\templates\config\components.xml <item extension="bbmf_cvDocHandler"/>
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
  this.form765instance = ''; // ID assigned by LCS
  this.form765orgowner = ''; // Person who created the form, only they can re-save it
  this.form765legacy = [];
  this.form765matchs = [];
  this.form765legacydoc = null;
  this.user = CVPortal.metaFactory().get("META_USER");
  this.userGroup = CVPortal.metaFactory().get("META_USERGROUP");
}

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

const USERUSER = 10;
const USERVALD = 25;
const USERSPUS = 50;
const USERADMN = 100;

bbmf_cvDocHandler.prototype = {

  // Extension initfunction (must have)
  extensionInit: function() {
    CVPortal.controlFactory().updateCondition("Form765Enabled","false");
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

  loadDocumentByCeId: function(docId, refStruct, noAuditFlag, isHistory) {
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
        iss = $("issueInfo:first", xmlDoc).attr('issueNumber');
        inw = $("issueInfo:first", xmlDoc).attr('inWork');
      }, error: function(error) {
        console.error('loadDocumentByCeId:error:' + error);
      },
    });
    console.info('You are in: ' + CVPortal.components.cvDocHandler.userGroup + '; Looking at a DM: ' + iss + '-' + inw);
    if (userLevel < USERSPUS) {
      // Get the DM XML and read the metadata
      var n1 = 0, n2 = 0;
      try {
        n1 = parseInt(iss,10);
        n2 = parseInt(inw,10);
      } catch(e) { }
      if (n1 < 2 && userLevel < USERVALD) {        // USER
        alert('Users cannot access Data Modules at issue/inwork:\n\n' + iss + '-' + inw);
        return;
      } else if (n1 < 2 && userLevel < USERSPUS) { // VALIDATOR
        alert('Validators cannot access Data Modules at issue/inwork:\n\n' + iss + '-' + inw);
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
    var root = $("#MAIN_CONTENT");
    CVPortal.components.cvDocHandler.form765dmidentf = $(root).attr("dmc");
    CVPortal.components.cvDocHandler.form765dmcissid = ($(root).attr("dmc") + "_" + $(root).attr("issuenumber") + "-" + $(root).attr("issueinwork"));
    console.debug('35: ' + CVPortal.components.cvDocHandler.form765dmidentf + ' : ' + CVPortal.components.cvDocHandler.form765dmcissid);
    // Load a FORM icon?
    CVPortal.components.cvDocHandler.initForm765();
    console.debug('38: ' + CVPortal.components.cvDocHandler.form765instance);
    if (CVPortal.components.cvDocHandler.form765instance != null) {
      var html = "<span class='bbmfIcon' id='ATT' onClick='CVPortal.components.cvDocHandler.clickOnBufr765Form(event, \"" + CVPortal.components.cvDocHandler.form765instance + "\");'>";
      html += "<img id='ATT_ICON_' src='" + CVPortal.fetchSkinImage("aircraft/bufr765.16.png") + "' title='" + CVPortal.components.cvDocHandler.form765name + "'/></span>";
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
      alert('Restricted access: No access for ' + CVPortal.components.cvDocHandler.userGroup + ' users');
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
    $("#CV_YELLOW_ARROW").each(function() {
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
    CVPortal.controlFactory().updateCondition("Form765Enabled","false");
  },
  // END Core function overrides

  getXmlDoc: function(xmlStr) {
    return (new DOMParser()).parseFromString(xmlStr, "text/xml");
  },
  getXmlString: function(doc) {
    return (new XMLSerializer().serializeToString(doc));
  },
  
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
    $("tr[csn]:has(input.cart:visible)").each(function() {
      var pNum, units;
      $( this ).find("td[partnumber='1']").each(function() {
        pNum = this.innerHTML;
      });
      $( this ).find("input.cart").each(function() {
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
  checkXmlInstances: function(doc) {
    var res = 0;
    showHideControls(1);
    updateProgress("Checking BUFR forms ...");
    form765matchs = [];
    try {
      $("instance", doc).each(function() {
        var chk = null;
        try {
          chk = CVPortal.components.cvDocHandler.checkFormInstance(this);
        } catch(ex) {
          console.error("Error running checkFormInstance " + ex);
        }
      });
    } catch(e) {
      res = -1
      console.error("Error parsing doc for instances");
    }
    // Look at form765matchs
    console.debug("form765matchs.length? " + form765matchs.length);
    if (form765matchs.length > 0) {
      var mymatch = false;
      for (a in form765matchs) {
        var form765match = form765matchs[a]; // o.: usr|dmc|iss|instance|match
        console.debug("form765match[" + a + "]:" + form765match.usr + " : " + form765match.dmc + " : " + form765match.iss + " : " + form765match.instance + " : " + form765match.match);
        if (form765match.match) {
          CVPortal.components.cvDocHandler.setFormInstance(form765match.instance, form765match.usr)
          ret = form765match.instance;
          mymatch = true;
          // break; Don't break, allow it ot get the latest form instance, othertwise it will get the first
        }
      }
      if (!mymatch) {
        var form765match = form765matchs[0]; // o.: usr|dmc|iss|instance|match
        CVPortal.components.cvDocHandler.setFormInstance(form765match.instance, form765match.usr)
        ret = form765match.instance;
      }
    }
    showHideControls(0);
    return res;
  },
  setFormInstance: function(instance, user) {
    CVPortal.components.cvDocHandler.form765instance = instance;
    console.debug('checkFormInstance set ' + instance);
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
    console.debug('getFormDataFromTitle:' + usr + '|' + dmc + '|' + iss + '|' + ref + '|' + doc + '|' + dte);
    thisformStr += '<form-instance><form-header>';
    thisformStr += '<form-id>' + instance + '</form-id>';
    thisformStr += '<user>' + usr + '</user>';
    thisformStr += '</form-header><form-data>';
    thisformStr += '<cond id="hidden_lcsdmcxref"><item>' + doc + '</item></cond>';
    thisformStr += '<cond id="txt_origdate"><item>' + dte + '</item></cond>';
    thisformStr += '<cond id="txt_origReference"><item>' + ref + '</item></cond>';
    thisformStr += '<cond id="txt_docRefDmc"><item>' + dmc + '</item></cond>';
    thisformStr += '<cond id="txt_docRefIssueInw"><item>' + iss + '</item></cond>';
    thisformStr += '</form-data></form-instance>';
    return thisformStr;
  },
  checkFormInstance: function(e){
    var ret = 0;
    var refText = $(e).text();
    var val3;
    var instance = e.getAttribute("name");
    var refs = refText.split(":");
    var usr = refs[0];
    var dmc = refs[1];
    var iss = refs[2];
    //var ref = refs[3];
    //var doc = refs[4];
    //var dte = refs[5];
    console.debug('checkFormInstance:' + refText + '[' + usr + '|' + CVPortal.components.cvResourceManager.user + ']' + dmc + '|' + iss  + '|' + instance);
    updateProgress("Checking BUFR form: " + dmc);
    if (dmc && (dmc != null && dmc !== '')) {
      if (dmc == CVPortal.components.cvDocHandler.form765dmidentf) {
        val3 = dmc + '_' + iss;
        if (val3 == CVPortal.components.cvDocHandler.form765dmcissid) {
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

    console.debug('loadForm765: looking for ' + CVPortal.components.cvDocHandler.form765dmcissid);
    var url = CVPortal.getURLwithBookParams(null);
    url += '&target=forms&form_type=genforms&action=get_form_instances';
    url += '&form_name=' + CVPortal.components.cvDocHandler.form765name;
    $.ajax({
      type: "GET", url: url, dataType: "xml",
      async: false, cache: false,
      success: function (result,status,xhr) {
        var chk = CVPortal.components.cvDocHandler.checkXmlInstances(result);
      }, error: function(xhr, status, error) {
        console.error(status + ' | ' + error);
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
        // console.info(status + ": " + result);
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
  
  catchForm765items: function(prompt) {
    $("#panelForm765 *[formtype='form765']").each(function(){
      var o = new Object();
      o.id = this.id;
      o.required = this.getAttribute("required");
      form765items.push(o);
    });
    var reset = false;
    var newinstance = false;
    if (CVPortal.components.cvDocHandler.form765legacydoc) {
      newinstance = true;
      if (prompt) {
        var msg = "There is already another form for this issue/inwork:\n\n" + CVPortal.components.cvDocHandler.form765dmcissid;
        msg += "\n\n• Press 'OK' to re-open the previous form\n\n• Or 'Cancel' to launch a new form."
        reset = confirm(msg);
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
    console.debug('resetForm765items[1]: ' + CVPortal.components.cvDocHandler.form765instance);
    $("#form_container").attr("instance_name", $("#form_container item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#ta_origtitleaddress").val($("#ta_origtitleaddress item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#txt_origdate").val($("#txt_origdate item", CVPortal.components.cvDocHandler.form765legacydoc).text());
    $("#txt_origReference").val($("#txt_origReference item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // Free text
    $("#txt_origUnitPOC").val($("#txt_origUnitPOC item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // Originator full name
    $("#txt_origEmail").val($("#txt_origEmail item", CVPortal.components.cvDocHandler.form765legacydoc).text());   // Originator email
    $("#txt_docRefDmc").val($("#txt_docRefDmc item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Technical Information (TI) Reference) DMC
    $("#txt_docRefIssueInw").val($("#txt_docRefIssueInw item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Amendment/Revision/Issue State)
    $("#txt_docRefTitle").val($("#txt_docRefTitle item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Title)
    $("#txt_docRefElementLevel").val($("#txt_docRefElementLevel item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Element)
    $("#txt_AircraftType").val($("#txt_AircraftType item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Ac Type)
    $("#slt_AircraftMark").val($("#slt_AircraftMark item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Ac Mark)
    $("#txt_AircraftMarkOther").val($("#txt_AircraftMarkOther item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Other Types/Marks which may be affected)
    $("#chk_report3").prop({ 'checked': ($("#chk_report3 item", CVPortal.components.cvDocHandler.form765legacydoc).text() == 'true') });
    $("#chk_report4").prop({ 'checked': ($("#chk_report4 item", CVPortal.components.cvDocHandler.form765legacydoc).text() == 'true') });
    $("#ta_report1").val($("#ta_report1 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Unsatisfactory feature(s))
    $("#ta_report2").val($("#ta_report2 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Recommended Change (use continuation sheet(s) if necessary))
    $("#txt_report4").val($("#txt_report4 item", CVPortal.components.cvDocHandler.form765legacydoc).text()); // (Other TI/LIS affect/further effects have been reported at)
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
  //$("#txt_origReference").val(); // Free text
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
    $("#txt_signature1").val(); // (Signature)
    $("#txt_signature2").val(); // (Rank/Grade and Name)
    $("#txt_signature3").val(); // (Tel No)
    $("#txt_signature4").val(o != null ? o.email : ''); // (Role email address)
    $("#txt_signature5").val(datestr); // (Date)
    $("#hidden_lcsdmcxref").val($(root).attr("document_id"));
  },
  
  setFormAsReadonly: function() {
    // If CVPortal.components.cvDocHandler.form765orgowner != current user
    console.debug('setFormAsReadonly:owner: ' + CVPortal.components.cvDocHandler.form765orgowner);
    console.debug('setFormAsReadonly:user:  ' + CVPortal.components.cvDocHandler.user);
    console.debug('setFormAsReadonly:  ' + (CVPortal.components.cvDocHandler.form765orgowner == CVPortal.components.cvDocHandler.user));
    if (CVPortal.components.cvDocHandler.form765orgowner != CVPortal.components.cvDocHandler.user) {
      for (a in form765items) {
        var o = form765items[a];
        var e = document.getElementById(o.id);
        $(e).prop({ disabled: true });
        $(e).css('background-color','#eee');
      }
      $("#bufrSaveBtn").button({ disabled: true });
      CVPortal.components.cvDocHandler.setReportDivStyle(false);
    }
    $("#bufrPrt1Btn").button({ disabled: false });
    $("#bufrPrt2Btn").button({ disabled: false });
    
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
        window.open(url, CVPortal.components.cvDocHandler.form765instance, winprops);
      } else {
        alert('An error was experienced printing form\n\n' + CVPortal.components.cvDocHandler.form765instance);
      }
      if (printall) {
        // Print the DM as well
        // First get the TOC and identify the DM for this form
        // /servlets3/wietmsd?id=1566910399623&book=s1000d_bike_41&collection=default&target=toc&action=tree_xml&eid=root&levels=1
        url = CVPortal.getURLwithBookParams();
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
                  console.info('printBufrForm:printdmurl:' + url);
                  var date = new Date() ;
                  var winProps = 'toolbar=0,location=0,directories=0,scrollbars=1,status=0,menubar=0,resizable=1,top=10,left=10,width=700,height='+ (screen.availHeight - 100);
                  window.open(url, 'PDFWindow'+date.getTime(), winProps);
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
      }
    } catch(e) {
      console.error('printBufrForm:error:' + e);
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
    var chk_report3 = false;
    var chk_report4 = false;
    CVPortal.components.cvDocHandler.setReportDivStyle(false);
    for (a in form765items) {
      var o = form765items[a];
      var e = document.getElementById(o.id);
      if (o.id == 'chk_report3') {
        chk_report3 = (e.checked);
      } else if (o.id == 'chk_report4') {
        chk_report4 = (e.checked);
      }
    }
    if (!chk_report3 && !chk_report4) {
      var e = document.getElementById('report3');
      e.focus();
      CVPortal.components.cvDocHandler.setReportDivStyle(true);
      return false;
    }
    console.debug('chk_report3: ' + chk_report3 + ' chk_report4: ' + chk_report4);
    for (a in form765items) {
      var o = form765items[a];
      var e = document.getElementById(o.id);
      var v = null;
      var s = e.getAttribute('style');
      if (s != null && s.indexOf(badborder) > -1) {
        var s1 = s.substring(0,s.indexOf(badborder));
        var s2 = s.substring(s.indexOf(badborder) + badborder.length + 1);
        s = s1 + ' ' + s2;
        e.setAttribute('style', s);
      }
      if (o.id.indexOf('txt_') > -1) {
        if (o.id == 'txt_report4' && chk_report3) {
          v = '...';
        } else {
          v = e.value;
        }
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
        e.setAttribute('style', s + '; border:2px solid #f00;');
        return false;
      }
      // console.debug(a + ' : ' + o.id + '=' + v);
    }
    $("#bufrPrt1Btn").button({ disabled: false });
    $("#bufrPrt2Btn").button({ disabled: false });
    return true;
  },

  saveBufrForm: function() {
    var set = CVPortal.components.cvDocHandler.checkFormIsComplete();
    if (set) {
      console.debug('saveBufrForm...');
      alert('All fields appear complete.');
      try {
        CVPortal.components.cvDocHandler.saveForm(CVPortal.components.cvDocHandler.form765name);
        $("#bufrSaveBtn").button({ disabled: true });
      } catch(e) {
        console.error('Error running cvResourceManager.saveForm: ' + e);
      }
    }
  },

  saveForm: function(formName) {
    var fXML = CVPortal.components.cvDocHandler.fetchFormXML();
    console.info('saveForm:fXML:' + fXML);
    var doc = CVPortal.components.cvDocHandler.getXmlDoc(fXML);
    /*
    <cond label='txt_docRefDmc' id='txt_docRefDmc'><item>SPITFIRE-AAAA-28-00-01-01AA-941A-A</item></cond>
    <cond label='txt_docRefIssueInw' id='txt_docRefIssueInw'><item>000-17</item></cond>
    */
    var dmc = $("#txt_docRefDmc item", doc).text();
    var iss = $("#txt_docRefIssueInw item", doc).text();
    var iss = $("#txt_docRefIssueInw item", doc).text();
    var ref = $("#txt_origReference item", doc).text();
    var dic = $("#hidden_lcsdmcxref item", doc).text();
    var dte = $("#txt_origdate item", doc).text();

    // see if we have an instance name:
    var instanceId = $("#form_container").attr("instance_id");
    if (!instanceId) {
      instanceId = CVPortal.components.cvDocHandler.form765instance;
    }
    console.debug('saveForm:instanceId:' + instanceId);
    var form_title = CVPortal.components.cvResourceManager.user + ":" + dmc + ":" + iss + ":" + ref.replaceAll(":"," ") + ":" + dic + ":" + dte;
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
          $("option", e).each(function() {
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
    console.info('fXML: ' + fXML);
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
};

// Extension for cvResourceManager
// Registered in \skins\BBMFskin\templates\config\components.xml <item extension="bbmf_cvResourceManager"/>
function bbmf_cvResourceManager() {
  this.componentName= "Custom cvResourceManager";
  this.bufrformcount = 0;
  this.bufrformusers = '';
  this.user = CVPortal.metaFactory().get("META_USER");
  this.userGroup = CVPortal.metaFactory().get("META_USERGROUP");
  // ADMINISTRATOR | BUYER | DEVELOPER | EDITOR | GUEST | SUPERUSER | SUPERUSEROFFLINE | USER | USEROFFLINE
  /* LAM: 2020-03-17: Passwords */
  // CVPortal.components.cvResourceManager.specchars
  this.specchars = [33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 123, 124, 125, 126, 163];
}

bbmf_cvResourceManager.prototype = {

  // Extension initfunction (must have)
  extensionInit: function() {
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
          } catch(e) {
            console.error("Error parsing doc for instances");
          }
          formsStr += '</forms>';
          var annotsXmlStr = CVPortal.components.cvDocHandler.getXmlString(theXML);
          if (annotsXmlStr.indexOf('<ANNOTATIONS') > -1) {
            annotsXmlStr = annotsXmlStr.substring(annotsXmlStr.indexOf('<ANNOTATIONS'));
            var newXmlStr = '<?xml version="1.0"?><annots>' + annotsXmlStr + formsStr + '</annots>';
            console.debug('newXmlStr: ' + newXmlStr);
            theXML = CVPortal.components.cvDocHandler.getXmlDoc(newXmlStr);
          }
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
  
  updateFormCount: function() {
    $("#rightDialog").html("<div>&#0160;</div><div>" + this.bufrformcount + " " + CVPortal.components.cvDocHandler.form765name + " forms " + this.bufrformusers + "</div>");
  },

  viewTabletbufr765formsResourceList: function(xml, type, xref) {
    var rM = this;
    var formType = $("form_instances", xml).attr("form_name");
    var resContent;
    $("#resourceContents", this.panel.getElement(this.id)).each(function() { resContent = this; });
    var rightList = $("#rightList");
    var htmlString = "<table width='98%' cellpadding='2'>";
    CVPortal.components.cvResourceManager.bufrformcount = 0;
    CVPortal.components.cvResourceManager.bufrformusers = '';
    var formitems = [];
    CVPortal.components.cvDocHandler.form765instance = null;
    if ($("form-instance", xml).length == 0) {
      htmlString += "<tr><td colspan='3'>" + CVPortal.getResource("resourceList.msg.nobufrforms") + "</td></tr>";
    } else {
      var len = $("form-instance", xml).length;
      $("form-instance", xml).each(function(i, o) {
        var thisUser = $("user", $(this)).text();
        var bufrid = $("form-header form-id", $(this)).text();
        console.debug('viewTabletbufr765formsResourceList:952[A]: ' + (i + 1) + ' of ' + len + ' : ' + bufrid);
        if (CVPortal.components.cvResourceManager.userGroup == 'ADMINISTRATOR' || (CVPortal.components.cvResourceManager.user == thisUser)) {
          var thishtmlstring = "";
          var thisdmc = $("#txt_docRefDmc item", $(this)).text();
          var thisiss = $("#txt_docRefIssueInw item", $(this)).text();
          if (bufrid == xref) {
            CVPortal.components.cvDocHandler.form765instance = bufrid;
          }
          CVPortal.components.cvResourceManager.bufrformcount = (CVPortal.components.cvResourceManager.bufrformcount + 1);
          console.debug('viewTabletbufr765formsResourceList:952[B]: Adding ' + (i + 1) + ' to ' + CVPortal.components.cvResourceManager.user + ' form list');
          thishtmlstring += "<tr class='simpleClickable" + (bufrid == xref ? ' highlightRM':'') + "' onclick='CVPortal.components.cvResourceManager.selectResource(event);' ";
          thishtmlstring += "offset='0' type='F' xref='" + $("#hidden_lcsdmcxref item", $(this)).text() + "' annotid='" + bufrid + "'>";
          thishtmlstring += "<td style='vertical-align:top' class='formNumber'></td>";
          thishtmlstring += "<td style='vertical-align:top'><img src='" + CVPortal.fetchSkinImage("aircraft/bufr765.16.png") + "'></td>";
          thishtmlstring += "<td style='vertical-align:top'>"; // + $("form-header form-id", $(this)).text();
          thishtmlstring += "<div><b>" + thisdmc + "</b>: " + thisiss + "</div>";
          thishtmlstring += "<div>\"" + $("#txt_origReference item", $(this)).text() + "\", ";
          thishtmlstring += "(user: <b>" + thisUser + "</b>, " + $("#txt_origdate item", $(this)).text() +")</div>";
          thishtmlstring += "</td></tr>";
          var o = new Object();
          o.dmcissue = thisdmc + '_' + thisiss;
          o.htmlstring = thishtmlstring;
          o.user = thisUser;
          formitems.push(o);
        }
      });
    }
    formitems.sort(function(a, b){
      let x = a.dmcissue.toLowerCase();
      let y = b.dmcissue.toLowerCase();
      if (x < y) {return -1;}
      if (x > y) {return 1;}
      return 0;
    });
    var formusers = [];
    for (a in formitems) {
      var formitem = formitems[a];
      var thishtmlstring = formitem.htmlstring;
      thishtmlstring = thishtmlstring.replaceAll("<td style='vertical-align:top' class='formNumber'></td>","<td style='vertical-align:top' class='formNumber'>" + (parseInt(a,10) + 1) + "</td>");
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
      CVPortal.components.cvResourceManager.updateFormCount();
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

  deleteResource: function() {
    cvResourceManager.prototype.deleteResource.call(this);
    if (this.currentResource != null) {
      var thisitem = this.currentResource;
      if (this.typeObj.type == "bufr765forms") {
        var thisbufr = thisitem.getAttribute("annotid");
        if (confirm("Delete this BUFR entry?\n\n• " + thisbufr)) {
          /* <tr class="simpleClickable highlightRM" onclick="..." offset="0" type="F" xref="SPITFIRE-AAAA-00-00-01-00-AA-040-A-D" annotid="bufr-1653938382373-1644823406259"></tr> */
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
                  console.error(thisbufr + " was not removed from the server");
                }
              } else {
                console.info(thisbufr + " was not removed from the server");
              }
            }, error: function(xhr, status, error) {
              console.error('1071:deleteResource:' + status + ' | ' + error);
            }, complete: function() {
              console.info('1073:deleteResource:' + thisbufr + ' was deleted? ' + isdeleted);
            }
          });
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
      }
    });
  },
  deleteAllResources: function() {
    console.info('deleteAllResources: ' + this.typeObj.type + '|' + CVPortal.components.cvDocHandler.form765name)
    if (this.typeObj.type == 'bufr765forms') {
      CVPortal.components.cvResourceManager.getAllFormsInstances();
      if (confirm("Are you sure you want to remove all " + CVPortal.components.cvDocHandler.form765name + " forms?")) {
        var url = CVPortal.getURLwithBookParams("time") + "&target=forms&action=delete_all_form_instances&form_type=genforms&form_name=" + CVPortal.components.cvDocHandler.form765name;
        $.ajax({ 
          method: "GET", url: url, async: false, cache: false, dataType: "xml",
          success: function(xml) {
            if (CVPortal.metaFactory().get("META_USERGROUP") == 'ADMINISTRATOR') {
              var len = $("instance", xml).length;
              if (len > 0) {
                alert("Not all BUFR forms were deleted, there are still " + len + " forms remaining");
                // TODO: use remote login and remove ALL forms by different users
              }
            }
            showHideControls(1);
            CVPortal.components['cvResourceManager'].viewTabletResource('bufr765forms');
            showHideControls(0);
          }, error: function(xhr, status, error) {
            console.error('1074:deleteAllResources:' + status + ' | ' + error);
          }
        });
      }
    } else {
      cvResourceManager.prototype.deleteAllResources.call(this);
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
    console.debug('toggleExpand "' + chapTitle + '"');
    CVPortal.components.cvTOC.currentChapterTitle = chapTitle;
    cvTOC.prototype.toggleExpand.call(this, evt, element);
  },
  // CVPortal.components.cvTOC.somefunction()
	somefunction: function() {
    console.info('processLogin (custom)...');
	},
};
