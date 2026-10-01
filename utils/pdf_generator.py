"""Action Pack PDF generator for SchemeSetu Bharat.

MANDATORY RULES:
- Never print the rupee symbol in PDFs unless the font supports it. Use 'Rs.' or 'INR'.
- Writes a valid standard PDF document without requiring heavy binary dependencies.
"""

from datetime import datetime
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional


def generate_action_pack(result: Dict[str, Any], language: str = "hi") -> str:
    """Generate a clean Action Pack PDF for the citizen.
    
    Returns the file path of the generated PDF.
    """
    output_dir = Path(__file__).resolve().parent.parent / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    profile = result.get("profile") or result.get("user_profile") or {}
    if hasattr(profile, "model_dump"):
        profile = profile.model_dump()
    elif not isinstance(profile, dict):
        profile = {}

    name = profile.get("name") or "Citizen"
    sanitized_name = re.sub(r"[^a-zA-Z0-9_-]", "_", str(name)).strip("_") or "Citizen"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"ActionPack_{sanitized_name}_{timestamp}.pdf"
    pdf_path = output_dir / pdf_filename

    matches = result.get("matches") or result.get("eligible_schemes") or []
    if not isinstance(matches, list):
        matches = []

    # Extract eligible schemes
    eligible = []
    for m in matches:
        if hasattr(m, "model_dump"):
            m = m.model_dump()
        if isinstance(m, dict) and m.get("status") in ("ELIGIBLE", "LIKELY"):
            eligible.append(m)

    total_benefit = result.get("total_annual_benefit_inr") or result.get("total_potential_benefit_inr") or 0
    csc = result.get("csc_center") or result.get("csc_recommendation") or {}

    # Format text lines for PDF (ensuring Latin-1 / ASCII safe characters)
    lines: List[str] = [
        "SCHEMESETU BHARAT - CITIZEN ACTION PACK",
        "=" * 45,
        f"Generated On: {datetime.now().strftime('%d %B %Y, %H:%M')}",
        f"Citizen Name: {name}",
        f"Occupation  : {profile.get('occupation') or 'N/A'}",
        f"State/Dist  : {profile.get('district') or 'N/A'}, {profile.get('state') or 'N/A'}",
        f"Annual Income: Rs. {int(profile.get('annual_income_inr') or 0):,}",
        f"Total Unlocked Benefit: Rs. {int(total_benefit):,} per year",
        "-" * 45,
        "ELIGIBLE WELFARE SCHEMES:",
    ]

    if eligible:
        for idx, s in enumerate(eligible, 1):
            s_name = s.get("name") or s.get("scheme_name") or s.get("id") or "Scheme"
            b_amt = int(s.get("annual_benefit_inr") or s.get("benefit_amount_inr") or 0)
            lines.append(f"  {idx}. {s_name}")
            lines.append(f"     Benefit: Rs. {b_amt:,} | Friction: {s.get('friction_score', 1)}/5")
            docs = s.get("required_documents", [])
            if docs:
                lines.append(f"     Key Docs: {', '.join(docs[:3])}")
    else:
        lines.append("  No immediate schemes matched. Please verify profile details.")

    lines.append("-" * 45)
    lines.append("NEAREST CSC DIGITAL SEVA KENDRA [Simulated]:")
    if csc:
        lines.append(f"  Center : {csc.get('center_name', 'CSC Seva Kendra')}")
        lines.append(f"  Address: {csc.get('address', 'Tehsil Road')}")
        lines.append(f"  VLE    : {csc.get('vle_name', 'Center Coordinator')} ({csc.get('contact_phone', 'N/A')})")
    else:
        lines.append("  Visit your nearest Gram Panchayat or CSC center with Aadhaar.")

    lines.append("=" * 45)
    lines.append("Government of India Welfare Assistance Protocol")

    # Generate standard PDF stream
    stream_content = ""
    y = 750
    for idx, line in enumerate(lines):
        safe_line = line.replace("(", "").replace(")", "").replace("\\", "").replace("\u20b9", "Rs. ")
        font_size = 14 if idx == 0 else (12 if idx in (1, 8, len(lines) - 2) else 10)
        stream_content += f"BT /F1 {font_size} Tf 45 {y} Td ({safe_line}) Tj ET\n"
        y -= 18
        if y < 40:
            break

    stream_bytes = stream_content.encode("latin-1", errors="replace")
    stream_len = len(stream_bytes)

    pdf_structure = (
        "%PDF-1.4\n"
        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n"
        "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        f"5 0 obj << /Length {stream_len} >>\nstream\n"
    ).encode("latin-1") + stream_bytes + (
        "\nendstream\nendobj\n"
        "xref\n0 6\n0000000000 65535 f \n"
        "trailer << /Root 1 0 R /Size 6 >>\nstartxref\n%%EOF"
    ).encode("latin-1")

    with open(pdf_path, "wb") as f:
        f.write(pdf_structure)

    return str(pdf_path)
