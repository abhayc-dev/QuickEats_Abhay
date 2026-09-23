import { Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { api, apiErrorMessage } from "../../lib/api";
import ItemForm, { type ItemFormValues } from "../../components/ItemForm";

export default function NewItem() {
  const queryClient = useQueryClient();

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
      await api.post("/item/add-item", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await queryClient.invalidateQueries({ queryKey: ["myShop"] });
      router.back();
    } catch (error) {
      Alert.alert("Couldn't add item", apiErrorMessage(error));
    }
  };

  return <ItemForm submitLabel="Add Item" onSubmit={onSubmit} />;
}
