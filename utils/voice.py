import io
from gtts import gTTS

def speak(text: str, lang: str) -> bytes:
    try:
        if not text:
            return b""
        # gTTS uses 2-letter language codes: 'en', 'hi', 'mr'
        tts = gTTS(text=text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        return fp.getvalue()
    except Exception as e:
        print(f"Error in TTS: {e}")
        return b""
