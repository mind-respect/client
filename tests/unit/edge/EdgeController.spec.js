import Mock from '../mock/Mock'
import ThreeScenario from "../scenario/ThreeScenario";
import MindMapInfo from '@/MindMapInfo'
import EdgeController from '@/edge/EdgeController'
import TestUtil from '../util/TestUtil'
import GroupRelationsScenario from "../scenario/GroupRelationsScenario";
import IdUri from '@/IdUri'
import ConvertVertexToGroupRelationScenario from "../scenario/ConvertVertexToGroupRelationScenario";
import LeaveContextChoiceAScenario from "../scenario/LeaveContextChoiceAScenario";
import LeaveContextTechChoiceScenario from "../scenario/LeaveContextTechChoiceScenario";
import TwoLevelGroupRelationScenario from "../scenario/TwoLevelGroupRelationScenario";
import CurrentSubGraph from "../../../src/graph/CurrentSubGraph";

describe("EdgeController", () => {
    describe("remove", function () {
        it("can", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let numberOfChild = bubble1.getNumberOfChild();
            let relation1 = bubble1.getNextBubble();
            MindMapInfo.setIsAnonymous(false);
            MindMapInfo._setIsViewOnly(false);
            await new EdgeController.RelationController(
                relation1
            ).removeDo();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild - 1);
        });
        it("decrements number of connected relations to the parent", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            expect(
                bubble1.model().getNumberOfConnectedEdges()
            ).toBe(
                2
            );
            let relation1 = bubble1.getNextBubble();
            await relation1.controller().remove(true);
            expect(
                bubble1.model().getNumberOfConnectedEdges()
            ).toBe(
                1
            );
        });
    });
    describe("addChild", function () {
        it("changes to a group relation when adding a child", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            expect(
                TestUtil.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeFalsy();
            await new EdgeController.RelationController(
                TestUtil.getChildWithLabel(bubble1, "r1")
            ).addChild();
            expect(
                TestUtil.getChildWithLabel(bubble1, "r1").isGroupRelation()
            ).toBeTruthy();
        });

        it("sets self as external uri", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let b1 = threeBubblesScenario.getBubble1InTree();
            await b1.controller().addChild();
            let newRelation = TestUtil.getChildWithLabel(
                b1,
                ""
            );
            await newRelation.controller().setLabel("new group");
            await newRelation.controller().addChild();
            let groupRelation = TestUtil.getChildWithLabel(
                b1,
                "new group"
            );
            let originalRelation = groupRelation.getNextChildren()[0];
            expect(
                originalRelation.isEdge()
            ).toBeTruthy();
            groupRelation = originalRelation.getParentBubble();
            expect(groupRelation.isGroupRelation()).toBeTruthy();
            expect(
                IdUri.isEdgeUri(
                    groupRelation.getUri()
                )
            ).toBeFalsy();
            expect(
                groupRelation.getIdentification().getExternalResourceUri().indexOf(originalRelation.getUri()) > -1
            ).toBeTruthy();
        });
        it("adds self identifier to the original relation with appropriate uri", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
            let relation1Uri = relation1.getUri();
            await new EdgeController.RelationController(
                relation1
            ).addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(bubble1, "r1");
            relation1 = newGroupRelation.getNextBubble();
            expect(
                relation1.getIdentifiers().length
            ).toBe(1);
            expect(
                relation1.getUri()
            ).toBe(relation1Uri);
            let tagUri = newGroupRelation.getIdentification().getUri();
            expect(
                relation1.getIdentifiers()[0].getUri()
            ).toBe(tagUri);
        });

        it("after adding a child, the new group relation has the original relation as an identifier", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
            let relation1Uri = relation1.getUri();
            await new EdgeController.RelationController(
                relation1
            ).addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(bubble1, "r1");
            let identifierExternalResourceUri = newGroupRelation.getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri.indexOf(relation1Uri) > -1
            ).toBeTruthy();
        });

        it("when a relation has an identifier adding a child changes to a group relation where the identifier is not the relation but the identifier", async () => {
            let threeBubblesScenario = await new ThreeScenario();
            let bubble1 = threeBubblesScenario.getBubble1InTree();
            let relation1 = TestUtil.getChildWithLabel(bubble1, "r1");
            let tag = TestUtil.dummyTag();
            tag.setLabel("moustache");
            relation1.model().addIdentification(tag);
            await new EdgeController.RelationController(
                relation1
            ).addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(bubble1, "moustache");
            let identifierExternalResourceUri = newGroupRelation.getIdentification().getExternalResourceUri();
            expect(
                identifierExternalResourceUri
            ).toBe(tag.getExternalResourceUri());
        });

        it("adds new relation under the group relation when adding a child to a relation under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let centerVertex = scenario.getCenterInTree();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(4);
            let groupRelation = TestUtil.getChildWithLabel(
                centerVertex,
                "Possession"
            );
            groupRelation.expand();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(3);
            let relationUnderGroupRelation = groupRelation.getNextBubble();
            await relationUnderGroupRelation.controller().addChild();
            expect(
                centerVertex.getNumberOfChild()
            ).toBe(4);
        });

        it("adds all the identifiers of the relation to the the new child relation when adding a child", async () => {
            let scenario = await new GroupRelationsScenario();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let relationUnderGroupRelation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possessed by book 2"
            );
            let triple = await relationUnderGroupRelation.controller().addChild();
            expect(
                triple.edge.getIdentifiers().length
            ).toBe(2);
        });

        it("does not duplicate relations under the new group relation", async () => {
            let scenario = await new ThreeScenario();
            let center = scenario.getBubble1InTree();
            let newRelation;
            await center.controller().addChild().then(function (tripleUi) {
                newRelation = tripleUi.edge;
            });
            await newRelation.controller().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                center,
                ""
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                newGroupRelation.getNumberOfChild()
            ).toBe(2);
        });

        it("prevents adding tags related to sibling group relations", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let g2 = TestUtil.getChildWithLabel(
                group1,
                "g2"
            );
            let triple = await g2.controller().addChild();
            await scenario.nextTickPromise();
            expect(
                triple.edge.getIdentifiers().length
            ).toBe(2);
        });
    });

    //todo
    xit("removes only one relation when removing a relation to a duplicated bubble", async () => {
        let graphWithCircularityScenario = await new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var bubble3 = TestUtils.getChildWithLabel(
            bubble1,
            "r3"
        ).getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble3(bubble3);
        var aRelationToSameBubble = bubble3.getTopMostChildBubble();
        expect(
            aRelationToSameBubble.text()
        ).toBe("r2");
        var anotherRelationToTheSameBubble = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        );
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelationToSameBubble
            )
        ).toBeFalsy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                anotherRelationToTheSameBubble
            )
        ).toBeFalsy();
        MindMapInfo._setIsViewOnly(false);
        new EdgeController.RelationController(
            aRelationToSameBubble
        ).remove(true);
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelationToSameBubble
            )
        ).toBeTruthy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                anotherRelationToTheSameBubble
            )
        ).toBeFalsy();
    });
    //todo
    xit("removes other instances of duplicated relation when removing", function () {
        var graphWithCircularityScenario = new Scenarios.graphWithCircularityScenario();
        var bubble1 = graphWithCircularityScenario.getBubble1InTree();
        var aRelation = TestUtils.getChildWithLabel(
            bubble1,
            "r3"
        );
        var bubble2 = TestUtils.getChildWithLabel(
            bubble1,
            "r1"
        ).getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble2(bubble2);
        var bubble3 = bubble2.getTopMostChildBubble().getTopMostChildBubble();
        graphWithCircularityScenario.expandBubble3(bubble3);
        var sameRelation = bubble3.getTopMostChildBubble();
        expect(
            aRelation.text()
        ).toBe("r3");
        expect(
            sameRelation.text()
        ).toBe("r3");
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelation
            )
        ).toBeFalsy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                sameRelation
            )
        ).toBeFalsy();
        MindMapInfo._setIsViewOnly(false);
        new EdgeController.RelationController(
            aRelation
        ).remove(true);
        expect(
            TestUtils.isGraphElementUiRemoved(
                aRelation
            )
        ).toBeTruthy();
        expect(
            TestUtils.isGraphElementUiRemoved(
                sameRelation
            )
        ).toBeTruthy();
    });

    it("changes destination vertex if relation is inverse when changing end vertex", async () => {
        let changeSourceVertexSpy = Mock.getSpy(
            "EdgeService",
            "changeSourceVertex"
        );
        changeSourceVertexSpy.mockClear();
        let changeDestinationVertexSpy = Mock.getSpy(
            "EdgeService",
            "changeDestinationVertex"
        );
        changeDestinationVertexSpy.mockClear();
        let scenario = await new ThreeScenario();
        let b1 = scenario.getBubble1InTree();
        let r1 = TestUtil.getChildWithLabel(
            b1,
            "r1"
        );
        let b2 = r1.getNextBubble();
        let r2 = TestUtil.getChildWithLabel(
            b1,
            "r2"
        );
        await scenario.expandBubble2(b2);
        await r2.controller().replaceParentVertex(
            b2
        );
        expect(
            changeSourceVertexSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationVertexSpy.mock.calls.length
        ).toBe(0);
        await r2.controller().reverse();
        await r2.controller().replaceParentVertex(
            b1
        );
        expect(
            changeSourceVertexSpy.mock.calls.length
        ).toBe(1);
        expect(
            changeDestinationVertexSpy.mock.calls.length
        ).toBe(1);
    });
    it("can add a child to a relation under a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let centerBubble = scenario.getCenterInTree();
        let centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.controller().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            newGroupRelation.text()
        ).toBe("Possession of book 1");
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            centerBubble.getNumberOfChild()
        ).toBe(centerBubbleNumberOfChild);
    });
    it("does not hide the new group relation when adding a child to a relation under a group relation", async () => {
        let scenario = await new GroupRelationsScenario();
        let groupRelation = scenario.getPossessionGroupRelation();
        groupRelation.expand();
        let relationUnderGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            relationUnderGroupRelation.isGroupRelation()
        ).toBeFalsy();
        await relationUnderGroupRelation.controller().addChild();
        let newGroupRelation = TestUtil.getChildWithLabel(
            groupRelation,
            "Possession of book 1"
        );
        expect(
            newGroupRelation.isGroupRelation()
        ).toBeTruthy();
        expect(
            newGroupRelation.isShrinked()
        ).toBeFalsy();
    });
    describe("addChild", function () {
        it("excludes self identifier when adding a child and already having identifiers", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            let identifier = TestUtil.dummyTag();
            identifier.setLabel("some identifier");
            r1.model().addIdentification(
                identifier
            );
            await r1.controller().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "some identifier"
            );
            expect(
                newGroupRelation.isGroupRelation()
            ).toBeTruthy();
            let newRelation = TestUtil.getChildWithLabel(
                centerBubble,
                "some identifier"
            );
            expect(
                newGroupRelation.model().getIdentifiers().length
            ).toBe(1);
        });
        it("includes previous vertex in group relation model vertices", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            await scenario.getOtherRelationInTree().controller().addChild();
            let newGroupRelation = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                newGroupRelation.getNumberOfChild()
            ).toBe(2);
        });
        //todo
        xit("can add child to a relation under a group relation where the external uri is this relation's uri", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            await center.controller().addChild().then(async (tripleUi) => {
                let newEdge = tripleUi.edge;
                tripleUi.destination.controller().setLabel("top vertex");
                newEdge.controller().setLabel("parent group relation");
                return newEdge.controller().addChild();
            });
            let parentGroupRelation = TestUtil.getChildWithLabel(
                center,
                "parent group relation"
            );
            expect(parentGroupRelation.isGroupRelation()).toBeTruthy();
            let topMostEdge = parentGroupRelation.getNextBubble();
            await topMostEdge.controller().setLabel("top most edge");
            expect(
                topMostEdge.getUri()
            ).toBe(parentGroupRelation.getIdentification().getExternalResourceUri());
            expect(
                parentGroupRelation.getNumberOfChild()
            ).toBe(2);
            await topMostEdge.controller().addChild();
            expect(
                parentGroupRelation.getNumberOfChild()
            ).toBe(2);
            topMostEdge = TestUtil.getChildWithLabel(
                parentGroupRelation,
                "top most edge"
            );
            expect(
                topMostEdge.isGroupRelation()
            ).toBeTruthy();
            expect(
                topMostEdge.getNumberOfChild()
            ).toBe(2);
        });
    });
    describe("becomeParent", function () {
        it("adds it's identifiers to the moved edge when becoming a parent", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );

            let b3 = r2.getNextBubble();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            r1.model().addIdentification(
                TestUtil.dummyTag()
            );
            expect(
                r2.model().getIdentifiers().length
            ).toBe(0);
            await b3.controller().moveUnderParent(r1);
            expect(
                r2.model().getIdentifiers().length
            ).toBe(1);
        });
        it("only adds it's tag and it's group relation tag when under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = TestUtil.getChildWithLabel(
                center,
                "Possession"
            );
            groupRelation.expand();
            let relation = TestUtil.getChildWithLabel(
                groupRelation,
                "Possession of book 1"
            );
            await relation.controller().addIdentification(TestUtil.dummyTag());
            let otherBubble = TestUtil.getChildWithLabel(
                center,
                "other relation"
            ).getNextBubble();
            await relation.controller().becomeParent(otherBubble);
            relation = groupRelation.getNextBubble();
            await scenario.nextTickPromise();
            let otherRelation = TestUtil.getChildWithLabel(
                relation,
                "other relation"
            );
            expect(
                otherRelation.getIdentifiers().length
            ).toBe(2);
        });
        it("adds the relation's identifier to the child relation", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            let b3 = r2.getNextBubble();
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            expect(
                r2.model().getIdentifiersIncludingSelf().length
            ).toBe(1);
            await b3.controller().moveUnderParent(r1);
            expect(
                r2.model().getIdentifiersIncludingSelf().length
            ).toBe(2);
        });

        it("can become parent of a relation", async () => {
            let scenario = await new ThreeScenario();
            let centerBubble = scenario.getBubble1InTree();
            let r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(
                r2.getNumberOfChild()
            ).toBe(1);
            let r1 = TestUtil.getChildWithLabel(
                centerBubble,
                "r1"
            );
            expect(
                r1.controller()._canMoveUnderParent(r2)
            ).toBeTruthy();
            await r1.controller().moveUnderParent(r2);
            r2 = TestUtil.getChildWithLabel(
                centerBubble,
                "r2"
            );
            expect(r2.isGroupRelation()).toBeTruthy();
            expect(
                r2.getNumberOfChild()
            ).toBe(2);
            r1 = TestUtil.getChildWithLabel(
                r2,
                "r1"
            );
            expect(
                r1.getParentBubble().getLabel()
            ).toBe("r2");
        });
        it("can become parent of a group relation", async () => {
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
        it("can become parent of one of its descendant", async () => {
            let scenario = await new ConvertVertexToGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let relation = center.getNextBubble();
            expect(
                relation.isEdge()
            ).toBeTruthy();
            expect(
                relation.getNumberOfChild()
            ).toBe(1);
            let b2 = await scenario.getExpandedB2();
            let deepVertex = b2.getNextBubble().getNextBubble();
            expect(
                deepVertex.getLabel()
            ).toBe("b3");
            await deepVertex.controller().moveUnderParent(relation);
            expect(
                center.getNumberOfChild()
            ).toBe(1);
            let groupRelation = center.getNextBubble();
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(2);
            b2 = groupRelation.getNextBubble().getNextBubble();
            expect(
                b2.getLabel()
            ).toBe("b2");
            let b3 = b2.getDownBubble();
            expect(
                b3.getLabel()
            ).toBe("b3");
        });
        it("removes tag of moved relation that was under a group relation", async () => {
            let scenario = await new GroupRelationsScenario();
            let center = scenario.getCenterInTree();
            let groupRelation = scenario.getPossessionGroupRelation();
            groupRelation.expand();
            let otherEdge = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                otherEdge.isEdge()
            ).toBeTruthy();
            let book1 = groupRelation.getNextBubble().getNextBubble();
            expect(
                book1.getLabel()
            ).toBe("book 1");
            let book2 = book1.getDownBubble();
            expect(
                book2.getLabel()
            ).toBe("book 2");
            await book2.controller().removeDo();
            expect(
                TestUtil.hasChildWithLabel(
                    center,
                    "Possession"
                )
            ).toBeTruthy();
            await book1.controller().moveUnderParent(otherEdge);
            otherEdge = TestUtil.getChildWithLabel(
                center,
                "other relation"
            );
            expect(
                otherEdge.isGroupRelation()
            ).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(
                    center,
                    "Possession"
                )
            ).toBeFalsy();
            let book1Rel = TestUtil.getChildWithLabel(
                otherEdge,
                "Possession of book 1"
            );
            expect(
                book1Rel.getIdentifiers().length
            ).toBe(1)
        });

        it("adds self ref as tag when under a group relation", async () => {
            let scenario = await new TwoLevelGroupRelationScenario();
            let center = scenario.getCenterInTree();
            let group1 = TestUtil.getChildWithLabel(center, "group1");
            let group2 = TestUtil.getChildWithLabel(group1, "group2");
            group2.expand();
            let g22 = TestUtil.getChildWithLabel(group2, "g22");
            let g23 = TestUtil.getChildWithLabel(group2, "g23");
            expect(
                g23.hasIdentification(group2.getIdentification())
            ).toBeTruthy();
            expect(
                g23.hasIdentification(group1.getIdentification())
            ).toBeTruthy();
            expect(
                g23.getIdentifiers().some((tag) => {
                    return tag.getExternalResourceUri().indexOf(g22.getUri() + "/ref/") > -1;
                })
            ).toBeFalsy();
            await g23.getNextBubble().controller().moveUnderParent(g22);
            expect(
                g23.hasIdentification(group2.getIdentification())
            ).toBeTruthy();
            expect(
                g23.hasIdentification(group1.getIdentification())
            ).toBeTruthy();
            expect(
                g23.getIdentifiers().some((tag) => {
                    return tag.getExternalResourceUri().indexOf(g22.getUri() + "/ref/") > -1;
                })
            ).not.toBeFalsy();
        });
    });
    describe("leaveContextDo", function () {
        it("removes the edge when copied and tagged bubble is parent vertex", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            await relation.controller().leaveContextDo();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeFalsy();
        });
        it("changes destination vertex to a tag when it's children", async () => {
            let scenario = await new LeaveContextTechChoiceScenario();
            let center = scenario.getCenterInTree();
            let choiceA = TestUtil.getChildDeepWithLabel(center, "choice a");
            let relation = choiceA.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            expect(
                choiceA.getIdentifiers().length
            ).toBe(0);
            expect(
                choiceA.getNumberOfChild()
            ).toBe(2);
            await relation.controller().leaveContextDo();
            expect(
                TestUtil.hasChildWithLabel(center, "rel label")
            ).toBeTruthy();
            choiceA = TestUtil.getChildDeepWithLabel(center, "choice a");
            expect(
                choiceA.getIdentifiers().length
            ).toBe(1);
            expect(
                choiceA.getNumberOfChild()
            ).toBe(0);
        });
        it("increments number of references of tag to parent when destination vertex is removed", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.setLabel("rel label");
            expect(relation.isEdge()).toBeTruthy();
            expect(
                center.getIdentifiersIncludingSelf()[0].getNbReferences()
            ).toBe(0);
            await relation.controller().leaveContextDo();
            expect(
                center.getIdentifiersIncludingSelf()[0].getNbReferences()
            ).toBe(1);
        });
        it("adds new vertex in current sub graph", async () => {
            let scenario = await new LeaveContextChoiceAScenario();
            let center = scenario.getCenterInTree();
            let techChoice = TestUtil.getChildDeepWithLabel(center, "tech choice");
            let relation = techChoice.getParentBubble();
            relation.inverse();
            await relation.controller().leaveContextDo();
            let newDestinationVertex = relation.getNextBubble();
            expect(
                CurrentSubGraph.get().hasUri(
                    newDestinationVertex.getUri()
                )
            ).toBeTruthy();
        });
    });
});