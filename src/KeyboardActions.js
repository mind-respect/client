/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Store from '@/store'
import Selection from '@/Selection'
import MindMapInfo from '@/MindMapInfo'
import UiUtils from '@/UiUtils'
import GraphDisplayer from '@/graph/GraphDisplayer'
import Focus from '@/Focus'
import * as KeyCode from 'keycode-js';


const KeyboardActions = {
    isExecutingFeature: false
};

let nonCtrlPlusActions = defineNonCtrlPlusKeysAndTheirActions();
let ctrlPlusActions = defineCtrlPlusKeysAndTheirActions();

KeyboardActions._ctrlKeyNumber = UiUtils.isMacintosh() ? 91 : 17;

KeyboardActions.disable = function () {
    window.removeEventListener(
        "keydown", keyDownHandler
    );
};

KeyboardActions.enable = function () {
    KeyboardActions.disable();
    window.addEventListener(
        "keydown", keyDownHandler
    );
};
KeyboardActions.init = function () {
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

export default KeyboardActions;

function keyDownHandler(event) {
    if (KeyboardActions.isExecutingFeature) {
        return;
    }
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
        if (!isCombineKeyPressed && Selection.isSingle()) {
            let selectedElement = Selection.getSingle();
            if (MindMapInfo.isViewOnly()) {
                Store.dispatch("failedToEdit");
            } else if (selectedElement.controller().focusCanDo()) {
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
    KeyboardActions.isExecutingFeature = true;
    Promise.all(
        feature.map(function (feature) {
            return executeFeature(feature);
        })
    ).then(() => {
        KeyboardActions.isExecutingFeature = false;
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
        return Promise.resolve();
    }
    let canDoValidator = controller[feature.action + "CanDo"];
    if (canDoValidator !== undefined && !canDoValidator.call(controller)) {
        if (feature.action === "focus" && MindMapInfo.isViewOnly()) {
            Store.dispatch("failedToEdit");
        }
        return Promise.resolve();
    }
    return controller[feature.action](event);
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
    actions[KeyCode.KEY_PAGE_UP] = {
        action: "moveCompletelyUp"
    };
    actions[KeyCode.KEY_PAGE_DOWN] = {
        action: "moveCompletelyDown"
    };
    return actions;
}

function defineCtrlPlusKeysAndTheirActions() {
    let actions = {};
    actions[KeyCode.KEY_G] = [{
        action: "showTags"
    }, {
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
    actions[KeyCode.KEY_I] = {
        action: "focusRelation"
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
    actions[KeyCode.KEY_RETURN] = {
        action: "addSiblingUp"
    };
    actions[KeyCode.KEY_V] = {
        action: "pasteText"
    };
    return actions;
}
