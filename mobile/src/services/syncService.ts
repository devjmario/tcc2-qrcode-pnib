import { db } from "../database/database";

const API_URL = "http://192.168.3.72:3000";

type Registro = Record<string, unknown>;

async function enviar(
  endpoint: string,
  dados: Registro
): Promise<void> {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();

    throw new Error(
      `Erro ${resposta.status} ao enviar ${endpoint}: ${detalhe}`
    );
  }
}

export async function sincronizarDados() {
  let animaisEnviados = 0;
  let eventosEnviados = 0;

  // 1. Enviar os animais primeiro, pois os eventos
  // dependem da existência do animal no PostgreSQL.
  const animais = db.getAllSync<Registro>(
    "SELECT * FROM animais"
  );

  for (const animal of animais) {
    await enviar("/animais", animal);
    animaisEnviados++;
  }

  // 2. Enviar apenas eventos ainda não sincronizados.
  const eventos = db.getAllSync<Registro>(
    "SELECT * FROM eventos WHERE sincronizado = 0"
  );

  for (const evento of eventos) {
    await enviar("/eventos", evento);

    // Só confirmar localmente após resposta positiva da API.
    db.runSync(
      "UPDATE eventos SET sincronizado = 1 WHERE id = ?",
      [String(evento.id)]
    );

    eventosEnviados++;
  }

  return {
    animaisEnviados,
    eventosEnviados,
  };
}