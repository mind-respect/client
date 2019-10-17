const Dragged = {
    dragged: null,
    handleDrop: function (event, parent, isLeft) {
        if (parent.isDragOver) {
            return Dragged.dragged.controller().moveUnderParent(
                parent
            );
        }
        event.stopPropagation();
        event.preventDefault();
        let closestEdge = Dragged.getClosestChildEdge(
            event.pageX,
            event.pageY,
            parent,
            isLeft
        );
        let method = closestEdge.isAbove ? "moveAbove" : "moveBelow";
        if (!closestEdge.edge) {
            method = "moveUnderParent";
            closestEdge.edge = parent;
        }
        let parentVertex = closestEdge.edge.getParentVertex();
        if (parentVertex.isMeta() && !Dragged.dragged.getParentVertex().isMeta()) {
            return;
        }
        if (parentVertex.isMetaGroupVertex() && Dragged.dragged.getParentVertex().getUri() !== parentVertex.getUri()) {
            return;
        }
        return Dragged.dragged.controller()[method](closestEdge.edge, isLeft);
    },
    getClosestChildEdge: function (x, y, parent, isLeft) {
        let minDistance = 99999999;
        let closestChildEdge;
        let isAbove = false;
        parent.getDescendants(isLeft).forEach((childEdge) => {
            let position = childEdge.getHtml().getBoundingClientRect();
            let xPosition = (position.left + position.right) / 2;
            let yPosition = (position.top + position.bottom) / 2;
            let xDistance = x - xPosition;
            let yDistance = y - yPosition;
            let distance = Math.hypot(xDistance, yDistance);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChildEdge = childEdge.isVertexType() ? childEdge.getParentBubble() : childEdge;
                isAbove = yDistance < 0;
            }
        });
        return {
            edge: closestChildEdge,
            isAbove: isAbove
        }
    }

};

export default Dragged;