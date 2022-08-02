<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/procedure_pdf.xsl 2.0 2019/05/22 21:06:06GMT milind Exp  $ -->

<xsl:stylesheet
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
     xmlns:fo="http://www.w3.org/1999/XSL/Format" >
     

<xsl:template match="mainProcedure">
<fo:block xsl:use-attribute-sets="h2"><xsl:value-of select="$style.procedure.procedure"/></fo:block>
<fo:list-block font-size="10pt">
	<xsl:for-each select="table">
		<xsl:call-template name="table-in-main"/>
	</xsl:for-each>
	<!--<xsl:apply-templates/>-->
	  <xsl:apply-templates select='*[local-name() != "table" ] '/>
  
</fo:list-block>
</xsl:template>
     
<xsl:template match="proceduralStep">
  <xsl:choose>
    <xsl:when test="@warningRefs">
      <xsl:variable name="refwarns" select="./ancestor::dmodule[1]//warningsAndCautions/warning"/>
      <xsl:variable name="warnrefs" select="@warningRefs"/>
      <xsl:for-each select="tokenize($warnrefs,' ')">
        <xsl:variable name="warnref" select="normalize-space(.)"/>
        <xsl:call-template name="wcn-above-step">
          <xsl:with-param name="ns" select="$refwarns[@id=$warnref]"/>
        </xsl:call-template>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="warning">
        <xsl:call-template name="wcn-above-step"/>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
  <xsl:choose>
    <xsl:when test="@cautionRefs">
      <xsl:variable name="refcauts" select="./ancestor::dmodule[1]//warningsAndCautions/caution"/>
      <xsl:variable name="cautrefs" select="@cautionRefs"/>
      <xsl:for-each select="tokenize($cautrefs,' ')">
        <xsl:variable name="cautref" select="normalize-space(.)"/>
        <xsl:call-template name="wcn-above-step">
          <xsl:with-param name="ns" select="$refcauts[@id=$cautref]"/>
        </xsl:call-template>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="caution">
        <xsl:call-template name="wcn-above-step"/>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
  <xsl:for-each select="note">
    <xsl:call-template name="wcn-above-step"/>
  </xsl:for-each>
  <fo:list-item space-before="5mm">
    <fo:list-item-label><xsl:call-template name='formatStepDesignator'/></fo:list-item-label>
    <fo:list-item-body start-indent="22mm"><fo:block>
    <xsl:apply-templates select='*[local-name() != "proceduralStep" and local-name() != "warning" and local-name() != "caution" and local-name() != "note"] '/>
    </fo:block></fo:list-item-body>
  </fo:list-item>
  <xsl:call-template name="security_portion_mark"/>
  <xsl:apply-templates select="proceduralStep"/>
</xsl:template>
     
    
<!-- step titles -->

<xsl:template match="proceduralStep/title">
<fo:block font-weight="bold" space-after="4pt" font-size="12pt"><xsl:call-template name="security_portion_mark"/><xsl:apply-templates/></fo:block>
</xsl:template>


</xsl:stylesheet>
