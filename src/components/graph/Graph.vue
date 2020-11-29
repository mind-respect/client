<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
  <v-layout @contextmenu="showContextMenu" style="height:100%;width:100%;" id="graph-container">
    <v-divider></v-divider>
    <div id="drawn_graph" data-zoom="9" class="vh-center" :key="drawnGraphKey">
      <v-layout class='root-vertex-super-container vh-center'
                @dragstart="preventUndesirableDragging" :key="childrenKey" @mousedown="mousedown"
                :style="zoomScale"
      >
        <v-flex grow class="vertices-children-container left-oriented pt-12 pb-12 pl-12 mt-12 mb-12"
                @dragover="dragOver"
                @dragleave="dragLeave" @drop="childrenDropLeft" @contextmenu="contextMenuLeft"
                v-if="center !== null"
        >
          <v-layout v-for="leftBubble in center.leftBubbles" :key="leftBubble.uiId">
            <v-flex grow :class="{
                        'mt-3' : center.leftBubbles.length === 2 && center.leftBubbles[0].isEdge(),
                        'mb-3' : center.leftBubbles.length === 2 && center.leftBubbles[1].isEdge()
                        }">
              <transition :name="transitionNameLeft"
                          @before-enter="beforeExpandAnimation(leftBubble)"
              >
                <Bubble
                    :bubble="leftBubble"
                    direction="left"
                    :nbSiblings="center.leftBubbles.length - 1"
                ></Bubble>
              </transition>
            </v-flex>
          </v-layout>
        </v-flex>
        <div class="vh-center center-component-container">
          <Bubble
              :bubble="center"
              direction="center"
              v-if="center !== null"
              class="center-component"
              :nbSiblings="0"
          ></Bubble>
          <div id="temp-center" v-if="center === null">
            <v-progress-circular indeterminate color="third" size="75"
                                 style="" v-show="showLoading"></v-progress-circular>
          </div>
        </div>
        <v-flex grow class="vertices-children-container right-oriented pt-12 pb-12 pr-12 mt-12 mb-12"
                @dragover="dragOver"
                @dragleave="dragLeave" @drop="childrenDropRight" @contextmenu="contextMenuRight"
                v-if="center !== null"
        >
          <v-layout v-for="rightBubble in center.rightBubbles" :key="rightBubble.uiId">
            <v-flex grow :class="{
                            'mt-3' : center.rightBubbles.length === 2 && center.rightBubbles[0].isEdge(),
                            'mb-3' : center.rightBubbles.length === 2 && center.rightBubbles[1].isEdge()
                        }">
              <transition :name="transitionName"
                          @before-enter="beforeExpandAnimation(rightBubble)"
              >
                <Bubble
                    :bubble="rightBubble"
                    direction="right"
                    :nbSiblings="center.rightBubbles.length - 1"
                ></Bubble>
              </transition>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <div
          class="svg-container"
          id="graph-svg-container"
          v-if="redrawKey"
          :key="redrawKey"
          v-show="!$store.state.isLoading"
          style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
      >
        <svg
            style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            id="edgesSvg"
        >
          <path
              :d="svg"
              fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
          />
        </svg>
      </div>
    </div>
    <v-menu
        v-model="contextMenu"
        :position-x="xContextMenu"
        :position-y="yContextMenu"
        absolute
        offset-y
    >
      <v-list>
        <v-list-item
            @click="$refs.addExistingBubbleDialog.enter(xContextMenu, yContextMenu, isContextMenuLeft)"
            :disabled="!isOwner || this.$store.state.isPatternFlow"
        >
          <v-list-item-action>
            <v-icon>scatter_plot</v-icon>
          </v-list-item-action>
          <v-list-item-title>{{ $t('graph:addExistingBubble') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <RemoveDialog></RemoveDialog>
    <AddTagDialog @tagAdded="tagSuccessSnackbar=true;"></AddTagDialog>
    <MergeDialog></MergeDialog>
    <ColorDialog></ColorDialog>
    <RemoveTagDialog></RemoveTagDialog>
    <DescriptionDialog></DescriptionDialog>
    <FontDialog></FontDialog>
    <ListViewDialog></ListViewDialog>
    <DuplicateDialog></DuplicateDialog>
    <SimilarBubbles v-if="isOwner" @tagAdded="tagSuccessSnackbar=true;"></SimilarBubbles>
    <AddExistingBubbleDialog ref="addExistingBubbleDialog"></AddExistingBubbleDialog>
    <NewContextDialog></NewContextDialog>
    <CopyTreeOfOtherDialog></CopyTreeOfOtherDialog>
    <BottomMenu></BottomMenu>
    <v-snackbar v-model="tagSuccessSnackbar" color="secondary" dark>
      <p class="subtitle-1 vh-center">
        {{ $t('graph:tagged') }}
      </p>
    </v-snackbar>
  </v-layout>
</template>

<script>
import MindMapInfo from '@/MindMapInfo'
import IdUri from '@/IdUri'
import Bubble from '@/components/graph/Bubble'
import Selection from '@/Selection'
import SubGraphController from '@/graph/SubGraphController'
import TagVertex from '@/tag/TagVertex'
import Color from '@/Color'
import CurrentSubGraph from '@/graph/CurrentSubGraph'
import SubGraph from '@/graph/SubGraph'
import Scroll from '@/Scroll'
import AppController from '@/AppController'
import Breakpoint from '@/Breakpoint'
import TagVertexController from '@/tag/TagVertexController'
import GraphElement from "@/graph-element/GraphElement";
import GraphDraw from '@/draw/GraphDraw'
import Dragged from '@/Dragged'
import I18n from '@/I18n'
import GraphController from '@/graph/GraphController'
import GraphUi from '@/graph/GraphUi'
import VertexSkeleton from '@/vertex/VertexSkeleton'
import RelationSkeleton from '@/relation/RelationSkeleton'
import * as KeyCode from 'keycode-js';
import UiUtils from '@/UiUtils'

let insideSvgOpacityTransition = false;

export default {
  name: "Graph",
  components: {
    Bubble,
    RemoveDialog: () => import('@/components/RemoveDialog'),
    RemoveTagDialog: () => import('@/components/RemoveTagDialog'),
    DescriptionDialog: () => import('@/components/DescriptionDialog'),
    FontDialog: () => import('@/components/FontDialog'),
    ListViewDialog: () => import('@/components/ListViewDialog'),
    SimilarBubbles: () => import('@/components/SimilarBubbles'),
    AddExistingBubbleDialog: () => import('@/components/AddExistingBubbleDialog'),
    NewContextDialog: () => import('@/components/NewContextDialog'),
    AddTagDialog: () => import('@/components/AddTagDialog'),
    MergeDialog: () => import('@/components/MergeDialog'),
    ColorDialog: () => import('@/components/ColorDialog'),
    BottomMenu: () => import('@/components/BottomMenu'),
    DuplicateDialog: () => import('@/components/DuplicateDialog'),
    CopyTreeOfOtherDialog: () => import('@/components/CopyTreeOfOtherDialog')
  },
  data: function () {
    I18n.i18next.addResources("en", "graph", {
      addExistingBubble: "Add an existing bubble",
      tagged: "Tag added"
    });
    I18n.i18next.addResources("fr", "graph", {
      addExistingBubble: "Ajouter une bulle existante",
      tagged: "Étiquette ajouté"
    });
    return {
      center: null,
      centerServerFormat: null,
      redrawKey: null,
      showLoading: true,
      strokeColor: Color.EdgeColor,
      svg: null,
      contextMenu: false,
      xContextMenu: 0,
      yContextMenu: 0,
      isContextMenuLeft: false,
      backgroundColor: null,
      childrenKey: IdUri.uuid(),
      drawnGraphKey: IdUri.uuid(),
      tagSuccessSnackbar: false
    }
  },
  mounted: async function () {
    this.showLoading = true;
    CurrentSubGraph.set(SubGraph.empty());
    Selection.reset();
    let centerUri = MindMapInfo.getCenterBubbleUri();
    MindMapInfo.defineIsViewOnly(true);
    let app = document.getElementById("app");
    if (app) {
      app.classList.add("mind-map");
    }
    Scroll.centerElement(
        document.getElementById('temp-center')
    );
    if (this.$route.params.nbChild !== undefined) {
      this.center = new VertexSkeleton();
      if (this.$route.params.colors) {
        this.center.setBackgroundColor(
            this.$route.params.colors.background
        );
      }
      this.center.makeCenter();
      for (let i = 0; i < this.$route.params.nbChild; i++) {
        this.center.addChild(
            new RelationSkeleton(
                this.center,
                new VertexSkeleton()
            )
        );
      }
      this.$nextTick(async () => {
        await this.$nextTick();
        await this.$nextTick();
        this.strokeColor = Color.SkeletonColor;
        requestAnimationFrame(() => {
          this.$store.dispatch("redraw");
          Breakpoint.set(this.$vuetify.breakpoint);
          Scroll.goToGraphElement(this.center, true);
        });
      });
    }
    let promise;
    if (this.$route.params.newVertex === undefined) {
      let center = IdUri.isMetaUri(centerUri) ? TagVertex.withUri(centerUri) : GraphElement.withUri(centerUri);
      promise = center.isMeta() ?
          TagVertexController.withMeta(center).loadGraph() :
          SubGraphController.withVertex(
              center
          ).load();
    } else {
      let center = this.$route.params.newVertex;
      center.isNewBubble = true
      /*
          this.$route.params.newVertex = undefined
          so that when centerRefresh is dispatched it's not considered new vertex
      */
      this.$route.params.newVertex = undefined;
      promise = Promise.resolve(center);
      CurrentSubGraph.get().add(center);
      center.makeCenter();
    }
    promise.then(async (_center) => {
          /*
          *   this.center = null;this.drawnGraphKey = IdUri.uuid();await this.$nextTick();
          *   because otherwise
          *   when I move first level vertices on the left,
          *   it changes all the bubbles position and I don't why.
          *   Happens only when skeletons first show.
          */
          this.center = null;
          this.drawnGraphKey = IdUri.uuid();
          await this.$nextTick();
          let center = _center;
          document.title = center.getTextOrDefault() + " | MindRespect";
          this.center = center;
          await this.$store.dispatch("redraw", {fadeOut: true});
          this.handleResize();
          await this.$nextTick();
          await Scroll.goToGraphElement(this.center, true);
          Color.refreshBackgroundColor();
          Selection.setToSingle(this.center);
          this.$store.dispatch("setIsPatternFlow", this.center.isPattern());
          await AppController.refreshFont();
          await this.$nextTick();
          if (center.getNumberOfChild() === 0 && center.isLabelEmpty()) {
            center.focus();
          }
          Scroll.goToGraphElement(this.center, true).then(async () => {
            await this.$nextTick();
            this.showLoading = false;
            await this.$nextTick();
            await this.$nextTick();
            this.strokeColor = Color.EdgeColor;
            setTimeout(async () => {
              await this.$store.dispatch("redraw", {fadeIn: true});
              const timeItTakesToFadeInPlus5 = 505;
              setTimeout(async () => {
                await this.$store.dispatch("redraw");
              }, timeItTakesToFadeInPlus5);
            }, 10);
          });
          CurrentSubGraph.get().component = this;
        }
    ).catch((error) => {
      console.error(error);
      this.$router.push("/")
    });
  },
  created: function () {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.disableSpacebarScroll);
  },
  beforeDestroy: function () {
    CurrentSubGraph.set(SubGraph.empty());
    Selection.reset();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.disableSpacebarScroll);
  },
  methods: {
    beforeExpandAnimation: async function (child) {
      if (UiUtils.isInAnimation || this.showLoading) {
        return;
      }
      // console.log("center draw")
      child.draw = false;
      if (child.isEdge()) {
        child.getNextBubble().draw = false
      }
      await this.$store.dispatch("redraw");
      setTimeout(async () => {
        child.draw = true;
        if (child.isEdge()) {
          child.getNextBubble().draw = true;
        }
        child.refreshChildren();
      }, 275);
    },
    mousedown: function () {
      GraphUi.enableDragScroll();
    },
    refreshChildren: function () {
      this.childrenKey = IdUri.uuid();
    },
    contextMenuLeft: function (event) {
      this.showContextMenu(event, true);
    },
    contextMenuRight: function (event) {
      this.showContextMenu(event, false);
    },
    showContextMenu: function (event, isLeft) {
      event.preventDefault();
      event.stopPropagation();
      this.contextMenu = false;
      this.xContextMenu = event.clientX;
      this.yContextMenu = event.clientY;
      this.isContextMenuLeft = isLeft;
      this.$nextTick(() => {
        this.contextMenu = true;
      })
    },
    dragLeave: function () {
      // console.log("over center leave")
    },
    dragOver: function (event) {
      //must prevent default in drag over in order for drop to work
      event.preventDefault();
      // console.log("over center")
    },
    childrenDropLeft: function (event) {
      // console.log("graph drop left ")
      Dragged.handleDrop(event, this.center, true);
    },
    childrenDropRight: function (event) {
      // console.log("graph drop right ")
      Dragged.handleDrop(event, this.center, false);
    },
    preventUndesirableDragging: function (event) {
      if (event.target.tagName === undefined) {
        return;
      }
      if (!event.target.classList.contains("in-bubble-content")) {
        console.warn("unwanted dragged occurred on " + event.target);
        event.preventDefault();
      }
    },
    handleResize: function () {
      Breakpoint.set(this.$vuetify.breakpoint);
      this.$store.dispatch("redraw");
      /*
          cannot scroll center on resize on mobile
          because it keeps on getting resized because of
          the constant address bar showing and hiding
       */
      // if (Selection.isSingle()) {
      //     Scroll.goToGraphElement(Selection.getSingle(), true);
      // }
    },
    disableSpacebarScroll: function (e) {
      /*
       spacebar scroll happened when adding sibling and then pressing spacebar really quickly
      */
      if (e.keyCode == KeyCode.KEY_SPACE && e.target === document.body) {
        e.preventDefault();
      }
    }
  },
  computed: {
    transitionName: function () {
      return this.showLoading ? "" : "expand-child";
    },
    transitionNameLeft: function () {
      return this.showLoading ? "" : "expand-child-left";
    },
    strokeWidth: function () {
      return (this.$vuetify.breakpoint.mdAndDown ? 1 : 2) * this.$store.state.zoom;
    },
    arrowHeadLength: function () {
      return 6 * this.$store.state.zoom;
    },
    isOwner: function () {
      if (!this.$store.state.user) {
        return false;
      }
      return this.$route.params.username === this.$store.state.user.username
    },
    redraws: function () {
      return this.$store.state.redraws;
    },
    zoomScale: function () {
      return "transform: scale(" +
          this.$store.state.zoom + "," +
          this.$store.state.zoom + ")";
    }
  },
  watch: {
    redraws: async function () {
      if (this.showLoading) {
        return;
      }
      if (this.$store.state.redraws.hide === true) {
        this.redrawKey = null;
        return;
      }
      await this.$nextTick();
      requestAnimationFrame(async () => {
        await this.$nextTick();
        this.svg = new GraphDraw(this.center, this.arrowHeadLength).build();
        this.redrawKey = Math.random();
        await this.$nextTick();
        if (this.$store.state.redraws.fadeIn && !insideSvgOpacityTransition) {
          insideSvgOpacityTransition = true;
          const graphSvgContainer = document.getElementById("graph-svg-container");
          graphSvgContainer.style.opacity = '0';
          graphSvgContainer.style.transition = 'opacity 0s';
          requestAnimationFrame(() => {
            graphSvgContainer.style.opacity = '1';
            graphSvgContainer.style.transition = 'opacity 500ms';
            setTimeout(() => {
              insideSvgOpacityTransition = false;
            }, 500)
          });
        }
        if (this.$store.state.redraws.fadeOut) {
          const graphSvgContainer = document.getElementById("graph-svg-container");
          graphSvgContainer.style.opacity = '1';
          graphSvgContainer.style.transition = 'opacity 0s';
          requestAnimationFrame(() => {
            graphSvgContainer.style.opacity = '0';
            graphSvgContainer.style.transition = 'opacity 250ms';
          });
        }
      });
    }
  }
}
</script>

