import Service from '@/Service'
import UserService from "@/service/UserService";

export default {
    list: function () {
        return Service.api().get(
            "/patterns"
        );
    },
    use: function (uri) {
        return Service.api().post(
            UserService.currentUserUri() + "/patterns/" + uri.replace("/service/", "")
        );
    }
};