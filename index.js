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
const headX = parseInt(request.body.you.body[0].x)
const headY = parseInt(request.body.you.body[0].y)
var borderY =0;
var borderX =0;

console.log('Head -- X: '+headX+' Y: '+headY)
var move = '';

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

try{
var length = request.body.you.body.length
  for (i=1; i<length-1; i++) {//ignores head and tail
    var seg = request.body.you.body[i]//get segment of snake
    //console.log('segment -- X: '+seg.x+' Y: '+seg.y)
    //console.log('||up: '+(headY-1)+' : '+seg.y+' : '+(headY-1 == parseInt(seg.y))+' ||down: '+(headY+1)+' : '+seg.y+' : '+(headY+1 == parseInt(seg.y))+' ||left: '+(headX-1)+' : '+seg.x+' : '+(headX-1 == parseInt(seg.x))+' ||right: '+(headX+1)+' : '+seg.x+' : '+(headX+1 == parseInt(seg.x)))
    if (headY-1 == parseInt(seg.y) && headX == seg.x){// out of bounds up
      dir[0] = false
    }

    if (headY+1 == parseInt(seg.y) && headX == seg.x){// out of bounds down
      dir[1] = false
    }

    if (headX-1 == parseInt(seg.x) && headY == seg.y){// out of bounds left
      dir[2] = false
    }

    if (headX+1 == parseInt(seg.x) && headY == seg.y){// out of bounds right
      dir[3] = false
    }

    ////////
    if ((seg.y == 0 || seg.y == bHeight-1) && borderY == 0){// out of bounds up
      borderY = headY - seg.y
      //insert some logic for if empty space is length of snake
    }
    if ((seg.x == 0 || seg.x == bWidth-1) && borderX == 0){// out of bounds up
      borderX = headX - seg.X
      //insert some logic for if empty space is length of snake
    }
  }

  console.log ('dir after body test: '+dir)

  //if facing edge remove closest turn
  if (headX == 0 || headX == bWidth-1){//if at either left or right edge
    //console.log('at X edge\n'+(headY < bHeight/2))
    if (borderY != 0){//check if body is cutting off border path
      if (borderY>0){
        dir[2]=false
      }else{
        dir[3]=false
      }
    }
    if ((headY < bHeight/2) && dir[1]/*down*/){//if above board half point and down is an allowed option
      dir[0] == false
    }else if (dir[0]/*up*/){//if below o at board half and up is allowed option
      dir[1] == false
    }
  }
  if (headY == 0 || headY == bHeight-1){
    //console.log('at Y edge\n'+(headX < bWidth/2)+' : '+((headX < bWidth/2) && dir[3]))
    if (borderX != 0){//check if body is cutting off border path
      if (borderX>0){
        dir[2]=false
      }else{
        dir[3]=false
      }
    }
    if ((headX < bWidth/2) && dir[3]/*right*/){//if above board half point and down is an allowed option
      dir[2] = false
    }else if (dir[2]/*left*/){//if below o at board half and up is allowed option
      dir[3] = false
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
  console.log(canGo)
}catch(err){
  console.log(err);
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
