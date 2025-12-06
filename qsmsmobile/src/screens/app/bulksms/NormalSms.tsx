import Button from "@/src/components/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Contacts from "expo-contacts";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
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

const validationSchema = Yup.object().shape({
  task: Yup.string().required(),
  senderId: Yup.string()
    .max(11, "Sender ID must be 11 characters or less")
    .required("Sender ID is required"),
  message: Yup.string()
    .required("Message is required")
    .max(160, "Message cannot exceed 160 characters"),
  contact: Yup.string().required("At least one contact is required"),
  repeat: Yup.string().required(),
  scheduleDate: Yup.date().nullable(),
  scheduleTime: Yup.string().nullable(),
});

// Contact Group Interface
interface ContactGroup {
  id: string;
  name: string;
  contacts: string[];
}

// Interface for contact with phone numbers
interface PhoneNumber {
  id?: string;
  number?: string;
  label?: string;
}

// Interface for Expo Contacts
interface Contact {
  id: string;
  name: string;
  phoneNumbers?: PhoneNumber[];
}

// Contact item for browser
interface ContactItem {
  id: string;
  name: string;
  phoneNumbers: string[];
  selected: boolean;
}

// Form values interface
interface FormValues {
  task: string;
  senderId: string;
  message: string;
  contact: string;
  repeat: string;
  scheduleDate: Date | null;
  scheduleTime: string;
}

