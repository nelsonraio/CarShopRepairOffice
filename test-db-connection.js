// Teste simples de conexão MySQL
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'carshop',
  port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  } else {
    console.log('Conexão MySQL OK!');
    connection.query('SELECT 1', (err, results) => {
      if (err) {
        console.error('Erro ao executar query:', err.message);
      } else {
        console.log('Query executada com sucesso:', results);
      }
      connection.end();
    });
  }
});
