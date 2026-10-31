
import { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet
} from "react-native";
import {
  CameraView,
  useCameraPermissions
} from "expo-camera";
import { useRouter } from "expo-router";

export default function ScannerScreen() {
  const router = useRouter();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [resultado, setResultado] = useState("");

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
        active={true}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"]
        }}
        onCameraReady={() => {
          console.log("Câmera inicializada!");
        }}
        onMountError={(error) => {
          console.log("Erro:", error.message);
        }}
        onBarcodeScanned={({ data }) => {
          setResultado(data);
        }}
      />

      <View style={styles.result}>
        <Text style={styles.resultText}>
          {resultado || "Aponte para um QR Code"}
        </Text>

        <Button
          title="Voltar ao início"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  result: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    gap: 10,
  },
  resultText: {
    color: "white",
    textAlign: "center",
  },
});
