import { Button, PromptSheet } from "@/components";

/**
 * The one sheet for everything Pro on the Progress tab (the chart preview, "See all records").
 * Phase 3 swaps this for the Paywall link in this one place; no `isPro` check lives anywhere else.
 */
export function ProNoticeSheet({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  return (
    <PromptSheet
      visible={visible}
      onDismiss={onDismiss}
      icon="lock-closed-outline"
      title="Coming with Pro"
      body="Charts and All records come with Pro, in a later update."
    >
      <Button label="OK" large onPress={onDismiss} />
    </PromptSheet>
  );
}
