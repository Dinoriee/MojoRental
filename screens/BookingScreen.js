import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Ganti ip sesuai dengan ip yang digunakan
const API_URL = 'http://10.159.224.165/mojorental_api/';

export default function BookingScreen({ route, navigation }) {
  // Ambil data kendaraan yang dikirim dari ListKendaraan
  const { vehicle } = route.params;

  // State Form
  const [startDate, setStartDate] = useState(''); // Format: YYYY-MM-DD
  const [duration, setDuration] = useState('1');  // Default 1 hari
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Hitung Tanggal Kembali (End Date)
  const calculateEndDate = (start, days) => {
    if (!start || start.length !== 10) return '-';
    try {
      const result = new Date(start);
      result.setDate(result.getDate() + parseInt(days));
      return result.toISOString().split('T')[0]; // Ambil YYYY-MM-DD
    } catch (e) {
      return '-';
    }
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  // Logika Submit Booking
  const handleBooking = async () => {
    // Validasi Input
    if (!startDate || !duration) {
      Alert.alert("Mohon Lengkapi", "Tanggal mulai dan durasi sewa harus diisi.");
      return;
    }

    // Validasi Format Tanggal Sederhana (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
        Alert.alert("Format Salah", "Gunakan format tanggal: YYYY-MM-DD (Contoh: 2024-12-31)");
        return;
    }

    setLoading(true);

    try {
      // Ambil Data User yang sedang Login
      const userJson = await AsyncStorage.getItem('user');
      const user = JSON.parse(userJson);

      if (!user || !user.id) {
        Alert.alert("Error", "Sesi habis. Silakan login ulang.");
        navigation.replace('Login');
        return;
      }

      // Hitung Data Final
      const totalDays = parseInt(duration);
      const totalPrice = vehicle.price_per_day * totalDays;
      const endDate = calculateEndDate(startDate, totalDays);

      // Kirim ke API PHP
      const payload = {
        user_id: user.id,
        vehicle_id: vehicle.id,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        total_price: totalPrice,
        notes: notes
      };

      console.log("Mengirim Booking:", payload); 

      const response = await axios.post(`${API_URL}/create_rental.php`, payload);

      if (response.data.status === 'success') {
        Alert.alert(
            "Berhasil!", 
            "Pesanan Anda telah dibuat. Silakan cek menu History.",
            [{ text: "OK", onPress: () => navigation.navigate('MainMenu', {screen: 'History'}) }]
        );
      } else {
        Alert.alert("Gagal", response.data.message || "Terjadi kesalahan server.");
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* GAMBAR KENDARAAN */}
      <Image source={require('../assets/icon.png')} style={styles.headerImage} />

      <View style={styles.content}>
        {/* INFO KENDARAAN */}
        <Text style={styles.title}>{vehicle.name}</Text>
        <Text style={styles.subtitle}>{vehicle.brand} • {vehicle.type} • {vehicle.plate_number}</Text>
        <Text style={styles.price}>{formatRupiah(vehicle.price_per_day)} / hari</Text>

        <View style={styles.divider} />

        {/* FORM INPUT */}
        <Text style={styles.label}>Tanggal Mulai Sewa (YYYY-MM-DD)</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Contoh: 2024-12-01" 
            value={startDate}
            onChangeText={setStartDate}
        />

        <Text style={styles.label}>Durasi Sewa (Hari)</Text>
        <TextInput 
            style={styles.input} 
            placeholder="1" 
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
        />

        <Text style={styles.label}>Catatan Tambahan (Opsional)</Text>
        <TextInput 
            style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
            placeholder="Misal: Helm 2 buah, Jas Hujan..." 
            multiline
            value={notes}
            onChangeText={setNotes}
        />

        {/* RINGKASAN BIAYA */}
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
            
            <View style={styles.row}>
                <Text>Lama Sewa:</Text>
                <Text style={{fontWeight:'bold'}}>{duration} Hari</Text>
            </View>
            
            <View style={styles.row}>
                <Text>Tanggal Kembali:</Text>
                <Text style={{fontWeight:'bold'}}>{calculateEndDate(startDate, duration)}</Text>
            </View>
            
            <View style={[styles.divider, {marginVertical: 10}]} />
            
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total Bayar:</Text>
                <Text style={styles.totalValue}>
                    {formatRupiah(vehicle.price_per_day * (parseInt(duration) || 0))}
                </Text>
            </View>
        </View>

        {/* TOMBOL KONFIRMASI */}
        <TouchableOpacity 
            style={styles.button} 
            onPress={handleBooking} 
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.buttonText}>Konfirmasi Sewa</Text>
            )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerImage: { width: '100%', height: 200, resizeMode: 'cover', backgroundColor: '#ddd' },
  
  content: { padding: 20, paddingBottom: 50 },
  
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: 'gray', marginVertical: 5 },
  price: { fontSize: 18, color: 'blue', fontWeight: 'bold' },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#555' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15, 
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  
  summaryCard: {
    backgroundColor: '#e6f4ea',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c3e6cb'
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#155724' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: 'green' },
  
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});