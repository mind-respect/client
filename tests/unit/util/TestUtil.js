import Edge from '@/edge/Edge'
import Vertex from '@/vertex/Vertex'
import Identification from '@/identifier/Identification'

const api = {};
api.generateVertex = function () {
    return Vertex.withUri(
        api.generateVertexUri()
    );
};
api.generateEdge = function (sourceVertexUri, destinationVertexUri) {
    return Edge.fromServerFormat(
        Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
            api.generateEdgeUri(),
            sourceVertexUri,
            destinationVertexUri
        )
    );
};

api.generateVertexUri = function (userName) {
    userName = userName || "églantier";
    return "\/service\/users\/" + userName + "\/graph\/vertex\/" + generateUuid();
};

api.generateEdgeUri = function () {
    return "\/service\/users\/églantier\/graph\/edge\/" + generateUuid();
};

api.generateIdentificationUri = function () {
    return "\/service\/users\/églantier\/graph\/identification\/" + generateUuid();
};
api.dummyIdentifier = function () {
    let tag = Identification.withUri(
        api.generateIdentificationUri()
    );
    tag.setExternalResourceUri(
        api.generateVertexUri()
    );
    return tag;
};

api.getChildWithLabel = function (parent, label) {
    let child = parent.getImmediateChild().filter((child) => {
        return child.getLabel() === label;
    });
    if (child.length) {
        return child[0]
    }
};

api.hasChildWithLabel = function (parent, label) {
    return api.getChildWithLabel(parent, label) !== undefined;
};

api.getChildWithLabelAndType = function (parent, label, graphElementType) {
    let child = parent.getImmediateChild().filter((child) => {
        return child.getLabel() === label && child.isInTypes([graphElementType])
    });
    if (child.length) {
        return child[0]
    }
};

export default api;

function generateUuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}