import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface AvatarProps {
  size?: number;
  url?: string | null;
  upload: (fileUri: string) => Promise<string>;
  showUpload?: boolean;
}

const Avatar = ({ size = 48, url, upload, showUpload = true }: AvatarProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const avatarSize = size;

  useEffect(() => {
    if (url) {
      setImageUri(url);
    }
  }, [url]);

  const pickImage = async () => {
    if (!showUpload) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        await handleUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async (fileUri: string) => {
    if (!upload) return;

    setUploading(true);
    try {
      const newImageUrl = await upload(fileUri);
      setImageUri(newImageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  

  return (
    <TouchableOpacity 
      onPress={pickImage} 
      disabled={!showUpload || uploading}
      style={styles.avatar}
    >
      {uploading ? (
        <View style={[styles.noImage, { borderColor: 'transparent' }]}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : imageUri ? (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.Image}
        />
      ) : (
        <View style={styles.noImage}>
          <MaterialIcons name="person" size={avatarSize * 0.6} color="white" />
        </View>
      )}
      
      {showUpload && !uploading && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 10,
            padding: 4,
          }}
        >
          <MaterialIcons name="edit" size={12} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default Avatar;


// Your custom StyleSheet
  const styles = StyleSheet.create({
    avatar: { 
      overflow: 'hidden',
      maxWidth: 100,
      position: 'relative',
      // width: avatarSize,
      // height: avatarSize,
    },
    Image: {
      objectFit: 'cover',
      paddingTop: 0,
      width: '100%',
      height: '100%',
    },
    noImage: {
      backgroundColor: 'gray',
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: 'rgb(200, 200, 200)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      width: '100%',
      height: '100%',
    }
  });