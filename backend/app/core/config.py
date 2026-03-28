from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # DB
    DB_URL: str

    # Telegram
    BOT_TOKEN: str
    MASTER_TG_ID: int

    # Dev mode: тест без Telegram (в обычном браузере)
    ALLOW_INSECURE_DEV: bool = False
    DEV_USER_ID: int = 111111
    DEV_USERNAME: str = "dev"

    class Config:
        env_file = ".env"

settings = Settings()
