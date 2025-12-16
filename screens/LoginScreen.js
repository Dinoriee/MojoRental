import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Sesuaikan ip dengan ip yang digunakan
const API_URL = 'http://10.159.224.165/mojorental_api/'; 

export default function LoginScreen({navigation, setIsLoggedIn}) {
    const [isFocused, setIsFocused] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [fontsLoaded] = useFonts({
        'Gajrajone': require('../assets/fonts/GajrajOne-Regular.ttf')
    });

    // Logika Login Baru (Menggunakan API)
    const handleLogin = async () => {
        // 1. Validasi Input Kosong
        if (!email || !password) {
            Alert.alert("Error", "Email dan Password wajib diisi!");
            return;
        }

        try {
            // 2. Kirim data ke Server
            console.log("Mengirim login...", email);
            const response = await axios.post(`${API_URL}/login.php`, {
                email: email,
                password: password
            });

            console.log("Respon:", response.data);

            // 3. Cek Respon Server
            if (response.data.status === 'success') {
                // Simpan data user ke HP
                await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
                
                // Beritahu App.js bahwa user sudah login
                setIsLoggedIn(true); 
            } else {
                // Jika password salah email tidak ditemukan
                Alert.alert("Gagal Login", response.data.message || "Email atau Password salah");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Network Error", "Gagal terhubung ke server. Cek koneksi internet/IP Address.");
        }
    }

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    // BAGIAN TAMPILAN
    return (
        <View style={styles.container}>
            <View style={{width:'50%', alignItems:'center'}}>
                <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#440080', top:20, right:36}}>Mojo</Text>
                <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#770AD7', bottom: 20, left: 24}}>Rental</Text>
            </View> 
            
            <TextInput 
                placeholder="Email" 
                style={[styles.input, isFocused === 'email' && styles.inputFocused]} 
                onFocus={() => setIsFocused('email')} 
                onBlur={()=> setIsFocused(null)} 
                value={email} 
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput 
                placeholder="Password" 
                secureTextEntry 
                style={[styles.input, isFocused === 'password' && styles.inputFocused]} 
                onFocus={() => setIsFocused('password')} 
                onBlur={()=> setIsFocused(null)} 
                value={password} 
                onChangeText={setPassword}
            />
            
            <View style={styles.forgotContainer}>
                <TouchableOpacity>
                    <Text style={styles.lupaText}>Lupa Password?</Text>
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            
            <View style={styles.signContainer}>
                <Text style={{color: 'gray'}} >Dont' have account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={{color:'blue', fontWeight:'bold'}}>Sign up Here</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={{margin: 6}}>Or Login With</Text>
            
            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity style={styles.loginOptionContainer}>
                    <Image source={require('../assets/google.png')} style={styles.loginImage}/>
                    <Text style={{fontWeight: 'bold'}}>Login With Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginOptionContainer}>
                    <Image source={require('../assets/twitter.png')} style={styles.loginImage}/>
                    <Text style={{fontWeight: 'bold'}}>Login With X</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginOptionContainer}>
                    <Image source={require('../assets/facebook.png')} style={styles.loginImage}/>
                    <Text style={{fontWeight: 'bold'}}>Login With Facebook</Text>
                </TouchableOpacity>
            </View>
        </View>
    );  
}

// BAGIAN STYLE
const styles = StyleSheet.create({
    container:
    { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input:{
        width: '70%',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        marginBottom: 10, 
    },
    inputFocused:{
        borderBottomColor: 'blue',
    },
    button:{
        width:'70%',
        height: '5%',
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        
    },
    buttonText:{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    forgotContainer: {
        width: '70%',
        alignItems: 'flex-end',
        marginBottom: 20,
        marginTop: 10,
    },
    lupaText: {
        color: 'gray',
        fontSize: 12,
    },
    signContainer:{
        width: '70%',
        alignItems:'flex-start',
        marginTop: 10,
    },
    loginOptionContainer:{
        width: '70%',
        borderRadius: 6,
        padding: 8,
        margin: 8,
        borderWidth: 1,
        borderColor: 'gray',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginImage:{
        width: 24,
        height: 24,
    }
});