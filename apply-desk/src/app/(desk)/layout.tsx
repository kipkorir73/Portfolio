import { DeskGate, DeskProvider } from "@/components/desk-provider";
import { Shell } from "@/components/shell";

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeskProvider>
      <Shell>
        <DeskGate>{children}</DeskGate>
      </Shell>
    </DeskProvider>
  );
}
