import os

folders = [
    "backend",
    "backend/app",
    "backend/app/api",
    "backend/app/api/v1",
    "backend/app/api/v1/routes",
    "backend/app/api/deps",
    "backend/app/core",
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/services",
    "backend/app/repositories",
    "backend/app/db",
    "backend/app/middleware",
    "backend/app/utils",
    "backend/app/tasks",
    "backend/app/admin",
    "backend/alembic",
    "backend/tests",
    "backend/docker",
    "backend/requirements"
]

for folder in folders:
    os.makedirs(folder, exist_ok=True)

# Generate basic files
open("backend/app/__init__.py", "w").close()

with open("backend/requirements/base.txt", "w") as f:
    f.write('''fastapi==0.110.0
uvicorn==0.27.1
sqlalchemy==2.0.27
alembic==1.13.1
psycopg2-binary==2.9.9
asyncpg==0.29.0
pydantic[email]==2.6.3
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
celery==5.3.6
redis==5.0.2''')

with open("backend/requirements/dev.txt", "w") as f:
    f.write('''-r base.txt
pytest==8.0.2
pytest-asyncio==0.23.5
httpx==0.27.0
black==24.2.0
isort==5.13.2''')

print("Backend scaffolding directories created successfully.")
