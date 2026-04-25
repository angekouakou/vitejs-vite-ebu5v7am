import { useState } from "react";

// ─── DONNÉES INITIALES CRM ────────────────────────────────────────────────────
export const initialClients = [
  {
    id: 1, nom: "Orange CI", secteur: "Télécom", statut: "Actif",
    contact: "Kouadio Jean-Pierre", email: "kj.pierre@orange.ci", tel: "27 20 00 00",
    adresse: "Tour Orange, Plateau, Abidjan", ville: "Abidjan",
    chiffreAffaires: 70500000, nombreChantiers: 2, dateCreation: "15/01/2024",
    notes: "Client prioritaire. Renouvellement contrat cadre en cours.",
  },
  {
    id: 2, nom: "MTN CI", secteur: "Télécom", statut: "Actif",
    contact: "Bah Mariama", email: "m.bah@mtn.ci", tel: "27 21 00 00",
    adresse: "Immeuble MTN, Marcory, Abidjan", ville: "Abidjan",
    chiffreAffaires: 46500000, nombreChantiers: 2, dateCreation: "03/03/2024",
    notes: "Délais de paiement 60 jours. Bien respectés.",
  },
  {
    id: 3, nom: "Moov Africa", secteur: "Télécom", statut: "Inactif",
    contact: "Traoré Salif", email: "s.traore@moov.ci", tel: "27 22 00 00",
    adresse: "Zone 4, Abidjan", ville: "Abidjan",
    chiffreAffaires: 7800000, nombreChantiers: 1, dateCreation: "10/01/2024",
    notes: "Mission terminée. Prospection pour nouveau contrat.",
  },
];

export const initialDevis = [
  {
    id: 1, numero: "DEV-2025-001", clientId: 1, clientNom: "Orange CI",
    objet: "Déploiement 5 sites BTS région Nord", montant: 45000000,
    statut: "Accepté", dateCreation: "05/01/2025", dateExpiration: "05/02/2025",
    dateAcceptation: "20/01/2025", tva: 18, remise: 5,
    lignes: [
      { id: 1, description: "Installation pylône Greenfield", quantite: 3, prixUnit: 8000000, total: 24000000 },
      { id: 2, description: "Équipements radio 4G", quantite: 3, prixUnit: 5000000, total: 15000000 },
      { id: 3, description: "Génie civil et fondations", quantite: 3, prixUnit: 2000000, total: 6000000 },
    ],
    notes: "Inclus formation équipe client sur site.",
    chantierId: 1,
  },
  {
    id: 2, numero: "DEV-2025-002", clientId: 2, clientNom: "MTN CI",
    objet: "Déploiement fibre optique Zone Industrielle", montant: 34200000,
    statut: "Envoyé", dateCreation: "15/02/2025", dateExpiration: "15/03/2025",
    dateAcceptation: null, tva: 18, remise: 0,
    lignes: [
      { id: 1, description: "Pose câble fibre optique 50km", quantite: 50, prixUnit: 450000, total: 22500000 },
      { id: 2, description: "Soudure et épissure", quantite: 100, prixUnit: 85000, total: 8500000 },
      { id: 3, description: "Tests OTDR et certification", quantite: 1, prixUnit: 3200000, total: 3200000 },
    ],
    notes: "",
    chantierId: 2,
  },
  {
    id: 3, numero: "DEV-2025-003", clientId: 1, clientNom: "Orange CI",
    objet: "Maintenance préventive réseau Yopougon", montant: 8500000,
    statut: "Brouillon", dateCreation: "10/04/2025", dateExpiration: "10/05/2025",
    dateAcceptation: null, tva: 18, remise: 0,
    lignes: [
      { id: 1, description: "Inspection et maintenance 12 sites", quantite: 12, prixUnit: 500000, total: 6000000 },
      { id: 2, description: "Remplacement pièces défectueuses", quantite: 1, prixUnit: 2500000, total: 2500000 },
    ],
    notes: "À envoyer après validation direction.",
    chantierId: null,
  },
];

export const initialFactures = [
  {
    id: 1, numero: "FAC-2025-001", devisId: 1, clientId: 1, clientNom: "Orange CI",
    objet: "Déploiement 5 sites BTS région Nord - Acompte 50%",
    montantHT: 22500000, tva: 18, montantTTC: 26550000,
    statut: "Payée", dateEmission: "21/01/2025", dateEcheance: "20/02/2025",
    datePaiement: "18/02/2025", modePaiement: "Virement bancaire",
    paiements: [{ id: 1, date: "18/02/2025", montant: 26550000, mode: "Virement", ref: "VIR-20250218-001" }],
  },
  {
    id: 2, numero: "FAC-2025-002", devisId: 1, clientId: 1, clientNom: "Orange CI",
    objet: "Déploiement 5 sites BTS - Solde 50%",
    montantHT: 22500000, tva: 18, montantTTC: 26550000,
    statut: "En attente", dateEmission: "01/04/2025", dateEcheance: "01/05/2025",
    datePaiement: null, modePaiement: null,
    paiements: [],
  },
  {
    id: 3, numero: "FAC-2025-003", devisId: null, clientId: 3, clientNom: "Moov Africa",
    objet: "Maintenance Tour Bouaké Centre",
    montantHT: 6610169, tva: 18, montantTTC: 7800000,
    statut: "En retard", dateEmission: "26/01/2025", dateEcheance: "25/02/2025",
    datePaiement: null, modePaiement: null,
    paiements: [],
  },
];

