import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, 
  FlatList, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import axios from 'axios';

// Ganti ip sesuai dengan ip yang digunakan
const API_URL = 'http://10.159.224.165/mojorental_api/';

export default function ListKendaraan({ navigation }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fungsi Ambil Data dari API
    const fetchVehicles = async () => {
        try {
            const response = await axios.get(`${API_URL}/vehicles.php`);
            const availableVehicles = response.data; 
            setVehicles(availableVehicles);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Gagal mengambil data kendaraan. Cek koneksi internet/server.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchVehicles();
    };

    // Fungsi Navigasi ke Halaman Booking
    const handleRent = (item) => {
        if (item.status === 'available') {
            navigation.navigate('Booking', { vehicle: item }); 
        } else {
            Alert.alert("Maaf", "Kendaraan ini sedang tidak tersedia.");
        }
    };

    // Render Item (Tampilan Kartu per Kendaraan)
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.kendaraanCard} onPress={() => handleRent(item)}>
            {/* GAMBAR */}
            <Image 
        source={{ uri: item.image_url }} 
        style={styles.cardImage}
    />
            
            {/* DETAIL KENDARAAN */}
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.brand}>{item.brand} • {item.type}</Text>
                
                {/* Format Rupiah */}
                <Text style={styles.price}>
                    Rp {parseInt(item.price_per_day).toLocaleString('id-ID')} / hari
                </Text>
                
                {/* Status Badge Dinamis */}
                <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.status === 'available' ? '#e6f4ea' : '#fce8e6' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'available' ? 'green' : 'red' }
                    ]}>
                        {item.status === 'available' ? 'Tersedia' : 'Disewa / Maintenance'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : (
                <FlatList
                    data={vehicles}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.scrollContainer}
                    ListEmptyComponent={
                        <Text style={{textAlign: 'center', marginTop: 50, color: 'gray'}}>
                            Tidak ada kendaraan tersedia saat ini.
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', 
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollContainer: { 
        paddingVertical: 20,
        alignItems: 'center', 
    },
    kendaraanCard: {
        width: '90%', 
        height: 120, 
        backgroundColor: 'white', 
        borderRadius: 15, 
        flexDirection: 'row', 
        marginBottom: 15, 
        
        // Shadow
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 4, 
        
        overflow: 'hidden' 
    },
    cardImage: {
        width: 120, 
        height: '100%', 
        resizeMode: 'cover', 
        backgroundColor: '#ddd' 
    },
    detailsContainer: {
        flex: 1, 
        padding: 10,
        justifyContent: 'center', 
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
        marginBottom: 5,
        textTransform: 'capitalize' 
    },
    price: {
        fontSize: 14,
        color: 'blue',
        fontWeight: 'bold'
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        alignSelf: 'flex-start', 
        marginTop: 5
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    }
});