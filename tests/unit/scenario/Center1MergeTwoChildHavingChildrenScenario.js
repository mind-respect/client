import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";
import ThreeScenario from "./ThreeScenario";
import SingleChildScenario from "./SingleChildScenario";

let Center1MergeTwoChildHavingChildrenScenario = function () {
    this.dataKey = "mergeTwoChildHavingChildren.center1SubGraph";
    return this.init();
};

Center1MergeTwoChildHavingChildrenScenario.prototype = new Scenario.Scenario();

Center1MergeTwoChildHavingChildrenScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center1");
};
Center1MergeTwoChildHavingChildrenScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center1");
};

Center1MergeTwoChildHavingChildrenScenario.prototype.expandB2 = function (b2) {
    GraphServiceMock.getForCentralBubbleUri(
        Scenario.getTestData(
            "mergeTwoChildHavingChildren.b2SubGraph"
        )
    );
    return b2.controller().expand();
};

Center1MergeTwoChildHavingChildrenScenario.prototype.getB2AfterMerge = function () {
    return Scenario.getTestData(
        "mergeTwoChildHavingChildren.b2SubGraphAfterMerge"
    );
};

export default Center1MergeTwoChildHavingChildrenScenario