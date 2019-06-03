/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import UserService from '@/service/UserService'


const api = {};
const spies = {};
api.applyDefault = function () {
    // spies["authenticatedUserInCache"] = api.authenticatedUserInCache();"
    spies["_getCurrentUser"] = api._getCurrentUser();
    return spies;
};

api._getCurrentUser = function () {
    return jest.spyOn(UserService, "_getCurrentUser").mockImplementation(() => {
            return Promise.resolve({
                data: {
                    email: "iojasvasdvasdovij@aosdijv.com",
                    preferred_locales: [],
                    uri: "/service/users/asdvioajsdvasd",
                    user_name: "églantier"
                }
            })
        }
    );
};

api.authenticatedUserInCache = function (userName) {
    return jest.spyOn(UserService, "authenticatedUserInCache").mockImplementation(() => {
        return {
            user_name: userName
        };
    });
};

export default api;
