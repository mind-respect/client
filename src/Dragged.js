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
        return Dragged.dragged.controller()[method](closestEdge.edge);
    },
    getClosestChildEdge: function (x, y, parent, isLeft) {
        let minDistance = 99999999;
        let closestChildEdge;
        let isAbove = false;
        parent.getDescendants(isLeft).forEach((childEdge) => {
            if (!childEdge.isEdge() && !childEdge.isGroupRelation()) {
                return;
            }
            let position = childEdge.getHtml().getBoundingClientRect();
            let xPosition = (position.left + position.right) / 2;
            let yPosition = (position.top + position.bottom) / 2;
            let xDistance = x - xPosition;
            let yDistance = y - yPosition;
            let distance = Math.hypot(xDistance, yDistance);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChildEdge = childEdge;
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