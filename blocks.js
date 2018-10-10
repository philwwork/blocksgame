/* 

© Copyright 2018 Phillip Walters, All Rights Reserved.

HTML, CSS, and Javascript programmed by Phillip Walters.*/

var score=0;
var started=false;

var redBlock=1;
var blueBlock=2;
var greenBlock=3;
var purpleBlock=4;
var orangeBlock=5;
var dottedBlock=8;
var emptyBlock=9;






// The shapeset will be part of the tetradModel object.

// Each string array represents a tetrad shape.
// Each digit or space in a string array represents a pixel in the shape.

// The digit corresponds to ".tStyleN" in the blocks.css file, where 'N' is the digit.
// The value of 'N' determines the color (and css) for the pixel.
var tetradModel = Object.create(null);
tetradModel.shapeDictionary={
type1: 		[[" 11",
              "11 "],

	         ["1 ",
              "11",
              " 1"]],

type2:      [["2",
              "2",
              "2",
              "2"],

	         ["2222"]],

type3:      [["33 ",
              " 33"],

             [" 3",
              "33",
              "3 "]],

type4:      [[" 4 ",
              "444"],

 			 [" 4",
              "44",
              " 4"],

			 ["444",
              " 4 "],

             ["4 ",
              "44",
              "4 "]],

type5:      [["55",
              "55"]],

type6:      [["666",
              "6  "],

		     ["6 ",
              "6 ",
              "66"],
             
		     ["  6",
              "666"],
             
             ["66",
              " 6",
              " 6"]],

type7:      [["777",
              "  7"],

			 ["77",
              "7 ",
              "7 "],

	      	 ["7  ",
              "777"],

			 [" 7",
              " 7",
              "77"]]

};


// lastly I want to convert the idiosyncratic strings into a more traditional form
// of matrix data to be fed to functions, while maintaining the strings for easy visual tweaking.
tetradModel.getShape=function(type,rotation)
{
	return this.shapeDictionary[type][rotation];
}


var caption = document.getElementById("caption");
var over;

var boardProto={};

boardProto.width=0;
boardProto.height=0;
boardProto.tableModel = null;
boardProto.writeShape = function(a,b,shape)
{
	// a,b are offsets within the tableModel.

	// Constraints:
	// 0<=a<=(boardWidth-1)-shapeWidth
	// 0<=b<=(boardHeight-1)-shapeHeight

	for (var j=0; j<shape.length; j++)
	{
		for (var i=0; i<shape[j].length; i++)
		{
			var pixelType = shape[j][i];
			
			if (pixelType==" ") continue;			
			
			this.writePixel(i+a,j+b,pixelType);

		}
	}
}

boardProto.eraseShape = function(a,b,shape)
{
	// a,b are offsets within the tableModel.

	// Constraints:
	// 0<=a<=(boardWidth-1)-shapeWidth
	// 0<=b<=(boardHeight-1)-shapeHeight

	for (var j=0; j<shape.length; j++)
	{
		for (var i=0; i<shape[j].length; i++)
		{
			var pixelType = shape[j][i];
			
			if (pixelType==" ") continue;			
			
			this.writePixel(i+a,j+b,emptyBlock);

		}
	}
}

boardProto.fill = function(pixelType)
{
	for (var i=0;i<this.width;i++)
	{
		for (var j=0; j<this.height;j++)
		{
			this.writePixel(i,j,pixelType);
		}
	}
}

boardProto.eraseBoard = function()
{
	this.fill(9);
}

boardProto.writePixel=function(a,b,pixelType)
{
	this.tableModel.rows[b].cells[a].setAttribute("class", "tStyle"+pixelType);
}

boardProto.readPixel=function(a,b)
{
    var cellClass=this.tableModel.rows[b].cells[a].className;
    var pixelType=cellClass.charAt(cellClass.length-1);
    return pixelType;
}

var previewBoards = [];


var gameBoard = Object.create(boardProto);
gameBoard.tableModel = document.getElementById("board");
gameBoard.width=10;
gameBoard.height=20;

gameBoard.setReserved = function(a,b,trueOrFalse)
{
    var cell=gameBoard.tableModel.rows[b].cells[a];
    cell.setAttribute("reserved",trueOrFalse);
}

// Need this to tell where the tetrad piece is, kind of hard to tell it apart from the other blocks.
// Reason is so the tetrad doesn't think it's colliding with itself. Might be an easier way to do this.
gameBoard.isReserved = function(a,b)
{
	var cell=gameBoard.tableModel.rows[b].cells[a];
	var reserved = cell.getAttribute("reserved");

	return (reserved=="true");
}


