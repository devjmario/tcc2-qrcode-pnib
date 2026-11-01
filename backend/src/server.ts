import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool, testarConexao } from "./db";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected"
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected"
    });
  }
});

app.get("/animais", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM animais ORDER BY criado_em DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar animais" });
  }
});

app.get("/animais/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM animais WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ erro: "Animal não encontrado" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Consulta inválida" });
  }
});

app.post("/animais", async (req, res) => {
  const {
    id,
    identificacao,
    nome,
    raca,
    sexo,
    data_nascimento,
    criado_em
  } = req.body;

  if (
    !id ||
    typeof identificacao !== "string" ||
    !identificacao.trim() ||
    !["M", "F"].includes(sexo) ||
    !criado_em
  ) {
    res.status(400).json({ erro: "Dados obrigatórios inválidos" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO animais (
        id, identificacao, nome, raca, sexo,
        data_nascimento, criado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      RETURNING *`,
      [
        id,
        identificacao.trim(),
        nome || null,
        raca || null,
        sexo,
        data_nascimento || null,
        criado_em
      ]
    );

    if (result.rowCount === 0) {
      res.status(200).json({
        mensagem: "Animal já recebido anteriormente",
        id
      });
      return;
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao cadastrar animal" });
  }
});

app.get("/animais/:id/eventos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM eventos
       WHERE animal_id = $1
       ORDER BY data_evento DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json({ erro: "Erro ao consultar eventos" });
  }
});

app.post("/eventos", async (req, res) => {
  const {
    id,
    animal_id,
    tipo,
    data_evento,
    descricao,
    peso_kg,
    vacina,
    criado_em
  } = req.body;

  if (
    !id ||
    !animal_id ||
    !["PESAGEM", "VACINACAO"].includes(tipo) ||
    !data_evento ||
    !criado_em ||
    (tipo === "PESAGEM" &&
      (typeof peso_kg !== "number" || peso_kg <= 0)) ||
    (tipo === "VACINACAO" &&
      (typeof vacina !== "string" || !vacina.trim()))
  ) {
    res.status(400).json({ erro: "Dados do evento inválidos" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO eventos (
        id, animal_id, tipo, data_evento,
        descricao, peso_kg, vacina, criado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
      RETURNING *`,
      [
        id,
        animal_id,
        tipo,
        data_evento,
        descricao || null,
        tipo === "PESAGEM" ? peso_kg : null,
        tipo === "VACINACAO" ? vacina.trim() : null,
        criado_em
      ]
    );

    if (result.rowCount === 0) {
      res.status(200).json({
        mensagem: "Evento já recebido anteriormente",
        id
      });
      return;
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      erro: "Erro ao cadastrar evento"
    });
  }
});

const PORT = Number(process.env.PORT || 3000);

async function iniciar() {
  await testarConexao();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API executando na porta ${PORT}`);
  });
}

iniciar().catch((error) => {
  console.error("Falha ao iniciar API:", error);
  process.exit(1);
});