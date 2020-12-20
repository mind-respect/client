<template>
    <v-radio-group v-model="shareLevelLocal" class="pa-0 mt-0" @change="$emit('update', shareLevelLocal)"
                   :disabled="$store.state.selected.length === 0">
        <v-radio :label="$t('shareSelect:private')" on-icon="lock" off-icon="lock" value="PRIVATE"
                 color="thirdLight"></v-radio>
        <v-radio :label="$t('shareSelect:friendsOnly')" value="FRIENDS" on-icon="people"
                 off-icon="people" color="thirdLight"></v-radio>
        <v-radio :label="$t('shareSelect:publicWithLink')" value="PUBLIC_WITH_LINK" on-icon="link"
                 off-icon="link" color="thirdLight"></v-radio>
        <v-radio :label="$t('shareSelect:public')" value="PUBLIC" on-icon="public" off-icon="public"
                 color="thirdLight"></v-radio>
    </v-radio-group>
</template>

<script>
    import I18n from '@/I18n'

    export default {
        name: "ShareLevelSelection",
        props: ['shareLevel'],
        data: function () {
            I18n.i18next.addResources("en", "shareSelect", {
                private: "Private",
                public: "Public and indexed by search engines",
                publicWithLink: "Public with link",
                friendsOnly: "Friends only",
            });
            I18n.i18next.addResources("fr", "shareSelect", {
                private: "Privé",
                public: "Publique et indexé par les moteurs de recherche",
                publicWithLink: "Publique avec le lien",
                friendsOnly: "Amis seulement",
            });
            return {
                shareLevelLocal: null
            }
        },
        mounted: function () {
            this.shareLevelLocal = this.shareLevel;
        },
        watch: {
            shareLevel: function () {
                this.shareLevelLocal = this.shareLevel;
            }
        }
    }
</script>

<style scoped>

</style>