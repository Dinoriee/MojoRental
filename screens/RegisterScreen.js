import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import axios from 'axios';

const API_URL = 'http://192.168.0.116:8080/mojorental_api/'; 

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    ktp_number: '',
    address: ''
  });

  const [fontsLoaded] = useFonts({
          'Gajrajone': require('../assets/fonts/GajrajOne-Regular.ttf')
      });

  const handleRegister = async () => {
    // Validasi sederhana
    if (!form.name || !form.email || !form.password || !form.ktp_number) {
      Alert.alert('Error', 'Nama, Email, Password, dan No KTP wajib diisi!');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register.php`, form);

      if (response.data.status === 'success') {
        Alert.alert('Sukses', 'Registrasi berhasil, silakan login.');
        navigation.goBack(); 
      } else {
        Alert.alert('Gagal', response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Terjadi kesalahan jaringan.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{width:'50%', alignItems:'center', justifyContent:'center'}}>
        <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#440080', top:20, right:36}}>Mojo</Text>
        <Text style={{fontFamily:'Gajrajone', fontSize: 48, color:'#770AD7', bottom: 20, left: 24}}>Rental</Text>
      </View> 
      
      <TextInput placeholder="Nama Lengkap" style={styles.input} onChangeText={(t) => setForm({...form, name: t})} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={(t) => setForm({...form, email: t})} keyboardType="email-address" />
      <TextInput placeholder="Password" style={styles.input} onChangeText={(t) => setForm({...form, password: t})} secureTextEntry />
      <TextInput placeholder="No. Telepon" style={styles.input} onChangeText={(t) => setForm({...form, phone: t})} keyboardType="phone-pad" />
      <TextInput placeholder="No. KTP (Wajib)" style={styles.input} onChangeText={(t) => setForm({...form, ktp_number: t})} keyboardType="numeric" />
      <TextInput placeholder="Alamat Lengkap" style={styles.input} onChangeText={(t) => setForm({...form, address: t})} multiline />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Daftar Sekarang</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Sudah punya akun? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        flexGrow: 1,
        justifyContent: 'center', 
        padding: 20, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',       
      },

    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center' },

    input: { 
        borderWidth: 1, 
        width: '70%',
        borderColor: '#ccc', 
        padding: 10, 
        marginBottom: 15, 
        borderRadius: 8 },

    button: { 
        backgroundColor: '#007BFF',
        width: '70%', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' },

    buttonText: { 
        color: '#fff', 
        fontWeight: 'bold' },

    link: { 
        marginTop: 15, 
        color: '#007BFF', 
        textAlign: 'center', 
        marginBottom: 20 }
});