import uuid, time, base64, hmac, hashlib, json
SECRET_KEY = b'sample_private_key'

message = {
  "msg_id": str(uuid.uuid4()),
  "sender": "trinity_maitre_temps",
  "recipient": ["maitre_espace", "gpt_agent"],
  "timestamp": int(time.time()),
  "context_tags": ["workflow", "prompting", "nlp"],
  "payload": base64.b64encode(json.dumps({"query": "run"}).encode()).decode(),
  "embedding": base64.b64encode(b"FAKE_EMBEDDING_VECTOR").decode(),
  "meta": {"confidence": 0.94, "version": "0.2", "feedback": {"latency": 54, "interpretation": "success", "improvements": ["routing logic"] } }
}
msg_str = json.dumps(message, sort_keys=True).encode()
message["signature"] = hmac.new(SECRET_KEY, msg_str, hashlib.sha256).hexdigest()

print(json.dumps(message, indent=2))
