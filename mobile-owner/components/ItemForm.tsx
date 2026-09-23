import { useState } from "react";
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
import { colors } from "../lib/theme";
import { CATEGORIES, type Category, type Item } from "../types";

export interface ItemFormValues {
  name: string;
  description: string;
  category: Category;
  foodType: "veg" | "non-veg";
  price: string;
  discount: string;
  imageUri: string | null;
}

export default function ItemForm({
  initial,
  existingImage,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Item>;
  existingImage?: string;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Snack");
  const [foodType, setFoodType] = useState<"veg" | "non-veg">(initial?.foodType ?? "veg");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [discount, setDiscount] = useState(initial?.discount ? String(initial.discount) : "0");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to upload a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      Alert.alert("Missing fields", "Please enter a name and price.");
      return;
    }
    if (!imageUri && !existingImage) {
      Alert.alert("Photo required", "Please add a photo of this item.");
      return;
    }
    const priceNum = Number(price);
    const discountNum = Number(discount || "0");
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      Alert.alert("Invalid discount", "Discount must be between 0 and 100.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ name, description, category, foodType, price, discount, imageUri });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {imageUri || existingImage ? (
          <Image source={{ uri: imageUri || existingImage }} style={styles.imagePreview} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷 Add item photo</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Item name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Jalebi" />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.descInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, category === c && styles.chipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Food type</Text>
      <View style={styles.chipRow}>
        <Pressable
          style={[styles.chip, foodType === "veg" && styles.chipActiveGreen]}
          onPress={() => setFoodType("veg")}
        >
          <Text style={[styles.chipText, foodType === "veg" && styles.chipTextActive]}>Veg</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, foodType === "non-veg" && styles.chipActiveRed]}
          onPress={() => setFoodType("non-veg")}
        >
          <Text style={[styles.chipText, foodType === "non-veg" && styles.chipTextActive]}>Non-veg</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Discount (%)</Text>
          <TextInput
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleSubmit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{submitLabel}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  imagePicker: { marginBottom: 20 },
  imagePreview: { width: "100%", height: 180, borderRadius: 14, backgroundColor: colors.border },
  imagePlaceholder: {
    width: "100%",
    height: 180,
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
  descInput: { minHeight: 60, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipActiveGreen: { backgroundColor: colors.success, borderColor: colors.success },
  chipActiveRed: { backgroundColor: colors.danger, borderColor: colors.danger },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.text },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
