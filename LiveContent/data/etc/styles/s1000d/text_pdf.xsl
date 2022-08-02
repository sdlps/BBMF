<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/text_pdf.xsl 2.0 2019/05/23 20:30:41GMT milind Exp  $ -->

<xsl:stylesheet
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
     xmlns:fo="http://www.w3.org/1999/XSL/Format" >

<!-- ****************** TEXT MODIFIERS ******************** -->

<xsl:template match="emphasis">
<xsl:choose>
<xsl:when test="@emph = 'em01'"> <!-- BOLD -->
	<fo:inline font-weight="bold"><xsl:apply-templates/></fo:inline>
</xsl:when>
<xsl:when test="@emph = 'em02'"> <!-- ITALICS -->
	<fo:inline font-style="italic"><xsl:apply-templates/></fo:inline>
</xsl:when>
<xsl:when test="@emph = 'em03'"> <!-- UNDERLINE -->
	<fo:inline text-decoration="underline"><xsl:apply-templates/></fo:inline>
</xsl:when>
<xsl:when test="@emph = 'em04'"> <!-- OVERLINE -->
	<fo:inline text-decoration="overline"><xsl:apply-templates/></fo:inline>
</xsl:when>
<xsl:when test="@emph = 'em05'"> <!-- STRIKE THROUGH -->
	<fo:inline text-decoration="line-through"><xsl:apply-templates/></fo:inline>
</xsl:when>

<xsl:otherwise>
	<fo:inline font-weight="bold"><xsl:apply-templates/></fo:inline>
</xsl:otherwise>
</xsl:choose>
</xsl:template>

<xsl:template match="subscrpt">
	<fo:inline vertical-align="sub" font-size="8pt"><xsl:apply-templates/></fo:inline>
</xsl:template>

<xsl:template match="supscrpt">
	<fo:inline vertical-align="super" font-size="8pt"><xsl:apply-templates/></fo:inline>
</xsl:template>

<!-- 	*
	*
	* PARA0 and SUBPARAX attribute sets and templates:
	*	
	*
	* -->

<xsl:attribute-set name="para_title">
  <xsl:attribute name="font-size">12pt</xsl:attribute> 
  <xsl:attribute name="font-weight">bold</xsl:attribute> 
  <!--<xsl:attribute name="font-family">sans-serif</xsl:attribute> -->
  <xsl:attribute name="space-before">12pt</xsl:attribute>
  <xsl:attribute name="space-after">0pt</xsl:attribute>
  <xsl:attribute name="color">black</xsl:attribute>
  <xsl:attribute name="text-align">left</xsl:attribute>
  <xsl:attribute name="keep-with-next">always</xsl:attribute>
</xsl:attribute-set>

<xsl:attribute-set name="subpara_title">
  <xsl:attribute name="font-size">12pt</xsl:attribute> 
  <xsl:attribute name="font-weight">bold</xsl:attribute>
  <!--<xsl:attribute name="font-family">sans-serif</xsl:attribute> -->
  <xsl:attribute name="space-before">12pt</xsl:attribute>
  <xsl:attribute name="space-after">0pt</xsl:attribute>
  <xsl:attribute name="color">black</xsl:attribute>
  <xsl:attribute name="text-align">left</xsl:attribute>
  <xsl:attribute name="keep-with-next">always</xsl:attribute>
</xsl:attribute-set>

<xsl:template match="para0|levelledPara">
	<fo:block>
	<fo:block xsl:use-attribute-sets="para_title">
		<xsl:number count="para0" level="single" format="1"/>
		<xsl:number count="levelledPara" level="single" format="1"/>
    <xsl:text>&#x2003;&#x2003;</xsl:text>
		<xsl:apply-templates select="title"/>
	</fo:block>
	<fo:block>
		<!-- <xsl:call-template name="formatClass01"/> -->
	<xsl:apply-templates select="*[local-name() != 'title']"/>
	</fo:block>
	</fo:block>
</xsl:template>

<xsl:template match="levelledPara/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>

<!-- ****************** SUBPARA 1-4 *********************** -->

<xsl:template match="subpara1|levelledPara/levelledPara">
	<fo:block>
	<fo:block xsl:use-attribute-sets="subpara_title">
		<xsl:number count="para0" level="multiple" format="1"/>
		<xsl:number count="levelledPara" level="multiple" format="1.1"/>
		<xsl:number count="subpara1" level="single" format="1"/>
		<xsl:call-template name="security_portion_mark"/>
    <xsl:text>&#x2003;&#x2003;</xsl:text>
		<xsl:apply-templates select="title"/>
	</fo:block>
	<fo:block>
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</fo:block>
	</fo:block>
</xsl:template>

<xsl:template match="subpara2|levelledPara/levelledPara/levelledPara">
	<fo:block>
	<fo:block xsl:use-attribute-sets="subpara_title">
		<xsl:number count="para0" level="multiple" format="1"/>
		<xsl:number count="levelledPara" level="multiple" format="1.1.1"/>
		<xsl:number count="subpara1" level="multiple" format="1."/>
		<xsl:number count="subpara2" level="single" format="1"/>
		 <xsl:call-template name="security_portion_mark"/>
     <xsl:text>&#x2003;&#x2003;</xsl:text>
		<xsl:apply-templates select="title"/>
	</fo:block>
	<fo:block>
	    <xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</fo:block>
	</fo:block>
</xsl:template>

<xsl:template match="subpara3|levelledPara/levelledPara/levelledPara/levelledPara">
	<fo:block>
	<fo:block xsl:use-attribute-sets="subpara_title"> 
		<xsl:number count="para0" level="multiple" format="1"/>
		<xsl:number count="levelledPara" level="multiple" format="1.1.1.1"/>
		<xsl:number count="subpara1" level="multiple" format="1."/>
		<xsl:number count="subpara2" level="multiple" format="1."/>
		<xsl:number count="subpara3" level="single" format="1"/>
    <xsl:call-template name="security_portion_mark"/>
    <xsl:text>&#x2003;&#x2003;</xsl:text>
		<xsl:apply-templates select="title"/>
	</fo:block>
	<fo:block>
	    <xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</fo:block>
	</fo:block>
</xsl:template>

<xsl:template match="subpara4|levelledPara/levelledPara/levelledPara/levelledPara/levelledPara">
	<fo:block>
		<fo:block xsl:use-attribute-sets="subpara_title">
			<xsl:number count="para0" level="multiple" format="1"/>
			<xsl:number count="levelledPara" level="multiple" format="1.1.1.1.1"/>
			<xsl:number count="subpara1" level="single" format="1."/>
			<xsl:number count="subpara2" level="multiple" format="1."/>
			<xsl:number count="subpara3" level="multiple" format="1."/>
			<xsl:number count="subpara4" level="single" format="1"/>
			<xsl:call-template name="security_portion_mark"/>
      <xsl:text>&#x2003;&#x2003;</xsl:text>
			<xsl:apply-templates select="title"/>
		</fo:block>
		<fo:block>
			<xsl:call-template name="security_portion_mark"/>
			<xsl:apply-templates select="*[local-name() != 'title']"/>
		</fo:block>
	</fo:block>
</xsl:template>

</xsl:stylesheet>
