import { useState, useRef, useEffect } from "react";

// ─── DONNÉES INITIALES DOCUMENTS ─────────────────────────────────────────────
export const initialDocuments = [
  { id: 1, nom: "Plan d'installation BTS Adjamé.pdf", type: "pdf", categorie: "Plan technique", chantierId: 1, chantierNom: "Site BTS Adjamé Nord", version: "v1.2", taille: "2.4 MB", uploadePar: "Konan A.", dateUpload: "03/03/2025", description: "Plan d'installation complet avec côtes", tags: ["plan", "BTS", "Orange CI"] },
  { id: 2, nom: "PV de réception Bouaké.pdf", type: "pdf", categorie: "PV / Rapport", chantierId: 4, chantierNom: "Maintenance Tour Bouaké", version: "v1.0", taille: "1.1 MB", uploadePar: "Koffi F.", dateUpload: "26/01/2025", description: "Procès verbal de réception signé par le client", tags: ["PV", "Moov Africa", "terminé"] },
  { id: 3, nom: "Contrat Orange CI 2024-2025.pdf", type: "pdf", categorie: "Contrat", chantierId: null, chantierNom: null, version: "v1.0", taille: "3.8 MB", uploadePar: "Diallo K.", dateUpload: "15/01/2024", description: "Contrat cadre signé", tags: ["contrat", "Orange CI"] },
  { id: 4, nom: "Tracé fibre optique Zone Ind.dwg", type: "dwg", categorie: "Plan technique", chantierId: 2, chantierNom: "Fibre Optique Zone Industrielle", version: "v2.0", taille: "8.2 MB", uploadePar: "Konan A.", dateUpload: "28/02/2025", description: "Plan de tracé actualisé après études de sol", tags: ["plan", "fibre", "MTN CI"] },
  { id: 5, nom: "Procédure installation shelter.docx", type: "doc", categorie: "Procédure", chantierId: null, chantierNom: null, version: "v3.1", taille: "450 KB", uploadePar: "Diallo K.", dateUpload: "01/01/2025", description: "Procédure standard d'installation shelter", tags: ["procédure", "shelter"] },
  { id: 6, nom: "Rapport avancement Yopougon - Avril.xlsx", type: "xlsx", categorie: "Rapport", chantierId: 1, chantierNom: "Site BTS Adjamé Nord", version: "v1.0", taille: "280 KB", uploadePar: "Konan A.", dateUpload: "10/04/2025", description: "Rapport mensuel d'avancement", tags: ["rapport", "mensuel"] },
];

// ─── DONNÉES INITIALES MESSAGERIE ─────────────────────────────────────────────
export const initialConversations = [
  {
    id: 1, type: "projet", nom: "Site BTS Adjamé Nord", chantierId: 1, avatar: "📡",
    participants: ["Diallo K.", "Konan A.", "Traoré B."],
    messages: [
      { id: 1, auteur: "Konan A.", role: "chef", contenu: "Chantier: avancement 72%. Les équipements radio arrivent demain.", date: "10/04/2025 09:15", urgent: false, lu: true },
      { id: 2, auteur: "Traoré B.", role: "technicien", contenu: "Confirmé. J'ai fini le câblage antennes ce matin.", date: "10/04/2025 10:30", urgent: false, lu: true },
      { id: 3, auteur: "Diallo K.", role: "admin", contenu: "Bien. Orange CI a demandé un rapport avant vendredi.", date: "10/04/2025 11:00", urgent: false, lu: false },
    ]
  },
  {
    id: 2, type: "projet", nom: "Fibre Optique Zone Industrielle", chantierId: 2, avatar: "🔌",
    participants: ["Konan A.", "Bamba E."],
    messages: [
      { id: 1, auteur: "Bamba E.", role: "technicien", contenu: "⚠️ URGENT: Le gardien refuse notre accès. Il demande un bon de commande signé.", date: "15/04/2025 08:45", urgent: true, lu: false },
      { id: 2, auteur: "Konan A.", role: "chef", contenu: "Je contacte MTN CI maintenant. Attendez sur place.", date: "15/04/2025 09:00", urgent: false, lu: false },
    ]
  },
  {
    id: 3, type: "equipe", nom: "Équipe direction", avatar: "👔",
    participants: ["Diallo K.", "Konan A."],
    messages: [
      { id: 1, auteur: "Konan A.", role: "chef", contenu: "On a un problème d'accès sur Fibre Zone Ind. Besoin d'un BC signé rapidement.", date: "15/04/2025 09:05", urgent: true, lu: false },
    ]
  },
];

