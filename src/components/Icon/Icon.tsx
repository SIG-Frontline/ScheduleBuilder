/**
 *  this is a small wrapper around the material-symbols font that makes it easier you to use the icons.
 * @param children - This is the icon name that material-symbols has.
 * @returns turns the icon name into an icon.
 */
export default function Icon({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <span className={`user-select-none material-symbols-rounded ${className}`}>
      {children}
    </span>
  );
}
