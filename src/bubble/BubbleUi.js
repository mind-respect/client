/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import UiUtils from '@/UiUtils'
import ImageDisplayer from '@/image/ImageDisplayer'
import GraphElementUi from '@/graph-element/GraphElementUi'
import GraphElementType from '@/graph-element/GraphElementType'
import BubbleFactory from '@/bubble/BubbleFactory'
import SelectionHandler from '@/SelectionHandler'
import CenterBubble from '@/bubble/CenterBubble'
import MindMapInfo from '@/MindMapInfo'
import GraphUi from '@/graph/GraphUi'

const api = {};
api.MoveRelation = {
    "Parent": "parent",
    "After": "after",
    "Before": "before"
};

api.withHtml = function (html) {
    return new api.Bubble(html);
};

api.sortBubblesByNumberOfParentVerticesAscending = function (bubbles) {
    var centerVertex = GraphElementUi.getCenterBubble();
    return bubbles.sort(function (a, b) {
        var difference = a.calculateNumberOfParentVertices(
            centerVertex
            ) -
            b.calculateNumberOfParentVertices(
                centerVertex
            );
        if (0 === difference) {
            return a.getNumberOfSiblingsAbove() - b.getNumberOfSiblingsAbove();
        }
        return difference;
    });
};

api.getImmediateChildBubbleHtmlForContainer = function (container) {
    return container.find(
        "> .vertex-tree-container > .vertex-container > .bubble"
    );
};

api.Bubble = function (html) {
    this.html = html;
};

api.Bubble.prototype = new GraphElementUi.GraphElementUi();

api.Bubble.prototype.calculateNumberOfParentVertices = function (centerVertex) {
    var numberOfParentVertices = 0;
    var parentVertex = this;
    while (!centerVertex.isSameBubble(parentVertex)) {
        numberOfParentVertices++;
        parentVertex = parentVertex.getParentVertex();
    }
    return numberOfParentVertices;
};

api.Bubble.prototype.moveTo = function (otherBubble, relation) {
    // if(this.isGroupRelation()){
    //     this.visitClosestChildOfType(GraphElementType.Relation, function(childRelation){
    //         childRelation.moveTo(
    //             otherBubble,
    //             relation
    //         );
    //     });
    //     return;
    // }
    if (this.isGroupRelation()) {
        this.expand();
    }
    if (this.isVertex()) {
        return this.getParentBubble().moveTo(
            otherBubble,
            relation
        );
    }
    var isOriginalToTheLeft = this.isToTheLeft();
    var treeContainer = this.getTreeContainer();
    var toMove = treeContainer.add(treeContainer.next(".clear-fix"));
    if (api.MoveRelation.Parent === relation) {
        if (otherBubble.isGroupRelation()) {
            if (!otherBubble.isExpanded()) {
                otherBubble.getController().expand();
            }
            var identification = otherBubble.getGroupRelation().getIdentification();
            if (this.getModel().hasIdentification(identification)) {
                this.revertIdentificationIntegration(identification);
            }
        }
    }
    if (api.MoveRelation.Parent === relation) {
        var newContainer;
        newContainer = otherBubble.isCenterBubble() ?
            CenterBubble.usingBubble(otherBubble).getContainerItShouldNextAddTo() :
            otherBubble.getHtml().closest(".vertex-container").siblings(".vertices-children-container");
        newContainer.append(
            toMove
        );
    } else {
        if (api.MoveRelation.Before === relation) {
            otherBubble.getTreeContainer().before(
                toMove
            );
        } else {
            otherBubble.getTreeContainer().next(".clear-fix").after(
                toMove
            );
        }
    }
    this._resetIsToTheLeft();
    if (isOriginalToTheLeft === this.isToTheLeft()) {
        return;
    }
    var treeContainers = treeContainer.add(
        treeContainer.find("> .vertices-children-container").find(".vertex-tree-container")
    );
    if (this.isToTheLeft()) {
        this.convertToLeft();
        $.each(treeContainers, convertTreeStructureToLeft);
    } else {
        this.visitDescendants(function (descendant) {
            descendant.convertToRight();
        });
        this.convertToRight();
        $.each(treeContainers, convertTreeStructureToRight);
    }
};

