import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display";
import { Star, Sparkles } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import type { BottomTabScreenProps } from "@/navigation/types";
import type { GetReadersResponse } from "@/shared/contracts";

type Props = BottomTabScreenProps<"ReadingsTab">;

export default function ReadingsScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  const { data, isLoading } = useQuery<GetReadersResponse>({
    queryKey: ["readers"],
    queryFn: async () => {
      const backendUrl = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/readers`);
      if (!response.ok) throw new Error("Failed to fetch readers");
      return response.json();
    },
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF69B4" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#000" }}>
      <LinearGradient
        colors={["#000000", "#1a0a1a", "#000000"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
            className="text-3xl text-[#FF69B4] text-center mb-2"
          >
            Our Gifted Readers
          </Text>
          <Text
            style={{ fontFamily: "PlayfairDisplay_400Regular" }}
            className="text-white/70 text-center mb-8"
          >
            Connect with compassionate spiritual guides
          </Text>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#FF69B4" />
            </View>
          ) : (
            <View className="space-y-4">
              {data?.readers.map((reader) => (
                <Pressable
                  key={reader.id}
                  onPress={() => navigation.navigate("ReaderProfile", { readerId: reader.id })}
                  className="rounded-2xl overflow-hidden mb-4"
                  style={{
                    shadowColor: "#FF69B4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={["#1a0a1a", "#0a0a0a"]}
                    style={{ padding: 16, borderWidth: 1, borderColor: "rgba(255, 105, 180, 0.3)" }}
                  >
                    <View className="flex-row">
                      {/* Profile Image */}
                      <View className="mr-4">
                        {reader.profileImage ? (
                          <Image
                            source={{ uri: reader.profileImage }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            className="items-center justify-center bg-[#FF69B4]/20 border-2 border-[#FF69B4]"
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                          >
                            <Sparkles size={32} color="#FF69B4" />
                          </View>
                        )}
                        {reader.isOnline && (
                          <View
                            className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-black"
                          />
                        )}
                      </View>

                      {/* Reader Info */}
                      <View className="flex-1">
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                          className="text-xl text-white mb-1"
                        >
                          {reader.displayName}
                        </Text>

                        {/* Rating */}
                        {reader.rating && (
                          <View className="flex-row items-center mb-2">
                            <Star size={16} color="#FFD700" fill="#FFD700" />
                            <Text
                              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                              className="text-[#FFD700] ml-1 text-sm"
                            >
                              {reader.rating.toFixed(1)} ({reader.totalReviews} reviews)
                            </Text>
                          </View>
                        )}

                        {/* Specialties */}
                        {reader.specialties && reader.specialties.length > 0 && (
                          <View className="flex-row flex-wrap mb-2">
                            {reader.specialties.slice(0, 3).map((specialty, index) => (
                              <View key={index} className="bg-[#FF69B4]/20 rounded-full px-2 py-1 mr-2 mb-1">
                                <Text
                                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                                  className="text-[#FF69B4] text-xs"
                                >
                                  {specialty}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Status & Rates */}
                        <View className="flex-row items-center">
                          {reader.isOnline && reader.isAvailable ? (
                            <Text
                              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                              className="text-green-400 text-sm"
                            >
                              Available Now
                            </Text>
                          ) : reader.isOnline ? (
                            <Text
                              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                              className="text-yellow-400 text-sm"
                            >
                              Busy
                            </Text>
                          ) : (
                            <Text
                              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                              className="text-gray-400 text-sm"
                            >
                              Offline
                            </Text>
                          )}
                          <Text
                            style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                            className="text-white/70 text-sm ml-3"
                          >
                            From ${reader.chatRatePerMin.toFixed(2)}/min
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