const docCss = `
  .doc-tab { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #4a6a4d; transition: all 0.2s; }
  .doc-tab.active { background: #1a3a2a; color: #4ade80; }
  .doc-tab:hover:not(.active) { color: #a0b8a2; }
  .doc-row { background: #0d1610; border: 1px solid #1e301f; border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 14px; }
  .doc-row:hover { border-color: #2d4d30; background: #111a13; }
  .conv-item { padding: 12px 16px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #1a2e1d; display: flex; align-items: center; gap: 12px; }
  .conv-item:hover { background: #0a1a0d; }
  .conv-item.active { background: #0d1f0d; border-left: 3px solid #4ade80; }
  .msg-bubble { max-width: 72%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; word-break: break-word; }
  .urgent-banner { background: #2a1a0a; border: 1px solid #5a3a1a; border-radius: 8px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #fb923c; font-weight: 600; margin-bottom: 6px; }
  .tag { background: #1a2a3a; color: "#60a5fa"; padding: 2px 8px; border-radius: 6px; font-size: 11px; color: #60a5fa; }
`;

function typeIcon(type) {
  return { pdf: "📄", doc: "📝", xlsx: "📊", dwg: "📐", img: "🖼️", zip: "📦" }[type] || "📎";
}
function typeBg(type) {
  return { pdf: "#2a1a1a", doc: "#1a2a3a", xlsx: "#1a3a2a", dwg: "#2a2a1a" }[type] || "#1a2a3a";
}

