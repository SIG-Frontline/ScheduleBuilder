export default function Icon({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <span className="material-symbols-rounded">{children}</span>;
}
