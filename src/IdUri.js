/*
 * Copyright Vincent Blouin under the GPL License version 3
` */

import UserService from '@/service/UserService'
import GraphElementType from '@/graph-element/GraphElementType'
import Router from '@/router';

const IdUri = {
    uuid: function () {
        // https://stackoverflow.com/a/2117523
        return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    },
    currentUsernameInUrl: function () {
        return Router.history.current.params.username;
    },
    isSchemaUri: function (uri) {
        return uri.indexOf("/schema/") !== -1 &&
            uri.indexOf("/property") === -1;
    },
    isEdgeUri: function (uri) {
        return GraphElementType.Relation === IdUri.getGraphElementTypeFromUri(
            uri
        );
    },
    isPropertyUri: function (uri) {
        return GraphElementType.Property === IdUri.getGraphElementTypeFromUri(
            uri
        );
    },
    isVertexUri: function (uri) {
        return GraphElementType.Vertex === IdUri.getGraphElementTypeFromUri(
            uri
        );
    },
    isMetaUri: function (uri) {
        return GraphElementType.Meta === IdUri.getGraphElementTypeFromUri(
            uri
        );
    },
    isGroupRelationUri: function (uri) {
        return "" === IdUri.getGraphElementTypeFromUri(
            uri
        );
    },
    schemaUriOfProperty: function (propertyUri) {
        return propertyUri.substr(
            0,
            propertyUri.indexOf("/property")
        );
    },
    uriFromGraphElementId: function (id) {
        let username = UserService.authenticatedUserInCache().user_name;
        return "/users" + username + "/" + id;
    },
    vertexBaseUri: function () {
        return UserService.currentUserUri() + "/graph/vertex";
    },
    edgeBaseUri: function () {
        return UserService.currentUserUri() + "/graph/edge";
    },
    tagBaseUri: function () {
        return UserService.currentUserUri() + "/graph/identification";
    },
    removeDomainNameFromGraphElementUri: function (uri) {
        return uri.substr(
            uri.indexOf("/service")
        );
    },
    elementIdFromUri: function (uri) {
        return uri.substr(
            uri.lastIndexOf("/") + 1
        );
    },
    isGraphElementUriOwnedByCurrentUser: function (uri) {
        return UserService.authenticatedUserInCache().user_name ===
            IdUri.getOwnerFromUri(uri);
    },
    getOwnerFromUri: function (uri) {
        return uri.substring(
            uri.indexOf("/users") + 7,
            uri.indexOf("/graph")
        );
    },
    convertGraphElementUriToNonOwnedUri: function (uri) {
        var end = "schema" === IdUri.getGraphElementTypeFromUri(uri) ?
            "" : "/surround_graph";
        return "/service/users/" +
            IdUri.getOwnerFromUri(uri) +
            "/non_owned/" +
            IdUri.getGraphElementTypeFromUri(uri) + "/" +
            IdUri.getGraphElementShortIdFromUri(uri) +
            end;
    },
    getGraphElementTypeFromUri: function (uri) {
        uri = uri.substr(
            0, uri.lastIndexOf("/")
        );
        return GraphElementType.fromString(
            uri.substr(
                uri.lastIndexOf("/") + 1
            )
        );
    },
    getGraphElementShortIdFromUri: function (uri) {
        return uri.substring(
            uri.lastIndexOf("/") + 1
        );
    },
    isUriOfAGraphElement: function (uri) {
        return uri.indexOf("/service/users") === 0;
    },

    _hasUsernameInUrl: function () {
        return Router.history.current.params.username !== undefined;
    },
    _hasGraphElementShortIdInUrl: function () {
        return Router.history.current.params.centerUri;
    },
    getGraphElementUriInUrl: function () {
        if (!IdUri._hasUsernameInUrl() || !IdUri._hasGraphElementShortIdInUrl()) {
            return undefined;
        }
        return "/service/users/" + Router.history.current.params.username +
            "/graph/" + Router.history.current.params.graphElementType + "/" + Router.history.current.params.centerUri;
    },
    absoluteUrlForBubbleUri: function (graphElementUri) {
        return window.location.protocol + "//" + window.location.host + IdUri.htmlUrlForBubbleUri(graphElementUri);
    },
    htmlUrlForBubbleUri: function (graphElementUri) {
        if (IdUri.isPropertyUri(graphElementUri)) {
            graphElementUri = IdUri.schemaUriOfProperty(graphElementUri);
        }
        return graphElementUri.replace(
            "/service/users",
            "/user"
        );
    }
};

IdUri.IdUri = function (uri) {
    this.uri = uri;
};

IdUri.IdUri.prototype.url = function () {
    return IdUri.htmlUrlForBubbleUri(this.uri);
};

IdUri.IdUri.prototype.absoluteUrl = function () {
    return IdUri.absoluteUrlForBubbleUri(this.uri);
};

IdUri.IdUri.prototype.getGraphElementShortId = IdUri.IdUri.prototype.getGraphElementShortIdFromUri = function () {
    return IdUri.getGraphElementShortIdFromUri(this.uri);
};

IdUri.IdUri.prototype.absoluteUrl = function () {
    return window.location.origin + this.url();
};

IdUri.IdUri.prototype.withoutId = function () {
    return this.uri.substr(
        0,
        this.uri.lastIndexOf("/")
    );
};

IdUri.IdUri.prototype.getOwner = function () {
    return IdUri.getOwnerFromUri(this.uri);
};

IdUri.IdUri.prototype.getGraphElementType = function () {
    return IdUri.getGraphElementTypeFromUri(this.uri);
};

export default IdUri;
