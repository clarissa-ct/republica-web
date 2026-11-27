const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/health.routes");
const republicaRoutes = require("./routes/republica.routes");
const vagaRoutes = require("./routes/vaga.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/republicas", republicaRoutes);
app.use("/api/vagas", vagaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
