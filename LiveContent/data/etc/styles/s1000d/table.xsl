<?xml version='1.0'?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/table.xsl 2.0 2019/05/23 20:30:55GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:doc="http://nwalsh.com/xsl/documentation/1.0"
                xmlns:stbl="http://nwalsh.com/xslt/ext/com.nwalsh.saxon.Table"
                xmlns:xtbl="com.nwalsh.xalan.Table"
                xmlns:lxslt="http://xml.apache.org/xslt"
                xmlns:ptbl="http://nwalsh.com/xslt/ext/xsltproc/python/Table"
                exclude-result-prefixes="doc stbl xtbl lxslt ptbl"
                version='1.0'>

<xsl:include href="../common/table.xsl"/>

<!-- ********************************************************************
     $Id: XY/etc/FullSupport/etc/styles/s1000d/table.xsl 2.0 2019/05/23 20:30:55GMT milind Exp  $
     ********************************************************************

     This file is part of the XSL DocBook Stylesheet distribution.
     See ../README or http://nwalsh.com/docbook/xsl/ for copyright
     and other information.

     ******************************************************************** -->

<lxslt:component prefix="xtbl"
                 functions="adjustColumnWidths"/>

<xsl:param name="table.borders.with.css" select="0"/>
<xsl:param name="table.cell.border.style" select="'solid'"/>
<xsl:param name="table.cell.border.color" select="''"/>
<xsl:param name="table.cell.border.thickness" select="'1pt'"/>
<xsl:param name="html.cellpadding" select="''"/>
<xsl:param name="html.cellspacing" select="''"/>
<xsl:param name="table.frame.border.style" select="'solid'"/>
<xsl:param name="table.frame.border.thickness" select="'1pt'"/>
<xsl:param name="table.frame.border.color" select="''"/>
<xsl:param name="default.table.width" select="''"/>
<xsl:param name="use.extensions" select="'0'"/>
<xsl:param name="tablecolumns.extension" select="'1'"/>
<xsl:param name="entry.propagates.style" select="1"/>
<xsl:param name="show.revisionflag">0</xsl:param>

<xsl:template name="empty.table.cell">
  <xsl:param name="colnum" select="0"/>

  <xsl:variable name="rowsep">
    <xsl:choose>
      <!-- If this is the last row, rowsep never applies. -->
      <xsl:when test="not(ancestor-or-self::row[1]/following-sibling::row
                          or ancestor-or-self::thead/following-sibling::tbody
                          or ancestor-or-self::tbody/preceding-sibling::tfoot)">
        <xsl:value-of select="0"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="inherited.table.attribute">
          <xsl:with-param name="entry" select="NOT-AN-ELEMENT-NAME"/>
          <xsl:with-param name="row" select="ancestor-or-self::row[1]"/>
          <xsl:with-param name="colnum" select="$colnum"/>
          <xsl:with-param name="attribute" select="'rowsep'"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="colsep">
    <xsl:choose>
      <!-- If this is the last column, colsep never applies. -->
      <xsl:when test="$colnum &gt;= ancestor::tgroup/@cols">0</xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="inherited.table.attribute">
          <xsl:with-param name="entry" select="NOT-AN-ELEMENT-NAME"/>
          <xsl:with-param name="row" select="ancestor-or-self::row[1]"/>
          <xsl:with-param name="colnum" select="$colnum"/>
          <xsl:with-param name="attribute" select="'colsep'"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <td class="auto-generated">
    <xsl:if test="$table.borders.with.css != 0">
      <xsl:attribute name="style">
        <xsl:if test="$colsep &gt; 0">
          <xsl:call-template name="border">
            <xsl:with-param name="side" select="'right'"/>
          </xsl:call-template>
        </xsl:if>
        <xsl:if test="$rowsep &gt; 0">
          <xsl:call-template name="border">
            <xsl:with-param name="side" select="'bottom'"/>
          </xsl:call-template>
        </xsl:if>
      </xsl:attribute>
    </xsl:if>
    <xsl:text>&#160;</xsl:text>
  </td>
</xsl:template>

<!-- ==================================================================== -->

<xsl:template name="border">
  <xsl:param name="side" select="'left'"/>
  <xsl:param name="padding" select="0"/>
  <xsl:param name="style" select="$table.cell.border.style"/>
  <xsl:param name="color" select="$table.cell.border.color"/>
  <xsl:param name="thickness" select="$table.cell.border.thickness"/>

  <!-- Note: Some browsers (mozilla) require at least a width and style. -->

  <xsl:choose>
    <xsl:when test="($thickness != ''
                     and $style != ''
                     and $color != '')
                    or ($thickness != ''
                        and $style != '')
                    or ($thickness != '')">
      <!-- use the compound property if we can: -->
      <!-- it saves space and probably works more reliably -->
      <xsl:text>border-</xsl:text>
      <xsl:value-of select="$side"/>
      <xsl:text>: </xsl:text>
      <xsl:value-of select="$thickness"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="$style"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="$color"/>
      <xsl:text>; </xsl:text>
    </xsl:when>
    <xsl:otherwise>
      <!-- we need to specify the styles individually -->
      <xsl:if test="$thickness != ''">
        <xsl:text>border-</xsl:text>
        <xsl:value-of select="$side"/>
        <xsl:text>-width: </xsl:text>
        <xsl:value-of select="$thickness"/>
        <xsl:text>; </xsl:text>
      </xsl:if>

      <xsl:if test="$style != ''">
        <xsl:text>border-</xsl:text>
        <xsl:value-of select="$side"/>
        <xsl:text>-style: </xsl:text>
        <xsl:value-of select="$style"/>
        <xsl:text>; </xsl:text>
      </xsl:if>

      <xsl:if test="$color != ''">
        <xsl:text>border-</xsl:text>
        <xsl:value-of select="$side"/>
        <xsl:text>-color: </xsl:text>
        <xsl:value-of select="$color"/>
        <xsl:text>; </xsl:text>
      </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- ==================================================================== -->

<xsl:template match="tgroup" name="tgroup">
  <xsl:if test="not(@cols)">
    <xsl:message terminate="yes">
      <xsl:value-of select="$style.table.mustspecifythenumberofcolumns"/>
    </xsl:message>
  </xsl:if>

  <xsl:variable name="summary">
    <xsl:call-template name="dbhtml-attribute">
      <xsl:with-param name="pis"
                      select="processing-instruction('dbhtml')"/>
      <xsl:with-param name="attribute" select="'table-summary'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="cellspacing">
    <xsl:call-template name="dbhtml-attribute">
      <xsl:with-param name="pis"
                      select="processing-instruction('dbhtml')"/>
      <xsl:with-param name="attribute" select="'cellspacing'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="cellpadding">
    <xsl:call-template name="dbhtml-attribute">
      <xsl:with-param name="pis"
                      select="processing-instruction('dbhtml')[1]"/>
      <xsl:with-param name="attribute" select="'cellpadding'"/>
    </xsl:call-template>
  </xsl:variable>
