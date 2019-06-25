import GraphServiceMock from '../mock/GraphServiceMock'
import TreeBuilder from '../util/TreeBuilder'
import TestData from '../util/js-test-data-client-side.json';
import App from '@/App.vue'
import {mount, createLocalVue} from '@vue/test-utils'
import VueRouter from 'vue-router'

import router from '@/router'
import store from '@/store'
import Vertex from '@/vertex/Vertex'
import Edge from '@/edge/Edge'
import Vuetify from 'vuetify'
import I18n from '@/I18n'
import Vue from 'vue'
import TestUtil from '../util/TestUtil'
import MindMapInfo from '@/MindMapInfo'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import CenterView from '@/views/Center.vue'

import Bubble from '@/components/graph/Bubble.vue'

import Selection from '@/Selection'

const clonedeep = require('lodash.clonedeep')
const api = {}


const localVue = createLocalVue();
localVue.use(VueRouter)
const vueI18nExt = I18n.setup();
api.wrapper = mount(App, {
    localVue,
    router,
    store,
    Vuetify,
    i18n: vueI18nExt,
});

api.treeBuilder = new TreeBuilder(api.wrapper)

Vue.use(Vuetify)

api.Scenario = function () {};

api.Scenario.prototype.init = async function () {
    MindMapInfo._setIsViewOnly(false)
    this.graph = this.getGraph();
    let center = this.getCenter();
    // console.log(this.graph.vertices[center.getUri()]);
    //setting a new uri to force graph refresh;
    // let centerVertexServerFormat = this.graph.vertices[center.getUri()];
    // delete this.graph.vertices[center.getUri()];
    // center.setUri(TestUtil.generateVertexUri());
    // centerVertexServerFormat.vertex.graphElement.friendlyResource.uri = center.getUri();
    // this.graph.vertices[center.getUri()] = centerVertexServerFormat;
    GraphServiceMock.getForCentralBubbleUri(
        this.graph
    );
    let uriInUrl = IdUri.getGraphElementUriInUrl();
    if (uriInUrl && uriInUrl === center.getUri()) {
        api.wrapper.find(CenterView).vm.forceUpdate = Math.random();
    } else {
        router.push(
            center.uri().url()
        );
    }
    await this.nextTickPromise(1);
    return this;
};
api.Scenario.prototype.nextTickPromise = async function nextTickPromise(nbTicks) {
    let l = nbTicks || 1;
    while (l--) {
        await new Promise((resolve) => {
            api.wrapper.vm.$nextTick(() => {
                resolve();
            })
        })
    }
};

api.Scenario.prototype.getGraph = function () {
    return api.getTestData(this.dataKey)
};


api.Scenario.prototype.getVertexWithLabelInTree = function (label) {
    let foundVertex = Object.values(CurrentSubGraph.get().vertices).filter((vertex) => {
        if (vertex.getLabel() === label) {
            return vertex
        }
    });
    if (foundVertex.length !== 1) {
        console.log("ooops too many vertices with same label");
    }
    return foundVertex[0];
};

api.Scenario.prototype.getRelationWithLabelInTree = function (label) {
    return Object.values(CurrentSubGraph.get().edges).filter((edge) => {
        if (edge.getLabel() === label) {
            return edge
        }
    })[0];
};

api.Scenario.prototype.getGroupRelationWithLabelInTree = function (label) {
    return Object.values(CurrentSubGraph.get().groupRelations).filter((edge) => {
        if (edge.getLabel() === label) {
            return edge
        }
    })[0];
};

api.Scenario.prototype.vertexWithLabelInServerGraph = function (label, graph) {
    graph = graph || this.graph;
    return api.vertexWithLabelInServerGraph(label, graph)
};

api.Scenario.prototype.edgeWithLabelInServerGraph = function (label) {
    return api.edgeWithLabelInServerGraph(label, this.graph)
}

api.Scenario.prototype.relationTagWithLabel = function (label) {
    let foundTag;
    let edge = Object.values(this.getGraph().edges).map((edgeServer) => {
        return Edge.fromServerFormat(edgeServer);
    }).forEach((edge) => {
        edge.getIdentifiers().forEach((tag) => {
            if (tag.getLabel() === label) {
                foundTag = tag;
            }
        })
    });
    return foundTag;
};

api.Scenario.prototype.getBubbleComponent = function (graphElement) {
    return this._getBubbleComponent(api.wrapper, graphElement);
};

api.Scenario.prototype._getBubbleComponent = function (ancestor, graphElement) {
    let bubble = ancestor.find(Bubble);
    if (bubble.isEmpty()) {
        return;
    }
    if (bubble.vm.bubble.getId() === graphElement.getId()) {
        return bubble;
    }
    return this._getBubbleComponent(ancestor.find(Bubble), graphElement);
};

api.getTestData = function (key) {
    let splitKey = key.split(/\./),
        data = TestData;
    while (splitKey.length && data) {
        data = data[splitKey.shift()];
    }
    if (data.constructor === Array) {
        return data.slice();
    }
    if (typeof data === 'object') {
        return clonedeep(data);
    }
    return data;
};

api.vertexWithLabelInServerGraph = function (label, graph) {
    return Object.values(graph.vertices).map((vertexServer) => {
        let isFacadeBuilt = vertexServer.getLabel !== undefined;
        return isFacadeBuilt ? vertexServer : Vertex.fromServerFormat(vertexServer);
    }).filter((vertex) => {
        if (vertex.getLabel() === label) {
            return vertex
        }
    })[0];
};

api.edgeWithLabelInServerGraph = function (label, graph) {
    return Object.values(graph.edges).map((edge) => {
        return Edge.fromServerFormat(edge);
    }).filter((edge) => {
        if (edge.getLabel() === label) {
            return edge
        }
    })[0];
};

export default api;
