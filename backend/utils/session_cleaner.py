import asyncio
import datetime
from models import Session

async def clean_expired_sessions():
    while True:
        try:
            current_time = datetime.datetime.now()
            # Удаляем все сессии, у которых срок действия истек
            query = Session.delete().where(Session.expiration_date < current_time)
            await query.execute()
        except Exception as e:
            print(f"Error during session cleanup: {e}")
        
        # Проверяем каждый час
        await asyncio.sleep(3600)
