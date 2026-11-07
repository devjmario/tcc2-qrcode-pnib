import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  buscarAnimal,
  cadastrarAnimal,
  editarAnimal,
} from "@/database/animalRepository";

import {
  listarPropriedades,
  type Propriedade,
} from "@/database/cadastroRepository";

import { useAuth } from "@/contexts/AuthContext";

export default function CadastroAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const editando = typeof id === "string" && id.length > 0;

  const [identificacao, setIdentificacao] = useState("");
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [propriedadeId, setPropriedadeId] =
    useState<string | null>(null);

  const [propriedades, setPropriedades] =
    useState<Propriedade[]>([]);

  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const propriedadesUsuario = listarPropriedades().filter(
        (propriedade) => propriedade.usuario_id === user.id
      );

      setPropriedades(propriedadesUsuario);

      if (editando) {
        const animal = buscarAnimal(id);

        if (animal) {
          setIdentificacao(animal.identificacao);
          setNome(animal.nome || "");
          setRaca(animal.raca || "");
          setSexo(animal.sexo);
          setDataNascimento(animal.data_nascimento || "");
          setPropriedadeId(animal.propriedade_id);
        }
      }
    }, [id, editando, user?.id])
  );

  function salvar() {
    if (salvando) return;

    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    if (
      !identificacao.trim() ||
      !["M", "F"].includes(sexo)
    ) {
      Alert.alert(
        "Atenção",
        "Informe a identificação e selecione o sexo."
      );
      return;
    }

    const nascimento = dataNascimento.trim();

    if (nascimento) {
      const formato = /^\d{4}-\d{2}-\d{2}$/;

      if (!formato.test(nascimento)) {
        Alert.alert(
          "Data inválida",
          "Utilize o formato AAAA-MM-DD."
        );
        return;
      }

      const data = new Date(`${nascimento}T00:00:00Z`);

      if (
        Number.isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== nascimento
      ) {
        Alert.alert(
          "Data inválida",
          "Informe uma data de nascimento válida."
        );
        return;
      }
    }

    if (
      propriedadeId &&
      !propriedades.some((p) => p.id === propriedadeId)
    ) {
      Alert.alert(
        "Propriedade inválida",
        "Selecione uma propriedade cadastrada."
      );
      return;
    }

    const dados = {
      identificacao: identificacao.trim(),
      nome: nome.trim(),
      raca: raca.trim(),
      sexo,
      data_nascimento: nascimento || null,
      propriedade_id: propriedadeId,
    };

    try {
      setSalvando(true);

      if (editando) {
        const alteracoes = editarAnimal(id, dados, user.id);

        Alert.alert(
          "Cadastro atualizado",
          alteracoes > 0
            ? `${alteracoes} alteração(ões) registrada(s) no histórico.`
            : "Nenhuma informação foi modificada."
        );
      } else {
        cadastrarAnimal(dados);

        Alert.alert(
          "Sucesso",
          "Bovino cadastrado com sucesso!"
        );
      }

      router.back();
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Erro ao salvar",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o bovino."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {editando ? "Editar bovino" : "Novo bovino"}
      </Text>

      <Text style={styles.label}>Identificação *</Text>
      <TextInput
        style={styles.input}
        value={identificacao}
        onChangeText={setIdentificacao}
        placeholder="Ex.: BR-001"
      />

      <Text style={styles.label}>Nome ou apelido</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Mimosa"
      />

      <Text style={styles.label}>Raça</Text>
      <TextInput
        style={styles.input}
        value={raca}
        onChangeText={setRaca}
        placeholder="Ex.: Nelore"
      />

      <Text style={styles.label}>Sexo *</Text>

      <View style={styles.options}>
        {(["M", "F"] as const).map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[
              styles.option,
              sexo === opcao && styles.selected,
            ]}
            onPress={() => setSexo(opcao)}
          >
            <Text
              style={[
                styles.optionText,
                sexo === opcao && styles.selectedText,
              ]}
            >
              {opcao === "M" ? "Macho" : "Fêmea"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Data de nascimento (AAAA-MM-DD)
      </Text>
      <TextInput
        style={styles.input}
        value={dataNascimento}
        onChangeText={setDataNascimento}
        placeholder="2026-01-15"
      />

      <Text style={styles.sectionTitle}>
        Propriedade rural
      </Text>

      <Text style={styles.help}>
        Opcional. Selecione uma propriedade ou mantenha
        o animal sem vínculo.
      </Text>

      <TouchableOpacity
        style={[
          styles.property,
          propriedadeId === null && styles.selected,
        ]}
        onPress={() => setPropriedadeId(null)}
      >
        <Text
          style={[
            styles.optionText,
            propriedadeId === null && styles.selectedText,
          ]}
        >
          Sem propriedade vinculada
        </Text>
      </TouchableOpacity>

      {propriedades.map((propriedade) => (
        <TouchableOpacity
          key={propriedade.id}
          style={[
            styles.property,
            propriedadeId === propriedade.id &&
              styles.selected,
          ]}
          onPress={() => setPropriedadeId(propriedade.id)}
        >
          <Text
            style={[
              styles.optionText,
              propriedadeId === propriedade.id &&
                styles.selectedText,
            ]}
          >
            {propriedade.nome}
          </Text>

          <Text
            style={[
              styles.help,
              propriedadeId === propriedade.id &&
                styles.selectedText,
            ]}
          >
            {propriedade.municipio || "Município não informado"}
            {propriedade.uf ? ` - ${propriedade.uf}` : ""}
          </Text>
        </TouchableOpacity>
      ))}

      {propriedades.length === 0 && (
        <Text style={styles.help}>
          Você ainda não possui propriedades cadastradas.
          O bovino pode ser cadastrado normalmente.
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          salvando && styles.disabled,
        ]}
        disabled={salvando}
        onPress={salvar}
      >
        <Text style={styles.buttonText}>
          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alterações"
              : "Cadastrar bovino"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 50,
    gap: 12,
    backgroundColor: "#F5F7F5",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: "#1B4332",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4332",
    marginTop: 12,
  },
  help: {
    color: "#666",
    fontSize: 13,
    lineHeight: 19,
  },
  options: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCC",
    alignItems: "center",
  },
  optionText: {
    color: "#1B4332",
  },
  property: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCC",
    gap: 4,
  },
  selected: {
    backgroundColor: "#2D6A4F",
    borderColor: "#2D6A4F",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2D6A4F",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});