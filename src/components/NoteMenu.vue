<template>
    <v-card flat @click="$store.dispatch('setIsDescriptionFlow', true)" hover
            :key="$store.state.noteRefresh + 'noteMenu'" :disabled="!bubble">
        <v-card-title class="pt-4 pb-0 text-subtitle-1">
            <span class="pt-0 grey--text text-body-1 text-center" v-show="bubble && bubble.getComment() === ''">
                {{$t('noteMenu:noNote')}}
            </span>
        </v-card-title>
        <v-card-text v-if="bubble" v-html="bubble.getComment()" class="pt-0" style="color:inherit"></v-card-text>
        <v-skeleton-loader
                type="paragraph"
                class="pa-6"
                v-show="$store.state.selected.length === 0"
        >
        </v-skeleton-loader>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'

    export default {
        name: "NoteMenu",
        props: ['bubble'],
        data: function () {
            I18n.i18next.addResources("en", "noteMenu", {
                "noNote": "Empty note"
            });
            I18n.i18next.addResources("fr", "noteMenu", {
                "noNote": "Note vide"
            });
            return {};
        }
    }
</script>

<style scoped>

</style>