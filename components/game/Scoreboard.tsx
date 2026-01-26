import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { PlayerInfo } from '@/types';
import { getInitials } from '@/lib/utils';

interface ScoreboardProps {
  players: PlayerInfo[];
}

export default function Scoreboard({ players }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <View className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sortedPlayers.map((player, index) => (
          <View
            key={player.id}
            className={`items-center mr-4 ${
              player.isJudge ? 'opacity-50' : ''
            }`}
          >
            {/* Position Indicator */}
            {index === 0 && player.score > 0 && (
              <MaterialCommunityIcons
                name="crown"
                size={16}
                color="#fbbf24"
                style={{ position: 'absolute', top: -12 }}
              />
            )}

            {/* Avatar */}
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                player.isJudge ? 'bg-yellow-500' : 'bg-primary-500'
              }`}
            >
              {player.isJudge ? (
                <MaterialCommunityIcons name="gavel" size={20} color="#000" />
              ) : (
                <Text className="text-white font-bold text-sm">
                  {getInitials(player.displayName)}
                </Text>
              )}
            </View>

            {/* Score */}
            <Text className="text-white font-bold mt-1">{player.score}</Text>

            {/* Name */}
            <Text
              className="text-gray-400 text-xs"
              numberOfLines={1}
              style={{ maxWidth: 60 }}
            >
              {player.displayName.split(' ')[0]}
            </Text>

            {/* Submitted Indicator */}
            {player.hasSubmitted && !player.isJudge && (
              <View className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="check" size={10} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
