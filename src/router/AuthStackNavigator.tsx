import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screenNames } from '../utils/screenNames';
import { AuthStackParamList } from '../utils/types';
import {
    LoginPage,
} from '../modules/auth/LoginPage';// import need to be fixed 
import ViewProfileScreen from '../modules/userProfile/ViewProfileScreen'; // import need to be fixed
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen
                name={screenNames.SignUpScreen}
                component={ViewProfileScreen}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <AuthStack.Screen
                name={screenNames.LoginScreen}
                component={LoginPage}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </AuthStack.Navigator>
    );
};

export default AuthStackNavigator;