import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display";
import { Star, Sparkles, MessageCircle, Phone, Video, Clock, LogIn } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import type { RootStackScreenProps } from "@/navigation/types";
import type { GetReaderByIdResponse } from "@/shared/contracts";
import { useSession } from "@/lib/useSession";

type Props = RootStackScreenProps<"ReaderProfile">;

export default function ReaderProfileScreen({ route, navigation }: Props) {
  const { readerId } = route.params;
  const { data: session } = useSession();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  const { data, isLoading } = useQuery<GetReaderByIdResponse>({
    queryKey: ["reader", readerId],
    queryFn: async () => {
      const backendUrl = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/readers/${readerId}`);
      if (!response.ok) throw new Error("Failed to fetch reader");
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

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  const { reader, reviews } = data;

  const handleStartReading = () => {
    if (!session) {
      navigation.navigate("Login");
    }
    // TODO: start the reading session when logged in
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#000" }}>
      <LinearGradient colors={["#000000", "#1a0a1a", "#000000"]} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="items-center px-6 pt-6 pb-8">
            {reader.profileImage ? (
              <Image
                source={{ uri: reader.profileImage }}
                style={{ width: 150, height: 150, borderRadius: 75 }}
                contentFit="cover"
                className="border-4 border-[#FFD700] mb-4"
              />
            ) : (
              <View
                className="items-center justify-center bg-[#FF69B4]/20 border-4 border-[#FF69B4] mb-4"
                style={{ width: 150, height: 150, borderRadius: 75 }}
              >
                <Sparkles size={60} color="#FF69B4" />
              </View>
            )}

            <Text
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
              className="text-3xl text-white text-center mb-2"
            >
              {reader.displayName}
            </Text>

            {/* Status Badge */}
            <View className="flex-row items-center mb-3">
              {reader.isOnline && reader.isAvailable ? (
                <>
                  <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                    className="text-green-400 text-sm"
                  >
                    Available Now
                  </Text>
                </>
              ) : reader.isOnline ? (
                <>
                  <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-yellow-400 text-sm"
                  >
                    Busy
                  </Text>
                </>
              ) : (
                <>
                  <View className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-gray-400 text-sm"
                  >
                    Offline
                  </Text>
                </>
              )}
            </View>

            {/* Rating */}
            {reader.rating && (
              <View className="flex-row items-center mb-4">
                <Star size={20} color="#FFD700" fill="#FFD700" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-[#FFD700] ml-2 text-lg"
                >
                  {reader.rating.toFixed(1)}
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 ml-2 text-sm"
                >
                  ({reader.totalReviews} reviews • {reader.totalSessions} sessions)
                </Text>
              </View>
            )}

            {/* Specialties */}
            {reader.specialties && reader.specialties.length > 0 && (
              <View className="flex-row flex-wrap justify-center">
                {reader.specialties.map((specialty, index) => (
                  <View key={index} className="bg-[#FF69B4]/20 rounded-full px-3 py-1 m-1">
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-[#FF69B4] text-sm"
                    >
                      {specialty}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Bio */}
          {reader.bio && (
            <View className="px-6 mb-6">
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-[#FF69B4] text-xl mb-3"
              >
                About
              </Text>
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-white/90 text-base leading-6"
              >
                {reader.bio}
              </Text>
              {reader.yearsExperience && (
                <View className="flex-row items-center mt-3">
                  <Clock size={16} color="#FFD700" />
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-[#FFD700] ml-2 text-sm"
                  >
                    {reader.yearsExperience} years of experience
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Reading Options */}
          <View className="px-6 mb-6">
            <Text
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
              className="text-[#FF69B4] text-xl mb-1"
            >
              Start a Reading
            </Text>
            {!session && (
              <View className="flex-row items-center mb-4">
                <LogIn size={13} color="#FF69B4" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-[#FF69B4]/70 text-xs ml-1"
                >
                  Sign in to begin a session
                </Text>
              </View>
            )}
            {session && <View className="mb-4" />}

            <View className="space-y-3">
              {reader.chatRatePerMin > 0 && (
                <Pressable onPress={handleStartReading} className="rounded-xl overflow-hidden mb-3">
                  <LinearGradient
                    colors={["#FF69B4", "#FF1493"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <View className="flex-row items-center flex-1">
                      <MessageCircle size={24} color="#FFF" />
                      <View className="ml-3">
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                          className="text-white text-lg"
                        >
                          Chat Reading
                        </Text>
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                          className="text-white/90 text-sm"
                        >
                          ${reader.chatRatePerMin.toFixed(2)}/min
                        </Text>
                      </View>
                    </View>
                    {!session && <LogIn size={18} color="rgba(255,255,255,0.7)" />}
                  </LinearGradient>
                </Pressable>
              )}

              {reader.phoneRatePerMin > 0 && (
                <Pressable onPress={handleStartReading} className="rounded-xl overflow-hidden mb-3">
                  <LinearGradient
                    colors={["#9370DB", "#8A2BE2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <View className="flex-row items-center flex-1">
                      <Phone size={24} color="#FFF" />
                      <View className="ml-3">
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                          className="text-white text-lg"
                        >
                          Phone Reading
                        </Text>
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                          className="text-white/90 text-sm"
                        >
                          ${reader.phoneRatePerMin.toFixed(2)}/min
                        </Text>
                      </View>
                    </View>
                    {!session && <LogIn size={18} color="rgba(255,255,255,0.7)" />}
                  </LinearGradient>
                </Pressable>
              )}

              {reader.videoRatePerMin > 0 && (
                <Pressable onPress={handleStartReading} className="rounded-xl overflow-hidden">
                  <LinearGradient
                    colors={["#FFD700", "#FFA500"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <View className="flex-row items-center flex-1">
                      <Video size={24} color="#000" />
                      <View className="ml-3">
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                          className="text-black text-lg"
                        >
                          Video Reading
                        </Text>
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                          className="text-black/90 text-sm"
                        >
                          ${reader.videoRatePerMin.toFixed(2)}/min
                        </Text>
                      </View>
                    </View>
                    {!session && <LogIn size={18} color="rgba(0,0,0,0.5)" />}
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          </View>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <View className="px-6">
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-[#FF69B4] text-xl mb-4"
              >
                Recent Reviews
              </Text>

              {reviews.map((review) => (
                <View
                  key={review.id}
                  className="bg-[#1a0a1a] border border-[#FF69B4]/30 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-center mb-2">
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= review.rating ? "#FFD700" : "#666"}
                          fill={star <= review.rating ? "#FFD700" : "none"}
                        />
                      ))}
                    </View>
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white/60 text-xs ml-2"
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white/80 text-sm leading-5"
                    >
                      {review.comment}
                    </Text>
                  )}
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-white/40 text-xs mt-2"
                  >
                    — {review.user.name || "Anonymous"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
