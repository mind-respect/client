/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import $ from 'jquery'
import AskModal from '@/AskModal'

const api = {};
api.ofMetaRelation = function (metaRelation) {
    return new MetaRelationDeleteMenu(
        metaRelation
    );
};

function MetaRelationDeleteMenu(metaRelation) {
    this.modal = $("#remove-meta-relation-confirm-menu");
    this.askModal = AskModal.usingModalHtml(this.modal);
    this.modal.find(".bubble-label").text(
        metaRelation.getSourceVertex().text()
    );
    this.modal.find(".meta-label").text(
        metaRelation.getDestinationVertex().text()
    );
}

MetaRelationDeleteMenu.prototype.ask = function () {
    return this.askModal.ask();
};

export default api;

