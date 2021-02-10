function DoNothingController() {
}
export default {
    name: function () {
        return "do_nothing_tree";
    },
    getVertexMenuHandler: function () {
        return DoNothingController;
    },
    getRelationMenuHandler: function () {
        return DoNothingController;
    },
    getGroupRelationMenuHandler: function () {
        return DoNothingController;
    },
    getGraphElementMenuHandler: function () {
        return DoNothingController;
    },
    getGraphMenuHandler: function () {
        return DoNothingController;
    },
    getAppController: function () {
        return DoNothingController;
    },
    getMetaController: function () {
        return DoNothingController;
    },
    getMetaGroupVertexController: function () {
        return DoNothingController;
    },
    getTagApi: function () {
        return DoNothingController;
    }
};