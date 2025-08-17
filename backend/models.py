import os
import datetime

from peewee_aio import Manager, AIOModel, fields

from config import MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE

manager = Manager(f"aiomysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}", autocommit=True)

@manager.register
class User(AIOModel):
    id = fields.AutoField()
    username = fields.CharField()
    hashed_password = fields.CharField()
    last_numeric = fields.IntegerField(default=0)
    role = fields.CharField()
    parent_id = fields.CharField()

@manager.register
class Note(AIOModel):
    id = fields.AutoField()
    user_numeric = fields.IntegerField()
    owner = fields.CharField()
    updated_at = fields.TimestampField(default=datetime.datetime.now)
    text = fields.TextField(default=None, null=True)
    files = fields.CharField(default=None, null=True)
    url = fields.CharField(default=None, null=True)
    curator = fields.CharField(default=None, null=True)
    delivery = fields.CharField(default=None, null=True)
    expired = fields.CharField(default=None, null=True)

@manager.register
class Session(AIOModel):
    id = fields.AutoField()
    unique_identifier = fields.CharField(max_length=12, unique=True)
    pin_code = fields.CharField(max_length=4)
    expiration_date = fields.TimestampField()

async def init_tables():
    await User.create_table()
    await Note.create_table()
    await Session.create_table()