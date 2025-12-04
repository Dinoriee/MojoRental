import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

export default function ListKendaraan() {
    return(
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            
            {/* CARD 1 */}
            <TouchableOpacity style={styles.kendaraanCard}>
                {/* 1. BAGIAN KIRI: GAMBAR */}
                <Image 
                    source={require('../assets/icon.png')} // Nanti ganti gambar motor
                    style={styles.cardImage}
                />
                
                {/* 2. BAGIAN KANAN: DETAIL KENDARAAN */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>Honda Vario 160</Text>
                    <Text style={styles.brand}>Honda • Matic</Text>
                    <Text style={styles.price}>Rp 75.000 / hari</Text>
                    
                    {/* Contoh Status */}
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Tersedia</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* CARD 2 (Contoh duplikasi biar kelihatan listnya) */}
            <TouchableOpacity style={styles.kendaraanCard}>
                <Image source={require('../assets/icon.png')} style={styles.cardImage}/>
                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>Toyota Avanza</Text>
                    <Text style={styles.brand}>Toyota • Manual</Text>
                    <Text style={styles.price}>Rp 350.000 / hari</Text>
                </View>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { 
        paddingVertical: 20,
        alignItems: 'center', // Agar card berada di tengah layar secara horizontal
    },
    kendaraanCard: {
        width: '90%', // Lebar card 90% dari layar
        height: 120, // Tinggi fix biar rapi (opsional, bisa auto)
        backgroundColor: 'white', // Ganti gray jadi putih biar bersih
        borderRadius: 15, // Sudut membulat
        flexDirection: 'row', // PENTING: Susun ke samping
        marginBottom: 15, // Jarak antar card
        
        // Shadow (Bayangan) biar card terlihat mengambang
        elevation: 5, // Android
        shadowColor: '#000', // iOS
        shadowOffset: { width: 0, height: 2 }, // iOS
        shadowOpacity: 0.2, // iOS
        shadowRadius: 4, // iOS
        
        overflow: 'hidden' // PENTING: Agar gambar tidak "bocor" keluar dari borderRadius
    },
    cardImage: {
        width: 120, // Lebar gambar fix
        height: '100%', // Tinggi mengikuti tinggi card
        resizeMode: 'cover', // Agar gambar penuh tanpa gepeng
        backgroundColor: '#ddd' // Placeholder warna kalau gambar loading
    },
    detailsContainer: {
        flex: 1, // Mengambil sisa ruang di sebelah kanan
        padding: 10,
        justifyContent: 'center', // Teks vertikal di tengah
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2
    },
    brand: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 5
    },
    price: {
        fontSize: 14,
        color: 'blue',
        fontWeight: 'bold'
    },
    statusBadge: {
        backgroundColor: '#e6f4ea',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        alignSelf: 'flex-start', // Agar badge tidak melebar full
        marginTop: 5
    },
    statusText: {
        color: 'green',
        fontSize: 10,
        fontWeight: 'bold'
    }
});