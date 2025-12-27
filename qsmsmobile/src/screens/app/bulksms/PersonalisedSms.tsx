// src/screens/BulkSms/tabs/PersonalisedSms.tsx
import Button from "@/src/components/Button";
import { env } from "@/src/config/env";
import { apiClient } from "@/src/service/apiClient";
import {
  calculateSmsCost,
  calculateSmsUnits,
  getSmsBalance,
} from "@/src/service/smsService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Formik } from "formik";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
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

// Validation schema
const validationSchema = Yup.object().shape({
  task: Yup.string().required(),
  senderId: Yup.string()
    .max(11, "Sender ID must be 11 characters or less")
    .min(3, "Sender ID must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Sender ID can only contain letters and numbers")
    .required("Sender ID is required"),
  message: Yup.string()
    .required("Message template is required")
    .min(1, "Message cannot be empty"),
  repeat: Yup.string().required(),
  scheduleDate: Yup.date().required(),
  scheduleTime: Yup.date().required(),
});

// Interface for parsed contact data
interface ContactData {
  phone: string;
  [key: string]: string; // Dynamic columns like name, email, etc.
}

// Interface for column mapping
interface ColumnInfo {
  name: string;
  index: number;
  sampleData: string;
}

// Form values interface
interface FormValues {
  task: string;
  senderId: string;
  message: string;
  repeat: string;
  scheduleDate: Date;
  scheduleTime: Date;
}

// Variable chip component for inserting placeholders
const VariableChip: React.FC<{ 
  label: string; 
  onPress: () => void;
  color?: string;
}> = ({ label, onPress, color = "#3b82f6" }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 mr-2 mb-2"
    style={{ borderColor: color + "40", backgroundColor: color + "10" }}
  >
    <MaterialCommunityIcons name="code-braces" size={14} color={color} />
    <Text className="text-blue-700 text-sm ml-1 font-medium" style={{ color }}>
      {`{${label}}`}
    </Text>
  </TouchableOpacity>
);

