/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import axios from 'axios'
import Store from '@/store'
import RequestErrors from '@/requestError'

const Service = {
    baseUrl: function () {
        return location.protocol + '//' + location.hostname + ':' + location.port + '/service'
    },
    api: function () {
        const loginPages = [
            '/',
            '/login'
        ];
        const axiosInstance = axios.create({
            baseURL: Service.baseUrl(),
            credentials: true,
            withCredentials: true
        });
        axiosInstance.interceptors.response.use(null, function (error) {
            if (error.response && error.response.status === 401) {
                Store.dispatch('setUser', undefined)
                if (loginPages.indexOf(window.location.pathname) === -1) {
                    window.location.href = '/'
                }
            }
            if (!error.response || [403, 401].indexOf(error.response.status) === -1) {
                RequestErrors.addRequestError(error)
            }
            return Promise.reject(error)
        })
        return axiosInstance
    }
}
export default Service
