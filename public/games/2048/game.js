(function () {
  'use strict';

  var G = window.Game2048;
  var SIZE = G.SIZE;
  var BEST_KEY = 'game2048.best';

  var boardEl = document.getElementById('board');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var undoBtn = document.getElementById('undo');
  var newGameBtn = document.getElementById('new-game');
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayText = document.getElementById('overlay-text');
  var primaryBtn = document.getElementById('overlay-primary');
  var secondaryBtn = document.getElementById('overlay-secondary');

  var state = {
    board: G.createBoard(),
    score: 0,
    best: loadBest(),
    won: false,
    keepPlaying: false,
    over: false,
    history: [],
    merged: [],
    spawned: null
  };

  /* ------------------------------------------------------------- storage */

  function loadBest() {
    try {
      var value = parseInt(window.localStorage.getItem(BEST_KEY), 10);
      return isFinite(value) && value > 0 ? value : 0;
    } catch (err) {
      return 0;
    }
  }

  function saveBest(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch (err) {
      /* storage may be unavailable (private mode) — best score still works in memory */
    }
  }

  /* -------------------------------------------------------------- render */

  function render() {
    var merged = {};
    state.merged.forEach(function (pos) {
      merged[pos[0] + ',' + pos[1]] = true;
    });

    var fragment = document.createDocumentFragment();

    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');

        var value = state.board[r][c];
        if (value) {
          var tile = document.createElement('div');
          var digits = String(value).length;
          tile.className = 'tile tile-' + (value > G.TARGET ? 'super' : value);
          if (digits >= 4) tile.classList.add('long');
          if (digits >= 5) tile.classList.add('xlong');
          if (merged[r + ',' + c]) tile.classList.add('merged');
          if (state.spawned && state.spawned.r === r && state.spawned.c === c) {
            tile.classList.add('new');
          }
          tile.textContent = value;
          cell.appendChild(tile);
        }

        fragment.appendChild(cell);
      }
    }

    boardEl.innerHTML = '';
    boardEl.appendChild(fragment);

    scoreEl.textContent = state.score;
    bestEl.textContent = state.best;
    undoBtn.disabled = state.history.length === 0;
  }

  function bumpScore() {
    scoreEl.classList.remove('bump');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('bump');
  }

  /* --------------------------------------------------------------- moves */

  function handleMove(dir) {
    if (state.over) return;
    if (state.won && !state.keepPlaying) return; // win dialog is open

    var result = G.move(state.board, dir);
    if (!result.moved) return;

    state.history.push({
      board: G.cloneBoard(state.board),
      score: state.score,
      won: state.won,
      keepPlaying: state.keepPlaying,
      over: state.over
    });
    if (state.history.length > 20) state.history.shift();

    state.board = result.board;
    state.score += result.score;
    state.merged = result.merged;
    state.spawned = G.addRandomTile(state.board);

    var justWon = false;
    if (!state.won && G.maxTile(state.board) >= G.TARGET) {
      state.won = true;
      justWon = true;
    }
    state.over = !G.canMove(state.board);

    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }

    render();
    bumpScore();

    if (justWon) {
      showWin();
    } else if (state.over) {
      showOver();
    }
  }

  function undo() {
    if (!state.history.length) return;

    var snapshot = state.history.pop();
    state.board = snapshot.board;
    state.score = snapshot.score;
    state.won = snapshot.won;
    state.keepPlaying = snapshot.keepPlaying;
    state.over = snapshot.over;
    state.merged = [];
    state.spawned = null;

    hideOverlay();
    render();
  }

  function newGame() {
    state.board = G.createBoard();
    G.addRandomTile(state.board);
    G.addRandomTile(state.board);
    state.score = 0;
    state.won = false;
    state.keepPlaying = false;
    state.over = false;
    state.history = [];
    state.merged = [];
    state.spawned = null;

    hideOverlay();
    render();
  }

  /* ------------------------------------------------------------- overlay */

  function showWin() {
    state.keepPlaying = false;
    overlayTitle.textContent = '你赢了！';
    overlayText.textContent = '你合成了 2048。要继续挑战更高分吗？';
    primaryBtn.textContent = '继续游戏';
    secondaryBtn.textContent = '重新开始';
    secondaryBtn.classList.remove('hidden');
    overlay.classList.remove('hidden');
    primaryBtn.focus();
  }

  function showOver() {
    overlayTitle.textContent = '游戏结束';
    overlayText.textContent = '没有可以移动的方块了。';
    primaryBtn.textContent = '再来一局';
    secondaryBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
    primaryBtn.focus();
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
    secondaryBtn.classList.remove('hidden');
  }

  function onPrimary() {
    // Win dialog: "继续游戏" keeps the current board.
    if (!overlay.classList.contains('hidden') && state.won && !state.keepPlaying) {
      state.keepPlaying = true;
      hideOverlay();
      if (state.over) showOver();
      return;
    }
    newGame();
  }

  /* ---------------------------------------------------------------- input */

  var KEY_DIRECTIONS = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    a: 'left',
    d: 'right',
    w: 'up',
    s: 'down'
  };

  window.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'Enter' && !overlay.classList.contains('hidden')) {
      event.preventDefault();
      onPrimary();
      return;
    }

    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    var dir = KEY_DIRECTIONS[key];
    if (!dir) return;

    event.preventDefault();
    handleMove(dir);
  });

  var touchStart = null;

  boardEl.addEventListener('touchstart', function (event) {
    if (event.touches.length !== 1) return;
    touchStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }, { passive: true });

  boardEl.addEventListener('touchend', function (event) {
    if (!touchStart || !event.changedTouches.length) return;

    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // a tap, not a swipe

    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? 'right' : 'left');
    } else {
      handleMove(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  boardEl.addEventListener('touchcancel', function () {
    touchStart = null;
  }, { passive: true });

  undoBtn.addEventListener('click', undo);
  newGameBtn.addEventListener('click', newGame);
  primaryBtn.addEventListener('click', onPrimary);
  secondaryBtn.addEventListener('click', newGame);

  newGame();
})();
