const res = require('express/lib/response');
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "TourDB",
    password: "********",
});

let sql = "SELECT * FROM customer;";

pool.execute(sql, function(err,result){
    if(err) throw err;
    
    console.log(result);
});
module.exports = pool.promise();