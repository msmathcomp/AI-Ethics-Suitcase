export default function Icon({ type }: { type: "pass" | "fail" }) {
  let icon: JSX.Element;

  switch (type) {
    case "pass":
      icon = <path d="M4 12.5L9.5 17.5L20 6.5" />;
      break;
    case "fail":
      icon = (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      );
      break;
  }

  return (
    <svg
      width="28"
      height="28"
      opacity="0.7"
      stroke="#9C92AC"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon}
    </svg>
  );
}