api.Bubble.prototype.moveToParent = function (parent) {
    return this.moveTo(
        parent,
        api.MoveRelation.Parent
    );
};
api.Bubble.prototype.moveAbove = function (newSibling) {
    return this.moveTo(
        newSibling,
        api.MoveRelation.Before
    );
};
api.Bubble.prototype.moveBelow = function (newSibling) {
    return this.moveTo(
        newSibling,
        api.MoveRelation.After
    );
};

function convertTreeStructureToLeft() {
    var treeContainer = $(this);
    treeContainer.find("> .vertex-container").prependTo(treeContainer);
    treeContainer.find("> .vertices-children-container").prependTo(treeContainer);
}

function convertTreeStructureToRight() {
    var treeContainer = $(this);
    treeContainer.find("> .vertex-container").appendTo(treeContainer);
    treeContainer.find("> .vertices-children-container").appendTo(treeContainer);
}

api.Bubble.prototype.convertToLeft = function () {
    this._resetIsToTheLeft();
    this.getModel().leftOriented = true;
    this.getInLabelButtonsContainer().insertAfter(
        this.getLabel()
    );
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().convertToLeft();
    }
    this.visitAllImmediateChild(function (child) {
        child.convertToLeft();
    });
};

api.Bubble.prototype.convertToRight = function () {
    this._resetIsToTheLeft();
    this.getModel().leftOriented = false;
    this.getInLabelButtonsContainer().insertBefore(
        this.getLabel()
    );
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().convertToRight();
    }
    this.visitAllImmediateChild(function (child) {
        child.convertToRight();
    });
};

api.Bubble.prototype.getParentBubble = function () {
    var parentHtml = this.html.closest(".vertices-children-container")
        .siblings(".vertex-container").find("> .bubble");
    if (parentHtml.length === 0) {
        return this;
    }
    return BubbleFactory.fromHtml(
        parentHtml
    );
};
api.Bubble.prototype.getParentVertex = function () {
    return this.getClosestParentInTypes(
        GraphElementType.getVertexTypes()
    );
};

api.Bubble.prototype.getParentMetaCenter = function () {
    return this.getClosestParentInTypes([
        GraphElementType.Meta
    ]);
};

api.Bubble.prototype.getParentSuggestionVertex = function () {
    return this.getClosestParentInTypes([
        GraphElementType.VertexSuggestion
    ]);
};
api.Bubble.prototype.getClosestParentInTypes = function (types) {
    var parentBubble = this.getParentBubble();
    if (this.isSameBubble(parentBubble)) {
        return this;
    }
    if (parentBubble.isInTypes(types)) {
        return parentBubble;
    }
    var ancestor = parentBubble.getClosestParentInTypes(types);
    return ancestor.isInTypes(types) ?
        ancestor :
        this;
};
api.Bubble.prototype.visitClosestChildVertices = function (visitor) {
    this.visitClosestChildOfType(
        GraphElementType.Vertex,
        visitor
    );
};
api.Bubble.prototype.visitClosestChildRelations = function (visitor) {
    this.visitClosestChildOfType(
        GraphElementType.Relation,
        visitor
    );
};
api.Bubble.prototype.visitClosestChildOfType = function (type, visitor) {
    return this.visitClosestChildInTypes(
        [type],
        visitor
    );
};
api.Bubble.prototype.visitClosestChildInTypes = function (types, visitor) {
    this.visitAllImmediateChild(function (child) {
        if (child.isInTypes(types)) {
            return visitor(child);
        } else {
            return child.visitClosestChildInTypes(
                types,
                visitor
            );
        }
    });
};
api.Bubble.prototype.isBubbleAChild = function (bubble) {
    return this.getChildrenContainer().find(
        "#" + bubble.getId()
    ).length > 0;
};

api.Bubble.prototype.getTopMostChildBubble = function () {
    if (!this.hasChildren()) {
        return this;
    }
    var container;
    if (this.isCenterBubble()) {
        container = api.getImmediateChildBubbleHtmlForContainer(
            CenterBubble.usingBubble(this).getRightContainer()
        );
        if (!container.length) {
            container = api.getImmediateChildBubbleHtmlForContainer(
                CenterBubble.usingBubble(this).getLeftContainer()
            );
        }
    } else {
        container = this.getChildrenBubblesHtml();
    }
    var topMostBubbleHtml = container.filter(
        ":first"
    );
    if (topMostBubbleHtml.length === 0) {
        return this;
    }
    return BubbleFactory.fromHtml(
        topMostBubbleHtml
    );
};

