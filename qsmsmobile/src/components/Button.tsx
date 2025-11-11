import React from 'react';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  title?: any;
  action?: () => void;
}
const Button: React.FC<ButtonProps> = ({ title, action }) => {
  return (
    <Pressable className='bg-[#8f1ca6] rounded-lg justify-center  items-center py-3' onPress={action}>
      <Text className='text-white font-bold text-lg text-center'>{title}</Text>
    </Pressable>
  );
};

export default Button;
