import { db } from "../database/database";
import { API_URL } from "./apiConfig";
import { getSession } from "./authService";

type Registro = Record<string, unknown>;

async function enviar(
  endpoint: string,
  dados: Registro
): Promise<void> {
  const sessao = await getSession();

  if (!sessao) {
    throw new Error("Faça login para sincronizar.");
  }

  const resposta = await fetch(
    `${API_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessao.token}`,
      },
      body: JSON.stringify(dados),
    }
  );

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

  // Animais precisam existir antes dos eventos.
  const animais = db.getAllSync<Registro>(
    "SELECT * FROM animais"
  );

  for (const animal of animais) {
    await enviar("/animais", animal);
    animaisEnviados++;
  }

  // Enviar somente eventos pendentes.
  const eventos = db.getAllSync<Registro>(
    "SELECT * FROM eventos WHERE sincronizado = 0"
  );

  for (const evento of eventos) {
    await enviar("/eventos", evento);

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