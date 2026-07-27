'use client'
import { useMemo, useState } from 'react'

const ITEMS = [
  { id:1,name:'Attestation_Formation_B1.pdf',type:'Attestation',date:'30 juin 2025',size:'280 Ko' },
  { id:2,name:'Certificat_Presence_Juin.pdf',type:'Certificat',date:'30 juin 2025',size:'190 Ko' },
  { id:3,name:'Recu_Paiement_Juin.pdf',type:'Reçu',date:'20 juin 2025',size:'95 Ko' },
  { id:4,name:'Recu_Paiement_Mai.pdf',type:'Reçu',date:'18 mai 2025',size:'95 Ko' },
  { id:5,name:'Contrat_Formation_2025.pdf',type:'Contrat',date:'01 janv. 2025',size:'340 Ko' },
  { id:6,name:'Fiche_Inscription_Benali.pdf',type:'Autre',date:'01 janv. 2025',size:'210 Ko' },
  { id:7,name:'Programme Anglais B2.pdf',type:'Programme',date:'20 déc. 2024',size:'1,2 Mo' },
  { id:8,name:'Règlement intérieur.pdf',type:'Autre',date:'18 déc. 2024',size:'620 Ko' },
]

export default function DocumentsPage(){
 const [query,setQuery]=useState(''); const [filter,setFilter]=useState('Tous'); const [view,setView]=useState<'grid'|'list'>('grid'); const [page,setPage]=useState(1); const [preview,setPreview]=useState<typeof ITEMS[0]|null>(null); const perPage=6
 const filtered=useMemo(()=>ITEMS.filter(x=>(filter==='Tous'||x.type===filter)&&`${x.name} ${x.type}`.toLowerCase().includes(query.toLowerCase())),[query,filter])
 const pages=Math.max(1,Math.ceil(filtered.length/perPage)); const visible=filtered.slice((page-1)*perPage,page*perPage)
 const download=(item:typeof ITEMS[0])=>{const url=URL.createObjectURL(new Blob([`EDUOS MAROC\n${item.name}\n${item.type}\n${item.date}`],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download=item.name;a.click();URL.revokeObjectURL(url)}
 return <div className="library-page">
  <header className="library-header"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Documents</span></div><h1>Mes documents</h1><p>Votre bibliothèque administrative personnelle.</p></div><span>{ITEMS.length} fichiers</span></header>
  <div className="library-toolbar"><label><span>⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Rechercher un document..." /></label><select value={filter} onChange={e=>{setFilter(e.target.value);setPage(1)}}><option>Tous</option><option>Attestation</option><option>Certificat</option><option>Reçu</option><option>Contrat</option><option>Programme</option><option>Autre</option></select><div className="library-view"><button className={view==='grid'?'active':''} onClick={()=>setView('grid')} aria-label="Grille"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button><button className={view==='list'?'active':''} onClick={()=>setView('list')} aria-label="Liste"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg></button></div></div>
  <div className={`library-items document-items ${view}`}>{visible.map(item=><article key={item.id}>
    <div className="document-card-top"><span className={`library-icon tone-${item.type.toLowerCase()}`}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg></span><span className={`document-badge tone-${item.type.toLowerCase()}`}>{item.type}</span></div>
    <div className="document-card-copy"><h2>{item.name}</h2><p>{item.type}{item.type==='Certificat'?' de présence':item.type==='Reçu'?' de paiement':item.type==='Contrat'?" d’engagement":''} · {item.date} · {item.size}</p></div>
    <div className="library-actions"><button onClick={()=>setPreview(item)}>Aperçu</button><button onClick={()=>download(item)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>Télécharger</button></div>
  </article>)}{!visible.length&&<div className="library-empty">Aucun document trouvé.</div>}</div>
  <div className="library-pagination"><span>{filtered.length} résultat{filtered.length>1?'s':''}</span><div><button disabled={page===1} onClick={()=>setPage(page-1)}>←</button><span>{page} / {pages}</span><button disabled={page===pages} onClick={()=>setPage(page+1)}>→</button></div></div>
  {preview&&<div className="library-overlay" onMouseDown={e=>e.target===e.currentTarget&&setPreview(null)}><div className="library-preview"><header><span>APERÇU DU DOCUMENT</span><button onClick={()=>setPreview(null)}>×</button></header><div className="library-preview-paper"><strong>EDUOS</strong><span>DOCUMENT OFFICIEL</span><h2>{preview.name}</h2><p>{preview.type} délivré le {preview.date}</p><i>Document vérifié</i></div><button onClick={()=>download(preview)}>Télécharger le fichier</button></div></div>}
 </div>
}
