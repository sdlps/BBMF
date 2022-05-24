<?xml version="1.0" encoding="iso-8859-1"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/common.xsl 1.12.1.15.2.79 2019/04/25 23:21:01GMT rdivecchia Exp  $ -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:saxon="http://saxon.sf.net/" version="2.0" extension-element-prefixes="saxon">
<xsl:output  method="html" encoding="iso-8859-1"/>

<!-- ** Filtering Varibles; for Applicability and eventually process data modules ** -->
<xsl:param name="filtervars" select="document($filter_location)/filter"/>
<!--
<xsl:param name="filtervars" select="$filter_location/filter"/>
-->

<!-- ** Default Templates ** -->
<xsl:template match="*"><xsl:apply-templates/></xsl:template>
<xsl:template match="text()"><xsl:value-of select="."/></xsl:template>

<!-- Showing NON-Applic content -->
<xsl:template match="non_applic">
	<!--<div style="border:1pt solid black;background-color:#CCCCCC;padding:2px;">
		<b>Non-Applicable content:</b><xsl:apply-templates select="displaytext"/>
	</div><br/>-->
</xsl:template>

<!-- ** Parameters ** -->
<xsl:param name="mobile"/>
<xsl:param name="task"/>
<xsl:param name="refmat"/>
<xsl:param name="matreq"/>
<xsl:param name="supteqt"/>
<!-- newly added session id for retrieve image or template based on skin setting -->



<!-- TOP LEVEL DOCUMENT TEMPLATE... returns a div for FullSupprot 
<DOCUMENT FILENAME="DMC-SPITFIRE-AAAA-28-00-00-00AA-040A-A_EN-US.xml" CEID="240" DOCTYPE="description" DMC="SPITFIRE-AAAA-28-00-00-00AA-040A-A" TOCPARENT="1418" TOCREFID="1422" DOCUMENT_ID="SPITFIRE-AAAA-28-00-00-00-AA-040-A-A">
<DOCHEADER><TITLE>Fuel - General - Description</TITLE></DOCHEADER>
<DOCBODY>
<dmodule xsi:noNamespaceSchemaLocation="http://www.s1000d.org/S1000D_4-2/xml_schema_flat/descript.xsd">
<identAndStatusSection>
<dmAddress>
<dmIdent><dmCode .../><language countryIsoCode="US" languageIsoCode="en"/><issueInfo inWork="10" issueNumber="000"/></dmIdent>
<dmAddressItems>
<issueDate day="11" month="09" year="2019"/>
<dmTitle><techName>Fuel - General</techName><infoName>Description</infoName></dmTitle>
</dmAddressItems></dmAddress>
<dmStatus issueType="new">
<security securityClassification="01"/>
<responsiblePartnerCompany enterpriseCode="KCXR8"/>
<originator enterpriseCode="KCXR8"/>
<applic><displayText><simplePara>ALL</simplePara></displayText></applic>
<brexDmRef>...
</brexDmRef>
<qualityAssurance><firstVerification verificationType="tabtop"/></qualityAssurance>
<remarks>...</remarks>
</dmStatus></identAndStatusSection>
-->
<xsl:template match="DOCUMENT" priority="2">
<xsl:choose>
	<xsl:when test="$mobile!='mobile'">
		<div id="MAIN_CONTENT">
			<xsl:attribute name="CEID"><xsl:value-of select="@CEID"/></xsl:attribute>
			<xsl:attribute name="TOCREFID"><xsl:value-of select="@TOCREFID"/></xsl:attribute>
			<xsl:attribute name="TOCPARENT"><xsl:value-of select="@TOCPARENT"/></xsl:attribute>
			<xsl:attribute name="ACTREFID"><xsl:value-of select="@ACTREFID"/></xsl:attribute>
			<xsl:attribute name="FIGREFID"><xsl:value-of select="@FIGREFID"/></xsl:attribute>
			<xsl:attribute name="TABREFID"><xsl:value-of select="@TABREFID"/></xsl:attribute>
			<xsl:attribute name="LARGERTABLE_ID"><xsl:value-of select="@LARGERTABLE_ID"/></xsl:attribute>
			<xsl:attribute name="TABLESECTIONSIZE"><xsl:value-of select="@TABLESECTIONSIZE"/></xsl:attribute>
			<xsl:attribute name="TABLETOTALSECTIONS"><xsl:value-of select="@TABLETOTALSECTIONS"/></xsl:attribute>
			<xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
			<xsl:attribute name="DOCUMENT_ID"><xsl:value-of select="@DOCUMENT_ID"/></xsl:attribute>
			<xsl:attribute name="DMC"><xsl:value-of select="@DMC"/></xsl:attribute>
      
      <xsl:attribute name="ISSUENUMBER"><xsl:value-of select="./DOCBODY/dmodule/identAndStatusSection/dmAddress/dmIdent/issueInfo/@issueNumber"/></xsl:attribute>
			<xsl:attribute name="ISSUEINWORK"><xsl:value-of select="./DOCBODY/dmodule/identAndStatusSection/dmAddress/dmIdent/issueInfo/@inWork"/></xsl:attribute>
      
			<xsl:attribute name="INFOCODE"><xsl:value-of select=".//dmc/avee/incode | .//dmc/age/incode"/></xsl:attribute>
			<xsl:attribute name="MODEL"><xsl:value-of select=".//dmc/avee/chapnum | .//dmc/age/ecscs"/>-<xsl:value-of select=".//dmc/avee/section|.//dmc/age/eidc"/><xsl:value-of select=".//dmc/avee/subsect"/>-<xsl:value-of select=".//dmc/avee/subject|.//dmc/age/cidc"/>-<xsl:value-of select=".//dmc/avee/discode|.//dmc/age/discode"/></xsl:attribute>
   		<xsl:attribute name="security"><xsl:value-of select="DOCBODY/dmodule/idstatus//status/security/@class | DOCBODY/dmodule/identAndStatusSection/dmStatus/security/@securityClassification"/></xsl:attribute>
      <xsl:attribute name="caveat"><xsl:value-of select="DOCBODY/dmodule/idstatus//status/security/@caveat|DOCBODY/dmodule/identAndStatusSection/dmStatus/security/@caveat"/></xsl:attribute>

			<table width='100%' border="0" cellspacing="0" cellpadding="0">
			<tr>
					<td width="95%">
						<xsl:choose>
							<xsl:when test=".//s1000d_document_non_applic">

								<h1><xsl:value-of select="$style.common.nonapplicdm"/></h1>						
								<div class="non_applic">
									<xsl:value-of select="$style.common.nonapplictext"/>
									
									<xsl:if test=".//s1000d_document_non_applic/displayText/*|.//s1000d_document_non_applic/displaytext/text()">
										<div class="padd-20">
										<b><xsl:value-of select="$style.common.dmapplic"/>:</b><xsl:apply-templates select=".//s1000d_document_non_applic/displaytext|.//s1000d_document_non_applic/displayText"/>
										</div>
									</xsl:if>
								</div>
							</xsl:when>
							<xsl:otherwise>
								<xsl:apply-templates/>
							</xsl:otherwise>
						</xsl:choose>
					</td>
				<td valign="top">
					<img style="display:none" cvHelpButton="1" id="CS.HELPBTN" class="help" onclick="help_onclick('1009')" onmouseover="help_onmouseover(event)" onmouseout="help_onmouseout(event)" ondrag="event.returnValue=false;">
					<xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=help.gif</xsl:attribute>
					</img>
				</td>
			</tr>
			</table>
			<div style="display:none;">
				<xsl:for-each select="//acronym">
					<div class="smallPop" width="150px">
						<xsl:choose>
						<xsl:when test="acronymDefinition/@id">
							<xsl:attribute name="id"><xsl:value-of select="acronymDefinition/@id"/></xsl:attribute>
						</xsl:when>
						<xsl:otherwise>
							<xsl:attribute name="id"><xsl:value-of select="generate-id()"/></xsl:attribute>
						</xsl:otherwise>
						</xsl:choose>
						<xsl:apply-templates select="acrodef|acronymDefinition"/>
					</div>		
				</xsl:for-each>
			</div>
		</div>
	</xsl:when>
	<xsl:otherwise>
		<table width='100%' border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td width="95%">
					<xsl:choose>
						<xsl:when test=".//s1000d_document_non_applic">
							<div class="applic-msg-background">
								<xsl:value-of select="$style.common.nonapplictext"/>
							</div>
								<xsl:if test=".//s1000d_document_non_applic/displayText/*|.//s1000d_document_non_applic/displaytext/text()">
									<div class="padd-20">
									<b><xsl:value-of select="$style.common.dmapplic"/>:</b><xsl:apply-templates select=".//s1000d_document_non_applic/displaytext|.//s1000d_document_non_applic/displayText"/>
									</div>
								</xsl:if>							
						</xsl:when>
						<xsl:otherwise>
							<xsl:apply-templates/>
						</xsl:otherwise>
					</xsl:choose>
				</td>
			</tr>
		</table>
	</xsl:otherwise>

</xsl:choose>
</xsl:template>

<!-- Template that Builds all the Tabs and Titles -->
<xsl:template match="DOCHEADER"/>

<xsl:template match="dmodule">
<xsl:choose>
	<xsl:when test="$mobile != 'mobile'">
		<div id="MAIN_DIV" cvDocumentTab="1" xsl:use-attribute-sets="standard">

      <!-- LAM: 2020-09-03 -->
      <xsl:choose>
        <xsl:when test="$doc_type='illustratedPartsCatalog'">
          <div class="metadata" id="metadata" style="margin-bottom:5px;">
            <xsl:variable name="script">javascript:
            var tbl=document.getElementById('DIV-DMSTATUS');
            var img=document.getElementById('DIV-DMSTATUS-IMG');
            var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
            var img1='aircraft/arr1.png';
            var img2='aircraft/arr2.png';
            tbl.style.display = (tbl.style.display == 'none' ? 'block':'none');
            img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
            </xsl:variable>
            <h2 id="DOCUMENT_TITLE" topic="1">
            <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
            <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-DMSTATUS-IMG"
              src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
            <xsl:text>&#160;</xsl:text><xsl:value-of select="//DOCHEADER/TITLE"/><xsl:value-of select="//DOCHEADER/DOCTITLE"/></a></h2>
            <div id="DIV-DMSTATUS" style="display:none;"><table border="0" width="100%" >
              <xsl:apply-templates select="//dmaddres|//dmAddress"/>
              <xsl:apply-templates select="//status|//dmStatus"/>
            </table></div>
          </div>
        </xsl:when>
        <xsl:otherwise>
          <h2 id="DOCUMENT_TITLE" topic="1">
            <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:value-of select="//DOCHEADER/TITLE"/><xsl:value-of select="//DOCHEADER/DOCTITLE"/>
          </h2>
          <div class="metadata" id="metadata" style="margin-bottom:20px;">
            <table border="0" width="100%" >
              <xsl:apply-templates select="//dmaddres|//dmAddress"/>
              <xsl:apply-templates select="//status|//dmStatus"/>
            </table>
          </div>
        </xsl:otherwise>
      </xsl:choose>
      <!-- / LAM: 2020-09-03 -->

			<!-- ****** Display the Filter Settings ******* -->
			<!--xsl:if test="$filtervars/group">
				<div class="filter_display">
					<xsl:apply-templates select="$filtervars"/>
				</div>
			</xsl:if-->

			<div id="PARTS_DIV">
				<xsl:apply-templates select="//ipc"/>
			</div>

			<xsl:apply-templates select="content"/>
		</div>

		<div id="DATAREST_DIV" cvDocumentTab="1" style="display:none;">
			<h2><xsl:value-of select="$style.common.datarestrict"/></h2>
			<xsl:value-of select="$style.common.datarestricttext"/>
		</div>

		<xsl:if test="$doc_type!='schedule' and (//reqpers or //reqPersons or //supequip or //reqSupportEquips)">
			<div id="SUPTEQT_DIV" cvDocumentTab="1" style="display:none">

				<xsl:if test="//reqpers">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqpers/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqpers/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqPersons">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqPersons/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqPersons/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//supequip">
					<xsl:attribute name="EID"><xsl:value-of select=".//supequip/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//supequip/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqSupportEquips">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqSupportEquips/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSupportEquips/@LASTEID"/></xsl:attribute>
				</xsl:if>
				<h1 class="major_section"><xsl:value-of select="$style.common.supequip"/></h1>
				<xsl:for-each select="//supequip|//reqSupportEquips">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
				<xsl:if test="$app_mode!='2'">
					<xsl:for-each select="//reqpers|//reqPersons">
					<xsl:apply-templates select="."/>
					</xsl:for-each>
				</xsl:if>
			</div>
		</xsl:if>

		<xsl:if test="content/refs//refdm or content/refs//reftp or content/refs/dmRef or content/refs/externalPubRef">
			<div id="REFMAT_DIV" cvDocumentTab="1" style="display:none" >
				<!--<xsl:if test="$doc_type!='schedule'">-->
				<xsl:attribute name="EID"><xsl:value-of select=".//refs/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//refs/@LASTEID"/></xsl:attribute>
				<h1 class="major_section"><xsl:value-of select="$style.common.refmat"/></h1>
				<xsl:for-each select="content/refs">
					<xsl:apply-templates select="."/> 
				</xsl:for-each>
				<!--<xsl:for-each select="content/refs/refdms">
					<xsl:apply-templates select="."/> 
				</xsl:for-each>						
				</xsl:if>-->
			</div>
		</xsl:if>
		
		<xsl:if test="$doc_type != 'schedule' and (//supplies or //reqSupplies or //spares or //reqSpares)">
		<div id="MATREQ_DIV" cvDocumentTab="1" style="display:none">
			<xsl:if test="$doc_type != 'schedule'">
				<xsl:if test="//supplies">
					<xsl:attribute name="EID"><xsl:value-of select=".//supplies/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//supplies/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqSupplies">
				<xsl:attribute name="EID"><xsl:value-of select=".//reqSupplies/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSupplies/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//spares">
					<xsl:attribute name="EID"><xsl:value-of select=".//spares/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//spares/@LASTEID"/></xsl:attribute>
				</xsl:if>
				<xsl:if test="//reqSpares">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqSpares/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSpares/@LASTEID"/></xsl:attribute>
				</xsl:if>

				<h1 class="major_section"><xsl:value-of select="$style.common.matreq"/></h1>
				<xsl:for-each select="//supplies|//reqSupplies">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
				<xsl:for-each select="//spares|//reqSpares">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
			</xsl:if>
		</div>
		</xsl:if>
	</xsl:when>

	<xsl:otherwise>
		<xsl:if test="$task = 'task'">
			<xsl:if test="$doc_type!='ipc'">
				<div id="MAIN_DIV" xsl:use-attribute-sets="standard">
				<xsl:apply-templates select="//dmaddres"/>
				<xsl:apply-templates select="//status"/>
				<br/><br/>
				<!--<xsl:if test="$doc_type!='schedule'">
					<xsl:apply-templates select="//prelreqs/reqconds"/>
					<xsl:apply-templates select="//safety|//reqSafety"/>
				</xsl:if>-->
				</div>
			</xsl:if>
		</xsl:if>

		<xsl:if test="$doc_type='ipc'">
			<div id="PARTS_DIV">
				<xsl:apply-templates select="//ipc"/>
			</div>
		</xsl:if>

		<xsl:if test="$refmat = 'refmat'">
			<div id="REFMAT_DIV">
			<xsl:if test="$doc_type!='schedule'">
				<xsl:attribute name="EID"><xsl:value-of select=".//refs/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//refs/@LASTEID"/></xsl:attribute>
				<h1 class="major_section"><xsl:value-of select="$style.common.refmat"/></h1>
				<xsl:for-each select="content/refs">
				<xsl:apply-templates select="."/> 
				</xsl:for-each>
				<xsl:for-each select="content/refs/refdms">
				<xsl:apply-templates select="."/> 
				</xsl:for-each>
			</xsl:if>
			</div>
		</xsl:if>

		<xsl:if test="$matreq = 'matreq'">
			<div id="MATREQ_DIV">
				<xsl:if test="$doc_type!='schedule'">
				<xsl:if test="//supplies">
				<xsl:attribute name="EID"><xsl:value-of select=".//supplies/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//supplies/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqSupplies">
				<xsl:attribute name="EID"><xsl:value-of select=".//reqSupplies/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSupplies/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//spares">
				<xsl:attribute name="EID"><xsl:value-of select=".//spares/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//spares/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqSpares">
				<xsl:attribute name="EID"><xsl:value-of select=".//reqSpares/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSpares/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<h1 class="major_section"><xsl:value-of select="$style.common.matreq"/></h1>
				<xsl:for-each select="//supplies | //reqSupplies">
				<xsl:apply-templates select="."/>
				</xsl:for-each>
				<xsl:for-each select="//spares|//reqSpares">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
			</xsl:if>
			</div>
		</xsl:if>

		<xsl:if test="$supteqt = 'supteqt'">
			<xsl:if test="$doc_type!='schedule'">
			<div id="SUPTEQT_DIV">
				<xsl:if test="//reqpers">
				<xsl:attribute name="EID"><xsl:value-of select=".//reqpers/@EID"/></xsl:attribute>
				<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqpers/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//reqPersons">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqPersons/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqPersons/@LASTEID"/></xsl:attribute>
				</xsl:if>
				
				<xsl:if test="//supequip">
					<xsl:attribute name="EID"><xsl:value-of select=".//supequip/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//supequip/@LASTEID"/></xsl:attribute>
				</xsl:if>
				<xsl:if test="//reqSupportEquips">
					<xsl:attribute name="EID"><xsl:value-of select=".//reqSupportEquips/@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID"><xsl:value-of select=".//reqSupportEquips/@LASTEID"/></xsl:attribute>
				</xsl:if>
				<h1 class="major_section"><xsl:value-of select="$style.common.supequip"/></h1>
				<xsl:for-each select="//supequip|//reqSupportEquips">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
				<xsl:for-each select="//reqpers|reqPersons">
					<xsl:apply-templates select="."/>
				</xsl:for-each>
			</div>
			</xsl:if>
		</xsl:if>
	</xsl:otherwise>