<div name="content_table">
  <table>
 	<!-- for extremely large table info -->
      <xsl:if test="ancestor::DOCUMENT/@CEID">
        <xsl:attribute name="PARENTCEID">
          <xsl:value-of select="ancestor::DOCUMENT/@CEID"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@totalrow">
        <xsl:attribute name="totalrow">
          <xsl:value-of select="ancestor::table[1]/@totalrow"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@totalpages">
        <xsl:attribute name="totalpages">
          <xsl:value-of select="ancestor::table[1]/@totalpages"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@islastpage">
        <xsl:attribute name="islastpage">
          <xsl:value-of select="ancestor::table[1]/@islastpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@isfirstpage">
        <xsl:attribute name="isfirstpage">
          <xsl:value-of select="ancestor::table[1]/@isfirstpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@currentpage">
        <xsl:attribute name="currentpage">
          <xsl:value-of select="ancestor::table[1]/@currentpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="ancestor::table[1]/@TABLE_ID">
        <xsl:attribute name="TABLE_ID">
          <xsl:value-of select="ancestor::table[1]/@TABLE_ID"/>
        </xsl:attribute>
      </xsl:if>
    <xsl:choose>
      <!-- If there's a textobject/phrase for the table summary, use it -->
      <xsl:when test="../textobject/phrase">
        <xsl:attribute name="summary">
          <xsl:value-of select="../textobject/phrase"/>
        </xsl:attribute>
      </xsl:when>

      <!-- If there's a <?dbhtml table-summary="foo"?> PI, use it for
           the HTML table summary attribute -->
      <xsl:when test="$summary != ''">
        <xsl:attribute name="summary">
          <xsl:value-of select="$summary"/>
        </xsl:attribute>
      </xsl:when>

      <!-- Otherwise, if there's a title, use that -->
      <xsl:when test="../title">
        <xsl:attribute name="summary">
          <xsl:value-of select="string(../title)"/>
        </xsl:attribute>
      </xsl:when>

      <!-- Otherwise, forget the whole idea -->
      <xsl:otherwise><!-- nevermind --></xsl:otherwise>
    </xsl:choose>

    <xsl:if test="$cellspacing != '' or $html.cellspacing != ''">
      <xsl:attribute name="cellspacing">
        <xsl:choose>
          <xsl:when test="$cellspacing != ''">
            <xsl:value-of select="$cellspacing"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$html.cellspacing"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$cellpadding != '' or $html.cellpadding != ''">
      <xsl:attribute name="cellpadding">
        <xsl:choose>
          <xsl:when test="$cellpadding != ''">
            <xsl:value-of select="$cellpadding"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$html.cellpadding"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="../@pgwide=1 or local-name(.) = 'entrytbl'">
      <xsl:attribute name="width">100%</xsl:attribute>
    </xsl:if>

    <xsl:choose>
      <xsl:when test="$table.borders.with.css != 0">
        <xsl:attribute name="border">0</xsl:attribute>
        <xsl:choose>
          <xsl:when test="../@frame='all'">
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'top'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'bottom'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'left'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'right'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
            </xsl:attribute>
          </xsl:when>
          <xsl:when test="../@frame='topbot'">
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'top'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'bottom'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
            </xsl:attribute>
          </xsl:when>
          <xsl:when test="../@frame='top'">
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'top'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
            </xsl:attribute>
          </xsl:when>
          <xsl:when test="../@frame='bottom'">
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'bottom'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
            </xsl:attribute>
          </xsl:when>
          <xsl:when test="../@frame='sides'">
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'left'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'right'"/>
                <xsl:with-param name="style" select="$table.frame.border.style"/>
                <xsl:with-param name="color" select="$table.frame.border.color"/>
                <xsl:with-param name="thickness" select="$table.frame.border.thickness"/>
              </xsl:call-template>
            </xsl:attribute>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="style">
              <xsl:text>border-collapse: collapse;</xsl:text>
            </xsl:attribute>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="../@frame='none' or local-name(.) = 'entrytbl'">
        <xsl:attribute name="border">0</xsl:attribute>
      </xsl:when>
      <xsl:otherwise>
<!--
		<xsl:attribute name="border">1</xsl:attribute>
        <xsl:attribute name="style">border: 1px solid black</xsl:attribute>
  -->
        <xsl:attribute name="class">content_table</xsl:attribute>

	</xsl:otherwise>
    </xsl:choose>

    <xsl:variable name="colgroup">
      <colgroup>
        <xsl:call-template name="generate.colgroup">
          <xsl:with-param name="cols" select="@cols"/>
        </xsl:call-template>
      </colgroup>
    </xsl:variable>

    <xsl:variable name="explicit.table.width">
      <xsl:call-template name="dbhtml-attribute">
        <xsl:with-param name="pis"
                        select="../processing-instruction('dbhtml')[1]"/>
        <xsl:with-param name="attribute" select="'table-width'"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="table.width">
      <xsl:choose>
        <xsl:when test="$explicit.table.width != ''">
          <xsl:value-of select="$explicit.table.width"/>
        </xsl:when>
        <xsl:when test="$default.table.width = ''">
          <xsl:text>100%</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$default.table.width"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$default.table.width != ''
                  or $explicit.table.width != ''">
      <xsl:attribute name="width">
        <xsl:choose>
          <xsl:when test="contains($table.width, '%')">
            <xsl:value-of select="$table.width"/>
          </xsl:when>
          <xsl:when test="$use.extensions != 0
                          and $tablecolumns.extension != 0">
            <xsl:choose>
              <xsl:when test="function-available('stbl:convertLength')">
                <xsl:value-of select="stbl:convertLength($table.width)"/>
              </xsl:when>
              <xsl:when test="function-available('xtbl:convertLength')">
                <xsl:value-of select="xtbl:convertLength($table.width)"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:message terminate="yes">
                  <xsl:value-of select="$style.table.noconvertlengthfunctionavailable"/>
                </xsl:message>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$table.width"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </xsl:if>

    <xsl:choose>
      <xsl:when test="$use.extensions != 0
                      and $tablecolumns.extension != 0">
        <xsl:choose>
          <xsl:when test="function-available('stbl:adjustColumnWidths')">
            <xsl:copy-of select="stbl:adjustColumnWidths($colgroup)"/>
          </xsl:when>
          <xsl:when test="function-available('xtbl:adjustColumnWidths')">
            <xsl:copy-of select="xtbl:adjustColumnWidths($colgroup)"/>
          </xsl:when>
          <xsl:when test="function-available('ptbl:adjustColumnWidths')">
            <xsl:copy-of select="ptbl:adjustColumnWidths($colgroup)"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:message terminate="yes">
              <xsl:value-of select="$style.table.noadjustcolumnwidthsfunctionavailable"/>
            </xsl:message>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="$colgroup"/>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:apply-templates select="thead"/>
    <xsl:apply-templates select="tfoot"/>
    <xsl:apply-templates select="tbody"/>

    <xsl:if test=".//footnote">
      <tbody class="footnotes">
        <tr>
          <td colspan="{@cols}">
            <xsl:apply-templates select=".//footnote" mode="table.footnote.mode"/>
          </td>
        </tr>
      </tbody>
    </xsl:if>
  </table>
<xsl:if test="ancestor::table[1]/@TABLE_ID">
	<xsl:variable name="currpage">
		<xsl:for-each select="tbody">
			<xsl:choose>
				<xsl:when test="@style">
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@currentpage" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="currpage">
		<xsl:for-each select="tbody">
			<xsl:choose>
				<xsl:when test="@style">
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@currentpage" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="currCEID">
		<xsl:for-each select="tbody">
			<xsl:choose>
				<xsl:when test="@style">
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@CEID" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="totalpages">
		<xsl:for-each select="tbody">
			<xsl:choose>
				<xsl:when test="@style">
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@totalpages" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:variable>
	<xsl:variable name="currpage">
		<xsl:for-each select="tbody">
			<xsl:choose>
				<xsl:when test="@style">
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@currentpage" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:for-each>
	</xsl:variable>
