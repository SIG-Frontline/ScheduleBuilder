export default function Icon({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <span className={`material-symbols-rounded ${className}`}>{children}</span>
  );
}
