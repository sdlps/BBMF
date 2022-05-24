<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/FullSupport/toc.xsl 2.0 2019/05/23 20:05:56GMT milind Exp  $ -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/TR/WD-xsl">

  <xsl:template><xsl:apply-templates/></xsl:template>

  <xsl:template match="text()"><xsl:value-of select="."/></xsl:template>

  <xsl:template match="TOC_ROOT">
    <div id="TOC_MAIN_TREE"><xsl:apply-templates/></div>
  </xsl:template>

  <xsl:template match="SYSTEM" >
    <xsl:if test=".[not(@APPENDIX)]">
      <xsl:variable name="title" select="TITLE"/>
      <xsl:choose>
        <xsl:when test="$title='Reference DMs'"/>
        <xsl:otherwise>
          <div class="tocItem">
            <xsl:attribute name="type">SYSTEM</xsl:attribute>
            <xsl:attribute name="ID"><xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:attribute name="NAME"><xsl:value-of select="$title"/></xsl:attribute>
            <xsl:if test=".[@ROOT]">
              <xsl:attribute name="STYLE">margin-left:0px;</xsl:attribute>
            </xsl:if>
            <xsl:if test=".[not(@ROOT)]">
              <xsl:attribute name="STYLE">margin-left:20px;</xsl:attribute>
            </xsl:if>
            <span class="normal" onclick="CVPortal.components['cvTOC'].toggleExpand(event)">
              <img class="link">
                <xsl:attribute name="ID">I_<xsl:value-of select="@EID"/></xsl:attribute>
                <xsl:attribute name="SRC">@APPNAME@?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=plus.png</xsl:attribute>
              </img>
              <span class="counter" style="display:none">
                <xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/></xsl:attribute>0</span>
              <span class="normal" cvTocTitle="1">
                <xsl:attribute name="ID">S_<xsl:value-of select="@EID"/></xsl:attribute>&#160;<xsl:value-of select="TITLE"/>
              </span>
            </span>
            <div class="container" style="display:none">
              <xsl:attribute name="ID">D_<xsl:value-of select="@EID"/></xsl:attribute>
              <xsl:apply-templates/>
            </div>
          </div>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="SYSTEM[@SYSDOCEID]" >
    <div class="tocItem">
      <xsl:variable name="title" select="TITLE"/>
      <xsl:attribute name="type">SYSDOCEID</xsl:attribute>
      <xsl:attribute name="ID"><xsl:value-of select="@EID"/></xsl:attribute>
      <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
      <xsl:attribute name="SYSDOCEID"><xsl:value-of select="@SYSDOCEID"/></xsl:attribute>
      <xsl:attribute name="DOCID"><xsl:value-of select="@DOCID"/></xsl:attribute>
      <xsl:attribute name="NAME"><xsl:value-of select="$title"/></xsl:attribute>
      <xsl:if test=".[@ROOT]">
        <xsl:attribute name="STYLE">margin-left:0px;</xsl:attribute>
      </xsl:if>
      <xsl:if test=".[not(@ROOT)]">
        <xsl:attribute name="STYLE">margin-left:20px;</xsl:attribute>
      </xsl:if>
      <span class="normal">
        <img class="link" onclick="CVPortal.components['cvTOC'].toggleExpand(event);">
          <xsl:attribute name="ID">I_<xsl:value-of select="@EID"/></xsl:attribute>
          <xsl:attribute name="SRC">@APPNAME@?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=plus.png</xsl:attribute>
        </img>
        <img class="link" onclick="CVPortal.components.cvTOC.selectDocumentContainer(event)">
          <xsl:attribute name="SRC">@APPNAME@?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=<xsl:value-of select="@DOCTYPE"/>.gif</xsl:attribute>
        </img>
        <span class="counter" style="display:none">
          <xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/></xsl:attribute>0</span>
        <span onclick="CVPortal.components.cvTOC.selectDocumentContainer(event)">
          <xsl:attribute name="ID">S_<xsl:value-of select="@EID"/></xsl:attribute>
          <span class="titleBit" cvTocTitle="1" >
            <xsl:attribute name="ID">TITLE.<xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:value-of select="TITLE"/>
          </span>
          <br style="display:none">
            <xsl:attribute name="ID">BR.<xsl:value-of select="@EID"/></xsl:attribute>
          </br>
          <span class="codeBit" style="display:none">
            <xsl:attribute name="ID">CODE_<xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:value-of select="@DOCID"/>
          </span>
        </span>
      </span>
      <!-- internal activity list for DOCUMENT *********  used if <prop id="activityInTOC"/> set in cvDocHandler *********  -->
      <span style="display:none" class="activityList">
        <xsl:attribute name="ID">ACT_<xsl:value-of select="@SYSDOCEID"/></xsl:attribute>
      </span>
      <div class="container" style="display:none">
        <xsl:attribute name="ID">D_<xsl:value-of select="@EID"/></xsl:attribute>
        <xsl:apply-templates/>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="DOCUMENT[not(@TABLEONLY)]">
    <div class="tocItem">
      <xsl:attribute name="type">DOCUMENT</xsl:attribute>
      <xsl:attribute name="ID"><xsl:value-of select="@EID"/></xsl:attribute>
      <xsl:attribute name="REFID"><xsl:value-of select="@REFID"/></xsl:attribute>
      <xsl:attribute name="LASTREFID"><xsl:value-of select="@LASTREFID"/></xsl:attribute>
      <xsl:attribute name="DOCTYPE"><xsl:value-of select="@DOCTYPE"/></xsl:attribute>
      <xsl:attribute name="DOCID"><xsl:value-of select="@DOCID"/></xsl:attribute>
      <xsl:attribute name="STYLE">margin-left:20px;</xsl:attribute>
      <span class="normal" onclick="CVPortal.components['cvTOC'].selectDocument(event)">
        <img class="link">
          <xsl:attribute name="SRC">@APPNAME@?id=@SESSION_ID@&amp;target=resource&amp;action=image&amp;file_name=<xsl:value-of select="@DOCTYPE"/>.gif</xsl:attribute>
        </img>
        <span class="counter" style="display:none">
          <xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/></xsl:attribute>0</span>
        <span>
          <xsl:attribute name="ID">S_<xsl:value-of select="@EID"/>
          </xsl:attribute>
          <span class="titleBit" cvTocTitle="1">
            <xsl:attribute name="ID">TITLE_<xsl:value-of select="@EID"/></xsl:attribute>&#160;<xsl:value-of select="TITLE"/>
          </span>
          <br style="display:none">
            <xsl:attribute name="ID">BR.<xsl:value-of select="@EID"/></xsl:attribute>
          </br>
          <span class="codeBit" style="display:none">
            <xsl:attribute name="ID">CODE_<xsl:value-of select="@EID"/></xsl:attribute>
            <xsl:value-of select="@DOCID"/>
          </span>
        </span>
      </span>
      <!-- internal activity list for DOCUMENT *********  used if <prop id="activityInTOC"/> set in cvDocHandler *********  -->
      <span style="display:none" class="activityList">
        <xsl:attribute name="ID">ACT_<xsl:value-of select="@REFID"/></xsl:attribute>
      </span>
    </div>
  </xsl:template>

  <xsl:template match="DOCUMENT[@SYSTEMDOC]"/>
  <xsl:template match="TITLE"/>
  <xsl:template match="displaytext"/>
  <xsl:template match="non_applic"/>

</xsl:stylesheet>