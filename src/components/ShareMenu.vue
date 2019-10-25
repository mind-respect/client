<template>
    <v-card flat>
        <v-card-text class="pt-2 pb-0 mt-0 vh-center">
            <v-btn small text class="pa-0 mt-0" v-clipboard:copy="bubbleUrl" v-if="$store.state.selected.length === 1">
                <v-icon class="mr-2">link</v-icon>
                {{$t('share:copy')}}
            </v-btn>
        </v-card-text>
        <v-card-title class="pt-1 pb-0 subtitle-1 vh-center grey--text">
            {{$t('share:title')}}
        </v-card-title>
        <v-card flat class="pt-0">
            <v-card-text class="pt-0 mt-0 vh-center" id="shareMenu">
                <v-radio-group v-model="shareLevel" class="pa-0 mt-0" @change="update">
                    <v-radio :label="$t('share:private')" on-icon="lock" off-icon="lock" value="PRIVATE" color="third"></v-radio>
                    <v-radio :label="$t('share:friendsOnly')" value="FRIENDS" on-icon="people"
                             off-icon="people" color="third"></v-radio>
                    <v-radio :label="$t('share:publicWithLink')" value="PUBLIC_WITH_LINK" on-icon="link"
                             off-icon="link" color="third"></v-radio>
                    <v-radio :label="$t('share:public')" value="PUBLIC" on-icon="public" off-icon="public" color="third"></v-radio>
                </v-radio-group>
            </v-card-text>
        </v-card>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import ShareLevel from '@/vertex/ShareLevel'

    export default {
        name: "ShareMenu",
        data: function () {
            I18n.i18next.addResources("en", "share", {
                title: "Share level",
                private: "Private",
                public: "Public and indexed by search engines",
                publicWithLink: "Public with link",
                friendsOnly: "Friends only",
                copy: "Copy bubble's link"
            });
            I18n.i18next.addResources("fr", "share", {
                title: "Niveau de partage",
                private: "Privé",
                public: "Publique et indexé par les moteurs de recherche",
                publicWithLink: "Publique avec le lien",
                friendsOnly: "Amis seulement",
                copy: "Copier le lien de la bulle"
            });
            return {
                loading: false,
                shareLevel: null
            }
        },
        mounted: function () {
            this.shareLevel = this.getShareLevel();
        },
        computed: {
            selected: function () {
                return this.$store.state.selected;
            },
            controller: function () {
                return Selection.controller();
            },
            bubbleUrl: function () {
                return Selection.getSingle().uri().absoluteUrl();
            }
        },
        watch: {
            selected: function () {
                this.shareLevel = this.getShareLevel();
            }
        },
        methods: {
            update: function () {
                this.controller.setShareLevelDo(this.shareLevel);
            },
            getShareLevel: function () {
                if (this.controller._areAllElementsPublicWithLink()) {
                    return ShareLevel.PUBLIC_WITH_LINK;
                } else if (this.controller._areAllElementsPublic()) {
                    return ShareLevel.PUBLIC;
                } else if (this.controller._areAllElementsFriendsOnly()) {
                    return ShareLevel.FRIENDS;
                } else if (this.controller._areAllElementsPrivate()) {
                    return ShareLevel.PRIVATE;
                } else {
                    return "na"
                }
            }
        }
    }

</script>

<style scoped>

</style>