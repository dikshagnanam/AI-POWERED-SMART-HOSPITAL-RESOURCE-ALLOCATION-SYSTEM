import math

# Hospital staff pool
DOCTORS = [
    {"id": "D001", "name": "Dr. Arjun Sharma",    "specialty": "General",    "max_hours": 8, "available": True},
    {"id": "D002", "name": "Dr. Priya Nair",       "specialty": "Cardiology", "max_hours": 8, "available": True},
    {"id": "D003", "name": "Dr. Ravi Kumar",        "specialty": "Emergency",  "max_hours": 8, "available": True},
    {"id": "D004", "name": "Dr. Sunita Patel",      "specialty": "Surgery",    "max_hours": 8, "available": True},
    {"id": "D005", "name": "Dr. Meera Iyer",        "specialty": "Pediatrics", "max_hours": 8, "available": True},
    {"id": "D006", "name": "Dr. Kiran Reddy",       "specialty": "General",    "max_hours": 8, "available": False},
    {"id": "D007", "name": "Dr. Anand Pillai",      "specialty": "Neurology",  "max_hours": 8, "available": True},
    {"id": "D008", "name": "Dr. Lakshmi Menon",     "specialty": "Emergency",  "max_hours": 8, "available": True},
]

NURSES = [
    {"id": "N001", "name": "Nurse Deepa Raj",     "ward": "ICU",       "max_hours": 8, "available": True},
    {"id": "N002", "name": "Nurse Kavya Suresh",  "ward": "Emergency", "max_hours": 8, "available": True},
    {"id": "N003", "name": "Nurse Anitha Mohan",  "ward": "General",   "max_hours": 8, "available": True},
    {"id": "N004", "name": "Nurse Rekha Nair",    "ward": "ICU",       "max_hours": 8, "available": True},
    {"id": "N005", "name": "Nurse Sindhu Lal",    "ward": "Pediatric", "max_hours": 8, "available": False},
    {"id": "N006", "name": "Nurse Parvathi Das",  "ward": "General",   "max_hours": 8, "available": True},
    {"id": "N007", "name": "Nurse Uma Krishnan",  "ward": "Emergency", "max_hours": 8, "available": True},
    {"id": "N008", "name": "Nurse Geetha Babu",   "ward": "ICU",       "max_hours": 8, "available": True},
    {"id": "N009", "name": "Nurse Radha Menon",   "ward": "General",   "max_hours": 8, "available": True},
    {"id": "N010", "name": "Nurse Saranya Pillai", "ward": "Pediatric", "max_hours": 8, "available": True},
]

SHIFTS = ["Morning (6AM-2PM)", "Afternoon (2PM-10PM)", "Night (10PM-6AM)"]

def greedy_schedule(predicted_admissions):
    """
    Greedy algorithm: assign available staff to shifts based on predicted load.
    Higher admissions → more staff assigned per shift.
    """
    schedules = []
    
    for day_idx, admissions in enumerate(predicted_admissions):
        # Determine load level
        if admissions >= 100:
            load = "High"
            doctors_per_shift = 3
            nurses_per_shift = 4
        elif admissions >= 75:
            load = "Medium"
            doctors_per_shift = 2
            nurses_per_shift = 3
        else:
            load = "Low"
            doctors_per_shift = 1
            nurses_per_shift = 2
        
        available_doctors = [d for d in DOCTORS if d["available"]]
        available_nurses = [n for n in NURSES if n["available"]]
        
        shift_assignments = []
        
        # Greedy: assign greedily across shifts
        doc_idx = 0
        nur_idx = 0
        
        for shift in SHIFTS:
            assigned_docs = []
            assigned_nurses = []
            
            # Assign doctors greedily
            count = 0
            while count < doctors_per_shift and doc_idx < len(available_doctors):
                assigned_docs.append({
                    "id": available_doctors[doc_idx]["id"],
                    "name": available_doctors[doc_idx]["name"],
                    "specialty": available_doctors[doc_idx]["specialty"]
                })
                doc_idx = (doc_idx + 1) % len(available_doctors)
                count += 1
            
            # Assign nurses greedily
            count = 0
            while count < nurses_per_shift and nur_idx < len(available_nurses):
                assigned_nurses.append({
                    "id": available_nurses[nur_idx]["id"],
                    "name": available_nurses[nur_idx]["name"],
                    "ward": available_nurses[nur_idx]["ward"]
                })
                nur_idx = (nur_idx + 1) % len(available_nurses)
                count += 1
            
            shift_assignments.append({
                "shift": shift,
                "doctors": assigned_docs,
                "nurses": assigned_nurses
            })
        
        # Summary stats
        total_assigned_docs = len(set([d["id"] for s in shift_assignments for d in s["doctors"]]))
        total_assigned_nurses = len(set([n["id"] for s in shift_assignments for n in s["nurses"]]))
        
        schedules.append({
            "day": day_idx + 1,
            "predicted_admissions": admissions,
            "load_level": load,
            "shifts": shift_assignments,
            "summary": {
                "total_doctors_available": len(available_doctors),
                "total_nurses_available": len(available_nurses),
                "doctors_on_duty": total_assigned_docs,
                "nurses_on_duty": total_assigned_nurses,
                "doctors_off_duty": len(DOCTORS) - total_assigned_docs,
                "nurses_off_duty": len(NURSES) - total_assigned_nurses
            }
        })
    
    return schedules
