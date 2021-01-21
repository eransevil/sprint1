var gBoard;
var gTotalMines;
const BOMB = '💣';
const FLAG = '🚩';
const LIFE = '❤';
const NORMAL = '😊';
const DEAD = '🤯';
const WIN = '😎';
const HINTS = '💡';

var gNumOfHint;
var gIsHintOn;
var gLives;
var gStartSeconds;
var gTimeIntervel;
var gIsClockStart;
var gMarkedCells;
var gIsFirstTurn;
var currBestScore;

var gGame = {
  isOn: false,
  shownCount: 0,
  secsPassed: 0,
  numOfLife: 3,
  numOfHints: 3,
};

var gLevel = {
  size: 0,
  mines: 0,
};

function init() {
  document.querySelector('.bestscore').innerHTML = localStorage.getItem(
    'bestscore'
  );
  gGame.numOfHints = 3;
  document.querySelector('.startMsg').innerHTML =
    'Select a level and start playing ';
  gIsHintOn = false;
  document.querySelector('.smiley').innerHTML = NORMAL;
  gMarkedCells = 0;
  document.querySelector('.score').innerHTML = 0;
  gLevel.size = 0;
  gLevel.mines = 0;
  gGame.numOfLife = 3;
  gGame.isOn = true;
  gIsFirstTurn = true;
  gGame.shownCount = 0;
  gGame.secsPassed = 0;
  gTimeIntervel = null;
  gIsClockStart = false;
  gIsClockStart = false;
  gTotalMines = 0;
  gBoard = null;
  var strLife = '';
  for (var i = 0; i < gGame.numOfLife; i++) {
    strLife += LIFE;
  }
  document.querySelector('.lifes').innerHTML = strLife;
  renderBoard();
  console.log('init');
  displayHints();
  renderBoard();
}
console.log('init');

function createCell() {
  var cell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
  return cell;
}
function buildBoard() {
  gBoard = [];
  var boardLentgh = Math.sqrt(gLevel.size);
  for (var i = 0; i < boardLentgh; i++) {
    gBoard[i] = [];
    for (var j = 0; j < boardLentgh; j++) {
      gBoard[i][j] = createCell();
    }
  }
  return gBoard;
}

function renderBoard() {
  var boardLength = Math.sqrt(gLevel.size);
  var strHTML = '';
  for (var i = 0; i < boardLength; i++) {
    strHTML += '<tr/> ';
    for (var j = 0; j < boardLength; j++) {
      var className = gBoard[i][j].isMine ? 'bomb' : '';
      strHTML += `<td id=cell-${i}-${j} class= "cell ${className} " oncontextmenu="cellMarked(this, ${i},${j});return false;" onclick="cellClicked(this, ${i},${j})" > </td>`;
    }
    ('</tr> ');
  }
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function changeLevel(borderSize, MineNum) {
  restart();
  document.querySelector('.startMsg').innerHTML = '';
  gLevel.size = borderSize;
  gLevel.mines = MineNum;
  buildBoard();
  renderBoard();
}

function setMine(row, col) {
  var numOfMines = gLevel.mines;
  var boardLentgh = Math.sqrt(gLevel.size) - 1;
  var i;
  var j;
  while (numOfMines) {
    i = getRandomInt(0, boardLentgh);
    j = getRandomInt(0, boardLentgh);
    if (row === i && col === j) continue;
    if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
      gBoard[i][j].isMine = true;
      numOfMines--;
    }
  }
}

function setMinesNegsCount(pos) {
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === pos.i && j === pos.j) continue;
      var currCell = gBoard[i][j];
      if (currCell.isMine) {
        gBoard[pos.i][pos.j].minesAroundCount++;
      }
    }
  }
}

function cellClicked(elCell, i, j) {
  console.log('in cellClicked', gIsHintOn);
  if (!gGame.isOn) return;
  if (!gIsClockStart) startTime();
  var location = { i: i, j: j };

  if (gIsHintOn) {
    gGame.numOfHints--;
    expandShown(location);
    setTimeout(function () {
      closeHint(location);
      toggleHint();
      console.log('after settimeout ', gIsHintOn);
    }, 1000);
  }

  var currCell = gBoard[i][j];
  if (currCell.isShown) return;

  if (gIsFirstTurn) {
    setMine(i, j);
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        pos = { i: i, j: j };
        setMinesNegsCount(pos);
      }
    }
    gIsFirstTurn = false;
  }

  if (currCell.minesAroundCount > 0 && !currCell.isMine) {
    //if its a number
    var value = currCell.minesAroundCount;
    //update the model
    if (!gIsHintOn) currCell.isShown = true;
    //update the dom
    renderCell(location, value);
    checkIfUserWin();
  }
  //if its an empty cell
  else if (currCell.minesAroundCount === 0 && !currCell.isMine) {
    expandShown(location);

    checkIfUserWin();
  } else {
    //its a bomb!
    if (gGame.numOfLife > 0) {
      if (!gIsHintOn) alertWarning();
      return;
    }

    elCell.classList.add('clickbomb');
    revelBombs();
    gameOver();
  }
}

