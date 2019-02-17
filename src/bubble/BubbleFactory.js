/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

const api = {};
api.fromHtml = function (html) {
    var uiObjectClass = api.getUiObjectClassFromHtml(html);
    var uiFacade = uiObjectClass.withHtml(html);
    if (undefined === uiFacade) {
        /*
         todo this case should not happen but it did using npm test only somehow
         should review the cache system
         also the builder *html_builder system
         */
        uiFacade = uiObjectClass.createFromHtmlAndUri(html, html.data("uri"));
    }
    return uiFacade;
};
api.getUiObjectClassFromHtml = function (html) {
    if (html.hasClass("vertex")) {
        if (html.hasClass("suggestion")) {
            return GraphDisplayer.getVertexSuggestionSelector();
        } else if (html.hasClass("schema")) {
            return GraphDisplayer.getSchemaSelector();
        } else if (html.hasClass("meta")) {
            return GraphDisplayer.getMetaUiSelector();
        } else if (html.hasClass("group-vertex-under-meta")) {
            return GraphDisplayer.getGroupVertexUnderMetaUiSelector();
        } else {
            return GraphDisplayer.getVertexSelector();
        }
    } else if (html.hasClass("relation")) {
        if (html.hasClass("suggestion")) {
            return GraphDisplayer.getRelationSuggestionSelector();
        } else if (html.hasClass("meta-relation")) {
            return GraphDisplayer.getMetaUiRelationSelector();
        } else if (html.hasClass("property")) {
            return GraphDisplayer.getPropertySelector();
        } else if (html.hasClass("group-relation")) {
            return GraphDisplayer.getGroupRelationSelector();
        } else {
            return GraphDisplayer.getEdgeSelector();
        }
    }
};
api.fromSubHtml = function (html) {
    var bubbleHtml = html.closest(".bubble");
    return bubbleHtml.length ? api.fromHtml(
        bubbleHtml
    ) : false;
};
api.getGraphElementFromUri = function (uri) {
    return api.getSelectorFromType(
        IdUri.getGraphElementTypeFromUri(uri)
    ).withUri(uri)[0];
};
api.getSelectorFromType = function (type) {
    switch (type) {
        case GraphElementType.Vertex : {
            return GraphDisplayer.getVertexSelector();
        }
        case GraphElementType.Relation : {
            return GraphDisplayer.getEdgeSelector();
        }
        case GraphElementType.GroupRelation : {
            return GraphDisplayer.getGroupRelationSelector();
        }
        case GraphElementType.Schema : {
            return GraphDisplayer.getSchemaSelector();
        }
        case GraphElementType.Property : {
            return GraphDisplayer.getPropertySelector();
        }
        case GraphElementType.VertexSuggestion : {
            return GraphDisplayer.getVertexSuggestionSelector();
        }
        case GraphElementType.RelationSuggestion : {
            return GraphDisplayer.getRelationSuggestionSelector();
        }
        case GraphElementType.Meta : {
            return GraphDisplayer.getMetaUiSelector();
        }
    }
};
export default api;
