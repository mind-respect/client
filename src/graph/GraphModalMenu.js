/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import GraphUi from '@/graph/GraphUi'
import KeyboardActionsHandler from '@/KeyboardActionsHandler'

const api = {};
$('.modal').on('show.bs.modal', function () {
    KeyboardActionsHandler.disable();
    GraphUi.disableDragScroll();
    GraphUi.lockDragScroll();
    $(this).find(".modal-footer .cancel").click(function () {
        $(this).closest(".modal").modal("hide");
    });
}).on('hidden.bs.modal', function () {
    KeyboardActionsHandler.enable();
    GraphUi.unlockDragScroll();
    GraphUi.enableDragScroll();
});
api.forModalId = function (modalId) {
    return new GraphModalMenu(
        $("#" + modalId)
    );
};

function GraphModalMenu(modal) {
    this.modal = modal;
}

GraphModalMenu.prototype.show = function () {
    this.modal.modal({
        backdrop: 'static',
        keyboard: false
    }).on('shown.bs.modal', function () {
        GraphUi.disableDragScroll();
        GraphUi.lockDragScroll();
        $(this).find("[data-autofocus=true]:first").focus();
    }).on('hidden.bs.modal', function () {
        GraphUi.unlockDragScroll();
        GraphUi.enableDragScroll();
    });
    return this;
};

GraphModalMenu.prototype.hide = function () {
    this.modal.modal("hide");
};

export default api;
