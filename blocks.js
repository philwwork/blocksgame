/* 

© Copyright 2018 Phillip Walters, All Rights Reserved.

HTML, CSS, and Javascript programmed by Phillip Walters.*/

var boardWidth=10;
var boardHeight=20;
var score=0;
var started=false;

var redBlock=1;
var blueBlock=2;
var greenBlock=3;
var purpleBlock=4;
var orangeBlock=5;
var dottedBlock=8;
var emptyBlock=9;



var table = document.getElementById("board");


// Each string array represents a tetrad shape.
// Each digit or space in a string array represents a pixel in the shape.

// The digit corresponds to ".tStyleN" in the blocks.css file, where 'N' is the digit.
// The value of 'N' determines the color (and css) for the pixel.
var shapeSet={
"1a":        [" 11",
              "11 "],

"1b":        ["1 ",
              "11",
              " 1"],

"2a":        ["2",
              "2",
              "2",
              "2"],

"2b":        ["2222"],

"3a":        ["33 ",
              " 33"],

"3b":        [" 3",
              "33",
              "3 "],

"4a":       [" 4 ",
             "444"],

"4b":       [" 4",
             "44",
             " 4"],

"4c":       ["444",
             " 4 "],

"4d":       ["4 ",
             "44",
             "4 "],

"5a":       ["55",
             "55"],

"6a":       ["666",
             "6  "],

"6b":       ["6 ",
             "6 ",
             "66"],
             
"6c":       ["  6",
             "666"],
             
"6d":       ["66",
             " 6",
             " 6"],

"7a":       ["777",
             "  7"],

"7b":       ["77",
             "7 ",
             "7 "],

"7c":       ["7  ",
             "777"],

"7d":       [" 7",
             " 7",
             "77"]

};

var tetradShapeMap={

type1: [shapeSet["1a"],shapeSet["1b"]],

type2: [shapeSet["2a"],shapeSet["2b"]],

type3: [shapeSet["3a"],shapeSet["3b"]],

type4: [shapeSet["4a"],shapeSet["4b"],shapeSet["4c"],shapeSet["4d"]],

type5: [shapeSet["5a"]],

type6: [shapeSet["6a"],shapeSet["6b"],shapeSet["6c"],shapeSet["6d"]],

type7: [shapeSet["7a"],shapeSet["7b"],shapeSet["7c"],shapeSet["7d"]]
}

var caption = document.getElementById("caption");


// Global variables maintaining the current tetrad and its current shape.
var tetradType;
var tetradShapeIndex;

var over;



// Global variables maintaining the current tetrad's position.
var cursorA=0;
var cursorB=0;

// Data set representing the current shape's board positions, so that collision detection does not affect the tetrad itself.
var self=[];

window.onload=initTable();


function initTable()
{
	table = document.getElementById("board");

	// rows
	for (var i=0; i < boardHeight; i++)
	{

		var row = table.insertRow(i);

		// columns
		for (var j=0; j<boardWidth; j++)
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

    });

}



var boardProto={};

boardProto.width=0;
boardProto.height=0;
boardProto.tableModel = null;
boardProto.writeShape = function(shape,a,b)
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
			this.tableModel.rows[j+b].cells[i+a].setAttribute("class","tStyle"+pixelType);
		}
	}
}

boardProto.fill = function(pixelType)
{
	for (var j=0;j<this.height;j++)
	{
		for (var i=0; i<this.width;i++)
		{
			this.writePixel(j,i,pixelType);
		}
	}
}

boardProto.erase = function()
{
	this.fill(8);
}

boardProto.writePixel=function(a,b,pixelType)
{
	this.tableModel.rows[b].cells[a].setAttribute("class", "tStyle"+pixelType);
}


var blocksBoard = Object.create(boardProto);




function setPreviewBoard()
{
	var aBoard= Object.create(boardProto);

	aBoard.tableModel=document.getElementById("typeBoard");
	aBoard.width=4;
	aBoard.height=4;

	shape = getCurrentShape();

	aBoard.erase();
	aBoard.writeShape(shape,0,0);
}


function changeCursor()
{
	var shape = getCurrentShape();
    remove(cursorA,cursorB,shape);
    
    var tetradIndex = tetradType.charAt(4);
    tetradIndex = Number(tetradIndex);
    
    if (tetradIndex==7)
        tetradIndex=1;
    else
        tetradIndex++;

    
    tetradType="type"+tetradIndex;
    tetradShapeIndex=0;
    shape = getCurrentShape();

    render(cursorA,cursorB,shape);
}




function random1to7()
{
	return Math.floor(Math.random()*7)+1;
}


function getCurrentShape()
{
	var shapeArray = tetradShapeMap[tetradType];
	return shapeArray[tetradShapeIndex];
}



function no()
{
	if (started)
		return;
	caption.innerText="No really, click here.";
}


