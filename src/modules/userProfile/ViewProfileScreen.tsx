import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// utils 
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { goBack, navigationRef } from '@dwwp/utils/navigationService';
import { strings } from '@dwwp/utils/strings';
import { localImages } from '@dwwp/utils/localimages';
import { screenNames } from '@dwwp/utils/screenNames';

import { UserDetails } from '@dwwp/modals';
import { useAppDispatch, useAppSelector } from '@dwwp/store/hooks';
// components 
import Avatar from '../dashboard/components/Avatar';
import { logout } from '../auth/authAction';
import { LoadingPopup } from '../auth/components/LoadingPopup';
import Pill from '../dashboard/components/Pill';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@dwwp/utils/types';
import { useNavigation } from '@react-navigation/native';

type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const ViewProfileScreen = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation<MainStackNavigationProp>();
  const dispatch = useAppDispatch()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const userSelector = useAppSelector(state => state?.dashboard?.userDetails)
  useEffect(() => {
    if (userSelector === null) return
    setUserDetails({
      fullName: userSelector?.fullName,
      emailId: userSelector?.emailId,
      mobileNo: userSelector?.mobileNo,
      address: userSelector?.address,
      accountNumber: userSelector?.accountNumber,
      consumerNumber: userSelector?.consumerNumber,
      meterNumber: userSelector?.meterNumber,
      supplyZone: userSelector?.supplyZone,
    })
  }, [userSelector?.emailId]);

  const [logouLoading, setLogOutLoading] = useState<boolean>(false)
  const handleLogOut = async () => {
    try {
      setLogOutLoading(true)
      await dispatch(logout())
      navigationRef.current?.getParent()?.getParent()?.reset({
        index: 0,
        routes: [{ name: screenNames.AuthStack }],
      })
    } catch (error) {
      console.error('logout error', error)
    } finally {
      setLogOutLoading(true)
    }
  }

  return (
    <View style={[styles.containerWrapper, { paddingTop: top }]}>
      <View style={styles.homeHeaderContainer}>
        <TouchableOpacity
          onPress={() => goBack()}>
          <Image
            source={localImages.backArrow}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.homeHeaderText}>{strings.viewProfile}</Text>
      </View>
      <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: vh(40) }}>
        {/* Header */}

        <View style={styles.content}>

          <View style={styles.header}>
            <View
              style={styles.avatar}
            >
              {userDetails && (
                <Avatar name={userDetails?.fullName} size={80} />
              )}
            </View>
            <Text style={styles.name}>{userDetails?.fullName}</Text>
            {userDetails?.emailId && (
              <Pill
                label={userDetails?.emailId}
                color={colors.secondary}
                bg={colors.primaryLight}
              />
            )
            }
          </View>

          {/* Info Card */}
          <View style={styles.card}>
            {userDetails && (<>
              <ProfileRow label="Phone" value={userDetails?.mobileNo} />
              <ProfileRow label="User ID" value={userDetails?.consumerNumber} />
              <ProfileRow label="Meter No" value={userDetails?.meterNumber} />
              <ProfileRow label="Address" value={userDetails?.address} />
            </>
            )}
            <ProfileRow
              label="Account Status"
              value={userDetails?.emailId ? 'Active' : 'In Active'}
              valueStyle={{ color: '#10B981' }}
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={() => navigation.navigate(screenNames.EditProfileScreen)}
            style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogOut}
            style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <LoadingPopup visible={logouLoading} message="Logging Out.." />
    </View>
  );
};

export default ViewProfileScreen;

interface ProfileRowProps {
  label: string;
  value: string;
  valueStyle?: any;
}

const ProfileRow = ({ label, value, valueStyle }: ProfileRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: colors.primary
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.overlayBackground,
  },
  homeHeaderContainer: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backArrow: {
    height: vh(16),
    width: vw(16),
    tintColor: colors.white,
    marginHorizontal: vw(16)
  },
  homeHeaderText: {
    fontFamily: fonts.Bold,
    fontSize: normalize(20),
    color: colors.white,
    marginVertical: vh(6)
  },
  content: {
    marginHorizontal: vw(16)
  },
  header: {
    alignItems: 'center',
    marginTop: vh(20),
    marginBottom: vh(24),
  },

  avatar: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(55),
    marginBottom: vh(2),
  },

  name: {
    fontSize: normalize(22),
    fontFamily: fonts.Bold,
    color: colors.primaryBlack,
  },


  card: {
    backgroundColor: colors.white,
    borderRadius: normalize(12),
    paddingVertical: vh(10),
    paddingHorizontal: vw(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: vh(20),
  },

  row: {
    paddingVertical: vh(12),
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  label: {
    fontSize: normalize(12),
    color: '#6B7280',
    marginBottom: vh(4),
    fontFamily: fonts.Regular,
  },

  value: {
    fontSize: normalize(15),
    fontFamily: fonts.Medium,
    color: colors.primaryBlack,
  },

  editButton: {
    backgroundColor: colors.primary,
    paddingVertical: vh(14),
    borderRadius: normalize(10),
    alignItems: 'center',
    marginBottom: vh(12),
  },

  editButtonText: {
    color: colors.white,
    fontSize: normalize(15),
    fontFamily: fonts.Bold,
  },

  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: vh(14),
    borderRadius: normalize(10),
    alignItems: 'center',
  },

  logoutButtonText: {
    color: '#DC2626',
    fontSize: normalize(15),
    fontFamily: fonts.Bold,
  },
});