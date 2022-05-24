<?xml version="1.0" encoding="ISO-8859-1"?>
<!-- $Id: XY/etc/FullSupport/httpdocs/styles/select.xsl 2.0 2019/05/23 22:09:58GMT milind Exp  $ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output indent="yes" method="xml" omit-xml-declaration="yes"/>

  <xsl:param name="app_name"/>

  <xsl:template match="*">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="text()"><xsl:copy-of select="."/></xsl:template>

  <xsl:template match="configuration"/>

  <xsl:template match="collectionslist">
    <br/><br/><br/>
    <table cellspacing='0' cellpadding='10' width="100%">
    <col width="20%"/>
    <col width="16%"/>
    <col width="16%"/>
    <col width="16%"/>
    <col width="16%"/>
    <col width="16%"/>
    <!--Battle_of_Britain_Memorial_Flight_Crest.jpg-->
    <tr>
    <td valign="top"><img style="width:222px;height:300px">
    <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=aircraft/Battle_of_Britain_Memorial_Flight_Crest.jpg</xsl:attribute>
    </img><br/><br/><img style="width:222px;height:95px">
    <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=aircraft/raf-logo.jpg</xsl:attribute>
    </img></td>
    <td valign="top"><xsl:apply-templates select="./collection/booklist/book[configitem[@name='bookModel']/value[.='SPITFIRE']]"/></td>
    <td valign="top"><xsl:apply-templates select="./collection/booklist/book[configitem[@name='bookModel']/value[.='HURRICANE']]"/></td>
    <td valign="top"><xsl:apply-templates select="./collection/booklist/book[configitem[@name='bookModel']/value[.='LANCASTER']]"/></td>
    <td valign="top"><xsl:apply-templates select="./collection/booklist/book[configitem[@name='bookModel']/value[.='DAKOTA']]"/></td>
    <td valign="top"><xsl:apply-templates select="./collection/booklist/book[configitem[@name='bookModel']/value[.='CHIPMUNK']]"/></td>
    </tr></table>
  </xsl:template>

  <xsl:template match="collection">
    <tr><td height='30px' colspan='4'><span> </span></td></tr>
    <tr class="section-header">
      <td/>
      <td height='30px'><b><xsl:choose>
        <xsl:when test="configitem[@name='description']">
          <xsl:value-of select="configitem[@name='description']"/><span> </span>
        </xsl:when>
        <xsl:otherwise>Collection</xsl:otherwise>
      </xsl:choose></b></td>
      <td>Publish Date</td>
      <td colspan="3">Issue</td>
    </tr>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="configitem"/>

  <xsl:template match="collection/configitem"/>

<!--
<collectionslist>
  <collection name="SPITFIRE_AMM_AIPC">
    <configitem name="dir"><value></value></configitem>
    <configitem name="http_name"><value>SPITFIRE_AMM_AIPC_HTTP</value></configitem>
    <booklist>
      <book name="pmc_spitfire_kcxr8_29dft_02_en-us">
        <configitem name="bookTextDB"><value>pmc_spitfire_kcxr8_29dft_02_en-us.pdm</value></configitem>
        <configitem name="bookTitle"><value>SPITFIRE AIRCRAFT MAINTENANCE MANUAL AND ILLUSTRATED PARTS BREAKDOWN</value></configitem>
        <configitem name="bookModel"><value>SPITFIRE</value></configitem>
        <configitem name="bookDescription"><value>SPITFIRE AIRCRAFT MAINTENANCE MANUAL AND ILLUSTRATED PARTS BREAKDOWN</value></configitem>
        <configitem name="PubDate.value"><value>05/19/2020</value></configitem>
        <configitem name="PubIssue.value"><value>000</value></configitem>
        <configitem name="IssueAuthority"><value/></configitem>
        <configitem name="PubVolume.value"><value>02</value></configitem>
        <configitem name="search"><value>systtlSearch;tpcttlSearch;fgrttlSearch;tblttlSearch;pnrSearch;dfpSearch;mfcSearch;docidSearch</value></configitem>
        <configitem name="change_level"><value>000</value></configitem>
        <configitem name="PubNumber.value"><value>PMC-SPITFIRE-KCXR8-29DFT-02_EN-US</value></configitem>
        <configitem name="front_matter_html"><value>front.html</value></configitem>
      </book>
    </booklist>
  </collection>
