/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import $ from 'jquery'
import IdUri from '@/IdUri'
import Suggestion from '@/suggestion/Suggestion'
import VertexService from '@/vertex/VertexService'
import SchemaService from '@/schema/SchemaService'
import Schema from '@/schema/Schema'

const api = {};
api.addSchemaSuggestionsIfApplicable = function (vertex, resourceUri) {
    var deferred = $.Deferred();
    var suggestions = [];
    if (!IdUri.isSchemaUri(resourceUri)) {
        deferred.resolve(suggestions);
        return deferred.promise();
    }
    SchemaService.get(resourceUri, function (serverFormat) {
        var schema = Schema.fromServerFormat(serverFormat);
        $.each(schema.getProperties(), function () {
            suggestions.push(
                Suggestion.fromSchemaPropertyAndOriginUri(
                    this,
                    resourceUri
                )
            );
        });
        VertexService.addSuggestions(
            vertex,
            suggestions
        ).then(function () {
            deferred.resolve(
                suggestions
            );
        });
    });
    return deferred;
};
export default api;
