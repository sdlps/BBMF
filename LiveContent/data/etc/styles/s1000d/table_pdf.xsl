<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/table_pdf.xsl 2.0 2019/05/23 20:30:53GMT milind Exp  $ -->

<xsl:stylesheet
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
     xmlns:fo="http://www.w3.org/1999/XSL/Format">
<xsl:variable name="colcount">
	<xsl:choose>
		<xsl:when test="//table//row">
			<xsl:value-of select="count(//table//row/entry)"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:text>0</xsl:text>
		</xsl:otherwise>
	</xsl:choose>
</xsl:variable>

<xsl:template name="table-in-main">
<fo:list-item>
  <fo:list-item-label>
    <fo:block></fo:block>
  </fo:list-item-label>
  <fo:list-item-body>
<fo:block space-before="5mm">

<xsl:choose>
	<xsl:when test="tgroup/@align = 'center'">
		<xsl:call-template name="centered_table"/>
	</xsl:when>
	<xsl:otherwise>
		<xsl:apply-templates/>
	</xsl:otherwise>
</xsl:choose>

</fo:block>

</fo:list-item-body>
</fo:list-item>
</xsl:template>

<xsl:template match="table">
  <fo:block space-before="5mm">
  <xsl:copy select="@id"/>
  <xsl:choose>
    <xsl:when test="tgroup/@align = 'center'">
      <xsl:call-template name="centered_table"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
  </fo:block>
</xsl:template>

<xsl:template name="centered_table">
<fo:table start-indent="0" table-layout="fixed" width="100%">
	<fo:table-column column-width="proportional-column-width(1)"/>
	<fo:table-column column-width="150mm"/>
	<fo:table-column column-width="proportional-column-width(1)"/>
	<fo:table-body>
	  <fo:table-row>
	    <fo:table-cell column-number="2">
	      <fo:block text-align="left">
		<xsl:apply-templates/>
	      </fo:block>
	    </fo:table-cell>
	  </fo:table-row>
	</fo:table-body>
</fo:table>
</xsl:template>

<xsl:template match="table/title">
	<fo:block font-weight="bold">
	<xsl:call-template name="security_portion_mark"/>
		<xsl:value-of select="$style.general.table"/><xsl:text> </xsl:text><xsl:number level="any" count="table/title" format="1."/><xsl:text> </xsl:text> 
		<xsl:apply-templates/>
	</fo:block>
</xsl:template>

<xsl:template match="tgroup">
<fo:table start-indent="0" table-layout="fixed" space-after="15pt" width="190mm" >
  <xsl:copy select="@id"/>
<fo:table-column>
	<xsl:attribute  name="number-columns-repeated"><xsl:value-of select="@cols"/></xsl:attribute>
</fo:table-column>
<xsl:choose>
	<xsl:when test="$colcount=0">
		<fo:table-body>
			<fo:table-row>
			<fo:table-cell number-columns-spanned="3" padding="3mm" border-color="black" border-width="1pt" border-style="solid">
			<fo:block space-before="5mm">
				<xsl:if test="ancestor::thead">
				<xsl:attribute name="font-size">10pt</xsl:attribute>
				</xsl:if>

				<!-- Test the security conditions -->
				<xsl:call-template name="formatClass01"/>
				<xsl:value-of select="$style.table.noapplicabledatathissection"/>
			</fo:block>		
			
			</fo:table-cell>
			</fo:table-row>
		</fo:table-body>	
	</xsl:when>	
	<xsl:otherwise>
		<xsl:apply-templates/>
	</xsl:otherwise>
</xsl:choose>
</fo:table>
<xsl:if test=".//footnote|.//ftnote">
	<xsl:apply-templates select=".//ftnote|.//footnote" mode="table.footnote.mode"/>
</xsl:if>
</xsl:template>

<xsl:template match="thead">
<fo:table-header>
	<xsl:apply-templates/>
</fo:table-header>
</xsl:template>

<xsl:template match="tfoot">
<fo:table-footer>
	<xsl:apply-templates/>
</fo:table-footer>
</xsl:template>

<xsl:template match="tbody">
<fo:table-body>
	<xsl:apply-templates/>
</fo:table-body>
</xsl:template>

<xsl:template match="row">
<fo:table-row>
	<xsl:apply-templates/>
</fo:table-row>
</xsl:template>

<xsl:template match="entry">
	<xsl:variable name="index">
		<xsl:number/>
	</xsl:variable>
<fo:table-cell padding="1mm" border-color="black" border-width="1pt" border-style="solid">
	<xsl:if test="self::node()[@valign]">
		<xsl:attribute name="display-align"><xsl:value-of select="@valign"/></xsl:attribute>
	</xsl:if>
<!-- ************************************************************* -->
  <xsl:choose>
	<!-- if @align is defined in entry -->
    <xsl:when test="self::node()[@align]">
		<xsl:attribute name="text-align"><xsl:value-of select="@align"/></xsl:attribute>
	</xsl:when>
    <xsl:otherwise>
      <xsl:choose>
		<!-- if @align is defined in colspec for matching column of thead (applies to thead only) -->
        <xsl:when test="../../colspec[position() = $index]/@align">
			<xsl:attribute name="text-align"><xsl:value-of select="../../colspec[position() = $index]/@align"/></xsl:attribute>
        </xsl:when>
		<xsl:otherwise>
		  <xsl:choose>
			<!-- if @align is defined in colspec for matching column of tgroup -->
			<xsl:when test="../../../../tgroup/colspec[position() = $index]/@align">
				<xsl:attribute name="text-align"><xsl:value-of select="../../../../tgroup/colspec[position() = $index]/@align"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
			  <xsl:choose>
				<!-- if @align is defined in colspec for matching column of tgroup -->
				<xsl:when test="../../../../tgroup/@align">
					<xsl:attribute name="text-align"><xsl:value-of select="../../../../tgroup/@align"/></xsl:attribute>
				</xsl:when>
				<xsl:otherwise>
					<!-- else if @align is not defined center table cells to match HTML tables -->
					<xsl:attribute name="text-align">center</xsl:attribute>
				</xsl:otherwise>
			  </xsl:choose>
			</xsl:otherwise>
		  </xsl:choose>
		</xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
<!-- ************************************************************* -->
	<xsl:if test="@nameend or @namest">
		<xsl:attribute name="number-columns-spanned">
			<xsl:variable name="colst"><xsl:value-of select="@namest"/></xsl:variable>
			<xsl:variable name="colend"><xsl:value-of select="@nameend"/></xsl:variable>
			<xsl:value-of select="count(ancestor::tgroup/colspec[@colname=$colend]/preceding::colspec) - count(ancestor::tgroup/colspec[@colname=$colst]/preceding::colspec) + 1"/>
		</xsl:attribute>
	</xsl:if>
	<xsl:if test="@morerows">
		<xsl:attribute name="number-rows-spanned">
			<xsl:value-of select="@morerows + 1"/>
		</xsl:attribute>
	</xsl:if>
	<fo:block>
		<xsl:if test="ancestor::thead">
			<xsl:attribute name="font-weight">bold</xsl:attribute>
		</xsl:if>
		<xsl:apply-templates/>
	</fo:block>
</fo:table-cell>
</xsl:template>

<xsl:template match="colspec">
</xsl:template>

</xsl:stylesheet>

