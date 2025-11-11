import { FontAwesome } from '@expo/vector-icons';
import * as font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    async function loadResources() {
      try {
        SplashScreen.preventAutoHideAsync();

        await font.loadAsync({
            PlusJakartaSans: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
            PlusJakartaSansExtrabold: require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
            PlusJakartaSansBold: require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
            PlusJakartaSansBoldItalic: require("../assets/fonts/PlusJakartaSans-BoldItalic.ttf"),
            PlusJakartaSansMedium: require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
            PlusJakartaSansMediumItalic: require("../assets/fonts/PlusJakartaSans-MediumItalic.ttf"),

            ...FontAwesome.font,
        });
      }
       catch (e) {
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResources();
  }, []);

  return isLoadingComplete;
}