function Triangles(div, width, height, rows, columns, matrix) {
    this._div = div;

    this._columns = columns;
    this._rows = rows;
    for (var col = 0; col < this._columns; col++) {
        this._createColumn(col, matrix[col]);
    }

    var triangleWidth = Math.floor(width / this._columns);
    var triangleHeight = Math.floor(height / this._rows);
    var columnWidth = Math.min(triangleWidth, triangleHeight);
    var triangleBorderWidth = Math.floor(Math.sqrt(columnWidth / 2 * columnWidth / 2 * 2));
    var marginLeft = triangleBorderWidth / 2;
    var marginTop = -marginLeft;

    $('body').append('<style>#container { margin-left: ' + marginLeft + 'px; margin-top: ' + marginTop + 'px;} .triangle, .empty { border-width: ' + triangleBorderWidth + 'px; margin-top: ' + marginTop + 'px; } .col { width: ' + columnWidth + 'px; }</style>')
};

/** Creates column N. */
Triangles.prototype._createColumn = function(column, matrixColumn) {
    var col = $('<div></div>').addClass('col');

    for (var row = 0; row < this._rows; row++) {
        var el = $('<div></div>');
        el.addClass('triangle');

        if (matrixColumn[row] !== '') {
            el.css('border-color', 'transparent transparent transparent ' + matrixColumn[row]);
        }
        else {
            el.addClass('empty');
        }
        col.append(el);

    }
    this._div.append(col);
};

Triangles.prototype.hide = function() {
    var activeRow = $(this._div.children(':first'));

    function hideNext() {
        if (!activeRow) {
            return;
        }
        var row = activeRow;
        var nextRow = activeRow.next();
        activeRow = nextRow.length > 0 ? $(nextRow[0]) : null;
        row.animate({
            opacity: 0
        }, 100, hideNext);
    }

    hideNext();
};

Triangles.prototype.show = function() {
    var activeRow = $(this._div.children(':first'));

    function showNext() {
        if (!activeRow) {
            return;
        }
        var row = activeRow;
        var nextRow = activeRow.next();
        activeRow = nextRow.length > 0 ? $(nextRow[0]) : null;
        row.animate({
            opacity: 1
        }, 100, showNext);
    }

    showNext();
};

