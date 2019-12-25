const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const sqlExecute = require('./server');

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
        if(tile.hasOwnProperty("format") &&  ['pbf','mvt'].includes(tile.format)){
            let z = tile.z;
            let size = Math.pow(2,z);
            
            if (tile.x >=size || tile.x<0 || tile.y<0 ||tile.y >= size){
                return false
            }
            else{
                return true
            }

        }
        else {
            return false
        }

    }
    else{
        return false
    }

}
/**
 * caculate envelope in "Spherical Mercator"
 * 计算墨卡托投影下切片的坐标范围
 * @param {*} tile 
 */
let tileToEnvelope = (tile)=>{
    let worldMercMax = 20037508.3427892;
    let worldMercMin = -1*worldMercMax;
    let worldMercSize = worldMercMax - worldMercMin;
    let worldTileCount = Math.pow(2,tile.z);
    let tileMercSize = worldMercSize/worldTileCount;
    let xmin = worldMercMin + tile.x*tileMercSize;
    let xmax = worldMercMin + (parseInt(tile.x) + 1)*tileMercSize;
    let ymin = worldMercMax - (parseInt(tile.y) + 1)*tileMercSize;
    let ymax = worldMercMax - tile.y*tileMercSize;
    return {
        xmin,
        xmax,
        ymin,
        ymax
    }
}
/**
 * Generate SQL to materialize a query envelope in EPSG:3857
 * Density the edges a little so the envelope can be safely converted to other coordinate systems
 * @param {*} env 
 */
let envelopeToBoundsSQL = (env) => {
    const DENSIFY_FACTOR = 4;
    let segSize = (env.xmax- env.xmin)/DENSIFY_FACTOR;
    
    sql_bound = `ST_Segmentize(ST_MakeEnvelope(${env.xmin},${env.ymin},${env.xmax},${env.ymax},3857),${segSize})`;
    // console.log(sql_bound);
    return sql_bound;

}
let envelopeToSQL = (env)=>{
    let boundSql = envelopeToBoundsSQL(env)
    let sql_Tile = `
        WITH
        bounds AS (
            SELECT ${boundSql} AS geom,
                   ${boundSql}::box2d AS b2d
        ),
        mvtgeom AS (
            SELECT ST_ASMVTGEOM(ST_TRANSFORM(t.geom, 3857), bounds.b2d) AS geom,gid FROM roads t,bounds WHERE ST_INTERSECTS(t.geom, ST_TRANSFORM(bounds.geom,4326))
        )
        SELECT ST_ASMVT(mvtgeom.*) from mvtgeom
    `
    console.log(sql_Tile);
    return sql_Tile
}

router.get('/:z/:x/:yFormat',async(ctx)=>{
    let path = ctx.params;
    let tile = pathToTile(path);
    
    if(tileIsValid(tile)){
        let tileEnvelope = tileToEnvelope(tile);
        // let envelopeSQL = envelopeToBoundsSQL(tileEnvelope);
        let mvtSQL = envelopeToSQL(tileEnvelope);
        let tileFile = await sqlExecute(mvtSQL);
        // console.log('切片文件');
        ctx.status = 200;
        
       
        
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.body = tileFile.st_asmvt;
        ctx.set('Content-Type',"application/vnd.mapbox-vector-tile");
        // ctx.set('Content-Type',"application/x-protobuf");
        // ctx.set('Content-Encoding','gzip');
    }
    else{
        return
    }
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