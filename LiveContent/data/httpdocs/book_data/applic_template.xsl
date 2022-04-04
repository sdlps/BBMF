<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output indent="yes" method="html" omit-xml-declaration="yes"/>

<xsl:template match="*"><xsl:apply-templates/></xsl:template>

<xsl:template match="text()"><xsl:value-of select="."/></xsl:template>

<!-- ******************************************************* -->
<!--			S1000D 2.2 APPLIC		     -->
<!-- ******************************************************* -->
<xsl:template match="cond">
Cond: (<xsl:value-of select="@name"/>) = <xsl:value-of select="text()"/><br/>
</xsl:template>

<xsl:template match="applicability">
<div>
	<xsl:apply-templates/>
	<center>
	<!--
		<div cvControl="1" id="CVCtrl_OK"><span>OK</span></div>
		<div cvControl="1" id="CVCtrl_clearApplic"><span>Clear</span></div>
	-->
		<button cvControl="1" id="CVCtrl_OK"><span></span></button>
		<button cvControl="1" id="CVCtrl_clearApplic"><span></span></button>
	</center>
	<br/>
</div>
<br/>
</xsl:template>

<xsl:template match="section">
<div style="background:white;margin:5px 5px 5px 5px;">
<div class="section-header">
<b><xsl:value-of select="@desc"/></b>
</div>
<br/>
<table>
<xsl:variable name="section" select="@name" />
<xsl:apply-templates />
</table>
</div>
<br/>
</xsl:template>


<xsl:template match="select">
<tr><td>
<b><xsl:value-of select="@desc"/>: </b>
</td><td>
<select processing="applic_input">
<xsl:if test="@type='multiple'">
<xsl:attribute name="multiple">1</xsl:attribute>
</xsl:if>
<xsl:attribute name="size"><xsl:value-of select="@size"/></xsl:attribute>
<xsl:attribute name="name"><xsl:value-of select="../@name"/>-<xsl:value-of select="@name"/></xsl:attribute>
	<xsl:for-each select="child::option">
		<option>
			<xsl:attribute name="value"><xsl:value-of select="@name"/></xsl:attribute>
			<xsl:value-of select="text()"/>
		</option>
	</xsl:for-each>
</select>
</td></tr>
</xsl:template>

<xsl:template match="text">
<tr><td>
<b><xsl:value-of select="@desc"/>: </b>
</td><td>
<input type="text" size="10" processing="applic_input">
<xsl:attribute name="name"><xsl:value-of select="../@name"/>-<xsl:value-of select="@name"/></xsl:attribute>
	<xsl:attribute name="value"><xsl:value-of select="@default"/></xsl:attribute>
</input>
</td></tr>
</xsl:template>


<!-- ******************************************************* -->
<!--			S1000D 3.0 APPLIC		     -->
<!-- ******************************************************* -->
<xsl:template match="dmodule">

<div id="hiddenApplics"> </div>

<div id="product_selector">
<h2>Select Product:</h2>
<div style="margin:10px;padding:15px;">
	<b>Product Identifier </b>
	<select id="productId" width="300" style="width:300px">
		<xsl:attribute name="onChange">selectProduct(this.value);</xsl:attribute>
		<option value="">...</option>
	</select>
</div>
</div>

<div id="applic_controls" style="clear:both;">
	<!--
	<div style="margin-left:20px" cvControl="1" id="CVCtrl_OK"><span>OK</span></div>
	<div style="margin-left:20px" cvControl="1" id="CVCtrl_clearApplic"><span>Clear</span></div>
	-->
		<button cvControl="1" id="CVCtrl_OK"><span></span></button>
		<button cvControl="1" id="CVCtrl_clearApplic"><span></span></button>
	<br/><br/>
</div>

<div id="selected_product" style="display:none;clear:both;">

<h2>Selected Technical Conditions and Product Attributes</h2>
	<table>
	<tr>
		<td valign="top">
			<b>Product Attributes:</b>
			<table id="prodattrTable" class="applicTable">
			</table>
		</td>

		<td valign="top" style="padding-left:20px;">
			<b>Technical Conditions:</b>
			<table id="cctTable" class="applicTable">
			</table>
		</td>
	</tr>
	</table>
