export default function createGrid(width,height){
    let grid = [];
    for(let i=0; i< height;  i++){
        let line = [];
        for (let j=0; j<width; j++){
            line.push(createNode());
        }
        grid.push(line)
    }
    return grid
}

function createNode(){
    return {
        isSnake: false,
        isFood:false,
        followTail:false,
        snakeName:'',
        segment:-1
    }
}
