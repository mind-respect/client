import Vue from 'vue'
import Store from '@/store'
import Selection from '@/Selection'

const arcRadiusStandard = 20;
const arcRadiusLeft = arcRadiusStandard * -1;
const standardInnerMargin = 26;
const smallInnerMargin = 15;
const inBetweenXAdjust = 20;
const farDistanceStandard = 30;
const farDistanceForCenter = 33;
const arrowHeadLength = 6;

function EdgeDrawing(bubble, isLeft) {
    this.bubble = bubble;
    this.isLeft = isLeft;
}

EdgeDrawing.prototype.build = function () {
    if (!this.redraw()) {
        return "";
    }
    let svg = "";
    if (this.isLeft && this.children.length > 1 && this.highestPosition && this.lowestPosition) {
        svg += this.topBottomLineAtLeft();
    }
    if (!this.isLeft && this.children.length > 1 && this.highestPosition && this.lowestPosition) {
        svg += this.topBottomLineAtRight();
    }
    svg += this.drawChildren();
    return svg;
};

EdgeDrawing.prototype.redraw = function () {
    let element = this.getBubbleElement(this.bubble);
    if (!element) {
        Vue.nextTick(() => {
            console.warn('null bubble html redraw');
            // this.redraw();
        });
        return false;
    }
    this.zoomAdjust = Math.round((Store.state.zoom - 1) * 10);
    this.bubbleRect = element.getBoundingClientRect();
    this.topPosition = this.topPositionCalculate();
    this.bottomPosition = this.bottomPositionCalculate();
    this.children = this.bubble.getNextChildren(this.isLeft);
    if (this.bubble.isEdge()) {
        return true;
    }
    if (this.children.length > 1) {
        this.highestChild = this.children[0];
        this.lowestChild = this.children[this.children.length - 1];
        this.highestPosition = this.getMiddleSidePosition(this.highestChild);
        this.lowestPosition = this.getMiddleSidePosition(this.lowestChild);
        if (!this.highestPosition || !this.lowestPosition) {
            return false;
        }
        this.isHighestInBetween = this.isChildInBetween(
            this.highestPosition
        );
        this.isLowestInBetween = this.isChildInBetween(
            this.lowestPosition
        );
        let topDistance = this.topDistanceWithChild(this.highestPosition);
        let isTopClose = topDistance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
        this.highestArcRadius = isTopClose ? Math.min(topDistance, arcRadiusStandard) : arcRadiusStandard;
        this.highestArcRadius = Math.max(this.highestArcRadius, 0);

        let bottomDistance = this.bottomDistanceWithChild(this.lowestPosition);
        let isBottomClose = bottomDistance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
        this.lowestArcRadius = isBottomClose ? Math.min(bottomDistance, arcRadiusStandard) : arcRadiusStandard;
        this.lowestArcRadius = Math.max(this.lowestArcRadius, 0);
        return true;
    } else {
        return true;
    }
};

EdgeDrawing.prototype.topBottomLineAtLeft = function () {
    let highestArcRadius = this.highestArcRadius * -1;
    let lowestArcRadius = this.lowestArcRadius * -1;
    let xAdjust = this.isHighestInBetween ? inBetweenXAdjust * -1 : 0;
    let lines = "M " + this.highestPosition.x + "," + this.highestPosition.y + " " +
        "H " + (this.topPosition.x + xAdjust + highestArcRadius) + " ";
    if (!this.isHighestInBetween) {
        lines += this.buildArc(highestArcRadius, true, true) +
            "V " + (this.topPosition.y + arcRadiusLeft) + " ";
    }
    if (this.isLowestInBetween) {
        lines += "M " + (this.bottomPosition.x - inBetweenXAdjust) + " " + this.lowestPosition.y + " ";
        lines += "H " + this.lowestPosition.x;
    } else {
        lines += "M " + this.bottomPosition.x + " " + this.bottomPosition.y + " " +
            "V " + (this.lowestPosition.y + lowestArcRadius) + " " +
            this.buildArc(lowestArcRadius, false, true) +
            "H " + this.lowestPosition.x
    }
    return lines;
};

