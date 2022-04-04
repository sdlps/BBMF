/* LAM:2020-10-02 */

var comments = [];
var msgText = '...';
var ua = window.navigator.userAgent;
var isie = ((ua.indexOf('MSIE') > -1) || (ua.indexOf('like Gecko') > -1));
var commentCt = 0;
var reviewcommentmsg;
var reviewcommentcapture;

var commenttitle;
var commentmsg;
var commenttype;

var selTxt;
var _sttContainer;
var _sttOffset;
var _endContainer;
var _endOffset;
var _sttTag;
var _endTag;
var _sttId;
var _endId;

var docIss = null; // "000";
var docInw = null; // "00"
var docDmc = null; // "00"

function getById(id) {
  return document.getElementById(id);
}
function getFirstByName(name) {
  try {
    return document.getElementsByTagName(name)[0];
  } catch(ex) {
    return null;
  }
}

function getIssue() {
  // <div id="MAIN_CONTENT" DMC="SPITFIRE-AAAA-28-00-00-00AA-040A-A" ISSUENUMBER="000" ISSUEINWORK="10" INFOCODE="" MODEL="---" security="01" caveat="">
	if (docIss == null || docInw == null || docDmc == null) {
		var root = getById('MAIN_CONTENT');
		if (root) {
			docIss = root.hasAttribute('ISSUENUMBER') ? root.getAttribute('ISSUENUMBER') : '000';
			docInw = root.hasAttribute('ISSUEINWORK') ? root.getAttribute('ISSUEINWORK') : '00';
			docDmc = root.hasAttribute('DMC') ? root.getAttribute('DMC') : '';
		}
	}
}
getIssue();

function getElementFromXPath(exp) {
  return document.evaluate(exp, document, null, XPathResult.ORDERED_SNAPSHOT_TYPE, null);
  // return document.evaluate(exp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function getTargetEl(exp, id) {
	var elsstt = getElementFromXPath(exp);
	console.info('getTargetEl:el is ' + (elsstt == null ? elsstt.nodeType:'null...') + ' : ' + id);
	if (elsstt != null) {
		for (i = 0; i < elsstt.getSnapshotLength(); i++) {
			var el = elsstt.snapshotItem(i);
			if (el.hasAttribute('id') && ('' + el.getAttribute('id')) === id) {
				console.info('getTargetEl:el: ' + el.nodeType);
				return el;
			}
		}
	} else {
    console.error('getTargetEl:Error getting result from: ' + exp);
	}
	console.info('getTargetEl:el is null for: ' + id);
	return null;
}
function getTargetEl(id) {
	return document.getElementById(id);
}
function getCommentByCt(ct) {
	getSetReviewCommentMsg().style.display='none';
	document.getSelection().removeAllRanges();
	if (ct === '---') {
		return;
	}
	for (var a = 0; a < comments.length; a++) {
		var comment = comments[a];
		if (comment.ct == ct) {
			showHideSelection(comment);
			return;
		}
	}
	alert('Cannot find comment \'' + ct + '\'');
}
function getSetReviewCommentMsg() {
	if (reviewcommentmsg == null) {
		reviewcommentmsg = getById("reviewcommentmsg");
	}
	return reviewcommentmsg;
}
function getSetReviewCommentCapture() {
	if (reviewcommentcapture == null) {
		reviewcommentcapture = getById("reviewcommentcapture");
	}
	return reviewcommentcapture;
}
function closeReviewCommentCapture() {
	getSetCommentTitle().value = '';
	getSetCommentMsg().value = '';
	getSetCommentType().value = '---';
	getSetReviewCommentCapture().style.display='none';
}
function getComment() {
	var commentTtl, commentMsg, commentTyp;
	commentTtl = commentMsg = commentTyp = '';
	if (getSetCommentTitle().value === '') {
		alert('Set a comment title');
		return;
	} else {
		commentTtl = getSetCommentTitle().value;
	}
  commentMsg = getSetCommentMsg().value;
  if (commentMsg === msgText || commentMsg === '') {
    var msgQ = isie ? "Do not use '" + commentMsg + "', use meaningful text. Add a comment about this selection" :
                      "Do not use '" + commentMsg + "', use meaningful text.\n\nAdd a comment about this selection";
    alert(msgQ);
		return;
  }
	if (getSetCommentType().value === '') {
		alert('Set a comment type');
		return;
	} else {
		commentTyp = getSetCommentType().value;
	}
  addComment(selTxt, commentMsg, commentTtl, commentTyp, getXPathString(_sttTag), _sttOffset, _sttId, getXPathString(_endTag), _endOffset, _endId);
	closeReviewCommentCapture();
  document.getSelection().removeAllRanges();
	showcomments();
}
/*
input#commenttitle,
input#commentmsg,
select#commenttype
*/
function getSetCommentTitle() {
	if (commenttitle == null) {
		commenttitle = getById("commenttitle");
	}
	return commenttitle;
}
function getSetCommentMsg() {
	if (commentmsg == null) {
		commentmsg = getById("commentmsg");
	}
	return commentmsg;
}
function getSetCommentType() {
	if (commenttype == null) {
		commenttype = getById("commenttype");
	}
	return commenttype;
}


