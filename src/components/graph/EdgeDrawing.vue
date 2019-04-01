<!--
  - Copyright Vincent Blouin under the GPL License version 3
  -->

<template>
    <div class="svg-container" v-if="loaded && bubble.isVertex()" style="z-index:-1">
        <svg
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
            <!--<path :d="childrenLines()"-->
            <!--fill="none" :stroke="strokeColor" :stroke-width="strokeWidth"-->
            <!--&gt;</path>-->
        </svg>
    </div>
</template>

<script>

    const arcRadius = 20;
    const arcRadiusLeft = arcRadius * -1;
    const standardInnerMaring = 26;
    const smallInnerMargin = 15;
    export default {
        name: "EdgesDrawing",
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
                highestPosition: null
            }
        },
        mounted: function () {
            this.redraw();
        },
        computed: {
            position: function () {
                let position = this.getBubblePosition(this.bubble);
                return position;
            },
            redraws: function () {
                return this.$store.state.redraws;
            },
        },
        watch: {
            redraws: function () {
                // if (!this.loaded) {
                //     return;
                // }
                this.redraw();
            }
        },
        methods: {
            redraw: function () {
                // this.loaded = false;
                // if(this.bubble.getLabel() === "moustache"){
                //     debugger;
                // }
                this.children = [];
                this.$nextTick(function () {
                    setTimeout(function () {
                        this.children = this.getChildren();
                        if (this.children.length > 1) {
                            this.highestChild = this.children[0];
                            this.lowestChild = this.children[this.children.length - 1];
                            this.topPosition = this.topPositionCalculate();
                            this.bottomPosition = this.bottomPositionCalculate();
                            this.highestPosition = this.highestPositionCalculate();
                            this.lowestPosition = this.lowestPositionCalculate();
                            this.loaded = true;
                        }
                    }.bind(this), 50);
                }.bind(this))
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
                this.children.forEach(function (child) {
                    if (child.isSameBubble(this.highestChild) || child.isSameBubble(this.lowestChild)) {
                        return;
                    }
                    let childPosition = this.getBubblePosition(child);
                    lines += "M " + childPosition.x + " " + childPosition.y;
                    lines += "L " + this.position.x + " " + childPosition.y
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

                // let jOffset = $(element).offset();
                // return {
                //     x: jOffset.left,
                //     y: jOffset.top - 48 - rect.height
                // };

                // var curTransform = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
                // console.log(element.offsetLeft + curTransform.m41); //real offset left
                // console.log(element.offsetTop + curTransform.m42);
                //
                // return {
                //     x: element.offsetLeft + curTransform.m41 + window.scrollX,
                //     y: element.offsetTop + curTransform.m42 + window.scrollY
                // }
            }
            ,
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
            },
            topPositionCalculate: function () {
                let bubble = this.bubble;
                let element = bubble.getHtml();
                let rect = element.getBoundingClientRect();
                let position = {
                    x: 0,
                    y: 0
                };
                position.x = this.isLeft ? rect.left : rect.right;
                position.x += window.pageXOffset;
                // if (this.isLeft && isChild) {
                //     position.x += rect.width;
                // }

                let isSmall = (rect.width - standardInnerMaring * 2) < standardInnerMaring;
                let innerMargin = isSmall ? smallInnerMargin : standardInnerMaring;
                let xAdjust = this.isLeft ? innerMargin : innerMargin * -1;
                position.x += xAdjust;
                position.x = Math.round(position.x);
                let yAdjust;
                if (this.bubble.isCenter) {
                    yAdjust = this.isLeft ? -44 : -65;
                } else {
                    yAdjust = this.isLeft ? -44 : -65;
                }
                // moustacheasdfa sdofijdas foiadsjf asdfoijasd fadsoipf jasdf opiasjdf sdpofijasdf asdf
                // if(this.bubble.getLabel() === "a project"){
                //     debugger;
                // }
                position.y = rect.top + yAdjust + window.pageYOffset;
                return position;
            },
            bottomPositionCalculate: function () {
                let bubble = this.bubble;
                let element = bubble.getHtml();
                let rect = element.getBoundingClientRect();
                let position = {
                    x: 0,
                    y: 0
                };
                position.x = rect.x + window.pageXOffset;
                // if (this.isLeft && isChild) {
                //     position.x += rect.width;
                // }
                let isSmall = (rect.width - standardInnerMaring * 2) < standardInnerMaring;
                let innerMargin = isSmall ? smallInnerMargin : standardInnerMaring;
                let xAdjust = this.isLeft ? innerMargin : rect.width - innerMargin;
                position.x += xAdjust;
                position.x = Math.round(position.x);
                let poire = element.offsetParent.getBoundingClientRect();
                let yAdjust = this.isLeft ? -63 : -83;
                position.y = Math.round(rect.bottom + yAdjust + window.pageYOffset);
                return position;
            },
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
