<template>
    <v-autocomplete prepend-icon="search"
                    v-model="searchText"
                    light solo
                    right
                    flat
                    hide-no-data
                    cache-items
                    :placeholder="$t('search:placeholder')"
                    height="43">

    </v-autocomplete>
</template>

<script>
    import I18n from '@/I18n'

    export default {
        name: "Search",
        data: () => {
            I18n.i18next.addResources("en", "search", {
                "placeholder": "Search your bubbles"
            });
            I18n.i18next.addResources("fr", "search", {
                "placeholder": "Recherchez vos bulles"
            });
            return {
                searchText:null
            };
        }
    }
</script>

<style scoped>

</style>