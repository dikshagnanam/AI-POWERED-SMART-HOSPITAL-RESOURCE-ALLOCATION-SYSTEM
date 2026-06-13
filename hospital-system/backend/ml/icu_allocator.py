from pulp import LpProblem, LpVariable, LpMaximize, lpSum, value, LpStatus, PULP_CBC_CMD
import math

def allocate_icu_beds(predicted_admissions, total_icu_beds=30):
    results = []

    for day_idx, admissions in enumerate(predicted_admissions):
        icu_demand = math.ceil(admissions * 0.15)

        critical_demand = math.ceil(icu_demand * 0.4)
        serious_demand = math.ceil(icu_demand * 0.35)
        moderate_demand = math.ceil(icu_demand * 0.25)

        prob = LpProblem(f"ICU_Day_{day_idx+1}", LpMaximize)

        x_critical = LpVariable("critical_beds", lowBound=0, upBound=critical_demand, cat='Integer')
        x_serious  = LpVariable("serious_beds",  lowBound=0, upBound=serious_demand,  cat='Integer')
        x_moderate = LpVariable("moderate_beds", lowBound=0, upBound=moderate_demand, cat='Integer')

        prob += 3 * x_critical + 2 * x_serious + 1 * x_moderate
        prob += x_critical + x_serious + x_moderate <= total_icu_beds

        # Solve silently — this fixes the Windows 500 error
        prob.solve(PULP_CBC_CMD(msg=0))

        allocated_critical = int(value(x_critical) or 0)
        allocated_serious  = int(value(x_serious)  or 0)
        allocated_moderate = int(value(x_moderate) or 0)
        total_allocated    = allocated_critical + allocated_serious + allocated_moderate

        results.append({
            "day": day_idx + 1,
            "predicted_admissions": admissions,
            "icu_demand": icu_demand,
            "total_icu_beds": total_icu_beds,
            "allocated": {
                "critical": allocated_critical,
                "serious":  allocated_serious,
                "moderate": allocated_moderate,
                "total":    total_allocated
            },
            "available_beds": total_icu_beds - total_allocated,
            "utilization_percent": round((total_allocated / total_icu_beds) * 100, 1),
            "status": LpStatus[prob.status]
        })

    return results
