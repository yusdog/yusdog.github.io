import os
import json
import re
import aiohttp
import asyncio
from aiohttp import ClientSession

TEMPLATE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png">
    <link rel="apple-touch-icon" href="/images/favicon.png">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play {GAME_NAME} | yusdog Unblocked Games</title>
    <meta name="description" content="Play {GAME_NAME} unblocked on yusdog - No downloads required! Enjoy this fun HTML5 game at school or work with our fast, secure gaming platform.">
    <meta name="keywords" content="{GAME_NAME}, {GAME_NAME} unblocked, play {GAME_NAME}, free {GAME_NAME}, html5 games, unblocked games, school games, no flash games">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yusdog.github.io/">
    <meta property="og:title" content="Play {GAME_NAME} | yusdog Unblocked Games">
    <meta property="og:description" content="Play {GAME_NAME} unblocked on yusdog - No downloads required! Enjoy this fun HTML5 game at school or work.">
    <meta property="og:image" content="{GAME_COVER}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://yusdog.github.io/">
    <meta property="twitter:title" content="Play {GAME_NAME} | yusdog Unblocked Games">
    <meta property="twitter:description" content="Play {GAME_NAME} unblocked on yusdog - No downloads required! Enjoy this fun HTML5 game at school or work.">
    <meta property="twitter:image" content="{GAME_COVER}">
    
    <script async="" src="https://www.googletagmanager.com/gtag/js?id=G-WX5VS54ZDW"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-WX5VS54ZDW');
    </script>

    <link rel="stylesheet" href="/styles/style.css">
    <style>
        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        
        .game-header {
            margin-bottom: 20px;
        }
        
        .game-title {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: var(--primary-color);
        }
        
        .game-frame-container {
            position: relative;
            margin: 0 auto;
            max-width: 900px;
            border: 2px solid var(--card-border);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px var(--shadow);
            margin-bottom: 30px;
        }
        
        .game-frame {
            width: 100%;
            height: 600px;
            border: none;
            background: var(--card-bg);
        }
        
        .fullscreen-btn, .newtab-btn {
            position: absolute;
            bottom: 12px;
            background-color: rgba(18, 18, 20, 0.88);
            color: #f4f4f5;
            border: 1px solid #323238;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            z-index: 10;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }
        
        .fullscreen-btn:hover, .newtab-btn:hover {
            background-color: #27272c;
            color: #ffffff;
            border-color: #4e4e56;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.8);
        }

        .fullscreen-btn {
            right: 12px;
        }

        .newtab-btn {
            left: 12px;
        }
        
        .game-info {
            margin-top: 20px;
            text-align: left;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
        }
        
        .game-cover {
            flex: 1;
            min-width: 300px;
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px var(--shadow);
            object-fit: contain;
            align-self: flex-start;
        }
        
        .game-details {
            flex: 2;
            min-width: 300px;
        }
        
        .game-description {
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .features-list {
            columns: 2;
            column-gap: 20px;
        }
        
        @media (max-width: 768px) {
            .game-title {
                font-size: 1.8rem;
            }
            
            .game-frame {
                height: 400px;
            }
            
            .features-list {
                columns: 1;
            }
            
            .game-cover {
                min-width: 100%;
            }
        }
    </style>
    <script src="/javascript/security.js"></script>
</head>
<body class="dark-mode">
    <!-- Key Gate -->
    <div id="keyGateOverlay">
        <div class="key-card">
            <h2 class="key-title">yusdog</h2>
            <p class="key-subtitle">Enter access key to continue</p>
            <form onsubmit="submitKey(event)">
                <input type="password" id="keyInput" class="key-input" placeholder="Enter key..." autocomplete="off" autofocus>
                <button type="submit" class="key-button">Unlock</button>
                <div id="keyError" class="key-error"></div>
            </form>
        </div>
    </div>
    <script>
        if (localStorage.getItem('yusdog_key_version') !== 'v3_kittens' || localStorage.getItem('yusdog_key_unlocked') !== 'true') {
            document.getElementById('keyGateOverlay').style.display = 'flex';
        }
    </script>
    <header>
        <div class="header-content">
            <a class="logo" href="/" style="text-decoration: none; color: inherit;">yusdog</a>
            <div class="control-buttons">
                <a href="/chat/" id="chatTab" class="nav-tab">chat</a>
                <a href="https://yusdog.github.io/movies/" id="moviesTab" class="nav-tab">movies</a>
                <button id="settings">Settings</button>
            </div>
        </div>
    </header>

    <main class="game-container">
        <div class="game-header">
            <h1 class="game-title">{GAME_NAME}</h1>
        </div>
        
        <div class="game-frame-container">
            <iframe class="game-frame" id="gameFrame" allowfullscreen></iframe>
            <button class="fullscreen-btn" onclick="document.getElementById('gameFrame').requestFullscreen()">Fullscreen</button>
            <button class="newtab-btn" onclick="window.open('https://yusdog.github.io/iframe/{PATHNAME}', '_blank')">Open in New Tab</button>
        </div>

        <div class="game-info">
            <img class="game-cover" id="coverImage" alt="{GAME_NAME} Game Cover">
            
            <div class="game-details">
                <h2>About {GAME_NAME}</h2>
                <p class="game-description">
                    Play {GAME_NAME} unblocked on yusdog! Our platform provides fast, secure access to this popular HTML5 game without any downloads. 
                    Perfect for school, work, or home, {GAME_NAME} runs directly in your browser with no installation required.
                </p>
                
                <h3>How to Play</h3>
                <ul>
                    <li>Use the fullscreen button for the best gaming experience</li>
                    <li>Game controls are typically keyboard (WASD or arrow keys) and mouse</li>
                    <li>Save your progress - high scores may be saved between sessions</li>
                </ul>
                
                <h3>Features</h3>
                <ul class="features-list">
                    <li>No downloads or installations required</li>
                    <li>Works on Chromebooks and school computers</li>
                    <li>Fast loading times with our optimized servers</li>
                    <li>Regularly updated game library</li>
                    <li>Mobile-friendly gameplay</li>
                    <li>Dark mode support</li>
                    <li>Privacy-focused platform</li>
                    <li>Works behind school filters</li>
                </ul>
            </div>
        </div>
    </main>

    <script>
        const params = new URLSearchParams(window.location.search);
        const title = "{GAME_NAME}";
        const cover = "{GAME_COVER}";
        const url = "{GAME_URL}";

        document.getElementById("coverImage").src = cover;
        document.getElementById("coverImage").alt = `${title} Game Cover`;
        document.getElementById("gameFrame").src = url;
    </script>

    <div id="popupOverlay">
      <div class="popup">
          <div class="popup-header">
              <h3 id="popupTitle">Title</h3>
              <button id="popupClose" onclick="closePopup()">×</button>
          </div>
          <div id="popupBody">
              Content will be here
          </div>
      </div>
    </div>
    
    <footer>
        <div class="footer-links">
            <a href="#" onclick="showContact(); return false;">Contact</a>
            <a href="#" onclick="loadPrivacy(); return false;">Privacy Policy</a>
            <a href="javascript:saveData()">Export Data</a>
            <label for="importData" style="color: var(--primary-color); cursor: pointer;">Import Data</label>
            <input type="file" id="importData" style="display: none;" onchange="loadData(event)">
        </div>
    </footer>

    <script src="/javascript/script.js"></script>
</body>
</html>
"""

sitemap = """<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://yusdog.github.io/</loc>
  </url>
""";

async def fetch_json(session: ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        return await response.json()

async def fetch_text(session: ClientSession, url: str) -> str:
    async with session.get(url) as response:
        return await response.text()

async def process_game(session: ClientSession, game: dict, OUTPUT_DIR: str, GAME_DIR: str) -> str:
    game_id = str(game['id'])
    if game_id == '-1':
        return None
    
    game_name = game['name']
    game_cover = game['cover']
    pathname = f"{game['url'].split('/')[1]}"
    game_name_url = re.sub(r'[^a-zA-Z0-9-]', '', game_name.replace(' ', '-').lower()).replace('--', '-')
    
    game_folder = os.path.join(OUTPUT_DIR, game_name_url)
    os.makedirs(game_folder, exist_ok=True)
    os.makedirs(GAME_DIR, exist_ok=True)
    
    html_content = TEMPLATE_HTML.replace('{GAME_NAME}', game_name)\
                               .replace('{GAME_ID}', game_id)\
                               .replace('{GAME_COVER}', game_cover.replace(
                                   "{COVER_URL}", 
                                   "https://cdn.jsdelivr.net/gh/freebuisness/covers@main"))\
                               .replace('{GAME_URL}', "/iframe/"+pathname)\
                               .replace('{PATHNAME}', pathname)
    game_url = f'https://cdn.jsdelivr.net/gh/freebuisness/html@main/{pathname}'
    game_html = await fetch_text(session, game_url)
    
    game_file_path = os.path.join(GAME_DIR, f"{pathname}")
    with open(game_file_path, 'w', encoding='utf-8') as f:
        f.write(game_html)
    
    index_path = os.path.join(OUTPUT_DIR, game_name_url, 'index.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    global sitemap
    sitemap += f"""
    <url>
        <loc>https://yusdog.github.io/games/{game_name_url}/</loc>
    </url>
    """
    print(f"Made {index_path}")
    return game_file_path

async def main():
    OUTPUT_DIR = 'games'
    GAME_DIR = 'iframe'
    
    async with ClientSession() as session:
        hash_response = await fetch_json(session, "https://api.github.com/repos/gn-math/assets/commits")
        hash = hash_response[0]['sha']
        print(f"latest hash: {hash}")
        
        zones_url = f'https://cdn.jsdelivr.net/gh/freebuisness/assets@{hash}/zones.json'
        games = await fetch_json(session, zones_url)
        print("loaded zones")
        
        tasks = [process_game(session, game, OUTPUT_DIR, GAME_DIR) for game in games]
        game_paths = await asyncio.gather(*tasks)
        
        game_paths = [path for path in game_paths if path is not None]
        
        json_string = json.dumps(game_paths, indent=4)
        try:
            with open('games.json', 'w', encoding='utf-8') as f:
                f.write(json_string)
            print("games.json done")
        except Exception as e:
            print("Error games.json:", e)
        try:
            global sitemap
            sitemap += "</urlset>"
            with open('sitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap)
            with open('newsitemap.xml', 'w', encoding='utf-8') as f:
                f.write(sitemap)
            print("sitemap done")
        except Exception as e:
            print("Error sitemap.xml:", e)
    print("done")

if __name__ == '__main__':
    asyncio.run(main())
