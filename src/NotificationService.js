import Service from '@/Service'
import UserService from "@/service/UserService";

export default {
    get: async function (nbSkip) {
        const response = await Service.api().get(
            UserService.currentUserUri() + "/notification?nbSkip=" + nbSkip
        );
        return response.data;
    }
}