gameBoard.reserveShape=function(a,b,shape)
{
	this.setReservedShape(a,b,shape,"true");
}

gameBoard.unReserveShape=function(a,b,shape)
{
	this.setReservedShape(a,b,shape,"false");
}

gameBoard.setReservedShape=function(a,b,shape,trueOrFalse)
{
    for (var j=0; j < shape.length; j++)
    {
        for (var i=0; i < shape[j].length; i++)
        {
            // You have to read the type data by row,column.
            var pixelType = shape[j][i];
            
            if (pixelType!=" ")
            {
                var col = a+i;
                var row = b+j;

				// Legacy? This if test shouldn't be necessary.
                if (col<gameBoard.width && row< gameBoard.height)
                {
                    this.setReserved(col,row,trueOrFalse);
                }
                
            }
           
        }
    }
}

gameBoard.writeGameShape=function(a,b,shape)
{
		this.writeShape(a,b,shape);
		this.reserveShape(a,b,shape);
}

gameBoard.removeGameShape=function(a,b,shape)
{
		this.eraseShape(a,b,shape);
		this.unReserveShape(a,b,shape);
}


var cursorModel=Object.create(null);
cursorModel.cursorA=0;
cursorModel.cursorB=0;
cursorModel.tetradType="type1";
cursorModel.tetradShapeIndex=0;
cursorModel.typeQueue=[];
cursorModel.getCurrentShape = function()
{
	return tetradModel.getShape(this.tetradType, this.tetradShapeIndex);	
}


// Get the next tetrad type in order (and shape 0), only useful for the cheat currently.
cursorModel.getNextType = function()
{
    var typeNumber = Number(this.tetradType.charAt(4));
    
    if (typeNumber==7)
        typeNumber=1;
    else
        typeNumber++;

    this.tetradType="type"+typeNumber;
    this.tetradShapeIndex=0;
    return this.getCurrentShape();
}


cursorModel.peekNextShape= function()
{
	var shapeArray = tetradModel.shapeDictionary[this.tetradType];
	var tempIndex = this.tetradShapeIndex;
	if (tempIndex==shapeArray.length-1)
		tempIndex=0;
	else
		tempIndex++;
	return shapeArray[tempIndex];
}

cursorModel.getNextShape = function()
{
	var shapeArray=tetradModel.shapeDictionary[this.tetradType];
	if (this.tetradShapeIndex==shapeArray.length-1)
		this.tetradShapeIndex=0;
	else
		this.tetradShapeIndex++;

	return this.getCurrentShape();
}

cursorModel.isCursor=function(a,b)
{
	var shape = this.getCurrentShape();

	if (b<this.cursorB || b>this.cursorB+shape.length-1)
		return false;
  	
	if (a<this.cursorA || a>this.cursorA+shape.length-1)
		return false;

	
	a-=this.cursorA;
	b-=this.cursorB;

	return shape[b][a]!=" ";	
}

// This should be getNextRandomType()
cursorModel.getNextRandomType=function()
{
	this.tetradType = this.getTypeFromQueue();	
	this.tetradShapeIndex=0;

	return this.getCurrentShape();
}

cursorModel.initTypeQueue = function()
{
	var initialTypeQueue=[];
	for (var i=0; i<4; i++)
	{
		initialTypeQueue[i]="type"+random1to7();
	}
	return initialTypeQueue;
}

cursorModel.typeQueue=cursorModel.initTypeQueue();


cursorModel.getTypeFromQueue=function()
{
	var dequeue=this.typeQueue.pop();

	var newQueue=[];
	newQueue.push("type"+random1to7());
	for (var i=0; i<3; i++)	
	{
		newQueue.push(this.typeQueue[i]);
	}
	
	this.typeQueue=newQueue;
	
	console.log(newQueue);

	return dequeue;
}


window.onload=initGameBoard();


function initGameBoard()
{
	setPreviewBoards();

	// rows
	for (var i=0; i < gameBoard.height; i++)
	{
		var row = gameBoard.tableModel.insertRow(i);

		// columns
		for (var j=0; j<gameBoard.width; j++)
		{
			var cell = row.insertCell(j);
			cell.setAttribute("class", "tStyle"+emptyBlock);
		} // end columns
	} // end rows


    addEventListener("keydown",function(event) {
    	if (over) return;
    

	// Ctrl
	if (event.keyCode==17)
    changeCursor();

	// Up
    if (event.keyCode==38)
    rotateCurrent();

	// Down    
	if (event.keyCode==40)
    moveTetrad(0,1);

	// Left    
	if (event.keyCode==37)
    moveTetrad(-1,0);

	// Right    
	if (event.keyCode==39)
    moveTetrad(1,0);
	
	// Pause
	if (event.keyCode==32)
	togglePause();

});


}



