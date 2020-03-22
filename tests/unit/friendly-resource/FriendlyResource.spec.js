import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import Selection from '@/Selection'
import TestUtil from '../util/TestUtil'
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import CreationDateScenario from "../scenario/CreationDateScenario";
import PublicPrivateScenario from "../scenario/PublicPrivateScenario";

describe("FriendlyResource", () => {
    it("includes label comment and uri when building server format from ui", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        bubble1.setComment("some comment");
        let serverFormat = FriendlyResource.buildServerFormatFromUi(
            bubble1
        );
        let facade = FriendlyResource.fromServerFormat(
            serverFormat
        );
        expect(
            facade.getLabel()
        ).toBe("b1");
        expect(
            facade.getComment()
        ).toBe("some comment");
        expect(
            facade.getUri()
        ).toBe(bubble1.getUri());
    });
    it("returns child with deepest depth", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(b2);
        b2.getNextBubble().getNextBubble().setLabel("long text");
        let b1 = scenario.getBubble1InTree();
        let deepestDescendant = b1.getDeepestDescendant();
        expect(
            deepestDescendant.getLabel()
        ).toBe("long text")
    });
    it("can return parent bubble", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        var parentBubble = b2.getParentBubble();
        expect(
            parentBubble.text()
        ).toBe("r1");
    });
    it("returns center when getting parent bubble of center vertex", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getCenterBubbleInTree();
        let parentBubble = centerBubble.getParentBubble();
        expect(
            parentBubble.getUri()
        ).toBe(centerBubble.getUri());
    });
    it("can return parent vertex", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        let parentVertex = b2.getParentVertex();
        expect(
            parentVertex.text()
        ).toBe("b1");
    });
    it("returns grand parent if parent is not a vertex", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        await scenario.expandBubble2(b2);
        let newVertex = b2.getNextBubble().getNextBubble();
        expect(
            newVertex.getParentVertex().getUri()
        ).toBe(b2.getUri());
    });
    it("can get parent vertex of a vertex under a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let centerBubble = scenario.getCenterInTree();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let bubbleUnderGroupRelation = groupRelation.getNextBubble().getNextBubble();
        expect(
            bubbleUnderGroupRelation.getParentVertex().getUri()
        ).toBe(centerBubble.getUri());
    });

    it("returns self when getting child of leaf", async () => {
        let scenario = await new ThreeScenario();
        let b2 = scenario.getBubble2InTree();
        expect(
            b2.getNextBubble().getUri()
        ).toBe(b2.getUri());
    });

    describe("getUpBubble", () => {
        it("can get bubble above an edge", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            let r71 = b7.getNextBubble();
            expect(
                r71.getLabel()
            ).toBe("r71");
            let r72 = r71.getDownBubble();
            expect(
                r72.getLabel()
            ).toBe("r72");
            r71 = r72.getUpBubble();
            expect(
                r71.getLabel()
            ).toBe("r71");
        });

        it("can get bubble above a vertex", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            let b71 = b7.getNextBubble().getNextBubble();
            expect(
                b71.getLabel()
            ).toBe("b71");
            let b72 = b71.getDownBubble();
            expect(
                b72.getLabel()
            ).toBe("b72");
            b71 = b72.getUpBubble();
            expect(
                b71.getLabel()
            ).toBe("b71");
        });

        it("returns itself when getting bubble above center vertex", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            expect(
                centerBubble.getUpBubble().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble above", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.getUpBubble().getId()
            ).toBe(b2.getId());
        });

        it("returns bottom bubble of above tree when getting above bubble", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = scenario.getBubble2InTree();
            let triple = await b1.controller().addChild();
            let underB2 = triple.destination;
            await scenario.expandBubble2(b2);
            await b2.controller().addChild();
            triple = await b2.controller().addChild();
            let bottomBubbleUnderB2 = triple.destination;
            await underB2.controller().addChild();
            await underB2.controller().addChild();
            let topBubbleUnderB2 = underB2.getNextBubble().getNextBubble();
            let bubbleAbove = topBubbleUnderB2.getUpBubble();
            expect(
                bubbleAbove.isSameBubble(bottomBubbleUnderB2)
            ).toBeTruthy();
        });
    });

    describe("getDownBubble", () => {
        it("can get bubble below", async () => {
            let scenario = await new CreationDateScenario();
            let b7 = scenario.getBubble7InTree();
            await scenario.expandBubble7(b7);
            let r71 = b7.getNextBubble();
            expect(
                r71.getLabel()
            ).toBe("r71");
            let r72 = r71.getDownBubble();
            expect(
                r72.getLabel()
            ).toBe("r72");
        });

        it("can get bubble below even if both bubbles only share grand-parent", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            let childVertex = b2.getNextBubble().getNextBubble();
            let downBubble = childVertex.getDownBubble();
            expect(
                downBubble.isSameBubble(childVertex)
            ).toBeFalsy();
            expect(
                downBubble.getId() === childVertex.getId()
            ).toBeFalsy();
        });

        it("can get closest bubble below even if common parent is further away than grand-parent", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            let childVertex = b2.getNextBubble().getNextBubble();
            await childVertex.controller().addChild();
            let grandChild = childVertex.getNextBubble().getNextBubble();
            expect(
                grandChild.getDownBubble().getId()
            ).toBe(childVertex.getDownBubble().getId());
        });

        it("returns bubbles below and not it's child when it has one", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            let child = b2.getNextBubble().getDownBubble().getNextBubble();
            await child.controller().addChild();
            expect(
                child.getDownBubble().getId()
            ).toBe(child.getId());
        });

        it("returns itself when getting bubble under center vertex", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getCenterBubbleInTree();
            expect(
                centerBubble.getDownBubble().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble under", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.getDownBubble().getId()
            ).toBe(b2.getId());
        });
    });

    it("can tell if it has children", async () => {
        let scenario = await new ThreeScenario();
        let centerBubble = scenario.getCenterBubbleInTree();
        let b2 = scenario.getBubble2InTree();
        expect(
            centerBubble.hasChildren()
        ).toBeTruthy();
        expect(
            b2.hasChildren()
        ).toBeFalsy();
    });

    it("hides hidden relations container after expand", async () => {
        let scenario = await new ThreeScenario();
        let b3 = scenario.getBubble3InTree();
        expect(
            b3.canExpand()
        ).toBeTruthy();
        await scenario.expandBubble3(
            b3
        );
        expect(
            b3.canExpand()
        ).toBeFalsy();
    });

    it("shows hidden relations container of bubbles from expanded bubble", async () => {
        let scenario = await new ThreeScenario();
        await scenario.expandBubble3(
            scenario.getBubble3InTree()
        );
        let bubble4 = scenario.getBubble4InTree();
        expect(
            bubble4.canExpand()
        ).toBeTruthy();
    });

    //todo
    xit("doesn't integrate an identification's image if the identification is related to the parent group relation", async () => {
        var scenario = new Scenarios.groupRelationWithImage();
        var someProject = scenario.getSomeProject();
        var idea = TestUtils.getChildWithLabel(someProject, "idea");
        expect(
            idea.hasImages()
        ).toBeTruthy();
        idea.controller().expand();
        var ideaFor1 = TestUtils.getChildWithLabel(idea, "idea for 1");
        var ideaFor2 = TestUtils.getChildWithLabel(idea, "idea for 2");
        expect(
            ideaFor1.hasImages()
        ).toBeFalsy();
        expect(
            ideaFor2.hasImages()
        ).toBeFalsy();
    });
    describe("moveTo", () => {
        it("can move to another parent", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            expect(
                centerBubble.getNextChildren().length
            ).toBe(2);
            let bubble3 = scenario.getBubble3InTree();
            expect(
                bubble3.getNextChildren().length
            ).toBe(0);
            let relation1 = scenario.getRelation1InTree();
            relation1.moveToParent(bubble3);
            expect(
                centerBubble.getNextChildren().length
            ).toBe(1);
            expect(
                bubble3.getNextChildren().length
            ).toBe(1);
        });
        it("also moves a vertex's parent relation when moving a vertex", async () => {
            let scenario = await new ThreeScenario();
            let bubble3 = scenario.getBubble3InTree();
            expect(
                bubble3.getNextChildren().length
            ).toBe(0);
            var bubble2 = scenario.getBubble2InTree();
            bubble2.moveToParent(bubble3);
            expect(
                bubble3.getNextBubble().getLabel()
            ).toBe("r1");
        });
        it("expands a closed group relation when moving a graph element to it", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerBubble = scenario.getCenterInTree();
            let possessionGroupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            possessionGroupRelation.collapse();
            expect(
                possessionGroupRelation.isExpanded
            ).toBeFalsy();
            let otherRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            otherRelation.moveToParent(
                possessionGroupRelation
            );
            expect(
                possessionGroupRelation.isExpanded
            ).toBeTruthy();
        });

        //todo
        xit("removes image related to an identification when a relation moved to a group relation that shares that identification", function () {
            var scenario = new Scenarios.groupRelationWithImage();
            var centerBubble = scenario.getSomeProject();
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            var idea = scenario.getIdeaGroupRelationInTree();
            expect(
                idea.hasImages()
            ).toBeTruthy();
            idea.getGroupRelation().getIdentification().makeGeneric();
            otherRelation.controller().addIdentification(
                idea.getGroupRelation().getIdentification()
            );
            expect(
                otherRelation.hasImages()
            ).toBeFalsy();
            otherRelation.moveToParent(idea);
            expect(
                otherRelation.hasImages()
            ).toBeFalsy();
        });

        it("can move a group relation under a relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            let otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            groupRelation.expand();
            expect(
                TestUtil.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeFalsy();
            await groupRelation.controller().moveUnderParent(otherRelation);
            otherRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                TestUtil.hasChildWithLabel(
                    otherRelation,
                    "Possession"
                )
            ).toBeTruthy();
        });

        it("changes direction when moving to the other side", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            let deepChild = b2.getNextBubble().getNextBubble();
            expect(
                deepChild.isToTheLeft()
            ).toBeFalsy();
            await deepChild.controller().moveAbove(b3);
            expect(
                deepChild.isToTheLeft()
            ).toBeTruthy();
        });
        it("preserves the direction of the edge when moving", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            let deepChild = b2.getNextBubble().getNextBubble();
            expect(
                deepChild.getParentBubble().isInverse()
            ).toBeFalsy();
            await deepChild.controller().moveAbove(b3);
            expect(
                deepChild.getParentBubble().isInverse()
            ).toBeFalsy();
        });
        it("prevents duplicates when moving to the other side", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let numberOfChild = center.getNumberOfChild();
            let b2 = scenario.getBubble2InTree();
            await scenario.expandBubble2(b2);
            expect(
                b2.isToTheLeft()
            ).toBeFalsy();
            let b3 = scenario.getBubble3InTree();
            expect(
                b3.isToTheLeft()
            ).toBeTruthy();
            await b2.controller().moveAbove(b3);
            expect(
                center.getNumberOfChild()
            ).toBe(numberOfChild);
        });
        it("doesn't create a duplicate when moving a bubble to the center vertex", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerBubble = scenario.getCenterInTree();
            let possessionGroupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            possessionGroupRelation.expand();
            let possessionRelation = TestUtil.getChildWithLabel(
                possessionGroupRelation,
                "Possession of book 1"
            );
            let centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
            possessionRelation.moveToParent(centerBubble);
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(centerBubbleNumberOfChild + 1);
        });
        it("can move a bubble above another", async () => {
            let scenario = await new CreationDateScenario();
            let b1 = scenario.getBubble1InTree();
            let b7 = TestUtil.getChildWithLabel(
                b1,
                "r6"
            ).getNextBubble();
            await scenario.expandBubble7(
                b7
            );
            let b73 = TestUtil.getChildWithLabel(
                b7,
                "r73"
            ).getNextBubble();
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            expect(
                b73.getUpBubble().getLabel()
            ).toBe("b72");
            expect(
                b73.getDownBubble().getLabel()
            ).toBe("b74");
            await b73.controller().moveAbove(
                b72
            );
            await scenario.nextTickPromise();
            b73 = TestUtil.getChildWithLabel(
                b7,
                "r73"
            ).getNextBubble();
            expect(
                b73.getUpBubble().getLabel()
            ).toBe("b71");
            expect(
                b73.getDownBubble().getLabel()
            ).toBe("b72");
        });
        it("can move a bubble under another", async () => {
            let scenario = await new CreationDateScenario();
            let b1 = scenario.getBubble1InTree();
            let b7 = TestUtil.getChildWithLabel(
                b1,
                "r6"
            ).getNextBubble();
            await scenario.expandBubble7(
                b7
            );
            let b72 = TestUtil.getChildWithLabel(
                b7,
                "r72"
            ).getNextBubble();
            let b73 = TestUtil.getChildWithLabel(
                b7,
                "r73"
            ).getNextBubble();
            expect(
                b72.getUpBubble().text()
            ).not.toBe("b73");
            expect(
                b72.getDownBubble().text()
            ).not.toBe("b74");
            await b72.controller().moveBelow(
                b73
            );
            expect(
                b72.getUpBubble().getLabel()
            ).toBe("b73");
            expect(
                b72.getDownBubble().getLabel()
            ).toBe("b74");
        });
        it("can move a vertex above a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let otherBubble = scenario.getOtherRelationInTree().getNextBubble();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            await otherBubble.controller().moveAbove(groupRelation);
            let grandParent = otherBubble.getParentBubble().getParentBubble();
            expect(
                grandParent.isSameUri(
                    scenario.getCenterInTree()
                )
            ).toBeTruthy();
        });
        it("can tell if one it has descendants with hidden relations", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            b1.collapse();
            expect(
                b1.canExpandDescendants()
            ).toBeTruthy();
            await scenario.expandBubble2(
                TestUtil.getChildWithLabel(
                    b1,
                    "r1"
                ).getNextBubble()
            );
            let b3 = TestUtil.getChildWithLabel(
                b1,
                "r2"
            ).getNextBubble();
            await scenario.expandBubble3(
                b3
            );
            expect(
                b1.canExpandDescendants()
            ).toBeTruthy();
            let b4 = TestUtil.getChildWithLabel(
                b3,
                "r3"
            ).getNextBubble();
            b4.remove();
            expect(
                b1.canExpandDescendants()
            ).toBeFalsy();
        });
        it("changes direction of children even if collasped", async () => {
            let scenario = await new GroupRelationsScenario();
            let possession = scenario.getPossessionGroupRelation();
            expect(possession.isToTheLeft()).toBeTruthy();
            possession.collapse();
            let underCollapse = possession.getNextChildrenEvenIfCollapsed()[0];
            expect(underCollapse.isToTheLeft()).toBeTruthy();
            let otherRelation = scenario.getOtherRelationInTree();
            expect(otherRelation.isToTheLeft()).toBeFalsy();
            await possession.controller().moveBelow(
                otherRelation
            );
            expect(possession.isToTheLeft()).toBeFalsy();
            underCollapse = possession.getNextChildrenEvenIfCollapsed()[0];
            expect(underCollapse.isToTheLeft()).toBeFalsy();
        });
    });
    describe("collapse", function () {
        xit("displays the hidden relations container after collapse", async () => {
            let scenario = await new ThreeScenario();
            let b2 = scenario.getBubble2InTree();
            expect(
                b2.canExpand()
            ).toBeTruthy();
            await scenario.expandBubble2(b2);
            expect(
                b2.canExpand()
            ).toBeFalsy();
            b2.collapse();
            expect(
                b2.canExpand()
            ).toBeTruthy();
        });
        xit("collapses child vertices for central vertex", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(b2);
            expect(
                b2.isExpanded()
            ).toBeTruthy();
            expect(
                b1.getNumberOfChild()
            ).toBe(2);
            b1.collapse();
            expect(
                b1.getNumberOfChild()
            ).toBe(2);
            expect(
                b2.isExpanded()
            ).toBeFalsy();
        });
        xit("collapses child group relations for central vertex", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            expect(
                groupRelation.isExpanded()
            ).toBeTruthy();
            centerBubble.collapse();
            expect(
                groupRelation.isExpanded()
            ).toBeFalsy();
        });
    });
    describe("remove", async () => {
        it("selects above sibling when available after it's removed", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let triple = await bubble1.controller().addChild();
            let newVertex = triple.destination;
            expect(
                newVertex.getUpBubble().text()
            ).toBe("b2");
            let bubble2 = scenario.getBubble2InTree();
            Selection.setToSingle(newVertex);
            expect(
                Selection.isSelected(bubble2)
            ).toBeFalsy();
            newVertex.setLabel("new vertex");
            await newVertex.controller().removeDo();
            expect(
                Selection.getSingle().getLabel()
            ).toBe("b2");
            expect(
                Selection.isSelected(bubble2)
            ).toBeTruthy();
        });
        it("selects bubble under when available after it's removed", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let triple = await bubble1.controller().addChild();
            let newVertex = triple.destination;
            expect(
                newVertex.getUpBubble().getLabel()
            ).toBe("b2");
            let bubble2 = scenario.getBubble2InTree();
            Selection.setToSingle(bubble2);
            expect(
                Selection.isSelected(newVertex)
            ).toBeFalsy();
            await bubble2.controller().removeDo();
            expect(
                Selection.isSelected(newVertex)
            ).toBeTruthy();
        });
        it("selects parent bubble when no siblings after it's removed", async () => {
            let scenario = await new ThreeScenario();
            let bubble1 = scenario.getBubble1InTree();
            let bubble2 = scenario.getBubble2InTree();
            Selection.setToSingle(bubble2);
            expect(
                Selection.isSelected(bubble1)
            ).toBeFalsy();
            await bubble2.controller().removeDo();
            expect(
                Selection.isSelected(bubble1)
            ).toBeTruthy();
        });
        it("selects parent bubble when no siblings after it's removed even when there's a tree above", async () => {
            let scenario = await new ThreeScenario();
            let b1 = scenario.getBubble1InTree();
            let b2 = scenario.getBubble2InTree();
            let triple = await b1.controller().addChild();
            let underB2 = triple.destination;
            await scenario.expandBubble2(b2);
            await b2.controller().addChild();
            await b2.controller().addChild();
            await underB2.controller().addChild();
            let childOfBubbleUnderB2 = underB2.getNextBubble().getNextBubble();
            Selection.setToSingle(childOfBubbleUnderB2);
            expect(
                Selection.isSelected(underB2)
            ).toBeFalsy();
            await childOfBubbleUnderB2.controller().removeDo();
            expect(
                Selection.isSelected(underB2)
            ).toBeTruthy();
        });
        it("selects under sibling when available after it's removed even when parent is a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            await scenario.nextTickPromise();
            let vertexAbove = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            ).getNextBubble();
            expect(
                vertexAbove.isVertex()
            ).toBeTruthy();
            let vertexUnder = vertexAbove.getDownBubble();
            await scenario.nextTickPromise();
            expect(
                vertexUnder.isVertex()
            ).toBeTruthy();
            expect(
                Selection.isSelected(vertexUnder)
            ).toBeFalsy();
            await vertexAbove.controller().removeDo();
            await scenario.nextTickPromise();
            expect(
                Selection.isSelected(vertexUnder)
            ).toBeTruthy();
        });
    });
    describe("selectTree", () => {
        it("prevents select twice if already selected", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getCenterInTree();
            let b2 = TestUtil.getChildWithLabel(
                center,
                "r1"
            ).getNextBubble();
            Selection.setToSingle(b2);
            await scenario.expandBubble2(b2);
            expect(
                Selection.getNbSelected()
            ).toBe(1);
            b2.selectTree();
            expect(
                Selection.getNbSelected()
            ).toBe(3);
        });
    });
    describe("getChildIndex", () => {
        it("sets right index to vertex when there is an expanded group relation above", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let center = scenario.getCenterInTree();
            let otherBubble = TestUtil.getChildWithLabel(center, "other relation").getNextBubble();
            await otherBubble.controller().moveBelow(groupRelation);
            expect(
                otherBubble.getUpBubble().isGroupRelation()
            ).toBeTruthy();
            let childIndex = otherBubble.getParentVertex().getChildIndex(
                otherBubble
            );
            expect(
                childIndex
            ).toBe(1);
        })
    });
});