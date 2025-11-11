import { AntDesign } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Breaker from '../../Breaker';
import Button from '../../Button';
import ButtonOutline from '../../ButtonOutline';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const WelcomeScreen = () => {

  const{ navigate: navigateAuth}: NavigationProp<AuthNavigationType> = useNavigation();
  // const{ navigate: navigateTab}: NavigationProp<TabNavigationType> = useNavigation();

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <StatusBar style="auto" />

      <View className="w-full px-4 items-center space-y-8 justify-center h-full">

        {/* Logo */}
        <View className="w-full px-4 items-center">
            <Animated.View
              className="flex-row justify-center items-center"
              entering={FadeInRight.duration(100).springify()}
            >
              <View>
                <View className="w-20 h-20 overflow-hidden ">
                  <Image
                    source={require('../../../../assets/images/logo.png')}
                    style={{ width: 96, height: 96 }}
                    contentFit="cover"
                    transition={1000}
                    placeholder={blurhash}
                    className='w-full h-full flex-1'
                  />
                </View>
              </View>
            </Animated.View>
        </View>


        {/* <Animated.View
          entering={FadeInRight.duration(500).springify()}
          className="flex-row mb-4 justify-center items-center"
        >
          <View className="w-20 h-20 overflow-hidden rounded-full">
            <Image
              source={require('../../../../assets/images/logo.png')}
              placeholder={blurhash}
              contentFit="cover"
              transition={1000}
              className="w-full h-full"
            />
          </View>
        </Animated.View> */}

        {/* Welcome Text */}
        <Animated.Text
          entering={FadeInDown.duration(500).delay(100).springify()}
          className="text-3xl leading-[60px] text-black"
          style={{
            fontFamily: 'PlusJakartaSansBold',
          }}
        >
          Welcome
        </Animated.Text>

        {/* Login and Sign Up */}
        <View className="w-full">
          <Animated.View
            entering={FadeInDown.duration(500).delay(300).springify()}
            className="pb-4"
          >
            <Button title="Login" />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(400).springify()}
          >
            <ButtonOutline title="Sign Up" />
          </Animated.View>
        </View>

        {/* Breaker */}
        <Breaker />

        {/* Third Party Auth */}
        <View className="w-full justify-normal">
              <Animated.View
                entering={FadeInDown.duration(100).delay(600).springify()}
                className="border border-white pb-6"
              >
                <ButtonOutline title="Continue with Google">
                  <AntDesign
                    name="google"
                    size={20}
                    color="gray"
                    
                  />
                </ButtonOutline>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(500).delay(700).springify()}
              >
                <ButtonOutline title="Continue with Apple">
                  <AntDesign
                    name="apple"
                    size={20}
                    color="gray"
                    style={{ marginRight: 8 }}
                  />
                </ButtonOutline>
              </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
