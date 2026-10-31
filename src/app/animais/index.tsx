import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import {
  Animal,
  listarAnimais
} from "@/database/animalRepository";

export default function AnimaisScreen() {
  const router = useRouter();
  const [animais, setAnimais] = useState<Animal[]>([]);

  useFocusEffect(
    useCallback(() => {
      setAnimais(listarAnimais());
    }, [])
  );

  return (
    <View style={styles.container}>
      <Button
        title="Cadastrar novo bovino"
        onPress={() => router.push("/animais/novo")}
      />

      <FlatList
        data={animais}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum bovino cadastrado.
          </Text>
        }
        
        renderItem={({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
            router.push({
                pathname: "/animal/[id]",
                params: { id: item.id }
            })
            }
        >
            <Text style={styles.name}>
            {item.nome || "Bovino sem nome"}
            </Text>

            <Text>Identificação: {item.identificacao}</Text>
            <Text>Raça: {item.raca || "Não informada"}</Text>
            <Text>Sexo: {item.sexo}</Text>

            <Text style={{ color: "#2D6A4F", marginTop: 8 }}>
            Toque para visualizar o QR Code
            </Text>
        </TouchableOpacity>
        )}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    padding: 20,
    gap: 20,
    backgroundColor: "#F5F7F5"
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4332"
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666"
  }
});
