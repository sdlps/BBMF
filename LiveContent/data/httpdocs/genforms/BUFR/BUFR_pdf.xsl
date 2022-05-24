<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:fo="http://www.w3.org/1999/XSL/Format">

  <xsl:param name="filter_location"/>
  <xsl:param name="filtervars" select="document($filter_location)/form-instance/form-data"/>
  <!-- <form-data>
    <cond label='lcsdmcxref' id='hidden_lcsdmcxref'><item>SPITFIRE-AAAA-28-00-03-00-AA-520-A-A</item></cond>
    <cond label='ta_origtitleaddress' id='ta_origtitleaddress'><item>Battle Of Britain Memorial Flight, RAF Coningsby, LN4 4SY</item></cond>
    <cond label='txt_origdate' id='txt_origdate'><item>2022-02-17</item></cond>
    <cond label='txt_origReference' id='txt_origReference'><item>QQQ</item></cond>
    <cond label='txt_origUnitPOC' id='txt_origUnitPOC'><item>Dave%20Burrows%2C%20BBMF</item></cond>
    <cond label='txt_origEmail' id='txt_origEmail'><item>dave.burrows%40bbmf.mod.uk</item></cond>
    <cond label='txt_docRefDmc' id='txt_docRefDmc'><item>SPITFIRE-AAAA-28-00-03-00AA-520A-A</item></cond>
    <cond label='txt_docRefIssueInw' id='txt_docRefIssueInw'><item>000-10</item></cond>
    <cond label='txt_docRefTitle' id='txt_docRefTitle'><item>Fuel%20-%20Rigid%20fuel%20pipe%20(unions)%20-%20Remove%20procedure</item></cond>
    <cond label='txt_docRefElementLevel' id='txt_docRefElementLevel'><item>QQQ</item></cond>
    <cond label='txt_AircraftType' id='txt_AircraftType'><item>SPITFIRE</item></cond>
    <cond label='slt_AircraftMark' id='slt_AircraftMark'><item label='ii'>ii</item></cond>
    <cond label='txt_AircraftMarkOther' id='txt_AircraftMarkOther'><item>QQQ</item></cond>
    <cond label='ta_report1' id='ta_report1'><item>QQQ</item></cond>
    <cond label='ta_report2' id='ta_report2'><item>QQQ</item></cond>
    <cond label='chk_report3' id='chk_report3'><item>false</item></cond>
    <cond label='chk_report4' id='chk_report4'><item>false</item></cond>
    <cond label='null' id='txt_report4'><item>QQQ</item></cond>
    <cond label='txt_signature1' id='txt_signature1'><item>QQQ</item></cond>
    <cond label='txt_signature2' id='txt_signature2'><item>QQQ</item></cond>
    <cond label='txt_signature3' id='txt_signature3'><item>QQQ</item></cond>
    <cond label='txt_signature4' id='txt_signature4'><item>dave.burrows%40bbmf.mod.uk</item></cond>
    <cond label='txt_signature5' id='txt_signature5'><item>2022-02-17</item></cond>
  </form-data> -->

  <xsl:attribute-set name="table">
    <xsl:attribute name="border-collapse">collapse</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cell">
    <xsl:attribute name="padding">3pt</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="center">
    <xsl:attribute name="text-align">center</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="grey">
    <xsl:attribute name="background-color">#eee</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="celltight">
    <xsl:attribute name="padding">0pt</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="celltightanddeep">
    <xsl:attribute name="padding-left">0pt</xsl:attribute>
    <xsl:attribute name="padding-right">0pt</xsl:attribute>
    <xsl:attribute name="padding-top">5pt</xsl:attribute>
    <xsl:attribute name="padding-bottom">5pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellbordersall">
    <xsl:attribute name="border">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellborderstbr">
    <xsl:attribute name="border-top">1pt solid rgb(0,0,0)</xsl:attribute>
    <xsl:attribute name="border-bottom">1pt solid rgb(0,0,0)</xsl:attribute>
    <xsl:attribute name="border-right">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellborderstb">
    <xsl:attribute name="border-top">1pt solid rgb(0,0,0)</xsl:attribute>
    <xsl:attribute name="border-bottom">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellbordersltr">
    <xsl:attribute name="border-top">1pt solid rgb(0,0,0)</xsl:attribute>
    <xsl:attribute name="border-left">1pt solid rgb(0,0,0)</xsl:attribute>
    <xsl:attribute name="border-right">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellbordersl">
    <xsl:attribute name="border-left">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellbordersr">
    <xsl:attribute name="border-right">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellborderst">
    <xsl:attribute name="border-top">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="cellbordersb">
    <xsl:attribute name="border-bottom">1pt solid rgb(0,0,0)</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="blockpara">
    <xsl:attribute name="margin">1pt</xsl:attribute>
  </xsl:attribute-set>
  <xsl:attribute-set name="block">
    <xsl:attribute name="width">99%</xsl:attribute>
    <xsl:attribute name="border">1pt solid #000</xsl:attribute>
    <xsl:attribute name="background-color">#eee</xsl:attribute>
  </xsl:attribute-set>
  
  <xsl:template match="/">
    <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" line-height="120%" font-size="10pt" font-family="sans-serif" language="en">
      <fo:layout-master-set>
        <fo:simple-page-master master-name="bufrform" page-width="210mm" page-height="297mm"
                               margin-top="10mm" margin-bottom="10mm" margin-left="10mm" margin-right="10mm">
          <fo:region-body margin-top="7mm" margin-bottom="7mm"/>
          <fo:region-before extent="15mm"/>
          <fo:region-after  extent="15mm"/>
        </fo:simple-page-master>
        <fo:page-sequence-master master-name="content"><fo:repeatable-page-master-alternatives>
          <fo:conditional-page-master-reference page-position="any" odd-or-even="any" master-reference="bufrform"/>
        </fo:repeatable-page-master-alternatives></fo:page-sequence-master>
      </fo:layout-master-set>
      <fo:page-sequence master-reference="content">
        <fo:flow flow-name="xsl-region-body"><fo:block>
          <xsl:apply-templates select=".//generic_form"/>
        </fo:block></fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template><!-- End of root template -->

  <xsl:template match="generic_form" priority="5">
    <fo:block id="page1"><xsl:call-template name="controls_layout"/></fo:block>
    <!-- <fo:block id="page2" page-break-before="always"><xsl:call-template name="controls_layout_p2"/></fo:block> -->
  </xsl:template>
  
  <xsl:template name="controls_layout">
    <!-- <fo:table xsl:use-attribute-sets="table" width="100%"><fo:table-body><fo:table-row>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/text[@id='topgrid']"/></fo:block></fo:table-cell>
      <fo:table-cell xsl:use-attribute-sets="cell" text-align="right"><fo:block>
      <xsl:apply-templates select="content/text[@id='formName']"/>
      <xsl:apply-templates select="content/text[@id='revStatement']"/>
      <xsl:apply-templates select="content/text[@id='ppq']"/>
      </fo:block></fo:table-cell>
    </fo:table-row></fo:table-body></fo:table> -->
    <xsl:apply-templates select="content/title[@id='ufr']"/>
    <!-- <xsl:apply-templates select="content/title[@id='ufrsubtitle']"/> -->
    <xsl:apply-templates select="content/hidden[@id='lcsdmcxref']"/>
    
    <fo:block>
    <fo:table xsl:use-attribute-sets="table" width="100%">
      <fo:table-column width="50%"/>
      <fo:table-column width="50%"/>
      <fo:table-body>
      <!-- <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall" number-columns-spanned="2" text-align="left"><fo:block>
        <xsl:apply-templates select="content/div[@id='part0']/text[@id='formRef']"/>
      </fo:block></fo:table-cell></fo:table-row> -->

      <fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellborderst" text-align="left"><fo:block>
          <!-- <xsl:apply-templates select="content/div[@id='part1']/title"/> -->
          <fo:block><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origtitleaddress']"/></fo:block>
        </fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="cell cellbordersr cellborderst" text-align="left"><fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origdate']"/></fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origReference']"/></fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origUnitPOC']"/></fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origEmail']"/></fo:block>
        </fo:block></fo:table-cell>
      </fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersltr" text-align="left" number-columns-spanned="2"><fo:block>
        <xsl:apply-templates select="content/div[@id='part2']/title"/>
      </fo:block></fo:table-cell></fo:table-row>
      <fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="cell cellbordersl" text-align="left"><fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefDmc']"/></fo:block>
        </fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="cell cellbordersr" text-align="left"><fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefIssueInw']"/></fo:block>
        </fo:block></fo:table-cell>
      </fo:table-row>
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefTitle']"/></fo:block>
      </fo:block></fo:table-cell></fo:table-row>
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefElementLevel']"/></fo:block>
      </fo:block></fo:table-cell></fo:table-row>
      <fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="celltight cellbordersl" text-align="left"><fo:block><fo:table xsl:use-attribute-sets="table" width="100%"><fo:table-body><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='AircraftType']"/></fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='part2']/dropdown[@id='AircraftMark']"/></fo:block></fo:table-cell>
        </fo:table-row></fo:table-body></fo:table></fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="cell cellbordersr" text-align="left"><fo:block>
          <fo:block><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='AircraftMarkOther']"/></fo:block>
        </fo:block></fo:table-cell>
      </fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersltr" text-align="left" number-columns-spanned="2"><fo:block>
        <xsl:apply-templates select="content/div[@id='part3']/title"/>
      </fo:block></fo:table-cell></fo:table-row>
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part3']/textinput[@id='report1']"/></fo:block>
      </fo:block></fo:table-cell></fo:table-row>
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part3']/textinput[@id='report2']"/></fo:block>
      </fo:block></fo:table-cell></fo:table-row>
      <!-- <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part3']/confirm[@id='report3']"/></fo:block>
      </fo:block></fo:table-cell></fo:table-row> -->
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersl cellbordersr cellbordersb" text-align="left" number-columns-spanned="2"><fo:block>
        <fo:block><xsl:apply-templates select="content/div[@id='part3']/confirm[@id='report4']"/>
        <!-- <xsl:apply-templates select="content/div[@id='part3']/text[@id='report5']"/> --></fo:block>
      </fo:block></fo:table-cell></fo:table-row>

      <!-- <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall" text-align="left" number-columns-spanned="2"><fo:block>
      <fo:table xsl:use-attribute-sets="table" width="100%">
      <fo:table-column column-number="1" column-width="25%"/>
      <fo:table-column column-number="2" column-width="25%"/>
      <fo:table-column column-number="3" column-width="10%"/>
      <fo:table-column column-number="4" column-width="30%"/>
      <fo:table-column column-number="5" column-width="10%"/>
      <fo:table-body><fo:table-row>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature1']"/></fo:block></fo:table-cell>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature2']"/></fo:block></fo:table-cell>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature3']"/></fo:block></fo:table-cell>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature4']"/></fo:block></fo:table-cell>
      <fo:table-cell xsl:use-attribute-sets="cell"><fo:block><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature5']"/></fo:block></fo:table-cell>
      </fo:table-row></fo:table-body></fo:table>
      </fo:block></fo:table-cell></fo:table-row> -->

      </fo:table-body>
    </fo:table></fo:block>
  </xsl:template>
  
  <xsl:template match="title[@id='ufr']">
    <fo:block font-weight="bold" font-size="180%" line-height="1em" margin-bottom="1em" text-align="center"><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="title[@id='ufrsubtitle']">
    <fo:block font-size="150%" line-height="1em" text-align="center"><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="hidden[@id='lcsdmcxref']">
    <input type="hidden" id="hidden_lcsdmcxref" label="lcsdmcxref" required="true" formtype="form765"><xsl:apply-templates/></input>
  </xsl:template>
  <xsl:template match="text[@id='formRef']">
    <fo:block font-weight="bold" font-size="100%"><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="text[@id='formName']">
    <fo:block font-weight="bold"><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="text[@id='revStatement']">
    <fo:block font-size="80%"><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="text[@id='ppq']">
    <fo:block font-size="80%" font-weight="bold">PPQ = <xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="div[@id='part1']/title | div[@id='part2']/title | div[@id='part3']/title">
    <fo:block font-weight="bold" font-size="100%"><xsl:apply-templates/></fo:block>
  </xsl:template>
  
  <xsl:template name="labelandblock">
    <xsl:param name="height"></xsl:param>
    <xsl:param name="fontsize">100%</xsl:param>
    <xsl:param name="prefix">txt_</xsl:param>
    <xsl:param name="id" select="@id"/>
    <fo:inline font-size="{$fontsize}"><xsl:apply-templates/></fo:inline>
    <fo:block-container xsl:use-attribute-sets="block">
      <xsl:if test="$height"><xsl:attribute name="height"><xsl:value-of select="$height"/></xsl:attribute></xsl:if>
      <fo:block xsl:use-attribute-sets="blockpara" font-size="{$fontsize}"><xsl:value-of select="$filtervars//cond[@id=concat($prefix,$id)]/item"/></fo:block>
    </fo:block-container>
  </xsl:template>

  <xsl:template match="div[@id='part1']/textinput[@id='origtitleaddress']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">ta_</xsl:with-param>
      <xsl:with-param name="height">30mm</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="div[@id='part1']/textinput[@id='origdate'] | 
                       div[@id='part1']/textinput[@id='origReference'] |
                       div[@id='part1']/textinput[@id='origUnitPOC'] | 
                       div[@id='part1']/textinput[@id='origEmail']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">txt_</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="div[@id='part2']/textinput[@id='docRefDmc'] | 
                       div[@id='part2']/textinput[@id='docRefIssueInw'] |
                       div[@id='part2']/textinput[@id='docRefTitle'] | 
                       div[@id='part2']/textinput[@id='docRefElementLevel'] | 
                       div[@id='part2']/textinput[@id='AircraftType'] | 
                       div[@id='part2']/textinput[@id='AircraftMarkOther']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">txt_</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="div[@id='part2']/dropdown[@id='AircraftMark']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">slt_</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="div[@id='part3']/textinput[@id='report1'] | div[@id='part3']/textinput[@id='report2']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">ta_</xsl:with-param>
      <xsl:with-param name="height">30mm</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  
  <xsl:template name="makecheckandbox">
    <xsl:variable name="id" select="@id"/>
    <xsl:variable name="chk" select="$filtervars//cond[@id=concat('chk_',$id)]/item"/>
    <fo:instream-foreign-object baseline-shift="-1mm"><svg:svg width="24" height="11" viewBox="0 0 24 11" xmlns:svg="http://www.w3.org/2000/svg">
      <svg:g aria-label="? " style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;line-height:125%;font-family:'Times New Roman';text-align:start;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332" id="text4533-6" transform="matrix(2.7323963,0,0,2.1389105,-329.06233,-268.66199)">
        <svg:path d="m 120.65615,128.5056 q -0.0438,-0.0438 -0.0724,-0.0781 -0.0286,-0.0362 -0.0286,-0.0629 0,-0.0286 0.0248,-0.0495 0.0267,-0.0229 0.0629,-0.0362 0.0362,-0.0153 0.0762,-0.021 0.0419,-0.008 0.0705,-0.008 0.0305,0 0.0495,0.0153 0.021,0.0133 0.0476,0.04 0.17913,0.17912 0.32395,0.38492 0.14673,0.2058 0.27059,0.40779 0.2382,-0.65932 0.55452,-1.27863 0.31632,-0.61931 0.71268,-1.1605 0.0381,-0.0533 0.11815,-0.0819 0.0819,-0.0286 0.18293,-0.0286 0.0324,0 0.0515,0.0133 0.0191,0.0114 0.0191,0.0343 0,0.0229 -0.006,0.04 -0.006,0.0152 -0.0267,0.0419 -0.21151,0.28012 -0.4116,0.58692 -0.19818,0.30679 -0.37921,0.64789 -0.18103,0.33919 -0.343,0.71268 -0.16197,0.37349 -0.29727,0.7851 -0.004,0.0114 -0.021,0.021 -0.0172,0.008 -0.0419,0.0133 -0.0248,0.006 -0.0553,0.008 -0.0305,0.004 -0.061,0.004 -0.0438,0 -0.08,-0.01 -0.0362,-0.008 -0.0533,-0.0362 -0.0915,-0.15626 -0.1696,-0.27441 -0.0781,-0.12005 -0.15816,-0.22295 -0.08,-0.1029 -0.16769,-0.20008 -0.0857,-0.0972 -0.19246,-0.20771 z"
        style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;font-family:'Times New Roman';fill:#000000;stroke-width:0.26458332"/>
      </svg:g>
      <svg:rect style="fill:none;fill-opacity:1;stroke:#000000;stroke-width:0.26458332;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect4522-9" width="10" height="10" x="10" y="0.2" />
      <xsl:if test="$chk='true'">
      <svg:g aria-label="? " style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;line-height:125%;font-family:'Times New Roman';text-align:start;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332" id="text4533-6-6" transform="matrix(2.7323963,0,0,2.1389105,-318.07021,-268.66199)">
        <svg:path d="m 120.65615,128.5056 q -0.0438,-0.0438 -0.0724,-0.0781 -0.0286,-0.0362 -0.0286,-0.0629 0,-0.0286 0.0248,-0.0495 0.0267,-0.0229 0.0629,-0.0362 0.0362,-0.0153 0.0762,-0.021 0.0419,-0.008 0.0705,-0.008 0.0305,0 0.0495,0.0153 0.021,0.0133 0.0476,0.04 0.17913,0.17912 0.32395,0.38492 0.14673,0.2058 0.27059,0.40779 0.2382,-0.65932 0.55452,-1.27863 0.31632,-0.61931 0.71268,-1.1605 0.0381,-0.0533 0.11815,-0.0819 0.0819,-0.0286 0.18293,-0.0286 0.0324,0 0.0515,0.0133 0.0191,0.0114 0.0191,0.0343 0,0.0229 -0.006,0.04 -0.006,0.0152 -0.0267,0.0419 -0.21151,0.28012 -0.4116,0.58692 -0.19818,0.30679 -0.37921,0.64789 -0.18103,0.33919 -0.343,0.71268 -0.16197,0.37349 -0.29727,0.7851 -0.004,0.0114 -0.021,0.021 -0.0172,0.008 -0.0419,0.0133 -0.0248,0.006 -0.0553,0.008 -0.0305,0.004 -0.061,0.004 -0.0438,0 -0.08,-0.01 -0.0362,-0.008 -0.0533,-0.0362 -0.0915,-0.15626 -0.1696,-0.27441 -0.0781,-0.12005 -0.15816,-0.22295 -0.08,-0.1029 -0.16769,-0.20008 -0.0857,-0.0972 -0.19246,-0.20771 z"
        style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;font-family:'Times New Roman';fill:#000000;stroke-width:0.26458332"/>
      </svg:g></xsl:if>
    </svg:svg></fo:instream-foreign-object>
  </xsl:template>

  <xsl:template name="makecheck">
    <fo:instream-foreign-object baseline-shift="-1mm"><svg:svg width="11" height="11" viewBox="0 0 11 11" xmlns:svg="http://www.w3.org/2000/svg">
      <svg:g aria-label="? " style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;line-height:125%;font-family:'Times New Roman';text-align:start;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332" id="text4533-6" transform="matrix(2.7323963,0,0,2.1389105,-329.06233,-268.66199)">
        <svg:path d="m 120.65615,128.5056 q -0.0438,-0.0438 -0.0724,-0.0781 -0.0286,-0.0362 -0.0286,-0.0629 0,-0.0286 0.0248,-0.0495 0.0267,-0.0229 0.0629,-0.0362 0.0362,-0.0153 0.0762,-0.021 0.0419,-0.008 0.0705,-0.008 0.0305,0 0.0495,0.0153 0.021,0.0133 0.0476,0.04 0.17913,0.17912 0.32395,0.38492 0.14673,0.2058 0.27059,0.40779 0.2382,-0.65932 0.55452,-1.27863 0.31632,-0.61931 0.71268,-1.1605 0.0381,-0.0533 0.11815,-0.0819 0.0819,-0.0286 0.18293,-0.0286 0.0324,0 0.0515,0.0133 0.0191,0.0114 0.0191,0.0343 0,0.0229 -0.006,0.04 -0.006,0.0152 -0.0267,0.0419 -0.21151,0.28012 -0.4116,0.58692 -0.19818,0.30679 -0.37921,0.64789 -0.18103,0.33919 -0.343,0.71268 -0.16197,0.37349 -0.29727,0.7851 -0.004,0.0114 -0.021,0.021 -0.0172,0.008 -0.0419,0.0133 -0.0248,0.006 -0.0553,0.008 -0.0305,0.004 -0.061,0.004 -0.0438,0 -0.08,-0.01 -0.0362,-0.008 -0.0533,-0.0362 -0.0915,-0.15626 -0.1696,-0.27441 -0.0781,-0.12005 -0.15816,-0.22295 -0.08,-0.1029 -0.16769,-0.20008 -0.0857,-0.0972 -0.19246,-0.20771 z"
        style="font-style:normal;font-variant:normal;font-weight:400;font-size:3.9026041px;font-family:'Times New Roman';fill:#000000;stroke-width:0.26458332"/>
      </svg:g>
    </svg:svg></fo:instream-foreign-object>
  </xsl:template>

  <xsl:template match="div[@id='part3']/confirm[@id='report3']">
    <xsl:call-template name="makecheckandbox"/><xsl:apply-templates/>
  </xsl:template>
  <xsl:template match="div[@id='part3']/confirm[@id='report4']">
    <xsl:call-template name="makecheckandbox"/><xsl:apply-templates/><xsl:text>&#0160;</xsl:text>
    <fo:inline-container width="89mm" height="3mm">
      <fo:block xsl:use-attribute-sets="blockpara cellbordersall">
      <xsl:attribute name="background-color">#eee</xsl:attribute>
      <xsl:value-of select="$filtervars//cond[@id='txt_report4']/item"/>&#0160;</fo:block>
    </fo:inline-container>
  </xsl:template>

  <xsl:template match="div[@id='part3']/text[@id='report5']">
    <fo:block font-size="80%" margin-left="24px"><xsl:apply-templates select="text()"/></fo:block>
  </xsl:template>

  <xsl:template match="div[@id='signature']/textinput[@id='signature1'] |
                       div[@id='signature']/textinput[@id='signature2'] | 
                       div[@id='signature']/textinput[@id='signature3'] | 
                       div[@id='signature']/textinput[@id='signature4'] | 
                       div[@id='signature']/textinput[@id='signature5']">
    <xsl:call-template name="labelandblock">
      <xsl:with-param name="prefix">txt_</xsl:with-param><xsl:with-param name="fontsize">80%</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
  
  <xsl:template match="text[@id='topgrid']">
    <fo:table xsl:use-attribute-sets="table"><fo:table-body><fo:table-row>
    <xsl:call-template name="makegridcell"/>
    </fo:table-row></fo:table-body></fo:table>
  </xsl:template>
  
  <xsl:template name="makeinlineformfield">
    <xsl:param name="src" select="1"/>
    <fo:inline baseline-shift="1pt" xsl:use-attribute-sets="cellbordersall" background-color="#eee" font-size="110%">
      <xsl:call-template name="makeformcontent"><xsl:with-param name="max" select="$src"/></xsl:call-template>
    </fo:inline>
  </xsl:template>
  
  <xsl:template name="makeformcontent">
    <xsl:param name="ct" select="1"/>
    <xsl:param name="max" select="40"/>
    <xsl:text>&#0160;</xsl:text>
    <xsl:if test="$ct &lt; $max">
      <xsl:call-template name="makeformcontent">
        <xsl:with-param name="ct" select="$ct + 1"/>
        <xsl:with-param name="max" select="$max"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template name="makegridcell">
    <xsl:param name="ct" select="1"/>
    <xsl:param name="max" select="40"/>
    <fo:table-cell xsl:use-attribute-sets="cell cellbordersall" width="4mm"><fo:block>&#0160;</fo:block></fo:table-cell><!---->
    <xsl:if test="$ct &lt; $max">
      <xsl:call-template name="makegridcell">
        <xsl:with-param name="ct" select="$ct + 1"/>
        <xsl:with-param name="max" select="$max"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  
  <xsl:template name="controls_layout_p2">
    <fo:table xsl:use-attribute-sets="table" width="100%">
      <fo:table-column width="50%"/>
      <fo:table-body>
      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall"><fo:block>
        <fo:block font-weight="bold">Part 3 - Technical Information Sponsor</fo:block>
        <fo:list-block>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Report agreed</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Report partially agreed</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Report not agreed</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Amendment(s) passed to Publication Organization</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Information copied to other Service users</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>No other TI/LIS are affected by this recommendation</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>
          <fo:inline>Other TI/LIS are affected by this recommendation and have been reported at (eg MOD Form 765 or REMEDY RECORD Reference) </fo:inline>
          <xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="125"/></xsl:call-template>
        </fo:block></fo:list-item-body></fo:list-item>
        </fo:list-block>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall" text-align="left"><fo:block>
        <fo:block font-weight="bold">Comments (include continuation sheet(s) if necessary)</fo:block>
        <fo:block-container xsl:use-attribute-sets="block" height="55mm">
          <fo:block xsl:use-attribute-sets="blockpara">&#0160;</fo:block>
        </fo:block-container>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="celltightanddeep cellbordersall" text-align="left"><fo:block>
        <fo:block>
        <fo:inline>Data Unit Feedback despatched </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        <fo:inline> Passed to Publication Organization on </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        </fo:block>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="celltight cellbordersall" text-align="left"><fo:block>
        <fo:table xsl:use-attribute-sets="table" width="100%">
        <fo:table-column column-number="1" column-width="25%"/>
        <fo:table-column column-number="2" column-width="25%"/>
        <fo:table-column column-number="3" column-width="10%"/>
        <fo:table-column column-number="4" column-width="30%"/>
        <fo:table-column column-number="5" column-width="10%"/>
        <fo:table-body><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Signature</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Rank/Grade and Name</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Tel No</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Role email address</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstb"><fo:block xsl:use-attribute-sets="center">Date</fo:block></fo:table-cell>
        </fo:table-row><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstb  grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        </fo:table-row></fo:table-body></fo:table>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall" text-align="left"><fo:block>
        <fo:block font-weight="bold">Part 4 - Publication Organization</fo:block>
        <fo:list-block>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>
          <fo:inline>Interim report issued. Ref. </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
          <fo:inline>&#0160;&#0160;Dated </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        </fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>Temporary amendment issued, formal amendment will follow</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>
          <fo:inline>Recommendation will be actioned in Amdt/Issue/Rev </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
          <fo:inline> to be issued </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        </fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>I know of no other TI that may be affected by this recommendation</fo:block></fo:list-item-body></fo:list-item>
        <fo:list-item><fo:list-item-label end-indent="label-end()"><fo:block><xsl:call-template name="makecheckandbox"/></fo:block></fo:list-item-label>
        <fo:list-item-body start-indent="10mm"><fo:block>
          <fo:inline>Other TI affected have been reported at: </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="60"/></xsl:call-template>
          <fo:inline> (MOD Form 765 Ref)</fo:inline>
        </fo:block></fo:list-item-body></fo:list-item>
        </fo:list-block>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="cell cellbordersall" text-align="left"><fo:block>
        <fo:block>Remarks</fo:block>
        <fo:block-container xsl:use-attribute-sets="block" height="55mm">
          <fo:block xsl:use-attribute-sets="blockpara">&#0160;</fo:block>
        </fo:block-container>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="celltightanddeep cellbordersall" text-align="left"><fo:block>
        <fo:block font-size="92%">
        <fo:inline>Copy returned to TI sponsor, info copies to </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        <fo:inline> (Originator), </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        <fo:inline> (FLC) &amp; </fo:inline><xsl:call-template name="makeinlineformfield"><xsl:with-param name="src" select="30"/></xsl:call-template>
        </fo:block>
      </fo:block></fo:table-cell></fo:table-row>

      <fo:table-row><fo:table-cell xsl:use-attribute-sets="celltight cellbordersall" text-align="left"><fo:block>
        <fo:table xsl:use-attribute-sets="table" width="100%">
        <fo:table-column column-number="1" column-width="25%"/>
        <fo:table-column column-number="2" column-width="25%"/>
        <fo:table-column column-number="3" column-width="10%"/>
        <fo:table-column column-number="4" column-width="30%"/>
        <fo:table-column column-number="5" column-width="10%"/>
        <fo:table-body><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Signature</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Rank/Grade and Name</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Tel No</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr"><fo:block xsl:use-attribute-sets="center">Role email address</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstb"><fo:block xsl:use-attribute-sets="center">Date</fo:block></fo:table-cell>
        </fo:table-row><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstbr grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="celltightanddeep cellborderstb  grey"><fo:block font-size="160%">&#0160;</fo:block></fo:table-cell>
        </fo:table-row></fo:table-body></fo:table>
      </fo:block></fo:table-cell></fo:table-row>

    </fo:table-body></fo:table>
    <fo:block margin-top="3pt"><xsl:call-template name="makecheck"/> Tick box as required&#0160;&#0160;&#0160;&#0160;&#0160;&#0160;* Deleted as appropriate</fo:block>

  </xsl:template>
  
