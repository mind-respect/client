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
    let isEdiFlow = _isEdiFlow();
    let isCombineKeyPressed = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
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
                if (isEdiFlow) {
                    return;
                }
                let labelHtml = selectedElement.getLabelHtml();
                labelHtml.contentEditable = "true";
                Focus.focusEnd(labelHtml);
            }
        }
        return;
    }
    if (!Array.isArray(feature)) {
        feature = [feature];
    }
    KeyboardActions.isExecutingFeature = true;
    Promise.all(feature.map((feature) => {
        return executeFeature(feature, event, isEdiFlow);
    })).then(() => {
        KeyboardActions.isExecutingFeature = false;
    });

    function isThereASpecialKeyPressed() {
        return event.altKey || (event.metaKey && !UiUtils.isMacintosh()) || (event.ctrlKey && UiUtils.isMacintosh());
    }
}

async function executeFeature(feature, event, isEdiFlow) {
    let controller;
    let editModeHandler = feature.editMode;
    let action = feature.action;
    if (isEdiFlow) {
        if (editModeHandler === undefined) {
            return Promise.resolve();
        }
        const single = Selection.getSingle();
        if (editModeHandler !== true) {
            if (editModeHandler.action) {
                action = editModeHandler.action;
            }
            if (editModeHandler.except && editModeHandler.except(single)) {
                return Promise.resolve();
            }
            if (editModeHandler.atBeginning) {
                if (Focus.getCaretPosition(event.target) !== 0) {
                    return Promise.resolve();
                }
            }
            if (editModeHandler.atEnd) {
                if (Focus.getCaretPosition(event.target) !== event.target.innerText.length) {
                    return Promise.resolve();
                }
            }
        }
        single.innerHtmlBeforeBlur = event.target.innerHTML;
        single.blur();
    }
    event.preventDefault();
    event.stopPropagation();
    if (feature.isForAppController) {
        controller = GraphDisplayer.getAppController();
    } else {
        controller = Selection.controller();
    }
    if (controller[action] === undefined) {
        return Promise.resolve();
    }
    let canDoValidator = controller[action + "CanDo"];
    if (canDoValidator !== undefined && !canDoValidator.call(controller, event.target.innerText)) {
        if (action === "focus" && MindMapInfo.isViewOnly()) {
            Store.dispatch("failedToEdit");
        }
        return Promise.resolve();
    }
    return controller[action](event);
}

function defineNonCtrlPlusKeysAndTheirActions() {
    let actions = {};
    actions[KeyCode.KEY_TAB] = {
        action: "addChild",
        editMode: true
    };
    actions[KeyCode.KEY_DELETE] = {
        action: "remove"
    };
    actions[KeyCode.KEY_BACK_SPACE] = {
        action: "remove",
        editMode: {
            action: "removeWithoutConfirmation",
            atBeginning: true
        }
    };
    actions[KeyCode.KEY_LEFT] = {
        action: "travelLeft",
        editMode: {
            atBeginning: true
        }
    };
    actions[KeyCode.KEY_RIGHT] = {
        action: "travelRight",
        editMode: {
            atEnd: true
        }
    };
    actions[KeyCode.KEY_UP] = {
        action: "travelUp",
        editMode: {
            except: function (graphElement) {
                return graphElement.getUpBubble().getId() === graphElement.getId();
            }
        }
    };
    actions[KeyCode.KEY_DOWN] = {
        action: "travelDown",
        editMode: {
            except: function (graphElement) {
                return graphElement.getDownBubble().getId() === graphElement.getId();
            }
        }
    };
    actions[KeyCode.KEY_RETURN] = {
        action: "addSibling",
        editMode: true
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
        action: "addSiblingUp",
        editMode: true
    };
    actions[KeyCode.KEY_V] = {
        action: "pasteText"
    };
    return actions;
}

function _isEdiFlow() {
    return Selection.isSingle() && Selection.getSingle().isEditFlow;
}
