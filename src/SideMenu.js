import Store from '@/store'
import Breakpoint from '@/Breakpoint'

const api = {
    EXPANDED_WIDTH: 400,
    MINI_WIDTH: 110,
    getWidth: () => {
        if (Breakpoint.isMobile()) {
            return 0;
        }
        return Store.state.sideMenuFlow ? api.EXPANDED_WIDTH : api.MINI_WIDTH ;
    }
};
export default api;
