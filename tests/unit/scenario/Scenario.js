import GraphServiceMock from '../mock/GraphServiceMock'
import TreeBuilder from '../util/TreeBuilder'
import TestData from '../util/js-test-data-client-side.json';
import App from '@/App.vue'
import {createLocalVue, mount} from '@vue/test-utils'
import VueRouter from 'vue-router'

import router from '@/router'
import store from '@/store'
import Vertex from '@/vertex/Vertex'
import Edge from '@/edge/Edge'
import Vuetify from 'vuetify'
import I18n from '@/I18n'
import Vue from 'vue'
import MindMapInfo from '@/MindMapInfo'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import IdUri from '@/IdUri'
import CenterView from '@/views/Center.vue'
import SubGraph from '@/graph/SubGraph'

import Bubble from '@/components/graph/Bubble.vue'

const clonedeep = require('lodash.clonedeep')
const api = {}


const localVue = createLocalVue();
localVue.use(VueRouter)
const vueI18nExt = I18n.setup();

Vue.use(Vuetify)
const vuetify = new Vuetify();
api.wrapper = mount(App, {
    localVue,
    router,
    store,
    vuetify,
    i18n: vueI18nExt,
});

api.treeBuilder = new TreeBuilder(api.wrapper)

api.Scenario = function () {
};

api.Scenario.prototype.init = async function () {
    MindMapInfo._setIsViewOnly(false);
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
    let foundVertex = Object.values(CurrentSubGraph.get().getVertices()).filter((vertex) => {
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
    return Object.values(CurrentSubGraph.get().getEdges()).filter((edge) => {
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
    return api.vertexWithLabelInGraph(label, graph)
};

api.Scenario.prototype.edgeWithLabelInServerGraph = function (label) {
    return api.edgeWithLabelInGraph(label, this.graph)
};

api.Scenario.prototype.tagWithLabel = function (label) {
    return api.tagWithLabelInGraph(
        label,
        this.graph
    );
};

api.Scenario.prototype.tagWithLabelInTree = function (label) {
    return CurrentSubGraph.get().tagVertices.filter((tag) => {
        return tag.getLabel() === label;
    })[0];
};

api.Scenario.prototype.relationTagWithLabel = function (label) {
    let foundTag;
    Object.values(this.getGraph().edges).map((edgeServer) => {
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

api.getGraphElements = function (graph) {
    let formattedGraph = api.formatGraph(graph);
    return api.getVertices(formattedGraph).concat(
        api.getEdges(formattedGraph)
    );
};

api.vertexWithLabelInGraph = function (label, graph) {
    return api.getVertices(api.formatGraph(graph)).filter((vertex) => {
        if (vertex.getLabel() === label) {
            return vertex
        }
    })[0];
};

api.edgeWithLabelInGraph = function (label, graph) {
    return api.getEdges(api.formatGraph(graph)).filter((edge) => {
        if (edge.getLabel() === label) {
            return edge
        }
    })[0];
};

api.tagWithLabelInGraph = function (label, graph) {
    return api.getGraphElements(graph).reduce((tags, graphElement) => {
        return tags.concat(graphElement.getIdentifiers());
    }, []).filter((tag) => {
        return tag.getLabel() === label;
    })[0];
};

api.formatGraph = function (graph) {
    return {
        edges: api._areGraphElementsInArray(graph.edges) ? graph.edges : api._convertGraphElementsToArray(graph.edges),
        vertices: api._areGraphElementsInArray(graph.vertices) ? graph.vertices : api._convertGraphElementsToArray(graph.vertices)
    }
};

api._convertGraphElementsToArray = function (graphElements) {
    return Object.values(graphElements).reduce((graphElementsArray, graphElement) => {
        let isFacadeBuilt = graphElement.getLabel !== undefined;
        if (!isFacadeBuilt) {
            graphElement = graphElement.vertex ? Vertex.fromServerFormat(graphElement) : Edge.fromServerFormat(graphElement);
        }
        if (graphElementsArray[graphElement.getUri()] === undefined) {
            graphElementsArray[graphElement.getUri()] = [];
        }
        graphElementsArray[graphElement.getUri()].push(graphElement);
        return graphElementsArray;
    }, {})
};

api._areGraphElementsInArray = function (graphElementsObject) {
    let vertices = Object.values(graphElementsObject);
    if (vertices.length === 0) {
        return true;
    }
    return Array.isArray(vertices[0]);
};

api.getVertices = function (graph) {
    let vertices = Object.values(graph.vertices);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], vertices).map((vertexServer) => {
        let isFacadeBuilt = vertexServer.getLabel !== undefined;
        return isFacadeBuilt ? vertexServer : Vertex.fromServerFormat(vertexServer);
    });
};

api.getEdges = function (graph) {
    let edges = Object.values(graph.edges);
    //use array flat() when node ^11 LTS gets out
    return [].concat.apply([], edges).map((edge) => {
        let isFacadeBuilt = edge.getLabel !== undefined;
        return isFacadeBuilt ? edge : Edge.fromServerFormat(
            edge
        );
    });
};

export default api;