</xsl:choose>
</xsl:template>

<xsl:attribute-set name="standard">
	<xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
	<xsl:attribute name="LASTEID">
		<xsl:if test="@LASTEID"><xsl:value-of select="@LASTEID"/></xsl:if>
		<xsl:if test="not(@LASTEID)"><xsl:value-of select="@EID"/></xsl:if>
	</xsl:attribute>
	<xsl:attribute name="id">
		<xsl:if test="@id"><xsl:value-of select="@id"/></xsl:if>
		<xsl:if test="not(@id)">EID.<xsl:value-of select="@EID"/></xsl:if>
	</xsl:attribute>
</xsl:attribute-set>


<xsl:template match="content">
  <xsl:if test="not($doc_type='ipc')">
    <xsl:call-template name="security_portion_mark"/>
    <xsl:if test=".//procedure">
      <div xsl:use-attribute-sets="standard">
        <h3 class="minor_section">
        <xsl:variable name="script">javascript:
        var tbl=document.getElementById('DIV-REFS');
        var img=document.getElementById('DIV-REFS-IMG');
        var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
        var img1='aircraft/arr1.png';
        var img2='aircraft/arr2.png';
        tbl.style.display = (tbl.style.display == 'none' ? 'block':'none');
        img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
        </xsl:variable>
        <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REFS-IMG"
           src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>&#160;Reference Materials</a></h3>
      </div>
      <div id="DIV-REFS" style="display:none;">
        <br/><xsl:apply-templates select='refs' />
      </div>
    </xsl:if>
    <xsl:apply-templates select='*[local-name() != "refs"]' />
  </xsl:if>
</xsl:template>

<!-- ******************** FILTER VARS *************** -->
<xsl:template match="filter">
<h3 style="float:left" class="conds">System State</h3>
<input type="button" style="float:right" value="Debug" onClick="CVPortal.rootThread.debugFlag = true;"> </input>
<input type="button" style="float:right" value="Toggle">
	<xsl:attribute name="onClick">if(document.getElementById('state_table').style.display == '') { document.getElementById('state_table').style.display = 'none'; } else { document.getElementById('state_table').style.display = ''; } </xsl:attribute>
</input>
<br/><br/>
<table width="100%" style="display:none;margin-bottom:10pt;" id="state_table">
      <colgroup span="3">
         <col width="25%"></col>
         <col width="35%"></col>
         <col width="45%"></col>
      </colgroup>
      <thead>
      <tr>
         <th valign="top" colspan="3"><hr size="1" noshade="noshade" color="black"/></th>
      </tr>
	<tr>
		<td class="label" xsl:use-attribute-sets="standard">Group</td>
		<td class="label" xsl:use-attribute-sets="standard">Condition</td>
		<td class="label" xsl:use-attribute-sets="standard">Value</td>

	</tr>
	<tr>
	         <th valign="top" colspan="3"><hr size="1" noshade="noshade" color="black"/></th>
      </tr>
	</thead>
      <tbody>
	 <xsl:for-each select="group|group/cond">
	    <xsl:if test="descendant::item/text()">
	    <tr>
	       <xsl:choose>
		  <xsl:when test="position() mod 2 != 0">
		     <xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute>
		  </xsl:when>
	       </xsl:choose>
		<xsl:apply-templates select="."/>
	    </tr>
	   </xsl:if>
	</xsl:for-each>
	 <tr>
	    <td valign="top" colspan="3"><hr size="1" noshade="noshade" color="black"/></td>
	 </tr>
      </tbody>
</table>
</xsl:template>

<xsl:template match="group">
	<td colspan="3" align="left"><b><xsl:value-of select="@name"/></b></td>
</xsl:template>

<xsl:template match="cond">
	<td style="vertical-align:top;"> </td><td style="vertical-align:top;"><xsl:value-of select="@name"/></td>
	<td style="vertical-align:top;">
		<xsl:for-each select="child::item">
			<xsl:value-of select="text()"/><br/>
		</xsl:for-each>
	</td>
</xsl:template>


<!-- *************************** Preliminary Requirements **************** -->

<xsl:template match="prelreqs|preliminaryRqmts">
  <h2 class="major_section"><xsl:value-of select="$style.common.prelreqs"/></h2>
  <xsl:apply-templates select="reqconds|reqCondGroup"/>

  <xsl:apply-templates select="reqPersons"><xsl:with-param name="mode">inline</xsl:with-param></xsl:apply-templates>
  <xsl:apply-templates select="reqSupportEquips"><xsl:with-param name="mode">inline</xsl:with-param></xsl:apply-templates>
  <xsl:apply-templates select="reqSupplies"><xsl:with-param name="mode">inline</xsl:with-param></xsl:apply-templates>
  <xsl:apply-templates select="reqSpares"><xsl:with-param name="mode">inline</xsl:with-param></xsl:apply-templates>

  <xsl:apply-templates select="safety|reqSafety"/>
</xsl:template>

<xsl:template match="reqconds|reqCondGroup">
   <!-- NV Harmonization: required conditions is anchor point -->
   <p class="procAnchor" style="display:none">
      <xsl:variable name="anchor_resource">
         <xsl:choose>
            <xsl:when test="ancestor::preliminaryRqmts or ancestor::prelreqs">
               <xsl:text>proc.prelReqCondsAnchor</xsl:text>
            </xsl:when>
            <xsl:when test="ancestor::closeRqmts or ancestor::closereqs">
               <xsl:text>proc.closeReqCondsAnchor</xsl:text>
            </xsl:when>
         </xsl:choose>
      </xsl:variable>
      <span class="procAnchorLabel" step_type="1" step_target="procanchor" xsl:use-attribute-sets="standard">
         <span class="getResource"><xsl:value-of select="$anchor_resource"/></span>
      </span>
      <br/>
   </p>
	<h3 class="conds" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.reqsconds"/>:</h3>
	<xsl:choose>
		<xsl:when test="child::noconds or child::noConds">
			<hr size="1" noshade="noshade" color="black"/>
			<div class="noconds"><xsl:value-of select="$style.general.none"/></div>
		</xsl:when>
		<xsl:otherwise>
<table width="100%">  
      <colgroup span="2">
         <col width="55%"></col>
         <col width="45%"></col>
      </colgroup>
      <thead>
      <tr>
         <th valign="top" colspan="2"><hr size="1" noshade="noshade" color="black"/></th>
      </tr>
	<tr>
		<td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.reqsconds"/></td>
		<td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.dmtp"/></td>
	</tr>
	<tr>
	         <th valign="top" colspan="2"><hr size="1" noshade="noshade" color="black"/></th>
      </tr>
	</thead>
      <tbody>
	 <xsl:for-each select="reqcond|reqCondNoRef|reqcondm|reqCondDm|reqcontp|reqCond|reqCondExternalPub">
	    <tr>
	       <xsl:choose>
		  <xsl:when test="position() mod 2 != 0">
		     <xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute>
		  </xsl:when>
	       </xsl:choose>
		<xsl:apply-templates select="."/>
	    </tr>
	 </xsl:for-each>
	 <tr>
	    <td valign="top" colspan="2"><hr size="1" noshade="noshade" color="black"/></td>
	 </tr>
      </tbody>
   </table>
</xsl:otherwise>
</xsl:choose>
<br/>
</xsl:template>

<xsl:template match="reqconds/reqcond|reqCondGroup/reqCondNoRef">
	<td colspan="2">
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</td>
</xsl:template>

<xsl:template match="reqcontp|reqCondExternalPub">
	<td style="vertical-align:top;">
		<xsl:call-template name="security_portion_mark">
			<xsl:with-param name="override_node_text">yes</xsl:with-param>
		</xsl:call-template>
		<xsl:apply-templates select="reqcond|reqCondNoRef|reqCond"/>
	</td>
	<td style="vertical-align:top;"><xsl:apply-templates select="reftp|externalPubRef"/></td>
</xsl:template>

<xsl:template match="reqcondm|reqCondDm">
	<td style="vertical-align:top;"><xsl:apply-templates select="reqcond|reqCond"/></td>
	<td style="vertical-align:top;"><xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param></xsl:call-template>
  <xsl:apply-templates select="refdm|dmRef"/></td>
</xsl:template> 


<xsl:template match="closeup|closereqs|closeRqmts">
	<h2 class="major_section"><xsl:value-of select="$style.common.reqjobcomp"/></h2>
	<xsl:apply-templates/>
</xsl:template>

<xsl:template match="noconds|noConds">
<div class="noconds"><xsl:value-of select="$style.general.none"/></div>
</xsl:template>


<!--<xsl:template match="supequip|reqSupportEquips">
</xsl:template>-->

<!-- *************************** -->
<!-- 	DM Adress and STATUS 	-->
<!-- *************************** -->
<xsl:template match="dmaddres|dmAddress" >
		<xsl:apply-templates select="dmc"/>
		<xsl:apply-templates select="dmIdent/dmCode"/>
		<xsl:apply-templates select="issno"/>
		<xsl:apply-templates select="dmIdent/issueInfo"/>
		<xsl:apply-templates select="issdate"/>
		<xsl:apply-templates select="dmAddressItems/issueDate"/>
</xsl:template>

<xsl:template match="dmaddres/dmc">
<!--
	<tr><td style="font-weight:bold;">Data Module Code: </td><td><span><xsl:apply-templates/></span></td></tr>
-->
	<tr><td class="bold-xsl"><xsl:value-of select="$style.common.dmc"/>: </td><td><span><xsl:value-of select="avee/modelic|age/modelic"/>-<xsl:value-of select="avee/sdc|age/supeqvc"/>-<xsl:value-of select="avee/chapnum|age/ecscs"/>-<xsl:value-of select="avee/section|age/eidc"/><xsl:value-of select="avee/subsect"/>-<xsl:value-of select="avee/subject|age/cidc"/>-<xsl:value-of select="avee/discode|age/discode"/><xsl:value-of select="avee/discodev|age/discodev"/>-<xsl:value-of select="avee/incode|age/incode"/><xsl:value-of select="avee/incodev|age/incodev"/>-<xsl:value-of select="avee/itemloc|age/itemloc"/>
</span></td></tr>
</xsl:template>