EdgeDrawing.prototype.topBottomLineAtRight = function () {
    let lines = "M " + this.lowestPosition.x + "," + this.lowestPosition.y + " ";
    if (this.isLowestInBetween) {
        lines += "H " + (this.bottomPosition.x + inBetweenXAdjust) + " ";
    } else {
        lines += "H " + (this.bottomPosition.x + this.lowestArcRadius) + " " +
            this.buildArc(this.lowestArcRadius, false, false) +
            "V " + (this.bottomPosition.y + arcRadiusStandard) + " ";
    }

    if (this.isHighestInBetween) {
        lines += "M " + (this.topPosition.x + inBetweenXAdjust) + " " + this.highestPosition.y + " ";
    } else {
        lines += "M " + this.topPosition.x + " " + this.topPosition.y + " " +
            "V " + (this.highestPosition.y + this.highestArcRadius) + " " +
            this.buildArc(this.highestArcRadius, true, false)
    }
    lines += "H " + this.highestPosition.x;
    return lines
};
EdgeDrawing.prototype.isChildInBetween = function (childPosition) {
    return this.bubbleRect.top < childPosition.rect.bottom && this.bubbleRect.bottom > childPosition.rect.top;
};

EdgeDrawing.prototype.topDistanceWithChild = function (childPosition) {
    return Math.abs(this.bubbleRect.top - childPosition.rect.bottom)
};
EdgeDrawing.prototype.bottomDistanceWithChild = function (childPosition) {
    return Math.abs(this.bubbleRect.bottom - childPosition.rect.top)
};

EdgeDrawing.prototype.buildArc = function (radius, firstPositive, secondPositive) {
    radius = Math.abs(radius);
    let firstFactor = firstPositive ? 1 : -1;
    let secondFactor = secondPositive ? 1 : -1;
    return "a" + radius + "," + radius + " 0 0 1 " + (radius * firstFactor) + "," + (radius * secondFactor) + " ";
};

EdgeDrawing.prototype.drawChildren = function () {
    let lines = "";
    this.children.forEach((child) => {
        let childPosition = this.getMiddleSidePosition(child);
        if (child.isEdge() && child.isInverse()) {
            lines += this.inverseArrowHead(childPosition)
        }
        if (child.isSameBubble(this.highestChild) || child.isSameBubble(this.lowestChild) || !child.draw) {
            return lines;
        }
        if (!childPosition) {
            this.loaded = false;
            Vue.nextTick(() => {
                console.warn('drawChildren null child position html redraw');
                // this.redraw();
                this.loaded = false;
                // this.$destroy();
            });
            return;
        }
        if (this.bubble.isEdge()) {
            let position = this.getMiddleSidePosition(this.bubble);
            lines += "M " + position.x + " " + position.y + " ";
            lines += "H " + (childPosition.x);
            let childXPosition = childPosition.x;
            if (!this.bubble.isInverse()) {
                lines += this.arrowHead(
                    position.x,
                    childXPosition,
                    position.y
                );
            }
            return lines;
        }
        let isChildInBetween = this.isChildInBetween(childPosition);
        let position = this.getMiddleSidePosition(this.bubble, true);
        if (isChildInBetween || this.children.length === 1) {
            let startX = position.x;
            let startY = childPosition.y;
            lines += "M " + startX + " " + startY + " ";
            lines += "L " + childPosition.x + " " + childPosition.y;
        } else {
            let isAbove = childPosition.y < this.topPosition.y;
            let distance = isAbove ? this.topDistanceWithChild(childPosition) : this.bottomDistanceWithChild(childPosition);
            let isClose = distance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
            let arcRadius = isClose ? Math.min(distance, arcRadiusStandard) : arcRadiusStandard;
            arcRadius = Math.max(arcRadius, 0);
            if (isAbove) {
                if (this.isLeft) {
                    lines += "M " + childPosition.x + "," + (childPosition.y) + " " +
                        "H " + (this.topPosition.x - arcRadius) + " " +
                        this.buildArc(arcRadius, true, true)
                } else {
                    lines += "M " + this.topPosition.x + "," + (childPosition.y + arcRadius) + " " +
                        this.buildArc(arcRadius, true, false) +
                        "H " + childPosition.x;
                }
            } else {
                if (this.isLeft) {
                    lines += "M " + (this.topPosition.x) + "," + (childPosition.y - arcRadius) + " " +
                        this.buildArc(arcRadius, false, true) +
                        "H " + (childPosition.x) + " "
                } else {
                    lines += "M " + childPosition.x + "," + childPosition.y + " " +
                        "H " + (this.topPosition.x + arcRadius) + " " +
                        this.buildArc(arcRadius, false, false)
                }
            }
        }
    });
    return lines;
};

EdgeDrawing.prototype.arrowHead = function (startX, endX, y) {
    let lines = "";

    let middleXAdjust = endX - startX;
    middleXAdjust += this.isLeft ? this.bubbleRect.width * -1 : this.bubbleRect.width;
    middleXAdjust /= 2;
    middleXAdjust += this.isLeft ? arrowHeadLength * -1 : arrowHeadLength;
    let middleX = startX + middleXAdjust;
    let xAdjust = arrowHeadLength;
    if (!this.isLeft) {
        xAdjust *= -1
    }
    lines += "M " + middleX + "," + y + " " +
        "L " + (middleX + xAdjust) + " " + (y - arrowHeadLength) + " " +
        "M " + middleX + "," + (y) + " " +
        "L " + (middleX + xAdjust) + " " + (y + arrowHeadLength) + " ";
    return lines;
};

