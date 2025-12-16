import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native"; 
import { useFonts } from 'expo-font';

export default function SplashScreen ({ navigation }) {
  // 1. Load Font
  const [fontsLoaded] = useFonts({
    // Pastikan path '../assets/fonts/...' benar sesuai struktur foldermu
    'Gajrajone': require('../assets/fonts/GajrajOne-Regular.ttf')
  });
  
  const titleFade = useRef(new Animated.Value(0)).current;  
  const titleMoveX = useRef(new Animated.Value(-60)).current; 
  const subFade = useRef(new Animated.Value(0)).current;    
  const subMoveX = useRef(new Animated.Value(100)).current;  
  const exitScale = useRef(new Animated.Value(1)).current;  

  useEffect(() => {
    // Jalankan animasi HANYA JIKA font sudah loaded
    if (fontsLoaded) {
      Animated.sequence([
        // ... (Kode animasimu yang panjang tadi tetap sama) ...
        // TAHAP 1: MASUK
        Animated.parallel([
            Animated.timing(titleMoveX, { toValue: 0, duration: 400, useNativeDriver: true, friction: 6 }),
            Animated.timing(titleFade, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.sequence([
                Animated.delay(700), 
                Animated.parallel([
                    Animated.spring(subMoveX, { toValue: 0, duration: 400, useNativeDriver: true, friction: 6 }),
                    Animated.timing(subFade, { toValue: 1, duration: 800, useNativeDriver: true }),
                ]),
            ]),
        ]),
        // TAHAP 2: DIAM
        Animated.delay(1000),
        // TAHAP 3: KELUAR
        Animated.parallel([
            Animated.timing(exitScale, { toValue: 1.5, duration: 600, useNativeDriver: true }),
            Animated.timing(titleFade, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(subFade, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => {
        navigation.replace("Login");
      });
    }
  }, [fontsLoaded]); // Tambahkan dependency fontsLoaded agar useEffect jalan saat font siap

  // 2. CEK STATUS FONT SEBELUM RENDER
  if (!fontsLoaded) {
    return null; // Jangan render apapun kalau font belum siap
  }

  return (
    <View style={styles.container}>
      {/* OBJEK 1: JUDUL UTAMA */}
      <View style={{width:'50%', alignItems:'center'}}>
        <Animated.Text 
        style={[
          styles.title1, 
          { 
            opacity: titleFade,
            transform: [
              { translateX: titleMoveX }, 
              { scale: exitScale }        
            ] 
          }
        ]}
      >
        Mojo
      </Animated.Text>

      {/* OBJEK 2: SUBTITLE */}
      <Animated.Text 
        style={[
          styles.title2, 
          { 
            opacity: subFade,
            transform: [
              { translateX: subMoveX },   
              { scale: exitScale }       
            ] 
          }
        ]}
      >
        Rental
      </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title1: {
    fontSize: 48,
    color: "#440080", 
    fontFamily: 'Gajrajone', // Pastikan nama ini sama persis dengan key di useFonts
    top:20, 
    right:36,
  },
  title2: {
    fontSize: 48,
    color: "#770AD7", 
    fontFamily: 'Gajrajone',
    bottom:20, 
    left:24,
  },
});