// Function to get the process started.
// This will need to be changed to something more elegant.
function startGame(event)
{
	event.stopPropagation();





	if (started)
		return;

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
	
	ticks++;
	if (ticks>20)
	{
		ticks=0;
		if (delay>20)
		{
			delay-=20;
		}
		
		
	}	
		
	// stay current with the shape if it has rotated.
    var shape=getCurrentShape();
		
		
	if (isRenderFail(cursorA,(cursorB+1),shape))
	{
		
		if (!over)
		{
			checkCompleteRow();
			addTetrad();
			setTimeout(mainThread,delay);

			return;
		}
		gameOver();
	}

	else
	{
		moveTetrad(0,1);
		setTimeout(mainThread,delay);
	
	}
	
	
	};
	
	setTimeout(mainThread,delay);
	
}



function addTetrad()
{
	if (over)
	{
		console.log("Game over");
		return;
	}
	
    cursorA=5;
    cursorB=0;

    
    
    // flush the cache of the previous tetrad if any.
    for (var i in self)
    {
    	self[i]=undefined;
    }
    
    tetradType = "type" + random1to7();
    tetradShapeIndex = 0;
	var shape=getCurrentShape();

    
    if (isRenderFail(cursorA,cursorB,shape))
    {
    	gameOver();
    	return;
    }
    
    setPreviewBoard();	
    render(cursorA,cursorB,shape);    
}

function gameOver()
{
	over=true;
	caption.innerText="Game Over: " + score;
}

function moveTetrad(a,b)
{
    var shape = getCurrentShape();
 
    var success = move(cursorA,cursorB,a,b,shape);
    
    
    if (success)
    {
        cursorA+=a;
        cursorB+=b;
    } 
}

// Check for failure by testing superimposing the shape onto the board.
function isRenderFail(a,b,shape)
{
    if (a>=boardWidth || b >=boardHeight) 
	{
		return true;
	}


	if (a<0 || b<0) 
	{
		return true;
	}

	
	for (var j=0; j < shape.length; j++)
    {
        for (var i=0; i < shape[j].length; i++)
        {
            // You have to read the type data by row,column.
            var pixelType = shape[j][i];
            

                   
            if (pixelType!=" ")
            {
                col = a+i;
                row = b+j;
    
                
                if (col>=boardWidth || row>=boardHeight) 
                {
                		return true;
                }
                // If something there
                if (readPixel(col,row)!=emptyBlock)
                {
                	// and it's not me the current shape rotation
                	if (self[""+col+","+row]==undefined)
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
var shapeArray = tetradShapeMap[tetradType];
var currentShape = getCurrentShape();

// get the next shape rotation.
var nextShape;
if (tetradShapeIndex==shapeArray.length-1)
    tetradShapeIndex=0;
else
    tetradShapeIndex++;

nextShape=shapeArray[tetradShapeIndex];
if (isRenderFail(cursorA,cursorB,nextShape))
{
	// undo the progression to the next shape.
	if (tetradShapeIndex==0)
		tetradShapeIndex=shapeArray.length-1;
	else
		tetradShapeIndex--;
	return;	
}


remove(cursorA,cursorB,currentShape);
render(cursorA,cursorB,nextShape);
}




function move(a,b,aDiff,bDiff,shape)
{
	
	
	
	
    // Error, should not happen.
    if (a <0 || b < 0)
    {
        console.log("Error: cannot use negative values for current tetrad cursor.");
        return false;    
    }

    if (a>=boardWidth || b >=boardHeight)
    {
        console.log("Error: cannot move tetrad cursor to greater than width or height.");
        return false;
    }


    

    if (isRenderFail(a+aDiff,b+bDiff,shape))
    {
    	return false;
    }
    
    
    // Remove it.
    remove(a,b,shape);
        
    
    // Draw it again.
    render(a+aDiff,b+bDiff,shape);
	
    // Move was successful.    
    return true;
}



function remove(a,b,shape)
{
    var clearFlag=true;    
    render(a,b,shape,clearFlag);
}





function checkCompleteRow()
{

var currentShape = getCurrentShape();



var startingRow = cursorB + currentShape.length-1;
var numRows=currentShape.length;

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
	for (var col = 0; col < boardWidth; col++)
	{
		if (readPixel(col,row)==emptyBlock)
			return false;
	}

	return true;
}

// Remove a row
function removeRow(row)
{
	if (row>=boardHeight) return;

	// Shift everything down one.

	for (; row>=0; row--)
	{

		for (var col=0; col<boardWidth; col++)
		{	
			var style;

			if (row==0)
			{
				style=emptyBlock;
			}	
			else
			{
				style=readPixel(col,row-1);
			}
		
			write(col,row,style);

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

// Should return a text value from 1-10 corresponding to cell color styles.
function readPixel(a,b)
{
    var cellClass=table.rows[b].cells[a].className;
    
    var pixelType=cellClass.charAt(cellClass.length-1);
    
    return pixelType;
}




// a,b refer to column, row on the board.
function render(a,b,shape,clear)
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

                if (col<boardWidth && row<boardHeight)
                {
                    if (clear)
                    {
                        pixelType=emptyBlock;
                        	isSelf=undefined;                        
                    }
                    else isSelf=true;
                    
                    write(col,row,pixelType);
                    self[""+col+","+row]=isSelf;
                }
                
            }
           

        }


    }

}


function write(a,b,pixelType)
{
    table.rows[b].cells[a].setAttribute("class","tStyle"+pixelType);
}



