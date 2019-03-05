const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()

//my var
var moves= {}
var bHeight = 0
var bWidth = 0
var snakeGrid = []
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
    var seg = 0
    for (seg=0 ; seg<sLen-1 ; seg++){//ignore tail (usually it will move)
      snakeGrid[snk[seg].x][snk[seg].y] = seg
    }
    //console.log(snk[seg].x+' '+snk[seg].y)
    if (request.body.turn >2){
      snakeGrid[snk[seg].x][snk[seg].y] = -2 //use -2 to signify tail
    }else{
        snakeGrid[snk[seg].x][snk[seg].y] = seg //use -2 to signify tail
    }
  }
  for (i=0 ; i < bHeight; i++){
    line = [];
    for (j=0; j<bWidth; j++){
      line.push(snakeGrid[j][i])
    }
    console.log(i+' : '+line)
  }
  //!!!!---------CHECK WALLS FIRST --------!!!!
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

  console.log('dir after wall test: '+ dir)

  //will hit other snake?
  if(dir[0]){//if no wall there
    if (snakeGrid[headX][headY-1]>-1){//check up
      dir[0]=false
    }
  }
  if (dir[1]){//if no wall there
    if (snakeGrid[headX][headY+1]>-1){//check down
      dir[1]=false
    }
  }
  if(dir[2]){//if no wall there
    if (snakeGrid[headX-1][headY]>-1){//check left
      dir[2]=false
    }
  }
  if (dir[3]){//if no wall there
    if (snakeGrid[headX+1][headY]>-1){//check right
      dir[3]=false
    }
  }
  console.log('dir after othSnk test: '+ dir)

}catch(err){
  console.log(err)
}


try{
  for (i=1; i<myLength-1; i++) {//ignores my head and tail
    var seg = request.body.you.body[i]//get segment of snake
    //console.log('segment -- X: '+seg.x+' Y: '+seg.y)
    //console.log('||up: '+(headY-1)+' : '+seg.y+' : '+(headY-1 == parseInt(seg.y))+' ||down: '+(headY+1)+' : '+seg.y+' : '+(headY+1 == parseInt(seg.y))+' ||left: '+(headX-1)+' : '+seg.x+' : '+(headX-1 == parseInt(seg.x))+' ||right: '+(headX+1)+' : '+seg.x+' : '+(headX+1 == parseInt(seg.x)))

    //no linger needed as we read all snakes into grid
    // if (headY-1 == seg.y && headX == seg.x){// out of bounds up
    //   dir[0] = false
    // }
    //
    // if (headY+1 == seg.y && headX == seg.x){// out of bounds down
    //   dir[1] = false
    // }
    //
    // if (headX-1 == seg.x && headY == seg.y){// out of bounds left
    //   dir[2] = false
    // }
    //
    // if (headX+1 == seg.x && headY == seg.y){// out of bounds right
    //   dir[3] = false
    // }

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
  }
  console.log ('dir after body test: '+dir)
  //one move ahead
  if(dir[0]){//only calc if can currently go
    if (trapped(headX,headY-1)){//up
      console.log('up trapped')
      dir[0]=false//up is trapped so dont go there
    }
  }
  if(dir[1]){//only calc if can currently go
    if (trapped(headX,headY+1)){//up
      console.log('down trapped')
      dir[1]=false//down is trapped so dont go there
    }
  }
  if(dir[2]){//only calc if can currently go
    if (trapped(headX-1,headY)){//up
      console.log('left trapped')
      dir[2]=false//left is trapped so dont go there
    }
  }
  if(dir[3]){//only calc if can currently go
    if (trapped(headX+1,headY)){//up
      console.log('right trapped')
      dir[3]=false//right is trapped so dont go there
    }
  }
  console.log ('dir after future test: '+dir)
  //logic for choosing which way head should turn if it is at the edge of the map
  if (headY == 0 || headY == bHeight-1){// if head is on N/S edge

    if (borderY != 0){//is not 0 if body is cutting off border path
      console.log('in borderY: '+borderY)
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
      console.log('in borderX: '+borderX)
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
  snakeGrid=[];//reset grid
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
function trapped(x,y){
  if (x>=0 && x<bWidth && y>=0 && y<bHeight){
    if (snakeGrid[x][y]==(-2)){//if position is tail then we wont be trapped and can follow it out
      return false
    }
  }
  var dir = [false,false,false,false]//[up,down,left,right]
  if(y-1>=0){
    if (snakeGrid[x][y-1]>-1){
      dir[0]=true
    }
  }else{
    dir[0]=true
  }
  if(y+1<bHeight){
    if (snakeGrid[x][y+1]>-1){
      dir[1]=true
    }
  }else{
    dir[1]=true
  }
  if(x-1>=0){//left
    if (snakeGrid[x-1][y]>-1){
      dir[2]=true
    }
  }else{
    dir[2]=true
  }
  if(x+1 > bWidth){//right
    if (snakeGrid[x+1][y]>-1){
      dir[3] = true
    }
  }else{
    dir[3]=true
  }
  console.log('trapped Dir: '+dir)
  if (dir[0]&&dir[1]&&dir[2]&&dir[3]){//if all directions are blocked
    return true;//will be trapped
  }else{
    return false;//will not be trapped
  }
}
