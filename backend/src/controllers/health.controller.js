function checkHealth(req, res) {
  res.status(200).json({
    status: "OK",
    message: "Servidor REPública funcionando!",
  });
}

module.exports = { checkHealth };
