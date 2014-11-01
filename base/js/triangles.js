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
    var divStyle;

    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth,
        y = w.innerHeight;

//    x = w.innerWidth || e.clientWidth || g.clientWidth,
//    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    console.log(d);
    console.log(g);
    console.log(x + ',' + y);

    // Default settings
    var defaults = {
        cssSelector: 'div.triangles',
        width: x,
        height: y,
        cols: 20,
        rows: 20,

        updateOnResize: true,

        borderColor: '#aaa',
        baseColor: '#ccc',
        paintColor: '#fff',

        random: true,
        randomColors: {
            '#FFA666': 0.1,
            '#72A4AF': 0.3,
            '#CCC': 0.6
        }
    };

    //
    // Methods
    //

    /*
     * Initialise matrix with newly created triangle divs
     */
    function initMatrix() {
        matrix = [];

        for (var i = 0; i < settings.cols; i++) {
            matrix.push([]);
            matrix[i].push(new Array(settings.rows));

            for (var j = 0; j < settings.rows; j++) {
                var el = document.createElement('div');
                addClass(el, 'triangle');

                if (settings.random) {
                    var random = Math.random() * _randomColorsArray[_randomColorsArray.length - 1]['value'];

                    for (var k = 0; k < _randomColorsArray.length; k++) {
                        if (_randomColorsArray[k]['value'] > random) {
                            el.style.borderColor = 'transparent transparent transparent ' + _randomColorsArray[k]['key'];
                            matrix[i][j] = el;
                            break;
                        }
                    }
                } else {
                    el.style.borderColor = 'transparent transparent transparent ' + settings.baseColor;
                    matrix[i][j] = el;
                }
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
    function appendTriangles() {
        for (var col = 0; col < settings.cols; col++) {
            appendColumn(matrix[col]);
        }

        var squareWidth = settings.width / settings.cols;
        var squareHeight = settings.height / settings.rows;

        /*
         * _______ <--- triangleLength
         * \    /|
         *  \  /<------ borderWidth
         *   \/  |
         *    \  |
         *     \<------ diagonalLength
         *      \|
         */
        // length of the horizontal/vertical side of the triangle
        // here we take the minimum of the two
        var triangleLength = Math.min(squareWidth, squareHeight);

        // the length of the diagonal side of the triangle
        var diagonalLength = triangleLength  * Math.sqrt(2);

        var borderWidth = Math.floor(diagonalLength / 2);

        // width of each column which is same as the triangle length
        // -1 here to be safe as sometimes the scroll bar's width will cause the column to go to next row
        var columnWidth = Math.floor(triangleLength) - 1;

        var triangleMarginTop = Math.floor(triangleLength - diagonalLength);

        var divMarginTop = Math.floor(-triangleLength / Math.sqrt(2) - triangleMarginTop);
        var divMarginLeft = Math.floor(triangleLength - triangleLength / Math.sqrt(2));

        if (!divStyle) {
            divStyle = document.createElement('style');
            document.getElementsByTagName('body')[0].appendChild(divStyle);
        }

        divStyle.innerHTML = settings.cssSelector + ' {  margin-top: ' + divMarginTop + 'px; margin-left: ' + divMarginLeft + 'px} ' +
            settings.cssSelector + ' .triangle { border-width: ' + borderWidth + 'px; margin-top: ' + triangleMarginTop + 'px; } ' +
            settings.cssSelector + ' .col { width: ' + columnWidth + 'px; }';
    };

    /**
     * Append triangle divs to the column supplied by the colMatrix
     * @param {Array} colMatrix array contains the dom divs for each row in a column
     */
    function appendColumn(colMatrix) {
        var col = document.createElement('div');
        addClass(col, 'col');

        for (var row = 0; row < settings.rows; row++) {
            col.appendChild(colMatrix[row]);
        }

        var triangleDivs = document.querySelector(settings.cssSelector)
        triangleDivs.appendChild(col);
    };

    /**
     * Add css class to element, similar to jquery addClass
     * @param {DOM Element} el
     * @param {String} className
     */
    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    };

    /**
     * Convert object into a sorted array with prop as key and propValue as value
     * @param obj { a: 1, b: 2 }
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
            var triangles = document.querySelector(settings.cssSelector);
            triangles.innerHTML = '';
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

            // Selectors and variables
            settings = extend(defaults, options || {}); // Merge user options with defaults

            initRandomColorsArray();
            initMatrix();
            appendTriangles();
        };

        generate();

        if (settings.updateOnResize) {
            window.addEventListener('resize', function(event){
                x = w.innerWidth,
                y = w.innerHeight;
                defaults.width = x;
                defaults.height = y;

                console.log(x + ': ' + y);
                generate();
            });
        }
    };

    //
    // Public APIs
    //

    return triangles;
});