import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function PerfilScreen() {
  const { user, signOut } = useAuth();

  function confirmarSaida() {
    Alert.alert(
      "Sair",
      "Deseja encerrar a sessão neste dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Meu perfil</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.nome}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.note}>
          Conta autenticada pela API. A sessão permanece
          disponível offline por até 30 dias.
          Alteração de perfil ainda não implementada.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={confirmarSaida}
      >
        <Text style={styles.buttonText}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7F5",
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    color: "#666",
    marginTop: 8,
  },
  value: {
    fontSize: 17,
    color: "#1B4332",
    marginTop: 4,
  },
  note: {
    marginTop: 20,
    color: "#666",
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});