import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className="relative">
            
            {/* Header */}

            <View className="w-full h-16 flex-row justify-between items-centerpx-4">
                
                <View className='w-3/4 flex-row space-x-2'>
                  <View className='justify-center items-center'>
                    <View className='h-12 w-12 rounded-2xl overflow-hidden'>
                      {/* <Avatar size={48} /> */}

                    </View>

                  </View>

                </View>
            </View>
        </View>
    </SafeAreaView>
  )
}

export default HomeScreen