<div>
	<xsl:attribute name="currceid"><xsl:value-of select="$currCEID" /></xsl:attribute>
	<xsl:attribute name="id">currceid</xsl:attribute>

	<a href="#"  class="largeTableClose" title="Close"><img src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_close.png" ondrag="event.returnValue=false;" onclick="$('#currceid').hide();" style="width:10px;height:10px;float:right;" /></a>

	<div style="padding:5px 10px;">
      <input type="image" id="ltp_first"
             src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_first.png"
             title="First Section" ondrag="event.returnValue=false;" style="vertical-align:middle">
        <xsl:attribute name="onclick">
          CVPortal.components['cvDocHandler'].getTableSec(event,'first','<xsl:value-of
                select="ancestor::DOCUMENT/@CEID"/>');
        </xsl:attribute>
        <xsl:if test="$currpage=1">
          <xsl:attribute name="disabled"/>
        </xsl:if>
      </input>

      <input type="image" id="ltp_prev"
             src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_prev.png"
             title="Previous Section" ondrag="event.returnValue=false;" style="vertical-align:middle">
        <xsl:attribute name="onclick">
          CVPortal.components['cvDocHandler'].getTableSec(event,'prev','<xsl:value-of
                select="ancestor::DOCUMENT/@CEID"/>');
        </xsl:attribute>
        <xsl:if test="$currpage=1">
          <xsl:attribute name="disabled"/>
        </xsl:if>
      </input>

      <form style="display:inline;">
        <xsl:attribute name="onsubmit">
          javascript:CVPortal.components['cvDocHandler'].getTableSec(event,'goto','<xsl:value-of
                select="ancestor::DOCUMENT/@CEID"/>'); return false;
        </xsl:attribute>
        &#160;Section:
        <input type="text" size="2" id="currpage" name="currpage">
          <xsl:attribute name="value">
            <xsl:value-of select="$currpage"/>
          </xsl:attribute>
        </input>
        of
        <span id="totalpages">
          <xsl:value-of select="ancestor::table[1]/@totalpages"/>
        </span>
        <input type="submit" value="Go To Section" name="goto" id="goto" style="display:none"/>
        &#160;
      </form>

      <input type="image" id="ltp_next"
             src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_next.png"
             title="Next Section" ondrag="event.returnValue=false;" style="vertical-align:middle">
        <xsl:attribute name="onclick">
          CVPortal.components['cvDocHandler'].getTableSec(event,'next','<xsl:value-of
                select="ancestor::DOCUMENT/@CEID"/>');
        </xsl:attribute>
        <xsl:if test="$currpage=$totalpages">
          <xsl:attribute name="disabled"/>
        </xsl:if>
      </input>

      <input type="image" id="ltp_last"
             src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_last.png"
             title="Last Section" ondrag="event.returnValue=false;" style="vertical-align:middle">
        <xsl:attribute name="onclick">
          CVPortal.components['cvDocHandler'].getTableSec(event,'last','<xsl:value-of
                select="ancestor::DOCUMENT/@CEID"/>');
        </xsl:attribute>
        <xsl:if test="$currpage=$totalpages">
          <xsl:attribute name="disabled"/>
        </xsl:if>
      </input>
	</div>
</div>

<div id="findDialog" title="Find">
	<a href="#"  class="largeTableClose" title="Close"><img src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_close.png" ondrag="event.returnValue=false;" onclick="$('#findDialog, #tableSearchResults').hide(); $('#SRCHTERM').val('');" style="width:10px;height:10px;float:right;" /></a>
	<div style="padding:5px 10px;">

		<span><label style="font-family:Verdana;font-size:10pt"><xsl:value-of select="$style.table.findintable"/>: </label></span>
		<span><input id="SRCHTERM" autocomplete="off" TABINDEX="0" type="text" style="font-family:Verdana;font-size:10pt;width:160px" onKeyUp="check_key()" /></span>
		<div style="display:none;">
			<input id="WHOLEWORD" TYPE="CHECKBOX" style="font-family:Verdana;font-weight:bold;font-size:10pt; " />
			<label style="font-family:Verdana;font-weight:bold;font-size:10pt;"><xsl:value-of select="$style.table.wholeword"/></label>
			<input id="MATCHCASE" TYPE="CHECKBOX" style="font-family:Verdana;font-weight:bold;font-size:10pt; " />
			<label style="font-family:Verdana;font-weight:bold;font-size:10pt;"><xsl:value-of select="$style.table.matchcase"/></label>
			<input id="CURRSECTION" TYPE="CHECKBOX" style="font-family:Verdana;font-weight:bold;font-size:10pt; " />
			<label style="font-family:Verdana;font-weight:bold;font-size:10pt;"><xsl:value-of select="$style.table.currentsectiononly"/></label>
		</div>
		<img src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_searchbutton.png" id="dlg_find" title="Search" ondrag="event.returnValue=false;" onclick="CVPortal.components['cvDocHandler'].findWord(event);" style="vertical-align:middle" />
		<br/>
		<div id="tableSearchResults" style="display:none;">
			<img src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_prev.png" id="lt_prev" title="Previous Match" ondrag="event.returnValue=false;" onclick="CVPortal.components['cvDocHandler'].findPrev(event);" style="vertical-align:middle" />
			<xsl:value-of select="$style.table.result"/>: <!--<input id="lt_searchresults" style="width:60px;" />-->
			<span id="lt_searchresults">####</span> of <span id="lt_totalresults">####</span>
			<img src="wietmsd?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=lt_next.png" id="lt_next" title="Next Match" ondrag="event.returnValue=false;" onclick="CVPortal.components['cvDocHandler'].findNext(event);" style="vertical-align:middle" />
		</div>
	</div>
</div>
</xsl:if>
</div>
</xsl:template>

<xsl:template match="tgroup/processing-instruction('dbhtml')">
  <xsl:variable name="summary">
    <xsl:call-template name="dbhtml-attribute">
      <xsl:with-param name="pis" select="."/>
      <xsl:with-param name="attribute" select="'table-summary'"/>
    </xsl:call-template>
  </xsl:variable>

  <!-- Suppress the table-summary PI -->
  <xsl:if test="$summary = ''">
    <xsl:processing-instruction name="dbhtml">
      <xsl:value-of select="."/>
    </xsl:processing-instruction>
  </xsl:if>
</xsl:template>

<xsl:template match="colspec"></xsl:template>

<xsl:template match="spanspec"></xsl:template>

<xsl:template match="thead|tfoot">
  <xsl:element name="{name(.)}">
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="row[1]">
      <xsl:with-param name="spans">
        <xsl:call-template name="blank.spans">
          <xsl:with-param name="cols" select="../@cols"/>
        </xsl:call-template>
      </xsl:with-param>
    </xsl:apply-templates>

  </xsl:element>
</xsl:template>

<xsl:template match="tbody">
  <tbody>
	<!-- for extremely large table info -->
    <xsl:if test="@style">
      <xsl:attribute name="style">
        <xsl:value-of select="@style"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@CEID">
      <xsl:attribute name="CEID">
        <xsl:value-of select="@CEID"/>
      </xsl:attribute>
    </xsl:if>
	<xsl:if test="@totalrow">
        <xsl:attribute name="totalrow">
          <xsl:value-of select="@totalrow"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@totalpages">
        <xsl:attribute name="totalpages">
          <xsl:value-of select="@totalpages"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@islastpage">
        <xsl:attribute name="islastpage">
          <xsl:value-of select="@islastpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@isfirstpage">
        <xsl:attribute name="isfirstpage">
          <xsl:value-of select="@isfirstpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@currentpage">
        <xsl:attribute name="currentpage">
          <xsl:value-of select="@currentpage"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@TABLE_ID">
        <xsl:attribute name="TABLE_ID">
          <xsl:value-of select="@TABLE_ID"/>
        </xsl:attribute>
      </xsl:if>
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="row[1]">
      <xsl:with-param name="spans">
        <xsl:call-template name="blank.spans">
          <xsl:with-param name="cols" select="../@cols"/>
        </xsl:call-template>
      </xsl:with-param>
    </xsl:apply-templates>
	<xsl:if test="count(row)=0">
	<tr><td style="padding:10px;font-size:15px;"><xsl:value-of select="$style.table.noapplicabledatathissection"/></td></tr>
	</xsl:if>

  </tbody>
</xsl:template>

<xsl:template match="row" priority="4">
  <xsl:param name="spans"/>

  <xsl:variable name="row-height">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
        <xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
        <xsl:with-param name="attribute" select="'row-height'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="bgcolor">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
        <xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
        <xsl:with-param name="attribute" select="'bgcolor'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="class">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
        <xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
        <xsl:with-param name="attribute" select="'class'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <tr xsl:use-attribute-sets="standard"><!-- LAM:2021-10-27: copy core attributes (otherwise revision highlights doesn't work properly-->
    <xsl:call-template name="tr.attributes">
      <xsl:with-param name="rownum">
        <xsl:number from="tgroup" count="row"/>
      </xsl:with-param>
    </xsl:call-template>

    <xsl:if test="$row-height != ''">
      <xsl:attribute name="height">
        <xsl:value-of select="$row-height"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$bgcolor != ''">
      <xsl:attribute name="bgcolor">
        <xsl:value-of select="$bgcolor"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$class != ''">
      <xsl:attribute name="class">
        <xsl:value-of select="$class"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$table.borders.with.css != 0">
      <xsl:if test="@rowsep = 1 and following-sibling::row">
        <xsl:attribute name="style">
          <xsl:call-template name="border">
            <xsl:with-param name="side" select="'bottom'"/>
          </xsl:call-template>
        </xsl:attribute>
      </xsl:if>
    </xsl:if>

    <!-- LAM:2021-10-27: change management-->
    <xsl:if test="@reasonForUpdateRefIds"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>

    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="(entry|entrytbl)[1]">
      <xsl:with-param name="spans" select="$spans"/>
    </xsl:apply-templates>
  </tr>

  <xsl:if test="following-sibling::row">
    <xsl:variable name="nextspans">
      <xsl:apply-templates select="(entry|entrytbl)[1]" mode="span">
        <xsl:with-param name="spans" select="$spans"/>
      </xsl:apply-templates>
    </xsl:variable>

    <xsl:apply-templates select="following-sibling::row[1]">
      <xsl:with-param name="spans" select="$nextspans"/>
    </xsl:apply-templates>
  </xsl:if>
</xsl:template>

<xsl:template match="entry|entrytbl" name="entry">
  <xsl:param name="col" select="1"/>
  <xsl:param name="spans"/>

  <xsl:variable name="cellgi">
    <xsl:choose>
      <xsl:when test="ancestor::thead">th</xsl:when>
      <xsl:when test="ancestor::tfoot">th</xsl:when>
      <xsl:otherwise>td</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="empty.cell" select="count(node()) = 0"/>

  <xsl:variable name="named.colnum">
    <xsl:call-template name="entry.colnum"/>
  </xsl:variable>

  <xsl:variable name="entry.colnum">
    <xsl:choose>
      <xsl:when test="$named.colnum &gt; 0">
        <xsl:value-of select="$named.colnum"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$col"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="entry.colspan">
    <xsl:choose>
      <xsl:when test="@spanname or @namest">
        <xsl:call-template name="calculate.colspan"/>
      </xsl:when>
      <xsl:otherwise>1</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="following.spans">
    <xsl:call-template name="calculate.following.spans">
      <xsl:with-param name="colspan" select="$entry.colspan"/>
      <xsl:with-param name="spans" select="$spans"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="rowsep">
    <xsl:choose>
      <!-- If this is the last row, rowsep never applies. -->
      <xsl:when test="ancestor::entrytbl
                      and not (ancestor-or-self::row[1]/following-sibling::row)">
        <xsl:value-of select="0"/>
      </xsl:when>
      <xsl:when test="not(ancestor-or-self::row[1]/following-sibling::row
                          or ancestor-or-self::thead/following-sibling::tbody
                          or ancestor-or-self::tbody/preceding-sibling::tfoot)">
        <xsl:value-of select="0"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="inherited.table.attribute">
          <xsl:with-param name="entry" select="."/>
          <xsl:with-param name="colnum" select="$entry.colnum"/>
          <xsl:with-param name="attribute" select="'rowsep'"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="colsep">
    <xsl:choose>
      <!-- If this is the last column, colsep never applies. -->
      <xsl:when test="$following.spans = ''">0</xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="inherited.table.attribute">
          <xsl:with-param name="entry" select="."/>
          <xsl:with-param name="colnum" select="$entry.colnum"/>
          <xsl:with-param name="attribute" select="'colsep'"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="valign">
    <xsl:call-template name="inherited.table.attribute">
      <xsl:with-param name="entry" select="."/>
      <xsl:with-param name="colnum" select="$entry.colnum"/>
      <xsl:with-param name="attribute" select="'valign'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="align">
    <xsl:call-template name="inherited.table.attribute">
      <xsl:with-param name="entry" select="."/>
      <xsl:with-param name="colnum" select="$entry.colnum"/>
      <xsl:with-param name="attribute" select="'align'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="char">
    <xsl:call-template name="inherited.table.attribute">
      <xsl:with-param name="entry" select="."/>
      <xsl:with-param name="colnum" select="$entry.colnum"/>
      <xsl:with-param name="attribute" select="'char'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="charoff">
    <xsl:call-template name="inherited.table.attribute">
      <xsl:with-param name="entry" select="."/>
      <xsl:with-param name="colnum" select="$entry.colnum"/>
      <xsl:with-param name="attribute" select="'charoff'"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:choose>
    <xsl:when test="$spans != '' and not(starts-with($spans,'0:'))">
      <xsl:call-template name="entry">
        <xsl:with-param name="col" select="$col+1"/>
        <xsl:with-param name="spans" select="substring-after($spans,':')"/>
      </xsl:call-template>
    </xsl:when>

    <xsl:when test="$entry.colnum &gt; $col">
      <xsl:call-template name="empty.table.cell"/>
      <xsl:call-template name="entry">
        <xsl:with-param name="col" select="$col+1"/>
        <xsl:with-param name="spans" select="substring-after($spans,':')"/>
      </xsl:call-template>
    </xsl:when>

    <xsl:otherwise>
      <xsl:variable name="bgcolor">
		<xsl:if test="processing-instruction('dbhtml')">
          <xsl:call-template name="dbhtml-attribute">
            <xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
            <xsl:with-param name="attribute" select="'bgcolor'"/>
          </xsl:call-template>
        </xsl:if>
      </xsl:variable>

      <xsl:element name="{$cellgi}">
		<xsl:attribute name="class">content_td</xsl:attribute>
<!--
		<xsl:choose>
			<xsl:when test="$cellgi = 'th'">
				<xsl:attribute name="class">header</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="class">content_td_solid</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
-->
        <xsl:if test="$bgcolor != ''">
          <xsl:attribute name="bgcolor">
            <xsl:value-of select="$bgcolor"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$entry.propagates.style != 0 and @role">
          <xsl:attribute name="class">
            <xsl:value-of select="@role"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$show.revisionflag and @revisionflag">
          <xsl:attribute name="class">
            <xsl:value-of select="@revisionflag"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$table.borders.with.css != 0">
          <xsl:attribute name="style">
            <xsl:if test="$colsep &gt; 0">
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'right'"/>
              </xsl:call-template>
            </xsl:if>
            <xsl:if test="$rowsep &gt; 0">
              <xsl:call-template name="border">
                <xsl:with-param name="side" select="'bottom'"/>
              </xsl:call-template>
            </xsl:if>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="@morerows &gt; 0">
          <xsl:attribute name="rowspan">
            <xsl:value-of select="1+@morerows"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$entry.colspan &gt; 1">
          <xsl:attribute name="colspan">
            <xsl:value-of select="$entry.colspan"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$align != ''">
          <xsl:attribute name="align">
            <xsl:value-of select="$align"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$valign != ''">
          <xsl:attribute name="valign">
            <xsl:value-of select="$valign"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$char != ''">
          <xsl:attribute name="char">
            <xsl:value-of select="$char"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="$charoff != ''">
          <xsl:attribute name="charoff">
            <xsl:value-of select="$charoff"/>
          </xsl:attribute>
        </xsl:if>

        <xsl:if test="not(preceding-sibling::*) and ancestor::row/@id">
          <xsl:call-template name="anchor">
            <xsl:with-param name="node" select="ancestor::row[1]"/>
          </xsl:call-template>
        </xsl:if>

        <xsl:call-template name="anchor"/>

        <xsl:choose>
          <xsl:when test="$empty.cell">
            <xsl:text>&#160;</xsl:text>
          </xsl:when>
          <xsl:when test="self::entrytbl">
            <xsl:call-template name="tgroup"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>

      <xsl:choose>
        <xsl:when test="following-sibling::entry|following-sibling::entrytbl">
          <xsl:apply-templates select="(following-sibling::entry
                                       |following-sibling::entrytbl)[1]">
            <xsl:with-param name="col" select="$col+$entry.colspan"/>
            <xsl:with-param name="spans" select="$following.spans"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="finaltd">
            <xsl:with-param name="spans" select="$following.spans"/>
            <xsl:with-param name="col" select="$col+$entry.colspan"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template match="entry|entrytbl" name="sentry" mode="span">
  <xsl:param name="col" select="1"/>
  <xsl:param name="spans"/>

  <xsl:variable name="entry.colnum">
    <xsl:call-template name="entry.colnum"/>
  </xsl:variable>

  <xsl:variable name="entry.colspan">
    <xsl:choose>
      <xsl:when test="@spanname or @namest">
        <xsl:call-template name="calculate.colspan"/>
      </xsl:when>
      <xsl:otherwise>1</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="following.spans">
    <xsl:call-template name="calculate.following.spans">
      <xsl:with-param name="colspan" select="$entry.colspan"/>
      <xsl:with-param name="spans" select="$spans"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:choose>
    <xsl:when test="$spans != '' and not(starts-with($spans,'0:'))">
      <xsl:value-of select="substring-before($spans,':')-1"/>
      <xsl:text>:</xsl:text>
      <xsl:call-template name="sentry">
        <xsl:with-param name="col" select="$col+1"/>
        <xsl:with-param name="spans" select="substring-after($spans,':')"/>
      </xsl:call-template>
    </xsl:when>

    <xsl:when test="$entry.colnum &gt; $col">
      <xsl:text>0:</xsl:text>
      <xsl:call-template name="sentry">
        <xsl:with-param name="col" select="$col+$entry.colspan"/>
        <xsl:with-param name="spans" select="$following.spans"/>
      </xsl:call-template>
    </xsl:when>

    <xsl:otherwise>
      <xsl:call-template name="copy-string">
        <xsl:with-param name="count" select="$entry.colspan"/>
        <xsl:with-param name="string">
          <xsl:choose>
            <xsl:when test="@morerows">
              <xsl:value-of select="@morerows"/>
            </xsl:when>
            <xsl:otherwise>0</xsl:otherwise>
          </xsl:choose>
          <xsl:text>:</xsl:text>
        </xsl:with-param>
      </xsl:call-template>

      <xsl:choose>
        <xsl:when test="following-sibling::entry|following-sibling::entrytbl">
          <xsl:apply-templates select="(following-sibling::entry
                                        |following-sibling::entrytbl)[1]"
                               mode="span">
            <xsl:with-param name="col" select="$col+$entry.colspan"/>
            <xsl:with-param name="spans" select="$following.spans"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="sfinaltd">
            <xsl:with-param name="spans" select="$following.spans"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="generate.colgroup">
  <xsl:param name="cols" select="1"/>
  <xsl:param name="count" select="1"/>
  <xsl:choose>
    <xsl:when test="$count &gt; $cols"></xsl:when>
    <xsl:otherwise>
      <xsl:call-template name="generate.col">
        <xsl:with-param name="countcol" select="$count"/>
      </xsl:call-template>
      <xsl:call-template name="generate.colgroup">
        <xsl:with-param name="cols" select="$cols"/>
        <xsl:with-param name="count" select="$count+1"/>
      </xsl:call-template>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- *************************************** -->
<!-- ****** COLSPEC **** -->
<!-- *************************************** -->
<xsl:template name="generate.col">
  <xsl:param name="countcol">1</xsl:param>
  <xsl:param name="colspecs" select="./colspec"/>
  <xsl:param name="count">1</xsl:param>
  <xsl:param name="colnum">1</xsl:param>

  <xsl:choose>
    <xsl:when test="$count>count($colspecs)">
      <col/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="colspec" select="$colspecs[$count=position()]"/>
      <xsl:variable name="colspec.colnum">
        <xsl:choose>
          <xsl:when test="$colspec/@colnum">
            <xsl:value-of select="$colspec/@colnum"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$colnum"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:choose>
        <xsl:when test="$colspec.colnum=$countcol">
          <col><xsl:attribute name="id"><xsl:value-of select="generate-id()"/></xsl:attribute>
            <xsl:if test="$colspec/@colwidth
                          and $use.extensions != 0
                          or $tablecolumns.extension != 0">

				<xsl:variable name="raw_width">
					<xsl:value-of select="$colspec/@colwidth"/>
				</xsl:variable>
				<xsl:choose>
				  <xsl:when test="contains($raw_width,'*')">
						<xsl:variable name="total_proportions">
							<xsl:call-template name="calc_total_props">
								<xsl:with-param name="colspecs" select="$colspecs"/>
								<xsl:with-param name="colspecs_count" select="1"/>
								<xsl:with-param name="total_widths" select="0"/>
							</xsl:call-template>
						</xsl:variable>
						<xsl:variable name="normalize_width">
							<xsl:value-of select="normalize-space($raw_width)"/>
						</xsl:variable>
						<xsl:variable name="proportion">
							<xsl:choose>
								<xsl:when test="$normalize_width = '*'">
									<xsl:value-of select="number('1')"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="translate($normalize_width,'*','')"/>
								</xsl:otherwise>
						</xsl:choose>
						</xsl:variable>

						<xsl:variable name="total_columns"><xsl:value-of select="$colspecs/ancestor::tgroup/@cols"/></xsl:variable>
						<xsl:variable name="ratio_multiplier"><xsl:value-of select="number($total_columns) div number($total_proportions)"/></xsl:variable>
						<xsl:variable name="col_percentage"><xsl:value-of select="(number($ratio_multiplier) * number($proportion)) div number($total_columns)"/></xsl:variable>
						<xsl:variable name="calc_width"><xsl:value-of select="format-number($col_percentage,'#%')"/></xsl:variable>

						<xsl:attribute name="style">width:<xsl:value-of select="$calc_width"/>;</xsl:attribute>
						<xsl:attribute name="width"><xsl:value-of select="$calc_width"/></xsl:attribute>
				  </xsl:when>
				  <xsl:otherwise>
						<xsl:attribute name="width"><xsl:value-of select="$raw_width"/></xsl:attribute>
				  </xsl:otherwise>
				</xsl:choose>
            </xsl:if>


            <xsl:choose>
              <xsl:when test="$colspec/@align">
                <xsl:attribute name="align">
                  <xsl:value-of select="$colspec/@align"/>
                </xsl:attribute>
              </xsl:when>
              <!-- Suggested by Pavel ZAMPACH <zampach@nemcb.cz> -->
			  <xsl:otherwise>
				<xsl:choose>
					<xsl:when test="$colspecs/ancestor::colspec/@align">
						<xsl:attribute name="align">
						  <xsl:value-of select="$colspecs/ancestor::colspec/@align"/>
						</xsl:attribute>
					</xsl:when>
					<xsl:otherwise>
						<xsl:if test="$colspecs/ancestor::tgroup/@align">
							<xsl:attribute name="align">
							  <xsl:value-of select="$colspecs/ancestor::tgroup/@align"/>
							</xsl:attribute>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
			  </xsl:otherwise>
            </xsl:choose>

            <xsl:if test="$colspec/@char">
              <xsl:attribute name="char">
                <xsl:value-of select="$colspec/@char"/>
              </xsl:attribute>
            </xsl:if>
            <xsl:if test="$colspec/@charoff">
              <xsl:attribute name="charoff">
                <xsl:value-of select="$colspec/@charoff"/>
              </xsl:attribute>
            </xsl:if>
          </col>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="generate.col">
            <xsl:with-param name="countcol" select="$countcol"/>
            <xsl:with-param name="colspecs" select="$colspecs"/>
            <xsl:with-param name="count" select="$count+1"/>
            <xsl:with-param name="colnum">
              <xsl:choose>
                <xsl:when test="$colspec/@colnum">
                  <xsl:value-of select="$colspec/@colnum + 1"/>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="$colnum + 1"/>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:with-param>
           </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<!-- *************************************** -->
<!-- ****** COL WIDTH **** -->
<!-- *************************************** -->
<xsl:template name="colspec.colwidth">
  <!-- when this macro is called, the current context must be an entry -->
  <xsl:param name="colname"></xsl:param>
  <!-- .. = row, ../.. = thead|tbody, ../../.. = tgroup -->
  <xsl:param name="colspecs" select="../../../../tgroup/colspec"/>
  <xsl:param name="count">1</xsl:param>
  <xsl:choose>
    <xsl:when test="$count>count($colspecs)"></xsl:when>
    <xsl:otherwise>
      <xsl:variable name="colspec" select="$colspecs[$count=position()]"/>
      <xsl:choose>
        <xsl:when test="$colspec/@colname=$colname">
          <xsl:value-of select="$colspec/@colwidth"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="colspec.colwidth">
            <xsl:with-param name="colname" select="$colname"/>
            <xsl:with-param name="colspecs" select="$colspecs"/>
            <xsl:with-param name="count" select="$count+1"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- ====================================================================== -->

<xsl:template name="calc_total_props">
  <xsl:param name="colspecs" select="../../../../tgroup/colspec"/>
  <xsl:param name="colspecs_count">1</xsl:param>
  <xsl:param name="total_widths">0</xsl:param>
	<xsl:choose>
		<xsl:when test="not($colspecs_count &gt; count($colspecs))">
			<xsl:variable name="raw_colwidth" select="$colspecs[$colspecs_count=position()]/@colwidth"/>
			<xsl:variable name="normalize_colwidth" select="normalize-space($raw_colwidth)"/>
			<xsl:variable name="current_width">
				<xsl:choose>
					<xsl:when test="$normalize_colwidth = '*'">
						<xsl:value-of select="number('1')"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="translate($normalize_colwidth,'*','')"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:call-template name="calc_total_props">
				<xsl:with-param name="colspecs" select="$colspecs"/>
				<xsl:with-param name="colspecs_count" select="$colspecs_count+1"/>
				<xsl:with-param name="total_widths" select="number($total_widths) + number($current_width)"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$total_widths"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!-- ====================================================================== -->

<xsl:template name="tr.attributes">
  <xsl:param name="row" select="."/>
  <xsl:param name="rownum" select="0"/>

  <!-- by default, do nothing. But you might want to say:

  <xsl:variable name="row_type">
    <xsl:choose>
      <xsl:when test="ancestor::thead">thead</xsl:when>
      <xsl:when test="ancestor::tfoot">tfoot</xsl:when>
      <xsl:otherwise>tbody</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

    <xsl:if test="$row_type != 'tbody'">
		<xsl:attribute name="class">header_tr</xsl:attribute>
	</xsl:if>

  <xsl:if test="$rownum mod 2 = 0">
    <xsl:attribute name="class">oddrow</xsl:attribute>
  </xsl:if>

  -->
</xsl:template>
<!-- FROM previous table.xsl -->

<xsl:template match="table" priority="3">
<p>
	<xsl:if test="tgroup/@align = 'center'">
		<xsl:attribute name="style">text-align:center</xsl:attribute>
	</xsl:if>
	<span xsl:use-attribute-sets="standard"/>
	<xsl:apply-templates/>
</p>
</xsl:template>
<xsl:template match="table/title">
	<span class="table_title">
  <xsl:call-template name="security_portion_mark"/>
		Table <xsl:number level="any" count="table/title" format="1."/><xsl:text> </xsl:text>
		<xsl:apply-templates/>
	</span>
</xsl:template>

<!-- END FROM previous table.xsl -->
<!-- START common/table.xsl - 7/6/2010 -->
<xsl:template name="blank.spans">
  <xsl:param name="cols" select="1"/>
  <xsl:if test="$cols &gt; 0">
    <xsl:text>0:</xsl:text>
    <xsl:call-template name="blank.spans">
      <xsl:with-param name="cols" select="$cols - 1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="calculate.following.spans">
  <xsl:param name="colspan" select="1"/>
  <xsl:param name="spans" select="''"/>

  <xsl:choose>
    <xsl:when test="$colspan &gt; 0">
      <xsl:call-template name="calculate.following.spans">
        <xsl:with-param name="colspan" select="$colspan - 1"/>
        <xsl:with-param name="spans" select="substring-after($spans,':')"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$spans"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="finaltd">
  <xsl:param name="spans"/>
  <xsl:param name="col" select="0"/>

  <xsl:if test="$spans != ''">
    <xsl:choose>
      <xsl:when test="starts-with($spans,'0:')">
        <xsl:call-template name="empty.table.cell">
          <xsl:with-param name="colnum" select="$col"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>

    <xsl:call-template name="finaltd">
      <xsl:with-param name="spans" select="substring-after($spans,':')"/>
      <xsl:with-param name="col" select="$col+1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="sfinaltd">
  <xsl:param name="spans"/>

  <xsl:if test="$spans != ''">
    <xsl:choose>
      <xsl:when test="starts-with($spans,'0:')">0:</xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="substring-before($spans,':')-1"/>
        <xsl:text>:</xsl:text>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:call-template name="sfinaltd">
      <xsl:with-param name="spans" select="substring-after($spans,':')"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="entry.colnum">
  <xsl:param name="entry" select="."/>

  <xsl:choose>
    <xsl:when test="$entry/@spanname">
      <xsl:variable name="spanname" select="$entry/@spanname"/>
      <xsl:variable name="spanspec"
                    select="($entry/ancestor::tgroup/spanspec[@spanname=$spanname]
                             |$entry/ancestor::entrytbl/spanspec[@spanname=$spanname])[last()]"/>
      <xsl:variable name="colspec"
                    select="($entry/ancestor::tgroup/colspec[@colname=$spanspec/@namest]
                             |$entry/ancestor::entrytbl/colspec[@colname=$spanspec/@namest])[last()]"/>
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colspec" select="$colspec"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:when test="$entry/@colname">
      <xsl:variable name="colname" select="$entry/@colname"/>
      <xsl:variable name="colspec"
                    select="($entry/ancestor::tgroup/colspec[@colname=$colname]
                             |$entry/ancestor::entrytbl/colspec[@colname=$colname])[last()]"/>
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colspec" select="$colspec"/>
      </xsl:call-template>
    </xsl:when>
    <xsl:when test="$entry/@namest">
      <xsl:variable name="namest" select="$entry/@namest"/>
      <xsl:variable name="colspec"
                    select="($entry/ancestor::tgroup/colspec[@colname=$namest]
                             |$entry/ancestor::entrytbl/colspec[@colname=$namest])[last()]"/>
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colspec" select="$colspec"/>
      </xsl:call-template>
    </xsl:when>
    <!-- no idea, return 0 -->
    <xsl:otherwise>0</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<doc:template name="entry.colnum" xmlns="">
