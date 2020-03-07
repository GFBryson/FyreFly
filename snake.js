import * as objects from "./game"


export default function snakeStuff (game, dir){
    try{
        //snake grid build
        let data = {
            lengthOfLongestSnake : 0,
            iAmLongest : false,
            foodEaten : 0
        };
        objects.buildSnakeGrid(game, data);


        //recalc foodGrid
        let givenFood = '';
        // let myFood = '';
        for (let i=0 ; i<game.food.length ; i++){
            givenFood+='('+game.food[i].x+','+request.body.board.food[i].y+') '
        }
        objects.setFood(game, game.food,game.prevFoodLen - data.foodEaten);//only recalc for new food pieces

        //print snake Grid
        for (let i=0 ; i <game. bHeight; i++){
            let line = [];
            for (let j=0; j<game.bWidth; j++){
                line.push(game.snakeGrid[j][i])
            }
            console.log(i+' : '+line)
        }

        console.log('i am longest: '+ data.iAmLongest);
        //!!!!---------CHECK WALLS FIRST --------!!!!
        //will hit wall ? if so remove that option
        dir = willIHitWall(dir);
        console.log('dir after wall test: '+ dir);

        //will hit other snake?
        dir = willIHitOther(dir);
        console.log('dir after othSnk test: '+ dir);

    }catch(err){
        console.log(err)
    }


}

function willIHitOther(dir){
    if(dir[0]){//if no wall there
        if (game.snakeGrid[game.snake.headX][game.snake.headY-1].isSnake){//check up
            dir[0]=false
        }
    }
    if (dir[1]){//if no wall there
        if (game.snakeGrid[game.snake.headX][game.snake.headY+1].isSnake){//check down
            dir[1]=false
        }
    }
    if(dir[2]){//if no wall there
        if (game.snakeGrid[game.snake.headX-1][game.snake.headY].isSnake){//check left
            dir[2]=false
        }
    }
    if (dir[3]){//if no wall there
        if (game.snakeGrid[game.snake.headX+1][game.snake.headY].isSnake){//check right
            dir[3]=false
        }
    }
    return dir
}

function willIHitWall(dir) {
    if (game.snake.headY-1 < 0){// out of bounds up
        dir[0] = false//remove up option
    }

    if (game.snake.headY+1 > game.bHeight-1){// out of bounds down
        dir[1] = false//remove down option
    }

    if (game.snake.headX-1 < 0){// out of bounds left
        dir[2] = false//remove left option
    }

    if (game.snake.headX+1 > game.bWidth-1){// out of bounds right
        dir[3] = false//remove right option
    }
    return dir
}