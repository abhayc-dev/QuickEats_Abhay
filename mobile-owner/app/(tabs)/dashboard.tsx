import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { colors } from "../../lib/theme";
import type { OwnerOrderRow } from "../../types";

type QuickFilter = "today" | "week" | "month" | "year" | "all";

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function startOfDay(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function DashboardTab() {
  const insets = useSafeAreaInsets();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("month");
  const now = new Date();
  const [browseMonth, setBrowseMonth] = useState(now.getMonth());
  const [browseYear, setBrowseYear] = useState(now.getFullYear());
  const [browsing, setBrowsing] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["ownerOrders"],
    queryFn: async () => (await api.get<OwnerOrderRow[]>("/order/my-orders")).data,
  });

  const stats = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const filtered = orders.filter((o) => {
      const created = new Date(o.createdAt);
      if (browsing) {
        return created.getMonth() === browseMonth && created.getFullYear() === browseYear;
      }
      switch (quickFilter) {
        case "today":
          return created >= startOfDay(now);
        case "week":
          return created >= startOfWeek(now);
        case "month":
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        case "year":
          return created.getFullYear() === now.getFullYear();
        case "all":
        default:
          return true;
      }
    });

    let cod = 0;
    let online = 0;
    for (const o of filtered) {
      const amount = o.shopOrders?.subtotal ?? 0;
      if (o.paymentMethod === "cod") cod += amount;
      else online += amount;
    }
    return { count: filtered.length, cod, online, total: cod + online };
  }, [ordersQuery.data, quickFilter, browsing, browseMonth, browseYear]);

  const selectQuick = (key: QuickFilter) => {
    setBrowsing(false);
    setQuickFilter(key);
  };

  const stepMonth = (delta: number) => {
    setBrowsing(true);
    let m = browseMonth + delta;
    let y = browseYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setBrowseMonth(m);
    setBrowseYear(y);
  };

  if (ordersQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.chipRow}>
          {QUICK_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.chip, !browsing && quickFilter === f.key && styles.chipActive]}
              onPress={() => selectQuick(f.key)}
            >
              <Text style={[styles.chipText, !browsing && quickFilter === f.key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Browse by month</Text>
        <View style={styles.monthRow}>
          <Pressable style={styles.monthArrow} onPress={() => stepMonth(-1)}>
            <Text style={styles.monthArrowText}>‹</Text>
          </Pressable>
          <Pressable style={styles.monthLabelButton} onPress={() => setBrowsing(true)}>
            <Text style={[styles.monthLabel, browsing && styles.monthLabelActive]}>
              {MONTH_NAMES[browseMonth]} {browseYear}
            </Text>
          </Pressable>
          <Pressable style={styles.monthArrow} onPress={() => stepMonth(1)}>
            <Text style={styles.monthArrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardWide]}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Cash on Delivery</Text>
            <Text style={[styles.statValue, styles.statValueSmall]}>₹{stats.cod.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Paid Online</Text>
            <Text style={[styles.statValue, styles.statValueSmall]}>₹{stats.online.toLocaleString("en-IN")}</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide, styles.statCardTotal]}>
            <Text style={styles.statLabelLight}>Total Revenue</Text>
            <Text style={styles.statValueLight}>₹{stats.total.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {!ordersQuery.data?.length && (
          <Text style={styles.emptyHint}>No orders yet — stats will show up once you start receiving them.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: colors.text },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.text },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    marginBottom: 20,
  },
  monthArrow: { paddingHorizontal: 22, paddingVertical: 10 },
  monthArrowText: { fontSize: 22, color: colors.primary, fontWeight: "700" },
  monthLabelButton: { flex: 1, alignItems: "center" },
  monthLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  monthLabelActive: { color: colors.primary },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  statCardWide: { flexBasis: "100%" },
  statCardTotal: { backgroundColor: colors.primary, borderColor: colors.primary },
  statLabel: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  statLabelLight: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  statValue: { fontSize: 32, fontWeight: "800", color: colors.text, marginTop: 6 },
  statValueSmall: { fontSize: 22 },
  statValueLight: { fontSize: 32, fontWeight: "800", color: "#fff", marginTop: 6 },
  emptyHint: { fontSize: 13, color: colors.muted, textAlign: "center", marginTop: 24 },
});
