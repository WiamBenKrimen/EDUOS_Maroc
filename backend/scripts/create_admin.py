import argparse
import asyncio
from getpass import getpass

import asyncpg

from eduos.core.config import get_settings


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Créer un administrateur EDUOS")
    parser.add_argument("--email", required=True)
    parser.add_argument("--nom", required=True)
    parser.add_argument("--prenom", required=True)
    return parser.parse_args()


async def create_admin(
    email: str,
    nom: str,
    prenom: str,
    password: str,
) -> None:
    connection = await asyncpg.connect(get_settings().database_url)
    try:
        user_id = await connection.fetchval(
            """
            INSERT INTO users(
              centre_id, role, nom, prenom, email, password_hash
            )
            VALUES(
              NULL, 'admin', $1, $2, $3::citext,
              crypt($4, gen_salt('bf'))
            )
            RETURNING id
            """,
            nom,
            prenom,
            email.lower(),
            password,
        )
    finally:
        await connection.close()
    print(f"Administrateur créé : {user_id}")


def main() -> None:
    args = arguments()
    password = getpass("Mot de passe (8 caractères minimum) : ")
    if len(password) < 8:
        raise SystemExit("Le mot de passe doit contenir au moins 8 caractères.")
    asyncio.run(
        create_admin(
            email=args.email,
            nom=args.nom,
            prenom=args.prenom,
            password=password,
        )
    )


if __name__ == "__main__":
    main()