api.Bubble.prototype.getBottomMostChildBubble = function () {
    var topMostBubbleHtml = this.getChildrenBubblesHtml().filter(
        ":last"
    );
    if (topMostBubbleHtml.length === 0) {
        return this;
    }
    return BubbleFactory.fromHtml(
        topMostBubbleHtml
    );
};

api.Bubble.prototype.visitAllConnected = function (visitor) {
    $.each(this.getChildrenBubblesHtml(), function () {
        return visitor(BubbleFactory.fromHtml(
            $(this)
        ));
    });
    if (!this.isCenterBubble()) {
        visitor(
            this.getParentBubble()
        );
    }
};

api.Bubble.prototype.visitAllImmediateChild = function (visitor) {
    if (this.isCenterBubble()) {
        return this.visitAllImmediateChildAsCenterBubble(visitor);
    }
    $.each(this.getChildrenBubblesHtml(), function () {
        return visitor(BubbleFactory.fromHtml(
            $(this)
        ));
    });
};

api.Bubble.prototype.visitAllImmediateChildAsCenterBubble = function (visitor) {
    var centerBubble = CenterBubble.usingBubble(this);
    var leftBubblesHtml = api.getImmediateChildBubbleHtmlForContainer(
        centerBubble.getLeftContainer()
    );
    var rightBubblesHtml = api.getImmediateChildBubbleHtmlForContainer(
        centerBubble.getRightContainer()
    );
    var bubbleHtmlAtIndex = {};
    var childIndex = 0;
    defineIndexesForContainer(
        rightBubblesHtml,
        leftBubblesHtml.length
    );
    childIndex = 1;
    defineIndexesForContainer(
        leftBubblesHtml,
        rightBubblesHtml.length
    );
    Object.keys(bubbleHtmlAtIndex).sort(function (a, b) {
        return a - b;
    }).forEach(function (index) {
        visitor(
            BubbleFactory.fromSubHtml(bubbleHtmlAtIndex[index])
        );
    });

    function defineIndexesForContainer(container, nbInOtherContainer) {
        var currentContainerChildIndex = 0;
        container.each(function () {
            bubbleHtmlAtIndex[childIndex] = $(this);
            childIndex += currentContainerChildIndex++ <= nbInOtherContainer ? 2 : 1;
        });
    }
};

api.Bubble.prototype.getChildrenBubblesHtml = function () {
    return api.getImmediateChildBubbleHtmlForContainer(
        this.getChildrenContainer()
    );
};

api.Bubble.prototype.getInBubbleContainer = function () {
    return this.html.find(
        ".in-bubble-content"
    );
};

api.Bubble.prototype.getBubbleAbove = function () {
    var isAbove = true;
    return this._getColumnBubbleAboveOrUnder(
        isAbove
    );
};

api.Bubble.prototype.getNumberOfSiblingsAbove = function () {
    return this.getHtml().closest(
        ".vertex-tree-container"
    ).prevAll(
        ".vertex-tree-container"
    ).length;
};

api.Bubble.prototype.getIndexInTree = function () {
    return this._getIndexInTreeInTypes(
        [this.getGraphElementType()]
    );
};
api.Bubble.prototype.getUiIndexInTree = function () {
    return this.getNumberOfSiblingsAbove();
};
api.Bubble.prototype._getIndexInTreeInTypes = function (graphElementTypes) {
    var index = -1;
    var currentIndex = -1;
    this.getParentVertex().visitClosestChildInTypes(
        graphElementTypes,
        function (bubble) {
            currentIndex++;
            if (bubble.isSameBubble(this)) {
                index = currentIndex;
            }
        }.bind(this)
    );
    return index;
};

api.Bubble.prototype.getChildOfTypeAtIndex = function (type, index) {
    var currentIndex = -1;
    var childAtIndex = this;
    this.visitClosestChildOfType(
        type,
        function (bubble) {
            currentIndex++;
            if (index === currentIndex) {
                childAtIndex = bubble;
            }
        }.bind(this)
    );
    return childAtIndex;
};

