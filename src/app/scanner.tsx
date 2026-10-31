
import { useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet
} from "react-native";
import {
  CameraView,
  useCameraPermissions
} from "expo-camera";
import { useRouter } from "expo-router";

import { buscarAnimal } from "@/database/animalRepository";

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const scanning = useRef(false);

  function handleQRCode(data: string) {
    if (scanning.current) return;

    scanning.current = true;
    setScanned(true);

    if (!data.startsWith("bovino:")) {
      Alert.alert(
        "QR Code inválido",
        "Este código não pertence ao sistema.",
        [{
          text: "Tentar novamente",
          onPress: resetScanner
        }]
      );
      return;
    }

    const id = data.substring("bovino:".length);
    const animal = buscarAnimal(id);

    if (!animal) {
      Alert.alert(
        "Animal não encontrado",
        "Este bovino não está cadastrado neste dispositivo.",
        [{
          text: "Tentar novamente",
          onPress: resetScanner
        }]
      );
      return;
    }

    router.replace({
      pathname: "/animal/[id]",
      params: { id: animal.id }
    });
  }

  function resetScanner() {
    scanning.current = false;
    setScanned(false);
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Verificando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Precisamos acessar a câmera.</Text>
        <Button
          title="Permitir câmera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        active={!scanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"]
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => handleQRCode(data)
        }
      />

      <View style={styles.overlay}>
        <Text style={styles.text}>
          Aponte a câmera para o QR Code do bovino
        </Text>

        <Button
          title="Voltar"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black"
  },
  camera: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    gap: 15
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center"
  }
});
