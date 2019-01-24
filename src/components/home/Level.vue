<template>
    <v-card color="black" class="white--text">
        <v-card-title class="vh-center">
            <h3 class="text-xs-center mb-5 mt-5">
                <!--<v-badge color="secondary" left large :class="{-->
                <!--'ml-4': $vuetify.breakpoint.smAndDown-->
            <!--}">-->
                    <!--<span slot="badge">{{level}}</span>-->
                    <!--<span class="mr-4 display-2 font-weight-thin">{{level}}</span>-->
                    <!--<span class="headline">{{title}}</span>-->
                <!--</v-badge>-->
                <span class="mr-4 display-2 font-weight-thin">{{level}}</span>
                <span class="headline">{{title}}</span>
                <div class="text-xs-center subheading mt-3 mb-3" v-if="$slots['description']">
                    <slot name="description"></slot>
                </div>
            </h3>
        </v-card-title>
    </v-card>
</template>

<script>
    export default {
        name: "Level",
        props: [
            'title', 'level'
        ]
    }
</script>

<style scoped>

</style>
