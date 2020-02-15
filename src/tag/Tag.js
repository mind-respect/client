/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphElement from "@/graph-element/GraphElement";
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import IdUri from '@/IdUri'
import WikidataUri from '@/wikidata/WikidataUri'
import WikidataService from '@/wikidata/WikidataService'
import Icon from '@/Icon'
import GraphElementType from '@/graph-element/GraphElementType'
import UserService from "@/service/UserService";
import CurrentSubGraph from "../graph/CurrentSubGraph";
import ShareLevel from '@/vertex/ShareLevel'

const RELATION_URIS = {
    "sameAs": "same-as",
    "type": "type",
    "generic": "generic"
};
const Tag = {
    generateVoidUri: function () {
        return "/service" + UserService.currentUserUri() + "/void/ref/" + IdUri.uuid();
    },
    fromMultipleServerFormat: function (serverFormat, relationExternalResourceUri) {
        return Object.values(
            serverFormat
        ).map((serverFormat) => {
            let identifier = Tag.fromServerFormat(
                serverFormat
            );
            identifier.setRelationExternalResourceUri(
                relationExternalResourceUri
            );
            return identifier;
        });
    },
    getServerFormatArrayFromFacadeArray: function (identifications) {
        return identifications.map((identifier) => {
            return identifier.getServerFormat();
        });
    },
    fromServerFormat: function (serverFormat) {
        return new Tag.Tag().init(serverFormat);
    },
    fromGraphElementServerFormat: function (graphElementServerFormat) {
        return new Tag.Tag().init({
            graphElement: graphElementServerFormat
        });
    },
    fromFriendlyResource: function (friendlyResource) {
        let tag = new Tag.Tag().init({
            externalResourceUri: friendlyResource.getUri(),
            graphElement: {
                friendlyResource: FriendlyResource.clone(friendlyResource).getServerFormat()
            }
        });
        FriendlyResource.FriendlyResource.prototype.setLabel.call(
            tag,
            friendlyResource.getLabel()
        );
        FriendlyResource.FriendlyResource.prototype.setLabel.call(
            tag,
            friendlyResource.getComment()
        );
        return tag;
    },
    withUriLabelAndDescription: function (uri, label, description) {
        return new Tag.Tag().init({
            externalResourceUri: uri,
            graphElement: {
                friendlyResource: FriendlyResource.withUriLabelAndDescription(
                    uri,
                    label,
                    description
                ).getServerFormat()
            }
        });
    },
    withUriAndLabel: function (uri, label) {
        return new Tag.Tag().init({
            externalResourceUri: uri,
            graphElement: {
                friendlyResource: FriendlyResource.withUriAndLabel(
                    uri,
                    label
                ).getServerFormat()
            }
        });
    },
    withUri: function (uri) {
        return new Tag.Tag().init({
            externalResourceUri: uri,
            graphElement: GraphElement.buildObjectWithUri(
                uri
            )
        });
    },
    fromSearchResult: function (searchResult) {
        let tag = Tag.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.description
        );
        tag.setShareLevel(
            searchResult.shareLevel || ShareLevel.PRIVATE
        );
        tag.setNbReferences(
            searchResult.nbReferences || 0
        );
        return tag;
    }
};

Tag.Tag = function () {
};

Tag.Tag.prototype = new GraphElement.GraphElement();

Tag.Tag.prototype.init = function (serverFormat) {
    this.identificationServerFormat = serverFormat;
    if (!this.identificationServerFormat.shareLevel) {
        this.identificationServerFormat.shareLevel = ShareLevel.PRIVATE;
    }
    FriendlyResource.FriendlyResource.apply(
        this
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        serverFormat.graphElement
    );
    return this;
};

Tag.Tag.prototype.getExternalResourceUri = function () {
    return decodeURIComponent(
        this.identificationServerFormat.externalResourceUri
    );
};

Tag.Tag.prototype.setExternalResourceUri = function (externalResourceUri) {
    this.identificationServerFormat.externalResourceUri = externalResourceUri;
};

Tag.Tag.prototype.makeExternalUriATwiceReference = function () {
    this.identificationServerFormat.externalResourceUri = this.identificationServerFormat.externalResourceUri + "/twice";
};

Tag.Tag.prototype.getServerFormat = function () {
    return this.identificationServerFormat;
};

Tag.Tag.prototype.makeGeneric = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.generic
    );
    return this;
};
Tag.Tag.prototype.makeType = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.type
    );
    return this;
};
Tag.Tag.prototype.makeSameAs = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.sameAs
    );
    return this;
};
Tag.Tag.prototype.refersToAGraphElement = function () {
    return IdUri.isUriOfAGraphElement(
        this.getExternalResourceUri()
    );
};
Tag.Tag.prototype.setRelationExternalResourceUri = function (relationExternalResourceUri) {
    return this.identificationServerFormat.relationExternalResourceUri = relationExternalResourceUri;
};
Tag.Tag.prototype.getRelationExternalResourceUri = function () {
    return this.identificationServerFormat.relationExternalResourceUri;
};
Tag.Tag.prototype.hasRelationExternalUri = function () {
    return undefined !== this.getRelationExternalResourceUri();
};

