<template>
    <v-card>
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
                <v-layout wrap v-if="!loaded">
                    <v-flex xs12 class="vh-center">
                        <v-progress-circular size="64" indeterminate
                                             color="third"></v-progress-circular>
                    </v-flex>
                </v-layout>
                <v-layout wrap class="pt-0" v-if="loaded && centers">
                    <v-flex xs12 v-if="centers.length === 0" class="vh-center">
                        <h3 class="title vh-center font-italic mt-10" v-if="centers.length === 0">
                            {{$t('userhome:noBubbles')}}
                        </h3>
                    </v-flex>
                    <v-flex xs12 :md3="$store.state.areCentersInGridView"
                            v-for="(center, index) in centers">
                        <v-hover>
                            <v-list two-line id="grid-list" slot-scope="{ hover }">
                                <v-list-item @click="go($event, center.uri().url())">
                                    <v-list-item-content>
                                        <v-list-item-title class="subtitle-1 font-weight-bold">
                                            {{center.getLabel()}}
                                            <v-icon class="ml-1 mb-1 float-right" color="grey"
                                                    v-if="center.showIcon()"
                                                    small>
                                                {{center.getIcon()}}
                                            </v-icon>
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
                                            <v-avatar class="text-uppercase teal white--text mr-2" size="30">
                                                {{center.uri().getOwner().substring(0,2)}}
                                            </v-avatar>
                                            {{center.uri().getOwner()}}
                                        </v-list-item-subtitle>
                                        <!--<v-list-item-s  ub-title class="text-xs-right" >-->
                                        <!--{{center.lastVisit()}}-->
                                        <!--</v-list-item-subtitle>-->
                                    </v-list-item-content>
                                    <v-list-item-action @click.stop
                                                        v-if="$vuetify.breakpoint.smAndUp"
                                                        style="min-width:40px;">
                                        <v-menu offset-y v-if="isOwner && (hover || center.menu)"
                                                left
                                                v-model="center.menu">
                                            <template v-slot:activator="{ on }">
                                                <v-btn icon small v-on="on">
                                                    <v-icon color="third">
                                                        more_horiz
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
                    </v-flex>
                    <v-flex xs12 v-show="bottom" class="vh-center">
                        <v-progress-circular
                                :size="64"
                                color="third"
                                indeterminate
                        ></v-progress-circular>
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
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import CenterGraphElementService from '@/center/CenterGraphElementService'
    import CenterGraphElement from '@/center/CenterGraphElement'
    import PatternService from "@/pattern/PatternService";
    import LoadingFlow from "@/LoadingFlow";
    import IdUri from '@/IdUri'

    const ADDRESS_BAR_HEIGHT = 60;

    export default {
        name: "Centers",
        props: ['flow', 'isOwner', 'isFriend'],
        data: function () {
            I18n.i18next.addResources("en", "centers", {});
            I18n.i18next.addResources("en", "centers", {});
            return {
                loaded: false,
                hasLoadedAll: false,
                centers: null,
                bottom: false
            }
        },
        mounted: function () {
            this.loadData().then((response) => {
                this.centers = CenterGraphElement.fromServerFormat(response.data).map((center) => {
                    center.labelSearch = center.getLabel();
                    center.contextSearch = Object.values(center.getContext()).join(' ');
                    return center;
                });
                this.loaded = true;
                if (this.centers.length < 28) {
                    this.hasLoadedAll = true;
                }
            })
        },
        methods: {
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
            go: function ($event, path) {
                this.$router.push(
                    path
                );
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
                        this.centers.splice(l, 1);
                    }
                }
            },
            bottomVisible() {
                const scrollY = document.body.scrollTop;
                const visible = document.documentElement.clientHeight;
                const pageHeight = document.body.scrollHeight;
                const bottomOfPage = visible + scrollY + ADDRESS_BAR_HEIGHT >= pageHeight;
                // this.log = "scrollY " + scrollY + " visible " + visible + " pageHeight" + pageHeight + " bottomOfPage " + bottomOfPage;
                return bottomOfPage || pageHeight < visible + ADDRESS_BAR_HEIGHT;
            },
            addCenters() {
                let centersRequest = this.getNextCenters();
                centersRequest.then((response) => {
                    if (response.data.length < 8) {
                        this.hasLoadedAll = true
                    }
                    CenterGraphElement.fromServerFormat(response.data).map((center) => {
                        center.labelSearch = center.getLabel();
                        center.contextSearch = Object.values(center.getContext()).join(' ');
                        return center;
                    }).forEach((center) => {
                        this.centers.push(center);
                    });
                    this.$nextTick(() => {
                        document.body.scrollTop = document.body.scrollTop - 10 - ADDRESS_BAR_HEIGHT;
                        setTimeout(() => {
                            this.bottom = false;
                        }, 250);
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
                if (!this.loaded || this.bottom || this.hasLoadedAll) {
                    return;
                }
                this.bottom = this.bottomVisible();
            }
        },
        created() {
            document.body.addEventListener('scroll', this.handleScroll);
            document.addEventListener('touchmove', this.handleScroll);
        },
        beforeDestroy: function () {
            document.body.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('touchmove', this.handleScroll);
        },
        watch: {
            bottom(bottom) {
                if (bottom) {
                    this.addCenters()
                }
            }
        }
    }
</script>

<style scoped>

</style>