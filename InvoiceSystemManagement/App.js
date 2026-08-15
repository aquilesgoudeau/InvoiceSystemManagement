import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {createStaticNavigation} from "@react-navigation/native"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as ScannerProvider } from "./src/contexts/scannerContext";
import { Provider as DateFilterProvider } from "./src/contexts/dateFilterContext";
import { Provider as ExportProvider } from "./src/contexts/exportContext";
import { Provider as AuthProvider } from "./src/contexts/authContext"
import {navigationRef} from "./src/navigation/navigationRef"
import { List, PieChart, Star } from "lucide-react-native";

// Screens
import ResolverScreen from "./src/screens/ResolverScreen";
import SignInScreen from "./src/screens/SignInScreen";
import PreviewScreen from "./src/screens/PreviewScreen";
import LandingPageScreen from "./src/screens/LandingPageScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import GeminiResultScreen from "./src/screens/GeminiResultScreen"
import DetailsScreen from "./src/screens/DetailsScreen";
import StactsInvoiceScreen from "./src/screens/StactsInvoiceScreen";
import PayWallScreen from "./src/screens/PayWallScreen";



const MainTabs = createBottomTabNavigator({
  screenOptions: { 
    headerShown: false,
    tabBarActiveTintColor: '#2563eb',
    tabBarInactiveTintColor: '#94a3b8',
  },
  screens: {
    ListInvoices: {
      screen: LandingPageScreen,
      options: {
        title: 'Invoices',
        tabBarIcon: ({ color, size }) => <List color={color} size={size} />
      }
    },
    StactsInvoice: {
      screen: StactsInvoiceScreen,
      options: {
        title: 'Análisis',
        tabBarIcon: ({ color, size }) => <PieChart color={color} size={size} />
      }
    }
  }
});
const AppContainer = createNativeStackNavigator({
  screenOptions: { headerShown: false },
  screens: {
    Resolver:ResolverScreen,
    SignIn: SignInScreen,
    Home: MainTabs,
    Scanner: {
      screen: ScannerScreen,
      options: {
        gestureEnabled: false, // Evita volver arrastrando a la pantalla de carga del escáner
      }
    },
    Preview: {
      screen: PreviewScreen,
      options: {
        gestureEnabled: false, // Evita volver arrastrando durante el flujo de previsualización
      }
    },
    GeminiResult: {
      screen: GeminiResultScreen,
      options: {
        gestureEnabled: false, // Evita volver arrastrando cuando se muestra el resultado de Gemini
      }
    },
    Details: DetailsScreen
  }
});


const Navigation = createStaticNavigation(AppContainer)

export default () => {
  return(
   
    <ScannerProvider>
      <DateFilterProvider>
        <ExportProvider>
          <AuthProvider>
         <Navigation ref={navigationRef}/>
           <StatusBar style="auto" hidden />
           </AuthProvider>
         </ExportProvider>
      </DateFilterProvider>
    </ScannerProvider>
    
  )
}