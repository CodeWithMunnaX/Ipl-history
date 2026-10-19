"""
Player photos and team logos for the Power BI report.

Power BI shows an image when a column/measure holds an image URL. External links
break (the old S3 bucket is gone), so every image is downloaded once, shrunk to a
small square JPEG and embedded as a data: URI. Downloads are cached in
powerbi/data/images, so rebuilds don't refetch.

Photo sources, in order: uploaded photo in backend/player_images, the URL in the
players table, the Wikipedia page image, then a generated initials avatar.
"""
import base64
import hashlib
import io
import os
import re
import time

import requests
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
UPLOADS = os.path.join(HERE, "..", "backend", "player_images")
CACHE = os.path.join(HERE, "data", "images")
SIZE = 160

HEADERS = {
    # Wikipedia asks API clients to identify themselves
    "User-Agent": "IPL-history-powerbi/1.0 (personal analytics project; python-requests)",
}
WIKI_API = "https://en.wikipedia.org/w/api.php"

# Brand colours for team badges (used when no logo can be fetched)
TEAM_COLORS = {
    "CSK": "#F9CD05", "MI": "#004BA0", "RCB": "#EC1C24", "KKR": "#3A225D", "SRH": "#F26522",
    "RR": "#EA1A85", "DC": "#17479E", "PBKS": "#DD1F2D", "LSG": "#0057E2", "GT": "#1B2133",
    "GL": "#E04F16", "RPS": "#6F61AC", "KTK": "#F15A29", "PWI": "#2F9BE3", "DEC": "#D9D9D9",
}
# Wikipedia articles for team logos
TEAM_WIKI = {
    "Rising Pune Supergiant": "Rising Pune Supergiant",
    "Rising Pune Supergiants": "Rising Pune Supergiant",
    "Gujarat Lions": "Gujarat Lions",
    "Deccan Chargers": "Deccan Chargers",
    "Kochi Tuskers Kerala": "Kochi Tuskers Kerala",
    "Pune Warriors": "Pune Warriors India",
}


def _cache_path(key: str) -> str:
    return os.path.join(CACHE, hashlib.md5(key.encode()).hexdigest() + ".jpg")


def _get(url: str, **params):
    for attempt in range(3):
        try:
            r = requests.get(url, params=params or None, headers=HEADERS, timeout=20)
            if r.status_code == 429:
                time.sleep(2 + attempt * 3)
                continue
            return r
        except requests.RequestException:
            time.sleep(1)
    return None


def _square_jpeg(raw: bytes, focus_top: bool) -> bytes:
    """Crop to a square (portraits keep the head) and shrink."""
    im = Image.open(io.BytesIO(raw))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
        bg.alpha_composite(im)
        im = bg
    im = im.convert("RGB")
    w, h = im.size
    if focus_top:
        s = min(w, h)
        left = (w - s) // 2
        im = im.crop((left, 0, left + s, s))
    else:
        # logos: pad to square instead of cropping
        s = max(w, h)
        canvas = Image.new("RGB", (s, s), (255, 255, 255))
        canvas.paste(im, ((s - w) // 2, (s - h) // 2))
        im = canvas
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "JPEG", quality=82, optimize=True)
    return out.getvalue()


def _cached(key: str, fetch, focus_top: bool):
    """Return processed JPEG bytes for key, fetching once; None if unavailable."""
    os.makedirs(CACHE, exist_ok=True)
    path = _cache_path(key)
    miss = path + ".miss"
    if os.path.exists(path):
        return open(path, "rb").read()
    if os.path.exists(miss):
        return None
    raw = fetch()
    if raw:
        try:
            data = _square_jpeg(raw, focus_top)
            open(path, "wb").write(data)
            return data
        except Exception:
            pass
    open(miss, "w").close()
    return None


def _download(url: str):
    r = _get(url)
    if r is not None and r.ok and r.headers.get("content-type", "").startswith("image"):
        return r.content
    return None


PLACEHOLDER = re.compile(r"no_?pic|replace_this|silhouette|placeholder|default", re.I)


def _wiki_image(search: str, must_contain: str = "", title_word: str = ""):
    """Page image of the best Wikipedia search hit whose description matches."""
    r = _get(WIKI_API, action="query", format="json", generator="search", gsrsearch=search,
             gsrlimit=5, prop="pageimages|description", piprop="thumbnail",
             pithumbsize=400, pilicense="any")
    if r is None or not r.ok:
        return None
    pages = sorted((r.json().get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    for p in pages:
        desc = (p.get("description") or "").lower()
        if must_contain and must_contain not in desc:
            continue
        # guard against a different person: the article must carry the surname
        if title_word and title_word.lower() not in p.get("title", "").lower():
            continue
        thumb = (p.get("thumbnail") or {}).get("source")
        if thumb and not PLACEHOLDER.search(thumb):
            return _download(thumb)
    return None


def data_uri(jpeg: bytes) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(jpeg).decode()


def initials_svg(name: str, color: str = "#1D4ED8") -> str:
    """Initials avatar. Rendered as JPEG: Power BI tables don't draw SVG data URIs."""
    from PIL import ImageDraw, ImageFont
    words = [w for w in re.split(r"\s+", name.strip()) if w]
    text = ((words[0][0] + words[-1][0]) if len(words) > 1 else name[:2]).upper()
    im = Image.new("RGB", (SIZE, SIZE), color)
    draw = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype("segoeuib.ttf", 64)
    except OSError:
        font = ImageFont.load_default(size=64)
    draw.text((SIZE / 2, SIZE / 2), text, fill="white", font=font, anchor="mm")
    out = io.BytesIO()
    im.save(out, "JPEG", quality=85)
    return data_uri(out.getvalue())


def player_photo(name: str, full_name: str, stored: str | None, search_wiki: bool) -> tuple[str, str]:
    """(data URI, source) for one player."""
    stored = (stored or "").strip()
    if stored and not stored.startswith("http"):
        local = os.path.join(UPLOADS, os.path.basename(stored))
        if os.path.exists(local):
            data = _cached("upload:" + local, lambda: open(local, "rb").read(), True)
            if data:
                return data_uri(data), "upload"
    if stored.startswith("http"):
        data = _cached("url:" + stored, lambda: _download(stored), True)
        if data:
            return data_uri(data), "database"
    if search_wiki:
        query = f"{full_name or name} cricketer"
        surname = (full_name or name).split()[-1]
        data = _cached("wiki2:" + query, lambda: _wiki_image(query, "cricketer", surname), True)
        if data:
            return data_uri(data), "wikipedia"
    return initials_svg(name), "initials"


def team_logo(team: str, short: str, url: str | None) -> str:
    if url:
        data = _cached("logo:" + url, lambda: _download(url), False)
        if data:
            return data_uri(data)
    if team in TEAM_WIKI:
        title = TEAM_WIKI[team]
        data = _cached("wikilogo:" + title, lambda: _wiki_image(title), False)
        if data:
            return data_uri(data)
    return initials_svg(short or team, TEAM_COLORS.get(short, "#334155"))
