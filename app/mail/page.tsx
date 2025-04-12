import Mail from "./_components/mail";
export default function MailPage() {
  return (
    <section>
      <Mail
        defaultLayout={[20, 32, 40]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </section>
  );
}
