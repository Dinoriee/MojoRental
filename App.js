import React, {useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, ActivityIndicator, View } from 'react-native'; // Tambahkan View & ActivityIndicator

// IMPORT SCREEN
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ListKendaraan from './screens/ListKendaraan';
import HistoryScreen from './screens/HistoryScreen';
import ProfilePage from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminVehicleScreen from './screens/AdminVehicleScreen';
import BookingScreen from './screens/BookingScreen';
import AdminOrderScreen from './screens/AdminOrderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Menu Tab Bawah (Khusus User Biasa)
function MainMenu({logout}) {
  return(
    <Tab.Navigator>
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} logout={logout}/>} 
      </Tab.Screen>
      <Tab.Screen name="List">
        {(props) => <ListKendaraan {...props} logout={logout}/>} 
      </Tab.Screen>
      <Tab.Screen name="History">
        {(props) => <HistoryScreen {...props} logout={logout}/>} 
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfilePage {...props} logout={logout}/>} 
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    checkLoginStatus();
  }, []);

  // Fungsi Cek Login & Cek Role
  const checkLoginStatus = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      const userData = JSON.parse(userJson);

      if (userData) {
        setLoggedIn(true);
        // Cek apakah emailnya admin
        if (userData.email === 'admin@mojorental.com') {
            setUserRole('admin');
        } else {
            setUserRole('user');
        }
      } else {
        setLoggedIn(false);
        setUserRole(null);
      }
    } catch (e) {
      console.log("Error check login:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); 
      setLoggedIn(false); 
      setUserRole(null);
    } catch (e) {
      console.log("Gagal logout: ", e);
    }
  };

  // Fungsi dipanggil setelah Login Berhasil di LoginScreen
  const handleLoginSuccess = () => {
    checkLoginStatus();
  };
  
  // Loading Screen
  if (isLoading) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="blue"/>
        </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        
        {isLoggedIn ? (
          // AREA SUDAH LOGIN 
          userRole === 'admin' ? (
            // Jika ADMIN -> Masuk ke AdminVehicleScreen
            <>
            <Stack.Screen name="AdminHome">
                {(props) => <AdminVehicleScreen {...props} logout={handleLogout} />}
            </Stack.Screen>

            <Stack.Screen
                name="AdminOrders"
                component={AdminOrderScreen}
                options={{title: 'Kelola Pesanan', headerShown: true}}
            />
            </>
          ) : (
          
            // Jika USER BIASA -> Masuk ke MainMenu (Tab)
          <>
            <Stack.Screen name="MainMenu">
              {(props) => <MainMenu {...props} logout={handleLogout}/>}
            </Stack.Screen>
            {/* Booking */}
            <Stack.Screen 
            name="Booking" 
            component={BookingScreen} 
            options={{ headerShown: true, title: 'Form Sewa' }} 
          />
          </>
          )
        ) : (
          // AREA BELUM LOGIN
          <>
          <Stack.Screen name="Login">
            {/* Pass handleLoginSuccess biar App.js tahu kapan harus refresh role */}
            {(props) => <LoginScreen {...props} setIsLoggedIn={handleLoginSuccess}/>}
          </Stack.Screen>
          <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});