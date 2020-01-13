import Service from '@/Service'
import Tag from '@/tag/Tag'

const TagService = {};
TagService.add = function (graphElement, identification) {
    return Service.geApi().post(
        graphElement.getUri() + '/identification',
        identification.getJsonFormat()
    ).then(function (response) {
        return Tag.fromMultipleServerFormat(
            response.data,
            identification.getRelationExternalResourceUri()
        );
    });
};

TagService.remove = function (graphElementUri, tag) {
    return Service.geApi().delete(
        graphElementUri + '/identification?uri=' + tag.getUri()
    )
};

export default TagService;