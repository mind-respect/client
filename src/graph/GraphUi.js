/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import DragScroll from '@/dragscroll'

const GraphUi = {};

let _isDragScrollEnabled = false,
    _isDragScrollLocked = false;

GraphUi.initDragScroll = function (dragScrollContainer) {
    if (!dragScrollContainer) {
        return;
    }
    dragScrollContainer.classList.add("dragscroll");
    dragScrollContainer.style.overflow = "scroll";
    DragScroll.reset();
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


export default GraphUi;
