import { View, Text, Image } from 'react-native';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeColor?: string;
}

export default function Avatar({
  name,
  imageUrl,
  size = 'md',
  showBadge = false,
  badgeColor = '#22c55e',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const badgeSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  };

  return (
    <View className="relative">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className={`${sizeClasses[size]} rounded-full`}
        />
      ) : (
        <View
          className={`${sizeClasses[size]} rounded-full bg-primary-500 items-center justify-center`}
        >
          <Text className={`text-white font-bold ${textSizeClasses[size]}`}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showBadge && (
        <View
          className={`absolute bottom-0 right-0 ${badgeSizeClasses[size]} rounded-full border-2 border-gray-900`}
          style={{ backgroundColor: badgeColor }}
        />
      )}
    </View>
  );
}
