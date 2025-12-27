// src/screens/BulkSms/tabs/ContactlessSms.tsx
// Quick SMS - Send messages without importing contacts, just enter numbers directly
import Button from "@/src/components/Button";
import {
  calculateSmsCost,
  calculateSmsUnits,
  getSmsBalance,
  parsePhoneNumbers,
  scheduleSms,
  sendInstantSms,
} from "@/src/service/smsService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Formik } from "formik";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Yup from "yup";

// Validation schema
const validationSchema = Yup.object().shape({
  task: Yup.string().required(),
  senderId: Yup.string()
    .max(11, "Sender ID must be 11 characters or less")
    .min(3, "Sender ID must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Sender ID can only contain letters and numbers")
    .required("Sender ID is required"),
  message: Yup.string()
    .required("Message is required")
    .min(1, "Message cannot be empty"),
  contact: Yup.string()
    .required("At least one phone number is required")
    .test('valid-phones', 'Enter valid phone numbers', (value) => {
      if (!value) return false;
      const { valid } = parsePhoneNumbers(value);
      return valid.length > 0;
    }),
  scheduleDate: Yup.date().required(),
  scheduleTime: Yup.date().required(),
});

// Form values interface
interface FormValues {
  task: string;
  senderId: string;
  message: string;
  contact: string;
  scheduleDate: Date;
  scheduleTime: Date;
}

// Quick number templates
const quickTemplates = [
  { label: "Single", icon: "account", placeholder: "Enter one number" },
  { label: "Multiple", icon: "account-multiple", placeholder: "Comma separated" },
  { label: "Paste", icon: "content-paste", placeholder: "Paste from clipboard" },
];

