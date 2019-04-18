/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
let loadingFlows = [];
export default {
    enter: function () {
        loadingFlows.push(true)
    },
    enterNoSpinner: function () {
        loadingFlows.push(false)
    },
    leave: function () {
        loadingFlows.pop();
    },
    loadingFlows: loadingFlows
}