</div>

<script>
var myProducts = new Object();
var myConditions;	// conditions object with all possible conditions and their HTML interfaces
var myAttributes;
var currentId = "";	// current product ID
var myApplics; 	// object of already set applic values
var actXML; 	// XML of ACT DM
var pctXML; 	// XML of PCT DM
var cctXML; 	// XML of CCT DM

//
//  retrieve a DModule source from the server by its DMC:
function getSource(targetId) {
	var date = new Date();
	var url = CVPortal.getURLwithBookParams('uniqid') + "&amp;target=utility&amp;action=xref&amp;xrefid=" + targetId;
	var ceid;
	var retXML = null;
	$.ajax( {
		method: "GET",
		async: false,
		url: url,
		dataType: "xml",
		success: function(xml) {
			$("INDEX-ITEM", xml).each(function() {
				ceid = this.getAttribute("CEID");
			});

			if(ceid) {
				var srcUrl = CVPortal.getURLwithBookParams('uniqid') + "&amp;target=tools&amp;action=show_xml&amp;eid=" + ceid;
				$.ajax( {
					method: "GET",
					async: false,
					url: srcUrl,
					dataType: "xml",
					success: function(xml) {
						retXML = xml;
					}
				});
			}
		}
	});
	return retXML;
}


function buildConditionsTable() {
	$("condition,cond", cctXML).each(function() {
		var html = "&lt;tr&gt;&lt;th class='applicTable'&gt;";
		$("name", this).each(function() { html += $(this).text(); });
		html += "&lt;/th&gt;&lt;td class='applicTable' style='font-weight:bold'"
		html += " condid='" + this.getAttribute("id") + "' id='act_" + this.getAttribute("id") + "'&gt;";
		html += "&lt;/td&gt;&lt;/tr&gt;";
		$("#cctTable").append(html);
	});
}

function buildActTable() {
	var tagName = "prodattr";
	if($("productAttribute", actXML).length > 0) {
		tagName = "productAttribute";
	}
	$(tagName, actXML).each(function() {
		var html = "&lt;tr&gt;&lt;th class='applicTable'&gt;";
		$("name", this).each(function() { html += $(this).text(); });
		html += "&lt;/th&gt;&lt;td  class='applicTable' prodAttr='1' style='font-weight:bold'"
		html += " condid='" + this.getAttribute("id") + "' id='act_" + this.getAttribute("id") + "'&gt;";
		html += "&lt;/td&gt;&lt;/tr&gt;";
		$("#prodattrTable").append(html);
	});
}

//
//
// Create Applicability Interface
//
function createApplicability() {
	// Create application context
	ctx = window.dialogArguments;

	actXML = getSource("<xsl:value-of select="act"/>");
	cctXML = getSource("<xsl:value-of select="cct"/>");
	pctXML = getSource("<xsl:value-of select="pct"/>");

	//create the condition interfaces:
	createCondInterfaces();
	createProdAttrInterfaces();
	buildActTable();
	buildConditionsTable();
	// load our actual configuration:
	var applicId = loadApplicConfiguration();
	
	if(pctXML) {
		// create all our product obj definitions:
		$("product", pctXML).each(function() {
			var product = new Object();
			$("assign", this).each(function() {
				if(this.getAttribute("actidref")) {
					product[this.getAttribute("actidref")] = this.getAttribute("actvalue");
				} else {
					product[this.getAttribute("applicPropertyIdent")] = this.getAttribute("applicPropertyValue");
				}
			});
			product.id = this.getAttribute("id");
			myProducts[product.id] = product;
		});
		$("#productId").each(function() {
			for(var i in myProducts) {
				$(this).append("&lt;option value='" + i + "'&gt;" + i + "&lt;/option&gt;");
			}
			this.value = "";
		});
	} else {
		var empty = new Object();
		empty.id = "NOVALUE";
		myProducts[empty.id] = empty;
		selectProduct(empty.id);
		$("#product_selector").hide();
		$("#condition_selector").show();
		$("#selected_product").show();
	}

	if(applicId != "" &amp;&amp; pctXML) {
		selectProduct(applicId);
	}
	if(currentId != "" &amp;&amp; currentId != "NOVALUE") {
		setTimeout("setSelect()", 250);
	}
}

