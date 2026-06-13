import math
import random

# Priority levels
PRIORITY_LEVELS = {
    "Critical": {"weight": 1, "base_wait": 0},
    "Urgent": {"weight": 2, "base_wait": 10},
    "Semi-Urgent": {"weight": 3, "base_wait": 25},
    "Non-Urgent": {"weight": 4, "base_wait": 45}
}

def optimize_wait_time(predicted_admissions, available_doctors_count=6, available_nurses_count=8):
    """
    Optimize waiting times using priority queue logic.
    - Patients sorted by priority
    - Higher severity = lower wait time
    - More staff = less wait time
    """
    results = []
    
    for day_idx, admissions in enumerate(predicted_admissions):
        # Simulate patient distribution by priority
        critical_count = math.ceil(admissions * 0.10)
        urgent_count = math.ceil(admissions * 0.25)
        semi_urgent_count = math.ceil(admissions * 0.35)
        non_urgent_count = admissions - critical_count - urgent_count - semi_urgent_count
        
        # Calculate base throughput per hour (doctors handle ~6 patients/hour combined)
        throughput_per_hour = available_doctors_count * 4
        
        # Total hours to clear queue
        hours_to_clear = round(admissions / throughput_per_hour, 1)
        
        # Wait times (in minutes) per priority
        # Formula: base_wait + (queue_position / throughput) * 60
        def calc_wait(base, queue_depth, throughput):
            return round(base + (queue_depth / (throughput / 60)), 1)
        
        wait_critical = calc_wait(0, critical_count * 0.5, throughput_per_hour)
        wait_urgent = calc_wait(10, urgent_count, throughput_per_hour)
        wait_semi = calc_wait(25, semi_urgent_count * 1.5, throughput_per_hour)
        wait_non = calc_wait(45, non_urgent_count * 2, throughput_per_hour)
        
        # Average wait time (weighted)
        total_patients = admissions
        avg_wait = round(
            (critical_count * wait_critical +
             urgent_count * wait_urgent +
             semi_urgent_count * wait_semi +
             non_urgent_count * wait_non) / total_patients, 1
        ) if total_patients > 0 else 0
        
        # Optimization recommendation
        if avg_wait > 60:
            recommendation = "Call additional staff — waiting time critical"
            status = "Critical"
        elif avg_wait > 35:
            recommendation = "Consider adding 1 more doctor to ER"
            status = "Warning"
        else:
            recommendation = "Staffing adequate for current load"
            status = "Normal"
        
        # Patient queue breakdown
        queue = [
            {"priority": "Critical",    "count": critical_count,   "avg_wait_min": wait_critical,  "color": "red"},
            {"priority": "Urgent",      "count": urgent_count,     "avg_wait_min": wait_urgent,    "color": "orange"},
            {"priority": "Semi-Urgent", "count": semi_urgent_count,"avg_wait_min": wait_semi,      "color": "yellow"},
            {"priority": "Non-Urgent",  "count": non_urgent_count, "avg_wait_min": wait_non,       "color": "green"},
        ]
        
        results.append({
            "day": day_idx + 1,
            "predicted_admissions": admissions,
            "queue_breakdown": queue,
            "avg_wait_minutes": avg_wait,
            "hours_to_clear_queue": hours_to_clear,
            "throughput_per_hour": throughput_per_hour,
            "recommendation": recommendation,
            "status": status
        })
    
    return results
