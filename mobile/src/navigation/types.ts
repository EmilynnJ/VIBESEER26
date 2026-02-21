import type { BottomTabScreenProps as BottomTabScreenPropsBase } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  ReaderProfile: { readerId: number };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  ReadingsTab: undefined;
  AboutTab: undefined;
  ProfileTab: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabScreenProps<Screen extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenPropsBase<BottomTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
