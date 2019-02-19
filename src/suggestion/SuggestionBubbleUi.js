/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import RelativeTreeVertex from '@/vertex/RelativeTreeVertex'
import GraphElementUi from '@/graph-element/GraphElementUi'
import VertexUi from '@/vertex/VertexUi'
import Vertex from '@/vertex/Vertex'
import EventBus from '@/EventBus'
import SelectionHandler from '@/SelectionHandler'
import VertexUiBuilder from '@/vertex/VertexUiBuilder'
import MindMapInfo from '@/MindMapInfo'

const api = {};
RelativeTreeVertex.buildCommonConstructors(api);
api.createFromHtml = function (html) {
    var suggestionUi = new api.SuggestionBubbleUi(
        html
    );
    api.initCache(suggestionUi);
    RelativeTreeVertex.initCache(
        suggestionUi
    );
    VertexUi.initCache(
        suggestionUi
    );
    return suggestionUi;
};
api.getWhenEmptyLabel = function () {
    return $.t("suggestion.when-empty");
};
api.SuggestionBubbleUi = function (html) {
    this.html = html;
    this.integrationDeferrer = $.Deferred();
    RelativeTreeVertex.RelativeTreeVertex.apply(this);
    this.init(html);
};
api.SuggestionBubbleUi.prototype = new RelativeTreeVertex.RelativeTreeVertex();
api.SuggestionBubbleUi.prototype.getGraphElementType = function () {
    return GraphElementUi.Types.VertexSuggestion;
};

api.SuggestionBubbleUi.prototype.integrateUsingNewVertexAndEdgeUri = function (newVertexUri, newEdgeUri) {
    var vertexUi = this.integrate(newVertexUri);
    this.getRelationWithUiParent().integrate(
        newEdgeUri,
        vertexUi
    );
    return vertexUi;
};

api.SuggestionBubbleUi.prototype.whenItIntegrates = function () {
    return this.integrationDeferrer.promise();
};

api.SuggestionBubbleUi.prototype.getModel = function () {
    return this.getSuggestion().getOrigin().isFromComparison() ?
        this.model.getType() : this.getSuggestion();
};

api.SuggestionBubbleUi.prototype.getSuggestion = function () {
    return this.model;
};

api.SuggestionBubbleUi.prototype.removeFromCache = function () {
    api.removeFromCache(
        this.getUri(),
        this.getId()
    );
    RelativeTreeVertex.removeFromCache(
        this.getUri(),
        this.getId()
    );
    VertexUi.removeFromCache(
        this.getUri(),
        this.getId()
    );
};

api.SuggestionBubbleUi.prototype.integrate = function (newVertexUri) {
    this.removeFromCache();
    var vertex = Vertex.withUri(
        newVertexUri
    );
    vertex.setLabel(
        this.text()
    );
    var isFromComparison = this.getSuggestion().getOrigin().isFromComparison();
    if (isFromComparison) {
        vertex.addIdentification(
            this.getSuggestion().getType()
        );
    } else {
        vertex.addIdentification(
            this.getSuggestion().getSameAs()
        );
        if (this.getSuggestion().hasType()) {
            vertex.addIdentification(
                this.getSuggestion().getType()
            );
        }
    }
    vertex.isLeftOriented = this.isToTheLeft();
    this.html.data(
        "uri",
        newVertexUri
    ).removeClass(
        "suggestion"
    );
    this.getLabel().attr(
        "placeholder", RelativeTreeVertex.getWhenEmptyLabel()
    );
    var vertexUi = RelativeTreeVertex.createFromHtml(
        this.html
    );
    vertexUi.setModel(
        vertex
    );
    vertexUi.rebuildMenuButtons();
    if (isFromComparison) {
        vertexUi.setComparedWith(
            this.getComparedWith()
        );
        vertexUi.quitCompareAddOrRemoveMode();
        vertexUi.refreshComparison();
    } else if (MindMapInfo.isInCompareMode()) {
        vertexUi.setAsComparisonSuggestionToRemove();
    }
    SelectionHandler.removeAll();
    SelectionHandler.setToSingleGraphElement(vertexUi);
    EventBus.publish(
        '/event/ui/html/vertex/created/',
        vertexUi
    );
    VertexUiBuilder.completeBuild(vertexUi);
    this.integrationDeferrer.resolve(vertexUi);
    return vertexUi;
};
api.SuggestionBubbleUi.prototype.getNumberOfHiddenRelations = function () {
    return 0;
};

export default api;
