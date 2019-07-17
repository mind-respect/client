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

TagService.remove = function (graphElementUri, identification) {
    return Service.geApi().delete(
        graphElementUri + '/identification?uri=' + identification.getUri()
    )
};

export default TagService;