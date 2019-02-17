/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphDisplayer from '@/graph/GraphDisplayer'
import EventBus from '@/EventBus'
import GraphElementButton from '@/graph-element/GraphElementButton'
import MindMapInfo from '@/MindMapInfo'
import UiUtils from '@/UiUtils'
import I18n from '@/I18n'

const GraphElementMainMenu = {};
let _graphElementMenu,
    _graphMenu,
    _possibleInLabelMenu;
GraphElementMainMenu.addRelevantButtonsInMenu = function (menuContainer, controller) {
    GraphElementMainMenu.visitButtons(function (button) {
        if (!button.canActionBePossiblyMade(controller)) {
            return;
        }
        var clone = button.cloneInto(menuContainer);
        GraphElementMainMenu.applyActionOnClick(
            clone
        );
        GraphElementMainMenu.defineTooltip(
            clone
        );
    }, false, getGraphElementButtons());
};
GraphElementMainMenu.reset = function () {
    initButtons();

    function initButtons() {
        GraphElementMainMenu.visitButtons(function (button) {
            GraphElementMainMenu.applyActionOnClick(button);
            setTitle(button);
            GraphElementMainMenu.defineTooltip(button);
        });

        function setTitle(button) {
            var title = I18n.i18next.t("menu-button." + button.getAction());

            if (button.hasCombinedKeyShortcut()) {
                title += UiUtils.isMacintosh() ? " (⌘" : " (ctrl+";
                title += button.getCombinedKeyShortcut() + ")";
            }
            button.getHtml().attr(
                "title", title
            );
        }
    }
};
GraphElementMainMenu.applyActionOnClick = function (button) {
    button.getHtml().on(
        "click",
        function (event) {
            event.stopPropagation();
            var button = GraphElementButton.fromHtml(
                $(this)
            );
            if (button.isDisabled()) {
                return;
            }
            var isInBubble = button.isInBubble();
            var controller = isInBubble ?
                button.getParentBubble().getController() :
                GraphElementMainMenu._getCurrentClickHandler(button);
            controller[
                button.getAction()
                ]();
            if (!isInBubble) {
                controller = GraphElementMainMenu._getCurrentClickHandler(button);
            }
            var ui = controller.getUi();
            if (button.isForGraphElements() && ui.length > 0) {
                GraphElementMainMenu.reviewButtonsVisibility(ui, controller);
            } else {
                GraphElementMainMenu.reviewButtonsVisibility();
            }
        }
    );
};
GraphElementMainMenu.defineTooltip = function (button, options) {
    preventNativeTooltip();
    button.getHtml().popoverLikeToolTip(options);

    function preventNativeTooltip() {
        button.getHtml().hover(
            function (event) {
                event.preventDefault();
            }
        );
    }
};
GraphElementMainMenu.getExpandAllButton = function () {
    return GraphElementMainMenu._getButtonHavingAction(
        "expandAll"
    );
};

GraphElementMainMenu._getButtonHavingAction = function (action) {
    return GraphElementButton.fromHtml(
        GraphElementMainMenu._getGraphElementMenu().find(
            "button[data-action=" + action + "]"
        )
    );
};
GraphElementMainMenu.visitGraphElementButtons = function (visitor, inverse) {
    return GraphElementMainMenu.visitButtons(
        visitor,
        inverse,
        getGraphElementButtons()
    );
};
GraphElementMainMenu.visitInLabelPossibleButtons = function (visitor, inverse) {
    return GraphElementMainMenu.visitButtons(
        visitor,
        inverse,
        getInLabelPossibleButtons()
    );
};
GraphElementMainMenu.visitButtons = function (visitor, inverse, buttonsHtml) {
    buttonsHtml = buttonsHtml || getButtonsHtml();
    if (inverse) {
        buttonsHtml = $(buttonsHtml.get().reverse());
    }
    buttonsHtml.each(function () {
        visitor(
            GraphElementButton.fromHtml(
                $(this)
            )
        );
    });
};

