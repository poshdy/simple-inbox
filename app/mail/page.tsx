import { ModeToggle } from "@/components/toggle-theme";
import Mail from "./_components/mail";
export default function MailPage() {
  return (
    <section>
      <div className="absolute right-4 bottom-0">
        <ModeToggle />
      </div>
      <Mail
        defaultLayout={[20, 32, 40]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </section>
  );
}