// Preview Modal Component
const PreviewModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  messageTemplate: string;
  contacts: ContactData[];
  columns: ColumnInfo[];
}> = ({ visible, onClose, messageTemplate, contacts, columns }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getPreviewMessage = (contact: ContactData): string => {
    let message = messageTemplate;
    columns.forEach(col => {
      const placeholder = new RegExp(`\\{${col.name}\\}`, 'gi');
      message = message.replace(placeholder, contact[col.name.toLowerCase()] || '');
    });
    return message;
  };

  const currentContact = contacts[currentIndex];
  const previewMessage = currentContact ? getPreviewMessage(currentContact) : messageTemplate;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Message Preview</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5">
            {/* Contact Navigator */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className={`p-2 rounded-full ${currentIndex === 0 ? 'bg-gray-100' : 'bg-blue-100'}`}
              >
                <MaterialCommunityIcons 
                  name="chevron-left" 
                  size={24} 
                  color={currentIndex === 0 ? "#9ca3af" : "#3b82f6"} 
                />
              </TouchableOpacity>
              
              <View className="items-center">
                <Text className="text-gray-600 text-sm">Contact</Text>
                <Text className="text-gray-900 font-bold text-lg">
                  {currentIndex + 1} of {contacts.length}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setCurrentIndex(Math.min(contacts.length - 1, currentIndex + 1))}
                disabled={currentIndex === contacts.length - 1}
                className={`p-2 rounded-full ${currentIndex === contacts.length - 1 ? 'bg-gray-100' : 'bg-blue-100'}`}
              >
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={currentIndex === contacts.length - 1 ? "#9ca3af" : "#3b82f6"} 
                />
              </TouchableOpacity>
            </View>

            {/* Contact Details */}
            {currentContact && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-600 text-sm mb-2">Recipient Details:</Text>
                {columns.map((col, idx) => (
                  <View key={idx} className="flex-row justify-between py-1">
                    <Text className="text-gray-500">{col.name}:</Text>
                    <Text className="text-gray-900 font-medium">
                      {currentContact[col.name.toLowerCase()] || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Message Preview */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="message-text" size={18} color="#3b82f6" />
                <Text className="text-blue-700 font-semibold ml-2">Message:</Text>
              </View>
              <Text className="text-gray-800 leading-6">
                {previewMessage}
              </Text>
            </View>
          </ScrollView>

          <View className="p-5 border-t border-gray-100">
            <TouchableOpacity
              onPress={onClose}
              className="py-4 bg-gray-100 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Data Preview Modal - shows imported data
const DataPreviewModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  contacts: ContactData[];
  columns: ColumnInfo[];
  onClearData: () => void;
}> = ({ visible, onClose, contacts, columns, onClearData }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
            <View>
              <Text className="text-xl font-bold text-gray-900">Imported Data</Text>
              <Text className="text-gray-500 text-sm">{contacts.length} contacts</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Column Headers */}
          <View className="flex-row bg-gray-100 px-4 py-3 border-b border-gray-200">
            <Text className="text-gray-600 font-semibold text-xs w-10">#</Text>
            {columns.map((col, idx) => (
              <Text 
                key={idx} 
                className="text-gray-600 font-semibold text-xs flex-1"
                numberOfLines={1}
              >
                {col.name}
              </Text>
            ))}
          </View>

          {/* Data Rows */}
          <FlatList
            data={contacts}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View className={`flex-row px-4 py-3 border-b border-gray-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <Text className="text-gray-400 text-xs w-10">{index + 1}</Text>
                {columns.map((col, idx) => (
                  <Text 
                    key={idx} 
                    className="text-gray-800 text-xs flex-1"
                    numberOfLines={1}
                  >
                    {item[col.name.toLowerCase()] || '-'}
                  </Text>
                ))}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Footer */}
          <View className="p-5 border-t border-gray-100 flex-row">
            <TouchableOpacity
              onPress={onClearData}
              className="flex-1 py-4 bg-red-50 border border-red-200 rounded-xl mr-2"
            >
              <Text className="text-center text-red-600 font-medium">Clear Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-4 bg-blue-500 rounded-xl ml-2"
            >
              <Text className="text-center text-white font-medium">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PersonalisedSms = () => {
  const [loader, setLoader] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Parse CSV/Excel file
  const parseFile = async (content: string, fileName: string): Promise<{ contacts: ContactData[]; columns: ColumnInfo[] }> => {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("File must have at least a header row and one data row");
    }

    // Determine delimiter (comma or tab)
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    // Parse header
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Find phone column (look for 'phone', 'mobile', 'number', 'tel')
    const phoneColumnIndex = headers.findIndex(h => 
      /phone|mobile|number|tel|msisdn/i.test(h)
    );
    
    if (phoneColumnIndex === -1) {
      throw new Error("Could not find a phone number column. Please ensure your file has a column named 'Phone', 'Mobile', 'Number', or 'Tel'");
    }

    // Create column info
    const columnInfos: ColumnInfo[] = headers.map((name, index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      index,
      sampleData: ''
    }));

    // Parse data rows
    const contactData: ContactData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length < headers.length) continue;
      
      const phone = values[phoneColumnIndex].replace(/\D/g, '');
      if (phone.length < 10 || phone.length > 15) continue;
      
      const contact: ContactData = { phone };
      headers.forEach((header, idx) => {
        contact[header.toLowerCase()] = values[idx] || '';
      });
      
      contactData.push(contact);
      
      // Store sample data for first row
      if (i === 1) {
        columnInfos.forEach((col, idx) => {
          col.sampleData = values[idx] || '';
        });
      }
    }

    if (contactData.length === 0) {
      throw new Error("No valid contacts found in file. Please check that phone numbers are correctly formatted.");
    }

    return { contacts: contactData, columns: columnInfos };
  };

  // Import file handler
  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain', 
          'text/csv', 
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'txt', 'xls', 'xlsx'].includes(extension || '')) {
        Alert.alert("Invalid File", "Please select a CSV, TXT, or Excel file.");
        return;
      }

      // For now, we only support CSV/TXT files
      if (['xls', 'xlsx'].includes(extension || '')) {
        Alert.alert(
          "Excel File Detected",
          "For best results, please save your Excel file as CSV and import that instead.",
          [{ text: "OK" }]
        );
        return;
      }

      const content = await FileSystem.readAsStringAsync(file.uri);
      
      if (!content || content.trim().length === 0) {
        Alert.alert("Empty File", "The selected file is empty.");
        return;
      }

      const { contacts: parsedContacts, columns: parsedColumns } = await parseFile(content, file.name);
      
      setContacts(parsedContacts);
      setColumns(parsedColumns);
      
      Alert.alert(
        "Import Successful",
        `Imported ${parsedContacts.length} contacts with ${parsedColumns.length} columns.\n\nAvailable variables: ${parsedColumns.map(c => `{${c.name}}`).join(', ')}`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error('Import error:', error);
      Alert.alert("Import Error", error.message || "Failed to import file. Please check the file format.");
    }
  };

  // Insert variable into message
  const insertVariable = (
    variable: string, 
    currentMessage: string, 
    setFieldValue: (field: string, value: any) => void
  ) => {
    const placeholder = `{${variable}}`;
    const before = currentMessage.slice(0, cursorPosition);
    const after = currentMessage.slice(cursorPosition);
    const newMessage = before + placeholder + after;
    setFieldValue("message", newMessage);
  };

  // Clear imported data
  const clearData = () => {
    Alert.alert(
      "Clear Data",
      "Are you sure you want to clear all imported contact data?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            setContacts([]);
            setColumns([]);
            setShowDataPreview(false);
          }
        }
      ]
    );
  };

  // Send personalized SMS
  const handleSend = async (values: FormValues) => {
    try {
      setLoader(true);

      if (contacts.length === 0) {
        Alert.alert("Error", "Please import a contact file first.");
        setLoader(false);
        return;
      }

      // Check for variables in message
      const variablesInMessage = values.message.match(/\{(\w+)\}/g) || [];
      if (variablesInMessage.length === 0) {
        Alert.alert(
          "No Variables",
          "Your message doesn't contain any personalization variables. Did you mean to send a Normal SMS instead?",
          [
            { text: "Cancel", style: "cancel", onPress: () => setLoader(false) },
            { text: "Continue Anyway", onPress: () => proceedWithSend(values) }
          ]
        );
        return;
      }

      await proceedWithSend(values);
    } catch (error: any) {
      console.error('Send error:', error);
      Alert.alert("Error", error.message || "Failed to send personalized SMS.");
      setLoader(false);
    }
  };

  const proceedWithSend = async (values: FormValues) => {
    // Calculate cost
    const sampleMessage = values.message;
    const { units } = calculateSmsUnits(sampleMessage);
    const totalUnits = units * contacts.length;
    const costPerUnit = 4; // Naira
    const totalCost = totalUnits * costPerUnit;

    // Confirm send
    const confirmSend = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Confirm Personalized SMS",
        `📱 Recipients: ${contacts.length}\n📝 Est. Units per message: ${units}\n📊 Total Units: ~${totalUnits}\n💰 Est. Cost: ₦${totalCost.toLocaleString()}\n\nEach recipient will receive a unique personalized message.`,
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

    try {
      // Prepare data for API
      const smsData = {
        sender_id: values.senderId.trim(),
        message_template: values.message.trim(),
        contacts: contacts.map(c => ({
          phone: c.phone,
          variables: Object.fromEntries(
            Object.entries(c).filter(([key]) => key !== 'phone')
          )
        })),
        type: values.task === "Schedule SMS" ? 'scheduled' : 'instant',
        schedule_date: values.scheduleDate.toISOString().split('T')[0],
        schedule_time: values.scheduleTime.toTimeString().split(" ")[0].slice(0, 5),
        repeat: values.repeat === "Yes"
      };

      // Send to API
      const response = await apiClient.post(env.endpoints.sendPersonalisedSms || '/send-personalised-sms', smsData);

      if (response.data.success || response.data.status === 'success') {
        // Refresh balance
        getSmsBalance();
        
        Alert.alert(
          "🎉 Success!",
          values.task === "Schedule SMS"
            ? `Personalized SMS scheduled!\n${contacts.length} unique messages\n~${totalUnits} units`
            : `Messages sent successfully!\n${contacts.length} recipients\n~${totalUnits} units`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to send messages");
      }
    } catch (error: any) {
      console.error('API error:', error);
      Alert.alert("Error", error.response?.data?.message || error.message || "Failed to send messages");
    } finally {
      setLoader(false);
    }
  };

  // Initial form values
  const initialValues: FormValues = {
    task: "Send Instant SMS",
    senderId: "",
    message: "",
    repeat: "No",
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
          // Calculate SMS info for current message
          const smsInfo = useMemo(() => {
            const { units, charsPerUnit, isUnicode } = calculateSmsUnits(values.message);
            const { totalUnits, totalCost } = calculateSmsCost(values.message, contacts.length);
            const charsRemaining = values.message.length <= charsPerUnit 
              ? charsPerUnit - values.message.length 
              : charsPerUnit - (values.message.length % (charsPerUnit === 160 ? 153 : 67));
            
            return {
              units,
              charsPerUnit,
              isUnicode,
              recipientCount: contacts.length,
              totalUnits,
              totalCost,
              charsRemaining,
              currentPage: Math.ceil(values.message.length / (values.message.length <= charsPerUnit ? charsPerUnit : (charsPerUnit === 160 ? 153 : 67))) || 1
            };
          }, [values.message, contacts.length]);

          return (
          <>
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="bg-white px-5 pt-12 pb-6 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <MaterialCommunityIcons name="account-edit" size={22} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">Personalised SMS</Text>
                    <Text className="text-gray-500 mt-0.5">Send unique messages to each recipient</Text>
                  </View>
                </View>
              </View>

              <View className="px-5 mt-6">
                <View className="space-y-6">
                  {/* HOW IT WORKS INFO */}
                  <Animated.View entering={FadeInDown.delay(100)}>
                    <View className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <View className="flex-row items-start">
                        <MaterialCommunityIcons name="information" size={20} color="#8b5cf6" />
                        <View className="ml-3 flex-1">
                          <Text className="text-purple-800 font-semibold">How it works</Text>
                          <Text className="text-purple-600 text-sm mt-1">
                            1. Import a CSV file with contacts and data{'\n'}
                            2. Create a message template with variables like {'{Name}'}{'\n'}
                            3. Each recipient gets a unique personalized message
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>

                  {/* SEND TYPE */}
                  <Animated.View entering={FadeInDown.delay(150)}>
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="flash" size={20} color="#8b5cf6" />
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
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                            onPress={() => {
                              setFieldValue("task", option);
                              setFieldTouched("task", true);
                            }}
                          >
                            <MaterialCommunityIcons
                              name={option === "Send Instant SMS" ? "flash" : "calendar-clock"}
                              size={20}
                              color={values.task === option ? "#8b5cf6" : "#9ca3af"}
                            />
                            <Text
                              className={`mt-1 text-sm font-medium ${
                                values.task === option ? "text-purple-600" : "text-gray-500"
                              }`}
                            >
                              {option === "Send Instant SMS" ? "Instant" : "Schedule"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </Animated.View>

                  {/* SCHEDULE DATE/TIME */}
                  {values.task === "Schedule SMS" && (
                    <Animated.View 
                      entering={FadeInDown.delay(200)}
                      className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
                    >
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
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
                          <Ionicons name="calendar" size={20} color="#8b5cf6" />
                          <Text className="ml-2 text-gray-700">
                            {values.scheduleDate.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="flex-1 bg-gray-50 rounded-xl p-3 flex-row items-center ml-3"
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Ionicons name="time" size={20} color="#8b5cf6" />
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
                    </Animated.View>
                  )}

                  {/* IMPORT CONTACTS */}
                  <Animated.View entering={FadeInDown.delay(250)}>
                    <Text className="text-gray-800 font-semibold text-base mb-3">
                      Import Contacts *
                    </Text>

                    {contacts.length === 0 ? (
                      <TouchableOpacity
                        onPress={handleImportFile}
                        className="bg-white border-2 border-dashed border-purple-300 rounded-xl p-6 items-center"
                      >
                        <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-3">
                          <MaterialCommunityIcons name="file-upload" size={32} color="#8b5cf6" />
                        </View>
                        <Text className="text-purple-700 font-semibold text-base">Import CSV File</Text>
                        <Text className="text-gray-500 text-sm mt-1 text-center">
                          Upload a file with Phone, Name, and other columns
                        </Text>
                        <View className="flex-row items-center mt-3 bg-purple-50 px-3 py-1.5 rounded-full">
                          <MaterialCommunityIcons name="file-delimited" size={16} color="#8b5cf6" />
                          <Text className="text-purple-600 text-xs ml-1">Supports .csv, .txt files</Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View className="bg-white border border-green-200 rounded-xl p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                              <MaterialCommunityIcons name="check-circle" size={28} color="#10b981" />
                            </View>
                            <View className="ml-3 flex-1">
                              <Text className="text-gray-900 font-semibold">
                                {contacts.length} Contacts Imported
                              </Text>
                              <Text className="text-gray-500 text-sm">
                                {columns.length} columns: {columns.map(c => c.name).join(', ')}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View className="flex-row mt-4 space-x-2">
                          <TouchableOpacity
                            onPress={() => setShowDataPreview(true)}
                            className="flex-1 py-3 bg-purple-50 border border-purple-200 rounded-xl flex-row items-center justify-center"
                          >
                            <MaterialCommunityIcons name="eye" size={18} color="#8b5cf6" />
                            <Text className="text-purple-700 font-medium ml-2">View Data</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleImportFile}
                            className="flex-1 py-3 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center justify-center"
                          >
                            <MaterialCommunityIcons name="swap-horizontal" size={18} color="#6b7280" />
                            <Text className="text-gray-700 font-medium ml-2">Replace</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Animated.View>

                  {/* SENDER ID */}
                  <Animated.View entering={FadeInDown.delay(300)}>
                    <View className="flex-row justify-between items-center mt-4 mb-1">
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

                  {/* MESSAGE TEMPLATE */}
                  <Animated.View entering={FadeInDown.delay(350)}>
                    <View className="flex-row justify-between items-center mt-4 mb-1">
                      <Text className="text-gray-800 font-semibold text-base">
                        Message Template *
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
                          ~{smsInfo.units} page(s)
                        </Text>
                      </View>
                    </View>

                    {/* Variable Chips */}
                    {columns.length > 0 && (
                      <View className="mb-2">
                        <Text className="text-gray-500 text-xs mb-2">Tap to insert variable:</Text>
                        <View className="flex-row flex-wrap">
                          {columns.map((col, idx) => (
                            <VariableChip
                              key={idx}
                              label={col.name}
                              onPress={() => insertVariable(col.name, values.message, setFieldValue)}
                              color={idx % 2 === 0 ? "#8b5cf6" : "#3b82f6"}
                            />
                          ))}
                        </View>
                      </View>
                    )}

                    <View className={`bg-white border rounded-xl p-4 ${
                      errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <TextInput
                        placeholder="Hi {Name}, your order #{OrderId} is ready..."
                        multiline
                        className="text-gray-800 h-40 text-base"
                        textAlignVertical="top"
                        onChangeText={handleChange("message")}
                        onBlur={() => setFieldTouched("message")}
                        value={values.message}
                        placeholderTextColor="#9ca3af"
                        onSelectionChange={(e) => setCursorPosition(e.nativeEvent.selection.start)}
                      />
                      
                      {/* Character count bar */}
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-gray-500 text-xs">
                            {values.message.length} characters (variable lengths may vary)
                          </Text>
                          <Text className={`text-xs font-medium ${
                            smsInfo.units === 1 ? 'text-green-600' : 
                            smsInfo.units <= 3 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            ~{smsInfo.units} SMS page{smsInfo.units !== 1 ? 's' : ''}
                          </Text>
                        </View>
                        <View className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <View 
                            className={`h-full rounded-full ${
                              smsInfo.units === 1 ? 'bg-purple-500' : 
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

                    {/* Preview Button */}
                    {contacts.length > 0 && values.message.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setShowPreview(true)}
                        className="mt-3 flex-row items-center justify-center bg-purple-50 border border-purple-200 rounded-xl py-3"
                      >
                        <MaterialCommunityIcons name="eye" size={20} color="#8b5cf6" />
                        <Text className="text-purple-700 font-medium ml-2">Preview Messages</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>

                  {/* REPEAT CAMPAIGN */}
                  <Animated.View entering={FadeInDown.delay(400)}>
                    <Text className="text-gray-800 font-semibold text-base mb-3">
                      Repeat Campaign?
                    </Text>

                    <View className="flex-row space-x-6">
                      <TouchableOpacity
                        onPress={() => setFieldValue("repeat", "Yes")}
                        className={`flex-1 p-4 rounded-xl border-2 ${
                          values.repeat === "Yes"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-center">
                          <MaterialCommunityIcons 
                            name="repeat" 
                            size={20} 
                            color={values.repeat === "Yes" ? "#8b5cf6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.repeat === "Yes"
                              ? "text-purple-700"
                              : "text-gray-700"
                          }`}>
                            Yes
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setFieldValue("repeat", "No")}
                        className={`flex-1 p-4 rounded-xl border-2 ${
                          values.repeat === "No"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-center">
                          <MaterialCommunityIcons 
                            name="close-circle-outline" 
                            size={20} 
                            color={values.repeat === "No" ? "#8b5cf6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.repeat === "No"
                              ? "text-purple-700"
                              : "text-gray-700"
                          }`}>
                            No
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* BUTTONS */}
                  <Animated.View entering={FadeInDown.delay(450)} className="mt-8 mb-4">
                    {/* Cost Summary Card */}
                    {contacts.length > 0 && values.message.length > 0 && (
                      <View className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl mb-4 border border-purple-100">
                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className="text-gray-600 text-xs">Estimated Total Cost</Text>
                            <Text className="text-purple-700 font-bold text-xl">₦{smsInfo.totalCost.toLocaleString()}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-gray-500 text-xs">{contacts.length} recipients × ~{smsInfo.units} page(s)</Text>
                            <Text className="text-gray-600 text-sm font-medium">~{smsInfo.totalUnits} units</Text>
                          </View>
                        </View>
                        <Text className="text-purple-600 text-xs mt-2 italic">
                          * Actual cost may vary based on personalized content length
                        </Text>
                      </View>
                    )}

                    {/* Send Button */}
                    <Button
                      loading={loader}
                      title={values.task === "Schedule SMS" ? "SCHEDULE PERSONALIZED SMS" : "SEND PERSONALIZED SMS"}
                      action={() => handleSubmit()}
                      disabled={!isValid || loader || contacts.length === 0}
                      className={`py-4 rounded-xl ${(!isValid || loader || contacts.length === 0) ? 'opacity-50' : ''}`}
                    />

                    {/* Clear Button */}
                    <TouchableOpacity
                      onPress={() => {
                        resetForm();
                        setContacts([]);
                        setColumns([]);
                      }}
                      className="mt-4 p-4 rounded-xl bg-gray-100 border border-gray-200 flex-row items-center justify-center"
                    >
                      <MaterialCommunityIcons name="refresh" size={20} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">
                        Clear All
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>

            {/* Preview Modal */}
            <PreviewModal
              visible={showPreview}
              onClose={() => setShowPreview(false)}
              messageTemplate={values.message}
              contacts={contacts}
              columns={columns}
            />

            {/* Data Preview Modal */}
            <DataPreviewModal
              visible={showDataPreview}
              onClose={() => setShowDataPreview(false)}
              contacts={contacts}
              columns={columns}
              onClearData={clearData}
            />
          </>
        );
        }}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default PersonalisedSms;
