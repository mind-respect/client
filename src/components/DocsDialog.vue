<template>
    <v-dialog v-model="dialog" v-if="dialog" fullscreen>
        <v-card flat>
            <v-card-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog=false">
                    <v-icon>
                        close
                    </v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="pt-0" :class="{
                'pa-0': $vuetify.breakpoint.smAndDown
            }">
                <!--STEP 1 Construire-->
                <v-stepper :alt-labels="$vuetify.breakpoint.mdAndUp">
                    <v-stepper-header>
                        <v-stepper-step
                                editable
                                step="1"
                        >
                            {{$t('guide:point1')}}
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step
                                editable
                                step="2"
                        >
                            {{$t('guide:point2')}}
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step
                                step="3"
                                editable
                        >
                            {{$t('guide:point3')}}
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step
                                step="4"
                                editable
                        >
                            {{$t('guide:point4')}}
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step
                                step="5"
                                editable
                        >
                            {{$t('guide:point5')}}
                        </v-stepper-step>

                        <v-divider></v-divider>

                        <v-stepper-step
                                step="6"
                                editable
                        >
                            {{$t('guide:point6')}}
                        </v-stepper-step>
                    </v-stepper-header>
                    <v-stepper-content step="1">
                        <div class="title">
                            {{$t('guide:titreA')}}
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.lgAndUp">
                                    keyboard
                                </v-icon>
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon color="third">add</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2></v-flex>
                            <v-flex xs10 lg8 class="body-1">
                                {{$t('guide:A1')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left body-1">
                                <v-icon>arrow_forward</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left">
                                <span v-if="$vuetify.breakpoint.lgAndUp">
                                    <v-icon class="mr-2">
                                        keyboard_tab
                                    </v-icon>
                                    Tab
                                </span>
                            </v-flex>
                            <v-flex xs10 lg8 class="body-1">
                                {{$t('guide:A2')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>arrow_downward</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <span v-if="$vuetify.breakpoint.lgAndUp">
                                    <v-icon class="mr-2">
                                        keyboard_return
                                    </v-icon>
                                    Enter
                                </span>
                            </v-flex>
                            <v-flex xs10 lg8 class="body-1">
                                {{$t('guide:A3')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs4 class="text-left body-1">
                                <v-icon class="mr-4">arrow_right_alt</v-icon>
                                <v-chip color="secondary">
                                    relation
                                </v-chip>
                            </v-flex>
                            <v-flex xs8 class="body-1">
                                <p>
                                    {{$t('guide:A4')}}
                                </p>
                                <p>
                                    {{$t('guide:groupRelationDesc1')}}
                                    <v-icon class="ml-2 mr-2 mb-1">label</v-icon>
                                    {{$t('guide:groupRelationDesc2')}}
                                </p>
                            </v-flex>
                        </v-layout>
                        <!--                        <v-layout class="mt-6">-->
                        <!--                            <v-flex xs4 class="text-left body-1">-->
                        <!--                                <v-icon class="mr-4">arrow_right_alt</v-icon>-->
                        <!--                                <v-chip color="secondary">-->
                        <!--                                    {{$t('guide:groupRelation')}}-->
                        <!--                                </v-chip>-->
                        <!--                            </v-flex>-->
                        <!--                            <v-flex xs8 class="body-1">-->
                        <!--                                {{$t('guide:groupRelationDesc')}}-->
                        <!--                            </v-flex>-->
                        <!--                        </v-layout>-->
                    </v-stepper-content>
                    <!--STEP 2 Naviguer-->
                    <v-stepper-content step="2" class="body-1">
                        <div class="title">
                            {{$t('guide:titreB')}}
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.lgAndUp">
                                    keyboard
                                </v-icon>
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6" v-if="$vuetify.breakpoint.lgAndUp">
                            <v-flex xs2 class="text-left">
                            </v-flex>
                            <v-flex lg2 class="text-left">
                                <v-icon small class="mr-2">arrow_upward</v-icon>
                                <v-icon small class="mr-2">arrow_downward</v-icon>
                                <v-icon small class="mr-2">arrow_back</v-icon>
                                <v-icon small>arrow_forward</v-icon>
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:useArrows')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>unfold_more</v-icon>
                                <v-icon class="ml-2 mr-2" x-small>brightness_1</v-icon>
                                <v-icon>unfold_less</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left" v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + E | H
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:B1')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>zoom_in</v-icon>
                                <v-icon class="ml-2 mr-2" x-small>brightness_1</v-icon>
                                <v-icon>zoom_out</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left" v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + + | -
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:B2')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>center_focus_strong</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 class="" v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + 0
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:B3')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon class="mr-2">center_focus_strong</v-icon>
                                CENTRES
                            </v-flex>
                            <v-flex xs2>
                                <!--<v-icon>touch_app</v-icon> -->
                            </v-flex>
                            <v-flex xs8>
                                {{$t('guide:B4')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon class="mr-2">search</v-icon>
                                {{$t('bubbles')}}
                            </v-flex>
                            <v-flex xs0 lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + F
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:B5')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>select_all</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2>
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:B6')}}
                            </v-flex>
                        </v-layout>
                    </v-stepper-content>
                    <!--STEP 3 Organiser-->
                    <v-stepper-content step="3" class="body-1">
                        <div class="title">
                            {{$t('guide:titreC')}}
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.lgAndUp">
                                    keyboard
                                </v-icon>
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs0 lg1 class="text-left body-1"></v-flex>
                            <v-flex xs2 lg3 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.mdAndDown" class="mr-4">touch_app</v-icon>
                                <span v-if="$vuetify.breakpoint.lgAndUp">
                                    <v-icon>mouse</v-icon>
                                    <v-icon class="ml-2 mr-2" x-small>brightness_1</v-icon>
                                    <span class="">
                                        {{ctrlKey}}
                                        <v-icon small class="mb-1">arrow_upward</v-icon>
                                        |
                                        <v-icon small class="mb-1">arrow_downward</v-icon>
                                    </span>
                                </span>
                            </v-flex>
                            <v-flex xs10 lg8 class="body-1">
                                {{$t('guide:A6')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs1 v-if="$vuetify.breakpoint.mdAndDown">
                                <v-icon>touch_app</v-icon>
                            </v-flex>
                            <v-flex xs3 v-if="$vuetify.breakpoint.mdAndDown">
                                {{$t('guide:longPress')}}
                            </v-flex>
                            <v-flex xs2 class="text-left" v-if="$vuetify.breakpoint.lgAndUp">
                                <v-icon>scatter_plot</v-icon>
                            </v-flex>
                            <v-flex xs2 v-if="$vuetify.breakpoint.lgAndUp">
                                <span>
                                    <v-icon class="mr-2">mouse</v-icon>
                                    {{$t('guide:rightClick')}}
                                </span>
                            </v-flex>
                            <v-flex xs8>
                                {{$t('guide:C4')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left font-weight-bold">
                                <v-icon class="mr-4">merge_type</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + M
                            </v-flex>
                            <v-flex xs10 lg8 class="body-1">
                                {{$t('guide:A5')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>label</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + G
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:C2')}}
                            </v-flex>
                        </v-layout>
                    </v-stepper-content>
                    <!--STEP 4 Préciser-->
                    <v-stepper-content step="4" class="body-1">
                        <div class="title">
                            {{$t('guide:titreD')}}
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.lgAndUp">
                                    keyboard
                                </v-icon>
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>note</v-icon>
                            </v-flex>
                            <v-flex lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + D
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:D2')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <img :src="require('@/assets/wikipedia.svg')" width="25">
                            </v-flex>
                            <v-flex xs2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + G
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:wikipediaTag')}}
                            </v-flex>
                        </v-layout>
                    </v-stepper-content>
                    <!--STEP 5 Décorer-->
                    <v-stepper-content step="5">
                        <div class="title">
                            {{$t('guide:titreE')}}
                        </div>
                        <div class="subtitle-1 font-italic">
                            {{$t('guide:titreE1')}}
                            <v-icon class="ml-2 mb-1">settings</v-icon>
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6 body-1">
                            <v-flex xs2 class="text-left">
                                <v-icon>font_download</v-icon>
                            </v-flex>
                            <v-flex xs10>
                                {{$t('guide:E1')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6 body-1">
                            <v-flex xs2 class="text-left">
                                <v-icon>format_paint</v-icon>
                            </v-flex>
                            <v-flex xs10>
                                {{$t('guide:E2')}}
                            </v-flex>
                        </v-layout>
                    </v-stepper-content>
                    <!--STEP 6 Diffuser-->
                    <v-stepper-content step="6" class="body-1">
                        <div class="title">
                            {{$t('guide:titreF')}}
                        </div>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="font-weight-bold text-left body-1">
                                {{$t('guide:icon')}}
                            </v-flex>
                            <v-flex xs0 lg2 class="text-left body-1">
                                <v-icon v-if="$vuetify.breakpoint.lgAndUp">
                                    keyboard
                                </v-icon>
                            </v-flex>
                            <v-flex xs10 lg8 class="text-left font-weight-bold body-1">
                                Description
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>share</v-icon>
                            </v-flex>
                            <v-flex xs12>
                                <p>
                                    {{$t('guide:shareUrl1')}}
                                    <v-icon class="ml-2 mr-2">public</v-icon>
                                    {{$t('guide:shareUrl2')}}
                                    <v-icon class="ml-2 mr-2">people</v-icon>
                                    {{$t('guide:shareUrl3')}}
                                </p>
                                <p>
                                    {{$t('guide:shareUrl4')}}
                                    <v-btn text click="" small>
                                        <v-icon class="mr-2">link</v-icon>
                                        {{$t('guide:copyLink')}}
                                    </v-btn>
                                </p>
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>public</v-icon>
                            </v-flex>
                            <v-flex lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + P
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('button:makePublic')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>lock</v-icon>
                            </v-flex>
                            <v-flex lg2 v-if="$vuetify.breakpoint.lgAndUp">
                                {{ctrlKey}} + P
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('button:makePrivate')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>share</v-icon>
                                <!--                                <v-btn small disabled>-->
                                <!--                                    <v-icon>public</v-icon>-->
                                <!--                                </v-btn>-->
                                <!--                                <v-btn small disabled>-->
                                <!--                                    <v-icon>link</v-icon>-->
                                <!--                                </v-btn>-->
                                <!--                                <v-btn small disabled>-->
                                <!--                                    <v-icon>people_alt</v-icon>-->
                                <!--                                </v-btn>-->
                                <!--                                <v-btn small disabled>-->
                                <!--                                    <v-icon>lock</v-icon>-->
                                <!--                                </v-btn>-->
                            </v-flex>
                            <v-flex xs0 lg2></v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:F1')}}
                            </v-flex>
                        </v-layout>
                        <v-layout class="mt-6">
                            <v-flex xs2 class="text-left">
                                <v-icon>format_list_bulleted</v-icon>
                            </v-flex>
                            <v-flex xs0 lg2>
                            </v-flex>
                            <v-flex xs10 lg8>
                                {{$t('guide:F3')}}
                                <v-btn text small @click="">
                                    <v-icon class="mr-2">
                                        content_copy
                                    </v-icon>
                                    {{$t('guide:copy')}}
                                </v-btn>
                                {{$t('guide:listPaste')}}
                            </v-flex>
                        </v-layout>
                    </v-stepper-content>
                </v-stepper>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="dialog = false" text class="mr-4">
                    {{$t('close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import I18n from '@/I18n'
    import UiUtils from '@/UiUtils'

    export default {
        name: "DocsDialog",
        data: function () {
            I18n.i18next.addResources('fr', 'guide', {
                icon: "Icône",
                title: "Guide mindrespect.com",
                titreA: "Manipulations de base pour la construction de votre carte",
                titreB: "Fonctionnalités de base pour naviguer à travers vos idées",
                titreC: "Fonctionnalités et manipulation pour organiser vos pensées et structurer vos notes",
                titreD: "Fonctionnalités pour approfondir et développer vos idées",
                titreE: "Pour personnaliser vos bulles centrales",
                titreE1: "Accessible depuis vos paramètres",
                titreF: "Pour partager vos cartes ou exporter vos idées",
                A1: "Créer une nouvelle bulle centrale (carte)",
                A2: "Ajouter une bulle enfant",
                A3: "Ajouter une bulle soeur. Ne s'applique pas aux bulles centrales",
                A4: "Nommer les relations entre vos bulles vous aide à comprendre le lien entre vos idées et peut contribuer à ce que vos notes restent bien découpées et réutilisables dans d'autres contextes",
                groupRelation: "relation groupée",
                groupRelationDesc1: "Vous pouvez également ajouter des enfants à une relation et elle devient alors une relation groupée. Toutes les relations sous une relation groupée partagent un étiquette",
                groupRelationDesc2: "en commun",
                A5: "Fusionner deux bulles en une seule et jumeler leur contenu et leurs relations",
                A6: "\"Glissez-déposez\" vos bulles pour changer leur emplacement ou leur ordre d'apparition",
                B1: "Expandre et cacher l'arbre",
                B2: "Zoom intérieur et extérieur",
                B3: "Centrer une bulle",
                B4: "Visitez le menu des bulles centres",
                B5: "Barre de recherche pour trouver une bulle",
                B6: "Sélectionner la bulle et tous ses enfants visibles",
                C2: "Étiquetter vos bulles et retrouver toutes vos bulles partageant le même étiquette à travers toutes vos cartes",
                C3: "Fusionner",
                C4: "Créer une relation avec une bulle pouvant se trouver dans l'une de vos autres cartes à partir du menu contextuel",
                C5: "",
                C6: "",
                D1: "Modifier le contenu d'une bulle ou d'une relation",
                D2: "Ajouter une note avec un éditeur de texte riche",
                D3: "Fusionner",
                D4: "Étiquette",
                D5: "",
                D6: "",
                E1: "Modifier la police de la bulle centrale",
                E2: "Modifier la couleur de fond de la bulle centrale",
                F1: "Options de partage",
                F3: "Voir en liste, puis appuyer sur le bouton",
                copy: "copier",
                listPaste: "Vous pourrez ensuite coller le contenu de la liste",
                F4: "Ami-e-s (menu accessible depuis le menu des bulles centres)",
                F5: "Visiter les bulles publiques et les templates des autres usagers",
                point1: "Construire",
                point2: "Naviguer",
                point3: "Organiser",
                point4: "Préciser",
                point5: "Décorer",
                point6: "Diffuser",
                merge: "Fusion",
                rightClick: "clic droit",
                longPress: "Appuyer longtemps",
                wikipediaTag: "Vous pouvez étiquetter vos bulles à des articles de Wikipédia afin de donner une référence universelle à votre bulle",
                shareUrl1: "Copiez l'url de la page dans la barre d'adresse et une fois votre bulle centrale publique",
                shareUrl2: "ou partagée avec vos amis",
                shareUrl3: "d'autres pourront consulter votre carte.",
                shareUrl4: "Vous pouvez également copier l'url d'une bulle à partir du menu de partage en cliquant sur le bouton",
                copyLink: "Copier le lien de la bulle",
                useArrows: "Utilisez les flèches pour voyager d'une bulle à l'autre"
            });
            I18n.i18next.addResources('en', 'guide', {
                icon: "Icon",
                title: "Guide for mindrespect.com",
                titreA: "Basic operations to build your map",
                titreB: "Basic functionalities to surf through your thoughts",
                titreC: "Functionalities and operations to organise your thoughts and structure your notes",
                titreD: "Functionalities to deepen and develop your thoughts",
                titreE: "Customize your center bubbles",
                titreE1: "accessible from your settings",
                titreF: "Share or export your thoughts",
                A1: "Create a new center bubble (map)",
                A2: "Add a child bubble",
                A3: "Add a sister bubble. Not applicable to central bubbles",
                A4: "Naming the relationships between your bubbles helps you understand the connection between your ideas and can help keep your notes well cut out and reusable in other contexts",
                groupRelation: "group relation",
                groupRelationDesc1: "You can also add children to a relationship and it becomes a group relationship. All relationships in a grouped relationship share a tag",
                groupRelationDesc2: "in common",
                A5: "Merge two bubbles into one and match their content and relationships",
                A6: "\"Drag and drop\" your bubbles to change their location or order of appearance",
                B1: "Expand and hide the tree",
                B2: "Zoom in and out",
                B3: "Center a bubble",
                B4: "Visit the menu of bubbles centers",
                B5: "Search bar to find a bubble",
                B6: "Select the bubble and all its visible children",
                C2: "Tag your bubbles and find all your bubbles sharing the same label across all your cards",
                C3: "Merge",
                C4: "Create a relationship with a bubble that may be in one of your other maps from the context menu",
                C5: "",
                C6: "",
                D1: "Modify the content of a bubble or relationship",
                D2: "Add a note with a rich text editor",
                D3: "Merge",
                D4: "Tag",
                D5: "",
                D6: "",
                E1: "Change the font of the central bubble",
                E2: "Change the background color of the central bubble",
                F1: "Sharing options",
                F3: "View in list, then press the button",
                copy: "copy",
                listPaste: "You can then paste the contents of the list",
                point1: "Build",
                point2: "Navigate",
                point3: "Organize",
                point4: "Specify",
                point5: "Decorate",
                point6: "Spread",
                merge: "Merge",
                rightClick: "right click",
                longPress: "Long press",
                wikipediaTag: "You can tag your bubbles to Wikipedia articles to give a universal reference to your bubble",
                shareUrl1: "Copy the url of the page in the address bar and once your central public bubble",
                shareUrl2: "or shared with your friends",
                shareUrl3: "others will be able to consult your map.",
                shareUrl4: "You can also copy the url of a bubble from the sharing menu by clicking on the",
                copyLink: "Copy bubble's link",
                useArrows: "Use the arrows to travel from one bubble to another"
            });

            return {
                dialog: false,
                ctrlKey: UiUtils.isMacintosh() ? "⌘" : "ctrl",
                items: [
                    {}
                ]
            }
        },
        methods: {
            enter: function () {
                this.dialog = true;
            }
        }
    }
</script>

<style scoped>

</style>