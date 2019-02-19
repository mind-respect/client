/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphUi from '@/graph/GraphUi'

const api = {};
api.setupAutoCompleteSuggestionZIndex = function (input) {
    //http://stackoverflow.com/a/17178927/541493
    input.autocomplete("widget").insertAfter(
        input.closest(".ui-dialog").parent()
    );
};
api.makeForMenuContentAndGraphElement = function (menuContent, graphElement, extraOptions, titlePrefix) {
    if (titlePrefix === undefined) {
        titlePrefix = "";
    }
    var dialogClass = "graph-element-menu",
        horizontalPosition = getHorizontalPosition(),
        options = {
            position: {
                of: graphElement.getHtml(),
                my: horizontalPosition.my + " center",
                at: horizontalPosition.at + " right top",
                collision: 'none'
            },
            dialogClass: dialogClass,
            title: titlePrefix + graphElement.getTextOrDefault(),
            close: function () {
                $(this).dialog("destroy").remove();
            },
            draggable: false
        };
    if (extraOptions !== undefined) {
        if (extraOptions.dialogClass !== undefined) {
            extraOptions.dialogClass = extraOptions.dialogClass +
                " " + dialogClass;
        }
        options = $.extend(
            options,
            extraOptions
        );
    }
    menuContent.addClass(
        "html-content"
    ).i18n().dialog(
        options
    ).on("dialogclose", function () {
        GraphUi.enableDragScroll();
    });
    GraphUi.disableDragScroll();
    menuContent.closest(".graph-element-menu").centerOnScreen();

    function getHorizontalPosition() {
        var positionDialogToRight = {
                "my": "left",
                "at": "right"
            },
            positionDialogToLeft = {
                "my": "right",
                "at": "left"
            };
        if (!GraphDisplayer.canGetIsToTheLeft()) {
            return positionDialogToRight;
        }
        return graphElement.isToTheLeft() ?
            positionDialogToLeft : positionDialogToRight;
    }
};
api.fromContentComponent = function (component) {
    return new GraphElementMenu(
        component.closest(".html-content")
    );
};
export default api;

function GraphElementMenu(htmlContent) {
    this.close = function () {
        htmlContent.dialog("close");
    };
}
