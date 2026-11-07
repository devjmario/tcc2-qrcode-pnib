import { db } from "../database/database";
import { API_URL } from "./apiConfig";
import { getSession } from "./authService";

type Registro = Record<string, unknown>;

async function enviar(
  endpoint: string,
  dados: Registro,
  token: string
): Promise<void> {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();

    throw new Error(
      `Erro ${resposta.status} em ${endpoint}: ${detalhe}`
    );
  }
}

export async function sincronizarDados() {
  const sessao = await getSession();

  if (!sessao) {
    throw new Error("Faça login para sincronizar.");
  }

  const token = sessao.token;

  const usuarioId =
    (sessao as any).user?.id ??
    (sessao as any).usuario?.id;

  if (!usuarioId) {
    throw new Error("Sessão sem ID de usuário.");
  }

  let propriedadesEnviadas = 0;
  let animaisEnviados = 0;
  let eventosEnviados = 0;
  let alteracoesEnviadas = 0;

  const propriedades = db.getAllSync<Registro>(
    `SELECT p.*
     FROM propriedades p
     WHERE p.usuario_id = ?
     ORDER BY p.criado_em`,
    [usuarioId]
  );

  for (const propriedade of propriedades) {
    if (propriedade.localizacao_id) {
      const localizacao = db.getFirstSync<Registro>(
        "SELECT * FROM localizacoes WHERE id = ?",
        [String(propriedade.localizacao_id)]
      );

      if (!localizacao) {
        throw new Error(
          `Localização ausente para propriedade ${propriedade.id}`
        );
      }

      await enviar("/localizacoes", localizacao, token);
    }

    await enviar("/propriedades", propriedade, token);

    propriedadesEnviadas++;
  }

  const animais = db.getAllSync<Registro>(
    `SELECT *
     FROM animais
     WHERE sincronizado = 0
     ORDER BY criado_em`
  );

  for (const animal of animais) {
    await enviar("/animais", animal, token);

    db.runSync(
      "UPDATE animais SET sincronizado = 1 WHERE id = ?",
      [String(animal.id)]
    );

    animaisEnviados++;
  }

  const eventos = db.getAllSync<Registro>(
    `SELECT *
     FROM eventos
     WHERE sincronizado = 0
     ORDER BY criado_em`
  );

  for (const evento of eventos) {
    await enviar("/eventos", evento, token);

    db.runSync(
      "UPDATE eventos SET sincronizado = 1 WHERE id = ?",
      [String(evento.id)]
    );

    eventosEnviados++;
  }

  const alteracoes = db.getAllSync<Registro>(
    `SELECT *
     FROM historico_alteracoes_animais
     WHERE sincronizado = 0
     ORDER BY alterado_em`
  );

  for (const alteracao of alteracoes) {
    await enviar("/historico-alteracoes", alteracao, token);

    db.runSync(
      `UPDATE historico_alteracoes_animais
       SET sincronizado = 1
       WHERE id = ?`,
      [String(alteracao.id)]
    );

    alteracoesEnviadas++;
  }

  return {
    animaisEnviados,
    eventosEnviados,
    propriedadesEnviadas,
    alteracoesEnviadas,
  };
}