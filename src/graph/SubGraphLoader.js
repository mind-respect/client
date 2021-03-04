/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import GraphService from '@/graph/GraphService'
import GraphElementService from '@/graph-element/GraphElementService'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import Relation from '@/relation/Relation'
import SubGraph from '@/graph/SubGraph'
import State from '@/State'

const api = {};

api.withCenter = function (center) {
    return new api.SubGraphLoader(center);
};

api.withCenters = function (center) {
    return new api.SubGraphLoader(center);
};

function SubGraphLoader(center) {
    this.center = center;
    this.isCenterOnMap = true;
    this.isParentAlreadyOnMap = false;
}

api.SubGraphLoader = SubGraphLoader;

SubGraphLoader.prototype.loadForParentIsAlreadyOnMap = function (preventAddInCurrentGraph, serverGraph) {
    this.isParentAlreadyOnMap = true;
    this.isCenterOnMap = false;
    this.preventAddInCurrentGraph = preventAddInCurrentGraph;
    return this.load(serverGraph);
};

SubGraphLoader.prototype.loadNonCenter = function () {
    this.isParentAlreadyOnMap = false;
    this.isCenterOnMap = false;
    this.preventAddInCurrentGraph = false;
    return this.load();
};

SubGraphLoader.prototype.load = async function (serverGraph) {
    if (serverGraph === undefined) {
        const response = await GraphService.getForCentralBubbleUri(
            this.center.getUri()
        );
        serverGraph = response.data;
    }
    return this._buildCenterForkUsingGraphAndCenter(serverGraph);
};
SubGraphLoader.prototype._buildCenterForkUsingGraphAndCenter = async function (serverGraph) {
    let centerUri = this.center.getUri();
    let isCenterEdge = IdUri.isEdgeUri(this.center.getUri());
    if (isCenterEdge) {
        let centerEdge = Relation.fromServerFormat(
            serverGraph.edges[this.center.getUri()]
        );
        centerUri = centerEdge.getSourceVertex().getUri();
    }
    let subGraph = SubGraph.fromServerFormatAndCenterUri(
        serverGraph,
        centerUri
    );
    let centerFromServer = subGraph.getHavingUri(
        centerUri
    );
    let centerFork = this.isParentAlreadyOnMap ? this.center : centerFromServer;
    let centerIsMissingSourceFork = false;
    if (this.isParentAlreadyOnMap) {
        centerFork.setLabel(
            centerFromServer.getLabel()
        );
        centerFork.setComment(
            centerFromServer.getComment()
        );
        centerFork.setBackgroundColor(
            centerFromServer.getBackgroundColor()
        );
        centerFork.setFont(
            centerFromServer.getFont()
        );
        centerFork.setChildrenIndex(
            centerFromServer.getChildrenIndex()
        );
        centerFromServer.getIdentifiers().forEach((tag) => {
            centerFork.addIdentification(tag);
        });
        if (centerFork.isGroupRelation()) {
            if (centerFork.getSourceForkUri() === "undefined") {
                centerFork.setSourceForkUri(
                    subGraph.groupRelations[centerFork.getUri()].getSourceForkUri()
                );
                centerIsMissingSourceFork = true;
            }
            subGraph.groupRelations[centerFork.getUri()] = centerFork;
        } else {
            subGraph.vertices[centerFork.getUri()] = [centerFork];
        }
        let hasModifiedChildrenIndex = centerFork.integrateChildrenIndex(centerFromServer.getChildrenIndex());
        if (hasModifiedChildrenIndex) {
            GraphElementService.saveChildrenIndex(
                centerFork,
                centerFork.getChildrenIndex()
            )
        }
    } else {
        if (this.isCenterOnMap) {
            centerFork.makeCenter();
        }
        if (!this.preventAddInCurrentGraph) {
            CurrentSubGraph.get().add(centerFork);
        }
    }
    let childrenIndex = centerFork.getChildrenIndex();

    let centerParentBubble = centerFork.getParentBubble();
    let centerParentFork = centerFork.getParentFork();
    let centerVertex = centerFork.isGroupRelation() ? centerFork.getParentVertex() : centerFork;
    const addedUris = new Set();
    const nonRelatedUris = new Set();
    subGraph.sortedGraphElements(centerFork).forEach((child) => {
        if (!child.isRelatedToForkUri(centerFork.getUri())) {
            let nonRelatedUri;
            if (child.isRelation()) {
                nonRelatedUri = child.getOtherVertex(centerFork).getUri();
            } else if (child.isGroupRelation()) {
                nonRelatedUri = child.getSourceForkUri();
            } else {
                nonRelatedUri = child.parentGroupRelationUri;
            }
            nonRelatedUris.add(nonRelatedUri);
            return;
        }
        if (child.getUri() === centerFork.getParentBubble().getUri()) {
            return;
        }
        if (child.isRelation() && child.getOtherVertex(centerVertex).getUri() === centerParentFork.getUri()) {
            return;
        }
        if (child.isVertex() && (!centerFork.isGroupRelation() || centerFork.getSourceForkUri() !== child.getUri())) {
            return;
        }
        let childHasMissingSourceFork = centerIsMissingSourceFork && child.getUri() === centerFork.getUri();
        if (!childHasMissingSourceFork && this.isParentAlreadyOnMap && (child.getUri() === centerParentBubble.getUri()) || child.getUri() === centerParentFork.getUri()) {
            return;
        }
        if (!childHasMissingSourceFork && child.isGroupRelation() && child.getSourceForkUri() !== centerFork.getUri()) {
            return;
        }

        let endFork;
        if (childHasMissingSourceFork) {
            endFork = subGraph.getHavingUri(centerFork.getSourceForkUri());
        } else {
            endFork = child.isEdge() ? child.getOtherVertex(centerFork) : child;
        }
        let childIndex = childrenIndex[endFork.getUri()];
        if (!childIndex) {
            if (endFork.isGroupRelation()) {
                childIndex = childrenIndex[endFork.getIndexVertexUri()] || childrenIndex[endFork.getCopiedFromUri()];
            } else {
                childIndex = childrenIndex[endFork.getCopiedFromUri()];
            }
        }
        let addLeft;
        if (childIndex !== undefined) {
            addLeft = childIndex.toTheLeft;
        }

        if (childHasMissingSourceFork) {
            if (addedUris.has(endFork.getUri())) {
                return;
            }
            addedUris.add(endFork.getUri())
            centerFork.addChild(
                endFork,
                addLeft
            );
        } else {
            if (addedUris.has(child.getUri())) {
                return;
            }
            addedUris.add(child.getUri())
            child.parentVertex = centerVertex;
            child.parentBubble = centerFork;
            centerFork.addChild(
                child,
                addLeft
            );
        }
        if (!this.preventAddInCurrentGraph) {
            CurrentSubGraph.get().add(child);
        }
    });
    let isChildrenIndexBuilt = Object.keys(childrenIndex).length > 0;
    centerFork.isExpanded = true;
    centerFork.isCollapsed = false;
    await centerFork.getExpandableDescendants().map(async (expandable) => {
        if (nonRelatedUris.has(expandable.getUri())) {
            await api.withCenter(expandable).loadForParentIsAlreadyOnMap(false, serverGraph);
        }
    });
    return isChildrenIndexBuilt || State.isViewOnly() ? Promise.resolve(centerFork) :
        GraphElementService.changeChildrenIndex(
            centerFork
        ).then(() => {
            return centerFork;
        });
};
export default api;
