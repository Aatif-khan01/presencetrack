export function StudentCharacter({ className = "" }) {
    return (
        <svg
            viewBox="0 0 200 240"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* University Building Background */}
            <g opacity="0.15">
                <rect x="40" y="20" width="120" height="60" fill="#94a3b8" rx="2" />
                <rect x="50" y="30" width="15" height="15" fill="#cbd5e1" />
                <rect x="70" y="30" width="15" height="15" fill="#cbd5e1" />
                <rect x="90" y="30" width="15" height="15" fill="#cbd5e1" />
                <rect x="110" y="30" width="15" height="15" fill="#cbd5e1" />
                <rect x="130" y="30" width="15" height="15" fill="#cbd5e1" />
                <rect x="50" y="50" width="15" height="15" fill="#cbd5e1" />
                <rect x="70" y="50" width="15" height="15" fill="#cbd5e1" />
                <rect x="90" y="50" width="15" height="15" fill="#cbd5e1" />
                <rect x="110" y="50" width="15" height="15" fill="#cbd5e1" />
                <rect x="130" y="50" width="15" height="15" fill="#cbd5e1" />
                <polygon points="100,10 40,25 160,25" fill="#94a3b8" />
            </g>

            {/* Student Character */}
            {/* Head */}
            <circle cx="100" cy="110" r="22" fill="#fbbf77" />

            {/* Hair */}
            <path d="M 78 105 Q 78 85 100 85 Q 122 85 122 105" fill="#4a5568" />

            {/* Eyes */}
            <circle cx="92" cy="108" r="2" fill="#2d3748" />
            <circle cx="108" cy="108" r="2" fill="#2d3748" />

            {/* Smile */}
            <path d="M 92 116 Q 100 120 108 116" stroke="#2d3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Body - Purple Jacket */}
            <ellipse cx="100" cy="165" rx="35" ry="45" fill="#8b5cf6" />

            {/* Yellow Shirt Collar */}
            <path d="M 85 140 L 100 150 L 115 140" fill="#fbbf24" stroke="#8b5cf6" strokeWidth="2" />

            {/* Arms */}
            <ellipse cx="70" cy="160" rx="12" ry="30" fill="#8b5cf6" transform="rotate(-20 70 160)" />
            <ellipse cx="130" cy="160" rx="12" ry="30" fill="#8b5cf6" transform="rotate(20 130 160)" />

            {/* Hands */}
            <circle cx="65" cy="180" r="8" fill="#fbbf77" />
            <circle cx="135" cy="180" r="8" fill="#fbbf77" />

            {/* Backpack */}
            <rect x="115" y="145" width="25" height="35" rx="3" fill="#10b981" />
            <rect x="120" y="150" width="6" height="8" rx="1" fill="#059669" />
            <rect x="129" y="150" width="6" height="8" rx="1" fill="#059669" />
            <line x1="118" y1="145" x2="118" y2="135" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            <line x1="137" y1="145" x2="137" y2="135" stroke="#059669" strokeWidth="3" strokeLinecap="round" />

            {/* Legs */}
            <rect x="85" y="205" width="14" height="30" rx="7" fill="#6366f1" />
            <rect x="101" y="205" width="14" height="30" rx="7" fill="#6366f1" />

            {/* Shoes */}
            <ellipse cx="92" cy="235" rx="10" ry="5" fill="#1f2937" />
            <ellipse cx="108" cy="235" rx="10" ry="5" fill="#1f2937" />
        </svg>
    );
}
