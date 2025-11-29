import Button from "@/src/components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Yup from "yup";

// Validation
const validationSchema = Yup.object().shape({
  task: Yup.string().required(),
  senderId: Yup.string()
    .max(11, "Sender ID must be 11 characters or less")
    .required(),
  message: Yup.string().required(),
  contact: Yup.string().required(),
  repeat: Yup.string().required(),
});

const NormalSms = () => {
  const navigation: NavigationProp<any> = useNavigation();
  const [loader, setLoader] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const handleSend = async (values: any) => {
    try {
      setLoader(true);
      const token = await SecureStore.getItemAsync("token");

      const endpoint = "http://YOUR_LOCAL_IP:3001/api/sms/normal";

      await axios.post(endpoint, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Success", "Message Sent Successfully!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send SMS"
      );
    } finally {
      setLoader(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="mt-8 px-4">

          <Formik
            initialValues={{
              task: "Send Instant SMS",
              senderId: "",
              message: "",
              contact: "",
              repeat: "No",
            }}
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
            }) => (
              <View className="space-y-8">

                {/* TASK SELECTION */}
                <Animated.View entering={FadeInDown.delay(150)}>
                  <Text className="text-gray-800 font-semibold">
                    Choose task (Send | Schedule)
                  </Text>

                  <View className="border border-gray-300 rounded-lg mt-3 px-4 py-4 flex-row items-center">
                    <MaterialCommunityIcons name="menu" size={20} color="gray" />
                    <TextInput
                      editable={false}
                      value={values.task}
                      className="ml-3 text-gray-700 flex-1"
                    />
                  </View>
                </Animated.View>

                {/* SENDER ID */}
                <Animated.View entering={FadeInDown.delay(250)}>
                  <Text className="text-gray-800 font-semibold">
                    Sender ID *
                  </Text>

                  <View className="border border-gray-300 rounded-lg mt-3 px-4 py-4 flex-row items-center">
                    <MaterialCommunityIcons
                      name="account-badge-outline"
                      size={20}
                      color="gray"
                    />
                    <TextInput
                      placeholder="Enter sender ID"
                      maxLength={11}
                      value={values.senderId}
                      onChangeText={handleChange("senderId")}
                      className="ml-3 flex-1 text-gray-700"
                    />
                  </View>

                  {errors.senderId && touched.senderId && (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.senderId}
                    </Text>
                  )}
                </Animated.View>

                {/* MESSAGE BOX */}
                <Animated.View entering={FadeInDown.delay(350)}>
                  <Text className="text-gray-800 font-semibold">
                    Type your message
                  </Text>

                  <View className="border border-gray-300 rounded-lg mt-3 px-4 py-4">
                    <TextInput
                      placeholder="Please type your message..."
                      multiline
                      className="text-gray-700 h-40"
                      textAlignVertical="top"
                      onChangeText={handleChange("message")}
                      value={values.message}
                    />
                  </View>

                  {errors.message && touched.message && (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.message}
                    </Text>
                  )}
                </Animated.View>

                {/* CONTACT INPUT WITH DROPDOWN */}
                <Animated.View entering={FadeInDown.delay(450)}>
                  <Text className="text-gray-800 font-semibold">
                    Import | Contact group | Enter contact(s)
                  </Text>

                  <View className="border border-gray-300 rounded-lg mt-3 px-4 py-4 flex-row items-center">
                    <MaterialCommunityIcons
                      name="contacts-outline"
                      size={22}
                      color="gray"
                      onPress={() => setContactModal(true)}
                    />

                    <TextInput
                      placeholder="Enter phone numbers separated by comma"
                      value={values.contact}
                      onChangeText={handleChange("contact")}
                      className="ml-3 flex-1 text-gray-700"
                    />
                  </View>

                  {errors.contact && touched.contact && (
                    <Text className="text-red-500 text-sm mt-2">
                      {errors.contact}
                    </Text>
                  )}
                </Animated.View>

                {/* CONTACT DROPDOWN MODAL */}
                <Modal
                  visible={contactModal}
                  transparent
                  animationType="fade"
                >
                  <View className="flex-1 bg-black/40 justify-center px-6">
                    <View className="bg-white rounded-xl p-6 space-y-5">

                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => {
                          setContactModal(false);
                          // TODO: Implement phonebook picker
                          Alert.alert("Phonebook", "Pick from phonebook tapped");
                        }}
                      >
                        <MaterialCommunityIcons
                          name="account-box"
                          size={24}
                          color="gray"
                        />
                        <Text className="ml-3 text-gray-700">
                          Pick from phonebook
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => {
                          setContactModal(false);
                          // TODO: Implement file picker
                          Alert.alert("Import", "Import file tapped");
                        }}
                      >
                        <MaterialCommunityIcons
                          name="file-upload-outline"
                          size={24}
                          color="gray"
                        />
                        <Text className="ml-3 text-gray-700">
                          Import (.csv, .xls, .xlsx, .txt)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setContactModal(false)}
                        className="mt-3 p-3 bg-gray-200 rounded-lg"
                      >
                        <Text className="text-center text-gray-700">Close</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                </Modal>

                {/* REPEAT CAMPAIGN */}
                <Animated.View entering={FadeInDown.delay(550)}>
                  <Text className="text-gray-800 font-semibold">
                    Repeat Campaign?
                  </Text>

                  <View className="flex-row items-center mt-4 space-x-8">
                    {/* YES */}
                    <TouchableOpacity
                      onPress={() => setFieldValue("repeat", "Yes")}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full border mr-2 ${
                          values.repeat === "Yes"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-400"
                        }`}
                      />
                      <Text className="text-gray-700">Yes</Text>
                    </TouchableOpacity>

                    {/* NO */}
                    <TouchableOpacity
                      onPress={() => setFieldValue("repeat", "No")}
                      className="flex-row items-center"
                    >
                      <View
                        className={`w-5 h-5 rounded-full border mr-2 ${
                          values.repeat === "No"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-400"
                        }`}
                      />
                      <Text className="text-gray-700">No</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* BUTTONS */}
                <Animated.View entering={FadeInDown.delay(650)}>
                  <Button
                    loading={loader}
                    title="SEND MESSAGE"
                    action={handleSubmit}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setFieldValue("senderId", "");
                      setFieldValue("message", "");
                      setFieldValue("contact", "");
                    }}
                    className="mt-3 p-4 rounded-lg bg-pink-300"
                  >
                    <Text className="text-center text-white font-semibold">
                      Reset
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

              </View>
            )}
          </Formik>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NormalSms;
