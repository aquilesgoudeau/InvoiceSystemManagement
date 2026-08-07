import { StatusBar } from "expo-status-bar";
import {createStaticNavigation} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack"

// Screens
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ResolverScreen from "./src/screens/ResolverScreen";
import LandingPageScreen from "./src/screens/LandingPageScreen";
import DashBoardScreen from "./src/screens/DashBoardScreen";

const CheckAuth = createNativeStackNavigator({
  screenOptions:{headerShown:false},
  screens:{
    Resolver:ResolverScreen
  }
})

const AuthFlow = createNativeStackNavigator({
  screenOptions: { headerShown: false},
  screens:{
      Landing: LandingPageScreen,
      SignIn: SignInScreen,
      SignUp: SignUpScreen
  }
});

const MainFlow = createNativeStackNavigator({
   screenOptions: { headerShown: false },
    screens:{
    DashBoard:DashBoardScreen
    }
});

const AppContainer = createNativeStackNavigator({
  screenOptions:{headerShown:false},
  screens:{
    CheckAuth,
    AuthFlow,
    MainFlow
  }
})

const App = createStaticNavigation(AppContainer)

export default () => {
  return(
    <>
    <App/>
    <StatusBar style="auto" hidden />
    </>
  )
}
