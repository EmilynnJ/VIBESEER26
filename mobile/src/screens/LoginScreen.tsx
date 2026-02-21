import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, AlexBrush_400Regular } from "@expo-google-fonts/alex-brush";
import { PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";
import { Eye, EyeOff, Sparkles } from "lucide-react-native";
import { authClient } from "@/lib/authClient";
import type { RootStackScreenProps } from "@/navigation/types";

type Props = RootStackScreenProps<"Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    AlexBrush_400Regular,
    PlayfairDisplay_400Regular,
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.toLowerCase().trim(),
        password,
      });

      if (result.error) {
        Alert.alert("Sign In Failed", result.error.message || "Please check your credentials");
      } else {
        // Navigation will be handled by the auth guard
        console.log("✅ Sign in successful");
      }
    } catch (error) {
      console.error("❌ Sign in error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
          colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.95)"]}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-center px-8"
          >
            {/* Logo */}
            <View className="items-center mb-12">
              <Sparkles size={60} color="#FF69B4" />
              <Text
                style={{ fontFamily: "AlexBrush_400Regular" }}
                className="text-6xl text-[#FF69B4] mt-4"
              >
                SoulSeer
              </Text>
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-white text-lg mt-2 text-center"
              >
                A Community of Gifted Psychics
              </Text>
            </View>

            {/* Login Form */}
            <View className="space-y-4">
              {/* Email Input */}
              <View>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white text-sm mb-2"
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  className="bg-black/50 border border-[#FF69B4]/30 rounded-lg px-4 py-4 text-white"
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                />
              </View>

              {/* Password Input */}
              <View>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white text-sm mb-2"
                >
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#666"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    className="bg-black/50 border border-[#FF69B4]/30 rounded-lg px-4 py-4 text-white pr-12"
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#FF69B4" />
                    ) : (
                      <Eye size={20} color="#FF69B4" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={isLoading}
                className="mt-6"
              >
                <LinearGradient
                  colors={isLoading ? ["#666", "#666"] : ["#FF69B4", "#9370DB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 rounded-lg items-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-white text-lg font-semibold"
                    >
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/70"
                >
                  Don&apos;t have an account?{" "}
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("Signup")}
                  disabled={isLoading}
                >
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-[#FF69B4] font-semibold"
                  >
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
