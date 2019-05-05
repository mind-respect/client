/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import IdUri from '@/IdUri'
import WikidataUri from '@/wikidata/WikidataUri'
import WikidataService from '@/wikidata/WikidataService'

const RELATION_URIS = {
    "sameAs": "same-as",
    "type": "type",
    "generic": "generic"
};
const Identification = {
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
    fromFriendlyResourceServerFormat: function (serverFormat) {
        return Identification.fromFriendlyResource(
            FriendlyResource.fromServerFormat(serverFormat)
        );
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
Identification.Identification.prototype.getFirstIdentificationToAGraphElement = function () {
    return this.refersToAGraphElement() ?
        this : false;
};
Identification.Identification.prototype.refersToAGraphElement = function () {
    return IdUri.isUriOfAGraphElement(
        this.getExternalResourceUri()
    );
};
Identification.Identification.prototype.refersToOwnedGraphElement = function () {
    return this.refersToAGraphElement() && IdUri.isGraphElementUriOwnedByCurrentUser(
        this.getExternalResourceUri()
    );
};
Identification.Identification.prototype.refersToSchema = function () {
    return IdUri.isSchemaUri(
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

Identification.Identification.prototype.getUrl = function () {
    let externalUri = this.getExternalResourceUri();
    if (this.url) {
        return Promise.resolve(this.url);
    }
    let promise = WikidataUri.isAWikidataUri(externalUri) ?
        WikidataService.getWikipediaUrlFromWikidataUri(externalUri) : Promise.resolve(IdUri.htmlUrlForBubbleUri(externalUri));
    return promise.then((url) => {
        this.url = url;
        return this.url;
    });
};

export default Identification;
