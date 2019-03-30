<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="svg-container" v-if="loaded && bubble.isVertex() && bubble.isCenter">
        <svg
                style="position:absolute;overflow:visible; top:0; left:0; height:100%; width:100%"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg">
            <path
                    :d="topBottomLineAtLeft()"
                    v-if="isLeft && this.children.length > 1"
                    fill="none" stroke="#1a237e" stroke-width="2px"
            />
            <path
                    :d="topBottomLineAtRight()"
                    v-if="!isLeft && this.children.length > 1"
                    fill="none" stroke="#1a237e" stroke-width="2px"
            />
            <path :d="childrenLines()"
                  fill="none" stroke="#1a237e" stroke-width="2px"
            ></path>
        </svg>
    </div>
</template>

<script>
    const arcRadius = 20;
    const arcRadiusLeft = arcRadius * -1;
    export default {
        name: "EdgesDrawing",
        props: ['bubble', 'isLeft'],
        data: function () {
            return {
                loaded: false,
                highestChild: null,
                lowestChild: null,
                children: null
            }
        },
        mounted: function () {
            this.loaded = false;
            this.$nextTick(function () {
                setTimeout(function () {
                    this.children = this.getChildren();
                    if (this.children.length > 1) {
                        this.highestChild = this.children[0];
                        this.lowestChild = this.children[this.children.length - 1];
                    }
                    this.loaded = true;
                }.bind(this), 3000)
                // this.loaded = true;
            }.bind(this));
        },
        computed: {
            position: function () {
                let position = this.getBubblePosition(this.bubble);
                return position;
            },
            highestPosition: function () {
                return this.getBubblePosition(this.highestChild, true);
            },
            lowestPosition: function () {
                return this.getBubblePosition(
                    this.lowestChild,
                    true
                );
            }
        },
        methods: {
            topBottomLineAtLeft: function () {
                let lowest = this.lowestPosition;
                let highest = this.highestPosition;
                return "M " + highest.x + "," + highest.y + " " +
                    "L " + (this.position.x + arcRadiusLeft) + " " + highest.y + " " +
                    "a20,20 0 0 1 20,20 " +
                    "V " + (lowest.y + arcRadiusLeft) + " " +
                    "a20,20 0 0 1 -20,20 " +
                    "H " + lowest.x
            },
            topBottomLineAtRight: function () {
                let lowest = this.lowestPosition;
                let highest = this.highestPosition;
                return "M " + (lowest.x + arcRadius) + "," + lowest.y + " " +
                    "L " + (this.position.x + arcRadius) + " " + lowest.y + " " +
                    "a20,20 0 0 1 -20,-20 " +
                    "V " + (highest.y + arcRadius) + " " +
                    "a20,20 0 0 1 20,-20 " +
                    "H " + highest.x
            },
            childrenLines: function () {
                let lines = "";
                this.children.forEach(function (child) {
                    if (child.isSameBubble(this.highestChild) || child.isSameBubble(this.lowestChild)) {
                        return;
                    }
                    let childPosition = this.getBubblePosition(child);
                    lines += "M " + childPosition.x + " " + childPosition.y;
                    lines += "L " + this.position.x + " " + childPosition.y
                }.bind(this));
                return lines;
            },
            getBubblePosition: function (bubble, isChild) {
                let position = {
                    x: 0,
                    y: 0
                };
                let element;
                if (isChild) {
                    element = (bubble.isEdge() && bubble.isShrinked()) ? bubble.getHtml() : bubble.getLabelHtml();
                } else {
                    element = bubble.getHtml();
                }
                if (!element) {
                    this.loaded = false;
                    this.$nextTick(function () {
                        this.loaded = true;
                    }.bind(this));
                    return position;
                }
                let rect = element.getBoundingClientRect();
                position.x = rect.x + window.pageXOffset;
                // if (this.isLeft && isChild) {
                //     position.x += rect.width;
                // }
                if (!this.isLeft && !isChild) {
                    position.x += rect.width;
                }

                let adjust = this.isLeft ? -20 : -10;
                if (isChild) {
                    position.x -= rect.width + adjust;
                }
                position.x = Math.round(position.x);
                position.y = Math.round(rect.top - 31 - (element.clientHeight)) + window.scrollY;
                return position;
            },
            getChildren: function () {
                if (this.bubble.isGroupRelation()) {
                    return this.bubble._sortedImmediateChild;
                } else if (this.bubble.isEdge()) {
                    return [this.bubble.getDestinationVertex()]
                } else if (this.bubble.isCenter) {
                    return this.isLeft ? this.bubble.leftBubbles : this.bubble.rightBubbles;
                } else {
                    return this.bubble.rightBubbles;
                }
            }
        }
    }
</script>

<style scoped>
    .svg-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
