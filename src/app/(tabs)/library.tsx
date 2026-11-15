import { count } from "drizzle-orm";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components";
import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { spacing, useColors } from "@/theme";

export default function LibraryScreen() {
  const colors = useColors();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!__DEV__) return;
    db.select({ n: count() })
      .from(exercises)
      .then((rows) => setTotal(rows[0].n));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.md }}>
      <Text variant="heading">Library</Text>
      <Text tone="muted">The exercise library will appear here.</Text>
      {__DEV__ && total !== null ? (
        <Text variant="caption" tone="accent">
          Dev: {total} exercises in the database
        </Text>
      ) : null}
    </View>
  );
}
