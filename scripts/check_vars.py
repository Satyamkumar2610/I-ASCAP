
from sqlalchemy import create_engine, text

DB_URL = "postgresql://user:password@localhost:5432/i_ascap"
engine = create_engine(DB_URL)

def get_vars():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT DISTINCT variable_name FROM agri_metrics ORDER BY variable_name")).fetchall()
        vars = [r[0] for r in res]
        print("Available Variables:", vars)
        
        # Parse into Crops and Metrics
        crops = set()
        metrics = set()
        
        for v in vars:
            parts = v.split('_')
            # Assuming format is {crop}_{metric} or {crop}_{metric}_{type}?
            # E.g. wheat_yield -> crop=wheat, metric=yield
            # kharif_sorghum_area -> crop=kharif_sorghum, metric=area?
            
            # Heuristic: Last word is metric (area, production, yield)
            metric = parts[-1]
            crop = "_".join(parts[:-1])
            
            crops.add(crop)
            metrics.add(metric)
            
        print("\nIdentified Crops:", sorted(list(crops)))
        print("Identified Metrics:", sorted(list(metrics)))

if __name__ == "__main__":
    get_vars()
