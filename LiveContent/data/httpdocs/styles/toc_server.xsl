<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: XY/etc/FullSupport/httpdocs/styles/toc_server.xsl 2.0 2019/05/22 21:16:04GMT milind Exp  $ -->
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xlink="http://www.w3.org/1999/xlink"
  version="2.0">
<!-- To display Unicode chars, output encoding must be set as "US-ASCII" -->
	<xsl:output method="html" encoding="US-ASCII"/> 
	<xsl:template match="*">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="text()">
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:param name="app_name"/>

	<xsl:template match="TOC_ROOT">
<!--re-set display the toc tree, if there is no content that chapter will be closed, function in cvTOC.js file -->	
<!-- ..\data\etc\scripts\cvTOC.js -->
    <script type="text/javascript">reSetDisplay();</script>
		<div id="TOC_MAIN_TREE">
			<xsl:apply-templates/>
		</div>
	</xsl:template>

	<xsl:template match="SYSTEM" >
    <xsl:variable name="title" select="./TITLE/text()"/>
		<xsl:if test="$title != 'Reference Data Modules - Hide' ">
			<xsl:if test="not(@APPENDIX)">
				<div class="tocItem">	
					<xsl:attribute name="type">SYSTEM</xsl:attribute>
					<xsl:attribute name="ID">
						<xsl:value-of select="@EID"/>
					</xsl:attribute>
					<xsl:attribute name="EID">
						<xsl:value-of select="@EID"/>
					</xsl:attribute>
					<!--The attribute TOP is created when the max level is reached. By default, the max level is 2. 
					This attribute is set to 1 when there is more child nodes which is not displayed or pre-hidden.
						The child only loads and open when clicked the parent node.-->					
					<xsl:attribute name="TOP">
						<xsl:value-of select="@TOP"/>
					</xsl:attribute>
					<!--the ROOT nodes are always displayed so we don't need to check that level -->
          <xsl:variable name="style">margin-left:<xsl:choose>
            <xsl:when test="@ROOT">0px</xsl:when>
            <xsl:otherwise>16px;</xsl:otherwise>
          </xsl:choose>;</xsl:variable><!-- <xsl:if test="$title='Reference DMs'"> display:none;</xsl:if>-->
          <xsl:attribute name="STYLE"><xsl:value-of select="$style"/></xsl:attribute>
					<xsl:if test="@ROOT">
						<xsl:attribute name="ROOT">yes</xsl:attribute>
					</xsl:if>
					<xsl:if test="not(@ROOT)">
						<xsl:attribute name="ROOT">not</xsl:attribute>
					</xsl:if>
					<span class="normal" onclick="CVPortal.components['cvTOC'].toggleExpand(event)">
						<img class="link">
							<xsl:attribute name="ID">I_<xsl:value-of select="@EID"/>
							</xsl:attribute>
							<xsl:attribute name="SRC">
								<xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=aircraft/_bbmf_toc_folder_closed.png</xsl:attribute><!--2020-10-22: LAM changed icon from plus.png-->
						</img>
						<span class="counter" style="display:none">
							<xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/>
							</xsl:attribute>0</span>
						<span class="normal" cvTocTitle="1">
							<xsl:attribute name="ID">S_<xsl:value-of select="@EID"/>
							</xsl:attribute>&#160;<xsl:value-of select="TITLE"/>
						</span>
					</span>
					<div class="container" style="display:none">
						<xsl:attribute name="ID">D_<xsl:value-of select="@EID"/>
						</xsl:attribute>
						<xsl:apply-templates/>
					</div>
				</div>
			</xsl:if>
		</xsl:if>
	</xsl:template>