export const initialContrats = [
  {
    id: 1, numero: "CTR-2024-001", clientId: 1, clientNom: "Orange CI",
    type: "Contrat cadre", objet: "Déploiement et maintenance réseau télécoms CI",
    valeur: 250000000, statut: "Actif",
    dateDebut: "01/01/2024", dateFin: "31/12/2025",
    renouvellement: "Automatique", periodicite: "Annuel",
    notes: "Contrat principal. 8 missions planifiées.",
  },
  {
    id: 2, numero: "CTR-2024-002", clientId: 2, clientNom: "MTN CI",
    type: "Contrat de prestation", objet: "Déploiement fibre optique zones industrielles",
    valeur: 80000000, statut: "Actif",
    dateDebut: "01/03/2024", dateFin: "28/02/2026",
    renouvellement: "Manuel", periodicite: "Ponctuel",
    notes: "2 tranches de travaux prévues.",
  },
];

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────
function formatFCFA(n) { return new Intl.NumberFormat("fr-CI").format(Math.round(n)) + " FCFA"; }

function statutDevisColor(s) {
  return { "Brouillon": { bg: "#2a1a3a", color: "#c084fc" }, "Envoyé": { bg: "#1a2a3a", color: "#60a5fa" }, "Accepté": { bg: "#1a3a2a", color: "#4ade80" }, "Refusé": { bg: "#3a1a1a", color: "#f87171" }, "Expiré": { bg: "#2a2a1a", color: "#fbbf24" } }[s] || { bg: "#2a1a2a", color: "#a0a0a0" };
}

function statutFactureColor(s) {
  return { "Payée": { bg: "#1a3a2a", color: "#4ade80" }, "En attente": { bg: "#1a2a3a", color: "#60a5fa" }, "En retard": { bg: "#3a1a1a", color: "#f87171" }, "Partielle": { bg: "#2a2a1a", color: "#fbbf24" } }[s] || { bg: "#2a1a2a", color: "#a0a0a0" };
}

