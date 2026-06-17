from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    @app.on_event("startup")
    async def startup_event():
        await _run_migrations()
        await _seed_admin()

    from app.api.v1.api import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


async def _run_migrations():
    """Run pending Alembic migrations on startup."""
    try:
        import asyncio
        from alembic.config import Config
        from alembic import command

        def run_sync():
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, run_sync)
    except Exception as e:
        print(f"[startup] Migration warning: {e}")


async def _seed_admin():
    """Create the default superadmin account if it doesn't exist."""
    from app.db.session import AsyncSessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User).where(User.email == settings.FIRST_SUPERUSER))
            if not result.scalars().first():
                admin = User(
                    email=settings.FIRST_SUPERUSER,
                    hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                    full_name="Super Admin",
                    role=UserRole.super_admin,
                    is_active=True,
                    is_verified=True,
                )
                db.add(admin)
                await db.commit()
                print(f"[startup] Admin user created: {settings.FIRST_SUPERUSER}")
        except Exception as e:
            print(f"[startup] Seed warning: {e}")


app = create_app()
