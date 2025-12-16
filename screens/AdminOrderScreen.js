import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, RefreshControl 
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://10.159.224.165/mojorental_api/';

export default function AdminOrderScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil Data Pesanan
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin_rentals.php`);
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil data pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Fungsi Update Status
  const handleUpdateStatus = (id, newStatus) => {
    Alert.alert(
      "Konfirmasi", 
      `Ubah status menjadi ${newStatus}?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya", 
          onPress: async () => {
            try {
              await axios.post(`${API_URL}/update_rental_status.php`, {
                id: id,
                status: newStatus
              });
              fetchOrders(); 
              Alert.alert("Sukses", "Status berhasil diperbarui.");
            } catch (error) {
              Alert.alert("Error", "Gagal update status.");
            }
          } 
        }
      ]
    );
  };

  // Helper Warna Status
  const getStatusColor = (status) => {
    switch (status) {
        case 'active': return '#e6f4ea';
        case 'pending': return '#fff3cd'; 
        case 'canceled': return '#f8d7da'; 
        case 'returned': return '#d6d8db'; 
        default: return '#fff';
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: getStatusColor(item.status) }]}>
      
      {/* Header Card */}
      <View style={styles.rowBetween}>
        <Text style={styles.date}>{item.created_at}</Text>
        <Text style={{fontWeight: 'bold', textTransform: 'uppercase'}}>{item.status}</Text>
      </View>

      <Text style={styles.title}>{item.vehicle_name} ({item.plate_number})</Text>
      <Text style={styles.text}>Penyewa: {item.user_name}</Text>
      <Text style={styles.text}>HP: {item.phone}</Text>
      <Text style={styles.text}>Jadwal: {item.start_date} s/d {item.end_date}</Text>
      <Text style={styles.price}>Total: Rp {parseInt(item.total_price).toLocaleString()}</Text>

      {item.status === 'pending' && (
        <View style={styles.actionContainer}>
            <TouchableOpacity 
                style={[styles.btn, styles.btnReject]} 
                onPress={() => handleUpdateStatus(item.id, 'canceled')}
            >
                <Text style={styles.btnText}>Tolak</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.btn, styles.btnApprove]} 
                onPress={() => handleUpdateStatus(item.id, 'active')}
            >
                <Text style={styles.btnText}>Terima (Konfirmasi)</Text>
            </TouchableOpacity>
        </View>
      )}

      {item.status === 'active' && (
         <TouchableOpacity 
            style={[styles.btn, styles.btnReturn]} 
            onPress={() => handleUpdateStatus(item.id, 'returned')}
        >
            <Text style={styles.btnText}>Selesai / Dikembalikan</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pesanan Masuk</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada pesanan.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 },

  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 15,
    marginTop: 20, 
    textAlign: 'center' },

  card: { 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    elevation: 2 },

  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 },

  date: { 
    fontSize: 12, 
    color: '#666' },

  title: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#333' },

  text: { 
    fontSize: 14, 
    color: '#444', 
    marginBottom: 2 },

  price: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'blue', 
    marginVertical: 5 },
  
  actionContainer: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
     marginTop: 10, 
     gap: 10 },

  btn: { 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 5 },

  btnApprove: { 
    backgroundColor: '#28a745' },

  btnReject: { 
    backgroundColor: '#dc3545' },

  btnReturn: { 
    backgroundColor: '#6c757d', 
    marginTop: 10, 
    alignItems: 'center' },

  btnText: { 
    color: '#fff', 
    fontWeight: 'bold' },

  empty: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#999' }
});