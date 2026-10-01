import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.resolve(process.cwd(), 'public', 'dashboard');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Slide 1: Connecting Millions to Opportunities
const slide1Svg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="spaceGrad" cx="50%" cy="80%" r="80%">
      <stop offset="0%" stop-color="#1A3358" />
      <stop offset="40%" stop-color="#0A182F" />
      <stop offset="100%" stop-color="#030814" />
    </radialGradient>
    <radialGradient id="glowEarth" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFB347" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#FF8C00" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#1E7B34" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0A182F" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4ADE80" stop-opacity="0.2" />
      <stop offset="50%" stop-color="#FDBA74" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#60A5FA" stop-opacity="0.2" />
    </linearGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#spaceGrad)" />

  <!-- Stars -->
  <g fill="#FFFFFF" opacity="0.6">
    <circle cx="120" cy="80" r="1.5" />
    <circle cx="240" cy="140" r="1" />
    <circle cx="950" cy="90" r="2" />
    <circle cx="1100" cy="160" r="1.2" />
    <circle cx="80" cy="300" r="1.8" />
    <circle cx="1180" cy="280" r="1.5" />
    <circle cx="600" cy="50" r="1" />
  </g>

  <!-- Earth Limb Curve & Atmosphere -->
  <ellipse cx="640" cy="850" rx="900" ry="520" fill="#0D223F" stroke="#48CAE4" stroke-width="4" opacity="0.8" />
  <ellipse cx="640" cy="850" rx="915" ry="530" fill="none" stroke="#60A5FA" stroke-width="8" opacity="0.3" filter="url(#blurFilter)" />

  <!-- India Centered Glow -->
  <circle cx="640" cy="420" r="240" fill="url(#glowEarth)" filter="url(#blurFilter)" opacity="0.8" />

  <!-- Network Arcs radiating from India -->
  <g stroke="url(#curveGlow)" stroke-width="2" fill="none" opacity="0.85">
    <path d="M 640 420 Q 400 280 200 360" />
    <path d="M 640 420 Q 300 380 150 480" />
    <path d="M 640 420 Q 500 200 380 150" />
    <path d="M 640 420 Q 640 180 640 100" />
    <path d="M 640 420 Q 780 200 900 150" />
    <path d="M 640 420 Q 880 280 1080 360" />
    <path d="M 640 420 Q 980 380 1130 480" />
    <path d="M 640 420 Q 550 560 400 620" />
    <path d="M 640 420 Q 730 560 880 620" />
  </g>

  <!-- Node Dots -->
  <g fill="#FDBA74">
    <circle cx="640" cy="420" r="10" fill="#FFFFFF" stroke="#F97316" stroke-width="4" />
    <circle cx="380" cy="150" r="5" />
    <circle cx="640" cy="100" r="5" />
    <circle cx="900" cy="150" r="5" />
    <circle cx="200" cy="360" r="6" />
    <circle cx="1080" cy="360" r="6" />
    <circle cx="150" cy="480" r="5" />
    <circle cx="1130" cy="480" r="5" />
    <circle cx="400" cy="620" r="5" />
    <circle cx="880" cy="620" r="5" />
  </g>

  <!-- Central Badge: myScheme & UMANG -->
  <g transform="translate(540, 360)">
    <rect x="-8" y="-8" width="216" height="106" rx="20" fill="#FFFFFF" fill-opacity="0.95" stroke="#E2E8F0" stroke-width="2" />
    <!-- myScheme logo simulation -->
    <path d="M 45 45 C 30 20 60 10 70 30 C 75 40 65 60 45 45" fill="none" stroke="#16A34A" stroke-width="8" stroke-linecap="round" />
    <path d="M 52 35 C 58 20 75 25 72 38" fill="none" stroke="#EA580C" stroke-width="6" stroke-linecap="round" />
    <circle cx="58" cy="44" r="5" fill="#2563EB" />
    <text x="35" y="75" font-family="'Manrope', sans-serif" font-weight="800" font-size="14" fill="#0F172A">myScheme</text>
    <!-- Divider -->
    <line x1="105" y1="18" x2="105" y2="78" stroke="#CBD5E1" stroke-width="2" />
    <!-- UMANG icon simulation -->
    <rect x="135" y="16" width="30" height="50" rx="6" fill="#F97316" />
    <rect x="140" y="24" width="20" height="32" rx="3" fill="#FFFFFF" />
    <circle cx="150" cy="60" r="2.5" fill="#FFFFFF" />
    <text x="130" y="78" font-family="'Manrope', sans-serif" font-weight="700" font-size="11" fill="#EA580C">UMANG</text>
  </g>

  <!-- Top Left Government Emblem & Title -->
  <g transform="translate(60, 45)">
    <!-- Ashoka Emblem Mockup -->
    <circle cx="20" cy="25" r="18" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.8" />
    <text x="20" y="29" font-family="'Manrope', sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle" font-weight="bold">GOI</text>
    <text x="50" y="22" font-family="'Manrope', sans-serif" font-weight="800" font-size="20" fill="#22C55E">my<tspan fill="#FFFFFF">Scheme</tspan></text>
    <text x="50" y="38" font-family="'Manrope', sans-serif" font-size="9" fill="#94A3B8" font-weight="600" letter-spacing="1">MINISTRY OF ELECTRONICS &amp; IT</text>
    <text x="50" y="50" font-family="'Manrope', sans-serif" font-size="8" fill="#64748B" font-weight="500">GOVERNMENT OF INDIA</text>
  </g>

  <!-- Bottom Left Headline -->
  <g transform="translate(60, 570)">
    <text x="0" y="0" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#FFFFFF" letter-spacing="-0.5">Connecting Millions</text>
    <text x="0" y="52" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#FDBA74" letter-spacing="-0.5">to Opportunities</text>
  </g>

  <!-- Bottom Center Entry Points (Laptop & Mobile) -->
  <g transform="translate(560, 600)">
    <!-- Laptop Icon -->
    <rect x="0" y="8" width="46" height="28" rx="3" fill="#334155" stroke="#94A3B8" stroke-width="2" />
    <rect x="6" y="14" width="34" height="18" fill="#0F172A" />
    <rect x="-6" y="36" width="58" height="4" rx="2" fill="#64748B" />
    <!-- Mobile Icon -->
    <rect x="70" y="4" width="22" height="38" rx="4" fill="#334155" stroke="#94A3B8" stroke-width="2" />
    <rect x="74" y="10" width="14" height="24" fill="#0F172A" />
    <circle cx="81" cy="37" r="1.5" fill="#94A3B8" />
    <!-- Label -->
    <text x="46" y="60" font-family="'Manrope', sans-serif" font-weight="700" font-size="12" fill="#E2E8F0" text-anchor="middle">Entry Points</text>
  </g>
