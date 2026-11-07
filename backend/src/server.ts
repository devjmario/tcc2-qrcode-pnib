import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool, testarConexao } from "./db";
import { registerAuthRoutes, requireAuth } from "./auth";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

registerAuthRoutes(app);
app.use(requireAuth);

const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const texto = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;


app.post("/localizacoes", async (req, res) => {
  const userId = res.locals.userId as string;

  const {
    id,
    endereco,
    municipio,
    uf,
    latitude,
    longitude,
  } = req.body || {};

  if (
    !uuid(id) ||
    !texto(municipio) ||
    !texto(uf) ||
    uf.trim().length !== 2
  ) {
    res.status(400).json({
      erro: "Localização inválida",
    });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO localizacoes (
        id, endereco, municipio, uf,
        latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        endereco || null,
        municipio.trim(),
        uf.trim().toUpperCase(),
        latitude ?? null,
        longitude ?? null,
      ]
    );

    res.json({
      id,
      usuario_id: userId,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: "Erro ao enviar localização",
    });
  }
});


app.post("/propriedades", async (req, res) => {
  const userId = res.locals.userId as string;

  const {
    id,
    localizacao_id,
    nome,
    codigo_estabelecimento,
    criado_em,
  } = req.body || {};

  if (
    !uuid(id) ||
    !texto(nome) ||
    (localizacao_id != null && !uuid(localizacao_id)) ||
    !texto(criado_em)
  ) {
    res.status(400).json({
      erro: "Propriedade inválida",
    });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO propriedades (
        id, usuario_id, localizacao_id,
        nome, codigo_estabelecimento, criado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        codigo_estabelecimento =
          EXCLUDED.codigo_estabelecimento,
        localizacao_id = EXCLUDED.localizacao_id
      WHERE propriedades.usuario_id =
        EXCLUDED.usuario_id
      RETURNING id`,
      [
        id,
        userId,
        localizacao_id || null,
        nome.trim(),
        codigo_estabelecimento || null,
        criado_em,
      ]
    );

    if (!result.rowCount) {
      res.status(403).json({
        erro: "Propriedade de outro usuário",
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: "Erro ao enviar propriedade",
    });
  }
});


app.get("/animais", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM animais
       WHERE usuario_id = $1
       ORDER BY criado_em DESC`,
      [res.locals.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao consultar animais",
    });
  }
});