api.Bubble.prototype.getBubbleUnder = function () {
    var isAbove = false;
    return this._getColumnBubbleAboveOrUnder(
        isAbove
    );
};

api.Bubble.prototype._getColumnBubbleAboveOrUnder = function (isAbove) {
    var surroundBubbleHtml = isAbove ? api._getBubbleHtmlAbove(
        this.html
    ) : api._getBubbleHtmlUnder(
        this.html
    );
    if (surroundBubbleHtml.length === 0) {
        return this._getColumnBubbleInAnotherBranch(isAbove);
    }
    return BubbleFactory.fromHtml(surroundBubbleHtml);
};

api.Bubble.prototype._getColumnBubbleInAnotherBranch = function (isAbove) {
    var distance = 1,
        parentBubble = this,
        surroundBubble,
        found = false,
        surroundBubbleHtml;
    do {
        parentBubble = parentBubble.getParentBubble();
        if (parentBubble.isCenterBubble()) {
            return this;
        }
        surroundBubbleHtml = isAbove ? api._getBubbleHtmlAbove(
            parentBubble.getHtml()
        ) : api._getBubbleHtmlUnder(
            parentBubble.getHtml()
        );
        if (surroundBubbleHtml.length !== 0) {
            found = true;
        } else {
            distance++;
        }
    } while (!found);
    surroundBubble = BubbleFactory.fromHtml(
        surroundBubbleHtml
    );
    while (distance !== 0) {
        surroundBubble = isAbove ?
            surroundBubble.getBottomMostChildBubble() :
            surroundBubble.getTopMostChildBubble();
        distance--;
    }
    return surroundBubble;
};

api.Bubble.prototype.getTreeContainer = function () {
    return this.html.closest(".vertex-tree-container");
};

api.Bubble.prototype.getChildrenContainer = function () {
    return this.html.closest(
        ".vertex-container"
    ).siblings(
        ".vertices-children-container"
    );
};

api._getBubbleHtmlUnder = function (html) {
    return html.closest(
        ".vertex-tree-container"
    ).nextAll(
        ".vertex-tree-container:first"
    ).find("> .vertex-container >.bubble");
};

api._getBubbleHtmlAbove = function (html) {
    return html.closest(
        ".vertex-tree-container"
    ).prevAll(
        ".vertex-tree-container:first"
    ).find("> .vertex-container >.bubble");
};

api.Bubble.prototype.hasChildren = function () {
    return this.getNumberOfChild() > 0;
};
api.Bubble.prototype.isALeaf = function () {
    return !this.hasChildren();
};
api.Bubble.prototype.getNumberOfChild = function () {
    return !this.getChildrenContainer().hasClass("hidden") && this.getChildrenBubblesHtml().length;
};
api.Bubble.prototype.getNumberOfChildEvenIfHidden = function () {
    return this.getChildrenBubblesHtml().length;
};
api.Bubble.prototype.getSelectorFromContainer = function (container) {
    return BubbleFactory.fromHtml(
        container.find("> .bubble")
    );
};

api.Bubble.prototype.isExpanded = function () {
    return !this.hasVisibleHiddenRelationsContainer();
};

api.Bubble.prototype.hasAnExpandedChild = function () {
    var hasAnExpandedChild = false;
    this.visitClosestChildVertices(function (vertexUi) {
        if (vertexUi.getNumberOfChild() > 0) {
            hasAnExpandedChild = true;
        }
    });
    this.visitAllImmediateChild(function (child) {
        if (child.isGroupRelation()) {
            if (child.getNumberOfChild() > 0) {
                hasAnExpandedChild = true;
            }
        }
    });
    return hasAnExpandedChild;
};

api.Bubble.prototype.hasHiddenRelationsContainer = function () {
    return undefined !== this.getHiddenRelationsContainer();
};

api.Bubble.prototype.hasVisibleHiddenRelationsContainer = function () {
    return this.hasHiddenRelationsContainer() && this.getHiddenRelationsContainer().isVisible();
};

api.Bubble.prototype.setHiddenRelationsContainer = function (hiddenRelationsContainer) {
    this.html.data(
        "hidden_properties_indicator",
        hiddenRelationsContainer
    );
};

api.Bubble.prototype.getHiddenRelationsContainer = function () {
    return this.html.data(
        "hidden_properties_indicator"
    );
};

