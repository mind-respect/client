<template>
    <div>
        <v-card color="black" class="white--text">
            <v-card-title class="vh-center">
                <h3 class="text-center mb-12 mt-12">
                    <!--<v-badge color="secondary" left large :class="{-->
                    <!--'ml-4': $vuetify.breakpoint.smAndDown-->
                    <!--}">-->
                    <!--<span slot="badge">{{level}}</span>-->
                    <!--<span class="mr-4 display-2 font-weight-thin">{{level}}</span>-->
                    <!--<span class="headline">{{title}}</span>-->
                    <!--</v-badge>-->
                    <span class="mr-6 display-2 font-weight-thin">{{level}}</span>
                    <span class="headline">{{title}}</span>
                    <div class="text-center subtitle-1 mt-4 mb-4" v-if="$slots['description']">
                        <slot name="description"></slot>
                    </div>
                </h3>
            </v-card-title>
        </v-card>
        <v-parallax :src="require('@/assets/about/levels/' + image)" v-if="image"
                    :height="stepsParallaxHeight"></v-parallax>
    </div>
</template>

<script>
    export default {
        name: "Level",
        props: [
            'image', 'title', 'level'
        ],
        data: function () {
            return {
                stepsParallaxHeight: 350
            }
        }
    }
</script>

<style scoped>

</style>
