import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screenNames } from '../utils/screenNames';
import { RootStackParamList } from '../utils/types';
import {
  LoginPage,
} from '../modules/auth/LoginPage';// import need to be fixed 

const AuthStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen
                name={screenNames.LoginScreen}
                component={LoginPage}
                options={{ headerShown: false, gestureEnabled: false }}
            />
        </AuthStack.Navigator>
    );
};

export default AuthNavigator;