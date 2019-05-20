import Store from '@/store'

const api = {
    EXPANDED_WIDTH: 400,
    MINI_WIDTH: 110,
    getWidth: () => {
        return Store.state.isSideMenuCollapsed ? api.MINI_WIDTH : api.EXPANDED_WIDTH;
    }
};
export default api;
