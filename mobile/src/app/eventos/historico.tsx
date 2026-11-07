import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  type Evento,
  listarEventosAnimal,
} from "@/database/eventoRepository";

import {
  listarAlteracoesAnimal,
  type AlteracaoAnimal,
} from "@/database/animalRepository";

import { db } from "@/database/database";

type ItemHistorico =
  | {
      tipo: "EVENTO";
      id: string;
      data: string;
      evento: Evento;
    }
  | {
      tipo: "ALTERACAO";
      id: string;
      data: string;
      alteracao: AlteracaoAnimal;
    };

const nomesCampos: Record<string, string> = {
  identificacao: "Identificação",
  nome: "Nome",
  raca: "Raça",
  sexo: "Sexo",
  data_nascimento: "Data de nascimento",
  propriedade_id: "Propriedade",
};

function formatarValor(
  campo: string,
  valor: string | null
): string {
  if (!valor) return "Não informado";

  if (campo === "sexo") {
    return valor === "M" ? "Macho" : "Fêmea";
  }

  if (campo === "propriedade_id") {
    const propriedade = db.getFirstSync<{ nome: string }>(
      "SELECT nome FROM propriedades WHERE id = ?",
      [valor]
    );

    return propriedade?.nome || `ID: ${valor}`;
  }

  return valor;
}

export default function HistoricoScreen() {
  const { animalId } = useLocalSearchParams<{
    animalId: string;
  }>();

  const [itens, setItens] = useState<ItemHistorico[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!animalId) return;

      const eventos: ItemHistorico[] =
        listarEventosAnimal(animalId).map((evento) => ({
          tipo: "EVENTO",
          id: evento.id,
          data: evento.data_evento,
          evento,
        }));

      const alteracoes: ItemHistorico[] =
        listarAlteracoesAnimal(animalId).map((alteracao) => ({
          tipo: "ALTERACAO",
          id: alteracao.id,
          data: alteracao.alterado_em,
          alteracao,
        }));

      setItens(
        [...eventos, ...alteracoes].sort((a, b) =>
          b.data.localeCompare(a.data)
        )
      );
    }, [animalId])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Histórico do bovino
      </Text>

      <FlatList
        data={itens}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum registro encontrado para este bovino.
          </Text>
        }
        renderItem={({ item }) => {
          if (item.tipo === "ALTERACAO") {
            const alteracao = item.alteracao;

            return (
              <View style={styles.card}>
                <Text style={styles.eventTitle}>
                  Alteração cadastral
                </Text>

                <Text>
                  Campo:{" "}
                  {nomesCampos[alteracao.campo] ||
                    alteracao.campo}
                </Text>

                <Text>
                  Antes:{" "}
                  {formatarValor(
                    alteracao.campo,
                    alteracao.valor_anterior
                  )}
                </Text>

                <Text>
                  Depois:{" "}
                  {formatarValor(
                    alteracao.campo,
                    alteracao.valor_novo
                  )}
                </Text>

                <Text>
                  Data:{" "}
                  {new Date(
                    alteracao.alterado_em
                  ).toLocaleString("pt-BR")}
                </Text>

                <Text style={styles.status}>
                  {alteracao.sincronizado === 1
                    ? "Sincronizado"
                    : "Pendente de sincronização"}
                </Text>
              </View>
            );
          }

          const evento = item.evento;

          return (
            <View style={styles.card}>
              <Text style={styles.eventTitle}>
                {evento.tipo === "PESAGEM"
                  ? "Pesagem"
                  : "Vacinação"}
              </Text>

              <Text>
                Data:{" "}
                {new Date(
                  evento.data_evento
                ).toLocaleString("pt-BR")}
              </Text>

              {evento.tipo === "PESAGEM" && (
                <Text>Peso: {evento.peso_kg} kg</Text>
              )}

              {evento.tipo === "VACINACAO" && (
                <Text>Vacina: {evento.vacina}</Text>
              )}

              {!!evento.descricao && (
                <Text>
                  Observações: {evento.descricao}
                </Text>
              )}

              <Text style={styles.status}>
                {evento.sincronizado === 1
                  ? "Sincronizado"
                  : "Pendente de sincronização"}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    backgroundColor: "#F5F7F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  status: {
    color: "#A16207",
    fontSize: 12,
    marginTop: 8,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  },
});