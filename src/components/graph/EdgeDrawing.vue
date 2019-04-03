<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <svg
            v-if="loaded"
            style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%;z-index:-1;"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
        <path
                :d="topBottomLineAtLeft()"
                v-if="isLeft && children.length > 1"
                fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        />
        <path
                :d="topBottomLineAtRight()"
                v-if="!isLeft && children.length > 1"
                fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        />
        <path :d="drawChildren()"
              fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        ></path>
    </svg>
</template>

<script>

    const arcRadiusStandard = 20;
    const arcRadiusLeft = arcRadiusStandard * -1;
    const standardInnerMargin = 26;
    const smallInnerMargin = 15;
    const farDistanceStandard = 30;
    const farDistanceForCenter = 33;
    export default {
        name: "EdgeDrawing",
        props: ['bubble', 'isLeft'],
        data: function () {
            return {
                strokeColor: "#1a237e",
                strokeWidth: "2",
                loaded: false,
                highestChild: null,
                lowestChild: null,
                children: null,
                topPosition: null,
                bottomPosition: null,
                lowestPosition: null,
                highestPosition: null,
                bubbleRect: null,
                isHighestInBetween: null,
                isLowestInBetween: null,
                highestArcRadius: null,
                lowestArcRadius: null,
            }
        },
        mounted: function () {
            this.redraw();
        },
        methods: {
            redraw: function () {
                let element = this.bubble.getHtml();
                if (element === null) {
                    this.$nextTick(function () {
                        console.log('null bubble html redraw');
                        this.redraw();
                    }.bind(this));
                    return;
                }
                this.bubbleRect = element.getBoundingClientRect();
                this.topPosition = this.topPositionCalculate();
                this.bottomPosition = this.bottomPositionCalculate();
                this.children = this.bubble.getImmediateChild(this.isLeft);
                if (this.bubble.isEdge()) {
                    this.loaded = true;
                }
                if (this.children.length > 1) {
                    this.highestChild = this.children[0];
                    this.lowestChild = this.children[this.children.length - 1];
                    this.highestPosition = this.highestPositionCalculate();
                    this.lowestPosition = this.lowestPositionCalculate();
                    this.isHighestInBetween = this.isChildInBetween(
                        this.highestChild,
                        this.highestPosition
                    );
                    this.isLowestInBetween = this.isChildInBetween(
                        this.lowestChild,
                        this.lowestPosition
                    );

                    let topDistance = this.topPosition.y - this.highestPosition.y;
                    let isTopClose = topDistance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
                    if (isTopClose) {
                        if (this.isLeft) {
                            topDistance += -19;
                        } else {
                            topDistance += -19
                        }
                    }
                    this.highestArcRadius = isTopClose ? Math.min(topDistance, arcRadiusStandard) : arcRadiusStandard;
                    this.highestArcRadius = Math.max(this.highestArcRadius, 0);

                    let bottomDistance = this.lowestPosition.y - this.bottomPosition.y;
                    let isBottomClose = bottomDistance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
                    if (isBottomClose) {
                        if (this.isLeft) {
                            bottomDistance += 0;
                        } else {
                            bottomDistance += -15;
                        }
                    }
                    this.lowestArcRadius = isBottomClose ? Math.min(bottomDistance, arcRadiusStandard) : arcRadiusStandard;
                    this.lowestArcRadius = Math.max(this.lowestArcRadius, 0);
                    this.loaded = true;
                } else {
                    this.loaded = true;
                }
            },
            highestPositionCalculate: function () {
                return this.getBubblePosition(this.highestChild, true);
            },
            lowestPositionCalculate: function () {
                return this.getBubblePosition(
                    this.lowestChild,
                    true
                );
            },
            topBottomLineAtLeft: function () {
                let highestArcRadius = this.highestArcRadius * -1;
                let lowestArcRadius = this.lowestArcRadius * -1;
                let lines = "M " + this.highestPosition.x + "," + this.highestPosition.y + " " +
                    "H " + (this.topPosition.x + highestArcRadius) + " ";
                if (!this.isHighestInBetween) {
                    lines += this.buildArc(highestArcRadius, true, true) +
                        "V " + (this.topPosition.y + arcRadiusLeft) + " ";
                }
                if (this.isLowestInBetween) {
                    lines += "M " + this.bottomPosition.x + " " + this.lowestPosition.y + " ";
                    lines += "H " + this.lowestPosition.x;
                } else {
                    lines += "M " + this.bottomPosition.x + " " + this.bottomPosition.y + " " +
                        "V " + (this.lowestPosition.y + lowestArcRadius) + " " +
                        this.buildArc(lowestArcRadius, false, true) +
                        "H " + this.lowestPosition.x
                }
                return lines;
            },
            topBottomLineAtRight: function () {
                let lines = "M " + this.lowestPosition.x + "," + this.lowestPosition.y + " ";
                if (this.isLowestInBetween) {
                    lines += "H " + this.bottomPosition.x + " ";
                } else {
                    lines += "H " + (this.bottomPosition.x + this.lowestArcRadius) + " " +
                        this.buildArc(this.lowestArcRadius, false, false) +
                        "V " + (this.bottomPosition.y + arcRadiusStandard) + " ";
                }

                if (this.isHighestInBetween) {
                    lines += "M " + this.topPosition.x + " " + this.highestPosition.y + " ";
                } else {
                    lines += "M " + this.topPosition.x + " " + this.topPosition.y + " " +
                        "V " + (this.highestPosition.y + this.highestArcRadius) + " " +
                        this.buildArc(this.highestArcRadius, true, false)
                }
                lines += "H " + this.highestPosition.x;
                return lines
            },
            isChildInBetween: function (child, childPosition) {
                return this.bubbleRect.top < childPosition.rect.top && this.bubbleRect.bottom > childPosition.rect.bottom;
            },
            buildArc: function (radius, firstPositive, secondPositive) {
                radius = Math.abs(radius);
                let firstFactor = firstPositive ? 1 : -1;
                let secondFactor = secondPositive ? 1 : -1;
                return "a" + radius + "," + radius + " 0 0 1 " + (radius * firstFactor) + "," + (radius * secondFactor) + " ";
            },
            drawChildren: function () {
                let lines = "";
                this.children.forEach(function (child) {
                    if (child.isSameBubble(this.highestChild) || child.isSameBubble(this.lowestChild)) {
                        return;
                    }
                    let childPosition = this.getBubblePosition(child, true);
                    if (this.bubble.isEdge()) {
                        let xAdjust = this.isLeft ? 13 : -13;
                        let position = this.getBubblePosition(this.bubble, true);
                        lines += "M " + position.x + " " + position.y + " ";
                        lines += "H " + (childPosition.x + xAdjust);
                        return lines;
                    }
                    let xAdjust = 0;
                    let yAdjust = 0;
                    let isChildInBetween = this.isChildInBetween(child, childPosition);
                    if (isChildInBetween) {
                        xAdjust = this.isLeft ? standardInnerMargin * -1 : standardInnerMargin;
                        let startX = (this.topPosition.x + xAdjust);
                        let startY = (childPosition.y + yAdjust);
                        lines += "M " + startX + " " + startY + " ";
                        lines += "L " + childPosition.x + " " + childPosition.y
                    } else {
                        let isAbove = childPosition.y < this.topPosition.y;
                        let distance = isAbove ? this.topPosition.y - childPosition.y : childPosition.y - this.bottomPosition.y;
                        let isClose = distance < (this.bubble.isCenter ? farDistanceForCenter : farDistanceStandard);
                        let distanceAdjust;
                        if (isClose) {
                            if (this.isLeft) {
                                distanceAdjust = isAbove ? -19 : 0;
                            } else {
                                distanceAdjust = isAbove ? -19 : -19;
                            }
                            distance += distanceAdjust;
                        }
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
                }.bind(this));
                return lines;
            }
            ,
            getBubblePosition: function (bubble, isChild) {
                let position = {
                    x: 0,
                    y: 0,
                    rect: null
                };
                let yAdjust = 0;
                let element;
                if (isChild) {
                    if (bubble.isEdge() && bubble.isShrinked()) {
                        element = bubble.getChip();
                        yAdjust = -10;
                    } else {
                        element = bubble.getLabelHtml();
                    }
                } else if (bubble.isCenter) {
                    element = bubble.getHtml();
                } else {
                    element = bubble.getLabelHtml();
                }
                if (!element) {
                    this.loaded = false;
                    this.$nextTick(function () {
                        this.loaded = true;
                    }.bind(this));
                    return position;
                }
                let rect = element.getBoundingClientRect();
                position.rect = rect;
                position.x = isChild && this.isLeft ? rect.right : rect.left;
                position.x += window.pageXOffset;
                position.x = Math.round(position.x);
                position.y = rect.top - (rect.height / 2) - 43 + window.pageYOffset;
                position.y += yAdjust;
                position.y = Math.round(position.y);

                return position;
            },
            topPositionCalculate: function () {
                let position = {
                    x: 0,
                    y: 0
                };
                position.x = this.isLeft ? this.bubbleRect.left : this.bubbleRect.right;
                position.x += window.pageXOffset;
                let isSmall = (this.bubbleRect.width - standardInnerMargin * 2) < standardInnerMargin;
                let innerMargin = isSmall ? smallInnerMargin : standardInnerMargin;
                let xAdjust = this.isLeft ? innerMargin : innerMargin * -1;
                position.x += xAdjust;
                position.x = Math.round(position.x);
                let yAdjust;
                if (this.bubble.isSelected || this.bubble.isCenter || !this.bubble.isVertex()) {
                    yAdjust = this.isLeft ? -44 : -65;
                } else {
                    yAdjust = this.isLeft ? -44 : -65;
                }
                position.y = this.bubbleRect.top + yAdjust + window.pageYOffset;
                return position;
            },
            bottomPositionCalculate: function () {
                let position = {
                    x: 0,
                    y: 0
                };
                position.x = this.bubbleRect.x + window.pageXOffset;
                let isSmall = (this.bubbleRect.width - standardInnerMargin * 2) < standardInnerMargin;
                let innerMargin = isSmall ? smallInnerMargin : standardInnerMargin;
                let xAdjust = this.isLeft ? innerMargin : this.bubbleRect.width - innerMargin;
                position.x += xAdjust;
                position.x = Math.round(position.x);
                let yAdjust;
                if (this.bubble.isSelected || this.bubble.isCenter || !this.bubble.isVertex()) {
                    yAdjust = this.isLeft ? -63 : -83;
                } else {
                    yAdjust = this.isLeft ? -63 : -83;
                }
                position.y = Math.round(this.bubbleRect.bottom + yAdjust + window.pageYOffset);
                return position;
            },
        }
    }
</script>

<style scoped>

</style>
