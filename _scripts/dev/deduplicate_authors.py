import os
import sys
import unicodedata
import re

# Asegurar que el entorno reconozca las rutas del proyecto
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from backend.src.database.session import SessionLocal
from backend.src.database.models.identity import Author, AuthorArticle

def _normalize_author_name(name: str) -> str:
    """Normaliza el nombre eliminando acentos, espacios, puntuación y pasándolo a minúsculas."""
    if not name:
        return ""
    n = unicodedata.normalize("NFKD", name).encode("ASCII", "ignore").decode("utf-8")
    return re.sub(r"[^a-z0-9]", "", n.lower())

def deduplicate_authors():
    print("Conectando a la base de datos...")
    db = SessionLocal()
    try:
        print("Obteniendo todos los autores...")
        # Ordenamos por ID ascendente para mantener siempre el registro más antiguo como maestro.
        authors = db.query(Author).order_by(Author.id.asc()).all()
        
        norm_map = {}
        orcid_map = {}
        to_delete = set()
        merged_count = 0
        
        for auth in authors:
            n_key = _normalize_author_name(auth.name)
            target = None
            
            # Prioridad 1: Match por ORCID exacto
            if auth.orcid and auth.orcid in orcid_map:
                target = orcid_map[auth.orcid]
            # Prioridad 2: Match por nombre normalizado (diacritics/espacios ignorados)
            elif n_key in norm_map:
                target = norm_map[n_key]
                
            if target and target.id != auth.id:
                print(f"Fusionando: '{auth.name}' (ID {auth.id}) -> '{target.name}' (ID {target.id})")
                
                # Transferir los enlaces de AuthorArticle
                links = db.query(AuthorArticle).filter(AuthorArticle.author_id == auth.id).all()
                for link in links:
                    # Verificar que el target no esté ya asociado a este mismo artículo
                    exists = db.query(AuthorArticle).filter_by(
                        author_id=target.id, article_id=link.article_id
                    ).first()
                    
                    if exists:
                        db.delete(link) # Si ya existe, simplemente eliminamos el duplicado
                    else:
                        link.author_id = target.id # Si no, actualizamos el puntero al maestro
                
                # Conservar la mejor información posible en el maestro
                if not target.orcid and auth.orcid: 
                    target.orcid = auth.orcid
                if not target.email and auth.email: 
                    target.email = auth.email
                if not target.affiliation_id and auth.affiliation_id: 
                    target.affiliation_id = auth.affiliation_id
                
                to_delete.add(auth.id)
                merged_count += 1
            else:
                # Registrar como nuevo maestro si no hay colisiones
                if auth.orcid:
                    orcid_map[auth.orcid] = auth
                if n_key:
                    norm_map[n_key] = auth

        if to_delete:
            print(f"Eliminando {len(to_delete)} registros obsoletos...")
            db.query(Author).filter(Author.id.in_(to_delete)).delete(synchronize_session=False)
            db.commit()
            print(f"Éxito: Se han fusionado {merged_count} autores duplicados y consolidado la red.")
        else:
            print("No se encontraron autores duplicados para fusionar.")
            
    except Exception as e:
        db.rollback()
        print(f"Error crítico durante la fusión: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    deduplicate_authors()