/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario"
import GraphController from '@/graph/GraphController'

import GraphServiceMock from '../mock/GraphServiceMock'

describe("GraphController", function () {
    it("can expand all leafs", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        expect(
            b2.getNextChildren().length
        ).toBe(0);
        let b3 = scenario.getBubble3InTree();
        expect(
            b3.getNextChildren().length
        ).toBe(0);
        let multiple = {};
        multiple[b2.getUri()] = scenario.getSubGraphForB2();
        multiple[b3.getUri()] = scenario.getSubGraphForB3();
        GraphServiceMock.getForCentralBubbleUriMultiple(multiple);
        await GraphController.expandAll();
        expect(
            b2.getNextChildren().length
        ).toBe(2);
        expect(
            b3.getNextChildren().length
        ).toBe(2);
    });
});