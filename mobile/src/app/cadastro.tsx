import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { s } from "./login";

export default function Cadastro() {
  const { signUp } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;

    if (
      !nome.trim() ||
      !/^\S+@\S+\.\S+$/.test(email.trim()) ||
      senha.length < 10 ||
      senha !== confirmacao
    ) {
      Alert.alert(
        "Verifique os dados",
        "Informe nome, e-mail válido e senha de no mínimo 10 caracteres, com confirmação igual."
      );
      return;
    }

    setBusy(true);

    try {
      await signUp(nome, email.trim(), senha);
    } catch (error) {
      Alert.alert(
        "Erro no cadastro",
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
        <Text style={s.title}>Criar conta</Text>

        <Text style={s.subtitle}>
          É necessária conexão com a API para o cadastro inicial.
        </Text>

        <Text style={s.label}>Nome</Text>
        <TextInput
          style={s.input}
          value={nome}
          onChangeText={setNome}
          autoComplete="name"
        />

        <Text style={s.label}>E-mail</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={s.label}>Senha (mínimo 10 caracteres)</Text>
        <TextInput
          style={s.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="new-password"
        />

        <Text style={s.label}>Confirmar senha</Text>
        <TextInput
          style={s.input}
          value={confirmacao}
          onChangeText={setConfirmacao}
          secureTextEntry
        />

        <TouchableOpacity
          style={s.button}
          disabled={busy}
          onPress={submit}
        >
          <Text style={s.buttonText}>
            {busy ? "Cadastrando..." : "Criar conta"}
          </Text>
        </TouchableOpacity>

        <Link href="/login" style={s.link}>
          Já tem conta? Entrar
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}