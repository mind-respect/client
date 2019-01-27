/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import UserService from '@/service/UserService'
import GraphElementType from '@/graph-element/GraphElementType'
// "jquery.url"
const IdUri = {
    encodeUri: function (uri) {
        return encodeURIComponent(
            uri
        );
    },
    decodeUri: function (uri) {
        return decodeURIComponent(
            uri
        );
    },
    usernameFromUri: function (uri) {
        var segments = $.url(uri).segment();
        return segments[2];
    },
    currentUsernameInUrl: function () {
        return $.url(
            window.location.href
        ).segment()[1];
    },
    allCentralUrlForUsername: function (username) {
        return "/user/" + username;
    },
    encodedUriFromGraphElementId: function (id) {
        return encodeURIComponent(
            IdUri.uriFromGraphElementId(id)
        );
    },
    isSchemaUri: function (uri) {
        return uri.indexOf("/schema/") !== -1 &&
            uri.indexOf("/property") === -1;
    },
    isPropertyUri: function (uri) {
        return uri.indexOf("/property") !== -1;
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
    schemaUriOfProperty: function (propertyUri) {
        return propertyUri.substr(
            0,
            propertyUri.indexOf("/property")
        );
    },
    uriFromGraphElementId: function (id) {
        var username = UserService.authenticatedUserInCache().user_name;
        return "/users" + username + "/" + id;
    },
    resourceUriFromAjaxResponse: function (response) {
        return IdUri.removeDomainNameFromGraphElementUri(
            response.getResponseHeader("Location")
        );
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
    generateUuid: function () {
        // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
        var buf = new Uint16Array(8);
        crypto.getRandomValues(buf);
        var S4 = function (num) {
            var ret = num.toString(16);
            while (ret.length < 4) {
                ret = "0" + ret;
            }
            return ret;
        };
        return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
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
    hostNameOfUri: function (uri) {
        return $.url(
            uri
        ).attr("host");
    },
    isUriOfAGraphElement: function (uri) {
        return uri.indexOf("/service/users") === 0;
    },
    _getUsernameInUrl: function () {
        return IdUri._getUrlParamAtIndex(1);
    },
    _getGraphElementShortIdFromUrl: function () {
        return IdUri._getUrlParamAtIndex(4);
    },
    _hasUsernameInUrl: function () {
        return IdUri._hasParamAtIndex(1);
    },
    _hasGraphElementShortIdInUrl: function () {
        return IdUri._hasParamAtIndex(4);
    },
    getGraphElementUriInUrl: function () {
        if (!IdUri._hasUsernameInUrl() || !IdUri._hasGraphElementShortIdInUrl()) {
            return undefined;
        }
        return "/service/users/" + IdUri._getUsernameInUrl() +
            "/graph/" + window.graphElementTypeForBublGuru + "/" + IdUri._getGraphElementShortIdFromUrl();
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
    },
    _hasParamAtIndex: function (index) {
        return decodeURIComponent(
            window.location.pathname
        ).split("/").length >= index + 1;
    },
    _getUrlParamAtIndex: function (index) {
        return decodeURIComponent(
            window.location.pathname
        ).split("/")[index + 1];
    }
};

export default IdUri;
