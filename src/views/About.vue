<template>
  <div>
    <!--          <banner></banner>-->
    <v-layout
        align-center
        column
        justify-center
    >
      <v-card flat class="pt-12" max-width="815">
        <v-card-title class="pt-0 pb-0 vh-center">
          <!--            <h1 class="text-h2  font-weight-light mt-6 text-center" style="">-->
          <!--              Work on your personal <span style="white-space: nowrap">knowledge</span> graph-->
          <!--            </h1>-->
          <h1 class="text-h2  font-weight-light mt-6 text-center" style="line-height: 1.4">
            {{ $t('about:title1') }}
          </h1>
        </v-card-title>
        <v-card-title class="vh-center">
          <!--            <h4 class="text-h6 font-weight-bold text-center">-->
          <!--              In mindrespect.com, the graph is not just an analogy or a view only feature. Your notes, tags, relationships it's a first class feature becomes a reality and it becomes more intuitive to create links between ideas, to merge them, to restructure them, in short to make them evolve.-->
          <!--            </h4>-->
          <!--            <h4 class="text-h6 font-weight-regular text-justify">-->
          <!--              Benefit from the power of the underlying graph database that allows you to create links between your ideas, to merge them, to restructure them, in short to make them evolve.-->
          <!--            </h4>-->
          <h4 class="text-h6 font-weight-regular text-justify" style="line-height: 2;">
            {{ $t('about:slogan') }}
            <!--            Notes that are atomic, networkable, reusable and ever evolving-->
            <!--            in the spirit of the <a-->
            <!--              href="https://en.wikipedia.org/wiki/Zettelkasten">Zettelkasten method</a>-->
          </h4>
        </v-card-title>
      </v-card>
    </v-layout>
    <v-row class="pt-8 pb-8" v-if="$store.state.user === undefined">
      <v-col cols="12" class="vh-center">
        <v-btn @click="$router.push('register')" color="third" dark>{{ $t('about:useItForFree') }}</v-btn>
      </v-col>
    </v-row>
    <v-row class="mt-8 vh-center">
      <v-col cols="12" md="6" class="pa-0">
        <v-card width="930" elevation="16">
          <v-img
              :src="require('@/assets/about/features/mindmap.gif')"
          ></v-img>
        </v-card>
      </v-col>
      <!--      <v-col cols="6" class="pa-0 vh-center">-->
      <!--        <v-card flat color="secondary" tile height="100%" width="100%" class="vh-center">-->
      <!--          <v-card flat color="transparent" dark>-->
      <!--            <v-card-title class="text-center white&#45;&#45;text vh-center pr-0 pl-0">-->
      <!--              {{ $t('about:mindmapTitle') }}-->
      <!--            </v-card-title>-->
      <!--            <v-card-subtitle class="text-center">-->
      <!--              {{ $t('about:mindmap') }}-->
      <!--            </v-card-subtitle>-->
      <!--          </v-card>-->
      <!--        </v-card>-->
      <!--      </v-col>-->
    </v-row>
    <v-row class="vh-center mt-12">
      <v-col cols=12 md="7">
        <v-card dark color="black" class="text-h6 font-weight-regular pt-12" :class="{
          'pa-12': $vuetify.breakpoint.mdAndUp,
          'pl-2 pr-2': $vuetify.breakpoint.smAndDown
        }">
          <v-row class="vh-center">
            <v-col cols="12" md="8" :class="{
              'text-center': $vuetify.breakpoint.smAndDown,
              'text-justify': $vuetify.breakpoint.mdAndUp
            }">
              <h2 class="text-center mb-8">
                <span class="first-letter-font first-letter-title">{{ $t('about:features').charAt(0) }}</span>{{
                  $t('about:features').substr(1)
                }}
              </h2>
              <p>
                <span class="first-letter-font first-letter-title">{{ $t('about:mindmapFeature').charAt(0) }}</span>{{
                  $t('about:mindmapFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:graphFeature').charAt(0) }}</span>{{
                  $t('about:graphFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{
                    $t('about:biDirectionalFeature').charAt(0)
                  }}</span>{{
                  $t('about:biDirectionalFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:tagFeature').charAt(0) }}</span>{{
                  $t('about:tagFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:mergeFeature').charAt(0) }}</span>{{
                  $t('about:mergeFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:similarFeature').charAt(0) }}</span>{{
                  $t('about:similarFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:shareFeature').charAt(0) }}</span>{{
                  $t('about:shareFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:copyTreeFeature').charAt(0) }}</span>{{
                  $t('about:copyTreeFeature').substr(1)
                }}
              </p>
              <p class="mt-10">
                <span class="first-letter-font first-letter-title">{{ $t('about:templateFeature').charAt(0) }}</span>{{
                  $t('about:templateFeature').substr(1)
                }}
              </p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <!--    <v-row class="vh-center">-->
    <!--      <v-col cols="6">-->
    <!--        <h4>Fonctionalités</h4>-->
    <!--        <v-list>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              Any node can become the center node so there are no absolutes there too-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              The share level is granular, at the node level-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              You can copy the shared trees of other users into your own graph, edit them and you will be notified when-->
    <!--              they make changes-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              You can name the relations between nodes, use tags and view all nodes that share the same tag-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              You can create, use and share your templates (called patterns)-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              You can merge two nodes and all their relationships when you find two concepts that are the same or wanna-->
    <!--              merge them together-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--          <v-list-item>-->
    <!--            <v-list-item-title>-->
    <!--              You can view as list, change the color and font etc-->
    <!--            </v-list-item-title>-->
    <!--          </v-list-item>-->
    <!--        </v-list>-->
    <!--      </v-col>-->
    <!--    </v-row>-->
    <v-layout
        class="mb-12 mt-12 vh-center"
    >
      <v-flex xs12>
        <v-card color="secondary" class="white--text">
          <v-card-title class="title white--text text-center vh-center">
            <v-icon class="mr-2 white--text">
              lightbulb_outline
            </v-icon>
            {{ $t('about:whatYouDo') }}
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
    <Level :title="$t('about:level1Title')" :level="1" image="swamp-2248571_1280_optimized_small.jpg">
      <!--https://pixabay.com/fr/marais-floride-terres-humides-2248571/-->
      <div slot="description">
        <p class="title mb-0 white--text">
          {{ $t('about:level1Desc1') }}
        </p>
        <p class="text-subtitle-1">
          {{ $t('about:level1Desc2') }}
        </p>
      </div>
    </Level>
    <Level :title="$t('about:level2Title')" :level="2" image="plants-2564038_1280_optimized_small.jpg">
      <!--https://pixabay.com/fr/plantes-nature-vert-feuilles-2564038/-->
      <div slot="description">
        <p class="title white--text">
          {{ $t('about:level2Desc1') }}
        </p>
      </div>
    </Level>
    <Level image="organized_chaos_optimized_small.jpg" :title="$t('about:level3Title')" :level="3">
      <!--https://pixabay.com/fr/intelligence-artificielle-cerveau-3382507/-->
      <div slot="description" class="vh-center">
        <p class="title white--text">
          {{ $t('about:level3Desc1') }}
        </p>
      </div>
    </Level>
    <Level image="mindmap_optimized_small.jpg" :title="$t('about:level4Title')" :level="4">
      <div slot="description">
        <p class="title white--text mb-0">
          {{ $t('about:level4Desc1') }}
        </p>
        <p class="text-subtitle-1 mt-0">
          {{ $t('about:level4Desc11') }}
        </p>
      </div>
    </Level>
    <Level image="neurons_optimized_small.jpg" :title="$t('about:level5Title')" :level="5">
      <!--https://www.flickr.com/photos/jjorquera/15433132769-->
      <div slot="description">
        <v-list color="primary" three-line dark class="pt-0 mt-0">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                {{ $t('about:level5Desc1') }}
                <v-list-item-subtitle class="text-subtitle-1">
                  {{ $t('about:level5Desc11') }}
                </v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                {{ $t('about:level5Desc2') }}
                <v-list-item-subtitle class="text-subtitle-1">
                  {{ $t('about:level5Desc21') }}
                </v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </Level>
    <Level image="dawn-3804124_1280_optimized.jpg" :title="$t('about:level6Title')" :level="6">
      <!--https://pixabay.com/fr/dawn-arbres-l-%C3%A9cart-brouillard-3804124/-->
    </Level>
    <v-layout wrap class="" v-if="!$store.state.user">
      <v-flex xs12 md6 class="vh-center">
        <v-card flat color="secondary" height="100%" class="vh-center" tile>
          <v-card-title class="text-center white--text vh-center pr-0 pl-0">
            <h3 class="text-h3 text-center">
              {{ $t('register:title') }}
            </h3>
            <div class="text-h6">
              {{ $t('register:subtitle') }}
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
      <v-flex xs12 md6 class="mt-12 mb-12">
        <RegisterForm></RegisterForm>
      </v-flex>
    </v-layout>
    <v-footer class="pa-4" dark>
      <v-spacer></v-spacer>
      <v-icon class="flip-horizontal mr-2">copyright</v-icon>
      Copyleft
      <span class="ml-2">Vincent Blouin</span>
      <v-spacer></v-spacer>
      <a href="https://www.facebook.com/mindrespectapp" :small="$vuetify.breakpoint.mdAndDown" class="mr-4 mt-1">
        <img src="https://facebookbrand.com/wp-content/uploads/2016/05/flogo_rgb_hex-brc-site-250.png?w=30&h=30">
      </a>
      <a href="https://github.com/mind-respect">
        <img height="32" width="32" :src="require('@/assets/about/GitHub-Mark-Light-32px.png')" class="mt-1">
      </a>
    </v-footer>
  </div>
</template>

<script>
import I18n from '@/I18n'
import Banner from "@/components/home/Banner";
import Level from "@/components/home/Level"
import RegisterForm from "@/components/home/RegisterForm"

export default {
  components: {Banner, Level, RegisterForm},
  data: function () {
    I18n.i18next.addResources("en", "about", {
      title1: "Take notes directly in your visual graph",
      useItForFree: "Use for free",
      slogan: "An elegant mindmap powered by a graph database for notes that are atomic, networked, reusable and ever evolving.",
      features: "Features",
      mindmapFeature: "Mindrespect's interface is a mindmap and it includes many features of these kind of tools.",
      graphFeature: "But like in a graph, you can link to any other node in any other mindmap.",
      biDirectionalFeature: "This of course acts like a bi-directional link since you can access your related nodes from any center. Any bubble can also become the center !",
      tagFeature: "Sometimes you don't wanna link to a node but only reference it and that is why you can rather tag a bubble.",
      mergeFeature: "You will most probably end up with duplicate thoughts in your graph and you may want to merge them to stay clean and have all of their surround nodes be together.",
      similarFeature: "Also, to avoid duplicates, when you're done editing a bubble, you will be invited to tag or merge with similar nodes.",
      shareFeature: "In addition, you can pick and choose which nodes you share and which you keep private. So you can express yourself freely, for yourself and then choose exactly which nodes you want to share. Others will only see the nodes that you shared.",
      copyTreeFeature: "You can also copy the knowledge trees of other users and integrate them into your own personal knowledge graph. You will be notified when they make changes and choose what modifications you accept.",
      templateFeature: "Finally, the Templates let you identify thought patterns and reuse them to solve similar problems.",
      mindmapTitle: "Mindmap interface",
      mindmap: "Elegancy, funness and feeling of exploration are included",
      whatYouDo: 'What do you do when you have a new idea?',
      level1Title: "You don't write down your idea",
      level1Desc1: "A new idea is like a small stream in your brain.",
      level1Desc2: "It dries quickly if you don't revisit it from time to time.",
      level2Title: 'You write your idea',
      level2Desc1: "You increase the chances that this new idea will become a reality.",
      level2Desc2: "Helps you to memorize your ideas",
      level2Desc3: "Facilitates your thinking",
      level3Title: "You record your idea in a software program",
      level3Desc1: "Because you find your ideas quickly, you consult them more often and you are more aware of them.",
      level4Title: "You write it down in a mind map software",
      level4Desc1: "Your notes are more structured and your idea clearer",
      level4Desc11: "The mindmap format honours both content and structure.",
      level5Title: "You write it down in MindRespect.com !",
      level5Desc1: "You are more coherent",
      level5Desc11: "Your idea is more linked and integrated",
      level5Desc2: "You are more aware",
      level5Desc21: "You discover the path between your idea and reality",
      level6Title: "Like your mind, you act in a coherent and conscious way"
    });
    I18n.i18next.addResources("fr", "about", {
      title1: "Prenez des notes directement dans votre graphe",
      useItForFree: "Utilisez gratuitement",
      slogan: "Une mindmap élégante, propulsée par une base de donnée en graphe pour des notes atomiques, réseautées, réutilisables et en constante évolution.",
      features: "Fonctionnalités",
      mindmapFeature: "L'interface de Mindrespect est une mindmap et comporte plusieurs fonctionnalités de ce genre d'outils.",
      graphFeature: "Mais comme dans un graphe, vous pouvez lier une bulle à n'importe quel autre noeud appartenant à n'importe quelle autre de vos mindmaps.",
      biDirectionalFeature: "Cela bien sûr agit comme un lien bi-directionnel puisque vous pouvez accéder à vos noeuds reliés à partir de n'importe quel centre. Aussi, n'importe quelle bulle peut devenir le centre !",
      tagFeature: "Parfois, vous ne voulez pas lier à un noeud mais seulement y faire référence et c'est pourquoi vous pouvez plutôt étiquetter à une bulle.",
      mergeFeature: "Vous allez fort probablement vous retrouvez avec des notes dupliquées dans votre graphe et vous allez vouloir les fusionner pour rester propre et avoir toutes les bulles environnantes se retrouver ensemble.",
      similarFeature: "Aussi, pour éviter les duplicats après avoir terminé l'édition d'une bulle, vous serez invité à étiquetter ou fusionner avec des noeuds similaires.",
      shareFeature: "En outre, vous pouvez choisir quelles bulles vous partagez et lesquelles vous maintenez privées. Vous pouvez alors vous exprimer librement, pour vous même et ensuite choisir exactement quels noeuds vous voulez partager. Les autres ne vont voir que les bulles que vous avez partagés.",
      copyTreeFeature: "Vous pouvez aussi copier les arbres de connaissance d'autres usagers et les intégrer dans votre graphe de connaissance personnel. Vous serez avisé lorsqu'ils apporteront des changements et vous pourrez choisir lesquels vous accepter d'intégrer ou non.",
      templateFeature: "Finalement les Modèles vous laisse identifier des patterns de pensées pour les réutiliser afin de résoudre des problèmes similaires",
      whatYouDo: 'Que faites vous lorsque vous avez une nouvelle idée ?',
      level1Title: "Vous ne notez pas votre idée",
      level1Desc1: "Une nouvelle idée est telle un petit canal dans votre cerveau.",
      level1Desc2: "Elle s'assèche rapidement si vous ne la revisitez pas de temps en temps.",
      level2Title: 'Vous écrivez votre idée',
      level2Desc1: "Vous augmentez les chances que cette nouvelle idée devienne une réalité.",
      level2Desc2: "Vous aide à mémoriser vos idées",
      level2Desc3: "Facilite votre réflexion",
      level3Title: "Vous notez votre idée dans un logiciel",
      level3Desc1: "Parce que vous retrouvez rapidement vos idées, vous les consulter plus souvent et vous en êtes plus conscient",
      level4Title: "Vous la notez dans un logiciel de carte mentale",
      level4Desc1: "Vos notes sont plus structurées et votre idée plus claire",
      level4Desc11: "Le format carte mentale ou mindmap, honore autant le contenu que la structure",
      level5Title: "Vous la notez dans MindRespect.com !",
      level5Desc1: "Vous êtes plus cohérent",
      level5Desc11: "Votre idée est davantage liée et intégrée",
      level5Desc2: "Vous êtes plus conscient",
      level5Desc21: "Vous découvrez le chemin entre votre idée et la réalité",
      level6Title: "À l'image de votre esprit, vous agissez de façon cohérente et consciente"
    });
    return {
      noteTakingLevels: [
        {
          color: 'red lighten-2',
          icon: 'not_interested',
          title: 'level1Title',
          desc: 'level1Desc'
        },
        {
          color: 'purple darken-1',
          icon: 'mdi-book-variant'
        },
        {
          color: 'green lighten-1',
          icon: 'mdi-airballoon'
        },
        {
          color: 'indigo',
          icon: 'mdi-buffer'
        }
      ]
    }
  },
  mounted: function () {
    if (this.$store.state.user && this.$route.name === 'home') {
      this.$router.push({
        name: 'UserHome',
        params: {
          username: this.$store.state.user.username
        }
      })
    } else {
      document.scrollingElement.scrollTop = 0;
    }
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

.first-letter-font {
  font-family: 'Great Vibes', cursive;
  font-size: 2rem !important;
  font-weight: bold;
  margin-right: 5px;

  &.first-letter-title {
    font-size: 3rem !important;
  }
}

.v-card__title {
  word-break: inherit !important;
}
</style>
