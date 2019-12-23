const pg = require('pg');
const config = require('./databaseConfig');

let pool = new pg.Pool(config);
let connectWithPool = async ()=>{
    let connection = await pool.connect();
    // console.log(connection);
    try {
        let {rows,fields} = await connection.query(`
        SELECT GID FROM BUILDINGS LIMIT 10
    `);
    console.log('select',JSON.stringify(rows,'','\t'));
        
    } catch (error) {
        console.log(error);
    }

}
connectWithPool();