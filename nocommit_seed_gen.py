import random
import json


t = ["ggura@holoen.net", "cmori@holoen.net", "awatson@holoen.net", "ninanis@holoen.net", "tkiara@holoen.net"]

def gentc():
    print("advisor: { connect: { email: \"" + random.choice(t) + "\" } }")

s = json.loads('[{"name":"Pomu Rainpuff","email":"prainpuff@2434en.com","graduation":"2023-07-00"},{"name":"Elira Pendora","email":"ependora@2434en.com","graduation":"2023-07-00"},{"name":"Finana Ryugu","email":"fryugu@2434en.com","graduation":"2023-07-00"},{"name":"Rosemi Lovelock","email":"rlovelock@2434en.com","graduation":"2023-07-00"},{"name":"Petra Gurin","email":"pgurin@2434en.com","graduation":"2023-07-00"},{"name":"Selen Tatsuki","email":"statsuki@2434en.com","graduation":"2023-07-00"},{"name":"Nina Kosaka","email":"nkosaka@2434en.com","graduation":"2023-07-00"},{"name":"Enna Alouette","email":"ealouette@2434en.com","graduation":"2023-07-00"},{"name":"Millie Parfait","email":"mparfait@2434en.com","graduation":"2023-07-00"},{"name":"Reimu Endou","email":"rendou@2434en.com","graduation":"2023-07-00"},{"name":"Mysta Rias","email":"mrias@2434en.com","graduation":"2024-07-00"},{"name":"Luca Kaneshiro","email":"lkaneshiro@2434en.com","graduation":"2024-07-00"},{"name":"Shu Yamino","email":"syamino@2434en.com","graduation":"2024-07-00"},{"name":"Ike Eveland","email":"ieveland@2434en.com","graduation":"2024-07-00"},{"name":"Vox Akuma","email":"vakuma@2434en.com","graduation":"2024-07-00"},{"name":"Yugo Asuma","email":"yasuma@2434en.com","graduation":"2024-07-00"},{"name":"Uki Violeta","email":"uvioleta@2434en.com","graduation":"2024-07-00"},{"name":"Alban Knox","email":"aknox@2434en.com","graduation":"2024-07-00"},{"name":"Fulgur Ovid","email":"fovid@2434en.com","graduation":"2024-07-00"},{"name":"Sonny Brisko","email":"sbrisko@2434en.com","graduation":"2024-07-00"},{"name":"Ren Zotto","email":"rzotto@2434en.com","graduation":"2025-07-00"},{"name":"Maria Marionette","email":"mmarionette@2434en.com","graduation":"2025-07-00"},{"name":"Kyo Kaneko","email":"kkaneko@2434en.com","graduation":"2025-07-00"},{"name":"Scarle Yonaguni","email":"syonaguni@2434en.com","graduation":"2025-07-00"},{"name":"Aster Arcadia","email":"aarcadia@2434en.com","graduation":"2025-07-00"},{"name":"Ver Vermillion","email":"vvermillion@2434en.com","graduation":"2025-07-00"},{"name":"Doppio Dropscythe","email":"ddropscythe@2434en.com","graduation":"2025-07-00"},{"name":"Meloco Kyoran","email":"mkioran@2434en.com","graduation":"2025-07-00"},{"name":"Kotoka Torahime","email":"ktorahime@2434en.com","graduation":"2025-07-00"},{"name":"Hex Haywire","email":"hhaywire@2434en.com","graduation":"2025-07-00"},{"name":"Zaion LanZa","email":"zlanza@2434en.com","graduation":"2025-07-00"},{"name":"Vezalius Bandage","email":"vbandage@2434en.com","graduation":"2026-07-00"},{"name":"Vantacrow Bringer","email":"vbringer@2434en.com","graduation":"2026-07-00"},{"name":"Yu Q. Wilson","email":"ywilson@2434en.com","graduation":"2026-07-00"}]')

s = list(map(lambda e: e["email"], s))

def gr():
    print(f"""
founder: {{ connect: {{ email: "{random.choice(s)}" }} }},
officers: {{ connect: [ {", ".join(['{ email: "' + random.choice(s) + '" }' for _ in range(random.randint(2, 5))])} ] }},
members: {{ connect: [ {", ".join(['{ email: "' + random.choice(s) + '" }' for _ in range(random.randint(2, 25))])} ] }},
""")
    
gr()