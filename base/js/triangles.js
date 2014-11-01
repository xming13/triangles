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
        width: 1000,
        height: 500,
        cols: 40,
        rows: 20,

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
    function createTriangles() {
        for (var col = 0; col < settings.cols; col++) {
            createColumn(matrix[col]);
        }

        var triangleWidth = Math.floor(settings.width / settings.cols);
        var triangleHeight = Math.floor(settings.height / settings.rows);
        var columnWidth = Math.min(triangleWidth, triangleHeight);
        var triangleBorderWidth = Math.floor(Math.sqrt(columnWidth / 2 * columnWidth / 2 * 2));
        var marginLeft = triangleBorderWidth / 2;
        var marginTop = -marginLeft;

        $('body').append('<style>' +
            settings.cssSelector + ' { margin-left: ' + marginLeft + 'px; margin-top: ' + marginTop + 'px;} ' +
            '.triangle { border-width: ' + triangleBorderWidth + 'px; margin-top: ' + marginTop + 'px; } ' +
            '.col { width: ' + columnWidth + 'px; }' +
            '</style>')
    };

    /**
     * Append triangle divs to the column supplied by the colMatrix
     * @param {Array} colMatrix array contains the dom divs for each row in a column
     */
    function createColumn(colMatrix) {
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
        matrix = [];
    };

    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    triangles.init = function(options) {

        // feature test
        if (!supports) return;

        // Destroy any existing initializations
        triangles.destroy();

        // Selectors and variables
        settings = extend(defaults, options || {}); // Merge user options with defaults

        initRandomColorsArray();
        initMatrix();
        createTriangles();
    };

    //
    // Public APIs
    //

    return triangles;
});