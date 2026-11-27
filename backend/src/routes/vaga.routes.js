const express = require("express");
const vagaController = require("../controllers/vaga.controller");

const router = express.Router();
router.get("/", vagaController.listar);
router.get("/gerenciar", vagaController.listarTodas);
router.get("/gerenciar/:id", vagaController.buscarGerenciamento);
router.get("/:id", vagaController.buscarPorId);
router.post("/", vagaController.criar);
router.put("/:id", vagaController.atualizar);
router.patch("/:id/situacao", vagaController.mudarSituacao);
router.delete("/:id", vagaController.excluir);

module.exports = router;
