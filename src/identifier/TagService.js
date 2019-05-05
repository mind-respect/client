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

TagService.remove = function (graphElement, identification) {
    return Service.geApi().delete(
        graphElement.getUri() + '/identification?uri=' + identification.getUri()
    )
};

export default TagService;