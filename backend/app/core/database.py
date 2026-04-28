
import mysql.connector
from mysql.connector import Error
from .config import settings
import logging

logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=settings.DB_HOST,
            database=settings.DB_NAME,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        if connection.is_connected():
            return connection
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return None
