<?xml version="1.0" encoding="iso-8859-1"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/illustratedPartsCatalog.xsl 2.0 2019/05/23 20:31:03GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

  <!-- parts page and buttons -->
  <xsl:variable name="ipccol1h">70px</xsl:variable><!-- 6% -->
  <xsl:variable name="ipccol2h">117px</xsl:variable><!-- 10% -->
  <xsl:variable name="ipccol3h">300px</xsl:variable><!-- 30% -->
  <xsl:variable name="ipccol4h">350px</xsl:variable><!-- 30% -->
  <xsl:variable name="ipccol5h">110px</xsl:variable><!-- 10% -->
  <xsl:variable name="ipccol6h">160px</xsl:variable><!-- 14% -->
  <xsl:variable name="ipccol7h">70px</xsl:variable><!-- 14% -->

  <xsl:variable name="ipccol1d">72px</xsl:variable><!-- 6% -->
  <xsl:variable name="ipccol2d">120px</xsl:variable><!-- 10% -->
  <xsl:variable name="ipccol3d">305px</xsl:variable><!-- 30% -->
  <xsl:variable name="ipccol4d">355px</xsl:variable><!-- 30% -->
  <xsl:variable name="ipccol5d">115px</xsl:variable><!-- 10% -->
  <xsl:variable name="ipccol6d">160px</xsl:variable><!-- 14% -->
  <xsl:variable name="ipccol7d">70px</xsl:variable><!-- 14% -->
  
  <xsl:variable name="sheets" select="count(//figure/graphic)"/>
    
  <xsl:variable name="dmc">
    <xsl:variable name="dmCode" select="//dmCode[1]"/>
    <!-- <dmCode
      modelIdentCode="SPITFIRE"
      systemDiffCode="AAAA"
      systemCode="00"
      subSystemCode="0"
      subSubSystemCode="0"
      assyCode="00"
      disassyCode="00" disassyCodeVariant="A" infoCode="022" infoCodeVariant="A"
      itemLocationCode="D"
      /> -->
    <xsl:value-of select="$dmCode/@modelIdentCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@systemDiffCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@systemCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@subSystemCode"/><xsl:value-of select="$dmCode/@subSubSystemCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@assyCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@disassyCode"/><xsl:value-of select="$dmCode/@disassyCodeVariant"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@infoCode"/><xsl:value-of select="$dmCode/@infoCodeVariant"/><xsl:text>-</xsl:text>
    <xsl:value-of select="$dmCode/@itemLocationCode"/>
  </xsl:variable>
  
  <xsl:template match="illustratedPartsCatalog">
    <br/>
    <div id="PARTS_SCROLL" style="display:none">
    <table cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td valign="middle"><span><b><xsl:value-of select="$style.ipc.itemno"/>:</b></span></td>
      <td align="right" valign="bottom" class="illustratedPartsCatalog_td_first">
        <input id="itemNo" type="text" style="width:150" onkeydown="onkeydown_handler(event)"/></td>
      <td align="right" class="illustratedPartsCatalog_td">
        <img id="part_show" class="button" alt="Show Part" ondrag="event.returnValue=false;">
        <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=part_show.gif</xsl:attribute>
        <xsl:attribute name="onClick">CVPortal.components.cvDocHandler.showPartButton('item');</xsl:attribute>
        </img></td>
      <td align="right" class="illustratedPartsCatalog_td">
        <img id="part_prev" class="button" alt="Previous Part" onclick="CVPortal.components.cvDocHandler.showPartRelative(-1);" ondrag="event.returnValue=false;">
        <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=part_prev.gif</xsl:attribute>
        </img></td>
      <td align="right" class="illustratedPartsCatalog_td">
        <img id="part_next" class="button" alt="Next Part" onclick="CVPortal.components.cvDocHandler.showPartRelative(1);"  ondrag="event.returnValue=false;">
        <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=part_next.gif</xsl:attribute>
        </img></td>
    </tr>
    </table>
    </div>
    <xsl:apply-templates select="*[not(self::catalogSeqNumber)]"/>

    <div id="PARTS_LIST" class="tablecontainer">
    <table class="ipd" cellspacing="0" cellpadding="3" style="border-collapse:collapse;" xsl:use-attribute-sets="standard" width="100%">
      <thead class="fixedheader"><tr id="PARTS_HEADER" class="parts_header">
        <th width="{$ipccol1h}" class="parts_header fig">Fig.</th>
        <th width="{$ipccol2h}" class="parts_header item">Item</th>
        <th width="{$ipccol3h}" class="parts_header pnr">Part no./<br/>NSN</th>
        <th width="{$ipccol4h}" class="parts_header desc">Description<br/>123456</th>
        <!-- <th width="{$ipccol5h}" class="parts_header upa">Unit<br/>per<br/>assy</th> -->
        <th width="{$ipccol5h}" class="parts_header upa">Unit /<br/>assy</th><!-- LAM: 2020-09-03 -->
        <th width="{$ipccol6h}" class="parts_header mod">Model</th>
        <!-- SHOPPING CART 
        <th width="{$ipccol7h}" class="parts_header cart"><input id="orderbtn" class="orderbtn" type="submit" value="Order"
          onclick="CVPortal.components.cvDocHandler.OrderParts();"></input></th>
        -->
        <th width="{$ipccol7h}" class="parts_header cart">&#0160;</th>
        <!-- END -->
      </tr></thead>

      <!-- explicitly create the table rows for each item
        ** allows us to control the columns based on our variables
        ** allows us to order the columns as we please -->
      <tbody id="parts-list-body"><xsl:apply-templates select="catalogSeqNumber"/></tbody>
    </table></div>
  </xsl:template>

  <!-- <tr>
    <td colspan="15">
      <b><xsl:value-of select="@catalogSeqNumberValue"/><xsl:value-of select="@systemCode"/><xsl:value-of select="@subSystemCode"/><xsl:value-of select="@subSubSystemCode"/><xsl:value-of select="@assyCode"/><xsl:value-of select="@figureNumber"/><xsl:value-of select="@figureNumberVariant"/><xsl:value-of select="@item"/><xsl:value-of select="@itemVariant"/></b>
    </td>
  </tr> -->
  <xsl:template match="catalogSeqNumber | catalogSeqNumber[@reasonForUpdateRefIds]" priority="2">
  <xsl:apply-templates select="itemSequenceNumber | itemSeqNumber"/>
  </xsl:template>

  <xsl:template match="catalogSeqNumber/itemSequenceNumber|catalogSeqNumber/itemSeqNumber">

    <xsl:param name="isfirst" select="position()=1"/>
    <xsl:param name="islast" select="position()=last()"/>
    <xsl:variable name="figure"><xsl:if test="applicabilitySegment/usableOnCodeEquip">1</xsl:if></xsl:variable>
    <xsl:variable name="reasonForSelection"><xsl:if test="reasonForSelection">1</xsl:if></xsl:variable>
    <xsl:variable name="quantityPerNextHigherAssy"><xsl:if test="quantityPerNextHigherAssy">1</xsl:if></xsl:variable>
    <xsl:variable name="manufacturerCode"><xsl:if test="manufacturerCode or partRef/@manufacturerCodeValue">1</xsl:if></xsl:variable>
    <xsl:variable name="partNumber"><xsl:if test="partNumber or partRef/@partNumberValue">1</xsl:if></xsl:variable>
    <xsl:variable name="descrForPart"><xsl:if test="partIdentSegment/descrForPart or partSegment/itemIdentData/descrForPart">1</xsl:if></xsl:variable>
    <xsl:variable name="usableOnCodeEquip"><xsl:if test="applicabilitySegment/usableOnCodeEquip">1</xsl:if></xsl:variable>
    <xsl:variable name="service"><xsl:if test="locationRcmdSegment/locationRcmd/service/text()">1</xsl:if></xsl:variable>
    <xsl:variable name="sourceMaintRecoverability"><xsl:if test="locationRcmdSegment/locationRcmd/sourceMaintRecoverability">1</xsl:if></xsl:variable>
    <xsl:variable name="modelVersion"><xsl:if test="locationRcmdSegment/locationRcmd/modelVersion">1</xsl:if></xsl:variable>
    <xsl:variable name="itemvalue">1</xsl:variable>

    <xsl:variable name="parts_cell">
      <xsl:text>parts_cell </xsl:text>
      <xsl:choose>
        <xsl:when test="not($islast)">interim</xsl:when>
      </xsl:choose>
    </xsl:variable>

    <tr xsl:use-attribute-sets="standard" onmouseover="this.style.backgroundColor='#CCCCCC'" onmouseout="this.style.backgroundColor='white'">
      <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
      <xsl:attribute name="class"><xsl:call-template name="set-change-class-name">
        <xsl:with-param name="src" select=".."/>
      </xsl:call-template></xsl:attribute>
      <xsl:choose>
        <xsl:when test="$app_mode != '1'">
        <xsl:variable name="item_value"><xsl:call-template name="remove-leading-zeros">
          <xsl:with-param name="string" select="@itemSeqNumberValue"/>
        </xsl:call-template></xsl:variable>
        <xsl:attribute name="item"><xsl:value-of select="@itemSeqNumberValue"/></xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="item"><xsl:value-of select="@itemSeqNumberValue"/></xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      
      <xsl:variable name="isicnvar" select="./preceding-sibling::itemSeqNumber"/>

      <!-- also include the CSN REF -->
      <xsl:variable name="csnid">
        <xsl:value-of select="../@catalogSeqNumberValue"/>
        <xsl:value-of select="../@systemCode"/>
        <xsl:value-of select="../@subSystemCode"/>
        <xsl:value-of select="../@subSubSystemCode"/>
        <xsl:value-of select="../@assyCode"/>
        <xsl:value-of select="../@figureNumber"/><xsl:value-of select="../@figureNumberVariant"/>
        <xsl:value-of select="../@item"/><xsl:value-of select="../@itemVariant"/>
      </xsl:variable>
      <xsl:if test="not($isicnvar)"><!-- Put this on the first row so we don't confuse the placement of the pointing arrow -->
        <xsl:attribute name="csn"><xsl:value-of select="../@catalogSeqNumberValue"/><xsl:value-of select="../@systemCode"/><xsl:value-of select="../@subSystemCode"/><xsl:value-of select="../@subSubSystemCode"/><xsl:value-of select="../@assyCode"/><xsl:value-of select="../@figureNumber"/><xsl:value-of select="../@figureNumberVariant"/><xsl:value-of select="../@item"/><xsl:value-of select="../@itemVariant"/></xsl:attribute>
        <!--Add an ID so we can attached CSNREFs from procedural DMs
        <catalogSeqNumber EID="103" LASTEID="135" systemCode="29" subSystemCode="0" subSubSystemCode="0" assyCode="01" id="csn-0002" item="001" figureNumber="01" indenture="2">
        See also 
        -->
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/></xsl:attribute>
      </xsl:if>

      <!--
      <catalogSeqNumber systemCode="29" subSystemCode="0" subSubSystemCode="0" assyCode="01" id="csn-0040" item="020" figureNumber="02" indenture="3">
        <internalRef .../>
        <itemSeqNumber itemSeqNumberValue="00A">
          <quantityPerNextHigherAssy>1</quantityPerNextHigherAssy>
          <partRef partNumberValue="INS.STD207.D30" manufacturerCodeValue="....."/>
          <partSegment><itemIdentData><descrForPart>HOSE</descrForPart></itemIdentData><techData/></partSegment>
          <partLocationSegment/>
          <applicabilitySegment/>
          <locationRcmdSegment><locationRcmd>
            <service/>
            <sourceMaintRecoverability/>
            <modelVersion modelVersionValue="IX"/><modelVersion modelVersionValue="XVI"/>
          </locationRcmd></locationRcmdSegment>
        </itemSeqNumber>
      </catalogSeqNumber>      
      -->
      <!-- <xsl:variable name="itemvar"><xsl:value-of select="../@item"/><xsl:if test="count(../itemSeqNumber) &gt; 1"><xsl:call-template name="remove-leading-zeros">
        <xsl:with-param name="string" select="@itemSeqNumberValue"/>
      </xsl:call-template></xsl:if></xsl:variable> -->
      <xsl:variable name="itemvar" select="../@item"/>
      
      <td width="{$ipccol1d}" class="{$parts_cell} fig">
      <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-1</xsl:text></xsl:attribute><!--Review comment-->
      <xsl:choose>
        <xsl:when test=".//notIllustrated/text()"><xsl:value-of select=".//notIllustrated[1]/text()"/></xsl:when>
        <xsl:when test=".//notIllustrated">-</xsl:when>
        <xsl:otherwise><xsl:text>&#160;</xsl:text></xsl:otherwise>
      </xsl:choose></td>
      <td width="{$ipccol2d}" class="{$parts_cell} item">
      <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-2</xsl:text></xsl:attribute><!--Review comment-->
      <xsl:choose>
        <xsl:when test="$app_mode != '1'"><!-- default = 1-->
          <xsl:choose>
            <xsl:when test="@itemSeqNumberValue">
              <span class="xref" onclick="ipb_hotspot_click()"><xsl:value-of select="@itemSeqNumberValue"/></span>
            </xsl:when>	
            <xsl:otherwise>--</xsl:otherwise>
          </xsl:choose>	
        </xsl:when>
        <xsl:when test="../internalRef"><xsl:apply-templates select="../internalRef">
          <xsl:with-param name="itemvar" select="$itemvar"/>
          <xsl:with-param name="sheets" select="$sheets"/>
        </xsl:apply-templates></xsl:when>
        <xsl:when test="not(../internalRef)"><xsl:value-of select="$itemvar"/></xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="show-figure"/>
        </xsl:otherwise>	
      </xsl:choose></td>

      <xsl:variable name="partNo" select=".//partNumber/text() | .//partRef/@partNumberValue"/>
      <xsl:variable name="mfc" select=".//partRef/@manufacturerCodeValue"/>
      <xsl:variable name="nsn" select=".//natoStockNumber"/>
      <xsl:variable name="nsnstr"><xsl:if test="$nsn"><xsl:choose>
        <xsl:when test="$nsn/@natoCodificationBureau">
          <xsl:value-of select="$nsn/@natoSupplyClass"/><xsl:text>-</xsl:text>
          <xsl:value-of select="$nsn/@natoCodificationBureau"/><xsl:text>-</xsl:text>
          <xsl:value-of select="substring($nsn/@natoItemIdentNumberCore,1,3)"/><xsl:text>-</xsl:text>
          <xsl:value-of select="substring($nsn/@natoItemIdentNumberCore,4)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:variable name="str" select="$nsn//text()"/>
          <xsl:value-of select="substring($str,1,4)"/><xsl:text>-</xsl:text>
          <xsl:value-of select="substring($str,5,6)"/><xsl:text>-</xsl:text>
          <xsl:value-of select="substring($str,7,9)"/><xsl:text>-</xsl:text>
          <xsl:value-of select="substring($str,10)"/>
        </xsl:otherwise>
      </xsl:choose></xsl:if></xsl:variable>
      <!-- <natoStockNumber natoCodificationBureau="99" natoItemIdentNumberCore="8011886" natoSupplyClass="4730">
      <natoStockNumber>7920-99-257-1342</natoStockNumber>-->
      <td width="{$ipccol3d}" class="{$parts_cell} pnr" partNumber="1">
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-3</xsl:text></xsl:attribute><!--Review comment-->
        <xsl:text>&#160;</xsl:text>
        <xsl:call-template name="security_portion_mark"/>
        <xsl:value-of select="$partNo" />
        <xsl:if test="$nsnstr!=''"><br/><xsl:text>&#160;NSN: </xsl:text><xsl:value-of select="$nsnstr"/></xsl:if>
      </td>

      <xsl:variable name="dsc" select=".//descrForPart"/>
      <td width="{$ipccol4d}" class="{$parts_cell} desc" xsl:use-attribute-sets="standard" nomen="1">
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-4</xsl:text></xsl:attribute><!--Review comment-->
        <xsl:variable name="indentureclass">
          <xsl:variable name="ind"><xsl:choose>
            <xsl:when test="./parent::csn/@ind"><xsl:value-of select="./parent::csn/@ind"/></xsl:when>
            <xsl:when test="./parent::catalogSeqNumber/@indenture"><xsl:value-of select="./parent::catalogSeqNumber/@indenture"/></xsl:when>
            <xsl:otherwise>1</xsl:otherwise>
          </xsl:choose></xsl:variable>
          <xsl:variable name="hasasp"><xsl:choose>
            <xsl:when test="self::isn"><xsl:choose>
              <xsl:when test="boolean(./asp)">1</xsl:when>
              <xsl:otherwise>0</xsl:otherwise>
            </xsl:choose></xsl:when>
            <xsl:when test="self::itemSequenceNumber or self::itemSeqNumber"><xsl:choose>
              <xsl:when test="boolean(.//attachStoreShipPart)">1</xsl:when>
              <xsl:otherwise>0</xsl:otherwise>
            </xsl:choose></xsl:when>
            <xsl:otherwise>0</xsl:otherwise>
          </xsl:choose></xsl:variable>
          <xsl:choose>
            <xsl:when test="($ind='2' and $hasasp='1')">ind02asp</xsl:when>
            <xsl:when test="($ind='2' and $hasasp='0')">ind02noasp</xsl:when>
            <xsl:when test="($ind='3' and $hasasp='1')">ind03asp</xsl:when>
            <xsl:when test="($ind='3' and $hasasp='0')">ind03noasp</xsl:when>
            <xsl:when test="($ind='4' and $hasasp='1')">ind04asp</xsl:when>
            <xsl:when test="($ind='4' and $hasasp='0')">ind04noasp</xsl:when>
            <xsl:when test="($ind='5' and $hasasp='1')">ind05asp</xsl:when>
            <xsl:when test="($ind='5' and $hasasp='0')">ind05noasp</xsl:when>
            <xsl:when test="($ind='6' and $hasasp='1')">ind06asp</xsl:when>
            <xsl:when test="($ind='6' and $hasasp='0')">ind06noasp</xsl:when>
            <xsl:otherwise>ind01</xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <xsl:call-template name="security_portion_mark"/>
        <div class="{$indentureclass}">
          <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-4A</xsl:text></xsl:attribute><!--Review comment-->
          <xsl:apply-templates select=".//descrForPart | .//descrForLocation | .//categoryOneContainerLocation | .//referTo | .//partRefGroup | .//restrictedOperationNote">
            <xsl:with-param name="csnid" select="$csnid"/>
          </xsl:apply-templates></div>
      </td>

      <td width="{$ipccol5d}" class="{$parts_cell} upa" xsl:use-attribute-sets="standard">
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-5</xsl:text></xsl:attribute><!--Review comment-->
        <xsl:text>&#160;</xsl:text><xsl:call-template name="security_portion_mark"/><xsl:apply-templates select="quantityPerNextHigherAssy"/>
      </td>
      
      <td width="{$ipccol6d}" class="{$parts_cell} mod" xsl:use-attribute-sets="standard">
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-6</xsl:text></xsl:attribute><!--Review comment-->
        <xsl:text>&#160;</xsl:text>
        <xsl:variable name="mod" select=".//modelVersion"/>
        <xsl:for-each select="$mod">
          <xsl:apply-templates select="."/>
          <xsl:choose>
            <xsl:when test="count($mod)=1"></xsl:when>
            <xsl:when test="position()=last()"></xsl:when>
            <xsl:otherwise><xsl:text>, </xsl:text></xsl:otherwise>
          </xsl:choose>
        </xsl:for-each>
      </td>

      <td width="{$ipccol7d}" class="{$parts_cell} cart" xsl:use-attribute-sets="standard"><!--Shopping cart-->
        <xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-7</xsl:text></xsl:attribute><!--Review comment-->
        <xsl:text>&#160;</xsl:text>
        <xsl:variable name="units" select=".//quantityPerNextHigherAssy"/>
        <xsl:variable name="units2"><xsl:choose>
          <xsl:when test="$units='REF'">-1</xsl:when>
          <xsl:when test="$units='AR'">1</xsl:when>
          <xsl:otherwise><xsl:value-of select="$units"/></xsl:otherwise>
        </xsl:choose></xsl:variable>
        <xsl:variable name="partid">part-<xsl:value-of select="$dmc"/>-<xsl:value-of select="$csnid"/><xsl:value-of select="@itemSeqNumberValue"/></xsl:variable>
        <xsl:if test="($units2) &gt; 0">
          <xsl:text>&#160;</xsl:text>
          <span class="cart">
          <a href="#">
            <xsl:attribute name="onClick">javascript:
              CVPortal.components.cvDocHandler.inputToggle('<xsl:value-of select="$partid"/>', '<xsl:value-of select="$partNo"/>', '<xsl:value-of select="$nsnstr"/>',
                                                           '<xsl:value-of select="$mfc"/>', '<xsl:value-of select="$dsc"/>', '<xsl:value-of select="$dmc"/>');
            </xsl:attribute>
          <img ondrag="event.returnValue=false;"
               src="{$app_name}?target=resource&amp;action=image&amp;file_name=aircraft/plus.gif"/></a>
          <xsl:text>&#0160;</xsl:text>
          <input class="cart" type="text" id="{$partid}" style="display:none">
            <xsl:attribute name="value"><xsl:value-of select="$units"/></xsl:attribute>
            <script>var txt = document.getElementById("<xsl:value-of select="$partid"/>");
            // See if this is already selected from previpous page visit;
            var selectedQty = CVPortal.components.cvDocHandler.isPartSelected("<xsl:value-of select="$partid"/>");
            if (selectedQty > -1) {
              txt.style.display = '';
              txt.value = selectedQty;
              txt.style.backgroundColor='#dee7f7';
            }
            txt.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
              event.preventDefault();
              var newval = event.target.value;
              if (('' + parseInt(newval)) === 'NaN') {
                alert('Must be a number!');
                return;
              }
              event.target.style.backgroundColor='#dee7f7';
              CVPortal.components.cvDocHandler.buyPart('<xsl:value-of select="$partNo"/>', '<xsl:value-of select="$nsnstr"/>', '<xsl:value-of select="$mfc"/>',
                                                       '<xsl:value-of select="$dsc"/>', newval, '<xsl:value-of select="$dmc"/>', '<xsl:value-of select="$partid"/>');
            }
            });</script>
          </input></span>
        </xsl:if>
      </td> 

    </tr>
  </xsl:template>


  <xsl:template match="itemSequenceNumber/reasonForSelection | itemSeqNumber/reasonForSelection">
    <td class="parts_cell" xsl:use-attribute-sets="standard">&#160;<xsl:value-of select="@reasonForSelectionValue"/></td>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/quantityPerNextHigherAssy | itemSeqNumber/quantityPerNextHigherAssy" >
    <xsl:param name="csnid"/>
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/manufacturerCode">
    <td class="parts_cell" xsl:use-attribute-sets="standard" manufacturerCode="1">&#160; <xsl:call-template name="security_portion_mark"/><xsl:apply-templates></xsl:apply-templates></td>
  </xsl:template>

  <xsl:template match="itemSeqNumber/partRef/@manufacturerCodeValue">
    <td class="parts_cell" xsl:use-attribute-sets="standard" manufacturerCode="1">&#160; <xsl:call-template name="security_portion_mark"/><xsl:value-of select="."/></td>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partNumber">
    <xsl:choose>
      <xsl:when test="@id"><xsl:variable name = "partNo"><xsl:value-of select="text()"/></xsl:variable>
        <td class="parts_cell" partNumber="1">&#160;
        <span xsl:use-attribute-sets="standard" onclick="onclick_xref(event)" class="xref" xidtype="hotspot">
        <xsl:attribute name="xrefid"><xsl:value-of select="$partNo" /></xsl:attribute>
        <xsl:call-template name="security_portion_mark"/>
        <xsl:value-of select="$partNo" /></span></td>
      </xsl:when>
      <xsl:otherwise>
        <td class="parts_cell" xsl:use-attribute-sets="standard" partNumber="1">&#160; <xsl:call-template name="security_portion_mark"/>
        <xsl:apply-templates></xsl:apply-templates></td>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="itemSeqNumber/partRef/@partNumberValue">
    <xsl:choose>
      <xsl:when test="../@id">
        <xsl:variable name = "partNo"><xsl:value-of select="."/></xsl:variable>
        <td class="parts_cell" partNumber="1">&#160;
        <span xsl:use-attribute-sets="standard" onclick="onclick_xref(event)" class="xref" xidtype="hotspot">
        <xsl:attribute name="xrefid"><xsl:value-of select="$partNo" /></xsl:attribute>
        <!--xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
        <xsl:attribute name="xidtype">hotspot</xsl:attribute -->
         <xsl:call-template name="security_portion_mark"/>
        <xsl:value-of select="$partNo" /></span></td> 
      </xsl:when>
      <xsl:otherwise>
        <td class="parts_cell" xsl:use-attribute-sets="standard" partNumber="1">&#160;<xsl:value-of select="."/></td>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partIdentSegment/descrForPart | itemSeqNumber/partSegment/itemIdentData/descrForPart">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span><br/>
  </xsl:template>

  <xsl:template match="descrForLocation">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span><br/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/applicabilitySegment/usableOnCodeEquip | itemSeqNumber/applicabilitySegment/usableOnCodeEquip">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/service | itemSeqNumber/locationRcmdSegment/locationRcmd/service">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/sourceMaintRecoverability | itemSeqNumber/locationRcmdSegment/locationRcmd/sourceMaintRecoverability">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/modelVersion | itemSeqNumber/locationRcmdSegment/locationRcmd/modelVersion">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-modelVersion</xsl:text></xsl:attribute><!--Review comment-->
    <xsl:value-of select="@modelVersionValue"/></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partIdentSegment/unitOfIssue | itemSeqNumber/partSegment/techData/unitOfIssue">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partIdentSegment/specialStorage | itemSeqNumber/partSegment/techData/specialStorage">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/circuitBreakerRef | itemSeqNumber/circuitBreakerRef">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partIdentSegment/physicalSecurityPilferageCode | itemSeqNumber/partSegment/techData/physicalSecurityPilferageCode">
    <xsl:param name="csnid"/>
    <span class="{name()}"><xsl:attribute name="id"><xsl:value-of select="$csnid"/><xsl:text>-</xsl:text><xsl:value-of select="name(.)"/></xsl:attribute><!--Review comment-->
    <xsl:apply-templates><xsl:with-param name="csnid" select="$csnid"/></xsl:apply-templates></span>
  </xsl:template>

  <xsl:template name="show-figure">
    <xsl:variable name="csnvalue">
      <xsl:value-of select="../@catalogSeqNumberValue"/>
      <xsl:value-of select="../@systemCode"/><xsl:value-of select="../@subSystemCode"/><xsl:value-of select="../@subSubSystemCode"/><xsl:value-of select="../@assyCode"/>
      <xsl:value-of select="../@figureNumber"/><xsl:value-of select="../@figureNumberVariant"/><xsl:value-of select="../@item"/><xsl:value-of select="../@itemVariant"/>
    </xsl:variable>
    <xsl:variable name="csnSysCode"><xsl:value-of select="../@systemCode"/></xsl:variable>
    <xsl:variable name="csnSubSystemCode"><xsl:value-of select="../@subSystemCode"/></xsl:variable>
    <xsl:variable name="csnSubSubSystemCode"><xsl:value-of select="../@subSubSystemCode"/></xsl:variable>
    <xsl:variable name="csnAssyCode"><xsl:value-of select="../@assyCode"/></xsl:variable>
    <xsl:variable name="csnFigureNumber"><xsl:value-of select="../@figureNumber"/></xsl:variable>
    <xsl:variable name="csnFigureNumberVariant"><xsl:value-of select="../@figureNumberVariant"/><xsl:value-of select="@item"/><xsl:value-of select="@itemVariant"/></xsl:variable>
    <xsl:variable name="csnItem"><xsl:value-of select="../@item"/></xsl:variable>
    <xsl:variable name="csnItemVariant"><xsl:value-of select="../@itemVariant"/></xsl:variable>

    <xsl:choose>
      <xsl:when test="./itemSequenceNumber/partLocationSegment/attachStoreShipPart[@attachStoreShipPartCode='1'] or
                      ./itemSeqNumber/partLocationSegment/attachStoreShipPart[@attachStoreShipPartCode='1']">*</xsl:when>
      <xsl:otherwise>&#160;&#160;</xsl:otherwise>
    </xsl:choose>

    <xsl:choose>
      <!-- cust start -->
      <xsl:when test="//catalogSeqNumberRef[@systemCode = $csnSysCode]
                                           [@subSystemCode = $csnSubSystemCode]
                                           [@subSubSystemCode = $csnSubSubSystemCode]
                                           [@assyCode = $csnAssyCode]
                                           [@figureNumber = $csnFigureNumber]
                                           [@figureNumberVariant = $csnFigureNumberVariant] and 
                      ((//catalogSeqNumberRef[@item = $csnItem] and //catalogSeqNumberRef[@itemVariant = $csnItemVariant]) or //catalogSeqNumberRef[@item = $csnItem])">
        <!-- xsl:when test="//csnref[@refcsn = '@csn']" -->
        <span class="xref" xidtype="hotspot" onclick="onclick_xref(event)" xrefid="{$csnvalue}"><xsl:choose>
          <xsl:when test="../@item"><xsl:value-of select="../@item"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="@itemSeqNumberValue"/></xsl:otherwise>
        </xsl:choose></span>
      </xsl:when>
      <xsl:when test="//catalogSeqNumberRef[@catalogSeqNumberValue = $csnvalue]">
        <!-- xsl:when test="//csnref[@refcsn = '@csn']" -->
        <span class="xref" xidtype="hotspot" onclick="onclick_xref(event)" xrefid="{$csnvalue}"><xsl:choose>
          <xsl:when test="../@item"><xsl:value-of select="../@item"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="@itemSeqNumberValue"/></xsl:otherwise>
        </xsl:choose></span>
      </xsl:when>
      <xsl:otherwise>
        <!--<span style="color:red"><xsl:value-of select="substring(../@catalogSeqNumberValue,11,3)"/></span><br/>-->
        <xsl:choose>
          <xsl:when test="../@item"><xsl:value-of select="../@item"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="@itemSeqNumberValue"/></xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