function joursRestants(dateStr) {
  if (!dateStr) return null;
  const [d, m, y] = dateStr.split("/");
  const diff = Math.ceil((new Date(y, m - 1, d) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

const today = () => new Date().toLocaleDateString("fr-CI", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─── CSS MODULE CRM ───────────────────────────────────────────────────────────
const crmCss = `
  .crm-tab { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #4a6a4d; transition: all 0.2s; }
  .crm-tab.active { background: #1a3a2a; color: #4ade80; }
  .crm-tab:hover:not(.active) { color: #a0b8a2; }
  .kpi-card { background: #111a13; border: 1px solid #1e301f; border-radius: 14px; padding: 18px; }
  .client-row { background: #0d1610; border: 1px solid #1e301f; border-radius: 12px; padding: 14px 18px; cursor: pointer; transition: all 0.2s; margin-bottom: 8px; }
  .client-row:hover { border-color: #2d4d30; background: #111a13; }
  .pipeline-col { background: #0d1610; border: 1px solid #1a2e1d; border-radius: 14px; padding: 14px; flex: 1; min-width: 160px; }
  .pipeline-card { background: #111a13; border: 1px solid #1e301f; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
  .pipeline-card:hover { border-color: #4ade80; }
  .facture-row { background: #0d1610; border: 1px solid #1e301f; border-radius: 12px; padding: 14px 18px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
  .facture-row:hover { border-color: #2d4d30; }
  .ligne-row { display: grid; grid-template-columns: 1fr 80px 120px 120px 30px; gap: 8px; align-items: center; padding: 8px; background: #0d1610; border-radius: 8px; margin-bottom: 6px; }
  .relance-btn { background: #3a2a1a; border: 1px solid #6a4a2a; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 12px; color: #fb923c; font-family: 'DM Sans', sans-serif; font-weight: 600; }
  .relance-btn:hover { background: #4a3a2a; }
`;

// ─── COMPOSANT CRM ────────────────────────────────────────────────────────────
export default function CRM({ user, clients, setClients, devis, setDevis, factures, setFactures, contrats, setContrats }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddDevis, setShowAddDevis] = useState(false);
  const [showAddFacture, setShowAddFacture] = useState(false);
  const [showAddContrat, setShowAddContrat] = useState(false);
  const [showPaiement, setShowPaiement] = useState(null);
  const [showRelance, setShowRelance] = useState(null);

  // Forms
  const emptyClient = { nom: "", secteur: "Télécom", statut: "Actif", contact: "", email: "", tel: "", adresse: "", ville: "Abidjan", notes: "" };
  const emptyDevis = { clientId: clients[0]?.id || 1, clientNom: clients[0]?.nom || "", objet: "", tva: 18, remise: 0, notes: "", lignes: [{ id: 1, description: "", quantite: 1, prixUnit: 0, total: 0 }] };
  const emptyFacture = { clientId: clients[0]?.id || 1, clientNom: clients[0]?.nom || "", objet: "", montantHT: "", tva: 18, notes: "" };
  const emptyContrat = { clientId: clients[0]?.id || 1, clientNom: clients[0]?.nom || "", type: "Contrat cadre", objet: "", valeur: "", dateDebut: "", dateFin: "", renouvellement: "Manuel", periodicite: "Annuel", notes: "" };
  const emptyPaiement = { montant: "", mode: "Virement bancaire", ref: "", date: today() };

  const [clientForm, setClientForm] = useState(emptyClient);
  const [devisForm, setDevisForm] = useState(emptyDevis);
  const [factureForm, setFactureForm] = useState(emptyFacture);
  const [contratForm, setContratForm] = useState(emptyContrat);
  const [paiementForm, setPaiementForm] = useState(emptyPaiement);
  const [relanceMsg, setRelanceMsg] = useState("");

  // Stats
  const totalCA = factures.filter(f => f.statut === "Payée").reduce((s, f) => s + f.montantTTC, 0);
  const totalEnAttente = factures.filter(f => f.statut !== "Payée").reduce((s, f) => s + f.montantTTC, 0);
  const facturesEnRetard = factures.filter(f => f.statut === "En retard" || (f.statut === "En attente" && joursRestants(f.dateEcheance) < 0));
  const devisEnCours = devis.filter(d => d.statut === "Envoyé").length;

  function addClient() {
    if (!clientForm.nom) return;
    setClients(prev => [...prev, { ...clientForm, id: Date.now(), chiffreAffaires: 0, nombreChantiers: 0, dateCreation: today() }]);
    setClientForm(emptyClient);
    setShowAddClient(false);
  }

  function addDevis() {
    if (!devisForm.objet) return;
    const montantHT = devisForm.lignes.reduce((s, l) => s + (l.total || 0), 0);
    const remise = montantHT * (devisForm.remise / 100);
    const apresRemise = montantHT - remise;
    const montant = apresRemise * (1 + devisForm.tva / 100);
    const num = `DEV-2025-${String(devis.length + 1).padStart(3, "0")}`;
    setDevis(prev => [...prev, { ...devisForm, id: Date.now(), numero: num, montant, statut: "Brouillon", dateCreation: today(), dateExpiration: "", dateAcceptation: null, chantierId: null }]);
    setDevisForm(emptyDevis);
    setShowAddDevis(false);
  }

  function updateStatutDevis(id, statut) {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, statut, dateAcceptation: statut === "Accepté" ? today() : d.dateAcceptation } : d));
    if (selectedDevis?.id === id) setSelectedDevis(prev => ({ ...prev, statut }));
  }

  function addFacture() {
    if (!factureForm.objet || !factureForm.montantHT) return;
    const ht = parseInt(factureForm.montantHT);
    const ttc = ht * (1 + factureForm.tva / 100);
    const num = `FAC-2025-${String(factures.length + 1).padStart(3, "0")}`;
    setFactures(prev => [...prev, { ...factureForm, id: Date.now(), numero: num, montantHT: ht, montantTTC: ttc, statut: "En attente", dateEmission: today(), dateEcheance: "", datePaiement: null, paiements: [] }]);
    setFactureForm(emptyFacture);
    setShowAddFacture(false);
  }

  function addPaiement() {
    if (!paiementForm.montant || !showPaiement) return;
    const montant = parseInt(paiementForm.montant);
    const facture = factures.find(f => f.id === showPaiement.id);
    const totalPaye = (facture.paiements || []).reduce((s, p) => s + p.montant, 0) + montant;
    const nouveauStatut = totalPaye >= facture.montantTTC ? "Payée" : "Partielle";
    const newPaiement = { ...paiementForm, id: Date.now(), montant };
    setFactures(prev => prev.map(f => f.id === showPaiement.id ? { ...f, paiements: [...(f.paiements || []), newPaiement], statut: nouveauStatut, datePaiement: nouveauStatut === "Payée" ? today() : null } : f));
    setPaiementForm(emptyPaiement);
    setShowPaiement(null);
  }

  function addContrat() {
    if (!contratForm.objet || !contratForm.valeur) return;
    const num = `CTR-2025-${String(contrats.length + 1).padStart(3, "0")}`;
    setContrats(prev => [...prev, { ...contratForm, id: Date.now(), numero: num, valeur: parseInt(contratForm.valeur), statut: "Actif" }]);
    setContratForm(emptyContrat);
    setShowAddContrat(false);
  }

  function genererRelance(facture) {
    const j = joursRestants(facture.dateEcheance);
    const msg = `Madame, Monsieur,\n\nNous vous contactons au sujet de la facture ${facture.numero} d'un montant de ${formatFCFA(facture.montantTTC)}, émise le ${facture.dateEmission} et échue le ${facture.dateEcheance}.\n\n${j < 0 ? `Cette facture est en retard de ${Math.abs(j)} jour(s).` : `Cette facture arrive à échéance dans ${j} jour(s).`}\n\nNous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.\n\nCordialement,\nDIGINETS CI`;
    setRelanceMsg(msg);
    setShowRelance(facture);
  }

  function envoyerWhatsApp(tel, msg) {
    const num = tel.replace(/\s/g, "");
    const fullNum = num.startsWith("225") ? num : "225" + num;
    window.open(`https://wa.me/${fullNum}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const canEdit = user.role === "admin";

  const tabs = [
    { id: "dashboard", label: "📊 Vue globale" },
    { id: "clients", label: "👥 Clients" },
    { id: "pipeline", label: "📋 Pipeline" },
    { id: "factures", label: "💰 Facturation" },
    { id: "contrats", label: "📄 Contrats" },
  ];

  return (
    <div>
      <style>{crmCss}</style>

      {/* Tabs navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#0d1610", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {tabs.map(t => <button key={t.id} className={`crm-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "CA encaissé", value: formatFCFA(totalCA).replace(" FCFA", ""), sub: "FCFA reçus", color: "#4ade80" },
              { label: "En attente", value: formatFCFA(totalEnAttente).replace(" FCFA", ""), sub: "FCFA à encaisser", color: "#60a5fa" },
              { label: "Devis en cours", value: devisEnCours, sub: "en attente réponse", color: "#c084fc" },
              { label: "Factures en retard", value: facturesEnRetard.length, sub: "à relancer", color: facturesEnRetard.length > 0 ? "#f87171" : "#4ade80" },
            ].map((k, i) => (
              <div key={i} className="kpi-card">
                <div style={{ fontSize: 10, color: "#4a6a4d", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 5 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {facturesEnRetard.length > 0 && (
            <div style={{ background: "#2a1a1a", border: "1px solid #5a2a2a", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 10 }}>🔴 Factures en retard de paiement</div>
              {facturesEnRetard.map(f => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#1a0f0f", borderRadius: 8, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#d4e8d6" }}>{f.numero} · {f.clientNom}</div>
                    <div style={{ fontSize: 11, color: "#4a6a4d" }}>Échéance : {f.dateEcheance} · {formatFCFA(f.montantTTC)}</div>
                  </div>
                  <button className="relance-btn" onClick={() => genererRelance(f)}>📤 Relancer</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="kpi-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 14 }}>Clients actifs</div>
              {clients.filter(c => c.statut === "Actif").map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, cursor: "pointer" }} onClick={() => { setSelectedClient(c); setActiveTab("clients"); }}>
                  <span style={{ fontSize: 13, color: "#a0c8a2" }}>{c.nom}</span>
                  <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>{(c.chiffreAffaires / 1000000).toFixed(1)}M FCFA</span>
                </div>
              ))}
            </div>
            <div className="kpi-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 14 }}>Devis récents</div>
              {devis.slice(-4).reverse().map(d => {
                const sc = statutDevisColor(d.statut);
                return (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#d4e8d6" }}>{d.numero}</div>
                      <div style={{ fontSize: 11, color: "#4a6a4d" }}>{d.clientNom}</div>
                    </div>
                    <span style={{ fontSize: 11, background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{d.statut}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Clients ({clients.length})</h2>
            {canEdit && <button className="add-btn" onClick={() => setShowAddClient(true)}>+ Nouveau client</button>}
          </div>

          {!selectedClient ? (
            clients.map(c => (
              <div key={c.id} className="client-row" onClick={() => setSelectedClient(c)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1a3a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#4ade80", flexShrink: 0 }}>{c.nom.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#d4e8d6" }}>{c.nom}</span>
                      <span style={{ fontSize: 11, background: c.statut === "Actif" ? "#1a3a2a" : "#3a2a1a", color: c.statut === "Actif" ? "#4ade80" : "#fb923c", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{c.statut}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a6a4d" }}>Contact : {c.contact} · {c.tel} · {c.ville}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>{(c.chiffreAffaires / 1000000).toFixed(1)}M FCFA</div>
                    <div style={{ fontSize: 11, color: "#3a5a3d" }}>{c.nombreChantiers} chantier(s)</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <button onClick={() => setSelectedClient(null)} style={{ background: "#1a2e1d", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 8, padding: "7px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>← Retour</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="kpi-card">
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#d4e8d6", marginBottom: 16 }}>{selectedClient.nom}</div>
                  {[["Contact", selectedClient.contact], ["Email", selectedClient.email], ["Téléphone", selectedClient.tel], ["Adresse", selectedClient.adresse], ["Secteur", selectedClient.secteur], ["Client depuis", selectedClient.dateCreation]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: "#3a5a3d", width: 80, flexShrink: 0 }}>{k}</span>
                      <span style={{ fontSize: 13, color: "#c8deca" }}>{v}</span>
                    </div>
                  ))}
                  {selectedClient.notes && <div style={{ marginTop: 12, padding: 12, background: "#0d1610", borderRadius: 8, border: "1px solid #1a2e1d", fontSize: 13, color: "#a0c8a2" }}>{selectedClient.notes}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button onClick={() => envoyerWhatsApp(selectedClient.tel, `Bonjour ${selectedClient.contact}, je vous contacte de la part de DIGINETS CI.`)} style={{ background: "#1a3a2a", border: "1px solid #2d5a30", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#4ade80", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>💬 WhatsApp</button>
                    <a href={`mailto:${selectedClient.email}`} style={{ background: "#1a2a3a", border: "1px solid #2d4d6a", borderRadius: 8, padding: "8px 14px", color: "#60a5fa", fontSize: 13, textDecoration: "none" }}>✉️ Email</a>
                  </div>
                </div>
                <div>
                  <div className="kpi-card" style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 12 }}>Activité</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#4a6a4d" }}>CA total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>{formatFCFA(selectedClient.chiffreAffaires)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#4a6a4d" }}>Chantiers</span>
                      <span style={{ fontSize: 14, color: "#60a5fa" }}>{selectedClient.nombreChantiers}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "#4a6a4d" }}>Devis en cours</span>
                      <span style={{ fontSize: 14, color: "#c084fc" }}>{devis.filter(d => d.clientId === selectedClient.id && d.statut === "Envoyé").length}</span>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 12 }}>Factures</div>
                    {factures.filter(f => f.clientId === selectedClient.id).map(f => {
                      const sc = statutFactureColor(f.statut);
                      return (
                        <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 12, color: "#d4e8d6" }}>{f.numero}</div>
                            <div style={{ fontSize: 11, color: "#4a6a4d" }}>{formatFCFA(f.montantTTC)}</div>
                          </div>
                          <span style={{ fontSize: 11, background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{f.statut}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PIPELINE DEVIS */}
      {activeTab === "pipeline" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Pipeline devis</h2>
            {canEdit && <button className="add-btn" onClick={() => setShowAddDevis(true)}>+ Nouveau devis</button>}
          </div>

          {!selectedDevis ? (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {["Brouillon", "Envoyé", "Accepté", "Refusé"].map(statut => {
                const sc = statutDevisColor(statut);
                const devisStatut = devis.filter(d => d.statut === statut);
                const total = devisStatut.reduce((s, d) => s + d.montant, 0);
                return (
                  <div key={statut} className="pipeline-col">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: sc.color }}>{statut}</span>
                      <span style={{ fontSize: 11, color: "#3a5a3d" }}>{devisStatut.length}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#3a5a3d", marginBottom: 12 }}>{(total / 1000000).toFixed(1)}M FCFA</div>
                    {devisStatut.map(d => (
                      <div key={d.id} className="pipeline-card" onClick={() => setSelectedDevis(d)}>
                        <div style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}>{d.numero}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6", marginBottom: 4 }}>{d.clientNom}</div>
                        <div style={{ fontSize: 12, color: "#a0c8a2", marginBottom: 6 }}>{d.objet.substring(0, 40)}...</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{(d.montant / 1000000).toFixed(1)}M FCFA</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedDevis(null)} style={{ background: "#1a2e1d", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 8, padding: "7px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>← Retour</button>
              <div className="kpi-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}>{selectedDevis.numero}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#d4e8d6" }}>{selectedDevis.objet}</div>
                    <div style={{ fontSize: 13, color: "#4a6a4d", marginTop: 4 }}>{selectedDevis.clientNom} · Créé le {selectedDevis.dateCreation}</div>
                  </div>
                  <span style={{ fontSize: 12, background: statutDevisColor(selectedDevis.statut).bg, color: statutDevisColor(selectedDevis.statut).color, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{selectedDevis.statut}</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#4a6a4d", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Lignes du devis</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px", gap: 8, padding: "6px 8px", marginBottom: 6 }}>
                    {["Description", "Qté", "Prix unit.", "Total"].map(h => <span key={h} style={{ fontSize: 11, color: "#4a6a4d", fontWeight: 600 }}>{h}</span>)}
                  </div>
                  {(selectedDevis.lignes || []).map(l => (
                    <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px 120px", gap: 8, padding: "8px", background: "#0d1610", borderRadius: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#c8deca" }}>{l.description}</span>
                      <span style={{ fontSize: 13, color: "#a0c8a2", textAlign: "center" }}>{l.quantite}</span>
                      <span style={{ fontSize: 13, color: "#a0c8a2", textAlign: "right" }}>{formatFCFA(l.prixUnit)}</span>
                      <span style={{ fontSize: 13, color: "#4ade80", textAlign: "right", fontWeight: 600 }}>{formatFCFA(l.total)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #1e301f", paddingTop: 12, marginBottom: 16 }}>
                  {[
                    ["Montant HT", formatFCFA((selectedDevis.lignes || []).reduce((s, l) => s + l.total, 0))],
                    selectedDevis.remise > 0 ? ["Remise " + selectedDevis.remise + "%", "- " + formatFCFA((selectedDevis.lignes || []).reduce((s, l) => s + l.total, 0) * selectedDevis.remise / 100)] : null,
                    ["TVA " + selectedDevis.tva + "%", formatFCFA((selectedDevis.lignes || []).reduce((s, l) => s + l.total, 0) * (1 - selectedDevis.remise / 100) * selectedDevis.tva / 100)],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#4a6a4d" }}>{k}</span>
                      <span style={{ fontSize: 13, color: "#c8deca" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e301f" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#d4e8d6" }}>TOTAL TTC</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#4ade80" }}>{formatFCFA(selectedDevis.montant)}</span>
                  </div>
                </div>

                {canEdit && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedDevis.statut === "Brouillon" && <button className="add-btn" onClick={() => updateStatutDevis(selectedDevis.id, "Envoyé")}>📤 Marquer envoyé</button>}
                    {selectedDevis.statut === "Envoyé" && (
                      <>
                        <button className="add-btn" onClick={() => updateStatutDevis(selectedDevis.id, "Accepté")}>✅ Accepté</button>
                        <button style={{ background: "#3a1a1a", border: "1px solid #5a2d2d", borderRadius: 10, padding: "9px 16px", cursor: "pointer", color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }} onClick={() => updateStatutDevis(selectedDevis.id, "Refusé")}>❌ Refusé</button>
                      </>
                    )}
                    {selectedDevis.statut === "Accepté" && <button className="add-btn" onClick={() => { setFactureForm({ clientId: selectedDevis.clientId, clientNom: selectedDevis.clientNom, objet: selectedDevis.objet, montantHT: Math.round(selectedDevis.montant / (1 + selectedDevis.tva / 100)), tva: selectedDevis.tva, notes: "" }); setShowAddFacture(true); }}>🧾 Créer facture</button>}
                    <button onClick={() => setDevis(prev => prev.filter(d => d.id !== selectedDevis.id))} style={{ background: "#3a1a1a", border: "1px solid #5a2d2d", borderRadius: 10, padding: "9px 16px", cursor: "pointer", color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Supprimer</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FACTURATION */}
      {activeTab === "factures" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Facturation</h2>
            {canEdit && <button className="add-btn" onClick={() => setShowAddFacture(true)}>+ Nouvelle facture</button>}
          </div>

          {!selectedFacture ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Payées", value: factures.filter(f=>f.statut==="Payée").length, montant: factures.filter(f=>f.statut==="Payée").reduce((s,f)=>s+f.montantTTC,0), color: "#4ade80" },
                  { label: "En attente", value: factures.filter(f=>f.statut==="En attente"||f.statut==="Partielle").length, montant: factures.filter(f=>f.statut==="En attente"||f.statut==="Partielle").reduce((s,f)=>s+f.montantTTC,0), color: "#60a5fa" },
                  { label: "En retard", value: facturesEnRetard.length, montant: facturesEnRetard.reduce((s,f)=>s+f.montantTTC,0), color: "#f87171" },
                ].map((k, i) => (
                  <div key={i} className="kpi-card">
                    <div style={{ fontSize: 11, color: "#4a6a4d", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>{k.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: "#3a5a3d", marginTop: 4 }}>{(k.montant/1000000).toFixed(1)}M FCFA</div>
                  </div>
                ))}
              </div>

              {factures.map(f => {
                const sc = statutFactureColor(f.statut);
                const j = joursRestants(f.dateEcheance);
                return (
                  <div key={f.id} className="facture-row" onClick={() => setSelectedFacture(f)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{f.numero}</span>
                          <span style={{ fontSize: 11, background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{f.statut}</span>
                          {j !== null && j < 0 && f.statut !== "Payée" && <span style={{ fontSize: 11, color: "#f87171" }}>⚠️ {Math.abs(j)}j de retard</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#4a6a4d" }}>{f.clientNom} · {f.objet.substring(0, 50)}</div>
                        <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>Émise {f.dateEmission} · Échéance {f.dateEcheance}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>{formatFCFA(f.montantTTC)}</div>
                        {f.statut !== "Payée" && <button className="relance-btn" style={{ marginTop: 6 }} onClick={e => { e.stopPropagation(); genererRelance(f); }}>📤 Relancer</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedFacture(null)} style={{ background: "#1a2e1d", border: "none", color: "#4ade80", cursor: "pointer", borderRadius: 8, padding: "7px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>← Retour</button>
              <div className="kpi-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}>{selectedFacture.numero}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#d4e8d6" }}>{selectedFacture.objet}</div>
                    <div style={{ fontSize: 13, color: "#4a6a4d", marginTop: 4 }}>{selectedFacture.clientNom}</div>
                  </div>
                  <span style={{ fontSize: 12, background: statutFactureColor(selectedFacture.statut).bg, color: statutFactureColor(selectedFacture.statut).color, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>{selectedFacture.statut}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["Émission", selectedFacture.dateEmission], ["Échéance", selectedFacture.dateEcheance], ["Montant HT", formatFCFA(selectedFacture.montantHT)], ["TVA " + selectedFacture.tva + "%", formatFCFA(selectedFacture.montantHT * selectedFacture.tva / 100)]].map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 14px", background: "#0d1610", borderRadius: 10, border: "1px solid #1a2e1d" }}>
                      <div style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#c8deca" }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "14px 16px", background: "#0a1a0d", borderRadius: 12, border: "1px solid #1e301f", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#d4e8d6" }}>TOTAL TTC</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#4ade80" }}>{formatFCFA(selectedFacture.montantTTC)}</span>
                </div>

                {(selectedFacture.paiements || []).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#4a6a4d", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Paiements reçus</div>
                    {selectedFacture.paiements.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0d1610", borderRadius: 8, marginBottom: 4, border: "1px solid #1a3a2a" }}>
                        <span style={{ fontSize: 12, color: "#a0c8a2" }}>{p.date} · {p.mode}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>{formatFCFA(p.montant)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedFacture.statut !== "Payée" && canEdit && <button className="add-btn" onClick={() => { setPaiementForm(emptyPaiement); setShowPaiement(selectedFacture); }}>💳 Enregistrer paiement</button>}
                  <button className="relance-btn" onClick={() => genererRelance(selectedFacture)}>📤 Relancer client</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTRATS */}
      {activeTab === "contrats" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>Contrats & abonnements</h2>
            {canEdit && <button className="add-btn" onClick={() => setShowAddContrat(true)}>+ Nouveau contrat</button>}
          </div>
          {contrats.map(c => {
            const j = joursRestants(c.dateFin);
            return (
              <div key={c.id} className="client-row" onClick={() => setSelectedContrat(c === selectedContrat ? null : c)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}>{c.numero} · {c.clientNom}</span>
                      <span style={{ fontSize: 11, background: c.statut === "Actif" ? "#1a3a2a" : "#3a1a1a", color: c.statut === "Actif" ? "#4ade80" : "#f87171", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{c.statut}</span>
                      {j !== null && j <= 30 && j >= 0 && <span style={{ fontSize: 11, color: "#fb923c" }}>⚠️ Expire dans {j}j</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#4a6a4d" }}>{c.type} · {c.objet}</div>
                    <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>{c.dateDebut} → {c.dateFin} · {c.renouvellement}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>{(c.valeur / 1000000).toFixed(1)}M FCFA</div>
                    <div style={{ fontSize: 11, color: "#3a5a3d" }}>{c.periodicite}</div>
                  </div>
                </div>
                {selectedContrat?.id === c.id && c.notes && (
                  <div style={{ marginTop: 12, padding: 10, background: "#0a1a0d", borderRadius: 8, border: "1px solid #1a2e1d", fontSize: 13, color: "#a0c8a2" }}>{c.notes}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}

      {/* Modal nouveau client */}
      {showAddClient && (
        <div className="modal-overlay" onClick={() => setShowAddClient(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouveau client</h2>
              <button className="close-btn" onClick={() => setShowAddClient(false)}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Nom *</label><input className="field" value={clientForm.nom} onChange={e=>setClientForm(f=>({...f,nom:e.target.value}))} /></div>
              <div className="fg"><label className="label">Contact</label><input className="field" value={clientForm.contact} onChange={e=>setClientForm(f=>({...f,contact:e.target.value}))} /></div>
              <div className="fg"><label className="label">Téléphone</label><input className="field" value={clientForm.tel} onChange={e=>setClientForm(f=>({...f,tel:e.target.value}))} /></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Email</label><input className="field" type="email" value={clientForm.email} onChange={e=>setClientForm(f=>({...f,email:e.target.value}))} /></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Adresse</label><input className="field" value={clientForm.adresse} onChange={e=>setClientForm(f=>({...f,adresse:e.target.value}))} /></div>
              <div className="fg"><label className="label">Ville</label><input className="field" value={clientForm.ville} onChange={e=>setClientForm(f=>({...f,ville:e.target.value}))} /></div>
              <div className="fg"><label className="label">Statut</label><select className="field" value={clientForm.statut} onChange={e=>setClientForm(f=>({...f,statut:e.target.value}))}><option>Actif</option><option>Inactif</option><option>Prospect</option></select></div>
              <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Notes</label><textarea className="field" value={clientForm.notes} onChange={e=>setClientForm(f=>({...f,notes:e.target.value}))} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addClient} disabled={!clientForm.nom}>Créer</button><button className="close-btn" onClick={() => setShowAddClient(false)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal nouveau devis */}
      {showAddDevis && (
        <div className="modal-overlay" onClick={() => setShowAddDevis(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouveau devis</h2>
              <button className="close-btn" onClick={() => setShowAddDevis(false)}>✕</button>
            </div>
            <div className="fg"><label className="label">Client *</label><select className="field" value={devisForm.clientId} onChange={e=>{const c=clients.find(x=>x.id===parseInt(e.target.value));setDevisForm(f=>({...f,clientId:parseInt(e.target.value),clientNom:c?.nom||""}));}}>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
            <div className="fg"><label className="label">Objet *</label><input className="field" placeholder="Description des travaux" value={devisForm.objet} onChange={e=>setDevisForm(f=>({...f,objet:e.target.value}))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg"><label className="label">TVA (%)</label><input type="number" className="field" value={devisForm.tva} onChange={e=>setDevisForm(f=>({...f,tva:parseInt(e.target.value)||0}))} /></div>
              <div className="fg"><label className="label">Remise (%)</label><input type="number" className="field" value={devisForm.remise} onChange={e=>setDevisForm(f=>({...f,remise:parseInt(e.target.value)||0}))} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Lignes</label>
              {devisForm.lignes.map((l, i) => (
                <div key={l.id} className="ligne-row">
                  <input className="field" placeholder="Description" value={l.description} onChange={e=>{const lignes=[...devisForm.lignes];lignes[i]={...l,description:e.target.value};setDevisForm(f=>({...f,lignes}));}} />
                  <input type="number" className="field" value={l.quantite} onChange={e=>{const lignes=[...devisForm.lignes];const q=parseInt(e.target.value)||1;lignes[i]={...l,quantite:q,total:q*l.prixUnit};setDevisForm(f=>({...f,lignes}));}} />
                  <input type="number" className="field" value={l.prixUnit} onChange={e=>{const lignes=[...devisForm.lignes];const p=parseInt(e.target.value)||0;lignes[i]={...l,prixUnit:p,total:l.quantite*p};setDevisForm(f=>({...f,lignes}));}} />
                  <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>{formatFCFA(l.total)}</span>
                  <button onClick={()=>setDevisForm(f=>({...f,lignes:f.lignes.filter(x=>x.id!==l.id)}))} style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:16}}>×</button>
                </div>
              ))}
              <button className="add-btn" style={{ marginTop: 8, fontSize: 12 }} onClick={()=>setDevisForm(f=>({...f,lignes:[...f.lignes,{id:Date.now(),description:"",quantite:1,prixUnit:0,total:0}]}))}>+ Ligne</button>
            </div>
            <div className="fg"><label className="label">Notes</label><textarea className="field" style={{minHeight:60}} value={devisForm.notes} onChange={e=>setDevisForm(f=>({...f,notes:e.target.value}))} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addDevis} disabled={!devisForm.objet}>Créer le devis</button><button className="close-btn" onClick={() => setShowAddDevis(false)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal nouvelle facture */}
      {showAddFacture && (
        <div className="modal-overlay" onClick={() => setShowAddFacture(false)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouvelle facture</h2>
              <button className="close-btn" onClick={() => setShowAddFacture(false)}>✕</button>
            </div>
            <div className="fg"><label className="label">Client *</label><select className="field" value={factureForm.clientId} onChange={e=>{const c=clients.find(x=>x.id===parseInt(e.target.value));setFactureForm(f=>({...f,clientId:parseInt(e.target.value),clientNom:c?.nom||""}));}}>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
            <div className="fg"><label className="label">Objet *</label><input className="field" value={factureForm.objet} onChange={e=>setFactureForm(f=>({...f,objet:e.target.value}))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg"><label className="label">Montant HT (FCFA) *</label><input type="number" className="field" value={factureForm.montantHT} onChange={e=>setFactureForm(f=>({...f,montantHT:e.target.value}))} /></div>
              <div className="fg"><label className="label">TVA (%)</label><input type="number" className="field" value={factureForm.tva} onChange={e=>setFactureForm(f=>({...f,tva:parseInt(e.target.value)||0}))} /></div>
            </div>
            {factureForm.montantHT && <div style={{ padding: "10px 14px", background: "#0a1a0d", borderRadius: 10, marginBottom: 14, display: "flex", justifyContent: "space-between" }}><span style={{color:"#4a6a4d",fontSize:13}}>Total TTC</span><span style={{color:"#4ade80",fontWeight:700,fontSize:15}}>{formatFCFA(parseInt(factureForm.montantHT||0)*(1+factureForm.tva/100))}</span></div>}
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addFacture} disabled={!factureForm.objet||!factureForm.montantHT}>Créer</button><button className="close-btn" onClick={() => setShowAddFacture(false)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal paiement */}
      {showPaiement && (
        <div className="modal-overlay" onClick={() => setShowPaiement(null)}>
          <div className="modal" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>💳 Enregistrer un paiement</h2>
              <button className="close-btn" onClick={() => setShowPaiement(null)}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 16 }}>{showPaiement.numero} · Restant : {formatFCFA(showPaiement.montantTTC - (showPaiement.paiements||[]).reduce((s,p)=>s+p.montant,0))}</div>
            <div className="fg"><label className="label">Montant (FCFA) *</label><input type="number" className="field" value={paiementForm.montant} onChange={e=>setPaiementForm(f=>({...f,montant:e.target.value}))} /></div>
            <div className="fg"><label className="label">Mode de paiement</label><select className="field" value={paiementForm.mode} onChange={e=>setPaiementForm(f=>({...f,mode:e.target.value}))}>{["Virement bancaire","Chèque","Espèces","Mobile Money","Orange Money"].map(m=><option key={m}>{m}</option>)}</select></div>
            <div className="fg"><label className="label">Référence</label><input className="field" placeholder="N° virement, chèque..." value={paiementForm.ref} onChange={e=>setPaiementForm(f=>({...f,ref:e.target.value}))} /></div>
            <div className="fg"><label className="label">Date</label><input className="field" value={paiementForm.date} onChange={e=>setPaiementForm(f=>({...f,date:e.target.value}))} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addPaiement} disabled={!paiementForm.montant}>Enregistrer</button><button className="close-btn" onClick={() => setShowPaiement(null)}>Annuler</button></div>
          </div>
        </div>
      )}

      {/* Modal relance */}
      {showRelance && (
        <div className="modal-overlay" onClick={() => setShowRelance(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>📤 Relance client</h2>
              <button className="close-btn" onClick={() => setShowRelance(null)}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 12 }}>{showRelance.clientNom} · {showRelance.numero}</div>
            <div className="fg"><label className="label">Message</label><textarea className="field" style={{minHeight:160}} value={relanceMsg} onChange={e=>setRelanceMsg(e.target.value)} /></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="send-btn" style={{ flex: 1 }} onClick={() => { const client = clients.find(c=>c.id===showRelance.clientId); if(client) envoyerWhatsApp(client.tel, relanceMsg); setShowRelance(null); }}>💬 Envoyer sur WhatsApp</button>
              <button onClick={() => { const client = clients.find(c=>c.id===showRelance.clientId); if(client) window.location.href=`mailto:${client.email}?subject=Relance facture ${showRelance.numero}&body=${encodeURIComponent(relanceMsg)}`; }} style={{ background: "#1a2a3a", border: "1px solid #2d4d6a", borderRadius: 10, padding: "11px 16px", cursor: "pointer", color: "#60a5fa", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✉️ Email</button>
              <button className="close-btn" onClick={() => setShowRelance(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouveau contrat */}
      {showAddContrat && (
        <div className="modal-overlay" onClick={() => setShowAddContrat(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700 }}>Nouveau contrat</h2>
              <button className="close-btn" onClick={() => setShowAddContrat(false)}>✕</button>
            </div>
            <div className="fg"><label className="label">Client *</label><select className="field" value={contratForm.clientId} onChange={e=>{const c=clients.find(x=>x.id===parseInt(e.target.value));setContratForm(f=>({...f,clientId:parseInt(e.target.value),clientNom:c?.nom||""}));}}>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <div className="fg"><label className="label">Type</label><select className="field" value={contratForm.type} onChange={e=>setContratForm(f=>({...f,type:e.target.value}))}>{["Contrat cadre","Contrat de prestation","Maintenance","Abonnement"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="fg"><label className="label">Valeur (FCFA) *</label><input type="number" className="field" value={contratForm.valeur} onChange={e=>setContratForm(f=>({...f,valeur:e.target.value}))} /></div>
              <div className="fg"><label className="label">Date début</label><input className="field" placeholder="JJ/MM/AAAA" value={contratForm.dateDebut} onChange={e=>setContratForm(f=>({...f,dateDebut:e.target.value}))} /></div>
              <div className="fg"><label className="label">Date fin</label><input className="field" placeholder="JJ/MM/AAAA" value={contratForm.dateFin} onChange={e=>setContratForm(f=>({...f,dateFin:e.target.value}))} /></div>
              <div className="fg"><label className="label">Renouvellement</label><select className="field" value={contratForm.renouvellement} onChange={e=>setContratForm(f=>({...f,renouvellement:e.target.value}))}><option>Automatique</option><option>Manuel</option></select></div>
              <div className="fg"><label className="label">Périodicité</label><select className="field" value={contratForm.periodicite} onChange={e=>setContratForm(f=>({...f,periodicite:e.target.value}))}>{["Annuel","Mensuel","Trimestriel","Ponctuel"].map(p=><option key={p}>{p}</option>)}</select></div>
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}><label className="label">Objet *</label><input className="field" value={contratForm.objet} onChange={e=>setContratForm(f=>({...f,objet:e.target.value}))} /></div>
            <div className="fg"><label className="label">Notes</label><textarea className="field" style={{minHeight:60}} value={contratForm.notes} onChange={e=>setContratForm(f=>({...f,notes:e.target.value}))} /></div>
            <div style={{ display: "flex", gap: 10 }}><button className="send-btn" style={{ flex: 1 }} onClick={addContrat} disabled={!contratForm.objet||!contratForm.valeur}>Créer</button><button className="close-btn" onClick={() => setShowAddContrat(false)}>Annuler</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