<refpurpose><xsl:value-of select="$style.table.determinecolumnnumber"/></refpurpose>
<refdescription>
<para><xsl:value-of select="$style.table.ifan"/> <sgmltag><xsl:value-of select="$style.table.entry"/></sgmltag> <xsl:value-of select="$style.table.hasa"/>
<sgmltag class="attribute">colname</sgmltag> <xsl:value-of select="$style.table.or"/>
<sgmltag class="attribute">namest</sgmltag> <xsl:value-of select="$style.table.attributethistemplate"/>
<xsl:value-of select="$style.table.determinenumberofthecolumn"/>
<xsl:value-of select="$style.table.forother"/> <sgmltag><xsl:value-of select="$style.table.entry"/></sgmltag><xsl:value-of select="$style.table.nothingisreturned"/></para>
</refdescription>
<refparameter>
<variablelist>
<varlistentry><term><xsl:value-of select="$style.table.entry"/></term>
<listitem>
<para><xsl:value-of select="$style.table.the"/> <sgmltag><xsl:value-of select="$style.table.entry"/></sgmltag>-<xsl:value-of select="$style.table.elementtobetested"/></para>
</listitem>
</varlistentry>
</variablelist>
</refparameter>

<refreturn>
<para><xsl:value-of select="$style.table.returnsthecolumnnumber"/>
<xsl:value-of select="$style.table.orzero"/></para>
</refreturn>
</doc:template>

