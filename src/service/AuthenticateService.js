/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/Service'
import Store from '@/store'

export default {
    register: function (user, recaptchaToken) {
        user.user_name = user.username;
        user.staySignedIn = true;
        user.recaptchaToken = recaptchaToken;
        return Service.api().post("/users/", user);
    },
    login: function (user, recaptchaToken) {
        user.staySignedIn = true;
        user.recaptchaToken = recaptchaToken;
        return Service.api().post("/users/session", user);
    },
    logout: async function () {
        await Service.api().delete("/users/session");
        await Promise.all([
            Store.dispatch('setUser', undefined),
            Store.dispatch('setXsrfToken', undefined)
        ]);
    }
};
