/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Store from '@/store'
import Selection from '@/Selection'
import MindMapInfo from '@/MindMapInfo'
import UiUtils from '@/UiUtils'
import GraphDisplayer from '@/graph/GraphDisplayer'
import Focus from '@/Focus'
import KeyCode from 'keycode-js';


const api = {};

let nonCtrlPlusActions = defineNonCtrlPlusKeysAndTheirActions();
let ctrlPlusActions = defineCtrlPlusKeysAndTheirActions();

api._ctrlKeyNumber = UiUtils.isMacintosh() ? 91 : 17;

api.disable = function () {
    window.removeEventListener(
        "keydown", keyDownHandler
    );
    window.removeEventListener(
        "paste", pasteHandler
    );
};

api.enable = function () {
    api.disable();
    window.addEventListener(
        "keydown", keyDownHandler
    );
    window.addEventListener(
        "paste", pasteHandler
    );
};
api.init = function () {
    document.addEventListener('mousewheel', wheelZoomHandle, false);
    document.addEventListener('DOMMouseScroll', wheelZoomHandle, false);
    let redrawTimeout;

    function wheelZoomHandle(event) {
        let isCtrl = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
        if (isCtrl) {
            if (redrawTimeout) {
                clearTimeout(redrawTimeout);
            }
            redrawTimeout = setTimeout(() => {
                Store.dispatch("redraw");
            }, 100)

        }
    }
};

export default api;

function pasteHandler(event) {
    if (!Selection.isSingle()) {
        return;
    }
    let selectedElement = Selection.getSingle();
    if (selectedElement.isEditFlow) {
        return;
    }
    event.preventDefault();
    executeFeature({
        action: "paste"
    }, event);
}

function keyDownHandler(event) {
    // console.log(event.which);
    let target = event.target;
    let isWorkingOnSomething = [
        "input",
        "button",
    ].indexOf(target.tagName.toLowerCase()) > -1 || target.isContentEditable;
    let isCombineKeyPressed = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
    if (isWorkingOnSomething) {
        if (event.keyCode === KeyCode.KEY_ESCAPE) {
            target.blur();
        }
        return;
    }
    if (isThereASpecialKeyPressed()) {
        return;
    }
    let actionSet = isCombineKeyPressed ?
        ctrlPlusActions :
        nonCtrlPlusActions;
    let feature = actionSet[event.which];
    if (feature === undefined) {
        let isPasting = isCombineKeyPressed && KeyCode.KEY_V && event.which;
        if (!isPasting && event.which !== api._ctrlKeyNumber && !MindMapInfo.isViewOnly() && Selection.isSingle()) {
            let selectedElement = Selection.getSingle();
            if (!MindMapInfo.isViewOnly() && !selectedElement.isMetaRelation()) {
                let labelHtml = selectedElement.getLabelHtml();
                labelHtml.contentEditable = "true";
                Focus.focusEnd(labelHtml);
            }
        }
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!Array.isArray(feature)) {
        feature = [feature];
    }
    feature.forEach(function (feature) {
        executeFeature(feature);
    });

    function isThereASpecialKeyPressed() {
        return event.altKey || (event.metaKey && !UiUtils.isMacintosh()) || (event.ctrlKey && UiUtils.isMacintosh());
    }
}

function executeFeature(feature, event) {
    let controller;
    if (feature.isForAppController) {
        controller = GraphDisplayer.getAppController();
    } else {
        controller = Selection.controller();
    }
    if (controller[feature.action] === undefined) {
        return;
    }
    let canDoValidator = controller[feature.action + "CanDo"];
    if (canDoValidator !== undefined && !canDoValidator.call(controller)) {
        return;
    }
    controller[feature.action](event);
}

function defineNonCtrlPlusKeysAndTheirActions() {
    let actions = {};
    actions[KeyCode.KEY_TAB] = {
        action: "addChild"
    };
    actions[KeyCode.KEY_DELETE] = {
        action: "remove"
    };
    actions[KeyCode.KEY_BACK_SPACE] = {
        action: "remove"
    };
    actions[KeyCode.KEY_LEFT] = {
        action: "travelLeft"
    };
    actions[KeyCode.KEY_RIGHT] = {
        action: "travelRight"
    };
    actions[KeyCode.KEY_UP] = {
        action: "travelUp"
    };
    actions[KeyCode.KEY_DOWN] = {
        action: "travelDown"
    };
    actions[KeyCode.KEY_RETURN] = {
        action: "addSibling"
    };
    actions[KeyCode.KEY_ESCAPE] = {
        action: "deselect"
    };
    actions[KeyCode.KEY_SPACE] = {
        action: "focus"
    };
    return actions;
}

function defineCtrlPlusKeysAndTheirActions() {
    let actions = {};
    actions[KeyCode.KEY_G] = [{
        action: "showTags"
    },{
        action: "hideTags"
    }];
    actions[KeyCode.KEY_A] = {
        action: "selectTree"
    };
    actions[KeyCode.KEY_E] = {
        action: "expand"
    };
    actions[KeyCode.KEY_S] = {
        action: "suggestions"
    };
    actions[KeyCode.KEY_I] = {
        action: "reverse"
    };
    actions[KeyCode.KEY_D] = {
        action: "note"
    };
    actions[KeyCode.KEY_0] = {
        action: "center"
    };
    actions[KeyCode.KEY_H] = {
        action: "collapse"
    };
    actions[KeyCode.KEY_X] = {
        action: "cut"
    };
    actions[KeyCode.KEY_Y] = {
        action: "redo",
        isForAppController: true
    };
    actions[KeyCode.KEY_Z] = {
        action: "undo",
        isForAppController: true
    };
    actions[KeyCode.KEY_O] = [{
        action: "convertToRelation"
    }, {
        action: "convertToGroupRelation"
    }];
    actions[KeyCode.KEY_ADD] = {
        action: "zoomIn",
        isForAppController: true
    };
    actions[KeyCode.KEY_SUBTRACT] = {
        action: "zoomOut",
        isForAppController: true
    };
    actions[KeyCode.KEY_UP] = {
        action: "moveUpOneStep"
    };
    actions[KeyCode.KEY_DOWN] = {
        action: "moveDownOneStep"
    };
    actions[KeyCode.KEY_M] = {
        action: "merge"
    };
    actions[KeyCode.KEY_B] = {
        action: "createVertex",
        isForAppController: true
    };
    actions[KeyCode.KEY_L] = {
        action: "list"
    };
    return actions;
}