<xsl:template name="colspec.colnum">
  <xsl:param name="colspec" select="."/>
  <xsl:choose>
    <xsl:when test="$colspec/@colnum">
      <xsl:value-of select="$colspec/@colnum"/>
    </xsl:when>
    <xsl:when test="$colspec/preceding-sibling::colspec">
      <xsl:variable name="prec.colspec.colnum">
        <xsl:call-template name="colspec.colnum">
          <xsl:with-param name="colspec"
                          select="$colspec/preceding-sibling::colspec[1]"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:value-of select="$prec.colspec.colnum + 1"/>
    </xsl:when>
    <xsl:otherwise>1</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="calculate.colspan">
  <xsl:param name="entry" select="."/>
  <xsl:variable name="spanname" select="$entry/@spanname"/>
  <xsl:variable name="spanspec"
                select="($entry/ancestor::tgroup/spanspec[@spanname=$spanname]
                         |$entry/ancestor::entrytbl/spanspec[@spanname=$spanname])[last()]"/>

  <xsl:variable name="namest">
    <xsl:choose>
      <xsl:when test="@spanname">
        <xsl:value-of select="$spanspec/@namest"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$entry/@namest"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="nameend">
    <xsl:choose>
      <xsl:when test="@spanname">
        <xsl:value-of select="$spanspec/@nameend"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$entry/@nameend"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="scol">
    <xsl:call-template name="colspec.colnum">
      <xsl:with-param name="colspec"
                      select="($entry/ancestor::tgroup/colspec[@colname=$namest]
                               |$entry/ancestor::entrytbl/colspec[@colname=$namest])[last()]"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="ecol">
    <xsl:call-template name="colspec.colnum">
      <xsl:with-param name="colspec"
                      select="($entry/ancestor::tgroup/colspec[@colname=$nameend]
                               |$entry/ancestor::entrytbl/colspec[@colname=$nameend])[last()]"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:choose>
    <xsl:when test="$namest != '' and $nameend != ''">
      <xsl:choose>
        <xsl:when test="$ecol &gt;= $scol">
          <xsl:value-of select="$ecol - $scol + 1"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$scol - $ecol + 1"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>1</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="calculate.rowsep">
  <xsl:param name="entry" select="."/>
  <xsl:param name="colnum" select="0"/>

  <xsl:call-template name="inherited.table.attribute">
    <xsl:with-param name="entry" select="$entry"/>
    <xsl:with-param name="colnum" select="$colnum"/>
    <xsl:with-param name="attribute" select="'rowsep'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="calculate.colsep">
  <xsl:param name="entry" select="."/>
  <xsl:param name="colnum" select="0"/>

  <xsl:call-template name="inherited.table.attribute">
    <xsl:with-param name="entry" select="$entry"/>
    <xsl:with-param name="colnum" select="$colnum"/>
    <xsl:with-param name="attribute" select="'colsep'"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="inherited.table.attribute">
  <xsl:param name="entry" select="."/>
  <xsl:param name="row" select="$entry/ancestor-or-self::row[1]"/>
  <xsl:param name="colnum" select="0"/>
  <xsl:param name="attribute" select="'colsep'"/>

  <xsl:variable name="tgroup" select="$row/ancestor::tgroup[1]"/>

  <xsl:variable name="table" select="($tgroup/ancestor::table
                                     |$tgroup/ancestor::informaltable)[1]"/>

  <xsl:variable name="entry.value">
    <xsl:call-template name="get-attribute">
      <xsl:with-param name="element" select="$entry"/>
      <xsl:with-param name="attribute" select="$attribute"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="row.value">
    <xsl:call-template name="get-attribute">
      <xsl:with-param name="element" select="$row"/>
      <xsl:with-param name="attribute" select="$attribute"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="span.value">
    <xsl:if test="$entry/@spanname">
      <xsl:variable name="spanname" select="$entry/@spanname"/>
      <xsl:variable name="spanspec"
                    select="$tgroup/spanspec[@spanname=$spanname]"/>
      <xsl:variable name="span.colspec"
                    select="$tgroup/colspec[@colname=$spanspec/@namest]"/>

      <xsl:variable name="spanspec.value">
        <xsl:call-template name="get-attribute">
          <xsl:with-param name="element" select="$spanspec"/>
          <xsl:with-param name="attribute" select="$attribute"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:variable name="scolspec.value">
        <xsl:call-template name="get-attribute">
          <xsl:with-param name="element" select="$span.colspec"/>
          <xsl:with-param name="attribute" select="$attribute"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:choose>
        <xsl:when test="$spanspec.value != ''">
          <xsl:value-of select="$spanspec.value"/>
        </xsl:when>
        <xsl:when test="$scolspec.value != ''">
          <xsl:value-of select="$scolspec.value"/>
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="namest.value">
    <xsl:if test="$entry/@namest">
      <xsl:variable name="namest" select="$entry/@namest"/>
      <xsl:variable name="colspec"
                    select="$tgroup/colspec[@colname=$namest]"/>

      <xsl:variable name="inner.namest.value">
        <xsl:call-template name="get-attribute">
          <xsl:with-param name="element" select="$colspec"/>
          <xsl:with-param name="attribute" select="$attribute"/>
        </xsl:call-template>
      </xsl:variable>

      <xsl:choose>
        <xsl:when test="$inner.namest.value">
          <xsl:value-of select="$inner.namest.value"/>
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="tgroup.value">
    <xsl:call-template name="get-attribute">
      <xsl:with-param name="element" select="$tgroup"/>
      <xsl:with-param name="attribute" select="$attribute"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="table.value">
    <xsl:call-template name="get-attribute">
      <xsl:with-param name="element" select="$table"/>
      <xsl:with-param name="attribute" select="$attribute"/>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="default.value">
    <!-- This section used to say that rowsep and colsep have defaults based -->
    <!-- on the frame setting. Further reflection and closer examination of the -->
    <!-- CALS spec reveals I was mistaken. The default is "1" for rowsep and colsep. -->
    <!-- For everything else, the default is the tgroup value -->
    <xsl:choose>
      <xsl:when test="$tgroup.value != ''">
        <xsl:value-of select="$tgroup.value"/>
      </xsl:when>
      <xsl:when test="$attribute = 'rowsep'">1</xsl:when>
      <xsl:when test="$attribute = 'colsep'">1</xsl:when>
      <xsl:otherwise><!-- empty --></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:variable name="thead.colspec" select="../../colspec"/>
  <xsl:variable name="tgroup.colspec" select="../../../colspec"/>

  <xsl:choose>
    <xsl:when test="$entry.value != ''">
      <xsl:value-of select="$entry.value"/>
    </xsl:when>
    <xsl:when test="$row.value != ''">
      <xsl:value-of select="$row.value"/>
    </xsl:when>
	<!--
    <xsl:when test="$tgroup.value != ''">
      <xsl:value-of select="$tgroup.value"/>
    </xsl:when>
	-->
    <xsl:when test="$table.value != ''">
      <xsl:value-of select="$table.value"/>
    </xsl:when>
    <xsl:when test="$span.value != ''">
      <xsl:value-of select="$span.value"/>
    </xsl:when>
    <xsl:when test="$namest.value != ''">
      <xsl:value-of select="$namest.value"/>
    </xsl:when>
    <xsl:when test="$colnum &gt; 0 and $thead.colspec">
      <xsl:variable name="calc.colvalue">
        <xsl:call-template name="colnum.colspec">
          <xsl:with-param name="colnum" select="$colnum"/>
		  <xsl:with-param name="colspecs" select="$thead.colspec"/>
          <xsl:with-param name="attribute" select="$attribute"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:choose>
        <xsl:when test="$calc.colvalue != ''">
          <xsl:value-of select="$calc.colvalue"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$default.value"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:when test="$colnum &gt; 0 and $tgroup.colspec">
      <xsl:variable name="calc.colvalue">
        <xsl:call-template name="colnum.colspec">
          <xsl:with-param name="colnum" select="$colnum"/>
		  <xsl:with-param name="colspecs" select="$tgroup.colspec"/>
          <xsl:with-param name="attribute" select="$attribute"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:choose>
        <xsl:when test="$calc.colvalue != ''">
          <xsl:value-of select="$calc.colvalue"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$default.value"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$default.value"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="colnum.colspec">
  <xsl:param name="colnum" select="0"/>
  <xsl:param name="attribute" select="'colname'"/>
  <xsl:param name="colspecs" select="ancestor::tgroup/colspec"/>
  <xsl:param name="count" select="1"/>

  <xsl:choose>
    <xsl:when test="not($colspecs) or $count &gt; $colnum">
      <!-- nop -->
    </xsl:when>
    <xsl:when test="$colspecs[1]/@colnum">
      <xsl:choose>
        <xsl:when test="$colspecs[1]/@colnum = $colnum">
          <xsl:call-template name="get-attribute">
            <xsl:with-param name="element" select="$colspecs[1]"/>
            <xsl:with-param name="attribute" select="$attribute"/>
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="colnum.colspec">
            <xsl:with-param name="colnum" select="$colnum"/>
            <xsl:with-param name="attribute" select="$attribute"/>
            <xsl:with-param name="colspecs"
                            select="$colspecs[position()&gt;1]"/>
            <xsl:with-param name="count"
                            select="$colspecs[1]/@colnum+1"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:when>
    <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="$count = $colnum">
          <xsl:call-template name="get-attribute">
            <xsl:with-param name="element" select="$colspecs[1]"/>
            <xsl:with-param name="attribute" select="$attribute"/>
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="colnum.colspec">
            <xsl:with-param name="colnum" select="$colnum"/>
            <xsl:with-param name="attribute" select="$attribute"/>
            <xsl:with-param name="colspecs"
                            select="$colspecs[position()&gt;1]"/>
            <xsl:with-param name="count" select="$count+1"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="get-attribute">
  <xsl:param name="element" select="."/>
  <xsl:param name="attribute" select="''"/>

  <xsl:for-each select="$element/@*">
    <xsl:if test="local-name(.) = $attribute">
      <xsl:value-of select="."/>
    </xsl:if>
  </xsl:for-each>