</xsl:stylesheet>

<!--
<generic_form><idstatus><name/><title/></idstatus>
<name/><title/><content>
  <text id='topgrid'/>
  <text id='formName'/>
  <text id='revStatement'/>
  <text id='ppq'/>
  <title id='ufr'/>
  <title id='ufrsubtitle'/>
  <hidden id='lcsdmcxref'/>
  <div id='part0'><text id='formRef'/></div>
  <div id='part1'><title/>
    <textinput id='origtitleaddress'/>
    <textinput id='origdate'/>
    <textinput id='origReference'/>
    <textinput id='origUnitPOC'/>
    <textinput id='origEmail'/>
  </div>
  <div id='part2'><title/>
    <textinput id='docRefDmc'/>
    <textinput id='docRefIssueInw'/>
    <textinput id='docRefTitle'/>
    <textinput id='docRefElementLevel'/>
    <textinput id='AircraftType'/>
    <dropdown id='AircraftMark'/>
    <textinput id='AircraftMarkOther'/>
  </div>
  <div id='part3'><title/>
    <textinput id='report1'/>
    <textinput id='report2'/>
    <confirm id='report3'/>
    <confirm id='report4'/>
    <text id='report5'/>
  </div>
  <div id='signature'>
    <textinput id='signature1'/>
    <textinput id='signature2'/>
    <textinput id='signature3'/>
    <textinput id='signature4'/>
    <textinput id='signature5'/>
  </div>
</content></generic_form>
-->