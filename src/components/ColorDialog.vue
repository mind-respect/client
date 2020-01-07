<template>
    <v-bottom-sheet v-model="dialog" inset max-width="325" mode="hex">
        <v-card>
            <v-card-title>
                {{$t('color:title')}}
                <v-spacer></v-spacer>
                <v-icon
                        color="third"
                        @click="dialog = false"
                >
                    close
                </v-icon>
            </v-card-title>
            <v-card-text>
                <v-row justify="space-around">
                    <v-color-picker show-swatches v-model="color" hide-inputs></v-color-picker>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="useDefault()" small>
                    <v-icon class="mr-2">
                        clear
                    </v-icon>
                    {{$t('color:useDefault')}}
                </v-btn>
            </v-card-actions>
            <v-card-actions>
                <v-btn color="secondary" @click="confirm">
                    {{$t('confirm')}}
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false">
                    {{$t('cancel')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-bottom-sheet>
</template>

<script>
    import I18n from '@/I18n'
    import Selection from '@/Selection'
    import GraphElementService from '@/graph-element/GraphElementService'
    import Color from '@/Color'

    export default {
        name: "ColorDialog",
        mounted: function () {
            this.$store.dispatch("setIsColorFlow", false);
        },
        data: function () {
            I18n.i18next.addResources("en", "color", {
                "title": "Define color",
                useDefault: "Default color"
            });
            I18n.i18next.addResources("fr", "color", {
                "title": "Définir la couleur",
                useDefault: "Couleur par défaut"
            });
            return {
                dialog: false,
                color: null,
                originalColor: null
            }
        },
        computed: {
            isColorFlow: function () {
                return this.$store.state.isColorFlow;
            },
            bubble: function () {
                return Selection.getSingle();
            }
        },
        watch: {
            isColorFlow: function () {
                if (this.$store.state.isColorFlow) {
                    this.dialog = true;
                    this.originalColor = this.color = this.bubble.getColors().background || Color.DEFAULT_BACKGROUND_COLOR;
                } else {
                    this.dialog = false;
                }
            },
            dialog: function () {
                if (this.dialog === false) {
                    this.$store.dispatch("setIsColorFlow", false);
                    this.refreshColor(this.originalColor);
                }
            },
            color: function () {
                this.refreshColor();
            }
        },
        methods: {
            useDefault: function () {
                GraphElementService.saveColors(
                    this.bubble,
                    {
                        background: Color.DEFAULT_BACKGROUND_COLOR
                    }
                );
                this.originalColor = Color.DEFAULT_BACKGROUND_COLOR;
                this.dialog = false;
            },
            confirm: function () {
                GraphElementService.saveColors(
                    this.bubble,
                    {
                        background: this.color
                    }
                );
                this.originalColor = this.color;
                this.dialog = false;
            },
            refreshColor: function (color) {
                color = color || this.color;
                this.bubble.setBackgroundColor(color);
                if (this.bubble.isCenter) {
                    Color.refreshBackgroundColor(color);
                } else if (this.bubble.getNextChildren().length === 0) {
                    this.bubble.refreshContent();
                }
            }
        }
    }
</script>

<style scoped>

</style>