<template>
    <v-card flat @click="$store.dispatch('setIsDescriptionFlow', true)" hover v-show="bubble">
        <v-card-title class="pt-4 pb-0 subtitle-1">
            <span class="pt-0 grey--text body-1 text-center" v-show="bubble.getComment() === ''">
                {{$t('noteMenu:noNote')}}
            </span>
        </v-card-title>
        <v-card-text v-html="bubble.getComment()" class="pt-0" style="color:inherit"></v-card-text>
    </v-card>
</template>

<script>
    import I18n from '@/I18n'
    import IdUri from "@/IdUri";

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
            return {
                redrawKey: IdUri.uuid()
            };
        },
        computed: {
            isDescriptionFlow: function () {
                return this.$store.state.isDescriptionFlow
            }
        },
        watch: {
            isDescriptionFlow: function () {
                this.redrawKey = IdUri.uuid();
            }
        }
    }
</script>

<style scoped>

</style>