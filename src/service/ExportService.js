/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import Service from '@/Service'
import UserService from "@/service/UserService";
import Store from "@/store"
import axios from 'axios'

export default {
    exportToMd: function () {
        axios({
            url: Service.baseUrl() + UserService.currentUserUri() + "/export-to-md",
            method: 'POST',
            responseType: 'blob', // important
            credentials: true,
            withCredentials: true,
            headers: {
                'X-XSRF-TOKEN': Store.state.xsrfToken,
            }
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', Store.state.user.username + '.zip'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }
};
