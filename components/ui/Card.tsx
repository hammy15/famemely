import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  style,
}: CardProps) {
  const variantClasses = {
    default: 'bg-gray-800',
    elevated: 'bg-gray-800 shadow-lg',
    outlined: 'bg-transparent border border-gray-700',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
