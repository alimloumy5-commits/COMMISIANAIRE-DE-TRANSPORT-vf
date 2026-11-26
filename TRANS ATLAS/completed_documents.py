"""Fill the existing shipment forms with operational data and labelled examples."""
import json
from io import BytesIO
from pathlib import Path
from functools import lru_cache

from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(__file__).parent / "assets"
def shipment_index():
    # Use the same shipment records as the dashboard.
    script = (ASSETS / "dashboard.js").read_text("utf8")
    block = script.split("const lfR=[", 1)[1].split("];", 1)[0]
    records = json.loads("[" + block.strip().rstrip(",") + "]")
    return {row["ref"]: row for row in records}


SHIPMENTS = shipment_index()
KINDS = {"BL", "CMR", "Colisage", "DUM", "Temperature", "Conformite",
         "Phytosanitaire", "Facture-commerciale", "Facture-transport"}
# Illustrative values per kg in MAD, independent of the road freight tariff.
RATES = {"0843": 9, "0844": 24, "0845": 82, "0850": 13,
         "0851": 17, "0852": 105, "0854": 79}


def money(value):
    return f"{value:,}".replace(",", " ")


@lru_cache(maxsize=48)
def font(size):
    return ImageFont.truetype(str(ASSETS/"Vera.ttf"),size=round(size * 3))


