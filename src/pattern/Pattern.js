import GraphElement from '@/graph-element/GraphElement'

const Pattern = function (patternServerFormat) {
    this.patternServerFormat = patternServerFormat;
    GraphElement.GraphElement.apply(
        this.patternServerFormat.graphElement
    );
    GraphElement.GraphElement.prototype.init.call(
        this,
        this.patternServerFormat.graphElement
    );
};

Pattern.prototype = new GraphElement.GraphElement();

Pattern.prototype.getContext = function () {
    return this.patternServerFormat.context;
};
export default Pattern;