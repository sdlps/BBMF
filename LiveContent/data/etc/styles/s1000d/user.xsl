<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/user.xsl 2.0 2019/05/23 20:31:06GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:template match="supplies|reqSupplies" priority="101">
  <xsl:param name="mode">default</xsl:param>
  <br/>
  <xsl:choose>
    <xsl:when test="(nosupply|noSupplies) and $mode!='default'">
      <div xsl:use-attribute-sets="standard">
        <h3 class="minor_section"><xsl:choose>
          <xsl:when test="$mode!='default'">
            <xsl:variable name="script">javascript:
            var tbl=document.getElementById('DIV-REQSUPPLIES');
            var img=document.getElementById('DIV-REQSUPPLIES-IMG');
            var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
            var img1='aircraft/arr1.png';
            var img2='aircraft/arr2.png';
            tbl.style.display = (tbl.style.display == 'none' ? 'block':'none');
            img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
            </xsl:variable>
            <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQSUPPLIES-IMG"
              src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
            <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.matreq.supplies"/></a>
          </xsl:when>
          <xsl:otherwise><xsl:value-of select="$style.matreq.supplies"/></xsl:otherwise>
        </xsl:choose></h3>
        <div id="DIV-REQSUPPLIES" style="display:none"><hr size="1" noshade="noshade" color="black"/><xsl:value-of select="$style.general.none"/></div>
      </div>
    </xsl:when>
    <xsl:when test="nosupply|noSupplies">
      <div xsl:use-attribute-sets="standard">
      <h3 class="minor_section"><xsl:value-of select="$style.matreq.supplies"/></h3>
      <hr size="1" noshade="noshade" color="black"/><xsl:value-of select="$style.general.none"/>
      </div>
    </xsl:when>

    <xsl:otherwise>
      <div xsl:use-attribute-sets="standard">
      <h3 class="minor_section"><xsl:choose>
        <xsl:when test="$mode!='default'">
          <xsl:variable name="script">javascript:
          var tbl=document.getElementById('TBL-REQSUPPLIES');
          var img=document.getElementById('DIV-REQSUPPLIES-IMG');
          var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
          var img1='aircraft/arr1.png';
          var img2='aircraft/arr2.png';
          tbl.style.display = (tbl.style.display == 'none' ? 'table':'none');
          img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
          </xsl:variable>
          <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQSUPPLIES-IMG"
              src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
            <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.matreq.supplies"/></a>
        </xsl:when>
        <xsl:otherwise><xsl:value-of select="$style.matreq.supplies"/></xsl:otherwise>
      </xsl:choose></h3>
      <xsl:variable name="tbl-display"><xsl:choose>
        <xsl:when test="$mode!='default'">none</xsl:when>
        <xsl:otherwise>table</xsl:otherwise>
      </xsl:choose></xsl:variable>
      <table width="100%" id="TBL-REQSUPPLIES" style="display:{$tbl-display}">  
      <colgroup span="2">
      <col width="45%"></col>
      <col width="45%"></col>
      <col width="10%"></col>
      </colgroup>
      <thead>
      <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
      <tr>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.name"/></td>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.identification"/></td>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.quantity"/></td>
      </tr>
      <tr><th valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></th></tr>
      </thead>
      <tbody>
      <xsl:for-each select=".//supply | .//supplyDescr">
        <tr>
          <xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
          <xsl:choose><xsl:when test="position() mod 2 != 0"><xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute></xsl:when></xsl:choose>
          <xsl:apply-templates select="."/>
        </tr>
      </xsl:for-each>
      <tr><td valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></td></tr>
      </tbody></table></div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="spares | reqSpares" priority="101">
  <xsl:param name="mode">default</xsl:param>
  <br/>
  <xsl:choose>
    <xsl:when test="(nospares|noSpares) and $mode!='default'">
      <div xsl:use-attribute-sets="standard">
        <h3 class="minor_section">
        <xsl:variable name="script">javascript:
        var tbl=document.getElementById('DIV-REQSPARES');
        var img=document.getElementById('DIV-REQSPARES-IMG');
        var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
        var img1='aircraft/arr1.png';
        var img2='aircraft/arr2.png';
        tbl.style.display = (tbl.style.display == 'none' ? 'block':'none');
        img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
        </xsl:variable>
        <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQSPARES-IMG"
           src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
        <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.matreq.spares"/></a></h3>
        <div id="DIV-REQSPARES" style="display:none"><hr size="1" noshade="noshade" color="black"/><xsl:value-of select="$style.general.none"/></div>
      </div>
    </xsl:when>
    <xsl:when test="nospares|noSpares">
      <div xsl:use-attribute-sets="standard">
        <h3 class="minor_section"><xsl:value-of select="$style.matreq.spares"/></h3>
        <hr size="1" noshade="noshade" color="black"/><xsl:value-of select="$style.general.none"/>
      </div>
    </xsl:when>
    <xsl:otherwise>
      <div>
      <h3 class="minor_section"><xsl:choose>
        <xsl:when test="$mode!='default'">
          <xsl:variable name="script">javascript:
          var tbl=document.getElementById('TBL-REQSPARES');
          var img=document.getElementById('DIV-REQSPARES-IMG');
          var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
          var img1='aircraft/arr1.png';
          var img2='aircraft/arr2.png';
          tbl.style.display = (tbl.style.display == 'none' ? 'table':'none');
          img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
          </xsl:variable>
          <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-REQSPARES-IMG"
              src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
            <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.matreq.spares"/></a>
        </xsl:when>
        <xsl:otherwise><xsl:value-of select="$style.matreq.spares"/></xsl:otherwise>
      </xsl:choose></h3>
      <xsl:variable name="tbl-display"><xsl:choose>
        <xsl:when test="$mode!='default'">none</xsl:when>
        <xsl:otherwise>table</xsl:otherwise>
      </xsl:choose></xsl:variable>
      <table width="100%" id="TBL-REQSPARES" style="display:{$tbl-display}">  
      <colgroup span="2"><col width="45%"></col><col width="45%"></col><col width="10%"></col></colgroup>
      <thead>
      <tr><th valign="top" colspan="5"><hr size="1" noshade="noshade" color="black"/></th></tr>
      <tr>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.description"/></td>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.identification"/></td>
      <td class="label" xsl:use-attribute-sets="standard"><xsl:value-of select="$style.general.quantity"/></td>
      </tr>
      <tr><th valign="top" colspan="5"><hr size="1" noshade="noshade" color="black"/></th></tr>
      </thead><tbody>
      <xsl:for-each select=".//spare | .//spareDescr | .//embeddedSpareDescr">
        <tr>
          <xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
          <xsl:choose>
            <xsl:when test="position() mod 2 != 0">
              <xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:apply-templates select="."/>
        </tr>
      </xsl:for-each>
      <tr><td valign="top" colspan="5"><hr size="1" noshade="noshade" color="black"/></td></tr>
      </tbody></table>
      </div>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="spare|spareDescr|embeddedSpareDescr" priority="101">
  <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:apply-templates select="nomen|name"/></span></td>
  <td style="vertical-align:top;"><xsl:apply-templates select="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" mode="matreq"/></td>
  <td style="vertical-align:top;"><xsl:apply-templates select="qty|reqQuantity"/></td>
