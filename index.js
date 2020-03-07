import * as choices from "./choices"
import * as objects from "./game"
import snakeStuff from "./snake"

const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const app = express();

//my var
const snakeName = 'Fyrefly';
let game = {};
//

const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js');

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001));

app.enable('verbose errors');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(poweredByHandler);

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  game = objects.createGame(request.body.board,snakeName);

  return response.json(game.data)
});

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  game.turn = request.body.turn;
console.log("Turn= "+request.body.turn);
game.food = request.body.board.food;
let dir = [true,true,true,true]; //[up,down,left,right]
let canGo = [];
//my snake variables
objects.parseSnakes(request.body, game);

let borderY =0;//body on y border
let borderX =0;//body on x border

console.log('Head -- X: '+ game.snake.headX+' Y: '+ game.snake.headY);
// let move = '';

dir = snakeStuff(game, dir);


try{
  for (let i=1; i<game.snake.myLength-1; i++) {//ignores my head and tail
    let seg = request.body.you.body[i];//get segment of snake

    //if body segment on border find if snake will get trapped by body
    if ((seg.y === 0 || seg.y === game.bHeight-1) && borderY === 0){// out of bounds up, down
      borderY = seg.x - game.snake.headX; // distance between head and segment on Y border
      //can follow tail?
      if (((borderY<0 && game.snake.tailX>seg.x)||(borderY>0 && game.snake.tailX<seg.x)) && game.snake.tailY === seg.y){ //tail is between a segment and head and is on same Y
        borderY = 0 //reset as we can follow tail
      } else if (game.snake.myLength-i <= Math.abs(borderY)){
        borderY = 0//reset as tail will unblock path by time we get to seg
      }
      //insert some logic for if empty space is length of snake
    }
    if ((seg.x === 0 || seg.x === game.bWidth-1) && borderX === 0){// out of bounds left, right
      borderX = seg.y - game.snake.headY;//distance between head and segment on X border
      if (((borderX<0 && game.snake.tailY>seg.y)||(borderX>0 && game.snake.tailY<seg.y)) && game.snake.tailX === seg.x){ //tail is between a segment and head and is on same Y
        borderX =0 //reset as we can follow tail
      }else if (game.snake.myLength-i <= Math.abs(borderX)){
        borderX = 0//reset as tail will unblock path by time we get to seg
      }
      //insert some logic for if empty space is length of snake
    }
  }
  console.log ('dir after body test: '+dir);
  //one move ahead
  if(dir[0]){//only calc if can currently go
    if (choices.trapped(game.snake.headX,game.snake.headY-1)){//up
      //console.log('up choices.trapped')
      dir[0]=false//up is choices.trapped so dont go there
    }
  }
  if(dir[1]){//only calc if can currently go
    if (choices.trapped(game.snake.headX, game.snake.headY+1)){//up
      //console.log('down choices.trapped')
      dir[1]=false//down is choices.trapped so dont go there
    }
  }
  if(dir[2]){//only calc if can currently go
    if (choices.trapped(game.snake.headX-1, game.snake.headY)){//up
      //console.log('left trapped')
      dir[2]=false//left .trapped so dont go there
    }
  }
  if(dir[3]){//only calc if can currently go
    if (choices.trapped(game.snake.headX+1, game.snake.headY)){//up
      //console.log('right trapped')
      dir[3]=false//right is trapped so dont go there
    }
  }
  console.log ('dir after future test: '+dir);
  //logic for choosing which way head should turn if it is at the edge of the map
  if (game.snake.headY === 0 || game.snake.headY === game.bHeight-1){// if head is on N/S edge

    if (borderY !== 0){//is not 0 if body is cutting off border path
      console.log('in borderY: '+borderY);
      if (borderY>0){//if posotive then body seg is to the right
        dir[3]=false//remove right travel option
      }else{//else is negative and seg is to left
        dir[2]=false//remove left travel option
      }
    }

    console.log('dir after borderY '+dir);
    //console.log('border left right: '+((game.snake.headX < bWidth/2) && dir[3]/*right*/))
    if ((game.snake.headX < game.bWidth/2) && dir[3]/*right*/){//if above board half point and down is an allowed option
      dir[2] = false
    }else if (dir[2]/*left*/){//if below o at board half and up is allowed option
      dir[3] = false
    }
  }


  //if head is on W/E head
  if (game.snake.headX === 0 ||game.snake.headX === game.bWidth-1){//if at either left or right edge
    //console.log('at X edge\n'+(game.snake.headY < bHeight/2))
    if (borderX !== 0){//is not 0 if body is cutting off border path
      console.log('in borderX: '+borderX);
      if (borderX>0){//if positive then seg is below
        dir[1]=false//remove down option
      }else {//else is neg and seg is above
        dir[0]=false//remove up option
      }
    }

    console.log('dir after borderX '+dir);
    //console.log('border up down eval: '+((game.snake.headY < bHeight/2) && dir[1]/*down*/))
    if ((game.snake.headY < game.bHeight/2) && dir[1]/*down*/){//if above board half point and down is an allowed option
      dir[0] = false
    }else if (dir[0]/*up*/){//if below o at board half and up is allowed option
      dir[1] = false
    }
  }

  console.log ('dir after edge test: '+dir);

//PRIOROTIES HARD CODED FOR NOW

let priority = [1,1,1,1];//[up,down,left,right]

  //set possibuilities
  if (dir[0]){
    for(let i=0 ; i< priority[0]+1 ; i++){
      canGo.push('up')
    }
  }
  if (dir[1]){
    for(let i=0 ; i< priority[1]+1 ; i++){
      canGo.push('down')
    }
  }
  if (dir[2]){
    for(let i=0 ; i< priority[2]+1 ; i++){
      canGo.push('left')
    }
  }
  if (dir[3]){
    for(let i=0 ; i< priority[3]+1 ; i++){
      canGo.push('right')
    }
  }
console.log('canGo: '+canGo)

}catch(err){
  console.log(err)
}


let move = canGo[getRandomIntBetween(0,canGo.length-1)];
console.log('Moving: '+move+'\n\n');
  // Response data
  const data = {
    move: move, // one of: ['up','down','left','right']
  };
  game.snakeGrid={};//reset grid
  return response.json(data)
});

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
});

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
});

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get('port'), () => {
  //console.log('Server listening on port %s', app.get('port'))
});


//methods
function getRandomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


