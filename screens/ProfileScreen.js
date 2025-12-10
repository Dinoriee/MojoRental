import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage({ logout }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ambil data user saat halaman dibuka
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                if (userJson) {
                    setUser(JSON.parse(userJson));
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Bagian Foto Profil */}
            <View style={{ position: 'relative', marginBottom: 20 }}>
                <View>
                    {/* Placeholder Foto (Bisa diganti jika nanti ada fitur upload) */}
                    <Image 
                        source={require('../assets/default-profile.jpg')} 
                        style={styles.profileImage} 
                    />
                    <TouchableOpacity style={styles.editIcon}>
                        <Image 
                            source={require('../assets/pencil.png')} 
                            style={{ width: '60%', height: '60%', resizeMode: 'contain', tintColor: 'white' }} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bagian Info User (Dinamis) */}
            <Text style={styles.nameText}>{user?.name || "Nama Pengguna"}</Text>
            <Text style={styles.emailText}>{user?.email || "email@contoh.com"}</Text>

            {/* Info Tambahan dalam Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>No. Telepon:</Text>
                    <Text style={styles.value}>{user?.phone || "-"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>No. KTP:</Text>
                    <Text style={styles.value}>{user?.ktp_number || "-"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Alamat:</Text>
                    <Text style={styles.value}>{user?.address || "-"}</Text>
                </View>
            </View>

            {/* Tombol Logout */}
            <TouchableOpacity 
                title="Log Out" 
                onPress={logout} 
                style={styles.logoutBtn}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Log Out</Text>
            </TouchableOpacity>

            {/* Credit Anggota Kelompok */}
            <View style={styles.creditContainer}>
                <Text style={styles.creditTitle}>Credit - Anggota Kelompok:</Text>
                <Text style={styles.creditText}>1. Dino Rosalino Yuswanto (23081010152)</Text>
                <Text style={styles.creditText}>2. Firdaus Hudri Harahap (23081010125)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff'
    },
    profileImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#ddd'
    },
    editIcon: {
        width: 32,
        height: 32,
        position: 'absolute',
        backgroundColor: 'purple',
        borderRadius: 16,
        bottom: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    emailText: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5
    },
    label: {
        fontWeight: 'bold',
        color: '#555'
    },
    value: {
        color: '#333',
        maxWidth: '60%',
        textAlign: 'right'
    },
    logoutBtn: {
        backgroundColor: "red",
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 30,
        paddingVertical: 10,
        width: '100%'
    },
    creditContainer: {
        marginTop: 30,
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        width: '100%'
    },
    creditTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'purple'
    },
    creditText: {
        fontSize: 12,
        color: 'gray'
    }
});