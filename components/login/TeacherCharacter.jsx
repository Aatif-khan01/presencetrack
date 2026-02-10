export function TeacherCharacter({ className = "" }) {
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

            {/* Teacher Character */}
            {/* Head */}
            <circle cx="100" cy="110" r="22" fill="#fbbf77" />

            {/* Hair */}
            <path d="M 78 105 Q 78 85 100 85 Q 122 85 122 105 L 122 115 Q 115 118 100 118 Q 85 118 78 115 Z" fill="#4a5568" />

            {/* Eyes */}
            <circle cx="92" cy="108" r="2" fill="#2d3748" />
            <circle cx="108" cy="108" r="2" fill="#2d3748" />

            {/* Smile */}
            <path d="M 92 116 Q 100 120 108 116" stroke="#2d3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Body - Green Cardigan */}
            <ellipse cx="100" cy="165" rx="35" ry="45" fill="#10b981" />

            {/* White Shirt */}
            <rect x="90" y="140" width="20" height="30" fill="#f8fafc" />

            {/* Cardigan Collar */}
            <path d="M 85 140 L 75 150 L 80 155" fill="#059669" stroke="#047857" strokeWidth="1" />
            <path d="M 115 140 L 125 150 L 120 155" fill="#059669" stroke="#047857" strokeWidth="1" />

            {/* Arms */}
            <ellipse cx="70" cy="160" rx="12" ry="30" fill="#10b981" transform="rotate(-15 70 160)" />
            <ellipse cx="130" cy="160" rx="12" ry="30" fill="#10b981" transform="rotate(15 130 160)" />

            {/* Hands */}
            <circle cx="68" cy="185" r="8" fill="#fbbf77" />
            <circle cx="132" cy="185" r="8" fill="#fbbf77" />

            {/* Clipboard in left hand */}
            <rect x="55" y="175" width="18" height="25" rx="1" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
            <line x1="58" y1="180" x2="70" y2="180" stroke="#94a3b8" strokeWidth="1" />
            <line x1="58" y1="185" x2="70" y2="185" stroke="#94a3b8" strokeWidth="1" />
            <line x1="58" y1="190" x2="70" y2="190" stroke="#94a3b8" strokeWidth="1" />
            <rect x="60" y="172" width="8" height="4" rx="1" fill="#64748b" />

            {/* Briefcase in right hand */}
            <rect x="125" y="185" width="22" height="18" rx="2" fill="#8b5cf6" />
            <rect x="133" y="185" width="6" height="3" rx="1" fill="#a78bfa" />
            <rect x="135" y="183" width="2" height="3" fill="#6d28d9" />

            {/* Legs */}
            <rect x="85" y="205" width="14" height="30" rx="7" fill="#4f46e5" />
            <rect x="101" y="205" width="14" height="30" rx="7" fill="#4f46e5" />

            {/* Shoes */}
            <ellipse cx="92" cy="235" rx="10" ry="5" fill="#1f2937" />
            <ellipse cx="108" cy="235" rx="10" ry="5" fill="#1f2937" />
        </svg>
    );
}
