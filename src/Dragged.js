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
        let closestChild = Dragged.getClosestChild(
            event.pageX,
            event.pageY,
            parent,
            isLeft
        );
        let method = closestChild.isAbove ? "moveAbove" : "moveBelow";
        if (!closestChild.child) {
            method = "moveUnderParent";
            closestChild.child = parent;
        }
        let parentVertex = closestChild.child.getParentVertex();
        if (parentVertex.isMeta() && !Dragged.dragged.getParentVertex().isMeta()) {
            return;
        }
        if (parentVertex.isMetaGroupVertex() && Dragged.dragged.getParentVertex().getUri() !== parentVertex.getUri()) {
            return;
        }
        return Dragged.dragged.controller()[method](closestChild.child, false, isLeft);
    },
    getClosestChild: function (x, y, parent, isLeft) {
        let minDistance = 99999999;
        let closestChild;
        let isAbove = false;

        parent.getDescendants(isLeft, (descendant) => {
            return !Dragged.dragged || descendant.getId() !== Dragged.dragged.getId();
        }).forEach((child) => {
            child = child.getShownBubble();
            let position = child.getHtml().getBoundingClientRect();
            let xPosition = (position.left + position.right) / 2 + document.scrollingElement.scrollLeft;
            let yPosition = (position.top + position.bottom) / 2 + document.scrollingElement.scrollTop;
            let xDistance = x - xPosition;
            let yDistance = y - yPosition;
            let distance = Math.hypot(xDistance, yDistance);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChild = !child.isVertexType() || child.isParentRelationLess() ? child : child.getParentBubble();
                isAbove = yDistance < 0;
            }
        });
        return {
            child: closestChild,
            isAbove: isAbove
        }
    }

};

export default Dragged;