</collectionslist>
-->
  <xsl:template match="book" priority="10">
    <table cellspacing='0' cellpadding='0' width="100%" style="border-collapse:collapse; border:1px solid #5d8aa8">
    <tr class="collection-book-row"><td valign="middle" align="center" height="150px"><center><xsl:apply-templates select="configitem[@name='PubNumber.value']"/></center></td></tr>
    <tr class="collection-book-row"><td valign="top" height="150px" style="background-color:#5d8aa8"><b style="color:#fff;"><xsl:apply-templates select="configitem[@name='bookTitle']"/></b></td></tr>
    <tr class="collection-book-row"><td valign="top"><xsl:apply-templates select="configitem[@name='PubDate.value']"/></td></tr>
    <tr class="collection-book-row"><td valign="top"><xsl:apply-templates select="configitem[@name='change_level']"/></td></tr>
    <tr class="collection-book-row"><td align="right" valign="top" height="40">
      <xsl:variable name="bookname" select="@name"/>
      <xsl:variable name="collectionname" select="../../@name"/>
      <table cellspacing='0' cellpadding='0' width="100%">
      <col width="25%"></col><col width="25%"></col><col width="50%"></col><tbody>
      <tr>
      <td><img id="update" style="display:none;cursor:pointer" ondrag="event.returnValue=false;" availability="ADMINISTRATOR" alt="Install updates" title="Install updates">
        <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=update.png</xsl:attribute>
        <xsl:attribute name="name">update_<xsl:value-of select="$collectionname"/>_<xsl:value-of select="$bookname"/></xsl:attribute>
        <xsl:attribute name="book"><xsl:value-of select="$bookname"/></xsl:attribute>
        <xsl:attribute name="collection"><xsl:value-of select="$collectionname"/></xsl:attribute>
      </img></td>
      <td><img id="rollback" style="display:none;cursor:pointer"
        ondrag="event.returnValue=false;" availability="ADMINISTRATOR" alt="Rollback to the last good known state" title="Rollback to the last good known state">
        <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=rollback.png</xsl:attribute>
        <xsl:attribute name="name">rollback_<xsl:value-of select="$collectionname"/>_<xsl:value-of select="$bookname"/></xsl:attribute>
        <xsl:attribute name="book"><xsl:value-of select="$bookname"/></xsl:attribute>
        <xsl:attribute name="collection"><xsl:value-of select="$collectionname"/></xsl:attribute>
      </img></td>
      <td><div id="version" style="font-family:Verdana;font-size:7pt;display:none;">
      <xsl:attribute name="name">version_<xsl:value-of select="$collectionname"/>_<xsl:value-of select="$bookname"/></xsl:attribute>
      <xsl:text>&#160;</xsl:text></div>
      <div id="date"  style="font-family:Verdana;font-size:7pt;display:none;">
      <xsl:attribute name="name">date_<xsl:value-of select="$collectionname"/>_<xsl:value-of select="$bookname"/></xsl:attribute>
      <xsl:text>&#160;</xsl:text></div></td>
      </tr></tbody></table>
    </td></tr>
    </table>
  </xsl:template>
  <!--
  <configitem name="PubNumber.value"><value>PMC-SPITFIRE-KCXR8-29DFT-02_EN-US</value></configitem>
  <configitem name="bookModel"><value>SPITFIRE</value></configitem>
  -->
  <xsl:template match="book/configitem[@name='PubNumber.value']" priority="2">
    <xsl:variable name="bookModel" select="../configitem[@name='bookModel']/value"/>
    <xsl:variable name="imgsrc"><xsl:choose>
      <xsl:when test="$bookModel='SPITFIRE'">spitfire.jpg</xsl:when>
      <xsl:when test="$bookModel='HURRICANE'">hurricane.jpg</xsl:when>
      <xsl:when test="$bookModel='LANCASTER'">lancaster.jpg</xsl:when>
      <xsl:when test="$bookModel='DAKOTA'">dakota.jpg</xsl:when>
      <xsl:when test="$bookModel='CHIPMUNK'">chipmunk.jpg</xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose></xsl:variable>
    <a href="javascript:void()">
    <xsl:attribute name="onclick">CVPortal.components['cvBookList'].select('<xsl:value-of select="../../../@name"/>','<xsl:value-of select="../@name"/>')</xsl:attribute>
    <img style="width:170x;height:128px;border:1px dotted #5d8aa8">
    <xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=aircraft/<xsl:value-of select="$imgsrc"/></xsl:attribute>
    </img></a>
  </xsl:template>
  <xsl:template match="book/configitem[@name='PubNumber.value']" priority="1">
    <span class="collection-book-link">
      <xsl:attribute name="onclick">CVPortal.components['cvBookList'].select('<xsl:value-of select="../../../@name"/>','<xsl:value-of select="../@name"/>')</xsl:attribute>
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="book/configitem[@name='bookTitle']">
    <xsl:apply-templates />
  </xsl:template>

<!--
  <configitem name="PubDate.value"><value>05/19/2020</value></configitem>
  <configitem name="PubIssue.value"><value>000</value></configitem>
  <configitem name="change_level"><value>000</value></configitem>
-->
  <xsl:template match="book/configitem[@name='change_level']">
    <xsl:variable name="iss" select="./value"/>
    <xsl:choose>
      <xsl:when test="$iss='0' or $iss='000' or $iss='1' or $iss='001'">Initial Issue</xsl:when>
      <xsl:otherwise>Revision <xsl:value-of select="number($iss) - 1"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="book/configitem[@name='PubDate.value']">
    <xsl:variable name="iss" select="./value"/>
    <xsl:value-of select="substring($iss,7)"/><xsl:text>-</xsl:text>
    <xsl:value-of select="substring($iss,1,2)"/><xsl:text>-</xsl:text>
    <xsl:value-of select="substring($iss,4,2)"/>
  </xsl:template>

  <xsl:template match="book/configitem[@name='bookModel']">
    <span style="color:blue;text-decoration:underline;_cursor:hand;cursor:pointer;">
      <xsl:attribute name="onclick">CVPortal.components['cvBookList'].select('<xsl:value-of select="../../../@name"/>','<xsl:value-of select="../@name"/>')</xsl:attribute>
      <xsl:apply-templates />
    </span>
  </xsl:template>

  <xsl:template match="book/configitem[@name='bookName']">
    <span style="color:blue;text-decoration:underline;_cursor:hand;cursor:pointer;">
      <xsl:attribute name="onclick">CVPortal.components['cvBookList'].select('<xsl:value-of select="../../../@name"/>','<xsl:value-of select="../@name"/>')</xsl:attribute>
      <xsl:apply-templates />
    </span>
  </xsl:template>

</xsl:stylesheet>