var zahl;
var wuerfel = [[0, false], [0, false], [0, false], [0, false], [0, false]];
var fields = ["playername", "einser", "zweier", "dreier", "vierer", "fuenfer", "sechser", "summe", "bonus", "dreierpasch", "viererpasch", "fullhouse", "kleinestrasse", "grossestrasse", "yatzie", "chance", "gesamt"];
var rolled = false;

// Pending Points
var pPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var turn = 1;

/************
* 0 = Playername
* 1 = 1er
* 2 = 2er
* 3 = 3er
* 4 = 4er
* 5 = 5er
* 6 = 6er
* 7 = Summe
* 8 = Bonus
* 9 = Dreier
* 10 = Vierer
* 11 = FH
* 12 = KS
* 13 = GS
* 14 = Yatzie
* 15 = Chance
* 16 = Gesamt
***************/

// Final Points
var fPoints = []; // Array for every player, object in every array-index

var totalPlayers = 1;
var activePlayer = 0;

function rollDice() {
	if(turn <= 300) {
		for(var i = 0; i < wuerfel.length; i += 1) {
			if(!wuerfel[i][1]) {
				zahl = Math.floor(Math.random() * 6 + 1);
				wuerfel[i][0] = zahl;
				document.getElementById("wuerfel" + i).innerHTML = zahl;
			}
		}
		turn++;
	}
	rolled = true;
	checkOptions();
}

function toggleKeep(wuerfelID) {
	if(rolled) {
		if(!wuerfel[wuerfelID][1]) {
			wuerfel[wuerfelID][1] = true;
			document.getElementById("wuerfel" + wuerfelID).style.backgroundColor = "blue";
		}
		else {
			wuerfel[wuerfelID][1] = false;
			document.getElementById("wuerfel" + wuerfelID).style.backgroundColor = "green";
		}
	}
}

function initPlayer(playerCount) {
	var counter = 0;
	for(var x = 0; x < totalPlayers+1; x++) {
		var newPlayer = document.createElement("div");
		newPlayer.id = "playerContainer" + x;
		newPlayer.className = "playerContainer";
		newPlayer.style.left = 100 + 100*x + "px";
		
		document.body.appendChild(newPlayer);

		for(var i = 0; i < fields.length; i++) {
			var field = document.createElement("div");
			field.id = "field" + counter;
			field.style.position = "absolute";
			field.style.width = "100px";
			field.style.height = "30px";
			field.style.top = (30 * i) + "px";
			field.style.lineHeight = "30px";
			field.style.textAlign = "center";
			
			newPlayer.appendChild(field);
			
			if(counter != 7 && counter != 8 && counter != 16) {
				field.onclick = function() {
					if(rolled) {
						clickedWhat(this);
					}
				}
			}
			counter++;
		}
		document.getElementById("field" + (fields.length*x)).innerHTML = "Player " + (x + 1);
		fPoints[x] = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
	}
}

function clickedWhat(div) {
	var boxID = div.id.substring(5);
	var field = document.getElementById("field" + boxID);
	field.className = "takenPoints";

	fPoints[activePlayer][boxID - 17 * activePlayer] = field.innerHTML;

	// Erase pending points
	for(var i = 1; i < fields.length; i++) {
		if(i != boxID && fPoints[activePlayer][i] == null) {
			document.getElementById("field"+(activePlayer*17+i)).innerHTML = "";
		}
	}
	addPoints();
	nextPlayer();
}

function addPoints() {
	var numberPoints = 0;
	var finalPoints = 0;
	for(var i = 0; i < fPoints[activePlayer].length; i++) {
		if(fPoints[activePlayer][i] != null) {
			if(i < 7) {
				numberPoints += parseInt(fPoints[activePlayer][i]);
			}
			if(numberPoints >= 63) {
				fPoints[activePlayer][8] = 35;
				document.getElementById("field"+(8 + 17 * activePlayer)).innerHTML = 35;
			}
			finalPoints += parseInt(fPoints[activePlayer][i]);
		}
	}
	document.getElementById("field"+(7 + 17 * activePlayer)).innerHTML = numberPoints;
	document.getElementById("field"+(16 + 17 * activePlayer)).innerHTML = finalPoints;
}

