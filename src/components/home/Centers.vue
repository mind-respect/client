<template>
    <v-card class="centers-card">
        <v-card class="ma-0 pa-0" min-height="200" :class="{
                        'vh-center': !loaded
                    }">
            <v-card-text class="pt-0">
                <v-tooltip v-if="isOwner" left>
                    <template v-slot:activator="{ on }">
                        <v-btn color="third" fab @click="$emit('create')" dark large bottom
                               absolute right class="mr-6 right" style="z-index:0;" :class="{
                                        'add-button-desktop' : $vuetify.breakpoint.mdAndUp
                                       }">
                            <v-icon large>add</v-icon>
                        </v-btn>
                    </template>
                    <span>{{$t('userhome:createInfo')}}</span>
                </v-tooltip>
                <v-layout wrap
                          class="pt-0"
                          :class="{
                            'swipe-container': centers && centers.length && loaded && $vuetify.breakpoint.smAndDown && !isBottom
                          }"
                >
                    <v-flex xs12 v-if="centers && centers.length === 0" class="vh-center">
                        <h3 class="title vh-center font-italic mt-10" v-if="centers.length === 0">
                            {{$t('userhome:noBubbles')}}
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
                            :id="'center-' + center.uiId"
                            :class="{
                                'center-flex' : centers && centers.length && loaded && $vuetify.breakpoint.smAndDown
                            }"
                    >
                        <v-hover>
                            <v-list two-line slot-scope="{ hover }" :class="{
                                    'center-list': centers && centers.length && loaded && $vuetify.breakpoint.smAndDown
                                }">
                                <v-list-item @click="go($event, center)"
                                             v-touch="{
                                                    left: (e) => swipe(e, center)
                                            }"
                                             @touchstart="touchstart"
                                             @touchmove="touchmove($event, center)"
                                             @touchend="touchend($event, center)"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title class="subtitle-1 font-weight-bold">
                                            <v-badge color="transparent">
                                                <template v-slot:badge v-if="center.showIcon()">
                                                    <v-icon>
                                                        {{center.getIcon()}}
                                                    </v-icon>
                                                </template>
                                                {{center.getLabel()}}
                                            </v-badge>
                                            <v-icon class="ml-4 mb-1 float-right" color="grey"
                                                    v-if="!center.isPattern()"
                                                    small>
                                                {{center.getShareIcon()}}
                                            </v-icon>
                                            <small class="grey--text font-weight-normal font-italic mr-1 float-right"
                                                   v-if="$vuetify.breakpoint.mdAndUp && center.lastVisit">
                                                {{center.lastVisit()}}
                                            </small>
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="mt-1">
                                            <div v-for="(value, key) in center.getContext()"
                                                 v-if="center.contextSearch !== ''"
                                                 class="around-list-item">
                                                {{value}}
                                            </div>
                                        </v-list-item-subtitle>
                                        <v-list-item-subtitle
                                                v-if="flow !== 'centers'">

                                            <router-link :to="'/user/' + center.uri().getOwner()"
                                                         class="no-style-link secondary-color" @click.stop
                                                         color="secondary">
                                                {{center.uri().getOwner()}}
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
                                                        {{$t('use')}}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item :href="center.uri().url()"
                                                             target="_blank">
                                                    <v-list-item-action>
                                                        <v-icon>open_in_new</v-icon>
                                                    </v-list-item-action>
                                                    <v-list-item-title>
                                                        {{$t('userhome:open')}}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item @click="copyUrl(center)">
                                                    <v-list-item-action>
                                                        <v-icon>link</v-icon>
                                                    </v-list-item-action>
                                                    <v-list-item-title>
                                                        {{$t('userhome:copy')}}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item
                                                        @click.prevent="removeCenter(center, index)">
                                                    <v-list-item-action>
                                                        <v-icon>visibility_off</v-icon>
                                                    </v-list-item-action>
                                                    <v-list-item-title>
                                                        {{$t('userhome:remove')}}
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </v-hover>
                        <div style="position:absolute;right:40px;z-index:0;" v-show="center.isSwiping">
                            <v-icon color="white" large style="margin-top:-115px;">
                                delete
                            </v-icon>
                        </div>
                    </v-flex>
                    <v-flex xs12 :md3="$store.state.areCentersInGridView"
                            v-for="i in 8" v-if="isBottom">
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
                                {{$t('userhome:noMoreCenters')}}
                                <v-btn text v-if="isOwner">
                                    <v-icon color="third" class="mr-2" large>
                                        add
                                    </v-icon>
                                    {{$t('userhome:addBubble')}}
                                </v-btn>
                            </v-card-title>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-snackbar v-model="removeSnackbar">
            {{$t('centers:removedCenter')}}
            <v-btn
                    text
                    @click="cancelRemove()"
            >
                {{$t('cancel')}}
            </v-btn>
        </v-snackbar>
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

    const ADDRESS_BAR_HEIGHT = 60;

    let touchStartX = 0;
    let touchStartScrollY = 0;
    let allowSwipeMenu = false;

    export default {
        name: "Centers",
        props: ['flow', 'isOwner', 'isFriend'],
        directives: {
            Touch
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
                this.centers = CenterGraphElement.fromServerFormat(response.data).map((center) => {
                    center.isSwiping = false;
                    center.labelSearch = center.getLabel();
                    center.contextSearch = Object.values(center.getContext()).join(' ');
                    return center;
                });
                this.loaded = true;
                if (this.centers.length < 28) {
                    this.hasLoadedAll = true;
                }
            });
        },
        methods: {
            touchstart: function (event) {
                touchStartX = event.touches[0].pageX;
                touchStartScrollY = document.scrollingElement.scrollTop + window.innerHeight + document.documentElement.clientHeight;
                allowSwipeMenu = true;
            },
            touchmove: function (event, center) {
                if (!allowSwipeMenu || touchStartScrollY !== document.scrollingElement.scrollTop + window.innerHeight + document.documentElement.clientHeight) {
                    center.isSwiping = false;
                    document.getElementById(
                        'center-' + center.uiId
                    ).style['margin-left'] = 0;
                    allowSwipeMenu = false;
                    return;
                }
                const margin = (touchStartX - event.touches[0].pageX) * -1;
                if (margin > -10) {
                    center.isSwiping = false;
                    document.getElementById(
                        'center-' + center.uiId
                    ).style['margin-left'] = 0;
                    return;
                }
                document.getElementById(
                    'center-' + center.uiId
                ).style['margin-left'] = margin + "px";
                center.isSwiping = true;
            },
            touchend: function (event, center) {
                const centerFlex = document.getElementById(
                    'center-' + center.uiId
                );
                centerFlex.style['margin-left'] = "0";
                center.isSwiping = false;
            },
            swipe: function (event, center) {
                const centerFlex = document.getElementById(
                    'center-' + center.uiId
                );
                centerFlex.style['margin-left'] = "0";
                center.isSwiping = false;
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
            go: function ($event, center) {
                let nbChild = center.getNbNeighborsFromFlow(this.flow, this.isOwner);
                let graphElementType = center.uri().getGraphElementType();
                if (graphElementType === "meta") {
                    graphElementType = "identification";
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
                    if (response.data.length < 8) {
                        this.hasLoadedAll = true
                    }
                    CenterGraphElement.fromServerFormat(response.data).map((center) => {
                        center.isSwiping = false;
                        center.labelSearch = center.getLabel();
                        center.contextSearch = Object.values(center.getContext()).join(' ');
                        return center;
                    }).forEach((center) => {
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
        },
        beforeDestroy: function () {
            document.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('touchmove', this.handleScroll);
        },
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

</style>