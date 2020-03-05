import Scenario from './Scenario'
import GraphServiceMock from "../mock/GraphServiceMock";
import ThreeScenario from "./ThreeScenario";

let Center2MergeTwoChildHavingChildrenScenario = function () {
    this.dataKey = "mergeTwoChildHavingChildren.center2SubGraph";
    return this.init();
};

Center2MergeTwoChildHavingChildrenScenario.prototype = new Scenario.Scenario();

Center2MergeTwoChildHavingChildrenScenario.prototype.getCenter = function () {
    return this.vertexWithLabelInServerGraph("center2");
};
Center2MergeTwoChildHavingChildrenScenario.prototype.getCenterInTree = function () {
    return this.getVertexWithLabelInTree("center2");
};

export default Center2MergeTwoChildHavingChildrenScenario