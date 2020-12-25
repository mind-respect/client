import Service from '@/Service'
import UserService from "@/service/UserService";

export default {
    get: async function () {
        const response = await Service.api().get(
            UserService.currentUserUri() + "/notification"
        );
        return response.data;
    }
}