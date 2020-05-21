import Relation from '@/relation/Relation'
import Vertex from '@/vertex/Vertex'
import Tag from '@/tag/Tag'
import $ from 'jquery'
import ShareLevel from '@/vertex/ShareLevel'

const api = {};
api.generateVertex = function () {
    return Vertex.withUri(
        api.generateVertexUri()
    );
};
api.generateEdge = function (sourceVertexUri, destinationVertexUri) {
    sourceVertexUri = sourceVertexUri || api.generateVertexUri();
    destinationVertexUri = destinationVertexUri || api.generateVertexUri();
    return Relation.fromServerFormat(
        Relation.buildObjectWithUriOfSelfSourceAndDestinationVertex(
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
api.dummyTag = function () {
    let tag = Tag.withUri(
        api.generateIdentificationUri()
    );
    tag.identificationServerFormat.shareLevel = ShareLevel.PRIVATE;
    tag.setExternalResourceUri(
        api.generateVertexUri()
    );
    return tag;
};

api.getChildWithLabel = function (parent, label) {
    let child = parent.getNextChildren().filter((child) => {
        return child.getLabel() === label;
    });
    if (child.length) {
        return child[0]
    }
};

api.getChildDeepWithLabel = function (parent, label) {
    let child = parent.getDescendants().filter((child) => {
        return child.getLabel() === label;
    });
    if (child.length) {
        return child[0]
    }
};


api.hasChildWithLabel = function (parent, label) {
    return api.getChildWithLabel(parent, label) !== undefined;
};

api.hasDeepChildWithLabel = function (parent, label) {
    return api.getChildDeepWithLabel(parent, label) !== undefined;
};


api.getChildWithLabelAndType = function (parent, label, graphElementType) {
    let child = parent.getNextChildren().filter((child) => {
        return child.getLabel() === label && child.isInTypes([graphElementType])
    });
    if (child.length) {
        return child[0]
    }
};

api.pressCtrlPlusKey = function (char) {
    api.pressKey(
        char, {ctrlKey: true}
    );
};

api.pressKey = function (char, options) {
    api.pressKeyCode(
        char.charCodeAt(0),
        options
    );
};
api.pressKeyCode = function (keyCode, options) {
    api._pressKeyCodeInContainer(
        keyCode,
        $("body"),
        options
    );
};
api.pressEnterInBubble = function (bubble) {
    api._pressKeyCodeInContainer(
        13,
        bubble.getLabel(),
        {}
    );
};
api.pressKeyInBubble = function (char, bubble) {
    bubble.getLabel().append(char);
    api._pressKeyCodeInContainer(
        char.charCodeAt(0),
        bubble.getLabel(),
        {}
    );
};

api._pressKeyCodeInContainer = function (keyCode, container, options) {
    var event = $.Event("keydown");
    if (options !== undefined) {
        $.extend(event, options);
    }
    event.which = event.keyCode = keyCode;
    container.trigger(event);
};

api.logChildren = function (bubble) {
    console.log(
        bubble.getNextChildren().map((a) => {
            return a.getLabel();
        })
    );
};
api.logDescendants = function (bubble) {
    console.log(
        bubble.getDescendants().map((a) => {
            return a.getLabel();
        })
    );
};

api.logTree = function (bubble) {
    console.log(
        bubble.getDescendants().filter((descendant) => {
            return descendant.isEdge();
            return descendant;
        }).map((edge) => {
            let space = "";
            let distance = api._getDistance(edge, bubble);
            while (distance--) {
                space += " ";
            }
            return space + edge.getLabel() + " -> " + edge.getNextBubble().getLabel();
        })
    );
};
api._getDistance = function (descendant, ancestor) {
    let distance = 0;
    while (descendant.getParentVertex().getId() !== ancestor.getId()) {
        distance++;
        descendant = descendant.getParentVertex();
    }
    return distance;
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