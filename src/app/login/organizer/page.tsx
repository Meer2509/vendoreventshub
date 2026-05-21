import RoleLoginForm from "@/components/RoleLoginForm";

export default function OrganizerLoginPage() {
  return (
    <RoleLoginForm
      portalRole="organizer"
      eyebrow="Organizer Login"
      title="Welcome back, organizer."
      heroText="Manage event listings, review vendor applications, and grow trust with a public organizer profile."
      panelTitle="Built for festivals, fairs, markets, and expos."
      panelText="Create listings, approve vendors, and run your events professionally."
      trustTags={["Event Listings", "Vendor Applications", "Organizer Profile"]}
      successPath="/dashboard/organizer"
      alternateLoginHref="/login/vendor"
      alternateLoginLabel="Vendor login instead"
    />
  );
}
