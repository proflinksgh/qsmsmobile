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
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import * as Contacts from "expo-contacts";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
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
    .min(3, "Sender ID must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Sender ID can only contain letters and numbers")
    .required("Sender ID is required"),
  message: Yup.string()
    .required("Message is required")
    .min(1, "Message cannot be empty"),
  contact: Yup.string()
    .required("At least one contact is required")
    .test('valid-phones', 'Invalid phone number format detected', (value) => {
      if (!value) return false;
      const { valid } = parsePhoneNumbers(value);
      return valid.length > 0;
    }),
  repeat: Yup.string().required(),
  scheduleDate: Yup.date().required(),
  scheduleTime: Yup.date().required(),
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
  scheduleDate: Date;
  scheduleTime: Date;
}

// Contact Selection Modal Component - Add Contacts Only
const ContactsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelectAllContacts: () => Promise<void>;
  onBrowseContacts: () => Promise<void>;
  onImportFromFile: () => Promise<void>;
  onContactsAdded: (numbers: string) => void;
}> = ({ 
  visible, 
  onClose, 
  onSelectAllContacts, 
  onBrowseContacts, 
  onImportFromFile, 
  onContactsAdded,
}) => {
  const [manualNumbers, setManualNumbers] = useState('');

  const handleManualAdd = () => {
    if (manualNumbers.trim()) {
      onContactsAdded(manualNumbers.trim());
      setManualNumbers('');
      onClose();
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80}
        >
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            {/* HEADER */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">Add Recipients</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
                  {/* MANUAL INPUT */}
                  <View className="mb-5">
                    <Text className="text-gray-700 font-medium mb-2">Enter phone numbers</Text>
                    <TextInput
                      placeholder="e.g., 23346387436, 233243987654"
                      value={manualNumbers}
                      onChangeText={setManualNumbers}
                      multiline
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 min-h-[80px]"
                      placeholderTextColor="#9ca3af"
                      textAlignVertical="top"
                    />
                    {manualNumbers.trim() && (
                      <TouchableOpacity
                        onPress={handleManualAdd}
                        className="mt-3 bg-blue-500 py-3 rounded-xl"
                      >
                        <Text className="text-center text-white font-semibold">Add Numbers</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="h-px bg-gray-200 mb-5" />

                  {/* QUICK OPTIONS */}
                  <Text className="text-gray-700 font-medium mb-3">Or choose from</Text>
                  
                  <View className="flex-row flex-wrap">
                    <TouchableOpacity
                      className="w-[48%] mr-[4%] mb-3 bg-blue-50 p-4 rounded-xl items-center"
                      onPress={onBrowseContacts}
                    >
                      <MaterialCommunityIcons name="account-search" size={32} color="#3b82f6" />
                      <Text className="text-gray-800 font-medium mt-2 text-center">Browse Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="w-[48%] mb-3 bg-green-50 p-4 rounded-xl items-center"
                      onPress={onSelectAllContacts}
                    >
                      <MaterialCommunityIcons name="account-multiple-check" size={32} color="#10b981" />
                      <Text className="text-gray-800 font-medium mt-2 text-center">All Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="w-[48%] mr-[4%] bg-purple-50 p-4 rounded-xl items-center"
                      onPress={onImportFromFile}
                    >
                      <MaterialCommunityIcons name="file-document-outline" size={32} color="#8b5cf6" />
                      <Text className="text-gray-800 font-medium mt-2 text-center">Import File</Text>
                    </TouchableOpacity>
                  </View>
            </ScrollView>

            {/* CLOSE BUTTON */}
            <View className="p-5 border-t border-gray-100">
              <TouchableOpacity
                onPress={onClose}
                className="py-4 bg-gray-100 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-medium">Close</Text>
              </TouchableOpacity>
            </View>
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

// Groups Management Modal - Independent contact group creation
const GroupsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  contactGroups: ContactGroup[];
  onSelectGroup: (group: ContactGroup) => void;
  onCreateGroup: (name: string, contacts: string[]) => void;
  onDeleteGroup: (id: string) => void;
}> = ({ visible, onClose, contactGroups, onSelectGroup, onCreateGroup, onDeleteGroup }) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load contacts when entering create mode
  const loadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to contacts to create a group.');
        setMode('list');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      const contactsWithPhones = data
        .filter((c: Contact) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c: Contact) => ({
          id: c.id,
          name: c.name || 'Unknown',
          phoneNumbers: c.phoneNumbers?.map((p: PhoneNumber) => p.number || '').filter(Boolean) || [],
          selected: false,
        }));

      setContacts(contactsWithPhones);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
      setMode('list');
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (id: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const selectAll = () => {
    const filteredContacts = contacts.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const allSelected = filteredContacts.every(c => c.selected);
    setContacts(prev =>
      prev.map(c => {
        if (c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return { ...c, selected: !allSelected };
        }
        return c;
      })
    );
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const selectedContacts = contacts.filter(c => c.selected);
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    const allNumbers = selectedContacts.flatMap(c => c.phoneNumbers);
    onCreateGroup(groupName.trim(), allNumbers);
    
    // Reset state
    setGroupName('');
    setContacts([]);
    setSearchQuery('');
    setMode('list');
  };

  const handleStartCreate = () => {
    setMode('create');
    loadContacts();
  };

  const handleCancelCreate = () => {
    setGroupName('');
    setContacts([]);
    setSearchQuery('');
    setMode('list');
  };

  const selectedCount = contacts.filter(c => c.selected).length;
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[90%]">
          {mode === 'list' ? (
            <>
              {/* List Mode Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                <Text className="text-xl font-bold text-gray-900">My Groups</Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-5">
                {/* Create New Group Button */}
                <TouchableOpacity
                  onPress={handleStartCreate}
                  className="flex-row items-center bg-blue-50 border-2 border-dashed border-blue-300 p-4 rounded-xl mb-5"
                >
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="plus" size={28} color="#3b82f6" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-blue-700 font-semibold text-base">Create New Group</Text>
                    <Text className="text-blue-500 text-sm">Select contacts from your phone</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#3b82f6" />
                </TouchableOpacity>

                {/* Saved Groups List */}
                {contactGroups.length === 0 ? (
                  <View className="items-center py-10">
                    <MaterialCommunityIcons name="folder-account-outline" size={64} color="#d1d5db" />
                    <Text className="text-gray-500 font-medium mt-4">No saved groups</Text>
                    <Text className="text-gray-400 text-sm mt-1 text-center px-8">
                      Create a group to quickly send messages to multiple contacts
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="text-gray-600 font-medium mb-3">Saved Groups ({contactGroups.length})</Text>
                    {contactGroups.map((group) => (
                      <View
                        key={group.id}
                        className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3"
                      >
                        <TouchableOpacity
                          onPress={() => {
                            onSelectGroup(group);
                            onClose();
                          }}
                          className="flex-row items-center flex-1"
                        >
                          <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
                            <MaterialCommunityIcons name="account-group" size={26} color="#8b5cf6" />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-gray-900 font-semibold">{group.name}</Text>
                            <Text className="text-gray-500 text-sm">{group.contacts.length} contacts</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onDeleteGroup(group.id)}
                          className="p-2 ml-2"
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>

              {/* Close Button */}
              <View className="p-5 border-t border-gray-100">
                <TouchableOpacity
                  onPress={onClose}
                  className="py-4 bg-gray-100 rounded-xl"
                >
                  <Text className="text-center text-gray-700 font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Create Mode Header */}
              <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
                <TouchableOpacity onPress={handleCancelCreate} className="flex-row items-center">
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">Back</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Create Group</Text>
                <View style={{ width: 70 }} />
              </View>

              {/* Group Name Input */}
              <View className="px-5 py-4 border-b border-gray-100">
                <Text className="text-gray-700 font-medium mb-2">Group Name</Text>
                <TextInput
                  placeholder="Enter group name..."
                  value={groupName}
                  onChangeText={setGroupName}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Search & Select All */}
              <View className="px-5 py-3 border-b border-gray-100">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-3">
                  <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
                  <TextInput
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-2 text-gray-800"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">
                    {selectedCount} selected
                  </Text>
                  <TouchableOpacity onPress={selectAll}>
                    <Text className="text-blue-600 font-medium">
                      {filteredContacts.length > 0 && filteredContacts.every(c => c.selected) ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contacts List */}
              {loading ? (
                <View className="flex-1 justify-center items-center">
                  <MaterialCommunityIcons name="account-search" size={48} color="#d1d5db" />
                  <Text className="text-gray-500 mt-4">Loading contacts...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  className="flex-1"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => toggleContact(item.id)}
                      className={`flex-row items-center px-5 py-3 border-b border-gray-100 ${
                        item.selected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${
                        item.selected ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        {item.selected ? (
                          <MaterialCommunityIcons name="check" size={20} color="white" />
                        ) : (
                          <Text className="text-gray-600 font-medium">
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className={`font-medium ${item.selected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {item.phoneNumbers[0]}{item.phoneNumbers.length > 1 ? ` +${item.phoneNumbers.length - 1} more` : ''}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={item.selected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                        size={24}
                        color={item.selected ? "#3b82f6" : "#d1d5db"}
                      />
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}

              {/* Save Button */}
              <View className="p-5 border-t border-gray-100">
                <TouchableOpacity
                  onPress={handleSaveGroup}
                  disabled={selectedCount === 0 || !groupName.trim()}
                  className={`py-4 rounded-xl ${
                    selectedCount > 0 && groupName.trim() ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <Text className={`text-center font-semibold ${
                    selectedCount > 0 && groupName.trim() ? 'text-white' : 'text-gray-500'
                  }`}>
                    Save Group ({selectedCount} contacts)
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const NormalSms = () => {
  const [loader, setLoader] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [browserModal, setBrowserModal] = useState(false);
  const [groupsModal, setGroupsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load saved contact groups
  useEffect(() => {
    loadContactGroups();
  }, []);

  const loadSmsBalance = async () => {
    try {
      await getSmsBalance();
    } catch (error) {
      console.error('Error loading SMS balance:', error);
    }
  };

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
      setSendSuccess(false);

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
          "Confirm SMS",
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
        repeat: values.repeat === "Yes"
      };

      // Send SMS using the service
      let response;
      if (values.task === "Schedule SMS") {
        response = await scheduleSms(smsData);
      } else {
        response = await sendInstantSms(smsData);
      }

      if (response.success) {
        setSendSuccess(true);
        // Refresh balance after sending
        loadSmsBalance();
        
        Alert.alert(
          "🎉 Success!",
          values.task === "Schedule SMS"
            ? `SMS scheduled successfully!\n${response.totalRecipients || validContacts.length} recipients\n${response.unitsUsed || totalUnits} units used`
            : `Message sent successfully!\n${response.totalRecipients || validContacts.length} recipients\n${response.unitsUsed || totalUnits} units used`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      console.error('SMS sending error:', error);
      Alert.alert("Error", error.message || "Failed to send SMS. Please try again.");
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
              currentPage: Math.ceil(values.message.length / (values.message.length <= charsPerUnit ? charsPerUnit : (charsPerUnit === 160 ? 153 : 67))) || 1
            };
          }, [values.message, values.contact]);

          return (
          <>
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Simple Header */}
              <View className="bg-white px-5 pt-12 pb-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Send SMS</Text>
                <Text className="text-gray-500 mt-1">Compose and send messages to your contacts</Text>
              </View>

              <View className="px-5 mt-6">
                <View className="space-y-6">
                  {/* SEND TYPE */}
                  <Animated.View entering={FadeInDown.delay(150)}>
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                      <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="flash" size={20} color="#3b82f6" />
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
                                ? "border-blue-500 bg-blue-50"
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
                              color={values.task === option ? "#3b82f6" : "#9ca3af"}
                            />
                            <Text
                              className={`mt-1 text-sm font-medium ${
                                values.task === option ? "text-blue-600" : "text-gray-500"
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
                        <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
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
                          <Ionicons name="calendar" size={20} color="#3b82f6" />
                          <Text className="ml-2 text-gray-700">
                            {values.scheduleDate.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="flex-1 bg-gray-50 rounded-xl p-3 flex-row items-center ml-3"
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Ionicons name="time" size={20} color="#3b82f6" />
                          <Text className="ml-2 text-gray-700">
                            {values.scheduleTime.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Date Picker Modal */}
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

                      {/* Time Picker Modal */}
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
 
                  {/* SENDER ID */}
                  <Animated.View entering={FadeInDown.delay(250)}>
                    <View className="flex-row justify-between items-center mt-8 mb-1">
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

                  {/* MESSAGE BOX */}
                  <Animated.View entering={FadeInDown.delay(300)}>
                    <View className="flex-row justify-between items-center mt-8 mb-1">
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
                          Page {smsInfo.currentPage} • {smsInfo.charsRemaining} chars left
                        </Text>
                      </View>
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
                        placeholderTextColor="#9ca3af"
                      />
                      
                      {/* Character count bar */}
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
                        {/* Progress bar */}
                        <View className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <View 
                            className={`h-full rounded-full ${
                              smsInfo.units === 1 ? 'bg-green-500' : 
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

                  {/* RECIPIENTS SECTION */}
                  <Animated.View entering={FadeInDown.delay(350)}>
                    <View className="flex-row justify-between items-center mt-6 mb-3">
                      <Text className="text-gray-800 font-semibold text-base">
                        Recipients *
                      </Text>
                    </View>

                    {/* Two Action Buttons */}
                    <View className="flex-row mb-4">
                      <TouchableOpacity
                        onPress={() => setContactModal(true)}
                        className="flex-1 mr-2 bg-blue-50 border border-blue-200 rounded-xl p-4 items-center"
                      >
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                          <MaterialCommunityIcons name="account-plus" size={24} color="#3b82f6" />
                        </View>
                        <Text className="text-blue-700 font-semibold">Add Contacts</Text>
                        <Text className="text-blue-500 text-xs mt-1">Manual or import</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setGroupsModal(true)}
                        className="flex-1 ml-2 bg-purple-50 border border-purple-200 rounded-xl p-4 items-center"
                      >
                        <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                          <MaterialCommunityIcons name="account-group" size={24} color="#8b5cf6" />
                        </View>
                        <Text className="text-purple-700 font-semibold">My Groups</Text>
                        <Text className="text-purple-500 text-xs mt-1">{contactGroups.length} saved</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Recipients Display Card - shows when contacts are added */}
                    {values.contact ? (
                      <View className="bg-white border border-gray-200 rounded-xl p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                              <MaterialCommunityIcons name="account-check" size={22} color="#10b981" />
                            </View>
                            <View className="ml-3 flex-1">
                              {(() => {
                                const { valid, invalid } = parsePhoneNumbers(values.contact);
                                return (
                                  <>
                                    <Text className="text-gray-900 font-semibold">
                                      {valid.length} Recipient{valid.length !== 1 ? 's' : ''} Added
                                    </Text>
                                    {invalid.length > 0 && (
                                      <Text className="text-orange-500 text-xs">
                                        {invalid.length} invalid will be skipped
                                      </Text>
                                    )}
                                    {selectedGroup && (
                                      <Text className="text-purple-600 text-xs">From group: {selectedGroup.name}</Text>
                                    )}
                                  </>
                                );
                              })()}
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedGroup(null);
                              setFieldValue("contact", "");
                            }}
                            className="p-2"
                          >
                            <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}

                    {errors.contact && touched.contact && !values.contact && (
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
                  <Animated.View entering={FadeInDown.delay(450)} className="mt-8 mb-4">
                    {/* Cost Summary Card */}
                    {smsInfo.recipientCount > 0 && values.message.length > 0 && (
                      <View className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-100">
                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className="text-gray-600 text-xs">Total Cost</Text>
                            <Text className="text-blue-700 font-bold text-xl">₦{smsInfo.totalCost.toLocaleString()}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-gray-500 text-xs">{smsInfo.recipientCount} recipients × {smsInfo.units} page(s)</Text>
                            <Text className="text-gray-600 text-sm font-medium">{smsInfo.totalUnits} units</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Send Button */}
                    <Button
                      loading={loader}
                      title={values.task === "Schedule SMS" ? "SCHEDULE MESSAGE" : "SEND MESSAGE NOW"}
                      action={() => handleSubmit()}
                      disabled={!isValid || loader || smsInfo.recipientCount === 0}
                      className={`py-4 rounded-xl ${(!isValid || loader || smsInfo.recipientCount === 0) ? 'opacity-50' : ''}`}
                    />

                    {/* Clear Button */}
                    <TouchableOpacity
                      onPress={() => {
                        resetForm();
                        setSelectedGroup(null);
                        setSendSuccess(false);
                      }}
                      className="mt-4 p-4 rounded-xl bg-gray-100 border border-gray-200 flex-row items-center justify-center"
                    >
                      <MaterialCommunityIcons name="refresh" size={20} color="#6b7280" />
                      <Text className="text-gray-700 font-medium ml-2">
                        Clear All Fields
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>

            {/* Add Contacts Modal */}
            <ContactsModal
              visible={contactModal}
              onClose={() => setContactModal(false)}
              onContactsAdded={(newContacts) => {
                const currentContacts = values.contact ? values.contact + ',' : '';
                setFieldValue("contact", currentContacts + newContacts);
              }}
              onSelectAllContacts={() => selectAllContacts(setFieldValue)}
              onBrowseContacts={openContactBrowser}
              onImportFromFile={() => importContactsFromFile(setFieldValue)}
            />

            {/* Groups Modal */}
            <GroupsModal
              visible={groupsModal}
              onClose={() => setGroupsModal(false)}
              contactGroups={contactGroups}
              onSelectGroup={(group) => {
                setSelectedGroup(group);
                setFieldValue("contact", group.contacts.join(','));
              }}
              onCreateGroup={(name, contacts) => {
                createContactGroup(name, contacts.join(','));
              }}
              onDeleteGroup={(id) => {
                Alert.alert(
                  'Delete Group',
                  'Are you sure you want to delete this group?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        const updated = contactGroups.filter(g => g.id !== id);
                        setContactGroups(updated);
                        await AsyncStorage.setItem('contactGroups', JSON.stringify(updated));
                        if (selectedGroup?.id === id) {
                          setSelectedGroup(null);
                          setFieldValue('contact', '');
                        }
                      }
                    }
                  ]
                );
              }}
            />

            {/* Contact Browser Modal */}
            <ContactBrowserModal
              visible={browserModal}
              onClose={() => setBrowserModal(false)}
              onConfirm={(selectedNumbers) => handleContactsSelected(selectedNumbers, setFieldValue)}
            />
          </>
        );
        }}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default NormalSms;