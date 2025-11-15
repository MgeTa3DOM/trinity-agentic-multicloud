from PIL import Image
import base64, uuid, time, json, hmac, hashlib

SECRET_KEY = b'sample_private_key'

def analyse_image(image_path):
    img = Image.open(image_path)
    size = img.size
    colors = img.getcolors(maxcolors=256)
    details = {
        "size": size,
        "distinct_colors": len(colors) if colors else "N/A",
        "dominant": colors[0] if colors else "N/A",
        "description": "Recherche pattern, details, différences..."
    }
    payload = base64.b64encode(json.dumps(details).encode()).decode()
    message = {
        "msg_id": str(uuid.uuid4()),
        "sender": "maitre-paterne",
        "recipient": ["maitre_espace", "gpt_agent"],
        "timestamp": int(time.time()),
        "context_tags": ["image","pattern","diff"],
        "payload": payload,
        "embedding": base64.b64encode(b"PATERNE_VECTOR").decode(),
        "meta": {"confidence": 0.91, "version": "0.1", "feedback": {"interpretation":"pattern-recognized"}}
    }
    msg_str = json.dumps(message, sort_keys=True).encode()
    message["signature"] = hmac.new(SECRET_KEY, msg_str, hashlib.sha256).hexdigest()
    print(json.dumps(message, indent=2))

# Utilisation : analyse_image('votre_image.jpg')