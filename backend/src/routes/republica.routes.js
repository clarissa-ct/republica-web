const express = require("express");
const republicaController = require("../controllers/republica.controller");

const router = express.Router();
router.get("/", republicaController.listar);
router.get("/:id", republicaController.buscarPorId);
router.post("/", republicaController.criar);
router.put("/:id", republicaController.atualizar);
router.delete("/:id", republicaController.excluir);

module.exports = router;
