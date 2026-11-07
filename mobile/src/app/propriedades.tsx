import { useCallback, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { cadastrarPropriedade, listarPropriedades, type Propriedade } from "../database/cadastroRepository";

export default function PropriedadesScreen() {
  const [lista, setLista] = useState<Propriedade[]>([]);
  const [nome, setNome] = useState(""); const [municipio, setMunicipio] = useState("");
  const [uf, setUf] = useState(""); const [endereco, setEndereco] = useState(""); const [codigo, setCodigo] = useState("");
  useFocusEffect(useCallback(() => { setLista(listarPropriedades()); }, []));
  function salvar() {
    if (!nome.trim() || !municipio.trim() || !/^[a-zA-Z]{2}$/.test(uf.trim())) return Alert.alert("Atenção", "Informe nome, município e UF com duas letras.");
    try { cadastrarPropriedade(nome, municipio, uf, endereco, codigo); setLista(listarPropriedades()); setNome(""); setMunicipio(""); setUf(""); setEndereco(""); setCodigo(""); Alert.alert("Propriedade", "Cadastro salvo localmente."); }
    catch (e) { Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao salvar."); }
  }
  return <SafeAreaView style={styles.container}><ScrollView keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Minhas propriedades</Text>
    {lista.map(p => <View key={p.id} style={{ backgroundColor: "white", padding: 14, marginBottom: 8, borderRadius: 10 }}><Text style={{ fontWeight: "bold", color: "#1B4332" }}>{p.nome}</Text><Text>{p.municipio}, {p.uf}</Text></View>)}
    <Text style={{ fontSize: 19, fontWeight: "bold", marginTop: 20 }}>Nova propriedade</Text>
    <Text style={styles.label}>Nome *</Text><TextInput style={styles.input} value={nome} onChangeText={setNome} />
    <Text style={styles.label}>Município *</Text><TextInput style={styles.input} value={municipio} onChangeText={setMunicipio} />
    <Text style={styles.label}>UF *</Text><TextInput style={styles.input} value={uf} onChangeText={setUf} maxLength={2} autoCapitalize="characters" />
    <Text style={styles.label}>Endereço</Text><TextInput style={styles.input} value={endereco} onChangeText={setEndereco} />
    <Text style={styles.label}>Código da propriedade (opcional)</Text><TextInput style={styles.input} value={codigo} onChangeText={setCodigo} />
    <TouchableOpacity style={styles.button} onPress={salvar}><Text style={styles.buttonText}>Cadastrar propriedade</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F5F7F5", padding: 20 }, title: { fontSize: 25, fontWeight: "bold", color: "#1B4332", marginBottom: 18 }, label: { fontSize: 15, marginTop: 12, marginBottom: 5, color: "#1B4332" }, input: { backgroundColor: "white", borderWidth: 1, borderColor: "#CDD7D0", borderRadius: 9, padding: 12 }, button: { backgroundColor: "#2D6A4F", padding: 16, borderRadius: 10, marginTop: 22, alignItems: "center" }, buttonText: { color: "white", fontWeight: "bold", fontSize: 16 } });