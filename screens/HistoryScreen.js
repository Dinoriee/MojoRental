import React, { useState, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, 
  FlatList, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

// Ganti IP sesuai dengan ip yang dipakai
const API_URL = 'http://192.168.0.125:8080/mojorental_api';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fungsi Ambil Data History
    const fetchHistory = async () => {
        try {
            // Ambil ID user yang sedang login
            const userJson = await AsyncStorage.getItem('user');
            const user = JSON.parse(userJson);

            if (user) {
                const response = await axios.get(`${API_URL}/rentals.php?user_id=${user.id}`);
                setHistory(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    // Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
    };

    // Warna Badge Status
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: '#e6f4ea', text: 'green' };
            case 'pending': return { bg: '#fff3cd', text: '#856404' };
            case 'returned': return { bg: '#d6d8db', text: '#383d41' };
            default: return { bg: '#f8d7da', text: '#721c24' }; 
        }
    };

    // Render Item (Kartu History)
    const renderItem = ({ item }) => {
        const statusStyle = getStatusColor(item.status);

        return (
            <TouchableOpacity style={styles.kendaraanCard}>
                {/* GAMBAR */}
                <Image 
                    source={require('../assets/icon.png')}
                    style={styles.cardImage}
                />
                
                {/* DETAIL KENDARAAN */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>{item.vehicle_name}</Text>
                    
                    <View style={{flexDirection: 'row', width: '100%', justifyContent:'space-between', alignItems:'flex-start'}}>
                        {/* Menampilkan Brand dan Total Hari */}
                        <Text style={styles.brand}>{item.brand} • {item.total_days} Hari</Text>
                        
                        {/* Menampilkan Tanggal Mulai */}
                        <Text style={[styles.brand, {fontSize: 10}]}>{item.start_date}</Text>
                    </View>
                    
                    <Text style={styles.price}>{formatRupiah(item.total_price)}</Text>
                    
                    {/* Status Badge Dinamis */}
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{flex: 1, backgroundColor: '#f2f2f2'}}>
            {loading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.scrollContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <Text style={{textAlign: 'center', marginTop: 50, color: 'gray'}}>
                            Belum ada riwayat penyewaan.
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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
        marginBottom: 5
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
        fontWeight: 'bold'
    }
});