/**
 * Plugin Template
 *
 * Name v0.0.1
 * Description, by Chris Ferdinandi.
 * http://gomakethings.com
 *
 * Free to use under the MIT License.
 * http://gomakethings.com/mit/
 *
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('triangles', factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.triangles = factory(root);
    }
})(window || this, function(root) {

    'use strict';

    //
    // Variables
    //

    var triangles = {}; // Object for public APIs
    var supports = !!document.querySelector && !!root.addEventListener; // Feature test
    var settings; // Plugin settings
    var matrix = []; // matrix to hold the triangles divs
    var _randomColorsArray = []; // sorted array for random colors and chance of selecting

    // Default settings
    var defaults = {
        cssSelector: 'div.triangles',
        width: 500,
        height: 500,
        cols: 20,
        rows: 20,
        minTriangleLength: 4,

        updateOnResize: true,

        borderColor: '',
        baseColor: 'blue',
        paintColor: '#fff',

        gradient: { topLeft: '#f00', bottomRight: '#0f0' },

        random: false,
        randomColors: {
            '#FFA666': 0.1,
            '#72A4AF': 0.3,
            '#CCC': 0.6
        },

        onMouseEnter: null,
        onMouseLeave: null
    };

    //
    // Methods
    //

    /*
     * Main method to initialize and draw svg
     */
    function loadSvg(svg) {
        initMatrix();
        initRandomColorsArray();
        appendTriangles(svg);
    }

    /*
     * Initialise matrix with newly created triangle divs
     */
    function initMatrix() {
        matrix = [];

        for (var i = 0; i < settings.cols; i++) {
            matrix.push([]);
            matrix[i].push(new Array(settings.rows));

            for (var j = 0; j < settings.rows; j++) {
                var baseColor = settings.baseColor;
                var paintColor = settings.paintColor;

                if (settings.borderColor && (i ==0 || j == 0 || i == settings.cols - 1 || j == settings.rows - 1)) {
                    paintColor = settings.borderColor;
                }
                else if (settings.gradient) {
                    var rgbFrom, rgbTo,
                        hsvFrom, hsvTo,
                        ratio,
                        colorH, colorS, colorV,
                        colorRgb;

                    if (settings.gradient.top) {
                        rgbFrom = hexToRgb(settings.gradient.top);
                        rgbTo = hexToRgb(settings.gradient.bottom);

                        if (settings.borderColor) {
                            ratio = (j - 1) / (settings.rows - 2);
                        }
                        else {
                            ratio = j / settings.rows;
                        }
                    }
                    else if (settings.gradient.left) {
                        rgbFrom = hexToRgb(settings.gradient.left);
                        rgbTo = hexToRgb(settings.gradient.right);

                        if (settings.borderColor) {
                            ratio = (i - 1) / (settings.cols);
                        }
                        else {
                            ratio = i / settings.cols;
                        }
                    }
                    else if (settings.gradient.topLeft) {
                        rgbFrom = hexToRgb(settings.gradient.topLeft);
                        rgbTo = hexToRgb(settings.gradient.bottomRight);

                        if (settings.borderColor) {
                            ratio = (i + j - 2) / (settings.rows + settings.cols - 2);
                        }
                        else {
                            ratio = (i + j) / (settings.rows + settings.cols);
                        }
                    }

                    hsvFrom = rgbToHsv(rgbFrom[0], rgbFrom[1], rgbFrom[2]);
                    hsvTo = rgbToHsv(rgbTo[0], rgbTo[1], rgbTo[2]);

                    colorH = (1 - ratio) * hsvFrom[0] + ratio * hsvTo[0];
                    colorS = (1 - ratio) * hsvFrom[1] + ratio * hsvTo[1];
                    colorV = (1 - ratio) * hsvFrom[2] + ratio * hsvTo[2];

                    colorRgb = hsvToRgb(colorH, colorS, colorV);
                    paintColor = 'rgb(' + Math.round(colorRgb[0]) + ',' + Math.round(colorRgb[1]) + ',' + Math.round(colorRgb[2]) + ')';
                }
                else if (settings.random) {
                    var random = Math.random() * _randomColorsArray[_randomColorsArray.length - 1]['value'];

                    for (var k = 0; k < _randomColorsArray.length; k++) {
                        if (_randomColorsArray[k]['value'] > random) {
                            paintColor = _randomColorsArray[k]['key'];
                            break;
                        }
                    }
                }

                matrix[i][j] = [baseColor, paintColor];
            }
        }
    };

    /*
     Creates an array sorted by chance value from randomColors option
     */
    function initRandomColorsArray() {
        if (settings.randomColors) {
            _randomColorsArray = sortObject(settings.randomColors);
            Object.keys(_randomColorsArray).sort(function(a, b) {
                return _randomColorsArray[a] - _randomColorsArray[b]
            });

            var sumChance = 0;
            forEach(_randomColorsArray, function(color) {
                sumChance += color['value'];
                color['value'] = sumChance;
            });
        }
    };

    /*
     Main methods for appending the triangle divs
     */
    function appendTriangles(svg) {

        var tWidth = settings.width / settings.cols;
        var tHeight = settings.height / settings.rows;
        var minLength = Math.floor(Math.min(tWidth, tHeight));

//        $(settings.cssSelector).width(minLength * settings.cols).height(minLength * settings.rows);
        $(settings.cssSelector).width(settings.width).height(settings.height);

        for (var col = 0; col < settings.cols; col++) {
            for (var row = 0; row < settings.rows; row++) {
                var ox = col * minLength;
                var oy = row * minLength;

                var bases = [[ox, oy], [ox, oy + minLength], [ox + minLength, oy + minLength]];
                var paints = [[ox, oy], [ox + minLength, oy], [ox + minLength, oy + minLength]];

                svg.polygon(bases, {fill: matrix[col][row][0]});
                svg.polygon(paints, {fill: matrix[col][row][1]});
            }
        }
    };

    /**
     * Convert object into a sorted array with prop as key and propValue as value
     * @param obj e.g. { a: 1, b: 2 }
     * @returns {Array} Sorted array with objects e.g. [{ key: 1, value: 'a' }, { key: 2, value: 'b' }]
     */
    function sortObject(obj) {
        var arr = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                arr.push({
                    'key': prop,
                    'value': obj[prop]
                });
            }
        }
        arr.sort(function(a, b) {
            return a.value - b.value;
        });
        return arr;
    };

    /**
     * A simple forEach() implementation for Arrays, Objects and NodeLists
     * @private
     * @param {Array|Object|NodeList} collection Collection of items to iterate
     * @param {Function} callback Callback function for each iteration
     * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
     */
    var forEach = function(collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === '[object Object]') {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };

    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extend = function(defaults, options) {
        var extended = {};
        forEach(defaults, function(value, prop) {
            extended[prop] = defaults[prop];
        });
        forEach(options, function(value, prop) {
            extended[prop] = options[prop];
        });
        return extended;
    };

    /**
     * Destroy the current initialization.
     * @public
     */
    triangles.destroy = function() {
        if (settings) {
            $(settings.cssSelector).empty();
        }

        matrix = [];

        _randomColorsArray = [];

        settings = defaults;
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    triangles.init = function(options) {

        // feature test
        if (!supports) return;

        var generate = function() {
            // Destroy any existing initializations
            triangles.destroy();

            defaults.width = window.innerWidth;
            defaults.height = window.innerHeight;

            // Selectors and variables
            settings = extend(defaults, options || {}); // Merge user options with defaults

            $('#sidebar').hover(function() {
                unbindHoverTriangle();
                triangles.fadeOutVertical();
            }, function() {
                unbindHoverTriangle();
                triangles.fadeInVertical();
            });

            $(settings.cssSelector).svg({onLoad: loadSvg});
        };

        generate();

        if (settings.updateOnResize) {
            window.addEventListener('resize', function(event){
                generate();
            });
        }

        var fileDrop = $('#filedrop');
        fileDrop.on('dragover', cancel);
        fileDrop.on('dragenter', cancel);
        fileDrop.on('dragexit', cancel);
        fileDrop.on('drop', dropFile);
    };

    function dropFile(event) {

        event.stopPropagation();
        event.preventDefault();

        // query what was dropped
        var files = event.originalEvent.dataTransfer.files;

        // if we have something
        if(files.length) {
            var fileReader 			= new FileReader();
            fileReader.onloadend	= fileUploaded;
            fileReader.readAsDataURL(files[0]);
        }
    };

    function fileUploaded(event) {
        if(event.target.result.match(/^data:image/)) {
            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');

            var img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                var width = canvas.width = img.width;
                var height = canvas.height = img.height;

                context.drawImage(img,0,0,img.width,img.height);

                var imageData = context.getImageData(0, 0, width, height);

                initMatrixWithArray(imageData, width, height);
            }
        }
        else {
            alert("Only image file is supported!");
        }
    };

    function initMatrixWithArray(imageDataArr, width, height) {
        matrix = [];

        settings.width = width ;
        settings.height = height;

        settings.cols = Math.ceil(settings.width / settings.minTriangleLength);
        settings.rows = Math.ceil(settings.height / settings.minTriangleLength);

        while (Math.floor(settings.width / settings.cols) < settings.minTriangleLength) {
            settings.cols--;
        }
        while (Math.floor(settings.height / settings.rows) < settings.minTriangleLength) {
            settings.rows--;
        }

        var stepX = Math.floor(settings.width / settings.cols);
        var stepY = Math.floor(settings.height / settings.rows);

        for (var i = 0; i < settings.cols; i++) {
            matrix.push([]);
            matrix[i].push(new Array(settings.rows));

            for (var j = 0; j < settings.rows; j++) {
                var inpos = ((i * stepX) * 4) + ((j * stepY) * settings.width * 4); // *4 for 4 ints per pixel

                var baseColor = settings.baseColor;
                var paintColor = 'rgba(' + [imageDataArr.data[inpos++], imageDataArr.data[inpos++], imageDataArr.data[inpos++], imageDataArr.data[inpos++]].join(',') + ')';

                matrix[i][j] = [baseColor, paintColor];
            }
        }

        $(settings.cssSelector).width(settings.width).height(settings.height);
        var svg = $(settings.cssSelector).svg('get');
        svg.clear();
        appendTriangles(svg);
    };

    function cancel(event) {
        if(event.preventDefault) {
            event.preventDefault();
        }
    }

    /**
     * Bind mouseenter and mouseleave event on the triangles as specified in the settings
     */
    function bindHoverTriangle() {
        if (settings.onMouseEnter) {
            $(settings.cssSelector + ' .triangle').mouseenter(
                settings.onMouseEnter
            );
        }
        if (settings.onMouseLeave) {
            $(settings.cssSelector + ' .triangle').mouseleave(
                settings.onMouseLeave
            );
        }
    }

    /**
     * Unbind mouseenter and mouseleave event on the triangles
     */
    function unbindHoverTriangle() {
        $(settings.cssSelector + ' .triangle').unbind('mouseenter mouseleave');
    }

    triangles.fadeOutHorizontal = function() {
        fadeHorizontal(0);
    };
    triangles.fadeInHorizontal = function() {
        fadeHorizontal(1);
    };

    /**
     * Fades triangles from left to right
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeHorizontal(toOpacity) {

        (function fadeHorizontal(col) {
            if (!matrix[col] || !matrix[col][0]) {
                return;
            }

            $(matrix[col][0]).parent().animate({
                opacity: toOpacity
            }, 100, function() {
                fadeHorizontal(col + 1);

                if (toOpacity == 1 && col == settings.cols - 1) {
                    bindHoverTriangle();
                }
            });
        })(0);
    };

    triangles.fadeOutVertical = function() {
        fadeVertical(0);
    };
    triangles.fadeInVertical = function() {
        fadeVertical(1);
    };

    /**
     * Fades triangles from top to bottom
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeVertical(toOpacity) {

        (function animateFadeVertical(row) {

            var childs = $(settings.cssSelector + ' .col .triangle:nth-child(' + row + ')');
            if (!childs || childs.length === 0) {
                return;
            }

            childs.animate({
                opacity: toOpacity
            }, 100, function() {
                if (this == childs[0]) {
                    animateFadeVertical(row + 1);
                }

                if (toOpacity == 1 && row == settings.rows - 1 && this == childs[childs.length - 1]) {
                    bindHoverTriangle();
                }
            });
        })(1);
    };

    triangles.fadeOutDiagonal = function() {
        fadeDiagonal(0);
    };
    triangles.fadeInDiagonal = function() {
        fadeDiagonal(1);
    };

    /**
     * Fades triangles from top left to bottom right
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeDiagonal(toOpacity) {

        (function animateFadeDiagonal(col, row) {

            if (!matrix[col] || !matrix[col][row]) {
                return;
            }

            $(matrix[col][row]).animate({
                opacity: toOpacity
            }, 100, function() {

                animateFadeDiagonal(col, row + 1);

                if (row === 0) {
                    animateFadeDiagonal(col + 1, row);
                }

                if (toOpacity == 1 && row == settings.rows - 1 && col == settings.cols - 1) {
                    bindHoverTriangle();
                }
            });
        })(0, 0);
    };

    /**
     * https://github.com/mjackson/mjijackson.github.com/blob/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.txt
     * Converts a hex color value to HSV
     * returns r, g and b in the set [0, 255].
     * @param {String} hex The hex color value, e.g. #fff, #aaccff
     * @returns {Array} The RGB representation
     */
    function hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex
            // remove non-hex chars (e.g. leading '#')
            .replace(/[^0-9A-F]/gi, '')
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            .replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return [r, g, b];
    }

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSV representation
     */
    function rgbToHsv(r, g, b){
        r = r/255, g = g/255, b = b/255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if(max == min){
            h = 0; // achromatic
        }else{
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, v];
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    function hsvToRgb(h, s, v){
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch(i % 6){
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [r * 255, g * 255, b * 255];
    }

    //
    // Public APIs
    //

    return triangles;
});