<xsl:template match="dmAddress/dmIdent/dmCode">
	<tr><td class="bold-xsl"><xsl:value-of select="$style.common.dmc"/>: </td><td><span><xsl:value-of select="@modelIdentCode"/>-<xsl:value-of select="@systemDiffCode"/>-<xsl:value-of select="@systemCode"/>-<xsl:value-of select="@subSystemCode"/><xsl:value-of select="@subSubSystemCode"/>-<xsl:value-of select="@assyCode"/>-<xsl:value-of select="@disassyCode"/><xsl:value-of select="@disassyCodeVariant"/>-<xsl:value-of select="@infoCode"/><xsl:value-of select="@infoCodeVariant"/>-<xsl:value-of select="@itemLocationCode"/></span></td></tr>
</xsl:template>

<xsl:template match="dmaddres/issno|dmAddress/dmIdent/issueInfo">
	<tr><td class="bold-xsl"><xsl:value-of select="$style.common.issueno"/>: </td><td>
	<xsl:value-of select="@issno | @issueNumber"/>.<xsl:value-of select="@inwork | @ inWork"/>
	<xsl:if test="self::node()[@type='new'] or //dmodule/identAndStatusSection/dmStatus[@issueType = 'new']">
		(<xsl:value-of select="$style.common.newdm"/>)
	</xsl:if>
	</td></tr>
</xsl:template>

<xsl:template match="status/applic|dmStatus/applic" priority="5">
	<tr><td class="bold-xsl"><xsl:value-of select="$style.common.applic"/>: </td><td><span><xsl:apply-templates select="displaytext|displayText"/></span></td></tr>
</xsl:template>

<xsl:template match="dmaddres/issdate|dmAddress/dmAddressItems/issueDate">
	<tr><td class="bold-xsl"><xsl:value-of select="$style.common.issuedate"/>: </td><td>
	<!-- <xsl:value-of select="@month"/>-<xsl:value-of select="@day"/>-<xsl:value-of select="@year"/> -->
	<xsl:value-of select="@year"/>-<xsl:value-of select="@month"/>-<xsl:value-of select="@day"/><!--LAM: 2020-09-16-->
	</td></tr>
</xsl:template>

<!--xsl:template match="dmc">
<div xsl:use-attribute-sets="standard"><xsl:apply-templates/></div>
</xsl:template-->

<!-- inserting information for <refdm target="eh"/> -->
<xsl:template match="refdm|dmRef">
  <xsl:if test="not(parent::warningRef) and not(parent::cautionRef)">
    <!-- LAM: 2020-09-16: Move DMtitle to tooltip-->
    <xsl:variable name="tooltipid" select="generate-id()"/>
    <xsl:variable name="onmouseover"><xsl:if test=".//dmTitle">
      <xsl:apply-templates select=".//dmTitle"/>
    </xsl:if></xsl:variable>
    <xsl:variable name="script">
      <xsl:if test="$onmouseover!=''">javascript:document.getElementById('<xsl:value-of select="$tooltipid"/>').style.visibility = 'hidden';</xsl:if>
      <xsl:text>onclick_xref(event)</xsl:text>
    </xsl:variable>
    <xsl:variable name="class"><xsl:text>xref </xsl:text>
    <xsl:if test="$onmouseover!=''"> tooltip</xsl:if></xsl:variable>
    <span class="{$class}" onclick="{$script}" xsl:use-attribute-sets="standard">

      <xsl:choose>
        <xsl:when test="name() ='dmRef'"><xsl:attribute name="xidtype">XREF</xsl:attribute></xsl:when>
        <xsl:otherwise><xsl:attribute name="xidtype">refdm</xsl:attribute></xsl:otherwise>
      </xsl:choose>
      <xsl:if test="not(child::dmtitle) and not(descendant::dmTitle)">
        <xsl:attribute name="CV_System_DM_Needs_Title">
          <xsl:apply-templates select="avee"/><xsl:apply-templates select="age"/><xsl:apply-templates select="dmRefIdent/dmCode"/>
        </xsl:attribute>
      </xsl:if>

      <xsl:attribute name="spec_version"><xsl:if test="name() = 'refdm'">3</xsl:if><xsl:if test="name() = 'dmRef'">4</xsl:if></xsl:attribute>

      <xsl:if test="@REFID">
        <xsl:attribute name="xrefid"><xsl:value-of select="@REFID"/></xsl:attribute>
      </xsl:if>
      <xsl:if test="not(@REFID)">
        <xsl:attribute name="xrefid"><xsl:for-each select="dmRefIdent/dmCode"><xsl:value-of select="@modelIdentCode"/>-<xsl:value-of select="@systemDiffCode"/>-<xsl:value-of select="@systemCode"/>-<xsl:value-of select="@subSystemCode"/><xsl:value-of select="@subSubSystemCode"/>-<xsl:value-of select="@assyCode"/>-<xsl:value-of select="@disassyCode"/>-<xsl:value-of select="@disassyCodeVariant"/>-<xsl:value-of select="@infoCode"/>-<xsl:value-of select="@infoCodeVariant"/>-<xsl:value-of select="@itemLocationCode"/></xsl:for-each></xsl:attribute>
      </xsl:if>
      <xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
      <xsl:attribute name="modelic"><xsl:value-of select="age/modelic|avee/modelic|dmRefIdent/dmCode/@modelIdentCode"/></xsl:attribute>
      <xsl:attribute name="sdc"><xsl:value-of select="age/supeqvc|avee/sdc|dmRefIdent/dmCode/@systemDiffCode"/></xsl:attribute>
      <xsl:attribute name="chapnum"><xsl:value-of select="age/ecscs|avee/chapnum|dmRefIdent/dmCode/@systemCode"/></xsl:attribute>
      <xsl:attribute name="section"><xsl:value-of select="age/eidc|avee/section|dmRefIdent/dmCode/@subSystemCode"/></xsl:attribute>
      <!-- age/eidc is the equivalent of avee/section PLUS avee/subsect -->
      <xsl:attribute name="subsect"><xsl:value-of select="avee/subsect|dmRefIdent/dmCode/@subSubSystemCode"/></xsl:attribute>
      <xsl:attribute name="subject"><xsl:value-of select="age/cidc|avee/subject|dmRefIdent/dmCode/@assyCode"/></xsl:attribute>
      <xsl:attribute name="discode"><xsl:value-of select="age/discode|avee/discode|dmRefIdent/dmCode/@disassyCode"/></xsl:attribute>
      <xsl:attribute name="discodev"><xsl:value-of select="age/discodev|avee/discodev|dmRefIdent/dmCode/@disassyCodeVariant"/></xsl:attribute>
      <xsl:attribute name="incode"><xsl:value-of select="age/incode|avee/incode|dmRefIdent/dmCode/@infoCode"/></xsl:attribute>
      <xsl:attribute name="incodev"><xsl:value-of select="age/incodev|avee/incodev|dmRefIdent/dmCode/@infoCodeVariant"/></xsl:attribute>
      <xsl:attribute name="itemloc"><xsl:value-of select="age/itemloc|avee/itemloc|dmRefIdent/dmCode/@itemLocationCode"/></xsl:attribute>

      <xsl:if test="@target or @referredFragment">
        <xsl:attribute name="xref_target"><xsl:value-of select="@target|@referredFragment"/></xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select="dmRefIdent/dmCode|avee|age"/>
      <xsl:if test="$onmouseover!=''">
        <span class="tooltip-content tooltip-dmtitle" id="{$tooltipid}"><xsl:copy-of select="normalize-space($onmouseover)"/></span>
      </xsl:if>
    </span>
    <!-- LAM: 2020-09-16: Move DMtitle to tooltip
    <xsl:apply-templates select="dmRefAddressItems"/>
    -->
  </xsl:if>
</xsl:template>

<xsl:template match="dmRefIdent"><xsl:apply-templates/></xsl:template>
<xsl:template match="dmRefAddressItems">
<xsl:apply-templates/></xsl:template>

<xsl:template match="dmRefIdent/dmCode">
<xsl:value-of select="@modelIdentCode"/>-<xsl:value-of select="@systemDiffCode"/>-<xsl:value-of select="@systemCode"/>-<xsl:value-of select="@subSystemCode"/><xsl:value-of select="@subSubSystemCode"/>-<xsl:value-of select="@assyCode"/>-<xsl:value-of select="@disassyCode"/>-<xsl:value-of select="@disassyCodeVariant"/>-<xsl:value-of select="@infoCode"/>-<xsl:value-of select="@infoCodeVariant"/>-<xsl:value-of select="@itemLocationCode"/>
</xsl:template>

<xsl:template match="avee" >
<xsl:value-of select="modelic"/>-<xsl:value-of select="sdc"/>-<xsl:value-of select="chapnum"/>-<xsl:value-of select="section"/><xsl:value-of select="subsect"/>-<xsl:value-of select="subject"/>-<xsl:value-of select="discode"/>-<xsl:value-of select="discodev"/>-<xsl:value-of select="incode"/>-<xsl:value-of select="incodev"/>-<xsl:value-of select="itemloc"/>
</xsl:template>

<xsl:template match="dmc/avee">
<xsl:value-of select="modelic"/>-<xsl:value-of select="sdc"/>-<xsl:value-of select="chapnum"/>-<xsl:value-of select="section"/><xsl:value-of select="subsect"/>-<xsl:value-of select="subject"/>-<xsl:value-of select="discode"/>-<xsl:value-of select="discodev"/>-<xsl:value-of select="incode"/>-<xsl:value-of select="incodev"/>-<xsl:value-of select="itemloc"/>
</xsl:template>

<xsl:template match="age" >
	<xsl:value-of select="modelic"/>-<xsl:value-of select="supeqvc"/>-<xsl:value-of select="ecscs"/>-<xsl:value-of select="eidc"/>-<xsl:value-of select="cidc"/>-<xsl:value-of select="discode"/>-<xsl:value-of select="discodev"/>-<xsl:value-of select="incode"/>-<xsl:value-of select="incodev"/>-<xsl:value-of select="itemloc"/>
</xsl:template>

<xsl:template match="dmc/age">
	<xsl:value-of select="modelic"/>-<xsl:value-of select="supeqvc"/>-<xsl:value-of select="ecscs"/>-<xsl:value-of select="eidc"/>-<xsl:value-of select="cidc"/>-<xsl:value-of select="discode"/>-<xsl:value-of select="discodev"/>-<xsl:value-of select="incode"/>-<xsl:value-of select="incodev"/>-<xsl:value-of select="itemloc"/>
</xsl:template>

<xsl:template match="dmtitle"/>

<xsl:template match="refdm/dmtitle | dmRef/dmTitle">
  <xsl:text>&#160;</xsl:text>
  <xsl:if test="techname">
    <xsl:apply-templates select="techname | techName"/>
    <xsl:if test="infoname | infoName"> - </xsl:if>
  </xsl:if>
  <xsl:if test="infoname | infoName">
    <xsl:apply-templates select="infoname | infoName"/>
  </xsl:if>
</xsl:template>


<xsl:template match="refdm/dmtitle/infoname | dmRef/dmTitle/infoName">
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="refdm/dmtitle/techname | dmRef/dmTitle/techName">
<xsl:apply-templates/>
</xsl:template>

<!--xsl:template match="refdm/dmtitle/infoname">
&#xa0;<xsl:apply-templates/>
</xsl:template-->

<xsl:template match="status|dmStatus">
	<xsl:apply-templates/>
</xsl:template>

<xsl:template match="status/remarks|dmStatus/remarks">
	<!-- LAM: 2020-09-16: Add--><tr>
		<td class="bold-xsl">Remarks: </td>
		<td><xsl:apply-templates/></td>
	</tr>
</xsl:template>

<xsl:template match="security">
	<!-- LAM: 2020-09-16: Suppress <tr>
		<td class="bold-xsl"><xsl:value-of select="$style.common.secclass"/>: </td>
		<td><xsl:value-of select="@securityClassification | @class"/></td>
	</tr> -->
</xsl:template>

<!-- DM status that is not DISPLAYED -->
<xsl:template match="derivativeClassification"/>
<xsl:template match="datarest|dataRestrictions"/>
<xsl:template match="techstd|techStandard" />
<xsl:template match="sbc|systemBreakdownCode" />
<xsl:template match="actref|applicCrossRefTableRef" />
<xsl:template match="brexref|brexDmRef" />
<!--xsl:template match="status/rfu|dmStatus/reasonForUpdate" / -->
<xsl:template match="responsiblePartnerCompany|rpc" />
<xsl:template match="originator|orig" />
<xsl:template match="sb" />
<xsl:template match="type" />
<xsl:template match="skill" />
<!--<xsl:template match="dmStatus/*|status/*" />-->

<xsl:template match="instruct|restrictionInstructions">
<div style="margin-left:40;font-weight:bold;" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.instructions"/></div>
<br/>
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="distrib|dataDistribution">
<div style="margin-left:60;"><span class="bold-xsl" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.distribution"/></span>
<p><xsl:apply-templates/></p>
</div>
</xsl:template>

<xsl:template match="expcont|exportControl">
<div style="margin-left:60;"><span class="bold-xsl" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.exportcontrol"/></span>
<p><xsl:apply-templates/></p>
</div>
</xsl:template>

<xsl:template match="handling|dataHandling">
</xsl:template>

<xsl:template match="disclose|dataDisclosure">
</xsl:template>

<xsl:template match="inform|restrictionInfo">
</xsl:template>


<xsl:template match="destruct|dataDestruction">
<div style="margin-left:60;"><span class="bold-xsl" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.destruction"/>Destruction</span>
<p><xsl:apply-templates/></p>
</div>
</xsl:template>

<!-- LAM: 2020-09-16: Add-->
<xsl:template match="qa|qualityAssurance">
<!-- <qualityAssurance><firstVerification verificationType="tabtop"/></qualityAssurance> -->
	<tr>
		<td class="bold-xsl">Quality Assurance:</td>
		<td>
      <xsl:if test="firstVerification"><div><xsl:apply-templates select="firstVerification"/></div></xsl:if>
      <xsl:if test="secondVerification"><div><xsl:apply-templates select="secondVerification"/></div></xsl:if>
    </td>
	</tr>
