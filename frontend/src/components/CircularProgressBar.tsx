const CircularProgressBar = ({
  size = 24,
  color,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        stroke={color ?? "var(--primary)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`animate-spin`}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
};
export default CircularProgressBar;
