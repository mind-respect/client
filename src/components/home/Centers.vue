<template>
  <v-card class="centers-card">
    <v-tooltip v-if="isOwner" left>
      <template v-slot:activator="{ on }">
        <v-btn color="secondary" fab fixed @click="$emit('create')" dark
               :large="$vuetify.breakpoint.smAndDown"
               :x-large="$vuetify.breakpoint.mdAndUp"
               bottom right class="right" :class="{
                                        'mb-2 mr-4' : $vuetify.breakpoint.smAndDown,
                                        'mb-6 mr-12': $vuetify.breakpoint.mdAndUp
                                       }">
          <v-icon large>add</v-icon>
        </v-btn>
      </template>
      <span>{{ $t('userhome:createInfo') }}</span>
    </v-tooltip>
    <v-card class="ma-0 pa-0" min-height="200" :class="{
                        'vh-center': !loaded
                    }">
      <v-card-text class="pt-0">
        <v-layout wrap
                  class="pt-0"
                  :class="{
                            'swipe-container': centers && centers.length && loaded && $vuetify.breakpoint.smAndDown && !isBottom
                          }"
        >
          <v-flex xs12 v-if="centers && centers.length === 0" class="vh-center">
            <h3 class="title vh-center font-italic mt-10" v-if="centers.length === 0">
              {{ $t('userhome:noBubbles') }}
            </h3>
          </v-flex>
          <v-flex xs12 :md3="$store.state.areCentersInGridView"
                  v-for="i in 28" v-if="!loaded">
            <v-skeleton-loader
                loading
                height="94"
                type="list-item-two-line"
                class="pa-2"
            >
            </v-skeleton-loader>
          </v-flex>
          <v-flex xs12 :md3="$store.state.areCentersInGridView"
                  v-for="(center, index) in centers" v-if="loaded && centers"
                  :key="center.uiId"
                  :ref="'center-' + center.uiId"
                  :class="{
                                'center-flex' : centers && centers.length && loaded && $vuetify.breakpoint.smAndDown
                            }"
          >
            <v-hover>
              <v-list two-line slot-scope="{ hover }" :class="{
                                    'center-list': centers && centers.length && loaded && $vuetify.breakpoint.smAndDown,
                                    'pb-0' :center.tagIndex !== undefined
                                }">
                <v-list-item @click="go($event, center)"
                             v-touch="{
                                                    left: (e) => swipe(e, center)
                                            }"
                             @touchstart="touchstart($event, center)"
                             @touchmove="touchmove($event, center)"
                             @touchend="touchend($event, center)"
                             @contextmenu="contextMenu($event, center)"
                >
                  <v-list-item-content :class="{
                                        'pb-0' :center.tagIndex !== undefined
                                    }">
                    <v-list-item-title class="text-subtitle-1 font-weight-bold pb-4">
                      <v-badge :color="center.getChipBackgroundColor(true)"
                               :inline="!center.isMeta()"
                               left
                               :value="!center.isMeta() && (center.shouldShowChipIcon(flow === 'patterns') || center.isChipBackgroundColorDefined(true))"
                               class="center-label">
                        <template v-slot:badge>
                          <v-icon v-if="center.shouldShowChipIcon(flow === 'patterns')"
                                  :color="getIconContrastColorFromBackground(center.getChipBackgroundColor(true))"
                          >
                            {{ center.getChipIcon(flow === 'patterns') }}
                          </v-icon>
                        </template>
                        <v-avatar :color="center.getChipBackgroundColor()" size="28"
                                  v-if="center.isMeta()">
                          <v-icon :dark="shouldTextBeWhiteFromBackgroundColor(center.getChipBackgroundColor())"
                                  small>
                            label
                          </v-icon>
                        </v-avatar>
                        {{ center.getLabel() }}
                      </v-badge>
                      <v-icon class="ml-4 mb-1 float-right" color="grey"
                              v-if="!center.isPattern()"
                              small>
                        {{ center.getShareIcon() }}
                      </v-icon>
                      <small class="grey--text font-weight-normal font-italic mr-1 float-right"
                             v-if="$vuetify.breakpoint.mdAndUp && isOwner && flow === 'centers'">
                        {{ center.lastVisit() }}
                      </small>
                      <small class="grey--text font-weight-normal font-italic mr-1 float-right"
                             v-if="$vuetify.breakpoint.mdAndUp && flow !== 'centers'">
                        {{ center.getCreationDateFormatted() }}
                      </small>
                    </v-list-item-title>
                    <v-list-item-subtitle class="mt-1">
                      <span v-if='center.getContext() === ""' class="vh-center">
                        {{ $t('noRelations') }}
                      </span>
                      <div v-else v-for="(value, index) in center.splitContext"
                           class="around-list-item">
                        {{ value }}
                      </div>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                        v-if="flow !== 'centers'">

                      <router-link :to="'/user/' + center.uri().getOwner()"
                                   class="no-style-link secondary-color" @click.stop
                                   color="secondary">
                        {{ center.uri().getOwner() }}
                      </router-link>
                    </v-list-item-subtitle>
                    <!--<v-list-item-s  ub-title class="text-xs-right" >-->
                    <!--{{center.lastVisit()}}-->
                    <!--</v-list-item-subtitle>-->
                  </v-list-item-content>
                  <v-list-item-action @click.stop
                                      style="min-width:40px;" v-if="$vuetify.breakpoint.mdAndUp">
                    <v-menu offset-y
                            v-if="isOwner && (hover || center.menu || !$store.state.areCentersInGridView)"
                            left
                            v-model="center.menu">
                      <template v-slot:activator="{ on }">
                        <v-btn icon small v-on="on">
                          <v-icon color="secondary">
                            more_vert
                          </v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                            @click.prevent="usePattern(center)"
                            v-if="center.isPattern()"
                        >
                          <v-list-item-action>
                            <v-icon>stars</v-icon>
                          </v-list-item-action>
                          <v-list-item-title>
                            {{ $t('use') }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item :href="center.uri().url()"
                                     target="_blank">
                          <v-list-item-action>
                            <v-icon>open_in_new</v-icon>
                          </v-list-item-action>
                          <v-list-item-title>
                            {{ $t('userhome:open') }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="copyUrl(center)">
                          <v-list-item-action>
                            <v-icon>link</v-icon>
                          </v-list-item-action>
                          <v-list-item-title>
                            {{ $t('userhome:copy') }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item
                            @click.prevent="removeCenter(center, index)"
                            v-if="flow !== 'patterns' && isOwnerOfCenter(center)"
                        >
                          <v-list-item-action>
                            <v-icon>visibility_off</v-icon>
                          </v-list-item-action>
                          <v-list-item-title>
                            {{ $t('userhome:remove') }}
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-hover>
            <Tags :tags="center.getRelevantTags()" v-if="center.tagIndex !== undefined"
                  :hideNbNeighbors="flow !== 'centers' || !isOwner"></Tags>
          </v-flex>
          <v-flex xs12 :md3="$store.state.areCentersInGridView"
                  v-for="i in 16" v-if="isBottom">
            <v-skeleton-loader
                loading
                height="94"
                type="list-item-two-line"
                class="pa-2"
            >
            </v-skeleton-loader>
          </v-flex>
          <v-flex xs12 class="vh-center" v-if="hasLoadedAll && centers.length > 28">
            <v-card flat>
              <v-card-title class="title grey--text">
                {{ $t('userhome:noMoreCenters') }}
                <v-btn text v-if="isOwner">
                  <v-icon color="secondary" class="mr-2" large>
                    add
                  </v-icon>
                  {{ $t('userhome:addBubble') }}
                </v-btn>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
    <v-snackbar v-model="removeSnackbar" color="secondary">
      {{ $t('centers:removedCenter') }}
      <v-btn
          text
          @click="cancelRemove()"
      >
        {{ $t('cancel') }}
      </v-btn>
    </v-snackbar>
    <v-icon color="white" large style="position:fixed;right:40px;z-index:0;"
            ref="deleteIcon" v-show="isSwiping">
      delete_sweep
    </v-icon>
  </v-card>
</template>

<script>
import I18n from '@/I18n'
import CenterGraphElementService from '@/center/CenterGraphElementService'
import CenterGraphElement from '@/center/CenterGraphElement'
import PatternService from "@/pattern/PatternService";
import LoadingFlow from "@/LoadingFlow";
import IdUri from '@/IdUri'
import Touch from 'vuetify/es5/directives/touch'
import Color from "../../Color";
import Tag from "../../tag/Tag";

const ADDRESS_BAR_HEIGHT = 60;

let touchStartX = 0;
let touchStartScrollY = 0;
let allowSwipeMenu = false;
let deleteIcon;

export default {
  name: "Centers",
  props: ['flow', 'isOwner', 'isFriend'],
  directives: {
    Touch
  },
  components: {
    Tags: () => import('@/components/Tags'),
  },
  data: function () {
    I18n.i18next.addResources("en", "centers", {
      removedCenter: 'Removed from the list of centers'
    });
    I18n.i18next.addResources("fr", "centers", {
      removedCenter: 'Enlevé de la liste des centres'
    });
    return {
      loaded: false,
      hasLoadedAll: false,
      centers: null,
      isBottom: false,
      scrollTopWhenCentersAdded: 0,
      isSwiping: false,
      removeSnackbar: false,
      removedCenter: null,
      removeCenterIndex: null
    }
  },
  mounted: function () {
    this.loadData().then((response) => {
      this.isSwiping = false;
      this.centers = this.buildCentersFromResponse(response.data);
      this.loaded = true;
      if (this.centers.length < 28) {
        this.hasLoadedAll = true;
      }
    });
  },
  methods: {
    buildCentersFromResponse: function (serverResponse) {
      return CenterGraphElement.fromServerFormat(serverResponse).map((center) => {
        if (center.isMeta()) {
          let centerAsTag = Tag.fromFriendlyResource(
              center
          );
          centerAsTag.setNbNeighbors(center.getNbNeighbors());
          center.addIdentification(centerAsTag);
        }
        if (center.hasIdentifications()) {
          center.tagIndex = 0;
          center.nbTags = center.getRelevantTags().length;

        }
        return center;
      });
    },
    isOwnerOfCenter: function (center) {
      if (!this.$store.state.user) {
        return false;
      }
      return IdUri.getOwnerFromUri(
          center.getUri()
      ) === this.$store.state.user.username;
    },
    shouldTextBeWhiteFromBackgroundColor: function (hexColor) {
      return Color.getContrast(hexColor) === 'white';
    },
    getIconContrastColorFromBackground: function (hexColor) {
      return Color.getContrast(hexColor);
    },
    contextMenu: function (event, center) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        return;
      }
      event.preventDefault();
      this.$store.dispatch('userHomeSelectedCenter', center);
    },
    touchstart: function (event, center) {
      if (this.flow !== 'centers' || !this.isOwner) {
        return;
      }
      touchStartX = event.touches[0].pageX;
      touchStartScrollY = document.scrollingElement.scrollTop + window.innerHeight + document.documentElement.clientHeight;
      allowSwipeMenu = true;
      const deleteIcon = this.$refs.deleteIcon.$el;
      const centerRect = this.$refs[
      'center-' + center.uiId
          ][0].getBoundingClientRect();
      deleteIcon.style.top = (centerRect.y + centerRect.height / 2 - 20) + "px";
    },
    touchmove: function (event, center) {
      if (this.flow !== 'centers' || !this.isOwner) {
        return;
      }
      if (!allowSwipeMenu || touchStartScrollY !== document.scrollingElement.scrollTop + window.innerHeight + document.documentElement.clientHeight) {
        this.isSwiping = false;
        this.$refs[
        'center-' + center.uiId
            ][0].style['margin-left'] = 0;
        allowSwipeMenu = false;
        return;
      }
      const margin = (touchStartX - event.touches[0].pageX) * -1;
      if (margin > -10) {
        this.isSwiping = false;
        this.$refs[
        'center-' + center.uiId
            ][0].style['margin-left'] = 0;
        return;
      }
      this.$refs[
      'center-' + center.uiId
          ][0].style['margin-left'] = margin + "px";
      this.isSwiping = true;
    },
    touchend: function (event, center) {
      if (this.flow !== 'centers' || !this.isOwner) {
        return;
      }
      const centerFlex = this.$refs[
      'center-' + center.uiId
          ][0];
      centerFlex.style['margin-left'] = "0";
      this.isSwiping = false;
    },
    swipe: function (event, center) {
      if (this.flow !== 'centers' || !this.isOwner) {
        return;
      }
      const centerFlex = this.$refs[
      'center-' + center.uiId
          ][0];
      centerFlex.style['margin-left'] = "0";
      this.isSwiping = false;
      if (allowSwipeMenu && event.touchendX + 100 < centerFlex.getBoundingClientRect().width / 2) {
        this.removeCenter(center);
      }
    },
    loadData: function () {
      switch (this.flow) {
        case "centers" : {
          return this.setupCenters();
        }
        case "patterns" : {
          return this.setupPatterns();
        }
        case "friends" : {
          return this.setupFriendsCenters();
        }
        case "publicCenters" : {
          return this.setupPublicCenters();
        }
      }
    },
    setupCenters: function () {
      if (this.isOwner) {
        return CenterGraphElementService.getPublicAndPrivate();
      }
      return this.isFriend ? CenterGraphElementService.getOfAFriend(
          this.$route.params.username
      ) : CenterGraphElementService.getPublicOnlyForUsername(
          this.$route.params.username
      );
    },
    setupPatterns: function () {
      return CenterGraphElementService.getPatterns();
    },
    usePattern: function (pattern) {
      LoadingFlow.enter();
      PatternService.use(
          pattern.getUri()
      ).then((response) => {
        this.$router.push(
            IdUri.htmlUrlForBubbleUri(response.data.uri)
        );
        LoadingFlow.leave();
      })
    },
    setupPublicCenters: function () {
      return CenterGraphElementService.getAllPublic();
    },
    setupFriendsCenters: function () {
      return CenterGraphElementService.getFriendsFeed();
    },
    go: async function ($event, center) {
      LoadingFlow.enter();
      let nbChild = center.getNbNeighbors().getTotal();
      let graphElementType = center.uri().getGraphElementType();
      if (graphElementType === "meta") {
        graphElementType = "identification";
      }
      if (graphElementType === "relation") {
        graphElementType = "edge";
        nbChild = undefined;
      }
      this.$router.push({
        name: "Center",
        params: {
          username: center.uri().getOwner(),
          graphElementType: graphElementType,
          centerUri: center.uri().getGraphElementShortId(),
          nbChild: nbChild,
          colors: center.getColors()
        }
      }).then(() => {
        LoadingFlow.leave();
      });
    },
    copyUrl: function (center) {
      this.$copyText(
          center.uri().absoluteUrl()
      );
    },
    removeCenter: function (centerToRemove, index) {
      CenterGraphElementService.removeCenterWithUri(
          centerToRemove.getUri()
      );
      let l = this.centers.length;
      while (l--) {
        let center = this.centers[l];
        if (center.getUri() === centerToRemove.getUri()) {
          this.removedCenter = center;
          this.removeSnackbar = true;
          this.removeCenterIndex = l;
          this.centers.splice(l, 1);
        }
      }
      this.$store.dispatch('userHomeSelectedCenter', null);
    },
    cancelRemove: function () {
      this.removeSnackbar = false;
      CenterGraphElementService.makeCenterWithUriAndLastCenterDate(
          this.removedCenter.getUri(),
          this.removedCenter.getLastCenterDateTime()
      );
      this.centers.splice(
          this.removeCenterIndex,
          0,
          this.removedCenter
      );
    },
    isBottomVisible() {
      const scrollY = document.scrollingElement.scrollTop;
      const visible = this.$vuetify.breakpoint.mdAndDown && window.innerHeight ?
          window.innerHeight : document.scrollingElement.clientHeight;
      const pageHeight = document.scrollingElement.scrollHeight;
      const bottomOfPage = visible + scrollY + 1 >= pageHeight;
      return bottomOfPage;
    },
    addCenters() {
      if (this.hasLoadedAll) {
        return;
      }
      let previousScrollTop = document.scrollingElement.scrollTop;
      let centersRequest = this.getNextCenters();
      centersRequest.then((response) => {
        if (response.data.length < 16) {
          this.hasLoadedAll = true
        }
        this.buildCentersFromResponse(response.data).forEach((center) => {
          this.centers.push(center);
        });
        this.$nextTick(() => {
          if (this.$vuetify.breakpoint.smAndDown || !this.$store.state.areCentersInGridView) {
            document.scrollingElement.scrollTop = previousScrollTop + window.innerHeight - 200;
          } else {
            document.scrollingElement.scrollTop = document.scrollingElement.scrollTop - 3;
          }
          this.isBottom = false;
        });
      });
    },
    getNextCenters: function () {
      switch (this.flow) {
        case "centers" : {
          if (this.isOwner) {
            return CenterGraphElementService.getPublicAndPrivateWithSkip(this.centers.length);
          }
          return this.isFriend ? CenterGraphElementService.getOfAFriendWithSkip(
              this.$route.params.username,
              this.centers.length
          ) : CenterGraphElementService.getPublicOnlyForUsernameWithSkip(
              this.$route.params.username,
              this.centers.length
          );
        }
        case "patterns" : {
          return CenterGraphElementService.getPatternsWithSkip(this.centers.length);
        }
        case "friends" : {
          return CenterGraphElementService.getFriendsFeedWithSkip(this.centers.length);
        }
        case "publicCenters" : {
          return CenterGraphElementService.getAllPublicWithSkip(
              this.centers.length
          );
        }
      }
    },
    handleScroll: function () {
      // this.log = "scrolling " + Math.random();
      if (!this.loaded || this.isBottom || this.hasLoadedAll || document.scrollingElement.scrollTop <= this.scrollTopWhenCentersAdded) {
        return;
      }
      this.isBottom = this.isBottomVisible();
    }
  },
  created() {
    document.addEventListener('scroll', this.handleScroll);
    document.addEventListener('touchmove', this.handleScroll);
  }
  ,
  beforeDestroy: function () {
    document.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('touchmove', this.handleScroll);
  }
  ,
  watch: {
    isBottom(isBottom) {
      if (isBottom) {
        this.scrollTopWhenCentersAdded = document.scrollingElement.scrollTop;
        this.addCenters()
      }
    }
  }
}
</script>

<style scoped>
.swipe-container {
  margin-top: 5px;
  background-color: #F44336;
}

.center-flex {
  margin-bottom: -5px;
  margin-top: -5px;
}

.center-list {
  border-radius: 0;
}

.center-label {
  font-family: 'Roboto';
}
</style>