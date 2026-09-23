import { View, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../../../lib/api";
import { colors } from "../../../lib/theme";
import ItemForm, { type ItemFormValues } from "../../../components/ItemForm";
import type { Item } from "../../../types";

export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const itemQuery = useQuery({
    queryKey: ["item", id],
    queryFn: async () => (await api.get<Item>(`/item/get-by-id/${id}`)).data,
  });

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const form = new FormData();
      form.append("name", values.name);
      form.append("description", values.description);
      form.append("category", values.category);
      form.append("foodType", values.foodType);
      form.append("price", values.price);
      form.append("discount", values.discount);
      if (values.imageUri) {
        const filename = values.imageUri.split("/").pop() || "item.jpg";
        const ext = filename.split(".").pop();
        form.append("image", {
          uri: values.imageUri,
          name: filename,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        } as any);
      }
      await api.put(`/item/edit-item/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await queryClient.invalidateQueries({ queryKey: ["myShop"] });
      router.back();
    } catch (error) {
      Alert.alert("Couldn't save changes", apiErrorMessage(error));
    }
  };

  if (itemQuery.isLoading || !itemQuery.data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ItemForm
      initial={itemQuery.data}
      existingImage={itemQuery.data.image}
      submitLabel="Save Changes"
      onSubmit={onSubmit}
    />
  );
}
