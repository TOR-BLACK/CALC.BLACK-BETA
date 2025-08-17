import random

def generate_unique_identifier():
    return str(random.randint(211111111555, 775999999000))

def generate_pin_code():
    return f"{random.randint(0, 9999):04}"