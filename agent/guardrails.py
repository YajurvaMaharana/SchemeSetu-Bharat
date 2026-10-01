"""Guardrail validation module for SchemeSetu Bharat.

Ensures uncompromising reliability, deterministic integrity, and accuracy of agent results:
(a) every scheme_id in result.matches and every id mentioned in the explanation text exists in data/schemes_data.json;
(b) no match with status ELIGIBLE failed any hard rule when re-evaluated by rules.py;
(c) total_annual_benefit_inr equals the sum over ELIGIBLE and LIKELY matches;
(d) required_documents for each match equal those in the JSON.
"""

import logging
import re
from typing import Any, Dict, List, Set

from agent import rules
from agent.models import AgentResult

logger = logging.getLogger(__name__)


def validate_result(result: AgentResult) -> List[str]:
    """Validate an AgentResult against statutory data and deterministic invariants.
    
    Returns:
        List of problem description strings. If valid, returns an empty list [].
    """
    problems: List[str] = []

    try:
        schemes = rules.load_schemes()
    except Exception as e:
        return [f"Unable to load schemes_data.json for validation: {e}"]

    # Map of valid scheme identifiers
    valid_ids: Set[str] = set()
    schemes_by_id: Dict[str, Dict[str, Any]] = {}
    for s in schemes:
        sid = s.get("scheme_id") or s.get("id")
        if sid:
            valid_ids.add(sid)
            schemes_by_id[sid] = s
        if s.get("id"):
            valid_ids.add(s["id"])
            schemes_by_id[s["id"]] = s
        if s.get("scheme_id"):
            valid_ids.add(s["scheme_id"])
            schemes_by_id[s["scheme_id"]] = s

    # 1. Check (a): every scheme_id in result.matches exists in data/schemes_data.json
    for match in result.matches:
        if match.scheme_id not in valid_ids:
            problems.append(
                f"Scheme ID '{match.scheme_id}' in matches does not exist in data/schemes_data.json."
            )

    # Check (a) part 2: every ID mentioned in the explanation exists in data/schemes_data.json
    exp_text = result.explanation or ""
    # Look for scheme ID patterns (e.g., PM_KISAN_2026, KCC_2026, pm_kisan, etc.)
    id_pattern_matches = set(re.findall(r"\b([A-Z0-9_]{3,}_2026)\b", exp_text))
    # Also search for explicit lowercase scheme keys if wrapped or referenced
    id_pattern_matches.update(re.findall(r"\b(pm_kisan|kcc|pmay_g|nsp_post_matric|ayushman_bharat|pm_ujjwala)\b", exp_text))

    for token in id_pattern_matches:
        if token not in valid_ids:
            problems.append(
                f"Scheme ID '{token}' mentioned in explanation does not exist in data/schemes_data.json."
            )

    # 2. Check (b): no match with status ELIGIBLE failed any hard rule when re-evaluated by rules.py
    for match in result.matches:
        if match.status == "ELIGIBLE":
            scheme_def = schemes_by_id.get(match.scheme_id)
            if scheme_def:
                re_eval = rules.evaluate_scheme(result.profile, scheme_def)
                if re_eval.status == "NOT_ELIGIBLE":
                    problems.append(
                        f"Scheme '{match.scheme_id}' is marked ELIGIBLE but failed deterministic re-evaluation: "
                        f"{'; '.join(re_eval.reasons)}"
                    )

    # 3. Check (c): total_annual_benefit_inr equals the sum over ELIGIBLE and LIKELY matches
    expected_sum = sum(
        m.annual_benefit_inr for m in result.matches if m.status in ("ELIGIBLE", "LIKELY")
    )
    if result.total_annual_benefit_inr != expected_sum:
        problems.append(
            f"total_annual_benefit_inr ({result.total_annual_benefit_inr}) does not equal "
            f"the sum over ELIGIBLE and LIKELY matches ({expected_sum})."
        )

    # 4. Check (d): required_documents for each match equal those in the JSON
    for match in result.matches:
        scheme_def = schemes_by_id.get(match.scheme_id)
        if scheme_def:
            expected_docs = list(scheme_def.get("required_documents") or [])
            actual_docs = list(match.required_documents or [])
            if actual_docs != expected_docs:
                problems.append(
                    f"Scheme '{match.scheme_id}' required_documents {actual_docs} do not match "
                    f"schemes_data.json {expected_docs}."
                )

    return problems
