import { View, Text, ScrollView, ImageBackground, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useFonts, AlexBrush_400Regular } from "@expo-google-fonts/alex-brush";
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display";
import { Heart, Users, Star } from "lucide-react-native";
import type { BottomTabScreenProps } from "@/navigation/types";

type Props = BottomTabScreenProps<"AboutTab">;

export default function AboutScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    AlexBrush_400Regular,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
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
      <ImageBackground
        source={{ uri: "https://i.postimg.cc/sXdsKGTK/DALL-E-2025-06-06-14-36-29-A-vivid-ethereal-background-image-designed-for-a-psychic-reading-app.webp" }}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)", "rgba(0,0,0,0.95)"]}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text
              style={{ fontFamily: "AlexBrush_400Regular" }}
              className="text-5xl text-[#FF69B4] text-center mb-4"
            >
              About SoulSeer
            </Text>

            {/* Founder Image */}
            <View className="items-center mb-8">
              <Image
                source={{ uri: "https://i.postimg.cc/s2ds9RtC/FOUNDER.jpg" }}
                style={{ width: 200, height: 200, borderRadius: 100 }}
                contentFit="cover"
                className="border-4 border-[#FFD700]"
              />
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-white text-xl mt-4"
              >
                Emilynn - Founder
              </Text>
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-[#FF69B4] text-sm"
              >
                Psychic Medium
              </Text>
            </View>

            {/* Mission Statement */}
            <View className="mb-8">
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-2xl text-[#FF69B4] mb-4"
              >
                Our Mission
              </Text>
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-white/90 text-base leading-7 mb-4"
              >
                At SoulSeer, we are dedicated to providing ethical, compassionate, and judgment-free spiritual guidance. Our mission is twofold: to offer clients genuine, heart-centered readings and to uphold fair, ethical standards for our readers.
              </Text>
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-white/90 text-base leading-7"
              >
                Founded by psychic medium Emilynn, SoulSeer was created as a response to the corporate greed that dominates many psychic platforms. Unlike other apps, our readers keep the majority of what they earn and play an active role in shaping the platform.
              </Text>
            </View>

            {/* Core Values */}
            <View className="mb-8">
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-2xl text-[#FF69B4] mb-6"
              >
                Our Values
              </Text>

              <View className="space-y-4">
                <View className="flex-row items-start mb-4">
                  <View className="bg-[#FF69B4]/20 rounded-full p-3 mr-4">
                    <Heart size={24} color="#FF69B4" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-lg mb-2"
                    >
                      Compassion First
                    </Text>
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white/80 text-sm"
                    >
                      Every reading is conducted with empathy, understanding, and genuine care for your spiritual journey.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-4">
                  <View className="bg-[#FFD700]/20 rounded-full p-3 mr-4">
                    <Star size={24} color="#FFD700" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-lg mb-2"
                    >
                      Ethical Standards
                    </Text>
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white/80 text-sm"
                    >
                      We maintain the highest ethical standards in all our readings and business practices.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start">
                  <View className="bg-[#9370DB]/20 rounded-full p-3 mr-4">
                    <Users size={24} color="#9370DB" />
                  </View>
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                      className="text-white text-lg mb-2"
                    >
                      Community Driven
                    </Text>
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white/80 text-sm"
                    >
                      SoulSeer is more than an app—it&apos;s a soul tribe united by our calling to guide and heal.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Call to Action */}
            <View className="mt-8">
              <Pressable
                onPress={() => navigation.navigate("ReadingsTab")}
                className="rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#FF69B4", "#FF1493", "#C71585"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 20, alignItems: "center" }}
                >
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                    className="text-white text-xl"
                  >
                    Connect With Our Readers
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
