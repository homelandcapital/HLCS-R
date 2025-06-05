
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center group" aria-label="Homeland Capital Home">
      <svg
        className="h-9 w-auto" // Sets the height to approx 36px, width scales automatically
        viewBox="0 0 240 60" // Aspect ratio for the SVG content
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="homelandCapitalLogoTitle"
      >
        <title id="homelandCapitalLogoTitle">Homeland Capital Logo</title>
        <g className="transition-opacity group-hover:opacity-90">
          {/* Yellow C part - drawn first so H bar can overlap its straight edge */}
          {/* Path: M(startX_top,y_top) C(control1X,control1Y control2X,control2Y endX_bottom,endY_bottom) L(endX_bottom_inner, endY_bottom_inner) C(control2X_inner,control2Y_inner control1X_inner,control1Y_inner startX_top_inner,startY_top_inner) Z */}
          <path d="M45 0 C10 0 10 60 45 60 L45 48 C25 48 25 12 45 12 Z" fill="#FFCB05"/> {/* Yellow/Gold */}
          
          {/* H part (teal) */}
          <rect x="0" y="0" width="12" height="60" fill="#00A99D"/> {/* Left H bar */}
          {/* Right H bar - overlaps the implicit straight edge of the yellow C */}
          <rect x="45" y="0" width="12" height="60" fill="#00A99D"/> 
          
          {/* Arrows (teal) - positioned between the H bars */}
          <rect x="15" y="20" width="27" height="8" fill="#00A99D"/>
          <rect x="15" y="32" width="27" height="8" fill="#00A99D"/>
        </g>
        
        {/* Text part (dark teal) */}
        <text x="65" y="27" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#004D40">
          homeland
        </text>
        <text x="65" y="52" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#004D40">
          capital
        </text>
      </svg>
    </Link>
  );
};

export default Logo;
