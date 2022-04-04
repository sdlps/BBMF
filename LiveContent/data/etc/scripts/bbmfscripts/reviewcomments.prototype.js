/* LAM:2020-10-07 */

function reviewcomments() {
	this.comments = [];
	this.msgText = '...';
	this.commentCt = 0;
	this.reviewcommentmsg;
	this.ua = window.navigator.userAgent;
	this.isie = ((ua.indexOf('MSIE') > -1) || (ua.indexOf('like Gecko') > -1));
}

reviewcomments.prototype = {

	getCommentByCt: function(ct) {
		var rc = this;
		rc.showHideCommentMsg(true);
		document.getSelection().removeAllRanges();
		if (ct === '---') {
			return;
		}
		for (var a = 0; a < rc.comments.length; a++) {
			var comment = rc.comments[a];
			if (comment.ct == ct) {
				rc.showHideSelection(comment);
				return;
			}
		}
		alert('Cannot find comment \'' + ct + '\'');
	},
	getSetReviewCommentMsg: function() {
		var rc = this;
		if (rc.reviewcommentmsg == null) {
			rc.reviewcommentmsg = getById("reviewcommentmsg");
		}
		return rc.reviewcommentmsg;
	},
	showHideCommentMsg: function(showHide) {
		var rc = this;
		rc.getSetReviewCommentMsg().style.display = (showHide ? 'none':'block');
	},
	showHideSelection: function(comment) {
		var rc = this;
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
		str += '<table width=\'95%\'><col width=\'10%\'><col width=\'40%\'><col width=\'55%\'>';
		str += '<thead><tr><th style=\'text-align:left;\'>User</th><th style=\'text-align:left;\'>Date / Time</th><th style=\'text-align:left;\'>Comment</th></tr></thead>';
		str += '<tbody><tr><td class=\'selected\'>' + comment.user + '</td><td class=\'selected\'>' + comment.date + '</td><td class=\'selected\'>' + comment.msg + '</td></tr></tbody>';
		str += '</table>';
		rc.getSetReviewCommentMsg().innerHTML = str;
		rc.showHideCommentMsg(false);
	},
	showcomments: function() {
		var rc = this;
		if (rc.comments == null) {
			alert('No selections to show');
			return;
		}
		var drop = getById("comment");
		drop.disabled = false;
		while (drop.hasChildNodes) {
			try {
				drop.removeChild(drop.options[drop.options.length - 1]);
			} catch(e) {
				break;
			}
		}
		var option = document.createElement("option");
		option.value = '---';
		option.text = '---';
		drop.add(option); 
		for (var a = 0; a < rc.comments.length; a++) {
			var comment = rc.comments[a];
			option = document.createElement("option");
			option.value = comment.ct;
			option.text = comment.msg;
			drop.add(option); 
		}
	},
	getComments: function() {
		var rc = this;
		rc.comments = [];
		var wrapper = rc.getById("comments");
		var tags = wrapper.getElementsByTagName("comment");
		for (var a = 0; a < tags.length; a++) {
			var comment = tags[a];
			rc.comments.push(new Comment((commentCt++), comment.getAttribute('text'), comment.getAttribute('msg'),
										                comment.getAttribute('start'), comment.getAttribute('startOff'), comment.getAttribute('startId'),
										                comment.getAttribute('end'), comment.getAttribute('endOff'), comment.getAttribute('endId')));
		}
	},
	getFormattedDate: function() {
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
	},
	Comment: function(ct, text, msg, start, startOff, startId, end, endOff, endId) {
		console.info('Comment[' + ct + ']:' + text + ' : ' + msg + ' : ' + start + ' : ' + startOff + ' : ' + end + ' : ' + endOff + ' : ' + CVPortal.metaFactory().get('META_USER'));
		this.ct = ct;
		this.text = text;
		this.msg = msg;
		this.start = start;
		this.startOff = startOff;
		this.startId = startId;
		this.end = end;
		this.endOff = endOff;
		this.endId = endId;
		this.user = CVPortal.metaFactory().get('META_USER');
		this.date = getFormattedDate();
	},
	addComment: function(text, msg, start, startOff, startId, end, endOff, endId) {
		var rc = this;
		rc.comments.push(new Comment((commentCt++), text, msg, start, startOff, startId, end, endOff, endId));
	},
	getPrevSiblCt: function(n) {
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
	},
	addIdSelector: function(n) {
		var str = '@id=\'';
		str = str + n.getAttribute('id');
		str = str + '\''
	},
	getXPathString: function(n) {
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
	},
	adnewcomment: function() {
		var rc = this;
		var drop = getById("comment");
		drop.disabled = false;

		var sel = window.getSelection();
		if (rc.isie) {
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
		var rng = sel.getRangeAt(0);
		var _sttContainer = rng.startContainer;
		var _sttOffset = rng.startOffset;

		var _endContainer = rng.endContainer;
		var _endOffset = rng.endOffset;

		var _sttTag = _sttContainer.nodeType == 1 ? _sttContainer : _sttContainer.parentNode;
		var _endTag = _endContainer.nodeType == 1 ? _endContainer : _endContainer.parentNode;
		var _sttId = _sttTag.getAttribute('ID');
		var _endId = _endTag.getAttribute('ID');
		console.info('adnewcomment:' + _sttTag.nodeName + ':' + _sttId);
		if (_sttId == null || _endId == null) {
			alert('A comment cannot be added to this selection.\n\nPlease try a different area.');
			document.getSelection().removeAllRanges();
			return;
		}

		var selTxt = rng.toString();
		var msg = prompt("Add a comment about this selection", msgText);
		while (msg === msgText || msg === '') {
			var msgQ = isie ? "Do not use '" + msg + "', use meaningful text. Add a comment about this selection":
												"Do not use '" + msg + "', use meaningful text.\n\nAdd a comment about this selection";
			msg = prompt(msgQ, msgText);
		}
		rc.addComment(selTxt, msg, getXPathString(_sttTag), _sttOffset, _sttId, getXPathString(_endTag), _endOffset, _endId);
		document.getSelection().removeAllRanges();
		rc.showcomments();
	}
}

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
	return getById(id);
}
