import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";
import {
  useLocalSearchParams,
  useFocusEffect
} from "expo-router";

import {
  Evento,
  listarEventosAnimal
} from "@/database/eventoRepository";

export default function HistoricoScreen() {
  const { animalId } = useLocalSearchParams<{
    animalId: string;
  }>();

  const [eventos, setEventos] = useState<Evento[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (animalId) {
        setEventos(listarEventosAnimal(animalId));
      }
    }, [animalId])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de eventos</Text>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum evento registrado para este bovino.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.eventTitle}>
              {item.tipo === "PESAGEM"
                ? "Pesagem"
                : "Vacinação"}
            </Text>

            <Text>
              Data: {new Date(item.data_evento).toLocaleString("pt-BR")}
            </Text>

            {item.tipo === "PESAGEM" && (
              <Text>Peso: {item.peso_kg} kg</Text>
            )}

            {item.tipo === "VACINACAO" && (
              <Text>Vacina: {item.vacina}</Text>
            )}

            {!!item.descricao && (
              <Text>Observações: {item.descricao}</Text>
            )}

            <Text style={styles.status}>
              {item.sincronizado === 1
                ? "Sincronizado"
                : "Pendente de sincronização"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    backgroundColor: "#F5F7F5"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 20
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F"
  },
  status: {
    color: "#A16207",
    fontSize: 12,
    marginTop: 8
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 40
  }
});