function onOpen(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Go").getRange(2,3).setValue("AI");
  return;
}


function onEdit(e) {
  // programmed by Sean Lowe
  var user = e.range;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = user.getSheet().getName();
  var range = ss.getSheetByName(name).getRange(3, 2, 10, 10)
  
  var userColor = null;
  var aiColor   = null;
  
  // variable for keeping track of the board
  var board = range.getValues();
  
  // variables for checking status of board
  var empty = true;
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
  
  if (empty == false && userColor == null) {
    if (countRed > 0) {
      userColor = "Red";
    }
    else if (countBlue > 0) {
      userColor = "Blue";
    }
  }
  Logger.log("userColor " + userColor);
  ss.getSheetByName(name).getRange(2, 7).setValue(userColor);
  
  // check what color the user wants to play as and set AI as opposite
  // put double check for ai color in 13, 13
  // put double check for user color in 13, 14
  userColor = ss.getSheetByName(name).getRange(2,7).getValue();
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
    while(aiC == userC && aiR == userR) {
      aiC = Math.round(Math.random() * 10);
      aiR = Math.round(Math.random() * 10);
    }
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