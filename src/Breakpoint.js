const BreakPoint = {};
let breakPoint;

BreakPoint.set = function (_breakPoint) {
    breakPoint = _breakPoint;
};

BreakPoint.get = function () {
    return breakPoint;
};

BreakPoint.isMobile = function () {
    return breakPoint.mdAndDown;
};

BreakPoint.isDesktop = function () {
    return breakPoint.lgAndUp;
};

export default BreakPoint;