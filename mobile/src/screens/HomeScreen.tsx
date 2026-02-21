import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useFonts, AlexBrush_400Regular } from "@expo-google-fonts/alex-brush";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";
import {
  Sparkles,
  Users,
  ShoppingBag,
  Mail,
  BookOpen,
  Radio,
  Store,
  Megaphone,
  Send,
  Circle,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BottomTabScreenProps } from "@/navigation/types";

type Props = BottomTabScreenProps<"HomeTab">;

type Reader = {
  id: number;
  displayName: string;
  profileImageUrl: string | null;
  isOnline: boolean;
  isInCall: boolean;
  specialties: string[];
  chatRate: number;
  rating: number;
};

type ReadersResponse = {
  readers: Reader[];
};

export default function HomeScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [fontsLoaded] = useFonts({
    AlexBrush_400Regular,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  // Fetch online readers from API
  const { data: readersData, isLoading: readersLoading } = useQuery({
    queryKey: ["readers"],
    queryFn: () => api.get<ReadersResponse>("/api/readers"),
  });

  // Filter to only show online readers
  const onlineReaders = readersData?.readers?.filter((r) => r.isOnline) ?? [];

  const handleSubscribe = () => {
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF69B4" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={{
          uri: "https://i.postimg.cc/sXdsKGTK/DALL-E-2025-06-06-14-36-29-A-vivid-ethereal-background-image-designed-for-a-psychic-reading-app.webp",
        }}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.85)", "rgba(0,0,0,0.95)"]}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section with Hero */}
            <View className="items-center pt-14 pb-6">
              <Text
                style={{ fontFamily: "AlexBrush_400Regular" }}
                className="text-5xl text-[#FF69B4] mb-4"
              >
                SoulSeer
              </Text>

              {/* Hero Image - Slightly larger than thumbnail */}
              <Image
                source={{ uri: "https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg" }}
                style={{ width: 140, height: 140, borderRadius: 70 }}
                contentFit="cover"
                className="mb-4 border-2 border-[#FFD700]"
              />

              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-lg text-white text-center px-8"
              >
                A Community of Gifted Psychics
              </Text>

              <View className="flex-row items-center mt-2">
                <Sparkles size={14} color="#FFD700" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-[#FFD700] text-xs mx-2"
                >
                  Ethical • Compassionate • Authentic
                </Text>
                <Sparkles size={14} color="#FFD700" />
              </View>
            </View>

            {/* Navigation Buttons - Smaller, 2x2 Grid */}
            <View className="px-6 mt-4">
              <View className="flex-row flex-wrap justify-between">
                {/* Readers Button */}
                <Pressable
                  onPress={() => navigation.navigate("ReadingsTab")}
                  className="w-[48%] mb-3"
                >
                  <LinearGradient
                    colors={["#FF69B4", "#FF1493"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={18} color="#FFF" />
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-sm ml-2"
                    >
                      Readers
                    </Text>
                  </LinearGradient>
                </Pressable>

                {/* Community Button */}
                <Pressable onPress={() => {}} className="w-[48%] mb-3">
                  <LinearGradient
                    colors={["#9370DB", "#8A2BE2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={18} color="#FFF" />
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-sm ml-2"
                    >
                      Community
                    </Text>
                  </LinearGradient>
                </Pressable>

                {/* Shop Button */}
                <Pressable onPress={() => {}} className="w-[48%]">
                  <LinearGradient
                    colors={["#FFD700", "#FFA500"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShoppingBag size={18} color="#000" />
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-black text-sm ml-2"
                    >
                      Shop
                    </Text>
                  </LinearGradient>
                </Pressable>

                {/* Contact Button */}
                <Pressable onPress={() => navigation.navigate("AboutTab")} className="w-[48%]">
                  <LinearGradient
                    colors={["#4A90A4", "#2E6B7E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Mail size={18} color="#FFF" />
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-sm ml-2"
                    >
                      Contact
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            {/* Online Readers Section */}
            <View className="px-6 mt-8">
              <View className="flex-row items-center mb-4">
                <Circle size={10} color="#22C55E" fill="#22C55E" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-xl text-[#FF69B4] ml-2"
                >
                  Online Readers
                </Text>
              </View>

              {readersLoading ? (
                <View className="items-center py-8">
                  <ActivityIndicator color="#FF69B4" />
                </View>
              ) : onlineReaders.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {onlineReaders.map((reader) => (
                    <Pressable
                      key={reader.id}
                      onPress={() => navigation.navigate("ReaderProfile", { readerId: reader.id })}
                      className="mr-4"
                    >
                      <View className="items-center">
                        <View className="relative">
                          <Image
                            source={{
                              uri:
                                reader.profileImageUrl ??
                                "https://i.postimg.cc/tRLSgCPb/HERO-IMAGE-1.jpg",
                            }}
                            style={{ width: 70, height: 70, borderRadius: 35 }}
                            contentFit="cover"
                            className="border-2 border-[#22C55E]"
                          />
                          <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#22C55E] rounded-full border-2 border-black" />
                        </View>
                        <Text
                          style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                          className="text-white text-xs mt-2 text-center w-20"
                          numberOfLines={1}
                        >
                          {reader.displayName}
                        </Text>
                        <Text className="text-[#FFD700] text-xs">
                          ${(reader.chatRate ?? 0).toFixed(2)}/min
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View className="bg-white/5 rounded-xl p-6 items-center">
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-white/60 text-center"
                  >
                    No readers online at the moment
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate("ReadingsTab")}
                    className="mt-3"
                  >
                    <Text className="text-[#FF69B4] text-sm">Browse All Readers</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Active Live Streams Section */}
            <View className="px-6 mt-8">
              <View className="flex-row items-center mb-4">
                <Radio size={18} color="#FF69B4" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-xl text-[#FF69B4] ml-2"
                >
                  Active Live Streams
                </Text>
              </View>

              <View className="bg-white/5 rounded-xl p-6 items-center">
                <Radio size={32} color="#FF69B4" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 text-center mt-3"
                >
                  No live streams at the moment
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/40 text-xs text-center mt-1"
                >
                  Check back soon for live readings
                </Text>
              </View>
            </View>

            {/* Featured Shop Products Section */}
            <View className="px-6 mt-8">
              <View className="flex-row items-center mb-4">
                <Store size={18} color="#FFD700" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-xl text-[#FF69B4] ml-2"
                >
                  Featured Shop Products
                </Text>
              </View>

              <View className="bg-white/5 rounded-xl p-6 items-center">
                <ShoppingBag size={32} color="#FFD700" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 text-center mt-3"
                >
                  Shop coming soon
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/40 text-xs text-center mt-1"
                >
                  Crystals, tarot decks, and spiritual tools
                </Text>
              </View>
            </View>

            {/* Community Announcements Section */}
            <View className="px-6 mt-8">
              <View className="flex-row items-center mb-4">
                <Megaphone size={18} color="#9370DB" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-xl text-[#FF69B4] ml-2"
                >
                  Community Announcements
                </Text>
              </View>

              <View className="bg-white/5 rounded-xl p-6 items-center">
                <Megaphone size={32} color="#9370DB" />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 text-center mt-3"
                >
                  No announcements yet
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/40 text-xs text-center mt-1"
                >
                  Stay tuned for community updates
                </Text>
              </View>
            </View>

            {/* Newsletter Signup Section */}
            <View className="px-6 mt-8 mb-4">
              <LinearGradient
                colors={["rgba(255,105,180,0.2)", "rgba(147,112,219,0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 20 }}
              >
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-xl text-[#FF69B4] text-center mb-2"
                >
                  Join Our Newsletter
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/70 text-center text-sm mb-4"
                >
                  Get spiritual insights, special offers, and community updates
                </Text>

                {subscribed ? (
                  <View className="items-center py-2">
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-[#22C55E] text-center"
                    >
                      Thank you for subscribing!
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 bg-white/10 rounded-l-xl px-4 py-3 text-white"
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    />
                    <Pressable
                      onPress={handleSubscribe}
                      className="bg-[#FF69B4] rounded-r-xl px-4 py-3"
                    >
                      <Send size={20} color="#FFF" />
                    </Pressable>
                  </View>
                )}
              </LinearGradient>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
