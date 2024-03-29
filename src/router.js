import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);
import Store from '@/store'

const router = new Router({
        mode: 'history',
        base: process.env.BASE_URL,
        routes: [
            {
                path: '/',
                name: 'home',
                component: () => {
                    if (Store.state.user === undefined || Store.state.user === null) {
                        return import('./views/AboutPage.vue');
                    }
                    router.replace({
                        name: "UserHome",
                        params: {
                            username: Store.state.user.username
                        }
                    });
                    return import('./views/UserHome.vue');
                }
            },
            {
                path: '/welcome',
                name: 'welcome',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/register',
                name: 'register',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/login',
                name: 'login',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/login/requestUser/:requestUsername/destinationUser/:destinationUsername/confirmToken/:confirmToken',
                name: 'LoginFriendshipConfirm',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/forgot-password',
                name: 'forgotPassword',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/email/:email/token/:changePasswordToken',
                name: 'changePassword',
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/about',
                name: 'about',
                // route level code-splitting
                // this generates a separate chunk (about.[hash].js) for this route
                // which is lazy-loaded when the route is visited.
                component: () => import('./views/AboutPage.vue')
            },
            {
                path: '/user/:username',
                name: 'UserHome',
                component: () => import('./views/UserHome.vue')
            },
            {
                path: '/patterns',
                name: 'PatternsUserHome',
                component: () => import('./views/UserHome.vue')
            },
            {
                path: '/public',
                name: 'PublicCenterUserHome',
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
                name: "CenterPage",
                component: () => import('./views/CenterPage.vue')
            }
        ]
    })
;
export default router;
