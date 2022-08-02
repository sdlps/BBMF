<?xml version="1.0" encoding="utf-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/template_pdf.xsl 2.0 2019/05/23 20:30:30GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:fo="http://www.w3.org/1999/XSL/Format">

  <!-- template parameters definition                     -->
  <!-- The following is the list of standard parameters   -->
  <!-- DMC code for the current document                  -->
  <!-- Example: BICYCLEXXXAAA-AAA-DA0-00-00-00-00-041-A-A -->
  <xsl:param name="objectId"/>
  <!-- Location of the book folder on the harddrive       -->
  <!-- This can be used to include logo in the template 	-->
  <!-- stored in in the symbols folder                    -->
  <!-- Example: C:\wietmS1000D\data\BIKE\                 -->
  <xsl:param name="bookPath"/>
  <!-- The publication name from the config file          -->
  <!-- It is found in DEFAULT.BIKE.PubName                -->
  <!-- Example: S1000D IETM                               -->
  <xsl:param name="pubName"/>
  <!-- Document location in the form PubName + TOC Path   -->
  <!-- Example: S1000D IETM\BikeIETM\Wheel\General\Description Of How It Is Made -->
  <xsl:param name="location"/>
  <!-- CEID Attribute of the current document             -->
  <!-- Non persistent document identifier                 -->
  <!-- Example: 14                                        -->
  <xsl:param name="ceid"/>
  <!-- Current date                                       -->
  <!-- Example: 29 September, 2006                        -->
  <xsl:param name="date"/>
  <!-- Current time                                       -->
  <!-- Example: 10:55:52 AM                               -->
  <xsl:param name="time"/>
  <!-- In addition to standard parameters custom parameters    -->
  <!-- can be defined in the configuration file                -->
  <!-- The parametrs can be defined as shared for all the      -->
  <!-- books in the IETM or can be set separately for each book -->
  <!-- Examples of custom parameters. See the pdf section from -->
  <!-- configuration file                                      -->
  <!-- IETM parameters from the common section -->
  <xsl:param name="IETMVersion"/>
  <xsl:param name="IETMDate"/>
  <!-- Book level parameters. The value is given in book section -->
  <xsl:param name="PubDate"/>
  <xsl:param name="PubNumber"/>
  <xsl:param name="cdVersion"/>
  <xsl:param name="userName"/>
  <xsl:param name="DistRestrictionCaveat"/>
  <xsl:param name="DistRestrictionOtherhandling"/>
  <xsl:param name="t_page_size"/>
  <xsl:param name="t_page_orientation"/>
  <xsl:param name="foldout_page"/>
  
  <xsl:variable name="PubDateUK"><!--/11/#/2022|07/11/2022-->
    <xsl:choose><!--07/11/2022-->
      <xsl:when test="substring($PubDate, 3,1)='/' and substring($PubDate, 6,1)='/'">
        <xsl:value-of select="substring($PubDate, 7)"/><xsl:text>-</xsl:text>
        <xsl:value-of select="substring($PubDate, 1,2)"/><xsl:text>-</xsl:text>
        <xsl:value-of select="substring($PubDate, 4,2)"/>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$PubDate"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  
  <xsl:variable name="PubNumberStr"><xsl:choose>
    <xsl:when test="contains($PubNumber, '_')"><xsl:value-of select="substring-before($PubNumber, '_')"/></xsl:when>
    <xsl:otherwise><xsl:value-of select="$PubNumber"/></xsl:otherwise>
  </xsl:choose></xsl:variable>

  <xsl:variable name="rootNode" select="//DOCUMENT/DOCBODY/*[1]"/><!--LAM:2022-02-22: This is used for form printing as well, for some reason...-->

  <!-- Get DM-level classification value -->
  <xsl:variable name="DM_class_val"
    select="//DOCUMENT/DOCBODY/dmodule/identAndStatusSection/dmStatus/security/@securityClassification | //DOCUMENT/DOCBODY/dmodule/idstatus//status/security/@class"/>
  <!-- Get DM-level classification string -->
  <xsl:variable name="DM_class_str"><xsl:call-template name="formatClassStr">
    <xsl:with-param name="class_val"><xsl:value-of select="$DM_class_val"/></xsl:with-param>
  </xsl:call-template></xsl:variable>

  <!-- Get DM-level caveat value -->
  <xsl:variable name="DM_caveat_val"
    select="//DOCUMENT/DOCBODY/dmodule/identAndStatusSection/dmStatus/security/@caveat | //DOCUMENT/DOCBODY/dmodule/idstatus//status/security/@caveat"/>
  <!-- Get DM-level caveat string -->
  <xsl:variable name="DM_caveat_str"><xsl:call-template name="formatCaveatStr">
    <xsl:with-param name="caveat_val"><xsl:value-of select="$DM_caveat_val"/></xsl:with-param>
  </xsl:call-template></xsl:variable>
  
  <!--LAM:2021-02-16:Can the issue number be added to the footer??-->
  <xsl:variable name="DM_issue_num" select="//DOCUMENT/DOCBODY/dmodule/identAndStatusSection/dmAddress/dmIdent/issueInfo/@issueNumber"/>
  <xsl:variable name="DM_inwrk_num" select="//DOCUMENT/DOCBODY/dmodule/identAndStatusSection/dmAddress/dmIdent/issueInfo/@inWork"/>
  <xsl:variable name="issue_inwork"><xsl:value-of select="$DM_issue_num"/>-<xsl:value-of select="$DM_inwrk_num"/></xsl:variable>

  <!-- Root template start here -->
  <xsl:template match="/">
    <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Arial,Helvetica,Symbol,ZapfDingbats">
      <!-- ************************************************************************ -->
      <!--                      MASTER SET DEFINITION                               -->
      <!-- ************************************************************************ -->
      <fo:layout-master-set><xsl:choose>
        <xsl:when test="name($rootNode)=''">
          <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm"	margin-top="2mm"  margin-bottom="2mm" margin-left="2mm" margin-right="2mm">
            <fo:region-body margin-top="3mm" margin-bottom="3mm"/>
            <fo:region-before extent="5mm"/>
            <fo:region-after  extent="5mm"/>
          </fo:simple-page-master>
        </xsl:when><xsl:when test="$t_page_orientation ='LANDSCAPE'">
          <fo:simple-page-master master-name="template_pdf" page-width="297mm"  page-height="210mm"	margin-top="15mm"  margin-bottom="12.5mm" margin-left="12.5mm" margin-right="12.5mm">
            <fo:region-body margin-top="20mm" margin-bottom="15mm"/>
            <fo:region-before extent="25mm"/>
            <fo:region-after  extent="25mm"/>
          </fo:simple-page-master>
        </xsl:when><xsl:otherwise>
          <fo:simple-page-master master-name="template_pdf" page-width="210mm"  page-height="297mm"	margin-top="7.5mm"  margin-bottom="12.5mm" margin-left="12.5mm" margin-right="12.5mm">
            <fo:region-body margin-top="15mm" margin-bottom="15mm"/>
            <fo:region-before extent="25mm"/>
            <fo:region-after  extent="25mm"/>
          </fo:simple-page-master>
        </xsl:otherwise>
      </xsl:choose></fo:layout-master-set>
      <!-- ************************************************************************ -->
      <!--                      SEQUENCE MASTER DEFINITION                         -->
      <!-- ************************************************************************ -->
      <fo:page-sequence master-reference="template_pdf" initial-page-number="1" language="en" country="us">
        <!-- HEADER DEFINITION -->
        <xsl:if test="name($rootNode)='dmodule'"><fo:static-content flow-name="xsl-region-before">
          <fo:table table-layout="fixed" width="191mm" font-size="10pt">
          <fo:table-column column-width="191mm"/>
          <fo:table-body><fo:table-row>
          <fo:table-cell border-color="black" border-width="1pt" border-style="solid" padding="1.5mm"><fo:block><fo:table table-layout="fixed" width="188mm">
            <fo:table-column column-width="28mm"/><fo:table-column column-width="160mm"/>
            <fo:table-body>
              <fo:table-row>
                <fo:table-cell number-columns-spanned="2"><fo:block text-align="center"><xsl:value-of select="$DM_class_str"/></fo:block></fo:table-cell>
              </fo:table-row><fo:table-row>
                <fo:table-cell><fo:block>Access Control:</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>
                <!--
                /* <restrictionInstructions>
                  Blank: Access To LiveContent = Administrators|Super Users
                    <dataHandling></dataHandling>
                  Approved User: Access To LiveContent = Administrators|Super Users|Approved Users
                    <dataHandling>Approved User</dataHandling> or <dataHandling>ApprovedUser</dataHandling> or <dataHandling>AU</dataHandling> or <dataHandling>A</dataHandling>
                  Validator: Access To LiveContent = Administrators|Super Users|Approved Users|Validators
                    <dataHandling>Validator</dataHandling> or <dataHandling>V</dataHandling>
                  User: Access To LiveContent = Administrators|Super Users|Approved Users|Validators|Users
                    <dataHandling>User</dataHandling> or <dataHandling>U</dataHandling>
                </restrictionInstructions> */

                // ADMINISTRATOR|SUPERUSER|SUPERUSEROFFLINE|APPROVEDUSER|VALIDATOR|USER|USEROFFLINE

                -->
                <xsl:variable name="dataHandling" select="translate(//restrictionInstructions/dataHandling,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                <xsl:text>VALIDATED FOR </xsl:text>
                <xsl:choose>
                  <xsl:when test="$dataHandling=''">SUPER USERS ONLY</xsl:when>
                  <xsl:when test="$dataHandling='APPROVED USER' or $dataHandling='AU' or $dataHandling='A'">APPROVED USER ONLY</xsl:when>
                  <xsl:when test="$dataHandling='Validator' or $dataHandling='V'">VALIDATORS OR APPROVED USER ONLY</xsl:when>
                  <xsl:when test="$dataHandling='USER' or $dataHandling='U'">ALL USERS</xsl:when>
                </xsl:choose>
                </fo:block></fo:table-cell><!--2022-07-27-->
              </fo:table-row><fo:table-row>
                <fo:table-cell><fo:block><xsl:value-of select="$style.template.note"/>:</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>UNCONTROLLED COPY WHEN PRINTED</fo:block></fo:table-cell><!--2022-07-27-->
              </fo:table-row><fo:table-row>
                <fo:table-cell><fo:block>DMC:</fo:block></fo:table-cell>
                <fo:table-cell><fo:block><xsl:value-of select="$objectId"/> (Issue: <xsl:value-of select="$issue_inwork"/>)</fo:block></fo:table-cell>
              </fo:table-row>
            </fo:table-body>
            </fo:table></fo:block></fo:table-cell>
          </fo:table-row></fo:table-body>
          </fo:table>
        </fo:static-content>
        <!-- FOOTER DEFINITION -->
        <fo:static-content flow-name="xsl-region-after">
          <fo:table table-layout="fixed" width="191mm">
            <fo:table-column column-width="191mm"/>
            <fo:table-body><fo:table-row>
              <fo:table-cell border-color="black" border-width="1pt" border-style="solid" padding="1.5mm"><fo:block><fo:table table-layout="fixed" width="188mm">
                <fo:table-column column-width="28mm"/><fo:table-column column-width="66mm"/>
                <fo:table-column column-width="28mm"/><fo:table-column column-width="66mm"/>
                <fo:table-body>
                  <fo:table-row>
                    <fo:table-cell font-size="10pt" number-columns-spanned="4"><fo:block text-align="center"><xsl:value-of select="$DM_class_str"/></fo:block></fo:table-cell>
                  </fo:table-row>
                  <fo:table-row>
                    <fo:table-cell font-size="10pt" number-columns-spanned="4"><fo:block><xsl:value-of select="$style.template.destructionnotice"/></fo:block></fo:table-cell>
                  </fo:table-row>
                  <fo:table-row>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$style.template.pubnumber"/>:</fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$PubNumberStr"/></fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$style.template.pubdate"/>:</fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$PubDateUK"/></fo:block></fo:table-cell>
                  </fo:table-row>
                  <fo:table-row>
                    <fo:table-cell font-size="10pt"><fo:block>Printed By:</fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$userName"/></fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$style.template.dateprinted"/>: </fo:block></fo:table-cell>
                    <fo:table-cell font-size="10pt"><fo:block><xsl:value-of select="$date"/></fo:block></fo:table-cell>
                  </fo:table-row>
                </fo:table-body>
              </fo:table></fo:block></fo:table-cell>
            </fo:table-row></fo:table-body>
          </fo:table>
        </fo:static-content></xsl:if>
        <fo:flow flow-name="xsl-region-body"><fo:block/></fo:flow>
      </fo:page-sequence>
    </fo:root>
  </xsl:template>
  <!-- End of root template -->

  <!-- Format Classification string -->
  <!-- Template receives parameter of class value; returns classification string. -->
  <xsl:template name="formatClassStr">
    <xsl:param name="class_val"/>
    <xsl:choose>
      <xsl:when test="$class_val='01'">
        <xsl:if test="$DM_caveat_str != ''"><xsl:value-of select="$DM_caveat_str"/></xsl:if>
      </xsl:when>
      <xsl:when test="$class_val='02' or $class_val='03'">
        <xsl:text>CONFIDENTIAL</xsl:text>
        <xsl:if test="$DM_caveat_str != ''"><xsl:text>-</xsl:text><xsl:value-of select="$DM_caveat_str"/></xsl:if>
      </xsl:when>
      <xsl:when test="$class_val='04'">
        <xsl:text>SECRET</xsl:text>
        <xsl:if test="$DM_caveat_str != ''"><xsl:text>-</xsl:text><xsl:value-of select="$DM_caveat_str"/></xsl:if>
      </xsl:when>
      <xsl:when test="$class_val='05'">
        <xsl:text>TOP SECRET</xsl:text>
        <xsl:if test="$DM_caveat_str != ''"><xsl:text>-</xsl:text><xsl:value-of select="$DM_caveat_str"/></xsl:if>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>MISSING or UNKNOWN CLASSIFICATION </xsl:text><xsl:value-of select="$class_val"/>
        <xsl:if test="$DM_caveat_str != ''"><xsl:text>-</xsl:text><xsl:value-of select="$DM_caveat_str"/></xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Format Caveat string -->
  <!-- Template receives parameter of caveat value; returns caveat string. -->
  <xsl:template name="formatCaveatStr">
    <xsl:param name="caveat_val"/>
    <xsl:choose>
      <xsl:when test="$caveat_val='other'"><xsl:value-of select="$DistRestrictionOtherhandling"/></xsl:when>
      <xsl:when test="$caveat_val='none' or $caveat_val=''"><xsl:text/></xsl:when>
      <xsl:when test="$caveat_val='cv67'"><xsl:text>BBMF VALIDATION REQUIRED</xsl:text></xsl:when>
      <xsl:when test="$caveat_val='cv51'"><xsl:text>For Official Use Only</xsl:text></xsl:when>
      <xsl:when test="$caveat_val='cv56'"><xsl:text>US EYES ONLY</xsl:text></xsl:when>
      <xsl:when test="$caveat_val='cv57'"><xsl:text>Restricted Data</xsl:text></xsl:when>
      <xsl:when test="$caveat_val='cv58'"><xsl:text>Formerly Restricted Data</xsl:text></xsl:when>
      <xsl:when test="$caveat_val='cv59'"><xsl:text>NOFORN</xsl:text></xsl:when>
      <xsl:otherwise><xsl:text>UNDEF CAVEAT </xsl:text><xsl:value-of select="$caveat_val"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="empty"><fo:block/></xsl:template>

</xsl:stylesheet>