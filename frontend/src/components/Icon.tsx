interface Props {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

export function Icon({ name, className = "", filled, style, title }: Props) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...style,
      }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      {name}
    </span>
  );
}