const ContactlessSms = () => {
  const [loader, setLoader] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle send
  const handleSend = async (values: FormValues) => {
    try {
      setLoader(true);

      // Parse and validate phone numbers
      const { valid: validContacts, invalid: invalidContacts } = parsePhoneNumbers(values.contact);

      if (validContacts.length === 0) {
        Alert.alert("Error", "Please enter valid phone numbers.");
        setLoader(false);
        return;
      }

      // Warn about invalid numbers but continue
      if (invalidContacts.length > 0) {
        const proceed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Invalid Numbers Found",
            `${invalidContacts.length} invalid number(s) will be skipped:\n${invalidContacts.slice(0, 3).join(', ')}${invalidContacts.length > 3 ? '...' : ''}\n\nContinue with ${validContacts.length} valid number(s)?`,
            [
              { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
              { text: "Continue", onPress: () => resolve(true) }
            ]
          );
        });
        
        if (!proceed) {
          setLoader(false);
          return;
        }
      }

      // Calculate cost and confirm
      const { totalUnits, totalCost, unitsPerMessage } = calculateSmsCost(
        values.message.trim(),
        validContacts.length
      );

      const confirmSend = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Confirm Quick SMS",
          `📱 Recipients: ${validContacts.length}\n📝 Message Units: ${unitsPerMessage}\n📊 Total Units: ${totalUnits}\n💰 Est. Cost: ₦${totalCost.toLocaleString()}`,
          [
            { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
            { text: "Send", onPress: () => resolve(true) }
          ]
        );
      });

      if (!confirmSend) {
        setLoader(false);
        return;
      }

      // Prepare SMS data
      const smsData = {
        senderId: values.senderId.trim(),
        message: values.message.trim(),
        recipients: validContacts,
        type: values.task === "Schedule SMS" ? 'scheduled' as const : 'instant' as const,
        scheduleDate: values.scheduleDate.toISOString().split('T')[0],
        scheduleTime: values.scheduleTime.toTimeString().split(" ")[0].slice(0, 5),
      };

      // Send SMS
      let response;
      if (values.task === "Schedule SMS") {
        response = await scheduleSms(smsData);
      } else {
        response = await sendInstantSms(smsData);
      }

      if (response.success) {
        getSmsBalance();
        
        Alert.alert(
          "🎉 Sent!",
          values.task === "Schedule SMS"
            ? `Quick SMS scheduled!\n${response.totalRecipients || validContacts.length} recipients`
            : `Message sent!\n${response.totalRecipients || validContacts.length} recipients`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      console.error('SMS error:', error);
      Alert.alert("Error", error.message || "Failed to send SMS.");
    } finally {
      setLoader(false);
    }
  };

  // Initial form values
  const initialValues: FormValues = {
    task: "Send Instant SMS",
    senderId: "",
    message: "",
    contact: "",
    scheduleDate: new Date(),
    scheduleTime: new Date()
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSend}
      >
        {({
          handleChange,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
          isValid,
          resetForm,
        }) => {
          // Calculate SMS info
          const smsInfo = useMemo(() => {
            const { units, charsPerUnit, isUnicode } = calculateSmsUnits(values.message);
            const { valid } = parsePhoneNumbers(values.contact);
            const { totalUnits, totalCost } = calculateSmsCost(values.message, valid.length);
            const charsRemaining = values.message.length <= charsPerUnit 
              ? charsPerUnit - values.message.length 
              : charsPerUnit - (values.message.length % (charsPerUnit === 160 ? 153 : 67));
            
            return {
              units,
              charsPerUnit,
              isUnicode,
              recipientCount: valid.length,
              totalUnits,
              totalCost,
              charsRemaining,
            };
          }, [values.message, values.contact]);

          return (
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="bg-white px-5 pt-12 pb-6 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                    <MaterialCommunityIcons name="flash" size={22} color="#f59e0b" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">Quick SMS</Text>
                    <Text className="text-gray-500 mt-0.5">Send messages instantly - no contact import needed</Text>
                  </View>
                </View>
              </View>

              <View className="px-5 mt-6">
                <View className="space-y-6">
                  {/* QUICK INFO */}
                  <Animated.View entering={FadeInDown.delay(100)}>
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <View className="flex-row items-start">
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#f59e0b" />
                        <View className="ml-3 flex-1">
                          <Text className="text-amber-800 font-semibold">Fast & Simple</Text>
                          <Text className="text-amber-600 text-sm mt-1">
                            Just type numbers, compose your message, and send. Perfect for one-time messages.
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>

                  {/* PHONE NUMBERS INPUT */}
                  <Animated.View entering={FadeInDown.delay(150)}>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-800 font-semibold text-base">
                        Phone Numbers *
                      </Text>
                      {smsInfo.recipientCount > 0 && (
                        <View className="bg-green-100 px-2 py-1 rounded-full">
                          <Text className="text-green-700 text-xs font-medium">
                            {smsInfo.recipientCount} valid
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className={`bg-white border rounded-xl ${
                      errors.contact && touched.contact ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                        <MaterialCommunityIcons name="phone-plus" size={20} color="#6b7280" />
                        <Text className="text-gray-500 text-sm ml-2">Enter numbers separated by comma</Text>
                      </View>
                      
                      <TextInput
                        placeholder="e.g., 08012345678, 08098765432, 2348123456789"
                        multiline
                        className="px-4 py-3 text-gray-800 text-base min-h-[100px]"
                        textAlignVertical="top"
                        onChangeText={handleChange("contact")}
                        onBlur={() => setFieldTouched("contact")}
                        value={values.contact}
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                      />

                      {/* Number count display */}
                      {values.contact.length > 0 && (
                        <View className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex-row justify-between">
                          <Text className="text-gray-500 text-xs">
                            {parsePhoneNumbers(values.contact).valid.length} valid • {parsePhoneNumbers(values.contact).invalid.length} invalid
                          </Text>
                          <TouchableOpacity onPress={() => setFieldValue("contact", "")}>
                            <Text className="text-red-500 text-xs font-medium">Clear</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {errors.contact && touched.contact && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.contact}
                      </Text>
                    )}
                  </Animated.View>

                  {/* SENDER ID */}
                  <Animated.View entering={FadeInDown.delay(200)}>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-800 font-semibold text-base">
                        Sender ID *
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        Max 11 characters
                      </Text>
                    </View>

                    <View className={`bg-white border rounded-xl px-4 py-3 flex-row items-center ${
                      errors.senderId && touched.senderId ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <MaterialCommunityIcons
                        name="account-badge-outline"
                        size={22}
                        color="#6b7280"
                      />
                      <TextInput
                        placeholder="Enter Sender ID"
                        maxLength={11}
                        value={values.senderId}
                        onChangeText={handleChange("senderId")}
                        onBlur={() => setFieldTouched("senderId")}
                        className="ml-3 flex-1 text-gray-800 text-base"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {errors.senderId && touched.senderId && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.senderId}
                      </Text>
                    )}
                  </Animated.View>

                  {/* MESSAGE */}
                  <Animated.View entering={FadeInDown.delay(250)}>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-gray-800 font-semibold text-base">
                        Message *
                      </Text>
                      <View className="flex-row items-center">
                        {smsInfo.isUnicode && (
                          <View className="bg-yellow-100 px-2 py-0.5 rounded mr-2">
                            <Text className="text-yellow-700 text-xs">Unicode</Text>
                          </View>
                        )}
                        <Text className={`text-xs ${
                          smsInfo.units > 1 ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                          {smsInfo.charsRemaining} chars left
                        </Text>
                      </View>
                    </View>

                    <View className={`bg-white border rounded-xl p-4 ${
                      errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <TextInput
                        placeholder="Type your message here..."
                        multiline
                        className="text-gray-800 h-32 text-base"
                        textAlignVertical="top"
                        onChangeText={handleChange("message")}
                        onBlur={() => setFieldTouched("message")}
                        value={values.message}
                        placeholderTextColor="#9ca3af"
                      />
                      
                      {/* Character count */}
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-500 text-xs">
                            {values.message.length} characters
                          </Text>
                          <Text className={`text-xs font-medium ${
                            smsInfo.units === 1 ? 'text-green-600' : 
                            smsInfo.units <= 3 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {smsInfo.units} SMS page{smsInfo.units !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <View 
                            className={`h-full rounded-full ${
                              smsInfo.units === 1 ? 'bg-amber-500' : 
                              smsInfo.units <= 3 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min((values.message.length / (smsInfo.charsPerUnit * 3)) * 100, 100)}%` 
                            }}
                          />
                        </View>
                      </View>
                    </View>

                    {errors.message && touched.message && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.message}
                      </Text>
                    )}
                  </Animated.View>

                  {/* SEND TYPE */}
                  <Animated.View entering={FadeInDown.delay(300)}>
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="flash" size={20} color="#f59e0b" />
                        <Text className="ml-2 font-semibold text-gray-800">Send Type</Text>
                      </View>
                      <Text className="text-gray-500 text-xs mb-3">
                        ⚡ Instant: Send now  |  📅 Schedule: Send at a specific date & time
                      </Text>
                      <View className="flex-row space-x-3">
                        {["Send Instant SMS", "Schedule SMS"].map((option) => (
                          <TouchableOpacity
                            key={option}
                            className={`flex-1 py-3 rounded-xl border-2 items-center ${option === "Schedule SMS" ? "ml-3" : ""} ${
                              values.task === option
                                ? "border-amber-500 bg-amber-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                            onPress={() => setFieldValue("task", option)}
                          >
                            <MaterialCommunityIcons
                              name={option === "Send Instant SMS" ? "flash" : "calendar-clock"}
                              size={20}
                              color={values.task === option ? "#f59e0b" : "#9ca3af"}
                            />
                            <Text
                              className={`mt-1 text-sm font-medium ${
                                values.task === option ? "text-amber-600" : "text-gray-500"
                              }`}
                            >
                              {option === "Send Instant SMS" ? "Instant" : "Schedule"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </Animated.View>

                  {/* SCHEDULE PICKER */}
                  {values.task === "Schedule SMS" && (
                    <Animated.View entering={FadeInDown.delay(350)}>
                      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
                          <Text className="ml-2 font-semibold text-gray-800">Schedule</Text>
                        </View>
                        <Text className="text-gray-500 text-xs mb-3">
                          📅 Choose when to send. Great for promotions, reminders, or off-peak hours.
                        </Text>
                        
                        <View className="flex-row space-x-3">
                          <TouchableOpacity
                            className="flex-1 bg-gray-50 rounded-xl p-3 flex-row items-center"
                            onPress={() => setShowDatePicker(true)}
                          >
                            <Ionicons name="calendar" size={20} color="#f59e0b" />
                            <Text className="ml-2 text-gray-700">
                              {values.scheduleDate.toLocaleDateString()}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="flex-1 bg-gray-50 rounded-xl p-3 flex-row items-center ml-3"
                            onPress={() => setShowTimePicker(true)}
                          >
                            <Ionicons name="time" size={20} color="#f59e0b" />
                            <Text className="ml-2 text-gray-700">
                              {values.scheduleTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                          <DateTimePicker
                            value={values.scheduleDate}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(_, date) => {
                              setShowDatePicker(false);
                              if (date) setFieldValue("scheduleDate", date);
                            }}
                          />
                        )}

                        {showTimePicker && (
                          <DateTimePicker
                            value={values.scheduleTime}
                            mode="time"
                            onChange={(_, time) => {
                              setShowTimePicker(false);
                              if (time) setFieldValue("scheduleTime", time);
                            }}
                          />
                        )}
                      </View>
                    </Animated.View>
                  )}

                  {/* COST SUMMARY & SEND */}
                  <Animated.View entering={FadeInDown.delay(400)} className="mt-6 mb-4">
                    {/* Cost Card */}
                    {smsInfo.recipientCount > 0 && values.message.length > 0 && (
                      <View className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl mb-4 border border-amber-100">
                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className="text-gray-600 text-xs">Total Cost</Text>
                            <Text className="text-amber-700 font-bold text-2xl">₦{smsInfo.totalCost.toLocaleString()}</Text>
                          </View>
                          <View className="items-end">
                            <View className="flex-row items-center">
                              <MaterialCommunityIcons name="account-multiple" size={16} color="#6b7280" />
                              <Text className="text-gray-600 text-sm ml-1">{smsInfo.recipientCount}</Text>
                            </View>
                            <View className="flex-row items-center mt-1">
                              <MaterialCommunityIcons name="file-document-outline" size={16} color="#6b7280" />
                              <Text className="text-gray-600 text-sm ml-1">{smsInfo.totalUnits} units</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Send Button */}
                    <Button
                      loading={loader}
                      title={values.task === "Schedule SMS" ? "⏰ SCHEDULE SMS" : "⚡ SEND NOW"}
                      action={() => handleSubmit()}
                      disabled={!isValid || loader || smsInfo.recipientCount === 0}
                      className={`py-4 rounded-xl ${(!isValid || loader || smsInfo.recipientCount === 0) ? 'opacity-50' : ''}`}
                    />

                    {/* Clear Button */}
                    <TouchableOpacity
                      onPress={() => resetForm()}
                      className="mt-3 p-3 flex-row items-center justify-center"
                    >
                      <MaterialCommunityIcons name="refresh" size={18} color="#6b7280" />
                      <Text className="text-gray-500 font-medium ml-2">Clear Form</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>
          );
        }}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default ContactlessSms;
