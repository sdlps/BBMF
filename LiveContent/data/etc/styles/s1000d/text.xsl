<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/text.xsl 2.0 2019/05/23 20:30:17GMT milind Exp  $ -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<!-- ****************** TEXT MODIFIERS ******************** -->

<xsl:template match="emphasis">
<xsl:choose>
<xsl:when test="@emph = 'em01'"> <!-- BOLD -->
	<b><xsl:apply-templates/></b>
</xsl:when>
<xsl:when test="@emph = 'em02'"> <!-- ITALICS -->
	<i><xsl:apply-templates/></i>
</xsl:when>
<xsl:when test="@emph = 'em03'"> <!-- UNDERLINE -->
	<span style="text-decoration:underline"><xsl:apply-templates/></span>
</xsl:when>
<xsl:when test="@emph = 'em04'"> <!-- OVERLINE -->
	<span style="text-decoration:overline"><xsl:apply-templates/></span>
</xsl:when>
<xsl:when test="@emph = 'em05'"> <!-- STRIKE THROUGH -->
	<del><xsl:apply-templates/></del>
</xsl:when>

<xsl:otherwise>
	<b><xsl:apply-templates/></b>
</xsl:otherwise>
</xsl:choose>
</xsl:template>

<xsl:template match="subscrpt">
<sub><xsl:apply-templates/></sub>
</xsl:template>

<xsl:template match="supscrpt">
<sup><xsl:apply-templates/></sup>
</xsl:template>

<!-- ****************** PARA and PARA0 *********************** -->
	
<!-- LAM:2021-10-26 handle change markers -->
<xsl:template match="para | para[@reasonForUpdateRefIds]" priority="3">
  <xsl:variable name="class"><xsl:call-template name="set-change-class-name"/></xsl:variable>
  <xsl:variable name="tagname"><xsl:choose>
    <xsl:when test="not(preceding-sibling::*[local-name() != 'warning' and local-name() != 'caution' and local-name() != 'note' and local-name() != 'figure'])">span</xsl:when>
    <xsl:otherwise>p</xsl:otherwise>
  </xsl:choose></xsl:variable>
  <xsl:element name="{$tagname}" use-attribute-sets="standard">
    <xsl:attribute name="class"><xsl:value-of select="$class"/></xsl:attribute>
    <xsl:attribute name="step">step1</xsl:attribute>
    <!-- Test the security conditions -->
    <xsl:call-template name="formatClass01"/>
    <xsl:call-template name="security_portion_mark"/>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>
<xsl:template match="para" priority="-1">
	<xsl:choose>
		<xsl:when test="not(preceding-sibling::*[local-name() != 'warning' and local-name() != 'caution' and local-name() != 'note' and local-name() != 'figure'])">
			<span xsl:use-attribute-sets="standard">
				<xsl:attribute name="step">step1</xsl:attribute>
				<!-- Test the security conditions -->
				<xsl:call-template name="formatClass01"/>
        <xsl:call-template name="security_portion_mark"/>
				<xsl:apply-templates/>
			</span>
		</xsl:when>

		<xsl:otherwise>
			<xsl:choose>
				<xsl:when test="preceding-sibling::*[self::warning or self::caution or self::note]">
					<p><xsl:attribute name="step">step1</xsl:attribute></p>
					<!-- Test the security conditions -->
					<xsl:call-template name="formatClass01"/>
          <xsl:call-template name="security_portion_mark"/>
					<xsl:apply-templates/>
				</xsl:when>
				<xsl:otherwise>
					<p xsl:use-attribute-sets="standard">
						<xsl:attribute name="step">step1</xsl:attribute>
						<!-- Test the security conditions -->
						<xsl:call-template name="formatClass01"/>
            <xsl:call-template name="security_portion_mark"/>
						<xsl:apply-templates/>
					</p>
				</xsl:otherwise>
			</xsl:choose>

		</xsl:otherwise>

	</xsl:choose>
</xsl:template>

<xsl:template match="levelledPara/title" priority="1">
<xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>


<xsl:template match="para/title">
	<h2 class="para_title" xsl:use-attribute-sets="standard">
		<xsl:call-template name="security_portion_mark"/>
		<xsl:apply-templates/>
	</h2>
</xsl:template>

