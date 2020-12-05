<template>
  <div :style="menuBackgroundColor" class="vh-center">
      <span v-for="menuButton in menu" :key="menuButton.action" :class="{
            'h-center': isInSideMenu
        }">
    <Button :button="menuButton" :controller="controller" :isInSideMenu="isInSideMenu"
            :hightlight="menuButton.hightlight" :large="menuButton.large" :isMenuButton="true"
            v-show="!menuButton.isCustom"
            @performed="$emit('performed')"></Button>
    <Button :button="menuButton" :isInSideMenu="isInSideMenu" :controller="controller"
            v-show="menuButton.isCustom && menuButton.action === 'copy'" class="">
            <v-btn
                slot="button"
                icon
                color="black"
                text
                @click="copyLabel"
                large
            >
                <v-icon>{{ menuButton.icon }}</v-icon>
            </v-btn>

            <span slot="tooltipContent">
                {{ $t('button:' + menuButton.action) }}
            </span>
        </Button>
      </span>
  </div>
</template>

<script>
import Selection from "@/Selection";

export default {
  name: "ButtonMenu",
  components: {
    Button: () => import('@/components/graph/Button'),
  },
  props: [
    'menu',
    'controller',
    'isInSideMenu',
  ],
  data: function () {
    return {};
  },
  computed: {
    menuBackgroundColor: function () {
      return {
        'background-color': this.$store.state.backgroundColor
      }
    }
  },
  methods: {
    copyLabel: function () {
      this.$copyText(
          Selection.getSingle().getLabelHtml().textContent
      )
    }
  }
}
</script>

<style scoped>

</style>