// ─── MODULE DOCUMENTS ─────────────────────────────────────────────────────────
export function Documents({ user, documents, setDocuments, chantiers }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tout");
  const [filterChantier, setFilterChantier] = useState("Tout");
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ nom: "", type: "pdf", categorie: "Plan technique", chantierId: "", description: "", tags: "", version: "v1.0" });
  const fileRef = useRef();

  const categories = ["Plan technique", "PV / Rapport", "Contrat", "Procédure", "Rapport", "Devis", "Facture", "Autre"];

  const filtered = documents.filter(d => {
    const matchSearch = !search || d.nom.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === "Tout" || d.categorie === filterCat;
    const matchChantier = filterChantier === "Tout" || (filterChantier === "Général" ? !d.chantierId : String(d.chantierId) === filterChantier);
    return matchSearch && matchCat && matchChantier;
  });

  function addDocument() {
    if (!uploadForm.nom) return;
    const chantier = chantiers?.find(c => c.id === parseInt(uploadForm.chantierId));
    setDocuments(prev => [...prev, {
      ...uploadForm, id: Date.now(),
      chantierId: uploadForm.chantierId ? parseInt(uploadForm.chantierId) : null,
      chantierNom: chantier?.nom || null,
      tags: uploadForm.tags ? uploadForm.tags.split(",").map(t => t.trim()) : [],
      uploadePar: user.nom,
      dateUpload: new Date().toLocaleDateString("fr-CI"),
      taille: "—",
    }]);
    setUploadForm({ nom: "", type: "pdf", categorie: "Plan technique", chantierId: "", description: "", tags: "", version: "v1.0" });
    setShowUpload(false);
  }

  return (
    <div>
      <style>{docCss}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Gestion documentaire</h2>
        <button className="add-btn" onClick={() => setShowUpload(true)}>+ Ajouter document</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total docs", value: documents.length, color: "#4ade80" },
          { label: "Plans techniques", value: documents.filter(d=>d.categorie==="Plan technique").length, color: "#60a5fa" },
          { label: "Rapports", value: documents.filter(d=>d.categorie==="Rapport"||d.categorie==="PV / Rapport").length, color: "#c084fc" },
          { label: "Contrats", value: documents.filter(d=>d.categorie==="Contrat").length, color: "#fb923c" },
        ].map((k, i) => (
          <div key={i} style={{ background: "#111a13", border: "1px solid #1e301f", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: "#4a6a4d", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="field" style={{ width: 220 }} placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="field" style={{ width: 160 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option>Tout</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="field" style={{ width: 200 }} value={filterChantier} onChange={e => setFilterChantier(e.target.value)}>
          <option>Tout</option>
          <option value="Général">Documents généraux</option>
          {(chantiers || []).map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
        </select>
      </div>

      {/* Liste documents */}
      {!selected ? (
        filtered.length === 0
          ? <div style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0", fontSize: 14 }}>Aucun document trouvé</div>
          : filtered.map(d => (
            <div key={d.id} className="doc-row" onClick={() => setSelected(d)}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: typeBg(d.type), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{typeIcon(d.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{d.nom}</span>
                  <span style={{ fontSize: 10, background: "#1a2a3a", color: "#60a5fa", padding: "2px 6px", borderRadius: 6 }}>{d.version}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4a6a4d" }}>{d.categorie} {d.chantierNom ? `· ${d.chantierNom}` : "· Document général"}</div>
                <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 2 }}>Uploadé par {d.uploadePar} · {d.dateUpload} · {d.taille}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {d.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "#1a2e1d", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 8, padding: "7px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>← Retour</button>
          <div style={{ background: "#111a13", border: "1px solid #1e301f", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: typeBg(selected.type), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{typeIcon(selected.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#d4e8d6", marginBottom: 6 }}>{selected.nom}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, background: "#1a2a3a", color: "#60a5fa", padding: "3px 10px", borderRadius: 10 }}>{selected.version}</span>
                  <span style={{ fontSize: 11, background: "#1a3a2a", color: "#4ade80", padding: "3px 10px", borderRadius: 10 }}>{selected.categorie}</span>
                </div>
              </div>
            </div>
            {[
              ["Chantier", selected.chantierNom || "Document général"],
              ["Uploadé par", selected.uploadePar],
              ["Date", selected.dateUpload],
              ["Taille", selected.taille],
              ["Description", selected.description],
            ].map(([k, v]) => v && (
              <div key={k} style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#3a5a3d", width: 100, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: 13, color: "#c8deca" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, marginBottom: 20 }}>
              {selected.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="add-btn">⬇️ Télécharger</button>
              {user.role === "admin" && <button className="del-btn" onClick={() => { setDocuments(prev => prev.filter(d => d.id !== selected.id)); setSelected(null); }}>Supprimer</button>}
            </div>
          </div>
        </div>
      )}

      {/* Modal upload */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Ajouter un document</h2>
              <button className="close-btn" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Nom du fichier *</label><input className="field" placeholder="Ex: Plan installation.pdf" value={uploadForm.nom} onChange={e=>setUploadForm(f=>({...f,nom:e.target.value}))} /></div>
              <div className="fg"><label className="label">Type</label><select className="field" value={uploadForm.type} onChange={e=>setUploadForm(f=>({...f,type:e.target.value}))}>{["pdf","doc","xlsx","dwg","img","zip"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label className="label">Catégorie</label><select className="field" value={uploadForm.categorie} onChange={e=>setUploadForm(f=>({...f,categorie:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label className="label">Version</label><input className="field" placeholder="v1.0" value={uploadForm.version} onChange={e=>setUploadForm(f=>({...f,version:e.target.value}))} /></div>
              <div className="fg"><label className="label">Chantier (optionnel)</label><select className="field" value={uploadForm.chantierId} onChange={e=>setUploadForm(f=>({...f,chantierId:e.target.value}))}><option value="">Document général</option>{(chantiers||[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Description</label><textarea className="field" style={{minHeight:60}} value={uploadForm.description} onChange={e=>setUploadForm(f=>({...f,description:e.target.value}))} /></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Tags (séparés par virgule)</label><input className="field" placeholder="Ex: plan, BTS, Orange CI" value={uploadForm.tags} onChange={e=>setUploadForm(f=>({...f,tags:e.target.value}))} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addDocument} disabled={!uploadForm.nom}>Ajouter</button><button className="close-btn" onClick={() => setShowUpload(false)}>Annuler</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODULE MESSAGERIE ────────────────────────────────────────────────────────
export function Messagerie({ user, conversations, setConversations, equipes, chantiers }) {
  const [activeConv, setActiveConv] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvForm, setNewConvForm] = useState({ type: "projet", nom: "", chantierId: "", participants: [] });
  const messagesEndRef = useRef();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv, conversations]);

  const mesConversations = conversations.filter(c =>
    c.participants.includes(user.nom) || user.role === "admin"
  );

  const totalNonLus = mesConversations.reduce((s, c) => s + c.messages.filter(m => !m.lu && m.auteur !== user.nom).length, 0);

  function sendMessage() {
    if (!newMsg.trim() || !activeConv) return;
    const msg = { id: Date.now(), auteur: user.nom, role: user.role, contenu: newMsg.trim(), date: new Date().toLocaleString("fr-CI", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }), urgent: isUrgent, lu: false };
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, messages: [...c.messages, msg] } : c));
    setActiveConv(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    setNewMsg("");
    setIsUrgent(false);
  }

  function envoyerWhatsApp(conv, msg) {
    const participant = equipes?.find(e => e.nom !== user.nom && conv.participants.includes(e.nom));
    if (participant?.tel) {
      const num = "225" + participant.tel.replace(/\s/g, "");
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(`[URGENT - DIGINETS] ${conv.nom}\n${msg}`)}`, "_blank");
    }
  }

  function markRead(convId) {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: c.messages.map(m => ({ ...m, lu: true })) } : c));
  }

  function createConversation() {
    if (!newConvForm.nom) return;
    const chantier = chantiers?.find(c => c.id === parseInt(newConvForm.chantierId));
    const newConv = { id: Date.now(), type: newConvForm.type, nom: newConvForm.nom, chantierId: newConvForm.chantierId ? parseInt(newConvForm.chantierId) : null, avatar: newConvForm.type === "projet" ? "📡" : "💬", participants: [...new Set([user.nom, ...newConvForm.participants])], messages: [] };
    setConversations(prev => [...prev, newConv]);
    setNewConvForm({ type: "projet", nom: "", chantierId: "", participants: [] });
    setShowNewConv(false);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 180px)", gap: 0, background: "#0a0f0d", borderRadius: 16, overflow: "hidden", border: "1px solid #1a2e1d" }}>
      <style>{docCss}</style>

      {/* Liste conversations */}
      <div style={{ width: 280, borderRight: "1px solid #1a2e1d", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #1a2e1d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>Messages</div>
            {totalNonLus > 0 && <div style={{ fontSize: 11, color: "#fb923c" }}>{totalNonLus} non lu(s)</div>}
          </div>
          <button onClick={() => setShowNewConv(true)} style={{ background: "#1a3a2a", border: "none", color: "#4ade80", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {mesConversations.map(conv => {
            const nonLus = conv.messages.filter(m => !m.lu && m.auteur !== user.nom).length;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const hasUrgent = conv.messages.some(m => m.urgent && !m.lu && m.auteur !== user.nom);
            return (
              <div key={conv.id} className={`conv-item ${activeConv?.id === conv.id ? "active" : ""}`} onClick={() => { setActiveConv(conv); markRead(conv.id); }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1a3a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{conv.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.nom}</span>
                    {nonLus > 0 && <span style={{ width: 18, height: 18, background: hasUrgent ? "#fb923c" : "#4ade80", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0a0f0d", flexShrink: 0 }}>{nonLus}</span>}
                  </div>
                  {lastMsg && <div style={{ fontSize: 11, color: "#3a5a3d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg.urgent ? "⚠️ " : ""}{lastMsg.auteur}: {lastMsg.contenu}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone chat */}
      {!activeConv ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 14, color: "#4a6a4d" }}>Sélectionnez une conversation</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header conv */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a2e1d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{activeConv.nom}</div>
              <div style={{ fontSize: 11, color: "#4a6a4d" }}>{activeConv.participants.join(", ")}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {activeConv.participants.some(p => p !== user.nom) && (
                <button onClick={() => { const lastUrgent = activeConv.messages.filter(m=>m.urgent).slice(-1)[0]; if(lastUrgent) envoyerWhatsApp(activeConv, lastUrgent.contenu); }} style={{ background: "#1a3a2a", border: "1px solid #2d5a30", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#4ade80", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  💬 WhatsApp urgent
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {activeConv.messages.length === 0 && (
              <div style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0", fontSize: 13 }}>Aucun message. Soyez le premier à écrire.</div>
            )}
            {activeConv.messages.map(m => {
              const isMine = m.auteur === user.nom;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {!isMine && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a3a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: m.role === "admin" ? "#c084fc" : m.role === "chef" ? "#60a5fa" : "#4ade80", flexShrink: 0 }}>{m.auteur.charAt(0)}</div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    {m.urgent && <div className="urgent-banner">⚠️ MESSAGE URGENT</div>}
                    {!isMine && <div style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}>{m.auteur}</div>}
                    <div className="msg-bubble" style={{ background: isMine ? "#1a3a2a" : "#111a13", border: isMine ? "none" : "1px solid #1e301f", borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", color: isMine ? "#d4f5d8" : "#c8deca" }}>
                      {m.contenu}
                    </div>
                    <div style={{ fontSize: 10, color: "#3a5a3d", marginTop: 4, textAlign: isMine ? "right" : "left" }}>{m.date}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input message */}
          <div style={{ padding: "14px 20px", borderTop: "1px solid #1a2e1d" }}>
            {isUrgent && (
              <div style={{ background: "#2a1a0a", border: "1px solid #5a3a1a", borderRadius: 8, padding: "6px 12px", marginBottom: 8, fontSize: 12, color: "#fb923c" }}>
                ⚠️ Message urgent - sera aussi envoyé sur WhatsApp
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button onClick={() => setIsUrgent(p => !p)} style={{ background: isUrgent ? "#3a2a1a" : "#1a2e1d", border: `1px solid ${isUrgent ? "#6a4a2a" : "#2d5a30"}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>⚠️</button>
              <textarea
                className="msg-input"
                style={{ borderRadius: 10, resize: "none", height: 44, padding: "11px 14px", fontFamily: "'DM Sans', sans-serif" }}
                placeholder="Écrire un message..."
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <button className="send-btn" onClick={sendMessage} disabled={!newMsg.trim()} style={{ flexShrink: 0, height: 44 }}>
                Envoyer
              </button>
              {isUrgent && activeConv.participants.some(p => p !== user.nom) && (
                <button onClick={() => { if(newMsg.trim()) { envoyerWhatsApp(activeConv, newMsg); sendMessage(); } }} style={{ background: "#1a3a2a", border: "1px solid #2d5a30", borderRadius: 10, padding: "0 14px", cursor: "pointer", color: "#4ade80", fontSize: 13, fontFamily: "'DM Sans', sans-serif", height: 44, flexShrink: 0 }}>
                  💬 WA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle conversation */}
      {showNewConv && (
        <div className="modal-overlay" onClick={() => setShowNewConv(false)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouvelle conversation</h2>
              <button className="close-btn" onClick={() => setShowNewConv(false)}>✕</button>
            </div>
            <div className="fg"><label className="label">Type</label><select className="field" value={newConvForm.type} onChange={e=>setNewConvForm(f=>({...f,type:e.target.value}))}><option value="projet">Projet / Chantier</option><option value="equipe">Équipe</option><option value="direct">Message direct</option></select></div>
            {newConvForm.type === "projet" && <div className="fg"><label className="label">Chantier</label><select className="field" value={newConvForm.chantierId} onChange={e=>{const c=chantiers?.find(x=>x.id===parseInt(e.target.value));setNewConvForm(f=>({...f,chantierId:e.target.value,nom:c?.nom||""}));}}><option value="">Sélectionner...</option>{(chantiers||[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>}
            <div className="fg"><label className="label">Nom de la conversation</label><input className="field" placeholder="Ex: Réunion de chantier" value={newConvForm.nom} onChange={e=>setNewConvForm(f=>({...f,nom:e.target.value}))} /></div>
            <div className="fg">
              <label className="label">Participants</label>
              {(equipes||[]).map(e => (
                <div key={e.id} onClick={() => setNewConvForm(f => ({ ...f, participants: f.participants.includes(e.nom) ? f.participants.filter(p=>p!==e.nom) : [...f.participants, e.nom] }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: newConvForm.participants.includes(e.nom) ? "#1a3a2a" : "#0d1610", borderRadius: 8, marginBottom: 4, cursor: "pointer", border: `1px solid ${newConvForm.participants.includes(e.nom) ? "#2d5a30" : "#1a2e1d"}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${newConvForm.participants.includes(e.nom) ? "#4ade80" : "#2d5a30"}`, background: newConvForm.participants.includes(e.nom) ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {newConvForm.participants.includes(e.nom) && <span style={{ color: "#0a0f0d", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: "#d4e8d6" }}>{e.nom}</span>
                  <span style={{ fontSize: 11, color: "#4a6a4d" }}>{e.poste}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={createConversation} disabled={!newConvForm.nom}>Créer</button><button className="close-btn" onClick={() => setShowNewConv(false)}>Annuler</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
