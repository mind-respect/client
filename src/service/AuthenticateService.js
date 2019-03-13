/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/Service'

export default {
    register: function (user) {
        user.user_name = user.username;
        user.staySignedIn = true;
        return Service.api().post("/users/", user);
    },
    login: function (user) {
        user.staySignedIn = true;
        return Service.api().post("/users/session", user);
    },
    logout: function () {
        return Service.api().delete("/users/session");
    }
};