api.Bubble.prototype.remove = function (ancestor, bubbleToSelect) {
    this._removeHideOrShow("remove");
    this.removeHiddenRelationsContainer();
    var sharesSameAncestor = bubbleToSelect && bubbleToSelect.isClosestAncestor(ancestor);
    if (!sharesSameAncestor) {
        bubbleToSelect = ancestor;
    }
    // GraphUi.refreshWidth();
    if (bubbleToSelect) {
        SelectionHandler.setToSingle(
            bubbleToSelect
        );
    }
};

api.Bubble.prototype.isClosestAncestor = function (ancestor) {
    return this.getClosestParentInTypes(
        [ancestor.getGraphElementType()]
    ).isSameBubble(ancestor);
};

api.Bubble.prototype.show = function () {
    this.showHiddenRelationsContainer();
    this._removeHideOrShow("removeClass", "hidden");
};

api.Bubble.prototype.hide = function () {
    this.hideHiddenRelationsContainer();
    this._removeHideOrShow("addClass", "hidden");
};

api.Bubble.prototype.isVisible = function () {
    return !this.html.closest(
        ".vertex-container"
        ).hasClass("hidden") && !this.getTreeContainer().hasClass("hidden") &&
        !this.getParentVertex().getChildrenContainer().hasClass("hidden");
};

api.Bubble.prototype._removeHideOrShow = function (action, argument) {
    SelectionHandler.removeAll();
    if (this.isCenterBubble()) {
        this.html.closest(".vertex-container")[action](argument);
    } else {
        var treeContainer = this.getTreeContainer(),
            clearFix = treeContainer.next(".clear-fix");
        clearFix[action](argument);
        treeContainer[action](argument);
    }
};

api.Bubble.prototype.showHiddenRelationsContainer = function () {
    if (this.hasHiddenRelationsContainer() && this.isCollapsed() && this.getNumberOfHiddenRelations() > 0) {
        this.getHiddenRelationsContainer().show();
    }
};

api.Bubble.prototype.hideHiddenRelationsContainer = function () {
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().hide();
    }
};

api.Bubble.prototype.removeHiddenRelationsContainer = function () {
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().remove();
    }
    this.html.removeData(
        "hidden_properties_indicator"
    );
};

api.Bubble.prototype.refreshImages = function () {
    var imageMenu =
        this.hasImagesMenu() ?
            this.getImageMenu() :
            this.createImageMenu();
    imageMenu.refreshImages();
};
api.Bubble.prototype.addImages = function (images) {
    var existingImages = this.getImages();
    this.html.data(
        "images",
        existingImages.concat(
            images
        )
    );
};
api.Bubble.prototype.removeImage = function (imageToRemove) {
    var images = [];
    $.each(this.getImages(), function () {
        var image = this;
        if (image.getBase64ForSmall() !== imageToRemove.getBase64ForSmall()) {
            images.push(image);
        }
    });
    this.html.data(
        "images",
        images
    );
};
api.Bubble.prototype.hasImages = function () {
    return this.getImages().length > 0;
};
api.Bubble.prototype.getImages = function () {
    return this.html.data("images") === undefined ?
        [] :
        this.html.data("images");
};

api.Bubble.prototype.hasImagesMenu = function () {
    return this.html.data("images_menu") !== undefined;
};

api.Bubble.prototype.createImageMenu = function () {
    var imageMenu = ImageDisplayer.ofBubble(
        this
    ).create();
    this.html.data("images_menu", imageMenu);
    return imageMenu;
};

api.Bubble.prototype.getImageMenu = function () {
    return this.html.data("images_menu");
};

api.Bubble.prototype.removeIdentifier = function (identifier) {
    var self = this;
    $.each(identifier.getImages(), function () {
        var image = this;
        self.removeImage(image);
    });
    if (this.hasImagesMenu()) {
        this.getImageMenu().refreshImages();
    }
    this.reviewInLabelButtonsVisibility();
};

api.Bubble.prototype.addIdentification = function (identification) {
    var parentBubble = this.getParentBubble();
    if (parentBubble.isGroupRelation()) {
        var areIdentificationsTheSame =
            identification.getExternalResourceUri() ===
            parentBubble.getGroupRelation().getIdentification().getExternalResourceUri();
        if (areIdentificationsTheSame) {
            return;
        }
    }
    this.addImages(
        identification.getImages()
    );
    if (identification.hasImages()) {
        this.refreshImages();
    }
    this.reviewInLabelButtonsVisibility();
};

