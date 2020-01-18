<template>
    <v-chip-group
            multiple
            active-class="primary--text"
            class="subtitle-1 font-weight-bold tag-chip-group"
    >
        <v-chip
                :color="tag.getChipBackgroundColor()"
                small
                :dark="shouldTextBeWhiteFromBackgroundColor(tag.getChipBackgroundColor())"
                :to="tag.uri().url()"
                v-for="tag in tags"
        >
            {{tag.getLabel()}}
            <v-avatar
                    right
                    :color="ColorLuminance(tag.getChipBackgroundColor(), -0.25)"
                    :dark="true"
            >
                {{tag.getNbReferences()}}
            </v-avatar>
        </v-chip>
    </v-chip-group>
</template>

<script>
    import Color from "../Color";

    export default {
        name: "Tags",
        props: ['tags'],
        methods:{
            shouldTextBeWhiteFromBackgroundColor: function (hexColor) {
                return Color.getContrast(hexColor) === 'white'
            },
            ColorLuminance: function (hex, lum) {
                // validate hex string
                hex = String(hex).replace(/[^0-9a-f]/gi, '');
                if (hex.length < 6) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }
                lum = lum || 0;

                // convert to decimal and change luminosity
                var rgb = "#", c, i;
                for (i = 0; i < 3; i++) {
                    c = parseInt(hex.substr(i * 2, 2), 16);
                    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                    rgb += ("00" + c).substr(c.length);
                }

                return rgb;
            }
        }
    }
</script>