function setSelect() {
	$("#productId").each(function() {
		this.value = currentId;
	});
}

// ==============================================================================================
// CCT:
// creating the conditions interface if the values are not set by the product itself:
// ==============================================================================================
function createCondInterfaces() {
	myConditions = new Object();
	$("condition,cond", cctXML).each(function() {
		var myCond = new Object();
		myCond['id'] = this.getAttribute("id");
		if(this.getAttribute("condtyperef")) {
			myCond['condtyperef'] = this.getAttribute("condtyperef");
		} else {
			myCond['condtyperef'] = this.getAttribute("condTypeRefId");
		}
		$("conditiontype[id = '" + myCond['condtyperef'] + "'], condType[id=" + myCond['condtyperef'] + "]", cctXML).each(function() {
			if($("enum,enumeration", this).length != 0) {
				// =====
				// #41695 - allow mulitple select boxes in applic windo w
				// =====
				myCond['inter'] = '&lt;select multiple="multiple" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '"&gt;';
				var options = "";
				$("enum,enumeration", this).each(function() {
					if($(this).attr("actvalues")) {
						options += $(this).attr("actvalues");
					} else {
						options += $(this).attr("applicPropertyValues");
					}
				});
				if(options.indexOf('~') != -1) {
					myCond['inter'] = '&lt;input type="text" size="12" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '" value=""/&gt;';
				} else {
					var optArray = options.split("|");
					for(var i = 0; i &lt; optArray.length; i++) {
						myCond['inter'] += '&lt;option value="' + optArray[i] + '"&gt;' + optArray[i] + '&lt;/option&gt;';
					}
					myCond['inter'] += '&lt;/select&gt;';
				}
			} else {
				myCond['inter'] = '&lt;input type="text" size="12" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '" value=""/&gt;';
			}

		});
		myConditions[myCond['id']] = myCond;
	});
}


// ==============================================================================================
// ACT:
// creating the conditions interface if the values are not set by the product itself:
// ==============================================================================================
function createProdAttrInterfaces() {
	myAttributes = new Object();
	var tagName = "prodattr";
	if($("productAttribute", actXML).length > 0) {
		tagName = "productAttribute";
	}
	$(tagName, actXML).each(function() {
		var myCond = new Object();
		myCond['id'] = this.getAttribute("id");
		if($("enum", this).length != 0 || $("enumeration", this).length != 0) {
		// =====
		// #41695 - allow mulitple select boxes in applic windo w
		// =====
		myCond['inter'] = '&lt;select multiple="multiple" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '"&gt;';
			var options = "";
			$("enum,enumeration", this).each(function() {
				if($(this).attr("actvalues")) {
					options += $(this).attr("actvalues");
				} else {
					options += $(this).attr("applicPropertyValues");
				}
			});
			if(options.indexOf('~') != -1) {
				myCond['inter'] = '&lt;input type="text" size="12" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '" value=""/&gt;';
			} else {
				var optArray = options.split("|");
				for(var i = 0; i &lt; optArray.length; i++) {
					myCond['inter'] += '&lt;option value="' + optArray[i] + '"&gt;' + optArray[i] + '&lt;/option&gt;';
				}
				myCond['inter'] += '&lt;/select&gt;';
			}
		} else {
			myCond['inter'] = '&lt;input type="text" size="12" applic_process="1" id="applic-' + myCond['id'] + '" name="applic-' + myCond['id'] + '" value=""/&gt;';
		}
		myAttributes[myCond['id']] = myCond;
	});
}


