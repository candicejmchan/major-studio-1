var buttons = [
  "Africa", "Zimbabwe", "Zambia", "Ghana",
  "Chad", "Nigeria", "Madagascar"
],
  word = buttons[0], buttonX = 70, over, data, kwic, input;

function preload() {

  data = loadStrings('UNDP.txt');
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  // createCanvas(1000, 800);
  textFont('Lato');
  textSize(16);
  fill(0);

  updateKWIC();
}

function updateKWIC() {

  kwic = RiTa.kwic(data.join(' '), word, {
    ignorePunctuation: true,
    ignoreStopWords: true,
    wordCount: 10
  });

  background('lightblue');

  drawButtons();

  if (kwic.length == 0) {

    textAlign(CENTER);
    text("Oops, word not found", width / 2, height / 2);

  } else {

    var tw = textWidth(word) / 2;

    for (var i = 0; i < kwic.length; i++) {

      //console.log(display[i]);
      var parts = kwic[i].split(word);
      var x = width / 2,
        y = i * 30 + 100;

      if (y > height - 20) return;

      fill(0);
      textAlign(RIGHT);
      text(parts[0], x - tw, y);

      fill('#EE8033');
      textAlign(CENTER);
      text(word, x, y);
      
      push();
      textSize(460); 
      fill(255,20);
      noStroke();
      text(kwic.length, width/2, height * 0.70);
      pop();
      

      fill(0);
      textAlign(LEFT);
      text(parts[1], x + tw, y);
    }
  }
}

function drawButtons() {

  var posX = buttonX, posY = 40;

  for (var i = 0; i < buttons.length; i++) {

    stroke(200);
    var on = word == (buttons[i]) ? true : false;
    var tw = textWidth(buttons[i]);
    fill(!on && buttons[i] == over ? 235 : 255);
    // rect(posX - 5, 24, tw + 10, 20, 7);
    fill((on ? 250 : 275), 275, 275);
    text(buttons[i], posX, 40);
    posX += tw + 20;
  }
}

function inside(mx, my, posX, tw) {

  return (mx >= posX - 5 && mx <= posX + tw + 5 && my >= 25 && my <= 44);
}

function mouseMoved() {

  over = null;
  var posX = buttonX, tw;

  for (var i = 0; i < buttons.length; i++) {

    tw = textWidth(buttons[i]);

    if (inside(mouseX, mouseY, posX, tw)) {

      over = buttons[i];
      break;
    }
    posX += tw + 20;
  }
}

function mouseClicked() {

  var posX = buttonX, tw;

  for (var i = 0; i < buttons.length; i++) {

    tw = textWidth(buttons[i]);

    if (inside(mouseX, mouseY, posX, tw)) {

      word = buttons[i];
      kwic = null;
      updateKWIC();
      break;
    }
    posX += tw + 20;
  }
}

 //My Next Steps:
 // 1. Return each sentence so that it is a complete sentence from the beginning to the punctuation. Tried to add the following code to integrate with what I have:
//   
// allText = data.join(" "); // turn it into one string
//     sentences = RiTa.splitSentences(allText); // split it into simple sentence

// function draw() {
//     drawSentences(sentenceIndex);
//     sentenceIndex++;
// }
// function updateKWIC() {
//     for (let i = 0; i < sentences.length; i++) {
//             kwic = RiTa.kwic(sentences[i], word, { //change sentence into keyword
//                 ignorePunctuation: true,
//                 ignoreStopWords: true,
//        

 // 2. Right now, the word "Africa" may be highlighted but variations of the word, such as "African" are not.

//Reference: rednoise Kwic model 