function renderCell(location, value) {
  var elCell = document.getElementById(`cell-${location.i}-${location.j}`);
  elCell.innerHTML = value ? value : '';
  if (elCell.isMine && gIsHintOn) elCell.innerHTML = BOMB;
  elCell.classList.add('number-flipped');
  if (gBoard[location.i][location.j].minesAroundCount <= 1)
    elCell.classList.add('safe');
  else if (gBoard[location.i][location.j].minesAroundCount === 2)
    elCell.classList.add('middle');
  else elCell.classList.add('dangerous');
}

function cellMarked(elCell, i, j) {
  if (!gBoard[i][j].isMarked || (gBoard[i][j].isMarked && gIsHintOn)) {
    gBoard[i][j].isMarked = true;
    elCell.innerHTML = FLAG;
    document.querySelector('.score').innerHTML = ++gMarkedCells;
  } else {
    gBoard[i][j].isMarked = false;
    elCell.innerHTML = '';
  }
  checkIfUserWin();
}

function closeHint(location) {
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      var coord = {
        i: i,
        j: j,
      };
      var elCell = document.getElementById(`cell-${coord.i}-${coord.j}`);
      if (!gBoard[coord.i][coord.j].isShown) {
        elCell.innerHTML = '';
        elCell.classList.remove('number-flipped');
        if (gBoard[coord.i][coord.j].minesAroundCount <= 1)
          elCell.classList.remove('safe');
        else if (gBoard[coord.i][coord.j].minesAroundCount === 2)
          elCell.classList.remove('middle');
        else elCell.classList.remove('dangerous');
      }
      if (gBoard[coord.i][coord.j].isMarked)
        cellMarked(elCell, coord.i, coord.j);
    }
  }
}

function expandShown(location) {
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      var currCell = gBoard[i][j];
      if (!gIsHintOn) currCell.isShown = true;
      var value = currCell.minesAroundCount;
      if (gIsHintOn && currCell.isMine) value = BOMB;
      var coord = {
        i: i,
        j: j,
      };
      renderCell(coord, value); //open the negs cell
    }
  }
}

function alertWarning() {
  gGame.numOfLife--;
  var strLife = '';
  for (var i = 0; i < gGame.numOfLife; i++) {
    strLife += LIFE;
    var elMsg = document.querySelector('.msg');
    elMsg.innerHTML = 'BE CAREFUL ! ';
    elMsg.classList.add('failure');
    elMsg.classList.remove('hide');
    document.querySelector('.smiley').innerHTML = DEAD;
    setTimeout(function () {
      elMsg.classList.add('hide');
      elMsg.classList.remove('failure');
      document.querySelector('.smiley').innerHTML = NORMAL;
    }, 1000);
  }
  document.querySelector('.lifes').innerHTML = strLife;
}

function revelBombs() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard[i][j].isShown = true;
        coord = {
          i: i,
          j: j,
        };
        renderCell(coord, BOMB);
      }
    }
  }
}

function gameOver() {
  document.querySelector('.smiley').innerHTML = DEAD;
  gGame.isOn = false;
  clearInterval(gTimeIntervel);
  gTimeIntervel = '';
  var elMsg = document.querySelector('.msg');
  elMsg.innerHTML = 'NEVER MIND, TRY AGAIN !';
  elMsg.classList.add('failure');
  elMsg.classList.remove('hide');
}

function restart() {
  clearInterval(gTimeIntervel);
  gTimeIntervel = '';
  var elMsg = document.querySelector('.msg');
  elMsg.classList.remove('failure');
  elMsg.classList.add('hide');
  document.querySelector('.ct').innerHTML = '';
  init();
}

function checkIfUserWin() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (
        (!gBoard[i][j].isMine && !gBoard[i][j].isShown) || //if there is still a number un shown
        (gBoard[i][j].isMine && !gBoard[i][j].isMarked) //if there is still a bomb un marked
      )
        return;
    }
  }
  declareVictory();
}

function displayHints() {
  var strHint = '';
  for (var i = 0; i < gGame.numOfHints; i++) {
    strHint += HINTS;
  }
  document.querySelector('.hints').innerHTML = strHint;
}

function bestScore() {
  if (typeof Storage !== 'undefined') {
    // Retrieve
    var currScore = document.querySelector('.ct').innerHTML;
    currBestScore = localStorage.getItem('bestscore');
    // Store
    currBestScore = parseInt(currBestScore);
    currScore = parseInt(currScore);
    if (currScore < currBestScore || !currBestScore) {
      localStorage.setItem('bestscore', currScore);
      document.querySelector('.bestscore').innerHTML = currScore;
    }
  } else {
    document.getElementById('result').innerHTML =
      'Sorry, your browser does not support Web Storage...';
  }
}