</xsl:template>

<xsl:template match="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" mode="matreq" priority="101">
  <xsl:for-each select="*">
    <xsl:if test="(preceding-sibling::csnref and string-length(preceding-sibling::csnref) != 0 or preceding-sibling::mfc and string-length(preceding-sibling::mfc) != 0 or preceding-sibling::nsn and string-length(preceding-sibling::nsn) != 0 or preceding-sibling::pnr and string-length(preceding-sibling::pnr) != 0 or preceding-sibling::partAndSerialNumber and string-length(preceding-sibling::partAndSerialNumber) != 0 or preceding-sibling::manufacturerCode and string-length(preceding-sibling::manufacturerCode) != 0) and (ancestor::preliminaryRqmts or ancestor::prelreqs) and string-length(.) != 0"> / </xsl:if>
    <xsl:apply-templates select="."/>
  </xsl:for-each>
</xsl:template>
<xsl:template match="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" mode="matreq" priority="101">
  <xsl:for-each select="*">
    <xsl:if test="preceding-sibling::csnref or preceding-sibling::mfc or preceding-sibling::nsn or preceding-sibling::pnr"> / </xsl:if>
    <xsl:apply-templates select="."/>
  </xsl:for-each>
</xsl:template>
<xsl:template match="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" mode="matreq" priority="102">
  <span><xsl:apply-templates/></span><br/>