</xsl:template>
<xsl:template match="firstVerification[@verificationType='tabtop']">1st Verification: Table top</xsl:template>
<xsl:template match="firstVerification[@verificationType='onobject']">1st Verification: On object</xsl:template>
<xsl:template match="firstVerification[@verificationType='ttandoo']">1st Verification: Table top and On object</xsl:template>
<xsl:template match="secondVerification[@verificationType='tabtop']">2nd Verification: Table top</xsl:template>
<xsl:template match="secondVerification[@verificationType='onobject']">2nd Verification: On object</xsl:template>
<xsl:template match="secondVerification[@verificationType='ttandoo']">2nd Verification: Table top and On object</xsl:template>
<!-- / LAM: 2020-09-16: Add-->
<xsl:template match="unverif|unverified">Unverified</xsl:template>

<!-- LAM: 2020-09-16: Add-->
<xsl:template match="rfu|reasonForUpdate">
	<tr><td class="bold-xsl">Reason for Update:</td><td><xsl:apply-templates/></td></tr>
</xsl:template>
<xsl:template match="simplePara|simpleRefPara">
	<div><xsl:apply-templates/></div>
</xsl:template>
<!-- / LAM: 2020-09-16: Add-->

<!-- ************* ACRONYM *************** -->
<xsl:template match="acronym">
	<span class="acronym">
		<xsl:choose>
		<xsl:when test="acronymDefinition/@id">
			<xsl:variable name="acro_id"><xsl:value-of select="acronymDefinition/@id"/></xsl:variable>
			<xsl:attribute name="onmouseover">CVPortal.components.cvModalHandler.createSmallPop(event, '<xsl:value-of select="$acro_id"/>')</xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="onmouseover">CVPortal.components.cvModalHandler.createSmallPop(event, '<xsl:value-of select="generate-id()"/>')</xsl:attribute>
		</xsl:otherwise>
		</xsl:choose>
		<xsl:apply-templates select="acroterm|acronymTerm"/>
	</span>
</xsl:template>

<xsl:template match="acroterm|acronymTerm">
<xsl:choose>
<xsl:when test="@xrefid or @internalRefId">
	<xsl:variable name="acro_id"><xsl:value-of select="@xrefid|@internalRefId"/></xsl:variable>
    <xsl:if test="not(preceding-sibling::node())">
        <xsl:call-template name="security_portion_mark"/>
    </xsl:if>
	<xsl:if test="not(parent::acronym) and not(following-sibling::acronymDefinition or following-sibling::acrodef)">
		<xsl:variable name="acro_id"><xsl:value-of select="@xrefid|@internalRefId"/></xsl:variable>
		<xsl:apply-templates select="//acronym[@id=$acro_id]"/>
	</xsl:if>
	
	<xsl:if test="not(parent::acronym) and (following-sibling::acronymDefinition or following-sibling::acrodef)">
		<xsl:variable name="acro_id"><xsl:value-of select="acronymDefinition/@id|acrodef/@id"/></xsl:variable>
		<span class="acronym">
		<xsl:attribute name="onmouseover">CVPortal.components.cvModalHandler.createSmallPop(event, '<xsl:value-of select="$acro_id"/>')</xsl:attribute>
		<xsl:apply-templates/>
		</span>	
	</xsl:if>
	<xsl:if test="not(parent::acronym) and not(following-sibling::acronymDefinition or following-sibling::acrodef) and @internalRefId ">
		<span class="acronym">
		<xsl:attribute name="onmouseover">CVPortal.components.cvModalHandler.createSmallPop(event, '<xsl:value-of select="$acro_id"/>')</xsl:attribute>
		<xsl:apply-templates/>
		</span>	
	</xsl:if>

</xsl:when>
<xsl:otherwise>
<xsl:if test="not(preceding-sibling::node())">
    <xsl:call-template name="security_portion_mark"/>
</xsl:if>
	<xsl:apply-templates/>
</xsl:otherwise>
</xsl:choose>
</xsl:template>

<xsl:template match="acrodef|acronymDefinition">
<xsl:call-template name="security_portion_mark"/>
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="figure|multimedia">
	<xsl:apply-templates select="graphic|multimediaobject|multimediaObject"/>
	<xsl:for-each select="sheet">
		<span style="display:none">
			<xsl:attribute name="id">
				<xsl:value-of select="@id"/>
			</xsl:attribute>
			<xsl:attribute name="sheetno">
				<xsl:value-of select="@sheetno"/>
			</xsl:attribute>
			<xsl:attribute name="figureId">
				<xsl:value-of select="ancestor::figure[1]/@id"/>
			</xsl:attribute>
		</span>
	</xsl:for-each>
</xsl:template>

<xsl:template match="graphic|multimediaobject|multimediaObject" priority="2">
  <div graphic="1" style="display:none;">
    <xsl:attribute name="data-count"><xsl:number level='any' format='1.' count="multimediaObject|multimediaobject|graphic"/></xsl:attribute>

    <xsl:attribute name="doctype"><xsl:value-of select="ancestor::DOCUMENT/@DOCTYPE"/></xsl:attribute>
    <xsl:attribute name="id"><xsl:value-of select="@boardno"/><xsl:value-of select="@infoEntityIdent"/></xsl:attribute>

    <xsl:variable name="graphic_position"><xsl:value-of select="position()"/></xsl:variable>

    <xsl:if test="child::hotspot">
      <div>
        <xsl:attribute name="id"><xsl:choose><xsl:when test="@boardno"><xsl:value-of select="@boardno"/></xsl:when><xsl:otherwise><xsl:value-of select="@infoEntityIdent"/></xsl:otherwise></xsl:choose></xsl:attribute>

        <xsl:choose>
          <xsl:when test="hotspot/@coords or hotspot/@objectCoordinates">
            <map>
              <xsl:attribute name="name"><xsl:choose><xsl:when test="@boardno"><xsl:value-of select="@boardno"/></xsl:when><xsl:otherwise><xsl:value-of select="@infoEntityIdent"/></xsl:otherwise></xsl:choose></xsl:attribute>
              <xsl:for-each select="hotspot">	
                <!-- get the thing we are pointing at -->
                <xsl:variable name="xrefid"><xsl:choose><xsl:when test="xref/@xrefid"><xsl:value-of select="xref/@xrefid"/></xsl:when><xsl:when test="refdm"><xsl:apply-templates select="refdm//avee|refdm//age"/></xsl:when><xsl:when test="internalRef/@internalRefId"><xsl:value-of select="internalRef/@internalRefId"/></xsl:when><xsl:when test="dmRef"><xsl:apply-templates select="dmRef/dmRefIdent/dmCode"/></xsl:when></xsl:choose></xsl:variable>
                
                <!-- figure out the reference type -->
                <xsl:variable name="xidtype"><xsl:choose><xsl:when test="xref/@xidtype"><xsl:value-of select="xref/@xidtype"/></xsl:when><xsl:when test="refdm">XREF</xsl:when><xsl:when test="internalRef/@internalRefTargetType"><xsl:value-of select="internalRef/@internalRefTargetType"/></xsl:when><xsl:otherwise>xref</xsl:otherwise></xsl:choose></xsl:variable>
                <xsl:variable name="coords"><xsl:value-of select="@coords"/><xsl:value-of select="@objectCoordinates"/></xsl:variable>
                <area href="#">
                <xsl:choose>
                <!-- If there are EXACTLY 2 commas in the coords,
                   then the shape needs to be circle instead of rectangle. -->
                   <xsl:when test="(string-length($coords) - string-length(translate($coords, ',', '')) = 2)">
                      <xsl:attribute name="shape">CIRCLE</xsl:attribute>
                   </xsl:when>
                <!-- If there are more than 2 comma-separated coordinate pairs,
                   then the shape needs to be polygon instead of rectangle. -->
                   <xsl:when test="(string-length($coords) - string-length(translate($coords, ',', '')) > 3)">
                      <xsl:attribute name="shape">POLY</xsl:attribute>
                   </xsl:when>
                   <xsl:otherwise>
                      <xsl:attribute name="shape">RECT</xsl:attribute>
                   </xsl:otherwise>
                </xsl:choose>
                  <xsl:attribute name="coords"><xsl:value-of select="$coords"/></xsl:attribute>
                  <xsl:attribute name="alt"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:when test="@hotspotTitle"><xsl:value-of select="@hotspotTitle"/></xsl:when><xsl:otherwise>Hotspot</xsl:otherwise></xsl:choose></xsl:attribute>
                  <xsl:attribute name="title"><xsl:choose><xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when><xsl:when test="@hotspotTitle"><xsl:value-of select="@hotspotTitle"/></xsl:when><xsl:otherwise>Hotspot</xsl:otherwise></xsl:choose></xsl:attribute>
                  <xsl:attribute name="xref_target"><xsl:value-of select="refdm/@target"/><xsl:value-of select="dmRef/@referredFragment"/></xsl:attribute>
                  <xsl:attribute name="xidtype"><xsl:value-of select="$xidtype"/></xsl:attribute>
                  <xsl:attribute name="xrefid"><xsl:value-of select="$xrefid"/></xsl:attribute>
                  <xsl:attribute name="onClick">CVPortal.components.cvDocHandler.handle_xref('<xsl:value-of select="$xrefid"/>', '<xsl:value-of select="$xidtype"/>', null, '<xsl:value-of select="refdm/@target"/><xsl:value-of select="dmRef/@referredFragment"/>');</xsl:attribute>
                &#160;</area>
              </xsl:for-each>
            </map>
          </xsl:when>
          <xsl:otherwise>
            <xsl:for-each select="hotspot">	
              <hotspot>
                <xsl:attribute name="figureId"><xsl:value-of select="ancestor::figure[1]/@id"/></xsl:attribute>
                <xsl:attribute name="graphicIndex"><xsl:value-of select="$graphic_position"/></xsl:attribute>
                <xsl:attribute name="graphicICN"><xsl:value-of select="ancestor::graphic[1]/@boardno"/><xsl:value-of select="ancestor::graphic[1]/@infoEntityIdent"/></xsl:attribute>
                <xsl:attribute name="apsname"><xsl:value-of select="@apsname"/><xsl:value-of select="@applicationStructureName"/></xsl:attribute>
                <xsl:attribute name="apsid"><xsl:value-of select="@apsid"/><xsl:value-of select="@applicationStructureIdent"/></xsl:attribute>				
                <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>				

                <xsl:if test="child::xref or child::internalRef">
                  <xsl:choose>
                    <xsl:when test="(internalRef/@referredFragment or xref/@target) and (xref/@xrefid or internalRef/@internalRefId)">
                      <xsl:attribute name="xrefid"><xsl:value-of select="xref/@xrefid"/><xsl:value-of select="internalRef/@internalRefId"/></xsl:attribute>
                      <xsl:attribute name="xref_target"><xsl:value-of select="xref/@target"/><xsl:value-of select="internalRef/@referredFragment"/></xsl:attribute>
                      <xsl:attribute name="xidtype"><xsl:value-of select="xref/@xidtype"/><xsl:value-of select="internalRef/@internalRefTargetType"/></xsl:attribute>
                    </xsl:when>				
                    <xsl:when test="xref/@target"> <!-- case for S1000D 3.0 only -->
                      <xsl:attribute name="xrefid"><xsl:value-of select="xref/@target"/></xsl:attribute>				
                      <xsl:attribute name="xidtype"><xsl:value-of select="xref/@xidtype"/></xsl:attribute>
                    </xsl:when>
                    <xsl:when test="(xref/@xidtype = 'other' or internalRef/@internalRefTargetType = 'other') and ($doc_type = 'ipc' or $doc_type = 'illustratedPartsCatalog')"> 
                      <xsl:attribute name="xidtype">part</xsl:attribute>
                      <xsl:attribute name="xrefid"><xsl:value-of select="xref/@xrefid"/><xsl:value-of select="internalRef/@internalRefId"/></xsl:attribute>				
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:attribute name="xrefid"><xsl:value-of select="xref/@xrefid"/><xsl:value-of select="internalRef/@internalRefId"/></xsl:attribute>				
                      <xsl:attribute name="xidtype"><xsl:value-of select="xref/@xidtype"/><xsl:value-of select="internalRef/@internalRefTargetType"/></xsl:attribute>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:if>
                <!-- if there is a <csnref> element directly as a child of the hotspot -->
                <xsl:if test="child::csnref or child::catalogSeqNumberRef">
                  <xsl:attribute name="xidtype">csn</xsl:attribute>
                  <xsl:attribute name="xrefid">
                    <xsl:value-of select="csnref/@refcsn | catalogSeqNumberRef/@catalogSeqNumberValue"/>
                    <xsl:value-of select="catalogSeqNumberRef/@systemCode"/><xsl:value-of select="catalogSeqNumberRef/@subSystemCode"/><xsl:value-of select="catalogSeqNumberRef/@subSubSystemCode"/>
                    <xsl:value-of select="catalogSeqNumberRef/@assyCode"/><xsl:value-of select="catalogSeqNumberRef/@figureNumber"/><xsl:value-of select="catalogSeqNumberRef/@figureNumberVariant"/>
                    <xsl:value-of select="catalogSeqNumberRef/@item"/><xsl:value-of select="catalogSeqNumberRef/@itemVariant"/>
                  </xsl:attribute>
                </xsl:if>	
                <xsl:if test="child::refdm or child::dmRef">
                  <xsl:attribute name="xref_target"><xsl:value-of select="refdm/@target"/><xsl:value-of select="dmRef/@referredFragment"/></xsl:attribute>
                  <xsl:attribute name="xidtype">xref</xsl:attribute>
                  <xsl:attribute name="xrefid"><xsl:apply-templates select="refdm//avee|refdm//age | dmRef/dmRefIdent/dmCode"/></xsl:attribute>
                </xsl:if>
              </hotspot>
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>		
      </div>
    </xsl:if>
  </div>
</xsl:template>

<!-- *********************** LISTS ************************ -->

<xsl:template match="seqlist|sequentialList">
	<ol xsl:use-attribute-sets="standard">
		<xsl:apply-templates/>
	</ol>
</xsl:template>


<xsl:template match="randlist|randomList" priority="2">
	<ul xsl:use-attribute-sets="standard">
      <xsl:variable name="prefix">
         <xsl:value-of select="@prefix|@listItemPrefix"/>
      </xsl:variable>
		<xsl:choose>
			<xsl:when test="$prefix = 'pf01'">
				<xsl:attribute name="style">list-style:none</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf03'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf03.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf04'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf04.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf05'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf05.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf06'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf06.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf07'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf02.gif);</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="number(count(ancestor::randlist) + count(ancestor::randomList)) mod 2 = 0">
						<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf03.gif);</xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf02.gif);</xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:apply-templates/>
	</ul>
