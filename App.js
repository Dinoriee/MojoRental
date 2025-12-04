import React, {useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ListKendaraan from './screens/ListKendaraan';
import HistoryScreen from './screens/HistoryScreen';
import ProfilePage from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
  const [isLoggedIn, setLoggedIn] = useState(null);

  useEffect(()=>{
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const user = await AsyncStorage.getItem("user");
    setLoggedIn(user ? true : false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user'); 

      setLoggedIn(false); 
    } catch (e) {
      console.log("Gagal logout: ", e);
    }
  };
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isLoggedIn ? (
          <Stack.Screen name="MainMenu">
            {(props) => <MainMenu {...props} logout={handleLogout}/>}
          </Stack.Screen>
        ) : (
          <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setLoggedIn}/>}
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
