
# Database Setup & ETL

We use **PostgreSQL + PostGIS** to solve the data storage needs.

## 1. Prerequisites (Install Docker)
1.  **Download Docker Desktop**: [Click here to download for Mac (Apple Silicon)](https://desktop.docker.com/mac/main/arm64/Docker.dmg)  
    *(If you have an Intel Mac, [click here](https://desktop.docker.com/mac/main/amd64/Docker.dmg))*
2.  **Install**: Open the `.dmg` file and drag the Docker icon to your **Applications** folder.
3.  **Start**: Open "Docker" from your Applications folder. Wait for the icon in the menu bar to stop animating.
4.  **Verify**: Open a terminal and run `docker --version`.

## 2. Start Database
Run the following command to spin up the containerized database:
```bash
docker compose up -d db
```
This starts PostgreSQL 15 on port `5432` with user `user`, password `password`, db `i_ascap`.

## 3. Run ETL (Load Data)
Once the database is up, run the Python ETL script to create the schema and load the data.

```bash
# When your container is running (green status), run the ETL script to load data:
python scripts/etl/load_to_postgres.py
```

## 4. Check Data
You can verify the data was loaded using `psql` or any DB client:
```bash
docker compose exec db psql -U user -d i_ascap -c "SELECT count(*) FROM agri_metrics;"
```

## 5. Schema
- **districts**: Reference list of districts (from map/master).
- **agri_metrics**: Long-format table containing all extracted variables (Yield, Area, etc.) for each district/year.
    - `id`: PK
    - `cdk`: District ID
    - `year`: Year
    - `variable_name`: e.g. 'wheat_yield'
    - `value`: Numeric value (NULLs handled).
