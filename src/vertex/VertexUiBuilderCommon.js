/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import UiUtils from '@/UiUtils'
import Identification from '@/identifier/Identification'
import UserMapAutocompleteProvider from '@/search/provider/UserMapAutocompleteProvider'
import WikidataAutocompleteProvider from '@/search/provider/WikidataAutocompleteProvider'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import MindMapInfo from '@/MindMapInfo'
import SelectionHandler from '@/SelectionHandler'
import SchemaSuggestion from '@/schema/SchemaSuggestion'
import GraphElementUiBuilder from '@/graph-element/GraphElementUiBuilder'
import BubbleFactory from '@/bubble/BubbleFactory'
// "jquery.triple_brain.search",
import JquerySaferHtml from '@/jquery/jquery.safer-html'

const api = {};
api.applyAutoCompleteIdentificationToLabelInput = function (input) {
    var vertex = BubbleFactory.fromSubHtml(input);
    input.mrAutocomplete({
        select: function (event, ui) {
            event.preventDefault();
            if (event.keyCode === 13) {
                return;
            }
            api._labelAutocompleteSelectHandler(
                BubbleFactory.fromSubHtml(
                    $(this)
                ),
                ui.item
            );
        },
        resultsProviders: [
            UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas(
                vertex,
                {
                    noFilter: true
                }
            ),
            WikidataAutocompleteProvider.build()
        ]
    });
};

api._labelAutocompleteSelectHandler = function (bubble, searchResult) {
    var identifier = Identification.fromSearchResult(
        searchResult
    );
    if (bubble.isSuggestion()) {
        bubble.whenItIntegrates().then(handle);
    } else {
        handle(bubble);
    }

    function handle(bubble) {
        SchemaSuggestion.addSchemaSuggestionsIfApplicable(
            bubble,
            searchResult.uri
        );
        bubble.buildAfterAutocompleteMenu(identifier);
    }
};

api.addRelevantButtonsInMenu = function (menuContainer, vertex) {
    GraphElementMainMenu.addRelevantButtonsInMenu(
        menuContainer,
        vertex.getController()
    );
};
api.buildLabelHtml = function (vertex, inContentContainer, uiSelector, serverFacade) {
    var label = $(
        "<div class='bubble-label'>"
    ).saferHtml(
        serverFacade.getLabel().trim()
    ).attr(
        "data-placeholder",
        uiSelector.getWhenEmptyLabel()
    ).appendTo(inContentContainer);
    label.html(label.text());
    GraphElementUiBuilder.setUpLabel(label);
    api.applyAutoCompleteIdentificationToLabelInput(
        label
    );
    return label;
};
api.buildInsideBubbleContainer = function (html) {
    var wrapper = $(
        "<div class='in-bubble-content-wrapper'>"
        ),
        container = $(
            "<div class='in-bubble-content'>"
        );
    wrapper.append(container).appendTo(html);
    return container;
};
api.setUpClickBehavior = function (html, isViewOnly) {
    html.on(
        "mousedown",
        clickHandler
    );
    if (!MindMapInfo.isViewOnly() && !isViewOnly) {
        html.on(
            "dblclick",
            dblClickHandler
        );
    }
};
api.buildInLabelButtons = function (vertex) {
    var inLabelButtons = GraphElementUiBuilder.buildInLabelButtons(vertex);
    vertex.getLabel().before(
        inLabelButtons
    );
};
api.moveInLabelButtonsContainerIfIsToTheLeft = function (vertex) {
    if (vertex.isToTheLeft()) {
        var noteButton = vertex.getInLabelButtonsContainer();
        noteButton.next(".bubble-label").after(noteButton);
    }
};
export default api;

function clickHandler(event) {
    event.stopPropagation();
    var vertex = BubbleFactory.fromSubHtml(
        $(this)
    );
    if (UiUtils.isMacintosh() ? event.metaKey : event.ctrlKey) {
        if (vertex.isSelected()) {
            SelectionHandler.removeVertex(vertex);
        } else {
            SelectionHandler.addVertex(vertex);
        }
    } else {
        SelectionHandler.setToSingleVertex(
            vertex
        );
    }
}

function dblClickHandler(event) {
    event.stopPropagation();
    var bubble = BubbleFactory.fromSubHtml(
        $(this)
    );
    if (bubble.isInEditMode()) {
        return;
    }
    bubble.focus(
        event
    );
}
