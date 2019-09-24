const Dragged = {
    dragged: null,
    handleDrop: function (event, parent, isLeft) {
        // console.log("dropped " + parent.getLabel());
        if (parent.isDragOver) {
            return Dragged.dragged.controller().moveUnderParent(
                parent
            );
        }
        event.stopPropagation();
        event.preventDefault();
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