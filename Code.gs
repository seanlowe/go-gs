// programmed by Sean Lowe
function onOpen(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Go").getRange(2,3).setValue("AI");
  return;
}

function onEdit(e) {
  var user = e.range;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = user.getSheet().getName();
  var range = ss.getSheetByName(name).getRange(3, 2, 10, 10)
  
  var userColor = null;
  var aiColor   = null;
  
  // variable for keeping track of the board
  var board = range.getValues();
  
  // variables for checking status of board
  var empty = true;           // might be redundant
  var full  = true;
  
  // running points for each color
  var countRed  = 0;
  var countBlue = 0;
  
  // check if playing against a human or an AI
  var opp = ss.getSheetByName(name).getRange(2,3).getValue();
  if (opp != "AI") { return; }
  
  // count current number of red and blue squares on the board
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      if (board[i][j] != "") {             // check if spot is empty before checking color
        empty = false;
        if (board[i][j] == "Red") {  countRed++;  }
        else if (board[i][j] == "Blue") {  countBlue++;  } // HAS TO ACCOUNT FOR EMPTY SPACES
      }
    }
  }
  
  Logger.log("countRed " + countRed);
  Logger.log("countBlue " + countBlue);
  Logger.log("empty = " + empty);
  
  // if a move has been made but the user did not set their color, set it for them
  userColor = ss.getSheetByName(name).getRange(2,7).getValue();
  if (countRed == 1 || countBlue == 1) {
    userColor = e.value;
  } 
  ss.getSheetByName(name).getRange(2, 7).setValue(userColor);
  Logger.log("userColor " + userColor);
  
  // check what color the user wants to play as and set AI as opposite
  // put double check for ai color in 13, 13
  // put double check for user color in 13, 14
  ss.getSheetByName(name).getRange(13, 14).setValue(userColor);
  if (userColor == "Red") { 
    aiColor = "Blue"; 
  } else if (userColor == "Blue") {
    aiColor = "Red";
  }
  ss.getSheetByName(name).getRange(13, 13).setValue(aiColor);
  
  // find where the player moved
  var userR = user.getRow();
  Logger.log("userR " + userR);
  var userC = user.getColumn();
  Logger.log("userC " + userC);
  
  var aiR = userR;
  var aiC = userC;
  
  // check if board has any empty spots
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j] == ""){  full = false;  }
    }
  }
  
  // if board is still empty, do nothing
  if (empty) { return; }
  
  // if player has made a move, then make AI make a move
  if (countRed > 0 || countBlue > 0) {
    while(aiC == userC && aiR == userR && board[aiR][aiC] == "") {
      aiC = Math.round(Math.random() * 10);
      aiR = Math.round(Math.random() * 10);
    }
    board[aiR][aiC] = aiColor;
    range.setValues(board);
    
    // check corners
    if (board[0][0] != "") { // top left corner
      if (board[0][0] == "Blue")
        if (board[1][0] == "Red" && board[0][1] == "Red") {  board[0][0] = "Red";  }
      if (board[0][0] == "Red") {
        if (board[1][0] == "Blue" && board[0][1] == "Blue") {  board[0][0] = "Blue";  }
      }
    }
    if (board[0][9] != "") { // top right corner
      //if () {}    
    }
    if (board[9][0] != "") { // bottom left corner
      //if () {}
    }
    if (board[9][9] != "") { // bottom right corner
      //if () {}
    }
    if (true) { // along top
      
    }
    if (1) { // along right
      
    }
    if (1) { // along bottom
      
    }
    if (1) { // along left
      
    }
    // somewhere in the middle
    for (i = 1; i < board.length-1; i++) {      // makes sure you start in second row & column
      for (j = 1; j < board.length-1; j++) {    // and end in the second-to-last row & column
        if (board[i][j] == "Red"
            && board[i-1][j] == "Blue"    // up one
            && board[i+1][j] == "Blue"    // down one
            && board[i][j-1] == "Blue"    // left one
            && board[i][j+1] == "Blue") { // right one
          board[i][j] = "Blue";
        }
        if (board[i][j] == "Blue"
            && board[i-1][j] == "Red"
            && board[i+1][j] == "Red"
            && board[i][j-1] == "Red"
            && board[i][j+1] == "Red") { 
          board[i][j] = "Red";
        }
      }
    }
    return;
  }
}

// function to clear the board of all played positions and reset playing options
function clear(e) {
  Logger.log("reached the clear() function");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Go").getRange("B3:K12").clearContent();
  ss.getSheetByName("Go").getRange(2, 3).setValue("");
  ss.getSheetByName("Go").getRange(2, 7).setValue("");
  ss.getSheetByName("Go").getRange(13, 13).setValue("");
  ss.getSheetByName("Go").getRange(13, 14).setValue("");
  onOpen(e);
  return;
}

/* Rules of Go */
// The board is empty at the onset of the game (unless players agree to place a handicap).
// Black makes the first move, after which White and Black alternate.
// A move consists of placing one stone of one's own color on an empty intersection on the board.
// A player may pass their turn at any time.
// A stone or solidly connected group of stones of one color is captured and removed from the board when all the intersections directly adjacent to it are occupied by the enemy. (Capture of the enemy takes precedence over self-capture.)
// No stone may be played so as to recreate a former board position.
// Two consecutive passes end the game.
// A player's area consists of all the points the player has either occupied or surrounded.
// The player with more area wins.