</xsl:template>
<!-- END common/table.xsl - 7/6/2010 -->
<!-- START xhtml/table.xsl - 7/6/2010 -->

<xsl:template match="tgroup/processing-instruction('dbhtml')">
  <xsl:variable name="summary">
    <xsl:call-template name="dbhtml-attribute">
      <xsl:with-param name="pis" select="."/>
      <xsl:with-param name="attribute" select="'table-summary'"/>
    </xsl:call-template>
  </xsl:variable>

  <!-- Suppress the table-summary PI -->
  <xsl:if test="$summary = ''">
    <xsl:processing-instruction name="dbhtml">
      <xsl:value-of select="."/>
    </xsl:processing-instruction>
  </xsl:if>
</xsl:template>

<!-- DISABLED Duplicate
<xsl:template match="colspec"/>

<xsl:template match="spanspec"/>

<xsl:template match="thead|tfoot">
  <xsl:element name="{name(.)}" namespace="http://www.w3.org/1999/xhtml">
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="row[1]">
      <xsl:with-param name="spans">
        <xsl:call-template name="blank.spans">
          <xsl:with-param name="cols" select="../@cols"/>
        </xsl:call-template>
      </xsl:with-param>
    </xsl:apply-templates>

  </xsl:element>
</xsl:template>