<style lang="scss">

$horizontalPaddingHighest: 3.5;

@mixin zoom {
  @for $i from 0 through 10 {
    $horizontalPadding: max(1, $horizontalPaddingHighest - ($i * 1.1));
    [data-zoom="#{$i}"] {
      .vertex {
        .in-bubble-content {
          max-width: 500px;

          .bubble-label {
            white-space: pre-wrap;
          }
        }

        .in-bubble-content {
          padding: 1em;
          padding-bottom: 0.5em;
          padding-top: 0.5em;
          $buttonExtraSize: max(0, 1.5 - $i * 0.3);
          $buttonSize: calc(30px + #{$buttonExtraSize}vw);
          $fontSizeExtra: max(0, 0.5 - $i * 0.1);
          //button {
          //  width: $buttonSize;
          //  height: $buttonSize;
          //  font-size: calc(1em + #{$fontSizeExtra}vw);
          //  i {
          //    $top: 0.25 + max(0, 0.25 - ($i * 0.02));
          //    top: percentage($top);
          //  }
          //}
          //.menu {
          //  $menuWidthExtra: $buttonExtraSize * 5;
          //  width: calc(260px + #{$menuWidthExtra}vw);
          //}
        }
      }

      .in-bubble-note-button {
        $fontSizeExtra: max(0, 8 - $i) / 1.5;
        //font-size: calc(1.5em + #{$fontSizeExtra}vw);
        &:before {
          font-family: FontAwesome;
          content: "\f02d";
        }
      }

      .bubble-label {
        $fontSizeExtra: max(0, 8 - $i / 1.20);
        //font-size: calc(1em + #{$fontSizeExtra}vw);
      }
    }
  }
}

@include zoom;

.zoom-scale {
  .menu {
    zoom: 30%;
    -moz-transform: scale(0.3);
  }
}

.zoom-scale-1 {
  .in-bubble-content {
    zoom: 500%;
    -moz-transform: scale(5);

    .bubble-label {
      //zoom:2000%;
    }
  }

  .bubble-content {
    //zoom:500%;
  }
}

[draggable] {
  cursor: move;
  -khtml-user-drag: element; //for safari http://stackoverflow.com/a/3977637
}

.not-editable .bubble.single-selected .bubble-label {
  &:after {
    content: "";
    color: grey;
    font-style: italic;
  }
}

#drawn_graph {
  min-width: 200%;
  z-index: 1;
  position: relative;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  /*
  padding-bottom:30% because root-vertex-super-container is margin-bottom 150px;
  */
  padding: 30% 0 30% 0;
}

