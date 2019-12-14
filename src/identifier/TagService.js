import Service from '@/Service'
import Identification from '@/identifier/Identification'

const TagService = {};
TagService.add = function (graphElement, identification) {
    return Service.geApi().post(
        graphElement.getUri() + '/identification',
        identification.getJsonFormat()
    ).then(function (response) {
        return Identification.fromMultipleServerFormat(
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