function setPreviewBoards()
{
	// The boards have a reversed direction relative to the queue.
	var j=3;
	for (var i=1; i<5; i++)
	{	
		previewBoards[i] = Object.create(boardProto);

		previewBoards[i].tableModel = document.getElementById("typeBoard"+i);
	    previewBoards[i].width=4;
		previewBoards[i].height=4;

		var shapeType= cursorModel.typeQueue[j];
		var shape=tetradModel.getShape(shapeType,0);

		previewBoards[i].fill(8);
		previewBoards[i].writeShape(0,0,shape);
		j--;
	}
}


function updatePreviewBoards()
{
	var j=3;
	var shape;
	for (var i=1; i<5; i++)
	{	
		var shape = tetradModel.getShape(cursorModel.typeQueue[j],0);
		previewBoards[i].fill(8);
		previewBoards[i].writeShape(0,0,shape);
					
		j--;		
	}
}


// Cheat change cursor. They take a penalty of 100.
function changeCursor()
{
	if (paused||over) return;
	var shape = cursorModel.getCurrentShape();
    gameBoard.removeGameShape(cursorModel.cursorA,cursorModel.cursorB,shape);
    
	shape=cursorModel.getNextType();
	gameBoard.writeGameShape(cursorModel.cursorA,cursorModel.cursorB,shape);
	score-=100;
	writeScore(score);
}


function random1to7()
{
	return Math.floor(Math.random()*7)+1;
}



function no()
{
	if (started)
		return;
	caption.innerText="No really, click here.";
}


var paused=false;


// Function to get the process started.
function startGame(event)
{

	// Stop the "no really" message that happens when clicking on the table first, from also happening.
	event.stopPropagation();


	// They keep clicking on it, pause/unpause.
	if (started)
	{
		togglePause();
		return;
	}

	// Let's do this.
	started=true;
	writeScore(0);
		

	addTetrad();

	
    var delay = 800;
    var ticks=0;

    
    
    /**
		Some changes are needed for the timing. The speed takes a while to increase, but when it does it increasingly increases at a rapid pace.
		This is because the ticks keep getting smaller in size, and the speed increases with each tick. So towards the end the speed increases 
		start happening faster and faster. What is needed is a predictable increase in speed based on total elapsed time. 
	**/
    var mainThread = function () {

	if (paused)
	{
			// 20 ms pause.
			setTimeout(mainThread,20);
			return;s
	}	

	ticks++;

	// Adjust the speed about every 20 ticks of 800ms, however the 800ms declines and eventually you are adjusting the speed much faster.
	if (ticks>20)
	{
		ticks=0;
		
		// Stop making it faster at 20ms
		if (delay>=20)
		{
			// Otherwise remove 20ms at a time.
			delay-=20;
		}	
	}	
		
	// Get the current shape (it could be rotated by the user's choice).
    var shape=cursorModel.getCurrentShape();
	
	// Prepare to move it down.	
	
	// Something is in the way, this one is part of the pile now.	
	if (isRenderFail(cursorModel.cursorA,(cursorModel.cursorB+1),shape))
	{
		gameBoard.unReserveShape(cursorModel.cursorA,cursorModel.cursorB,shape);


		if (!over)
		{
			// Score some block rows, and update the gui if applicable.
			checkCompleteRow();
			

			// Start over with another piece.
			addTetrad();
			
			// repeat the main thread next tick.						
			setTimeout(mainThread,delay);
			return;
		}
	}

	// Move it down.
	else
	{
		moveTetrad(0,1);

		// repeat the main thread next tick.
		setTimeout(mainThread,delay);
	
	}
	
	
	};
	
	// Start the timer and the main thread.
	setTimeout(mainThread,delay);
}


/**



*/
function addTetrad()
{

	// Is this needed?
	if (over)
	{
		console.log("Game over");
		return;
	}
	
	// Let's put it about here.
    var tempA=5;
    var tempB=0;

    
    
    
	// Hook for preview.
    tetradType = "type" + random1to7();
    tetradShapeIndex = 0;
	var shape=cursorModel.getNextRandomType();


	// If the first thing that happens when you put a new tetrad out is a renderfail, that's game.
    if (isRenderFail(tempA,tempB, shape) )
    {
    	gameOver();
    	return;
    }
    
    updatePreviewBoards();    

	// Do it.	
	cursorModel.cursorA=tempA;
	cursorModel.cursorB=tempB;

    gameBoard.writeGameShape(tempA,tempB,shape);
}

