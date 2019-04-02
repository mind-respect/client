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
                v-if="isLeft && this.children.length > 1"
                fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        />
        <path
                :d="topBottomLineAtRight()"
                v-if="!isLeft && this.children.length > 1"
                fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        />
        <path :d="childrenLines()"
              fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"
        ></path>
    </svg>
</template>

<script>

    const arcRadius = 20;
    const arcRadiusLeft = arcRadius * -1;
    const standardInnerMargin = 26;
    const smallInnerMargin = 15;
    export default {
        name: "EdgeDrawing",
        props: ['bubble', 'isLeft'],
        data: function () {
            return {
                strokeColor: "#1a237e",
                strokeWidth: "0.055em",
                loaded: false,
                highestChild: null,
                lowestChild: null,
                children: null,
                topPosition: null,
                bottomPosition: null,
                lowestPosition: null,
                highestPosition: null,
                bubbleRect: null
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
                this.children = this.bubble.getImmediateChild(this.isLeft);
                if (this.children.length > 1) {
                    this.highestChild = this.children[0];
                    this.lowestChild = this.children[this.children.length - 1];
                    this.topPosition = this.topPositionCalculate();
                    this.bottomPosition = this.bottomPositionCalculate();
                    this.highestPosition = this.highestPositionCalculate();
                    this.lowestPosition = this.lowestPositionCalculate();
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
                let lowest = this.lowestPosition;
                let highest = this.highestPosition;
                return "M " + highest.x + "," + highest.y + " " +
                    "H " + (this.topPosition.x + arcRadiusLeft) + " " +
                    "a20,20 0 0 1 20,20 " +
                    "V " + (this.topPosition.y + arcRadiusLeft) + " " +
                    "M " + this.bottomPosition.x + " " + this.bottomPosition.y + " " +
                    "V " + (lowest.y + arcRadiusLeft) + " " +
                    "a20,20 0 0 1 -20,20 " +
                    "H " + lowest.x
            }

            ,
            topBottomLineAtRight: function () {
                let lowest = this.lowestPosition;
                let highest = this.highestPosition;
                return "M " + (lowest.x + arcRadius) + "," + lowest.y + " " +
                    "H " + (this.bottomPosition.x + arcRadius) + " " +
                    "a20,20 0 0 1 -20,-20 " +
                    "V " + (this.bottomPosition.y + arcRadius) + " " +
                    "M " + this.topPosition.x + " " + this.topPosition.y + " " +
                    "V " + (highest.y + arcRadius) + " " +
                    "a20,20 0 0 1 20,-20 " +
                    "H " + highest.x
            }
            ,
            childrenLines: function () {
                let lines = "";
                let inBetweenBuffer = 25;
                this.children.forEach(function (child) {
                    if (child.isSameBubble(this.highestChild) || child.isSameBubble(this.lowestChild)) {
                        return;
                    }
                    let childPosition = this.getBubblePosition(child, true);
                    let xAdjust = 0;
                    let yAdjust = 0;
                    let isChildInBetween = childPosition.y > (this.topPosition.y - inBetweenBuffer) && childPosition.y < (this.bottomPosition.y + inBetweenBuffer)
                    if (isChildInBetween) {
                        xAdjust = this.isLeft ? standardInnerMargin * -1 : standardInnerMargin;
                        let startX = (this.topPosition.x + xAdjust);
                        let startY = (childPosition.y + yAdjust);
                        lines += "M " + startX + " " + startY + " ";
                        lines += "L " + childPosition.x + " " + childPosition.y
                    } else {
                        let isAbove = childPosition.y < this.topPosition.y;
                        let yAdjust = isAbove ? 10 : -10;
                        lines += "M " + this.topPosition.x + " " + (childPosition.y + yAdjust) + " ";
                        let startCurve = (this.topPosition.x) + "  " + (childPosition.y + yAdjust) + " ";
                        let endXCurve  = this.isLeft ? + 40 : -40;
                        let endYCurve  = isAbove ? -10 : 10;
                        let endCurve = (childPosition.x + endXCurve) + " " + (childPosition.y + endYCurve) + " ";
                        let endPoint = childPosition.x + " " + childPosition.y;
                        lines += "C " + startCurve + endCurve + endPoint;
                    }
                }.bind(this));
                return lines;
            }
            ,
            getBubblePosition: function (bubble, isChild) {
                let position = {
                    x: 0,
                    y: 0
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
                if (this.bubble.isCenter) {
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
                let yAdjust = this.isLeft ? -63 : -83;
                position.y = Math.round(this.bubbleRect.bottom + yAdjust + window.pageYOffset);
                return position;
            },
        }
    }
</script>

<style scoped>

</style>
