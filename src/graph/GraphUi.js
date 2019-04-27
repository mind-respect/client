/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import DragScroll from '@/dragscroll'

const GraphUi = {};

let _drawnGraph,
    _topLayer,
    _bubbleIdCounter = 0,
    _isDragScrollEnabled = false,
    _isDragScrollLocked = false;

GraphUi.initDragScroll = function () {
    let $body = $('body');
    let $toDragScroll = $body.scrollLeft() > 0 ? $body : $('html');
    $toDragScroll.addClass("dragscroll");
    DragScroll.reset();
};
GraphUi.addHtml = function (html) {
    GraphUi.getDrawnGraph().append(html);
};
GraphUi.getDrawnGraph = function () {
    if (!_drawnGraph) {
        _drawnGraph = $("#drawn_graph");
    }
    return _drawnGraph;
};
GraphUi.getZoom = function () {
    return parseFloat(
        $(".root-vertex-super-container").attr("data-zoom")
    );
};

GraphUi.getTopLayer = function () {
    if (!_topLayer) {
        _topLayer = $("body, html");
    }
    return _topLayer;
};
GraphUi.generateBubbleHtmlId = function () {
    _bubbleIdCounter++;
    return "bubble-ui-id-" + _bubbleIdCounter;
};

GraphUi.lockDragScroll = function () {
    _isDragScrollLocked = true;
};

GraphUi.unlockDragScroll = function () {
    _isDragScrollLocked = false;
};

GraphUi.disableDragScroll = function () {
    if (_isDragScrollLocked || !_isDragScrollEnabled) {
        return;
    }
    DragScroll.disable();
    _isDragScrollEnabled = false;
};
GraphUi.enableDragScroll = function () {
    if (_isDragScrollLocked || _isDragScrollEnabled) {
        return;
    }
    DragScroll.enable();
    _isDragScrollEnabled = true;
};
GraphUi.isDragScrollEnabled = function () {
    return _isDragScrollEnabled;
};
GraphUi.hideSchemaInstructions = function () {
    getSchemaInstructions().addClass("hidden");
};
GraphUi.showSchemaInstructions = function () {
    getSchemaInstructions().removeClass("hidden");
};
GraphUi.hasSelectedFromAutocomplete = function () {
    return $(".ui-autocomplete:visible").find(".ui-menu-item.focus").length > 0;
};
GraphUi.isDraggingBubble = function () {
    return _drawnGraph.data("isDraggingBubble") !== undefined &&
        _drawnGraph.data("isDraggingBubble");
};
GraphUi.setIsDraggingBubble = function (isDragging) {
    return GraphUi.getDrawnGraph().data("isDraggingBubble", isDragging);
};
GraphUi.removePopovers = function () {
    $(".popover").remove();
};

export default GraphUi;

function getSchemaInstructions() {
    return $("#schema-instructions");
}
