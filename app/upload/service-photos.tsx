import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import mime from 'mime';
import { supabase } from '../../src/lib/supabase';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface UploadedImage {
  uri: string;
  fileName: string;
  publicUrl?: string;
}

export default function ServicePhotosScreen() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  async function pickFromLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8
    });
    
    if (res.canceled) return;
    
    setUploading(true);
    
    for (const asset of res.assets) {
      await uploadImage(asset.uri, asset.mimeType!);
    }
    
    setUploading(false);
  }

  async function takePhoto() {
    if (!cameraPermission) {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    
    if (res.canceled) return;
    
    setUploading(true);
    await uploadImage(res.assets[0].uri, res.assets[0].mimeType!);
    setUploading(false);
  }

  async function uploadImage(fileUri: string, mimeType: string) {
    try {
      const fileExt = mime.getExtension(mimeType) || 'jpg';
      const fileName = `service-${Date.now()}.${fileExt}`;
      const filePath = `service-photos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filePath, {
          uri: fileUri,
          type: mimeType,
          name: fileName
        } as any);

      if (error) {
        Alert.alert('Upload failed', error.message);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      setImages(prev => [...prev, {
        uri: fileUri,
        fileName,
        publicUrl
      }]);

    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 p-6">
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Service Documentation
        </Text>
        <Text className="text-slate-300 text-center mb-6">
          Take or upload photos of your vehicle issue
        </Text>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            className="flex-1 bg-red-500 p-4 rounded-lg items-center"
            onPress={takePhoto}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-slate-700 p-4 rounded-lg items-center"
            onPress={pickFromLibrary}
            disabled={uploading}
          >
            <Ionicons name="images" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">From Library</Text>
          </TouchableOpacity>
        </View>

        {/* Upload Status */}
        {uploading && (
          <View className="bg-slate-800 p-4 rounded-lg mb-6 items-center">
            <Text className="text-white">Uploading images...</Text>
          </View>
        )}

        {/* Uploaded Images Grid */}
        {images.length > 0 && (
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-4">
              Uploaded Photos ({images.length})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {images.map((image, index) => (
                <View key={index} className="relative">
                  <Image 
                    source={{ uri: image.uri }} 
                    className="w-24 h-24 rounded-lg"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Service Types */}
        <View className="bg-slate-800 p-4 rounded-lg mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Common Issues to Document:
          </Text>
          <View className="space-y-2">
            <Text className="text-slate-300">• Flat tire or tire damage</Text>
            <Text className="text-slate-300">• Engine problems or smoke</Text>
            <Text className="text-slate-300">• Accident damage</Text>
            <Text className="text-slate-300">• Vehicle location/surroundings</Text>
            <Text className="text-slate-300">• Dashboard warning lights</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {images.length > 0 && (
          <TouchableOpacity className="bg-green-600 p-4 rounded-lg items-center mb-4">
            <Text className="text-white font-bold text-lg">
              Submit Service Request ({images.length} photos)
            </Text>
          </TouchableOpacity>
        )}

        <View className="items-center">
          <Link href="/(tabs)/dashboard" className="text-red-400 underline">
            Back to Dashboard
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
