import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

export default function ProfilePage({logout}) {
    

    return(
        <View style={{flex: 1, alignItems: 'center', margin: 32}}>
            <View style={{position:'relative'}}>
                <View>
                <Image source={require('../assets/default-profile.jpg')} style={{width: 128, height: 128, borderRadius: 64}}/>
                <TouchableOpacity style={{width:32, height:32, position:'absolute', backgroundColor:'purple', borderRadius: 16, objectFit:'contain', bottom:0, right:0, alignItems: 'center', justifyContent:'center'}}>
                    <Image source={require('../assets/pencil.png')} style={{ width:'60%', height:'60%', resizeMode:'contain', tintColor:'white'}}/>
                </TouchableOpacity>
            </View>
            </View>
            <Text style={{margin: 8, fontSize: 24, fontWeight: 'bold'}}>Dino Rosalino</Text>
            <TouchableOpacity title="Log Out" onPress={logout} style={{backgroundColor:"red", alignItems:'center', justifyContent:'center', borderRadius: 8, paddingHorizontal:30, paddingVertical: 10,marginTop:30}}>
                <Text style={{color:'white', fontWeight:'bold'}}>Log Out</Text>
            </TouchableOpacity>
        </View>
    )
}