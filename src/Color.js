/*
 * Copyright Vincent Blouin under the GPL License version 3
 */
import CurrentSubGraph from '@/graph/CurrentSubGraph'

const Color = {
    DEFAULT_BACKGROUND_COLOR: "#1E87AF",
    EdgeColor: "#1a237e",
    SkeletonColor: "#e8e8e8",
    getBackgroundColorForColor: function (color) {
        var hsl = Color.hex2Hsl(color);
        return 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
    },
    refreshBackgroundColor: function (backgroundColor) {
        backgroundColor = backgroundColor || CurrentSubGraph.get().center.getBackgroundColor();
        let drawnGraph = document.getElementById("drawn_graph");
        if (drawnGraph) {
            drawnGraph.style.background = "radial-gradient(rgba(0, 0, 0, 0) 15%, " + backgroundColor + " 100%"
        }
        let hsl = Color.hex2Hsl(backgroundColor);
        Color.bubbleBackground = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + 96 + '%)';
    },
    hex2Hsl: function (hex) {
        //https://stackoverflow.com/q/46432335
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);

        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        s = s * 100;
        s = Math.round(s);
        l = l * 100;
        l = Math.round(l);
        h = Math.round(360 * h);
        return {
            h: h,
            s: s,
            l: l
        };
    },
    bubbleBackground: ""
};
export default Color;
