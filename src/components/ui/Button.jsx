export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-lavender-700 text-white shadow-soft hover:bg-lavender-500 disabled:bg-lavender-300",
    secondary:
      "bg-white text-ink-900 ring-1 ring-lavender-200 hover:bg-lavender-50 disabled:text-ink-500",
    rose: "bg-rose-500 text-white hover:bg-rose-700",
    ghost: "bg-transparent text-lavender-700 hover:bg-lavender-100",
  };
  const sizes = {
    sm: "h-10 px-3 text-sm",
    md: "h-12 px-4 text-sm",
    lg: "h-14 px-5 text-base",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
