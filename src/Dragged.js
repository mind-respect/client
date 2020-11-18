const Dragged = {
    dragged: null,
    handleDrop: function (event, parent, isLeft) {
        if (Dragged.dragged === undefined) {
            return;
        }
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
        }).filter((descendant) => {
            return descendant.shouldShow();
        }).forEach((child) => {
            child = child.getShownBubble();
            const position = child.getHtml().getBoundingClientRect();
            const leftPosition = position.left + document.scrollingElement.scrollLeft
            const rightPosition = position.right + document.scrollingElement.scrollLeft;
            const topPosition = position.top + document.scrollingElement.scrollTop;
            const bottomPosition = position.bottom + document.scrollingElement.scrollTop;
            let closestX;
            if (x < leftPosition) {
                closestX = leftPosition;
            } else if (x > rightPosition) {
                closestX = rightPosition;
            } else {
                closestX = x;
            }
            let closestY;
            if (y < topPosition) {
                closestY = topPosition;
            } else if (y > bottomPosition) {
                closestY = bottomPosition;
            } else {
                closestY = y;
            }
            let xDistance = x - closestX;
            let yDistance = y - closestY;
            let distance = Math.hypot(xDistance, yDistance);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChild = !child.isVertexType() || child.isParentRelationLess() ? child : child.getParentBubble();
                isAbove = y - bottomPosition < 0;
            }
        });
        return {
            child: closestChild,
            isAbove: isAbove
        }
    }

};

export default Dragged;