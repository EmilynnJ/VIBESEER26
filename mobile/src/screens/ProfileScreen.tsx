import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";
import { User, CreditCard, Settings, LogOut, Mail, Sparkles, LogIn } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/useSession";
import { authClient } from "@/lib/authClient";
import { api } from "@/lib/api";
import type { BottomTabScreenProps } from "@/navigation/types";

type Props = BottomTabScreenProps<"ProfileTab">;

type UserBalanceResponse = {
  balance: number;
};

export default function ProfileScreen({ navigation }: Props) {
  const { data: session } = useSession();

  // Fetch user balance from backend
  const { data: balanceData } = useQuery({
    queryKey: ["user", "balance"],
    queryFn: () => api.get<UserBalanceResponse>("/api/user/balance"),
    enabled: !!session,
  });

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authClient.signOut();
          } catch (error) {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF69B4" size="large" />
      </View>
    );
  }

  // Guest view — not signed in
  if (!session) {
    return (
      <View className="flex-1" style={{ backgroundColor: "#000" }}>
        <LinearGradient colors={["#000000", "#1a0a1a", "#000000"]} style={{ flex: 1 }}>
          <View
            className="flex-1 items-center justify-center px-8"
            style={{ paddingBottom: 100 }}
          >
            {/* Icon */}
            <View
              className="bg-[#FF69B4]/10 rounded-full mb-6 border border-[#FF69B4]/30"
              style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}
            >
              <Sparkles size={52} color="#FF69B4" />
            </View>

            <Text
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
              className="text-white text-3xl text-center mb-3"
            >
              Your Spiritual Journey
            </Text>
            <Text
              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
              className="text-white/60 text-base text-center mb-10 leading-6"
            >
              Sign in to track your readings, manage your balance, and connect with our gifted readers.
            </Text>

            {/* Sign In */}
            <Pressable
              onPress={() => navigation.navigate("Login")}
              className="w-full rounded-2xl overflow-hidden mb-4"
            >
              <LinearGradient
                colors={["#FF69B4", "#FF1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
              >
                <LogIn size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-white text-lg"
                >
                  Sign In
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Create Account */}
            <Pressable
              onPress={() => navigation.navigate("Signup")}
              className="w-full rounded-2xl border border-[#FF69B4]/40 py-4 items-center"
            >
              <Text
                style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                className="text-[#FF69B4] text-base"
              >
                Create Account
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Authenticated view
  return (
    <View className="flex-1" style={{ backgroundColor: "#000" }}>
      <LinearGradient colors={["#000000", "#1a0a1a", "#000000"]} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View className="items-center mb-8">
            <View
              className="bg-[#FF69B4]/20 rounded-full p-6 mb-4 border-2 border-[#FF69B4]"
              style={{ width: 120, height: 120, justifyContent: "center", alignItems: "center" }}
            >
              <User size={60} color="#FF69B4" />
            </View>
            <Text
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
              className="text-white text-2xl"
            >
              {session.user.name || "User"}
            </Text>
            <View className="flex-row items-center mt-2">
              <Mail size={14} color="#9370DB" />
              <Text
                style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                className="text-white/60 text-sm ml-2"
              >
                {session.user.email}
              </Text>
            </View>
          </View>

          {/* Account Balance */}
          <View className="bg-[#1a0a1a] border border-[#FF69B4]/30 rounded-2xl p-6 mb-6">
            <Text
              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
              className="text-white/60 text-sm mb-2"
            >
              Account Balance
            </Text>
            <Text
              style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
              className="text-[#FFD700] text-4xl mb-4"
            >
              ${balanceData?.balance?.toFixed(2) ?? "0.00"}
            </Text>
            <Pressable className="rounded-xl overflow-hidden">
              <LinearGradient
                colors={["#FF69B4", "#FF1493"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 12, alignItems: "center" }}
              >
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-white text-base"
                >
                  Add Funds
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Menu Options */}
          <View className="space-y-3">
            <Pressable className="bg-[#1a0a1a] border border-[#FF69B4]/30 rounded-xl p-4 flex-row items-center">
              <View className="bg-[#FF69B4]/20 rounded-full p-2 mr-3">
                <CreditCard size={20} color="#FF69B4" />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-white text-base"
                >
                  Payment Methods
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 text-xs"
                >
                  Manage your cards
                </Text>
              </View>
            </Pressable>

            <Pressable className="bg-[#1a0a1a] border border-[#FF69B4]/30 rounded-xl p-4 flex-row items-center mb-3">
              <View className="bg-[#9370DB]/20 rounded-full p-2 mr-3">
                <Settings size={20} color="#9370DB" />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-white text-base"
                >
                  Settings
                </Text>
                <Text
                  style={{ fontFamily: "PlayfairDisplay_400Regular" }}
                  className="text-white/60 text-xs"
                >
                  App preferences
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Sign Out Button */}
          <View className="mt-8">
            <Pressable onPress={handleSignOut} className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={["#DC143C", "#8B0000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
              >
                <LogOut size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text
                  style={{ fontFamily: "PlayfairDisplay_600SemiBold" }}
                  className="text-white text-lg"
                >
                  Sign Out
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Info Text */}
          <Text
            style={{ fontFamily: "PlayfairDisplay_400Regular" }}
            className="text-white/40 text-xs text-center mt-8"
          >
            SoulSeer v1.0{"\n"}
            Ethical • Compassionate • Authentic
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
