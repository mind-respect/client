/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import GraphModalMenu from '@/graph/GraphModalMenu'
import EventBus from '@/EventBus'
import UserMapAutocompleteProvider from '@/search/provider/UserMapAutocompleteProvider'
import GraphService from '@/graph/GraphService'
import GraphCompare from '@/compare/GraphCompare'
import IdUri from '@/IdUri'
import SubGraph from '@/graph/SubGraph'
import GraphElementUi from '@/graph-element/GraphElementUi'

const api = {};
var compareModal;
api.enter = function () {
    compareModal = GraphModalMenu.forModalId(
        "compare-modal"
    ).show();
    getSearchInput().empty();
};
api._enterComparisonWithBubbleUri = function (uri) {
    GraphService.getForCentralVertexUriAtDepth(
        uri,
        GraphElementUi.getCenterBubble().getDeepestChildDistance()
    ).then(function (otherGraph) {
        api._enterComparisonWithGraphAndCenterUri(
            SubGraph.fromServerFormat(otherGraph),
            uri
        );
    });
    getLoadingSection().removeClass("hidden");
};
api._enterComparisonWithGraphAndCenterUri = function (graph, centerUri) {
    getCompareFlowWarning().removeClass("hidden");
    getLoadingSection().addClass("hidden");
    var comparison = GraphCompare.withOtherGraph(
        graph
    );
    comparison.show();
    compareModal.hide();
    var username = IdUri.usernameFromUri(
        graph.getAnyUri()
    );
    getOtherUserBubbleLink().attr(
        "href",
        IdUri.htmlUrlForBubbleUri(
            centerUri
        )
    );
    getUserProfileLink().text(
        username
    ).attr(
        "href",
        IdUri.allCentralUrlForUsername(username)
    );
    getQuitFlowButton().click(function (event) {
        event.preventDefault();
        api._quit();
    });
};
api._quit = function () {
    GraphElementUi.visitAll(function (graphElementUi) {
        graphElementUi.quitComparison();
    });
    getCompareFlowWarning().addClass("hidden");
};
EventBus.subscribe("/event/ui/graph/drawn", setup);

function setup() {
    setupDefaultCompare();
    setupSearch();
}

function setupDefaultCompare() {
    var centerVertex = GraphElementUi.getCenterVertexOrSchema();
    var centerVertexGraphElementIdentifier = centerVertex.getModel().getFirstIdentificationToAGraphElement();
    if (!centerVertexGraphElementIdentifier) {
        return;
    }
    getCompareWithDefaultButton().click(function (event) {
        event.preventDefault();
        api._enterComparisonWithBubbleUri(
            centerVertexGraphElementIdentifier.getExternalResourceUri()
        );
    });
    getDefaultCompareUserContainer().text(
        IdUri.usernameFromUri(
            centerVertexGraphElementIdentifier.getExternalResourceUri()
        )
    );
    getDefaultLabelContainer().text(
        centerVertexGraphElementIdentifier.getLabel()
    );
    getCompareWithDefaultSection().removeClass(
        "hidden"
    );
}

function setupSearch() {
    getSearchInput().mrAutocomplete({
        select: function (event, ui) {
            api._enterComparisonWithBubbleUri(ui.item.uri);
        },
        resultsProviders: [
            UserMapAutocompleteProvider.toFetchPublicAndUserVerticesExcept(
                GraphElementUi.getCenterVertexOrSchema()
            )
        ]
    });
}

function getCompareWithDefaultSection() {
    return $("#compare-with-default-section");
}

function getLoadingSection() {
    return $("#compare-loading");
}

function getSearchInput() {
    return $("#compare-search-input");
}

function getCompareFlowWarning() {
    return $("#compare-flow-warning");
}

function getUserProfileLink() {
    return getCompareFlowWarning().find(
        ".user"
    );
}

function getOtherUserBubbleLink() {
    return getCompareFlowWarning().find(
        ".other-user-bubble"
    );
}

function getQuitFlowButton() {
    return getCompareFlowWarning().find(
        ".quit-flow"
    );
}

function getCompareWithDefaultButton() {
    return getCompareWithDefaultSection().find("> a");
}

function getDefaultLabelContainer() {
    return getCompareWithDefaultSection().find(
        ".default-compare-label"
    );
}

function getDefaultCompareUserContainer() {
    return getCompareWithDefaultSection().find(
        ".default-compare-user"
    );
}

export default api;
