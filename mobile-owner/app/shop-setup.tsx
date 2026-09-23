import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { colors } from "../lib/theme";
import type { Shop } from "../types";

export default function ShopSetup() {
  const { user, signOut } = useAuthStore();
  const shopQuery = useQuery({
    queryKey: ["myShop"],
    queryFn: async () => (await api.get<Shop>("/shop/get-my")).data,
    retry: false,
  });

  const onSignOut = () => {
    Alert.alert("Sign out", `Sign out of ${user?.email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shopQuery.data) {
      setName(shopQuery.data.name);
      setCity(shopQuery.data.city);
      setState(shopQuery.data.state);
      setAddress(shopQuery.data.address);
    }
  }, [shopQuery.data]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to upload a shop photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (!name || !city || !state || !address) {
      Alert.alert("Missing fields", "Please fill in all shop details.");
      return;
    }
    if (!imageUri && !shopQuery.data?.image) {
      Alert.alert("Photo required", "Please add a photo of your shop.");
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("city", city);
      form.append("state", state);
      form.append("address", address);
      if (imageUri) {
        const filename = imageUri.split("/").pop() || "shop.jpg";
        const ext = filename.split(".").pop();
        form.append("image", {
          uri: imageUri,
          name: filename,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        } as any);
      }
      await api.post("/shop/create-edit", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Couldn't save shop", apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.accountRow}>
        <Text style={styles.accountText} numberOfLines={1}>
          Signed in as {user?.email}
        </Text>
        <Pressable onPress={onSignOut} hitSlop={8}>
          <Text style={styles.signOutLink}>Not you? Sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.intro}>
        {shopQuery.data
          ? "Update your restaurant's details below."
          : "Tell us about your restaurant to start receiving orders."}
      </Text>

      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {imageUri || shopQuery.data?.image ? (
          <Image
            source={{ uri: imageUri || shopQuery.data?.image }}
            style={styles.imagePreview}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷 Add shop photo</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Restaurant name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Vicky Sweets and Namkeen" />

      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Kanpur" />

      <Text style={styles.label}>State</Text>
      <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="e.g. Uttar Pradesh" />

      <Text style={styles.label}>Full address</Text>
      <TextInput
        style={[styles.input, styles.addressInput]}
        value={address}
        onChangeText={setAddress}
        placeholder="Street, landmark, pincode"
        multiline
      />

      <Pressable style={styles.button} onPress={onSubmit} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{shopQuery.data ? "Save Changes" : "Create Shop"}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  accountText: { fontSize: 12.5, color: colors.muted, flex: 1 },
  signOutLink: { fontSize: 12.5, color: colors.danger, fontWeight: "700" },
  intro: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  imagePicker: { marginBottom: 20 },
  imagePreview: { width: "100%", height: 160, borderRadius: 14, backgroundColor: colors.border },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 14,
    color: colors.text,
  },
  addressInput: { minHeight: 70, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
