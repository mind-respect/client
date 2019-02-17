/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

import GraphDisplayerAsRelativeTree from '@/graph/GraphDisplayerAsRelativeTree'

const api = {};
api.getByName = function (name) {
    switch (name) {
        case "relative_tree":
            return GraphDisplayerAsRelativeTree;
    }
};
export default api;
