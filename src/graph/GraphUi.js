/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import DragScroll from '@/dragscroll'
import Color from '@/Color'

const DEFAULT_BACKGROUND_COLOR = "#1E87AF";
const GraphUi = {};

let _drawnGraph,
    _topLayer,
    _bubbleIdCounter = 0,
    _isDragScrollEnabled = false,
    _isDragScrollLocked = false,
    _backgroundColor = DEFAULT_BACKGROUND_COLOR,
    _selectedBackgroundColor;

GraphUi.refreshWidth = function () {
    let $leftContainer = $(".vertices-children-container.left-oriented");
    let $rightContainer = $(".vertices-children-container.right-oriented");
    let leftWidth = $leftContainer.find(".bubble").length * 750 + 2225;
    let rightWidth = $rightContainer.find(".bubble").length * 750 + 2225;
    $("#graph-width").css(
        "width",
        ((leftWidth + rightWidth) * 2) + "px"
    );
    // $(".root-vertex-super-container").css(
    //     "width",
    //     (leftWidth + rightWidth + 800) + "px"
    // );
    // $leftContainer.css(
    //     "width",
    //     leftWidth
    // );
    // $rightContainer.css(
    //     "width",
    //     rightWidth
    // );
};

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
GraphUi.zoom = function (zoomDifference) {
    let currentZoom = GraphUi.getZoom();
    let newZoom = currentZoom + zoomDifference;
    if (newZoom < 0.1) {
        newZoom = 0.1;
    }
    $(".root-vertex-super-container").attr(
        "data-zoom", newZoom
    ).css(
        "transform",
        "scale(" + newZoom + "," + newZoom + ")"
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

GraphUi.changeBackgroundColor = function (backgroundColor) {
    _backgroundColor = backgroundColor;
    GraphUi.defineSelectedBackgroundColor();
    $("#background-color-picker").val(backgroundColor);
    $("#drawn_graph").css(
        'background',
        "radial-gradient(rgba(0, 0, 0, 0) -10%, " + backgroundColor + " 100%"
    );
};

GraphUi.resetBackGroundColor = function () {
    GraphUi.changeBackgroundColor(DEFAULT_BACKGROUND_COLOR);
};

GraphUi.defineSelectedBackgroundColor = function () {
    let hsl = Color.hex2Hsl(_backgroundColor);
    _selectedBackgroundColor = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
};

GraphUi.getSelectedBubbleBackgroundColor = function () {
    if (!_selectedBackgroundColor) {
        GraphUi.defineSelectedBackgroundColor();
    }
    return _selectedBackgroundColor;
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
