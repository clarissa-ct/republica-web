const republicaModel = require("../models/republica.model");

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

function lerDados(body) {
  const { nome, cidade, descricao } = body || {};
  const nomeValido = typeof nome === "string" && nome.trim().length > 0 && nome.trim().length <= 120;
  const cidadeValida = typeof cidade === "string" && cidade.trim().length > 0 && cidade.trim().length <= 120;
  const descricaoValida = descricao == null || typeof descricao === "string";

  if (!nomeValido || !cidadeValida || !descricaoValida) return null;
  return {
    nome: nome.trim(),
    cidade: cidade.trim(),
    descricao: typeof descricao === "string" ? descricao.trim() : null,
  };
}

async function listar(req, res) {
  try {
    res.json(await republicaModel.listar());
  } catch (erro) {
    console.error("Erro ao listar repúblicas:", erro);
    res.status(500).json({ erro: "Não foi possível listar as repúblicas." });
  }
}

async function buscarPorId(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  try {
    const republica = await republicaModel.buscarPorId(id);
    if (!republica) return res.status(404).json({ erro: "República não encontrada." });
    res.json(republica);
  } catch (erro) {
    console.error("Erro ao buscar república:", erro);
    res.status(500).json({ erro: "Não foi possível buscar a república." });
  }
}

async function criar(req, res) {
  const dados = lerDados(req.body);
  if (!dados) return res.status(400).json({ erro: "Informe nome e cidade válidos." });

  try {
    const republica = await republicaModel.criar(dados);
    res.status(201).json(republica);
  } catch (erro) {
    console.error("Erro ao cadastrar república:", erro);
    res.status(500).json({ erro: "Não foi possível cadastrar a república." });
  }
}

async function atualizar(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  const dados = lerDados(req.body);
  if (!dados) return res.status(400).json({ erro: "Informe nome e cidade válidos." });

  try {
    const republica = await republicaModel.atualizar(id, dados);
    if (!republica) return res.status(404).json({ erro: "República não encontrada." });
    res.json(republica);
  } catch (erro) {
    console.error("Erro ao atualizar república:", erro);
    res.status(500).json({ erro: "Não foi possível atualizar a república." });
  }
}

async function excluir(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  try {
    const excluida = await republicaModel.excluir(id);
    if (!excluida) return res.status(404).json({ erro: "República não encontrada." });
    res.status(204).send();
  } catch (erro) {
    if (erro.code === "23503") {
      return res.status(409).json({ erro: "Esta república possui vagas. Exclua as vagas primeiro." });
    }
    console.error("Erro ao excluir república:", erro);
    res.status(500).json({ erro: "Não foi possível excluir a república." });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