</xsl:template>
<!-- Adding element attentionRandomList -->
<xsl:template match="attentionRandomList">
	<ul xsl:use-attribute-sets="standard">
      <xsl:variable name="prefix">
         <xsl:value-of select="@listItemPrefix"/>
      </xsl:variable>
		<xsl:choose>
			<xsl:when test="$prefix = 'pf01'">
				<xsl:attribute name="style">display:list-item;list-style:none</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf03'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf03.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf04'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf04.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf05'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf05.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf06'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf06.gif);</xsl:attribute>
			</xsl:when>
			<xsl:when test="$prefix = 'pf07'">
				<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf02.gif);</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="number(count(ancestor::attentionRandomList)) mod 2 = 0">
						<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf03.gif);</xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:attribute name="style">list-style-image: url(http://<xsl:value-of select="$host"/><xsl:value-of select="$http_root"/>/images/lists/pf02.gif);</xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:apply-templates/>
	</ul>
</xsl:template>

<!-- Adding element attentionRandomListItem -->
<xsl:template match="attentionRandomListItem">
	<li xsl:use-attribute-sets="standard">
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</li>
</xsl:template>

<!-- Adding element attentionListItemPara -->
<xsl:template match="attentionListItemPara">
	<span>
	
		<xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
		<xsl:apply-templates/>
	</span>
</xsl:template>

<xsl:template match="item|listItem">
	<li xsl:use-attribute-sets="standard">
	<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</li>
</xsl:template>

<!-- ********************** XREFS ************************* -->

<xsl:template match="catalogSeqNumber/internalRef">
  <xsl:param name="itemvar" select="../@item"/>
  <xsl:param name="sheets" select="1"/>
  
  <xsl:param name="refid" select="@internalRefId"/>
  <!--Get APSname so we can track in multi-sheet graphic
  <hotspot id="F0001-gra-0001-hs00001" hotspotType="CALLOUT" applicationStructureName="21" applicationStructureIdent="AUTOID_39727"></hotspot>
  -->
  <xsl:variable name="apsname" select="//hotspot[@id=$refid][1]/@applicationStructureName"/>
  <span class="xref" onclick="CVPortal.components.cvDocHandler.removeYellowArrows();onclick_xref(event)" xsl:use-attribute-sets="standard">
    <xsl:attribute name="xidtype"><xsl:choose>
      <xsl:when test="$sheets &gt; 1">multisheethotspot</xsl:when>
      <xsl:otherwise>hotspot</xsl:otherwise>
    </xsl:choose></xsl:attribute>
    <xsl:attribute name="xrefid"><xsl:value-of select="$refid"/></xsl:attribute>
    <xsl:attribute name="apsname"><xsl:value-of select="$apsname"/></xsl:attribute>
    <xsl:value-of select="$itemvar"/>
  </span>
</xsl:template>

<xsl:template match="xref|internalRef">
  <xsl:if test="not(ancestor::catalogSeqNumber or ancestor::csn)">

    <xsl:variable name="our_xrefid"><xsl:choose>
      <xsl:when test="@internalRefId"><xsl:value-of select="@internalRefId"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="@xrefid"/></xsl:otherwise>
    </xsl:choose></xsl:variable>
    
    <xsl:variable name="target" select="//*[@id=$our_xrefid]"/>

    <xsl:variable name="xidtype"><xsl:choose>
      <xsl:when test="@internalRefTargetType"><xsl:value-of select="@internalRefTargetType"/></xsl:when>
      <xsl:when test="@xidtype"><xsl:value-of select="@xidtype"/></xsl:when>
      <xsl:when test="$our_xrefid!=''">
        <xsl:variable name="target" select="//*[@id=$our_xrefid]"/>
        <xsl:variable name="name" select="name($target)"/>
        <xsl:if test="$target"><xsl:choose>
          <xsl:when test="$name='figure'">figure</xsl:when>
          <xsl:when test="$name='table'">table</xsl:when>
          <xsl:when test="$name='proceduralStep'">step</xsl:when>
          <xsl:when test="$name='levelledPara'">para</xsl:when>
          <xsl:when test="$name='levelledPara'">para</xsl:when>
          <xsl:when test="$name='supportEquipDescr'">supequip</xsl:when>
          <xsl:when test="$name='supplyDescr'">supply</xsl:when>
          <xsl:when test="$name='spareDescr'">spares</xsl:when>
        </xsl:choose></xsl:if>
      </xsl:when>
    </xsl:choose></xsl:variable>

    <xsl:variable name="tooltipid" select="generate-id()"/>
    <xsl:variable name="hastooltip"><xsl:choose>
      <xsl:when test="$xidtype='supequip' or $xidtype='irtt05'">1</xsl:when>
      <xsl:when test="$xidtype='supply' or $xidtype='irtt04'">1</xsl:when>
      <xsl:when test="$xidtype='spares' or $xidtype='irtt06'">1</xsl:when>
      <xsl:when test="$xidtype='figure' or $xidtype='irtt01'">1</xsl:when>
      <xsl:when test="$xidtype='table' or $xidtype='irtt02'">1</xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose></xsl:variable>
    <xsl:variable name="onmouseover">
      <xsl:if test="$hastooltip='1' and $target">
        <xsl:variable name="pnr"><xsl:choose>
          <xsl:when test="$target/self::supportEquipDescr or 
                          $target/self::supplyDescr or 
                          $target/self::spareDescr"
            ><xsl:value-of select="$target/natoStockNumber | $target/identNumber/partAndSerialNumber/partNumber"/></xsl:when>
        </xsl:choose></xsl:variable>
        <xsl:variable name="title"><xsl:choose>
          <xsl:when test="$target/self::figure or 
                          $target/self::table"><xsl:value-of select="$target/title[1]"/></xsl:when>
        </xsl:choose></xsl:variable>
        <xsl:choose>
          <xsl:when test="normalize-space($pnr)!=''"><b>PNR</b>: <xsl:value-of select="normalize-space($pnr)"/>
          <xsl:variable name="reqq" select="$target/reqQuantity"/>
          <xsl:if test="$reqq!=''">;<br/><b>QTY</b>: <xsl:value-of select="$reqq"/></xsl:if></xsl:when>
          <xsl:when test="normalize-space($title)!=''"><xsl:value-of select="normalize-space($title)"/></xsl:when>
        </xsl:choose>
      </xsl:if>
    </xsl:variable>
    <xsl:variable name="script"><xsl:if test="$target"
      >var target = document.getElementById('<xsl:value-of select="$our_xrefid"/>');
      if (target) {
        var parent = target.parentNode;
        if (parent) {
          if (parent.nodeName === 'TD') {
            while (parent != null) {
              if (parent.style &amp;&amp; ('' + parent.style.display) === 'none') {
                if (('' + parent.nodeName === 'TABLE')) {
                  parent.style.display = 'table';
                }
                break;
              }
              parent = parent.parentNode;
            }
          }
        }
      };
      <xsl:if test="$onmouseover!=''">javascript:document.getElementById('<xsl:value-of select="$tooltipid"/>').style.visibility = 'hidden';</xsl:if>
    </xsl:if><xsl:text>onclick_xref(event)</xsl:text></xsl:variable>
    <xsl:variable name="class"><xsl:text>xref</xsl:text>
    <xsl:if test="$onmouseover!=''"> tooltip</xsl:if>
    </xsl:variable>
    <span class="{$class}" onclick="{$script}" xsl:use-attribute-sets="standard">
      <xsl:if test="$onmouseover!=''">
        <xsl:attribute name="onmouseover">javascript:document.getElementById('<xsl:value-of select="$tooltipid"/>').style.visibility = 'visible';</xsl:attribute>
        <xsl:attribute name="onmouseout" >javascript:document.getElementById('<xsl:value-of select="$tooltipid"/>').style.visibility = 'hidden';</xsl:attribute>
      </xsl:if>
      <xsl:attribute name="xidtype"><xsl:value-of select="$xidtype"/></xsl:attribute>
      <xsl:attribute name="xrefid"><xsl:value-of select="$our_xrefid"/></xsl:attribute>

      <xsl:if test="not(text())">

        <xsl:choose>
          <xsl:when test="$xidtype='supequip' or $xidtype='irtt05'">
            <xsl:call-template name="createSupportEquipXrefText"><xsl:with-param name='idref' select='$our_xrefid'/></xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='supply' or $xidtype='irtt04'">
            <xsl:call-template name="createSuppliesXrefText"><xsl:with-param name='idref' select='$our_xrefid'/></xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='table' or $xidtype='irtt02'"><!--LAM:2020-09-22-->
            <xsl:text>Table&#0160;</xsl:text><xsl:for-each select="//*[@id=$our_xrefid]"><xsl:number level="any" count="table" format="1"/></xsl:for-each>
          </xsl:when>
          <xsl:when test="$xidtype='figure' or $xidtype='irtt01'"><!--LAM:2020-09-22-->
            <xsl:text>Fig&#0160;</xsl:text><xsl:for-each select="//*[@id=$our_xrefid]"><xsl:number level="any" count="figure" format="1"/></xsl:for-each>
          </xsl:when>
          <xsl:when test="$xidtype='multimedia' or $xidtype='irtt03'">
            <xsl:call-template name='createFigureXrefText'><xsl:with-param name='idref' select='$our_xrefid'/></xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='spares' or $xidtype='irtt06'">
            <xsl:call-template name="createSparesXrefText"><xsl:with-param name='idref' select='$our_xrefid'/></xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='hotspot' or $xidtype='irtt11'">
            <xsl:choose>
              <xsl:when test="//hotspot[@id = $our_xrefid]">
                <xsl:for-each select="//hotspot[@id = $our_xrefid]"><xsl:call-template name="get_hotspot_figure_xref"/></xsl:for-each>
              </xsl:when>
              <xsl:otherwise>
                <xsl:for-each select="//figure[@id = $our_xrefid]"><xsl:call-template name="get_hotspot_figure_xref"/></xsl:for-each>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <!-- STEPS -->
          <xsl:when test="$xidtype='step' or $xidtype='irtt08'"><xsl:value-of select="$style.common.step"/>&#160;<xsl:for-each select="//*[@id = $our_xrefid]">
            <xsl:call-template name="formatStepDesignator"/></xsl:for-each>
          </xsl:when>

          <!-- PARAs -->
          <xsl:when test="$xidtype='para' or $xidtype='irtt07'">
            <xsl:value-of select="$style.common.para"/><xsl:text>&#160;</xsl:text>
            <xsl:for-each select="//*[@id= $our_xrefid]">
              <xsl:choose>
                <!-- handling S1000D 4.0 paras -->
                <xsl:when test="name() = 'levelledPara'"><xsl:number count="levelledPara" level="multiple" format="1.1.1.1.1.1.1.1"/></xsl:when>
                <xsl:when test="name() = 'para0'"><xsl:number count="para0" level="single" format="1"/></xsl:when>
                <xsl:when test="name() = 'subpara1'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara2'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="multiple" format="1."/>
                  <xsl:number count="subpara2" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara3'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="multiple" format="1."/>
                  <xsl:number count="subpara2" level="multiple" format="1."/>
                  <xsl:number count="subpara3" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara4'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="single" format="1 "/>
                  <xsl:number count="subpara2" level="multiple" format="1."/>
                  <xsl:number count="subpara3" level="multiple" format="1."/>
                  <xsl:number count="subpara4" level="single" format="1"/>
                </xsl:when>
              </xsl:choose>
            </xsl:for-each>
          </xsl:when>
          <xsl:when test="$xidtype='sheet' or $xidtype='irtt09'">
            <xsl:for-each select="//sheet[@id = $our_xrefid]">			
              <xsl:variable name="figId"><xsl:value-of select="ancestor::figure/@id"/></xsl:variable>		
              <!-- include our sheet information for linking -->
              <xsl:attribute name="figureId"><xsl:value-of select="$figId"/></xsl:attribute>
              <xsl:attribute name="sheetno"><xsl:value-of select="@sheetno"/></xsl:attribute>			
              <!-- include our figure title and sheetNo in the linking -->			
              <xsl:text>Fig&#0160;</xsl:text><xsl:number level="any" count="figure" format="1."/>
              <xsl:text>, Sheet&#0160;</xsl:text><xsl:value-of select="count(./preceding-sibling::sheet) + 1"/>
            </xsl:for-each>
          </xsl:when>	

          <xsl:otherwise><xsl:value-of select="$style.common.crossref"/></xsl:otherwise>	
        </xsl:choose>

        <!-- Supported Values
        <xs:enumeration value="figure"/>
        <xs:enumeration value="table"/>
        <xs:enumeration value="supply"/>
        <xs:enumeration value="supequip"/>
        <xs:enumeration value="spares"/>
        <xs:enumeration value="para"/>
        <xs:enumeration value="step"/>
        <xs:enumeration value="sheet"/>
        <xs:enumeration value="hotspot"/>
        <xs:enumeration value="other"/>
        -->
      </xsl:if>
      <xsl:apply-templates/>
      <xsl:if test="$onmouseover!=''">
        <span class="tooltip-content" id="{$tooltipid}"><xsl:copy-of select="$onmouseover"/></span>
      </xsl:if>
    </span>
  </xsl:if>
</xsl:template>

  <!-- Get hotspot figure xref info: context node expected to be at figure -->
  <xsl:template name="get_hotspot_figure_xref"><xsl:text>Fig&#0160;</xsl:text><!-- print out the figure number -->
    <xsl:for-each select="ancestor::figure"><xsl:number count="figure" format="1" level="any"/></xsl:for-each>
    <xsl:variable name="nRec"><xsl:number/></xsl:variable>
    <!-- <xsl:value-of select="ancestor::figure/title/text()"/> --><xsl:text>[</xsl:text><xsl:choose>
      <xsl:when test="@apsname or @applicationStructureName"><xsl:value-of select="@apsname | @applicationStructureName"/></xsl:when>
      <xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when>
      <xsl:otherwise><!--<xsl:number count="hotspot" format="1" level="single"/> --><xsl:value-of select="$nRec - 1"/></xsl:otherwise>
    </xsl:choose><xsl:text>]</xsl:text>
  </xsl:template>

  <!-- Get hotspot figure xref info: context node expected to be at figure -->
  <xsl:template name="get_hotspot_figure_xref_ORIG">Figure <!-- print out the figure number -->
	<xsl:value-of select="$style.common.figure"/><xsl:text> </xsl:text> 
	<!-- print out the figure number -->
	<xsl:for-each select="ancestor::figure | ancestor::multimedia">
	<xsl:number count="figure|multimedia" format="1." level="any"/><xsl:text> </xsl:text> 
	</xsl:for-each>
	<xsl:variable name="nRec"><xsl:number/></xsl:variable>

	<!-- print out the figure title -->
	<xsl:value-of select="ancestor::figure/title/text() | ancestor::multimedia/title/text()"/>
	- <xsl:value-of select="$style.common.hotspot"/> -
	<xsl:choose>
		<xsl:when test="@title"><xsl:value-of select="@title"/></xsl:when>
		<xsl:when test="@apsname or @applicationStructureName">
			<xsl:value-of select="@apsname"/>
			<xsl:value-of select="@applicationStructureName"/>
		</xsl:when>
		<xsl:otherwise>
			<!--<xsl:number count="hotspot" format="1" level="single"/> -->
			<xsl:value-of select="$nRec - 1"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="safety|reqSafety">
  <!-- NV Harmonization: safety conditions is anchor point -->
  <p class="procAnchor" style="display:none">
  <span class="procAnchorLabel" step_type="1" step_target="procanchor" xsl:use-attribute-sets="standard">
  <span class="getResource">proc.safetyCondsAnchor</span></span><br/></p><br/>
  <h3 class="conds"><xsl:value-of select="$style.common.safecond"/>:</h3>
  <hr size="1" noshade="noshade" color="black"/>
  <xsl:apply-templates/>
</xsl:template>

<!--
<reqSafety>
<safetyRqmts
  warningRefs="warn-001 warn-002 warn-003 warn-004 warn-005"
  cautionRefs="caut-001 caut-002 caut-003 caut-004 caut-005 caut-006 caut-007 caut-008 caut-009 caut-010 caut-011"
  />
</reqSafety>
-->
<xsl:template match="safety/safetyRqmts | reqSafety/safetyRqmts">
  <div id="safety-condition-wrapper">
    <xsl:choose>
      <xsl:when test="@warningRefs">
        <xsl:variable name="refwarns" select="./ancestor::dmodule[1]//warningsAndCautions/warning"/>
        <xsl:variable name="warnrefs" select="@warningRefs"/>
        <xsl:for-each select="tokenize($warnrefs,' ')">
          <xsl:variable name="warnref" select="normalize-space(.)"/>
          <xsl:apply-templates select="$refwarns[@id=$warnref]"><xsl:with-param name="mode">2</xsl:with-param></xsl:apply-templates>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates select="warning"/></xsl:otherwise>
    </xsl:choose>
    <xsl:choose>
      <xsl:when test="@cautionRefs">
        <xsl:variable name="refcauts" select="./ancestor::dmodule[1]//warningsAndCautions/caution"/>
        <xsl:variable name="cautrefs" select="@cautionRefs"/>
        <xsl:for-each select="tokenize($cautrefs,' ')">
          <xsl:variable name="cautref" select="normalize-space(.)"/>
          <xsl:apply-templates select="$refcauts[@id=$cautref]"><xsl:with-param name="mode">2</xsl:with-param></xsl:apply-templates>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates select="caution"/></xsl:otherwise>
    </xsl:choose>
    <xsl:apply-templates select="note"/>
  </div>
</xsl:template>

<xsl:template match="safecond|safetyRqmts">
  <div id="SAFETY_TABLE">
    <div xsl:use-attribute-sets="standard"><xsl:apply-templates/></div>
    <br/><br/>
  </div>
</xsl:template>

<xsl:template match="nosafety|noSafety">
  <div class="noconds"><xsl:value-of select="$style.general.none"/></div>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="reqcond|reqCond">
  <xsl:call-template name="security_portion_mark"/>
  <xsl:apply-templates/>
</xsl:template>

<xsl:template match="warningAndCautionPara|notePara|warning/para|caution/para|note/para">
	<div class="wcnPara">
		<xsl:if test="parent::note and name()='para'">
			<xsl:attribute name="style">text-align: center;</xsl:attribute>
		</xsl:if>
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</div>
	<!--
	<xsl:if test="name() = 'para'">
		<br/>
		<div xsl:use-attribute-sets="standard">
		<xsl:call-template name="formatClass01"/>
		<xsl:apply-templates/>
		</div>
	</xsl:if>
	-->
</xsl:template>


<xsl:template match="reqcondm/reqcond|reqCondDm/reqCond">
<span xsl:use-attribute-sets="standard">
<xsl:call-template name="security_portion_mark"/>
<xsl:apply-templates/>
</span>
</xsl:template>

<xsl:template match="reqcondm/reqdm">
&#160;<span class="xref" onclick="onclick_xref(event)" xsl:use-attribute-sets="standard">
<xsl:attribute name="xrefid"><xsl:value-of select="@REFID"/></xsl:attribute>
<xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
<xsl:attribute name="modelic"><xsl:value-of select="avee/modelic"/></xsl:attribute>
<xsl:attribute name="sdc"><xsl:value-of select="avee/sdc"/></xsl:attribute>
<xsl:attribute name="chapnum"><xsl:value-of select="avee/chapnum"/></xsl:attribute>
<xsl:attribute name="section"><xsl:value-of select="avee/section"/></xsl:attribute>
<xsl:attribute name="subsect"><xsl:value-of select="avee/subsect"/></xsl:attribute>
<xsl:attribute name="subject"><xsl:value-of select="avee/subject"/></xsl:attribute>
<xsl:attribute name="discode"><xsl:value-of select="avee/discode"/></xsl:attribute>
<xsl:attribute name="discodev"><xsl:value-of select="avee/discodev"/></xsl:attribute>
<xsl:attribute name="incode"><xsl:value-of select="avee/incode"/></xsl:attribute>
<xsl:attribute name="incodev"><xsl:value-of select="avee/incodev"/></xsl:attribute>
<xsl:attribute name="itemloc"><xsl:value-of select="avee/itemloc"/></xsl:attribute>
<xsl:attribute name="xidtype">refdm</xsl:attribute>
<xsl:choose>
	<xsl:when test="$app_mode != '1'">
		<xsl:apply-templates select="avee/chapnum"/>-<xsl:apply-templates select="avee/section"/><xsl:apply-templates select="avee/subsect"/>-<xsl:apply-templates select="avee/subject"/>-<xsl:apply-templates select="avee/discode"/>
	</xsl:when>
	<xsl:otherwise>
		<xsl:apply-templates/>
	</xsl:otherwise>
</xsl:choose>
</span>
</xsl:template>

<!-- **************************** Change Markup ******************* -->

<xsl:template match="change">
	<xsl:choose>
		<xsl:when test="self::node()[@change='delete']">
			<xsl:attribute name="style">display: none</xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:if test="self::node()[@mark='1']">
				<xsl:choose>
					<xsl:when test="$change_reason='OFF'">
						<span xsl:use-attribute-sets="standard"><xsl:apply-templates/></span>
					</xsl:when>
					<xsl:otherwise>	
						<xsl:choose>
							<xsl:when test="number(@level) &gt; number($change_level)"> 
								<div style="border:2px solid red;" xsl:use-attribute-sets="standard">
									<xsl:apply-templates/>
								</div>
							</xsl:when>
							<xsl:when test="number(@level) = number($change_level)"> 	
								<div class="border-dasher-2" xsl:use-attribute-sets="standard">
									<xsl:apply-templates/>
								</div>
							</xsl:when>
							<xsl:otherwise> 	
								<div xsl:use-attribute-sets="standard">
								<xsl:apply-templates/>
								</div>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:if>

			<xsl:if test="self::node()[@mark!='1']">
				<span xsl:use-attribute-sets="standard">
					<xsl:apply-templates/>
				</span>
			</xsl:if>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!-- LAM: 2021-10-26 Change templates -->
<xsl:template name="set-change-class-name">
  <xsl:param name="src" select="." />
  <xsl:choose>
    <xsl:when test="$src/@changeType='delete'">change-deleted</xsl:when>
    <xsl:when test="$src/@changeMark='1'"><xsl:choose>
      <xsl:when test="$change_reason='OFF'"></xsl:when>
      <xsl:otherwise>border-dasher-2</xsl:otherwise>
    </xsl:choose></xsl:when>
  </xsl:choose>
</xsl:template>
<xsl:template match="changeInline|*[@reasonForUpdateRefIds]" priority="2">
	<xsl:if test="name(current()) != 'row' and name(current()) != 'table' and name(current()) != 'tbody'">
    <xsl:choose>
      <xsl:when test="not(@changeType) and not(@changeMark)">
        <xsl:choose>
          <xsl:when test="self::para">
            <p xsl:use-attribute-sets="standard">
              <xsl:call-template name="formatClass01"/>
              <xsl:call-template name="security_portion_mark"/>
              <xsl:apply-templates/>
            </p>
          </xsl:when>
          <xsl:otherwise>
            <span xsl:use-attribute-sets="standard"><xsl:call-template name="security_portion_mark"/><xsl:apply-templates/></span>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="class"><xsl:call-template name="set-change-class-name"/></xsl:variable>
        <xsl:variable name="tagname"><xsl:choose>
          <xsl:when test="self::para">p</xsl:when>
          <xsl:otherwise>span</xsl:otherwise>
        </xsl:choose></xsl:variable>
        <!--xsl:element name="{$tagname}" xsl:use-attribute-sets="standard"-->
        <xsl:element name="{$tagname}" use-attribute-sets="standard">
          <xsl:attribute name="class"><xsl:value-of select="$class"/></xsl:attribute>
          <xsl:if test="@changeMark!='1'">
            <xsl:call-template name="security_portion_mark"/>
          </xsl:if>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
	</xsl:if>
</xsl:template>
<!-- / LAM: 2021-10-26 Change templates -->

<xsl:template match="changeInline|*[@reasonForUpdateRefIds]" priority="-1">
	<!-- LCS-1860: reasonForUpdateRefIds under the "row" node is handled in table.xsl's row template instead -->
	<!-- if reasonForUpdateRefIds is causing problems, it's usually because this template is more specific (and therefore higher base priority) than most node-name templates -->
	<!-- in those cases, try using the following template instead -->
	<xsl:if test="name(current()) != 'row' and name(current()) != 'table' and name(current()) != 'tbody'">
		<xsl:choose>
			<xsl:when test="self::node()[@changeType='delete']">
				<xsl:attribute name="style">display: none</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="self::node()[@changeMark='1']"><xsl:choose>
          <xsl:when test="$change_reason='OFF'">
            <span xsl:use-attribute-sets="standard">
            <xsl:apply-templates />
            </span>
          </xsl:when>
          <xsl:otherwise>	
            <span class="border-dasher-2" xsl:use-attribute-sets="standard">
              <xsl:apply-templates/>
            </span>
          </xsl:otherwise>
        </xsl:choose></xsl:if>

				<xsl:if test="self::node()[@changeMark!='1']">
					<span xsl:use-attribute-sets="standard">
						<xsl:call-template name="security_portion_mark"/>
						<xsl:apply-templates/>
					</span>
				</xsl:if>

				<xsl:if test="self::node()[not(@changeType)]">
					<xsl:if test="self::node()[not(@changeMark)]">
						<xsl:choose>
							<xsl:when test="name() = 'para'">
								<p xsl:use-attribute-sets="standard">
									<xsl:call-template name="formatClass01"/>
									<xsl:call-template name="security_portion_mark"/>
									<xsl:apply-templates/>
								</p>
							</xsl:when>
							<xsl:otherwise>
								<span xsl:use-attribute-sets="standard"><xsl:call-template name="security_portion_mark"/><xsl:apply-templates/></span>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:if>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:if>
</xsl:template>

<xsl:template name="reasonForUpdateRefIds">
	<!-- if reasonForUpdateRefIds is causing XSL problems, try calling this template instead of the previous one -->
	<xsl:choose>
		<xsl:when test="self::node()[@changeType='delete']">
			<xsl:attribute name="style">display: none</xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:if test="self::node()[@changeMark='1']">
				<xsl:choose>
					<xsl:when test="$change_reason='OFF'">
						<!--<span xsl:use-attribute-sets="standard"><xsl:apply-templates/></span>-->
					</xsl:when>
					<xsl:otherwise>	
						<xsl:attribute name="style">border: 2px dashed red</xsl:attribute>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:if>

			<xsl:if test="self::node()[@changeMark!='1']">
				<span xsl:use-attribute-sets="standard">
					<xsl:call-template name="security_portion_mark"/>
					<xsl:apply-templates/>
				</span>
			</xsl:if>

			<xsl:if test="self::node()[not(@changeType)]">
				<xsl:if test="self::node()[not(@changeMark)]">
					<xsl:choose>
						<xsl:when test="name() = 'para'">
							<p xsl:use-attribute-sets="standard">
								<xsl:call-template name="formatClass01"/>
								<xsl:call-template name="security_portion_mark"/>
								<xsl:apply-templates/>
							</p>
						</xsl:when>
						<xsl:otherwise>
							<span xsl:use-attribute-sets="standard"><xsl:apply-templates/></span>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:if>
			</xsl:if>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!-- must wrap a table in a div if it is in procedural step otherwise paras to follow won't display in correct location -->
<xsl:template match="proceduralStep/table" priority="5">
	<div>
		<span xsl:use-attribute-sets="standard"/>
		<xsl:apply-templates/>
	</div>
</xsl:template>

<!-- *************************** WARNINGS, CAUTIONS, NOTES *********** -->

<xsl:template match="warning" priority="2">
  <xsl:param name="mode">1</xsl:param>
	<xsl:choose>
		<xsl:when test="(ancestor::step1 or ancestor::step3 or ancestor::step3 or ancestor::step4 or ancestor::step5 or ancestor::proceduralStep) or $mode='2'"> 
			<tr class="wcn-msg"><td colspan="3">
				<div class="warning_container">
				<xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
					<div class="wcn_inside">
						<br/>
						<span class="warning bold-xsl"><center><xsl:value-of select="$style.common.warning"/></center></span>
						<div class="block" xsl:use-attribute-sets="standard" wcn="warning">
							<xsl:apply-templates/>
						</div>
					</div>
				</div>
			</td></tr>
		</xsl:when>
		<xsl:otherwise>
			<xsl:if test="not(ancestor::warningsAndCautions) or $mode='3'">
				<div class="warning_container">
				<xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
					<div class="wcn_inside">
						<br/>
						<span class="warning bold-xsl"><center><xsl:value-of select="$style.common.warning"/></center></span>
						<div class="block" xsl:use-attribute-sets="standard" wcn="warning">
							<xsl:apply-templates/>
						</div>
					</div>
				</div>
			</xsl:if>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="caution" priority="2">
  <xsl:param name="mode">1</xsl:param>
	<xsl:choose>
		<xsl:when test="(ancestor::step1 or ancestor::step3 or ancestor::step3 or ancestor::step4 or ancestor::step5 or ancestor::proceduralStep) or $mode='2'"> 
			<tr class="wcn-msg"><td colspan="3">
				<!-- <br/> -->
				<!-- <center> -->
				<div class="caution_container">
				<xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
					<div class="wcn_inside">
						<span class="caution bold-xsl"><center><xsl:value-of select="$style.common.caution"/></center></span>
						<div class="block" xsl:use-attribute-sets="standard" wcn="caution">
							<xsl:apply-templates/>
						</div>
					</div>
				</div>
				<!-- </center> -->
				<!-- <br/> -->
			</td></tr>
		</xsl:when>
		<xsl:otherwise> 	
			<xsl:if test="not(ancestor::warningsAndCautions) or $mode='3'">
				<!-- <br/> -->
				<!-- <center> -->
				<div class="caution_container">
				<xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
					<div class="wcn_inside">
						<span class="caution bold-xsl"><center><xsl:value-of select="$style.common.caution"/></center></span>
						<div class="block" xsl:use-attribute-sets="standard" wcn="caution">
							<xsl:apply-templates/>
						</div>
					</div>
				</div>
				<!-- </center> -->
				<!-- <br/> -->
			</xsl:if>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!--
<randomList EID="589" LASTEID="599">
<listItem EID="590" LASTEID="591"><para EID="591">The bolt (25) </para></listItem>
<listItem EID="592" LASTEID="595"><para EID="593">The packing washer(s) (27)</para>
<note EID="594" LASTEID="595">
<notePara EID="595">The same packing washers that were removed must be used when installing the bottom fuel tank retaining straps.</notePara>
</note>
</listItem>
<listItem EID="596" LASTEID="597"><para EID="597">The washer (29)</para></listItem>
<listItem EID="598" LASTEID="599"><para EID="599">The nut (30)</para></listItem>

</randomList>-->
<xsl:template match="note">
	<xsl:choose>
		<!-- <xsl:when test="ancestor::step1 or ancestor::step3 or ancestor::step3 or ancestor::step4 or ancestor::step5 or ancestor::proceduralStep"> -->
    <!--LAM: 2020-09-21: If this is in a list item this messes up formatting as this does not start a table (starts a <TR>)-->
		<xsl:when test="(ancestor::step1 or ancestor::step3 or ancestor::step3 or ancestor::step4 or ancestor::step5 or ancestor::proceduralStep) and not(parent::listItem)"> 
			<tr><td colspan="3">
				<br/>
				<div class="note_container">
					<div class="wcn_inside">
						<span class="note bold-xsl"><center><xsl:value-of select="$style.common.note"/></center></span>
						<div class="block" xsl:use-attribute-sets="standard" wcn="note">
							<xsl:apply-templates/>
						</div>
					</div>
				</div>
				<br/>
			</td></tr>
		</xsl:when>
		<xsl:otherwise>
			<br/>
			<div class="note_container">
				<div class="wcn_inside">
					<span class="note bold-xsl"><center><xsl:value-of select="$style.common.note"/></center></span>
					<div class="block" xsl:use-attribute-sets="standard" wcn="note">
						<xsl:apply-templates/>
					</div>
				</div>
			</div>
			<xsl:if test="not(parent::listItem)"><br/></xsl:if><!--LAM: 2020-09-21-->
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>
 
<xsl:template name="formatClass01">
	<!-- check if portion marks is enabled to avoid double U -->
	<xsl:param name="filtervars" select="document($filter_location)/filter"/>
	<xsl:variable name="show_portion_marking">
		<xsl:value-of select="$filtervars/group[@name='pub_settings']/cond[@name='show_portion_marking']/item[1]/text()"/>
	</xsl:variable>
	<xsl:if test="self::node()[@class='01'] and $show_portion_marking != '1'">
		<xsl:choose>
			<xsl:when test="self::node()[@caveat='cv51']"><span style="color='blue';">(U) <xsl:value-of select="$style.common.noforeigndisclosure"/> </span></xsl:when>
			<xsl:otherwise><span style="color='blue';">(U) </span></xsl:otherwise>
		</xsl:choose>		
	</xsl:if>
</xsl:template>

<!-- NV Harmonization: Insert WCNs in procedural steps along with their anchors -->
<xsl:template name="proceduralStepWCNs">
<!--
  <warningsAndCautions>
  <warning id="warn-001"><warningAndCautionPara>...</warningAndCautionPara></warning>
  <warning id="warn-002"><warningAndCautionPara>...</warningAndCautionPara></warning>
  <caution id="caut-001"><warningAndCautionPara>...</warningAndCautionPara></caution>
  <caution id="caut-002"><warningAndCautionPara>...</warningAndCautionPara></caution>
  </warningsAndCautions>
  ...
  <proceduralStep warningRefs="warn-001 warn-002">...</proceduralStep>
  
<tr style="display:none;" class="stepAnchor" anchor_id="proceduralStep-2.5">
<td colspan="3">
<span class="stepAnchorLabel" step_anchor="1">
<span class="getResource">proc.procStepAnchor</span>2.5</span></td>
</tr>  
-->
  <xsl:if test="@warningRefs or @cautionRefs or warning or caution or note">
    <tr class="stepAnchor" style="display:none;">
      <xsl:attribute name="anchor_id">
        <xsl:value-of select="local-name()"/><xsl:value-of select="'-'"/><xsl:call-template name='formatStepDesignator'/>
      </xsl:attribute>
      <td colspan="3" width="99%" class="stepAnchorLabel"><span step_anchor="1" class="stepAnchorLabel">
        <span class="getResource">proc.procStepAnchor</span>
        <xsl:call-template name='formatStepDesignator'/>
      </span></td>
    </tr>

    <xsl:choose>
      <xsl:when test="@warningRefs">
        <xsl:variable name="refwarns" select="./ancestor::dmodule[1]//warningsAndCautions/warning"/>
        <xsl:variable name="warnrefs" select="@warningRefs"/>
        <xsl:for-each select="tokenize($warnrefs,' ')">
          <xsl:variable name="warnref" select="normalize-space(.)"/>
          <xsl:apply-templates select="$refwarns[@id=$warnref]"><xsl:with-param name="mode">2</xsl:with-param></xsl:apply-templates>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates select="warning"/></xsl:otherwise>
    </xsl:choose>
    <xsl:choose>
      <xsl:when test="@cautionRefs">
        <xsl:variable name="refcauts" select="./ancestor::dmodule[1]//warningsAndCautions/caution"/>
        <xsl:variable name="cautrefs" select="@cautionRefs"/>
        <xsl:for-each select="tokenize($cautrefs,' ')">
          <xsl:variable name="cautref" select="normalize-space(.)"/>
          <xsl:apply-templates select="$refcauts[@id=$cautref]"><xsl:with-param name="mode">2</xsl:with-param></xsl:apply-templates>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates select="caution"/></xsl:otherwise>
    </xsl:choose>
    <xsl:apply-templates select="note"/>
  </xsl:if>
</xsl:template>

<!-- NV Harmonization: Support for issue 4.0 Common Information elements -->
<xsl:template match="commonInfo" priority="2">
   <!-- NV Harmonization: required conditions is anchor point -->
   <p class="procAnchor" style="display:none">
<!--
      <xsl:if test="self::node()[@reasonForUpdateRefIds]">
         <xsl:call-template name="reasonForUpdateRefIds"/>
      </xsl:if>
-->
      <span class="procAnchorLabel" step_type="1" step_target="procanchor" xsl:use-attribute-sets="standard">
         <span class="getResource">proc.commonInfoAnchor</span>
      </span>
      <br/>
   </p>
   <!-- If no title, auto-generate -->
   <xsl:if test="not(child::title)">
      <h2 class="major_section">
         <xsl:value-of select="$style.common.geninfo"/>
      </h2>
   </xsl:if>
   <!-- If no commonInfoDescrPara, auto-generate -->
   <xsl:if test="not(child::commonInfoDescrPara)">
      <h3 class="minor_section">
         <xsl:value-of select="$style.common.aboutproced"/>:
      </h3>
      <hr size="1" noshade="noshade" color="black"/>
   </xsl:if>
   <xsl:apply-templates/>
</xsl:template>

<xsl:template match="commonInfo/title" priority="1">
   <h2 class="major_section">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
   </h2>
</xsl:template>

<xsl:template match="commonInfoDescrPara" priority="1">
   <!-- If this is the first top-most commonInfoDescrPara and no title, auto-generate -->
   <xsl:if test="parent::commonInfo and count(preceding-sibling::commonInfoDescrPara) = 0 and not(child::title)">
      <h3 class="minor_section">
         <xsl:value-of select="$style.common.aboutproced"/>:
      </h3>
      <hr size="1" noshade="noshade" color="black"/>
   </xsl:if>
   <xsl:choose>
      <xsl:when test="parent::commonInfo[@reasonForUpdateRefIds]">
         <!-- if CommonInfo element is marked for change, reflect it here -->
         <xsl:element name="span">
            <xsl:for-each select="parent::commonInfo">
               <xsl:call-template name="reasonForUpdateRefIds"/>
            </xsl:for-each>
            <xsl:apply-templates/>
         </xsl:element>
      </xsl:when>
      <xsl:otherwise>
         <xsl:apply-templates/>
      </xsl:otherwise>
   </xsl:choose>
</xsl:template>

<xsl:template match="commonInfoDescrPara/title" priority="1">
   <h3 class="minor_section">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
   </h3>
   <hr size="1" noshade="noshade" color="black"/>
</xsl:template>

<!-- NV Harmonization: FI named templates -->

<xsl:template name='formatIsoStepDesignator'>
   <xsl:number level='multiple' count='isolationStep | isolationProcedureEnd | isostep | isoend'
      format='1'/>
</xsl:template>

<!-- IF we want to handle the closetxt element,
      place the support inside match-closetxt template, to make sure that
      the information is placed before the "END OF DATA MODULE" tag
      and the 8 inches of padding -->
<xsl:template match="closetxt"/>
<xsl:template name="match-closetxt">
   <!--<xsl:value-of select="../closetxt"/>-->
</xsl:template>

<!-- NV Harmonization: Named template to handle WCNs in procedural steps -->
<xsl:template name="isoProcStepWCNs">
   <xsl:if test="warning or caution or note">
      <tr style="display:none;" class="stepAnchor">
         <xsl:attribute name="anchor_id">
            <xsl:value-of select="local-name()"/>
            <xsl:value-of select="'-'"/>
            <xsl:call-template name='formatIsoStepDesignator'/>
         </xsl:attribute>
         <td colspan="3">
            <span step_anchor="1" class="stepAnchorLabel">
               <span class="getResource">proc.faultStepAnchor</span>
               <xsl:call-template name='formatIsoStepDesignator'/>
            </span>
         </td>
      </tr>
         <xsl:for-each select="warning">
            <tr><td colspan="3">
               <xsl:apply-templates select="."/>
            </td></tr>
         </xsl:for-each>
         <xsl:for-each select="caution">
            <tr><td colspan="3">
               <xsl:apply-templates select="."/>
            </td></tr>
         </xsl:for-each>
         <xsl:for-each select="note">
            <tr><td colspan="3">
               <xsl:apply-templates select="."/>
            </td></tr>
         </xsl:for-each>
   </xsl:if>
</xsl:template>

<!-- Check to see if first graphic is inline) -->
<xsl:template name="checkFor1stFigGraphInline">
   <xsl:for-each select="figure[1]/graphic[1]">
      <xsl:choose>
         <xsl:when test="@xlink:show='embed' and @xlink:href != ''">
            <xsl:text>yes</xsl:text><!-- inline graphic: return yes -->
         </xsl:when>
         <!-- not inline graphic: return no -->
         <xsl:otherwise><xsl:text>no</xsl:text></xsl:otherwise>
      </xsl:choose>
   </xsl:for-each>
