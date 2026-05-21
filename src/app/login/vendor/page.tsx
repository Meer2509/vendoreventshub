import RoleLoginForm from "@/components/RoleLoginForm";

export default function VendorLoginPage() {
  return (
    <RoleLoginForm
      portalRole="vendor"
      eyebrow="Vendor Login"
      title="Welcome back, vendor."
      heroText="Access saved events, applications, and your premium vendor profile from one secure dashboard."
      panelTitle="Built for vendors discovering better events."
      panelText="Track opportunities, compare booth fees, and grow your marketplace presence."
      trustTags={["Saved Events", "Applications", "Vendor Profile"]}
      successPath="/dashboard/vendor"
      alternateLoginHref="/login/organizer"
      alternateLoginLabel="Organizer login instead"
    />
  );
}
