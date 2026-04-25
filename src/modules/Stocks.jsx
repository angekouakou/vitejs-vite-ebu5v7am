import { useState } from "react";

// ─── DONNÉES INITIALES STOCKS ─────────────────────────────────────────────────
export const initialEquipements = [
  { id: 1, reference: "EQ-001", nom: "Analyseur de spectre RF", categorie: "Mesure", marque: "Rohde & Schwarz", modele: "FSH4", quantiteTotal: 2, quantiteDisponible: 1, etat: "Bon", valeur: 4500000, notes: "" },
  { id: 2, reference: "EQ-002", nom: "Câble coaxial RG-214 (50m)", categorie: "Câblage", marque: "Belden", modele: "RG214", quantiteTotal: 20, quantiteDisponible: 8, etat: "Bon", valeur: 85000, notes: "Bobines de 50m" },
  { id: 3, reference: "EQ-003", nom: "Antenne directionnelle 18dBi", categorie: "Antenne", marque: "Kathrein", modele: "K739056", quantiteTotal: 5, quantiteDisponible: 3, etat: "Bon", valeur: 750000, notes: "" },
  { id: 4, reference: "EQ-004", nom: "Groupe électrogène 10KVA", categorie: "Energie", marque: "Perkins", modele: "P44-2S", quantiteTotal: 1, quantiteDisponible: 0, etat: "En maintenance", valeur: 8500000, notes: "Maintenance programmée" },
  { id: 5, reference: "EQ-005", nom: "Harnais de sécurité", categorie: "Sécurité", marque: "Petzl", modele: "NEWTON", quantiteTotal: 6, quantiteDisponible: 2, etat: "Bon", valeur: 185000, notes: "" },
  { id: 6, reference: "EQ-006", nom: "Réflectomètre OTDR", categorie: "Mesure", marque: "EXFO", modele: "FTB-200", quantiteTotal: 1, quantiteDisponible: 1, etat: "Bon", valeur: 6200000, notes: "" },
  { id: 7, reference: "EQ-007", nom: "Connecteurs N mâle (lot 50)", categorie: "Consommable", marque: "Amphenol", modele: "82-67", quantiteTotal: 150, quantiteDisponible: 23, etat: "Bon", valeur: 8500, notes: "Stock faible - commander" },
  { id: 8, reference: "EQ-008", nom: "Shelter télécom 10m²", categorie: "Infrastructure", marque: "Eltek", modele: "SH-10", quantiteTotal: 2, quantiteDisponible: 1, etat: "Bon", valeur: 12000000, notes: "" },
];

export const initialAttributions = [
  { id: 1, equipementId: 1, equipementNom: "Analyseur de spectre RF", quantite: 1, technicien: "Koffi F.", chantierId: 3, chantierNom: "Installation Shelter Daloa", dateAttribution: "01/03/2025", dateRetourPrevue: "20/04/2025", dateRetour: null, etatDepart: "Bon", etatRetour: null, notes: "" },
  { id: 2, equipementId: 2, equipementNom: "Câble coaxial RG-214 (50m)", quantite: 6, technicien: "Traoré B.", chantierId: 1, chantierNom: "Site BTS Adjamé Nord", dateAttribution: "02/03/2025", dateRetourPrevue: "30/04/2025", dateRetour: null, etatDepart: "Bon", etatRetour: null, notes: "" },
  { id: 3, equipementId: 3, equipementNom: "Antenne directionnelle 18dBi", quantite: 2, technicien: "Traoré B.", chantierId: 1, chantierNom: "Site BTS Adjamé Nord", dateAttribution: "02/03/2025", dateRetourPrevue: "30/04/2025", dateRetour: null, etatDepart: "Bon", etatRetour: null, notes: "" },
  { id: 4, equipementId: 5, equipementNom: "Harnais de sécurité", quantite: 2, technicien: "Bamba E.", chantierId: 2, chantierNom: "Fibre Optique Zone Industrielle", dateAttribution: "01/03/2025", dateRetourPrevue: "30/06/2025", dateRetour: null, etatDepart: "Bon", etatRetour: null, notes: "" },
  { id: 5, equipementId: 5, equipementNom: "Harnais de sécurité", quantite: 2, technicien: "Koffi F.", chantierId: 3, chantierNom: "Installation Shelter Daloa", dateAttribution: "01/03/2025", dateRetourPrevue: "20/04/2025", dateRetour: "15/04/2025", etatDepart: "Bon", etatRetour: "Bon", notes: "" },
];

