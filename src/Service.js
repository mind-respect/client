/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import axios from 'axios'
import Store from '@/store'
import RequestErrors from '@/requestError'
import IdUri from "./IdUri";


const Service = {
    baseUrl: function (isForGraphElement) {
        let url = location.protocol + '//' + location.hostname + ':' + location.port;
        if (!isForGraphElement) {
            return url + '/service'
        }
    },
    geApi: function () {
        return Service.api(true);
    },
    api: function (isForGraphElement) {
        const loginPages = [
            '/',
            '/login'
        ];
        const axiosInstance = axios.create({
            baseURL: Service.baseUrl(isForGraphElement),
            credentials: true,
            withCredentials: true,
            headers: {
                'X-XSRF-TOKEN': Store.state.xsrfToken,
            }
        });
        axiosInstance.interceptors.response.use(null, async function (error) {
            if (error.response && error.response.status === 401) {
                if (Store.state.user && Store.state.user.username === IdUri.currentUsernameInUrl()) {
                    await Store.dispatch('setUser', undefined);
                    await Store.dispatch('setXsrfToken', undefined);
                    await Store.dispatch('emptyAllCache');
                }
                if (loginPages.indexOf(window.location.pathname) === -1) {
                    window.location.href = '/'
                }
            }
            if (!error.response || [403, 401].indexOf(error.response.status) === -1) {
                RequestErrors.addRequestError(error)
            }
            if (error.response && error.response.status === 502) {
                Store.dispatch("setIsServerNotResponding", true);
            }
            return Promise.reject(error)
        });
        return axiosInstance
    }
};
export default Service
