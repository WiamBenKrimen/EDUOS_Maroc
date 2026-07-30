from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field

from app.core.security import directeur_required

router = APIRouter(prefix="/director", tags=["Direction"])
Director = Annotated[asyncpg.Record, Depends(directeur_required)]


def rows(items: list[asyncpg.Record]) -> list[dict]:
    return [dict(item) for item in items]


class PersonnelInput(BaseModel):
    nom: str = Field(min_length=2, max_length=80)
    prenom: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    fonction: Literal["coordinateur", "commercial", "formateur", "enseignant"]
    telephone: str | None = Field(default=None, max_length=30)


class ProspectInput(BaseModel):
    nom_complet: str = Field(min_length=2, max_length=160)
    email: EmailStr | None = None
    telephone: str | None = Field(default=None, max_length=30)
    formation_souhaitee: str | None = Field(default=None, max_length=160)
    source: str | None = Field(default=None, max_length=80)
    notes: str | None = None


class FormationInput(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    titre: str = Field(min_length=2, max_length=180)
    categorie: str | None = None
    niveau: str | None = None
    duree_heures: int = Field(ge=0, default=0)
    prix_mensuel: Decimal = Field(ge=0)
    frais_inscription: Decimal = Field(ge=0, default=0)


class CohorteInput(BaseModel):
    formation_id: UUID
    intervenant_id: UUID | None = None
    code: str = Field(min_length=2, max_length=50)
    nom: str = Field(min_length=2, max_length=160)
    date_debut: date
    date_fin: date
    capacite: int = Field(gt=0)
    salle: str | None = None
    jours_semaine: list[int] = []
    heure_debut: str | None = None
    heure_fin: str | None = None


class SeanceInput(BaseModel):
    cohorte_id: UUID
    intervenant_id: UUID | None = None
    personnel_id: UUID | None = None
    titre: str = Field(min_length=2, max_length=180)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    salle: str | None = None


class PaymentInput(BaseModel):
    facture_id: UUID
    reference: str = Field(min_length=2, max_length=60)
    montant: Decimal = Field(gt=0)
    methode: Literal["carte", "virement", "especes", "cheque", "tpe"]
    transaction_ref: str | None = None
    paid_at: datetime | None = None


class EnrollmentInput(BaseModel):
    prenom: str = Field(min_length=2, max_length=80)
    nom: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    telephone: str | None = Field(default=None, max_length=30)
    date_naissance: date | None = None
    ville: str | None = Field(default=None, max_length=80)
    adresse: str | None = None
    cohorte_id: UUID
    plan: Literal["mensuel", "trimestriel", "annuel"] = "mensuel"


@router.get("/dashboard")
async def dashboard(request: Request, user: Director):
    centre = user["centre_id"]
    data = await request.app.state.pool.fetchrow("""
      SELECT
        (SELECT count(*) FROM inscriptions i JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 AND i.statut='confirmee') AS active_students,
        (SELECT coalesce(round(100.0*count(*) FILTER (WHERE p.statut='present')/nullif(count(*),0),0),0) FROM presences p JOIN seances s ON s.id=p.seance_id JOIN cohortes c ON c.id=s.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1) AS attendance_rate,
        (SELECT coalesce(sum(p.montant),0) FROM paiements p JOIN factures fa ON fa.id=p.facture_id JOIN inscriptions i ON i.id=fa.inscription_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 AND p.statut='paye') AS collected_revenue,
        (SELECT count(*) FROM factures fa JOIN inscriptions i ON i.id=fa.inscription_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 AND fa.statut IN ('en_retard','en_attente')) AS invoices_to_follow
    """, centre)
    sessions = await request.app.state.pool.fetch("""
      SELECT s.id, s.titre, s.starts_at, s.ends_at, s.salle, c.nom AS cohorte, u.prenom || ' ' || u.nom AS intervenant
      FROM seances s JOIN cohortes c ON c.id=s.cohorte_id JOIN formations f ON f.id=c.formation_id
      LEFT JOIN intervenants i ON i.id=s.intervenant_id LEFT JOIN users u ON u.id=i.user_id
      WHERE f.centre_id=$1 AND s.starts_at >= now() AND s.statut='planifiee' ORDER BY s.starts_at LIMIT 8
    """, centre)
    return {"kpis": dict(data), "upcoming_sessions": rows(sessions)}


@router.get("/personnel")
async def list_personnel(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("SELECT id, nom, prenom, email, telephone, personnel_fonction, statut, created_at FROM users WHERE centre_id=$1 AND role='personnel' ORDER BY prenom, nom", user["centre_id"]))


@router.post("/personnel", status_code=status.HTTP_201_CREATED)
async def create_personnel(payload: PersonnelInput, request: Request, user: Director):
    return dict(await request.app.state.pool.fetchrow("""INSERT INTO users (centre_id,role,personnel_fonction,nom,prenom,email,telephone,password_hash,created_by)
      VALUES ($1,'personnel',$2,$3,$4,$5,$6,crypt($7,gen_salt('bf')),$8)
      RETURNING id,nom,prenom,email,telephone,personnel_fonction,statut,created_at""", user["centre_id"], payload.fonction, payload.nom, payload.prenom, str(payload.email), payload.telephone, payload.password, user["id"]))


@router.get("/prospects")
async def list_prospects(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("SELECT * FROM prospects WHERE centre_id=$1 ORDER BY created_at DESC", user["centre_id"]))


@router.post("/prospects", status_code=status.HTTP_201_CREATED)
async def create_prospect(payload: ProspectInput, request: Request, user: Director):
    return dict(await request.app.state.pool.fetchrow("""INSERT INTO prospects(centre_id,nom_complet,email,telephone,formation_souhaitee,source,notes)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *""", user["centre_id"], payload.nom_complet, str(payload.email) if payload.email else None, payload.telephone, payload.formation_souhaitee, payload.source, payload.notes))


@router.patch("/prospects/{prospect_id}/status")
async def update_prospect_status(prospect_id: UUID, statut: Literal["nouveau", "en_cours", "inscrit", "perdu"], request: Request, user: Director):
    item = await request.app.state.pool.fetchrow("UPDATE prospects SET statut=$1, contacted_at=CASE WHEN $1='en_cours' THEN now() ELSE contacted_at END WHERE id=$2 AND centre_id=$3 RETURNING *", statut, prospect_id, user["centre_id"])
    if not item: raise HTTPException(404, "Prospect introuvable.")
    return dict(item)


@router.get("/formations")
async def list_formations(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("SELECT * FROM formations WHERE centre_id=$1 ORDER BY titre", user["centre_id"]))


@router.post("/formations", status_code=status.HTTP_201_CREATED)
async def create_formation(payload: FormationInput, request: Request, user: Director):
    return dict(await request.app.state.pool.fetchrow("""INSERT INTO formations(centre_id,code,titre,categorie,niveau,duree_heures,prix_mensuel,frais_inscription)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *""", user["centre_id"], payload.code, payload.titre, payload.categorie, payload.niveau, payload.duree_heures, payload.prix_mensuel, payload.frais_inscription))


@router.get("/cohortes")
async def list_cohortes(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("""SELECT c.*, f.titre AS formation_titre, count(i.id)::int AS inscrits
      FROM cohortes c JOIN formations f ON f.id=c.formation_id LEFT JOIN inscriptions i ON i.cohorte_id=c.id AND i.statut='confirmee'
      WHERE f.centre_id=$1 GROUP BY c.id,f.titre ORDER BY c.date_debut DESC""", user["centre_id"]))


@router.post("/cohortes", status_code=status.HTTP_201_CREATED)
async def create_cohorte(payload: CohorteInput, request: Request, user: Director):
    item = await request.app.state.pool.fetchrow("""INSERT INTO cohortes(formation_id,intervenant_id,code,nom,date_debut,date_fin,capacite,salle,jours_semaine,heure_debut,heure_fin)
      SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::time,$11::time WHERE EXISTS(SELECT 1 FROM formations WHERE id=$1 AND centre_id=$12) RETURNING *""", payload.formation_id,payload.intervenant_id,payload.code,payload.nom,payload.date_debut,payload.date_fin,payload.capacite,payload.salle,payload.jours_semaine,payload.heure_debut,payload.heure_fin,user["centre_id"])
    if not item: raise HTTPException(404, "Formation introuvable.")
    return dict(item)


@router.get("/planning")
async def planning(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("SELECT s.*, c.nom AS cohorte_nom, f.titre AS formation FROM seances s JOIN cohortes c ON c.id=s.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 ORDER BY s.starts_at", user["centre_id"]))


@router.post("/planning", status_code=status.HTTP_201_CREATED)
async def create_seance(payload: SeanceInput, request: Request, user: Director):
    item = await request.app.state.pool.fetchrow("""INSERT INTO seances(cohorte_id,intervenant_id,personnel_id,titre,description,starts_at,ends_at,salle)
      SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE EXISTS(SELECT 1 FROM cohortes c JOIN formations f ON f.id=c.formation_id WHERE c.id=$1 AND f.centre_id=$9) RETURNING *""", payload.cohorte_id,payload.intervenant_id,payload.personnel_id,payload.titre,payload.description,payload.starts_at,payload.ends_at,payload.salle,user["centre_id"])
    if not item: raise HTTPException(404, "Cohorte introuvable.")
    return dict(item)


@router.get("/enrollment-options")
async def enrollment_options(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("""SELECT c.id, c.nom, c.capacite, c.date_debut, c.date_fin, c.heure_debut, c.heure_fin,
      f.titre AS formation, f.prix_mensuel, u.prenom || ' ' || u.nom AS formateur, count(i.id)::int AS inscrits
      FROM cohortes c JOIN formations f ON f.id=c.formation_id
      LEFT JOIN intervenants iv ON iv.id=c.intervenant_id LEFT JOIN users u ON u.id=iv.user_id
      LEFT JOIN inscriptions i ON i.cohorte_id=c.id AND i.statut='confirmee'
      WHERE f.centre_id=$1 AND c.statut='actif' GROUP BY c.id,f.titre,f.prix_mensuel,u.prenom,u.nom ORDER BY c.date_debut""", user["centre_id"]))


@router.post("/enrollments", status_code=status.HTTP_201_CREATED)
async def create_enrollment(payload: EnrollmentInput, request: Request, user: Director):
    pool = request.app.state.pool
    async with pool.acquire() as connection:
        async with connection.transaction():
            cohort = await connection.fetchrow("""SELECT c.id, c.date_debut, c.date_fin, c.capacite, f.prix_mensuel
              FROM cohortes c JOIN formations f ON f.id=c.formation_id WHERE c.id=$1 AND f.centre_id=$2 AND c.statut='actif'""", payload.cohorte_id, user["centre_id"])
            if not cohort:
                raise HTTPException(404, "Cohorte introuvable.")
            count = await connection.fetchval("SELECT count(*) FROM inscriptions WHERE cohorte_id=$1 AND statut='confirmee'", payload.cohorte_id)
            if count >= cohort["capacite"]:
                raise HTTPException(409, "Cette cohorte est complète.")
            account = await connection.fetchrow("""INSERT INTO users(centre_id,role,nom,prenom,email,telephone,password_hash,created_by)
              VALUES($1,'participant',$2,$3,$4,$5,crypt($6,gen_salt('bf')),$7) RETURNING id,email,nom,prenom""", user["centre_id"], payload.nom, payload.prenom, str(payload.email).lower(), payload.telephone, payload.password, user["id"])
            participant = await connection.fetchrow("""INSERT INTO participants(user_id,matricule,date_naissance,adresse,ville)
              VALUES($1,'P-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),$2,$3,$4) RETURNING id,matricule""", account["id"], payload.date_naissance, payload.adresse, payload.ville)
            enrollment = await connection.fetchrow("""INSERT INTO inscriptions(participant_id,cohorte_id,reference,date_debut,date_fin_prevue,montant_mensuel,created_by)
              VALUES($1,$2,'INS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),$3,$4,$5,$6) RETURNING id,reference""", participant["id"], payload.cohorte_id, cohort["date_debut"], cohort["date_fin"], cohort["prix_mensuel"], user["id"])
            await connection.execute("""INSERT INTO documents(centre_id,participant_id,inscription_id,type,nom,storage_key,mime_type,genere_automatiquement,uploaded_by)
              VALUES($1,$2,$3::uuid,'contrat',$4,'generated/contracts/' || $3::text || '.pdf','application/pdf',true,$5)""", user["centre_id"], participant["id"], enrollment["id"], f"Contrat - {payload.prenom} {payload.nom}", user["id"])
    return {"participant_id": str(participant["id"]), "matricule": participant["matricule"], "inscription_id": str(enrollment["id"]), "reference": enrollment["reference"], "email": account["email"]}


@router.get("/financial")
async def financial(request: Request, user: Director):
    centre=user["centre_id"]
    invoices=await request.app.state.pool.fetch("""SELECT fa.*, u.prenom || ' ' || u.nom AS participant FROM factures fa JOIN inscriptions i ON i.id=fa.inscription_id JOIN participants p ON p.id=i.participant_id JOIN users u ON u.id=p.user_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 ORDER BY fa.date_echeance DESC""",centre)
    payments=await request.app.state.pool.fetch("""SELECT pa.* FROM paiements pa JOIN factures fa ON fa.id=pa.facture_id JOIN inscriptions i ON i.id=fa.inscription_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 ORDER BY pa.created_at DESC""",centre)
    return {"invoices":rows(invoices),"payments":rows(payments)}


@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def create_payment(payload: PaymentInput, request: Request, user: Director):
    item=await request.app.state.pool.fetchrow("""INSERT INTO paiements(facture_id,reference,montant,methode,transaction_ref,paid_at,recorded_by)
      SELECT $1,$2,$3,$4,$5,coalesce($6,now()),$7 WHERE EXISTS(SELECT 1 FROM factures fa JOIN inscriptions i ON i.id=fa.inscription_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE fa.id=$1 AND f.centre_id=$8) RETURNING *""",payload.facture_id,payload.reference,payload.montant,payload.methode,payload.transaction_ref,payload.paid_at,user["id"],user["centre_id"])
    if not item: raise HTTPException(404,"Facture introuvable.")
    return dict(item)


@router.get("/renewals")
async def renewals(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("""SELECT r.*, u.prenom || ' ' || u.nom AS participant FROM renouvellements r JOIN inscriptions i ON i.id=r.inscription_id JOIN participants p ON p.id=i.participant_id JOIN users u ON u.id=p.user_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 ORDER BY r.date_expiration""",user["centre_id"]))


@router.get("/attestations")
async def attestations(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("SELECT * FROM documents WHERE centre_id=$1 AND type IN ('attestation','certificat') ORDER BY created_at DESC",user["centre_id"]))


@router.get("/reports")
async def reports(request: Request, user: Director):
    return rows(await request.app.state.pool.fetch("""SELECT r.*, u.prenom || ' ' || u.nom AS participant FROM rapports_suivi r JOIN inscriptions i ON i.id=r.inscription_id JOIN participants p ON p.id=i.participant_id JOIN users u ON u.id=p.user_id JOIN cohortes c ON c.id=i.cohorte_id JOIN formations f ON f.id=c.formation_id WHERE f.centre_id=$1 ORDER BY r.periode DESC""",user["centre_id"]))
