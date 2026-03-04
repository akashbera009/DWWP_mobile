import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import colors from '@dwwp/utils/colors'
import fonts from '@dwwp/utils/fonts'
import { normalize, vh, vw } from '@dwwp/utils/dimensions'
import { CustomHeader } from '@dwwp/components/CustomHeader';
import { goBack, navigationRef } from '@dwwp/utils/navigationService';
import { strings } from '@dwwp/utils/strings';
import { localImages } from '@dwwp/utils/localimages';
import { Screen } from 'react-native-screens';
import { screenNames } from '@dwwp/utils/screenNames';
const ViewProfileScreen = () => {
  // Dummy user data (replace with real data later)
  const user = {
    name: 'Akash Bera',
    email: 'akash@example.com',
    phone: '+91 98765 43210',
    userId: 'DW-10023',
    address: 'Jaipur, Rajasthan',
    status: 'Active',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: vh(40) }}>
      {/* Header */}
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
      <View style={styles.content}>

        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <ProfileRow label="Phone" value={user.phone} />
          <ProfileRow label="User ID" value={user.userId} />
          <ProfileRow label="Address" value={user.address} />
          <ProfileRow
            label="Account Status"
            value={user.status}
            valueStyle={{ color: '#10B981' }}
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigationRef.current?.reset({
            index: 0,
            routes: [{ name: screenNames.AuthStack }],
          })}
          style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    // paddingHorizontal: vw(16),
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
    marginTop: vh(40),
    marginBottom: vh(24),
  },

  avatar: {
    width: normalize(110),
    height: normalize(110),
    borderRadius: normalize(55),
    marginBottom: vh(12),
  },

  name: {
    fontSize: normalize(20),
    fontFamily: fonts.Bold,
    color: colors.primaryBlack,
  },

  email: {
    fontSize: normalize(14),
    fontFamily: fonts.Regular,
    color: '#6B7280',
    marginTop: vh(4),
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