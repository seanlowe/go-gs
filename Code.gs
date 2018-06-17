// programmed by Sean Lowe
function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet=ss.getSheetByName("Go");
  sheet.getRange(2,3).setValue("Computer");
  var loadingSheet = ss.getSheetByName("Loading...");
  //Set active sheet to the loading sheet and hides the "Go" sheet
  ss.setActiveSheet(loadingSheet);
  sheet.hideSheet();
  //Get values from page to slow down function
  ss.getActiveSheet().getRange(1, 1, loadingSheet.getLastRow(), loadingSheet.getLastColumn()).getValues();
  //Set active sheet back to Main board game sheet, then hides the loading sheet
  ss.setActiveSheet(sheet);
  loadingSheet.hideSheet();
  return;
}

function onEdit(e) {
  var user = e.range;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var currentSheet = user.getSheet().getName();
  var sheet = ss.getSheetByName("Go");
  var range = sheet.getRange(3, 2, 10, 10);
  var devMode = false; //Change this variable to allow edits in protected cells
  
  var userColor = null;
  var aiColor   = null;
  
  // variable for keeping track of the board
  var board = range.getValues();
  
  // variables for checking status of board
  var full  = false;
  
  // running points for each color
  var countRed  = 0;
  var countBlue = 0;
  
  // find where the player moved
  var userR = user.getRow()-3;
  //Logger.log("userR " + userR);
  var userC = user.getColumn()-2;
  //Logger.log("userC " + userC);

  var count = 0;
  var ccCount = 0;
  var cc; // cc - current color
  var aiMove = false;
  var possible = true;
  var temp;
  var empty = true;
  var sel = [];
  var restricted = [[2,2],[2,5],[2,6],[2,8],[2,9],[2,10],[2,11]]; //restricted row-column combos
  var valid = true; //Whether or not move is valid. I.E. not trying to edit something they shouldn't
  
  //Check to ensure user isn't on loading sheet
  //Will also carry over attempted edit and put on main page.
  if(currentSheet != "Go" && !devMode) {
    Logger.log("Not on Go sheet! Currently on '" + currentSheet + "' sheet.");
    for(var i =0; i < restricted.length && valid;i++){
      if(userR+3 == restricted[i][0] && userC+2 == restricted[i][1]) { // Check if move is valid
        valid = false;
        Logger.log("Invalid move. Trying to play at " + (userR+3) +  "," + (userC+2));
      }
    }
    if (userR+3 == 1) { valid = false; Logger.log("Invalid move. Trying to edit first row."); }
    if (valid) {
      for(i = 0; i < board.length && empty; i++){   //Check board status to ensure a game isn't already being played
        for(var j = 0; j < board[i].length && empty; j++){
          if (board[i][j] == "Blue" || board[i][j] == "Red"){ empty = false; Logger.log("Board not empty"); }
        }
      }
      if (!empty) { ui.alert('Game in progress', 'A game appears to be in progress, please clear the board and try again.', ui.ButtonSet.OK); }
      else {
        sheet.getRange(userR+3, userC+2).setValue(e.value);
        Logger.log("Value set on Go at " + (userR+3) + "," + (userC+2));
      }
    } else { 
      ui.alert("Protected Cell", "You are trying to edit a cell that is protected. Edit will be reverted.", ui.ButtonSet.OK);
      Logger.log("Invalid Move. Trying to edit " + (userR+3) +  "," + (userC+2));
    }
    if (e.oldValue != undefined) { ss.getSheetByName(currentSheet).getRange(userR+3, userC+2).setValue(e.oldValue); } else {
      ss.getSheetByName(currentSheet).getRange(userR+3, userC+2).setValue("");
    }
    Logger.log("Replaced original value on loading sheet");
    ss.setActiveSheet(sheet);
    ss.getSheetByName(currentSheet).hideSheet();
    if(!empty){ return; }
    temp = true;
  } else if (!devMode) {
    Logger.log("On Go sheet!");
    for(var i =0; i < restricted.length && valid;i++){
      if(userR+3 == restricted[i][0] && userC+2 == restricted[i][1]) { // Check if move is valid
        valid = false;
        Logger.log("Invalid move. Trying to play at " + (userR+3) +  "," + (userC+2));
      }
    }
    if (userR+3 == 1) { Logger.log("Invalid move. Trying to edit first row."); valid = false; }
    if (!valid) {
      Logger.log("Invalid move. Trying to edit " + (userR+3) +  "," + (userC+2));
      ui.alert("Protected Cell", "You are trying to edit a cell that is protected. Edit will be reverted.", ui.ButtonSet.OK);
      if (e.oldValue == undefined) {
        sheet.getRange(userR+3, userC+2).setValue("");
      } else {
        sheet.getRange(userR+3, userC+2).setValue(e.oldValue);
      }
      Logger.log("Replaced original value on loading sheet");
    }
    temp = true;
  }
  
  if (userR+3 == 2 && userC+2 == 7) {
    clear("board");
    return;
  }
  
  // Get values if the board was updated from editing wrong sheet
  if (temp) { board = range.getValues(); }
  
  // check surroundings to switch surrounded blocks
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      ccCount = count = 0;
      if (board[i][j] != "") {
        cc = board[i][j];
        //Logger.log(cc+";"+i+";"+j);
        if (cc == "Blue") { cc = "Red"; } else { cc = "Blue"; }
        if (i-1 >= 0) { if (board[i-1][j] == cc) ccCount++; } else { count++; }
        if (j-1 >= 0) { if (board[i][j-1] == cc) ccCount++; } else { count++; }
        if (i+1 <= 9) { if (board[i+1][j] == cc) ccCount++; } else { count++; }
        if (j+1 <= 9) { if (board[i][j+1] == cc) ccCount++; } else { count++; }
        if (count + ccCount == 4) { board[i][j] = cc; Logger.log("surround check" + board[i][j]); }
        Logger.log("cc=" + cc + "  ccCount=" + ccCount + "    count="+count); 
      }
    }    
  }
  
  // check if playing against a human or an AI
  var opp = sheet.getRange(2,3).getValue();
  if (opp != "Computer") { return; }
  
  // count current number of red and blue squares on the board
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      if (board[i][j] != "") {             // check if spot is empty before checking color
        if (board[i][j] == "Red") {  countRed++;  }
        else if (board[i][j] == "Blue") {  countBlue++;  }
      }
    }
  }
  var userScore, aiScore;
  
  //Logger.log("countRed " + countRed);
  //Logger.log("countBlue " + countBlue);
  //Logger.log("empty = " + empty);
  
  // first move will set chosen color to color played by user
  userColor = sheet.getRange(2,7).getValue();
  if (countRed + countBlue == 1) {
    userColor = e.value;  
    sheet.getRange(2, 7).setValue(userColor);
    Logger.log("userColor " + userColor);
  }
  
  // check what color the user wants to play as and set AI as opposite and assign score values
  if (userColor == "Red") { 
    aiColor = "Blue";
    userScore = countRed;
    aiScore = countBlue;
  } else if (userColor == "Blue") {
    aiColor = "Red";
    userScore = countBlue;
    aiScore = countRed;
  }
  
  // make sure you use the correct color
  if (e.value != userColor) {
    board[userR][userC] = userColor;
    Logger.log("wrong color check");
  }
  
  // no switching user color to ai color or deleting
  if (e.oldValue == userColor && e.oldValue != "" && e.oldValue != undefined) {
    board[userR][userC] = userColor;
    range.setValues(board);
    Logger.log("ai->user switch");
    return;
  }
  
  // no switching ai color to user color or deleting
  //Logger.log(e.oldValue);
  if (e.oldValue != userColor && e.oldValue != "" && e.oldValue != undefined) {
    board[userR][userC] = aiColor;
    range.setValues(board);
    Logger.log("ai<-user switch");
    return;
  }
  
  var aiR = userR;
  var aiC = userC;
  
  // check if board has any empty spots
  if (countRed + countBlue >= 100) { full = true; }
  
  // check who won
  var winner = "";
  if (full) {
    if (countRed > countBlue) { winner = "Red"; }
    else if (countBlue > countRed) { winner = "Blue"; }
    else { winner = "Tie"; }
  }
  
  // different winner scenarios
  var scores;
  if (winner != "") {
    if (winner == "Tie") {
      sheet.getRange(1, 10).setValue(sheet.getRange(1, 10).getValue()+1);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("It's a Tie!", "You tied with the AI. Press OK to reset the board.", ui.ButtonSet.OK);
      clear();
      return;
    }
    
    if (winner == userColor) {
      scores = sheet.getRange(1, 8, 1, 3).getValues();
      scores[0][0]++;
      scores[0][2]++;
      sheet.getRange(1, 8, 1, 3).setValues(scores);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("You Won!", "You beat the AI. Press OK to reset the board.", ui.ButtonSet.OK);
      clear();
      return;
    }
    else {
      scores = sheet.getRange(1, 6, 1, 5).getValues();
      scores[0][0]++;
      scores[0][4]++;
      sheet.getRange(1, 6, 1, 5).setValues(scores);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("Oh No!", "The AI beat you. Press OK to reset the Board.", ui.ButtonSet.OK);
      clear();
      return;
    }
  }
  
  // if board is still empty, do nothing
  if (countRed + countBlue == 0) { return; }
  
  // have AI check surroundings so it doesn't lose blocks
  for (var l = 0; l < 2 && aiMove == false; l++) {
    if (l == 1) { temp = aiScore; aiScore = userScore; userScore = temp; }
    for (var k = 3; k > 0 && aiMove == false; k--) {
      for (i = 0; i < board.length && aiMove == false; i++) {
        for (j = 0; j < board[i].length && aiMove == false; j++) {
          possible = true;
          ccCount = count = 0;
          if (aiScore >= userScore) {
            if (board[i][j] == userColor) {
              if (i-1 >= 0) { if (board[i-1][j] == aiColor) { ccCount++; } else if (board[i-1][j] == userColor) { possible = false; } else { sel = [i-1,j]; } } else { count++; }
              if (j-1 >= 0) { if (board[i][j-1] == aiColor) { ccCount++; } else if (board[i][j-1] == userColor) { possible = false; } else { sel = [i,j-1]; } } else { count++; }
              if (i+1 <= 9) { if (board[i+1][j] == aiColor) { ccCount++; } else if (board[i+1][j] == userColor) { possible = false; } else { sel = [i+1,j]; } } else { count++; }
              if (j+1 <= 9) { if (board[i][j+1] == aiColor) { ccCount++; } else if (board[i][j+1] == userColor) { possible = false; } else { sel = [i,j+1]; } } else { count++; }
              if (count + ccCount == k && possible) { board[sel[0]][sel[1]] = aiColor; aiMove = true; Logger.log("fuck your chicken strips aggressively " + sel[0] + sel[1] +  board[i][j]); }
            }
          } else {
            if (board[i][j] == aiColor) {
              if (i-1 >= 0) { if (board[i-1][j] == userColor) { ccCount++; } else if (board[i-1][j] == aiColor) { possible = false; } else { sel = [i-1,j]; } } else { count++; }
              if (j-1 >= 0) { if (board[i][j-1] == userColor) { ccCount++; } else if (board[i][j-1] == aiColor) { possible = false; } else { sel = [i,j-1]; } } else { count++; }
              if (i+1 <= 9) { if (board[i+1][j] == userColor) { ccCount++; } else if (board[i+1][j] == aiColor) { possible = false; } else { sel = [i+1,j]; } } else { count++; }
              if (j+1 <= 9) { if (board[i][j+1] == userColor) { ccCount++; } else if (board[i][j+1] == aiColor) { possible = false; } else { sel = [i,j+1]; } } else { count++; }
              if (count + ccCount == k && possible) { board[sel[0]][sel[1]] = aiColor; aiMove = true; Logger.log("fuck your chicken strips defensively " + sel[0] + sel[1] + board[i][j]); }
            }
          }
        }
      }
    }
  }
  // if player has made a move, then make AI make a move
  if (!aiMove) {
    var current = false;
    if (countRed > 0 || countBlue > 0) {
      while(!current) {
        aiC = Math.round(Math.random() * 9);
        aiR = Math.round(Math.random() * 9);
        Logger.log("aiC = " + aiC + "            " + " aiR = " + aiR);
        if (board[aiR][aiC] == "") { current = true; }
      }
      board[aiR][aiC] = aiColor;
    }
  }
  
  // check surroundings to switch surrounded blocks
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      ccCount = count = 0;
      if (board[i][j] != "") {
        cc = board[i][j];
        //Logger.log(cc+";"+i+";"+j);
        if (cc == "Blue") { cc = "Red"; } else { cc = "Blue"; }
        if (i-1 >= 0) { if (board[i-1][j] == cc) ccCount++; } else { count++; }
        if (j-1 >= 0) { if (board[i][j-1] == cc) ccCount++; } else { count++; }
        if (i+1 <= 9) { if (board[i+1][j] == cc) ccCount++; } else { count++; }
        if (j+1 <= 9) { if (board[i][j+1] == cc) ccCount++; } else { count++; }
        if (count + ccCount == 4) { board[i][j] = cc; Logger.log("surround check" + board[i][j]); }
        Logger.log("cc=" + cc + "  ccCount=" + ccCount + "    count="+count); 
      }
    }    
  }
  if (aiColor == "Red") { 
  countRed++;
  } else {
  countBlue++;
  }
  
   // check if board has any empty spots
  if (countRed + countBlue >= 100) { full = true; }
  
  // check who won
  var winner = "";
  if (full) {
    if (countRed > countBlue) { winner = "Red"; }
    else if (countBlue > countRed) { winner = "Blue"; }
    else { winner = "Tie"; }
  }
  
  // different winner scenarios
  var scores;
  if (winner != "") {
    if (winner == "Tie") {
      sheet.getRange(1, 10).setValue(sheet.getRange(1, 10).getValue()+1);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("It's a Tie!", "You tied with the AI. Press OK to reset the board.", ui.ButtonSet.OK);
      clear();
      return;
    }
    
    if (winner == userColor) {
      scores = sheet.getRange(1, 8, 1, 3).getValues();
      scores[0][0]++;
      scores[0][2]++;
      sheet.getRange(1, 8, 1, 3).setValues(scores);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("You Won!", "You beat the AI. Press OK to reset the board.", ui.ButtonSet.OK);
      clear();
      return;
    }
    else {
      scores = sheet.getRange(1, 6, 1, 5).getValues();
      scores[0][0]++;
      scores[0][4]++;
      sheet.getRange(1, 6, 1, 5).setValues(scores);
      sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
      range.setValues(board);
      range.getValues();
      ui.alert("Oh No!", "The AI beat you. Press OK to reset the Board.", ui.ButtonSet.OK);
      clear();
      return;
    }
  }
  range.setValues(board);
  sheet.getRange("I2:K2").setValues([[countRed,"Blue Score:",countBlue]]);
  return;
    
  
} // end of onEdit function

// function to clear the board of all played positions and reset playing options
function clear(string) {
  //Logger.log("reached the clear() function");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName("Go").getRange("B3:K12").clearContent();
  ss.getSheetByName("Go").getRange("I2").clearContent();
  ss.getSheetByName("Go").getRange("K2").clearContent();
  if (string != "board") {
    ss.getSheetByName("Go").getRange(2, 3).setValue("");
    ss.getSheetByName("Go").getRange(2, 7).setValue("");
  }
  ss.getSheetByName("Go").getRange(2,3).setValue("Computer");
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