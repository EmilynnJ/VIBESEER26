import { onlineManager, QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

const queryClient = new QueryClient();

// Only use expo-network on native platforms, not web
if (Platform.OS !== "web") {
  import("expo-network").then((Network) => {
    onlineManager.setEventListener((setOnline) => {
      const eventSubscription = Network.addNetworkStateListener((state) => {
        setOnline(!!state.isConnected);
      });
      return eventSubscription.remove;
    });
  });
}

export { queryClient };
