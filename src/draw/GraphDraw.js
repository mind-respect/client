import EdgeDrawing from '@/draw/EdgeDrawing'

function GraphDraw(bubble, arrowHeadLength) {
    this.bubble = bubble
    this.arrowHeadLength = arrowHeadLength;
}

GraphDraw.prototype.build = function () {
    let path = "";
    if (this.bubble.isToTheLeft() || this.bubble.isCenter) {
        let edgeDrawing = new EdgeDrawing(this.bubble, true, this.arrowHeadLength);
        path += edgeDrawing.build();
    }
    if (!this.bubble.isToTheLeft() || this.bubble.isCenter) {
        let edgeDrawing = new EdgeDrawing(this.bubble, false, this.arrowHeadLength);
        path += edgeDrawing.build();
    }
    this.bubble.getNextChildren().filter((child) => {
        return child.draw;
    }).forEach((child) => {
        let graphDraw = new GraphDraw(child, this.arrowHeadLength);
        path += graphDraw.build();
    });
    return path;
};

export default GraphDraw;