<xsl:template match="SYSTEM[@SYSDOCEID]">
  <div class="tocItem">
    <xsl:attribute name="type">SYSDOCEID</xsl:attribute>
    <xsl:attribute name="ID"><xsl:value-of select="@EID"/></xsl:attribute>
    <xsl:attribute name="EID"><xsl:value-of select="@EID"/></xsl:attribute>
    <xsl:attribute name="TOP"><xsl:value-of select="@TOP"/></xsl:attribute>
    <xsl:attribute name="SYSDOCEID"><xsl:value-of select="@SYSDOCEID"/></xsl:attribute>
    <xsl:attribute name="DOCID"><xsl:value-of select="@DOCID"/></xsl:attribute>
    <xsl:if test="@ROOT">
      <xsl:attribute name="STYLE">margin-left:0px;</xsl:attribute>	
      <xsl:attribute name="ROOT">yes</xsl:attribute>
    </xsl:if>
    <xsl:if test="not(@ROOT)">
      <xsl:attribute name="STYLE">margin-left:16px;</xsl:attribute>	
      <xsl:attribute name="ROOT">not</xsl:attribute>
    </xsl:if>
			<span class="normal">
				<img class="link" onclick="CVPortal.components['cvTOC'].toggleExpand(event);">
					<xsl:attribute name="ID">I_<xsl:value-of select="@EID"/>
					</xsl:attribute>
					<xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=aircraft/_bbmf_toc_folder_closed.png</xsl:attribute><!--2020-10-22: LAM changed icon from plus.png-->
				</img>
				<img class="link" onclick="CVPortal.components.cvTOC.selectDocumentContainer(event)">
					<xsl:attribute name="SRC"><xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=<xsl:value-of select="@DOCTYPE"/>.gif</xsl:attribute>
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
						<xsl:variable name="toc_doc_id" select="@DOCID"/>
						<xsl:call-template name="docid2dmc">
							<xsl:with-param name="string" select="$toc_doc_id" />
							<xsl:with-param name="counter" select="1" />
						</xsl:call-template> 
					</span>
				</span>
			</span>
			<!-- internal activity list for DOCUMENT
	     ********* 
		used if <prop id="activityInTOC"/> set in cvDocHandler
	     ********* 
	-->
			<div style="display:none" class="activityList">
				<xsl:attribute name="ID">ACT_<xsl:value-of select="@SYSDOCEID"/>
				</xsl:attribute>
			</div>

			<div class="container" style="display:none">
				<xsl:attribute name="ID">D_<xsl:value-of select="@EID"/>
				</xsl:attribute>
				<xsl:apply-templates/>
			</div>
		</div>
	</xsl:template>



	<xsl:template match="DOCUMENT[@DOCTYPE !='']">

		<div class="tocItem">
			<xsl:attribute name="type">DOCUMENT</xsl:attribute>
			<xsl:attribute name="ID">
				<xsl:value-of select="@EID"/>
			</xsl:attribute>
			<xsl:attribute name="REFID">
				<xsl:value-of select="@REFID"/>
			</xsl:attribute>
			<xsl:attribute name="LASTREFID">
				<xsl:value-of select="@LASTREFID"/>
			</xsl:attribute>
			<xsl:attribute name="DOCTYPE">
				<xsl:value-of select="@DOCTYPE"/>
			</xsl:attribute>
			<xsl:attribute name="DOCID">
				<xsl:value-of select="@DOCID"/>
			</xsl:attribute>
			<xsl:attribute name="STYLE">margin-left:16px;</xsl:attribute>	
			<span class="normal" onclick="CVPortal.components['cvTOC'].selectDocument(event)">
				<img class="link">
					<xsl:attribute name="SRC">
						<xsl:value-of select="$app_name"/>?testitem=zero&amp;target=resource&amp;action=image&amp;file_name=<xsl:value-of select="@DOCTYPE"/>.gif</xsl:attribute>
				</img>
				<span class="counter" style="display:none">
					<xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/>
					</xsl:attribute>0</span>
				<span>
					<xsl:attribute name="ID">S_<xsl:value-of select="@EID"/>
					</xsl:attribute>
					<span class="titleBit" cvTocTitle="1">	
						<xsl:attribute name="ID">TITLE_<xsl:value-of select="@EID"/>
						</xsl:attribute>																
						&#160;<xsl:value-of select="TITLE"/>
						
					</span><span>&#160;</span>
					<br style="display:none">
						<xsl:attribute name="ID">BR.<xsl:value-of select="@EID"/>
						</xsl:attribute>
					</br>
					<span class="codeBit" style="display:none">
						<xsl:attribute name="ID">CODE_<xsl:value-of select="@EID"/>
						</xsl:attribute>
						<xsl:variable name="toc_doc_id">
							<xsl:value-of select="@DOCID"/>
						</xsl:variable>
						<xsl:call-template name="docid2dmc">
							<xsl:with-param name="string" select="$toc_doc_id" />
							<xsl:with-param name="counter" select="1" />
						</xsl:call-template> 
					</span>
				</span>
			</span>

			<!-- internal activity list for DOCUMENT
	     ********* 
		used if <prop id="activityInTOC"/> set in cvDocHandler
	     ********* 
	-->
			<div style="display:none" class="activityList">
				<xsl:attribute name="ID">ACT_<xsl:value-of select="@REFID"/>
				</xsl:attribute>
			</div>

		</div>

	</xsl:template>

	<xsl:template match="TOCREFENTRY">
		<div class="tocItem">
			<xsl:attribute name="type">TOCREFENTRY</xsl:attribute>
			<xsl:attribute name="ID">
				<xsl:value-of select="@EID"/>
			</xsl:attribute>
			<xsl:attribute name="LASTEID">
				<xsl:value-of select="@LASTEID"/>
			</xsl:attribute>
			<xsl:attribute name="STYLE">margin-left:16px;</xsl:attribute>	
			<xsl:apply-templates />

			<!-- internal activity list for DOCUMENT
	     ********* 
		used if <prop id="activityInTOC"/> set in cvDocHandler
	     ********* 
	-->
			<div style="display:none" class="activityList">
				<xsl:attribute name="ID">ACT_<xsl:value-of select="@REFID"/>
				</xsl:attribute>
			</div>

		</div>
	</xsl:template>

	<!-- REFTP Links -->
