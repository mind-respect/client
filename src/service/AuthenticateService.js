/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/Service'
import Store from '@/store'

export default {
    register: function (user) {
        user.user_name = user.username;
        user.staySignedIn = true;
        return Service.api().post("/users/", user);
    },
    login: function (user, recaptchaToken) {
        user.staySignedIn = true;
        user.recaptchaToken = recaptchaToken;
        return Service.api().post("/users/session", user);
    },
    logout: function () {
        return Promise.all(
            Store.dispatch('setUser', undefined),
            Store.dispatch('setXsrfToken', undefined),
            Service.api().delete("/users/session")
        );
    }
};
