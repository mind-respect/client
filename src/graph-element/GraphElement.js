/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import Identification from '@/identifier/Identification'
import IdUri from '@/IdUri'
import Color from '@/Color'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementType from '@/graph-element/GraphElementType'

import WikidataUri from '@/WikidataUri'
import Wikidata from '@/Wikidata'
import api from "./GraphElementUi";

const controllerGetters = {};

const GraphElement = {
    DEFAULT_FONT: {
        family: 'IBM Plex Sans'
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
                graphElementUi.getModel().getIdentifiers()
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
GraphElement.GraphElement = function () {
};

initMenuHandlerGetters();

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
    if (this.graphElementServerFormat.colors) {
        this.graphElementServerFormat.colors = JSON.parse(
            this.graphElementServerFormat.colors
        );
    }
    if (this.graphElementServerFormat.font) {
        this.graphElementServerFormat.font = JSON.parse(
            this.graphElementServerFormat.font
        );
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
    var has = true;
    identifiers.forEach(function (identifier) {
        if (!this.hasIdentification(identifier)) {
            has = false;
        }
    }.bind(this));
    return has;
};
GraphElement.GraphElement.prototype.getIdentifierHavingExternalUri = function (externalUri) {
    var identification = false;
    $.each(this.getIdentifiersIncludingSelf(), function () {
        if (this.getExternalResourceUri() === externalUri) {
            identification = this;
            return false;
        }
    });
    return identification;
};

GraphElement.GraphElement.prototype.getIdentifiers = function () {
    var identifiers = [];
    this.identifiers.forEach(function (identifier) {
        if (identifier.getExternalResourceUri() !== this.getUri()) {
            return identifiers.push(identifier);
        }
    }.bind(this));
    return identifiers;
};

GraphElement.GraphElement.prototype.getIdentifiersIncludingSelf = function () {
    let identifiers = [];
    let isSelfTagAlreadyIncluded = false;
    this.identifiers.forEach(function (identifier) {
        if (identifier.getExternalResourceUri() === this.getUri()) {
            isSelfTagAlreadyIncluded = true;
        }
        identifiers.push(identifier);
    }.bind(this));
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
    var selfTag = this.getIdentifierHavingExternalUri(
        this.getUri()
    );
    return selfTag ? selfTag : this.buildSelfIdentifier();
};

GraphElement.GraphElement.prototype._buildIdentifications = function () {
    this.identifiers = [];
    if (undefined === this.graphElementServerFormat.identifications) {
        return;
    }
    var self = this;
    $.each(this.graphElementServerFormat.identifications, function () {
        self.identifiers.push(Identification.fromServerFormat(
            this
        ));
    });
};
GraphElement.GraphElement.prototype.hasIdentification = function (identification) {
    var contains = false;
    $.each(this.getIdentifiersIncludingSelf(), function () {
        if (this.getExternalResourceUri() === identification.getExternalResourceUri()) {
            contains = true;
            return false;
        }
    });
    return contains;
};

GraphElement.GraphElement.prototype.buildSelfIdentifier = function () {
    var identification = Identification.fromFriendlyResource(
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
    var identification = Identification.fromFriendlyResource(
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

GraphElement.GraphElement.prototype.isRelatedToIdentifier = function (identification) {
    return identification.getExternalResourceUri() === this.getUri() ||
        this.hasIdentification(identification);
};

GraphElement.GraphElement.prototype.addIdentifications = function (identifications) {
    var self = this;
    $.each(identifications, function () {
        self.addIdentification(
            this
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
    var identification = false;
    $.each(this.getIdentifiersIncludingSelf(), function () {
        if (IdUri.isUriOfAGraphElement(this.getExternalResourceUri())) {
            identification = this;
            return false;
        }
    });
    return identification;
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

GraphElement.GraphElement.prototype.getBackgroundColor = function () {
    let mapColor = this.getColors().background || Color.DEFAULT_BACKGROUND_COLOR;
    return Color.getBackgroundColorForColor(mapColor);
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
    var text = this.getLabel();
    return "" === text.trim() ?
        this.getWhenEmptyLabel() :
        text;
};

GraphElement.GraphElement.prototype.getController = function () {
    return this.getControllerWithElements(this);
};

GraphElement.GraphElement.prototype.getControllerWithElements = function (elements) {
    var controller = this._getControllerClass();
    return new controller[
        this._getControllerName()
        ](elements);
};

GraphElement.GraphElement.prototype._getControllerName = function () {
    var controllerName = "";
    var nameParts = this.getGraphElementType().split("_");
    nameParts.forEach(function (namePart) {
        controllerName += namePart.capitalizeFirstLetter();
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


function initMenuHandlerGetters() {
    controllerGetters[api.Types.Vertex] = GraphDisplayer.getVertexMenuHandler;
    controllerGetters[api.Types.Relation] = GraphDisplayer.getRelationMenuHandler;
    controllerGetters[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
    controllerGetters[api.Types.Schema] = GraphDisplayer.getSchemaMenuHandler;
    controllerGetters[api.Types.Property] = GraphDisplayer.getPropertyMenuHandler;
    controllerGetters[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionController;
    controllerGetters[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionMenuHandler;
    controllerGetters[api.Types.Meta] = GraphDisplayer.getMetaController;
    controllerGetters[api.Types.MetaRelation] = GraphDisplayer.getMetaRelationController;
    controllerGetters[GraphElementType.GroupVertexUnderMeta] = GraphDisplayer.getGroupVertexUnderMetaController;
}
