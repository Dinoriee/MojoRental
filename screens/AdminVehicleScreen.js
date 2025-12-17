import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, 
  Modal, Alert, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Animated, Image 
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; 

const SERVER_URL = 'http://192.168.0.116:8080';

// URL API
const API_URL = `${SERVER_URL}/mojorental_api/`;

// URL GAMBAR 
const IMAGE_URL_BASE = `${SERVER_URL}/MojoRental1/MojoRent/images/`;


// --- KOMPONEN KARTU KENDARAAN ---
const VehicleItem = ({ item, isActive, onPress, onEdit, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 60, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [isActive]);

  // LOGIKA URL GAMBAR
  const imageUrl = item.image_url 
    ? `${IMAGE_URL_BASE}${item.image_url}` 
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.id)} activeOpacity={0.9}>
        
        {/* BAGIAN KIRI: GAMBAR KENDARAAN */}
        <View style={styles.imageContainer}>
            {imageUrl ? (
                <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.cardImage} 
                    resizeMode="cover"
                    onError={(e) => console.log("Gagal memuat gambar:", imageUrl)} 
                />
            ) : (
                // Tampilan jika tidak ada gambar
                <View style={[styles.cardImage, styles.placeholderImage]}>
                    <Text style={{fontSize: 24}}>🛵</Text>
                </View>
            )}
            
            {/* Badge Status */}
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'available' ? '#28a745' : '#dc3545' }]}>
                <Text style={styles.statusText}>{item.status === 'available' ? 'Tersedia' : 'Disewa'}</Text>
            </View>
        </View>

        {/* BAGIAN TENGAH: INFORMASI */}
        <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.brand} | {item.type}</Text>
            
            <View style={styles.plateContainer}>
                <Text style={styles.cardPlate}>{item.plate_number}</Text>
            </View>
            
            <Text style={styles.cardPrice}>Rp {parseInt(item.price_per_day).toLocaleString()}/hari</Text>
        </View>

        {/* BAGIAN KANAN: TOMBOL EDIT & HAPUS */}
        <Animated.View pointerEvents={isActive ? "auto" : "none"} style={[styles.cardActions, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
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

// --- SCREEN UTAMA ADMIN ---
export default function AdminVehicleScreen({ navigation, logout }) {
  const [activeCardId, setActiveCardId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', brand: '', plate_number: '', price_per_day: '', type: '' });
  
  // State untuk Preview Gambar di Modal
  const [image, setImage] = useState(null);

  // FETCH DATA
  const fetchVehicles = async () => {
    try {
      // Tambah timestamp agar tidak kena cache data lama
      const response = await axios.get(`${API_URL}vehicles.php?t=${new Date().getTime()}`);
      setVehicles(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error Koneksi', `Gagal mengambil data dari ${API_URL}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchVehicles(); };
  const toggleCard = (id) => { setActiveCardId(activeCardId === id ? null : id); };

  // FUNGSI PILIH GAMBAR (Expo SDK 52)
  const pickImage = async () => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Izin Ditolak", "Mohon izinkan akses galeri.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], 
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        } 
    } catch (error) {
        Alert.alert("Error", error.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Konfirmasi Hapus', 'Hapus kendaraan ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          try { await axios.post(`${API_URL}delete_vehicle.php`, { id: id }); fetchVehicles(); } 
          catch (error) { Alert.alert('Error', 'Gagal menghapus data'); }
        } 
      }
    ]);
  };

  // FUNGSI SIMPAN (Create/Update) dengan FETCH
  const handleSave = async () => {
     if (!form.name || !form.brand || !form.plate_number || !form.price_per_day || !form.type) {
      Alert.alert('Peringatan', 'Semua kolom teks harus diisi!');
      return;
    }

    const endpoint = isEdit ? 'update_vehicle.php' : 'create_vehicle.php';
    const url = `${API_URL}${endpoint}`;
    
    const formData = new FormData();
    formData.append('id', form.id);
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('plate_number', form.plate_number);
    formData.append('price_per_day', form.price_per_day);
    formData.append('type', form.type);

    // Kirim gambar hanya jika user memilih file baru (bukan URL http)
    if (image && !image.startsWith('http')) {
        let filename = image.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let ext = match ? match[1].toLowerCase() : 'jpg';
        let fileType = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('image', { 
            uri: image, 
            name: filename, 
            type: fileType 
        });
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
        });

        const textResult = await response.text(); 
        const jsonResult = JSON.parse(textResult);

        if (jsonResult.status === 'success') {
            setModalVisible(false);
            fetchVehicles();
            Alert.alert('Sukses', 'Data berhasil disimpan!');
        } else {
            Alert.alert('Gagal', jsonResult.message || 'Server error');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Gagal menyimpan data. Cek koneksi.');
    }
  };

  const openAddModal = () => { 
      setForm({ id: '', name: '', brand: '', plate_number: '', price_per_day: '', type: '' }); 
      setImage(null); 
      setIsEdit(false); 
      setModalVisible(true); 
  };
  
  const openEditModal = (item) => {
    setForm({ id: item.id, name: item.name, brand: item.brand, plate_number: item.plate_number, price_per_day: item.price_per_day.toString(), type: item.type });
    // Tampilkan gambar lama di modal jika ada
    if (item.image_url) {
        setImage(`${IMAGE_URL_BASE}${item.image_url}`);
    } else {
        setImage(null);
    }
    setIsEdit(true); 
    setModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    Alert.alert("Keluar", "Yakin ingin keluar?", [
        { text: "Batal", style: "cancel" },
        { text: "Ya", onPress: logout, style: "destructive" }
      ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Kelola Data Kendaraan</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3498db" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <VehicleItem 
                item={item} 
                isActive={item.id === activeCardId} 
                onPress={toggleCard} 
                onEdit={openEditModal} 
                onDelete={handleDelete} 
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }} 
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data kendaraan.</Text>}
        />
      )}

      {/* FOOTER NAVIGATION */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.bottomBtn, styles.addBtn]} onPress={openAddModal}>
            <Text style={styles.bottomBtnText}>+ Unit Baru</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: '#f1c40f'}]} onPress={() => navigation.navigate('AdminOrders')}>
            <Text style={[styles.bottomBtnText, {color: '#000'}]}>Pesanan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomBtn, styles.logoutBtn]} onPress={handleLogoutConfirm}>
            <Text style={styles.bottomBtnText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL INPUT FORM */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                
                <Text style={styles.label}>Foto Kendaraan</Text>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Text style={{ fontSize: 30 }}>📷</Text>
                            <Text style={{ color: '#aaa' }}>Upload Foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

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
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                    <Text style={styles.modalBtnText}>Simpan</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f6fa', 
    paddingTop: 20 },

  header: { 
    marginBottom: 15, 
    marginTop: 30, 
    paddingHorizontal: 20, 
    alignItems: 'center' },

  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2c3e50' },

  headerSubtitle: { 
    fontSize: 14, 
    color: '#7f8c8d' },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 12, 
    marginHorizontal: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 110,
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: {width:0, height:2}, 
    elevation: 3,
    overflow: 'hidden'},

  imageContainer: { 
    width: 110, 
    height: '100%', 
    position: 'relative', 
    backgroundColor: '#eee' },

  cardImage: { 
    width: '100%', 
    height: '100%' },

  placeholderImage: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#ddd' },

  statusBadge: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    paddingVertical: 3, 
    alignItems: 'center' },

  statusText: { 
    color: '#fff', 
    fontSize: 9, 
    fontWeight: 'bold' },

  cardInfo: { 
    flex: 1, 
    padding: 10, 
    justifyContent: 'center' },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2c3e50', 
    marginBottom: 2 },

  cardSubtitle: { 
    fontSize: 12, 
    color: '#7f8c8d', 
    marginBottom: 4 },
  plateContainer: { 
    backgroundColor: '#ecf0f1', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 6, 
    borderRadius: 4, 
    marginBottom: 4 },

  cardPlate: { 
    fontSize: 11, 
    color: '#2c3e50', 
    fontWeight: 'bold' },

  cardPrice: { 
    fontSize: 14, 
    color: '#27ae60', 
    fontWeight: 'bold' },

  cardActions: { 
    flexDirection: 'column', 
    paddingRight: 10, 
    gap: 8 },

  editBtn: { 
    backgroundColor: '#f39c12', 
    padding: 6, 
    borderRadius: 6, 
    width: 60, 
    alignItems: 'center' },

  deleteBtn: { 
    backgroundColor: '#e74c3c', 
    padding: 6, 
    borderRadius: 6, 
    width: 60, 
    alignItems: 'center' },

  btnText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: 'bold' },

  bottomContainer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    flexDirection: 'row', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#ddd', 
    gap: 10 },

  bottomBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center'},

  addBtn: { 
    backgroundColor: '#2ecc71' },

  logoutBtn: { 
    backgroundColor: '#e74c3c' },

  bottomBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 },

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
    marginBottom: 20 },

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
  
  imagePicker: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 160, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 8, 
    marginBottom: 15, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#ddd' },
  
  modalButtons: { 
    flexDirection: 'row', 
    marginTop: 10, 
    gap: 10 },
  
  modalBtn: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' },
 
  cancelBtn: { 
    backgroundColor: '#95a5a6' },

  saveBtn: { 
    backgroundColor: '#3498db' },

  modalBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 },

  emptyText: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#999' },
});