<?xml version="1.0" encoding="iso-8859-1"?>
<!-- $Id: XY/etc/FullSupport/etc/styles/s1000d/procedure.xsl 2.0 2019/05/22 21:06:05GMT milind Exp  $ -->

<!--s1000d-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:template match="supequip|reqSupportEquips">
    <xsl:param name="mode">default</xsl:param>
		<xsl:if test="self::node() != '' and (not(child::nosupeq) or not(child::noSupportEquips))">
      <br/>
			<div id="SUPTEQT_TABLE" xsl:use-attribute-sets="standard">
				<xsl:apply-templates><xsl:with-param name="mode" select="$mode"/></xsl:apply-templates>
			</div>
		</xsl:if>
	</xsl:template>  

	<xsl:template match="supplies|reqSupplies">
    <xsl:param name="mode">default</xsl:param>
		<xsl:if test="self::node() != ''">
			<div id="SUPPLIES_TABLE" xsl:use-attribute-sets="standard">
				<xsl:apply-templates><xsl:with-param name="mode" select="$mode"/></xsl:apply-templates>
			</div>
		</xsl:if>
	</xsl:template> 

	<xsl:template match="nosupply|noSupplies">
    <xsl:param name="mode">default</xsl:param>
    <xsl:value-of select="$style.procedure.nosupply"/>
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="nospares|noSpares">
    <xsl:param name="mode">default</xsl:param>
    <xsl:value-of select="$style.procedure.nospare"/>
		<xsl:apply-templates/>
	</xsl:template>


	<xsl:template match="mainProcedure">
		<h3 align="center"><xsl:value-of select="$style.procedure.procedure"/></h3>
		<table class="list_format">
			<xsl:apply-templates/>
		</table>

		<xsl:if test="$app_mode='2'">
			<xsl:call-template name="processTaskComplete"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="table" priority="4">
		<tr>
			<td class="list_label" nowrap="1" style="vertical-align: top; padding-top: 4px;">&#160;</td>
			<td colspan="2" >
				<span xsl:use-attribute-sets="standard"/>
				<xsl:apply-templates/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="figure" mode="get_boardno">
		<xsl:value-of select="graphic[1]/@infoEntityIdent"/>
	</xsl:template>

	<!-- <td class="stepDiv" width="99%">
    <div class="stepDiv">
    <span class="bold-xsl">Other Marks</span>
    <para EID="103" LASTEID="103" id="EID.103" class="border-dasher-2" step="step1">Xxxxx ...</para>
    <para EID="104" LASTEID="104" id="EID.104" class="" step="step1">Xxxxx ...</para>
    </div>
    </td>-->
  <!-- LAM:2021-10-26 handle change markers -->
  <xsl:template match="proceduralStep | proceduralStep[@reasonForUpdateRefIds]" priority="5">
    <!-- NV Harmonization: Insert WCNs and their anchors -->
    <xsl:call-template name="proceduralStepWCNs"/>
		<tr>
      <xsl:if test="@reasonForUpdateRefIds">
        <xsl:attribute name="class">border-dasher-2</xsl:attribute>
      </xsl:if>

			<td class="list_label" nowrap="1" style="vertical-align: top; padding-top: 8px;">

				<input type="checkbox" class="checkbox-step" onClick="CVPortal.components.cvDocHandler.toggleProcedureActionIndicator(event);">
					<xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
					<xsl:attribute name="LASTEID">
						<xsl:if test="@LASTEID"><xsl:value-of select="@LASTEID"/></xsl:if>
						<xsl:if test="not(@LASTEID)"><xsl:value-of select="@EID"/></xsl:if>
					</xsl:attribute>
					<xsl:attribute name="step_id">
						<xsl:value-of select="local-name()"/>
						<xsl:value-of select="'-'"/>
						<xsl:call-template name='formatStepDesignator'/>
					</xsl:attribute>
					<xsl:attribute name="step_target">
						<xsl:choose>
							<xsl:when test="warning or caution or note or @warningRefs or @cautionRefs"><!--LAM: process W/C/N and @refs-->
								<xsl:value-of select="'stepanchor'"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="'step'"/>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>
				</input>

				<span step_type="1" class="stepLabel" xsl:use-attribute-sets="standard" >
           <!-- NV Harmonization: Add step_id and step_target attrs -->
           <xsl:attribute name="step_id">
              <xsl:value-of select="local-name()"/>
              <xsl:value-of select="'-'"/>
              <xsl:call-template name='formatStepDesignator'/>
           </xsl:attribute>
           <xsl:attribute name="step_target">
              <xsl:choose>
                 <xsl:when test="warning or caution or note or @warningRefs or @cautionRefs"><!--LAM: process W/C/N and @refs-->
                    <xsl:value-of select="'stepanchor'"/>
                 </xsl:when>
                 <xsl:otherwise>
                    <xsl:value-of select="'step'"/>
                 </xsl:otherwise>
              </xsl:choose>
           </xsl:attribute>
					<xsl:if test="child::title">
						<xsl:attribute name="style">font-weight:bold;font-size:12pt;</xsl:attribute>
					</xsl:if>
					<xsl:if test="para/internalRef[1][@internalRefTargetType='figure' or @internalRefTargetType='irtt01']">
						<xsl:variable name="ref_figure" select="para/internalRef[1][@internalRefTargetType='figure' or @internalRefTargetType='irtt01']/@internalRefId"/>
						<xsl:attribute name="step_figure">
							<xsl:apply-templates select="//figure[@id=$ref_figure]" mode="get_boardno"/>
						</xsl:attribute>
					</xsl:if>
					<xsl:if test="para/internalRef[1][@internalRefTargetType='multimedia' or @internalRefTargetType='irtt03']">
						<xsl:variable name="ref_figure" select="para/internalRef[1][@internalRefTargetType='multimedia' or @internalRefTargetType='irtt03']/@internalRefId"/>
						<xsl:attribute name="step_figure">
							<xsl:apply-templates select="//multimedia[@id=$ref_figure]" mode="get_boardno"/>
						</xsl:attribute>
					</xsl:if>
					<xsl:if test="para/internalRef[1][@internalRefTargetType='figure' or @internalRefTargetType='irtt11']">
						<xsl:variable name="ref_figure" select="para/internalRef[1][@internalRefTargetType='figure' or @internalRefTargetType='irtt11']/@internalRefId"/>
						<xsl:attribute name="step_figure">
							<xsl:apply-templates select="//figure[@id=$ref_figure]" mode="get_boardno"/>
						</xsl:attribute>
					</xsl:if>
					<xsl:if test="./figure/graphic/@infoEntityIdent">
						<xsl:attribute name="step_figure">
							<xsl:value-of select="./figure[1]/graphic[1]/@infoEntityIdent"/>
						</xsl:attribute>
					</xsl:if>
					<xsl:call-template name='formatStepDesignator'/>
				</span>
			</td>
			<td class="list_label" nowrap="1" >
				<xsl:if test="para/internalRef[@internalRefTargetType='multimedia' or @internalRefTargetType='irtt03']">
					<xsl:attribute name="style">width: 36px; vertical-align: top; padding-left: 6px;</xsl:attribute>
				</xsl:if>
			</td>

			<td class="stepDiv" width="99%">
				<xsl:if test="@reasonForUpdateRefIds"><xsl:call-template name="reasonForUpdateRefIds"/></xsl:if>
				<div class="stepDiv">
				<xsl:call-template name="security_portion_mark"/>
					<xsl:if test='local-name() ="table" and (parent::proceduralStep)'>
						<xsl:apply-templates select="table" />
					</xsl:if>
					<xsl:apply-templates select='*[local-name() != "proceduralStep" and local-name() != "warning" and local-name() != "caution" and local-name() != "note" and local-name() != "non_applic"] '/>
				</div>
			</td>
		</tr>
		<xsl:apply-templates select="proceduralStep | non_applic"/>
		<xsl:if test="$app_mode='2'">
      <xsl:call-template name="security_portion_mark"/>
			<xsl:call-template name="processStepCheck"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="closeup">
		<xsl:if test="self::node()!=''">
			<h3 style="text-align: center;" ><xsl:value-of select="$style.procedure.requirecomplete"/></h3>
		</xsl:if>
		<table style="margin-left: 50px; margin-right: 50px" xsl:use-attribute-sets="standard">
			<xsl:apply-templates/>
		</table>
	</xsl:template>

	<xsl:template match="closeup/noclose">
		<div><xsl:value-of select="$style.procedure.norequirement"/></div>
	</xsl:template>


	<!-- step titles -->

	<xsl:template match="step1/title">
		<span class="bold-xsl" style="font-size:12pt">
		<xsl:call-template name="security_portion_mark"/>
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="step2/title">
		<span class="bold-xsl" style="font-size:11pt">
		<xsl:call-template name="security_portion_mark"/>
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="step3/title">
		<span class="bold-xsl">
		<xsl:call-template name="security_portion_mark"/>
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="step4/title">
		<span class="bold-xsl">
		<xsl:call-template name="security_portion_mark"/>
			<xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="step5/title">
		<span class="bold-xsl">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
		</span>
	</xsl:template>

	<xsl:template match="proceduralStep/title">
    <div class="bold-xsl">
      <xsl:call-template name="security_portion_mark"/>
      <xsl:apply-templates/>
    </div>
	</xsl:template>

</xsl:stylesheet>
