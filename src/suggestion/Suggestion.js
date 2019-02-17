/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.friendly_resource",
        "triple_brain.identification",
        "triple_brain.id_uri",
        "triple_brain.user_service",
        "triple_brain.suggestion_origin"
    ],
    function ($, FriendlyResource, Identification, IdUri, UserService, SuggestionOrigin) {
        "use strict";
        var api = {};
        api.fromServerFormat = function (serverFormat) {
            return new Suggestion(
                serverFormat
            );
        };
        api.fromServerArray = function (serverArray) {
            var suggestions = [];
            $.each(serverArray, function () {
                suggestions.push(
                    api.fromServerFormat(
                        this
                    )
                );
            });
            return suggestions;
        };

        api.fromTriple = function (triple) {
            var suggestionUri = api.generateUri();
            var builtServerFormat = {
                friendlyResource: FriendlyResource.buildObjectWithUriAndLabel(
                    suggestionUri,
                    triple.getEdge().getLabel()
                ),
                sameAs: $.extend(true, {}, triple.getEdge().getServerFormat()),
                type: $.extend(true, {}, triple.getDestinationVertex().getServerFormat()),
                origins: [
                    SuggestionOrigin.buildObjectWithUriAndOrigin(
                        api.generateOriginUriFromSuggestionUri(suggestionUri),
                        SuggestionOrigin.COMPARISON_PREFIX + triple.getSourceVertex().getUri()
                    )
                ]
            };
            return api.fromServerFormat(
                builtServerFormat
            );
        };

        api.fromSchemaPropertyAndOriginUri = function (schemaProperty, originUri) {
            var suggestionUri = api.generateUri();
            var serverFormat = {
                friendlyResource: FriendlyResource.buildObjectWithUriAndLabel(
                    suggestionUri,
                    schemaProperty.getLabel()
                ),
                sameAs: FriendlyResource.buildObjectWithUriAndLabel(
                    schemaProperty.getUri(),
                    schemaProperty.getLabel()
                ),
                origins: [
                    SuggestionOrigin.buildObjectWithUriAndOrigin(
                        api.generateOriginUriFromSuggestionUri(suggestionUri),
                        SuggestionOrigin.IDENTIFICATION_PREFIX + originUri
                    )
                ]
            };
            var suggestion = api.fromServerFormat(serverFormat);
            if (schemaProperty.hasIdentifications()) {
                var identification = schemaProperty.getIdentifiers()[0];
                suggestion._setType(
                    identification
                );
            }
            return suggestion;
        };
        api.formatAllForServer = function (suggestions) {
            var suggestionsFormatedForServer = {};
            $.each(suggestions, function () {
                var suggestion = this;
                suggestionsFormatedForServer[
                    suggestion.getUri()
                    ] = suggestion.getServerFormat();
            });
            return JSON.stringify(suggestionsFormatedForServer);
        };

        api.generateOriginUriFromSuggestionUri = function (suggestionUri) {
            return suggestionUri + "/origin/" + IdUri.generateUuid();
        };
        api.generateUri = function () {
            return UserService.currentUserUri() + "/suggestion/" + IdUri.generateUuid();
        };

        function Suggestion(serverFormat) {
            this._shouldDisplay = true;
            this.sameAs = Identification.fromFriendlyResourceServerFormat(
                serverFormat.sameAs
            );
            if (serverFormat.type !== undefined) {
                this.type = Identification.fromFriendlyResourceServerFormat(
                    serverFormat.type
                );
            }
            this.origins = SuggestionOrigin.fromServerArray(
                serverFormat.origins
            );
            FriendlyResource.FriendlyResource.apply(
                this
            );
            FriendlyResource.FriendlyResource.prototype.init.call(
                this,
                serverFormat.friendlyResource
            );
        }

        Suggestion.prototype = new FriendlyResource.FriendlyResource();

        Suggestion.prototype.getSameAs = function () {
            return this.sameAs;
        };
        Suggestion.prototype.getType = function () {
            return this.type;
        };
        Suggestion.prototype._setType = function (type) {
            return this.type = type;
        };
        Suggestion.prototype.hasType = function () {
            return this.type !== undefined;
        };
        Suggestion.prototype.hasIdentifications = function () {
            return true;
        };
        Suggestion.prototype.getIdentifiers = function () {
            var identifications = [
                this.getSameAs()
            ];
            if(undefined !== this.getType()){
                identifications.push(
                    this.getType()
                );
            }
            return identifications;
        };
        Suggestion.prototype.getOrigin = function () {
            return this.origins[0];
        };
        Suggestion.prototype.hasIdentificationForOrigin = function (identification) {
            return (SuggestionOrigin.IDENTIFICATION_PREFIX + identification.getExternalResourceUri()) ===
                this.getOrigin().getOrigin();
        };
        Suggestion.prototype.getServerFormat = function () {
            var serverFormatGetter = FriendlyResource.FriendlyResource.prototype.getServerFormat;
            return {
                friendlyResource: serverFormatGetter.call(
                    this
                ),
                sameAs: serverFormatGetter.call(this.getSameAs()),
                type: (this.hasType() ? serverFormatGetter.call(this.getType()) : undefined),
                origins: this._getOriginsServerFormat()
            };
        };
        Suggestion.prototype._getOriginsServerFormat = function () {
            var origins = [];
            $.each(this.origins, function () {
                var origin = this;
                origins.push(
                    origin.getServerFormat()
                );
            });
            return origins;
        };
        Suggestion.prototype.shouldDisplay = function () {
            return this._shouldDisplay;
        };
        Suggestion.prototype.shouldNotDisplay = function () {
            return this._shouldDisplay = false;
        };
        Suggestion.prototype.isRelatedToIdentifier = function (identification) {
            return this.getSameAs().getUri() === identification.getExternalResourceUri() ||
                (this.hasType() && this.getType().getUri() === identification.getExternalResourceUri());
        };
        return api;
    }
);