</xsl:template>

<!-- Check to see if referenced graphic is inline -->
<xsl:template name="checkForRefFigGraphInline">
   <xsl:param name="ref_figId"/>
   <xsl:if test="normalize-space($ref_figId)">
      <xsl:for-each select="//figure[@id=$ref_figId]">
         <xsl:for-each select="graphic[1]">
            <xsl:choose>
               <xsl:when test="@xlink:show='embed' and @xlink:href != ''">
                  <xsl:text>yes</xsl:text><!-- inline graphic: return yes -->
               </xsl:when>
               <!-- not inline graphic: return no -->
               <xsl:otherwise><xsl:text>no</xsl:text></xsl:otherwise>
            </xsl:choose>
         </xsl:for-each>
      </xsl:for-each>
   </xsl:if>
</xsl:template>


<!-- 
<xsl:template match="warning/para">
<br/>
<div xsl:use-attribute-sets="standard">
<xsl:call-template name="formatClass01"/>
<xsl:apply-templates/>
</div>
</xsl:template>


<xsl:template match="caution/para">
<br/>
<div xsl:use-attribute-sets="standard">
<xsl:call-template name="formatClass01"/>
<xsl:apply-templates/>
</div>
</xsl:template>


<xsl:template match="note/para">
<br/>
<div xsl:use-attribute-sets="standard">
<center>
<xsl:call-template name="formatClass01"/>
<xsl:apply-templates/>
</center>
</div>
</xsl:template>
-->


