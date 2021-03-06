/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import FriendlyResource from '@/friendly-resource/FriendlyResource'
import IdUri from '@/IdUri'
import GraphDisplayer from '@/graph/GraphDisplayer'
import GraphElementType from '@/graph-element/GraphElementType'
import Vue from 'vue'
import Store from '@/store'
import Icon from '@/Icon'
import CurrentSubGraph from "../graph/CurrentSubGraph";
import ShareLevel from '@/vertex/ShareLevel'
import NbNeighbors from "../vertex/NbNeighbors";

const controllerGetters = {};

const GraphElement = {
    DEFAULT_FONT: {
        family: 'Roboto'
    },
    sortCompare: function (a, b, childrenIndex) {
        if (a.getIndex(childrenIndex) === b.getIndex(childrenIndex)) {
            if (a.getCreationDate() === b.getCreationDate()) {
                return 0;
            }
            if (a.getCreationDate() < b.getCreationDate()) {
                return -1;
            }
            return 1;
        }
        if (a.getIndex(childrenIndex) > b.getIndex(childrenIndex)) {
            return 1;
        }
        return -1;
    },
    fromServerFormat: function (serverFormat) {
        return new GraphElement.GraphElement().init(
            serverFormat
        );
    },
    buildServerFormatFromModel: function (graphElement) {
        return {
            friendlyResource: FriendlyResource.buildServerFormatFromModel(
                graphElement
            ),
            identifications: GraphDisplayer.getTagApi().getServerFormatArrayFromFacadeArray(
                graphElement.model().getIdentifiers()
            ),
            childrenIndex: graphElement.getChildrenIndex(),
            font: graphElement._graphElementServerFormat.font,
            copiedFromUri: graphElement._graphElementServerFormat.copiedFromUri
        }
    },
    withUri: function (uri) {
        return GraphElement.fromServerFormat(
            GraphElement.buildObjectWithUri(
                uri
            )
        );
    },
    buildObjectWithUri: function (uri) {
        return {
            friendlyResource: FriendlyResource.buildObjectWithUri(
                uri
            )
        };
    },
    fromDetailedSearchResult: function (detailedSearchResult) {
        return GraphElement.fromServerFormat(
            detailedSearchResult.graphElement
        );
    }
};

