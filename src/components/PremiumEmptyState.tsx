type PremiumEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export default function PremiumEmptyState({
  eyebrow = "VendorEventsHub",
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: PremiumEmptyStateProps) {
  return (
    <div className="premiumEmptyState">
      <p className="premiumEmptyEyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="premiumEmptyActions">
          {actionLabel && onAction && (
            <button type="button" className="goldBtn" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button type="button" className="outlineBtn" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
