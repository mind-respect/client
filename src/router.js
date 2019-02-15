import Vue from 'vue'
import Router from 'vue-router'
import About from '@/views/About.vue'
import UserHome from '@/views/UserHome.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: About
        },
        {
            path: '/welcome',
            name: 'welcome',
            component: About
        },
        {
            path: '/register',
            name: 'register',
            component: About
        },
        {
            path: '/login',
            name: 'login',
            component: About
        },
        {
            path: '/forgot-password',
            name: 'forgotPassword',
            component: About
        },
        {
            path: '/email/:email/token/:changePasswordToken',
            name: 'changePassword',
            component: About
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
        },
        {
            path: '/user/:username/friends',
            name: 'FriendsUserHome',
            component: UserHome
        },
        {
            path: '/user/:username/requestUser/:requestUsername/destinationUser/:destinationUsername/confirmToken/:confirmToken',
            name: "ConfirmFriendshipHome",
            component: UserHome
        }
    ]
})
