import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/About.vue')
        },
        {
            path: '/welcome',
            name: 'welcome',
            component: () => import('./views/About.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('./views/About.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('./views/About.vue')
        },
        {
            path: '/forgot-password',
            name: 'forgotPassword',
            component: () => import('./views/About.vue')
        },
        {
            path: '/email/:email/token/:changePasswordToken',
            name: 'changePassword',
            component: () => import('./views/About.vue')
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('./views/About.vue')
        },
        {
            path: '/user/:username',
            name: 'UserHome',
            component: () => import('./views/UserHome.vue')
        },
        {
            path: '/user/:username/friends',
            name: 'FriendsUserHome',
            component: () => import('./views/UserHome.vue')
        },
        {
            path: '/user/:username/requestUser/:requestUsername/destinationUser/:destinationUsername/confirmToken/:confirmToken',
            name: "ConfirmFriendshipHome",
            component: () => import('./views/UserHome.vue')
        },
        {
            path: '/user/:username/graph/:graphElementType/:centerUri',
            name: "Center",
            component: () => import('./views/Center.vue')
        }
    ]
})
