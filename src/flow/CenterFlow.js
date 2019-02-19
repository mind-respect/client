/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import jquery from 'jquery'
import UiUtils from '@/UiUtils'
import UserService from '@/service/UserService'
import EventBus from '@/EventBus'
import SelectionHandler from '@/SelectionHandler'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphDisplayerFactory from '@/graph/GraphDisplayerFactory'
import MindMapInfo from '@/MindMapInfo'
import GraphElementMainMenu from '@/graph-element/GraphElementMainMenu'
import GraphUi from '@/graph/GraphUi'
import IdUri from '@/IdUri'
import BubbleFactory from '@/bubble/BubbleFactory'
import IdentificationMenu from '@/identifier/IdentificationMenu'
import ImageMenu from '@/identifier/ImageMenu'
import GraphElementUi from '@/graph-element/GraphElementUi'
import AppController from '@/AppController'

const api = {};
api.enterConnectedHomeFlow = function () {
    setupMindMap(false, true);
};
api.enterMindMapForAuthenticatedUser = function () {
    setupMindMap(false, false);
};
api.enterMindMapForAnonymousUser = function () {
    setupMindMap(true, false);
};
EventBus.subscribe(
    '/event/ui/user/get_authenticated/success',
    function (event, authenticatedUser) {
        var isADevUser = [
            "",
            ""
        ].indexOf(authenticatedUser.user_name) !== -1;
        var devOnlyHtml = $(".dev-only");
        if (isADevUser) {
            devOnlyHtml.removeClass("hidden");
        } else {
            devOnlyHtml.remove();
        }
    }
);
EventBus.subscribe(
    '/event/ui/graph/drawing_info/updated/',
    function (event, centralBubbleUri) {
        SelectionHandler.removeAll();
        GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
            EventBus.publish(
                '/event/ui/vertex/visit_after_graph_drawn',
                vertex
            );
        });
        GraphDisplayer.getGroupRelationSelector().visitAll(function (groupRelationUi) {
            EventBus.publish(
                '/event/ui/group_relation/visit_after_graph_drawn',
                groupRelationUi
            );
        });
        var centralBubble = BubbleFactory.getGraphElementFromUri(
            centralBubbleUri
        );
        document.title = centralBubble.getTextOrDefault() + " | MindRespect";
        if (MindMapInfo.isViewOnly()) {
            GraphUi.getDrawnGraph().find(".bubble").addClass("not-editable");
            $("body").addClass("not-editable");
        }
        if (centralBubble.isSchema() && !MindMapInfo.isViewOnly()) {
            GraphUi.showSchemaInstructions();
        } else {
            GraphUi.hideSchemaInstructions();
        }
        centralBubble.setAsCentral();
        if (GraphElementUi.getCenterVertexOrSchema().isVertex()) {
            var backgroundColor = centralBubble.getModel().getColors().background;
            if (backgroundColor) {
                GraphUi.changeBackgroundColor(backgroundColor);
            } else {
                GraphUi.resetBackGroundColor();
            }
        } else {
            GraphUi.resetBackGroundColor();
        }
        GraphUi.getDrawnGraph().on(
            "mousedown",
            function (event) {
                var whatGotClicked = $(event.target);
                var clickedOnOtherInstancesButton = whatGotClicked.closest(".visit-other-instances").length === 1;
                if (clickedOnOtherInstancesButton) {
                    return;
                }
                var clickedOnSomethingInsideABubble = whatGotClicked.closest(".bubble").length === 1;
                if (clickedOnSomethingInsideABubble) {
                    return;
                }
                $("#font-picker").addClass('hidden');
                GraphUi.removePopovers();
                SelectionHandler.getSelectedBubbles().forEach(function (bubble) {
                    bubble.hideMenu();
                });
            }
        );
        GraphUi.refreshWidth();
        $("body").removeClass(
            "hidden"
        ).addClass("mind-map-flow");

        GraphUi.initDragScroll();
        GraphUi.enableDragScroll();
        SelectionHandler.setToSingleVertex(centralBubble);
        AppController.zoomOut();
        EventBus.publish('/event/ui/graph/drawn');
        centralBubble.scrollTo();
        GraphElementMainMenu.reviewAppButtonsDisplay();
        // html2canvas(document.body).then(function(canvas) {
        //     document.body.innerHTML = canvas;
        // });
        //if (window.callPhantom === 'function') {
        //    window.callPhantom('takeShot');
        //}
    }
);

function setupMindMap(isAnonymous, isTagCloudFlow) {
    // $("body").addClass("no-scroll");
    MindMapInfo.setIsAnonymous(isAnonymous);
    MindMapInfo.setIsTagCloudFlow(isTagCloudFlow);
    handleHistoryBrowse();
    if (isAnonymous) {
        loadGraph();
    } else {
        UserService.authenticatedUser(function () {
            MindMapInfo.defineIsViewOnly();
            MindMapInfo.defineIsFriend().then(loadGraph);
        });
    }

    function loadGraph() {
        if (isTagCloudFlow) {
            // ConnectedHomeFlow.enter();
            return;
        }
        // Flow.showOnlyFlow("mindMap");
        GraphDisplayer.displayForBubbleWithUri(
            MindMapInfo.getCenterBubbleUri()
        );
        GraphElementMainMenu._getGraphElementMenu().removeClass("hidden");
        GraphElementMainMenu.reset();
        IdentificationMenu.setup();
        GraphElementMainMenu.reviewAppButtonsDisplay();
        ImageMenu.setup();
    }
}

function handleHistoryBrowse() {
    $(window).on("popstate", function () {
        GraphDisplayer.displayForBubbleWithUri(
            MindMapInfo.getCenterBubbleUri()
        );
    });
}
export default api;
