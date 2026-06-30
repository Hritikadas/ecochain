import os
import sqlite3
import pandas as pd

def run_ecochain_etl():
    print("🚀 Starting Free EcoChain ETL Data Pipeline...")

    # 📥 1. EXTRACT: Connect to your local SQLite database
    db_path = os.path.join(os.path.dirname(__file__), "..", "ecochain.db")
    if not os.path.exists(db_path):
        print("⚠️ Core data context file not found. Creating a baseline mockup for schema pipeline testing...")
        # Create quick mock dataset if running in isolated CI runner env
        df_mock = pd.DataFrame([
            {"user_id": 1, "activity": "Transit", "emissions_kg": 45.2, "region": "Mumbai"},
            {"user_id": 2, "activity": "Energy", "emissions_kg": 120.8, "region": "Delhi"},
            {"user_id": 1, "activity": "Diet", "emissions_kg": 12.4, "region": "Mumbai"}
        ])
    else:
        conn = sqlite3.connect(db_path)
        # Pull raw analytics footprint logs
        df_mock = pd.read_sql_query("SELECT * FROM footprints;", conn)
        conn.close()

    # ⚙️ 2. TRANSFORM: Run fast aggregations using Pandas/Analytical syntax
    print("⚙️ Processing regional carbon footprints metrics...")
    
   # Calculate total and average emissions grouped by geographic region
    transformed_df = df_mock.groupby("region").agg(
        total_emissions_metric_tons=("emissions_kg", lambda x: x.sum() / 1000.0),
        total_logs_processed=("emissions_kg", "count")
    ).reset_index()

    # 💾 3. LOAD: Save as a clean, highly-compressed file for analytics
    output_dir = os.path.join(os.path.dirname(__file__), "..", "analytics_warehouse")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "regional_emissions_summary.csv")
    transformed_df.to_csv(output_file, index=False)
    
    print(f"✅ Data Pipeline Completed successfully! Analytical summary cached at: {output_file}")
    print(transformed_df)

if __name__ == "__main__":
    run_ecochain_etl()
