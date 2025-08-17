import os

import dotenv


dotenv.load_dotenv()


MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

if __name__ == "__main__":
    print(
        MYSQL_USER,
        MYSQL_HOST,
        MYSQL_PORT,
        MYSQL_PASSWORD,
        MYSQL_DATABASE,
        sep="\n"
    )
