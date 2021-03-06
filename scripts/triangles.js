(function( $ ) {

    $.fn.triangles = function(opts, callback) {

        var settings = $.extend( {}, $.fn.triangles.defaults, opts );

        $(this).each(function() {
            $(this).svg();

            $(this).data('triangles', {
                settings: settings,
                fadeTriangles: fadeTriangles
            });

            loadSvg.call($(this), callback);
        });

        return $(this);
    };

    /*
     * Main method to initialize and draw svg
     */
    function loadSvg(callback) {
        initRandomColorsArray.call(this);
        initMatrix.call(this);
        bindTriangleEvent.call(this);

        if (callback) {
            callback.call($(this));
        }
    }

    /*
     * Initialise matrix with newly created triangle divs
     */
    function initMatrix() {

        var matrix = [];
        var data = this.data('triangles');
        var settings = data.settings;
        var randomColorsArray = data.randomColorsArray;
        var svg = $(this).svg('get');
        svg.clear();

        $(this).css('backgroundColor', settings.baseColor);

        var minLength = 1;
        if (settings.triangleLength > 0) {
            settings.cols = Math.ceil(settings.width / settings.triangleLength);
            settings.rows = Math.ceil(settings.height / settings.triangleLength);
            minLength = settings.triangleLength;
        }
        else {
            var tWidth = settings.width / settings.cols;
            var tHeight = settings.height / settings.rows;
            minLength = Math.floor(Math.min(tWidth, tHeight));
        }

        svg.width(settings.width);
        this.width(settings.width).height(settings.height);

        if (settings.image) {
            convertDataURLToImageData.call(this, settings.image, initMatrixWithImageData);
            return;
        }

        for (var col = 0; col < settings.cols; col++) {
            matrix.push([]);
            matrix[col].push(new Array(settings.rows));

            var g = svg.group();

            for (var row = 0; row < settings.rows; row++) {
                var paintColor = settings.paintColor;

                if (settings.borderColor && (row ==0 || col == 0 || col == settings.cols - 1 || row == settings.rows - 1)) {
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
                            ratio = (row - 1) / (settings.rows - 2);
                        }
                        else {
                            ratio = row / settings.rows;
                        }
                    }
                    else if (settings.gradient.left) {
                        rgbFrom = hexToRgb(settings.gradient.left);
                        rgbTo = hexToRgb(settings.gradient.right);

                        if (settings.borderColor) {
                            ratio = (col - 1) / (settings.cols);
                        }
                        else {
                            ratio = col / settings.cols;
                        }
                    }
                    else if (settings.gradient.topLeft) {
                        rgbFrom = hexToRgb(settings.gradient.topLeft);
                        rgbTo = hexToRgb(settings.gradient.bottomRight);

                        if (settings.borderColor) {
                            ratio = (col + row - 2) / (settings.cols + settings.rows - 2);
                        }
                        else {
                            ratio = (col + row) / (settings.cols + settings.rows);
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
                    var random = Math.random() * randomColorsArray[randomColorsArray.length - 1]['value'];

                    for (var k = 0; k < randomColorsArray.length; k++) {
                        if (randomColorsArray[k]['value'] >= random) {
                            paintColor = randomColorsArray[k]['key'];
                            break;
                        }
                    }
                }

                var ox = col * minLength;
                var oy = row * minLength;

                var paints = [[ox, oy], [ox + minLength, oy], [ox + minLength, oy + minLength]];

                matrix[col][row] = svg.polygon(g, paints, {fill: paintColor, class: 'paint', opacity: settings.initialOpacity});
            }
        }

        data.matrix = matrix;
    };

    /*
     Creates an array sorted by chance value from randomColors option
     */
    function initRandomColorsArray() {
        var data = this.data('triangles');
        var settings = data.settings;
        var randomColorsArray = [];

        if (settings.randomColors) {
            randomColorsArray = sortObject(settings.randomColors);
            Object.keys(randomColorsArray).sort(function(a, b) {
                return randomColorsArray[a] - randomColorsArray[b]
            });

            var sumChance = 0;
            $.each(randomColorsArray, function(index, color) {
                sumChance += color['value'];
                color['value'] = sumChance;
            });

            data.randomColorsArray = randomColorsArray;
        }
    };

    function initMatrixWithImageData(imageDataArr, width, height) {

        var data = this.data('triangles');
        var matrix = data.matrix = [];
        var settings = data.settings;

        var svg = this.svg('get');
        svg.clear();

        settings.width = width ;
        settings.height = height;

        if (settings.triangleLength > 0) {
            settings.cols = Math.ceil(settings.width / settings.triangleLength);
            settings.rows = Math.ceil(settings.height / settings.triangleLength);
        }
        else {
            settings.cols = Math.ceil(settings.width / settings.minTriangleLength);
            settings.rows = Math.ceil(settings.height / settings.minTriangleLength);

            while (Math.floor(settings.width / settings.cols) < settings.minTriangleLength) {
                settings.cols--;
            }
            while (Math.floor(settings.height / settings.rows) < settings.minTriangleLength) {
                settings.rows--;
            }
        }

        var stepX = Math.floor(settings.width / settings.cols);
        var stepY = Math.floor(settings.height / settings.rows);

        var minLength = Math.min(stepX, stepY);

        this.width(settings.width).height(settings.height);

        for (var col = 0; col < settings.cols; col++) {
            matrix.push([]);
            matrix[col].push(new Array(settings.rows));

            var g = svg.group();

            for (var row = 0; row < settings.rows; row++) {
                /*
                 *             x0             x1
                 *     ---------------------------------
                 *     |    |    |    ||    |    |    ||
                 *     ---------------------------------
                 * y0  |    |rgba|    ||    |rgba|    || ...
                 *     ---------------------------------
                 *     |    |    |    ||    |    |    ||
                 *     ---------------------------------
                 *            .
                 *            .
                 *            .
                 */
                var x = Math.floor((col + 0.5) * stepX); // x0, x1...
                var y = Math.floor((row + 0.5) * stepY); // y0, y1...

                var inpos = (x + y * settings.width) * 4;
                // x is the position from the left in a row
                // y is the position from the top in a col
                // y * settings gives the length of the rows
                // *4 for 4 ints per pixel ie. r, g, b, a

                var paintColor = 'rgba(' + [imageDataArr.data[inpos++], imageDataArr.data[inpos++], imageDataArr.data[inpos++], imageDataArr.data[inpos++]].join(',') + ')';

                var ox = col * minLength;
                var oy = row * minLength;

                var paints = [[ox, oy], [ox + minLength, oy], [ox + minLength, oy + minLength]];

                matrix[col][row] = svg.polygon(g, paints, {fill: paintColor, class: 'paint', opacity: settings.initialOpacity});
            }
        }

        return this;
    };

    /**
     * Bind mouseenter, mouseleave and click event  as specified in the settings on the triangles
     */
    function bindTriangleEvent() {
        var settings = this.data('triangles').settings;
        $('polygon.paint', this.svg('get').root()).on({
            'click': settings.onClick,
            'mouseenter': settings.onMouseEnter,
            'mouseleave': settings.onMouseLeave
        });
    }

    function fadeTriangles(direction, toOpacity, callback) {
        if (typeof toOpacity === 'undefined') {
            toOpacity = 0;
        }

        switch(direction) {
            case 'horizontal':
                fadeHorizontal.call(this, toOpacity, callback);
                break;
            case 'vertical':
                fadeVertical.call(this, toOpacity, callback);
                break;
            case 'all':
                fadeAll.call(this, toOpacity, callback);
                break;
            case 'diagonal':
            default:
                fadeDiagonal.call(this, toOpacity, callback);
        }

        return $(this);
    };

    /**
     * Fades triangles from left to right
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeHorizontal(toOpacity, callback) {

        var self = this;
        var matrix = self.matrix;
        var settings = self.settings;

        (function animateFadeHorizontal(col) {
            if (!matrix[col] || !matrix[col][0]) {
                return;
            }

            for (var row = 0; row < settings.rows; row++) {
                (function animate(row) {
                    $(matrix[col][row]).fadeTo(1, toOpacity, function() {
                        // last row
                        if (row == settings.rows - 1) {
                            // last column means this is the last animate
                            // proceed to callback if exists
                            if (col == settings.cols - 1) {
                                if (callback) {
                                    callback.call(self);
                                }
                                else {
                                    if (toOpacity == 0 && settings.fadeOutHorizontalCallback) {
                                        settings.fadeOutHorizontalCallback.call(self);
                                    }
                                    else if (toOpacity == 1 && settings.fadeInHorizontalCallback) {
                                        settings.fadeInHorizontalCallback.call(self);
                                    }
                                }
                            }
                            // else animate next column
                            else {
                                animateFadeHorizontal(col + 1);
                            }
                        }
                    })
                })(row);
            }
        })(0);
    };

    /**
     * Fades triangles from top to bottom
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeVertical(toOpacity, callback) {

        var self = this;
        var matrix = self.matrix;
        var settings = self.settings;

        (function animateFadeVertical(row) {
            if (row >= settings.rows) {
                return;
            }

            for (var col = 0; col < settings.cols; col++) {
                (function animate(col) {
                    $(matrix[col][row]).fadeTo(1, toOpacity, function() {
                        // last column
                        if (col == settings.cols - 1) {
                            // last row means this is the last animate
                            // proceed to callback if exists
                            if (row == settings.rows - 1) {

                                if (callback) {
                                    callback.call(self);
                                }
                                else {
                                    if (toOpacity == 0 && settings.fadeOutVerticalCallback) {
                                        settings.fadeOutVerticalCallback.call(self);
                                    }
                                    else if (toOpacity == 1 && settings.fadeInVerticalCallback) {
                                        settings.fadeInVerticalCallback.call(self);
                                    }
                                }
                            }
                            // else animate next row
                            else {
                                animateFadeVertical(row + 1);
                            }
                        }
                    })
                })(col);
            }
        })(0);
    };

    /**
     * Fades all triangles
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeAll(toOpacity, callback) {
        var self = this;
        var matrix = self.matrix;
        var settings = self.settings;

        (function animateFadeAll() {
            $(matrix[0][0]).parent().parent().fadeTo(500, toOpacity, function() {

                if (callback) {
                    callback.call(self);
                }
                else {
                   if (toOpacity == 0) {
                       settings.fadeOutAllCallback.call(self);
                   }
                    else if (toOpacity == 1) {
                        settings.fadeInAllCallback.call(self);
                    }
                }
            });
        })();
    }
    /**
     * Fades triangles from top left to bottom right
     * @param {int} toOpacity the opacity to animate to, possible value is in [0,1]
     */
    function fadeDiagonal(toOpacity, callback) {

        var self = this;
        var matrix = self.matrix;
        var settings = self.settings;

        (function animateFadeDiagonal(col, row) {

            if (!matrix[col] || !matrix[col][row]) {
                return;
            }

            $(matrix[col][row]).fadeTo(1, toOpacity, function() {

                // check if this is the last animate
                // proceed to callback if exists
                if (col == settings.cols - 1 && row == settings.rows - 1) {
                    if (callback) {
                        callback.call(self);
                    }
                    else {
                        if (toOpacity == 0 && settings.fadeOutDiagonalCallback) {
                            settings.fadeOutDiagonalCallback.call(self);
                        }
                        else if (toOpacity == 1 && settings.fadeInDiagonalCallback) {
                            settings.fadeInDiagonalCallback.call(self);
                        }
                    }
                }
                // else animate next column/row
                else {
                    animateFadeDiagonal(col, row + 1);

                    if (row === 0) {
                        animateFadeDiagonal(col + 1, row);
                    }
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

    function convertDataURLToImageData(dataURL, callback) {
        var self = this;
        if (dataURL !== undefined && dataURL !== null) {
            var canvas, context, image;
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            image = new Image();
            image.addEventListener('load', function(){
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                callback.call(self, context.getImageData(0, 0, canvas.width, canvas.height), image.width, image.height);
            }, false);

            if (dataURL.toLowerCase().indexOf('http://') == 0 || dataURL.toLowerCase().indexOf('https://') == 0 || dataURL.indexOf('//') == 0) {
                var x = new XMLHttpRequest();
                x.open('GET', '//cors-anywhere.herokuapp.com/' + dataURL);
                x.responseType = 'blob';
                x.onload = function() {
                    var blob = x.response;
                    var fr = new FileReader();
                    fr.onloadend = function() {
                        var dataUrl = fr.result;
                        image.src = dataUrl;
                    };
                    fr.readAsDataURL(blob);
                };
                x.onerror = function() {
                    console.log('A network error occurred when sending XMLHttpRequest');
                };
                x.send();
            }
            else {
                image.src = dataURL;
            }
        }
    }

    $.fn.triangles.defaults = {
        width: 200,
        height: 200,
        cols: 20,
        rows: 20,
        triangleLength: -1,
        minTriangleLength: 5,
        initialOpacity: 1,

        updateOnResize: true,

        borderColor: '',
        baseColor: '#fff',
        paintColor: '#999',

        gradient: null,

        random: false,
        randomColors: {
            '#FFA666': 0.1,
            '#72A4AF': 0.3,
            '#CCC': 0.6
        },

        onClick: function() {},
        onMouseEnter: function() {},
        onMouseLeave: function() {},

        fadeInHorizontalCallback: function() {},
        fadeInVerticalCallback: function() {},
        fadeInDiagonalCallback: function() {},
        fadeInAllCallback: function() {},

        fadeOutHorizontalCallback: function() { fadeTriangles.call(this, 'horizontal', 1); },
        fadeOutVerticalCallback: function() { fadeTriangles.call(this, 'vertical', 1); },
        fadeOutDiagonalCallback: function() { fadeTriangles.call(this, 'diagonal', 1); },
        fadeOutAllCallback: function() { fadeTriangles.call(this, 'all', 1); }
    };
}( jQuery ));