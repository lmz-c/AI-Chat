const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "2100xyh67", 
  database: "ai_chat",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;