<xsl:template match="reftp|refextp|externalPubRef" priority="2">
	<xsl:variable name="refdm"><xsl:value-of select="@xlink:href"/></xsl:variable>
	<xsl:variable name="refpm"><xsl:apply-templates select="pubcode|externalPubRefIdent/externalPubCode"/></xsl:variable>
	<xsl:variable name="pubtitle">
		<xsl:choose>
			<xsl:when test="pubtitle">				
				<xsl:apply-templates select="pubtitle"/>
			</xsl:when>
			<xsl:when test="externalPubRefIdent">				
				<xsl:apply-templates select="externalPubRefIdent/externalPubTitle"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="pubcode|externalPubRefIdent"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
		
		<!-- add the onclick attribute -->
	<span class="normal">
	<xsl:attribute name="onClick">CVPortal.components.cvDocHandler.externalReference('<xsl:value-of select="normalize-space($refpm)"/>', '<xsl:value-of select="$refdm"/>');</xsl:attribute>
			<xsl:attribute name="ID">
				<xsl:value-of select="@EID"/>
			</xsl:attribute>
			<xsl:attribute name="LASTEID">
				<xsl:value-of select="@LASTEID"/>
			</xsl:attribute>
			<xsl:attribute name="title">
				<xsl:value-of select="@xlink:title"/>
			</xsl:attribute>
			<xsl:attribute name="link">
				<xsl:value-of select="@xlink:href"/>
			</xsl:attribute>
			<img class="link">
				<xsl:attribute name="SRC">
					<xsl:value-of select="$app_name"/>?target=resource&amp;action=image&amp;file_name=book.png</xsl:attribute>
			</img>
			<span class="counter" style="display:none">
				<xsl:attribute name="ID">CNTR_<xsl:value-of select="@EID"/>
				</xsl:attribute>0
			</span>
			
		<span>
			<xsl:attribute name="ID">S_<xsl:value-of select="@EID"/></xsl:attribute>
			<span class="titleBit" cvTocTitle="1" id="extitle">	
			<!--
				<xsl:attribute name="ID">TITLE_<xsl:value-of select="@EID"/></xsl:attribute>
			-->
				&#160;<xsl:value-of select="$pubtitle"/>
			</span>
			<span class="codeBit" style="display:none" id="excode">
				<xsl:attribute name="ID">CODE_<xsl:value-of select="@EID"/>
				</xsl:attribute>
				&#160;<xsl:value-of select="$pubtitle"/>
			</span>
		</span>
	</span>
</xsl:template>


<xsl:template match="reftp/pubcode|refextp/pubcode">
	<xsl:choose>
		<xsl:when test="child::pmc">
			PMC-<xsl:value-of select="pmc/modelic/text()"/>-<xsl:value-of select="pmc/pmissuer/text()"/>-<xsl:value-of select="pmc/pmnumber/text()"/>-<xsl:value-of select="pmc/pmvolume/text()"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="text()"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="externalPubRefIdent/externalPubCode">
	<xsl:choose>
		<xsl:when test=".//pmCode">
			PMC-<xsl:value-of select=".//pmCode/@modelIdentCode"/>-<xsl:value-of select=".//pmCode/@pmIssuer"/>-<xsl:value-of select=".//pmCode/@pmNumber"/>-<xsl:value-of select=".//@pmVolume"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="text()"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

	<xsl:template name="docid2dmc">
		<xsl:param name="string" />
		<xsl:param name="counter" />
		<xsl:param name="delimiter" select="'-'" />
		<xsl:choose>
			<xsl:when test="$delimiter and contains($string, $delimiter)"><xsl:value-of select="substring-before($string, $delimiter)" /><xsl:choose><xsl:when test="$counter = 6"></xsl:when><xsl:when test="$counter = 8"></xsl:when><xsl:otherwise>-</xsl:otherwise></xsl:choose>
			<xsl:text/>
				<xsl:call-template name="docid2dmc">
					<xsl:with-param name="string" select="substring-after($string, $delimiter)" />
					<xsl:with-param name="counter" select="$counter + 1" />
					<xsl:with-param name="delimiter" select="$delimiter" />
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
					<xsl:value-of select="$string" />
				<xsl:text/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>  

	<xsl:template match="DOCUMENT[@SYSTEMDOC]"/>

	<xsl:template match="TITLE"/>
	<xsl:template match="displaytext"/>
	<xsl:template match="non_applic"/>

</xsl:stylesheet>
