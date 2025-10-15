let count = 0;

function tick() {
  if ( count === 59 ) {
    count = 0
  } else {
    count++;
  }
  postMessage(count);
  setTimeout(tick, 1000);
}

tick();