EdgeDrawing.prototype.inverseArrowHead = function (childPosition) {
    let position = {
        x: this.topPosition.x,
        y: childPosition.y
    };
    let xAdjust = arrowHeadLength;
    if (this.isLeft) {
        position.x -= arcRadiusStandard + 20;
        xAdjust *= -1
    } else {
        position.x += arcRadiusStandard + 20;
    }
    return "M " + position.x + "," + position.y + " " +
        "L " + (position.x + xAdjust) + " " + (position.y - arrowHeadLength) + " " +
        "M " + position.x + "," + position.y + " " +
        "L " + (position.x + xAdjust) + " " + (position.y + arrowHeadLength) + " "
};

EdgeDrawing.prototype.getBubbleElement = function (bubble) {
    if (bubble.isEdge()) {
        if (bubble.isShrinked()) {
            return bubble.getChip();
        } else {
            return bubble.getLabelHtml();
        }
    }
    if (bubble.isGroupRelation()) {
        return bubble.getChip();
    }
    if (bubble.isSame(this.bubble) && !bubble.isCenter && !Selection.isSelected(bubble)) {
        return bubble.getHtml();
    } else {
        return bubble.getHtml();
    }
};

EdgeDrawing.prototype.getMiddleSidePosition = function (bubble, isParent) {
    let position = {
        x: 0,
        y: 0,
        rect: null
    };
    let yAdjust = 0;
    let element = isParent ? bubble.getHtml() : this.getBubbleElement(bubble);
    if (bubble.isEdge() && bubble.isShrinked()) {
        yAdjust = -10;
    }
    yAdjust += this.zoomAdjust;
    if (!element) {
        this.loaded = false;
        Vue.nextTick(() => {
            console.warn('null child bubble html redraw');
            // this.redraw();
            this.loaded = false;
            // this.$destroy();
        });
        return;
    }
    let rect = element.getBoundingClientRect();
    position.rect = rect;
    if (isParent) {
        position.x = this.isLeft ? rect.left : rect.right;
    } else {
        position.x = this.isLeft ? rect.right : rect.left;
    }
    position.x += document.body.scrollLeft;
    position.x = Math.round(position.x);
    position.y = rect.top - (rect.height / 2) - 23 + document.body.scrollTop;
    position.y += yAdjust;
    position.y = Math.round(position.y);

    return position;
};


EdgeDrawing.prototype.topPositionCalculate = function () {
    let position = {
        x: 0,
        y: 0
    };
    position.x = this.isLeft ? this.bubbleRect.left : this.bubbleRect.right;
    position.x += document.body.scrollLeft;
    let isSmall = (this.bubbleRect.width - standardInnerMargin * 2) < standardInnerMargin;
    let innerMargin = isSmall ? smallInnerMargin : standardInnerMargin;
    let xAdjust = this.isLeft ? innerMargin : innerMargin * -1;
    position.x += xAdjust;
    position.x = Math.round(position.x);
    let yAdjust;
    if (Selection.isSelected(this.bubble) || this.bubble.isCenter || !this.bubble.isVertex()) {
        yAdjust = this.isLeft ? -24 : -45;
    } else {
        yAdjust = this.isLeft ? -24 : -45;
    }
    if (this.bubble.isEdge()) {
        yAdjust = -65;
    }
    position.y = this.bubbleRect.top + yAdjust + document.body.scrollTop;
    return position;
};

EdgeDrawing.prototype.bottomPositionCalculate = function () {
    let position = {
        x: 0,
        y: 0
    };
    position.x = this.bubbleRect.x + document.body.scrollLeft;
    let isSmall = (this.bubbleRect.width - standardInnerMargin * 2) < standardInnerMargin;
    let innerMargin = isSmall ? smallInnerMargin : standardInnerMargin;
    if (this.isLowestInBetween) {
        innerMargin = 10;
    }
    let xAdjust = this.isLeft ? innerMargin : this.bubbleRect.width - innerMargin;
    position.x += xAdjust;
    position.x = Math.round(position.x);
    let yAdjust;
    if (Selection.isSelected(this.bubble) || this.bubble.isCenter || !this.bubble.isVertex()) {
        yAdjust = this.isLeft ? -43 : -63;
    } else {
        yAdjust = this.isLeft ? -43 : -63;
    }
    position.y = Math.round(this.bubbleRect.bottom + yAdjust + document.body.scrollTop);
    return position;
};

export default EdgeDrawing;
