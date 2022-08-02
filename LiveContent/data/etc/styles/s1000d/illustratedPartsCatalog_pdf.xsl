<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/illustratedPartsCatalog_pdf.xsl 2.0 2019/05/22 21:05:50GMT milind Exp  $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:fo="http://www.w3.org/1999/XSL/Format" >

  <xsl:variable name="fignum">
    <xsl:call-template name="strip-leading-zeros">
      <xsl:with-param name="str" select="//catalogSeqNumber[@figureNumber][1]/@figureNumber"/>
    </xsl:call-template>
  </xsl:variable>
  
  <xsl:attribute-set name="ipd_table_cell">
    <xsl:attribute name="border-bottom">solid 0.5pt black</xsl:attribute>
    <xsl:attribute name="padding-after">2pt</xsl:attribute>
    <xsl:attribute name="padding-before">2pt</xsl:attribute>
    <xsl:attribute name="text-align">left</xsl:attribute>
  </xsl:attribute-set>

  <xsl:template name="strip-leading-zeros">
    <xsl:param name="str"/>
    <xsl:choose>
      <xsl:when test="$str='0'">0</xsl:when>
      <xsl:when test="starts-with($str, '0')"><xsl:call-template name="strip-leading-zeros">
        <xsl:with-param name="str" select="substring($str,2)"/>
      </xsl:call-template></xsl:when>
      <xsl:otherwise><xsl:value-of select="$str"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="ipc|illustratedPartsCatalog">

    <fo:table space-after="15pt" font-size="10pt" page-break-before="always">
      <fo:table-column column-width="10mm"/><!--Fig-->
      <fo:table-column column-width="12mm"/><!--Item-->
      <fo:table-column column-width="50mm"/><!--Part no./NSN-->
      <fo:table-column column-width="73mm"/><!--Description-->
      <fo:table-column column-width="15mm"/><!--Unit/Assy-->
      <fo:table-column column-width="25mm"/><!--Model-->
      <fo:table-header><fo:table-row>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Fig.</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Item</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Part no./</fo:block><fo:block font-weight="bold">NSN</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Description</fo:block><fo:block font-weight="bold">123456</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Unit/</fo:block><fo:block font-weight="bold">assy</fo:block></fo:table-cell>
        <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block font-weight="bold">Model</fo:block></fo:table-cell>
      </fo:table-row></fo:table-header>
      <fo:table-body>
        <!--
          <catalogSeqNumber assyCode="01" figureNumber="01" id="csn-0002" indenture="2" item="001" subSubSystemCode="0" subSystemCode="0" systemCode="29">
            <internalRef internalRefId="F0001-gra-0001-hs00010" internalRefTargetType="irtt11"/>
            <itemSeqNumber itemSeqNumberValue="00A">
              <quantityPerNextHigherAssy>REF</quantityPerNextHigherAssy>
              <partRef manufacturerCodeValue="....." partNumberValue="2900-03A"/>
              <partSegment>
                <itemIdentData>
                  <descrForPart>HYDRAULIC OIL RESERVOIR INSTALLATION</descrForPart>
                </itemIdentData>
                <techData/>
              </partSegment>
              <partLocationSegment>
                <descrForLocation>SPITFIRE-AAAA-29-00-01-03AA-941A-A</descrForLocation>
              </partLocationSegment>
              <applicabilitySegment/>
              <locationRcmdSegment>
                <locationRcmd>
                  <service/>
                  <sourceMaintRecoverability/>
                </locationRcmd>
              </locationRcmdSegment>
            </itemSeqNumber>
          </catalogSeqNumber>
        -->
        <xsl:for-each select="catalogSeqNumber">

          <xsl:variable name="pos1" select="position()"/>
          <xsl:variable name="csn" select="."/>
          <xsl:variable name="item" select="./@item"/>

          <xsl:for-each select="itemSequenceNumber | itemSeqNumber">

            <xsl:variable name="pos2" select="position()"/>
            <xsl:variable name="isn" select="."/>

            <fo:table-row keep-together.within-page="always">
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block><xsl:if test="$pos1=1">
                <xsl:value-of select="$fignum"/>
              </xsl:if></fo:block></fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block>
              <xsl:if test="$pos2=1"><xsl:call-template name="strip-leading-zeros">
                <xsl:with-param name="str" select="$item"/>
              </xsl:call-template></xsl:if>
              </fo:block></fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell">
              <fo:block><xsl:apply-templates select="partNumber|partRef/@partNumberValue"/></fo:block>
              <xsl:if test=".//natoStockNumber">
                <fo:block><xsl:apply-templates select=".//natoStockNumber"/></fo:block>
              </xsl:if>
              </fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block>
                <xsl:call-template name="buildisn-desc"><xsl:with-param name="csn" select="$csn"/></xsl:call-template>
              </fo:block></fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block>
                <xsl:apply-templates select="quantityPerNextHigherAssy"/>
              </fo:block></fo:table-cell>
              <fo:table-cell xsl:use-attribute-sets="ipd_table_cell"><fo:block>
                <xsl:for-each select="locationRcmdSegment/locationRcmd/modelVersion">
                  <xsl:value-of select="@modelVersionValue"/>
                  <xsl:if test="position()!=last()">, </xsl:if>
                </xsl:for-each>
              </fo:block></fo:table-cell>
            </fo:table-row>

          </xsl:for-each>
        </xsl:for-each>
      </fo:table-body>
    </fo:table>
  </xsl:template>
  
  <xsl:template name="buildisn-desc">
    <xsl:param name="csn"></xsl:param>
    <xsl:variable name="indentureclass">
      <xsl:variable name="ind"><xsl:choose>
        <xsl:when test="$csn/@ind"><xsl:value-of select="$csn/@ind"/></xsl:when>
        <xsl:when test="$csn/@indenture"><xsl:value-of select="$csn/@indenture"/></xsl:when>
        <xsl:otherwise>1</xsl:otherwise>
      </xsl:choose></xsl:variable>
      <xsl:variable name="hasasp"><xsl:choose>
        <xsl:when test="self::isn"><xsl:choose>
          <xsl:when test="boolean(./asp)">1</xsl:when>
          <xsl:otherwise>0</xsl:otherwise>
        </xsl:choose></xsl:when>
        <xsl:when test="self::itemSequenceNumber or self::itemSeqNumber"><xsl:choose>
          <xsl:when test="boolean(.//attachStoreShipPart)">1</xsl:when>
          <xsl:otherwise>0</xsl:otherwise>
        </xsl:choose></xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
      </xsl:choose></xsl:variable>
      <xsl:choose>
        <xsl:when test="($ind='2' and $hasasp='1')">ind02asp</xsl:when>
        <xsl:when test="($ind='2' and $hasasp='0')">ind02noasp</xsl:when>
        <xsl:when test="($ind='3' and $hasasp='1')">ind03asp</xsl:when>
        <xsl:when test="($ind='3' and $hasasp='0')">ind03noasp</xsl:when>
        <xsl:when test="($ind='4' and $hasasp='1')">ind04asp</xsl:when>
        <xsl:when test="($ind='4' and $hasasp='0')">ind04noasp</xsl:when>
        <xsl:when test="($ind='5' and $hasasp='1')">ind05asp</xsl:when>
        <xsl:when test="($ind='5' and $hasasp='0')">ind05noasp</xsl:when>
        <xsl:when test="($ind='6' and $hasasp='1')">ind06asp</xsl:when>
        <xsl:when test="($ind='6' and $hasasp='0')">ind06noasp</xsl:when>
        <xsl:otherwise>ind01</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="indenturemm"><xsl:choose>
      <xsl:when test="$indentureclass='ind02asp' or $indentureclass='ind02noasp'">1.3mm</xsl:when>
      <xsl:when test="$indentureclass='ind03asp' or $indentureclass='ind03noasp'">2.7mm</xsl:when>
      <xsl:when test="$indentureclass='ind04asp' or $indentureclass='ind04noasp'">4mm</xsl:when>
      <xsl:when test="$indentureclass='ind05asp' or $indentureclass='ind05noasp'">5.3mm</xsl:when>
      <xsl:when test="$indentureclass='ind06asp' or $indentureclass='ind06noasp'">6.6mm</xsl:when>
      <xsl:otherwise>0</xsl:otherwise>
    </xsl:choose></xsl:variable>
    <fo:list-block><fo:list-item provisional-label-separation="1mm">
      <xsl:attribute name="provisional-distance-between-starts"><xsl:value-of select="$indenturemm"/></xsl:attribute>
      <!-- <fo:list-item provisional-label-separation="1mm" provisional-distance-between-starts="4mm"> -->
      <!--
      *.ind02asp, *.ind02noasp { margin-left: 1.3mm; text-indent: -1.3mm; }
        *.ind02asp::before   { content: '*'; }
        *.ind02noasp::before { content: '\2022'; }
      *.ind03asp, *.ind03noasp { margin-left: 2.7mm; text-indent: -2.7mm; }
        *.ind03asp::before   { content: '**';  }
        *.ind03noasp::before { content: '\2022\2022'; }
      *.ind04asp, *.ind04noasp { margin-left: 4mm; text-indent: -4mm; }
        *.ind04asp::before   { content: '***'; }
        *.ind04noasp::before { content: '\2022\2022\2022'; }
      *.ind05asp, *.ind05noasp { margin-left: 5.3mm; text-indent: -5.3; }
        *.ind05asp::before   { content: '****';  }
        *.ind05noasp::before { content: '\2022\2022\2022\2022';  }
      *.ind06asp, *.ind06noasp { margin-left: 6.6mm; text-indent: -6.6mm; }
        *.ind06asp::before   { content: '*****'; }
        *.ind06noasp::before { content: '\2022\2022\2022\2022\2022'; }
      -->
      <fo:list-item-label end-indent="label-end()"><fo:block><xsl:choose>
        <xsl:when test="$indentureclass='ind02asp'">*</xsl:when>
        <xsl:when test="$indentureclass='ind02noasp'">•</xsl:when>
        <xsl:when test="$indentureclass='ind03asp'">**</xsl:when>
        <xsl:when test="$indentureclass='ind03noasp'">••</xsl:when>
        <xsl:when test="$indentureclass='ind04asp'">***</xsl:when>
        <xsl:when test="$indentureclass='ind04noasp'">•••</xsl:when>
        <xsl:when test="$indentureclass='ind05asp'">****</xsl:when>
        <xsl:when test="$indentureclass='ind05noasp'">••••</xsl:when>
        <xsl:when test="$indentureclass='ind06asp'">*****</xsl:when>
        <xsl:when test="$indentureclass='ind06noasp'">•••••</xsl:when>
      </xsl:choose></fo:block></fo:list-item-label>
      <fo:list-item-body start-indent="body-start()">
        <fo:block margin-left="1mm"><xsl:apply-templates mode="nomenclature"
          select=".//descrForPart | .//descrForLocation | .//categoryOneContainerLocation | .//referTo | .//partRefGroup | .//restrictedOperationNote"/></fo:block>
      </fo:list-item-body>
    </fo:list-item></fo:list-block>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/ccs/uce|itemSeqNumber/ccs/uce">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/reasonForSelection|itemSeqNumber/reasonForSelection">
    <xsl:call-template name="security_portion_mark"/><xsl:value-of select="@reasonForSelectionValue"/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/quantityPerNextHigherAssy|itemSeqNumber/quantityPerNextHigherAssy" >
    <xsl:call-template name="security_portion_mark"/><xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/manufacturerCode">
    <xsl:call-template name="security_portion_mark"/><xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSeqNumber/partRef/@manufacturerCodeValue">
    <xsl:call-template name="security_portion_mark"/><xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partNumber">
    <xsl:call-template name="security_portion_mark"/><xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSeqNumber/partRef/@partNumberValue">
    <xsl:call-template name="security_portion_mark"/><xsl:value-of select="."/>
  </xsl:template>

  <!--
  <natoStockNumber natoCodificationBureau="99" natoItemIdentNumberCore="5101066" natoSupplyClass="4710"/>
  -->
  <xsl:template match="itemSeqNumber//natoStockNumber" priority="5">
    <xsl:call-template name="security_portion_mark"/>
    <xsl:variable name="nsn" select="."/>
    <xsl:variable name="nsnstr"><xsl:call-template name="get-nsn-text"/></xsl:variable>
    <xsl:if test="$nsnstr!=''">NSN: <xsl:value-of select="$nsnstr"/></xsl:if>
  </xsl:template>

  <xsl:template match="itemSeqNumber//descrForPart | itemSeqNumber//descrForLocation" mode="nomenclature">
    <fo:block><xsl:call-template name="security_portion_mark"/><xsl:apply-templates/></fo:block>
  </xsl:template>
  <xsl:template match="itemSeqNumber//categoryOneContainerLocation | itemSeqNumber//referTo | itemSeqNumber//partRefGroup | itemSeqNumber//restrictedOperationNote"
                mode="nomenclature">
    <fo:block><xsl:apply-templates/></fo:block>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/service|itemSeqNumber/locationRcmdSegment/locationRcmd/service">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/sourceMaintRecoverability|itemSeqNumber/locationRcmdSegment/locationRcmd/sourceMaintRecoverability">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/locationRcmdSegment/locationRcmd/modelVersion|itemSeqNumber/locationRcmdSegment/locationRcmd/modelVersion">
    <xsl:value-of select="@modelVersionValue"/>
  </xsl:template>

  <xsl:template match="itemSequenceNumber/partIdentSegment/unitOfIssue|itemSeqNumber/partSegment/techData/unitOfIssue"/>

  <xsl:template match="itemSequenceNumber/partIdentSegment/specialStorage|itemSeqNumber/partSegment/techData/specialStorage"/>

  <xsl:template match="itemSequenceNumber/cbr|itemSeqNumber/cbr"/>

  <xsl:template match="itemSequenceNumber/pas/psc|itemSeqNumber/pas/psc"/>

</xsl:stylesheet>