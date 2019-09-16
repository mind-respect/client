import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

const Icon = {};

Icon.getForGraphElement = function (graphElement) {
    return Icon.getForGraphElementType(
        graphElement.getGraphElementType()
    )
};
Icon.getForTag = function (tag) {
    if (tag.isVoidReferenceTag()) {
        return 'label';
    }
    return Icon.getForUri(
        tag.getExternalResourceUri()
    );
};
Icon.getForSearchResult = function (searchResult) {
    return Icon.getForGraphElementType(
        searchResult.getGraphElementType()
    )
};
Icon.getForUri = function (uri) {
    return Icon.getForGraphElementType(
        IdUri.getGraphElementTypeFromUri(
            uri
        )
    )
};
Icon.getForGraphElementType = function (graphElementType) {
    switch (graphElementType) {
        case GraphElementType.Relation :
            return "arrow_right_alt";
        case GraphElementType.Meta :
            return "label";
        default :
            return "scatter_plot";
    }
};

export default Icon;