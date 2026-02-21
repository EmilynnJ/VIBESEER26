import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Sparkles, Users, Info, User } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";

import type { BottomTabParamList, RootStackParamList } from "@/navigation/types";
import HomeScreen from "@/screens/HomeScreen";
import ReadingsScreen from "@/screens/ReadingsScreen";
import AboutScreen from "@/screens/AboutScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import ReaderProfileScreen from "@/screens/ReaderProfileScreen";
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import { useSession } from "@/lib/useSession";

/**
 * RootStackNavigator
 * Public app - login only required for getting a reading or making a purchase.
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();
const RootNavigator = () => {
  const { isPending } = useSession();

  // Show loading screen while checking authentication
  if (isPending) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#FF69B4" size="large" />
      </View>
    );
  }

  // Always show main app stack - auth is handled per-action
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={BottomTabNavigator} />
      <RootStack.Screen
        name="ReaderProfile"
        component={ReaderProfileScreen}
        options={{
          headerShown: true,
          title: "Reader Profile",
          gestureEnabled: true,
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#FF69B4",
          headerTitleStyle: { fontFamily: "System", fontWeight: "600" },
        }}
      />
      <RootStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
};

/**
 * BottomTabNavigator
 * The bottom tab navigator for the app
 */
const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const BottomTabNavigator = () => {
  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          borderTopColor: "#FF69B4",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#FF69B4",
        tabBarInactiveTintColor: "#999",
        headerStyle: { backgroundColor: "#000" },
        headerTintColor: "#FF69B4",
      }}
      screenListeners={() => ({
        transitionStart: () => {
          Haptics.selectionAsync();
        },
      })}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ReadingsTab"
        component={ReadingsScreen}
        options={{
          title: "Readings",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => <Info size={size} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
};

export default RootNavigator;
