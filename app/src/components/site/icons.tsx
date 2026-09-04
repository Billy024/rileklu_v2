import type { SVGProps } from "react";

// One consistent 1.6px-stroke line-icon set in the brand accent, used across
// Amenities/Availability/Location/Footer. Kept as hand-authored inline SVG
// (not the generated icon sheet) so every glyph renders crisp at 16-24px —
// the generated icon sheet motif appears as a full illustrated panel in the
// Amenities section instead. See design-brief.md "Images & icons".
function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconBed(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 13h18" />
      <path d="M6 13v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconPool(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M4 4l7 7M20 4l-7 7M4 20l6.5-6.5M15 15l5 5" />
    </svg>
  );
}

export function IconController(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="8" width="19" height="10" rx="4" />
      <path d="M7 11v4M5 13h4" />
      <circle cx="16" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="18.2" cy="13.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBalcony(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 21V9l9-5 9 5v12" />
      <path d="M3 21h18" />
      <path d="M7 21v-6M12 21v-6M17 21v-6" />
    </svg>
  );
}

export function IconWifi(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 8.5a16 16 0 0 1 18 0" />
      <path d="M6.3 12.2a11 11 0 0 1 11.4 0" />
      <path d="M9.6 15.8a6 6 0 0 1 4.8 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTv(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="13" rx="2" />
      <path d="M9 21h6M12 18v3" />
      <path d="M10.5 9l4 2.2-4 2.2z" />
    </svg>
  );
}

export function IconBath(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M4 12V7a2 2 0 0 1 2-2c1.2 0 1.8.9 2 1.6" />
      <path d="M6 19v2M16 19v2" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8.5 14.5l2 2 4-4.2" />
    </svg>
  );
}

export function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h3l1.6 4.4-2 1.6a12.5 12.5 0 0 0 6.4 6.4l1.6-2L21 15v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function IconChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16v11H9l-4 4V5z" />
      <path d="M8 9.5h8M8 12.8h5" />
    </svg>
  );
}

export function IconFridge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M6 10.5h12" />
      <path d="M9 5v3M9 13v3" />
    </svg>
  );
}

export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 8.5l7 7 7-7" />
    </svg>
  );
}

export function IconStar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}
