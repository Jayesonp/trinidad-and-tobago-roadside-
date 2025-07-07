import { View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import { supabase } from '../../src/lib/supabase';
import { useState } from 'react';

export default function UploadScreen() {
  const [uri, setUri] = useState<string>();

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (res.canceled) return;
    const fileUri = res.assets[0].uri;
    const fileExt = mime.getExtension(res.assets[0].mimeType!) || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('files')
      .upload(`public/${fileName}`, {
        uri: fileUri,
        type: res.assets[0].mimeType!,
        name: fileName
      } as any);

    if (!error) setUri(fileUri);
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Button title="Select & Upload" onPress={pickAndUpload} color="#ef4444" />
      {uri && <Image source={{ uri }} style={{ width: 200, height: 200, marginTop: 20 }} />}
    </View>
  );
}
