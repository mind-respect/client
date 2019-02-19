/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import SelectionHandler from '@/SelectionHandler'
import GraphUi from '@/graph/GraphUi'
import VertexUi from '@/vertex/VertexUi'
import GraphElementUi from '@/graph-element/GraphElementUi'
import GroupRelationUi from '@/group-relation/GroupRelationUi'
import CompareFlow from '@/'
    "triple_brain.compare_flow",
    "triple_brain.mind_map_info"
], function ($, SelectionHandler, GraphUi, VertexUi, GraphElementUi, GroupRelationUi, CompareFlow, MindMapInfo) {
    "use strict";
    var api = {};
    api.expandAllCanDo = function () {
        var canDo = false;
        GraphElementUi.visitAll(function(graphElementUi){
            if(graphElementUi.getController().expandCanDo()){
                canDo = true;
                return false;
            }
        });
        return canDo;
    };

    api.expandAll = function () {
        GraphElementUi.getCenterBubble().getController().expand();
    };

    api.compareCanDo = function(){
        return !MindMapInfo.isViewOnly();
    };

    api.compare = function () {
        CompareFlow.enter();
    };

    api.selectAllBubbles = function () {
        GraphElementUi.getCenterBubble().selectTree();
    };

    api.selectTreeCanDo = function () {
        return VertexUi.getNumber() > SelectionHandler.getNbSelectedVertices();
    };

    api.getUi = function () {
        return [];
    };

    api.isMultiple = function(){
        return false;
    };

    api.isSingle = function () {
        return false;
    };

    return api;
});
