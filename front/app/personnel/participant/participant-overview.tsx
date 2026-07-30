'use client'

import Link from 'next/link'

type Notice = { id:number; title:string; text:string; time:string; read:boolean; tone:string }

export default function ParticipantOverview({ onCourse, onProgress, onNotice, notices }:{
  onCourse:()=>void
  onProgress:()=>void
  onNotice:(notice:Notice)=>void
  notices:Notice[]
}) {
  const bars=[
    {label:'S1',value:72},{label:'S2',value:80},{label:'S3',value:68},{label:'S4',value:84},
    {label:'S5',value:76},{label:'S6',value:88},{label:'S7',value:81},{label:'S8',value:74},
    {label:'S9',value:85},{label:'S10',value:79},{label:'S11',value:87},{label:'S12',value:82},
  ]
  return <div className="overview-pro">
    <header className="overview-pro-head">
      <div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Mon espace</span></div><h1>Bonjour, Yasmine</h1><p>Votre formation Anglais B2 · Groupe du matin</p></div>
      <span className="overview-status"><i/> Formation en cours</span>
    </header>

    <nav className="overview-tabs">
      <button className="active">Vue d’ensemble</button><button onClick={onCourse}>Mon agenda</button><button onClick={onProgress}>Ma progression</button><Link href="/personnel/participant/documents">Documents</Link><Link href="/personnel/participant/notifications">Activité</Link>
    </nav>

    <section className="overview-analytics">
      <div className="overview-rings">
        <button onClick={onProgress}><span className="overview-ring blue" style={{'--value':'87%' } as React.CSSProperties}><i><strong>87%</strong><small>Présence</small></i></span></button>
        <button onClick={onProgress}><span className="overview-ring gold" style={{'--value':'68%' } as React.CSSProperties}><i><strong>68%</strong><small>Programme</small></i></span></button>
        <Link href="/personnel/participant/paiement"><span className="overview-ring green" style={{'--value':'92%' } as React.CSSProperties}><i><strong>450</strong><small>DH à venir</small></i></span></Link>
      </div>
      <div className="overview-chart">
        <div className="overview-chart-head"><div><span>ASSIDUITÉ · 12 DERNIÈRES SÉANCES</span><h2>Régularité de votre présence</h2><p>Chaque barre représente une séance récente.</p></div><strong>87% <small>taux global</small></strong></div>
        <div className="overview-bars">{bars.map((bar)=><span key={bar.label} title={`${bar.label} : ${bar.value}%`}><em>{bar.value}%</em><i className={bar.value>=80?'on-target':''} style={{height:`${bar.value}%`}}/><small>{bar.label}</small></span>)}</div>
      </div>
    </section>

    <section className="overview-main">
      <div className="overview-agenda">
        <div className="overview-section-title"><div><span>AGENDA</span><h2>Prochaines séances</h2></div><button onClick={onCourse}>Voir le programme →</button></div>
        <button className="overview-next" onClick={onCourse}>
          <time><strong>27</strong><small>JAN</small></time><span><small>LUNDI · 10:00 — 12:00</small><strong>Present perfect & conversation</strong><em>Salle 1 · M. Karimi</em></span><i>→</i>
        </button>
        {[['29','Compréhension orale','10:00 — 12:00'],['31','Expression écrite','09:00 — 11:00']].map(row=><button className="overview-agenda-row" key={row[0]} onClick={onCourse}><time>{row[0]} JAN</time><strong>{row[1]}</strong><span>{row[2]}</span><i>›</i></button>)}
      </div>

      <aside className="overview-activity">
        <div className="overview-section-title"><div><span>ACTIVITÉ</span><h2>À ne pas manquer</h2></div><Link href="/personnel/participant/notifications">Tout voir</Link></div>
        {notices.map((notice,index)=><button key={notice.id} onClick={()=>onNotice(notice)}><i className={`notice-dot n${index}`}/><span><small>{notice.time}</small><strong>{notice.title}</strong><p>{notice.text}</p></span><em>›</em></button>)}
      </aside>
    </section>

    <footer className="overview-footer">
      <div className="overview-footer-title"><span>ACCÈS RAPIDES</span><h2>Que souhaitez-vous faire ?</h2></div>
      <div className="overview-footer-links">
        <Link href="/personnel/participant/ressources"><span className="quick-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/><path d="M4 6.5v13"/></svg></span><span><strong>Continuer le cours</strong><small>Reprendre vos ressources B2</small></span><i>→</i></Link>
        <Link href="/personnel/participant/paiement"><span className="quick-icon gold"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14"/><path d="M2 10h20"/></svg></span><span><strong>Gérer mes paiements</strong><small>Échéances, historique et reçus</small></span><i>→</i></Link>
        <Link href="/personnel/participant/documents"><span className="quick-icon green"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6v20h12V6z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg></span><span><strong>Mes documents</strong><small>Consulter et télécharger</small></span><i>→</i></Link>
      </div>
    </footer>
  </div>
}