def render(filename):
    name, dot, ext = filename.rpartition(".")
    kind, sep, suffix = name.partition("-EXP-")
    r = SHIPMENTS.get("EXP-" + suffix)
    if not sep or ext not in {"pdf", "png"} or not r or kind not in KINDS:
        raise FileNotFoundError(filename)
    with Image.open(ASSETS / "pieces" / (name + ".png")) as original:
        page = original.convert("RGB")
    draw = ImageDraw.Draw(page)

    def field(x, y, w, h, value, size=9, background="white", ink="#142e42"):
        box = (round(x*3), round((48+y)*3), round((x+w)*3), round((48+y+h)*3))
        draw.rectangle(box, fill=background)
        while size >= 4:
            face = font(size)
            lines = [""]
            for word in str(value).split():
                candidate = (lines[-1]+" "+word).strip()
                if lines[-1] and draw.textlength(candidate,font=face) > w*3-5:
                    lines.append(word)
                else:
                    lines[-1] = candidate
            label = "\n".join(lines)
            bounds = draw.multiline_textbbox((0,0),label,font=face,spacing=2)
            if bounds[2] <= w*3-4 and bounds[3] <= h*3-2:
                break
            size -= 0.5
        draw.multiline_text((box[0]+2,box[1]),label,font=face,fill=ink,spacing=2)

    ref=r["ref"][-4:]
    origin,dest=r["route"].split(" → ")
    buyer="Plateforme de distribution de "+dest
    pallets=r["pallets"]
    gross=round(r["weight"]*1000)
    rate=RATES.get(ref,0)
    value=rate*gross
    lot="LOT-"+r["dispatch"].replace("-","")+"-"+ref
    delivery=r.get("delivered")
    received=r.get("receivedPallets")
    reception=(f"Réception : {received}/{pallets} palettes le {delivery}."
               if delivery else "Réception à confirmer à l'arrivée.")
    field(8,-47,page.width/3-16,19,"EXEMPLE ADAPTÉ  /  DONNÉES SIMULÉES  /  "+r["ref"],10,"#173747","white")

    if kind=="BL":
        field(186,104,131,43,buyer+" - Quai réception",9,"#dedede")
        field(15,113,30,8,ref,7)
        field(49,113,35,8,r["dispatch"][5:],7)
        field(89,113,35,8,"BL-"+ref,7)
        field(184,272,47,14,"ART-"+ref,7)
        field(276,272,40,14,str(pallets)+" pal.",7)
        field(276,437,40,12,str(pallets)+" pal.",7)
        field(49,331,132,30,reception,8)
    elif kind=="Colisage":
        field(45,166,310,33,buyer+" - "+dest,11)
        field(374,166,124,34,buyer,9)
        field(512,172,109,28,"Lot "+ref,10)
        field(47,271,160,45,lot,10)
        field(46,634,315,66,f"Palettes 01 à {pallets}. Masse brute moyenne par palette : {gross/pallets:.1f} kg. "+reception,11)
        field(398,635,131,29,origin+" - "+r["dispatch"],9,"#dce7ef")
    elif kind=="CMR":
        field(57,116,225,42,buyer+" - "+dest,12)
        field(302,194,220,48,"Transport routier - véhicule "+r["plate"]+". Lot "+lot,11)
        field(302,271,220,22,"Facture commerciale, liste de colisage et dossier douanier.",9)
        field(57,263,224,30,("Maintenir la consigne de 4 °C." if "frigorifique" in r["truck"] else "Arrimer les palettes et protéger les colis de l'humidité."),10)
        field(57,477,224,45,"Incoterm "+r["incoterm"]+" - destination "+dest+". Livraison sur rendez-vous.",11)
        field(57,558,228,24,"Référence du lot : "+lot,11)
        field(372,648,152,34,reception,10)
    elif kind=="DUM":
        field(252,61,223,59,buyer+" - "+dest,12)
        field(10,551,222,68,"Dossier interne SIM-"+ref+". "+("Contrôle documentaire en cours." if r["status"]=="En douane" else "Pièces préparées pour le passage en douane."),12)
        field(253,551,222,68,"Valeur commerciale simulée : "+money(value)+" MAD. Liquidation officielle non renseignée.",12)
    elif kind.startswith("Facture"):
        service=kind=="Facture-transport"
        amount=r["price"] if service else value
        field(501,76,365,42,("Client : "+r["client"] if service else "Acheteur : "+buyer),16)
        field(20,225,394,33,"Prestation" if service else "Désignation des marchandises",17)
        for x,w,title in [(425,88,"Quantité"),(520,76,"Unité"),(603,80,"P.U. HT"),(690,72,"Remise"),(770,115,"Montant HT")]:
            field(x,225,w,33,title,14)
        for x,w,text in [(425,88,1 if service else money(gross)),(520,76,"trajet" if service else "kg"),(603,80,money(amount if service else rate)),(690,72,"0 %"),(770,115,money(amount))]:
            field(x,282,w,40,text,15)
        field(23,460,849,70,"Total HT : "+money(amount)+" MAD. "+("Prestation de transport routier." if service else "Valeur des marchandises. Lot "+lot+" - "+r["incoterm"]+" "+dest+"."),19)
        field(23,544,849,50,"Règlement simulé : virement à 30 jours. Référence : "+r["ref"],15)
    elif kind=="Temperature":
        incident=ref=="0843"
        temps=[4.0,4.1,4.2,5.8,4.8,4.2,4.0,3.9,4.0,4.1] if incident else [4.0,3.9,4.1,4.0,4.2,4.1,4.0,3.9,4.0,4.1]
        temps.append(4.0)
        for i,temp in enumerate(temps):
            y=228+14.35*i
            field(102,y,60,10,f"{temp:.1f} °C".replace(".",","),8)
            field(167,y,71,10,"Non" if temp>4.5 else "Oui",8)
            field(244,y,118,10,{3:"Contrôle de fermeture",4:"Suivi du retour à la consigne"}.get(i,"Surveillance horaire") if incident else "Surveillance horaire",7)
            field(368,y,48,10,"Équipe froid",7)
        field(52,426,354,45,("Excursion simulée à 13 h. Retour dans la plage de suivi à 15 h. Alerte du dossier à traiter." if incident else "Relevé simulé stable sur le créneau observé. Réception de 26 palettes sur 28."),10)
    elif kind=="Phytosanitaire":
        field(13,414,419,46,f"Lot {lot} - {pallets} palettes identifiées pour le contrôle.",12,"#e7f5f8")
        field(13,490,419,47,"Préparation simulée : rapprochement des lots, emballages et liste de colisage. Résultat officiel à obtenir.",11,"#e7f5f8")
    elif kind=="Conformite":
        field(24,153,133,40,"Emballage : caisses sur palettes. Marque de lot "+ref,9)
        field(285,286,52,115,"Cat. I (simulation)",9)
        field(347,286,74,115,money(gross)+" kg brut ; tare simulée "+money(25*pallets)+" kg ; net "+money(gross-25*pallets)+" kg.",9)
        field(21,597,389,15,"Lot "+lot+" - préparation pour contrôle, visa officiel en attente.",8)

    data=BytesIO()
    if ext=="pdf":
        # A4 portrait or landscape. Preserve the proportions of the original form.
        landscape=page.width>page.height
        canvas=Image.new("RGB",(1754,1240) if landscape else (1240,1754),"white")
        page.thumbnail((canvas.width-40,canvas.height-40),Image.Resampling.LANCZOS)
        canvas.paste(page,((canvas.width-page.width)//2,(canvas.height-page.height)//2))
        canvas.save(data,"PDF",resolution=150,quality=94,title=name)
    else:
        page.save(data,"PNG")
    return data.getvalue()
