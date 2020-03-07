let trapped = function (game,x,y) {
    if (x >= 0 && x < game.bWidth && y >= 0 && y < game.bHeight) {
        if (game.snakeGrid[x][y].followTail) {//if followTail is true then we wont be trapped and can follow it out
            return false
        }
    }
    let dir = [false, false, false, false];//[up,down,left,right]
    if (y - 1 >= 0) {
        if (game.snakeGrid[x][y - 1].isSnake) {
            dir[0] = true
        }
    } else {
        dir[0] = true
    }
    if (y + 1 < game.bHeight) {
        if (game.snakeGrid[x][y + 1].isSnake) {
            dir[1] = true
        }
    } else {
        dir[1] = true
    }
    if (x - 1 >= 0) {//left
        if (game.snakeGrid[x - 1][y].isSnake) {
            dir[2] = true
        }
    } else {
        dir[2] = true
    }
    if (x + 1 < game.bWidth) {//right
        if (game.snakeGrid[x + 1][y].isSnake) {
            dir[3] = true
        }
    } else {
        dir[3] = true
    }
    console.log('choices.trapped Dir: '+dir);
    return dir[0] && dir[1] && dir[2] && dir[3];
};
//TODO implement findFood function

export {trapped};