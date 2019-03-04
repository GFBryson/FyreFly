const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()

//my var
var moves= {}
var bHeight = 0
var bWidth = 0
//

const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  //console.log('\n\nSTARTING\n')

  console.log(bHeight+' '+bWidth)
  // Response data

  bHeight = request.body.board.height;
  bWidth = request.body.board.width;

  const data = {
    //color: '#A085B0',
    color: '#e52470', //heroku
    name: "FyreFly"
  }
  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
console.log("Turn= "+request.body.turn)

var dir = [true,true,true,true] //[up,down,left,right]
var canGo = [];
//my snake variables
const myLength = request.body.you.body.length
const headX = request.body.you.body[0].x//head x position
const headY = request.body.you.body[0].y//head y position
const tailX = request.body.you.body[myLength-1].x//tail x position
const tailY = request.body.you.body[myLength-1].y//tail y position
var borderY =0;//body on y border
var borderX =0;//body on x border

console.log('Head -- X: '+headX+' Y: '+headY)
var move = '';
try{
  //snake grid build
  var sNumb = request.body.board.snakes.length
  //console.log(sNumb)
  var snakeGrid = []
  for(i=0;i<bWidth;i++){
    line=[]
    for (j=0 ; j<bHeight ; j++){
      line.push(-1)
    }
    snakeGrid.push(line)
  }
  //console.log(snakeGrid)

  for (j=0 ; j<sNumb ; j++){
    //console.log(j)
    var snk = request.body.board.snakes[j].body
    //console.log(request.body.board)
    var sLen = snk.length
    for (i=0 ; i<sLen ; i++){
      snakeGrid[snk[i].x][snk[i].y] = i
    }
  }
  for (i=0 ; i < bHeight; i++){
    line = [];
    for (j=0; j<bWidth; j++){
      line.push(snakeGrid[j][i])
    }
    console.log(i+' : '+line)
  }

  //will hit other snake?
  if (snakeGrid[headX][headY-1]>-1){//check up
    dir[0]=false
  }
  if (snakeGrid[headX][headY+1]>-1){//check down
    dir[1]=false
  }
  if (snakeGrid[headX-1][headY]>-1){//check left
    dir[2]=false
  }
  if (snakeGrid[headX+1][headY]>-1){//check right
    dir[3]=false
  }
  console.log('dir after othSnk test: '+ dir)

}catch(err){
  console.log(err)
}
//will hit wall ? if so remove that option
if (headY-1 < 0){// out of bounds up
  dir[0] = false//remoeve up option
}

if (headY+1 > bHeight-1){// out of bounds down
  dir[1] = false//remove down option
}

if (headX-1 < 0){// out of bounds left
  dir[2] = false//remove left option
}

if (headX+1 > bWidth-1){// out of bounds right
  dir[3] = false//remove right option
}

console.log('dir after position test: '+ dir)
var dirU=[true,false,true,true]//if move up can dir be made after
var dirD=[false,true,true,true]//if move up can dir be made after
var dirL=[true,true,true,false]//if move up can dir be made after
var dirR=[true,true,false,true]//if move up can dir be made after

