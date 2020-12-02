import Service from '@/Service'
import UserService from "@/service/UserService";
import IdUri from '@/IdUri'

export default {
    copy: async function (tree, parentBubble, otherUsername, shareLevel) {
        const data = {
            copiedTree: tree,
            shareLevel: shareLevel
        };
        if (IdUri.isGroupRelationUri(tree.rootUri)) {
            data.parentUri = parentBubble.getUri();
        }
        const username = otherUsername === undefined ? "" : "/" + otherUsername;
        return await Service.api().post(
            UserService.currentUserUri() + "/tree_copy" + username,
            data
        );
    }
}