function showHideSelection(comment) {
  // var range = new Range();
  var range = document.createRange();
	var elstt, elend;
  try {
		//elstt = getTargetEl(comment.start, comment.startId);
		elstt = getTargetEl(comment.startId);
  } catch(e) {
    console.error('Error setting comment.start (' + comment.start.nodeType + '|' + comment.startId + '): ' + e.message);
    console.error(e);
    return;
  }
  try {
		// elend = getTargetEl(comment.end, comment.endId);
		elend = getTargetEl(comment.endId);
  } catch(e) {
    console.error('Error setting comment.end (' + comment.endId + '): ' + e.message);
    console.error(e);
    return;
  }
	if (elstt != null && elend != null) {
		range.setStart(elstt.firstChild, comment.startOff);
		range.setEnd(elend.firstChild, comment.endOff);
	} else {
		console.error('Error setting start and end points for range: ' + (elstt==null ? 'elstt is null':'elstt is there') + ' : ' + (elend==null ? 'elend is null':'elend is there'));
		return;
	}
  document.getSelection().removeAllRanges();
  document.getSelection().addRange(range);
	elstt.scrollIntoView(); 
	// Add tooltip to elstt
	var str = '';
	str += '<table width=\'100%\' cellpadding=\'3\' border=\'0\'>';
	str += '<col width=\'8%\'><col width=\'20%\'><col width=\'17%\'><col width=\'35%\'><col width=\'9%\'><col width=\'9%\'><col width=\'2%\'>';
	str += '<thead><tr>';
	str += '<th style=\'text-align:left;\'>User</th><th style=\'text-align:left;\'>Date / Time</th><th style=\'text-align:left;\'>Title</th>';
	str += '<th style=\'text-align:left;\'>Comment</th><th style=\'text-align:left;\'>Type</th><th style=\'text-align:left;\'>Issue</th>';
	str += '<th style=\'text-align:left;\'><a href=\'#\' onclick=\'javascript:closeCommentUI();\' title=\'Close...\'><span class=\'reviewcommentmsgheader\'>X</span></a></th>';
	str += '</tr></thead><tbody><tr>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.user + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.date + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.title + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.msg + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.type + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'>' + comment.iss + ':' + comment.inw + '</td>';
	str += '<td class=\'selected\' style=\'vertical-align:top;\'> </td>';
	str += '</tr></tbody></table>';
	getSetReviewCommentMsg().innerHTML = str;
	getSetReviewCommentMsg().style.display='block';
}
function resetComments() {
	var drop = document.getElementById("comment");
	drop.disabled = false;
  while (drop.hasChildNodes) {
  	try {
  	  drop.removeChild(drop.options[drop.options.length - 1]);
    } catch(e) {
      break;
    }
  }
	return drop;
}
function showcomments() {
  if (comments == null) {
    alert('No selections to show');
    return;
  }
	var drop = resetComments();
	var option = document.createElement("option");
	option.value = '---';
	option.text = '---';
	drop.add(option); 
  for (var a = 0; a < comments.length; a++) {
    var comment = comments[a];
		option = document.createElement("option");
		option.value = comment.ct;
		option.text = comment.title;
		drop.add(option); 
  }
}

function getFormattedDate() {
	var d = new Date();
	var dateStr = d.getUTCFullYear() + ' ';
	switch (d.getUTCMonth()) {
		case 0: dateStr += 'Jan';
			break;
		case 1: dateStr += 'Feb';
			break;
		case 2: dateStr += 'Mar';
			break;
		case 3: dateStr += 'Apr';
			break;
		case 4: dateStr += 'May';
			break;
		case 5: dateStr += 'Jun';
			break;
		case 6: dateStr += 'Jul';
			break;
		case 7: dateStr += 'Aug';
			break;
		case 8: dateStr += 'Sep';
			break;
		case 9: dateStr += 'Oct';
			break;
		case 10: dateStr += 'Nov';
			break;
		case 11: dateStr += 'Dec';
			break;
		default:
			break;
	}
	dateStr += ' ';
	dateStr += d.getUTCDate();
	switch (s) {
		case '1':
		case '21':
		case '31':
			dateStr += 'st';
			break;
		case '2':
		case '22':
			dateStr += 'nd';
			break;
		case '3':
		case '23':
			dateStr += 'rd';
			break;
		default:
			dateStr += 'th';
			break;
	}
	dateStr += ' - ';
	var s = '';
	s = ('' + d.getUTCHours());
	dateStr += (s.length == 1 ? '0':'') + s + ':';
	s = ('' + d.getUTCMinutes());
	dateStr += (s.length == 1 ? '0':'') + s + ':';
	s = ('' + d.getUTCSeconds());
	dateStr += (s.length == 1 ? '0':'') + s;
	return dateStr;
}