app.get("/animais/:id", async (req, res) => {
  if (!uuid(req.params.id)) {
    res.status(400).json({
      erro: "ID inválido",
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM animais
       WHERE id = $1 AND usuario_id = $2`,
      [req.params.id, res.locals.userId]
    );

    if (!result.rowCount) {
      res.status(404).json({
        erro: "Animal não encontrado",
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao consultar animal",
    });
  }
});


app.post("/animais", async (req, res) => {
  const userId = res.locals.userId as string;

  const {
    id,
    identificacao,
    nome,
    raca,
    sexo,
    data_nascimento,
    propriedade_id,
    criado_em,
  } = req.body || {};

  if (
    !uuid(id) ||
    !texto(identificacao) ||
    !["M", "F"].includes(sexo) ||
    !texto(criado_em) ||
    (propriedade_id != null && !uuid(propriedade_id))
  ) {
    res.status(400).json({
      erro: "Dados do animal inválidos",
    });
    return;
  }

  try {
    if (propriedade_id) {
      const propriedade = await pool.query(
        `SELECT 1
         FROM propriedades
         WHERE id = $1 AND usuario_id = $2`,
        [propriedade_id, userId]
      );

      if (!propriedade.rowCount) {
        res.status(403).json({
          erro: "Propriedade não pertence ao usuário",
        });
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO animais (
        id, identificacao, nome, raca, sexo,
        data_nascimento, propriedade_id,
        criado_em, usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        identificacao = EXCLUDED.identificacao,
        nome = EXCLUDED.nome,
        raca = EXCLUDED.raca,
        sexo = EXCLUDED.sexo,
        data_nascimento = EXCLUDED.data_nascimento,
        propriedade_id = EXCLUDED.propriedade_id
      WHERE animais.usuario_id = EXCLUDED.usuario_id
      RETURNING id`,
      [
        id,
        identificacao.trim(),
        nome || null,
        raca || null,
        sexo,
        data_nascimento || null,
        propriedade_id || null,
        criado_em,
        userId,
      ]
    );

    if (!result.rowCount) {
      res.status(409).json({
        erro:
          "Animal já existente sem vínculo com este usuário. " +
          "Associe o registro antigo no banco antes de sincronizar.",
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: "Erro ao salvar animal",
    });
  }
});


app.get("/animais/:id/eventos", async (req, res) => {
  if (!uuid(req.params.id)) {
    res.status(400).json({
      erro: "ID inválido",
    });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT e.*
       FROM eventos e
       JOIN animais a ON a.id = e.animal_id
       WHERE e.animal_id = $1
         AND a.usuario_id = $2
       ORDER BY e.data_evento DESC`,
      [req.params.id, res.locals.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao consultar eventos",
    });
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
    criado_em,
  } = req.body || {};

  if (
    !uuid(id) ||
    !uuid(animal_id) ||
    !["PESAGEM", "VACINACAO"].includes(tipo) ||
    !texto(data_evento) ||
    !texto(criado_em) ||
    (
      tipo === "PESAGEM" &&
      (typeof peso_kg !== "number" || peso_kg <= 0)
    ) ||
    (
      tipo === "VACINACAO" &&
      !texto(vacina)
    )
  ) {
    res.status(400).json({
      erro: "Dados do evento inválidos",
    });
    return;
  }

  try {
    const animal = await pool.query(
      `SELECT 1
       FROM animais
       WHERE id = $1 AND usuario_id = $2`,
      [animal_id, res.locals.userId]
    );

    if (!animal.rowCount) {
      res.status(403).json({
        erro: "Animal não pertence ao usuário",
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO eventos (
        id, animal_id, tipo, data_evento,
        descricao, peso_kg, vacina, criado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
      RETURNING id`,
      [
        id,
        animal_id,
        tipo,
        data_evento,
        descricao || null,
        tipo === "PESAGEM" ? peso_kg : null,
        tipo === "VACINACAO" ? vacina.trim() : null,
        criado_em,
      ]
    );

    if (!result.rowCount) {
      const existente = await pool.query(
        `SELECT 1
         FROM eventos e
         JOIN animais a ON a.id = e.animal_id
         WHERE e.id = $1 AND a.usuario_id = $2`,
        [id, res.locals.userId]
      );

      if (!existente.rowCount) {
        res.status(409).json({
          erro: "ID de evento já utilizado",
        });
        return;
      }
    }

    res.json({ id });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: "Erro ao salvar evento",
    });
  }
});


app.post("/historico-alteracoes", async (req, res) => {
  const {
    id,
    animal_id,
    campo,
    valor_anterior,
    valor_novo,
    alterado_em,
  } = req.body || {};

  const campos = [
    "identificacao",
    "nome",
    "raca",
    "sexo",
    "data_nascimento",
    "propriedade_id",
  ];

  if (
    !uuid(id) ||
    !uuid(animal_id) ||
    !campos.includes(campo) ||
    !texto(alterado_em)
  ) {
    res.status(400).json({
      erro: "Histórico inválido",
    });
    return;
  }

  try {
    const animal = await pool.query(
      `SELECT 1
       FROM animais
       WHERE id = $1 AND usuario_id = $2`,
      [animal_id, res.locals.userId]
    );

    if (!animal.rowCount) {
      res.status(403).json({
        erro: "Animal não pertence ao usuário",
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO historico_alteracoes_animais (
        id, animal_id, usuario_id, campo,
        valor_anterior, valor_novo, alterado_em
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
      RETURNING id`,
      [
        id,
        animal_id,
        res.locals.userId,
        campo,
        valor_anterior ?? null,
        valor_novo ?? null,
        alterado_em,
      ]
    );

    if (!result.rowCount) {
      const existente = await pool.query(
        `SELECT 1
         FROM historico_alteracoes_animais
         WHERE id = $1 AND usuario_id = $2`,
        [id, res.locals.userId]
      );

      if (!existente.rowCount) {
        res.status(409).json({
          erro: "ID de histórico já utilizado",
        });
        return;
      }
    }

    res.json({ id });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: "Erro ao salvar histórico",
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