api.Bubble.prototype.revertIdentificationIntegration = function (identification) {
    var self = this;
    $.each(identification.getImages(), function () {
        self.removeImage(this);
    });
    if (identification.hasImages()) {
        this.refreshImages();
    }
};

api.Bubble.prototype._resetIsToTheLeft = function () {
    this._isToTheLeft = undefined;
    this.getModel().isLeftOriented = this.isToTheLeft();
};

api.Bubble.prototype.isToTheLeft = function () {
    if (this._isToTheLeft === undefined) {
        this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
    }
    return this._isToTheLeft;
};

api.Bubble.prototype.isSameBubble = function (bubble) {
    return this.getId() === bubble.getId();
};

api.Bubble.prototype.isSameUri = function (bubble) {
    return this.getUri() === bubble.getUri();
};

api.Bubble.prototype.isSelected = function () {
    return this.html.hasClass("selected");
};

api.Bubble.prototype.setText = function (text) {
    return this.getLabel().saferHtml(text);
};

api.Bubble.prototype.getArrowHtml = function () {
    return this.html.closest(".vertex-tree-container").find(">.arrow");
};

api.Bubble.prototype.centerOnScreen = function () {
    this.getHtml().centerOnScreen();
};

api.Bubble.prototype.centerOnScreenWithAnimation = function () {
    var deferred = $.Deferred();
    var centerOptions = {
        done: deferred.resolve
    };
    var htmlToScroll = this.isGroupRelation() ? this.getHtml() : this.getHtml();
    if (this.isCenterBubble()) {
        htmlToScroll.centerOnScreenWithAnimation(centerOptions);
    }
    else if (this.isToTheLeft()) {
        htmlToScroll.centerRightSideOfScreenWithAnimation(centerOptions);
    } else {
        htmlToScroll.centerLeftSideOfScreenWithAnimation(centerOptions);
    }
    return deferred.promise();
};

api.Bubble.prototype.centerOnScreenWithAnimation = function () {
    var deferred = $.Deferred();
    var centerOptions = {
        done: deferred.resolve
    };
    this.getHtml().centerOnScreenWithAnimation(centerOptions);
};

api.Bubble.prototype.sideCenterOnScreenWithAnimation = function () {
    var deferred = $.Deferred();
    var centerOptions = {
        done: deferred.resolve
    };
    var htmlToScroll = this.isGroupRelation() ? this.getHtml() : this.getParentBubble().getHtml();
    if (this.isCenterBubble()) {
        htmlToScroll.centerOnScreenWithAnimation(centerOptions);
    }
    else if (this.isToTheLeft()) {
        htmlToScroll.centerRightSideOfScreenWithAnimation(centerOptions);
    } else {
        htmlToScroll.centerLeftSideOfScreenWithAnimation(centerOptions);
    }
    return deferred.promise();
};

api.Bubble.prototype.hasDescendantsWithHiddenRelations = function () {
    return this.getChildrenContainer().find(
        ".hidden-properties-container .hidden-properties-content:not(.hidden)"
    ).length > 0;
};

api.Bubble.prototype.visitDescendants = function (visitor) {
    return this.getChildrenContainer().find(
        ".bubble"
    ).each(function () {
        visitor(
            BubbleFactory.fromSubHtml(
                $(this)
            )
        );
    });
};

api.Bubble.prototype.visitExpandableDescendants = function (visitor) {
    return this.getChildrenContainer().find(
        ".hidden-properties-container .hidden-properties-content:not(.hidden)"
    ).each(function () {
        visitor(
            BubbleFactory.fromSubHtml(
                $(this)
            )
        );
    });
};

api.Bubble.prototype.collapse = function () {
    this.applyToOtherInstances(function (otherInstance) {
        otherInstance.reviewInLabelButtonsVisibility();
    });
    if (!this.hasChildren()) {
        return;
    }
    if (!this.isCenterBubble()) {
        this.getChildrenContainer().addClass(
            "hidden"
        );
        this.showHiddenRelationsContainer();
    }
    this.reviewMenuButtonsVisibility();
    this.visitClosestChildVertices(function (child) {
        child.collapse();
    });
    this.visitAllImmediateChild(function (child) {
        if (child.isGroupRelation()) {
            child.collapse();
        }
    });
    // GraphUi.refreshWidth();
    this.centerOnScreenWithAnimation();
};

