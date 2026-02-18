import asyncio
from app.database import get_connection

async def list_constraints():
    async with get_connection() as db:
        rows = await db.fetch("""
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND conrelid = 'agri_metrics'::regclass
        """)
        print("Constraints on agri_metrics:")
        for r in rows:
            print(f"{r['conname']}: {r['pg_get_constraintdef']}")

if __name__ == "__main__":
    asyncio.run(list_constraints())
