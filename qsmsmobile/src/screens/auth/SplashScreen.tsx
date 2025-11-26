import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const navigation = useNavigation<any>();  // We'll properly type this later

  const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 2000);
    
    // Cleanup the timer when component unmounts
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <StatusBar style="auto" />

      <View className="w-full px-4 items-center">

        
        <Animated.View className="flex-row mb-4 justify-center items-center"  entering={FadeInRight.duration(100).springify()}>
         <View className="w-20 h-20 overflow-hidden">
           <Image
              source={require('../../../assets/images/logo.png')}
              contentFit="cover"
              transition={1000}
              placeholder={blurhash}
              style={{ width: '100%', height: '100%', flex: 1 }}
            />
         </View>
        </Animated.View>

        <Animated.View 
          className="flex-row justify-center items-center" 
          entering={FadeInRight.duration(100).delay(200).springify()}>
          <Text className="text-3xl text-[#005CFF] leading-[60px] pl-1 " style={{ fontFamily: 'PlusJakartaSansBoldItalic' }}>Quick</Text>
          <Text className="text-3xl text-neutral-600" style={{ fontFamily: 'PlusJakartaSans' }}>SMS</Text>

        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
