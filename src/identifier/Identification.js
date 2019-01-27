/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import IdUri from '@/IdUri'
// import Search from "jquery.triple_brain.search"
import WikidataUri from '@/WikidataUri'
import Wikidata from '@/Wikidata'

const RELATION_URIS = {
    "sameAs": "same-as",
    "type": "type",
    "generic": "generic"
};
const Identification = {
    fromMultipleServerFormat: function (serverFormat, relationExternalResourceUri) {
        var identifications = {};
        $.each(serverFormat, function (externalUri, identificationServerFormat) {
            var identification = Identification.fromServerFormat(
                identificationServerFormat
            );
            identification.setRelationExternalResourceUri(
                relationExternalResourceUri
            );
            identifications[externalUri] = identification;
        });
        return identifications;
    },
    getServerFormatArrayFromFacadeArray: function (identifications) {
        var serverFormat = [];
        $.each(identifications, function () {
            serverFormat.push(
                this.getServerFormat()
            );
        });
        return serverFormat;
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
        var identification = new Identification.Identification().init({
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
        var identification = Identification.withUriLabelAndDescription(
            searchResult.uri,
            searchResult.label,
            searchResult.comment
        );
        // if (Search.hasCachedDetailsForSearchResult(searchResult)) {
        //     var moreInfo = Search.getCachedDetailsOfSearchResult(searchResult);
        //     if (moreInfo.image !== undefined) {
        //         identification.addImage(moreInfo.image);
        //     }
        //     if (!identification.hasComment() && moreInfo.comment !== "") {
        //         identification.setComment(moreInfo.comment);
        //     }
        // }
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
    this.wikipediaLinkPromise = this._buildWikidataLink();
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
    var serverFormat = this.getServerFormat();
    serverFormat.friendlyResource.images = this.getImagesServerFormat();
    return JSON.stringify(
        serverFormat
    );
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
Identification.Identification.prototype._buildWikidataLink = function () {
    var deferred = $.Deferred().resolve(false);
    var externalUri = this.getExternalResourceUri();
    if (WikidataUri.isAWikidataUri(externalUri)) {
        deferred = Wikidata.getWikipediaUrlFromWikidataUri(externalUri).then(function (wikipediaUrl) {
            return {
                link: wikipediaUrl,
                label: this.getLabel()
            };
        }.bind(this));
    }
    return deferred.promise();
};
Identification.Identification.prototype.getWikipediaLink = function () {
    return this.wikipediaLinkPromise;
};
Identification.Identification.prototype.isPristine = function () {
    return false;
};

Identification.Identification.prototype.getFont = function () {
    return {
        family: 'IBM Plex Sans'
    };
};

export default Identification;
