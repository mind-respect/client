/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import Identification from '@/identifier/Identification'
import IdUri from '@/IdUri'
import Color from '@/Color'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementType from '@/graph-element/GraphElementType'

const controllerGetters = {};

const GraphElement = {
    DEFAULT_FONT: {
        family: 'Roboto'
    },
    sortCompare: function (a, b, childrenIndex) {
        if (a.getIndex(childrenIndex) === b.getIndex(childrenIndex)) {
            if (a.getCreationDate() === b.getCreationDate()) {
                return 0;
            }
            if (a.getCreationDate() < b.getCreationDate()) {
                return -1;
            }
            return 1;
        }
        if (a.getIndex(childrenIndex) > b.getIndex(childrenIndex)) {
            return 1;
        }
        return -1;
    },
    fromServerFormat: function (serverFormat) {
        return new GraphElement.GraphElement().init(
            serverFormat
        );
    },
    buildServerFormatFromUi: function (graphElementUi) {
        return {
            friendlyResource: FriendlyResource.buildServerFormatFromUi(
                graphElementUi
            ),
            identifications: Identification.getServerFormatArrayFromFacadeArray(
                graphElementUi.model().getIdentifiers()
            )
        }
    },
    fromSuggestionAndElementUri: function (suggestion, elementUri) {
        var serverFormat = GraphElement.buildObjectWithUri(
            elementUri
        );
        serverFormat.identifications = [];
        var sameAs = suggestion.getSameAs();
        sameAs.makeSameAs();
        serverFormat.identifications.push(
            sameAs.getServerFormat()
        );
        if (suggestion.hasType()) {
            var type = suggestion.getType();
            type.makeType();
            serverFormat.identifications.push(
                type.getServerFormat()
            );
        }
        return GraphElement.fromServerFormat(
            serverFormat
        );
    },
    withUri: function (uri) {
        return GraphElement.fromServerFormat(
            GraphElement.buildObjectWithUri(
                uri
            )
        );
    },
    buildObjectWithUri: function (uri) {
        return {
            friendlyResource: FriendlyResource.buildObjectWithUri(
                uri
            )
        };
    },
    fromDetailedSearchResult: function (detailedSearchResult) {
        return GraphElement.fromServerFormat(
            detailedSearchResult.graphElement
        );
    }
};