// ==============================================================================================
//
// result of selecting a product from the drop down:
// ==============================================================================================
function selectProduct(obj) {
	currentId = obj;
	if(myProducts[currentId]) {
		var hRef = myProducts[currentId];
		$("td[condid]").each(function() {
			var condId = this.getAttribute("condid");
			if(hRef[condId]) {
				$(this).html(hRef[condId]);
			} else {
				if(this.getAttribute("prodAttr") == 1) {
					// product does NOT have this condition:
					$(this).html(myAttributes[condId].inter);
				} else {
					// product does NOT have this condition:
					$(this).html(myConditions[condId].inter);
				}
				$("#applic-" + condId).each(function() { if(myApplics["applic-" + condId]) { this.value = myApplics["applic-" + condId]; } });
			}
		});

		document.getElementById("selected_product").style.display = "";
	} else {
		currentId = "";
		document.getElementById("selected_product").style.display = "none";
	}
	CVPortal.components.cvModalHandler.centerModal("modal", "modalContent");
}

function setApplic30Configuration() {
	if(currentId == "" &amp;&amp; pctXML) {
		alert("Please select a product.");
	} else {
		// process!
		var xmlData = "&lt;filterdata&gt;";
		if(myProducts[currentId]) {
			var hRef = myProducts[currentId];
			for(i in hRef) {
				var idLabel = i;
				if(i == "id") {
					idLabel = "productId";
				}
				xmlData += '&lt;cond name="applic-' + idLabel + '"&gt;&lt;item&gt;' + hRef[i] + '&lt;/item&gt;' + '&lt;/cond&gt;';
			}
		}

		$("input[applic_process=1]").each(function() {
			xmlData += '&lt;cond name="' + this.getAttribute('name') + '"&gt;&lt;item&gt;' + this.value + '&lt;/item&gt;' + '&lt;/cond&gt;';
		});
		// =====
		// #41695 - allow mulitple select boxes in applic windo w
		// =====
		$("select[applic_process=1]").each(function() {
			var selector = this;
			$("option", this).each(function() {
				if(this.selected) {
					xmlData += '&lt;cond name="' + $(selector).attr("name") + '"&gt;&lt;item&gt;' + $(this).val() + '&lt;/item&gt;' + '&lt;/cond&gt;';
				}
			});
		});


		xmlData += "&lt;/filterdata&gt;";
		return xmlData;

		// create an audit event and track the current step:
		var auditObj = {};
		auditObj.stateTable = xmlData;
		CVPortal.createAuditEvent("set_applicability", auditObj);		
		
		// var url = CVPortal.getURLwithBookParams('uniqid') + '&amp;target=applicability&amp;action=set_config';
		// CVPortal.ajaxPostXMLData(url, xmlData);
	}
}

function loadApplicConfiguration() {
	myApplics = new Object();
	// Get the configuration file
	var url = CVPortal.getURLwithBookParams('uniqid') + '&amp;target=applicability&amp;action=get_config';

	var retValue = "";
	$.ajax({
		method: "GET",
		dataType: "xml",
		cache: false,
		url: url,
		async: false,
		success: function(xml) {
			// save any other existing APPLIC info:
			$("group", xml).each(function() {
				var pre = this.getAttribute("name");
				$("cond", this).each(function() {
					var cName = pre + "-" + this.getAttribute("name");
					$("item", this).each(function() {
						if(pre != "applic") {
							$("#hiddenApplics").append('&lt;input type="hidden" applic_process="1" name="' + cName + '" value="' + this.text + '"&gt;');
						} else {
							myApplics[cName] = this.text;
						}
					});
				});
			});

			$("group[name='applic'] > cond[name='productId'] > item", xml).each(function() {
				retValue = CVPortal.getNodeText(this);
			});
		}
	});
	return retValue;
}

function clearConfiguration()
{
	// Clear the config
	var objHTTP = new ActiveXObject("microsoft.XMLHTTP") ;
	var curDate = new Date() ;

	objHTTP.open('GET', ctx.appName
   		+ '?target=applicability&amp;action=clear_config'
   		+ '&amp;id=' + ctx.sessionId+ "&amp;uniqid=" + curDate.getTime()
   		+ "&amp;collection=" + ctx.collection + "&amp;book=" + ctx.book,
			true) ;

	objHTTP.send();
	window.close();
}

// CALL THE LOADING FUNCTION:
createApplicability();

</script>
</xsl:template>

</xsl:stylesheet>
