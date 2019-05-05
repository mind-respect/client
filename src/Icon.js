import GraphElementType from '@/graph-element/GraphElementType'
import IdUri from '@/IdUri'

const Icon = {};

Icon.getForGraphElement = function (graphElement) {
    return Icon.getForGraphElementType(
        graphElement.getGraphElementType()
    )
};
Icon.getForTag = function (tag) {
    return Icon.getForUri(
        tag.getExternalResourceUri()
    );
};
Icon.getForSearchResult = function (searchResult) {
    return Icon.getForGraphElementType(
        searchResult.original.getGraphElementType()
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
            return "panorama_fish_eye";
    }
};
export default Icon;