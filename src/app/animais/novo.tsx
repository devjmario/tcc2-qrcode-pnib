import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { cadastrarAnimal } from "@/database/animalRepository";

export default function NovoAnimalScreen() {
  const router = useRouter();

  const [identificacao, setIdentificacao] = useState("");
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("");

  function salvar() {
    if (!identificacao.trim() || !["M", "F"].includes(sexo.toUpperCase())) {
      Alert.alert(
        "Atenção",
        "Informe a identificação e o sexo (M ou F)."
      );
      return;
    }

    try {
      cadastrarAnimal({
        identificacao: identificacao.trim(),
        nome: nome.trim(),
        raca: raca.trim(),
        sexo: sexo.toUpperCase()
      });

      Alert.alert("Sucesso", "Bovino cadastrado!");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o bovino.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo bovino</Text>

      <Text>Identificação *</Text>
      <TextInput
        style={styles.input}
        value={identificacao}
        onChangeText={setIdentificacao}
        placeholder="Ex.: BR-001"
      />

      <Text>Nome ou apelido</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Mimosa"
      />

      <Text>Raça</Text>
      <TextInput
        style={styles.input}
        value={raca}
        onChangeText={setRaca}
        placeholder="Ex.: Nelore"
      />

      <Text>Sexo *</Text>
      <TextInput
        style={styles.input}
        value={sexo}
        onChangeText={setSexo}
        placeholder="M ou F"
        autoCapitalize="characters"
        maxLength={1}
      />

      <Button title="Salvar bovino" onPress={salvar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
    paddingTop: 100,
    backgroundColor: "#F5F7F5",
    flexGrow: 1
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white"
  }
});
