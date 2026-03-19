// DummySeeder.tsx
import React, { useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';

import firestore from '@react-native-firebase/firestore'

/** ---------- Helpers ---------- */
function generateRazorPayId(prefix = 'pay') {
    const t = Date.now().toString(36)
    const r = Math.random().toString(36).slice(2, 8)
    return `${prefix}_${t}_${r}`
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePaymentAmount(monthIndex: number) {
    const base = 250
    const variable = monthIndex * 5
    const noise = randInt(-25, 50)

    return String(Math.max(50, base + variable + noise))
}

function generateAddonAmount(monthIndex: number) {
    return randInt(20, 150) + (monthIndex % 3) * 5
}

/** ---------- Month helper ---------- */

function getPastMonths(n = 12) {
    const months: string[] = []
    const now = new Date()

    for (let i = 0; i < n; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')

        months.push(`${yyyy}-${mm}`)
    }

    return months.reverse()
}
/**
 * Demo function that inserts payment + addon documents for each month.
 * - userEmail: doc id under users/
 * - months: array of 'YYYY-MM' strings; if omitted, uses past 12 months
 */
export async function seedDummyMonthlyData(
    userEmail: string,
    months?: string[]
) {
    if (!userEmail) throw new Error('userEmail required')

    const monthsToWrite = months?.length ? months : getPastMonths(12)

    const batch = firestore().batch()

    try {
        monthsToWrite.forEach((month, idx) => {

            /** PAYMENT DOC */
            const paymentRef = firestore()
                .collection('users').doc(userEmail)
                .collection('monthlyUsages').doc(month)
                .collection('payment').doc('payment_details')

            const paymentPayload = {
                amount: generatePaymentAmount(idx),
                forMonth: month,
                razor_pay_id: generateRazorPayId(),
                status: 'Completed',
                timeStamp: firestore.FieldValue.serverTimestamp(),
            }

            batch.set(paymentRef, paymentPayload)

            /** ADDON DOC */
            const addonRazorId = generateRazorPayId('addonpay')

            const addonRef = firestore()
                .collection('users').doc(userEmail)
                .collection('monthlyUsages').doc(month)
                .collection('addon')
                .doc(`addon_${month}_${addonRazorId}`)

            const addonPayload = {
                addon_date: firestore.FieldValue.serverTimestamp(),
                amount: generateAddonAmount(idx),
                qty: randInt(1, 4),
                razor_pay_id: addonRazorId,
                refill: randInt(20, 200),
                forMonth: month,
            }

            batch.set(addonRef, addonPayload)
        })

        await batch.commit()

        console.log('Dummy data seeded for months:', monthsToWrite)

        return {
            success: true,
            months: monthsToWrite,
        }

    } catch (error: any) {
        console.error('Seeding failed', error)
        throw error
    }
}

/**
 * Small RN component that triggers seeding on button press
 */
export default function DummySeederDemo() {
    const userEmail = 'ab@gmail.com'; // change to target user doc id

    const onSeedPress = useCallback(async () => {
        try {
            // Example: seed past 12 months (default)
            const res = await seedDummyMonthlyData(userEmail);
            // show feedback to user as needed
            console.log('Seeding result', res);
            Alert.alert(`Seeded ${res.months.length} months for ${userEmail}`);
        } catch (e) {
            Alert.alert('Error seeding dummy data: ' + (e as Error).message);
        }
    }, []);

    // paste into your DummySeeder.tsx (next to other imports)
    async function testFirestoreConnection() {
        try {
            const debugRef = firestore().collection('debug_seeder').doc('ping');
            console.log('Writing ping doc...');
            await debugRef.set({
                ping: true,
                ts: firestore.FieldValue.serverTimestamp(),
            });

            console.log('Reading ping doc back...');
            const snap = await debugRef.get();
            console.log('snap.exists:', snap.exists);
            console.log('snap.data():', snap.data());
            Alert.alert('Firestore test', `Wrote and read back debug_seeder/ping — exists=${snap.exists}`);
        } catch (err: any) {
            console.error('Firestore test failed', err);
            Alert.alert('Firestore test error', err.message || String(err));
        }
    }
    return (
        <View style={{ padding: 16 }}>
            <Text style={{ marginBottom: 8 }}>
                Demo: Seed dummy monthly payments & addons (unique ids & varied amounts)
            </Text>
            <TouchableOpacity onPress={onSeedPress}>
                <Text>Add Dummy Data (past 12 months)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={testFirestoreConnection}>
                <Text>test connection</Text>
            </TouchableOpacity>
        </View>
    );
}