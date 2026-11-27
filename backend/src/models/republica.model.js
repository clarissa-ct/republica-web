const pool = require("../config/db");

async function listar() {
  const resultado = await pool.query(
    "SELECT id, nome, cidade, descricao FROM republicas ORDER BY id"
  );
  return resultado.rows;
}

async function buscarPorId(id) {
  const resultado = await pool.query(
    "SELECT id, nome, cidade, descricao FROM republicas WHERE id = $1",
    [id]
  );
  return resultado.rows[0] || null;
}

async function criar({ nome, cidade, descricao }) {
  const resultado = await pool.query(
    `INSERT INTO republicas (nome, cidade, descricao)
     VALUES ($1, $2, $3)
     RETURNING id, nome, cidade, descricao`,
    [nome, cidade, descricao]
  );
  return resultado.rows[0];
}

async function atualizar(id, { nome, cidade, descricao }) {
  const resultado = await pool.query(
    `UPDATE republicas
     SET nome = $1, cidade = $2, descricao = $3
     WHERE id = $4
     RETURNING id, nome, cidade, descricao`,
    [nome, cidade, descricao, id]
  );
  return resultado.rows[0] || null;
}

async function excluir(id) {
  const resultado = await pool.query(
    "DELETE FROM republicas WHERE id = $1",
    [id]
  );
  return resultado.rowCount > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
