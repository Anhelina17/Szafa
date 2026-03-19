import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        setPhoto(photoData);

    }
  };

  if (photo) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={{ uri: photo.uri }} style={{ flex: 1 }} />
  
        <View style={{
          position: "absolute",
          bottom: 50,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around"
        }}>
          <TouchableOpacity onPress={() => setPhoto(null)}
          style={{
            backgroundColor: "#DDD5D0",
            padding: 15,
            borderRadius: 25,
            alignItems: "center"
          }}
          >
            <Text style={{ color: "black", fontSize: 18 }}>Usuń</Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => 
            router.push({
                pathname: "/photo-preview",
                params: { image: photo.uri }
            })
        }
        style={{
            backgroundColor: "#DDD5D0",
            padding: 15,
            borderRadius: 25,
            alignItems: "center"
        }}
        >
            <Text style={{ color: "black", fontSize: 18 }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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