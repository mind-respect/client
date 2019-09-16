/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import IdUri from '@/IdUri'
import WikidataUri from '@/wikidata/WikidataUri'
import WikidataService from '@/wikidata/WikidataService'
import Icon from '@/Icon'
import GraphElementType from '@/graph-element/GraphElementType'
import UserService from "@/service/UserService";

const RELATION_URIS = {
    "sameAs": "same-as",
    "type": "type",
    "generic": "generic"
};
const Identification = {
    generateVoidUri: function () {
        return "/service" + UserService.currentUserUri() + "/void/ref/" + IdUri.uuid();
    },
    fromMultipleServerFormat: function (serverFormat, relationExternalResourceUri) {
        return Object.values(
            serverFormat
        ).map((serverFormat) => {
            let identifier = Identification.fromServerFormat(
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
        return new Identification.Identification().init(serverFormat);
    },
    fromFriendlyResource: function (friendlyResource) {
        let identification = new Identification.Identification().init({
            externalResourceUri: friendlyResource.getUri(),
            friendlyResource: FriendlyResource.clone(friendlyResource).getServerFormat()
        });
        identification.setLabel(
            friendlyResource.getLabel()
        );
        identification.setComment(
            friendlyResource.getComment()
        );
        return identification;
    },
    withUriLabelAndDescription: function (uri, label, description) {
        return new Identification.Identification().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriLabelAndDescription(
                uri,
                label,
                description
            ).getServerFormat()
        });
    },
    withUriAndLabel: function (uri, label) {
        return new Identification.Identification().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUriAndLabel(
                uri,
                label
            ).getServerFormat()
        });
    },
    withUri: function (uri) {
        return new Identification.Identification().init({
            externalResourceUri: uri,
            friendlyResource: FriendlyResource.withUri(
                uri
            ).getServerFormat()
        });
    },
    fromSearchResult: function (searchResult) {
        let identification = Identification.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.description
        );
        return identification;
    }
};

Identification.Identification = function () {
};

Identification.Identification.prototype = new FriendlyResource.FriendlyResource();

Identification.Identification.prototype.init = function (serverFormat) {
    this.identificationServerFormat = serverFormat;
    FriendlyResource.FriendlyResource.apply(
        this
    );
    FriendlyResource.FriendlyResource.prototype.init.call(
        this,
        serverFormat.friendlyResource
    );
    return this;
};

Identification.Identification.prototype.getExternalResourceUri = function () {
    return decodeURIComponent(
        this.identificationServerFormat.externalResourceUri
    );
};

Identification.Identification.prototype.setExternalResourceUri = function (externalResourceUri) {
    this.identificationServerFormat.externalResourceUri = externalResourceUri;
};

Identification.Identification.prototype.makeExternalUriATwiceReference = function () {
    this.identificationServerFormat.externalResourceUri = this.identificationServerFormat.externalResourceUri + "/twice";
};

Identification.Identification.prototype.getServerFormat = function () {
    return this.identificationServerFormat;
};

Identification.Identification.prototype.makeGeneric = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.generic
    );
    return this;
};
Identification.Identification.prototype.makeType = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.type
    );
    return this;
};
Identification.Identification.prototype.makeSameAs = function () {
    this.setRelationExternalResourceUri(
        RELATION_URIS.sameAs
    );
    return this;
};
Identification.Identification.prototype.refersToAGraphElement = function () {
    return IdUri.isUriOfAGraphElement(
        this.getExternalResourceUri()
    );
};
Identification.Identification.prototype.setRelationExternalResourceUri = function (relationExternalResourceUri) {
    return this.identificationServerFormat.relationExternalResourceUri = relationExternalResourceUri;
};
Identification.Identification.prototype.getRelationExternalResourceUri = function () {
    return this.identificationServerFormat.relationExternalResourceUri;
};
Identification.Identification.prototype.hasRelationExternalUri = function () {
    return undefined !== this.getRelationExternalResourceUri();
};

Identification.Identification.prototype.getJsonFormat = function () {
    let serverFormat = this.getServerFormat();
    serverFormat.friendlyResource.images = this.getImagesServerFormat();
    return serverFormat;
};

Identification.Identification.prototype.getNbReferences = function () {
    if (this.identificationServerFormat.nbReferences === undefined) {
        return 0;
    }
    return this.identificationServerFormat.nbReferences;
};

Identification.Identification.prototype.getNbReferences = function () {
    if (this.identificationServerFormat.nbReferences === undefined) {
        return 0;
    }
    return this.identificationServerFormat.nbReferences;
};

Identification.Identification.prototype.isPublic = function () {
    return false;
};

Identification.Identification.prototype.hasIdentifications = function () {
    return false;
};
Identification.Identification.prototype.getIdentifiers = function () {
    return [this];
};

Identification.Identification.prototype.isPristine = function () {
    return false;
};

Identification.Identification.prototype.getFont = function () {
    return {
        family: 'Roboto'
    };
};

Identification.Identification.prototype.buildExternalUrls = function () {
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

Identification.Identification.prototype.isFromWikidata = function () {
    return WikidataUri.isAWikidataUri(
        this.getExternalResourceUri()
    );
};

Identification.Identification.prototype.getIcon = function () {
    return Icon.getForTag(this);
};

Identification.Identification.prototype.getGraphElementType = function () {
    return GraphElementType.Meta;
};

Identification.Identification.prototype.isVoidReferenceTag = function () {
    return this.getExternalResourceUri().indexOf("/void/ref/") > -1;
};

export default Identification;