Tag.Tag.prototype.getJsonFormat = function () {
    let serverFormat = JSON.parse(JSON.stringify(this.getServerFormat()));
    serverFormat.graphElement.friendlyResource.images = this.getImagesServerFormat();
    /*
        serverFormat.friendlyResource.colors = JSON.stringify(serverFormat.friendlyResource.colors);
        because colors are stored as string on server side
    */
    serverFormat.graphElement.friendlyResource.colors = JSON.stringify(serverFormat.graphElement.friendlyResource.colors);
    serverFormat.graphElement.font = JSON.stringify(serverFormat.graphElement.font);
    serverFormat.graphElement.childrenIndex = JSON.stringify(serverFormat.graphElement.childrenIndex);
    return serverFormat;
};

Tag.Tag.prototype.incrementNbReferences = function () {
    if (this.identificationServerFormat.nbReferences === undefined) {
        this.identificationServerFormat.nbReferences = 1;
        return;
    }
    return this.identificationServerFormat.nbReferences++;
};

Tag.Tag.prototype.getNbReferences = function () {
    if (this.identificationServerFormat.nbReferences === undefined) {
        return 0;
    }
    return this.identificationServerFormat.nbReferences;
};

Tag.Tag.prototype.setNbReferences = function (nbReferences) {
    this._applyToAllTags(function (tag) {
        if (tag.identificationServerFormat) {
            tag.identificationServerFormat.nbReferences = nbReferences;
        }
    });
};

Tag.Tag.prototype.setShareLevel = function (shareLevel) {
    this._applyToAllTags(function (tag) {
        if (tag.identificationServerFormat) {
            tag.identificationServerFormat.shareLevel = shareLevel;
        }
    });
};

Tag.Tag.prototype.getShareLevel = function () {
    return this.identificationServerFormat.shareLevel.toUpperCase();
};

Tag.Tag.prototype.isPublic = function () {
    return false;
};

Tag.Tag.prototype.hasIdentifications = function () {
    return false;
};
Tag.Tag.prototype.getIdentifiers = function () {
    return [this];
};

Tag.Tag.prototype.isPristine = function () {
    return false;
};

Tag.Tag.prototype.getFont = function () {
    return {
        family: 'Roboto'
    };
};

Tag.Tag.prototype.buildExternalUrls = function () {
    this.url = this.uri().url();
    let externalUri = this.getExternalResourceUri();
    if (this.externalUrl) {
        return Promise.resolve(this.externalUrl);
    }
    let promise = WikidataUri.isAWikidataUri(externalUri) ?
        WikidataService.getWikipediaUrlFromWikidataUri(externalUri) : Promise.resolve(IdUri.htmlUrlForBubbleUri(externalUri));
    return promise.then((url) => {
        this.externalUrl = url;
        return this.externalUrl;
    });
};

Tag.Tag.prototype.isFromWikidata = function () {
    return WikidataUri.isAWikidataUri(
        this.getExternalResourceUri()
    );
};

Tag.Tag.prototype.getIcon = function () {
    return Icon.getForTag(this);
};

Tag.Tag.prototype.getGraphElementType = function () {
    return GraphElementType.Meta;
};

Tag.Tag.prototype.isVoidReferenceTag = function () {
    return this.getExternalResourceUri().indexOf("/void/ref/") > -1;
};

Tag.Tag.prototype.setBackgroundColor = function (backgroundColor) {
    this._applyToAllTags(function (tag) {
        FriendlyResource.FriendlyResource.prototype.setBackgroundColor.call(
            tag,
            backgroundColor
        );
    });
};

Tag.Tag.prototype.setLabel = function (label) {
    this._applyToAllTags(function (tag) {
        FriendlyResource.FriendlyResource.prototype.setLabel.call(
            tag,
            label
        );
    });
};

Tag.Tag.prototype.setComment = function (comment) {
    this._applyToAllTags(function (tag) {
        FriendlyResource.FriendlyResource.prototype.setComment.call(
            tag,
            comment
        );
    });
};

Tag.Tag.prototype._applyToAllTags = function (visitor) {
    visitor(this);
    let subGraph = CurrentSubGraph.get();
    if (!subGraph) {
        return;
    }
    subGraph.getGraphElements().forEach((graphElement) => {
        let tag;
        if (graphElement.isMeta() && graphElement.getOriginalMeta().getUri() === this.getUri()) {
            tag = graphElement.getOriginalMeta();
            visitor(graphElement);
        } else if (graphElement.isGroupRelation() && graphElement.getIdentification().getUri() === this.getUri()) {
            tag = graphElement.getIdentification();
            visitor(graphElement);
        } else {
            tag = graphElement.getIdentifierHavingExternalUri(
                this.getExternalResourceUri()
            );
        }
        if (tag) {
            visitor(tag);
        }
    });
};

export default Tag;