function Comment(ct, text, msg, title, type, start, startOff, startId, end, endOff, endId) {
	getIssue();
  console.info('Comment[' + ct + ']:' + text + ' : ' + msg + ' : ' + start + ' : ' + startOff + ' : ' + end + ' : ' + endOff + ' : ' + CVPortal.metaFactory().get('META_USER'));
  this.ct = ct;
  this.text = text;

  this.msg = msg;
  this.title = title;
  this.type = type;

  this.start = start;
  this.startOff = startOff;
  this.startId = startId;
  this.end = end;
  this.endOff = endOff;
  this.endId = endId;
  this.user = CVPortal.metaFactory().get('META_USER');
  this.date = getFormattedDate();
	this.iss = docIss;
	this.inw = docInw;
	this.dmc = docDmc;
}
function addComment(text, msg, title, type, start, startOff, startId, end, endOff, endId) {
  comments.push(new Comment((commentCt++), text, msg, title, type, start, startOff, startId, end, endOff, endId));
}
function getPrevSiblCt(n) {
  var nm = ('' + n.nodeName);
  var prev = n.previousSibling;
  var ct = 1;
  while (prev != null) {
    var pnm = ('' + prev.nodeName);
    if (nm === pnm) {
      ct++;
    }
    prev = prev.previousSibling;
  }
  return ct;
}
function addIdSelector(n) {
  var str = '@id=\'';
  str = str + n.getAttribute('id');
  str = str + '\''
  
}
function getXPathString(n) {
  var nm = ('' + n.nodeName);
  var xpathStr = nm;
  //xpathStr = xpathStr + ('[' + (n.hasAttribute('id') ? addIdSelector(n):getPrevSiblCt(n)) + ']');
  var par = n.parentNode;
  while (par != null) {
    if (par.nodeType == 1) {
      nm = ('' + par.nodeName).toLowerCase();
      if (nm === 'html') {
        break;
      }
      //xpathStr = nm + '[' + getPrevSiblCt(par) + ']/' + xpathStr;
      xpathStr = nm + '/' + xpathStr;
    }
    par = par.parentNode;
  }
  return ('//' + xpathStr).toLowerCase();
}
function adnewcomment() {
	var drop = document.getElementById("comment");
	drop.disabled = false;

  var sel = window.getSelection();
  if (isie) {
    if (('' + sel) === '') {
      alert('Error: no content is selected');
      return;
    }
  } else {
    if (sel.type === undefined || sel.type === 'None' || sel.type !== 'Range') {
      alert('Error: no content is selected');
      return;
    }
  }
	_sttContainer = _sttOffset = _endContainer = _endOffset = _sttTag = _endTag = _sttId = _endId = selTxt = null;

  var rng = sel.getRangeAt(0);
  _sttContainer = rng.startContainer;
  _sttOffset = rng.startOffset;

  _endContainer = rng.endContainer;
  _endOffset = rng.endOffset;

  _sttTag = _sttContainer.nodeType == 1 ? _sttContainer : _sttContainer.parentNode;
  _endTag = _endContainer.nodeType == 1 ? _endContainer : _endContainer.parentNode;
  _sttId = _sttTag.getAttribute('ID');
  _endId = _endTag.getAttribute('ID');
  console.info('adnewcomment:' + _sttTag.nodeName + ':' + _sttId);
	if (_sttId == null || _endId == null) {
		alert('A comment cannot be added to this selection.\n\nPlease try a different area.');
		document.getSelection().removeAllRanges();
		return;
	}
  selTxt = rng.toString();
	
	getSetCommentTitle().value = selTxt.length > 25 ? selTxt.substring(0,25) + '...':selTxt;

	getSetReviewCommentCapture().style.display='block';
}

function resetDocumentComments() {
	getSetReviewCommentMsg().style.display='none';
	for (var a = 0; a < comments.length; a++) {
		delete comments[a];
	}
	comments = [];
	resetComments();
}
