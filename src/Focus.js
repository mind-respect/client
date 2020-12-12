/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
export default {
    focusEnd: function (element) {
        /*
            calling blur before focus because somehow sometimes in firefox,
            the element is blurred but not really
            so the focus event is not triggered and this causes problems
         */
        element.blur();
        element.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(element);
            textRange.collapse(false);
            textRange.select();
        }
    },
    focusAtPosition: function (element, position) {
        const range = document.createRange();
        range.setStart(element.firstChild, position);
        range.setEnd(element.firstChild, position);
        window.setTimeout(function () {
            selectRange(range);
        }, 10);
    },
    focusAtPositionFromClick: function (event, element) {
        /*
            calling blur before focus because somehow sometimes in firefox,
            the element is blurred but not really
            so the focus event is not triggered and this causes problems
         */
        element.blur();
        element.focus({preventScroll: true});
        if (element.innerHTML.trim() === "") {
            return;
        }
        let caretRange = getMouseEventCaretRange(event);
        window.setTimeout(function () {
            selectRange(caretRange);
        }, 10);
    },
    getCaretPosition: function (editableEl) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = window.getSelection().getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editableEl);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            return preCaretRange.toString().length;
        }
    },
    getCaretOffset: function(element){
        var caretOffset = 0;

        if (window.getSelection) {
            var range = window.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }

        else if (document.selection && document.selection.type != "Control") {
            var textRange = document.selection.createRange();
            var preCaretTextRange = document.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }

        return caretOffset;

    }
}

function selectRange(range) {
    if (range) {
        if (typeof range.select != "undefined") {
            range.select();
        } else if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

function getMouseEventCaretRange(evt) {
    var range, x = evt.clientX, y = evt.clientY;

    // Try the simple IE way first
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToPoint(x, y);
    } else if (typeof document.createRange != "undefined") {
        // Try Mozilla's rangeOffset and rangeParent properties, which are exactly what we want

        if (evt.rangeParent !== null && typeof evt.rangeParent != "undefined") {
            range = document.createRange();
            range.setStart(evt.rangeParent, evt.rangeOffset);
            range.collapse(true);
        }

        // Try the standards-based way next
        else if (document.caretPositionFromPoint) {
            var pos = document.caretPositionFromPoint(x, y);
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
        }

        // Next, the WebKit way
        else if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(x, y);
        }
    }

    return range;
}