$(document).ready(function() {
    var NUM_COLUMNS = 40;
    var NUM_ROWS = 25;

    var borderColor = '#aaa';
    var baseColor = '#000';
    var wordColor = '#fff';

    var div = $('#container');
    var triangles;
    var matrix = createMatrix(NUM_COLUMNS, NUM_ROWS, baseColor);

    // draw H
    setMatrixColValue(matrix, 4, 4, 10, wordColor);
    setMatrixColValue(matrix, 8, 4, 10, wordColor);
    setMatrixRowValue(matrix, 7, 4, 7, wordColor);

    // draw E
    setMatrixColValue(matrix, 10, 4, 10, wordColor);
    setMatrixRowValue(matrix, 4, 10, 14, wordColor);
    setMatrixRowValue(matrix, 7, 10, 14, wordColor);
    setMatrixRowValue(matrix, 10, 10, 14, wordColor);

    // draw L
    setMatrixColValue(matrix, 16, 4, 10, wordColor);
    setMatrixRowValue(matrix, 10, 16, 20, wordColor);

    // draw L
    setMatrixColValue(matrix, 22, 4, 10, wordColor);
    setMatrixRowValue(matrix, 10, 22, 26, wordColor);

    // draw O
    setMatrixColValue(matrix, 28, 5, 9, wordColor);
    setMatrixColValue(matrix, 32, 5, 9, wordColor);
    setMatrixRowValue(matrix, 4, 29, 31, wordColor);
    setMatrixRowValue(matrix, 10, 29, 31, wordColor);

    // draw W
    setMatrixValue(matrix, 4, 13, 4, 5, wordColor);
    setMatrixValue(matrix, 5, 18, 4, 2, wordColor);
    setMatrixValue(matrix, 6, 15, 4, 4, wordColor);
    setMatrixValue(matrix, 7, 18, 4, 2, wordColor);
    setMatrixValue(matrix, 8, 13, 4, 5, wordColor);

    // draw O
    setMatrixColValue(matrix, 10, 15, 19, wordColor);
    setMatrixColValue(matrix, 14, 15, 19, wordColor);
    setMatrixRowValue(matrix, 14, 11, 13, wordColor);
    setMatrixRowValue(matrix, 20, 11, 13, wordColor);

    // draw R
    setMatrixColValue(matrix, 16, 14, 20, wordColor);
    setMatrixColValue(matrix, 20, 15, 16, wordColor);
    setMatrixRowValue(matrix, 14, 16, 19, wordColor);
    setMatrixRowValue(matrix, 17, 16, 19, wordColor);
    setMatrixValue(matrix, 16, 16, 3, 4, wordColor);

    // draw L
    setMatrixColValue(matrix, 22, 14, 20, wordColor);
    setMatrixRowValue(matrix, 20, 22, 26, wordColor);

    // draw D
    setMatrixColValue(matrix, 28, 14, 20, wordColor);
    setMatrixColValue(matrix, 32, 15, 19, wordColor);
    setMatrixRowValue(matrix, 14, 29, 31, wordColor);
    setMatrixRowValue(matrix, 20, 29, 31, wordColor);

    // draw !!
    setMatrixValue(matrix, 35, 13, 4, 5, wordColor);
    setMatrixValue(matrix, 36, 13, 4, 5, wordColor);
    matrix[36][20] = wordColor;
    matrix[35][20] = wordColor;

    for (var col = 0; col < matrix.length; col++) {
        matrix[col][0] = borderColor;
        matrix[col][NUM_ROWS - 1] = borderColor;

        if (col === 0 || col === NUM_COLUMNS - 1) {
            for (var row = 0; row < matrix[col].length; row++) {
                matrix[col][row] = borderColor;
            }
        }
    }

    function setMatrixRowValue(matrix, row, colFrom, colTo, value) {
        for (var col = colFrom; col <= colTo; col++) {
            matrix[col][row] = value;
        }
    }
    function setMatrixColValue(matrix, col, rowFrom, rowTo, value) {
        for (var row = rowFrom; row <= rowTo; row++) {
            matrix[col][row] = value;
        }
    }

    /*
      * direction is in clockwise direction staring from 12 o'clock
      * 0: up
      * 1: right up
      * 2: right
      * 3: right down
      * 4: down
      * 5: left down
      * 6: left
      * 7: left up
     */
    function setMatrixValue(matrix, col, row, direction, step, value) {
        for (var i = 0; i < step; i++) {
            switch (direction) {
                case 0:
                    row--;
                    break;
                case 1:
                    row--;
                    col++;
                    break;
                case 2:
                    col++;
                    break;
                case 3:
                    col++;
                    row++;
                    break;
                case 4:
                    row++;
                    break;
                case 5:
                    row++;
                    col--;
                    break;
                case 6:
                    col--;
                    break;
                case 7:
                    row--;
                    col--
                    break;
            }

            matrix[col][row] = value;
        }
    }

    function createMatrix(cols, rows, defaultValue) {
        var arr = [];

        for (var i = 0; i < cols; i++) {
            arr.push([]);
            arr[i].push(new Array(rows));

            for (var j = 0; j < rows; j++) {
                arr[i][j] = defaultValue;
            }
        }
        return arr;
    }

    var generate = function() {
        div.empty();
        triangles = new Triangles(div, $(window).width() - 50, $(window).height(), NUM_ROWS, NUM_COLUMNS, matrix);
    }
    generate();

    $(window).resize(generate);
    $('#sidebar').hover(function() {
        if (triangles) {
            triangles.hide();
        }
    }, function() {
        if (triangles) {
            triangles.show();
        }
    });

    // Lightly mobile
    document.getElementById('sidebar').addEventListener('touchstart', function(e) {
        if (triangles) {
            triangles.hide();
        }
    });
    document.getElementById('sidebar').addEventListener('touchend', function(e) {
        if (triangles) {
            triangles.show();
        }
    });
});