
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRef, useState } from "react";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

import {
  Animal,
  buscarAnimal,
} from "@/database/animalRepository";

export default function DetalhesAnimalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const qrRef = useRef<ViewShot>(null);
  const [exportando, setExportando] = useState(false);

  const [animal] = useState<Animal | null>(() =>
    typeof id === "string" ? buscarAnimal(id) : null
  );

  async function salvarQRCode() {
    if (!animal || exportando) return;

    try {
      setExportando(true);

      const uri = await qrRef.current?.capture?.();

      if (!uri) {
        throw new Error("Não foi possível gerar a imagem.");
      }

      const arquivo = new File(
        Paths.cache,
        `bovino-${animal.id}.png`
      );

      const origem = new File(uri);
      origem.copy(arquivo);

      const disponivel = await Sharing.isAvailableAsync();

      if (!disponivel) {
        Alert.alert(
          "Indisponível",
          "O compartilhamento não está disponível neste dispositivo."
        );
        return;
      }

      await Sharing.shareAsync(arquivo.uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle: "Salvar ou compartilhar QR Code",
      });
    } catch (error) {
      console.error("Erro ao exportar QR Code:", error);

      Alert.alert(
        "Erro",
        "Não foi possível gerar a imagem do QR Code."
      );
    } finally {
      setExportando(false);
    }
  }

  if (!animal) {
    return (
      <View style={styles.container}>
        <Text>Animal não encontrado neste dispositivo.</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {animal.nome || "Bovino sem nome"}
      </Text>

      <View style={styles.card}>
        <Text>Identificação: {animal.identificacao}</Text>
        <Text>Raça: {animal.raca || "Não informada"}</Text>
        <Text>
          Sexo: {animal.sexo === "M" ? "Macho" : "Fêmea"}
        </Text>
        <Text>
          Nascimento: {animal.data_nascimento || "Não informado"}
        </Text>
      </View>

      <View style={styles.qrCard}>
        <Text style={styles.subtitle}>
          QR Code do bovino
        </Text>

        <ViewShot
          ref={qrRef}
          options={{
            format: "png",
            quality: 1,
          }}
        >
          <View
            collapsable={false}
            style={styles.qrExport}
          >
            <QRCode
              value={`bovino:${animal.id}`}
              size={220}
              backgroundColor="white"
              color="black"
            />

            <Text style={styles.qrLabel}>
              {animal.identificacao}
            </Text>
          </View>
        </ViewShot>

        <Text style={styles.caption}>
          Salve a imagem para imprimir ou compartilhar.
        </Text>

        <TouchableOpacity
          style={[
            styles.saveButton,
            exportando && { opacity: 0.6 },
          ]}
          disabled={exportando}
          onPress={salvarQRCode}
        >
          <Text style={styles.saveButtonText}>
            {exportando
              ? "Gerando imagem..."
              : "Salvar / Compartilhar QR Code"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Voltar à listagem"
        onPress={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 100,
    gap: 20,
    backgroundColor: "#F5F7F5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1B4332",
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "white",
    gap: 12,
  },
  qrCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    gap: 20,
  },
  subtitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1B4332",
  },
  qrExport: {
    padding: 24,
    backgroundColor: "white",
    alignItems: "center",
    gap: 14,
  },
  qrLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  caption: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2D6A4F",
    padding: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});