<xsl:template match="levelledPara">
	<p xsl:use-attribute-sets="standard">
		<h2><xsl:number count="levelledPara" level="multiple" format="1.1.1.1.1.1.1.1.1.1"/>&#160;&#160;<xsl:apply-templates select="title"/></h2>
    <xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>
<xsl:template match="levelledPara[@reasonForUpdateRefIds]" priority="2">
	<div xsl:use-attribute-sets="standard">
    <xsl:attribute name="class"><xsl:call-template name="set-change-class-name"/></xsl:attribute>
		<h2><xsl:number count="levelledPara" level="multiple" format="1.1.1.1.1.1.1.1.1.1"/>&#160;&#160;<xsl:apply-templates select="title"/></h2>
    <xsl:apply-templates select="*[not(self::title)]"/>
	</div>
</xsl:template>


<xsl:template match="para0">
	<p xsl:use-attribute-sets="standard">
		<h2><xsl:number count="para0" level="single" format="1"/>&#160;&#160;<xsl:apply-templates select="title"/></h2>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>

<xsl:template match="para0/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>


<!-- ****************** SUBPARA 1-4 *********************** -->

<xsl:template match="subpara1">
	<p xsl:use-attribute-sets="standard">
		<h3 class="subpara_title" xsl:use-attribute-sets="standard"> 
			<xsl:number count="para0" level="multiple" format="1"/>
			<xsl:number count="levelledPara" level="multiple" format="1."/>
			<xsl:number count="subpara1" level="single" format="1"/>&#160;&#160;<xsl:apply-templates select="title"/>
		</h3>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>

<xsl:template match="subpara1/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>


<xsl:template match="subpara2">
	<p xsl:use-attribute-sets="standard">
		<h3 class="subpara_title" xsl:use-attribute-sets="standard"> 
					<xsl:number count="para0" level="multiple" format="1"/>
					<xsl:number count="levelledPara" level="multiple" format="1."/>
					<xsl:number count="subpara1" level="multiple" format="1."/>
					<xsl:number count="subpara2" level="single" format="1"/>&#160;&#160;<xsl:apply-templates select="title"/>
				</h3>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>

<xsl:template match="subpara2/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>

<xsl:template match="subpara3">
	<p xsl:use-attribute-sets="standard">
				<h3 class="subpara_title" xsl:use-attribute-sets="standard"> 
					<xsl:number count="para0" level="multiple" format="1"/>
					<xsl:number count="levelledPara" level="multiple" format="1."/>
					<xsl:number count="subpara1" level="multiple" format="1."/>
					<xsl:number count="subpara2" level="multiple" format="1."/>
					<xsl:number count="subpara3" level="single" format="1"/>&#160;&#160;<xsl:apply-templates select="title"/>
				</h3>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>

<xsl:template match="subpara3/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>

<xsl:template match="subpara4">
	<p xsl:use-attribute-sets="standard">
		<h3 class="subpara_title" xsl:use-attribute-sets="standard"> 
			<xsl:number count="para0" level="multiple" format="1"/>
			<xsl:number count="levelledPara" level="multiple" format="1."/>
			<xsl:number count="subpara1" level="single" format="1."/>
			<xsl:number count="subpara2" level="multiple" format="1."/>
			<xsl:number count="subpara3" level="multiple" format="1."/>
			<xsl:number count="subpara4" level="single" format="1"/>&#160;&#160;<xsl:apply-templates select="title"/>
		</h3>
		<xsl:apply-templates select="*[local-name() != 'title']"/>
	</p>
</xsl:template>

<xsl:template match="subpara4/title" priority="1">
   <xsl:call-template name="security_portion_mark"/>
   <xsl:apply-templates/>
</xsl:template>

<xsl:template match="step1/title" priority="1">
	<span style="font-weight:bold;font-size:12pt">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
	</span>
</xsl:template>

<xsl:template match="step2/title" priority="1">
	<p><span style="font-weight:bold;font-size:11pt">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
	</span></p>
</xsl:template>

<xsl:template match="step3/title" priority="1">
	<p><span style="font-weight:bold">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
	</span></p>
</xsl:template>

<xsl:template match="step4/title" priority="1">
	<p><span style="font-weight:bold">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
	</span></p>
</xsl:template>

<xsl:template match="step5/title" priority="1">
	<p><span style="font-weight:bold">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
	</span></p>
</xsl:template>

</xsl:stylesheet>