api.Bubble.prototype.isCollapsed = function () {
    return this.getChildrenContainer().hasClass(
        "hidden"
    );
};

api.Bubble.prototype.beforeExpand = function () {
    if (!this.hasVisibleHiddenRelationsContainer()) {
        return;
    }
    this.getHiddenRelationsContainer().showLoading();
};

api.Bubble.prototype.expand = function (avoidScreenCenter, isChildExpand) {
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().hideLoading();
    }
    avoidScreenCenter = avoidScreenCenter || false;
    isChildExpand = isChildExpand || false;
    this.getChildrenContainer().removeClass(
        "hidden"
    );
    if (this.hasHiddenRelationsContainer()) {
        this.getHiddenRelationsContainer().hide();
    }
    this.applyToOtherInstances(function (otherInstance) {
        if (otherInstance.hasHiddenRelationsContainer()) {
            otherInstance.getHiddenRelationsContainer().hide();
        }
    });
    this.visitDescendants(function (descendant) {
        descendant.reviewInLabelButtonsVisibility(true);
    });
    // GraphUi.refreshWidth();
    if (!avoidScreenCenter && !isChildExpand && !this.getChildrenContainer().isFullyOnScreen()) {
        this.sideCenterOnScreenWithAnimation();
        SelectionHandler.setToSingle(this);
    }
    this.reviewMenuButtonsVisibility();
};

api.Bubble.prototype.buildHiddenNeighborPropertiesIndicator = function () {
    if (this.hasHiddenRelationsContainer()) {
        return;
    }
    var propertiesIndicator = VertexChildrenNotice.withBubble(
        this
    );
    this.setHiddenRelationsContainer(
        propertiesIndicator
    );
    propertiesIndicator.build();
    return propertiesIndicator;
};

api.Bubble.prototype.travelLeft = function () {
    if (this.isCenterBubble()) {
        var centerVertex = CenterBubble.usingBubble(
            this
        );
        if (!centerVertex.hasChildToLeft()) {
            return;
        }
        return selectNew(
            centerVertex.getToTheLeftTopMostChild()
        );
    }
    return selectNew(
        this.isToTheLeft() ?
            this.getTopMostChildBubble() :
            this.getParentBubble()
    );
};
api.Bubble.prototype.travelRight = function () {
    if (this.isCenterBubble()) {
        var centerVertex = CenterBubble.usingBubble(
            this
        );
        if (!centerVertex.hasChildToRight()) {
            return;
        }
        return selectNew(
            centerVertex.getToTheRightTopMostChild()
        );
    }
    return selectNew(
        this.isToTheLeft() ?
            this.getParentBubble() :
            this.getTopMostChildBubble()
    );
};
api.Bubble.prototype.travelUp = function () {
    selectNew(
        this.getBubbleAbove()
    );
};
api.Bubble.prototype.travelDown = function () {
    selectNew(
        this.getBubbleUnder()
    );
};
api.Bubble.prototype.isRemoved = function () {
    return this.html.closest(".vertices-children-container").length === 0;
};

api.Bubble.prototype.mergeTo = function (distantUri) {
    this.removeFromCache();
    this.getHtml().data("uri", distantUri);
    this.getModel().setUri(distantUri);
    this.initCache();
};

api.Bubble.prototype.tripleAdded = function (triple) {
    triple.sourceVertex().hideHiddenRelationsContainer();
    var destinationHtml = triple.destinationVertex().getHtml();
    // GraphUi.refreshWidth();
    if (!UiUtils.isElementFullyOnScreen(destinationHtml)) {
        destinationHtml.centerOnScreenWithAnimation();
    }
    SelectionHandler.setToSingle(triple.destinationVertex());
    if (MindMapInfo.isInCompareMode()) {
        triple.edge().setAsComparisonSuggestionToRemove();
        triple.destinationVertex().setAsComparisonSuggestionToRemove();
    }
};

function selectNew(newSelectedElement) {
    SelectionHandler.setToSingle(
        newSelectedElement
    );
}

export default api;