</xsl:template>

<!--
<catalogSeqNumberRef EID="213" LASTEID="221" systemCode="29" subSystemCode="0" subSubSystemCode="0" assyCode="01" item="001" figureNumber="01">
<refs EID="214" LASTEID="221">
<dmRef DOCTYPE="illustratedPartsCatalog" EID="215" LASTEID="221" REFID="333">
<dmRefIdent EID="216" LASTEID="217">
<dmCode EID="217" systemDiffCode="AAAA" systemCode="29" subSystemCode="0" subSubSystemCode="0" modelIdentCode="SPITFIRE" itemLocationCode="A" infoCodeVariant="A" infoCode="941" disassyCodeVariant="AA" disassyCode="03" assyCode="01"/>
</dmRefIdent>
<dmRefAddressItems EID="218" LASTEID="221">
<dmTitle EID="219" LASTEID="221">...</dmTitle>
</dmRefAddressItems>
</dmRef>
</refs>
</catalogSeqNumberRef>
-->
<xsl:template match="catalogSeqNumberRef[./refs/dmRef]" mode="matreq" priority="103">
  <xsl:apply-templates select="./refs/dmRef" mode="matreq">
    <xsl:with-param name="csnref" select="."/>
  </xsl:apply-templates>
</xsl:template>
<xsl:template match="catalogSeqNumberRef/refs/dmRef" mode="matreq" priority="101">
  <xsl:param name="csnref" select="../../catalogSeqNumberRef[1]"/>
  <span class="xref" onclick="onclick_xref(event)" xsl:use-attribute-sets="standard">
    <xsl:attribute name="xidtype">XREF</xsl:attribute>
    <xsl:attribute name="spec_version">4</xsl:attribute>
    <xsl:attribute name="xrefid"><xsl:value-of select="@REFID"/></xsl:attribute>
    <xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
    <xsl:attribute name="TARGETDOCTYPE">illustratedPartsCatalog</xsl:attribute>
    <xsl:copy-of select="dmRefIdent/dmCode/@modelIdentCode | dmRefIdent/dmCode/@systemDiffCode | 
                         dmRefIdent/dmCode/@systemCode | dmRefIdent/dmCode/@subSystemCode | dmRefIdent/dmCode/@subSubSystemCode | dmRefIdent/dmCode/@assyCode | 
                         dmRefIdent/dmCode/@disassyCode | dmRefIdent/dmCode/@disassyCodeVariant | 
                         dmRefIdent/dmCode/@infoCode | dmRefIdent/dmCode/@infoCodeVariant | dmRefIdent/dmCode/@itemLocationCode"/>
    <xsl:attribute name="xref_target">
      <!--catalogSeqNumberRef EID="213" LASTEID="221" systemCode="29" subSystemCode="0" subSubSystemCode="0" assyCode="01" item="001" figureNumber="01"-->
      <xsl:value-of select="$csnref/@systemCode"/>
      <xsl:value-of select="$csnref/@subSystemCode"/>
      <xsl:value-of select="$csnref/@subSubSystemCode"/>
      <xsl:value-of select="$csnref/@assyCode"/>
      <xsl:value-of select="$csnref/@figureNumber"/><xsl:value-of select="$csnref/@figureNumberVariant"/>
      <xsl:value-of select="$csnref/@item"/><xsl:value-of select="$csnref/@itemVariant"/>
    </xsl:attribute>
    <xsl:value-of select="$csnref/@systemCode"/>
    <xsl:value-of select="$csnref/@subSystemCode"/>
    <xsl:value-of select="$csnref/@subSubSystemCode"/>
    <xsl:value-of select="$csnref/@assyCode"/>
    <xsl:value-of select="$csnref/@figureNumber"/><xsl:value-of select="$csnref/@figureNumberVariant"/>
    <xsl:text> Item </xsl:text><xsl:value-of select="$csnref/@item"/><xsl:value-of select="$csnref/@itemVariant"/>
  </span>
</xsl:template>

</xsl:stylesheet>
