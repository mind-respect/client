import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/About.vue'
import UserHome from '@/views/UserHome.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/welcome',
            name: 'welcome',
            component: Home
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
        },
        {
            path: '/user/:username',
            name: 'UserHome',
            component: UserHome
        }
    ]
})
