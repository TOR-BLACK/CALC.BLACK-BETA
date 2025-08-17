import hashlib
import datetime
import asyncio

from typing import Annotated

from fastapi import FastAPI, APIRouter, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import UploadFile
from typing import List

from models import init_tables, User, Note, Session, manager
from utils.utils import generate_unique_identifier, generate_pin_code
from utils.session_cleaner import clean_expired_sessions

app = FastAPI(docs_url="/api/docs", redoc_url=None, openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

router = APIRouter(prefix="/api")

@app.on_event("startup")
async def on_startup():
    app.include_router(router)
    await init_tables()
    # Запускаем задачу очистки сессий в фоновом режиме
    asyncio.create_task(clean_expired_sessions())

@router.post("/register")
async def register(
    login: Annotated[str, Form()],
    password: Annotated[str, Form()],
    role: Annotated[str, Form()] = 'user',
    parent_id: Annotated[str, Form()] = '-'
):
    if len(login) == 0 or len(password) == 0:
        return JSONResponse(status_code=401, content="Login or password is empty")

    try:
        user = await User.get(User.username == login)
    except BaseException as e:
        user = None
    if user is not None:
        return JSONResponse(status_code=402, content="Login exists")

    hashed_password = hashlib.md5(password.encode()).hexdigest()

    try:
        await User.create(username=login, hashed_password=hashed_password, role=role, parent_id=parent_id)
        return JSONResponse(status_code=200, content="Register OK")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.post("/auth")
async def auth(
    login: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    if len(login) == 0 or len(password) == 0:
        return JSONResponse(status_code=401, content="Login or password is empty")
    try:
        user = await User.get(User.username == login)
    except:
        user = None
    if user is None:
        return JSONResponse(status_code=402, content="Invalid login or password")

    hashed_password = hashlib.md5(password.encode()).hexdigest()

    if user.hashed_password == hashed_password:
        return JSONResponse(status_code=200, content=str(user.id))
    else:
        return JSONResponse(status_code=403, content="Invalid login or password")

@router.get("/notes_list")
async def notes_list():
    try:
        notes = await Note.select(Note)
        for i in range(0, len(notes)):
            if notes[i] != None and notes[i].__data__['files'] != None:
                notes[i].__data__['files'] = notes[i].__data__['files'].split("!;")
    except:
        notes = []
    return [note.__data__ for note in notes]

@router.get("/notes")
async def notes(
    user_id: str
):
    try:
        notes = await Note.select(Note).where(Note.owner == user_id)
        for i in range(0, len(notes)):
            if notes[i] != None and notes[i].__data__['files'] != None:
                notes[i].__data__['files'] = notes[i].__data__['files'].split("!;")
    except:
        notes = []
    return [note.__data__ for note in notes]

@router.get("/info")
async def get_note_info_by_url(
    url: str
):
    try:
        note = await Note.get(Note.url == url)
        return note.__data__
    except BaseException as e:
        return JSONResponse(status_code=403, content="Database error")

@router.get("/note")
async def get_note(
    user_id: str,
    note_id: str
):
    try:
        note = await Note.get(Note.owner == user_id, Note.id == note_id)
        if note != None and note.__data__['files'] != None:
            note.__data__['files'] = note.__data__['files'].split("!;")
        return note.__data__
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

async def update_user_numeric(user_id, plus=False):
    notes = await Note.select(Note).where(Note.owner == user_id)
    last_numeric = 0
    for note in notes:
        data = note.__data__
        if data['user_numeric'] > last_numeric:
            last_numeric = data['user_numeric']

    if plus:
        last_numeric += 1

    update = {}
    update['last_numeric'] = last_numeric
    await User.update(update).where(User.id == user_id)
    return last_numeric

@router.post("/note")
async def create_note(
    user_id: Annotated[str, Form()],
    expired: Annotated[str, Form()] = "infinity",
    text: Annotated[str, Form()] = "",
    url: Annotated[str, Form()] = None,
    files: Annotated[str, Form()] = None,
    is_session: Annotated[bool, Form()] = False
):
    #try:
    if is_session == False:
        user_numeric = await update_user_numeric(user_id, True)
        user = await User.get(User.id == user_id)
        if user.role == "user":
            if user.parent_id == "-":
                note = await Note.create(user_numeric=user_numeric, owner=user_id, text=text, url=url, files=files, expired=expired, delivery=user.username)
            else:
                curator_user = await User.get(User.id == user.parent_id)
                note = await Note.create(user_numeric=user_numeric, owner=user_id, text=text, url=url, files=files, expired=expired, delivery=user.username, curator=curator_user.username)
        elif user.role == "curator":
            note = await Note.create(user_numeric=user_numeric, owner=user_id, text=text, url=url, files=files, expired=expired, curator=user.username)
        else:
            note = await Note.create(user_numeric=user_numeric, owner=user_id, text=text, url=url, files=files, expired=expired)
    elif is_session == True:
        note = await Note.create(user_numeric=0, owner=user_id, text=text, url=url, files=files, expired=expired, delivery='-')
    await note.save()
    return JSONResponse(status_code=200, content="Note created")
    '''except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")'''

@router.put("/note")
async def update_note(
    user_id: Annotated[int, Form()],
    note_id: Annotated[int, Form()],
    text: Annotated[str, Form()] = "",
    url: Annotated[str, Form()] = "",
    curator: Annotated[str, Form()] = "",
    delivery: Annotated[str, Form()] = "",
    files: Annotated[str, Form()] = ""
):
    try:
        update = {}
        update['text'] = text
        if url != "":
            update['url'] = url
        if curator != "":
            update['curator'] = curator
        if delivery != "":
            update['delivery'] = delivery
        if files != "":
            update['files'] = files
        await Note.update(update).where(Note.owner == user_id, Note.id == note_id)
        return JSONResponse(status_code=200, content="Note updated")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.put("/lifetime")
async def update_lifetime(
    note_id: Annotated[int, Form()],
    expired: Annotated[str, Form()]
):
    try:
        update = {}
        update['expired'] = expired
        await Note.update(update).where(Note.id == note_id)
        return JSONResponse(status_code=200, content="Lifetime updated")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.delete("/note")
async def delete_note(
    user_id: str,
    note_id: str
):
    try:
        await Note.delete().where(Note.owner == user_id, Note.id == note_id)
        await update_user_numeric(user_id)
        return JSONResponse(status_code=200, content="Note deleted")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.delete("/notes")
async def delete_notes(
    notes_ids: List[int]
):
    try:
        for note_id in notes_ids:
            note = await Note.select(Note).where(Note.id == note_id)
            if len(note) > 0:
                note = note[0].__data__
                await Note.delete().where(Note.id == note_id)
                await update_user_numeric(note['owner'])
        return JSONResponse(status_code=200, content="Notes deleted")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.get("/users")
async def users():
    try:
        users = await User.select(User)
    except:
        users = []
    returned = [user.__data__ for user in users]
    for user in returned:
        childrens = await User.select(User).where(User.parent_id == user['id'])
        user['childrens'] = [children.__data__ for children in childrens]
    return returned

@router.delete("/user")
async def delete_user(
    users_ids: str
):
    try:
        for user_id in users_ids.split(";"):
            await User.delete().where(User.id == user_id)
        return JSONResponse(status_code=200, content="Users deleted")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.patch("/user")
async def update_user(
    user_id: Annotated[int, Form()],
    username: Annotated[str, Form()],
    parent_id: Annotated[str, Form()],
    password: Annotated[str, Form()] = None
):
    try:
        update = {}
        update['username'] = username
        if password != None:
            update['hashed_password'] = hashlib.md5(password.encode()).hexdigest()
        update['parent_id'] = parent_id
        await User.update(update).where(User.id == user_id)
        return JSONResponse(status_code=200, content="User updated")
    except BaseException as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.post("/session")
async def create_session():
    unique_identifier = generate_unique_identifier()
    pin_code = generate_pin_code()
    expiration_date = datetime.datetime.now() + datetime.timedelta(days=1)
    try:
        session = await Session.create(unique_identifier=unique_identifier, pin_code=pin_code, expiration_date=expiration_date)
        return JSONResponse(status_code=200, content={
            "id": session.id,
            "unique_identifier": session.unique_identifier,
            "pin_code": session.pin_code,
            "expiration_date": session.expiration_date.isoformat()
        })
    except Exception as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.patch("/session")
async def update_session(
    unique_identifier: Annotated[str, Form()],
    new_pin_code: Annotated[str, Form()]
):
    try:
        await Session.update(pin_code=new_pin_code).where(Session.unique_identifier == unique_identifier)
        return JSONResponse(status_code=200, content="Session updated")
    except Exception as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.put("/session")
async def regenerate_pin_code(
    unique_identifier: Annotated[str, Form()]
):
    new_pin_code = generate_pin_code()
    try:
        await Session.update(pin_code=new_pin_code).where(Session.unique_identifier == unique_identifier)
        return JSONResponse(status_code=200, content={"new_pin_code": new_pin_code})
    except Exception as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.delete("/session")
async def delete_session(
    unique_identifier: Annotated[str, Form()]
):
    try:
        await Session.delete().where(Session.unique_identifier == unique_identifier)
        return JSONResponse(status_code=200, content="Session deleted")
    except Exception as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error")

@router.get("/session/{unique_identifier}")
async def get_session(
    unique_identifier: int
):
    try:
        session = await Session.get(Session.unique_identifier == unique_identifier)
        return JSONResponse(status_code=200, content={
            "id": session.id,
            "unique_identifier": session.unique_identifier,
            "pin_code": session.pin_code,
            "expiration_date": session.expiration_date.isoformat()
        })
    except Exception as e:
        print(e)
        return JSONResponse(status_code=403, content="Database error or session does not exists")