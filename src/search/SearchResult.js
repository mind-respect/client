/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'
import Icon from '@/Icon'
import ShareLevel from '@/vertex/ShareLevel'
import Vertex from '@/vertex/Vertex'
import Tag from "@/tag/Tag";

const api = {};
api.fromServerFormatArray = function (searchResultsServerFormat) {
    return searchResultsServerFormat.map((searchResult) => {
        return api.fromServerFormat(
            searchResult
        )
    })
};
api.fromServerFormat = function (searchResult) {
    switch (searchResult.type.toLowerCase()) {
        case GraphElementType.Relation:
        case GraphElementType.Edge :
            // var sourceVertex = Vertex.fromServerFormat(
            //         searchResult.edge.sourceVertex
            //     ),
            //     destinationVertex = Vertex.fromServerFormat(
            //         searchResult.edge.destinationVertex
            //     );
            return new SearchResult(
                GraphElement.fromServerFormat(searchResult.graphElement),
                GraphElementType.Relation,
                api._buildSomethingToDistinguish(
                    searchResult
                ),
                searchResult
            );
        case GraphElementType.Vertex :
            let vertex = Vertex.fromGraphElementServerFormat(searchResult.graphElement);
            vertex.setShareLevel(searchResult.shareLevel);
            if (searchResult.isPattern) {
                vertex.makePattern();
            }
            return new SearchResult(
                vertex,
                GraphElementType.Vertex,
                "",
                searchResult
            );
        case GraphElementType.Meta :
            let tag = Tag.fromGraphElementServerFormat(
                searchResult.graphElement
            );
            tag.setShareLevel(
                searchResult.shareLevel
            );
            tag.setNbReferences(
                searchResult.nbReferences
            );
            return new SearchResult(
                tag,
                GraphElementType.Meta,
                api._buildMetaSomethingToDistinguish(searchResult),
                searchResult
            );
    }
};
api._buildPropertySomethingToDistinguish = function (searchResult) {
    if (!searchResult.context) {
        return "";
    }
    return "<- " + searchResult.context[Object.keys(searchResult.context)];
};
api._buildMetaSomethingToDistinguish = function (searchResult) {
    if (!searchResult.context) {
        return "";
    }
    return searchResult.context.description === undefined ?
        api._buildSomethingToDistinguish(searchResult) : searchResult.context.description;
};

api._buildSomethingToDistinguish = function (searchResult) {
    if (!searchResult.context) {
        return "";
    }
    let contextLabels = [];
    Object.keys(searchResult.context).forEach(function (uri) {
        contextLabels.push(searchResult.context[uri]);
    });
    return contextLabels.join(", ");
};
api._buildEdgeSomethingToDistinguish = function (searchResult) {
    let contextValues = Object.values(searchResult.context);
    return contextValues[0] + "  " + contextValues[1];
};
api._buildSchemaSomethingToDistinguish = function (schema) {
    return api.formatRelationsName(
        api.removedEmptyAndDuplicateRelationsName(
            schema.getPropertiesName()
        )
    );
};
api.fromGraphElement = function (graphElement) {
    let somethingToDistinguish = graphElement.isEdge() ? [
        graphElement.getSourceVertex().getLabel(),
        graphElement.getDestinationVertex().getLabel()
    ].join(", ") : "";
    let context = {};
    if (graphElement.isVertex()) {
        [].concat(graphElement.getParentVertex()).concat(graphElement.getClosestChildVertices()).forEach((surroundVertex) => {
            context[surroundVertex.getUri()] = surroundVertex.getLabel();
        });
    }
    return new SearchResult(
        graphElement,
        graphElement.getGraphElementType(),
        somethingToDistinguish, {
            type: graphElement.getGraphElementType(),
            graphElementType: graphElement.getGraphElementType(),
            context: context,
            shareLevel: graphElement.getShareLevel(),
            colors: graphElement.getColors()
        }
    );
};
api.formatRelationsName = function (relationsName) {
    return relationsName.join(", ");
};
api.removedEmptyAndDuplicateRelationsName = function (relationsName) {
    return relationsName.filter(
        function (relationName, position) {
            return relationName !== "" &&
                relationsName.indexOf(relationName) === position;
        }
    );
};

function SearchResult(graphElement, graphElementType, somethingToDistinguish, serverFormat) {
    this.graphElement = graphElement;
    this.graphElementType = graphElementType;
    this.somethingToDistinguish = somethingToDistinguish;
    this.serverFormat = serverFormat;
    this.context = this.serverFormat.context;
}

SearchResult.prototype.getGraphElement = function () {
    return this.graphElement;
};

SearchResult.prototype.getGraphElementType = function () {
    return this.graphElementType;
};

SearchResult.prototype.getNbVisits = function () {
    return this.serverFormat.nbVisits || 0;
};

SearchResult.prototype.getNbRerences = function () {
    return this.serverFormat.nbReferences || 0;
};

SearchResult.prototype.is = function (graphElementType) {
    return graphElementType === this.getGraphElementType();
};

SearchResult.prototype.getIcon = function () {
    return Icon.getForSearchResult(this);
};
SearchResult.prototype.isTagFromWikipedia = function () {
    return GraphElementType.Meta === this.getGraphElementType() && this.getGraphElement().isFromWikidata();
};
SearchResult.prototype.getShareLevel = function () {
    return this.serverFormat.shareLevel || ShareLevel.PRIVATE;
};
export default api;
