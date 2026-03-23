🌳 Navigation Tree
RootStack
│
├── SplashScreen
│
├── AuthStack
│   ├── LoginScreen
│   └── SignUpScreen
│
└── MainStack
    │
    ├── BottomTabs
    │   ├── DashBoard
    │   ├── PaymentDashBoard
    │   └── AnalyticsPage
    │
    ├── ViewProfileScreen
    ├── SettingsScreen
    └── RaiseComplaintScreen



📦 Recommended Folder Structure
src
│
├── navigation
│   ├── RootNavigator.tsx
│   ├── AuthStackNavigator.tsx
│   ├── MainStackNavigator.tsx
│   ├── BottomTabNavigator.tsx
│   └── types.ts
│
├── screens
│   ├── auth
│   │   ├── LoginPage.tsx
│   │   └── SignUpPage.tsx
│   │
│   ├── dashboard
│   │   └── DashBoardPage.tsx
│   │
│   ├── payments
│   │   └── PaymentsDashboard.tsx
│   │
│   ├── analytics
│   │   └── AnalyticsPage.tsx
│   │
│   ├── profile
│   │   ├── ViewProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   └── complaints
│       └── RaiseComplaintScreen.tsx



5️⃣ Use After Firebase Login
const res = await signInWithEmailAndPassword(getAuth(), email, password);

await saveUser(
  res.user.uid,
  res.user.email ?? ""
);
6️⃣ Use on App Start
const user = await getStoredUser();

if (user) {
  console.log("User from storage:", user.uid);
}
7️⃣ Logout
await removeStoredUser();