/*
 * 2048 core logic — no DOM, usable in the browser or in Node.
 * Board: 4x4 array of numbers, 0 means empty. Moves are toward the
 * beginning of each line (index 0), so "left" is the natural direction.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Game2048 = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SIZE = 4;
  var TARGET = 2048;
  var DIRECTIONS = ['left', 'right', 'up', 'down'];

  function createBoard() {
    var board = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) row.push(0);
      board.push(row);
    }
    return board;
  }

  function cloneBoard(board) {
    return board.map(function (row) { return row.slice(); });
  }

  /** Place a 2 (90%) or 4 (10%) on a random empty cell. */
  function addRandomTile(board, rng) {
    var random = rng || Math.random;
    var empty = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) empty.push([r, c]);
      }
    }
    if (!empty.length) return null;

    var cell = empty[Math.floor(random() * empty.length)];
    var value = random() < 0.9 ? 2 : 4;
    board[cell[0]][cell[1]] = value;
    return { r: cell[0], c: cell[1], value: value };
  }

  /** Collapse a single line toward index 0. */
  function slideLine(line) {
    var values = line.filter(function (v) { return v !== 0; });
    var merged = [];
    var mergedIndices = [];
    var score = 0;

    for (var i = 0; i < values.length; i++) {
      if (i + 1 < values.length && values[i] === values[i + 1]) {
        var value = values[i] * 2;
        merged.push(value);
        mergedIndices.push(merged.length - 1);
        score += value;
        i++;
      } else {
        merged.push(values[i]);
      }
    }

    while (merged.length < SIZE) merged.push(0);
    return { line: merged, score: score, mergedIndices: mergedIndices };
  }

  function getLine(board, index, dir) {
    var line = [];
    for (var i = 0; i < SIZE; i++) {
      if (dir === 'left') line.push(board[index][i]);
      else if (dir === 'right') line.push(board[index][SIZE - 1 - i]);
      else if (dir === 'up') line.push(board[i][index]);
      else line.push(board[SIZE - 1 - i][index]);
    }
    return line;
  }

  function setLine(board, index, dir, line) {
    for (var i = 0; i < SIZE; i++) {
      if (dir === 'left') board[index][i] = line[i];
      else if (dir === 'right') board[index][SIZE - 1 - i] = line[i];
      else if (dir === 'up') board[i][index] = line[i];
      else board[SIZE - 1 - i][index] = line[i];
    }
  }

  function cellFor(index, i, dir) {
    if (dir === 'left') return [index, i];
    if (dir === 'right') return [index, SIZE - 1 - i];
    if (dir === 'up') return [i, index];
    return [SIZE - 1 - i, index];
  }

  /**
   * Apply a move.
   * @returns {{board:number[][], moved:boolean, score:number, merged:number[][]}}
   */
  function move(board, dir) {
    if (DIRECTIONS.indexOf(dir) === -1) throw new Error('Unknown direction: ' + dir);

    var next = cloneBoard(board);
    var moved = false;
    var score = 0;
    var merged = [];

    for (var index = 0; index < SIZE; index++) {
      var line = getLine(next, index, dir);
      var result = slideLine(line);

      for (var i = 0; i < SIZE; i++) {
        if (result.line[i] !== line[i]) moved = true;
      }
      score += result.score;

      result.mergedIndices.forEach(function (i) {
        var pos = cellFor(index, i, dir);
        merged.push(pos);
      });

      setLine(next, index, dir, result.line);
    }

    return { board: next, moved: moved, score: score, merged: merged };
  }

  function canMove(board) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) return true;
        if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
        if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
      }
    }
    return false;
  }

  function maxTile(board) {
    var max = 0;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (board[r][c] > max) max = board[r][c];
      }
    }
    return max;
  }

  return {
    SIZE: SIZE,
    TARGET: TARGET,
    createBoard: createBoard,
    cloneBoard: cloneBoard,
    addRandomTile: addRandomTile,
    slideLine: slideLine,
    move: move,
    canMove: canMove,
    maxTile: maxTile
  };
});
