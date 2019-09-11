const Dragged = {
    dragged: null,
    handleDrop: function (event, bubble, isLeft) {
        // console.log("dropped " + bubble.getLabel());
        if (bubble.isDragOver) {
            return Dragged.dragged.controller().moveUnderParent(
                bubble
            );
        }
        event.stopPropagation();
        let parent = bubble.isForkType() ? bubble : bubble.getParentFork();
        let minDistance = 99999999;
        let closestChildEdge;
        isLeft === undefined ? bubble.isToTheLeft() : isLeft;
        parent.getNextChildren(isLeft).forEach((childEdge) => {
            let position = childEdge.getHtml().getBoundingClientRect();
            let distance = event.pageY - position.top;
            // let centerExtraCondition = parent.isCenter ?
            //     (isLeft ? event.pageX < position.right : event.pageX > position.left) :
            //     true;
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChildEdge = childEdge;
            }
        });
        let method = minDistance > 0 ? "moveBelow" : "moveAbove";
        // console.log("closestChildEdge  " + closestChildEdge.getLabel());
        // console.log("dragged " + Dragged.dragged.getLabel());
        return Dragged.dragged.controller()[method](closestChildEdge);
    },
    handleCenterDrop: function (event, parent, isLeft) {
        // console.log("dropped " + parent.getLabel());
        if (parent.isDragOver) {
            return Dragged.dragged.controller().moveUnderParent(
                parent
            );
        }
        event.stopPropagation();
        let minDistance = 99999999;
        let closestChildEdge;
        let isAbove = false;
        parent.getDescendants(isLeft).forEach((childEdge) => {
            let position = childEdge.getHtml().getBoundingClientRect();
            // childEdge.getNextBubble().getHtml().getBoundingClientRect()
            let xPosition = (position.left + position.right) / 2;
            let yPosition = (position.top + position.bottom) / 2;
            let xDistance = event.pageX - xPosition;
            let yDistance = event.pageY - yPosition;
            let distance = Math.hypot(xDistance, yDistance);
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                closestChildEdge = childEdge;
                isAbove = yDistance < 0;
            }
        });
        let method = isAbove ? "moveAbove" : "moveBelow";
        // console.log("closestChildEdge  " + closestChildEdge.getLabel());
        // console.log("dragged " + Dragged.dragged.getLabel());
        return Dragged.dragged.controller()[method](closestChildEdge);
    }

};

export default Dragged;