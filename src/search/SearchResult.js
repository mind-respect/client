/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from '@/graph-element/GraphElement'
import GraphElementType from '@/graph-element/GraphElementType'
import Icon from '@/Icon'

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
            let vertex = GraphElement.fromServerFormat(searchResult.graphElement);
            return new SearchResult(
                vertex,
                GraphElementType.Vertex,
                "",
                searchResult
            );
        case GraphElementType.Meta :
            let identifierAsGraphElement = GraphElement.fromServerFormat(
                searchResult.graphElement
            );
            let identifier = identifierAsGraphElement.getIdentifiers()[0];
            let graphElement = identifier === undefined ? identifierAsGraphElement : identifier;
            return new SearchResult(
                graphElement,
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
api.forGraphElementAndItsType = function (graphElement, graphElementType) {
    return new SearchResult(
        graphElement,
        graphElementType
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

SearchResult.prototype.getDeepGraphElementType = function () {
    return this.getGraphElementType();
};

SearchResult.prototype.getNumberOfReferences = function () {
    return GraphElementType.Meta === this.getGraphElementType() ?
        this.graphElement.getNbReferences() : 0;
};

SearchResult.prototype.getNbVisits = function () {
    return this.serverFormat.nbVisits;
};

SearchResult.prototype.is = function (graphElementType) {
    return graphElementType === this.getGraphElementType();
};
SearchResult.prototype.getSomethingToDistinguish = function () {
    return this.somethingToDistinguish;
};
SearchResult.prototype.getIcon = function () {
    return Icon.getForSearchResult(this);
};
SearchResult.prototype.isTagFromWikipedia = function () {
    return GraphElementType.Meta === this.getGraphElementType() && this.getGraphElement().isFromWikidata();
};
export default api;
