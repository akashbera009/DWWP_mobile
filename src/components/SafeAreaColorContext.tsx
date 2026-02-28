// import React from 'react';

// type SafeAreaColorContextValue = {
//   color: string;
//   setColor: (color: string) => void;
//   ignoreTop: boolean;
//   setIgnoreTop: (v: boolean) => void;
// };

// const SafeAreaColorContext = React.createContext<
//   SafeAreaColorContextValue | undefined
// >(undefined);

// export const SafeAreaColorProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [color, setColor] = React.useState<string>('transparent');
//   const [ignoreTop, setIgnoreTop] = React.useState<boolean>(false);

//   const value = React.useMemo(
//     () => ({ color, setColor, ignoreTop, setIgnoreTop }),
//     [color, ignoreTop],
//   );

//   return (
//     <SafeAreaColorContext.Provider value={value}>
//       {children}
//     </SafeAreaColorContext.Provider>
//   );
// };

// export const useSafeAreaColor = (): SafeAreaColorContextValue => {
//   const ctx = React.useContext(SafeAreaColorContext);
//   if (!ctx) {
//     throw new Error(
//       'useSafeAreaColor must be used within SafeAreaColorProvider',
//     );
//   }
//   return ctx;
// };