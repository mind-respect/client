/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Vue from "vue";
import Store from '@/store'

const UiUtils = {};
let _isChrome;

UiUtils.isInAnimation = false;

UiUtils.isMacintosh = function () {
    return navigator.platform.indexOf('Mac') > -1;
};

UiUtils.isChrome = function () {
    if (_isChrome === undefined) {
        _isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }
    return _isChrome;
};

UiUtils.removeHtmlFromString = function (string) {
    let doc = new DOMParser().parseFromString(string, 'text/html');
    return doc.body.textContent || "";
};

UiUtils.escapeHtml = function (unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

UiUtils.getCenterOffsetCoordinates = function (center) {
    const centerHtml = center.getHtml();
    return {
        x: centerHtml.offsetParent.offsetParent.offsetLeft,
        y: centerHtml.offsetParent.offsetParent.offsetTop
    };
};

UiUtils.animateNewTriple = function (sourceBubble, newTriple) {
    return new Promise(async (resolve) => {
        if (!sourceBubble.isCenter && sourceBubble.getNumberOfChild() === 1) {
            /*
                when there is only one child it uses the 'expand-child' transition in Bubble.vue which is just fine
             */
            resolve();
            return;
        }
        await Vue.nextTick();
        let firstBoxes = {};
        let sourceHtml = sourceBubble.getHtml();
        if (!sourceHtml) {
            /*
            sourceHtml is undefined in unit tests
            so animation is abandoned in unit tests
             */
            resolve();
            return;
        }
        let originRect = sourceHtml.getBoundingClientRect();
        let destinationHtml = newTriple.destination.getHtml();
        if (!destinationHtml) {
            /*
            destinationHtml is undefined should not happen but it happened
             */
            resolve();
            return;
        }
        let vertexOriginalRect = destinationHtml.getBoundingClientRect();
        let vertexRect;
        let edgeRect;
        if (newTriple.destination.isToTheLeft()) {
            vertexRect = {
                left: originRect.left - (vertexOriginalRect.width / 2),
                top: originRect.top + (originRect.height / 2)
            };
            edgeRect = {
                left: originRect.left - (newTriple.edge.getHtml().getBoundingClientRect().width / 2),
                top: originRect.top + (originRect.height / 2)
            }
        } else {
            edgeRect = vertexRect = {
                left: originRect.left + (originRect.width / 2),
                top: originRect.top + (originRect.height / 2)
            };
        }
        firstBoxes[newTriple.edge.getId()] = edgeRect;
        firstBoxes[newTriple.destination.getId()] = vertexRect;
        newTriple.edge.draw = false;
        newTriple.destination.draw = false;
        await UiUtils.animateGraphElementsWithAnimationData(
            [newTriple.edge, newTriple.destination],
            firstBoxes,
            {
                duration: 200
            }
        );
        await Store.dispatch("redraw");
        setTimeout(async () => {
            newTriple.edge.draw = true;
            newTriple.destination.draw = true;
            await Store.dispatch("redraw");
            resolve();
        }, 200);
    });
};

UiUtils.buildElementsAnimationData = function (graphElements) {
    return graphElements.reduce((boxes, graphElement) => {
        const html = graphElement.getHtml();
        if (html) {
            boxes[graphElement.getId()] = html.getBoundingClientRect();
        }
        return boxes;
    }, {});

};

UiUtils.animateGraphElementsWithAnimationData = async function (graphElements, firstBoxes, options) {
    UiUtils.isInAnimation = true;
    options = options || {};
    const duration = options.duration || 500;
    await Promise.all(graphElements.map((graphElement) => {
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
    UiUtils.isInAnimation = false;
};

export default UiUtils;
