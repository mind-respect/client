<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <v-card flat>
        <v-card-text class="vh-center">
            <Tags :tags="bubble.getRelevantTags()" v-if="bubble"></Tags>
        </v-card-text>
    </v-card>
</template>

<script>
    import SearchLoadMore from '@/components/search/SearchLoadMore'
    import SearchResultContent from '@/components/search/SearchResultContent'
    import SearchResultAction from '@/components/search/SearchResultAction'
    import I18n from '@/I18n'
    import SearchService from '@/search/SearchService'
    import Tag from '@/tag/Tag'

    export default {
        name: "TagMenu",
        props: ['bubble'],
        components: {
            Tags: () => import('@/components/Tags'),
        },
        data: function () {
            I18n.i18next.addResources("en", "tag", {
                "title": "Tag",
                'tags': 'Tags',
                'disassociate': 'Disassociate',
                'center': 'Center',
                'reference': 'Reference',
                'createNew': 'Create new tag'
            });
            I18n.i18next.addResources("fr", "tag", {
                "title": "Étiquette",
                'tags': 'Étiquettes',
                'disassociate': 'Désassocier',
                'center': 'Centrer',
                'reference': 'Référence',
                'createNew': 'Créer une nouvelle étiquette'
            });
            return {}
        },
        mounted: function () {

        },
        computed: {
            selected: function () {
                return this.$store.state.selected;
            },
            identifiers: function () {
                return this.bubble.identifiers;
            }
        },
        watch: {
            search: function (val) {
                val && val !== this.select && this.querySelections(val)
            }
        },
        methods: {}
    }
</script>

<style>

</style>
