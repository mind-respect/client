<template>
    <v-navigation-drawer
            stateless
            style="margin-top:42px;"
            value="true"
            fixed
            width="400"
            :mini-variant="!SelectionHandler.isSingle()"
            mini-variant-width="60"
    >
        <v-layout fill-height>
            <v-navigation-drawer
                    v-if="SelectionHandler.isSingle()"
                    width="340"
            >
                <v-card class="" flat>
                    <v-card-title class="subheading">
                        <div class="grey--text">
                            {{$t('side:creationDate')}}
                            {{formatDate(SelectionHandler.getSingle().getCreationDate())}}
                        </div>
                    </v-card-title>
                    <div>
                        <v-tabs
                                v-model="tabMenu"
                                grow
                                centered
                                next-icon=""
                                color="transparent"
                                icons-and-text
                        >
                            <v-tab class="primary--text">
                                <span class="grey--text">{{$t('side:tags')}}</span>
                                <v-icon>label</v-icon>
                            </v-tab>
                            <v-tab class="primary--text">
                                <span class="grey--text">{{$t('side:merge')}}</span>
                                <v-icon>merge_type</v-icon>
                            </v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="tabMenu" class="white">
                            <v-tab-item>
                                <TagMenu></TagMenu>
                            </v-tab-item>
                            <v-tab-item>
                                <v-card flat>
                                    <v-card-text>Savon vert</v-card-text>
                                </v-card>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                </v-card>
            </v-navigation-drawer>
            <v-navigation-drawer
                    value="true"
                    right
                    mini-variant
                    mini-variant-width="60"
                    stateless
                    id="buttonsDrawer"
            >
                <BubbleButtons :isInSideMenu="true"></BubbleButtons>
            </v-navigation-drawer>
        </v-layout>
    </v-navigation-drawer>
</template>

<script>
    import TagMenu from '@/components/TagMenu'
    import BubbleButtons from '@/components/graph/BubbleButtons'
    import Moment from 'moment'
    import I18n from '@/I18n'
    import SelectionHandler from '@/SelectionHandler'

    export default {
        name: "SideMenu",
        components: {
            TagMenu,
            BubbleButtons
        },
        data: () => {
            I18n.i18next.addResources("en", "side", {
                "creationDate": "Created",
                "tags": "Tags",
                "merge": "Merge"
            });
            I18n.i18next.addResources("fr", "side", {
                "creationDate": "Créé",
                "tags": "Étiquettes",
                "merge": "Fusion"
            });
            return {
                SelectionHandler: SelectionHandler,
                tabMenu: null,
                items: [
                    {title: 'Home', icon: 'dashboard'},
                    {title: 'About', icon: 'question_answer'}
                ]
            }
        },
        computed: {
            selected: () => {
                return SelectionHandler.getSingle();
            },
            isSingle: () => {
                return SelectionHandler.isSingle();
            }
        },
        methods: {
            formatDate: function (date) {
                return new Moment(date).fromNow();
            }
        }
    }
</script>

<style scoped>

</style>