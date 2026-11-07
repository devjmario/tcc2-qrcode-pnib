import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Alert } from "react-native";
import { sincronizarDados } from "../services/syncService";

export default function HomeScreen() {
  const router = useRouter();

  const [sincronizando, setSincronizando] = useState(false);

async function executarSincronizacao() {
  if (sincronizando) return;

  setSincronizando(true);

  try {
    const resultado = await sincronizarDados();

    Alert.alert(
      "Sincronização concluída",
      `Animais enviados: ${resultado.animaisEnviados}\n` +
      `Eventos enviados: ${resultado.eventosEnviados}`
    );
  } catch (error) {
    Alert.alert(
      "Falha na sincronização",
      error instanceof Error
        ? error.message
        : "Não foi possível conectar ao servidor."
    );
  } finally {
    setSincronizando(false);
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Rastreabilidade Bovina
      </Text>

      <Text style={styles.subtitle}>
        Sistema de registro individual de bovinos
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Identificação de animais
        </Text>

        <Text style={styles.description}>
          Aproxime a câmera do QR Code para
          identificar um animal.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/scanner")}
        >
          <Text style={styles.buttonText}>
            Ler QR Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/animais")}
        >
          <Text style={styles.buttonText}>
            Animais cadastrados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/perfil")}>
          <Text style={styles.buttonText}>Meu perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/propriedades")}>
          <Text style={styles.buttonText}>Minhas propriedades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            sincronizando && { opacity: 0.6 },
          ]}
          onPress={executarSincronizacao}
          disabled={sincronizando}
        >
          <Text style={styles.buttonText}>
            {sincronizando
              ? "Sincronizando..."
              : "Sincronizar dados"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B4332",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B4332",
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2D6A4F",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
