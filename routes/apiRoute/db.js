//here i began to make the data base in mysql
let sql = require ("mysql2");
const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'weather_db'
})