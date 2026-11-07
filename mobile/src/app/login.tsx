import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;

    setBusy(true);

    try {
      await signIn(email.trim(), senha);
    } catch (error) {
      Alert.alert(
        "Não foi possível entrar",
        error instanceof Error
          ? error.message
          : "Erro inesperado"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.title}>Rastreabilidade Bovina</Text>

        <Text style={s.subtitle}>
          Entre uma vez com Internet. Sua sessão ficará
          disponível offline neste dispositivo por até 30 dias.
        </Text>

        <Text style={s.label}>E-mail</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={s.label}>Senha</Text>
        <TextInput
          style={s.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="current-password"
        />

        <TouchableOpacity
          disabled={busy}
          style={s.button}
          onPress={submit}
        >
          <Text style={s.buttonText}>
            {busy ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <Link href="/cadastro" style={s.link}>
          Não tem conta? Criar conta
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  content: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 12,
  },
  subtitle: {
    color: "#666",
    lineHeight: 21,
    marginBottom: 20,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    color: "#1B4332",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CDD7D0",
    borderRadius: 9,
    padding: 13,
  },
  button: {
    backgroundColor: "#2D6A4F",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#2D6A4F",
    marginTop: 22,
    fontWeight: "600",
  },
});