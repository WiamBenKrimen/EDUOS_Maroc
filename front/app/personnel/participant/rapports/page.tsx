'use client'

import { useState } from 'react'

const REPORTS=[
 {id:1,month:'Juin',year:'2025',score:78,delta:'+4 pts',attendance:'10/12',rate:83,comment:"Yasmine progresse très bien. Sa compréhension orale s’améliore sensiblement. Il est conseillé de travailler davantage l’expression écrite pour atteindre le niveau B2 cible.",skills:[['Compréhension orale',82],['Expression écrite',65],['Vocabulaire',79],['Grammaire',74]]},
 {id:2,month:'Mai',year:'2025',score:74,delta:'+2 pts',attendance:'11/12',rate:92,comment:"Une progression régulière et une excellente participation. Les efforts en vocabulaire commencent à porter leurs fruits.",skills:[['Compréhension orale',76],['Expression écrite',63],['Vocabulaire',75],['Grammaire',72]]},
 {id:3,month:'Avril',year:'2025',score:72,delta:'+5 pts',attendance:'10/12',rate:83,comment:"Les bases sont solides. Il faut poursuivre les exercices d’expression écrite et maintenir la régularité.",skills:[['Compréhension orale',71],['Expression écrite',60],['Vocabulaire',73],['Grammaire',70]]},
]

export default function RapportsPage(){
 const[selected,setSelected]=useState(REPORTS[0]);const[toast,setToast]=useState('')
 const download=(all=false)=>{const data=all?REPORTS.map(r=>`${r.month} ${r.year}: ${r.score}/100`).join('\n'):`Rapport ${selected.month} ${selected.year}\nScore: ${selected.score}/100\nAssiduité: ${selected.rate}%\n\n${selected.comment}`;const url=URL.createObjectURL(new Blob([`EDUOS MAROC — RAPPORT DE SUIVI\n\n${data}`],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=all?'Rapports_EDUOS.txt':`Rapport_${selected.month}_${selected.year}.txt`;a.click();URL.revokeObjectURL(url);setToast('Votre rapport a été exporté.');window.setTimeout(()=>setToast(''),2500)}
 return <div className="reports-v2">
  {toast&&<div className="part-toast"><span>✓</span>{toast}</div>}
  <header className="reports-v2-head"><div><div className="page-breadcrumb"><span>EDUOS</span><span>›</span><span>Rapports</span></div><h1>Rapports de suivi</h1><p>Évaluations pédagogiques · Anglais B2 · Formateur K. Alaoui</p></div><button onClick={()=>download(true)}>↓ Exporter tous les rapports</button></header>

  <section className="reports-v2-summary">
   <div className="reports-v2-score"><span>MOYENNE GÉNÉRALE</span><strong>76<small>/100</small></strong><em>+4 points depuis avril</em></div>
   <div className="reports-v2-summary-line"><span>ASSIDUITÉ GLOBALE</span><strong>88%</strong><i><span style={{width:'88%'}}/></i><small>21 présences sur 24 séances</small></div>
   <div className="reports-v2-summary-line"><span>OBJECTIF DU TRIMESTRE</span><strong>80/100</strong><i><span style={{width:'95%'}}/></i><small>Encore 4 points pour atteindre l’objectif</small></div>
  </section>

  <div className="reports-v2-workspace">
   <aside className="reports-v2-periods"><span>PÉRIODES DISPONIBLES</span>{REPORTS.map(report=><button key={report.id} className={selected.id===report.id?'active':''} onClick={()=>setSelected(report)}><time><strong>{report.month}</strong><small>{report.year}</small></time><span><strong>{report.score}/100</strong><small>{report.delta} vs mois précédent</small></span><i>›</i></button>)}</aside>
   <main className="reports-v2-reader">
    <header><div><span>RAPPORT MENSUEL</span><h2>{selected.month} {selected.year}</h2><p>Délivré par K. Alaoui · {selected.attendance} présences</p></div><div className="reports-v2-mark"><strong>{selected.score}</strong><small>/100</small></div></header>
    <div className="reports-v2-body">
     <section className="reports-v2-skills"><div className="reports-v2-title"><span>COMPÉTENCES</span><h3>Niveau par domaine</h3></div>{selected.skills.map(([label,value])=><div className="reports-v2-skill" key={label}><span><strong>{label}</strong><em>{value}%</em></span><i><span style={{width:`${value}%`}}/></i></div>)}</section>
     <aside className="reports-v2-insight"><span>ASSIDUITÉ DU MOIS</span><strong>{selected.rate}%</strong><small>{selected.attendance} séances suivies</small><i><span style={{width:`${selected.rate}%`}}/></i></aside>
    </div>
    <blockquote><span>APPRÉCIATION DU FORMATEUR</span><p>“{selected.comment}”</p></blockquote>
    <footer><span>Rapport vérifié · EDUOS Maroc</span><button onClick={()=>download()}>Télécharger ce rapport →</button></footer>
   </main>
  </div>
 </div>
}
