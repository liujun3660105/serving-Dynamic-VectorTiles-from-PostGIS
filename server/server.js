const pg = require('pg');
const config = require('./databaseConfig');

let pool = new pg.Pool(config);
let connectWithPool = async (sql)=>{
    let connection = await pool.connect();
    // console.log(connection);
    try {
        let result = await connection.query(sql);
        // console.log(result);
        connection.release();
        // console.log(result.rows);
    // console.log('select',JSON.stringify(rows,'','\t'));
        return result.rows[0]
    } catch (error) {
        console.log(error);
    }

}
// let connectWithPool = (sql)=>{
//     pool.connect(()=>{

//     })
// }
module.exports = connectWithPool;