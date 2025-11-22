import { AntDesign } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../../constants/theme';
import Breaker from '../../ui/Breaker';
import Button from '../../ui/Button';
import ButtonOutline from '../../ui/ButtonOutline';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const WelcomeScreen = () => {

  const{ navigate: navigateAuth}: NavigationProp<AuthNavigationType> = useNavigation();
  // const{ navigate: navigateTab}: NavigationProp<TabNavigationType> = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.offwhite }}>
      <StatusBar style="auto" />

      <View style={{ width: '100%', paddingHorizontal: SIZES.medium, alignItems: 'center', gap: SIZES.medium, justifyContent: 'center', height: '100%' }}>

        {/* Logo */}
        <View style={{ width: '100%', paddingHorizontal: SIZES.medium, alignItems: 'center' }}>
            <Animated.View
              style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
              entering={FadeInRight.duration(100).springify()}
            >
              <View>
                <View style={{ width: 80, height: 80, overflow: 'hidden' }}>
                  <Image
                    source={require('../../../../assets/images/logo.png')}
                    contentFit="cover"
                    transition={1000}
                    placeholder={blurhash}
                    style={{ width: '100%', height: '100%', flex: 1 }}
                  />
                </View>
              </View>
            </Animated.View>
        </View>

        {/* Welcome Text */}
        <Animated.Text
          entering={FadeInDown.duration(500).delay(100).springify()}
          style={{
            fontSize: SIZES.xLarge,
            lineHeight: 60,
            color: COLORS.black,
            fontFamily: 'PlusJakartaSansBold',
            textAlign: 'center',
          }}
        >
          Welcome back 
        </Animated.Text>

        {/* Login and Sign Up */}
        <View style={{ width: '100%' }}>
          <Animated.View
            entering={FadeInDown.duration(500).delay(300).springify()}
            style={{ paddingBottom: SIZES.medium }}
          >
            <Button title="Login" action={()=> navigateAuth("Login")}/>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(400).springify()}
          >
            <ButtonOutline title="Sign Up" action={()=> navigateAuth("Register")}/>
          </Animated.View>
        </View>

        {/* Breaker */}
        <Breaker />

        {/* Third Party Auth */}
        <View style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Animated.View
                entering={FadeInDown.duration(100).delay(600).springify()}
                style={{ borderColor: COLORS.white, paddingBottom: 24 }}
              >
                <ButtonOutline title="Continue with Google">
                  <AntDesign
                    name="google"
                    size={SIZES.large}
                    color={COLORS.gray}
                  />
                </ButtonOutline>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.duration(500).delay(700).springify()}
              >
                <ButtonOutline title="Continue with Apple">
                  <AntDesign
                    name="apple"
                    size={SIZES.large}
                    color={COLORS.gray}
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