GraphElement.initMenuHandlerGetters = function () {
    controllerGetters[GraphElementType.Vertex] = GraphDisplayer.getVertexMenuHandler;
    controllerGetters[GraphElementType.Relation] = GraphDisplayer.getRelationMenuHandler;
    controllerGetters[GraphElementType.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
    controllerGetters[GraphElementType.Meta] = GraphDisplayer.getMetaController;
    controllerGetters[GraphElementType.MetaRelation] = GraphDisplayer.getMetaRelationController;
    controllerGetters[GraphElementType.MetaGroupVertex] = GraphDisplayer.getMetaGroupVertexController;
};

GraphElement.GraphElement = function () {
};

GraphElement.GraphElement.prototype = new FriendlyResource.FriendlyResource();

GraphElement.GraphElement.prototype.init = function (graphElementServerFormat) {
    this.graphElementServerFormat = graphElementServerFormat;
    FriendlyResource.FriendlyResource.apply(
        this
    );
    FriendlyResource.FriendlyResource.prototype.init.call(
        this,
        graphElementServerFormat.friendlyResource
    );
    if (this.graphElementServerFormat.childrenIndex) {
        this.graphElementServerFormat.childrenIndex = JSON.parse(
            this.graphElementServerFormat.childrenIndex
        );
    }
    if (this.graphElementServerFormat.colors && typeof this.graphElementServerFormat.colors === 'string') {
        this.graphElementServerFormat.colors = JSON.parse(
            this.graphElementServerFormat.colors
        );
    } else {
        this.graphElementServerFormat.colors = {
            background: Color.DEFAULT_BACKGROUND_COLOR
        }
    }
    if (this.graphElementServerFormat.font && typeof this.graphElementServerFormat.font === 'string') {
        this.graphElementServerFormat.font = JSON.parse(
            this.graphElementServerFormat.font
        );
    } else {
        this.graphElementServerFormat.font = GraphElement.DEFAULT_FONT;
    }
    this._buildIdentifications();
    // this.wikipediaLinksPromise = this._buildWikidataLinks();
    return this;
};


GraphElement.GraphElement.prototype.removeIdentifier = function (identifierToRemove) {
    var i = 0;
    this.identifiers.forEach(function (identifier) {
        if (identifier.getUri() === identifierToRemove.getUri()) {
            this.identifiers.splice(i, 1);
            return false;
        }
        i++;
    }.bind(this));
    return this.identifiers;
};

GraphElement.GraphElement.prototype.hasIdentifications = function () {
    return this.getIdentifiers().length > 0;
};
GraphElement.GraphElement.prototype.hasAllIdentifiers = function (identifiers) {
    let has = true;
    identifiers.forEach(function (identifier) {
        if (!this.hasIdentification(identifier)) {
            has = false;
        }
    }.bind(this));
    return has;
};
GraphElement.GraphElement.prototype.getIdentifierHavingExternalUri = function (externalUri) {
    let matching = this.getIdentifiersIncludingSelf().filter((identifier) => {
        return identifier.getExternalResourceUri() === externalUri;
    });
    return matching.length ? matching[0] : false;
};

GraphElement.GraphElement.prototype.getIdentifiers = function () {
    return this.identifiers.filter((identifier) => {
        return identifier.getExternalResourceUri() !== this.getUri()
    });
};

GraphElement.GraphElement.prototype.getIdentifiersIncludingSelf = function () {
    let identifiers = [];
    let isSelfTagAlreadyIncluded = false;
    this.identifiers.forEach((identifier) => {
        if (identifier.getExternalResourceUri() === this.getUri()) {
            isSelfTagAlreadyIncluded = true;
        }
        identifiers.push(identifier);
    });
    if (!isSelfTagAlreadyIncluded) {
        identifiers.push(
            this.buildSelfIdentifier()
        );
    }
    return identifiers;
};

GraphElement.GraphElement.prototype.hasRelevantTags = function () {
    return this.getRelevantTags().length > 0;
};

GraphElement.GraphElement.prototype.getRelevantTags = function () {
    return this.getIdentifiersIncludingSelf().filter(function (tag) {
        return tag.getNbReferences() > 0;
    });
};

GraphElement.GraphElement.prototype.getSelfTag = function () {
    let selfTag = this.getIdentifierHavingExternalUri(
        this.getUri()
    );
    return selfTag ? selfTag : this.buildSelfIdentifier();
};

GraphElement.GraphElement.prototype._buildIdentifications = function () {
    this.identifiers = [];
    if (undefined === this.graphElementServerFormat.identifications) {
        return;
    }
    Object.values(
        this.graphElementServerFormat.identifications
    ).forEach((identifier) => {
        this.identifiers.push(
            Identification.fromServerFormat(
                identifier
            )
        )
    });
};
GraphElement.GraphElement.prototype.hasIdentification = function (identifierToTest) {
    return this.getIdentifiersIncludingSelf().some((identifier) => {
        return identifier.getExternalResourceUri() === identifierToTest.getExternalResourceUri();
    })
};


GraphElement.GraphElement.prototype.buildSelfIdentifier = function () {
    let identification = Identification.fromFriendlyResource(
        this
    );
    identification.setLabel(
        this.getLabel()
    );
    identification.setComment(
        this.getComment()
    );
    return identification;
};

GraphElement.GraphElement.prototype.buildTwiceSelfIdentifier = function () {
    let identification = Identification.fromFriendlyResource(
        this
    );
    identification.makeExternalUriATwiceReference();
    identification.setLabel(
        this.getLabel()
    );
    identification.setComment(
        this.getComment()
    );
    return identification;
};

GraphElement.GraphElement.prototype.addIdentifications = function (identifications) {
    return identifications.forEach((identifier) => {
        this.addIdentification(
            identifier
        );
    });
};
GraphElement.GraphElement.prototype.addIdentification = function (identification) {
    if (this.hasIdentification(identification)) {
        return;
    }
    if (!identification.hasRelationExternalUri()) {
        return this.addIdentification(
            identification.makeGeneric()
        );
    }
    this.identifiers.push(identification);
};

GraphElement.GraphElement.prototype.getFirstIdentificationToAGraphElement = function () {
    let matching = this.getIdentifiersIncludingSelf().filter((identifier) => {
        return IdUri.isUriOfAGraphElement(identifier.getExternalResourceUri());
    });
    return matching.length ? matching[0] : false;
};

GraphElement.GraphElement.prototype.setSortDate = function (sortDate) {
    this.graphElementServerFormat.sortDate = sortDate.getTime();
    this.graphElementServerFormat.moveDate = new Date().getTime();
};

GraphElement.GraphElement.prototype.getSortDate = function () {
    if (undefined === this.graphElementServerFormat.sortDate) {
        return this.getCreationDate();
    }
    return new Date(
        this.graphElementServerFormat.sortDate
    );
};

GraphElement.GraphElement.prototype.getIndex = function (parentChildrenIndex) {
    if (!parentChildrenIndex[this.getUri()]) {
        return -1;
    }
    return parentChildrenIndex[this.getUri()].index;
};

GraphElement.GraphElement.prototype.getColors = function () {
    return this.graphElementServerFormat.colors || {};
};

GraphElement.GraphElement.prototype.setBackgroundColor = function (backgroundColor) {
    return this.getColors().background = backgroundColor;
};

GraphElement.GraphElement.prototype.getBackgroundColor = function () {
    return this.getColors().background || Color.DEFAULT_BACKGROUND_COLOR;
};

GraphElement.GraphElement.prototype.setFont = function (font) {
    return this.graphElementServerFormat.font = font;
};

GraphElement.GraphElement.prototype.getFont = function () {
    return this.graphElementServerFormat.font || GraphElement.DEFAULT_FONT;
};

GraphElement.GraphElement.prototype.getChildrenIndex = function () {
    return this.graphElementServerFormat.childrenIndex || {};
};

GraphElement.GraphElement.prototype.setChildrenIndex = function (childrenIndex) {
    return this.graphElementServerFormat.childrenIndex = childrenIndex;
};

GraphElement.GraphElement.prototype.getMoveDate = function () {
    if (undefined === this.graphElementServerFormat.moveDate) {
        return this.getCreationDate();
    }
    return new Date(
        this.graphElementServerFormat.moveDate
    );
};

GraphElement.GraphElement.prototype.isPristine = function () {
    return this.isLabelEmpty() && !this.hasIdentifications();
};


GraphElement.GraphElement.prototype.getTextOrDefault = function () {
    let text = this.getLabel();
    return "" === text.trim() ?
        this.getWhenEmptyLabel() :
        text;
};

GraphElement.GraphElement.prototype.getController = function () {
    return this.getControllerWithElements(this);
};

GraphElement.GraphElement.prototype.getControllerWithElements = function (elements) {
    let controller = this._getControllerClass();
    return new controller[
        this._getControllerName()
        ](elements);
};

GraphElement.GraphElement.prototype._getControllerName = function () {
    let controllerName = "";
    let nameParts = this.getGraphElementType().split("_");
    nameParts.forEach(function (namePart) {
        controllerName += namePart.charAt(0).toUpperCase() + namePart.substr(1);
    });
    return controllerName + "Controller";
};

GraphElement.GraphElement.prototype._getControllerClass = function () {
    return controllerGetters[
        this.getGraphElementType()
        ]();
};

// GraphElement.GraphElement.prototype._buildWikidataLinks = function () {
//     var promises = [];
//     this.getIdentifiers().forEach(function (identifier) {
//         var uri = identifier.getExternalResourceUri();
//         if (!WikidataUri.isAWikidataUri(uri)) {
//             return;
//         }
//         promises.push(Wikidata.getWikipediaUrlFromWikidataUri(uri));
//     });
//     return $.when.apply($, promises).then(function(){
//         return Array.from(arguments);
//     });
// };
//
// GraphElement.GraphElement.prototype.getWikipediaLinks = function () {
//     return this.wikipediaLinksPromise;
// };

export default GraphElement;
