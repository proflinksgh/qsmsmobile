// src/screens/BulkSms/tabs/DataSms.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Formik } from "formik";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import * as Yup from "yup";
//import { sendSms } from "../../../service/smsService";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface DataRow {
  [key: string]: string;
}

interface FormValues {
  task: "Send Instant SMS" | "Schedule SMS";
  senderId: string;
  message: string;
  repeat: "Yes" | "No";
  scheduleDate: Date;
  scheduleTime: Date;
}

// ─────────────────────────────────────────────────────────────
// Validation Schema
// ─────────────────────────────────────────────────────────────
const DataSmsSchema = Yup.object().shape({
  task: Yup.string().oneOf(["Send Instant SMS", "Schedule SMS"]).required("Task type is required"),
  senderId: Yup.string()
    .min(3, "Sender ID must be at least 3 characters")
    .max(11, "Sender ID must be at most 11 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters allowed")
    .required("Sender ID is required"),
  message: Yup.string()
    .min(1, "Message is required")
    .max(918, "Message too long (max 918 characters)")
    .required("Message is required"),
  repeat: Yup.string().oneOf(["Yes", "No"]).required(),
});

// ─────────────────────────────────────────────────────────────
// Helper: Parse CSV
// ─────────────────────────────────────────────────────────────
const parseCSV = (content: string): { headers: string[]; rows: DataRow[] } => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  // Parse headers
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));

  // Parse data rows
  const rows: DataRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    if (values.length >= headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }
  }

  return { headers, rows };
};

