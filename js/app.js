var gBoard;
var gTotalMines;
const BOMB = '💣';
const FLAG = '🚩';
var gStartSeconds;
var gTimeIntervel;
var gIsClockStart;
var gMarkedCells;

var gGame = {
  isOn: false,
  shownCount: 0,
  secsPassed: 0,
};

var gLevel = {
  size: 0,
  mines: 0,
};

function init() {
  gMarkedCells = 0;
  document.querySelector('.score').innerHTML = 0;
  gLevel.size = 0;
  gLevel.mines = 0;
  gGame.isOn = false;
  gGame.shownCount = 0;
  gGame.secsPassed = 0;
  gTimeIntervel = null;
  gIsClockStart = false;
  gIsClockStart = false;
  gTotalMines = 0;
  gBoard = null;
  renderBoard();
  console.log('init');
}

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
    setMine();
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        pos = { i: i, j: j };
        setMinesNegsCount(pos);
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
  gLevel.size = borderSize;
  gLevel.mines = MineNum;
  buildBoard();
  renderBoard();
}

function setMine() {
  var numOfMines = gLevel.mines;
  var boardLentgh = Math.sqrt(gLevel.size) - 1;
  var i;
  var j;
  while (numOfMines) {
    i = getRandomInt(0, boardLentgh);
    j = getRandomInt(0, boardLentgh);
    if (!gBoard[i][j].isMine) {
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
  if (!gIsClockStart) startTime();
  var location = { i: i, j: j };
  var currCell = gBoard[i][j];
  if (currCell.minesAroundCount > 0 && !currCell.isMine) {
    //if its a number
    var value = currCell.minesAroundCount;
    //update the model
    currCell.isShown = true;
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
    elCell.classList.add('clickbomb');
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
    var elMsg = document.querySelector('.msg');
    elMsg.innerHTML = 'NEVER MIND, TRY AGAIN !';
    elMsg.classList.add('failure');
    elMsg.classList.remove('hide');
  }
}

function expandShown(location) {
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      var currCell = gBoard[i][j];
      currCell.isShown = true;
      var value = currCell.minesAroundCount;
      var coord = {
        i: i,
        j: j,
      };
      renderCell(coord, value); //open the negs cell
    }
  }
}

function renderCell(location, value) {
  var elCell = document.getElementById(`cell-${location.i}-${location.j}`);
  elCell.innerHTML = value ? value : '';
  elCell.classList.add('number-flipped');
  if (gBoard[location.i][location.j].minesAroundCount <= 1)
    elCell.classList.add('safe');
  else if (gBoard[location.i][location.j].minesAroundCount === 2)
    elCell.classList.add('middle');
  else elCell.classList.add('dangerous');
}

function cellMarked(elCell, i, j) {
  if (!gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = true;
    elCell.innerHTML = FLAG;
    document.querySelector('.score').innerHTML = ++gMarkedCells;
  } else {
    gBoard[i][j].isMarked = false;
    elCell.innerHTML = '';
  }
  checkIfUserWin();
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
  clearInterval(gTimeIntervel);
  gTimeIntervel = '';
  console.log('victory!');
  var elMsg = document.querySelector('.msg');
  elMsg.innerHTML = 'VICTORY !!!';
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

// function showMsg(){
//     var elMsg = document.querySelector('.msg')
//        elMsg.innerHTML = 'VICTORY !
//     }
