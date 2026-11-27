const vagaModel = require("../models/vaga.model");

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

function valorValido(valor, permitirZero = false) {
  if (typeof valor !== "string" && typeof valor !== "number") return false;
  const texto = String(valor);
  return /^\d{1,8}(?:\.\d{1,2})?$/.test(texto)
    && (permitirZero ? Number(texto) >= 0 : Number(texto) > 0);
}

function lerDados(body, criando = false) {
  const { valor_mensal, quantidade_disponivel, descricao, contato_divulgacao } = body || {};
  const precoValido = valorValido(valor_mensal);
  const quantidadeValida = Number.isInteger(quantidade_disponivel)
    && (criando ? quantidade_disponivel > 0 : quantidade_disponivel >= 0);
  const descricaoValida = typeof descricao === "string" && descricao.trim().length > 0;
  const contatoValido = typeof contato_divulgacao === "string"
    && contato_divulgacao.trim().length > 0
    && contato_divulgacao.trim().length <= 120;

  if (!precoValido || !quantidadeValida || !descricaoValida || !contatoValido) return null;
  return {
    valor_mensal: String(valor_mensal),
    quantidade_disponivel,
    descricao: descricao.trim(),
    contato_divulgacao: contato_divulgacao.trim(),
  };
}

function lerFiltroTexto(valor) {
  if (valor === undefined) return null;
  if (typeof valor !== "string" || valor.trim().length > 120) return undefined;
  return valor.trim() || null;
}

function lerFiltroPreco(valor) {
  if (valor === undefined) return null;
  if (typeof valor !== "string" || !valorValido(valor, true)) return undefined;
  return valor;
}

async function listar(req, res) {
  const busca = lerFiltroTexto(req.query.busca);
  const cidade = lerFiltroTexto(req.query.cidade);
  const precoMin = lerFiltroPreco(req.query.preco_min);
  const precoMax = lerFiltroPreco(req.query.preco_max);
  const ordem = req.query.ordem === undefined ? "recentes" : req.query.ordem;
  const pagina = Number(req.query.pagina ?? 1);

  if (busca === undefined || cidade === undefined || precoMin === undefined
    || precoMax === undefined || !["recentes", "menor_preco"].includes(ordem)
    || !Number.isInteger(pagina) || pagina < 1 || pagina > 1000000
    || (precoMin !== null && precoMax !== null && Number(precoMin) > Number(precoMax))) {
    return res.status(400).json({ erro: "Filtros inválidos." });
  }

  try {
    res.json(await vagaModel.listar({ busca, cidade, precoMin, precoMax, ordem, pagina }));
  } catch (erro) {
    console.error("Erro ao listar vagas:", erro);
    res.status(500).json({ erro: "Não foi possível listar as vagas." });
  }
}

async function listarTodas(req, res) {
  try {
    res.json(await vagaModel.listarTodas());
  } catch (erro) {
    console.error("Erro ao listar vagas para gerenciamento:", erro);
    res.status(500).json({ erro: "Não foi possível listar as vagas." });
  }
}

async function buscarGerenciamento(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  try {
    const vaga = await vagaModel.buscarQualquerPorId(id);
    if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
    res.json(vaga);
  } catch (erro) {
    console.error("Erro ao buscar vaga para gerenciamento:", erro);
    res.status(500).json({ erro: "Não foi possível buscar a vaga." });
  }
}

async function buscarPorId(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  try {
    const vaga = await vagaModel.buscarPorId(id);
    if (!vaga) return res.status(404).json({ erro: "Vaga disponível não encontrada." });
    res.json(vaga);
  } catch (erro) {
    console.error("Erro ao buscar vaga:", erro);
    res.status(500).json({ erro: "Não foi possível buscar a vaga." });
  }
}

async function criar(req, res) {
  const republicaId = lerId(req.body?.republica_id);
  const dados = lerDados(req.body, true);
  if (republicaId === null || !dados) {
    return res.status(400).json({ erro: "Informe república, valor, quantidade, descrição e contato válidos." });
  }

  try {
    const vaga = await vagaModel.criar({ republica_id: republicaId, ...dados });
    res.status(201).json(vaga);
  } catch (erro) {
    if (erro.code === "23503") {
      return res.status(404).json({ erro: "República não encontrada." });
    }
    console.error("Erro ao criar vaga:", erro);
    res.status(500).json({ erro: "Não foi possível cadastrar a vaga." });
  }
}

async function atualizar(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  const dados = lerDados(req.body);
  if (!dados) {
    return res.status(400).json({ erro: "Informe valor, quantidade, descrição e contato válidos." });
  }

  try {
    const vaga = await vagaModel.atualizar(id, dados);
    if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
    res.json(vaga);
  } catch (erro) {
    if (erro.code === "23514") {
      return res.status(400).json({ erro: "A quantidade deve ser positiva para vaga disponível e zero para vaga ocupada." });
    }
    console.error("Erro ao atualizar vaga:", erro);
    res.status(500).json({ erro: "Não foi possível atualizar a vaga." });
  }
}

async function mudarSituacao(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  const { situacao, quantidade_disponivel } = req.body || {};
  let quantidade;
  if (situacao === "OCUPADA") {
    if (quantidade_disponivel != null && quantidade_disponivel !== 0) {
      return res.status(400).json({ erro: "Uma vaga ocupada deve ter quantidade zero." });
    }
    quantidade = 0;
  } else if (situacao === "DISPONIVEL") {
    if (!Number.isInteger(quantidade_disponivel) || quantidade_disponivel <= 0) {
      return res.status(400).json({ erro: "Informe uma quantidade positiva para reabrir a vaga." });
    }
    quantidade = quantidade_disponivel;
  } else {
    return res.status(400).json({ erro: "Situação inválida." });
  }

  try {
    const vaga = await vagaModel.mudarSituacao(id, situacao, quantidade);
    if (!vaga) return res.status(404).json({ erro: "Vaga não encontrada." });
    res.json(vaga);
  } catch (erro) {
    console.error("Erro ao alterar situação da vaga:", erro);
    res.status(500).json({ erro: "Não foi possível alterar a situação da vaga." });
  }
}

async function excluir(req, res) {
  const id = lerId(req.params.id);
  if (id === null) return res.status(400).json({ erro: "ID inválido." });

  try {
    const excluida = await vagaModel.excluir(id);
    if (!excluida) return res.status(404).json({ erro: "Vaga não encontrada." });
    res.status(204).send();
  } catch (erro) {
    console.error("Erro ao excluir vaga:", erro);
    res.status(500).json({ erro: "Não foi possível excluir a vaga." });
  }
}

module.exports = {
  listar, listarTodas, buscarPorId, buscarGerenciamento,
  criar, atualizar, mudarSituacao, excluir,
};
