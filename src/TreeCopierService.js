import Service from '@/Service'
import UserService from "@/service/UserService";

export default {
    copyForSelf: async function (tree) {
        return await Service.api().post(
            UserService.currentUserUri() + "/tree_copy",
            {
                copiedTree: tree
            }
        );
    }
}