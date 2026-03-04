import colors from "@dwwp/utils/colors";
import { displayNOtification } from "@dwwp/utils/displayNotification";
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

export interface BillingCardProps {
    amount: number;
    usage: number;
    dueDate: string;
    isPaid: boolean;
    onPayPress: () => void;
}

const isLastDayOfMonth = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // return tomorrow.getDate() === 1;
    return true 
};
const CurrentBillComponent = () => {
    const dummyBillObject ={
        amount: 250.75,
        usage: 120,
        dueDate: "2026-03-04",
        isPaid: false,
    }

    const isMonthEnd = isLastDayOfMonth();
    const isDisabled = dummyBillObject.isPaid || !isMonthEnd;

    const statusColor = dummyBillObject.isPaid ? "#2ecc71" : "#f39c12";
    const statusText = dummyBillObject.isPaid ? "Paid" : "Pending";


    const payCurrentBill =()=>{
         displayNOtification({ title: "Payment Successful", body: "Your payment has been processed successfully." })
    }
    return (
        <View style={styles.card}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    {new Date().toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                </Text>

                <View style={styles.statusContainer}>
                    <View
                        style={[styles.statusDot, { backgroundColor: statusColor }]}
                    />
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
            </View>

            {/* Amount */}
            <Text style={styles.amount}>₹ {dummyBillObject.amount.toFixed(2)}</Text>

            {/* Usage */}
            <Text style={styles.usage}>Usage: {dummyBillObject.usage} L</Text>

            {/* Due Date */}
            <Text style={styles.due}>Due: {dummyBillObject.dueDate}</Text>

            {/* Pay Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    isDisabled && styles.disabledButton,
                ]}
                disabled={isDisabled}
                onPress={payCurrentBill}
            >
                <Text style={styles.buttonText}>
                    {dummyBillObject.isPaid
                        ? "Already Paid"
                        : !isMonthEnd
                            ? "Available on Month End"
                            : "Pay Now"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CurrentBillComponent;

const styles = StyleSheet.create({
    card: {
        backgroundColor:colors.white,
        padding: 20,
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        margin: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    monthText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "500",
    },
    amount: {
        fontSize: 32,
        fontWeight: "bold",
        marginVertical: 10,
        color: "#081B4B",
    },
    usage: {
        fontSize: 14,
        color: "#666",
    },
    due: {
        fontSize: 14,
        color: "#999",
        marginBottom: 16,
    },
    button: {
        backgroundColor:colors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor:colors.darkGray,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
});