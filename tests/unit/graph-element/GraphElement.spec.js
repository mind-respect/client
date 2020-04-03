import Mock from '../mock/Mock'
import TestUtil from '../util/TestUtil'
import ThreeScenario from "../scenario/ThreeScenario"
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import Selection from '@/Selection'
import Tag from '@/tag/Tag'
import ShareLevel from "@/vertex/ShareLevel";
import CreationDateScenario from "../scenario/CreationDateScenario";

describe("GraphElement", () => {
    describe("addTag", () => {
        it("adds self tag to the bubble with external uri if already on map", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let b2 = TestUtil.getChildWithLabel(
                center,
                "r1"
            ).getNextBubble();
            let b2Tag = Tag.fromFriendlyResource(b2);
            b2 = TestUtil.getChildWithLabel(
                center,
                "r1"
            ).getNextBubble();
            expect(
                b2.getRelevantTags().length
            ).toBe(0);
            await center.controller().addIdentification(b2Tag, true);
            b2 = TestUtil.getChildWithLabel(
                center,
                "r1"
            ).getNextBubble();
            expect(
                b2.getRelevantTags().length
            ).toBe(1);
        });
    });

    xit("can tell the difference between vertex and schema", async () => {
        let scenario = await new ThreeScenario();
        let vertex = scenario.getBubble1Ui();
        var schema = new Scenarios.getKaraokeSchemaGraph().getSchemaUi();
        expect(
            vertex.isVertex()
        ).toBeTruthy();
        expect(
            vertex.isSchema()
        ).toBeFalsy();
        expect(
            schema.isVertex()
        ).toBeFalsy();
        expect(
            schema.isSchema()
        ).toBeTruthy();
    });

    //todo
    xit("adds the same identification to other instances of the element", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
        var karaokeIdentification = Tag.fromFriendlyResource(
            new Scenarios.getKaraokeSchemaGraph().getSchema()
        );
        expect(
            bubble1Duplicate.getModel().hasIdentifications()
        ).toBeFalsy();
        karaokeIdentification.makeGeneric();
        bubble1.controller().addIdentification(
            karaokeIdentification
        );
        expect(
            bubble1Duplicate.getModel().hasIdentifications()
        ).toBeTruthy();
    });

    //todo
    xit("is no longer draggable when in edit mode", function () {
        var threeBubblesGraph = new Scenarios.threeBubblesGraph();
        var bubble2 = threeBubblesGraph.getBubble2InTree();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeTruthy()
        bubble2.editMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeFalsy();
    });

    //todo
    xit("is draggable again when leaving edit mode", function () {
        var threeBubblesGraph = new Scenarios.threeBubblesGraph();
        var bubble2 = threeBubblesGraph.getBubble2InTree();
        bubble2.editMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeFalsy();
        bubble2.leaveEditMode();
        expect(
            bubble2.getHtml()[0].hasAttribute("draggable")
        ).toBeTruthy();
    });
    // it("non draggable elements are not made draggable after leaving edit mode", function () {
    //     var threeBubblesGraph = new Scenarios.threeBubblesGraph();
    //     var aRelation = threeBubblesGraph.getBubble1InTree().getTopMostChildBubble();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    //     aRelation.editMode();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    //     aRelation.leaveEditMode();
    //     expect(
    //         aRelation.getHtml()
    //     ).not.toHaveAttr("draggable");
    // });
    //todo
    xit("prevents iframe injection", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("<iframe></iframe>");
        expect(
            bubble1.getLabel().html()
        ).toBe("");
    });
    //todo
    xit("prevents script injection", function () {
        var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        bubble1.setText("<script>alert('yo')</script>");
        expect(
            bubble1.getLabel().html()
        ).toBe("");
    });

    //todo
    xit("changes label of duplicate relations", function () {
        var duplicateRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup(),
            impact3InTheIndividualContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext(),
            impact3InSocietyContext = duplicateRelationsScenario.getImpact3RelationInTheImpactOnSocietyContext();

        impact3InTheIndividualContext.focus();
        impact3InTheIndividualContext.getLabel().append(" new text");
        impact3InTheIndividualContext.getLabel().blur();
        expect(
            impact3InTheIndividualContext.text()
        ).toBe(
            "impact 3 new text"
        );
        expect(
            impact3InSocietyContext.text()
        ).toBe(
            "impact 3 new text"
        );
    });

    //todo
    xit("changes label of duplicate vertices", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble1Duplicate = graphWithCircularityScenario.getBubble1Duplicate();
        bubble1.focus();
        bubble1.getLabel().append(" new text");
        bubble1.getLabel().blur();
        expect(
            bubble1.text()
        ).toBe(
            "b1 new text"
        );
        expect(
            bubble1Duplicate.text()
        ).toBe(
            "b1 new text"
        );
    });

    //todo
    xit("comparing label sets html markup", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        var bubble1 = scenario.getBubble1InTree();
        bubble1.getModel().addIdentification(
            Tag.fromFriendlyResource(
                bubble1.getModel()
            )
        );
        bubble1.setText("banana");
        bubble1.getModel().setLabel("banana");
        expect(
            bubble1.getLabel()
        ).not.toContainElement(
            "del"
        );
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                scenario.getGraph()
            )
        );
        expect(
            bubble1.getLabel()
        ).toContainElement(
            "del"
        );
    });

    //todo
    xit("re-compares label after label change in comparison mode", function () {
        var scenario = new Scenarios.threeBubblesGraph();
        var bubble1 = scenario.getBubble1InTree();
        bubble1.getModel().addIdentification(
            Tag.fromFriendlyResource(
                bubble1.getModel()
            )
        );
        TestUtils.enterCompareFlowWithGraph(
            SubGraph.fromServerFormat(
                scenario.getGraph()
            )
        );
        expect(
            bubble1.getLabel()
        ).not.toContainElement(
            "del"
        );
        bubble1.setText("banana");
        bubble1.getLabel().blur();
        expect(
            bubble1.getLabel()
        ).toContainElement(
            "del"
        );
    });


    //todo
    xit("updates input label if model text is different than input text in label update", function () {
        var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
        b1.getModel().setLabel("pine apple");
        expect(
            b1.getLabel().text()
        ).not.toBe("pine apple");
        b1.labelUpdateHandle();
        expect(
            b1.getLabel().text()
        ).toBe("pine apple");
    });


    it("can get descendants of a bubble where there is a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let center = scenario.getCenterInTree();
        Selection.reset();
        expect(
            Selection.getNbSelectedRelations()
        ).toBe(0);
        expect(
            Selection.getNbSelectedVertices()
        ).toBe(0);
        center.selectTree();
        expect(
            Selection.getNbSelectedRelations()
        ).toBe(0);
        expect(
            Selection.getNbSelectedVertices()
        ).toBe(9);
    });
    describe("removeTag", () => {
        it("decrements nb neighbors", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = TestUtil.getChildWithLabel(
                b1,
                "r1"
            ).getNextBubble();
            let tag = TestUtil.dummyTag();
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            tag.getNbNeighbors().incrementForShareLevel(ShareLevel.PRIVATE);
            b1.addIdentification(tag);
            b2.addIdentification(tag);
            expect(
                b1.getIdentifiers()[0].getNbNeighbors().getTotal()
            ).toBe(2);
            b2.removeTag(tag);
            expect(
                b1.getIdentifiers()[0].getNbNeighbors().getTotal()
            ).toBe(1);
        });
    });
    describe("buildChildrenIndex", function () {
        it("is in right order", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(
                b7
            );
            let b71 = TestUtil.getChildWithLabel(
                b7,
                "r71"
            ).getNextBubble();
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            let childrenIndexes = b7.buildChildrenIndex();
            expect(
                childrenIndexes[b71.getUri()].index
            ).toBe(0);
            expect(
                childrenIndexes[b72.getUri()].index
            ).toBe(1);
        });
        it("includes child vertices of inverse relations", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(
                b7
            );
            let r71 = TestUtil.getChildWithLabel(
                b7,
                "r71"
            );
            r71.inverse();
            let childrenIndexes = b7.buildChildrenIndex();
            let b71 = r71.getNextBubble();
            expect(
                childrenIndexes.hasOwnProperty(b71.getUri())
            ).toBeTruthy()
        });
        it("includes child vertices of inverse relations under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let parentVertex = scenario.getCenterInTree();
            let inverseRelation = TestUtil.getChildWithLabel(
                scenario.getPossessionGroupRelation(),
                "Possessed by book 2"
            );
            expect(
                inverseRelation.isInverse()
            ).toBeTruthy();
            expect(
                parentVertex.buildChildrenIndex().hasOwnProperty(
                    inverseRelation.getSourceVertex().getUri()
                )
            ).toBeTruthy();
        });
        it("does not have duplicate indexes when moving a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let topBubble = scenario.getOtherRelationInTree().getNextBubble();
            await scenario.getPossessionGroupRelation().controller().moveAbove(topBubble);
            let detailedIndex = center.buildChildrenIndex();
            let indexArray = Object.values(detailedIndex).map((entry) => {
                return entry.index;
            });
            let indexAsSet = [...new Set(indexArray)];
            expect(
                indexArray.length
            ).toBe(indexAsSet.length)
        });
        it("includes child vertices under group relations", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "Possession"
            );
            groupRelation.expand();
            let groupRelationUnder = groupRelation.getNextBubble();
            groupRelationUnder.expand();
            let vertexUnderDeepGroupRelation = groupRelationUnder.getNextBubble().getNextBubble();
            expect(
                vertexUnderDeepGroupRelation.isVertex()
            ).toBeTruthy();
            let vertexUnderGroupRelation = groupRelationUnder.getDownBubble().getNextBubble();
            expect(
                vertexUnderGroupRelation.isVertex()
            ).toBeTruthy();
            let childrenIndexes = center.buildChildrenIndex();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderGroupRelation.getUri())
            ).toBeTruthy();
            expect(
                childrenIndexes.hasOwnProperty(vertexUnderDeepGroupRelation.getUri())
            ).toBeTruthy();
        });
        it("includes child vertices under collapsed group relations", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerVertex = scenario.getCenterInTree();
            let possession = TestUtil.getChildWithLabel(centerVertex, "Possession");
            let secondLevelGroupRelation = TestUtil.getChildWithLabel(
                possession,
                "Possession of book 3"
            );
            possession.collapse();
            let deepVertex = secondLevelGroupRelation.getNextChildrenEvenIfCollapsed()[0].getDestinationVertex();
            secondLevelGroupRelation.collapse();
            expect(
                secondLevelGroupRelation.isGroupRelation()
            ).toBeTruthy();
            let childrenIndexes = centerVertex.buildChildrenIndex();
            expect(
                Object.keys(childrenIndexes).length
            ).toBe(8);
            expect(
                childrenIndexes.hasOwnProperty(deepVertex.getUri())
            ).toBeTruthy()
        });
        it("gives right order for center vertices", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let b4Uri;
            await center.controller().addChild().then((tripleUi) => {
                b4Uri = tripleUi.destination.getUri();
                tripleUi.destination.setLabel("b4");
            });
            let b2 = scenario.getBubble2InTree();
            let b3 = scenario.getBubble3InTree();
            let childrenIndexes = center.buildChildrenIndex();
            let b2Index = childrenIndexes[
                b2.getUri()
                ];
            expect(
                b2Index.index
            ).toBe(0);
            expect(
                b2Index.toTheLeft
            ).toBe(false);
            let b3Index = childrenIndexes[
                b3.getUri()
                ];
            expect(
                b3Index.toTheLeft
            ).toBe(true);
            expect(
                b3Index.index
            ).toBe(1);
            let b4Index = childrenIndexes[
                b4Uri
                ];
            expect(
                b4Index.toTheLeft
            ).toBe(false);
            expect(
                b4Index.index
            ).toBe(2);
        });
        it("prevents from setting left right when under a group relation under a non center vertex", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let otherBubble = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            await groupRelation.controller().moveUnderParent(otherBubble);
            expect(
                otherBubble.isToTheLeft()
            ).toBeFalsy();
            let books = [
                TestUtil.getChildDeepWithLabel(
                    groupRelation,
                    "book 1"
                ),
                TestUtil.getChildDeepWithLabel(
                    groupRelation,
                    "book 2"
                ),
                TestUtil.getChildDeepWithLabel(
                    groupRelation,
                    "book 3"
                ),
                TestUtil.getChildDeepWithLabel(
                    groupRelation,
                    "book 3 copy"
                )
            ];
            let otherDirectionChildrenIndex = {};
            for (let i = 0; i < books.length; i++) {
                otherDirectionChildrenIndex[books[i].getUri()] = {
                    index: i,
                    toTheLeft: true
                }
            }
            otherBubble.setChildrenIndex(
                otherDirectionChildrenIndex
            );
            expect(
                otherBubble.getChildrenIndex()[books[0].getUri()].toTheLeft
            ).toBeTruthy();
            let builtIndex = otherBubble.buildChildrenIndex();
            expect(
                builtIndex[books[0].getUri()].toTheLeft
            ).toBeTruthy();
        });
    });
});