function checkOptions() {
	for(var i = 0; i < pPoints.length; i++) {
		pPoints[i] = 0;
	}
	// Check numbers
	for(var i = 0; i < wuerfel.length; i++) {
		if(wuerfel[i][0] == 1) {
			pPoints[0] += 1;
		}
		else if(wuerfel[i][0] == 2) {
			pPoints[1] += 2;
		}
		else if(wuerfel[i][0] == 3) {
			pPoints[2] += 3;
		}
		else if(wuerfel[i][0] == 4) {
			pPoints[3] += 4;
		}
		else if(wuerfel[i][0] == 5) {
			pPoints[4] += 5;
		}
		else if(wuerfel[i][0] == 6) {
			pPoints[5] += 6;
		}
	}

	pPoints[14] = fullDiceValue();
	checkEquals();
	checkFullHouse();
	checkStreets();
	checkYatzie();

	for(var j = 0; j < pPoints.length; j++) {
		if(fPoints[activePlayer][j+1] == null && j != 6 && j != 7 && j != 15) {
			document.getElementById("field"+(activePlayer*17+j+1)).innerHTML = pPoints[j];
		}
	}
}

function checkYatzie() {
	for(var i = 0; i < wuerfel.length; i++) {
		if(wuerfel[i][0] != wuerfel[0][0]) {
			pPoints[13] = 0;
			return;
		}
	}
	pPoints[13] = 50;
}

function checkEquals() {
	var equals = [1, null];
	for(var i = 0; i < wuerfel.length; i++) {
		for(var j = 0; j < wuerfel.length; j++) {
			if(i != j && wuerfel[i][0] == wuerfel[j][0]) {
				equals[0]++;
				equals[1] = wuerfel[i][0];
			}
			if(j == wuerfel.length - 1 && equals[0] < 4) {
				equals= [1, null];
			}
			else if(equals[0] >= 4) {
				pPoints[9] = fullDiceValue();
			}
			else if(equals[0] >= 3) {
				pPoints[8] = fullDiceValue();
			}
		}
	}
}

function checkFullHouse() {
	var firstEquals = [1, null];
	var secondEquals = [1, null];
	for(var i = 0; i < wuerfel.length; i++) {
		for(var j = 0; j < wuerfel.length; j++) {
			if(i != j) {
				// Something
			}
			if(i != j && wuerfel[i][0] == wuerfel[j][0]) {
				firstEquals[0]++;
				firstEquals[1] = wuerfel[i][0];
			}
			if(j == wuerfel.length - 1 && firstEquals[0] < 3) {
				firstEquals = [1, null];
			}
		}
		if(firstEquals[0] >= 3) {
			break;
		}
	}
	for(var i = 0; i < wuerfel.length; i++) {
		for(var j = 0; j < wuerfel.length; j++) {
			if(i != j && wuerfel[i][0] == wuerfel[j][0] && wuerfel[i][0] != firstEquals[1]) {
				secondEquals[0]++;
				secondEquals[1] = wuerfel[i][0];
			}
			if(j == wuerfel.length - 1 && secondEquals[0] < 2) {
				secondEquals = [1, null];
			}
		}
		if(secondEquals[0] >= 2) {
			break;
		}
	}
	if(firstEquals[0] >= 3 && secondEquals[0] >= 2) {
		pPoints[10] = 25;
	}
}

function fullDiceValue() {
	var total = 0;
	for(var i = 0; i < wuerfel.length; i++) {
		total += wuerfel[i][0];
	}
	return total;
}

function inArray(value, array) {
	for(var i = 0; i < array.length; i++) {
		if(array[i] == value) {
			return true;
		}
	}
	return false;
}

function checkStreets() {
	var street = [];
	for (var i = 0; i < wuerfel.length; i++) {
		if (inArray(wuerfel[i][0], street)) {
			street.push(wuerfel[i][0]);
		}
	}
	if ((inArray(3, street) && inArray(4, street)) &&
		((inArray(1, street) && inArray(2, street)) || (inArray(2, street) && inArray(5, street)) || (inArray(5, street) && inArray(6, street)))) {
		pPoints[11] = 30;
	}
	if ((inArray(2, street) && inArray(3, street) && inArray(4, street) && inArray(5, street)) && (inArray(1, street) || inArray(6, street))) {
		pPoints[12] = 40;
	}
}

function nextPlayer() {
	if(activePlayer < totalPlayers) {
		activePlayer++;
	}
	else {
		activePlayer = 0;
	}
	for(var i = 0; i < totalPlayers+1; i++) {
		if(i == activePlayer) {
			document.getElementById("playerContainer" + i).className = "playerContainer active";
		}
		else {
			document.getElementById("playerContainer" + i).className = "playerContainer";
		}
	}
	for(var j = 0; j < wuerfel.length; j++) {
		wuerfel[j][1] = false;
		document.getElementById("wuerfel" + j).style.backgroundColor = "green";
	}
	rolled = false;
	turn = 1;
}
