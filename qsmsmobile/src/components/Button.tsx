import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  title?: string;
  action?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  action, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  className = '',
  textClassName = ''
}) => {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-500';
      case 'outline':
        return 'bg-transparent border border-[#1c3fa6]';
      default:
        return 'bg-[#1c3fa6]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'large':
        return 'py-4 px-6';
      default:
        return 'py-3 px-5';
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? 'text-[#1c3fa6]' : 'text-white';
  };

  const getDisabledStyles = () => {
    if (disabled) {
      return variant === 'outline' 
        ? 'border-gray-400 opacity-60' 
        : 'bg-gray-400 opacity-60';
    }
    return '';
  };

  return (
    <Pressable 
      className={`
        rounded-lg justify-center items-center
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${getDisabledStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      onPress={action}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#1c3fa6' : '#1c3fa6'} 
        />
      ) : (
        <Text className={`
          font-bold text-center
          ${getTextColor()}
          ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-lg'}
          ${textClassName}
        `}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;