import Service from '@/Service'
import UserService from "@/service/UserService";

export default {
    copyForSelf: async function (tree, rootClone, parentBubble) {
        const data = {
            copiedTree: tree
        };
        if (rootClone.isGroupRelation()) {
            data.parentUri = parentBubble.getUri();
        }
        return await Service.api().post(
            UserService.currentUserUri() + "/tree_copy",
            data
        );
    }
}