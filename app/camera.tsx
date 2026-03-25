import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const [photo, setPhoto] = useState<any>(null);
  

  useEffect(() => {
    (async () => {const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");})();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {const photoData = await cameraRef.current.takePictureAsync();
      router.push({
        pathname: "/photoPreview",
        params: { uri: photoData.uri }
      });

    }
  };


  return (
    <View style={{ flex: 1 }}>
    <CameraView ref={cameraRef} style={{ flex: 1 }} />
    <TouchableOpacity onPress={takePicture} style={styles.shutterButton}>
  <View style={styles.outerCircle}>
    <View style={styles.innerCircle} />
  </View>
</TouchableOpacity>
    </View>
  );

}

const styles = StyleSheet.create({
    shutterButton: {
      position: "absolute",
      bottom: 40,
      alignSelf: "center",
    },
  
    outerCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: "white",
      justifyContent: "center",
      alignItems: "center",
    },
  
    innerCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "white",
    },
  });