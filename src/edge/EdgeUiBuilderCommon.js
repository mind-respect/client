/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import UiUtils from '@/UiUtils'
import MindMapInfo from '@/MindMapInfo'
import SelectionHandler from '@/SelectionHandler'
import Identification from '@/identifier/Identification'
import UserMapAutocompleteProvider from '@/search/provider/UserMapAutocompleteProvider'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import BubbleFactory from '@/bubble/BubbleFactory'

const api = {};
api.moveInLabelButtonsContainerIfIsToTheLeft = function (edge) {
    if (edge.isToTheLeft()) {
        var noteButton = edge.getInLabelButtonsContainer();
        edge.getLabelAndButtonsContainer().append(noteButton);
    }
};
api.buildLabel = function (edgeUi, text, whenEmptyLabel, isViewOnly) {
    var edgeHtml = edgeUi.getHtml();
    if (isViewOnly) {
        edgeUi.makeLabelNonEditable();
    }
    var bubbleContentContainer = edgeHtml.find(".in-bubble-content");
    var labelContainer = $(
        "<div class='label-container'>"
    ).appendTo(bubbleContentContainer).on(
        "mousedown",
        function (event) {
            event.stopPropagation();
            var edge = BubbleFactory.fromSubHtml(
                $(this)
            );
            if (UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey) {
                if (edge.isSelected()) {
                    SelectionHandler.removeRelation(edge);
                } else {
                    SelectionHandler.addRelation(edge);
                }
            } else {
                SelectionHandler.setToSingleRelation(edge);
            }
        }
    );
    var labelAndButtons = $(
        "<div class='label label-info label-and-buttons'>"
    );
    var label = $(
        "<div class='bubble-label'>"
    ).text(
        text
    ).attr(
        "data-placeholder",
        whenEmptyLabel
    ).appendTo(
        labelAndButtons
    ).mrAutocomplete({
            select: function (event, ui) {
                if (event.keyCode === 13) {
                    return;
                }
                var edge = BubbleFactory.fromSubHtml(
                    $(this)
                );
                var identification = Identification.fromSearchResult(
                    ui.item
                ).makeSameAs();
                edge.getController().addIdentification(
                    identification
                );
                edge.getController().setLabel(
                    ui.item.label
                );
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchRelationsForIdentification(
                    BubbleFactory.fromHtml(
                        edgeHtml
                    )
                )
            ]
        }
    );
    labelAndButtons.appendTo(labelContainer);
    if (!MindMapInfo.isViewOnly() && !isViewOnly) {
        label.on(
            "dblclick",
            function (event) {
                event.stopPropagation();
                var edge = BubbleFactory.fromSubHtml(
                    $(this)
                );
                if (edge.isInEditMode()) {
                    return;
                }
                edge.deselect();
                edge.hideMenu();
                edge.focus();
            }
        );
    }
    GraphElementUiBuilder.setUpLabel(label);
    return label;
};
api.buildInLabelButtons = function (edge) {
    var inLabelButtons = GraphElementUiBuilder.buildInLabelButtons(edge);
    edge.getLabelAndButtonsContainer().prepend(
        inLabelButtons
    );
};
export default api;
