/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import Store from '@/store'
import Selection from '@/Selection'
import State from '@/State'
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
    document.addEventListener('mousewheel', wheelZoomHandle, {passive: false});
    // document.addEventListener('DOMMouseScroll', wheelZoomHandle, { passive: false});
    let redrawTimeout = null;

    function wheelZoomHandle(event) {
        let isCtrl = UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey;
        if (isCtrl) {
            event.preventDefault();
            if (redrawTimeout !== null) {
                return;
            }
            redrawTimeout = setTimeout(async () => {
                const controller = GraphDisplayer.getAppController()
                if (event.deltaY < 0) {
                    controller.zoomIn();
                } else if (event.deltaY > 0) {
                    controller.zoomOut();
                }
                Store.dispatch("redraw");
                redrawTimeout = null;
            }, 10)
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
            if (State.isViewOnly()) {
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
        if (editModeHandler.additionalAction) {
            editModeHandler.additionalAction(single, event);
        }
        event.preventDefault();
        event.stopPropagation();
        single.setLabel(event.target.innerHTML);
        single.blur();
    } else {
        event.preventDefault();
        event.stopPropagation();
    }

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
        if (action === "focus" && State.isViewOnly()) {
            Store.dispatch("failedToEdit");
        }
        return Promise.resolve();
    }
    return controller[action]();
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
            atBeginning: true,
            additionalAction: function () {
                Store.dispatch("setEditMode", "atEnd");
            }
        }
    };
    actions[KeyCode.KEY_RIGHT] = {
        action: "travelRight",
        editMode: {
            atEnd: true,
            additionalAction: function () {
                Store.dispatch("setEditMode", "atBeginning");
            }
        }
    };
    const travelUpOrDownAdditionalAction = function (single, event) {
        const caretPosition = Focus.getCaretOffset(event.target);
        const isAtEnd = caretPosition === event.target.innerText.length;
        Store.dispatch("setEditMode", isAtEnd ? "atEnd" : caretPosition);
    };

    actions[KeyCode.KEY_UP] = {
        action: "travelUp",
        editMode: {
            except: function (graphElement) {
                return graphElement.getUpBubble().getId() === graphElement.getId();
            },
            additionalAction: travelUpOrDownAdditionalAction
        }
    };
    actions[KeyCode.KEY_DOWN] = {
        action: "travelDown",
        editMode: {
            except: function (graphElement) {
                return graphElement.getDownBubble().getId() === graphElement.getId();
            },
            additionalAction: travelUpOrDownAdditionalAction
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
        action: "moveCompletelyUp",
        editMode: true
    };
    actions[KeyCode.KEY_PAGE_DOWN] = {
        action: "moveCompletelyDown",
        editMode: true
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
        action: "focusRelation",
        editMode: true
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
    const moveUpOrDownAdditionalAction = function (single, event) {
        const caretPosition = Focus.getCaretPosition(event.target);
        setTimeout(() => {
            single.focusAtPosition(caretPosition);
        }, 500);
    };
    actions[KeyCode.KEY_UP] = {
        action: "moveUpOneStep",
        editMode: {
            additionalAction: moveUpOrDownAdditionalAction
        }
    };
    actions[KeyCode.KEY_DOWN] = {
        action: "moveDownOneStep",
        editMode: {
            additionalAction: moveUpOrDownAdditionalAction
        }
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
    if (!Selection.isSingle()) {
        return false;
    }
    const single = Selection.getSingle();
    return single && single.isEditFlow;
}