</svg>
`;

// Slide 2: Enabling Dreams through Achievement
const slide2Svg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="campusBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="60%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="warmLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.05" />
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="url(#campusBg)" />

  <!-- University Dome & Classical Architecture Silhouette -->
  <g fill="#D97706" opacity="0.18">
    <path d="M 680 280 L 760 160 L 840 280 Z" />
    <rect x="660" y="280" width="200" height="160" />
    <circle cx="760" cy="180" r="50" />
    <!-- Columns -->
    <rect x="520" y="320" width="24" height="120" />
    <rect x="580" y="320" width="24" height="120" />
    <rect x="900" y="320" width="24" height="120" />
    <rect x="960" y="320" width="24" height="120" />
    <rect x="480" y="420" width="550" height="20" />
  </g>
  <rect width="1280" height="720" fill="url(#warmLight)" />

  <!-- Father & Daughter Graduate Silhouette / Illustration Art -->
  <g transform="translate(680, 180)">
    <!-- Father -->
    <circle cx="180" cy="80" r="42" fill="#D97706" opacity="0.85" />
    <path d="M 120 160 C 120 120 240 120 240 160 L 250 360 L 110 360 Z" fill="#475569" />
    <!-- Daughter (Graduate) -->
    <circle cx="90" cy="100" r="38" fill="#F59E0B" />
    <!-- Graduation Cap -->
    <polygon points="90,40 30,65 90,90 150,65" fill="#1E293B" />
    <polygon points="90,90 85,115 95,115" fill="#DC2626" />
    <!-- Academic Gown -->
    <path d="M 40 170 C 40 135 140 135 140 170 L 150 380 L 30 380 Z" fill="#1E293B" />
    <!-- Diploma Scroll -->
    <rect x="50" y="210" width="16" height="70" rx="8" fill="#FFFFFF" stroke="#DC2626" stroke-width="4" transform="rotate(30 50 210)" />
  </g>

  <!-- Laptop showing NSP -->
  <g transform="translate(80, 440)">
    <rect x="0" y="0" width="200" height="130" rx="10" fill="#1E293B" />
    <rect x="10" y="10" width="180" height="110" rx="6" fill="#FFFFFF" />
    <!-- NSP Logo in Laptop Screen -->
    <circle cx="50" cy="65" r="20" fill="#EA580C" opacity="0.2" />
    <text x="50" y="70" font-family="'Manrope', sans-serif" font-weight="800" font-size="14" fill="#EA580C" text-anchor="middle">NSP</text>
    <rect x="80" y="50" width="90" height="8" rx="4" fill="#0284C7" />
    <rect x="80" y="66" width="60" height="6" rx="3" fill="#94A3B8" />
    <rect x="80" y="80" width="45" height="16" rx="4" fill="#16A34A" />
    <text x="102" y="92" font-family="'Manrope', sans-serif" font-weight="700" font-size="9" fill="#FFFFFF" text-anchor="middle">APPROVED</text>
    <!-- Base -->
    <rect x="-20" y="130" width="240" height="12" rx="4" fill="#64748B" />
  </g>

  <!-- Smartwatch Arm Overlay with NSP Status Approved -->
  <g transform="translate(760, 420)">
    <!-- Arm outline -->
    <path d="M 120 280 C 180 180 280 150 380 120" stroke="#FDBA74" stroke-width="120" stroke-linecap="round" fill="none" opacity="0.7" />
    <!-- Smartwatch Card -->
    <g transform="translate(100, 40)">
      <rect x="0" y="0" width="170" height="190" rx="28" fill="#0F172A" stroke="#38BDF8" stroke-width="4" filter="drop-shadow(0 15px 25px rgba(0,0,0,0.3))" />
      <rect x="12" y="14" width="146" height="162" rx="18" fill="#F8FAFC" />
      <text x="85" y="46" font-family="'Manrope', sans-serif" font-weight="800" font-size="16" fill="#0369A1" text-anchor="middle">NSP Portal</text>
      <text x="85" y="68" font-family="'Manrope', sans-serif" font-weight="600" font-size="10" fill="#64748B" text-anchor="middle">Scholarship Disbursed</text>
      <rect x="30" y="90" width="110" height="34" rx="17" fill="#15803D" />
      <text x="85" y="112" font-family="'Manrope', sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle">₹ 48,000 / yr</text>
      <text x="85" y="150" font-family="'Manrope', sans-serif" font-weight="700" font-size="11" fill="#047857" text-anchor="middle">Direct DBT Seeded ✓</text>
    </g>
  </g>

  <!-- Top Left Government Emblem & Title -->
  <g transform="translate(60, 45)">
    <circle cx="20" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="2" opacity="0.8" />
    <text x="20" y="29" font-family="'Manrope', sans-serif" font-size="10" fill="#1E293B" text-anchor="middle" font-weight="bold">GOI</text>
    <text x="50" y="22" font-family="'Manrope', sans-serif" font-weight="800" font-size="20" fill="#15803D">my<tspan fill="#1E293B">Scheme</tspan></text>
    <text x="50" y="38" font-family="'Manrope', sans-serif" font-size="9" fill="#475569" font-weight="600">MINISTRY OF ELECTRONICS &amp; IT</text>
  </g>

  <!-- Main Left Headline -->
  <g transform="translate(60, 240)">
    <text x="0" y="0" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#1E293B" letter-spacing="-0.5">Enabling Dreams</text>
    <text x="0" y="52" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#15803D" letter-spacing="-0.5">through Achievement</text>
    <text x="0" y="100" font-family="'Manrope', sans-serif" font-weight="500" font-size="16" fill="#475569">Post-Matric, Higher Education &amp; Central Scholarships made seamless.</text>
  </g>
</svg>
`;

