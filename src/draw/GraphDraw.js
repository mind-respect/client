import EdgeDrawing from '@/draw/EdgeDrawing'

function GraphDraw(bubble) {
    this.bubble = bubble
}

GraphDraw.prototype.build = function () {
    let path = "";
    if (this.bubble.isToTheLeft() || this.bubble.isCenter) {
        let edgeDrawing = new EdgeDrawing(this.bubble, true);
        path += edgeDrawing.build();
    }
    if (!this.bubble.isToTheLeft() || this.bubble.isCenter) {
        let edgeDrawing = new EdgeDrawing(this.bubble, false);
        path += edgeDrawing.build();
    }
    this.bubble.getNextChildren().forEach((child) => {
        let graphDraw = new GraphDraw(child);
        path += graphDraw.build();
    });
    return path;
};

export default GraphDraw;