<xsl:template match="tbody">
  <tbody>
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="row[1]">
      <xsl:with-param name="spans">
        <xsl:call-template name="blank.spans">
          <xsl:with-param name="cols" select="../@cols"/>
        </xsl:call-template>
      </xsl:with-param>
    </xsl:apply-templates>

  </tbody>
</xsl:template>
-->
<!-- DISABLED Duplicate
<xsl:template match="row">
  <xsl:param name="spans"/>

  <xsl:variable name="row-height">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
        <xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
        <xsl:with-param name="attribute" select="'row-height'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="bgcolor">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
	<xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
	<xsl:with-param name="attribute" select="'bgcolor'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="class">
    <xsl:if test="processing-instruction('dbhtml')">
      <xsl:call-template name="dbhtml-attribute">
	<xsl:with-param name="pis" select="processing-instruction('dbhtml')"/>
	<xsl:with-param name="attribute" select="'class'"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:variable>

  <tr>
    <xsl:call-template name="tr.attributes">
      <xsl:with-param name="rownum">
        <xsl:number from="tgroup" count="row"/>
      </xsl:with-param>
    </xsl:call-template>

    <xsl:if test="$row-height != ''">
      <xsl:attribute name="height">
        <xsl:value-of select="$row-height"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$bgcolor != ''">
      <xsl:attribute name="bgcolor">
        <xsl:value-of select="$bgcolor"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$class != ''">
      <xsl:attribute name="class">
        <xsl:value-of select="$class"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:if test="$table.borders.with.css != 0">
      <xsl:if test="@rowsep = 1 and following-sibling::row">
        <xsl:attribute name="style">
          <xsl:call-template name="border">
            <xsl:with-param name="side" select="'bottom'"/>
          </xsl:call-template>
        </xsl:attribute>
      </xsl:if>
    </xsl:if>

    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>

    <xsl:apply-templates select="(entry|entrytbl)[1]">
      <xsl:with-param name="spans" select="$spans"/>
    </xsl:apply-templates>
  </tr>

  <xsl:if test="following-sibling::row">
    <xsl:variable name="nextspans">
      <xsl:apply-templates select="(entry|entrytbl)[1]" mode="span">
        <xsl:with-param name="spans" select="$spans"/>
      </xsl:apply-templates>
    </xsl:variable>

    <xsl:apply-templates select="following-sibling::row[1]">
      <xsl:with-param name="spans" select="$nextspans"/>
    </xsl:apply-templates>
  </xsl:if>