<!--  *******Symbol rendering****************************  -->
<!-- covers symbols in the PNG, JPG, GIF, and TIF families -->
<!--*******************************************************-->
<xsl:param name="symbol_url"/>

<xsl:template match="symbol">
	<xsl:if test ="@DISPLAY = 'YES'">
          <span>
              <img height="54" ondrag="event.returnValue=false;">
                <xsl:attribute name="SRC"><xsl:value-of select="$symbol_url"/>/../../figures/<xsl:value-of select="@boardno|@infoEntityIdent"/>.<xsl:value-of select="@EXT"/></xsl:attribute>
              </img>
          </span>
	</xsl:if>
</xsl:template>

<!-- ************* SHARED Required Persons TABLE ************** -->

<xsl:template match="reqpers|reqPersons" priority="-2">
  <xsl:param name="mode">default</xsl:param>
  <br/>
  <div id="PERSONNEL_TABLE">
  <h3 class="minor_section"><xsl:choose>
    <xsl:when test="$mode!='default'">
      <xsl:variable name="script">javascript:
      var tbl=document.getElementById('TBL-REQPERSONS');
      var img=document.getElementById('DIV-REQPERSONS-IMG');
      var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
      var img1='aircraft/arr1.png';
      var img2='aircraft/arr2.png';
      tbl.style.display = (tbl.style.display == 'none' ? 'table':'none');
      img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
      </xsl:variable>
      <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQPERSONS-IMG"
         src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>&#160;<xsl:value-of select="$style.common.reqperson"/></a>
    </xsl:when>
    <xsl:otherwise><xsl:value-of select="$style.common.reqperson"/></xsl:otherwise>
  </xsl:choose></h3>
  <xsl:variable name="tbl-display"><xsl:choose>
    <xsl:when test="$mode!='default'">none</xsl:when>
    <xsl:otherwise>table</xsl:otherwise>
  </xsl:choose></xsl:variable>
  <table width="100%" id="TBL-REQPERSONS" style="display:{$tbl-display}">  
  <colgroup span="2">
  <col width="25%"></col>
  <col width="25%"></col>
  <col width="25%"></col>
  <col width="25%"></col>
  </colgroup>
  <thead>
  <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
  <tr>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.personnel"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.category"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.trade"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.esttime"/></td>
  </tr>
  <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
  </thead>
  <tbody>
  <xsl:for-each select="*[local-name()='person' or local-name()= 'asrequir' or local-name()= 'personnel']">
    <xsl:variable name="ordering"><xsl:value-of select="position() mod (count(../child::person)+count(../child::asrequir)+count(../child::personnel))"/></xsl:variable>
    <tr>
    <xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
    <xsl:choose><xsl:when test="position() mod 2 != 0"><xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute></xsl:when></xsl:choose>
    <td style="vertical-align:top;">
    <xsl:choose>
      <xsl:when test="local-name()='person'">
        <span><xsl:value-of select="$style.common.man"/> <xsl:value-of select="@man"/></span>
      </xsl:when>
      <xsl:otherwise>
        <span><xsl:value-of select="$style.common.asreq"/></span>
      </xsl:otherwise>
    </xsl:choose>
    </td>
    <td style="vertical-align:top;"><span><xsl:value-of select="following-sibling::perscat[$ordering]/@category|personCategory/@personCategoryCode"/></span></td>			
    <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:value-of select="following-sibling::trade[$ordering]/text()|trade/text()"/></span></td>
    <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:value-of select="following-sibling::esttime[$ordering]/text()|estimatedTime/text()"/> <xsl:value-of select="estimatedTime/@unitOfMeasure"/></span></td>
    </tr>
  </xsl:for-each>
  <tr><td valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></td></tr>
  </tbody></table>
  </div>
