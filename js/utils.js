function toggleHint() {
  gIsHintOn = !gIsHintOn;
  displayHints();
}

function declareVictory() {
  bestScore();
  document.querySelector('.smiley').innerHTML = WIN;
  clearInterval(gTimeIntervel);
  gTimeIntervel = '';
  var elMsg = document.querySelector('.msg');
  elMsg.innerHTML = 'VICTORY !!!';
  elMsg.classList.remove('hide');
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startTime() {
  gIsClockStart = true;
  gStartSeconds = new Date().getTime() / 1000;
  gTimeIntervel = setInterval(display_ct, 100);
}

function display_ct(seconds) {
  var seconds = new Date().getTime() / 1000;

  document.querySelector('.ct').innerHTML = (seconds - gStartSeconds).toFixed(
    0
  );
}
