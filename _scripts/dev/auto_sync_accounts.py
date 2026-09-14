import asyncio
import sys
import os
import json
import websockets
import aiohttp

# Asegurar que el script puede resolver las importaciones del core (src)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.database.db_manager import DBManager
from src.core.models.browser import Browser
from src.core.models.platform_account import PlatformAccount
from src.core.cdp.cdp_client import create_cdp_tab, close_cdp_tab, get_cdp_cookies
from src.core.services.browser_launcher_service import BrowserLauncherService

async def check_port(port: int) -> bool:
    try:
        reader, writer = await asyncio.wait_for(asyncio.open_connection('127.0.0.1', port), timeout=1.0)
        writer.close()
        await writer.wait_closed()
        return True
    except Exception:
        return False

async def close_browser_via_cdp(port: int):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"http://127.0.0.1:{port}/json") as resp:
                pages = await resp.json()
                for p in pages:
                    if p.get("webSocketDebuggerUrl"):
                        async with websockets.connect(p["webSocketDebuggerUrl"]) as ws:
                            await ws.send(json.dumps({"id": 9999, "method": "Browser.close"}))
                        return
    except Exception as e:
        print(f"       [!] No se pudo cerrar el navegador automáticamente: {e}")

async def run_massive_sync():
    print("[*] Iniciando Sincronización Masiva O(1) (Optimizada para RAM)...")
    
    db = DBManager()
    if hasattr(db, "init_db"):
        db.init_db()
    session = getattr(db, "session", None) or db.get_session()

    # Ordenamos alfabéticamente para mayor claridad en los logs (av2019, av2020...)
    browsers = session.query(Browser).order_by(Browser.profile_name).all()
    total_updated = 0

    for browser in browsers:
        accounts = session.query(PlatformAccount).filter_by(browser_id=browser.id).all()
        # Ignorará cuentas como "warehouse2015@gmail.com" que tienen Browser en None nativamente
        if not accounts:
            continue

        print(f"\n[+] Perfil: {browser.profile_name} (Puerto: {browser.port}) - {len(accounts)} cuentas conectadas.")
        
        was_already_open = await check_port(browser.port)
        if not was_already_open:
            print("    [~] Lanzando navegador en background...")
            launcher = BrowserLauncherService()
            launcher.launch(browser.profile_name, browser.port, "about:blank")
            await asyncio.sleep(5)
        else:
            print("    [~] El navegador ya estaba abierto. Conectando...")

        try:
            url = "https://aistudio.google.com/u/0/"
            print("    -> Abriendo pestaña maestra /u/0/ para refrescar el Cookie Jar...")
            
            tab_info = await create_cdp_tab(browser.port, url)
            tab_id = tab_info.get("id")
            ws_url = tab_info.get("webSocketDebuggerUrl")

            if not ws_url:
                print("       [!] Error crítico: No se pudo obtener el WebSocket URL del perfil.")
                continue

            print("       [~] Esperando 8 segundos (Validación V8 en Google)...")
            await asyncio.sleep(8)

            cookies = await get_cdp_cookies(ws_url)

            if cookies:
                print(f"       [OK] Extraídas {len(cookies)} cookies globales. Guardando en BD...")
                for acc in accounts:
                    acc.session_cookies = cookies
                    total_updated += 1
                session.commit()
                print(f"       [✔] Se actualizaron exitosamente las {len(accounts)} cuentas asociadas a este perfil.")
            else:
                print(f"       [WARN] No se extrajeron cookies. ¿Perfil corrupto o deslogueado?")

            # PROTECCIÓN DE RAM CRÍTICA
            if not was_already_open:
                print("    [~] Matando el proceso del navegador para liberar memoria RAM...")
                await close_browser_via_cdp(browser.port)
                await asyncio.sleep(2)
            else:
                print("    [~] Cerrando solo la pestaña maestra (se respetó el navegador abierto)...")
                await close_cdp_tab(browser.port, tab_id)

        except Exception as e:
            print(f"[ERROR] Falló la sincronización para el perfil {browser.profile_name}: {str(e)}")

    print(f"\n[✔] SINCRONIZACIÓN COMPLETADA. {total_updated} cuentas migradas.")

if __name__ == "__main__":
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_massive_sync())