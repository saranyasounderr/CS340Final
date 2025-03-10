// ./database/db-connector.js
var mysql = require('mysql');

// Create a connection pool
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_sounders',
    password: '8662',
    database: 'cs340_sounders',
});

// Export the pool's query method
module.exports = {
    query: (sql, params, callback) => pool.query(sql, params, callback)
};
