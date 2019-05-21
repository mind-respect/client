/*
 * https://github.com/asvd/dragscroll
 *
 *  modified for mindrespect.com added global disable option so that inner components
 *  can still be dragged
 */


let _window = window;
let _document = document;
let mousemove = 'mousemove';
let mouseup = 'mouseup';
let mousedown = 'mousedown';
let EventListener = 'EventListener';
let addEventListener = 'add' + EventListener;
let removeEventListener = 'remove' + EventListener;
let _globalDisabled = false;

let dragged = [];

const Dragscroll = {};

Dragscroll.reset = function (i, el) {
    for (i = 0; i < dragged.length;) {
        el = dragged[i++];
        el[removeEventListener](mousedown, el.md, 0);
        _window[removeEventListener](mouseup, el.mu, 0);
        _window[removeEventListener](mousemove, el.mm, 0);
    }
    dragged = _document.getElementsByClassName('dragscroll');
    for (i = 0; i < dragged.length;) {
        (function (el, lastClientX, lastClientY, pushed) {
            el[addEventListener](
                mousedown,
                el.md = function (e) {
                    if (_globalDisabled) {
                        return;
                    }
                    pushed = 1;
                    lastClientX = e.clientX;
                    lastClientY = e.clientY;

                    /*
                    removed e.preventDefault() for bubl.guru because many default behaviors
                    like clicking on inputs became disabled. todo Should put back eventually because
                    I think not calling e.preventDefault(); breaks a little the dragscroll but it's still acceptable
                    */
                    //e.preventDefault();
                    e.stopPropagation();
                }, 0
            );

            _window[addEventListener](
                mouseup, el.mu = function () {
                    pushed = 0;
                }, 0
            );

            _window[addEventListener](
                mousemove,
                el.mm = function (e, scroller) {
                    scroller = el.scroller || el;
                    if (pushed && !_globalDisabled) {
                        scroller.scrollLeft -=
                            (-lastClientX + (lastClientX = e.clientX));
                        scroller.scrollTop -=
                            (-lastClientY + (lastClientY = e.clientY));
                    }
                }, 0
            );
        })(dragged[i++]);
    }
};

/*
  mindrespect.com always calls it manually
if (_document.readyState == 'complete') {
    reset();
} else {
    _window[addEventListener]('load', reset, 0);
}
*/
Dragscroll.enable = function () {
    _globalDisabled = false;
};
Dragscroll.disable = function () {
    _globalDisabled = true;
};

export default Dragscroll;

