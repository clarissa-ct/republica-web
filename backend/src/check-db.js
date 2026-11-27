require("dotenv").config();
const pool = require("./config/db");

async function verificarBanco() {
  try {
    const resultado = await pool.query(
      "SELECT current_database() AS banco"
    );
    console.log("Conexão OK com", resultado.rows[0].banco);
  } catch (erro) {
    console.error("Erro na conexão:", erro.message);
  } finally {
    await pool.end();
  }
}

verificarBanco();