[draggable=true] {
  cursor: move;
  -khtml-user-drag: element;
}

.root-vertex-super-container {
  z-index: 3;
  width: 100%;
  height: 100%;
  margin-left: 600px !important;
  margin-right: 900px !important;
  margin-top: 150px;
  margin-bottom: 150px;
  /*
  padding-top:150px and padding-bottom:150px
  to try to prevent height jump in Firefox when adding text to a bubble
  */
  padding-top: 150px;
  padding-bottom: 150px;
}

.root-vertex-super-container > .vertices-children-container {
  /*max-width:inherit;*/

}

.root-vertex-super-container > .vertices-children-container.left-oriented {
  /*display: flex;*/
  /*max-width: inherit;*/
}

.root-vertex-super-container > .vertices-children-container.right-oriented {
  /*display: flex;*/
  /*max-width: inherit;*/
  /*padding-right:100%;*/
}

.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

#app.mind-map {
  background: none !important;
}

.after-loaded {
  opacity: 1;
}

.expand-child-enter {
  opacity: 0;
  transform: rotateY(50deg);
  transform-origin: top left;
}

.expand-child-enter-to {
  opacity: 1;
  transform: rotateY(0);
  transform-origin: top left;
}

.expand-child-enter-active,
.expand-child-left-enter-active {
  transition: opacity, transform 200ms ease-out;
}


.expand-child-left-enter {
  opacity: 0;
  transform: rotateY(50deg);
  transform-origin: top right;
}

.expand-child-left-enter-to {
  opacity: 1;
  transform: rotateY(0);
  transform-origin: top right;
}

</style>
