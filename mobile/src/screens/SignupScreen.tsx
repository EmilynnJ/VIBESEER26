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
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, AlexBrush_400Regular } from "@expo-google-fonts/alex-brush";
import { PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";
import { Eye, EyeOff, Sparkles } from "lucide-react-native";
import { authClient } from "@/lib/authClient";
import type { RootStackScreenProps } from "@/navigation/types";

type Props = RootStackScreenProps<"Signup">;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    AlexBrush_400Regular,
    PlayfairDisplay_400Regular,
  });

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
      });

      if (result.error) {
        Alert.alert("Sign Up Failed", result.error.message || "Please try again");
      } else {
        Alert.alert(
          "Success",
          "Account created successfully! You can now sign in.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("❌ Sign up error:", error);
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
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 32 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Logo */}
              <View className="items-center mb-8">
                <Sparkles size={50} color="#FF69B4" />
                <Text
                  style={{ fontFamily: "AlexBrush_400Regular" }}
                  className="text-5xl text-[#FF69B4] mt-3"
                >
                  SoulSeer
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white text-base mt-2 text-center"
                >
                  Join Our Community
                </Text>
              </View>

              {/* Signup Form */}
              <View className="space-y-4">
                {/* Name Input */}
                <View>
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-white text-sm mb-2"
                  >
                    Full Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#666"
                    autoCapitalize="words"
                    editable={!isLoading}
                    className="bg-black/50 border border-[#FF69B4]/30 rounded-lg px-4 py-4 text-white"
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  />
                </View>

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
                      placeholder="At least 8 characters"
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

                {/* Confirm Password Input */}
                <View>
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-white text-sm mb-2"
                  >
                    Confirm Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#666"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      className="bg-black/50 border border-[#FF69B4]/30 rounded-lg px-4 py-4 text-white pr-12"
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-4"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#FF69B4" />
                      ) : (
                        <Eye size={20} color="#FF69B4" />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Sign Up Button */}
                <Pressable
                  onPress={handleSignUp}
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
                        Create Account
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Sign In Link */}
                <View className="flex-row justify-center items-center mt-4 mb-8">
                  <Text
                    style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                    className="text-white/70"
                  >
                    Already have an account?{" "}
                  </Text>
                  <Pressable
                    onPress={() => navigation.navigate("Login")}
                    disabled={isLoading}
                  >
                    <Text
                      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                      className="text-[#FF69B4] font-semibold"
                    >
                      Sign In
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
