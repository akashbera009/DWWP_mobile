import React from 'react';
import {
  NavigationAction,
  NavigationState,
  NavigationContainerRef,
} from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(
  routeName: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList],
): void {
  navigationRef.current?.navigate(routeName, params);
}

export function currentRoute() {
  return navigationRef?.current?.getCurrentRoute();
}

export function dispatch(
  action: NavigationAction | ((state: NavigationState) => NavigationAction),
): void {
  navigationRef.current?.dispatch(action);
}

export function goBack() {
  return navigationRef?.current?.goBack();
}