// ─────────────────────────────────────────────────────────────
// Helper: Find phone column
// ─────────────────────────────────────────────────────────────
const findPhoneColumn = (headers: string[]): string | null => {
  const phoneKeywords = ["phone", "mobile", "cell", "number", "tel", "contact", "msisdn"];
  for (const header of headers) {
    const lowerHeader = header.toLowerCase();
    if (phoneKeywords.some((kw) => lowerHeader.includes(kw))) {
      return header;
    }
  }
  // Default to first column if no phone column found
  return headers.length > 0 ? headers[0] : null;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const DataSms = () => {
  // Data state
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [phoneColumn, setPhoneColumn] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPhoneColumnPicker, setShowPhoneColumnPicker] = useState(false);

  // Theme color
  const primaryColor = "#f97316"; // Orange

  // ─────────────────────────────────────────────────────────────
  // Import CSV file
  // ─────────────────────────────────────────────────────────────
  const handleImportCSV = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setIsLoading(true);

      const content = await FileSystem.readAsStringAsync(file.uri);
      const { headers: parsedHeaders, rows } = parseCSV(content);

      if (parsedHeaders.length === 0) {
        Alert.alert("Error", "Could not parse CSV file. Please check the format.");
        setIsLoading(false);
        return;
      }

      if (rows.length === 0) {
        Alert.alert("Error", "CSV file contains no data rows.");
        setIsLoading(false);
        return;
      }

      setHeaders(parsedHeaders);
      setDataRows(rows);
      setFileName(file.name || "imported.csv");

      // Auto-detect phone column
      const detectedPhoneCol = findPhoneColumn(parsedHeaders);
      setPhoneColumn(detectedPhoneCol);

      Alert.alert(
        "Import Successful",
        `Imported ${rows.length} rows with ${parsedHeaders.length} columns.\nPhone column: ${detectedPhoneCol || "Not detected"}`
      );
    } catch (error) {
      console.error("CSV import error:", error);
      Alert.alert("Error", "Failed to import CSV file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Clear data
  // ─────────────────────────────────────────────────────────────
  const handleClearData = useCallback(() => {
    Alert.alert("Clear Data", "Are you sure you want to clear all imported data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setHeaders([]);
          setDataRows([]);
          setPhoneColumn(null);
          setFileName("");
        },
      },
    ]);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Insert variable into message
  // ─────────────────────────────────────────────────────────────
  const insertVariable = useCallback(
    (variable: string, setFieldValue: (field: string, value: string) => void, currentMessage: string) => {
      const tag = `{${variable}}`;
      setFieldValue("message", currentMessage + tag);
    },
    []
  );

  // ─────────────────────────────────────────────────────────────
  // Calculate message stats
  // ─────────────────────────────────────────────────────────────
  const calculateMessageStats = useCallback((message: string) => {
    const length = message.length;
    let pages = 1;
    if (length <= 160) pages = 1;
    else if (length <= 306) pages = 2;
    else if (length <= 459) pages = 3;
    else if (length <= 612) pages = 4;
    else if (length <= 765) pages = 5;
    else if (length <= 918) pages = 6;
    else pages = Math.ceil(length / 153);

    return { length, pages };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Generate preview for a row
  // ─────────────────────────────────────────────────────────────
  const generatePreview = useCallback((message: string, row: DataRow): string => {
    let preview = message;
    Object.keys(row).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "gi");
      preview = preview.replace(regex, row[key]);
    });
    return preview;
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Calculate cost
  // ─────────────────────────────────────────────────────────────
  const calculateCost = useCallback(
    (message: string) => {
      const { pages } = calculateMessageStats(message);
      const recipientCount = dataRows.length;
      const totalUnits = pages * recipientCount;
      const costPerUnit = 0.025; // GHS per unit
      return {
        pages,
        recipientCount,
        totalUnits,
        estimatedCost: (totalUnits * costPerUnit).toFixed(2),
      };
    },
    [dataRows.length, calculateMessageStats]
  );

  // ─────────────────────────────────────────────────────────────
  // Submit handler
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (values: FormValues) => {
      if (dataRows.length === 0) {
        Alert.alert("Error", "Please import a CSV file first.");
        return;
      }

      if (!phoneColumn) {
        Alert.alert("Error", "Please select a phone number column.");
        return;
      }

      // Validate phone column has data
      const phoneNumbers = dataRows
        .map((row) => row[phoneColumn])
        .filter((phone) => phone && phone.trim() !== "");

      if (phoneNumbers.length === 0) {
        Alert.alert("Error", "No valid phone numbers found in the selected column.");
        return;
      }

      const costInfo = calculateCost(values.message);

      Alert.alert(
        "Confirm Send",
        `Send ${costInfo.recipientCount} personalized messages?\n\nEstimated cost: GHS ${costInfo.estimatedCost}\nTotal SMS units: ${costInfo.totalUnits}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send",
            onPress: async () => {
              setIsLoading(true);
              try {
                // Build messages array for each recipient
                const messages = dataRows.map((row) => ({
                  phone: row[phoneColumn],
                  message: generatePreview(values.message, row),
                }));

                const payload = {
                  task: values.task,
                  senderId: values.senderId,
                  messages,
                  repeat: values.repeat,
                  ...(values.task === "Schedule SMS" && {
                    scheduleDate: values.scheduleDate.toISOString().split("T")[0],
                    scheduleTime: values.scheduleTime.toTimeString().split(" ")[0].slice(0, 5),
                  }),
                };

                //await sendSms(payload);
                Alert.alert("Success", "Data SMS campaign submitted successfully!");

                // Clear data after successful send
                setHeaders([]);
                setDataRows([]);
                setPhoneColumn(null);
                setFileName("");
              } catch (error: any) {
                Alert.alert("Error", error.message || "Failed to send SMS campaign.");
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    },
    [dataRows, phoneColumn, calculateCost, generatePreview]
  );

  // ─────────────────────────────────────────────────────────────
  // Render Data Table Modal
  // ─────────────────────────────────────────────────────────────
  const renderDataModal = useMemo(
    () => (
      <Modal visible={showDataModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200"
            style={{ paddingTop: Platform.OS === "ios" ? 50 : 16 }}
          >
            <Text className="text-lg font-bold text-gray-800">Imported Data</Text>
            <TouchableOpacity onPress={() => setShowDataModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="px-4 py-2 bg-orange-50">
            <Text className="text-orange-700 font-medium">
              {dataRows.length} rows • {headers.length} columns
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              {/* Header row */}
              <View className="flex-row bg-orange-100 border-b border-orange-200">
                <View className="w-12 px-2 py-3 border-r border-orange-200">
                  <Text className="font-bold text-orange-800 text-xs">#</Text>
                </View>
                {headers.map((header, index) => (
                  <View
                    key={index}
                    className="w-32 px-2 py-3 border-r border-orange-200"
                  >
                    <Text
                      className={`font-bold text-xs ${header === phoneColumn ? "text-orange-600" : "text-gray-700"}`}
                      numberOfLines={1}
                    >
                      {header === phoneColumn && "📱 "}
                      {header}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Data rows */}
              <FlatList
                data={dataRows.slice(0, 100)}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View className="flex-row border-b border-gray-100">
                    <View className="w-12 px-2 py-3 border-r border-gray-100 bg-gray-50">
                      <Text className="text-gray-500 text-xs">{index + 1}</Text>
                    </View>
                    {headers.map((header, colIndex) => (
                      <View
                        key={colIndex}
                        className="w-32 px-2 py-3 border-r border-gray-100"
                      >
                        <Text className="text-gray-600 text-xs" numberOfLines={2}>
                          {item[header]}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                ListFooterComponent={
                  dataRows.length > 100 ? (
                    <View className="p-4">
                      <Text className="text-gray-500 text-center">
                        Showing first 100 of {dataRows.length} rows
                      </Text>
                    </View>
                  ) : null
                }
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    ),
    [showDataModal, headers, dataRows, phoneColumn]
  );

  // ─────────────────────────────────────────────────────────────
  // Render Preview Modal
  // ─────────────────────────────────────────────────────────────
  const PreviewModal = ({ message }: { message: string }) => (
    <Modal visible={showPreviewModal} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200"
          style={{ paddingTop: Platform.OS === "ios" ? 50 : 16 }}
        >
          <Text className="text-lg font-bold text-gray-800">Message Preview</Text>
          <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dataRows.slice(0, 10)}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item, index }) => (
            <View className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-orange-600 font-semibold">
                  Recipient {index + 1}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {phoneColumn ? item[phoneColumn] : "N/A"}
                </Text>
              </View>
              <View className="bg-white p-3 rounded-lg border border-gray-100">
                <Text className="text-gray-700 leading-5">
                  {generatePreview(message, item)}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            dataRows.length > 10 ? (
              <Text className="text-gray-500 text-center mt-4">
                Showing preview for first 10 of {dataRows.length} recipients
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center py-8">
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-2">No data to preview</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );

  // ─────────────────────────────────────────────────────────────
  // Render Phone Column Picker
  // ─────────────────────────────────────────────────────────────
  const renderPhoneColumnPicker = useMemo(
    () => (
      <Modal visible={showPhoneColumnPicker} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowPhoneColumnPicker(false)}
        >
          <View className="bg-white rounded-2xl w-80 max-h-96 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-200 bg-orange-50">
              <Text className="text-lg font-bold text-orange-800">
                Select Phone Column
              </Text>
            </View>
            <ScrollView className="max-h-72">
              {headers.map((header, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                    header === phoneColumn ? "bg-orange-50" : ""
                  }`}
                  onPress={() => {
                    setPhoneColumn(header);
                    setShowPhoneColumnPicker(false);
                  }}
                >
                  <Text
                    className={`${header === phoneColumn ? "text-orange-600 font-semibold" : "text-gray-700"}`}
                  >
                    {header}
                  </Text>
                  {header === phoneColumn && (
                    <Ionicons name="checkmark" size={20} color="#f97316" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    ),
    [showPhoneColumnPicker, headers, phoneColumn]
  );

  // ─────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50">
      <Formik<FormValues>
        initialValues={{
          task: "Send Instant SMS",
          senderId: "",
          message: "",
          repeat: "No",
          scheduleDate: new Date(),
          scheduleTime: new Date(),
        }}
        validationSchema={DataSmsSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          handleSubmit: formikSubmit,
        }) => {
          const messageStats = calculateMessageStats(values.message);
          const costInfo = calculateCost(values.message);

          return (
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Data Import Section */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="cloud-upload-outline" size={20} color={primaryColor} />
                    <Text className="ml-2 font-semibold text-gray-800">Import Data</Text>
                  </View>
                  
                  {/* Instructions */}
                  <View className="bg-orange-50 rounded-lg p-3 mb-3 border border-orange-100">
                    <Text className="text-orange-800 text-xs font-medium mb-1">📋 How to use:</Text>
                    <Text className="text-gray-600 text-xs leading-4">
                      1. Prepare a CSV file with columns (e.g., Phone, Name, Amount){"\n"}
                      2. First row should be headers{"\n"}
                      3. Phone column will be auto-detected
                    </Text>
                    <View className="mt-2 bg-white rounded p-2 border border-orange-200">
                      <Text className="text-gray-500 text-xs font-medium mb-1">Example CSV:</Text>
                      <Text className="text-gray-700 text-xs font-mono">
                        Phone,Name,Amount{"\n"}
                        0241234567,John,500{"\n"}
                        0551234567,Mary,750
                      </Text>
                    </View>
                  </View>

                  {dataRows.length === 0 ? (
                    <TouchableOpacity
                      className="border-2 border-dashed border-orange-300 rounded-xl p-6 items-center bg-orange-50"
                      onPress={handleImportCSV}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={primaryColor} size="large" />
                      ) : (
                        <>
                          <Ionicons name="document-attach-outline" size={40} color={primaryColor} />
                          <Text className="text-orange-600 font-medium mt-2">
                            Tap to import CSV file
                          </Text>
                          <Text className="text-gray-400 text-sm mt-1">
                            CSV with phone numbers and data columns
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View className="bg-orange-50 rounded-xl p-4">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1">
                          <Ionicons name="document-text" size={24} color={primaryColor} />
                          <View className="ml-3 flex-1">
                            <Text className="font-medium text-gray-800" numberOfLines={1}>
                              {fileName}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                              {dataRows.length} rows • {headers.length} columns
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          className="p-2"
                          onPress={handleClearData}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      {/* Phone column selector */}
                      <TouchableOpacity
                        className="flex-row items-center justify-between bg-white rounded-lg p-3 mb-3"
                        onPress={() => setShowPhoneColumnPicker(true)}
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="call-outline" size={18} color={primaryColor} />
                          <Text className="ml-2 text-gray-600">Phone Column:</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-orange-600 font-medium">
                            {phoneColumn || "Select"}
                          </Text>
                          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </View>
                      </TouchableOpacity>

                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          className="flex-1 bg-white rounded-lg py-2 flex-row items-center justify-center mr-2"
                          onPress={() => setShowDataModal(true)}
                        >
                          <Ionicons name="grid-outline" size={16} color={primaryColor} />
                          <Text className="text-orange-600 font-medium ml-1">View Data</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 bg-white rounded-lg py-2 flex-row items-center justify-center"
                          onPress={handleImportCSV}
                        >
                          <Ionicons name="refresh-outline" size={16} color="#6b7280" />
                          <Text className="text-gray-600 font-medium ml-1">Re-import</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* Task Type */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="flash-outline" size={20} color={primaryColor} />
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
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        onPress={() => setFieldValue("task", option)}
                      >
                        <Ionicons
                          name={option === "Send Instant SMS" ? "flash" : "calendar"}
                          size={20}
                          color={values.task === option ? primaryColor : "#9ca3af"}
                        />
                        <Text
                          className={`mt-1 text-sm font-medium ${
                            values.task === option ? "text-orange-600" : "text-gray-500"
                          }`}
                        >
                          {option === "Send Instant SMS" ? "Instant" : "Schedule"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Schedule Options */}
                {values.task === "Schedule SMS" && (
                  <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar-outline" size={20} color={primaryColor} />
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
                        <Ionicons name="calendar" size={20} color={primaryColor} />
                        <Text className="ml-2 text-gray-700">
                          {values.scheduleDate.toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 bg-gray-50 rounded-xl p-3 flex-row items-center ml-3"
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Ionicons name="time" size={20} color={primaryColor} />
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
                )}

                {/* Sender ID */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="person-outline" size={20} color={primaryColor} />
                    <Text className="ml-2 font-semibold text-gray-800">Sender ID</Text>
                  </View>
                  <Text className="text-gray-500 text-xs mb-3">
                    💡 This name appears as the sender. Use your brand name (e.g., MyShop, BankABC)
                  </Text>
                  <TextInput
                    className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 ${
                      errors.senderId && touched.senderId ? "border border-red-400" : ""
                    }`}
                    placeholder="e.g., MyBrand"
                    value={values.senderId}
                    onChangeText={handleChange("senderId")}
                    onBlur={handleBlur("senderId")}
                    maxLength={11}
                    autoCapitalize="none"
                  />
                  <View className="flex-row justify-between mt-2">
                    {errors.senderId && touched.senderId ? (
                      <Text className="text-red-500 text-sm">{errors.senderId}</Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">3-11 alphanumeric characters</Text>
                    )}
                    <Text className="text-gray-400 text-sm">{values.senderId.length}/11</Text>
                  </View>
                </View>

                {/* Message Composition */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Ionicons name="chatbubble-outline" size={20} color={primaryColor} />
                      <Text className="ml-2 font-semibold text-gray-800">Message</Text>
                    </View>
                    {dataRows.length > 0 && (
                      <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setShowPreviewModal(true)}
                      >
                        <Ionicons name="eye-outline" size={18} color={primaryColor} />
                        <Text className="text-orange-600 ml-1 font-medium">Preview</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Instructions for message */}
                  <View className="bg-orange-50 rounded-lg p-2 mb-3 border border-orange-100">
                    <Text className="text-gray-600 text-xs leading-4">
                      💡 Use {`{ColumnName}`} to insert personalized data.{"\n"}
                      Example: "Hi {`{Name}`}, you owe GHS {`{Amount}`}" → "Hi John, you owe GHS 500"
                    </Text>
                  </View>

                  {/* Variables chips */}
                  {headers.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-gray-500 text-sm mb-2">
                        Tap to insert variables:
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row">
                          {headers
                            .filter((h) => h !== phoneColumn)
                            .map((header, index) => (
                              <TouchableOpacity
                                key={index}
                                className="bg-orange-100 rounded-full px-3 py-1.5 mr-2 flex-row items-center"
                                onPress={() =>
                                  insertVariable(header, setFieldValue, values.message)
                                }
                              >
                                <Ionicons name="add" size={14} color={primaryColor} />
                                <Text className="text-orange-700 ml-1 font-medium">
                                  {`{${header}}`}
                                </Text>
                              </TouchableOpacity>
                            ))}
                        </View>
                      </ScrollView>
                    </View>
                  )}

                  <TextInput
                    className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 min-h-32 ${
                      errors.message && touched.message ? "border border-red-400" : ""
                    }`}
                    placeholder={
                      headers.length > 0
                        ? "Hello {Name}, your order #{OrderID} is ready..."
                        : "Type your message here..."
                    }
                    value={values.message}
                    onChangeText={handleChange("message")}
                    onBlur={handleBlur("message")}
                    multiline
                    textAlignVertical="top"
                    maxLength={918}
                  />

                  <View className="flex-row justify-between mt-2">
                    <View className="flex-row items-center">
                      <View className="bg-orange-100 rounded-full px-2 py-1 mr-2">
                        <Text className="text-orange-700 text-xs font-medium">
                          {messageStats.pages} page{messageStats.pages > 1 ? "s" : ""}
                        </Text>
                      </View>
                      {errors.message && touched.message && (
                        <Text className="text-red-500 text-sm">{errors.message}</Text>
                      )}
                    </View>
                    <Text className="text-gray-400 text-sm">
                      {messageStats.length}/918
                    </Text>
                  </View>
                </View>

                {/* Repeat Campaign */}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="repeat-outline" size={20} color={primaryColor} />
                      <Text className="ml-2 font-semibold text-gray-800">Repeat Campaign</Text>
                    </View>
                    <TouchableOpacity
                      className={`w-14 h-8 rounded-full justify-center ${
                        values.repeat === "Yes" ? "bg-orange-500" : "bg-gray-300"
                      }`}
                      onPress={() =>
                        setFieldValue("repeat", values.repeat === "Yes" ? "No" : "Yes")
                      }
                    >
                      <View
                        className={`w-6 h-6 bg-white rounded-full shadow ${
                          values.repeat === "Yes" ? "self-end mr-1" : "self-start ml-1"
                        }`}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-gray-400 text-xs mt-1">
                    🔁 Enable to send this same campaign on a recurring basis (daily, weekly, etc.)
                  </Text>
                </View>

                {/* Cost Summary */}
                {dataRows.length > 0 && values.message.length > 0 && (
                  <View className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-200">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="calculator-outline" size={20} color={primaryColor} />
                      <Text className="ml-2 font-semibold text-orange-800">Cost Summary</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600">Recipients</Text>
                      <Text className="text-gray-800 font-medium">{costInfo.recipientCount}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600">Pages per message</Text>
                      <Text className="text-gray-800 font-medium">{costInfo.pages}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600">Total SMS units</Text>
                      <Text className="text-gray-800 font-medium">{costInfo.totalUnits}</Text>
                    </View>
                    <View className="h-px bg-orange-200 my-2" />
                    <View className="flex-row justify-between">
                      <Text className="text-orange-800 font-semibold">Estimated Cost</Text>
                      <Text className="text-orange-600 font-bold text-lg">
                        GHS {costInfo.estimatedCost}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Submit Button */}
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                  className={`rounded-xl py-4 flex-row items-center justify-center ${
                    isLoading || dataRows.length === 0 || !values.message
                      ? "bg-gray-300"
                      : "bg-orange-500"
                  }`}
                  onPress={() => formikSubmit()}
                  disabled={isLoading || dataRows.length === 0 || !values.message}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name={values.task === "Schedule SMS" ? "calendar" : "send"}
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-bold text-lg ml-2">
                        {values.task === "Schedule SMS" ? "Schedule Campaign" : "Send Campaign"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Modals */}
              {renderDataModal}
              <PreviewModal message={values.message} />
              {renderPhoneColumnPicker}
            </KeyboardAvoidingView>
          );
        }}
      </Formik>
    </View>
  );
};

export default DataSms;
