// import * as choices from "choices";
import createGrid from "./grid";

let createGame = function (board,snakeName){
    let game = {
        bHeight : 0,
        bWidth : 0,
        turn: 0,
        foodGrid : [],
        food : [],
        prevFoodLen :  board.food.length,
        moves: {},
        snakeGrid : [],
        numberOfSnakes : 0,
        snakes : [],
        snake: {
            myLength: -1,
            headX: -1,
            headY: -1,
            tailX: -1,
            tailY: -1
        },
        data: {}
    };
    try{
        game.bHeight = board.height;
        game.bWidth = board.width;
        let i=0;
        for(; i < game.bWidth;i++){
            let line=[];
            for (let j=0 ; j < game.bHeight ; j++){
                line.push(-1)
            }
            game.foodGrid.push(line);
        }
        game.foodGrid = setFood(game,board.food,0);
    }catch(e){
        console.log('IN START: '+e)
    }
    game.data = {
        //color: '#A085B0',
        color: '#e52470', //heroku
        name: snakeName
    };
    return game
};

let parseSnakes = function (data, game){
    game.snake.myLength = data.you.body.length;
    game.snake.headX = data.you.body[0].x;//head x position
    game.snake.headY = data.you.body[0].y;//head y position
    game.snake.tailX = data.you.body[game.snake.myLength-1].x;//tail x position
    game.snake.tailY = data.you.body[game.snake.myLength-1].y;//tail y position

    game.numberOfSnakes = data.board.snakes.length;
    game.snakes = data.board.snakes;
};

let setFood = function (game,food,startAt){
    console.log('startAt: '+startAt);
    game.prevFoodLen = food.length;//set length of current food chain
    for (let i = startAt ; i < game.prevFoodLen; i++){
        console.log('Setting food at: '+food[i].x+' '>food[i].y);
        game.foodGrid[food[i].x][food[i].y] = 1;
    }
};

let buildSnakeGrid = function(game, data){
    game.snakeGrid = createGrid(game.bWidth, game.bHeight);

    for (let j=0; j< game.numberOfSnakes ; j++){
        let snake = game.snakes[j].body;
        let snakeLength = snake.length;
        let segment = 0;
        for (; segment<snakeLength-1 ; segment++){//ignore tail (usually it will move)
            game.snakeGrid[snake[segment].x][snake[segment].y].segment = segment;
            game.snakeGrid[snake[segment].x][snake[segment].y].isSnake = true;
        }
        //tail
        if (game.turn >2 && game.foodGrid[snake[0].x][snake[0].y] !== 1){
            game.snakeGrid[snake[segment].x][snake[segment].y].followTail = true; //use -2 to signify that we can follow tail
        }else{
            game.snakeGrid[snake[segment].x][snake[segment].y].followTail = false; //use # to signify tail when it cant be followed
            game.snakeGrid[snake[segment].x][snake[segment].y].segment = segment; //segment#
            game.snakeGrid[snake[segment].x][snake[segment].y].isSnake = true; //use # to signify it is snake
            if (game.foodGrid[snake[0].x][snake[0].y] === 1){
                data.foodEaten +=1;
                game.foodGrid[snake[0].x][snake[0].y] = -1
            }
        }

        //longest snake

        if (snakeLength >= data.lengthOfLongestSnake){
            if (game.data.name === snake.name){// if i am this snake
                data.lengthOfLongestSnake=snakeLength;
                data.iAmLongest=true//make me longest snake
            }else{
                data.lengthOfLongestSnake= snakeLength;///if snake is new longest set as longest
                data.iAmLongest = false
            }
        }
    }
};

export {createGame, parseSnakes, setFood, buildSnakeGrid};