// Contact Selection Modal Component
const ContactSelectionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectAllContacts: () => Promise<void>;
  onSelectIndividualContacts: () => Promise<void>;
  onImportFromFile: () => Promise<void>;
}> = ({ visible, onClose, onSelectAllContacts, onSelectIndividualContacts, onImportFromFile }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80}
        >
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
            {/* HEADER */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Add Contacts</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* OPTION 1 — SELECT ALL CONTACTS */}
            <TouchableOpacity
              className="flex-row items-center p-4 bg-blue-50 rounded-xl mb-3"
              onPress={onSelectAllContacts}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center">
                <MaterialCommunityIcons name="account-multiple" size={28} color="#3b82f6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">Select All Contacts</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Add every contact from your phone
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* OPTION 2 — SELECT INDIVIDUAL CONTACTS */}
            <TouchableOpacity
              className="flex-row items-center p-4 bg-green-50 rounded-xl mb-4"
              onPress={onSelectIndividualContacts}
            >
              <View className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center">
                <MaterialCommunityIcons name="account-box" size={28} color="#10b981" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">Browse & Select Contacts</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  Browse and pick specific contacts
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* OPTION 3 — IMPORT FILE */}
            <TouchableOpacity
              className="flex-row items-center p-4 bg-purple-50 rounded-xl mb-4"
              onPress={onImportFromFile}
            >
              <View className="w-12 h-12 bg-purple-100 rounded-lg items-center justify-center">
                <MaterialCommunityIcons name="file-upload" size={28} color="#8b5cf6" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900">Import from File</Text>
                <Text className="text-gray-600 text-sm mt-1">
                  CSV, Excel, or Text files
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              onPress={onClose}
              className="mt-4 p-4 bg-gray-100 rounded-xl"
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Contact Browser Modal Component
const ContactBrowserModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedNumbers: string[]) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectAll, setSelectAll] = useState(false);

  // Load contacts
  const loadContacts = async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data && data.length > 0) {
          const contactItems: ContactItem[] = data
            .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
            .map(contact => ({
              id: contact.id,
              name: contact.name || 'Unknown',
              phoneNumbers: contact.phoneNumbers!
                .map(p => p?.number ? p.number.replace(/\D/g, '') : '')
                .filter(num => num.length >= 10 && num.length <= 15),
              selected: false
            }))
            .filter(item => item.phoneNumbers.length > 0)
            .slice(0, 100); // Limit to 100 contacts for performance

          setContacts(contactItems);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadContacts();
    }
  }, [visible]);

  const toggleContact = (id: string) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === id ? { ...contact, selected: !contact.selected } : contact
    );
    setContacts(updatedContacts);
    
    const newSelectedCount = updatedContacts.filter(c => c.selected).length;
    setSelectedCount(newSelectedCount);
    setSelectAll(newSelectedCount === updatedContacts.length);
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      selected: newSelectAll
    }));
    setContacts(updatedContacts);
    setSelectAll(newSelectAll);
    setSelectedCount(newSelectAll ? contacts.length : 0);
  };

  const handleConfirm = () => {
    const selectedContacts = contacts.filter(contact => contact.selected);
    const allNumbers: string[] = [];
    
    selectedContacts.forEach(contact => {
      allNumbers.push(...contact.phoneNumbers);
    });

    // Remove duplicates
    const uniqueNumbers = [...new Set(allNumbers)];
    
    if (uniqueNumbers.length > 0) {
      onConfirm(uniqueNumbers);
      onClose();
    } else {
      Alert.alert("No Selection", "Please select at least one contact.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[90%]">
          {/* HEADER */}
          <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
            <View>
              <Text className="text-xl font-bold text-gray-900">Select Contacts</Text>
              <Text className="text-gray-600 text-sm mt-1">
                {selectedCount} of {contacts.length} selected
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* ACTION BUTTONS */}
          <View className="flex-row p-4 border-b border-gray-200 space-x-3">
            <TouchableOpacity
              onPress={toggleSelectAll}
              className={`flex-1 py-3 rounded-lg ${selectAll ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <Text className={`text-center font-medium ${selectAll ? 'text-white' : 'text-gray-700'}`}>
                {selectAll ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 py-3 rounded-lg ${selectedCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}
              disabled={selectedCount === 0}
            >
              <Text className={`text-center font-medium ${selectedCount > 0 ? 'text-white' : 'text-gray-500'}`}>
                Add {selectedCount} Contacts
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONTACTS LIST */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <MaterialCommunityIcons name="account-search" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-4">Loading contacts...</Text>
            </View>
          ) : contacts.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <MaterialCommunityIcons name="account-question" size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-4">No contacts with phone numbers found</Text>
            </View>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleContact(item.id)}
                  className={`flex-row items-center p-4 border-b border-gray-100 ${
                    item.selected ? 'bg-blue-50' : ''
                  }`}
                >
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                    item.selected ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    {item.selected ? (
                      <MaterialCommunityIcons name="check" size={18} color="white" />
                    ) : (
                      <Text className="text-gray-700 text-xs">
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{item.name}</Text>
                    <View className="flex-row flex-wrap mt-1">
                      {item.phoneNumbers.slice(0, 2).map((num, idx) => (
                        <Text key={idx} className="text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                          {num}
                        </Text>
                      ))}
                      {item.phoneNumbers.length > 2 && (
                        <Text className="text-blue-500 text-xs px-2 py-1">
                          +{item.phoneNumbers.length - 2} more
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <MaterialCommunityIcons
                    name={item.selected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={item.selected ? "#3b82f6" : "#9ca3af"}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Contact Groups Modal Component
const ContactGroupsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  contactGroups: ContactGroup[];
  selectedGroup: ContactGroup | null;
  onSelectGroup: (group: ContactGroup) => void;
  onCreateGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
}> = ({ visible, onClose, contactGroups, selectedGroup, onSelectGroup, onCreateGroup, onDeleteGroup }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/50 justify-end">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Contact Groups</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Create New Group */}
          <TouchableOpacity
            className="flex-row items-center p-4 bg-blue-500 rounded-xl mb-4"
            onPress={onCreateGroup}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
            <Text className="ml-3 text-white font-medium">Create New Group</Text>
          </TouchableOpacity>

          {/* Existing Groups */}
          <ScrollView className="max-h-60" keyboardShouldPersistTaps="handled">
            {contactGroups.length === 0 ? (
              <View className="p-8 items-center">
                <MaterialCommunityIcons name="account-group" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-4">No groups created yet</Text>
              </View>
            ) : (
              contactGroups.map((group) => (
                <View
                  key={group.id}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${
                    selectedGroup?.id === group.id ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <TouchableOpacity
                    className="flex-row flex-1 items-center"
                    onPress={() => {
                      onSelectGroup(group);
                      onClose();
                    }}
                  >
                    <View className={`w-10 h-10 rounded-lg items-center justify-center ${
                      selectedGroup?.id === group.id ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      <MaterialCommunityIcons 
                        name="account-group" 
                        size={20} 
                        color={selectedGroup?.id === group.id ? "#3b82f6" : "#6b7280"} 
                      />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="font-medium text-gray-900">{group.name}</Text>
                      <Text className="text-gray-600 text-sm">{group.contacts.length} contacts</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Delete button */}
                  <TouchableOpacity
                    onPress={() => onDeleteGroup(group.id)}
                    className="ml-2 p-2"
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                  {selectedGroup?.id === group.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#3b82f6" />
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            className="mt-6 p-4 bg-gray-100 rounded-xl"
          >
            <Text className="text-center text-gray-700 font-medium">Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const NormalSms = () => {
  const navigation: NavigationProp<any> = useNavigation();
  const [loader, setLoader] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [browserModal, setBrowserModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);

  // Load saved contact groups
  useEffect(() => {
    loadContactGroups();
  }, []);

  const loadContactGroups = async () => {
    try {
      const savedGroups = await AsyncStorage.getItem('contactGroups');
      if (savedGroups) {
        setContactGroups(JSON.parse(savedGroups));
      }
    } catch (error) {
      console.error('Error loading contact groups:', error);
    }
  };

  // Helper function to extract phone numbers from contact
  const extractPhoneNumbers = (contact: Contact): string[] => {
    if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
      return [];
    }
    
    return contact.phoneNumbers
      .map((phoneNumber: PhoneNumber) => {
        if (phoneNumber?.number) {
          const cleanedNumber = phoneNumber.number.replace(/\D/g, '');
          if (cleanedNumber.length >= 10 && cleanedNumber.length <= 15) {
            return cleanedNumber;
          }
        }
        return null;
      })
      .filter((num): num is string => num !== null);
  };

  // Select all contacts from phone
  const selectAllContacts = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data && data.length > 0) {
          const contacts = data as Contact[];
          const validContacts = contacts.filter(contact => 
            contact.phoneNumbers && contact.phoneNumbers.length > 0
          );

          if (validContacts.length === 0) {
            Alert.alert("No Contacts", "No contacts with phone numbers found.");
            return;
          }

          const allNumbers = validContacts
            .flatMap(contact => extractPhoneNumbers(contact))
            .filter((num, index, self) => self.indexOf(num) === index);
          
          if (allNumbers.length > 0) {
            setFieldValue("contact", allNumbers.join(','));
            setContactModal(false);
            Alert.alert("Success", `Added ${allNumbers.length} contacts.`);
          } else {
            Alert.alert("No Numbers", "Could not extract valid phone numbers from contacts.");
          }
        } else {
          Alert.alert("No Contacts", "No contacts found on your device.");
        }
      } else {
        Alert.alert("Permission Required", "Please grant contacts permission to select contacts.");
      }
    } catch (error) {
      console.error('Error picking contacts:', error);
      Alert.alert("Error", "Failed to access contacts");
    }
  };

  // Open contact browser for individual selection
    const openContactBrowser = async () => {
      setContactModal(false);
      setBrowserModal(true);
    };

  // Handle contact selection from browser
  const handleContactsSelected = (selectedNumbers: string[], setFieldValue: (field: string, value: any) => void) => {
    if (selectedNumbers.length > 0) {
      // Set the selected numbers into the form (replacing any current value)
      setFieldValue("contact", selectedNumbers.join(','));
      Alert.alert("Success", `Added ${selectedNumbers.length} contacts.`);
    }
  };

  // Import contacts from file
  const importContactsFromFile = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/csv', 'application/vnd.ms-excel', 
               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      
      if (!content || content.trim().length === 0) {
        Alert.alert("Empty File", "The selected file is empty.");
        return;
      }

      // Parse phone numbers
      const phoneRegex = /(?:\+?(\d{1,3})[-.\s]?)?(?:\(?(\d{1,4})\)?[-.\s]?)?(\d{1,4})[-.\s]?(\d{1,9})/g;
      const matches = content.match(phoneRegex) || [];
      
      const phoneNumbers = matches
        .map(num => num.replace(/\D/g, ''))
        .filter(num => num.length >= 10 && num.length <= 15)
        .filter((num, index, self) => self.indexOf(num) === index); // Remove duplicates

      if (phoneNumbers.length > 0) {
        setFieldValue("contact", phoneNumbers.join(','));
        setContactModal(false);
        Alert.alert("Success", `Imported ${phoneNumbers.length} phone numbers.`);
      } else {
        Alert.alert("No Valid Numbers", "Could not find valid phone numbers in the file.");
      }
    } catch (error) {
      console.error('Error importing file:', error);
      Alert.alert("Error", "Failed to import file.");
    }
  };

  // Create new contact group
  const createContactGroup = async (groupName: string | null, contacts: string) => {
    if (!groupName || groupName.trim().length === 0) {
      Alert.alert("Error", "Group name cannot be empty.");
      return;
    }

    const contactNumbers = contacts
      .split(',')
      .map(c => c.trim())
      .filter(c => {
        if (!c) return false;
        const cleaned = c.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
      });

    if (contactNumbers.length === 0) {
      Alert.alert("Error", "No valid phone numbers to create group.");
      return;
    }

    const newGroup: ContactGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      contacts: contactNumbers
    };
    
    const updatedGroups = [...contactGroups, newGroup];
    setContactGroups(updatedGroups);
    
    try {
      await AsyncStorage.setItem('contactGroups', JSON.stringify(updatedGroups));
      Alert.alert("Success", `Group "${groupName}" created successfully!`);
    } catch (error) {
      console.error('Error saving group:', error);
      Alert.alert("Error", "Failed to save contact group.");
    }
  };

  const handleSend = async (values: FormValues) => {
    try {
      setLoader(true);
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Error", "Authentication required. Please login again.");
        navigation.navigate("Login");
        return;
      }

      // Validate contacts
      const contacts = values.contact
        .split(',')
        .map(c => c.trim())
        .filter(c => {
          if (!c) return false;
          const cleaned = c.replace(/\D/g, '');
          return cleaned.length >= 10 && cleaned.length <= 15;
        });

      if (contacts.length === 0) {
        Alert.alert("Error", "Please enter valid phone numbers.");
        setLoader(false);
        return;
      }

      // Prepare data
      const data = {
        task: values.task,
        senderId: values.senderId.trim(),
        message: values.message.trim(),
        contact: contacts.join(','),
        repeat: values.repeat,
        ...(values.task === "Schedule SMS" && values.scheduleDate && {
          isScheduled: true,
          scheduledAt: `${values.scheduleDate.toISOString().split('T')[0]}T${values.scheduleTime || '12:00'}:00`
        })
      };

      const endpoint = "http://YOUR_LOCAL_IP:3001/api/sms/normal";

      const response = await axios.post(endpoint, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "Success", 
          values.task === "Schedule SMS" 
            ? "SMS Scheduled Successfully!" 
            : "Message Sent Successfully!",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error('SMS sending error:', error);
      let errorMessage = "Failed to send SMS";
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
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
    repeat: "No",
    scheduleDate: new Date(),
    scheduleTime: new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
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
        }) => (
          <>
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-6 px-5">
                {/* Header */}
                <View className="mb-8">
                  <Text className="text-2xl font-bold text-gray-900">Send SMS</Text>
                  <Text className="text-gray-600 mt-1">Send instant or scheduled messages</Text>
                </View>

                <View className="space-y-6">
                  {/* TASK SELECTION */}
                  <Animated.View entering={FadeInDown.delay(150)}>
                    <Text className="text-gray-800 font-semibold text-base mb-3">
                      Choose Task *
                    </Text>

                    <View className="flex-row space-x-4">
                      <TouchableOpacity
                        onPress={() => {
                          setFieldValue("task", "Send Instant SMS");
                          setFieldTouched("task", true);
                        }}
                        className={`flex-1 p-4 rounded-xl border-2 ${
                          values.task === "Send Instant SMS"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className={`w-4 h-4 rounded-full mr-3 ${
                            values.task === "Send Instant SMS"
                              ? "bg-blue-500"
                              : "border-2 border-gray-300"
                          }`} />
                          <MaterialCommunityIcons 
                            name="send" 
                            size={22} 
                            color={values.task === "Send Instant SMS" ? "#3b82f6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.task === "Send Instant SMS"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}>
                            Send Now
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-2">
                          Send message immediately
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setFieldValue("task", "Schedule SMS");
                          setFieldTouched("task", true);
                        }}
                        className={`flex-1 p-4 rounded-xl border-2 ${
                          values.task === "Schedule SMS"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className={`w-4 h-4 rounded-full mr-3 ${
                            values.task === "Schedule SMS"
                              ? "bg-blue-500"
                              : "border-2 border-gray-300"
                          }`} />
                          <MaterialCommunityIcons 
                            name="clock-outline" 
                            size={22} 
                            color={values.task === "Schedule SMS" ? "#3b82f6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.task === "Schedule SMS"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}>
                            Schedule
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-2">
                          Schedule for later
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* SCHEDULE DATE/TIME */}
                  {values.task === "Schedule SMS" && (
                    <Animated.View 
                      entering={FadeInDown.delay(200)}
                      className="bg-white p-4 rounded-xl border border-gray-200"
                    >
                      <Text className="text-gray-800 font-semibold text-base mb-3">
                        Schedule Delivery
                      </Text>
                      
                      <View className="flex-row space-x-4">
                        {/* Date Picker */}
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          className="flex-1 border border-gray-300 rounded-lg p-3"
                        >
                          <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                              name="calendar" 
                              size={20} 
                              color="#6b7280" 
                            />
                            <Text className="ml-2 text-gray-700">
                              {values.scheduleDate 
                                ? values.scheduleDate.toLocaleDateString()
                                : "Select Date"}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Time Picker */}
                        <TouchableOpacity
                          onPress={() => setShowTimePicker(true)}
                          className="flex-1 border border-gray-300 rounded-lg p-3"
                        >
                          <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                              name="clock-time-four-outline" 
                              size={20} 
                              color="#6b7280" 
                            />
                            <Text className="ml-2 text-gray-700">
                              {values.scheduleTime || "Select Time"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {/* Date Picker Modal */}
                      {showDatePicker && (
                        <DateTimePicker
                          value={values.scheduleDate || new Date()}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          onChange={(event: DateTimePickerEvent, date?: Date) => {
                            setShowDatePicker(false);
                            if (date) {
                              setFieldValue("scheduleDate", date);
                            }
                          }}
                          minimumDate={new Date()}
                        />
                      )}

                      {/* Time Picker Modal */}
                      {showTimePicker && (
                        <DateTimePicker
                          value={new Date(`1970-01-01T${values.scheduleTime || '12:00'}`)}
                          mode="time"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          onChange={(event: DateTimePickerEvent, date?: Date) => {
                            setShowTimePicker(false);
                            if (date) {
                              const timeString = date.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false 
                              });
                              setFieldValue("scheduleTime", timeString);
                            }
                          }}
                        />
                      )}
                    </Animated.View>
                  )}

                  {/* SENDER ID */}
                  <Animated.View entering={FadeInDown.delay(250)}>
                    <View className="flex-row justify-between items-center mb-3">
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
                        placeholder="e.g., CompanyName"
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

                  {/* MESSAGE BOX */}
                  <Animated.View entering={FadeInDown.delay(300)}>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-800 font-semibold text-base">
                        Message *
                      </Text>
                      <Text className={`text-xs ${
                        values.message.length > 160 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {values.message.length}/160
                      </Text>
                    </View>

                    <View className={`bg-white border rounded-xl p-4 ${
                      errors.message && touched.message ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <TextInput
                        placeholder="Type your message here..."
                        multiline
                        className="text-gray-800 h-40 text-base"
                        textAlignVertical="top"
                        onChangeText={handleChange("message")}
                        onBlur={() => setFieldTouched("message")}
                        value={values.message}
                        maxLength={160}
                        placeholderTextColor="#9ca3af"
                      />
                      
                      {/* Message Info */}
                      <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between">
                        <Text className="text-gray-500 text-xs">
                          SMS Length: {Math.ceil(values.message.length / 160)} message(s)
                        </Text>
                        <Text className="text-blue-500 text-xs">
                          Unicode: {/[^\x00-\x7F]/.test(values.message) ? "Yes" : "No"}
                        </Text>
                      </View>
                    </View>

                    {errors.message && touched.message && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.message}
                      </Text>
                    )}
                  </Animated.View>

                  {/* CONTACT INPUT */}
                  <Animated.View entering={FadeInDown.delay(350)}>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-800 font-semibold text-base">
                        Recipients *
                      </Text>
                      {values.contact && (
                        <Text className="text-blue-500 text-xs">
                          {values.contact.split(',').filter(Boolean).length} contact(s)
                        </Text>
                      )}
                    </View>

                    {/* Contact Selection Cards */}
                    <View className="flex-row space-x-3 mb-3">
                      <TouchableOpacity
                        onPress={() => setContactModal(true)}
                        className="flex-1 bg-blue-500 rounded-xl p-3 items-center"
                      >
                        <MaterialCommunityIcons name="contacts" size={24} color="white" />
                        <Text className="text-white text-xs mt-1 text-center">
                          Add Contacts
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setGroupModal(true)}
                        className="flex-1 bg-green-500 rounded-xl p-3 items-center"
                      >
                        <MaterialCommunityIcons name="account-group" size={24} color="white" />
                        <Text className="text-white text-xs mt-1 text-center">
                          Contact Groups
                        </Text>
                      </TouchableOpacity>

                      {selectedGroup && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedGroup(null);
                            setFieldValue("contact", "");
                          }}
                          className="bg-red-500 rounded-xl p-3 items-center"
                        >
                          <MaterialCommunityIcons name="close" size={24} color="white" />
                          <Text className="text-white text-xs mt-1">Clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Selected Group Info */}
                    {selectedGroup && (
                      <View className="bg-blue-50 p-3 rounded-lg mb-3">
                        <Text className="text-blue-800 font-medium">
                          Selected Group: {selectedGroup.name}
                        </Text>
                        <Text className="text-blue-600 text-xs mt-1">
                          {selectedGroup.contacts.length} contacts
                        </Text>
                      </View>
                    )}

                    {/* Contact Input */}
                    <View className={`bg-white border rounded-xl px-4 py-3 ${
                      errors.contact && touched.contact ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <TextInput
                        placeholder="Enter phone numbers separated by commas (e.g., 2348012345678, 2348098765432)"
                        value={values.contact}
                        onChangeText={handleChange("contact")}
                        onBlur={() => setFieldTouched("contact")}
                        multiline
                        className="text-gray-800 text-base min-h-[60px]"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {/* Contact Info */}
                    <Text className="text-gray-500 text-xs mt-2 ml-1">
                      Format: 2348012345678, 2348098765432, ...
                    </Text>

                    {errors.contact && touched.contact && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.contact}
                      </Text>
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
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-center">
                          <MaterialCommunityIcons 
                            name="repeat" 
                            size={20} 
                            color={values.repeat === "Yes" ? "#3b82f6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.repeat === "Yes"
                              ? "text-blue-700"
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
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center justify-center">
                          <MaterialCommunityIcons 
                            name="close-circle-outline" 
                            size={20} 
                            color={values.repeat === "No" ? "#3b82f6" : "#9ca3af"} 
                          />
                          <Text className={`ml-2 font-medium ${
                            values.repeat === "No"
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}>
                            No
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* BUTTONS */}
                  <Animated.View entering={FadeInDown.delay(450)} className="mt-8">
                    <Button
                      loading={loader}
                      title={
                        values.task === "Schedule SMS" 
                          ? "SCHEDULE MESSAGE" 
                          : "SEND MESSAGE NOW"
                      }
                      action={handleSubmit}
                      disabled={!isValid || loader}
                      className={`py-4 rounded-xl ${!isValid ? 'opacity-50' : ''}`}
                    />

                    <TouchableOpacity
                      onPress={() => {
                        setFieldValue("senderId", "");
                        setFieldValue("message", "");
                        setFieldValue("contact", "");
                        setFieldValue("scheduleDate", new Date());
                        setFieldValue("scheduleTime", new Date().toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        }));
                        setSelectedGroup(null);
                        setFieldTouched("senderId", false);
                        setFieldTouched("message", false);
                        setFieldTouched("contact", false);
                      }}
                      className="mt-4 p-4 rounded-xl bg-gray-100 border border-gray-200"
                    >
                      <Text className="text-center text-gray-700 font-medium">
                        Clear All Fields
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>

            {/* Contact Selection Modal */}
            <ContactSelectionModal
              visible={contactModal}
              onClose={() => setContactModal(false)}
              onSelectAllContacts={() => selectAllContacts(setFieldValue)}
              onSelectIndividualContacts={openContactBrowser}
              onImportFromFile={() => importContactsFromFile(setFieldValue)}
            />

            {/* Contact Browser Modal */}
            <ContactBrowserModal
              visible={browserModal}
              onClose={() => setBrowserModal(false)}
              onConfirm={(selectedNumbers) => handleContactsSelected(selectedNumbers, setFieldValue)}
            />

            {/* Contact Groups Modal */}
            <ContactGroupsModal
              visible={groupModal}
              onClose={() => setGroupModal(false)}
              contactGroups={contactGroups}
              selectedGroup={selectedGroup}
              onSelectGroup={(group) => {
                setSelectedGroup(group);
                setFieldValue("contact", group.contacts.join(','));
              }}
              onCreateGroup={() => {
                if (!values.contact || values.contact.trim().length === 0) {
                  Alert.alert("No Contacts", "Please add some contacts first before creating a group.");
                  setGroupModal(false);
                  return;
                }

                // Fixed: Use Alert.prompt properly
                Alert.prompt(
                  "Create New Group",
                  "Enter group name:",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Create",
                      onPress: (groupName?: string) => {
                        if (groupName) {
                          createContactGroup(groupName, values.contact);
                          setGroupModal(false);
                        }
                      }
                    }
                  ],
                  "plain-text"
                );
              }}
              onDeleteGroup={(groupId: string) => {
                Alert.alert(
                  'Delete Group',
                  'Are you sure you want to delete this group?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      try {
                        const updated = contactGroups.filter(g => g.id !== groupId);
                        setContactGroups(updated);
                        await AsyncStorage.setItem('contactGroups', JSON.stringify(updated));
                        if (selectedGroup?.id === groupId) {
                          setSelectedGroup(null);
                          setFieldValue('contact', '');
                        }
                        setGroupModal(false);
                      } catch (err) {
                        console.error('Error deleting group:', err);
                        Alert.alert('Error', 'Failed to delete contact group.');
                      }
                    }}
                  ]
                );
              }}
            />
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default NormalSms;