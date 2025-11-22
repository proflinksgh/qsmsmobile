import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ButtonOutlineProps {
  title?: any;
  action?: () => void;
  children?: React.ReactNode;
}
const  ButtonOutline: React.FC<ButtonOutlineProps> = ({ title, action, children }: ButtonOutlineProps) => {
  return (
    <Pressable 
      className='border border-[#1c3fa6] rounded-lg justify-center  items-center py-3' 
      onPress={action}>

      {children && <View>{children}</View>}
      <Text className='text-[#1c3fa6] font-bold text-lg text-center'>{title}</Text>
    </Pressable>
  );
};

export default ButtonOutline;
