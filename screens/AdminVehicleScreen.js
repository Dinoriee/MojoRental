import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, 
  Modal, Alert, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Animated
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";

// Ganti IP sesuai IP yang digunakan
const API_URL = 'http://192.168.1.218/mojorental_api/';

// --- 1. KOMPONEN TERPISAH UNTUK ITEM KENDARAAN (AGAR ANIMASI BERJALAN PER ITEM) ---
// --- 1. KOMPONEN TERPISAH (PERBAIKAN) ---
const VehicleItem = ({ item, isActive, onPress, onEdit, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    if (isActive) {
      // ANIMASI MASUK
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0, 
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, 
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // ANIMASI KELUAR
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 60, // Balikin ke posisi awal (60) bukan -60 biar rapi
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isActive]);

  return (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress(item.id)}
        activeOpacity={0.9}
    >
        <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.brand} | {item.type}</Text>
            <Text style={styles.cardPrice}>Rp {parseInt(item.price_per_day).toLocaleString()}/hari</Text>
            <Text style={styles.cardPlate}>{item.plate_number}</Text>
        </View>
        
        {/* HAPUS {isActive && (...)} */}
        {/* Biarkan Animated.View selalu di-render */}
        <Animated.View 
            // Tambahkan pointerEvents="box-none" agar saat invisible tidak menghalangi sentuhan
            pointerEvents={isActive ? "auto" : "none"} 
            style={[
                styles.cardActions, 
                { 
                    opacity: fadeAnim, 
                    transform: [{ translateX: slideAnim }] 
                }
            ]}
        >
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
                <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                <Text style={styles.btnText}>Hapus</Text>
            </TouchableOpacity>
        </Animated.View>
    </TouchableOpacity>
  );
};

// --- 2. SCREEN UTAMA ---
export default function AdminVehicleScreen({ navigation, logout }) {
  const [activeCardId, setActiveCardId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', brand: '', plate_number: '', price_per_day: '', type: '' });

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles.php`);
      setVehicles(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil data kendaraan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchVehicles(); };

  const toggleCard = (id) => {
    // Logic toggle: kalau diklik lagi item yang sama -> tutup, kalau beda -> ganti
    if (activeCardId === id) {
        setActiveCardId(null);
    } else {
        setActiveCardId(id);
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert("Konfirmasi Keluar", "Apakah Anda yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logout, style: "destructive" }
      ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Konfirmasi Hapus', 'Yakin ingin menghapus kendaraan ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await axios.post(`${API_URL}/delete_vehicle.php`, { id: id }); fetchVehicles(); Alert.alert('Sukses', 'Data dihapus'); } 
          catch (error) { Alert.alert('Error', 'Gagal menghapus data'); }
        } 
      }
    ]);
  };

  const handleSave = async () => {
     if (!form.name || !form.brand || !form.plate_number || !form.price_per_day || !form.type) {
      Alert.alert('Peringatan', 'Semua kolom harus diisi!');
      return;
    }
    const endpoint = isEdit ? '/update_vehicle.php' : '/create_vehicle.php';
    try {
      await axios.post(`${API_URL}${endpoint}`, form);
      setModalVisible(false);
      fetchVehicles();
      Alert.alert('Sukses', isEdit ? 'Data diperbarui' : 'Kendaraan ditambahkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data.');
    }
  };

  const openAddModal = () => { setForm({ id: '', name: '', brand: '', plate_number: '', price_per_day: '', type: '' }); setIsEdit(false); setModalVisible(true); };
  
  const openEditModal = (item) => {
    setForm({ id: item.id, name: item.name, brand: item.brand, plate_number: item.plate_number, price_per_day: item.price_per_day.toString(), type: item.type });
    setIsEdit(true); setModalVisible(true);
  };


  const renderItem = ({ item }) => (
    <VehicleItem 
        item={item}
        isActive={item.id === activeCardId}
        onPress={toggleCard}
        onEdit={openEditModal}
        onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Kelola Data Kendaraan</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 20 }} 
          style={{flex: 1}}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data kendaraan.</Text>}
        />
      )}

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.bottomBtn, styles.addBtn]} onPress={openAddModal}>
            <Text style={styles.bottomBtnText}>+ Unit Baru</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBtn, { backgroundColor: '#FFC107'}]}
          onPress={() => navigation.navigate('AdminOrders')}>
            <Text style={[styles.bottomBtnText, {color: '#000'}]}>Pesanan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bottomBtn, styles.logoutBtn]} onPress={handleLogoutConfirm}>
            <Text style={styles.bottomBtnText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL FORM */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Nama Kendaraan</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={(t)=>setForm({...form, name: t})} />
                <Text style={styles.label}>Merk / Brand</Text>
                <TextInput style={styles.input} value={form.brand} onChangeText={(t)=>setForm({...form, brand: t})} />
                <Text style={styles.label}>Tipe (Motor / Mobil)</Text>
                <TextInput style={styles.input} value={form.type} onChangeText={(t)=>setForm({...form, type: t})} />
                <Text style={styles.label}>Plat Nomor</Text>
                <TextInput style={styles.input} value={form.plate_number} onChangeText={(t)=>setForm({...form, plate_number: t})} autoCapitalize="characters" />
                <Text style={styles.label}>Harga Sewa (Rp)</Text>
                <TextInput style={styles.input} value={form.price_per_day} onChangeText={(t)=>setForm({...form, price_per_day: t})} keyboardType="numeric" />
            </ScrollView>
            <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}><Text style={styles.modalBtnText}>Batal</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}><Text style={styles.modalBtnText}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f2f2f2', 
    paddingTop: 20 
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10, 
    marginTop: 30,
    paddingHorizontal: 20
  }, 

  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'center' 
  },

  headerSubtitle: { 
    fontSize: 14, 
    color: '#666',
    textAlign: 'center'
  },
  
  bottomContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 10, 
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    height: '20%',
    top: 50
  },

  bottomBtn: {
    flex: 1, 
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },

  addBtn: { 
    backgroundColor: '#28a745', 
  },

  logoutBtn: { 
    backgroundColor: '#dc3545', 
  },

  bottomBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },

  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 12, 
    marginHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 2,
    overflow: 'hidden', 
  },

  cardInfo: { 
    flex: 1 },

  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' },

  cardSubtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4 },

  cardPrice: { 
    fontSize: 16, 
    color: 'green', 
    fontWeight: 'bold' },

  cardPlate: { 
    fontSize: 12, 
    color: '#999', 
    marginTop: 2 },

  cardActions: { 
    marginLeft: 10,
    flexDirection: 'column',
  },

  editBtn: { 
    backgroundColor: '#FFC107', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    marginBottom: 8, 
    alignItems: 'center' },

  deleteBtn: { 
    backgroundColor: '#DC3545', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignItems: 'center' },

  btnText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold' },

  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#999' },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 },

  modalContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20,
    maxHeight: '90%' },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 20, 
    color: '#333' },

  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#555', 
    marginBottom: 5 },

  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 15, 
    fontSize: 16 },

  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 },

  modalBtn: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginHorizontal: 5 },

  cancelBtn: { 
    backgroundColor: '#6c757d' },

  saveBtn: { 
    backgroundColor: '#007BFF' },
    
  modalBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 },
});