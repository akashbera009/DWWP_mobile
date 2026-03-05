import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screenNames } from '../utils/screenNames';
import { AuthStackParamList } from '../utils/types';

import SignUpPage from '@dwwp/modules/auth/SignUpScreen';
import LoginPage from '@dwwp/modules/auth/LoginScreen';
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthStackNavigator = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen
                name={screenNames.LoginScreen}
                component={LoginPage}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <AuthStack.Screen
                name={screenNames.SignUpScreen}
                component={SignUpPage}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </AuthStack.Navigator>
    );
};

export default AuthStackNavigator;