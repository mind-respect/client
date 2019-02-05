/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/service'

export default {
    register: function (user) {
        user.user_name = user.username;
        return Service.api().post("/users/", user);
    },
    login: function (user) {
        return Service.api().post("/login", user);
    },
    logout: function(){
        return Service.api().delete("/users/session");
    }
};
