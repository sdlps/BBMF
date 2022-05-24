<?xml version="1.0" encoding="iso-8859-1"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/common_pdf.xsl 2.0 2019/05/23 20:30:40GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
                xmlns:fo="http://www.w3.org/1999/XSL/Format"
                xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://www.purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                >

  <!-- ** Filtering Varibles; for Applicability and eventually process data modules ** -->
  <xsl:param name="filtervars" select="document($filter_location)/filter"/>
  <xsl:param name="bookPath"/>
  <xsl:param name="local_page_size"/>
  <xsl:param name="local_page_orientation"/>
  <xsl:param name="show_portion_marking"/>

  <xsl:template match="non_applic"/>

  <xsl:template match="applic" priority="2"/>

  <xsl:template match="displaytext|displayText"/>

  <xsl:template match="referencedApplicGroup"/>
  
  <xsl:variable name="pl_margin-top">15mm</xsl:variable>
  <xsl:variable name="pl_margin-btm">12.5mm</xsl:variable>
  <xsl:variable name="pl_margin-lft">12.5mm</xsl:variable>
  <xsl:variable name="pl_margin-rht">12.5mm</xsl:variable>
  <xsl:variable name="pl_bdy_margin-top">17mm</xsl:variable><!--Was originally 30mm-->
  <xsl:variable name="pl_bdy_margin-btm">25mm</xsl:variable>
  <xsl:variable name="pl_hdr_ext">38mm</xsl:variable>
  <xsl:variable name="pl_ftr_ext">25mm</xsl:variable>

  <xsl:variable name="rootNode" select="//DOCUMENT/DOCBODY/*[1]"/><!--LAM:2022-02-22: This is used for form printing as well, for some reason...-->

  <!-- Root template start here -->
  <xsl:template match="/">
    <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Arial,Helvetica,Symbol,ZapfDingbats">
      <fo:layout-master-set>
        <xsl:choose>

          <xsl:when test="name($rootNode)=''">
            <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
              <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
              <fo:region-before extent="{$pl_hdr_ext}"/>
              <fo:region-after extent="{$pl_ftr_ext}"/>
            </fo:simple-page-master>
          </xsl:when>

          <xsl:when test="$local_page_size ='LETTER'">
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="297mm"  page-height="210mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:when test="$local_page_size ='A4'">
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="297mm"  page-height="210mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="50mm"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:when test="$local_page_size ='TABLOID'">
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="432mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="277mm"  page-height="432mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:when test="$local_page_size ='A3'">
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="420mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="297mm"  page-height="420mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:when test="$local_page_size ='LEGAL'">
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="356mm"  page-height="210mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="356mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>

          <xsl:otherwise>
            <xsl:choose>
              <xsl:when test="$local_page_orientation ='LANDSCAPE'">
                <fo:simple-page-master master-name="template_pdf" page-width="297mm"  page-height="210mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:when>
              <xsl:otherwise>
                <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm" margin-top="{$pl_margin-top}"  margin-bottom="{$pl_margin-btm}" margin-left="{$pl_margin-lft}" margin-right="{$pl_margin-rht}">
                  <fo:region-body margin-top="{$pl_bdy_margin-top}" margin-bottom="{$pl_bdy_margin-btm}"/>
                  <fo:region-before extent="{$pl_hdr_ext}"/>
                  <fo:region-after extent="{$pl_ftr_ext}"/>
                </fo:simple-page-master>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>

      </fo:layout-master-set>
      <fo:page-sequence master-reference="template_pdf" language="en" country="us">
        <fo:flow flow-name="xsl-region-body">
          <fo:block><xsl:apply-templates/></fo:block>
        </fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>
  <!-- End of root template -->

  <xsl:template match="standard">
    <fo:block><xsl:apply-templates/></fo:block>
  </xsl:template>

  <!-- ********** Ignore RDF Tags ****************** -->
  <xsl:template match="//*[name()='rdf:Description']"/>
  <!-- ********** DOCUMENT ADDRESS (INFORMATION) ****************** -->

  <xsl:template match="DOCHEADER"/>

  <xsl:template match="dmaddres|dmAddress">
    <xsl:apply-templates select="dmtitle|dmAddressItems/dmTitle"/>
  </xsl:template>

  <xsl:template match="dmc|dmIdent/dmCode">
    <fo:block space-after="5pt"><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="dmc/age|dmc/avee|dmIdent/dmCode">
    <!-- age/supeqvc is the equivalent of avee/sdc -->
    <!-- age/ecscs is the equivalent of avee/chapnum -->
    <!-- age/eidc is the equivalent of avee/section PLUS avee/subsect -->
    <!-- age/cidc is the equivalent of avee/subject -->
    <!-- All other AGE tags are the same as AVEE tags. -->
    <xsl:value-of select="modelic|@modelIdentCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="supeqvc|sdc|@systemDiffCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="ecscs|chapnum|@systemCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="eidc|section|@subSystemCode"/>
    <xsl:value-of select="subsect|@subSubSystemCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="cidc|subject|@assyCode"/><xsl:text>-</xsl:text>
    <xsl:value-of select="discode|@disassyCode"/><xsl:value-of select="discodev|@disassyCodeVariant"/><xsl:text>-</xsl:text>
    <xsl:value-of select="incode|@infoCode"/><xsl:value-of select="incodev|@infoCodeVariant"/><xsl:text>-</xsl:text>
    <xsl:value-of select="itemloc|@itemLocationCode"/>
    <xsl:if test="@learnCode"><xsl:text>-</xsl:text><xsl:value-of select="@learnCode"/><xsl:value-of select="@learnEventCode"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="age|avee|dmCode">
    <fo:inline font-family="Arial,Helvetica,Symbol,ZapfDingbats"><!--color="blue"-->
      <xsl:value-of select="modelic|@modelIdentCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="supeqvc|sdc|@systemDiffCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="ecscs|chapnum|@systemCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="eidc|section|@subSystemCode"/>
      <xsl:value-of select="subsect|@subSubSystemCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="cidc|subject|@assyCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="discode|@disassyCode"/><xsl:value-of select="discodev|@disassyCodeVariant"/><xsl:text>-</xsl:text>
      <xsl:value-of select="incode|@infoCode"/><xsl:value-of select="incodev|@infoCodeVariant"/><xsl:text>-</xsl:text>
      <xsl:value-of select="itemloc|@itemLocationCode"/>
      <xsl:if test="@learnCode">
        <xsl:text>-</xsl:text><xsl:value-of select="@learnCode"/><xsl:value-of select="@learnEventCode"/>
      </xsl:if>
    </fo:inline>
  </xsl:template>

  <xsl:template match="dmtitle|dmTitle">
    <fo:block space-after="20pt" font-size="16pt"><!--color="blue"-->
      <xsl:if test="techname or techName">
        <xsl:apply-templates select="techname|techName"/>
        <xsl:if test="infoname or infoName"> - </xsl:if>
      </xsl:if>
      <xsl:if test="infoname or infoName">
        <xsl:apply-templates select="infoname|infoName"/>
      </xsl:if>
    </fo:block>
  </xsl:template>

  <xsl:template match="refdm/dmtitle|dmRef//dmTitle">
    <xsl:if test="techname or techName">
      <xsl:apply-templates select="techname|techName"/>
      <xsl:if test="infoname or infoName"> - </xsl:if>
    </xsl:if>
    <xsl:if test="infoname or infoName">
      <xsl:apply-templates select="infoname|infoName"/>
    </xsl:if>
  </xsl:template>
  <!--xsl:template match="refs/refdm/dmtitle|refs/dmRef/dmTitle"><fo:block space-after="20pt" font-size="10pt"><xsl:apply-templates/></fo:block></xsl:template-->

  <xsl:template match="techname|techName">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="dmtitle/infoname|dmTitle/infoName">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="issno">
    <fo:block space-after="5pt">
      <xsl:value-of select="@issno"/>.<xsl:value-of select="@inwork"/>
      <xsl:if test="self::node()[@type='new']">(<xsl:value-of select="$style.common.newdm"/>)</xsl:if>
    </fo:block>
  </xsl:template>

  <xsl:template match="issdate">
    <fo:block space-after="5pt">
      <xsl:value-of select="@month"/><xsl:text>-</xsl:text>
      <xsl:value-of select="@day"/><xsl:text>-</xsl:text>
      <xsl:value-of select="@year"/>
    </fo:block>
  </xsl:template>

  <!-- ********** DOCUMENT ADDRESS (INFORMATION) ************* -->
  <xsl:template match="content">
    <fo:block><xsl:apply-templates/></fo:block>
  </xsl:template>

  <!-- ********** STATUS INFORMATION ****************** -->
  <xsl:template match="status|dmStatus">
    <!--<fo:block><xsl:apply-templates select="*[local-name() != 'applic']"/></fo:block>-->
  </xsl:template>

  <xsl:template match="security"/>

  <xsl:template match="datarest|dataRestrictions">
    <!-- Removed<fo:block space-before="25pt" font-weight="bold">Data Restrictions</fo:block><xsl:apply-templates/>-->
  </xsl:template>

  <xsl:template match="techstd"/>

  <xsl:template match="instruct|restrictionInstructions">
    <fo:block start-indent="10mm" space-before="15pt" font-weight="bold">
      <xsl:value-of select="$style.common.instructions"/>
    </fo:block>
    <fo:block><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="distrib|dataDistribution">
    <fo:block start-indent="15mm" space-before="15pt" font-weight="bold">
      <xsl:value-of select="$style.common.distribution"/>
    </fo:block>
    <fo:block start-indent="15mm" space-before="15pt"><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="expcont|exportControl">
    <fo:block start-indent="15mm" space-before="15pt" font-weight="bold">
      <xsl:value-of select="$style.common.exportcontrol"/>
    </fo:block>
    <fo:block start-indent="15mm" space-before="15pt"><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="handling|dataHandling"/>

  <xsl:template match="disclose|dataDisclosure"/>

  <xsl:template match="inform|restrictionInfo"/>

  <xsl:template match="destruct|dataDestruction">
    <fo:block start-indent="15mm" space-before="15pt" font-weight="bold">
      <xsl:value-of select="$style.common.destruction"/>
    </fo:block>
    <fo:block start-indent="15mm" space-before="15pt"><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="rpc|responsiblePartnerCompany">
    <!-- Removed<fo:block space-before="15pt"><fo:inline font-weight="bold">Responsible Partner Company:</fo:inline> <xsl:apply-templates/></fo:block>-->
  </xsl:template>

  <xsl:template match="orig|originator">
    <!--fo:block space-before="15pt" font-weight="bold"-->
    <!-- Removed<fo:block space-before="15pt"><fo:inline font-weight="bold">Originator:</fo:inline> <xsl:apply-templates/></fo:block>-->
  </xsl:template>

  <xsl:template match="applicCrossRefTableRef|actref"/>

  <xsl:template match="sbc|systemBreakdownCode"/>

  <xsl:template match="techStandard"/>

  <xsl:template match="dmStatus//remarks"/>

  <xsl:template match="applic/type"/>

  <xsl:template match="skill"/>

  <xsl:template match="brexref|brexDmRef">
    <!-- Removed<fo:block space-before="15pt"><fo:inline font-weight="bold">Business Rules Exchange:</fo:inline> <xsl:apply-templates/></fo:block>-->
  </xsl:template>

  <xsl:template match="qa|qualityAssurance">
    <!-- Removed<fo:block space-before="15pt" font-weight="bold">Quality Assurance Status: <xsl:apply-templates/></fo:block>-->
  </xsl:template>

  <xsl:template match="unverif">
    <xsl:value-of select="$style.common.unverified"/>
  </xsl:template>

  <xsl:template match="rfu|reasonForUpdate"/>
  <!-- ********** ENDOF STATUS INFORMATION  ************* -->
  <!-- **************** XSL-FO STYLES ********************* -->
  <xsl:attribute-set name="h2">
    <xsl:attribute name="font-size">14pt</xsl:attribute>
    <xsl:attribute name="font-weight">bold</xsl:attribute>
    <xsl:attribute name="color">blue</xsl:attribute>
    <xsl:attribute name="space-before">10mm</xsl:attribute>
    <xsl:attribute name="text-align">center</xsl:attribute>
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="h3">
    <xsl:attribute name="font-size">14pt</xsl:attribute>
    <xsl:attribute name="font-weight">bold</xsl:attribute>
    <xsl:attribute name="color">brown</xsl:attribute>
    <xsl:attribute name="space-before">5mm</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="h4">
    <xsl:attribute name="font-size">12pt</xsl:attribute>
    <xsl:attribute name="font-weight">bold</xsl:attribute>
    <xsl:attribute name="color">brown</xsl:attribute>
    <xsl:attribute name="space-before">5mm</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="table_border">
    <xsl:attribute name="border-top-style">solid</xsl:attribute>
    <xsl:attribute name="border-top-width">1pt</xsl:attribute>
    <xsl:attribute name="border-top-color">black</xsl:attribute>
    <xsl:attribute name="border-bottom-style">solid</xsl:attribute>
    <xsl:attribute name="border-bottom-width">1pt</xsl:attribute>
    <xsl:attribute name="border-bottom-color">black</xsl:attribute>
    <xsl:attribute name="padding-after">2mm</xsl:attribute>
    <xsl:attribute name="padding-before">2mm</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="table_border_bottom">
    <xsl:attribute name="border-bottom-style">solid</xsl:attribute>
    <xsl:attribute name="border-bottom-width">1pt</xsl:attribute>
    <xsl:attribute name="border-bottom-color">black</xsl:attribute>
    <xsl:attribute name="padding-before">2mm</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="table_border_center">
    <xsl:attribute name="border-top-style">solid</xsl:attribute>
    <xsl:attribute name="border-top-width">1pt</xsl:attribute>
    <xsl:attribute name="border-top-color">black</xsl:attribute>
    <xsl:attribute name="border-bottom-style">solid</xsl:attribute>
    <xsl:attribute name="border-bottom-width">1pt</xsl:attribute>
    <xsl:attribute name="padding-after">1mm</xsl:attribute>
    <xsl:attribute name="padding-before">1mm</xsl:attribute>
    <xsl:attribute name="text-align">center</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="table_border_left">
    <xsl:attribute name="border-bottom-style">solid</xsl:attribute>
    <xsl:attribute name="border-bottom-width">0pt</xsl:attribute>
    <xsl:attribute name="border-bottom-color">black</xsl:attribute>
    <xsl:attribute name="padding-after">1mm</xsl:attribute>
    <xsl:attribute name="padding-before">1mm</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
  </xsl:attribute-set>
  <!-- *********** WCN styles ***************** -->
  <xsl:attribute-set name="wcn_div">
    <xsl:attribute name="padding">1.5mm</xsl:attribute>
    <xsl:attribute name="space-after">2mm</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="wcn_title">
    <xsl:attribute name="margin">3mm</xsl:attribute>
    <xsl:attribute name="font-size">10pt</xsl:attribute>
    <xsl:attribute name="font-weight">bold</xsl:attribute>
    <xsl:attribute name="font-family">sans-serif</xsl:attribute>
    <xsl:attribute name="color">black</xsl:attribute>
    <xsl:attribute name="text-align">center</xsl:attribute>
    <xsl:attribute name="start-indent">60mm</xsl:attribute>
    <xsl:attribute name="end-indent">60mm</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="wcn_table">
    <xsl:attribute name="margin-right">1mm</xsl:attribute>
    <xsl:attribute name="margin-left">1mm</xsl:attribute>
    <xsl:attribute name="border">2pt solid black</xsl:attribute>
    <xsl:attribute name="padding">2mm</xsl:attribute>
    <xsl:attribute name="background-color">white</xsl:attribute>
  </xsl:attribute-set>
  <!-- ****************************************************-->

  <xsl:template match="prelreqs|preliminaryRqmts">
    <fo:block xsl:use-attribute-sets="h2"><xsl:value-of select="$style.common.prelreqs"/></fo:block>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="reqTechInfoGroup"/>

  <xsl:template match="reqconds|reqCondGroup">
    <fo:block xsl:use-attribute-sets="h3">
      <xsl:call-template name="security_portion_mark">
        <xsl:with-param name="override_node_text">yes</xsl:with-param>
      </xsl:call-template>
      <xsl:value-of select="$style.common.reqsconds"/>
    </fo:block>
    <fo:block>
      <fo:table table-layout="fixed" border-collapse="collapse" space-before="5mm">
        <fo:table-column column-width="70mm"/>
        <fo:table-column column-width="110mm"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold" font-size="10pt">
                <xsl:value-of select="$style.common.reqsconds"/>
              </fo:block>
            </fo:table-cell>
            <fo:table-cell xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold" font-size="10pt">
                <xsl:value-of select="$style.common.dmtp"/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <xsl:choose>
            <xsl:when test="child::noconds or child::noConds">
              <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:for-each select="*">
                <xsl:choose>
                  <xsl:when test="self::reqcondm or self::reqCondDm">
                    <fo:table-row>
                      <fo:table-cell xsl:use-attribute-sets="table_border_left"><fo:block>
                      <xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param></xsl:call-template>
                      <xsl:apply-templates select="reqcond|reqCond"/>&#160;</fo:block></fo:table-cell>
                      <fo:table-cell xsl:use-attribute-sets="table_border_left"><fo:block>
                      <xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param></xsl:call-template>
                      <xsl:apply-templates select="refdm|dmRef"/>&#160;</fo:block></fo:table-cell>
                    </fo:table-row>
                  </xsl:when>
                  <xsl:when test="self::reqcontp or self::reqCondExternalPub">
                    <fo:table-row>
                      <fo:table-cell xsl:use-attribute-sets="table_border_left"><fo:block>
                      <xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param></xsl:call-template>
                      <xsl:apply-templates select="reqcond|reqCond"/>&#160;</fo:block></fo:table-cell>
                      <fo:table-cell xsl:use-attribute-sets="table_border_left"><fo:block>
                      <xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param>
                      </xsl:call-template>&#160;<xsl:apply-templates select="reftp|externalPubRef"/></fo:block></fo:table-cell>
                    </fo:table-row>
                  </xsl:when>
                  <xsl:when test="self::reqcond or self::reqCondNoRef">
                    <fo:table-row>
                      <fo:table-cell xsl:use-attribute-sets="table_border_left" number-columns-spanned="2"><fo:block>
                      <xsl:call-template name="security_portion_mark"><xsl:with-param name="override_node_text">yes</xsl:with-param></xsl:call-template>
                      <xsl:apply-templates select="."/>&#160;</fo:block></fo:table-cell>
                    </fo:table-row>
                  </xsl:when>
                </xsl:choose>
              </xsl:for-each>
              <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="2"><fo:block> </fo:block></fo:table-cell></fo:table-row>
            </xsl:otherwise>
          </xsl:choose>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <!-- No required conditions -->
  <xsl:template match="noconds|noConds">
    <fo:table-row>
      <fo:table-cell number-columns-spanned="2" xsl:use-attribute-sets="table_border_left">
        <fo:block><xsl:value-of select="$style.general.none"/></fo:block>
      </fo:table-cell>
    </fo:table-row>
  </xsl:template>

  <!-- ********************* References ************************** -->
  <xsl:template match="refs" priority="2">
    <xsl:choose>
    <xsl:when test="parent::content">
      <fo:table table-layout="fixed" space-after="5mm">
        <fo:table-column column-width="70mm"/>
        <fo:table-column column-width="110mm"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="2">
              <fo:block><fo:block xsl:use-attribute-sets="h2"><xsl:value-of select="$style.common.references"/></fo:block></fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell text-align="center" xsl:use-attribute-sets="table_border" number-columns-spanned="2">
              <fo:block font-weight="bold"><xsl:value-of select="$style.common.dmtp"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <xsl:choose>
            <xsl:when test="not(child::*) or child::norefs or noRefs">
              <fo:table-row>
                <fo:table-cell xsl:use-attribute-sets="table_border_left" number-columns-spanned="2">
                  <xsl:call-template name="noreferences"/>
                </fo:table-cell>
              </fo:table-row>
            </xsl:when>
            <xsl:otherwise>
              <!-- issue 2.0 content model: refs/rdandrt/refdms/refdm -->
              <xsl:for-each select=".//refdm | reftp | dmRef | externalPubRef">
                <fo:table-row>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block font-size="10pt"><xsl:apply-templates select=".//dmc | .//dmCode"/></fo:block>
                  </fo:table-cell>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block font-size="10pt"><xsl:apply-templates select=".//dmtitle | .//dmTitle"/></fo:block>
                  </fo:table-cell>
                </fo:table-row>
              </xsl:for-each>
            </xsl:otherwise>
          </xsl:choose>
          <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="2"><fo:block> </fo:block></fo:table-cell></fo:table-row>
        </fo:table-body>
      </fo:table>
    </xsl:when>
    <xsl:otherwise><xsl:apply-templates/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="refs" priority="-1">
    <xsl:if test="$doc_type != 'schedule'">
      <fo:table table-layout="fixed" space-after="5mm">
        <fo:table-column column-width="180mm"/>
        <fo:table-body>
          <fo:table-row keep-with-next="always">
            <fo:table-cell>
              <fo:block>
                <fo:block xsl:use-attribute-sets="h2">
                  <xsl:value-of select="$style.common.references"/>
                </fo:block>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block font-size="10pt" space-after="5mm">
                <fo:table table-layout="fixed">
                  <fo:table-column column-width="180mm"/>
                  <fo:table-header>
                    <fo:table-row>
                      <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
                        <fo:block font-weight="bold">
                          <xsl:value-of select="$style.common.dmtp"/>
                        </fo:block>
                      </fo:table-cell>
                    </fo:table-row>
                  </fo:table-header>
                  <fo:table-body>
                    <xsl:choose>
                      <xsl:when test="not(child::*) or child::norefs or noRefs">
                        <fo:table-row>
                          <fo:table-cell xsl:use-attribute-sets="table_border_left">
                            <xsl:call-template name="noreferences"/>
                          </fo:table-cell>
                        </fo:table-row>
                      </xsl:when>
                      <xsl:otherwise>
                        <!-- issue 2.0 content model: refs/rdandrt/refdms/refdm -->
                        <xsl:for-each select=".//refdm | reftp | dmRef | externalPubRef">
                          <fo:table-row>
                            <fo:table-cell xsl:use-attribute-sets="table_border_left">
                              <fo:block font-size="10pt"><!--color="blue"-->
                                <xsl:apply-templates select="."/>&#160;</fo:block>
                            </fo:table-cell>
                          </fo:table-row>
                        </xsl:for-each>
                      </xsl:otherwise>
                    </xsl:choose>
                  </fo:table-body>
                </fo:table>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </xsl:if>
  </xsl:template>

  <!-- **********   REFERENCED MATERIALS ************* -->
  <xsl:template name="noreferences">
    <fo:block><xsl:value-of select="$style.common.noreferences"/></fo:block>
  </xsl:template>

  <xsl:template match="refdm|dmRef|reqCond|reftp">
    <fo:inline font-size="10pt"><xsl:apply-templates/></fo:inline>
  </xsl:template>

  <!-- ******** * * * ** Supplies ******************  * ************** -->
  <xsl:template match="supplies|reqSupplies">
    <fo:table table-layout="fixed" space-before="6mm">
      <fo:table-column column-width="180mm"/>
      <fo:table-body>
        <fo:table-row keep-with-next="always">
          <fo:table-cell><fo:block><fo:block xsl:use-attribute-sets="h3"><xsl:value-of select="$style.matreq.supplies"/></fo:block></fo:block></fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
    <fo:block font-size="10pt" space-after="5mm">
      <fo:table table-layout="fixed">
        <fo:table-column column-width="75mm"/><fo:table-column column-width="75mm"/><fo:table-column column-width="30mm"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.name"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.identification"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.quantity"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <xsl:choose>
            <xsl:when test="nosupply|noSupplies">
              <fo:table-row>
                <fo:table-cell number-columns-spanned="2" xsl:use-attribute-sets="table_border_left">
                  <fo:block><xsl:value-of select="$style.general.none"/></fo:block>
                </fo:table-cell>
              </fo:table-row>
            </xsl:when>
            <xsl:otherwise>
              <xsl:for-each select=".//supply|.//supplyDescr">
                <fo:table-row>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left"><fo:block><xsl:apply-templates select="nomen|name"/></fo:block></fo:table-cell>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block><xsl:apply-templates select="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber"/></fo:block>
                  </fo:table-cell>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block><xsl:apply-templates select="qty|reqQuantity"/>&#160; <xsl:value-of select="reqQuantity/@unitOfMeasure"/></fo:block>
                  </fo:table-cell>
                </fo:table-row>
              </xsl:for-each>
              <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="3"><fo:block> </fo:block></fo:table-cell></fo:table-row>
            </xsl:otherwise>
          </xsl:choose>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <!-- ******** * * * ** Spares ******************  * ************** -->
  <xsl:template match="spares|reqSpares">
    <fo:table table-layout="fixed" space-before="6mm">
      <fo:table-column column-width="180mm"/>
      <fo:table-body>
        <fo:table-row keep-with-next="always">
          <fo:table-cell><fo:block><fo:block xsl:use-attribute-sets="h3"><xsl:value-of select="$style.matreq.spares"/></fo:block></fo:block></fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
    <fo:block font-size="10pt" space-after="5mm">
      <fo:table table-layout="fixed">
        <fo:table-column column-width="75mm"/><fo:table-column column-width="75mm"/><fo:table-column column-width="30mm"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.name"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.identification"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.quantity"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <xsl:choose>
            <xsl:when test="nospares|noSpares">
              <fo:table-row>
                <fo:table-cell number-columns-spanned="2" xsl:use-attribute-sets="table_border_left">
                  <fo:block><xsl:value-of select="$style.general.none"/></fo:block>
                </fo:table-cell>
              </fo:table-row>
            </xsl:when>
            <xsl:otherwise>
              <xsl:for-each select=".//spare|.//spareDescr|.//embeddedSpareDescr">
                <fo:table-row>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block><xsl:apply-templates select="nomen|name"/></fo:block>
                  </fo:table-cell>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block><xsl:apply-templates select="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber"/></fo:block>
                  </fo:table-cell>
                  <fo:table-cell xsl:use-attribute-sets="table_border_left">
                    <fo:block><xsl:apply-templates select="qty|reqQuantity"/> &#160; <xsl:value-of select="reqQuantity/@unitOfMeasure"/></fo:block>
                  </fo:table-cell>
                </fo:table-row>
              </xsl:for-each>
              <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="3"><fo:block> </fo:block></fo:table-cell></fo:table-row>
            </xsl:otherwise>
          </xsl:choose>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <!-- ********** SUPPORT EQUIPMENT ****************** -->
  <xsl:template match="supequip|reqSupportEquips">
    <fo:table table-layout="fixed"  space-before="6mm">
      <fo:table-column column-width="180mm"/>
      <fo:table-body>
        <fo:table-row keep-with-next="always">
          <fo:table-cell><fo:block><fo:block xsl:use-attribute-sets="h3"><xsl:value-of select="$style.common.supequip"/></fo:block></fo:block></fo:table-cell>
        </fo:table-row>
        <fo:table-row>
          <fo:table-cell><fo:block><xsl:apply-templates/></fo:block></fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
  </xsl:template>
  <!-- No support equipment-->

  <xsl:template match="nosupeq|noSupportEquips">
    <fo:block space-after="5mm">
      <fo:table font-size="10pt" table-layout="fixed" border-collapse="collapse">
        <fo:table-column column-width="75mm"/><fo:table-column column-width="75mm"/><fo:table-column column-width="30mm"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.name"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.identification"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.quantity"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="2" xsl:use-attribute-sets="table_border_left">
              <fo:block><xsl:value-of select="$style.general.none"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <xsl:template match="supeqli|supportEquipDescrGroup">
    <fo:block space-after="5mm">
      <fo:table font-size="10pt" table-layout="fixed" border-collapse="collapse">
        <fo:table-column column-width="75mm"/><fo:table-column column-width="75mm"/><fo:table-column column-width="30mm"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.name"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.identification"/></fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
              <fo:block font-weight="bold"><xsl:value-of select="$style.general.quantity"/></fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <xsl:for-each select="supequi|supportEquipDescr|embeddedSupportEquipDescr">
            <fo:table-row>
              <fo:table-cell xsl:use-attribute-sets="table_border_left">
                <fo:block><xsl:apply-templates select="nomen|name"/></fo:block>
              </fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="table_border_left">
                <fo:block><xsl:apply-templates select="identno|identNumber"/></fo:block>
              </fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="table_border_left">
                <fo:block><xsl:apply-templates select="qty|reqQuantity"/>&#160;<xsl:value-of select="reqQuantity/@unitOfMeasure"/></fo:block>
              </fo:table-cell>
            </fo:table-row>
          </xsl:for-each>
          <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="3"><fo:block> </fo:block></fo:table-cell></fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <xsl:template match="identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" priority="4">
    <fo:block><xsl:apply-templates/></fo:block>
  </xsl:template>
  
  <!-- <identNumber><manufacturerCode/><partAndSerialNumber><partNumber>DTD189A</partNumber></partAndSerialNumber></identNumber> -->  
  <xsl:template match="identno" priority="4">
    <fo:block><xsl:value-of select=".//partNumber"/></fo:block>
  </xsl:template>
  
  <xsl:template match="natoStockNumber[not(.//text())]" priority="4"></xsl:template>
  <!--<catalogSeqNumberRef systemCode="29" subSystemCode="0" subSubSystemCode="0" assyCode="01" item="001" figureNumber="01"></catalogSeqNumberRef>-->
  <xsl:template match="catalogSeqNumberRef[./refs]" priority="4">
    <fo:block>
      <!--
      <xsl:value-of select="@systemCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="@subSystemCode"/><xsl:value-of select="@subSubSystemCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="@assyCode"/><xsl:text>-</xsl:text>
      <xsl:value-of select="@figureNumber"/>
      -->
      <xsl:value-of select=".//techName[1]"/><xsl:text> Item </xsl:text><xsl:value-of select="@item"/>
    </fo:block>
  </xsl:template>

  <xsl:template match="identno|identNumber|csnref|catalogSeqNumberRef|nsn|natoStockNumber" priority="-3">
    <xsl:for-each select="*">
      <xsl:if test="preceding-sibling::csnref or preceding-sibling::catalogSeqNumberRef or
                    preceding-sibling::mfc/text() or preceding-sibling::manufacturerCode/text() or 
                    preceding-sibling::nsn or preceding-sibling::natoStockNumber or 
                    preceding-sibling::pnr/text() or preceding-sibling::partNumber/text()"> / </xsl:if>
      <xsl:apply-templates select="."/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="csnref" priority="6">
    <xsl:value-of select="@refcsn"/>
  </xsl:template>
  <!--<xsl:template match="catalogSeqNumberRef"><xsl:value-of select="@catalogSeqNumberValue"/></xsl:template>-->

  <!-- ******************** Required Persons ***************** -->
  <xsl:template match="reqpers[position() &gt; 1]|reqPersons[position() &gt; 1]"/>
  <xsl:template match="reqpers[1]|reqPersons[1]">
    <fo:table table-layout="fixed"  space-before="6mm">
      <fo:table-column column-width="180mm"/>
      <fo:table-body>
        <fo:table-row keep-with-next="always">
          <fo:table-cell><fo:block><fo:block xsl:use-attribute-sets="h3"><xsl:value-of select="$style.common.reqperson"/></fo:block></fo:block></fo:table-cell>
        </fo:table-row>
        <fo:table-row>
          <fo:table-cell>
            <fo:block space-after="5mm">
              <fo:table font-size="10pt" table-layout="fixed" border-collapse="collapse">
                <fo:table-column column-width="40mm"/>
                <fo:table-column column-width="40mm"/>
                <fo:table-column column-width="40mm"/>
                <fo:table-column column-width="60mm"/>
                <fo:table-header>
                  <fo:table-row>
                    <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
                      <fo:block font-weight="bold"><xsl:value-of select="$style.common.personnel"/></fo:block>
                    </fo:table-cell>
                    <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
                      <fo:block font-weight="bold"><xsl:value-of select="$style.common.category"/></fo:block>
                    </fo:table-cell>
                    <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
                      <fo:block font-weight="bold"><xsl:value-of select="$style.common.trade"/></fo:block>
                    </fo:table-cell>
                    <fo:table-cell text-align="left" xsl:use-attribute-sets="table_border">
                      <fo:block font-weight="bold"><xsl:value-of select="$style.common.esttime"/></fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </fo:table-header>
                <fo:table-body>
                  <xsl:for-each select="//preliminaryRqmts//person | //preliminaryRqmts//asrequir | //preliminaryRqmts//personnel">
                    <xsl:variable name="ordering">
                      <xsl:value-of select="position() mod (count(../child::person)+count(../child::asrequir)+count(../child::personnel))"/>
                    </xsl:variable>
                    <xsl:variable name="islast" select="position()=last()"/>
                    <xsl:variable name="cellborder"><xsl:if test="$islast">table_border</xsl:if></xsl:variable>
                    <fo:table-row>
                      <fo:table-cell text-align="left">
                        <xsl:choose>
                          <xsl:when test="local-name()='person'">
                            <fo:block><xsl:value-of select="$style.common.man"/><xsl:value-of select="@man"/></fo:block>
                          </xsl:when>
                          <xsl:otherwise><fo:block><xsl:value-of select="$style.common.asreq"/></fo:block></xsl:otherwise>
                        </xsl:choose>
                      </fo:table-cell>
                      <fo:table-cell text-align="left"><fo:block>
                        <xsl:value-of select="following-sibling::perscat[$ordering]/@category"/>
                        <xsl:value-of select="personCategory/@personCategoryCode"/>
                      </fo:block></fo:table-cell>
                      <fo:table-cell text-align="left"><fo:block>
                        <xsl:value-of select="following-sibling::trade[$ordering]/text()"/>
                        <xsl:apply-templates select="trade"/>
                      </fo:block></fo:table-cell>
                      <fo:table-cell text-align="left"><fo:block>
                        <xsl:value-of select="following-sibling::esttime[$ordering]/text()"/>
                        <xsl:apply-templates select="estimatedTime"/> &#160; <xsl:value-of select="estimatedTime/@unitOfMeasure"/>
                      </fo:block></fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                  <fo:table-row><fo:table-cell xsl:use-attribute-sets="table_border_bottom" number-columns-spanned="4"><fo:block> </fo:block></fo:table-cell></fo:table-row>
                </fo:table-body>
              </fo:table>
            </fo:block>
          </fo:table-cell>
        </fo:table-row>
      </fo:table-body>
    </fo:table>
  </xsl:template>

  <xsl:template match="para0/title/acronym">
    <xsl:apply-templates select="acroterm"/>
    <!-- <xsl:if test="child::acroterm"> (<xsl:apply-templates select="acroterm"/>)</xsl:if>-->
  </xsl:template>

  <xsl:template match="acronym">
    <xsl:apply-templates select="acroterm"/>
    <!-- <xsl:if test="child::acroterm"> (<xsl:apply-templates select="acroterm"/>)</xsl:if>-->
  </xsl:template>

  <xsl:template match="acroterm">
    <xsl:choose>
      <xsl:when test="@xrefid">
        <xsl:variable name="acro_id" select="@xrefid"/>
        <xsl:if test="not(preceding-sibling::*)">
          <xsl:call-template name="security_portion_mark"/>
        </xsl:if>
        <xsl:apply-templates select="//acronym[@id=$acro_id]"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="security_portion_mark"/>
        <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="acrodef">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="para">
    <fo:block space-before="3mm">
      <xsl:if test="ancestor::thead">
        <xsl:attribute name="font-size">7pt</xsl:attribute>
      </xsl:if>
      <xsl:call-template name="security_portion_mark"/>
      <!-- Test the security conditions -->
      <!-- <xsl:call-template name="formatClass01"/> --><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="externalPubRef">
    <fo:inline><!--color="blue"--><xsl:apply-templates/></fo:inline>
  </xsl:template>

  <xsl:template match="xref|internalRef">
    <xsl:variable name="our_xrefid" select="@internalRefId|@xrefid"/>
    <xsl:variable name="thetarget" select="//*[@id=$our_xrefid]"/>
    <xsl:variable name="xidtype"><xsl:choose>
      <xsl:when test="@internalRefTargetType"><xsl:value-of select="@internalRefTargetType"/></xsl:when>
      <xsl:when test="@xidtype"><xsl:value-of select="@xidtype"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="name($thetarget)"/></xsl:otherwise>
    </xsl:choose></xsl:variable>
    <!--<xsl:attribute name="xidtype"><xsl:value-of select="$xidtype"/></xsl:attribute><xsl:attribute name="xrefid"><xsl:value-of select="$our_xrefid"/></xsl:attribute>-->
    <!--<xsl:variable name="our_xrefid"><xsl:value-of select="@xrefid"/></xsl:variable>-->
    <fo:inline font-style="italic" font-size="10pt" font-family="sans-serif" color="blue">
     <fo:basic-link internal-destination="{$our_xrefid}">
      <xsl:if test="self::node() =''">
        <xsl:choose>
          <xsl:when test="$xidtype='table' or $xidtype='irtt02'">
            <xsl:call-template name='createTableXrefText'>
              <xsl:with-param name='idref' select='$our_xrefid'/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='figure' or $xidtype='multimedia' or $xidtype='irtt01' or $xidtype='irtt03' or $xidtype='hotspot' or $xidtype='irtt11'">
            <xsl:call-template name='createFigureXrefText'>
              <xsl:with-param name='idref' select='$our_xrefid'/>
            </xsl:call-template>
            <xsl:if test="$xidtype='hotspot' or $xidtype='irtt11'">
              <xsl:text> - </xsl:text>
              <xsl:value-of select="$style.common.hotspot"/>
              <xsl:text> </xsl:text>
              <xsl:value-of select="//hotspot[@id=$our_xrefid]/@apsname"/>
              <xsl:value-of select="//hotspot[@id=$our_xrefid]/@applicationStructureName"/>
            </xsl:if>
          </xsl:when>
          <xsl:when test="$xidtype='sheet' or $xidtype='irtt09'">
            <xsl:for-each select="//sheet[@id = $our_xrefid]">
              <xsl:variable name="figId">
                <xsl:value-of select="ancestor::figure/@id"/>
              </xsl:variable>
              <!-- include our figure title and sheetNo in the linking -->
              <xsl:call-template name='createFigureXrefText'>
                <xsl:with-param name='idref' select='$figId'/>
              </xsl:call-template>
            </xsl:for-each>
          </xsl:when>
          <xsl:when test="$xidtype='spares' or $xidtype='irtt06'">
            <xsl:call-template name="createSparesXrefText">
              <xsl:with-param name='idref' select='$our_xrefid'/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='supply' or $xidtype='irtt04'">
            <xsl:call-template name="createSuppliesXrefText">
              <xsl:with-param name='idref' select='$our_xrefid'/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='supequip' or $xidtype='irtt05'">
            <xsl:call-template name="createSupportEquipXrefText">
              <xsl:with-param name='idref' select='$our_xrefid'/>
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$xidtype='step' or $xidtype='irtt08'">
            <xsl:value-of select="$style.common.step"/><xsl:text>&#160;</xsl:text>
            <xsl:for-each select="//*[@id = $our_xrefid]">
              <xsl:call-template name="getStepDesignator"/>
              <xsl:call-template name="getproceduralStepDesignator"/>
            </xsl:for-each>
          </xsl:when>
          <!-- PARAs -->
          <xsl:when test="$xidtype='para' or $xidtype='irtt07'">
            <xsl:value-of select="$style.common.para"/>&#160;<xsl:for-each select="//*[@id= $our_xrefid]">
              <xsl:choose>
                <!-- handling S1000D 4.0 paras -->
                <xsl:when test="name() = 'levelledPara'"><xsl:number count="levelledPara" level="multiple" format="1.1.1.1.1.1.1.1"/></xsl:when>
                <xsl:when test="name() = 'para0'"><xsl:number count="para0" level="single" format="1"/></xsl:when>
                <xsl:when test="name() = 'subpara1'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara2'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="multiple" format="1."/>
                  <xsl:number count="subpara2" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara3'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="multiple" format="1."/>
                  <xsl:number count="subpara2" level="multiple" format="1."/>
                  <xsl:number count="subpara3" level="single" format="1"/>
                </xsl:when>
                <xsl:when test="name() = 'subpara4'">
                  <xsl:number count="para0" level="multiple" format="1."/>
                  <xsl:number count="subpara1" level="single" format="1 "/>
                  <xsl:number count="subpara2" level="multiple" format="1."/>
                  <xsl:number count="subpara3" level="multiple" format="1."/>
                  <xsl:number count="subpara4" level="single" format="1"/>
                </xsl:when>
              </xsl:choose>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$style.common.crossref"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
      <xsl:apply-templates/>
      <!-- <xsl:if test="name($thetarget)='proceduralStep'">
        <xsl:text> p.</xsl:text><fo:page-number-citation ref-id="{$our_xrefid}"/>
      </xsl:if> -->
    </fo:basic-link></fo:inline>
  </xsl:template>

  <xsl:template match="figure"/>

  <xsl:template match="randlist|randomList">
    <xsl:if test="node()">
      <fo:list-block provisional-label-separation="2mm" provisional-distance-between-starts="9mm">
        <xsl:apply-templates/>
      </fo:list-block>
    </xsl:if>
  </xsl:template>

  <xsl:template match="seqlist|sequentialList">
    <xsl:if test="node()">
      <fo:list-block provisional-label-separation="2mm" provisional-distance-between-starts="9mm">
        <xsl:apply-templates/>
      </fo:list-block>
    </xsl:if>
  </xsl:template>

  <xsl:template match="item|listItem">
    <fo:list-item space-before="5mm">
      <fo:list-item-label>
        <xsl:choose>
          <xsl:when test="ancestor::seqlist[2] or ancestor::sequentialList[2]">
            <xsl:attribute name="start-indent">10mm</xsl:attribute>
          </xsl:when>
          <xsl:when test="not(ancestor::step1 or ancestor::step2 or ancestor::step3 or ancestor::step4 or ancestor::step5  or ancestor::proceduralStep)">
            <xsl:attribute name="start-indent">5mm</xsl:attribute>
          </xsl:when>
        </xsl:choose>
        <fo:block>
          <xsl:choose>
            <xsl:when test="parent::seqlist or parent::sequentialList">
              <xsl:number level="single" format="1. " count="item"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:choose>
                <xsl:when test="parent::randlist/@prefix = 'pf01'">
                  <!-- nothing! -->
                </xsl:when>
                <xsl:otherwise>
                  <xsl:choose>
                    <xsl:when test="number(count(ancestor::randlist)) mod 2 = 0">
                      <fo:character character="&#8226;"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <fo:character character="&#8226;"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:otherwise>
          </xsl:choose>
        </fo:block>
      </fo:list-item-label>
      <fo:list-item-body>
        <xsl:choose>
          <xsl:when test="ancestor::step1 or ancestor::step2 or ancestor::step3 or ancestor::step4 or ancestor::step5  or ancestor::proceduralStep">
            <xsl:attribute name="start-indent">28mm</xsl:attribute>
          </xsl:when>
          <xsl:when test="ancestor::seqlist[2] or ancestor::sequentialList[2]">
            <xsl:attribute name="start-indent">17mm</xsl:attribute>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="start-indent">10mm</xsl:attribute>
          </xsl:otherwise>
        </xsl:choose>
        <fo:block space-start="25mm" padding-start="25mm">
          <xsl:apply-templates/>
        </fo:block>
      </fo:list-item-body>
    </fo:list-item>
  </xsl:template>
  <!-- definition lists -->

  <xsl:template match="definitionList">
    <xsl:if test="node()">
      <fo:list-block provisional-label-separation="2mm" provisional-distance-between-starts="9mm">
        <xsl:call-template name="security_portion_mark">
          <xsl:with-param name="override_node_text">yes</xsl:with-param>
        </xsl:call-template>
        <xsl:apply-templates/>
      </fo:list-block>
    </xsl:if>
  </xsl:template>

  <xsl:template match="definitionListItem">
    <fo:list-item space-before="5mm">
      <fo:list-item-label>
        <xsl:if test="not(ancestor::step1 or ancestor::step2 or ancestor::step3 or ancestor::step4 or ancestor::step5 or ancestor::proceduralStep)">
          <xsl:attribute name="start-indent">5mm</xsl:attribute>
        </xsl:if>
        <fo:block>
          <fo:character character="&#8226;"/>
        </fo:block>
      </fo:list-item-label>
      <fo:list-item-body>
        <xsl:choose>
          <xsl:when test="ancestor::step1 or ancestor::step2 or ancestor::step3 or ancestor::step4 or ancestor::step5  or ancestor::proceduralStep">
            <xsl:attribute name="start-indent">28mm</xsl:attribute>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="start-indent">10mm</xsl:attribute>
          </xsl:otherwise>
        </xsl:choose>
        <fo:block space-start="25mm" padding-start="25mm">
          <xsl:call-template name="security_portion_mark"/>
          <xsl:apply-templates/>
        </fo:block>
      </fo:list-item-body>
    </fo:list-item>
  </xsl:template>

  <xsl:template match="note">
    <fo:block space-before="5mm" space-after="5mm" padding="2mm" background-color="green" keep-together.within-page="always">
      <fo:table table-layout="fixed" keep-together="always" xsl:use-attribute-sets="wcn_table">
        <fo:table-column/>
        <fo:table-body>
          <fo:table-row keep-together.within-page="always">
            <fo:table-cell>
              <fo:block xsl:use-attribute-sets="wcn_title">
                <xsl:value-of select="$style.common.note"/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row keep-together.within-page="always">
            <fo:table-cell>
              <fo:block font-size="10pt" text-align="center">
                <xsl:call-template name="security_portion_mark"/>
                <xsl:apply-templates/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <xsl:template match="note/para">
    <fo:block space-after="12pt">
      <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm"><!--color="blue"-->
        <xsl:call-template name="formatClass01"/>
        <xsl:call-template name="security_portion_mark"/>
      </fo:inline>
      <xsl:choose>
        <xsl:when test="seqlist or sequentialList">
          <fo:block color="black">
            <xsl:apply-templates/>
          </fo:block>
        </xsl:when>
        <xsl:when test="randlist">
          <fo:block color="black">
            <xsl:apply-templates/>
          </fo:block>
        </xsl:when>
        <xsl:otherwise>
          <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm">
            <xsl:call-template name="security_portion_mark">
              <xsl:with-param name="override_node_text">yes</xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates/>
          </fo:inline>
        </xsl:otherwise>
      </xsl:choose>
    </fo:block>
  </xsl:template>

  <xsl:template match="caution">
    <fo:block xsl:use-attribute-sets="wcn_div" border="1mm solid yellow">
      <xsl:attribute name="background-image">url('http://<xsl:value-of select="$host"/>
        <xsl:value-of select="$http_root"/>/images/caution_bg.gif')</xsl:attribute>
      <fo:table table-layout="fixed" keep-together.within-page="always" xsl:use-attribute-sets="wcn_table">
        <fo:table-column/>
        <fo:table-body>
          <fo:table-row keep-together.within-page="always">
            <fo:table-cell>
              <fo:block xsl:use-attribute-sets="wcn_title">
                <xsl:value-of select="$style.common.caution"/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row keep-together.within-page="always">
            <fo:table-cell>
              <fo:block font-size="10pt" text-align="center">
                <xsl:apply-templates/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>
  <!--*******Image rendering****************************-->

  <xsl:template match="symbol">
    <xsl:if test ="@DISPLAY = 'YES'">
      <fo:block text-align="center">
        <fo:external-graphic content-height="scale-to-fit">
          <xsl:attribute name="src">
            <xsl:value-of select="$bookPath"/>figures/<xsl:value-of select="@boardno|@infoEntityIdent"/>.<xsl:value-of select="@EXT"/>
          </xsl:attribute>
          <xsl:if test = "@width">
            <xsl:attribute name="width">
              <xsl:value-of select="@width"/>mm</xsl:attribute>
          </xsl:if>
          <xsl:if test = "@height">
            <xsl:attribute name="height">
              <xsl:value-of select="@height"/>mm</xsl:attribute>
          </xsl:if>
        </fo:external-graphic>
      </fo:block>
    </xsl:if>
  </xsl:template>
  <!--****************  End of Image rendering  ****************************-->

  <xsl:template match="caution/para">
    <fo:block space-after="12pt">
      <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm"><!--color="blue"-->
        <xsl:call-template name="security_portion_mark">
          <xsl:with-param name="override_node_text">yes</xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="formatClass01"/>
      </fo:inline>
      <xsl:choose>
        <xsl:when test="seqlist or sequentialList">
          <fo:block color="black">
            <xsl:apply-templates/>
          </fo:block>
        </xsl:when>
        <xsl:when test="randlist">
          <fo:block color="black">
            <xsl:apply-templates/>
          </fo:block>
        </xsl:when>
        <xsl:otherwise>
          <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm">
            <xsl:call-template name="security_portion_mark">
              <xsl:with-param name="override_node_text">yes</xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates/>
          </fo:inline>
        </xsl:otherwise>
      </xsl:choose>
    </fo:block>
  </xsl:template>

  <xsl:template match="warningsAndCautions"/>

  <xsl:template match="warning">
    <fo:block border="1mm solid red" xsl:use-attribute-sets="wcn_div">
      <xsl:attribute name="background-image">url('http://<xsl:value-of select="$host"/>
        <xsl:value-of select="$http_root"/>/images/warning_bg.gif')</xsl:attribute>
      <fo:table xsl:use-attribute-sets="wcn_table">
        <fo:table-column/>
        <fo:table-body>
          <fo:table-row keep-with-next="always">
            <fo:table-cell>
              <fo:block xsl:use-attribute-sets="wcn_title">
                <xsl:value-of select="$style.common.warning"/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block text-align="center">
                <xsl:apply-templates/>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>
  </xsl:template>

  <xsl:template match="warningAndCautionPara |notePara | warning/para">
    <fo:block space-after="12pt">
      <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm"><!--color="blue"-->
        <xsl:call-template name="formatClass01"/>
      </fo:inline>
      <fo:inline font-size="10pt" font-family="sans-serif" space-before="12pt" space-after="12pt" text-align="center" start-indent="20mm" end-indent="20mm">
        <xsl:call-template name="security_portion_mark"/>
        <xsl:apply-templates/>
      </fo:inline>
    </fo:block>
  </xsl:template>
  <!-- ********** Safety Conditions ****************** -->

  <xsl:template match="safety|reqSafety">
    <fo:block xsl:use-attribute-sets="h3">
      <xsl:value-of select="$style.common.safecond"/>
    </fo:block>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="safety/safetyRqmts | reqSafety/safetyRqmts">
    <xsl:if test="@warningRefs or @cautionRefs">
      <xsl:variable name="refwarns" select="//warningsAndCautions/warning"/>
      <xsl:variable name="warnrefs" select="@warningRefs"/>
      <xsl:for-each select="tokenize($warnrefs,' ')">
        <xsl:variable name="warnref" select="normalize-space(.)"/>
        <xsl:apply-templates select="$refwarns[@id=$warnref]"/>
      </xsl:for-each>

      <xsl:variable name="refcauts" select="//warningsAndCautions/caution"/>
      <xsl:variable name="cautrefs" select="@cautionRefs"/>
      <xsl:for-each select="tokenize($cautrefs,' ')">
        <xsl:variable name="cautref" select="normalize-space(.)"/>
        <xsl:apply-templates select="$refcauts[@id=$cautref]"/>
      </xsl:for-each>
    </xsl:if>
    <xsl:apply-templates select="warning"/>
    <xsl:apply-templates select="caution"/>
    <xsl:apply-templates select="note"/>
  </xsl:template>

  <xsl:template match="safecond|safetyRqmts">
    <xsl:call-template name="security_portion_mark">
      <xsl:with-param name="override_node_text">yes</xsl:with-param>
    </xsl:call-template>
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="nosafety|noSafety">
    <fo:block>
      <xsl:value-of select="$style.general.none"/>
    </fo:block>
  </xsl:template>
  <!-- ********** Closeup Conditions ****************** -->

  <xsl:template match="closeup">
    <fo:block xsl:use-attribute-sets="h2">
      <xsl:value-of select="$style.procedure.requirecomplete"/>
    </fo:block>
    <fo:list-block>
      <xsl:apply-templates/>
    </fo:list-block>
  </xsl:template>

  <xsl:template match="closeup/noclose">
    <fo:list-item>
      <fo:list-item-label>
        <fo:block/>
      </fo:list-item-label>
      <fo:list-item-body start-indent="7mm">
        <fo:block>
          <xsl:value-of select="$style.procedure.norequirement"/>
        </fo:block>
      </fo:list-item-body>
    </fo:list-item>
  </xsl:template>

  <xsl:template match="closeup/step1">
    <fo:list-item>
      <fo:list-item-label>
        <fo:block>
          <fo:character character="&#8226;"/>
        </fo:block>
      </fo:list-item-label>
      <fo:list-item-body start-indent="7mm">
        <fo:block>
          <xsl:call-template name="security_portion_mark">
            <xsl:with-param name="override_node_text">yes</xsl:with-param>
          </xsl:call-template>
          <xsl:apply-templates select="para"/>
        </fo:block>
        <fo:block>
          <xsl:if test="child::step2">
            <fo:list-block>
              <xsl:call-template name="security_portion_mark">
                <xsl:with-param name="override_node_text">yes</xsl:with-param>
              </xsl:call-template>
              <xsl:apply-templates select="step2"/>
            </fo:list-block>
          </xsl:if>
        </fo:block>
      </fo:list-item-body>
    </fo:list-item>
  </xsl:template>

  <xsl:template match="closereqs">
    <xsl:choose>
      <xsl:when test="$app_mode = '1'">
        <fo:block xsl:use-attribute-sets="h2">
          <xsl:value-of select="$style.procedure.requirecomplete"/>
        </fo:block>
        <xsl:apply-templates/>
      </xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>

  <xsl:template name='formatClass01'>
    <fo:inline space-before="12pt" space-after="12pt"><!--color="blue"-->
      <xsl:if test="self::node()[@class='01']">
        <xsl:choose>
          <xsl:when test="self::node()[@caveat='cv51']" >(U) <xsl:value-of select="$style.common.noforeigndisclosure"/>
          </xsl:when>
          <xsl:otherwise>(U) </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
    </fo:inline>
  </xsl:template>
  <!-- step numbering happens to be common across PROCED and AFI -->

  <xsl:template name='formatStepDesignator'>
    <fo:block>
      <xsl:if test="child::title">
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:if test="self::step1">
          <xsl:attribute name="font-size">12pt</xsl:attribute>
        </xsl:if>
        <xsl:if test="self::step2">
          <xsl:attribute name="font-size">11pt</xsl:attribute>
        </xsl:if>
      </xsl:if>
      <xsl:call-template name='getStepDesignator'/>
      <xsl:call-template name='getproceduralStepDesignator'/>
    </fo:block>
  </xsl:template>

  <xsl:template name="wcn-above-step">
    <fo:list-item space-after="1mm">
      <fo:list-item-label><fo:block/></fo:list-item-label>
      <fo:list-item-body start-indent="3mm"><fo:block><xsl:apply-templates select="."/></fo:block></fo:list-item-body>
    </fo:list-item>
  </xsl:template>

</xsl:stylesheet>