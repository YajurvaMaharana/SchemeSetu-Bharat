import json
import os

def load_csc_data():
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "csc_centers.json")
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def find_csc(district: str | None, pin_code: str | None, state: str | None) -> dict:
    centers = load_csc_data()
    
    # 1. Exact pin_code match
    if pin_code:
        for c in centers:
            if c.get("pin_code") == pin_code:
                c["match_level"] = "pin"
                return c
                
    # 2. 3-digit pin prefix match
    if pin_code and len(pin_code) >= 3:
        prefix = pin_code[:3]
        for c in centers:
            c_pin = c.get("pin_code", "")
            if c_pin.startswith(prefix):
                c["match_level"] = "prefix"
                return c
                
    # 3. Case-insensitive district match
    if district:
        dist_lower = district.lower().strip()
        # Handle common spellings
        dist_map = {
            "chhatrapati sambhajinagar": "aurangabad",
            "bombay": "mumbai",
            "bengaluru": "bengaluru rural",
            "bangalore": "bengaluru rural",
            "poona": "pune",
            "banaras": "varanasi",
            "kashi": "varanasi"
        }
        dist_lower = dist_map.get(dist_lower, dist_lower)
        for c in centers:
            c_dist = c.get("district", "").lower().strip()
            if c_dist == dist_lower:
                c["match_level"] = "district"
                return c
                
    # 4. Case-insensitive state match
    if state:
        state_lower = state.lower().strip()
        for c in centers:
            if c.get("state", "").lower().strip() == state_lower:
                c["match_level"] = "state"
                return c
                
    # 5. Fallback
    return {
        "match_level": "fallback",
        "message": "Find your nearest CSC on the official locator",
        "url": "https://locator.csccloud.in",
        "simulated": True
    }
