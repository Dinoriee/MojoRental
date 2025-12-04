import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({navigation, setIsLoggedIn}) {
    const [isFocused, setIsFocused] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [fontsLoaded] = useFonts({
        'Gajrajone': require('../assets/fonts/GajrajOne-Regular.ttf')
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    

    const handleLogin = async()=>{
        if (email === "admin@mail.com" && password === "12345") {
            await AsyncStorage.setItem("user", JSON.stringify({email}));
            setIsLoggedIn(true);
        } else {
            alert("Email atau Password yang anda masukkan salah");
        }
    }

    return (
        <View style={styles.container}>
            <View style={{width:'50%', alignItems:'center'}}>
                <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#440080', top:20, right:36}}>Mojo</Text>
                <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#770AD7', bottom: 20, left: 24}}>Rental</Text>
            </View> 
            <TextInput placeholder="Email" style={[styles.input, isFocused === 'email' && styles.inputFocused]} onFocus={() => setIsFocused('email')} onBlur={()=> setIsFocused(null)} value={email} onChangeText={setEmail}></TextInput>
            <TextInput placeholder="Password" secureTextEntry style={[styles.input, isFocused === 'password' && styles.inputFocused]} onFocus={() => setIsFocused('password')} onBlur={()=> setIsFocused(null)} value={password} onChangeText={setPassword}></TextInput>
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