GraphElementMainMenu.onlyShowButtonsIfApplicable = function (controller, graphElement, buttonsHtml) {
    var nbVisibleButton = 0;
    GraphElementMainMenu.visitButtons(function (button) {
        if (button.isForWholeGraph()) {
            return GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable(
                button
            );
        }
        if (button.isForApp()) {
            return GraphElementMainMenu.showAppButtonOnlyIfApplicable(
                button
            );
        }
        button.changeIfGraphElementUiLeftOrRight(
            controller
        );
        if (button.showOnlyIfApplicable(
            controller,
            graphElement
        )) {
            nbVisibleButton++;
        }
    }, false, buttonsHtml);
    return nbVisibleButton;
};

GraphElementMainMenu.showWholeGraphButtonOnlyIfApplicable = function (button) {
    button.showOnlyIfApplicable(
        GraphDisplayer.getGraphMenuHandler()
    );
};

GraphElementMainMenu.showAppButtonOnlyIfApplicable = function (button) {
    button.showOnlyIfApplicable(
        GraphDisplayer.getAppController()
    );
};

GraphElementMainMenu.reviewButtonsVisibility = function (bubbles, controller) {
    controller = controller || GraphElementMainMenu._currentController;
    bubbles = bubbles || controller.getUi();
    GraphElementMainMenu.reviewOutOfBubbleButtonsDisplay(bubbles, controller);
    GraphElementMainMenu.reviewInBubbleButtonsDisplay(bubbles, controller);
    GraphElementMainMenu.reviewAppButtonsDisplay();
};

GraphElementMainMenu.reviewOutOfBubbleButtonsDisplay = function (bubbles, controller) {
    GraphElementMainMenu._currentController = controller;
    GraphElementMainMenu.onlyShowButtonsIfApplicable(
        controller,
        bubbles,
        getGraphElementButtons()
    );
};

GraphElementMainMenu.reviewInBubbleButtonsDisplay = function (bubble, controller) {
    GraphElementMainMenu._currentController = controller;
    GraphElementMainMenu.onlyShowButtonsIfApplicable(
        controller,
        bubble
    );
};

GraphElementMainMenu.reviewAppButtonsDisplay = function () {
    GraphElementMainMenu.onlyShowButtonsIfApplicable(
        GraphDisplayer.getGraphMenuHandler(),
        [],
        getGraphButtons()
    );
};

GraphElementMainMenu._getCurrentClickHandler = function (button) {
    if (button.isForWholeGraph()) {
        return GraphDisplayer.getGraphMenuHandler();
    }
    if (button.isForApp()) {
        return GraphDisplayer.getAppController();
    }
    return GraphElementMainMenu._currentController;
};

GraphElementMainMenu._getGraphElementMenu = function () {
    if (!_graphElementMenu || _graphElementMenu.length === 0) {
        _graphElementMenu = $("#graph-element-menu");
    }
    return _graphElementMenu;
};

GraphElementMainMenu._getGraphMenu = function () {
    if (!_graphMenu || _graphMenu.length === 0) {
        _graphMenu = $("#graph-menu");
    }
    return _graphMenu;
};

GraphElementMainMenu._getPossibleInLabelMenu = function () {
    if (!_possibleInLabelMenu || _possibleInLabelMenu.length === 0) {
        _possibleInLabelMenu = $("#in-label-btns");
    }
    return _possibleInLabelMenu;
};

EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function () {
    if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
        GraphElementMainMenu._getGraphElementMenu().addClass("hidden");
    }
});

export default GraphElementMainMenu;

function getButtonsHtml() {
    return GraphElementMainMenu._getGraphElementMenu().add(
        GraphElementMainMenu._getGraphMenu()
    ).find("button");
}

function getGraphElementButtons() {
    return GraphElementMainMenu._getGraphElementMenu().find("button");
}

function getGraphButtons() {
    return GraphElementMainMenu._getGraphMenu().find("button");
}

function getInLabelPossibleButtons() {
    return GraphElementMainMenu._getPossibleInLabelMenu().find("button");
}
