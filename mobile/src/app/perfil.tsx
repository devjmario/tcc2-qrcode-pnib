import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { obterUsuario, salvarUsuario } from "../database/cadastroRepository";

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState(() => obterUsuario());
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [telefone, setTelefone] = useState(usuario?.telefone ?? "");
  function salvar() {
    if (!nome.trim()) return Alert.alert("Atenção", "Informe seu nome.");
    try { salvarUsuario(nome, email, telefone); setUsuario(obterUsuario()); Alert.alert("Perfil", "Dados salvos no dispositivo."); }
    catch (e) { Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao salvar."); }
  }
  return <SafeAreaView style={styles.container}><ScrollView keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Meu perfil</Text>
    <Text style={styles.label}>Nome *</Text><TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />
    <Text style={styles.label}>E-mail</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="email@exemplo.com" />
    <Text style={styles.label}>Telefone</Text><TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
    <TouchableOpacity style={styles.button} onPress={salvar}><Text style={styles.buttonText}>Salvar perfil</Text></TouchableOpacity>
    <Text style={{ marginTop: 18, color: "#666" }}>Perfil local, sem autenticação. A sincronização de usuários será implementada em uma próxima etapa.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F5F7F5", padding: 20 }, title: { fontSize: 25, fontWeight: "bold", color: "#1B4332", marginBottom: 18 }, label: { fontSize: 15, marginTop: 12, marginBottom: 5, color: "#1B4332" }, input: { backgroundColor: "white", borderWidth: 1, borderColor: "#CDD7D0", borderRadius: 9, padding: 12 }, button: { backgroundColor: "#2D6A4F", padding: 16, borderRadius: 10, marginTop: 22, alignItems: "center" }, buttonText: { color: "white", fontWeight: "bold", fontSize: 16 } });