// Slide 3: The Integrated Foundation
const slide3Svg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="medallionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="35%" stop-color="#D97706" />
      <stop offset="70%" stop-color="#B45309" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <linearGradient id="coreBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#292524" />
      <stop offset="100%" stop-color="#0C0A09" />
    </linearGradient>
    <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FEF3C7" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#F59E0B" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1280" height="720" fill="#F8FAFC" />

  <!-- Background Medallion Glow -->
  <circle cx="560" cy="360" r="320" fill="url(#goldGlow)" />

  <!-- Top Left Government Emblem & Title -->
  <g transform="translate(60, 45)">
    <circle cx="20" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="2" opacity="0.8" />
    <text x="20" y="29" font-family="'Manrope', sans-serif" font-size="10" fill="#1E293B" text-anchor="middle" font-weight="bold">GOI</text>
    <text x="50" y="22" font-family="'Manrope', sans-serif" font-weight="800" font-size="20" fill="#15803D">my<tspan fill="#1E293B">Scheme</tspan></text>
    <text x="50" y="38" font-family="'Manrope', sans-serif" font-size="9" fill="#475569" font-weight="600">MINISTRY OF ELECTRONICS &amp; IT</text>
  </g>

  <!-- Big Central Bronze/Copper Medallion -->
  <g transform="translate(560, 360)">
    <!-- Outer Rim with rivets -->
    <circle cx="0" cy="0" r="240" fill="url(#medallionGrad)" stroke="#78350F" stroke-width="8" filter="drop-shadow(0 25px 35px rgba(120,53,15,0.4))" />
    <circle cx="0" cy="0" r="215" fill="none" stroke="#FEF3C7" stroke-width="3" stroke-dasharray="8 6" />

    <!-- Inscribed Arc Text -->
    <text x="0" y="-160" font-family="'Manrope', sans-serif" font-weight="900" font-size="34" fill="#FEF3C7" text-anchor="middle" letter-spacing="3">myScheme</text>
    <text x="0" y="195" font-family="'Manrope', sans-serif" font-weight="900" font-size="34" fill="#FEF3C7" text-anchor="middle" letter-spacing="3">UMANG</text>

    <!-- Side studs -->
    <circle cx="-185" cy="0" r="10" fill="#FEF3C7" stroke="#92400E" stroke-width="3" />
    <circle cx="185" cy="0" r="10" fill="#FEF3C7" stroke="#92400E" stroke-width="3" />

    <!-- Center Chip / Core Square with rounded corners -->
    <rect x="-110" y="-110" width="220" height="220" rx="30" fill="url(#coreBg)" stroke="#D97706" stroke-width="6" />

    <!-- Microchip Pins -->
    <g stroke="#F59E0B" stroke-width="4">
      <!-- Top pins -->
      <line x1="-70" y1="-110" x2="-70" y2="-128" />
      <line x1="-35" y1="-110" x2="-35" y2="-128" />
      <line x1="0" y1="-110" x2="0" y2="-128" />
      <line x1="35" y1="-110" x2="35" y2="-128" />
      <line x1="70" y1="-110" x2="70" y2="-128" />
      <!-- Bottom pins -->
      <line x1="-70" y1="110" x2="-70" y2="128" />
      <line x1="-35" y1="110" x2="-35" y2="128" />
      <line x1="0" y1="110" x2="0" y2="128" />
      <line x1="35" y1="110" x2="35" y2="128" />
      <line x1="70" y1="110" x2="70" y2="128" />
      <!-- Left pins -->
      <line x1="-110" y1="-70" x2="-128" y2="-70" />
      <line x1="-110" y1="-35" x2="-128" y2="-35" />
      <line x1="-110" y1="0" x2="-128" y2="0" />
      <line x1="-110" y1="35" x2="-128" y2="35" />
      <line x1="-110" y1="70" x2="-128" y2="70" />
      <!-- Right pins -->
      <line x1="110" y1="-70" x2="128" y2="-70" />
      <line x1="110" y1="-35" x2="128" y2="-35" />
      <line x1="110" y1="0" x2="128" y2="0" />
      <line x1="110" y1="35" x2="128" y2="35" />
      <line x1="110" y1="70" x2="128" y2="70" />
    </g>

    <!-- Center NSP Chip Symbol -->
    <text x="0" y="-30" font-family="'Manrope', sans-serif" font-weight="900" font-size="28" fill="#FBBF24" text-anchor="middle" letter-spacing="2">NSP</text>
    <!-- Interconnected Laptop + Phone Graphic inside chip -->
    <g transform="translate(-45, -10)" stroke="#FEF3C7" stroke-width="3" fill="none">
      <rect x="0" y="5" width="40" height="26" rx="3" />
      <line x1="-6" y1="31" x2="46" y2="31" stroke-width="4" stroke-linecap="round" />
      <rect x="55" y="0" width="22" height="36" rx="4" />
      <!-- Infinity Link Loop -->
      <path d="M 28 18 Q 48 30 65 18" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
    </g>
  </g>

  <!-- Right Side Headline -->
  <g transform="translate(860, 520)">
    <text x="0" y="0" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#1E293B" letter-spacing="-0.5">The Integrated</text>
    <text x="0" y="50" font-family="'Manrope', sans-serif" font-weight="800" font-size="44" fill="#B45309" letter-spacing="-0.5">Foundation</text>
    <text x="0" y="90" font-family="'Manrope', sans-serif" font-weight="500" font-size="15" fill="#64748B">Central &amp; State Welfare Stack Linked in Real-Time</text>
  </g>
