<?xml version="1.0" encoding="iso-8859-1"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/supteqt.xsl 2.0 2019/05/23 20:30:23GMT milind Exp  $ -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:template match="supeqli | supportEquipDescrGroup">
  <xsl:param name="mode">default</xsl:param>
  <div xsl:use-attribute-sets="standard">
    <h3 class="minor_section"><xsl:choose>
      <xsl:when test="$mode!='default'">
        <xsl:variable name="script">javascript:
        var tbl=document.getElementById('TBL-SUPPORTEQUIPDESCRGROUP');
        var img=document.getElementById('DIV-SUPPORTEQUIPDESCRGROUP-IMG');
        var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
        var img1='aircraft/arr1.png';
        var img2='aircraft/arr2.png';
        tbl.style.display = (tbl.style.display == 'none' ? 'table':'none');
        img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
        </xsl:variable>
        <a href="#" class="minor_section" onclick="{$script}"><img id="DIV-SUPPORTEQUIPDESCRGROUP-IMG"
          src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
        <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.supteqt.supportequipment"/></a>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$style.supteqt.supportequipment"/></xsl:otherwise>
    </xsl:choose></h3>
    <xsl:variable name="tbl-display"><xsl:choose>
      <xsl:when test="$mode!='default'">none</xsl:when>
      <xsl:otherwise>table</xsl:otherwise>
    </xsl:choose></xsl:variable>
    <table width="100%" id="TBL-SUPPORTEQUIPDESCRGROUP" style="display:{$tbl-display}">  
    <colgroup span="2"><col width="45%"></col><col width="45%"></col><col width="10%"></col></colgroup>
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
    <xsl:for-each select="supequi | supportEquipDescr | .//embeddedSupportEquipDescr">
      <tr>
      <xsl:if test="self::node()[@reasonForUpdateRefIds]"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
      <xsl:choose><xsl:when test="position() mod 2 != 0"><xsl:attribute name="bgcolor">#E8E8E8</xsl:attribute></xsl:when></xsl:choose>
      <xsl:apply-templates select="."/>
      </tr>
    </xsl:for-each>
    <tr><td valign="top" colspan="4"><hr size="1" noshade="noshade" color="black"/></td></tr>
    </tbody>
    </table>
  </div>
</xsl:template>

<xsl:template match="nosupeq|noSupportEquips" priority="5">
  <xsl:param name="mode">default</xsl:param>
  <div xsl:use-attribute-sets="standard">
    <h3 class="minor_section">
    <xsl:choose>
      <xsl:when test="$mode!='default'">
        <xsl:variable name="script">javascript:
        var tbl=document.getElementById('TBL-NOSUPPORTEQUIPS');
        var img=document.getElementById('DIV-NOSUPPORTEQUIPS-IMG');
        var imgbase='/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=';
        var img1='aircraft/arr1.png';
        var img2='aircraft/arr2.png';
        tbl.style.display = (tbl.style.display == 'none' ? 'block':'none');
        img.src = (tbl.style.display == 'none' ? (imgbase + img1):(imgbase + img2));
        </xsl:variable>
        <a class="minor_section" href="#" onclick="{$script}"><img id="DIV-NOSUPPORTEQUIPS-IMG"
          src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/arr1.png"/>
        <xsl:text>&#160;</xsl:text><xsl:value-of select="$style.supteqt.supportequipment"/></a>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$style.supteqt.supportequipment"/></xsl:otherwise>
    </xsl:choose>
    </h3>
    <xsl:variable name="div-display"><xsl:choose>
      <xsl:when test="$mode!='default'">none</xsl:when>
      <xsl:otherwise>table</xsl:otherwise>
    </xsl:choose></xsl:variable>
    <div id="TBL-NOSUPPORTEQUIPS" style="display:{$div-display}"><hr size="1" noshade="noshade" color="black"/><xsl:value-of select="$style.general.none"/></div>
  </div>
</xsl:template>

<xsl:template match="supequi|supportEquipDescr|embeddedSupportEquipDescr" priority="2">
  <td style="vertical-align:top;"><span xsl:use-attribute-sets="standard"><xsl:apply-templates select="nomen|name"/></span></td>
  <td style="vertical-align:top;"><xsl:apply-templates select="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber"/></td>
  <td style="vertical-align:top;"><xsl:apply-templates select="qty|reqQuantity"/></td>
</xsl:template>

<xsl:template match="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber">
  <span><xsl:apply-templates/></span><br/>
</xsl:template>

</xsl:stylesheet>
