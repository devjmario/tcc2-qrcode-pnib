import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  cadastrarEvento,
  TipoEvento
} from "@/database/eventoRepository";

export default function NovoEventoScreen() {
  const { animalId } = useLocalSearchParams<{
    animalId: string;
  }>();

  const router = useRouter();

  const [tipo, setTipo] = useState<TipoEvento>("PESAGEM");
  const [peso, setPeso] = useState("");
  const [vacina, setVacina] = useState("");
  const [descricao, setDescricao] = useState("");

  function salvarEvento() {
    if (!animalId) {
      Alert.alert("Erro", "Animal não identificado.");
      return;
    }

    const pesoNumero = Number(peso.replace(",", "."));

    if (tipo === "PESAGEM") {
      if (!peso.trim() || !Number.isFinite(pesoNumero) || pesoNumero <= 0) {
        Alert.alert("Atenção", "Informe um peso válido.");
        return;
      }
    }

    if (tipo === "VACINACAO" && !vacina.trim()) {
      Alert.alert("Atenção", "Informe a vacina aplicada.");
      return;
    }

    try {
      cadastrarEvento({
        animal_id: animalId,
        tipo,
        data_evento: new Date().toISOString(),
        descricao: descricao.trim(),
        peso_kg: tipo === "PESAGEM" ? pesoNumero : undefined,
        vacina: tipo === "VACINACAO" ? vacina.trim() : undefined
      });

      Alert.alert(
        "Sucesso",
        "Evento registrado localmente.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível registrar o evento.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar evento</Text>

      <Text style={styles.label}>Tipo de evento</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            tipo === "PESAGEM" && styles.selected
          ]}
          onPress={() => setTipo("PESAGEM")}
        >
          <Text style={styles.typeText}>Pesagem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            tipo === "VACINACAO" && styles.selected
          ]}
          onPress={() => setTipo("VACINACAO")}
        >
          <Text style={styles.typeText}>Vacinação</Text>
        </TouchableOpacity>
      </View>

      {tipo === "PESAGEM" ? (
        <>
          <Text style={styles.label}>Peso (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 450,5"
            keyboardType="decimal-pad"
            value={peso}
            onChangeText={setPeso}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Vacina aplicada *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Vacina contra febre aftosa"
            value={vacina}
            onChangeText={setVacina}
          />
        </>
      )}

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Informações adicionais..."
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={salvarEvento}
      >
        <Text style={styles.saveText}>Salvar evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
    gap: 14,
    backgroundColor: "#F5F7F5"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 10
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333"
  },
  typeRow: {
    flexDirection: "row",
    gap: 10
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#8A9A90",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },
  selected: {
    backgroundColor: "#2D6A4F"
  },
  typeText: {
    color: "white",
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 16
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  saveButton: {
    backgroundColor: "#1B4332",
    padding: 17,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }
});