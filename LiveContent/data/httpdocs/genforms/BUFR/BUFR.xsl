<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="generic_form" priority="5">
    <div id="form_container">
      <xsl:attribute name="form_name"><xsl:value-of select="$form_name"/></xsl:attribute>
      <xsl:attribute name="form_type"><xsl:value-of select="$form_type"/></xsl:attribute>
      <xsl:attribute name="instance_name"><xsl:value-of select="$instance_id"/></xsl:attribute>
      <div><xsl:call-template name="controls_layout"/></div>
      <center>
      <input id="bufrSaveBtn" class="ui-button ui-corner-all ui-widget" type="button" value="Save" onClick="CVPortal.components.cvDocHandler.saveBufrForm()" style="width:120px" disabled="1"/>
      <span>&#0160;</span>
      <input id="bufrPrt1Btn" class="ui-button ui-corner-all ui-widget" type="button" value="Print form" onClick="CVPortal.components.cvDocHandler.printBufrForm(false)" style="width:120px" disabled="1"/>
      <span>&#0160;</span>
      <!--
      <input id="bufrPrt2Btn" class="ui-button ui-corner-all ui-widget" type="button" value="Print all" onClick="CVPortal.components.cvDocHandler.printBufrForm(true)" style="width:120px" disabled="1"/>
      <span>&#0160;</span>
      -->
      <input id="bufrClseBtn" class="ui-button ui-corner-all ui-widget" type="button" value="Close" onClick="CVPortal.components.cvDocHandler.closeBufrForm()" style="width:120px"/>
      </center>
      <script><![CDATA[
        function disableChk3() {
          //$("#chk_report3").prop({ 'checked': false });
          var chk = $("#chk_report4").prop('checked');
          if (chk) {
            $("#txt_report4").attr('required','true');
          } else {
            $("#txt_report4").removeAttr('required');
          }
          CVPortal.components.cvDocHandler.setRequiredForms();
        }
        function disableChk4() {
          $("#chk_report4").prop({ 'checked': false });
          $("#txt_report4").css('background-color','#eee');
          $("#txt_report4").css('border','');
          $("#txt_report4").prop({ 'value': '' });
        }
        function enableSave()  { $("#bufrSaveBtn").button({ disabled: false }); }
        $("#chk_report3").on("click", disableChk4);
        $("#chk_report4").on("click", disableChk3);
        $("#txt_origReference").on("change", enableSave);
        $("#txt_docRefElementLevel").on("change", enableSave);
        $("#slt_AircraftMark").on("change", enableSave);
        $("#txt_AircraftMarkOther").on("change", enableSave);
        $("#ta_report1").on("change", enableSave);
        $("#ta_report2").on("change", enableSave);
        $("#txt_report4").on("change", enableSave);
        $("#chk_report3").on("change", enableSave);
        $("#chk_report4").on("change", enableSave);
        $("#txt_signature1").on("change", enableSave);
        $("#txt_signature2").on("change", enableSave);
        $("#txt_signature3").on("change", enableSave);
      ]]></script>
    </div>
  </xsl:template>

  <xsl:template name="controls_layout">
  <!--
    <table width="100%" cellpadding="2" cellspacing="0"><tbody><tr>
      <td><xsl:apply-templates select="content/text[@id='topgrid']"/></td>
      <td style="text-align:right;">
      <xsl:apply-templates select="content/text[@id='formName']"/>
      <xsl:apply-templates select="content/text[@id='revStatement']"/>
      <xsl:apply-templates select="content/text[@id='ppq']"/>
      </td>
    </tr></tbody></table>
  -->
    <table width="100%" cellpadding="2" cellspacing="0">
      <col width="10%"></col><col width="90%"></col>
      <tbody><tr>
      <td><img width="100%"
        src="/servlets3/wietmsd?id=@SESSION_ID@&amp;target=resource&#38;action=image&#38;file_name=aircraft/Battle_of_Britain_Memorial_Flight_Crest.jpg"/></td>
      <td>
      <xsl:apply-templates select="content/title[@id='ufr']"/>
      <!-- <xsl:apply-templates select="content/title[@id='ufrsubtitle']"/> -->
      <xsl:apply-templates select="content/hidden[@id='lcsdmcxref']"/>
      </td>
    </tr></tbody></table>
    
    <div id="bufrformcontainer" style="padding:0; overflow:scroll; overflow-y:auto; overflow-x:hidden; height:600px; float:left; position:relative;">
    <table width="100%" cellpadding="2" cellspacing="0" class="Form765" style="border-collapse:collapse;">
      <col width="50%"></col>
      <col width="50%"></col>
      <tbody>
      <!--
      <tr><td colspan="2" style="border:2px solid #000; text-align:left;">
        <xsl:apply-templates select="content/div[@id='part0']/text[@id='formRef']"/>
      </td></tr>
      -->

      <tr>
        <td style="border-left:2px solid #000; border-top:2px solid #000; text-align:left;">
          <!--
          <xsl:apply-templates select="content/div[@id='part1']/title"/>
          -->
          <div><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origtitleaddress']"/></div>
        </td>
        <td style="border-right:2px solid #000; border-top:2px solid #000; text-align:left;">
          <div><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origdate']"/></div>
          <div><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origReference']"/></div>
          <div><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origUnitPOC']"/></div>
          <div><xsl:apply-templates select="content/div[@id='part1']/textinput[@id='origEmail']"/></div>
        </td>
      </tr>

      <tr><td style="border-left:2px solid #000; border-top:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <xsl:apply-templates select="content/div[@id='part2']/title"/>
      </td></tr>
      <tr>
        <td style="border-left:2px solid #000; text-align:left;">
          <div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefDmc']"/></div>
        </td>
        <td style="border-right:2px solid #000; text-align:left;">
          <div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefIssueInw']"/></div>
        </td>
      </tr>
      <tr><td style="border-left:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefTitle']"/></div>
      </td></tr>
      <tr><td style="border-left:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='docRefElementLevel']"/></div>
      </td></tr>
      <tr>
        <td style="border-left:2px solid #000; text-align:left;"><table width="100%" cellpadding="0" cellspacing="0"><tbody><tr>
        <td><div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='AircraftType']"/></div></td>
        <td><div><xsl:apply-templates select="content/div[@id='part2']/dropdown[@id='AircraftMark']"/></div></td>
        </tr></tbody></table></td>
        <td style="border-right:2px solid #000; text-align:left;">
          <div><xsl:apply-templates select="content/div[@id='part2']/textinput[@id='AircraftMarkOther']"/></div>
        </td>
      </tr>

      <tr><td style="border-left:2px solid #000; border-top:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <xsl:apply-templates select="content/div[@id='part3']/title"/>
      </td></tr>
      <tr><td style="border-left:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <div><xsl:apply-templates select="content/div[@id='part3']/textinput[@id='report1']"/></div>
      </td></tr>
      <tr><td style="border-left:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <div><xsl:apply-templates select="content/div[@id='part3']/textinput[@id='report2']"/></div>
      </td></tr>
      <!-- <tr><td style="border-left:2px solid #000; border-right:2px solid #000; text-align:left;" colspan="2">
        <div id="report3"><xsl:apply-templates select="content/div[@id='part3']/confirm[@id='report3']"/></div>
      </td></tr> -->
      <tr><td style="border:2px solid #000; text-align:left;" colspan="2">
        <div id="report4"><xsl:apply-templates select="content/div[@id='part3']/confirm[@id='report4']"/></div>
        <!--
        <xsl:apply-templates select="content/div[@id='part3']/text[@id='report5']"/>
        -->
      </td></tr>

      <!--
      <tr><td style="border:2px solid #000; text-align:left;" colspan="2">
      <table width="100%" style="border-collapse:collapse;">
      <col width="25%"></col><col width="25%"></col><col width="15%"></col><col width="20%"></col><col width="15%"></col>
      <tbody><tr>
      <td><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature1']"/></td>
      <td><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature2']"/></td>
      <td><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature3']"/></td>
      <td><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature4']"/></td>
      <td><xsl:apply-templates select="content/div[@id='signature']/textinput[@id='signature5']"/></td>
      </tr></tbody></table>
      </td></tr>
      -->

      </tbody>
    </table></div>
  </xsl:template>
  
  <xsl:template match="title[@id='ufr']">
    <div style="font-weight:bold;font-size:180%"><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="title[@id='ufrsubtitle']">
    <div style="font-size:150%"><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="hidden[@id='lcsdmcxref']">
    <input type="hidden" id="hidden_lcsdmcxref" label="lcsdmcxref" required="true" formtype="form765"><xsl:apply-templates/></input>
  </xsl:template>
  <xsl:template match="text[@id='formRef']">
    <div style="font-weight:bold;font-size:100%"><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="text[@id='formName']">
    <div style="font-weight:bold"><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="text[@id='revStatement']">
    <div style="font-size:80%"><xsl:apply-templates/></div>
  </xsl:template>
  <xsl:template match="text[@id='ppq']">
    <div style="font-size:80%; font-weight:bold">PPQ = <xsl:apply-templates/></div>
  </xsl:template>

  <xsl:template match="div[@id='part1']/title | div[@id='part2']/title | div[@id='part3']/title">
    <div style="font-weight:bold;font-size:100%"><xsl:apply-templates/></div>
  </xsl:template>

  <xsl:template match="div[@id='part1']/textinput[@id='origtitleaddress']">
    <xsl:call-template name="maketextarea">
      <xsl:with-param name="rows">6</xsl:with-param>
      <xsl:with-param name="lockit" select="false()"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="div[@id='part1']/textinput[@id='origReference']">
    <xsl:call-template name="maketextinput"><xsl:with-param name="lockit" select="true()"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="div[@id='part1']/textinput[@id='origdate'] |
                       div[@id='part1']/textinput[@id='origUnitPOC'] | 
                       div[@id='part1']/textinput[@id='origEmail'] |
                       div[@id='part2']/textinput[@id='AircraftType'] | 
                       div[@id='part2']/textinput[@id='docRefDmc'] | 
                       div[@id='part2']/textinput[@id='docRefIssueInw'] |
                       div[@id='part2']/textinput[@id='docRefTitle']">
    <xsl:call-template name="maketextinput"><xsl:with-param name="lockit" select="true()"/></xsl:call-template>
  </xsl:template>
  <xsl:template match="div[@id='part2']/textinput[@id='docRefElementLevel'] | 
                       div[@id='part2']/textinput[@id='AircraftMarkOther']">
    <xsl:call-template name="maketextinput"/>
  </xsl:template>
  <xsl:template match="div[@id='part2']/dropdown[@id='AircraftMark']">
    <xsl:call-template name="makeselectlist"/>
  </xsl:template>

  <xsl:template match="div[@id='part3']/textinput[@id='report1']">
    <xsl:call-template name="maketextarea">
      <xsl:with-param name="rows">3</xsl:with-param>
      <xsl:with-param name="isbold" select="true()"/>
    </xsl:call-template>
  </xsl:template>
  <xsl:template match="div[@id='part3']/textinput[@id='report2']">
    <xsl:call-template name="maketextarea">
      <xsl:with-param name="rows">3</xsl:with-param>
      <xsl:with-param name="isbold" select="true()"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="div[@id='part3']/confirm[@id='report3']">
    <xsl:call-template name="makeconfirm"/>
  </xsl:template>
  <xsl:template match="div[@id='part3']/confirm[@id='report4']">
    <xsl:call-template name="makeconfirm">
      <xsl:with-param name="addtxt" select="true()"/>
      <xsl:with-param name="required" select="false()"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="div[@id='part3']/text[@id='report5']">
    <div style="font-size:80%; margin-left:24px;"><xsl:apply-templates select="text()"/></div>
  </xsl:template>

  <xsl:template match="div[@id='signature']/textinput[@id='signature1'] | 
                       div[@id='signature']/textinput[@id='signature2'] |
                       div[@id='signature']/textinput[@id='signature3']">
    <xsl:call-template name="maketextinput"/>
  </xsl:template>
  <xsl:template match="div[@id='signature']/textinput[@id='signature4'] | 
                       div[@id='signature']/textinput[@id='signature5']">
    <xsl:call-template name="maketextinput"><xsl:with-param name="lockit" select="true()"/></xsl:call-template>
  </xsl:template>
  
  <xsl:template name="makeselectlist">
    <xsl:param name="width">40%</xsl:param>
    <xsl:param name="addtxt" select="false()"/>
    <xsl:param name="required" select="true()"/>
    <xsl:variable name="id" select="concat('slt_', ./@id)"/>
    <label for="{$id}" style="font-size:80%;"><xsl:apply-templates select="text()"/></label><br/>
    <select id="{$id}" label="{$id}" value="---" formtype="form765" style="background-color:#ffa;">
      <xsl:if test="$required"><xsl:attribute name="required">true</xsl:attribute></xsl:if>
      <option value="---" style="width:250">---</option>
      <option value="ALL">ALL</option>
      <option value="ii">ii</option>
      <option value="v">v</option>
      <option value="ix">ix</option>
      <option value="xvi">xvi</option>
      <option value="xix">xix</option>
    </select>
  </xsl:template>
  
  <xsl:template name="makeconfirm">
    <xsl:param name="width">40%</xsl:param>
    <xsl:param name="addtxt" select="false()"/>
    <xsl:param name="required" select="true()"/>
    <xsl:variable name="id" select="concat('chk_', ./@id)"/>
    <div><input type="checkbox" id="{$id}" label="{$id}" value="val_{./@id}" formtype="form765">
      <xsl:if test="$required"><xsl:attribute name="required">true</xsl:attribute></xsl:if>
    </input>
    <label for="{$id}" style="font-size:80%"><xsl:apply-templates select="text()"/></label>
    <xsl:if test="$addtxt">
      <input type="text" id="txt_{./@id}" style="width:{$width};" formtype="form765">
        <xsl:if test="$required"><xsl:attribute name="required">true</xsl:attribute></xsl:if>
      </input>
    </xsl:if>
    </div>
  </xsl:template>

  <xsl:template name="maketextinput">
    <xsl:param name="width">95%</xsl:param>
    <xsl:param name="required" select="true()"/>
    <xsl:param name="lockit" select="false()"/>
    <xsl:variable name="id" select="concat('txt_', ./@id)"/>
    <label for="{$id}"><xsl:apply-templates select="text()"/></label>
    <input type="text" id="{$id}" label="{$id}" style="width:{$width};" formtype="form765">
      <xsl:if test="$lockit"><xsl:attribute name="readonly">1</xsl:attribute></xsl:if>
      <xsl:if test="$required"><xsl:attribute name="required">true</xsl:attribute></xsl:if>
    </input>
  </xsl:template>

  <xsl:template name="maketextarea">
    <xsl:param name="rows">5</xsl:param>
    <xsl:param name="isbold" select="false()"/>
    <xsl:param name="required" select="true()"/>
    <xsl:param name="lockit" select="false()"/>
    <xsl:variable name="id" select="concat('ta_', ./@id)"/>
    <label for="{$id}">
    <xsl:if test="$isbold">
      <xsl:attribute name="style">font-weight:bold;</xsl:attribute>
    </xsl:if>
    <xsl:apply-templates select="text()"/></label>
    <textarea type="text" id="{$id}" label="{$id}" rows="{$rows}" cols="50" style="width:95%; font-family:Verdana; font-size:100%;" formtype="form765">
      <xsl:if test="$lockit"><xsl:attribute name="readonly">1</xsl:attribute></xsl:if>
      <xsl:if test="$required"><xsl:attribute name="required">true</xsl:attribute></xsl:if>
    </textarea>
  </xsl:template>

  <xsl:template match="text[@id='topgrid']">
    <table border="1"  cellspacing="0" style="border-collapse:collapse;" class="Form765grid"><tbody><tr>
    <xsl:call-template name="gridcell">
      <xsl:with-param name="ct" select="1"/>
      <xsl:with-param name="max" select="48"/>
    </xsl:call-template>
    </tr></tbody></table>
  </xsl:template>
  
  <xsl:template name="gridcell">
    <xsl:param name="ct" select="0"/>
    <xsl:param name="max" select="0"/>
    <td style="	font-size:60%; width:8px;">&#0160;</td>
    <xsl:if test="$ct &lt; $max">
      <xsl:call-template name="gridcell">
        <xsl:with-param name="ct" select="$ct + 1"/>
        <xsl:with-param name="max" select="$max"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  
</xsl:stylesheet>