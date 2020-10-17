<template>
  <div :style="menuBackgroundColor" class="vh-center">
    <Button v-for="menuButton in menu" :button="menuButton" :controller="controller" :isInSideMenu="isInSideMenu"
            :hightlight="menuButton.hightlight" :large="menuButton.large" v-show="!menuButton.isCustom"
            @performed="$emit('performed')"></Button>
  </div>
</template>

<script>
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
  }
}
</script>

<style scoped>

</style>