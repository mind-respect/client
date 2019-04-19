/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import EventBus from '@/EventBus'
import MindMapInfo from '@/MindMapInfo'
import IdUri from '@/IdUri'
import GraphDisplayer from '@/graph/GraphDisplayer'
import ForkService from '@/compare/ForkService'
import IdentifiedToService from '@/identifier/IdentifiedToService'
import SubGraph from '@/graph/SubGraph'
import Identification from '@/identifier/Identification'

const api = {};
let otherUserMenu;
EventBus.subscribe(
    '/event/ui/graph/drawing_info/updated/',
    function () {
        var shouldDisplay = !MindMapInfo.isAnonymous() &&
            MindMapInfo.isViewOnly() &&
            MindMapInfo.isCenterBubbleUriDefinedInUrl() &&
            !MindMapInfo.isSchemaMode();
        if (shouldDisplay) {
            setup();
            getOtherUserMenu().removeClass("hidden");
        }
    }
);

function setup() {
    setUsername();
    setupCopyLink();
}

function setUsername() {
    var username = IdUri.usernameFromUri(
        IdUri.getGraphElementUriInUrl()
    );
    getUsernameLink().text(
        username
    ).attr(
        "href",
        IdUri.allCentralUrlForUsername(username)
    );
}

function setupCopyLink() {
    getCopyLink().click(handleClick);

    function handleClick(event) {
        event.preventDefault();
        $(this).off("click", handleClick);
        var centralVertexAsIdentifier = Identification.withUri(
            GraphElementUi.getCenterVertexOrSchema().getUri()
        );
        checkIfAlreadyForked(
            centralVertexAsIdentifier
        ).then(function (isForked, forkUri) {
            if (isForked) {
                //todo eventually change window.location to GraphDisplayer.displayUsingCentralBubbleUri(
                window.location = IdUri.htmlUrlForBubbleUri(
                    forkUri
                );
                return $.Deferred().reject();
            }
            return fork();
        }).then(function () {
            return IdentifiedTo.getForIdentification(
                centralVertexAsIdentifier
            );
        }).then(function (results) {
            //todo eventually change window.location to GraphDisplayer.displayUsingCentralBubbleUri(
            window.location = IdUri.htmlUrlForBubbleUri(
                results[0].getGraphElement().getUri()
            );
        });
    }

    function checkIfAlreadyForked(centralVertexAsIdentifier) {
        var deferred = $.Deferred();
        IdentifiedTo.getForIdentification(
            centralVertexAsIdentifier
        ).then(function (results) {
            var isForked = results.length > 0;
            var forkUri;
            if (isForked) {
                forkUri = results[0].getGraphElement().getUri();
            }
            deferred.resolve(
                isForked,
                forkUri
            );
        });
        return deferred.promise();
    }

    function fork() {
        return ForkService.fork(
            SubGraph.buildServerFormat()
        );
    }
}

function getOtherUserMenu() {
    if (otherUserMenu === undefined) {
        otherUserMenu = $("#other-user-menu");
    }
    return otherUserMenu;
}

function getUsernameLink() {
    return getOtherUserMenu().find(
        ".username"
    );
}

function getCopyLink() {
    return getOtherUserMenu().find(
        ".copy"
    );
}

export default api;