try{
  for (i=1; i<myLength-1; i++) {//ignores head and tail
    var seg = request.body.you.body[i]//get segment of snake
    //console.log('segment -- X: '+seg.x+' Y: '+seg.y)
    //console.log('||up: '+(headY-1)+' : '+seg.y+' : '+(headY-1 == parseInt(seg.y))+' ||down: '+(headY+1)+' : '+seg.y+' : '+(headY+1 == parseInt(seg.y))+' ||left: '+(headX-1)+' : '+seg.x+' : '+(headX-1 == parseInt(seg.x))+' ||right: '+(headX+1)+' : '+seg.x+' : '+(headX+1 == parseInt(seg.x)))
    if (headY-1 == seg.y && headX == seg.x){// out of bounds up
      dir[0] = false
    }

    if (headY+1 == seg.y && headX == seg.x){// out of bounds down
      dir[1] = false
    }

    if (headX-1 == seg.x && headY == seg.y){// out of bounds left
      dir[2] = false
    }

    if (headX+1 == seg.x && headY == seg.y){// out of bounds right
      dir[3] = false
    }

    //if body segment on border find if snake will get trapped by body
    if ((seg.y == 0 || seg.y == bHeight-1) && borderY == 0){// out of bounds up, down
      borderY = seg.x - headX // distance between head and segment on Y border
      //can follow tail?
      if (((borderY<0 && tailX>seg.x)||(borderY>0 && tailX<seg.x)) && tailY == seg.y){ //tail is between a segment and head and is on same Y
        borderY = 0 //reset as we can follow tail
      } else if (myLength-i <= Math.abs(borderY)){
        borderY = 0//reset as tail will unblock path by time we get to seg
      }
      //insert some logic for if empty space is length of snake
    }
    if ((seg.x == 0 || seg.x == bWidth-1) && borderX == 0){// out of bounds left, right
      borderX = seg.y - headY//distance between head and segment on X border
      if (((borderX<0 && tailY>seg.y)||(borderX>0 && tailY<seg.y)) && tailX == seg.x){ //tail is between a segment and head and is on same Y
        borderX =0 //reset as we can follow tail
      }else if (myLength-i <= Math.abs(borderY)){
        borderX = 0//reset as tail will unblock path by time we get to seg
      }
      //insert some logic for if empty space is length of snake
    }

    // would move trap head?
    //up
    if (dir[0]){//if we can move up NOTE: dirU[1] always false
      if (headY-2 == seg.y && headX == seg.x){// if two up hits body
        dirU[0] = false//cant go 2 up
      }

      if (headY-1 == seg.y && headX-1 == seg.x){// if up one and left hits body
        dirU[2] = false//cant go up left
      }

      if (headY-1 == seg.y && headX+1 == seg.x){// if one up and right hits body
        dirU[3] = false
      }
    }

    //down
    if (dir[1]){//if we can move up NOTE: dirD[0] always false
      if (headY+2 == seg.y && headX == seg.x){// if two down hits body
        dirD[0] = false//cant go 2 up
      }

      if (headY+1 == seg.y && headX-1 == seg.x){// if up down and left hits body
        dirD[2] = false//cant go up left
      }

      if (headY+1 == seg.y && headX+1 == seg.x){// if one down and right hits body
        dirD[3] = false
      }
    }

    //left
    if (dir[2]){//if we can move up NOTE: dirL[3] always false
      if (headX-2 == seg.y && headY == seg.y){// if two left hits body
        dirL[2] = false//cant go two left
      }

      if (headX-1 == seg.x && headY-1 == seg.y){// if one left and up hits body
        dirL[0] = false//cant go up
      }

      if (headX-1 == seg.x && headY+1 == seg.y){// if one left and down hits body
        dirL[1] = false // cant go down
      }
    }

    //right
    if (dir[3]){//if we can move up NOTE: dirR[2] always false
      if (headX+2 == seg.x && headY == seg.y){// if two right hits body
        dirR[3] = false//cant go two right
      }

      if (headX+1 == seg.x && headY-1 == seg.y){// if one right and up hits body
        dirR[0] = false//cant go up
      }

      if (headX+1 == seg.x && headY+1 == seg.y){// if one right and down hits body
        dirR[1] = false // cant go down
      }
    }
  }
  console.log ('dir after body test: '+dir)
  console.log ('U: '+dirU)
  console.log ('D: '+dirD)
  console.log ('L: '+dirL)
  console.log ('R: '+dirR)
  //one move ahead
  if (dir[0]){
    if (!(dirU[0]||dirU[1]||dirU[2]||dirU[3])){//if future move is not possible
      dir[0] = false
    }
  }
  if (dir[1]){
    if (!(dirD[0]||dirD[1]||dirD[2]||dirD[3])){//if future move is not possible
      dir[1] = false
    }
  }
  if (dir[2]){
    if (!(dirL[0]||dirL[1]||dirL[2]||dirL[3])){//if future move is not possible
      dir[2] = false
    }
  }
  if (dir[3]){
    if (!(dirR[0]||dirR[1]||dirR[2]||dirR[3])){//if future move is not possible
      dir[3] = false
    }
  }
  console.log ('dir after future test: '+dir)
  //logic for choosing which way head should turn if it is at the edge of the map
  if (headY == 0 || headY == bHeight-1){// if head is on N/S edge

    if (borderY != 0){//is not 0 if body is cutting off border path
      console.log('in borderY')
      if (borderY>0){//if posotive then body seg is to the right
        dir[3]=false//remove right travel option
      }else{//else is negative and seg is to left
        dir[2]=false//remove left travel option
      }
    }

    console.log('dir after borderY '+dir)
    console.log('border left right: '+((headX < bWidth/2) && dir[3]/*right*/))
    if ((headX < bWidth/2) && dir[3]/*right*/){//if above board half point and down is an allowed option
      dir[2] = false
    }else if (dir[2]/*left*/){//if below o at board half and up is allowed option
      dir[3] = false
    }
  }


  //if head is on W/E head
  if (headX == 0 || headX == bWidth-1){//if at either left or right edge
    //console.log('at X edge\n'+(headY < bHeight/2))
    if (borderX != 0){//is not 0 if body is cutting off border path
      console.log('in borderX')
      if (borderX>0){//if positive then seg is below
        dir[1]=false//remove down option
      }else {//else is neg and seg is above
        dir[0]=false//remove up option
      }
    }

    console.log('dir after borderX '+dir)
    console.log('border up down eval: '+((headY < bHeight/2) && dir[1]/*down*/))
    if ((headY < bHeight/2) && dir[1]/*down*/){//if above board half point and down is an allowed option
      dir[0] = false
    }else if (dir[0]/*up*/){//if below o at board half and up is allowed option
      dir[1] = false
    }
  }

  console.log ('dir after edge test: '+dir)


  //set possibuilities
  if (dir[0]){
    canGo.push('up')
  }
  if (dir[1]){
    canGo.push('down')
  }
  if (dir[2]){
    canGo.push('left')
  }
  if (dir[3]){
    canGo.push('right')
  }
  console.log('canGo: '+canGo)

}catch(err){
  console.log(err)
}

move = canGo[getRandomInt(0,canGo.length-1)]
console.log('Moving: '+move+'\n\n')
  // Response data
  const data = {
    move: move, // one of: ['up','down','left','right']
  }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})


//methods
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
