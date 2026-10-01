"""Validator script for data/schemes_data.json.

Validates that:
1. data/schemes_data.json exists and contains exactly 6 schemes.
2. Every required key exists for each scheme and its nested eligibility object.
3. Prints a summary table of scheme_id, benefit, key limits, and source_url.
"""

import json
import sys
from pathlib import Path

# Ensure UTF-8 output encoding for terminal printing
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

REQUIRED_TOP_LEVEL_KEYS = [
    "scheme_id",
    "name",
    "short_name",
    "ministry",
    "annual_benefit_inr",
    "benefit_description",
    "eligibility",
    "required_documents",
    "application_steps",
    "direct_portal_url",
    "action_type",
    "friction_score",
    "processing_time",
    "source_url",
    "last_verified",
    "notes",
]

REQUIRED_ELIGIBILITY_KEYS = [
    "occupations",
    "min_age",
    "max_age",
    "genders",
    "max_income_inr",
    "max_land_hectares",
    "caste_categories",
    "requires_bpl",
    "requires_no_pucca_house",
    "requires_no_lpg",
    "education_levels",
    "excluded_categories",
]


def validate_schemes():
    workspace_root = Path(__file__).resolve().parent.parent
    data_path = workspace_root / "data" / "schemes_data.json"

    assert data_path.exists(), f"File not found: {data_path}"

    with open(data_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    assert isinstance(schemes, list), "Root JSON element must be a list"
    assert len(schemes) == 6, f"Expected exactly 6 schemes, found {len(schemes)}"

    print(f"Loaded {len(schemes)} schemes from {data_path.name}.\n")

    for i, s in enumerate(schemes, start=1):
        scheme_id = s.get("scheme_id", f"index_{i}")

        # Assert top-level keys
        for key in REQUIRED_TOP_LEVEL_KEYS:
            assert key in s, f"Scheme '{scheme_id}' is missing required key: '{key}'"

        # Assert eligibility keys
        elig = s["eligibility"]
        assert isinstance(elig, dict), f"Scheme '{scheme_id}' eligibility must be a dict"
        for e_key in REQUIRED_ELIGIBILITY_KEYS:
            assert e_key in elig, f"Scheme '{scheme_id}' eligibility is missing key: '{e_key}'"

        # Assert basic types
        assert isinstance(s["annual_benefit_inr"], int), f"annual_benefit_inr must be int in '{scheme_id}'"
        assert isinstance(s["required_documents"], list), f"required_documents must be list in '{scheme_id}'"
        assert isinstance(s["application_steps"], list), f"application_steps must be list in '{scheme_id}'"
        assert 3 <= len(s["application_steps"]) <= 6, f"application_steps must have 3-6 steps in '{scheme_id}'"

    print("All required keys and structure assertions PASSED successfully!\n")

    # Print summary table
    print("=" * 115)
    header = f"{'Scheme ID':<23} | {'Annual Benefit':<16} | {'Key Limits / Restrictions':<42} | {'Source Portal'}"
    print(header)
    print("-" * 115)

    for s in schemes:
        sid = s["scheme_id"]
        benefit = f"Rs. {s['annual_benefit_inr']:,}"
        el = s["eligibility"]

        limits = []
        if el["occupations"]:
            limits.append(f"Occ: {','.join(el['occupations'])}")
        if el["min_age"] or el["max_age"]:
            limits.append(f"Age: {el['min_age'] or '0'}-{el['max_age'] or 'No max'}")
        if el["genders"]:
            limits.append(f"Gen: {','.join(el['genders'])}")
        if el["max_income_inr"]:
            limits.append(f"MaxInc: Rs.{el['max_income_inr']:,}")
        if el["max_land_hectares"]:
            limits.append(f"MaxLand: {el['max_land_hectares']}ha")
        if el["caste_categories"]:
            limits.append(f"Caste: {','.join(el['caste_categories'])}")
        if el["requires_no_pucca_house"]:
            limits.append("No Pucca House")
        if el["requires_no_lpg"]:
            limits.append("No LPG")
        if el["requires_bpl"]:
            limits.append("BPL/SECC")

        limits_str = "; ".join(limits) if limits else "No restrictive limits"
        if len(limits_str) > 40:
            limits_str = limits_str[:37] + "..."

        source = s["source_url"]
        print(f"{sid:<23} | {benefit:<16} | {limits_str:<42} | {source}")

    print("=" * 115)


if __name__ == "__main__":
    validate_schemes()
