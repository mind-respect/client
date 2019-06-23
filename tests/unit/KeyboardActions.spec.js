import Mock from './mock/Mock'
import ThreeScenario from "./scenario/ThreeScenario";
import Selection from '@/Selection'
import TestUtil from './util/TestUtil'
import MindMapInfo from '@/MindMapInfo'
import Command from '@/Command'
import AppController from '@/AppController'

describe("KeyboardActions", () => {
    it("adds a child when pressing tab key", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        Selection.setToSingle(bubble1);
        let numberOfChild = bubble1.getNumberOfChild();
        TestUtil.pressKey("\t");
        setTimeout(() => {
            expect(
                bubble1.getNumberOfChild()
            ).toBe(
                numberOfChild + 1
            );
        }, 0)

    });
    it("adds a child to a relation when pressing tab key", async () => {
        let scenario = await new ThreeScenario();
        let relation1 = scenario.getRelation1InTree();
        expect(
            relation1.getParentBubble().isGroupRelation()
        ).toBeFalsy();
        Selection.setToSingle(relation1);
        TestUtil.pressKey("\t");
        setTimeout(() => {
            expect(
                relation1.getParentBubble().isGroupRelation()
            ).toBeTruthy();
        }, 0)
    });
    it("focuses on bubble label of a selected bubble when user types", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        Selection.setToSingle(bubble1);
        expect(
            bubble1.isInEditMode
        ).toBeFalsy();
        TestUtil.pressKey("a");
        setTimeout(() => {
            expect(
                bubble1.isInEditMode
            ).toBeTruthy();
        }, 0);
    });

    //todo
    xit("calls identification method when pressing ctrl+g", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        Selection.setToSingle(bubble1);
        let actionSpy = spyOn(VertexController.VertexController.prototype, "identify");
        expect(
            actionSpy
        ).not.toHaveBeenCalled();
        TestUtil.pressCtrlPlusKey("G");
        expect(
            actionSpy
        ).toHaveBeenCalled();
    });

    it("does not focus when pressing control only", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        Selection.setToSingle(bubble1);
        let ctrlKeyCode = 17;
        TestUtil.pressKeyCode(ctrlKeyCode);
        setTimeout(() => {
            expect(
                bubble1.isInEditMode
            ).toBeFalsy();
        }, 0)
    });

    it("adds a sibling when pressing enter", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        let numberOfChild = bubble1.getNumberOfChild();
        let someChild = bubble1.getNextBubble().getNextBubble();
        Selection.setToSingle(someChild);
        let enterKeyCode = 13;
        TestUtil.pressKeyCode(enterKeyCode);
        setTimeout(() => {
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        }, 0);
    });

    it("prevents bubble content editing when in view only", async () => {
        let scenario = await new ThreeScenario();
        var bubble1 = scenario.getBubble1InTree();
        Selection.setToSingle(bubble1);
        bubble1.blur();
        TestUtil.pressKey("a");
        setTimeout(() => {
            expect(
                bubble1.isInEditMode
            ).toBeTruthy();
        }, 0);
        MindMapInfo._setIsViewOnly(true);
        bubble1.blur();
        TestUtil.pressKey("a");
        setTimeout(() => {
            expect(
                bubble1.isInEditMode
            ).toBeFalsy();
        }, 0);
    });

    it("can execute features for app controller when no bubbles are selected", async () => {
        await new ThreeScenario();
        Selection.removeAll();
        let actionSpy = jest.spyOn(AppController, "undo");
        expect(
            actionSpy
        ).not.toHaveBeenCalled();
        let command = Command.forExecuteUndoAndRedo(() => {
            return Promise.resolve();
        }, () => {
        }, () => {
        });
        Command.executeCommand(command);
        TestUtil.pressCtrlPlusKey("Z");
        setTimeout(() => {
            expect(
                actionSpy
            ).toHaveBeenCalled();
        }, 0)
    });

    it("can toggle to public or private with shortcut key", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        expect(
            bubble1.isPublic()
        ).toBeFalsy();
        Selection.setToSingle(bubble1);
        await TestUtil.pressCtrlPlusKey("P");
        setTimeout(() => {
            expect(
                bubble1.isPublic()
            ).toBeTruthy();
        })
    });

    it("can apply shortcut to multiple elements", async () => {
        let scenario = await new ThreeScenario();
        let bubble1 = scenario.getBubble1InTree();
        let bubble2 = scenario.getBubble2InTree();
        Selection.add(bubble1);
        Selection.add(bubble2);
        expect(
            bubble1.isPublic()
        ).toBeFalsy();
        expect(
            bubble2.isPublic()
        ).toBeFalsy();
        TestUtil.pressCtrlPlusKey("P");
        setTimeout(() => {
            expect(
                bubble1.getModel().isPublic()
            ).toBeTruthy();
            expect(
                bubble2.getModel().isPublic()
            ).toBeTruthy();
        }, 0)
    });
});