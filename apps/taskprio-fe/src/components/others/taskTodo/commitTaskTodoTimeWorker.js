let count = -1;

function tick() {
  count++;
  if ( count > 0 ) {
      postMessage(count);
  }
  setTimeout(tick, 60000);
}

tick();