</xsl:template>

<xsl:template match="reqPersons[position() &gt; 1]" priority="2"/>
<xsl:template match="reqPersons[1]" priority="2">
  <xsl:param name="mode">default</xsl:param>
  <br/>
  <div id="PERSONNEL_TABLE">
  <h3 class="minor_section"><xsl:choose>
    <xsl:when test="$mode!='default'">
      <xsl:variable name="script">javascript:
      var tbl=document.getElementById('TBL-REQPERSONS');
      var img=document.getElementById('DIV-REQPERSONS-IMG');
      var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
      var img1='aircraft/arr1.png';
      var img2='aircraft/arr2.png';
      tbl.style.display = (tbl.style.display == 'none' ? 'table':'none');
      img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
      </xsl:variable>
      <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQPERSONS-IMG"
         src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>&#160;<xsl:value-of select="$style.common.reqperson"/></a>
    </xsl:when>
    <xsl:otherwise><xsl:value-of select="$style.common.reqperson"/></xsl:otherwise>
  </xsl:choose></h3>
  <xsl:variable name="tbl-display"><xsl:choose>
    <xsl:when test="$mode!='default'">none</xsl:when>
    <xsl:otherwise>table</xsl:otherwise>
  </xsl:choose></xsl:variable>
  <table width="100%" id="TBL-REQPERSONS" style="display:{$tbl-display}">  
  <colgroup span="2">
  <col width="25%"></col>
  <col width="25%"></col>
  <col width="25%"></col>
  <col width="25%"></col>
  </colgroup>
  <thead>
  <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
  <tr>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.personnel"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.category"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.trade"/></td>
  <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.common.esttime"/></td>
  </tr>
  <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
  </thead>
  <tbody>
  <xsl:for-each select="//preliminaryRqmts/reqPersons/person | //preliminaryRqmts/reqPersons/asrequir | //preliminaryRqmts/reqPersons/personnel">
    <xsl:variable name="ordering"><xsl:value-of select="position() mod (count(../child::person)+count(../child::asrequir)+count(../child::personnel))"/></xsl:variable>
    <tr>
    <xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
    <xsl:choose><xsl:when test="position() mod 2 != 0"><xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute></xsl:when></xsl:choose>
    <td style="vertical-align:top;">
    <xsl:choose>
      <xsl:when test="self::person"><span><xsl:value-of select="$style.common.man"/> <xsl:value-of select="@man"/></span></xsl:when>
      <xsl:otherwise><span><xsl:value-of select="$style.common.asreq"/></span></xsl:otherwise>
    </xsl:choose>
    </td>
    <td style="vertical-align:top;"><span><xsl:value-of select="following-sibling::perscat[$ordering]/@category|personCategory/@personCategoryCode"/></span></td>			
    <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:value-of select="following-sibling::trade[$ordering]/text()|trade/text()"/></span></td>
    <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:value-of select="following-sibling::esttime[$ordering]/text()|estimatedTime/text()"/> <xsl:value-of select="estimatedTime/@unitOfMeasure"/></span></td>
    </tr>
  </xsl:for-each>
  <tr><td valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></td></tr>
  </tbody></table>
  </div>
</xsl:template>

<xsl:template match="reqpers/trade">
	<span xsl:use-attribute-sets="standard"><xsl:apply-templates/></span>
</xsl:template>

<xsl:template match="reqpers/esttime">
<span xsl:use-attribute-sets="standard"><xsl:apply-templates/></span>
</xsl:template>

<xsl:template match="reqpers/asrequir">
  <td style="vertical-align:top;"><span><xsl:value-of select="$style.common.asreq"/></span></td>
</xsl:template> 

<xsl:template match="reqpers/person">
  <td style="vertical-align:top;"><span><xsl:value-of select="$style.common.man"/> <xsl:value-of select="@man"/></span></td>
</xsl:template> 

<xsl:template match="reqpers/perscat">
  <td style="vertical-align:top;"><span><xsl:value-of select="@category"/></span></td>
</xsl:template>

<!-- Formats the step designator of the current node using a classed span. -->
<xsl:template name='formatStepDesignator'>
	<xsl:call-template name='getproceduralStepDesignator'/>
	<xsl:call-template name='getStepDesignator'/>
</xsl:template>

<!-- REFTP Links -->
<xsl:template match="reftp|externalPubRef" priority="2">
	<span class="xref">
		<xsl:variable name="refdm"><xsl:value-of select="@xlink:href"/></xsl:variable>
		<xsl:variable name="refpm"><xsl:apply-templates select="pubcode|externalPubRefIdent/externalPubCode"/></xsl:variable>
		<!-- add the onclick attribute -->
    <xsl:attribute name="onClick">CVPortal.components.cvDocHandler.externalReference('<xsl:value-of select="normalize-space($refpm)"/>', '<xsl:value-of select="$refdm"/>');</xsl:attribute>
    <xsl:choose>
			<xsl:when test="pubtitle"><xsl:apply-templates select="pubtitle"/></xsl:when>
			<xsl:when test="externalPubRefIdent"><xsl:apply-templates select="externalPubRefIdent/externalPubTitle"/></xsl:when>
			<xsl:otherwise><xsl:apply-templates select="pubcode|externalPubRefIdent"/></xsl:otherwise>
		</xsl:choose>
	</span>
</xsl:template>

<xsl:template match="reftp/pubcode">
	<xsl:choose>
		<xsl:when test="child::pmc">PMC-<xsl:value-of select="pmc/modelic/text()"/>-<xsl:value-of select="pmc/pmissuer/text()"/>-<xsl:value-of select="pmc/pmnumber/text()"/>-<xsl:value-of select="pmc/pmvolume/text()"/></xsl:when>
		<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="externalPubRefIdent/externalPubCode">
	<xsl:choose>
		<xsl:when test=".//pmCode">PMC-<xsl:value-of select=".//pmCode/@modelIdentCode"/>-<xsl:value-of select=".//pmCode/@pmIssuer"/>-<xsl:value-of select=".//pmCode/@pmNumber"/>-<xsl:value-of select=".//@pmVolume"/></xsl:when>
		<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!-- ****************** CONTAINER DM ******************** -->

<xsl:template match="container/refs/refdm">
<div><b><xsl:value-of select="$style.common.containdm"/>:</b> <xsl:value-of select="$style.common.selectrefdm"/>:<br/>
<span class="xref" onclick="onclick_xref()" xsl:use-attribute-sets="standard">
<xsl:attribute name="xrefid"><xsl:value-of select="@REFID"/></xsl:attribute>
<xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
<xsl:attribute name="modelic"><xsl:value-of select="avee/modelic"/></xsl:attribute>
<xsl:attribute name="sdc"><xsl:value-of select="avee/sdc"/></xsl:attribute>
<xsl:attribute name="chapnum"><xsl:value-of select="avee/chapnum"/></xsl:attribute>
<xsl:attribute name="section"><xsl:value-of select="avee/section"/></xsl:attribute>
<xsl:attribute name="subsect"><xsl:value-of select="avee/subsect"/></xsl:attribute>
<xsl:attribute name="subject"><xsl:value-of select="avee/subject"/></xsl:attribute>
<xsl:attribute name="discode"><xsl:value-of select="avee/discode"/></xsl:attribute>
<xsl:attribute name="discodev"><xsl:value-of select="avee/discodev"/></xsl:attribute>
<xsl:attribute name="incode"><xsl:value-of select="avee/incode"/></xsl:attribute>
<xsl:attribute name="incodev"><xsl:value-of select="avee/incodev"/></xsl:attribute>
<xsl:attribute name="itemloc"><xsl:value-of select="avee/itemloc"/></xsl:attribute>
<xsl:attribute name="xidtype">refdm</xsl:attribute>
<xsl:if test="@target or @referredFragment">
	<xsl:attribute name="xref_target"><xsl:value-of select="@target|@referredFragment"/></xsl:attribute>
</xsl:if>
<xsl:choose>
	<xsl:when test="$app_mode != '1'">
		<xsl:attribute name="model"><xsl:value-of select="avee/modelic"/>-<xsl:value-of select="avee/sdc"/>-<xsl:apply-templates select="avee/chapnum"/>-<xsl:apply-templates select="avee/section"/><xsl:apply-templates select="avee/subsect"/>-<xsl:apply-templates select="avee/subject"/>-<xsl:apply-templates select="avee/discode"/></xsl:attribute>
		<xsl:apply-templates select="avee/chapnum"/>-<xsl:apply-templates select="avee/section"/><xsl:apply-templates select="avee/subsect"/>-<xsl:apply-templates select="avee/subject"/>-<xsl:apply-templates select="avee/discode"/> 
		<xsl:if test="dmtitle">
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates select="dmtitle"/>
		</xsl:if>
	</xsl:when>
	<xsl:otherwise>
	<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</xsl:otherwise>
</xsl:choose>
</span>
</div>
<br/>
</xsl:template>

<xsl:template match="para/p">
	<span>
		<xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
		<xsl:value-of select="."/>
	</span>
</xsl:template>

<xsl:template match="referencedApplicGroup">
</xsl:template>

<xsl:template match="//inlineapplics//displaytext">
</xsl:template>

<!-- *************************************************************** -->
<!-- 			HANDLE MULTIMEDIA OBJECTS as PDF LINKS 				 -->
<!-- *************************************************************** -->
<!--
<xsl:template match="multimedia">
	<span xsl:use-attribute-sets="standard">
	<xsl:apply-templates/>
	</span>
</xsl:template>

<xsl:template match="multimediaobject">	
	<span class="xref" xsl:use-attribute-sets="standard">
		<xsl:attribute name="onClick">var multimedia_win = window.open('/IETMBooks3/<xsl:value-of select="$book"/>/figures/<xsl:value-of select="@boardno"/>.pdf', 'MULTIMEDIA_WIN', 'toolbar=1,location=0,directories=0,scrollbars=0,status=1,menubar=0,resizable=1');</xsl:attribute>	
		<xsl:value-of select="@boardno"/>
	</span>
</xsl:template>

<xsl:template name="multimedia_ref">
	<span class="xref" xsl:use-attribute-sets="standard">
		<xsl:attribute name="onClick">var multimedia_win = window.open('/IETMBooks3/<xsl:value-of select="$book"/>/figures/<xsl:value-of select="@boardno"/>.pdf', 'MULTIMEDIA_WIN', 'toolbar=1,location=0,directories=0,scrollbars=0,status=1,menubar=0,resizable=1');</xsl:attribute>		
		<xsl:value-of select="@boardno"/>
	</span>
</xsl:template>
-->
</xsl:stylesheet>