const categories = ["Mesure", "Câblage", "Antenne", "Energie", "Sécurité", "Infrastructure", "Consommable", "Outillage", "Informatique", "Autre"];
const etats = ["Bon", "Usagé", "En maintenance", "Hors service"];

function formatFCFA(n) { return new Intl.NumberFormat("fr-CI").format(Math.round(n)) + " FCFA"; }
function today() { return new Date().toLocaleDateString("fr-CI", { day: "2-digit", month: "2-digit", year: "numeric" }); }

const stockCss = `
  .stock-tab { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #4a6a4d; transition: all 0.2s; }
  .stock-tab.active { background: #1a3a2a; color: #4ade80; }
  .stock-tab:hover:not(.active) { color: #a0b8a2; }
  .eq-card { background: #0d1610; border: 1px solid #1e301f; border-radius: 12px; padding: 14px 18px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
  .eq-card:hover { border-color: #2d4d30; background: #111a13; }
  .attr-row { background: #0d1610; border: 1px solid #1e301f; border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; }
  .stock-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; }
  .rupture-alert { background: #2a1a1a; border: 1px solid #5a2a2a; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
`;

export default function Stocks({ user, equipements, setEquipements, attributions, setAttributions, chantiers, equipes }) {
  const [activeTab, setActiveTab] = useState("inventaire");
  const [selected, setSelected] = useState(null);
  const [showAddEq, setShowAddEq] = useState(false);
  const [showAttribuer, setShowAttribuer] = useState(null);
  const [showRestituer, setShowRestituer] = useState(null);
  const [filterCat, setFilterCat] = useState("Tout");
  const [search, setSearch] = useState("");

  const emptyEq = { reference: "", nom: "", categorie: "Mesure", marque: "", modele: "", quantiteTotal: 1, quantiteDisponible: 1, etat: "Bon", valeur: "", notes: "" };
  const emptyAttr = { equipementId: equipements[0]?.id || 1, quantite: 1, technicien: equipes?.[0]?.nom || "", chantierId: chantiers?.[0]?.id || 1, dateRetourPrevue: "", etatDepart: "Bon", notes: "" };
  const emptyRest = { etatRetour: "Bon", notes: "" };

  const [eqForm, setEqForm] = useState(emptyEq);
  const [attrForm, setAttrForm] = useState(emptyAttr);
  const [restForm, setRestForm] = useState(emptyRest);

  // Alertes rupture (stock < 20% ou consommable < 30 unités)
  const alertes = equipements.filter(e => {
    if (e.categorie === "Consommable") return e.quantiteDisponible < 30;
    return e.quantiteDisponible === 0;
  });

  // Stats
  const valeurTotale = equipements.reduce((s, e) => s + e.valeur * e.quantiteTotal, 0);
  const valeurDeployee = attributions.filter(a => !a.dateRetour).reduce((s, a) => {
    const eq = equipements.find(e => e.id === a.equipementId);
    return s + (eq?.valeur || 0) * a.quantite;
  }, 0);

  const canEdit = user.role === "admin" || user.role === "chef";

  function addEquipement() {
    if (!eqForm.nom) return;
    setEquipements(prev => [...prev, { ...eqForm, id: Date.now(), quantiteTotal: parseInt(eqForm.quantiteTotal) || 1, quantiteDisponible: parseInt(eqForm.quantiteDisponible || eqForm.quantiteTotal) || 1, valeur: parseInt(eqForm.valeur) || 0 }]);
    setEqForm(emptyEq);
    setShowAddEq(false);
  }

  function attribuer() {
    if (!attrForm.technicien || !attrForm.chantierId) return;
    const eq = equipements.find(e => e.id === parseInt(attrForm.equipementId));
    const qte = parseInt(attrForm.quantite) || 1;
    if (!eq || eq.quantiteDisponible < qte) return;
    const chantier = chantiers?.find(c => c.id === parseInt(attrForm.chantierId));
    const newAttr = { ...attrForm, id: Date.now(), equipementId: parseInt(attrForm.equipementId), equipementNom: eq.nom, chantierId: parseInt(attrForm.chantierId), chantierNom: chantier?.nom || "", quantite: qte, dateAttribution: today(), dateRetour: null, etatRetour: null };
    setAttributions(prev => [...prev, newAttr]);
    setEquipements(prev => prev.map(e => e.id === eq.id ? { ...e, quantiteDisponible: e.quantiteDisponible - qte } : e));
    setAttrForm(emptyAttr);
    setShowAttribuer(null);
  }

  function restituer() {
    if (!showRestituer) return;
    const attr = showRestituer;
    setAttributions(prev => prev.map(a => a.id === attr.id ? { ...a, dateRetour: today(), etatRetour: restForm.etatRetour, notes: restForm.notes } : a));
    setEquipements(prev => prev.map(e => e.id === attr.equipementId ? { ...e, quantiteDisponible: e.quantiteDisponible + attr.quantite } : e));
    setRestForm(emptyRest);
    setShowRestituer(null);
  }

  const filteredEq = equipements.filter(e => {
    const matchCat = filterCat === "Tout" || e.categorie === filterCat;
    const matchSearch = !search || e.nom.toLowerCase().includes(search.toLowerCase()) || e.reference.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const attributionsActives = attributions.filter(a => !a.dateRetour);
  const attributionsTerminees = attributions.filter(a => a.dateRetour);

  return (
    <div>
      <style>{stockCss}</style>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#0d1610", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[
          { id: "inventaire", label: "📦 Inventaire" },
          { id: "attributions", label: `🔧 En déploiement (${attributionsActives.length})` },
          { id: "historique", label: "📋 Historique" },
        ].map(t => <button key={t.id} className={`stock-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Équipements", value: equipements.length, sub: "références", color: "#4ade80" },
          { label: "Valeur stock", value: (valeurTotale / 1000000).toFixed(1) + "M", sub: "FCFA total", color: "#60a5fa" },
          { label: "En déploiement", value: attributionsActives.length, sub: "attributions actives", color: "#c084fc" },
          { label: "Alertes stock", value: alertes.length, sub: alertes.length > 0 ? "à réapprovisionner" : "aucune alerte", color: alertes.length > 0 ? "#f87171" : "#4ade80" },
        ].map((k, i) => (
          <div key={i} style={{ background: "#111a13", border: "1px solid #1e301f", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 10, color: "#4a6a4d", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: "'Space Grotesk', sans-serif" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* INVENTAIRE */}
      {activeTab === "inventaire" && (
        <div>
          {alertes.length > 0 && (
            <div className="rupture-alert">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 8 }}>⚠️ Alertes stock</div>
              {alertes.map(e => (
                <div key={e.id} style={{ fontSize: 13, color: "#fb923c", marginBottom: 4 }}>
                  {e.nom} · {e.quantiteDisponible} disponible(s) {e.quantiteDisponible === 0 ? "· RUPTURE" : "· stock faible"}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="field" style={{ width: 200 }} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="field" style={{ width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option>Tout</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {canEdit && <button className="add-btn" onClick={() => setShowAddEq(true)}>+ Ajouter équipement</button>}
          </div>

          {!selected ? (
            filteredEq.map(e => {
              const tauxDispo = Math.round((e.quantiteDisponible / e.quantiteTotal) * 100);
              const enAlerte = e.quantiteDisponible === 0 || (e.categorie === "Consommable" && e.quantiteDisponible < 30);
              return (
                <div key={e.id} className="eq-card" onClick={() => setSelected(e)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1a2a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {e.categorie === "Mesure" ? "📡" : e.categorie === "Câblage" ? "🔌" : e.categorie === "Antenne" ? "📶" : e.categorie === "Energie" ? "⚡" : e.categorie === "Sécurité" ? "🦺" : e.categorie === "Consommable" ? "📦" : "🔧"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{e.nom}</span>
                        <span style={{ fontSize: 11, background: "#1a2a3a", color: "#60a5fa", padding: "2px 8px", borderRadius: 8 }}>{e.categorie}</span>
                        {enAlerte && <span style={{ fontSize: 11, color: "#f87171" }}>⚠️ Stock faible</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#4a6a4d" }}>{e.reference} · {e.marque} {e.modele}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 120 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: e.quantiteDisponible === 0 ? "#f87171" : "#4ade80" }}>
                        {e.quantiteDisponible} / {e.quantiteTotal}
                      </div>
                      <div style={{ fontSize: 11, color: "#3a5a3d" }}>disponible(s)</div>
                      <div style={{ fontSize: 11, color: "#4a6a4d", marginTop: 2 }}>{formatFCFA(e.valeur)} / unité</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 4, background: "#1e301f", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${tauxDispo}%`, background: tauxDispo > 50 ? "#4ade80" : tauxDispo > 20 ? "#fbbf24" : "#f87171", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              <button onClick={() => setSelected(null)} style={{ background: "#1a2e1d", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 8, padding: "7px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>← Retour</button>
              <div style={{ background: "#111a13", border: "1px solid #1e301f", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#d4e8d6", marginBottom: 6 }}>{selected.nom}</div>
                    <div style={{ fontSize: 13, color: "#4a6a4d" }}>{selected.reference} · {selected.marque} {selected.modele}</div>
                  </div>
                  <span style={{ fontSize: 12, background: selected.etat === "Bon" ? "#1a3a2a" : "#3a2a1a", color: selected.etat === "Bon" ? "#4ade80" : "#fb923c", padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{selected.etat}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Stock total", value: selected.quantiteTotal, color: "#60a5fa" },
                    { label: "Disponible", value: selected.quantiteDisponible, color: selected.quantiteDisponible === 0 ? "#f87171" : "#4ade80" },
                    { label: "En déploiement", value: selected.quantiteTotal - selected.quantiteDisponible, color: "#c084fc" },
                  ].map((k, i) => (
                    <div key={i} style={{ background: "#0d1610", borderRadius: 10, padding: "12px 16px", border: "1px solid #1a2e1d", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 11, color: "#4a6a4d", marginTop: 4 }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[["Catégorie", selected.categorie], ["Valeur unitaire", formatFCFA(selected.valeur)], ["Valeur totale", formatFCFA(selected.valeur * selected.quantiteTotal)], ["Valeur déployée", formatFCFA(selected.valeur * (selected.quantiteTotal - selected.quantiteDisponible))]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0d1610", borderRadius: 10, border: "1px solid #1a2e1d" }}>
                      <span style={{ fontSize: 12, color: "#4a6a4d" }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#c8deca" }}>{v}</span>
                    </div>
                  ))}
                </div>

                {selected.notes && <div style={{ padding: 12, background: "#0d1610", borderRadius: 10, border: "1px solid #1a2e1d", fontSize: 13, color: "#fb923c", marginBottom: 20 }}>⚠️ {selected.notes}</div>}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#4a6a4d", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Attributions actives</div>
                  {attributionsActives.filter(a => a.equipementId === selected.id).length === 0
                    ? <div style={{ fontSize: 13, color: "#3a5a3d" }}>Aucune attribution active</div>
                    : attributionsActives.filter(a => a.equipementId === selected.id).map(a => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0d1610", borderRadius: 8, marginBottom: 4, border: "1px solid #1a2e1d" }}>
                        <div>
                          <div style={{ fontSize: 13, color: "#d4e8d6" }}>{a.technicien} · {a.chantierNom}</div>
                          <div style={{ fontSize: 11, color: "#4a6a4d" }}>Depuis {a.dateAttribution} · Retour prévu {a.dateRetourPrevue}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#c084fc" }}>×{a.quantite}</span>
                      </div>
                    ))}
                </div>

                {canEdit && selected.quantiteDisponible > 0 && (
                  <button className="add-btn" onClick={() => { setAttrForm({ ...emptyAttr, equipementId: selected.id }); setShowAttribuer(selected); }}>🔧 Attribuer</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTRIBUTIONS ACTIVES */}
      {activeTab === "attributions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Équipements déployés</h2>
            {canEdit && <button className="add-btn" onClick={() => { setAttrForm(emptyAttr); setShowAttribuer({}); }}>🔧 Nouvelle attribution</button>}
          </div>

          {attributionsActives.length === 0
            ? <div style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0", fontSize: 14 }}>Aucun équipement en déploiement</div>
            : attributionsActives.map(a => (
              <div key={a.id} className="attr-row">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{a.equipementNom}</span>
                      <span style={{ fontSize: 12, background: "#2a1a3a", color: "#c084fc", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>×{a.quantite}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a6a4d" }}>👤 {a.technicien} · 📍 {a.chantierNom}</div>
                    <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>Attribué le {a.dateAttribution} · Retour prévu : {a.dateRetourPrevue || "Non défini"}</div>
                  </div>
                  {canEdit && <button onClick={() => { setRestForm(emptyRest); setShowRestituer(a); }} style={{ background: "#1a2a3a", border: "1px solid #2d4d6a", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#60a5fa", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>✅ Restituer</button>}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* HISTORIQUE */}
      {activeTab === "historique" && (
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Historique des mouvements</h2>
          {attributions.map(a => (
            <div key={a.id} className="attr-row">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dateRetour ? "#4ade80" : "#c084fc", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 3 }}>{a.equipementNom} <span style={{ color: "#c084fc" }}>×{a.quantite}</span></div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>👤 {a.technicien} · 📍 {a.chantierNom}</div>
                  <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>
                    Sortie: {a.dateAttribution} · {a.dateRetour ? `Retour: ${a.dateRetour} · État: ${a.etatRetour}` : "En cours"}
                  </div>
                </div>
                <span style={{ fontSize: 11, background: a.dateRetour ? "#1a3a2a" : "#2a1a3a", color: a.dateRetour ? "#4ade80" : "#c084fc", padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>{a.dateRetour ? "Restitué" : "En déploiement"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}

      {/* Modal ajout équipement */}
      {showAddEq && (
        <div className="modal-overlay" onClick={() => setShowAddEq(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouvel équipement</h2>
              <button className="close-btn" onClick={() => setShowAddEq(false)}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Nom *</label><input className="field" value={eqForm.nom} onChange={e=>setEqForm(f=>({...f,nom:e.target.value}))} /></div>
              <div className="fg"><label className="label">Référence</label><input className="field" value={eqForm.reference} onChange={e=>setEqForm(f=>({...f,reference:e.target.value}))} /></div>
              <div className="fg"><label className="label">Catégorie</label><select className="field" value={eqForm.categorie} onChange={e=>setEqForm(f=>({...f,categorie:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fg"><label className="label">Marque</label><input className="field" value={eqForm.marque} onChange={e=>setEqForm(f=>({...f,marque:e.target.value}))} /></div>
              <div className="fg"><label className="label">Modèle</label><input className="field" value={eqForm.modele} onChange={e=>setEqForm(f=>({...f,modele:e.target.value}))} /></div>
              <div className="fg"><label className="label">Quantité totale</label><input type="number" className="field" value={eqForm.quantiteTotal} onChange={e=>setEqForm(f=>({...f,quantiteTotal:e.target.value,quantiteDisponible:e.target.value}))} /></div>
              <div className="fg"><label className="label">Valeur unitaire (FCFA)</label><input type="number" className="field" value={eqForm.valeur} onChange={e=>setEqForm(f=>({...f,valeur:e.target.value}))} /></div>
              <div className="fg"><label className="label">État</label><select className="field" value={eqForm.etat} onChange={e=>setEqForm(f=>({...f,etat:e.target.value}))}>{etats.map(et=><option key={et}>{et}</option>)}</select></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Notes</label><textarea className="field" style={{minHeight:60}} value={eqForm.notes} onChange={e=>setEqForm(f=>({...f,notes:e.target.value}))} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addEquipement} disabled={!eqForm.nom}>Ajouter</button><button className="close-btn" onClick={() => setShowAddEq(false)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal attribution */}
      {showAttribuer && (
        <div className="modal-overlay" onClick={() => setShowAttribuer(null)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>🔧 Attribuer équipement</h2>
              <button className="close-btn" onClick={() => setShowAttribuer(null)}>✕</button>
            </div>
            <div className="fg"><label className="label">Équipement *</label><select className="field" value={attrForm.equipementId} onChange={e=>setAttrForm(f=>({...f,equipementId:parseInt(e.target.value)}))}>
              {equipements.filter(e=>e.quantiteDisponible>0).map(e=><option key={e.id} value={e.id}>{e.nom} ({e.quantiteDisponible} dispo)</option>)}
            </select></div>
            <div className="fg"><label className="label">Quantité</label><input type="number" min="1" className="field" value={attrForm.quantite} onChange={e=>setAttrForm(f=>({...f,quantite:e.target.value}))} /></div>
            <div className="fg"><label className="label">Technicien *</label><select className="field" value={attrForm.technicien} onChange={e=>setAttrForm(f=>({...f,technicien:e.target.value}))}>
              {(equipes||[]).map(e=><option key={e.id}>{e.nom}</option>)}
            </select></div>
            <div className="fg"><label className="label">Chantier *</label><select className="field" value={attrForm.chantierId} onChange={e=>setAttrForm(f=>({...f,chantierId:parseInt(e.target.value)}))}>
              {(chantiers||[]).map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
            </select></div>
            <div className="fg"><label className="label">Date de retour prévue</label><input className="field" placeholder="JJ/MM/AAAA" value={attrForm.dateRetourPrevue} onChange={e=>setAttrForm(f=>({...f,dateRetourPrevue:e.target.value}))} /></div>
            <div className="fg"><label className="label">Notes</label><input className="field" value={attrForm.notes} onChange={e=>setAttrForm(f=>({...f,notes:e.target.value}))} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={attribuer} disabled={!attrForm.technicien}>Attribuer</button><button className="close-btn" onClick={() => setShowAttribuer(null)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal restitution */}
      {showRestituer && (
        <div className="modal-overlay" onClick={() => setShowRestituer(null)}>
          <div className="modal" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>✅ Restitution</h2>
              <button className="close-btn" onClick={() => setShowRestituer(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: "#4a6a4d", marginBottom: 16 }}>{showRestituer.equipementNom} · ×{showRestituer.quantite} · {showRestituer.technicien}</div>
            <div className="fg"><label className="label">État au retour</label><select className="field" value={restForm.etatRetour} onChange={e=>setRestForm(f=>({...f,etatRetour:e.target.value}))}>{etats.map(et=><option key={et}>{et}</option>)}</select></div>
            <div className="fg"><label className="label">Notes / Observations</label><textarea className="field" style={{minHeight:80}} placeholder="Dommages, pièces manquantes..." value={restForm.notes} onChange={e=>setRestForm(f=>({...f,notes:e.target.value}))} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={restituer}>Confirmer restitution</button><button className="close-btn" onClick={() => setShowRestituer(null)}>Annuler</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
