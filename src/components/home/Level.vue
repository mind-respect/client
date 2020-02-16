<template>
    <div>
        <v-card color="black" class="white--text" dark>
            <v-card-title class="vh-center">
                <h3 class="text-center mt-12">
                    <span class="mr-6 display-2 font-weight-thin white--text">{{level}}</span>
                    <span class="headline">{{title}}</span>
                </h3>
            </v-card-title>
            <v-card-text class="text-center subtitle-1 pt-6 pb-12">
                <slot name="description" v-if="$slots['description']"></slot>
            </v-card-text>
        </v-card>
        <v-img :src="require('@/assets/about/levels/' + image)"></v-img>
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
                loaded: false,
                stepsParallaxHeight: 325
            }
        },
        mounted: function () {
            setTimeout(() => {
                this.loaded = true;
            }, 100)
        }
    }
</script>

<style scoped>

</style>
