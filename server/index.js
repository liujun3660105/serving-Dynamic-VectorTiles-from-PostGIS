const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();

//获取切片的xyz的值
let pathToTile = (path) =>{
    if(path){
        let {yFormat} = path;
        let y = yFormat.split('.')[0];
        let format = yFormat.split('.')[1];
        return {
            z:path.z,
            x:path.x,
            y,
            format
        }
    

    }

}
//判断切片的xyz的值是否合理
let tileIsValid = (tile)=>{
    if(tile.hasOwnProperty("x") && tile.hasOwnProperty("y") &&tile.hasOwnProperty("z")){
        if(tile.hasOwnProperty("format") && tile.format in ['pbf','mvt']){
            let z = tile.z;
            let size = Math.pow(2,z);

        }
        else {
            return false
        }

    }
    else{
        return false
    }

}
router.get('/:z/:x/:yFormat',async(ctx)=>{
    let path = ctx.params;
    let tile = pathToTile(path);



})
app.use(router.routes());



app.listen(3000)


// const fs = require('fs');
// function get(key){
//     fs.readFile('./1.json',(err,data)=>{
//         console.log(data);
//         const json = JSON.parse(data);
//         console.log(json[key]);
//     })
// }
// function set(key, value){
//     fs.readFile('./1.json',(err, data)=>{
//         const json = data? JSON.parse(data):{};
//         json[key] = value
//         //重新写入文件
//         fs.writeFile('./1.json',JSON.stringify(json),err=>{
//             if(err){
//                 console.log(err);
//             }else{
//                 console.log('写入成功');
//             }
//         })
//     })
// }
// const readline = require('readline');
// const rl = readline.createInterface({
//     input:process.stdin,
//     output:process.stdout
// });
// //line事件 命令行中打了一行字  表示收到，触发line事件
// rl.on('line', function(input){
//     const [op, key, value] = input.split(' ');
//     if(op === 'get'){
//         get(key);
//     }
//     else if(op === 'set'){
//         set(key, value);
//     }
//     else if(op === 'quit'){
//         rl.close();
//     }
//     else{
//         console.log('没有操作');
//     }

// })
// rl.on('close',()=>{
//     console.log('程序结束');
//     process.exit(0);
// })