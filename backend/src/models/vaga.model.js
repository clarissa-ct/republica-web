const pool = require("../config/db");

async function listar({ busca, cidade, precoMin, precoMax, ordem, pagina }) {
  const ordenacao = ordem === "menor_preco"
    ? "v.valor_mensal ASC, v.id ASC"
    : "v.criada_em DESC, v.id DESC";
  const limite = 20;
  const deslocamento = (pagina - 1) * limite;

  const resultado = await pool.query(
    `SELECT v.id, v.republica_id, r.nome AS nome_republica, r.cidade,
            v.valor_mensal, v.quantidade_disponivel, v.descricao,
            v.situacao, v.criada_em, v.atualizada_em
     FROM vagas AS v
     JOIN republicas AS r ON r.id = v.republica_id
     WHERE v.situacao = 'DISPONIVEL'
       AND v.quantidade_disponivel > 0
       AND ($1::text IS NULL OR r.nome ILIKE '%' || $1 || '%' OR r.cidade ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR lower(r.cidade) = lower($2))
       AND ($3::numeric IS NULL OR v.valor_mensal >= $3)
       AND ($4::numeric IS NULL OR v.valor_mensal <= $4)
     ORDER BY ${ordenacao}
     LIMIT $5 OFFSET $6`,
    [busca, cidade, precoMin, precoMax, limite, deslocamento]
  );
  return resultado.rows;
}

async function listarTodas() {
  const resultado = await pool.query(
    `SELECT v.*, r.nome AS nome_republica, r.cidade
     FROM vagas AS v
     JOIN republicas AS r ON r.id = v.republica_id
     ORDER BY v.criada_em DESC, v.id DESC`
  );
  return resultado.rows;
}

async function buscarQualquerPorId(id) {
  const resultado = await pool.query(
    `SELECT v.*, r.nome AS nome_republica, r.cidade
     FROM vagas AS v
     JOIN republicas AS r ON r.id = v.republica_id
     WHERE v.id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT v.*, r.nome AS nome_republica, r.cidade,
            r.descricao AS descricao_republica
     FROM vagas AS v
     JOIN republicas AS r ON r.id = v.republica_id
     WHERE v.id = $1 AND v.situacao = 'DISPONIVEL'
       AND v.quantidade_disponivel > 0`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function criar({ republica_id, valor_mensal, quantidade_disponivel, descricao, contato_divulgacao }) {
  const resultado = await pool.query(
    `INSERT INTO vagas (republica_id, valor_mensal, quantidade_disponivel, descricao, contato_divulgacao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [republica_id, valor_mensal, quantidade_disponivel, descricao, contato_divulgacao]
  );
  return resultado.rows[0];
}

async function atualizar(id, { valor_mensal, quantidade_disponivel, descricao, contato_divulgacao }) {
  const resultado = await pool.query(
    `UPDATE vagas
     SET valor_mensal = $1, quantidade_disponivel = $2,
         descricao = $3, contato_divulgacao = $4,
         atualizada_em = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [valor_mensal, quantidade_disponivel, descricao, contato_divulgacao, id]
  );
  return resultado.rows[0] || null;
}

async function mudarSituacao(id, situacao, quantidade) {
  const resultado = await pool.query(
    `UPDATE vagas
     SET situacao = $1, quantidade_disponivel = $2,
         atualizada_em = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [situacao, quantidade, id]
  );
  return resultado.rows[0] || null;
}

async function excluir(id) {
  const resultado = await pool.query("DELETE FROM vagas WHERE id = $1", [id]);
  return resultado.rowCount > 0;
}

module.exports = {
  listar, listarTodas, buscarPorId, buscarQualquerPorId,
  criar, atualizar, mudarSituacao, excluir,
};
