import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-screens';
import { useFonts } from 'expo-font';
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({navigation, logout}) {
    
    const [listService, setListService] = useState([]);

    const MENU_DATA = [
    {
        id: 'menu1',
        title: 'Promo',
        icon: require('../assets/icon/promo.png'), 
        targetScreen: 'Promo',
    },
    {
        id: 'menu2',
        title: 'Isi Ulang',
        icon: require('../assets/icon/Top Up.png'),
        targetScreen: 'IsiUlang',
    },
    {
        id: 'menu3',
        title: 'Tagihan',
        icon: require('../assets/icon/Pulsa.png'),
        targetScreen: 'Tagihan',
    },
    {
        id: 'menu4',
        title: 'Katalog',
        icon: require('../assets/icon/Katalog.png'),
        targetScreen: 'Katalog',
    },
    {
        id: 'menu5',
        title: 'Alat Dapur',
        icon: require('../assets/icon/Alat dapur.png'),
        targetScreen: 'KategoriDapur',
    },
    {
        id: 'menu6',
        title: 'Rumah Tangga',
        icon: require('../assets/icon/Rumah tangga.png'),
        targetScreen: 'KategoriRT',
    },
    {
        id: 'menu7',
        title: 'Voucher',
        icon: require('../assets/icon/Voucher.png'),
        targetScreen: 'Voucher',
    },
    {
        id: 'menu8',
        title: 'Lainnya',
        icon: require('../assets/icon/Lainnya.png'),
        targetScreen: 'SemuaKategori',
    },
];

    const [fontsLoaded] = useFonts({
            'Montserrat': require('../assets/fonts/Montserrat.ttf'),
            'Lexend': require('../assets/fonts/Lexend.ttf')
        });
    
        if (!fontsLoaded) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="blue" />
                </View>
            );
        }
    
    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
            <TextInput placeholder='Search' style={styles.searchBar}></TextInput>
            <View style={styles.quickNavContainer}>
                <TouchableOpacity style={{overflow:'hidden', height: '50%', alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../assets/banner.jpg')} style={{aspectRatio: 16/9, width:'100%', height:'100%' ,borderRadius: 12, position:'relative', overflow:'hidden'}}/>
                    <View style={{backgroundColor:'rgba(50, 50, 50, 0.8)', position:'absolute', bottom: 0, left: 0, height:'30%', right: 0, padding: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, justifyContent: 'center'}}>
                        <Text style={{fontSize: 16, color: 'white', fontWeight:'bold', flexWrap:'wrap', fontFamily: 'Lexend'}}>Promo Rental Hari Ini</Text>
                        <Text style={{flexWrap:'wrap', fontFamily: 'Lexend',}}>Dapatkan promo menarik di MojoRental</Text>
                    </View>
                </TouchableOpacity>
                <FlatList
                data={MENU_DATA}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                renderItem={({item})=>(
                    <TouchableOpacity style={styles.quickNav}>
                        <Image source={item.icon} style={{width: 56, height: 56}}/>
                        <Text style={{textAlign: 'center', flexWrap: 'wrap', fontFamily:'Lexend'}}>{item.title}</Text>
                    </TouchableOpacity>
                )}
                
                />
            </View>
            {listService.map((item, index)=> {
                return(
                    <TouchableOpacity key={item.id}>

                    </TouchableOpacity>
                )
            })}
        </ScrollView>
        </SafeAreaView>
        
    );
}

const styles = StyleSheet.create({
    container:
    { 
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    searchBar:{
        width: '70%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 12,
    },
    quickNavContainer:{
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    quickNav:{
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
})