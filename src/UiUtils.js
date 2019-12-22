/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

const api = {};
let _isChrome;

api.isMacintosh = function () {
    return navigator.platform.indexOf('Mac') > -1;
};

api.isChrome = function () {
    if (_isChrome === undefined) {
        _isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    return _isChrome;
};

api.removeHtmlFromString = function(string){
    let doc = new DOMParser().parseFromString(string, 'text/html');
    return doc.body.textContent || "";
};

api.getCenterOffsetCoordinates = function (center) {
    const centerHtml = center.getHtml();
    return {
        x: centerHtml.offsetParent.offsetParent.offsetLeft,
        y: centerHtml.offsetParent.offsetParent.offsetTop
    };
};

api.buildElementsAnimationData = function (graphElements) {
    return graphElements.reduce((boxes, graphElement) => {
        const html = graphElement.getHtml();
        if (html) {
            boxes[graphElement.getId()] = html.getBoundingClientRect();
        }
        return boxes;
    }, {});

};

api.animateGraphElementsWithAnimationData = function (graphElements, firstBoxes, options) {
    options = options || {};
    const duration = options.duration || 500;
    return Promise.all(graphElements.map((graphElement) => {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const html = graphElement.getHtml();
                if (!html) {
                    resolve();
                    return;
                }
                const firstBox = firstBoxes[graphElement.getId()];
                const lastBox = html.getBoundingClientRect();
                const deltaX = firstBox.left - lastBox.left;
                const deltaY = firstBox.top - lastBox.top;
                if (deltaX === 0 && deltaY === 0) {
                    resolve();
                } else {
                    graphElement.draw = options.dontHideEdges === true;
                    html.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    html.style.transition = 'transform 0s';
                    requestAnimationFrame(() => {
                        html.style.transform = '';
                        html.style.transition = 'transform ' + duration + 'ms';
                        resolve();
                    });
                }
            });
        });
    }));
};

export default api;