</svg>
`;

// Slide 4: Your Path, Simplified.
const slide4Svg = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pathSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="60%" stop-color="#FEF08A" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#BBF7D0" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="stoneGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>

  <rect width="1280" height="720" fill="url(#pathSky)" />

  <!-- Grand University Gate in Background -->
  <g transform="translate(680, 50)">
    <!-- Main Gate Pillar Left & Right -->
    <rect x="0" y="60" width="50" height="280" rx="6" fill="#B45309" opacity="0.9" />
    <rect x="360" y="60" width="50" height="280" rx="6" fill="#B45309" opacity="0.9" />
    <!-- Gate Overhang Banner -->
    <rect x="-30" y="60" width="470" height="80" rx="10" fill="#78350F" />
    <text x="205" y="96" font-family="'Manrope', sans-serif" font-weight="800" font-size="16" fill="#FEF3C7" text-anchor="middle">SCHOLARSHIP PATHWAY:</text>
    <text x="205" y="124" font-family="'Manrope', sans-serif" font-weight="900" font-size="20" fill="#4ADE80" text-anchor="middle">AWARD CONFIRMED</text>
    <!-- Background Building Dome -->
    <path d="M 80 180 C 80 100 330 100 330 180 Z" fill="#FBBF24" opacity="0.3" />
  </g>

  <!-- Stepping Stone Pathway Leading Forward -->
  <g fill="#CBD5E1" stroke="#F59E0B" stroke-width="4">
    <!-- Stepping stones with golden borders -->
    <ellipse cx="885" cy="460" rx="130" ry="24" fill="#FFFFFF" />
    <text x="885" y="465" font-family="'Manrope', sans-serif" font-weight="800" font-size="12" fill="#D97706" text-anchor="middle">CHECKPOINT</text>

    <ellipse cx="780" cy="540" rx="150" ry="28" fill="#FFFFFF" />
    <text x="780" y="545" font-family="'Manrope', sans-serif" font-weight="800" font-size="13" fill="#D97706" text-anchor="middle">VERIFICATION</text>

    <ellipse cx="620" cy="630" rx="180" ry="34" fill="#FFFFFF" />
    <text x="620" y="636" font-family="'Manrope', sans-serif" font-weight="800" font-size="14" fill="#059669" text-anchor="middle">REGISTRATION</text>
  </g>

  <!-- Illuminated Arches -->
  <!-- Arch 1: Registration (NSP) -->
  <g transform="translate(480, 360)">
    <path d="M 0 240 C 0 80 140 80 140 240" fill="none" stroke="#D97706" stroke-width="26" stroke-linecap="round" />
    <rect x="25" y="90" width="90" height="34" rx="17" fill="#FFFFFF" stroke="#EA580C" stroke-width="3" />
    <text x="70" y="112" font-family="'Manrope', sans-serif" font-weight="800" font-size="13" fill="#EA580C" text-anchor="middle">NSP</text>
  </g>

  <!-- Arch 2: Verification (UMANG) -->
  <g transform="translate(680, 260)">
    <path d="M 0 200 C 0 70 120 70 120 200" fill="none" stroke="#059669" stroke-width="22" stroke-linecap="round" />
    <rect x="20" y="80" width="80" height="30" rx="15" fill="#FFFFFF" stroke="#16A34A" stroke-width="3" />
    <text x="60" y="100" font-family="'Manrope', sans-serif" font-weight="800" font-size="12" fill="#16A34A" text-anchor="middle">UMANG</text>
  </g>

  <!-- Student Walking Along Path -->
  <g transform="translate(380, 480)">
    <!-- Backpack -->
    <rect x="-18" y="30" width="24" height="42" rx="10" fill="#334155" />
    <!-- Body -->
    <path d="M 0 30 L 0 100 L -12 160 M 0 100 L 14 155" stroke="#1E293B" stroke-width="18" stroke-linecap="round" />
    <!-- Head -->
    <circle cx="0" cy="8" r="16" fill="#FBBF24" />
  </g>

  <!-- Floating Achievement Icons along path -->
  <g transform="translate(1080, 480)" fill="#10B981" opacity="0.8">
    <circle cx="0" cy="0" r="26" fill="#DCFCE7" stroke="#10B981" stroke-width="2" />
    <!-- Graduation Cap Icon -->
    <polygon points="0,-10 -15,0 0,10 15,0" fill="#15803D" />
  </g>

  <!-- Top Left Government Emblem & Title -->
  <g transform="translate(60, 45)">
    <circle cx="20" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="2" opacity="0.8" />
    <text x="20" y="29" font-family="'Manrope', sans-serif" font-size="10" fill="#1E293B" text-anchor="middle" font-weight="bold">GOI</text>
    <text x="50" y="22" font-family="'Manrope', sans-serif" font-weight="800" font-size="20" fill="#15803D">my<tspan fill="#1E293B">Scheme</tspan></text>
    <text x="50" y="38" font-family="'Manrope', sans-serif" font-size="9" fill="#475569" font-weight="600">MINISTRY OF ELECTRONICS &amp; IT</text>
  </g>

  <!-- Main Left Headline -->
  <g transform="translate(60, 360)">
    <text x="0" y="0" font-family="'Manrope', sans-serif" font-weight="800" font-size="46" fill="#1E293B" letter-spacing="-0.5">Your Path,</text>
    <text x="0" y="55" font-family="'Manrope', sans-serif" font-weight="800" font-size="46" fill="#15803D" letter-spacing="-0.5">Simplified.</text>
    <text x="0" y="105" font-family="'Manrope', sans-serif" font-weight="500" font-size="16" fill="#475569">Registration • Biometric KYC • Automatic Disbursal</text>
  </g>
</svg>
`;

async function buildSlides() {
  console.log('Rendering slides into /public/dashboard/ ...');
  await sharp(Buffer.from(slide1Svg)).png().toFile(path.join(outputDir, 'slide-1.png'));
  console.log('slide-1.png written');
  await sharp(Buffer.from(slide2Svg)).png().toFile(path.join(outputDir, 'slide-2.png'));
  console.log('slide-2.png written');
  await sharp(Buffer.from(slide3Svg)).png().toFile(path.join(outputDir, 'slide-3.png'));
  console.log('slide-3.png written');
  await sharp(Buffer.from(slide4Svg)).png().toFile(path.join(outputDir, 'slide-4.png'));
  console.log('slide-4.png written');
  console.log('All 4 slides successfully saved to public/dashboard/');
}

buildSlides().catch(console.error);