GraphElement.initMenuHandlerGetters = function () {
    controllerGetters[GraphElementType.Vertex] = GraphDisplayer.getVertexMenuHandler;
    controllerGetters[GraphElementType.Relation] = GraphDisplayer.getRelationMenuHandler;
    controllerGetters[GraphElementType.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
    controllerGetters[GraphElementType.Meta] = GraphDisplayer.getMetaController;
    controllerGetters[GraphElementType.MetaGroupVertex] = GraphDisplayer.getMetaGroupVertexController;
    controllerGetters[GraphElementType.VertexSkeleton] = function () {
        return {
            VertexSkeletonController: function () {
            }
        };
    };
    controllerGetters[GraphElementType.RelationSkeleton] = function () {
        return {
            RelationSkeletonController: function () {
            }
        };
    };
};

GraphElement.GraphElement = function () {
    this.areTagsShown = false;
};

GraphElement.wrapElementsInController = function (elements) {
    let nbSelectedGraphElements = elements.length;
    if (0 === nbSelectedGraphElements) {
        return GraphDisplayer.getGraphMenuHandler();
    } else if (1 === nbSelectedGraphElements) {
        return elements[0].controller();
    } else {
        let anyElementType = elements[0].getGraphElementType();
        let areAllElementsOfSameType = elements.every((element) => {
            return element.getGraphElementType() === anyElementType;
        });
        if (areAllElementsOfSameType) {
            return GraphElement.getControllerWithTypeAndElements(
                anyElementType,
                elements
            );
        }
        let graphElementControllerClass = GraphDisplayer.getGraphElementMenuHandler();
        return new graphElementControllerClass.GraphElementController(
            elements
        );
    }
};

GraphElement._getControllerNameFromType = function (type) {
    let controllerName = "";
    let nameParts = type.split("_");
    nameParts.forEach(function (namePart) {
        controllerName += namePart.charAt(0).toUpperCase() + namePart.substr(1);
    });
    return controllerName + "Controller";
};

GraphElement.getControllerWithTypeAndElements = function (type, elements) {
    let controller = GraphElement._getControllerClassFromType(type);
    return new controller[
        GraphElement._getControllerNameFromType(type)
        ](elements);
};

GraphElement._getControllerClassFromType = function (graphElementType) {
    return controllerGetters[
        graphElementType
        ]();
};

GraphElement.GraphElement.prototype = new FriendlyResource.FriendlyResource();

GraphElement.GraphElement.prototype.init = function (graphElementServerFormat) {
    this._graphElementServerFormat = graphElementServerFormat;
    FriendlyResource.FriendlyResource.apply(
        this
    );
    FriendlyResource.FriendlyResource.prototype.init.call(
        this,
        graphElementServerFormat.friendlyResource
    );
    this.setChildrenIndex(this._graphElementServerFormat.childrenIndex);
    this.setFont(this._graphElementServerFormat.font);
    this._buildIdentifications();
    this.childrenKey = IdUri.uuid();
    this.isSelected = false;
    // this.wikipediaLinksPromise = this._buildWikidataLinks();
    return this;
};


GraphElement.GraphElement.prototype.removeTag = function (tagToRemove, preventDecrementNeighbors) {
    let l = this.identifiers.length;
    while (l--) {
        let tag = this.identifiers[l];
        if (tag.getUri() === tagToRemove.getUri()) {
            this.identifiers.splice(l, 1);
            if (!preventDecrementNeighbors) {
                tag.getNbNeighbors().decrementForShareLevel(this.getShareLevel());
            }
            return false;
        }
    }
    return this.identifiers;
};

GraphElement.GraphElement.prototype.isPattern = function () {
    return false;
};

GraphElement.GraphElement.prototype.getShareLevel = function () {
    return ShareLevel.PRIVATE;
};

GraphElement.GraphElement.prototype.canChangeShareLevel = function () {
    return this.isInTypes([
        GraphElementType.Vertex,
        GraphElementType.Meta,
        GraphElementType.GroupRelation
    ]);
};


GraphElement.GraphElement.prototype.hasLooserShareLevelThan = function (other) {
    return ShareLevel.getIndex(
        this.getShareLevel()
    ) > ShareLevel.getIndex(
        other.getShareLevel()
    );
};

GraphElement.GraphElement.prototype.getSurround = function (evenIfCollapsed) {
    let connected = this.isCenter ? [] : [
        this.getParentBubble()
    ];
    return connected.concat(
        evenIfCollapsed ? this.getNextChildren() : this.getNextChildrenEvenIfCollapsed()
    );
};

GraphElement.GraphElement.prototype.isAncestor = function (graphElement) {
    return this.getAncestors().some((ancestor) => {
        return graphElement.getId() === ancestor.getId();
    });
};

GraphElement.GraphElement.prototype.rebuildNbNeighbors = function () {
    this.setNbNeighbors(this.buildNbNeighbors());
};

GraphElement.GraphElement.prototype.buildNbNeighbors = function (excludeTags) {
    let nbNeighbors = NbNeighbors.withZeros();
    this.getSurround(true).filter((graphElement) => {
        return !excludeTags || !graphElement.isMeta();
    }).forEach((surround) => {
        let otherFork = surround.isRelation() ? surround.getOtherVertex(this) : surround;
        nbNeighbors.incrementForShareLevel(otherFork.getShareLevel());
    });
    return nbNeighbors;
};

GraphElement.GraphElement.prototype.hasIdentifications = function () {
    return this.getTagsAndSelfIfRelevant().length > 0;
};


GraphElement.GraphElement.prototype.hasAllIdentifiers = function (identifiers) {
    return identifiers.every((tag) => {
        return this.hasIdentification(tag);
    });
};
GraphElement.GraphElement.prototype.getIdentifierHavingExternalUri = function (externalUri) {
    let matching = this.getIdentifiersIncludingSelf().filter((identifier) => {
        return identifier.getExternalResourceUri() === externalUri;
    });
    return matching.length ? matching[0] : false;
};

GraphElement.GraphElement.prototype.getIdentifiers = function () {
    return this.identifiers.filter((identifier) => {
        return identifier.getExternalResourceUri() !== this.getUri()
    });
};

GraphElement.GraphElement.prototype.getIdentifiersIncludingSelf = function (preventBuildingSelf) {
    let identifiers = [];
    let isSelfTagAlreadyIncluded = false;
    this.identifiers.forEach((identifier) => {
        if (identifier.getExternalResourceUri() === this.getUri()) {
            isSelfTagAlreadyIncluded = true;
        }
        identifiers.push(identifier);
    });
    if (!isSelfTagAlreadyIncluded && !preventBuildingSelf) {
        identifiers.unshift(
            this.buildSelfIdentifier()
        );
    }
    return identifiers;
};

GraphElement.GraphElement.prototype.getTagChildren = function () {
    const parentVertex = this.getParentVertex();
    return this.getTagsAndSelfIfRelevant().filter((tag) => {
        return parentVertex.getUri() !== tag.getUri();
    });
};

GraphElement.GraphElement.prototype.getNbTagChildren = function () {
    const nbTags = this.getTagsAndSelfIfRelevant().length;
    return this.getParentVertex().isMeta() ? nbTags - 1 : nbTags;
};

GraphElement.GraphElement.prototype.getTagsAndSelfIfRelevant = function () {
    return this.identifiers.filter((tag) => {
        return tag.getExternalResourceUri() !== this.getUri()
            || tag.getNbNeighbors().getTotalChildren() > 0;
    });
};

GraphElement.GraphElement.prototype.getRelevantTags = function () {
    return this.getIdentifiersIncludingSelf().filter(function (tag) {
        return tag.getNbNeighbors().getTotal() > 0;
    });
};

GraphElement.GraphElement.prototype.cloneTags = function (assignTo) {
    assignTo.identifiers = this.identifiers.map((tag) => {
        return tag.clone();
    });
};

GraphElement.GraphElement.prototype.refreshChildren = function (avoidRedraw, refreshComponent) {
    if (refreshComponent) {
        this.childrenKey = IdUri.uuid();
        if (this.component) {
            this.component.refreshChildren();
        }
    }
    return new Promise((resolve) => {
        if (avoidRedraw === true) {
            resolve();
            return;
        }
        Vue.nextTick(async () => {
            await Store.dispatch("redraw");
            setTimeout(async () => {
                await Store.dispatch("redraw");
                resolve();
            }, 250);
        });
    });
};

GraphElement.GraphElement.prototype.hasChildren = function () {
    return this.getNextChildren().length > 0;
};

GraphElement.GraphElement.prototype.refreshContent = function () {
    if (this.component) {
        this.component.refreshContent();
        // console.log("component refreshed")
    }
};

GraphElement.GraphElement.prototype.refreshButtons = function () {
    if (this.component) {
        this.component.refreshButtons();
        // console.log("component refreshed")
    }
};

GraphElement.GraphElement.prototype.refreshImages = function () {
    if (this.component) {
        this.component.refreshImages();
        // console.log("component refreshed")
    }
};

GraphElement.GraphElement.prototype.getShareIcon = function () {
    return ShareLevel.getIcon(
        this.getShareLevel()
    );
};

GraphElement.GraphElement.prototype.getSelfTag = function () {
    let selfTag = this.getIdentifierHavingExternalUri(
        this.getUri()
    );
    return selfTag ? selfTag : this.buildSelfIdentifier();
};

GraphElement.GraphElement.prototype._buildIdentifications = function () {
    this.identifiers = [];
    if (undefined === this._graphElementServerFormat.identifications) {
        return;
    }
    Object.values(
        this._graphElementServerFormat.identifications
    ).forEach((identifier) => {
        this.identifiers.push(
            GraphDisplayer.getTagApi().fromServerFormat(
                identifier
            )
        )
    });
};

GraphElement.GraphElement.prototype.hasTagNotBuildingSelf = function (tag) {
    return this._hasTagBuildingSelfOrNot(tag, true);
};

GraphElement.GraphElement.prototype.hasIdentification = function (tag) {
    return this._hasTagBuildingSelfOrNot(tag, false);

};

GraphElement.GraphElement.prototype._hasTagBuildingSelfOrNot = function (tag, preventBuildingSelf) {
    return this.getIdentifiersIncludingSelf(preventBuildingSelf).some((ownTag) => {
        return ownTag.getExternalResourceUri() === tag.getExternalResourceUri();
    });
};

GraphElement.GraphElement.prototype.hasTagRelatedToUri = function (uri) {
    return this.getIdentifiersIncludingSelf().some((identifier) => {
        return identifier.getExternalResourceUri() === uri ||
            identifier.getUri() === uri;
    });
};

GraphElement.GraphElement.prototype.getTagVertex = function () {
    return this.getClosestAncestorInTypes([GraphElementType.Meta]);
};

GraphElement.GraphElement.prototype.buildSelfIdentifier = function () {
    let tag = GraphDisplayer.getTagApi().fromFriendlyResource(
        this
    );
    FriendlyResource.FriendlyResource.prototype.setLabel.call(
        tag,
        this.getLabel()
    );
    FriendlyResource.FriendlyResource.prototype.setComment.call(
        tag,
        this.getComment()
    );
    return tag;
};

GraphElement.GraphElement.prototype.addIdentifications = function (identifications) {
    return identifications.forEach((identifier) => {
        this.addIdentification(
            identifier
        );
    });
};
GraphElement.GraphElement.prototype.addIdentification = function (tag) {
    if (this.hasTagNotBuildingSelf(tag)) {
        return;
    }
    if (!tag.hasRelationExternalUri()) {
        return this.addIdentification(
            tag.makeGeneric()
        );
    }
    if (tag.getExternalResourceUri() !== this.getUri()) {
        let original = CurrentSubGraph.get().getHavingUri(
            tag.getExternalResourceUri()
        );
        if (original) {
            original.addIdentification(tag);
        }
    }
    this.identifiers.push(tag);
    if (this.areTagsShown) {
        this.controller()._addTagAsChild(tag);
    } else if (Store.state.isShowTags) {
        this.controller().showTags(true, true, true);
    }
};

GraphElement.GraphElement.prototype.getIndex = function (parentForkChildrenIndexArray) {
    parentForkChildrenIndexArray = parentForkChildrenIndexArray || this.getParentFork().getChildrenIndex();
    let indexInfo = parentForkChildrenIndexArray[this.getUri()];
    if (!indexInfo) {
        if (this.isGroupRelation()) {
            indexInfo = parentForkChildrenIndexArray[this.getIndexVertexUri()] || parentForkChildrenIndexArray[this.getCopiedFromUri()];
        } else {
            indexInfo = parentForkChildrenIndexArray[this.getCopiedFromUri()];
        }
    }
    if (!indexInfo) {
        return 9999999;
    }
    return indexInfo.index;
};

GraphElement.GraphElement.prototype.getCopiedFromUri = function () {
    return decodeURIComponent(
        this._graphElementServerFormat.copiedFromUri
    );
};

GraphElement.GraphElement.prototype.setFont = function (font) {
    this._graphElementServerFormat.font = font && typeof font === 'string' ? JSON.parse(font) : font || GraphElement.DEFAULT_FONT;
};

GraphElement.GraphElement.prototype.getFont = function () {
    return this._graphElementServerFormat.font || GraphElement.DEFAULT_FONT;
};

GraphElement.GraphElement.prototype.isFontDefined = function () {
    return this.getFont() !== GraphElement.DEFAULT_FONT;
};

GraphElement.GraphElement.prototype.setChildrenIndex = function (childrenIndex) {
    return this._graphElementServerFormat.childrenIndex = childrenIndex && typeof childrenIndex === 'string' ?
        JSON.parse(childrenIndex) :
        childrenIndex;
};

GraphElement.GraphElement.prototype.getChildrenIndex = function () {
    return this._graphElementServerFormat.childrenIndex || {};
};

GraphElement.GraphElement.prototype.isFromWikidata = function () {
    return false;
};

GraphElement.GraphElement.prototype.isTagFromWikipedia = function () {
    return false;
};

GraphElement.GraphElement.prototype.buildChildrenIndex = function (index) {
    let whenCenterContextLeftRightIndex = this.isCenter ? {} : this.getChildrenIndex();
    index = index || 0;
    return this.getClosestChildrenInTypes(
        [GraphElementType.Vertex, GraphElementType.MetaGroupVertex, GraphElementType.GroupRelation],
        true
    ).reduce((childrenIndex, child) => {
        let leftRightIndexWhileCenter = whenCenterContextLeftRightIndex[child.getUri()];
        let isLeft = leftRightIndexWhileCenter ? leftRightIndexWhileCenter.toTheLeft : child.isToTheLeft();
        childrenIndex[child.getUri()] = {
            index: index,
            toTheLeft: isLeft
            // label: child.getLabel(),
            // type: child.getGraphElementType()
        };
        index++;
        return childrenIndex;
    }, {});
};

GraphElement.GraphElement.prototype.integrateChildrenIndex = function (secondary) {
    let primary = this.getChildrenIndex();
    let nbPrimary = Object.keys(primary).length;
    let hasModified = false;
    Object.entries(secondary).forEach((secondaryEntry) => {
        if (!primary.hasOwnProperty(secondaryEntry[0])) {
            secondaryEntry[1].index += nbPrimary;
            primary[secondaryEntry[0]] = secondaryEntry[1];
            hasModified = true;
        }
    });
    return hasModified;
};

GraphElement.GraphElement.prototype.canSkipRemoveConfirmation = function (labelText) {
    return this.isPristine(labelText) && this.getNumberOfChild() === 0;
};

GraphElement.GraphElement.prototype.isPristine = function (labelText) {
    return this.isLabelEmpty(labelText) && !this.hasIdentifications();
};


GraphElement.GraphElement.prototype.getTextOrDefault = function () {
    let text = this.getLabel();
    return "" === text.trim() ?
        this.getWhenEmptyLabel() :
        text;
};

GraphElement.GraphElement.prototype.controller = function () {
    return this.getControllerWithElements(this);
};

GraphElement.GraphElement.prototype.getControllerWithElements = function (elements) {
    let controller = GraphElement._getControllerClassFromType(this.getGraphElementType());
    return new controller[
        GraphElement._getControllerNameFromType(this.getGraphElementType())
        ](elements);
};

GraphElement.GraphElement.prototype.isLabelSameAsParentGroupRelation = function () {
    if (this.isGroupRelation()) {
        return false;
    }
    let parentBubble = this.getParentBubble();
    if (!parentBubble.isGroupRelation()) {
        return false;
    }
    if (this.isLabelEmpty()) {
        return parentBubble.isLabelEmpty();
    }
    return [parentBubble.getLabel(), ""].includes(
        this.getLabel().trim()
    );
};

GraphElement.GraphElement.prototype.getIcon = function () {
    return Icon.getForUri(this.getUri());
};

GraphElement.GraphElement.prototype.isSkeleton = function () {
    return false;
};

GraphElement.GraphElement.prototype.getNbDuplicates = function () {
    return 0;
};

GraphElement.GraphElement.prototype.isParentRelationLess = function () {
    return false;
};

GraphElement.GraphElement.prototype.getShownBubble = function () {
    return this;
};

GraphElement.GraphElement.prototype.getShownParentBubble = GraphElement.GraphElement.prototype.getParentBubble = function () {
    return this.parentBubble || this;
};

GraphElement.GraphElement.prototype.shouldShow = function () {
    return true;
};

GraphElement.GraphElement.prototype.buildPasteTree = function (mapOfNewUris, parent) {
    const cloneCopy = this.clone();
    cloneCopy.setUri(mapOfNewUris[this.getUri()]);
    cloneCopy.isExpanded = true;
    cloneCopy.isCollapsed = false;
    if (!parent) {
        parent = this;
    }
    cloneCopy.parentBubble = parent;
    this.clonedChildren.forEach((childClone) => {
        childClone = childClone.buildPasteTree(mapOfNewUris, cloneCopy);
        if (cloneCopy.isEdgeType()) {
            const isInverse = parent.getUri() === mapOfNewUris[cloneCopy.getDestinationVertex().getUri()];
            if (isInverse) {
                cloneCopy.setDestinationVertex(parent);
                cloneCopy.setSourceVertex(childClone);
            } else {
                cloneCopy.setDestinationVertex(childClone);
                cloneCopy.setSourceVertex(parent);
            }
            cloneCopy.parentVertex = parent.isGroupRelation() ? parent.getParentVertex() : parent;
        } else {
            cloneCopy.addChild(childClone);
        }
        CurrentSubGraph.get().add(childClone);
    });
    return cloneCopy;
};

GraphElement.GraphElement.prototype.cloneWithTree = function (urisOfGraphElements) {
    const clone = this.clone();
    if (this.canExpand() || this.isLeaf()) {
        clone.clonedChildren = [];
    } else {
        clone.clonedChildren = this.getNextChildren().filter((child) => {
            return urisOfGraphElements.has(child.getUri()) || (child.isEdgeType() && urisOfGraphElements.has(child.getOtherVertex(clone).getUri()));
        }).map((child) => {
            return child.cloneWithTree(urisOfGraphElements);
        });
    }
    return clone;
};


export default GraphElement;