</xsl:template>
-->
<!-- ====================================================================== -->
<!-- END xhtml/table.xsl - 7/6/2010 -->


<xsl:template name="dbhtml-attribute">
  <xsl:param name="pis" select="processing-instruction('dbhtml')"/>
  <xsl:param name="attribute">filename</xsl:param>

  <xsl:call-template name="pi-attribute">
    <xsl:with-param name="pis" select="$pis"/>
    <xsl:with-param name="attribute" select="$attribute"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="anchor">
  <xsl:param name="node" select="."/>
  <xsl:param name="conditional" select="1"/>
  <xsl:variable name="id">
    <xsl:call-template name="object.id">
      <xsl:with-param name="object" select="$node"/>
    </xsl:call-template>
  </xsl:variable>
  <xsl:if test="$conditional = 0 or $node/@id">
    <a id="{$id}"/>
  </xsl:if>
</xsl:template>

<xsl:template name="copy-string">
  <!-- returns 'count' copies of 'string' -->
  <xsl:param name="string"/>
  <xsl:param name="count" select="0"/>
  <xsl:param name="result"/>

  <xsl:choose>
    <xsl:when test="$count&gt;0">
      <xsl:call-template name="copy-string">
        <xsl:with-param name="string" select="$string"/>
        <xsl:with-param name="count" select="$count - 1"/>
        <xsl:with-param name="result">
          <xsl:value-of select="$result"/>
          <xsl:value-of select="$string"/>
        </xsl:with-param>
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$result"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="pi-attribute">
  <xsl:param name="pis" select="processing-instruction('BOGUS_PI')"/>
  <xsl:param name="attribute">filename</xsl:param>
  <xsl:param name="count">1</xsl:param>

  <xsl:choose>
    <xsl:when test="$count&gt;count($pis)">
      <!-- not found -->
    </xsl:when>
    <xsl:otherwise>
      <xsl:variable name="pi">
        <xsl:value-of select="$pis[$count]"/>
      </xsl:variable>
      <xsl:variable name="pivalue">
        <xsl:value-of select="concat(' ', normalize-space($pi))"/>
      </xsl:variable>
      <xsl:choose>
        <xsl:when test="contains($pivalue,concat(' ', $attribute, '='))">
          <xsl:variable name="rest" select="substring-after($pivalue,concat(' ', $attribute,'='))"/>
          <xsl:variable name="quote" select="substring($rest,1,1)"/>
          <xsl:value-of select="substring-before(substring($rest,2),$quote)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:call-template name="pi-attribute">
            <xsl:with-param name="pis" select="$pis"/>
            <xsl:with-param name="attribute" select="$attribute"/>
            <xsl:with-param name="count" select="$count + 1"/>
          </xsl:call-template>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="object.id">
  <xsl:param name="object" select="."/>
  <xsl:choose>
    <xsl:when test="$object/@id">
      <xsl:value-of select="$object/@id"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="generate-id($object)"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>

