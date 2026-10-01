import json
import os
import urllib.parse

os.makedirs('data', exist_ok=True)
districts = [
    ('Nashik', 'Maharashtra', '422'),
    ('Pune', 'Maharashtra', '411'),
    ('Mumbai', 'Maharashtra', '400'),
    ('Nagpur', 'Maharashtra', '440'),
    ('Aurangabad', 'Maharashtra', '431'),
    ('Patna', 'Bihar', '800'),
    ('Gaya', 'Bihar', '823'),
    ('Lucknow', 'Uttar Pradesh', '226'),
    ('Varanasi', 'Uttar Pradesh', '221'),
    ('Jaipur', 'Rajasthan', '302'),
    ('Bhopal', 'Madhya Pradesh', '462'),
    ('Indore', 'Madhya Pradesh', '452'),
    ('Ranchi', 'Jharkhand', '834'),
    ('Bengaluru Rural', 'Karnataka', '562')
]
areas = ['Main Road', 'Station Road', 'Market Area', 'Civil Lines', 'Gram Panchayat']
centers = []
c_id = 1
for d, s, p in districts:
    for i in range(3): # 3 per district = 42 total
        pin = f"{p}0{i+1}1"
        area = areas[i % len(areas)]
        name = f"CSC {d} {area} (Demo)"
        q = urllib.parse.quote_plus(f"{name} {d}")
        centers.append({
            'name': name,
            'address': f"Shop No {c_id}, Near {area}, {d}, {s}",
            'district': d,
            'state': s,
            'pin_code': pin,
            'phone': 'Demo only',
            'hours': 'Mon-Sat 9:30 AM - 5:30 PM',
            'maps_url': f"https://www.google.com/maps/search/?api=1&query={q}",
            'simulated': True
        })
        c_id += 1
with open('data/csc_centers.json', 'w', encoding='utf-8') as f:
    json.dump(centers, f, indent=4)
print('Generated 42 centers')