// It is what it is.
function gameOver()
{
	over=true;
	caption.innerText="Game Over: " + score;
}


function moveTetrad(aDiff,bDiff)
{
	if (paused || over)
	return;

    var shape = cursorModel.getCurrentShape();
 
    var success = move(cursorModel.cursorA,cursorModel.cursorB,aDiff,bDiff,shape);
    
    
    if (success)
    {
        cursorModel.cursorA+=aDiff;
        cursorModel.cursorB+=bDiff;
    } 
}

// Test if the shape will fit on the board.
function isRenderFail(a,b,shape)
{


	
	for (var j=0; j < shape.length; j++)
    {
        for (var i=0; i < shape[j].length; i++)
        {
            // You have to read the type data by row,column. Because the shape is an array of strings, and the strings are the columns.
            var pixelType = shape[j][i];
            

                   
            if (pixelType!=" ")
            {
                col = a+i;
                row = b+j;
    
                
                if (col>=gameBoard.width || row>=gameBoard.height) 
                {
                		return true;
                }

                // If something there
                if (gameBoard.readPixel(col,row)!=emptyBlock)
                {
                	// and it's not me the current shape rotation
                	if (!gameBoard.isReserved(col,row))
                	{
             
                		// collision
                		return true;
                	}
                	
                	
                }
                	
                
            }
        }
    }

    return false;
}

/*
shapeSet is a set of all possible tetrad shape rotations, each rotation is stored as an array of strings which is visually familiar.
tetradShapeMap is a mapping between a tetrad type and an array of its shape rotations, referenced from the shapeSet.

tetradType represents the current tetrad in play.
tetradShapeIndex represents the current rotation of the tetrad in play.

*/
function rotateCurrent()
{

	if (paused||over) return;

	if (isRenderFail(cursorModel.cursorA,cursorModel.cursorB,cursorModel.peekNextShape()))
		return;	

	gameBoard.removeGameShape(cursorModel.cursorA,cursorModel.cursorB,cursorModel.getCurrentShape());
	gameBoard.writeGameShape(cursorModel.cursorA,cursorModel.cursorB,cursorModel.getNextShape());
}




function move(a,b,aDiff,bDiff,shape)
{

	if (a+aDiff<0)
		return false;

    if (isRenderFail(a+aDiff,b+bDiff,shape))
    {
    	return false;
    }
    
    
    // Remove it.
    gameBoard.removeGameShape(a,b,shape);
        
    
    // Draw it again moved.
    gameBoard.writeGameShape(a+aDiff,b+bDiff,shape);
	
    // Move was successful.    
    return true;
}







function checkCompleteRow()
{

var currentShape = cursorModel.getCurrentShape();



var startingRow = cursorModel.cursorB + currentShape.length-1;
var numRows=cursorModel.getCurrentShape().length;

var scoreRows=0;

while (numRows>0)
{

	if (checkRow(startingRow))
	{
		removeRow(startingRow);
		scoreRows++;
	}
	else
	{
		startingRow--;
	}

	numRows--;
} 

if (scoreRows>0)
	updateScore(scoreRows);

} 


// Return true if solid row.
function checkRow(row)
{
	for (var col = 0; col < gameBoard.width; col++)
	{
		if (gameBoard.readPixel(col,row)==emptyBlock)
			return false;
	}

	return true;
}

// Remove a row
function removeRow(row)
{
	if (row>=gameBoard.height) return;

	// Shift everything down one.
	for (; row>=0; row--)
	{

		for (var col=0; col<gameBoard.width; col++)
		{	
			var style;

			if (row==0)
			{
				style=emptyBlock;
			}	
			else
			{
				style=gameBoard.readPixel(col,row-1);
			}
		
			gameBoard.writePixel(col,row,style);

		}

	}
}



function updateScore(scoreRows)
{
	var scoreDelta=0;

	// 100, 300, 900, 2700
	switch (scoreRows)
	{
		case 1: 
		scoreDelta=100;
		break;
		
		case 2:
		scoreDelta=300;
		break;
		
		case 3: 
		scoreDelta=900;
		break; 

		case 4:
		scoreDelta=2700;
		break;

		default:
		break;
	}

	score+=scoreDelta;
	writeScore(score);
}


function writeScore(score)
{	
	caption.innerText="Score: " + score;
}

function togglePause()
{
	if (over) return;

	if (paused)
	{
		writeScore(score);
		paused=false;
	}

	else
	{
		caption.innerText="Paused: " + score;
		paused=true;
	}
}


