import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import { createChantier, updateChantier, deleteChantier, assignerEquipe, mapChantier } from './services/chantiers';
import { createTache, toggleTache, deleteTache } from './services/taches';
import { pointerArrivee, pointerDepart } from './services/presences';
import { uploadPhoto } from './services/photos';
import { signalerBlocage, resoudreBlocage } from './services/blocages';
import { soumettreRapport } from './services/rapports';
import { createFacture, enregistrerPaiement, deleteFacture, mapFacture } from './services/factures';
import { createDevis, updateStatutDevis, deleteDevis, mapDevis } from './services/devis';
import { createClient, updateClient, deleteClient, mapClient } from './services/clients';
import { createContrat, deleteContrat, mapContrat } from './services/contrats';
import { createEquipement, attribuerEquipement, restituerEquipement } from './services/equipements';
import { sendMessage } from './services/messages';
import { uploadDocument, deleteDocument } from './services/documents';
// ════════════ DONNÉES ════════════

const USERS = [
  {
    id: 1,
    nom: "Diallo K.",
    email: "admin@diginets.ci",
    password: "admin123",
    role: "admin",
    avatar: "D",
    tel: "27 00 00 01",
  },
  {
    id: 2,
    nom: "Konan A.",
    email: "konan@diginets.ci",
    password: "konan123",
    role: "chef",
    avatar: "K",
    tel: "07 00 11 22",
  },
  {
    id: 3,
    nom: "Traoré B.",
    email: "traore@diginets.ci",
    password: "traore123",
    role: "technicien",
    avatar: "T",
    tel: "07 00 33 44",
  },
  {
    id: 4,
    nom: "Bamba E.",
    email: "bamba@diginets.ci",
    password: "bamba123",
    role: "technicien",
    avatar: "B",
    tel: "07 00 55 66",
  },
  {
    id: 5,
    nom: "Koffi F.",
    email: "koffi@diginets.ci",
    password: "koffi123",
    role: "technicien",
    avatar: "F",
    tel: "07 00 77 88",
  },
];

const ROLE_LABELS = {
  admin: "Direction",
  chef: "Chef chantier",
  technicien: "Technicien",
};
const ROLE_COLORS = {
  admin: "#c084fc",
  chef: "#60a5fa",
  technicien: "#4ade80",
};

const EQUIPES_INIT = [
  {
    id: 1,
    nom: "Konan A.",
    role: "chef",
    poste: "Chef de chantier",
    statut: "Actif",
    tel: "07 00 11 22",
  },
  {
    id: 2,
    nom: "Traoré B.",
    role: "technicien",
    poste: "Technicien RF",
    statut: "Actif",
    tel: "07 00 33 44",
  },
  {
    id: 3,
    nom: "Bamba E.",
    role: "technicien",
    poste: "Technicien Réseau",
    statut: "Actif",
    tel: "07 00 55 66",
  },
  {
    id: 4,
    nom: "Koffi F.",
    role: "technicien",
    poste: "Auditeur Réseau",
    statut: "Actif",
    tel: "07 00 77 88",
  },
];

const CHANTIERS_INIT = [
  {
    id: 1,
    nom: "Site BTS Adjamé Nord",
    client: "Orange CI",
    clientId: 1,
    statut: "En cours",
    avancement: 72,
    equipe: ["Konan A.", "Traoré B."],
    budget: 18500000,
    depense: 13320000,
    localisation: "Adjamé, Abidjan",
    type: "Pylône Greenfield",
    dateDebut: "02/03/2025",
    dateFin: "30/04/2025",
    photos: [],
    rapports: [],
    blocages: [],
    presences: [],
    taches: [
      { id: 1, label: "Préparation du site", done: true },
      { id: 2, label: "Installation pylône", done: true },
      { id: 3, label: "Câblage antennes", done: true },
      { id: 4, label: "Installation équipements radio", done: false },
      { id: 5, label: "Tests RF", done: false },
      { id: 6, label: "Mise en service", done: false },
    ],
    documents: [],
  },
  {
    id: 2,
    nom: "Fibre Optique Zone Industrielle",
    client: "MTN CI",
    clientId: 2,
    statut: "En cours",
    avancement: 35,
    equipe: ["Konan A.", "Bamba E."],
    budget: 34200000,
    depense: 11970000,
    localisation: "Zone Industrielle, Abidjan",
    type: "Fibre Optique",
    dateDebut: "01/03/2025",
    dateFin: "28/04/2025",
    photos: [],
    rapports: [],
    blocages: [
      {
        id: 1,
        type: "Accès refusé",
        description: "Gardien refuse l'accès sans bon de commande.",
        date: "15/04/2025 09:30",
        technicien: "Bamba E.",
        resolu: false,
      },
    ],
    presences: [],
    taches: [
      { id: 1, label: "Étude de tracé", done: true },
      { id: 2, label: "Génie civil", done: true },
      { id: 3, label: "Pose câble fibre", done: false },
      { id: 4, label: "Soudure épissure", done: false },
      { id: 5, label: "Tests OTDR", done: false },
    ],
    documents: [],
  },
  {
    id: 3,
    nom: "Installation Shelter Daloa",
    client: "MTN CI",
    clientId: 2,
    statut: "En cours",
    avancement: 88,
    equipe: ["Bamba E.", "Koffi F."],
    budget: 12300000,
    depense: 10824000,
    localisation: "Daloa",
    type: "Cabinet & Shelter",
    dateDebut: "01/03/2025",
    dateFin: "20/04/2025",
    photos: [],
    rapports: [],
    blocages: [],
    presences: [],
    taches: [
      { id: 1, label: "Livraison shelter", done: true },
      { id: 2, label: "Fondations béton", done: true },
      { id: 3, label: "Installation shelter", done: true },
      { id: 4, label: "Câblage électrique", done: true },
      { id: 5, label: "Climatisation", done: false },
      { id: 6, label: "Tests électriques", done: false },
    ],
    documents: [],
  },
  {
    id: 4,
    nom: "Maintenance Tour Bouaké",
    client: "Moov Africa",
    clientId: 3,
    statut: "Terminé",
    avancement: 100,
    equipe: ["Koffi F."],
    budget: 7800000,
    depense: 7650000,
    localisation: "Bouaké Centre",
    type: "Maintenance",
    dateDebut: "10/01/2025",
    dateFin: "25/01/2025",
    photos: [],
    rapports: [],
    blocages: [],
    presences: [],
    taches: [
      { id: 1, label: "Inspection antennes", done: true },
      { id: 2, label: "Remplacement connecteurs", done: true },
      { id: 3, label: "Tests signal", done: true },
    ],
    documents: [],
  },
];

const CLIENTS_INIT = [
  {
    id: 1,
    nom: "Orange CI",
    secteur: "Télécom",
    statut: "Actif",
    contact: "Kouadio Jean-Pierre",
    email: "kj.pierre@orange.ci",
    tel: "27 20 00 00",
    adresse: "Tour Orange, Plateau",
    ville: "Abidjan",
    chiffreAffaires: 70500000,
    dateCreation: "15/01/2024",
    notes: "Client prioritaire.",
  },
  {
    id: 2,
    nom: "MTN CI",
    secteur: "Télécom",
    statut: "Actif",
    contact: "Bah Mariama",
    email: "m.bah@mtn.ci",
    tel: "27 21 00 00",
    adresse: "Immeuble MTN, Marcory",
    ville: "Abidjan",
    chiffreAffaires: 46500000,
    dateCreation: "03/03/2024",
    notes: "Délais paiement 60 jours.",
  },
  {
    id: 3,
    nom: "Moov Africa",
    secteur: "Télécom",
    statut: "Inactif",
    contact: "Traoré Salif",
    email: "s.traore@moov.ci",
    tel: "27 22 00 00",
    adresse: "Zone 4",
    ville: "Abidjan",
    chiffreAffaires: 7800000,
    dateCreation: "10/01/2024",
    notes: "Prospection en cours.",
  },
];

const DEVIS_INIT = [
  {
    id: 1,
    numero: "DEV-2025-001",
    clientId: 1,
    clientNom: "Orange CI",
    objet: "Déploiement 5 sites BTS région Nord",
    montantHT: 38135593,
    tva: 18,
    remise: 5,
    montantTTC: 45000000,
    statut: "Accepté",
    dateCreation: "05/01/2025",
    dateExpiration: "05/02/2025",
    dateAcceptation: "20/01/2025",
    chantierId: 1,
    notes: "Inclus formation équipe client.",
    lignes: [
      {
        id: 1,
        description: "Installation pylône Greenfield",
        quantite: 3,
        prixUnit: 8000000,
        total: 24000000,
      },
      {
        id: 2,
        description: "Équipements radio 4G",
        quantite: 3,
        prixUnit: 5000000,
        total: 15000000,
      },
    ],
  },
  {
    id: 2,
    numero: "DEV-2025-002",
    clientId: 2,
    clientNom: "MTN CI",
    objet: "Déploiement fibre optique Zone Industrielle",
    montantHT: 28983051,
    tva: 18,
    remise: 0,
    montantTTC: 34200000,
    statut: "Envoyé",
    dateCreation: "15/02/2025",
    dateExpiration: "15/03/2025",
    dateAcceptation: null,
    chantierId: 2,
    notes: "",
    lignes: [
      {
        id: 1,
        description: "Pose câble fibre 50km",
        quantite: 50,
        prixUnit: 450000,
        total: 22500000,
      },
    ],
  },
  {
    id: 3,
    numero: "DEV-2025-003",
    clientId: 1,
    clientNom: "Orange CI",
    objet: "Maintenance préventive réseau Yopougon",
    montantHT: 7203390,
    tva: 18,
    remise: 0,
    montantTTC: 8500000,
    statut: "Brouillon",
    dateCreation: "10/04/2025",
    dateExpiration: "10/05/2025",
    dateAcceptation: null,
    chantierId: null,
    notes: "À envoyer après validation.",
    lignes: [
      {
        id: 1,
        description: "Inspection 12 sites",
        quantite: 12,
        prixUnit: 500000,
        total: 6000000,
      },
    ],
  },
];

const FACTURES_INIT = [
  {
    id: 1,
    numero: "FAC-2025-001",
    devisId: 1,
    clientId: 1,
    clientNom: "Orange CI",
    chantierId: 1,
    objet: "Acompte 50% — BTS région Nord",
    montantHT: 22500000,
    tva: 18,
    montantTTC: 26550000,
    statut: "Payée",
    dateEmission: "21/01/2025",
    dateEcheance: "20/02/2025",
    datePaiement: "18/02/2025",
    paiements: [
      {
        id: 1,
        date: "18/02/2025",
        montant: 26550000,
        mode: "Virement bancaire",
        ref: "VIR-20250218-001",
      },
    ],
  },
  {
    id: 2,
    numero: "FAC-2025-002",
    devisId: 1,
    clientId: 1,
    clientNom: "Orange CI",
    chantierId: 1,
    objet: "Solde 50% — BTS région Nord",
    montantHT: 22500000,
    tva: 18,
    montantTTC: 26550000,
    statut: "En attente",
    dateEmission: "01/04/2025",
    dateEcheance: "01/05/2025",
    datePaiement: null,
    paiements: [],
  },
  {
    id: 3,
    numero: "FAC-2025-003",
    devisId: null,
    clientId: 3,
    clientNom: "Moov Africa",
    chantierId: 4,
    objet: "Maintenance Tour Bouaké Centre",
    montantHT: 6610169,
    tva: 18,
    montantTTC: 7800000,
    statut: "En retard",
    dateEmission: "26/01/2025",
    dateEcheance: "25/02/2025",
    datePaiement: null,
    paiements: [],
  },
];

const CONTRATS_INIT = [
  {
    id: 1,
    numero: "CTR-2024-001",
    clientId: 1,
    clientNom: "Orange CI",
    type: "Contrat cadre",
    objet: "Déploiement et maintenance réseau CI",
    valeur: 250000000,
    statut: "Actif",
    dateDebut: "01/01/2024",
    dateFin: "31/12/2025",
    renouvellement: "Automatique",
    periodicite: "Annuel",
    notes: "8 missions planifiées.",
  },
  {
    id: 2,
    numero: "CTR-2024-002",
    clientId: 2,
    clientNom: "MTN CI",
    type: "Contrat de prestation",
    objet: "Déploiement fibre optique",
    valeur: 80000000,
    statut: "Actif",
    dateDebut: "01/03/2024",
    dateFin: "28/02/2026",
    renouvellement: "Manuel",
    periodicite: "Ponctuel",
    notes: "2 tranches prévues.",
  },
];

const EQUIPEMENTS_INIT = [
  {
    id: 1,
    reference: "EQ-001",
    nom: "Analyseur de spectre RF",
    categorie: "Mesure",
    marque: "Rohde & Schwarz",
    modele: "FSH4",
    quantiteTotal: 2,
    quantiteDisponible: 1,
    etat: "Bon",
    valeur: 4500000,
    notes: "",
  },
  {
    id: 2,
    reference: "EQ-002",
    nom: "Câble coaxial RG-214 (50m)",
    categorie: "Câblage",
    marque: "Belden",
    modele: "RG214",
    quantiteTotal: 20,
    quantiteDisponible: 8,
    etat: "Bon",
    valeur: 85000,
    notes: "",
  },
  {
    id: 3,
    reference: "EQ-003",
    nom: "Antenne directionnelle 18dBi",
    categorie: "Antenne",
    marque: "Kathrein",
    modele: "K739056",
    quantiteTotal: 5,
    quantiteDisponible: 3,
    etat: "Bon",
    valeur: 750000,
    notes: "",
  },
  {
    id: 4,
    reference: "EQ-004",
    nom: "Groupe électrogène 10KVA",
    categorie: "Energie",
    marque: "Perkins",
    modele: "P44-2S",
    quantiteTotal: 1,
    quantiteDisponible: 0,
    etat: "En maintenance",
    valeur: 8500000,
    notes: "Maintenance jusqu'au 30/04",
  },
  {
    id: 5,
    reference: "EQ-005",
    nom: "Harnais de sécurité",
    categorie: "Sécurité",
    marque: "Petzl",
    modele: "NEWTON",
    quantiteTotal: 6,
    quantiteDisponible: 2,
    etat: "Bon",
    valeur: 185000,
    notes: "",
  },
  {
    id: 6,
    reference: "EQ-006",
    nom: "Connecteurs N mâle (lot 50)",
    categorie: "Consommable",
    marque: "Amphenol",
    modele: "82-67",
    quantiteTotal: 150,
    quantiteDisponible: 23,
    etat: "Bon",
    valeur: 8500,
    notes: "Stock faible",
  },
  {
    id: 7,
    reference: "EQ-007",
    nom: "Réflectomètre OTDR",
    categorie: "Mesure",
    marque: "EXFO",
    modele: "FTB-200",
    quantiteTotal: 1,
    quantiteDisponible: 1,
    etat: "Bon",
    valeur: 6200000,
    notes: "",
  },
];

const ATTRIBUTIONS_INIT = [
  {
    id: 1,
    equipementId: 1,
    equipementNom: "Analyseur de spectre RF",
    quantite: 1,
    technicien: "Koffi F.",
    chantierId: 3,
    chantierNom: "Installation Shelter Daloa",
    dateAttribution: "01/03/2025",
    dateRetourPrevue: "20/04/2025",
    dateRetour: null,
    etatDepart: "Bon",
    etatRetour: null,
    notes: "",
  },
  {
    id: 2,
    equipementId: 2,
    equipementNom: "Câble coaxial RG-214",
    quantite: 6,
    technicien: "Traoré B.",
    chantierId: 1,
    chantierNom: "Site BTS Adjamé Nord",
    dateAttribution: "02/03/2025",
    dateRetourPrevue: "30/04/2025",
    dateRetour: null,
    etatDepart: "Bon",
    etatRetour: null,
    notes: "",
  },
  {
    id: 3,
    equipementId: 5,
    equipementNom: "Harnais de sécurité",
    quantite: 2,
    technicien: "Bamba E.",
    chantierId: 2,
    chantierNom: "Fibre Optique Zone Industrielle",
    dateAttribution: "01/03/2025",
    dateRetourPrevue: "30/06/2025",
    dateRetour: null,
    etatDepart: "Bon",
    etatRetour: null,
    notes: "",
  },
  {
    id: 4,
    equipementId: 3,
    equipementNom: "Antenne directionnelle",
    quantite: 2,
    technicien: "Traoré B.",
    chantierId: 1,
    chantierNom: "Site BTS Adjamé Nord",
    dateAttribution: "02/03/2025",
    dateRetourPrevue: "30/04/2025",
    dateRetour: "10/04/2025",
    etatDepart: "Bon",
    etatRetour: "Bon",
    notes: "",
  },
];

const DOCUMENTS_INIT = [
  {
    id: 1,
    nom: "Plan installation BTS Adjamé.pdf",
    type: "pdf",
    categorie: "Plan technique",
    chantierId: 1,
    chantierNom: "Site BTS Adjamé Nord",
    version: "v1.2",
    taille: "2.4 MB",
    uploadePar: "Konan A.",
    dateUpload: "03/03/2025",
    description: "Plan complet avec côtes",
    tags: ["plan", "BTS", "Orange CI"],
    accesRoles: ["admin", "chef", "technicien"],
  },
  {
    id: 2,
    nom: "PV réception Bouaké.pdf",
    type: "pdf",
    categorie: "PV / Rapport",
    chantierId: 4,
    chantierNom: "Maintenance Tour Bouaké",
    version: "v1.0",
    taille: "1.1 MB",
    uploadePar: "Koffi F.",
    dateUpload: "26/01/2025",
    description: "PV signé client",
    tags: ["PV", "Moov Africa"],
    accesRoles: ["admin", "chef", "technicien"],
  },
  {
    id: 3,
    nom: "Contrat Orange CI 2024-2025.pdf",
    type: "pdf",
    categorie: "Contrat",
    chantierId: null,
    chantierNom: null,
    version: "v1.0",
    taille: "3.8 MB",
    uploadePar: "Diallo K.",
    dateUpload: "15/01/2024",
    description: "Contrat cadre signé",
    tags: ["contrat", "Orange CI"],
    accesRoles: ["admin"],
  },
  {
    id: 4,
    nom: "Procédure installation shelter.docx",
    type: "doc",
    categorie: "Procédure",
    chantierId: null,
    chantierNom: null,
    version: "v3.1",
    taille: "450 KB",
    uploadePar: "Diallo K.",
    dateUpload: "01/01/2025",
    description: "Procédure standard",
    tags: ["procédure", "shelter"],
    accesRoles: ["admin", "chef", "technicien"],
  },
];

const CONVERSATIONS_INIT = [
  {
    id: 1,
    type: "projet",
    nom: "BTS Adjamé Nord",
    chantierId: 1,
    avatar: "📡",
    participants: ["Diallo K.", "Konan A.", "Traoré B."],
    messages: [
      {
        id: 1,
        auteur: "Konan A.",
        role: "chef",
        contenu: "Avancement 72%. Équipements radio arrivent demain.",
        date: "10/04/2025 09:15",
        urgent: false,
        lu: true,
      },
      {
        id: 2,
        auteur: "Diallo K.",
        role: "admin",
        contenu: "Orange CI demande un rapport avant vendredi.",
        date: "10/04/2025 11:00",
        urgent: false,
        lu: false,
      },
    ],
  },
  {
    id: 2,
    type: "projet",
    nom: "Fibre Zone Industrielle",
    chantierId: 2,
    avatar: "🔌",
    participants: ["Diallo K.", "Konan A.", "Bamba E."],
    messages: [
      {
        id: 1,
        auteur: "Bamba E.",
        role: "technicien",
        contenu: "URGENT: Gardien refuse l'accès. Besoin BC signé.",
        date: "15/04/2025 08:45",
        urgent: true,
        lu: false,
      },
    ],
  },
  {
    id: 3,
    type: "equipe",
    nom: "Direction",
    avatar: "👔",
    participants: ["Diallo K.", "Konan A."],
    messages: [
      {
        id: 1,
        auteur: "Konan A.",
        role: "chef",
        contenu: "Problème accès Fibre Zone Ind. Besoin BC signé rapidement.",
        date: "15/04/2025 09:05",
        urgent: true,
        lu: false,
      },
    ],
  },
];

// ════════════ UTILITAIRES ════════════

const fmt = (n) =>
  new Intl.NumberFormat("fr-CI").format(Math.round(n)) + " FCFA";
const todayStr = () =>
  new Date().toLocaleDateString("fr-CI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
const nowStr = () =>
  new Date().toLocaleString("fr-CI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
function joursRestants(str) {
  if (!str) return null;
  let date;
  if (str.includes('-')) {
    date = new Date(str);
  } else {
    const [d, m, y] = str.split("/");
    date = new Date(y, m - 1, d);
  }
  return Math.ceil((date - new Date()) / 864e5);
}
function statutDelai(dateFin, statut) {
  if (statut === "Terminé")
    return { label: "Terminé", color: "#60a5fa", bg: "#1a2a3a" };
  const j = joursRestants(dateFin);
  if (j === null) return null;
  if (j < 0)
    return { label: `${Math.abs(j)}j retard`, color: "#f87171", bg: "#2a1a1a" };
  if (j <= 7) return { label: `Urgent·${j}j`, color: "#fb923c", bg: "#3a2a1a" };
  if (j <= 14)
    return { label: `${j}j restants`, color: "#fbbf24", bg: "#2a2a1a" };
  return { label: `${j}j restants`, color: "#4ade80", bg: "#1a3a2a" };
}
const SC = (s) =>
  ({
    in_progress: { bg: "#1a3a2a", t: "#4ade80" },
    "En cours": { bg: "#1a3a2a", t: "#4ade80" },
    completed: { bg: "#1a2a3a", t: "#60a5fa" },
    Terminé: { bg: "#1a2a3a", t: "#60a5fa" },
    planned: { bg: "#3a2a1a", t: "#fb923c" },
    "En attente": { bg: "#3a2a1a", t: "#fb923c" },
    draft: { bg: "#2a1a3a", t: "#c084fc" },
    Planifié: { bg: "#2a1a3a", t: "#c084fc" },
    archived: { bg: "#2a2a2a", t: "#6b8a6e" },
  })[s] || { bg: "#2a1a3a", t: "#c084fc" };

const DEVIS_SC = (s) =>
  ({
    draft: { bg: "#2a1a3a", t: "#c084fc" },
    Brouillon: { bg: "#2a1a3a", t: "#c084fc" },
    sent: { bg: "#1a2a3a", t: "#60a5fa" },
    Envoyé: { bg: "#1a2a3a", t: "#60a5fa" },
    accepted: { bg: "#1a3a2a", t: "#4ade80" },
    Accepté: { bg: "#1a3a2a", t: "#4ade80" },
    refused: { bg: "#3a1a1a", t: "#f87171" },
    Refusé: { bg: "#3a1a1a", t: "#f87171" },
    expired: { bg: "#2a2a1a", t: "#fbbf24" },
    invoiced: { bg: "#1a2a3a", t: "#60a5fa" },
  })[s] || { bg: "#2a1a2a", t: "#a0a0a0" };

const FAC_SC = (s) =>
  ({
    paid: { bg: "#1a3a2a", t: "#4ade80" },
    Payée: { bg: "#1a3a2a", t: "#4ade80" },
    sent: { bg: "#1a2a3a", t: "#60a5fa" },
    "En attente": { bg: "#1a2a3a", t: "#60a5fa" },
    overdue: { bg: "#3a1a1a", t: "#f87171" },
    "En retard": { bg: "#3a1a1a", t: "#f87171" },
    partial: { bg: "#2a2a1a", t: "#fbbf24" },
    Partielle: { bg: "#2a2a1a", t: "#fbbf24" },
    draft: { bg: "#2a1a3a", t: "#c084fc" },
    cancelled: { bg: "#2a2a2a", t: "#6b8a6e" },
  })[s] || { bg: "#2a1a2a", t: "#a0a0a0" };
function whatsapp(tel, msg) {
  const n = "225" + tel.replace(/\s/g, "");
  window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ════════════ CSS ════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0f0d}::-webkit-scrollbar-thumb{background:#2a3f2e;border-radius:2px}
body,#root{font-family:'DM Sans',sans-serif;background:#0a0f0d;color:#e8ede9;min-height:100vh}
.sb-btn{background:none;border:none;cursor:pointer;padding:8px 12px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#6b8a6e;width:100%;text-align:left;display:flex;align-items:center;gap:8px;transition:all 0.15s}
.sb-btn.active{background:#1a2e1d;color:#4ade80}.sb-btn:hover:not(.active){color:#a0b8a2;background:#0d1a10}
.card{background:#111a13;border:1px solid #1e301f;border-radius:14px;padding:20px}
.row{background:#0d1610;border:1px solid #1e301f;border-radius:12px;padding:14px 18px;cursor:pointer;transition:all 0.2s;margin-bottom:8px}
.row:hover{border-color:#2d4d30;background:#111a13}
.pbar{height:6px;background:#1e301f;border-radius:3px;overflow:hidden}
.pfill{height:100%;border-radius:3px;transition:width 0.5s}
.btn-g{background:#4ade80;border:none;border-radius:10px;padding:10px 18px;cursor:pointer;font-weight:600;color:#0a0f0d;font-size:13px;font-family:'DM Sans',sans-serif;transition:all 0.2s;white-space:nowrap}
.btn-g:hover{background:#22c55e}.btn-g:disabled{background:#1e301f;color:#4a6a4d;cursor:not-allowed}
.btn-a{background:#1a3a2a;border:1px solid #2d5a30;border-radius:10px;padding:9px 16px;cursor:pointer;font-weight:600;color:#4ade80;font-size:13px;font-family:'DM Sans',sans-serif;transition:all 0.2s}
.btn-a:hover{background:#1e4a2e}
.btn-b{background:#1a2a3a;border:1px solid #2d4d6a;border-radius:8px;padding:7px 13px;cursor:pointer;font-size:12px;color:#60a5fa;font-family:'DM Sans',sans-serif;font-weight:600}
.btn-b:hover{background:#1e3a4e}
.btn-r{background:#3a1a1a;border:1px solid #5a2d2d;border-radius:8px;padding:7px 13px;cursor:pointer;font-size:12px;color:#f87171;font-family:'DM Sans',sans-serif;font-weight:600}
.btn-r:hover{background:#4a1a1a}
.btn-o{background:#3a2a1a;border:1px solid #6a4d2d;border-radius:8px;padding:7px 13px;cursor:pointer;font-size:12px;color:#fb923c;font-family:'DM Sans',sans-serif;font-weight:600}
.btn-o:hover{background:#4a3a2a}
.field{background:#0d1610;border:1px solid #1e301f;border-radius:10px;padding:10px 14px;color:#e8ede9;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;width:100%;transition:border-color 0.2s}
.field:focus{border-color:#4ade80}.field::placeholder{color:#3a5a3d}
textarea.field{resize:vertical;min-height:80px}
select.field option{background:#111a13}
.lbl{font-size:11px;color:#4a6a4d;margin-bottom:5px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;display:block}
.fg{margin-bottom:13px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px)}
.modal{background:#111a13;border:1px solid #1e301f;border-radius:18px;padding:26px;width:560px;max-width:95vw;max-height:90vh;overflow-y:auto}
.nav-pill{display:flex;background:#0d1610;border-radius:10px;padding:3px;gap:2px;margin-bottom:16px;flex-wrap:wrap}
.np-btn{border:none;border-radius:7px;padding:6px 10px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;background:transparent;color:#4a6a4d;transition:all 0.15s}
.np-btn.active{background:#1a3a2a;color:#4ade80}.np-btn:hover:not(.active){color:#a0b8a2}
.trow{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#0d1610;border-radius:10px;margin-bottom:6px;border:1px solid #1a2e1d;cursor:pointer;transition:background 0.15s}
.trow:hover{background:#111a13}
.tcheck{width:18px;height:18px;border-radius:4px;border:2px solid #2d5a30;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s}
.tcheck.done{background:#4ade80;border-color:#4ade80}
.bloc-card{background:#1a0f0a;border:1px solid #4a2a1a;border-radius:10px;padding:12px 14px;margin-bottom:8px}
.rpt-card{background:#0d1610;border:1px solid #1a2e1d;border-radius:10px;padding:12px 14px;margin-bottom:8px}
.pzone{border:2px dashed #1e301f;border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#0d1610}
.pzone:hover{border-color:#4ade80}
.conv-item{padding:12px 16px;cursor:pointer;border-bottom:1px solid #1a2e1d;display:flex;align-items:center;gap:12px;transition:background 0.15s}
.conv-item:hover{background:#0a1a0d}.conv-item.sel{background:#0d1f0d;border-left:3px solid #4ade80}
.chip{display:inline-flex;align-items:center;gap:6px;background:#1a3a2a;border:1px solid #2d5a30;border-radius:20px;padding:4px 10px;font-size:12px;color:#4ade80}
.kpi{background:#111a13;border:1px solid #1e301f;border-radius:12px;padding:16px;cursor:pointer;transition:border-color 0.2s}
.kpi:hover{border-color:#2d4d30}
.tab-group{display:flex;gap:3px;background:#0d1610;border-radius:10px;padding:3px;width:fit-content;margin-bottom:20px;flex-wrap:wrap}
.tg-btn{background:none;border:none;cursor:pointer;padding:7px 14px;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#4a6a4d;transition:all 0.15s}
.tg-btn.active{background:#1a3a2a;color:#4ade80}.tg-btn:hover:not(.active){color:#a0b8a2}
.input-li{background:#0d1610;border:1px solid #1e301f;border-radius:12px;padding:13px 16px;color:#e8ede9;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;width:100%;transition:border-color 0.2s}
.input-li:focus{border-color:#4ade80}.input-li::placeholder{color:#2a4a2d}
.notif-dot{width:16px;height:16px;background:#f87171;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:white;flex-shrink:0}
.alert-bar{background:#2a1a1a;border:1px solid #5a2a2a;border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#f87171;cursor:pointer}
.alert-bar.orange{background:#2a1f0a;border-color:#5a4a1a;color:#fb923c}
.alert-bar.blue{background:#1a1f2a;border-color:#2a3a5a;color:#60a5fa}
.alert-bar.green{background:#1a2a1a;border-color:#2a4a2a;color:#4ade80}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp 0.35s ease}
@keyframes puls{0%,100%{opacity:1}50%{opacity:0.4}}
.dp{animation:puls 1.2s ease-in-out infinite}
@keyframes bell{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}
.bell{animation:bell 0.5s ease}
`;

// ════════════ COMPOSANTS PARTAGÉS ════════════

function DelaiTag({ dateFin, statut }) {
  const d = statutDelai(dateFin, statut);
  if (!d) return null;
  return (
    <span className="badge" style={{ background: d.bg, color: d.color }}>
      {d.label}
    </span>
  );
}

function Back({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#1a2e1d",
        border: "none",
        color: "#4ade80",
        cursor: "pointer",
        borderRadius: 8,
        padding: "7px 13px",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 13,
        marginBottom: 14,
      }}
    >
      ← Retour
    </button>
  );
}

function SectionTitle({ title, sub, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {title}
        </h1>
        {sub && (
          <p style={{ color: "#4a6a4d", fontSize: 13, marginTop: 3 }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function KpiGrid({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 12,
        marginBottom: 20,
      }}
    >
      {items.map((k, i) => (
        <div key={i} className="kpi" onClick={k.onClick}>
          <div
            style={{
              fontSize: 10,
              color: "#4a6a4d",
              fontWeight: 600,
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {k.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: k.color,
              fontFamily: "'Space Grotesk',sans-serif",
              lineHeight: 1,
            }}
          >
            {k.value}
          </div>
          {k.sub && (
            <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 4 }}>
              {k.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        marginBottom: 9,
        padding: "9px 13px",
        background: "#0d1610",
        borderRadius: 9,
        border: "1px solid #1a2e1d",
      }}
    >
      <span
        style={{ fontSize: 12, color: "#3a5a3d", width: 110, flexShrink: 0 }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#c8deca" }}>{value}</span>
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            {title}
          </h2>
          <button
            className="btn-b"
            onClick={onClose}
            style={{ padding: "5px 10px" }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AssignModal({ chantier, equipes, onSave, onClose }) {
  const [membres, setMembres] = useState([...chantier.equipe]);
  function toggle(nom) {
    setMembres((p) =>
      p.includes(nom) ? p.filter((n) => n !== nom) : [...p, nom],
    );
  }
  return (
    <Modal title="Assigner l'équipe" onClose={onClose} width={420}>
      <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
        {chantier.nom}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label className="lbl">Membres assignés</label>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 32 }}
        >
          {membres.length === 0 && (
            <span style={{ fontSize: 13, color: "#3a5a3d" }}>Aucun membre</span>
          )}
          {membres.map((nom) => (
            <div key={nom} className="chip">
              {nom}
              <button
                onClick={() => toggle(nom)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#f87171",
                  fontSize: 14,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <label className="lbl">Ajouter / retirer</label>
      {equipes.map((e) => {
        const sel = membres.includes(e.nom);
        return (
          <div
            key={e.id}
            onClick={() => toggle(e.nom)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 13px",
              background: sel ? "#1a3a2a" : "#0d1610",
              border: `1px solid ${sel ? "#2d5a30" : "#1a2e1d"}`,
              borderRadius: 10,
              cursor: "pointer",
              marginBottom: 5,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1a3a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: ROLE_COLORS[e.role],
              }}
            >
              {e.nom.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}>
                {e.nom}
              </div>
              <div style={{ fontSize: 11, color: "#4a6a4d" }}>{e.poste}</div>
            </div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: `2px solid ${sel ? "#4ade80" : "#2d5a30"}`,
                background: sel ? "#4ade80" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {sel && (
                <span
                  style={{ color: "#0a0f0d", fontSize: 9, fontWeight: 700 }}
                >
                  ✓
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          className="btn-g"
          style={{ flex: 1 }}
          onClick={() => {
            onSave(membres);
            onClose();
          }}
        >
          Enregistrer
        </button>
        <button className="btn-b" onClick={onClose}>
          Annuler
        </button>
      </div>
    </Modal>
  );
}

function NotifPanel({ notifs, unread, show, setShow, markRead }) {
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => {
          setShow((p) => !p);
          if (!show) markRead();
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: 6,
          color: unread > 0 ? "#fb923c" : "#4a6a4d",
        }}
      >
        <span style={{ fontSize: 17 }} className={unread > 0 ? "bell" : ""}>
          🔔
        </span>
        {unread > 0 && (
          <span
            className="notif-dot"
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            {unread}
          </span>
        )}
      </button>
      {show && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 34,
            width: 290,
            background: "#111a13",
            border: "1px solid #1e301f",
            borderRadius: 13,
            zIndex: 300,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "11px 15px",
              borderBottom: "1px solid #1a2e1d",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}>
              Notifications
            </span>
            <button
              className="btn-b"
              onClick={() => setShow(false)}
              style={{ padding: "3px 8px", fontSize: 11 }}
            >
              ✕
            </button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  fontSize: 13,
                  color: "#3a5a3d",
                  textAlign: "center",
                }}
              >
                Aucune notification
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #1a2e1d",
                  }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <span>
                      {n.type === "blocage"
                        ? "⚠️"
                        : n.type === "retard"
                          ? "🔴"
                          : "📋"}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#c8deca",
                          lineHeight: 1.4,
                        }}
                      >
                        {n.msg}
                      </div>
                      <div
                        style={{ fontSize: 10, color: "#3a5a3d", marginTop: 2 }}
                      >
                        {n.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MsgPanel({
  user,
  conversations,
  setConversations,
  equipes,
  mesConvs,
}) {
  const [activeConv, setActiveConv] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ nom: "", participants: [] });
  const msgEnd = useRef();

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv, conversations]);

  function sendMsg() {
    if (!msgText.trim() || !activeConv) return;
    const msg = {
      id: Date.now(),
      auteur: user.nom,
      role: user.role,
      contenu: msgText.trim(),
      date: nowStr(),
      urgent: isUrgent,
      lu: false,
    };
    setConversations((p) =>
      p.map((c) =>
        c.id === activeConv.id ? { ...c, messages: [...c.messages, msg] } : c,
      ),
    );
    setActiveConv((p) => ({ ...p, messages: [...p.messages, msg] }));
    if (isUrgent) {
      const dest = equipes.find(
        (e) => e.nom !== user.nom && activeConv.participants.includes(e.nom),
      );
      if (dest?.tel)
        whatsapp(
          dest.tel,
          `[URGENT DIGINETS] ${activeConv.nom}\n${msgText.trim()}`,
        );
    }
    setMsgText("");
    setIsUrgent(false);
  }

  function markRead(id) {
    setConversations((p) =>
      p.map((c) =>
        c.id === id
          ? { ...c, messages: c.messages.map((m) => ({ ...m, lu: true })) }
          : c,
      ),
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 180px)",
        minHeight: 400,
        background: "#0a0f0d",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #1a2e1d",
      }}
    >
      <div
        style={{
          width: 240,
          borderRight: "1px solid #1a2e1d",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #1a2e1d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}>
            Messages
          </span>
          <button
            onClick={() => setShowNew(true)}
            style={{
              background: "#1a3a2a",
              border: "none",
              color: "#4ade80",
              borderRadius: 7,
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            +
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {mesConvs.map((conv) => {
            const nl = conv.messages.filter(
              (m) => !m.lu && m.auteur !== user.nom,
            ).length;
            const last = conv.messages[conv.messages.length - 1];
            return (
              <div
                key={conv.id}
                className={`conv-item ${activeConv?.id === conv.id ? "sel" : ""}`}
                onClick={() => {
                  setActiveConv(conv);
                  markRead(conv.id);
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#1a3a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {conv.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d4e8d6",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {conv.nom}
                    </span>
                    {nl > 0 && (
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          background: "#4ade80",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#0a0f0d",
                          flexShrink: 0,
                        }}
                      >
                        {nl}
                      </span>
                    )}
                  </div>
                  {last && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3a5a3d",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {last.urgent ? "⚠️ " : ""}
                      {last.auteur}: {last.contenu}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {!activeConv ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 36 }}>💬</div>
          <div style={{ fontSize: 13, color: "#4a6a4d" }}>
            Sélectionnez une conversation
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{ padding: "11px 16px", borderBottom: "1px solid #1a2e1d" }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}>
              {activeConv.nom}
            </div>
            <div style={{ fontSize: 11, color: "#4a6a4d" }}>
              {activeConv.participants.join(", ")}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {activeConv.messages.map((m) => {
              const mine = m.auteur === user.nom;
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {!mine && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#1a3a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: ROLE_COLORS[m.role],
                        flexShrink: 0,
                      }}
                    >
                      {m.auteur.charAt(0)}
                    </div>
                  )}
                  <div style={{ maxWidth: "72%" }}>
                    {m.urgent && (
                      <div
                        style={{
                          background: "#2a1a0a",
                          border: "1px solid #5a3a1a",
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontSize: 10,
                          color: "#fb923c",
                          fontWeight: 600,
                          marginBottom: 4,
                          display: "inline-block",
                        }}
                      >
                        ⚠️ URGENT
                      </div>
                    )}
                    {!mine && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#4a6a4d",
                          marginBottom: 3,
                        }}
                      >
                        {m.auteur}
                      </div>
                    )}
                    <div
                      style={{
                        padding: "9px 13px",
                        borderRadius: mine
                          ? "13px 13px 4px 13px"
                          : "13px 13px 13px 4px",
                        background: mine ? "#1a3a2a" : "#111a13",
                        border: mine ? "none" : "1px solid #1e301f",
                        fontSize: 13,
                        color: mine ? "#d4f5d8" : "#c8deca",
                      }}
                    >
                      {m.contenu}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#3a5a3d",
                        marginTop: 3,
                        textAlign: mine ? "right" : "left",
                      }}
                    >
                      {m.date}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEnd} />
          </div>
          <div style={{ padding: "11px 16px", borderTop: "1px solid #1a2e1d" }}>
            {isUrgent && (
              <div
                style={{
                  background: "#2a1a0a",
                  border: "1px solid #5a3a1a",
                  borderRadius: 8,
                  padding: "5px 12px",
                  marginBottom: 8,
                  fontSize: 11,
                  color: "#fb923c",
                }}
              >
                ⚠️ Urgent — WhatsApp automatique
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button
                onClick={() => setIsUrgent((p) => !p)}
                style={{
                  background: isUrgent ? "#3a2a1a" : "#1a2e1d",
                  border: `1px solid ${isUrgent ? "#6a4a2a" : "#2d5a30"}`,
                  borderRadius: 8,
                  padding: "9px 11px",
                  cursor: "pointer",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                ⚠️
              </button>
              <textarea
                className="field"
                style={{
                  borderRadius: 10,
                  resize: "none",
                  height: 40,
                  padding: "9px 13px",
                }}
                placeholder="Écrire... (Entrée pour envoyer)"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMsg();
                  }
                }}
              />
              <button
                className="btn-g"
                onClick={sendMsg}
                disabled={!msgText.trim()}
                style={{ flexShrink: 0, height: 40, padding: "0 16px" }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
      {showNew && (
        <Modal
          title="Nouvelle conversation"
          onClose={() => setShowNew(false)}
          width={400}
        >
          <div className="fg">
            <label className="lbl">Nom *</label>
            <input
              className="field"
              value={newForm.nom}
              onChange={(e) =>
                setNewForm((f) => ({ ...f, nom: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Participants</label>
            {equipes.map((e) => (
              <div
                key={e.id}
                onClick={() =>
                  setNewForm((f) => ({
                    ...f,
                    participants: f.participants.includes(e.nom)
                      ? f.participants.filter((p) => p !== e.nom)
                      : [...f.participants, e.nom],
                  }))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: newForm.participants.includes(e.nom)
                    ? "#1a3a2a"
                    : "#0d1610",
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: "pointer",
                  border: `1px solid ${newForm.participants.includes(e.nom) ? "#2d5a30" : "#1a2e1d"}`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: `2px solid ${newForm.participants.includes(e.nom) ? "#4ade80" : "#2d5a30"}`,
                    background: newForm.participants.includes(e.nom)
                      ? "#4ade80"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {newForm.participants.includes(e.nom) && (
                    <span
                      style={{ color: "#0a0f0d", fontSize: 9, fontWeight: 700 }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "#d4e8d6" }}>{e.nom}</span>
                <span style={{ fontSize: 11, color: "#4a6a4d" }}>
                  {e.poste}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!newForm.nom) return;
                setConversations((p) => [
                  ...p,
                  {
                    id: Date.now(),
                    type: "direct",
                    nom: newForm.nom,
                    avatar: "💬",
                    participants: [
                      ...new Set([user.nom, ...newForm.participants]),
                    ],
                    messages: [],
                  },
                ]);
                setNewForm({ nom: "", participants: [] });
                setShowNew(false);
              }}
              disabled={!newForm.nom}
            >
              Créer
            </button>
            <button className="btn-b" onClick={() => setShowNew(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════ LOGIN ════════════

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [showQ, setShowQ] = useState(false);
  function login() {
    const u = USERS.find((u) => u.email === email && u.password === pass);
    u ? onLogin(u) : setErr("Email ou mot de passe incorrect");
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="fu" style={{ width: 400, maxWidth: "95vw" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 30,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            DIGINETS CI
          </div>
          <div style={{ fontSize: 13, color: "#3a5a3d", marginTop: 5 }}>
            ERP Gestion de chantiers télécom
          </div>
        </div>
        <div className="card">
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#d4e8d6",
              marginBottom: 18,
            }}
          >
            Connexion
          </div>
          <div className="fg">
            <label className="lbl">Email</label>
            <input
              className="input-li"
              placeholder="votre@diginets.ci"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
          <div className="fg">
            <label className="lbl">Mot de passe</label>
            <input
              type="password"
              className="input-li"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
          </div>
          {err && (
            <div
              style={{
                color: "#f87171",
                fontSize: 13,
                marginBottom: 14,
                padding: "8px 12px",
                background: "#2a1a1a",
                borderRadius: 8,
              }}
            >
              {err}
            </div>
          )}
          <button
            className="btn-g"
            style={{ width: "100%", padding: "12px" }}
            onClick={login}
          >
            Se connecter
          </button>
          <div
            style={{
              marginTop: 18,
              borderTop: "1px solid #1e301f",
              paddingTop: 14,
            }}
          >
            <button
              onClick={() => setShowQ((p) => !p)}
              style={{
                background: "none",
                border: "none",
                color: "#3a5a3d",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {showQ ? "▲" : "▼"} Comptes de démonstration
            </button>
            {showQ && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {USERS.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setEmail(u.email);
                      setPass(u.password);
                    }}
                    style={{
                      border: "1px solid #1e301f",
                      borderRadius: 10,
                      padding: "9px 13px",
                      cursor: "pointer",
                      background: "#0d1610",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#1a3a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: ROLE_COLORS[u.role],
                      }}
                    >
                      {u.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#d4e8d6",
                        }}
                      >
                        {u.nom}
                      </div>
                      <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                        {u.email}
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: "#1a1a2a",
                        color: ROLE_COLORS[u.role],
                      }}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════ VUE TECHNICIEN ════════════
// Accès uniquement : Missions, Tâches, Photos, Rapports, Blocages, Pointage, Documents (lecture), Messagerie

function TechnicienView({ user, state, onLogout }) {
  const {
    chantiers,
    setChantiers,
    documents,
    conversations,
    setConversations,
    equipes,
  } = state;
  const mesMissions = chantiers.filter((c) =>
    c.equipe.some((m) => m.includes(user.nom.split(" ")[0])),
  );
  const [tab, setTab] = useState("missions");
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState("infos");
  const [showRapport, setShowRapport] = useState(false);
  const [showBlocage, setShowBlocage] = useState(false);
  const [rptForm, setRptForm] = useState({
    travaux: "",
    problemes: "",
    materiel: "",
    remarques: "",
  });
  const [blcForm, setBlcForm] = useState({
    type: "Matériel manquant",
    description: "",
  });
  const photoRef = useRef();
  const [showNt, setShowNt] = useState(false);

  const retards = mesMissions.filter(
    (c) => c.statut !== "Terminé" && joursRestants(c.dateFin) < 0,
  );
  const blocagesActifs = mesMissions.reduce(
    (s, c) => s + (c.blocages || []).filter((b) => !b.resolu).length,
    0,
  );
  const mesConvs = conversations.filter((c) =>
    c.participants.includes(user.nom),
  );
  const msgsNonLus = mesConvs.reduce(
    (s, c) =>
      s + c.messages.filter((m) => !m.lu && m.auteur !== user.nom).length,
    0,
  );

  function upd(id, patch) {
    setChantiers((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (selected?.id === id) setSelected((p) => ({ ...p, ...patch }));
  }

  function toggleTache(tid) {
    const taches = selected.taches.map((t) =>
      t.id === tid ? { ...t, done: !t.done } : t,
    );
    const av = Math.round(
      (taches.filter((t) => t.done).length / taches.length) * 100,
    );
    upd(selected.id, { taches, avancement: av });
  }

  function handlePhoto(e) {
    Array.from(e.target.files).forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) =>
        upd(selected.id, {
          photos: [
            ...(selected.photos || []),
            {
              url: ev.target.result,
              nom: file.name,
              date: todayStr(),
              technicien: user.nom,
            },
          ],
        });
      r.readAsDataURL(file);
    });
  }

  function submitRapport() {
    if (!rptForm.travaux) return;
    upd(selected.id, {
      rapports: [
        ...(selected.rapports || []),
        { ...rptForm, id: Date.now(), date: nowStr(), technicien: user.nom },
      ],
    });
    setRptForm({ travaux: "", problemes: "", materiel: "", remarques: "" });
    setShowRapport(false);
  }

  function submitBlocage() {
    if (!blcForm.description) return;
    upd(selected.id, {
      blocages: [
        ...(selected.blocages || []),
        {
          ...blcForm,
          id: Date.now(),
          date: nowStr(),
          technicien: user.nom,
          resolu: false,
        },
      ],
    });
    setBlcForm({ type: "Matériel manquant", description: "" });
    setShowBlocage(false);
  }

  function pointer(type) {
    const presences = [...(selected.presences || [])];
    const auj = presences.find(
      (p) => p.date === todayStr() && p.technicien === user.nom,
    );
    if (type === "arrivee" && !auj)
      presences.push({
        technicien: user.nom,
        date: todayStr(),
        arrivee: new Date().toLocaleTimeString("fr-CI", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        depart: null,
      });
    else if (type === "depart" && auj && !auj.depart) {
      const i = presences.indexOf(auj);
      presences[i] = {
        ...auj,
        depart: new Date().toLocaleTimeString("fr-CI", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }
    upd(selected.id, { presences });
  }

  const pointageAuj = selected?.presences?.find(
    (p) => p.date === todayStr() && p.technicien === user.nom,
  );

  const TABS = [
    { id: "missions", label: "📋 Missions" },
    {
      id: "messagerie",
      label: `💬 Messages${msgsNonLus > 0 ? ` (${msgsNonLus})` : ""}`,
    },
    { id: "documents", label: "🗂️ Documents" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <div
        style={{
          background: "#0d1610",
          borderBottom: "1px solid #1a2e1d",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            DIGINETS CI
          </div>
          <div style={{ fontSize: 11, color: "#3a5a3d" }}>
            Espace technicien
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NotifPanel
            notifs={[]}
            unread={0}
            show={showNt}
            setShow={setShowNt}
            markRead={() => {}}
          />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}>
              {user.nom}
            </div>
            <span
              className="badge"
              style={{ background: "#1a3a2a", color: "#4ade80", fontSize: 10 }}
            >
              Technicien
            </span>
          </div>
          <button className="btn-r" style={{ fontSize: 12 }} onClick={onLogout}>
            ← Sortir
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        <div className="tab-group" style={{ marginBottom: 16 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tg-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => {
                setTab(t.id);
                setSelected(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "missions" && (
          <>
            {!selected ? (
              <>
                {retards.length > 0 && (
                  <div className="alert-bar">
                    🔴 {retards.length} chantier(s) en retard
                  </div>
                )}
                {blocagesActifs > 0 && (
                  <div className="alert-bar orange">
                    ⚠️ {blocagesActifs} blocage(s) actif(s)
                  </div>
                )}
                <KpiGrid
                  items={[
                    {
                      label: "Missions",
                      value: mesMissions.length,
                      color: "#4ade80",
                    },
                    {
                      label: "En cours",
                      value: mesMissions.filter((c) => c.statut === "En cours")
                        .length,
                      color: "#60a5fa",
                    },
                    {
                      label: "Terminées",
                      value: mesMissions.filter((c) => c.statut === "Terminé")
                        .length,
                      color: "#c084fc",
                    },
                    {
                      label: "Blocages",
                      value: blocagesActifs,
                      color: blocagesActifs > 0 ? "#f87171" : "#4ade80",
                    },
                  ]}
                />
                {mesMissions.length === 0 && (
                  <div
                    style={{
                      color: "#3a5a3d",
                      textAlign: "center",
                      padding: "40px 0",
                    }}
                  >
                    Aucune mission assignée.
                  </div>
                )}
                {mesMissions.map((c) => {
                  const d = statutDelai(c.dateFin, c.statut);
                  return (
                    <div
                      key={c.id}
                      className="row"
                      onClick={() => {
                        setSelected(c);
                        setDetailTab("infos");
                      }}
                    >
                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#d4e8d6",
                            marginBottom: 5,
                          }}
                        >
                          {c.nom}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            className="badge"
                            style={{
                              background: SC(c.statut).bg,
                              color: SC(c.statut).t,
                            }}
                          >
                            {c.statut}
                          </span>
                          {d && (
                            <span
                              className="badge"
                              style={{ background: d.bg, color: d.color }}
                            >
                              {d.label}
                            </span>
                          )}
                          {(c.blocages || []).filter((b) => !b.resolu).length >
                            0 && (
                            <span style={{ fontSize: 11, color: "#fb923c" }}>
                              ⚠️{" "}
                              {
                                (c.blocages || []).filter((b) => !b.resolu)
                                  .length
                              }{" "}
                              blocage(s)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                          📍 {c.localisation} · 🔧 {c.type}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#4a6a4d" }}>
                          Avancement
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#4ade80",
                            fontWeight: 600,
                          }}
                        >
                          {c.avancement}%
                        </span>
                      </div>
                      <div className="pbar">
                        <div
                          className="pfill"
                          style={{
                            width: `${c.avancement}%`,
                            background:
                              "linear-gradient(90deg,#166534,#4ade80)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          fontSize: 11,
                          color: "#3a5a3d",
                          marginTop: 8,
                        }}
                      >
                        <span>
                          ✅ {(c.taches || []).filter((t) => t.done).length}/
                          {(c.taches || []).length} tâches
                        </span>
                        <span>📷 {(c.photos || []).length}</span>
                        <span>📝 {(c.rapports || []).length} rapports</span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <Back onClick={() => setSelected(null)} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#d4e8d6",
                        marginBottom: 6,
                      }}
                    >
                      {selected.nom}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span
                        className="badge"
                        style={{
                          background: SC(selected.statut).bg,
                          color: SC(selected.statut).t,
                        }}
                      >
                        {selected.statut}
                      </span>
                      <DelaiTag
                        dateFin={selected.dateFin}
                        statut={selected.statut}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn-o"
                      onClick={() => setShowBlocage(true)}
                    >
                      ⚠️ Blocage
                    </button>
                    <button
                      className="btn-a"
                      onClick={() => setShowRapport(true)}
                    >
                      📝 Rapport
                    </button>
                    <button
                      className="btn-b"
                      onClick={() => photoRef.current.click()}
                    >
                      📷 Photo
                    </button>
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handlePhoto}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "#0d1610",
                    border: "1px solid #1a2e1d",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#4a6a4d",
                      fontWeight: 600,
                      marginBottom: 8,
                      textTransform: "uppercase",
                    }}
                  >
                    Pointage · {todayStr()}
                  </div>
                  {pointageAuj ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "#4ade80" }}>
                          ✅ Arrivée : {pointageAuj.arrivee}
                        </div>
                        {pointageAuj.depart && (
                          <div
                            style={{
                              fontSize: 13,
                              color: "#60a5fa",
                              marginTop: 3,
                            }}
                          >
                            🏁 Départ : {pointageAuj.depart}
                          </div>
                        )}
                      </div>
                      {!pointageAuj.depart && (
                        <button
                          className="btn-b"
                          onClick={() => pointer("depart")}
                        >
                          Pointer départ
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className="btn-g"
                      style={{ width: "100%", padding: "11px" }}
                      onClick={() => pointer("arrivee")}
                    >
                      ✅ Pointer mon arrivée
                    </button>
                  )}
                </div>

                <div className="nav-pill">
                  {[
                    { id: "infos", label: "Infos" },
                    {
                      id: "taches",
                      label: `Tâches (${(selected.taches || []).filter((t) => t.done).length}/${(selected.taches || []).length})`,
                    },
                    {
                      id: "photos",
                      label: `Photos (${(selected.photos || []).length})`,
                    },
                    {
                      id: "rapports",
                      label: `Rapports (${(selected.rapports || []).length})`,
                    },
                    {
                      id: "blocages",
                      label: `Blocages (${(selected.blocages || []).filter((b) => !b.resolu).length})`,
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={`np-btn ${detailTab === t.id ? "active" : ""}`}
                      onClick={() => setDetailTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {detailTab === "infos" && (
                  <div>
                    <InfoRow label="Type" value={selected.type} />
                    <InfoRow
                      label="Localisation"
                      value={selected.localisation}
                    />
                    <InfoRow
                      label="Période"
                      value={`${selected.dateDebut} → ${selected.dateFin}`}
                    />
                    <InfoRow
                      label="Équipe"
                      value={selected.equipe.join(", ")}
                    />
                    <div
                      style={{
                        background: "#0d1610",
                        borderRadius: 12,
                        padding: 14,
                        border: "1px solid #1a2e1d",
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#4a6a4d" }}>
                          Avancement global
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            color: "#4ade80",
                            fontWeight: 700,
                          }}
                        >
                          {selected.avancement}%
                        </span>
                      </div>
                      <div className="pbar" style={{ height: 8 }}>
                        <div
                          className="pfill"
                          style={{
                            width: `${selected.avancement}%`,
                            background:
                              "linear-gradient(90deg,#166534,#4ade80)",
                          }}
                        />
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#3a5a3d", marginTop: 6 }}
                      >
                        Calculé automatiquement selon les tâches cochées
                      </div>
                    </div>
                    {(selected.presences || []).filter(
                      (p) => p.technicien === user.nom,
                    ).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <label className="lbl">Mes pointages</label>
                        {selected.presences
                          .filter((p) => p.technicien === user.nom)
                          .map((p, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "7px 12px",
                                background: "#0d1610",
                                borderRadius: 8,
                                marginBottom: 4,
                                border: "1px solid #1a2e1d",
                                fontSize: 12,
                              }}
                            >
                              <span style={{ color: "#a0c8a2" }}>{p.date}</span>
                              <span style={{ color: "#4ade80" }}>
                                ↑ {p.arrivee}
                              </span>
                              {p.depart && (
                                <span style={{ color: "#60a5fa" }}>
                                  ↓ {p.depart}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "taches" && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4a6a4d",
                        marginBottom: 12,
                      }}
                    >
                      Cochez les tâches terminées. L'avancement se recalcule
                      automatiquement.
                    </div>
                    {(selected.taches || []).map((t) => (
                      <div
                        key={t.id}
                        className="trow"
                        onClick={() => toggleTache(t.id)}
                      >
                        <div className={`tcheck ${t.done ? "done" : ""}`}>
                          {t.done && (
                            <span
                              style={{
                                color: "#0a0f0d",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            color: t.done ? "#4a6a4d" : "#d4e8d6",
                            textDecoration: t.done ? "line-through" : "none",
                            flex: 1,
                          }}
                        >
                          {t.label}
                        </span>
                        {t.done && (
                          <span style={{ fontSize: 11, color: "#4ade80" }}>
                            ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === "photos" && (
                  <div>
                    <div
                      className="pzone"
                      onClick={() => photoRef.current.click()}
                      style={{ marginBottom: 14 }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                      <div style={{ fontSize: 13, color: "#4a6a4d" }}>
                        Ajouter des photos depuis votre appareil
                      </div>
                    </div>
                    {(selected.photos || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucune photo
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill,minmax(90px,1fr))",
                          gap: 8,
                        }}
                      >
                        {selected.photos.map((p, i) => (
                          <div key={i}>
                            <img
                              src={p.url}
                              alt=""
                              style={{
                                width: "100%",
                                aspectRatio: "1",
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #1e301f",
                              }}
                            />
                            <div
                              style={{
                                fontSize: 10,
                                color: "#3a5a3d",
                                marginTop: 2,
                              }}
                            >
                              {p.technicien} · {p.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {detailTab === "rapports" && (
                  <div>
                    <button
                      className="btn-a"
                      style={{ width: "100%", marginBottom: 14 }}
                      onClick={() => setShowRapport(true)}
                    >
                      + Nouveau rapport
                    </button>
                    {(selected.rapports || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucun rapport soumis
                      </div>
                    ) : (
                      [...selected.rapports].reverse().map((r) => (
                        <div key={r.id} className="rpt-card">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#4ade80",
                              }}
                            >
                              {r.technicien}
                            </span>
                            <span style={{ fontSize: 11, color: "#3a5a3d" }}>
                              {r.date}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#c8deca",
                              marginBottom: 3,
                            }}
                          >
                            <strong style={{ color: "#6b8a6e" }}>
                              Travaux :{" "}
                            </strong>
                            {r.travaux}
                          </div>
                          {r.problemes && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#c8deca",
                                marginBottom: 3,
                              }}
                            >
                              <strong style={{ color: "#6b8a6e" }}>
                                Problèmes :{" "}
                              </strong>
                              {r.problemes}
                            </div>
                          )}
                          {r.materiel && (
                            <div style={{ fontSize: 13, color: "#c8deca" }}>
                              <strong style={{ color: "#6b8a6e" }}>
                                Matériel :{" "}
                              </strong>
                              {r.materiel}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {detailTab === "blocages" && (
                  <div>
                    <button
                      className="btn-o"
                      style={{ width: "100%", marginBottom: 14 }}
                      onClick={() => setShowBlocage(true)}
                    >
                      ⚠️ Signaler un blocage
                    </button>
                    {(selected.blocages || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucun blocage signalé
                      </div>
                    ) : (
                      [...selected.blocages].reverse().map((b) => (
                        <div key={b.id} className="bloc-card">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <span
                              className="badge"
                              style={{
                                background: b.resolu ? "#1a2a3a" : "#3a2a1a",
                                color: b.resolu ? "#60a5fa" : "#fb923c",
                              }}
                            >
                              {b.resolu ? "Résolu" : "Actif"}
                            </span>
                            <span style={{ fontSize: 11, color: "#3a5a3d" }}>
                              {b.date}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#fb923c",
                              marginBottom: 4,
                            }}
                          >
                            {b.type}
                          </div>
                          <div style={{ fontSize: 13, color: "#c8deca" }}>
                            {b.description}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "messagerie" && (
          <MsgPanel
            user={user}
            conversations={conversations}
            setConversations={setConversations}
            equipes={equipes}
            mesConvs={mesConvs}
          />
        )}

        {tab === "documents" && (
          <div>
            <SectionTitle
              title="Documents"
              sub="Documents accessibles à votre profil"
            />
            {documents
              .filter(
                (d) =>
                  d.accesRoles.includes("technicien") &&
                  (d.chantierId === null ||
                    mesMissions.some((m) => m.id === d.chantierId)),
              )
              .map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: "#0d1610",
                    border: "1px solid #1e301f",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      background:
                        { pdf: "#2a1a1a", doc: "#1a2a3a", xlsx: "#1a3a2a" }[
                          d.type
                        ] || "#1a2a3a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {{ pdf: "📄", doc: "📝", xlsx: "📊" }[d.type] || "📎"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#d4e8d6",
                        marginBottom: 3,
                      }}
                    >
                      {d.nom}
                    </div>
                    <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                      {d.categorie} · {d.chantierNom || "Document général"} ·{" "}
                      {d.dateUpload}
                    </div>
                  </div>
                  <button className="btn-b" style={{ fontSize: 11 }}>
                    ⬇️ Voir
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {showRapport && selected && (
        <Modal
          title="📝 Rapport d'intervention"
          onClose={() => setShowRapport(false)}
        >
          <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
            {selected.nom} · {todayStr()}
          </div>
          <div className="fg">
            <label className="lbl">Travaux effectués *</label>
            <textarea
              className="field"
              placeholder="Décrivez les travaux réalisés..."
              value={rptForm.travaux}
              onChange={(e) =>
                setRptForm((f) => ({ ...f, travaux: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Problèmes rencontrés</label>
            <textarea
              className="field"
              style={{ minHeight: 60 }}
              placeholder="Difficultés, incidents..."
              value={rptForm.problemes}
              onChange={(e) =>
                setRptForm((f) => ({ ...f, problemes: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Matériel utilisé</label>
            <input
              className="field"
              placeholder="Ex: Câbles coaxiaux 50m..."
              value={rptForm.materiel}
              onChange={(e) =>
                setRptForm((f) => ({ ...f, materiel: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Remarques</label>
            <textarea
              className="field"
              style={{ minHeight: 50 }}
              value={rptForm.remarques}
              onChange={(e) =>
                setRptForm((f) => ({ ...f, remarques: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={submitRapport}
              disabled={!rptForm.travaux}
            >
              Soumettre
            </button>
            <button className="btn-b" onClick={() => setShowRapport(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showBlocage && selected && (
        <Modal
          title="⚠️ Signaler un blocage"
          onClose={() => setShowBlocage(false)}
          width={420}
        >
          <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
            Visible immédiatement par votre chef de chantier.
          </div>
          <div className="fg">
            <label className="lbl">Type *</label>
            <select
              className="field"
              value={blcForm.type}
              onChange={(e) =>
                setBlcForm((f) => ({ ...f, type: e.target.value }))
              }
            >
              {[
                "Matériel manquant",
                "Accès refusé au site",
                "Panne équipement",
                "Problème sécurité",
                "Attente validation client",
                "Intempéries",
                "Autre",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Description *</label>
            <textarea
              className="field"
              placeholder="Décrivez le problème en détail..."
              value={blcForm.description}
              onChange={(e) =>
                setBlcForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-o"
              style={{ flex: 1, borderRadius: 10, padding: "11px" }}
              onClick={submitBlocage}
              disabled={!blcForm.description}
            >
              Signaler
            </button>
            <button className="btn-b" onClick={() => setShowBlocage(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════ ROOT TEMPORAIRE (pour tester la Partie 1) ════════════

export default function App() {
  const [user, setUser] = useState(null);

  // États globaux partagés entre tous les profils
  const [chantiers, setChantiers] = useState([]);
  useEffect(() => {
    async function loadChantiers() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
        *,
        clients(name),
        users!projects_chef_id_fkey(first_name, last_name),
        tasks(id, label, is_done),
        blocages(id, type, is_resolved)
      `,
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) { console.error(error); return; }

const mapped = (data || []).map(c => ({
  ...c,
  nom: c.name,
  client: c.clients?.name || '',
  statut: { draft: 'Planifié', planned: 'Planifié', in_progress: 'En cours', completed: 'Terminé', archived: 'Archivé' }[c.status] || c.status,
  budget: c.budget_amount,
  depense: c.spent_amount,
  avancement: c.progress,
  localisation: c.location,
  dateDebut: c.start_date,
  dateFin: c.end_date,
  equipe: (c.project_members || []).map(m => m.user_id),
  taches: (c.tasks || []).map(t => ({ id: t.id, label: t.label, done: t.is_done })),
  blocages: (c.blocages || []).map(b => ({ id: b.id, type: b.type, resolu: b.is_resolved })),
  photos: [],
  rapports: [],
  presences: [],
}));

setChantiers(mapped);
    }
    loadChantiers();
  }, []);
  const [equipes, setEquipes] = useState([]);
useEffect(() => {
  async function loadChantiers() {
    try {
      const data = await import('./services/chantiers').then(m => m.loadChantiers());
      setChantiers(data);
    } catch (err) {
      console.error(err);
      setChantiers(CHANTIERS_INIT);
    }
  }
  loadChantiers();
}, []);

  const [clients, setClients] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true });
      if (error) {
        console.error(error);
        setClients(CLIENTS_INIT);
      } else {
        setClients(data.length > 0 ? data : CLIENTS_INIT);
      }
    }
    load();
  }, []);

  const [devis, setDevis] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("quotes")
        .select("*, quote_lines(*)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        setDevis(DEVIS_INIT);
      } else {
        setDevis(data.length > 0 ? data : DEVIS_INIT);
      }
    }
    load();
  }, []);

  const [factures, setFactures] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, payments(*), clients(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setFactures(FACTURES_INIT);
        return;
      }

      const fmtDate = (d) =>
        d
          ? new Date(d).toLocaleDateString("fr-CI", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A";

      const mapped = (data || []).map((f) => ({
        ...f,
        numero: f.reference,
        clientNom: f.clients?.name || "",
        objet: f.subject,
        montantHT: f.amount_ht,
        montantTTC: f.amount_ttc,
        statut: f.status,
        dateEmission: fmtDate(f.issued_at),
        dateEcheance: fmtDate(f.due_date),
        datePaiement: fmtDate(f.paid_at),
        paiements: f.payments || [],
      }));

      setFactures(mapped.length > 0 ? mapped : FACTURES_INIT);
    }
    load();
  }, []);

  const [contrats, setContrats] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("contracts")
        .select("*, clients(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setContrats(CONTRATS_INIT);
        return;
      }

      const mapped = (data || []).map((c) => ({
        ...c,
        numero: c.reference,
        clientNom: c.clients?.name || "",
        type: c.type,
        objet: c.subject,
        valeur: c.value_amount,
        statut:
          c.status === "active"
            ? "Actif"
            : c.status === "expired"
              ? "Expiré"
              : c.status,
        dateDebut: c.start_date,
        dateFin: c.end_date,
        renouvellement: c.renewal === "auto" ? "Automatique" : "Manuel",
        periodicite: c.periodicity,
      }));

      setContrats(mapped.length > 0 ? mapped : CONTRATS_INIT);
    }
    load();
  }, []);
  const [equipements, setEquipements] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("equipments")
        .select("*, equipment_categories(name, icon)")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setEquipements(EQUIPEMENTS_INIT);
        return;
      }

      const mapped = (data || []).map((e) => ({
        ...e,
        nom: e.name,
        reference: e.reference,
        categorie: e.equipment_categories?.name || e.category_id,
        marque: e.brand,
        modele: e.model,
        quantiteTotal: e.quantity_total,
        quantiteDisponible: e.quantity_available,
        etat: e.condition,
        valeur: e.unit_value,
        notes: e.notes,
      }));

      setEquipements(mapped.length > 0 ? mapped : EQUIPEMENTS_INIT);
    }
    load();
  }, []);
  const [attributions, setAttributions] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("equipment_assignments")
        .select("*, equipments(name), projects(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setAttributions(ATTRIBUTIONS_INIT);
        return;
      }

      const mapped = (data || []).map((a) => ({
        ...a,
        equipementId: a.equipment_id,
        equipementNom: a.equipments?.name || "",
        chantierId: a.project_id,
        chantierNom: a.projects?.name || "",
        technicien: a.users ? `${a.users.first_name} ${a.users.last_name}` : "",
        quantite: a.quantity,
        dateAttribution: a.assigned_at,
        dateRetourPrevue: a.expected_return_at,
        dateRetour: null,
        etatDepart: a.condition_out,
      }));

      setAttributions(mapped.length > 0 ? mapped : ATTRIBUTIONS_INIT);
    }
    load();
  }, []);
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("documents")
        .select("*, projects(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setDocuments(DOCUMENTS_INIT);
        return;
      }

      const mapped = (data || []).map((d) => ({
        ...d,
        nom: d.name,
        type: d.file_type,
        categorie: d.category,
        chantierId: d.project_id,
        chantierNom: d.projects?.name || null,
        uploadePar: d.uploaded_by,
        dateUpload: d.created_at
          ? new Date(d.created_at).toLocaleDateString("fr-CI", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "",
        description: d.description,
        tags: d.tags || [],
        accesRoles: d.access_roles || ["admin", "chef", "technicien"],
        version: d.current_version || "v1.0",
        taille: d.size_bytes ? `${Math.round(d.size_bytes / 1024)} KB` : "—",
      }));

      setDocuments(mapped.length > 0 ? mapped : DOCUMENTS_INIT);
    }
    load();
  }, []);
  const [conversations, setConversations] = useState([]);
  useEffect(() => {
    async function load() {
  if (!user) return;
  const { data, error } = await supabase
        .from("conversations")
        .select("*, messages(*), conversation_members(user_id)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setConversations(CONVERSATIONS_INIT);
        return;
      }

      const mapped = (data || []).map((c) => ({
        ...c,
        nom: c.name,
        avatar: c.type === "project" ? "📡" : c.type === "team" ? "👔" : "💬",
        participants: (c.conversation_members || []).map((m) => m.user_id),
        messages: (c.messages || []).map((m) => ({
          ...m,
          auteur: m.sender_id,
          contenu: m.content,
          urgent: m.is_urgent,
          lu: (m.read_by || []).includes(user?.id),
          date: new Date(m.created_at).toLocaleDateString("fr-CI", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      }));

      setConversations(mapped.length > 0 ? mapped : CONVERSATIONS_INIT);
    }
    load();
  }, [user]);

  //Créer un chantier

  async function createChantier(form) {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        company_id: "00000000-0000-0000-0000-000000000001",
        client_id: form.clientId,
        chef_id: form.chefId,
        name: form.nom,
        reference: `PROJ-${Date.now()}`,
        status: "planned",
        budget_amount: form.budget,
        start_date: form.dateDebut,
        end_date: form.dateFin,
        location: form.localisation,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }

  //Enregistrer un paiement

  async function enregistrerPaiement(invoiceId, montant, mode, ref) {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        amount: montant,
        method: mode,
        reference: ref,
        payment_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    // Le trigger SQL recalcule automatiquement le statut de la facture
    if (error) console.error(error);
    return data;
  }

  //Pointer une arrivée

  async function pointerArrivee(userId, projectId) {
    const { data, error } = await supabase
      .from("presences")
      .insert({
        user_id: userId,
        project_id: projectId,
        work_date: new Date().toISOString().split("T")[0],
        arrived_at: new Date().toISOString(),
        latitude_in: null, // à remplir avec navigator.geolocation
        longitude_in: null,
      })
      .select()
      .single();

    if (error) console.error(error);
    return data;
  }

  // State object passé à toutes les vues
  const state = {
    chantiers,
    setChantiers,
    equipes,
    setEquipes,
    clients,
    setClients,
    devis,
    setDevis,
    factures,
    setFactures,
    contrats,
    setContrats,
    equipements,
    setEquipements,
    attributions,
    setAttributions,
    documents,
    setDocuments,
    conversations,
    setConversations,
  };

  const logout = () => setUser(null);

  return (
    <>
      <style>{CSS}</style>
      {!user ? (
        <LoginPage onLogin={setUser} />
      ) : user.role === "technicien" ? (
        <TechnicienView user={user} state={state} onLogout={logout} />
      ) : user.role === "chef" ? (
        <ChefView user={user} state={state} onLogout={logout} />
      ) : (
        <AdminView user={user} state={state} onLogout={logout} />
      )}
    </>
  );
}
function ChefView({ user, state, onLogout }) {
  const {
    chantiers,
    setChantiers,
    equipes,
    documents,
    setDocuments,
    conversations,
    setConversations,
    equipements,
    attributions,
    setAttributions,
    setEquipements,
  } = state;

  // Chantiers filtrés : uniquement ceux où le chef est assigné
  const mesChantiers = chantiers.filter((c) =>
    c.equipe.some((m) => m.includes(user.nom.split(" ")[0])),
  );

  const [tab, setTab] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState("infos");
  const [showUpdate, setShowUpdate] = useState(null);
  const [showAssign, setShowAssign] = useState(null);
  const [showAddTache, setShowAddTache] = useState(false);
  const [nouvTache, setNouvTache] = useState("");
  const [upForm, setUpForm] = useState({
    avancement: 0,
    depense: 0,
    statut: "En cours",
  });
  const [showNt, setShowNt] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    nom: "",
    type: "pdf",
    categorie: "Rapport",
    description: "",
  });

  // IA
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Posez-moi une question sur vos chantiers, budget ou équipe.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEnd = useRef();

  const photoRef = useRef();

  // Stats
  const totalBudget = mesChantiers.reduce((s, c) => s + c.budget, 0);
  const totalDepense = mesChantiers.reduce((s, c) => s + getDepense(c.id), 0);
  const totalBlocages = mesChantiers.reduce(
    (s, c) => s + (c.blocages || []).filter((b) => !b.resolu).length,
    0,
  );
  const retards = mesChantiers.filter(
    (c) => c.statut !== "Terminé" && joursRestants(c.dateFin) < 0,
  );

  // Notifs
  const notifs = [
    ...mesChantiers.flatMap((c) =>
      (c.blocages || [])
        .filter((b) => !b.resolu)
        .map((b) => ({
          id: `b${b.id}`,
          msg: `Blocage: ${b.type} · ${c.nom}`,
          type: "blocage",
          date: b.date,
        })),
    ),
    ...retards.map((c) => ({
      id: `r${c.id}`,
      msg: `Retard: ${c.nom}`,
      type: "retard",
      date: c.dateFin,
    })),
  ];

  // Messagerie
  const mesConvs = user?.role === 'admin' 
  ? conversations 
  : conversations.filter(c => 
      c.participants.includes(user?.nom) || 
      c.participants.includes(user?.id)
    );
  const msgsNonLus = mesConvs.reduce(
    (s, c) =>
      s +
      c.messages.filter(
        (m) => !m.lu && m.auteur !== user.nom && m.auteur !== user.id,
      ).length,
    0,
  );

  // Stocks : uniquement équipements déployés sur ses chantiers
  const mesAttributions = (attributions || []).filter(
    (a) => !a.dateRetour && mesChantiers.some((c) => c.id === a.chantierId),
  );

  function upd(id, patch) {
    setChantiers((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (selected?.id === id) setSelected((p) => ({ ...p, ...patch }));
  }

  function resoudre(cId, bId) {
    const c = chantiers.find((x) => x.id === cId);
    upd(cId, {
      blocages: c.blocages.map((b) =>
        b.id === bId ? { ...b, resolu: true } : b,
      ),
    });
  }

  function handlePhoto(e) {
    if (!selected) return;
    Array.from(e.target.files).forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) =>
        upd(selected.id, {
          photos: [
            ...(selected.photos || []),
            {
              url: ev.target.result,
              nom: file.name,
              date: todayStr(),
              technicien: user.nom,
            },
          ],
        });
      r.readAsDataURL(file);
    });
  }

  function ajouterTache() {
    if (!nouvTache.trim() || !selected) return;
    upd(selected.id, {
      taches: [
        ...(selected.taches || []),
        { id: Date.now(), label: nouvTache.trim(), done: false },
      ],
    });
    setNouvTache("");
    setShowAddTache(false);
  }

  function restituerEq(attrId) {
    const attr = (attributions || []).find((a) => a.id === attrId);
    if (!attr) return;
    setAttributions((p) =>
      p.map((a) =>
        a.id === attrId
          ? { ...a, dateRetour: todayStr(), etatRetour: "Bon" }
          : a,
      ),
    );
    setEquipements((p) =>
      p.map((e) =>
        e.id === attr.equipementId
          ? { ...e, quantiteDisponible: e.quantiteDisponible + attr.quantite }
          : e,
      ),
    );
  }

  useEffect(() => {
    aiEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  async function sendAI() {
    if (!aiInput.trim() || aiLoading) return;
    const msg = { role: "user", content: aiInput };
    const next = [...aiMessages, msg];
    setAiMessages(next);
    setAiInput("");
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es l'assistant de DIGINETS CI. Chef de chantier: ${user.nom}.\nCHANTIERS:\n${mesChantiers.map((c) => `${c.nom}|${c.client}|${c.statut}|${c.avancement}%|Budget:${c.budget.toLocaleString()} FCFA|Dépensé:${getDepense(c.id).toLocaleString()} FCFA|Fin:${c.dateFin}|Blocages:${(c.blocages || []).filter((b) => !b.resolu).length}`).join("; ")}\nBudget total:${totalBudget.toLocaleString()} FCFA|Dépensé:${totalDepense.toLocaleString()} FCFA\nRéponds en français, concis.`,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setAiMessages((p) => [
        ...p,
        { role: "assistant", content: data.content?.[0]?.text || "Erreur." },
      ]);
    } catch {
      setAiMessages((p) => [
        ...p,
        { role: "assistant", content: "Erreur de connexion." },
      ]);
    }
    setAiLoading(false);
  }

  const TABS = [
    { id: "dashboard", label: "▦ Dashboard" },
    { id: "chantiers", label: "⬡ Chantiers" },
    { id: "equipe", label: "◎ Mon équipe" },
    { id: "stocks", label: "📦 Matériels" },
    { id: "documents", label: "🗂️ Documents" },
    {
      id: "messagerie",
      label: `💬 Messages${msgsNonLus > 0 ? ` (${msgsNonLus})` : ""}`,
    },
    { id: "ia", label: "✦ Assistant IA" },
  ];

  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        display: "flex",
        height: "100vh",
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: 210,
          background: "#0d1610",
          borderRight: "1px solid #1a2e1d",
          display: "flex",
          flexDirection: "column",
          padding: "18px 10px",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: 20, paddingLeft: 6 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            DIGINETS CI
          </div>
          <div style={{ fontSize: 11, color: "#3a5a3d" }}>Chef de chantier</div>
        </div>

        {/* Profil */}
        <div
          style={{
            background: "#0a1a0d",
            border: "1px solid #1a2e1d",
            borderRadius: 10,
            padding: 10,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1a3a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#60a5fa",
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#d4e8d6" }}>
              {user.nom}
            </div>
            <span
              className="badge"
              style={{ background: "#1a1a3a", color: "#60a5fa", fontSize: 10 }}
            >
              Chef chantier
            </span>
          </div>
        </div>

        {/* Alertes */}
        {totalBlocages > 0 && (
          <div
            className="alert-bar orange"
            style={{ fontSize: 11 }}
            onClick={() => {
              setTab("chantiers");
              setSelected(null);
            }}
          >
            ⚠️ {totalBlocages} blocage(s)
          </div>
        )}
        {retards.length > 0 && (
          <div
            className="alert-bar"
            style={{ fontSize: 11 }}
            onClick={() => {
              setTab("chantiers");
              setSelected(null);
            }}
          >
            🔴 {retards.length} retard(s)
          </div>
        )}

        {/* Navigation */}
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`sb-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => {
              setTab(t.id);
              setSelected(null);
            }}
            style={{ marginBottom: 2 }}
          >
            {t.label}
          </button>
        ))}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <NotifPanel
            notifs={notifs}
            unread={notifs.length}
            show={showNt}
            setShow={setShowNt}
            markRead={() => {}}
          />
          <button
            className="btn-r"
            style={{ width: "100%", padding: "8px" }}
            onClick={onLogout}
          >
            ← Déconnexion
          </button>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {/* ─ DASHBOARD ─ */}
        {tab === "dashboard" && (
          <div>
            <SectionTitle
              title={`Bonjour, ${user.nom.split(" ")[0]}`}
              sub={`${mesChantiers.length} chantier(s) sous votre supervision`}
            />
            {retards.length > 0 && (
              <div className="alert-bar">
                🔴 Retard : {retards.map((c) => c.nom).join(", ")}
              </div>
            )}

            <KpiGrid
              items={[
                {
                  label: "En cours",
                  value: mesChantiers.filter((c) => c.statut === "En cours")
                    .length,
                  sub: "chantiers actifs",
                  color: "#4ade80",
                },
                {
                  label: "Budget total",
                  value: (totalBudget / 1000000).toFixed(1) + "M FCFA",
                  sub: "engagés",
                  color: "#60a5fa",
                },
                {
                  label: "Consommé",
                  value:
                    totalBudget > 0
                      ? Math.round((totalDepense / totalBudget) * 100) + "%"
                      : "0%",
                  sub: (totalDepense / 1000000).toFixed(1) + "M FCFA",
                  color: "#fb923c",
                },
                {
                  label: "Blocages",
                  value: totalBlocages,
                  sub: "non résolus",
                  color: totalBlocages > 0 ? "#f87171" : "#4ade80",
                },
              ]}
            />

            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}
                >
                  Mes chantiers
                </div>
                <button
                  className="btn-b"
                  style={{ fontSize: 12 }}
                  onClick={() => setTab("chantiers")}
                >
                  Voir tout →
                </button>
              </div>
              {mesChantiers.map((c) => {
                const d = statutDelai(c.dateFin, c.statut);
                return (
                  <div
                    key={c.id}
                    style={{ marginBottom: 14, cursor: "pointer" }}
                    onClick={() => {
                      setSelected(c);
                      setDetailTab("infos");
                      setTab("chantiers");
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#d4e8d6",
                            fontWeight: 500,
                          }}
                        >
                          {c.nom}
                        </span>
                        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                          <span
                            className="badge"
                            style={{
                              background: SC(c.statut).bg,
                              color: SC(c.statut).t,
                            }}
                          >
                            {c.statut}
                          </span>
                          {d && (
                            <span
                              className="badge"
                              style={{ background: d.bg, color: d.color }}
                            >
                              {d.label}
                            </span>
                          )}
                          {(c.blocages || []).filter((b) => !b.resolu).length >
                            0 && (
                            <span style={{ fontSize: 11, color: "#fb923c" }}>
                              ⚠️
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#4ade80",
                          fontWeight: 600,
                        }}
                      >
                        {c.avancement}%
                      </span>
                    </div>
                    <div className="pbar">
                      <div
                        className="pfill"
                        style={{
                          width: `${c.avancement}%`,
                          background: "linear-gradient(90deg,#166534,#4ade80)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─ CHANTIERS ─ */}
        {tab === "chantiers" && (
          <div>
            <SectionTitle
              title="Mes chantiers"
              sub={`${mesChantiers.length} chantier(s)`}
            />

            {!selected ? (
              mesChantiers.map((c) => {
                const d = statutDelai(c.dateFin, c.statut);
                return (
                  <div
                    key={c.id}
                    className="row"
                    onClick={() => {
                      setSelected(c);
                      setDetailTab("infos");
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#d4e8d6",
                            }}
                          >
                            {c.nom}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: SC(c.statut).bg,
                              color: SC(c.statut).t,
                            }}
                          >
                            {c.statut}
                          </span>
                          {d && (
                            <span
                              className="badge"
                              style={{ background: d.bg, color: d.color }}
                            >
                              {d.label}
                            </span>
                          )}
                          {(c.blocages || []).filter((b) => !b.resolu).length >
                            0 && (
                            <span
                              className="badge"
                              style={{
                                background: "#3a2a1a",
                                color: "#fb923c",
                              }}
                            >
                              ⚠️{" "}
                              {
                                (c.blocages || []).filter((b) => !b.resolu)
                                  .length
                              }
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                          {c.client} · {c.localisation}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#2a4a2d",
                            marginTop: 3,
                          }}
                        >
                          Budget: {fmt(c.budget)} · Consommé:{" "}
                          {c.budget > 0
                            ? Math.round((getDepense(c.id) / c.budget) * 100)
                            : 0}
                          % · 📝{(c.rapports || []).length} · 📷
                          {(c.photos || []).length}
                        </div>
                      </div>
                      <div style={{ width: 80 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#4ade80",
                            textAlign: "right",
                            marginBottom: 3,
                          }}
                        >
                          {c.avancement}%
                        </div>
                        <div className="pbar">
                          <div
                            className="pfill"
                            style={{
                              width: `${c.avancement}%`,
                              background:
                                "linear-gradient(90deg,#166534,#4ade80)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <Back onClick={() => setSelected(null)} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#d4e8d6",
                        marginBottom: 6,
                      }}
                    >
                      {selected.nom}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span
                        className="badge"
                        style={{
                          background: SC(selected.statut).bg,
                          color: SC(selected.statut).t,
                        }}
                      >
                        {selected.statut}
                      </span>
                      <DelaiTag
                        dateFin={selected.dateFin}
                        statut={selected.statut}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn-a"
                      onClick={() => setShowAssign(selected)}
                    >
                      👥 Équipe
                    </button>
                    <button
                      className="btn-b"
                      onClick={() => {
                        setUpForm({
                          avancement: selected.avancement,
                          depense: getDepense(selected.id),
                          statut: selected.statut,
                        });
                        setShowUpdate(selected);
                      }}
                    >
                      Mettre à jour
                    </button>
                  </div>
                </div>

                <div className="nav-pill">
                  {[
                    { id: "infos", label: "Infos" },
                    { id: "finances", label: "Finances" },
                    {
                      id: "taches",
                      label: `Tâches (${(selected.taches || []).filter((t) => t.done).length}/${(selected.taches || []).length})`,
                    },
                    {
                      id: "equipe_det",
                      label: `Équipe (${(selected.equipe || []).length})`,
                    },
                    {
                      id: "photos",
                      label: `Photos (${(selected.photos || []).length})`,
                    },
                    {
                      id: "rapports",
                      label: `Rapports (${(selected.rapports || []).length})`,
                    },
                    {
                      id: "blocages",
                      label: `Blocages (${(selected.blocages || []).filter((b) => !b.resolu).length})`,
                    },
                    { id: "presences", label: "Pointages" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={`np-btn ${detailTab === t.id ? "active" : ""}`}
                      onClick={() => setDetailTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Infos */}
                {detailTab === "infos" && (
                  <div>
                    <InfoRow label="Client" value={selected.client} />
                    <InfoRow label="Type" value={selected.type} />
                    <InfoRow
                      label="Localisation"
                      value={selected.localisation}
                    />
                    <InfoRow label="Début" value={selected.dateDebut} />
                    <InfoRow label="Fin prévue" value={selected.dateFin} />
                  </div>
                )}

                {/* Finances — visible chef */}
                {detailTab === "finances" && (
                  <div>
                    {[
                      ["Budget total", selected.budget, "#60a5fa"],
                      ["Dépensé", getDepense(selected.id), "#fb923c"],
                      [
                        "Restant",
                        selected.budget - getDepense(selected.id),
                        "#4ade80",
                      ],
                    ].map(([k, v, col]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#0d1610",
                          borderRadius: 10,
                          border: "1px solid #1a2e1d",
                          marginBottom: 10,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#4a6a4d" }}>
                          {k}
                        </span>
                        <span
                          style={{ fontSize: 15, fontWeight: 700, color: col }}
                        >
                          {fmt(v)}
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        background: "#0d1610",
                        borderRadius: 10,
                        padding: 14,
                        border: "1px solid #1a2e1d",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#4a6a4d" }}>
                          Taux de consommation
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "#4ade80",
                            fontWeight: 700,
                          }}
                        >
                          {selected.budget > 0
                            ? Math.round(
                                (getDepense(selected.id) / selected.budget) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="pbar" style={{ height: 8 }}>
                        <div
                          className="pfill"
                          style={{
                            width: `${selected.budget > 0 ? Math.round((getDepense(selected.id) / selected.budget) * 100) : 0}%`,
                            background:
                              "linear-gradient(90deg,#166534,#4ade80)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tâches */}
                {detailTab === "taches" && (
                  <div>
                    <button
                      className="btn-a"
                      style={{ marginBottom: 12 }}
                      onClick={() => setShowAddTache(true)}
                    >
                      + Ajouter une tâche
                    </button>
                    {(selected.taches || []).map((t) => (
                      <div
                        key={t.id}
                        className="trow"
                        onClick={() => {
                          const taches = selected.taches.map((x) =>
                            x.id === t.id ? { ...x, done: !x.done } : x,
                          );
                          const av = Math.round(
                            (taches.filter((x) => x.done).length /
                              taches.length) *
                              100,
                          );
                          upd(selected.id, { taches, avancement: av });
                        }}
                      >
                        <div className={`tcheck ${t.done ? "done" : ""}`}>
                          {t.done && (
                            <span
                              style={{
                                color: "#0a0f0d",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            color: t.done ? "#4a6a4d" : "#d4e8d6",
                            textDecoration: t.done ? "line-through" : "none",
                            flex: 1,
                          }}
                        >
                          {t.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            upd(selected.id, {
                              taches: selected.taches.filter(
                                (x) => x.id !== t.id,
                              ),
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#f87171",
                            cursor: "pointer",
                            fontSize: 15,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Équipe détail */}
                {detailTab === "equipe_det" && (
                  <div>
                    <button
                      className="btn-a"
                      style={{ marginBottom: 12 }}
                      onClick={() => setShowAssign(selected)}
                    >
                      👥 Modifier l'équipe
                    </button>
                    {(selected.equipe || []).map((nom, i) => {
                      const e = equipes.find((x) => x.nom === nom);
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            background: "#0d1610",
                            borderRadius: 10,
                            border: "1px solid #1a2e1d",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#1a3a2a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              color: e ? ROLE_COLORS[e.role] : "#4ade80",
                            }}
                          >
                            {nom.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#d4e8d6",
                              }}
                            >
                              {nom}
                            </div>
                            {e && (
                              <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                                {e.poste} · 📞 {e.tel}
                              </div>
                            )}
                          </div>
                          {e && (
                            <button
                              onClick={() =>
                                whatsapp(
                                  e.tel,
                                  `Bonjour ${e.nom.split(" ")[0]}, je vous contacte pour le chantier ${selected.nom}.`,
                                )
                              }
                              className="btn-a"
                              style={{ fontSize: 11, padding: "4px 10px" }}
                            >
                              💬 WA
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Photos */}
                {detailTab === "photos" && (
                  <div>
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handlePhoto}
                    />
                    <div
                      className="pzone"
                      onClick={() => photoRef.current.click()}
                      style={{ marginBottom: 14 }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
                      <div style={{ fontSize: 13, color: "#4a6a4d" }}>
                        Ajouter des photos
                      </div>
                    </div>
                    {(selected.photos || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucune photo
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill,minmax(90px,1fr))",
                          gap: 8,
                        }}
                      >
                        {selected.photos.map((p, i) => (
                          <div key={i}>
                            <img
                              src={p.url}
                              alt=""
                              style={{
                                width: "100%",
                                aspectRatio: "1",
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #1e301f",
                              }}
                            />
                            <div
                              style={{
                                fontSize: 10,
                                color: "#3a5a3d",
                                marginTop: 2,
                              }}
                            >
                              {p.technicien} · {p.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rapports */}
                {detailTab === "rapports" && (
                  <div>
                    {(selected.rapports || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucun rapport soumis par les techniciens
                      </div>
                    ) : (
                      [...selected.rapports].reverse().map((r) => (
                        <div key={r.id} className="rpt-card">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#4ade80",
                              }}
                            >
                              {r.technicien}
                            </span>
                            <span style={{ fontSize: 11, color: "#3a5a3d" }}>
                              {r.date}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#c8deca",
                              marginBottom: 3,
                            }}
                          >
                            <strong style={{ color: "#6b8a6e" }}>
                              Travaux :{" "}
                            </strong>
                            {r.travaux}
                          </div>
                          {r.problemes && (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#c8deca",
                                marginBottom: 3,
                              }}
                            >
                              <strong style={{ color: "#6b8a6e" }}>
                                Problèmes :{" "}
                              </strong>
                              {r.problemes}
                            </div>
                          )}
                          {r.materiel && (
                            <div style={{ fontSize: 13, color: "#c8deca" }}>
                              <strong style={{ color: "#6b8a6e" }}>
                                Matériel :{" "}
                              </strong>
                              {r.materiel}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Blocages */}
                {detailTab === "blocages" && (
                  <div>
                    {(selected.blocages || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucun blocage
                      </div>
                    ) : (
                      [...selected.blocages].reverse().map((b) => (
                        <div key={b.id} className="bloc-card">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              <span
                                className="badge"
                                style={{
                                  background: b.resolu ? "#1a2a3a" : "#3a2a1a",
                                  color: b.resolu ? "#60a5fa" : "#fb923c",
                                }}
                              >
                                {b.resolu ? "Résolu" : "Actif"}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#fb923c",
                                }}
                              >
                                {b.type}
                              </span>
                            </div>
                            {!b.resolu && (
                              <button
                                className="btn-a"
                                style={{ fontSize: 11, padding: "4px 10px" }}
                                onClick={() => resoudre(selected.id, b.id)}
                              >
                                ✓ Résoudre
                              </button>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#c8deca",
                              marginBottom: 4,
                            }}
                          >
                            {b.description}
                          </div>
                          <div style={{ fontSize: 11, color: "#5a4a3a" }}>
                            Signalé par {b.technicien} · {b.date}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pointages */}
                {detailTab === "presences" && (
                  <div>
                    {(selected.presences || []).length === 0 ? (
                      <div
                        style={{
                          color: "#3a5a3d",
                          textAlign: "center",
                          padding: "16px 0",
                          fontSize: 13,
                        }}
                      >
                        Aucun pointage enregistré
                      </div>
                    ) : (
                      [...selected.presences].reverse().map((p, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "9px 13px",
                            background: "#0d1610",
                            borderRadius: 9,
                            border: "1px solid #1a2e1d",
                            marginBottom: 5,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#d4e8d6" }}>
                            {p.technicien}
                          </span>
                          <span style={{ color: "#4a6a4d" }}>{p.date}</span>
                          <span style={{ color: "#4ade80" }}>
                            ↑ {p.arrivee}
                          </span>
                          {p.depart ? (
                            <span style={{ color: "#60a5fa" }}>
                              ↓ {p.depart}
                            </span>
                          ) : (
                            <span style={{ color: "#3a5a3d" }}>En cours</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─ ÉQUIPE ─ */}
        {tab === "equipe" && (
          <div>
            <SectionTitle
              title="Mon équipe"
              sub="Techniciens assignés à vos chantiers"
            />
            {equipes
              .filter((e) => mesChantiers.some((c) => c.equipe.includes(e.nom)))
              .map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 18px",
                    background: "#0d1610",
                    border: "1px solid #1a2e1d",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#1a3a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      color: ROLE_COLORS[e.role],
                    }}
                  >
                    {e.nom.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {e.nom}
                    </div>
                    <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                      {e.poste} · 📞 {e.tel}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#3a5a3d",
                        marginBottom: 6,
                      }}
                    >
                      {
                        mesChantiers.filter((c) => c.equipe.includes(e.nom))
                          .length
                      }{" "}
                      chantier(s)
                    </div>
                    <button
                      onClick={() =>
                        whatsapp(
                          e.tel,
                          `Bonjour ${e.nom.split(" ")[0]}, c'est ${user.nom}. Je vous contacte de la part de DIGINETS CI.`,
                        )
                      }
                      className="btn-a"
                      style={{ fontSize: 11, padding: "5px 12px" }}
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ─ MATÉRIELS (vue limitée : seulement les équipements sur ses chantiers) ─ */}
        {tab === "stocks" && (
          <div>
            <SectionTitle
              title="Matériels déployés"
              sub="Équipements sur vos chantiers"
            />
            {mesAttributions.length === 0 ? (
              <div
                style={{
                  color: "#3a5a3d",
                  textAlign: "center",
                  padding: "30px 0",
                }}
              >
                Aucun équipement déployé sur vos chantiers.
              </div>
            ) : (
              mesAttributions.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "#0d1610",
                    border: "1px solid #1e301f",
                    borderRadius: 12,
                    padding: "13px 18px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#d4e8d6",
                          }}
                        >
                          {a.equipementNom}
                        </span>
                        <span
                          className="badge"
                          style={{ background: "#2a1a3a", color: "#c084fc" }}
                        >
                          ×{a.quantite}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                        👤 {a.technicien} · 📍 {a.chantierNom}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}
                      >
                        Depuis {a.dateAttribution} · Retour prévu :{" "}
                        {a.dateRetourPrevue || "N/A"}
                      </div>
                    </div>
                    <button className="btn-b" onClick={() => restituerEq(a.id)}>
                      ✅ Restituer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─ DOCUMENTS ─ */}
        {tab === "documents" && (
          <div>
            <SectionTitle
              title="Documents"
              sub="Plans, PV et procédures de vos chantiers"
              action={
                <button className="btn-a" onClick={() => setShowAddDoc(true)}>
                  + Ajouter
                </button>
              }
            />
            {documents
              .filter(
                (d) =>
                  d.accesRoles.includes("chef") &&
                  (d.chantierId === null ||
                    mesChantiers.some((m) => m.id === d.chantierId)),
              )
              .map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: "#0d1610",
                    border: "1px solid #1e301f",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      background:
                        { pdf: "#2a1a1a", doc: "#1a2a3a", xlsx: "#1a3a2a" }[
                          d.type
                        ] || "#1a2a3a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {{ pdf: "📄", doc: "📝", xlsx: "📊" }[d.type] || "📎"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#d4e8d6",
                        marginBottom: 3,
                      }}
                    >
                      {d.nom}{" "}
                      <span
                        style={{
                          fontSize: 10,
                          background: "#1a2a3a",
                          color: "#60a5fa",
                          padding: "2px 6px",
                          borderRadius: 6,
                          marginLeft: 4,
                        }}
                      >
                        {d.version}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                      {d.categorie} · {d.chantierNom || "Document général"} ·{" "}
                      {d.dateUpload}
                    </div>
                  </div>
                  <button className="btn-b" style={{ fontSize: 11 }}>
                    ⬇️ Voir
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* ─ MESSAGERIE ─ */}
        {tab === "messagerie" && (
          <div>
            <SectionTitle
              title="Messagerie"
              sub="Communications internes et urgentes"
            />
            <MsgPanel
              user={user}
              conversations={conversations}
              setConversations={setConversations}
              equipes={equipes}
              mesConvs={mesConvs}
            />
          </div>
        )}

        {/* ─ ASSISTANT IA ─ */}
        {tab === "ia" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 120px)",
            }}
          >
            <SectionTitle
              title="Assistant IA"
              sub="Interrogez vos données en langage naturel"
            />
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {aiMessages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {m.role === "assistant" && (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#1a3a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        marginRight: 8,
                        flexShrink: 0,
                        marginTop: 3,
                      }}
                    >
                      ✦
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "72%",
                      padding: "10px 14px",
                      borderRadius:
                        m.role === "user"
                          ? "13px 13px 4px 13px"
                          : "13px 13px 13px 4px",
                      background: m.role === "user" ? "#1a3a2a" : "#111a13",
                      border: m.role === "user" ? "none" : "1px solid #1e301f",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: m.role === "user" ? "#d4f5d8" : "#c8deca",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    padding: "10px 14px",
                    background: "#111a13",
                    borderRadius: 13,
                    border: "1px solid #1e301f",
                    width: "fit-content",
                  }}
                >
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      className="dp"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#4ade80",
                        display: "block",
                        animationDelay: `${j * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div ref={aiEnd} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="field"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAI()}
                placeholder="Rapport, budget, blocages, avancement..."
              />
              <button
                className="btn-g"
                onClick={sendAI}
                disabled={aiLoading || !aiInput.trim()}
              >
                Envoyer
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                "Rapport de mes chantiers",
                "Budget restant",
                "Blocages actifs",
                "Chantiers en retard",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setAiInput(q)}
                  style={{
                    background: "#0d1610",
                    border: "1px solid #1e301f",
                    borderRadius: 20,
                    padding: "5px 10px",
                    fontSize: 12,
                    color: "#4a6a4d",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#4ade80";
                    e.target.style.color = "#4ade80";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#1e301f";
                    e.target.style.color = "#4a6a4d";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {showAssign && (
        <AssignModal
          chantier={showAssign}
          equipes={equipes}
          onSave={(membres) => upd(showAssign.id, { equipe: membres })}
          onClose={() => setShowAssign(null)}
        />
      )}

      {showUpdate && (
        <Modal
          title="Mettre à jour le chantier"
          onClose={() => setShowUpdate(null)}
          width={420}
        >
          <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
            {showUpdate.nom}
          </div>
          <div className="fg">
            <label className="lbl">Statut</label>
            <select
              className="field"
              value={upForm.statut}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, statut: e.target.value }))
              }
            >
              {["Planifié", "En attente", "En cours", "Terminé"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Avancement (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="field"
              value={upForm.avancement}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, avancement: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Dépenses engagées (FCFA)</label>
            <input
              type="number"
              className="field"
              value={upForm.depense}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, depense: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                upd(showUpdate.id, {
                  avancement: parseInt(upForm.avancement),
                  depense: parseInt(upForm.depense),
                  statut: upForm.statut,
                });
                setShowUpdate(null);
              }}
            >
              Enregistrer
            </button>
            <button className="btn-b" onClick={() => setShowUpdate(null)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showAddTache && (
        <Modal
          title="Nouvelle tâche"
          onClose={() => setShowAddTache(false)}
          width={400}
        >
          <div className="fg">
            <label className="lbl">Description *</label>
            <input
              className="field"
              placeholder="Ex: Installation câblage..."
              value={nouvTache}
              onChange={(e) => setNouvTache(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ajouterTache()}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={ajouterTache}
              disabled={!nouvTache.trim()}
            >
              Ajouter
            </button>
            <button className="btn-b" onClick={() => setShowAddTache(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showAddDoc && (
        <Modal
          title="Ajouter un document"
          onClose={() => setShowAddDoc(false)}
          width={440}
        >
          <div className="fg">
            <label className="lbl">Nom du fichier *</label>
            <input
              className="field"
              placeholder="Ex: Rapport avancement avril.pdf"
              value={docForm.nom}
              onChange={(e) =>
                setDocForm((f) => ({ ...f, nom: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg">
              <label className="lbl">Type</label>
              <select
                className="field"
                value={docForm.type}
                onChange={(e) =>
                  setDocForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {["pdf", "doc", "xlsx", "img"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Catégorie</label>
              <select
                className="field"
                value={docForm.categorie}
                onChange={(e) =>
                  setDocForm((f) => ({ ...f, categorie: e.target.value }))
                }
              >
                {[
                  "Rapport",
                  "Plan technique",
                  "PV / Rapport",
                  "Procédure",
                  "Autre",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="fg">
            <label className="lbl">Description</label>
            <textarea
              className="field"
              style={{ minHeight: 60 }}
              value={docForm.description}
              onChange={(e) =>
                setDocForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!docForm.nom) return;
                const chantier = selected || mesChantiers[0];
                setDocuments((p) => [
                  ...p,
                  {
                    id: Date.now(),
                    ...docForm,
                    chantierId: chantier?.id || null,
                    chantierNom: chantier?.nom || null,
                    version: "v1.0",
                    taille: "—",
                    uploadePar: user.nom,
                    dateUpload: todayStr(),
                    tags: [],
                    accesRoles: ["admin", "chef"],
                  },
                ]);
                setDocForm({
                  nom: "",
                  type: "pdf",
                  categorie: "Rapport",
                  description: "",
                });
                setShowAddDoc(false);
              }}
              disabled={!docForm.nom}
            >
              Ajouter
            </button>
            <button className="btn-b" onClick={() => setShowAddDoc(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", group: "Vue générale" },
  { id: "chantiers", label: "Chantiers", icon: "⬡", group: "Vue générale" },
  { id: "equipes", label: "Équipes", icon: "◎", group: "Vue générale" },
  { id: "clients", label: "Clients", icon: "👥", group: "Commercial" },
  { id: "devis", label: "Devis", icon: "📋", group: "Commercial" },
  { id: "factures", label: "Facturation", icon: "💰", group: "Commercial" },
  { id: "contrats", label: "Contrats", icon: "📄", group: "Commercial" },
  {
    id: "stocks",
    label: "Stocks & Matériels",
    icon: "📦",
    group: "Opérations",
  },
  { id: "documents", label: "Documents", icon: "🗂️", group: "Opérations" },
  { id: "messagerie", label: "Messagerie", icon: "💬", group: "Opérations" },
  { id: "ia", label: "Agent IA", icon: "✦", group: "Intelligence" },
];

function AdminView({ user, state, onLogout }) {
  const {
    chantiers,
    setChantiers,
    equipes,
    setEquipes,
    clients,
    setClients,
    devis,
    setDevis,
    factures,
    setFactures,
    contrats,
    setContrats,
    equipements,
    setEquipements,
    attributions,
    setAttributions,
    documents,
    setDocuments,
    conversations,
    setConversations,
  } = state;

  const [tab, setTab] = useState("dashboard");
  const [showNt, setShowNt] = useState(false);

  const totalBudget = chantiers.reduce((s, c) => s + c.budget, 0);
  const totalDepense = chantiers.reduce((s, c) => s + (c.depense || c.spent_amount || 0), 0);
  const totalCA = (factures || [])
  .filter((f) => f.statut === "Payée" || f.statut === "paid")
  .reduce((s, f) => s + f.montantTTC, 0);
  
  const facturesRetard = (factures || []).filter(
  (f) =>
    f.statut === "En retard" ||
    f.statut === "overdue" ||
    (( f.statut === "En attente" || f.statut === "sent") && joursRestants(f.dateEcheance) < 0)
);
  
  const retards = chantiers.filter(
    (c) => c.statut !== "Terminé" && joursRestants(c.dateFin) < 0,
  );
  const alertesStock = (equipements || []).filter(
    (e) =>
      e.quantiteDisponible === 0 ||
      (e.categorie === "Consommable" && e.quantiteDisponible < 30),
  );
  const msgsNonLus = (conversations || [])
    .filter((c) => c.participants.includes(user.nom))
    .reduce(
      (s, c) =>
        s + c.messages.filter((m) => !m.lu && m.auteur !== user.nom).length,
      0,
    );
  const totalBlocages = chantiers.reduce(
    (s, c) => s + (c.blocages || []).filter((b) => !b.resolu).length,
    0,
  );

  const notifs = [
    ...chantiers.flatMap((c) =>
      (c.blocages || [])
        .filter((b) => !b.resolu)
        .map((b) => ({
          id: `b${b.id}`,
          msg: `Blocage: ${b.type} · ${c.nom}`,
          type: "blocage",
          date: b.date,
        })),
    ),
    ...facturesRetard.map((f) => ({
      id: `f${f.id}`,
      msg: `Facture en retard: ${f.numero} · ${fmt(f.montantTTC)}`,
      type: "retard",
      date: f.dateEcheance,
    })),
    ...alertesStock.map((e) => ({
      id: `s${e.id}`,
      msg: `Stock faible: ${e.nom} (${e.quantiteDisponible} dispo)`,
      type: "info",
      date: todayStr(),
    })),
  ];

  const groups = [...new Set(ADMIN_TABS.map((t) => t.group))];

  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        display: "flex",
        height: "100vh",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: 215,
          background: "#0d1610",
          borderRight: "1px solid #1a2e1d",
          display: "flex",
          flexDirection: "column",
          padding: "16px 10px",
          flexShrink: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 18, paddingLeft: 5 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            DIGINETS CI
          </div>
          <div style={{ fontSize: 11, color: "#3a5a3d" }}>ERP Direction</div>
        </div>

        <div
          style={{
            background: "#0a1a0d",
            border: "1px solid #1a2e1d",
            borderRadius: 10,
            padding: 9,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#1a3a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#c084fc",
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#d4e8d6" }}>
              {user.nom}
            </div>
            <span
              className="badge"
              style={{ background: "#1a1a2a", color: "#c084fc", fontSize: 10 }}
            >
              Direction
            </span>
          </div>
        </div>

        {totalBlocages > 0 && (
          <div
            className="alert-bar orange"
            style={{ fontSize: 11, cursor: "pointer" }}
            onClick={() => setTab("chantiers")}
          >
            ⚠️ {totalBlocages} blocage(s)
          </div>
        )}
        {retards.length > 0 && (
          <div
            className="alert-bar"
            style={{ fontSize: 11, cursor: "pointer" }}
            onClick={() => setTab("chantiers")}
          >
            🔴 {retards.length} retard(s)
          </div>
        )}
        {facturesRetard.length > 0 && (
          <div
            className="alert-bar orange"
            style={{ fontSize: 11, cursor: "pointer" }}
            onClick={() => setTab("factures")}
          >
            💰 {facturesRetard.length} facture(s) en retard
          </div>
        )}
        {alertesStock.length > 0 && (
          <div
            className="alert-bar blue"
            style={{ fontSize: 11, cursor: "pointer" }}
            onClick={() => setTab("stocks")}
          >
            📦 {alertesStock.length} alerte(s) stock
          </div>
        )}
        {msgsNonLus > 0 && (
          <div
            className="alert-bar green"
            style={{ fontSize: 11, cursor: "pointer" }}
            onClick={() => setTab("messagerie")}
          >
            💬 {msgsNonLus} message(s)
          </div>
        )}

        {groups.map((group) => (
          <div key={group} style={{ marginBottom: 4 }}>
            <div
              style={{
                fontSize: 10,
                color: "#2a4a2d",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                paddingLeft: 5,
                marginBottom: 2,
                marginTop: 8,
              }}
            >
              {group}
            </div>
            {ADMIN_TABS.filter((t) => t.group === group).map((t) => (
              <button
                key={t.id}
                className={`sb-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
                style={{ marginBottom: 1 }}
              >
                <span style={{ fontSize: 13 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        ))}

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <NotifPanel
            notifs={notifs}
            unread={notifs.length}
            show={showNt}
            setShow={setShowNt}
            markRead={() => {}}
          />
          <button
            className="btn-r"
            style={{ width: "100%", padding: "8px" }}
            onClick={onLogout}
          >
            ← Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {tab === "dashboard" && (
          <AdminDashboard
            chantiers={chantiers}
            factures={factures}
            clients={clients}
            equipements={equipements}
            alertesStock={alertesStock}
            facturesRetard={facturesRetard}
            retards={retards}
            totalBudget={totalBudget}
            totalDepense={totalDepense}
            totalCA={totalCA}
            setTab={setTab}
          />
        )}
        {tab === "chantiers" && <AdminChantiers chantiers={chantiers} setChantiers={setChantiers} equipes={equipes} user={user} factures={factures} />}
        {tab === "equipes" && (
          <AdminEquipes
            equipes={equipes}
            setEquipes={setEquipes}
            chantiers={chantiers}
          />
        )}
        {tab === "clients" && (
          <AdminClients
            clients={clients}
            setClients={setClients}
            devis={devis}
            factures={factures}
          />
        )}
        {tab === "devis" && (
          <AdminDevis
            devis={devis}
            setDevis={setDevis}
            clients={clients}
            factures={factures}
            setFactures={setFactures}
          />
        )}
        {tab === "factures" && (
          <AdminFactures
            factures={factures}
            setFactures={setFactures}
            clients={clients}
          />
        )}
        {tab === "contrats" && (
          <AdminContrats
            contrats={contrats}
            setContrats={setContrats}
            clients={clients}
          />
        )}
        {tab === "stocks" && (
          <AdminStocks
            equipements={equipements}
            setEquipements={setEquipements}
            attributions={attributions}
            setAttributions={setAttributions}
            chantiers={chantiers}
            equipes={equipes}
          />
        )}
        {tab === "documents" && (
          <AdminDocuments
            documents={documents}
            setDocuments={setDocuments}
            chantiers={chantiers}
            user={user}
          />
        )}
        {tab === "messagerie" && (
          <AdminMessagerie
            user={user}
            conversations={conversations}
            setConversations={setConversations}
            equipes={equipes}
          />
        )}
        {tab === "ia" && (
          <AdminIA
            user={user}
            chantiers={chantiers}
            clients={clients}
            factures={factures}
            equipements={equipements}
            totalBudget={totalBudget}
            totalDepense={totalDepense}
            totalCA={totalCA}
          />
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function AdminDashboard({
  chantiers,
  factures,
  clients,
  equipements,
  alertesStock,
  facturesRetard,
  retards,
  totalBudget,
  totalDepense,
  totalCA,
  setTab,
}) {
  return (
    <div>
      <SectionTitle title="Vue d'ensemble" sub="DIGINETS CI · ERP Direction" />
      {retards.length > 0 && (
        <div className="alert-bar">
          🔴 {retards.length} chantier(s) en retard :{" "}
          {retards.map((c) => c.nom).join(", ")}
        </div>
      )}
      {facturesRetard.length > 0 && (
        <div className="alert-bar orange">
          💰 {facturesRetard.length} facture(s) en retard de paiement
        </div>
      )}

      <KpiGrid
        items={[
          {
            label: "CA encaissé",
            value: (totalCA / 1000000).toFixed(1) + "M FCFA",
            sub: "reçus",
            color: "#4ade80",
            onClick: () => setTab("factures"),
          },
          {
            label: "Budget chantiers",
            value: (totalBudget / 1000000).toFixed(1) + "M FCFA",
            sub: "engagés",
            color: "#60a5fa",
            onClick: () => setTab("chantiers"),
          },
          {
            label: "Consommé",
            value:
              totalBudget > 0
                ? Math.round((totalDepense / totalBudget) * 100) + "%"
                : "0%",
            sub: (totalDepense / 1000000).toFixed(1) + "M FCFA",
            color: "#fb923c",
          },
          {
            label: "Clients actifs",
            value: (clients || []).filter((c) => c.statut === "Actif" || c.status === "active").length,
            sub: "clients",
            color: "#c084fc",
            onClick: () => setTab("clients"),
          },
        ]}
      />

      <KpiGrid
        items={[
          {
            label: "Chantiers actifs",
            value: chantiers.filter((c) => c.statut === "En cours").length,
            sub: "en cours",
            color: "#4ade80",
            onClick: () => setTab("chantiers"),
          },
          {
            label: "Factures en retard",
            value: facturesRetard.length,
            sub: "à relancer",
            color: facturesRetard.length > 0 ? "#f87171" : "#4ade80",
            onClick: () => setTab("factures"),
          },
          {
            label: "Alertes stock",
            value: alertesStock.length,
            sub: "ruptures/faibles",
            color: alertesStock.length > 0 ? "#fbbf24" : "#4ade80",
            onClick: () => setTab("stocks"),
          },
          {
            label: "Retards",
            value: retards.length,
            sub: "chantiers en retard",
            color: retards.length > 0 ? "#f87171" : "#4ade80",
            onClick: () => setTab("chantiers"),
          },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#d4e8d6",
              marginBottom: 14,
            }}
          >
            Chantiers en cours
          </div>
          {chantiers
            .filter((c) => c.statut === "En cours")
            .map((c) => {
              const d = statutDelai(c.dateFin, c.statut);
              return (
                <div key={c.id} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#d4e8d6",
                          fontWeight: 500,
                        }}
                      >
                        {c.nom}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                        {d && (
                          <span
                            className="badge"
                            style={{ background: d.bg, color: d.color }}
                          >
                            {d.label}
                          </span>
                        )}
                        {(c.blocages || []).filter((b) => !b.resolu).length >
                          0 && (
                          <span style={{ fontSize: 11, color: "#fb923c" }}>
                            ⚠️{" "}
                            {(c.blocages || []).filter((b) => !b.resolu).length}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#4ade80",
                        fontWeight: 600,
                      }}
                    >
                      {c.avancement}%
                    </span>
                  </div>
                  <div className="pbar">
                    <div
                      className="pfill"
                      style={{
                        width: `${c.avancement}%`,
                        background: "linear-gradient(90deg,#166534,#4ade80)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <div className="card">
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#d4e8d6",
              marginBottom: 14,
            }}
          >
            Activité récente
          </div>
          {[
            ...chantiers.flatMap((c) =>
              (c.blocages || [])
                .filter((b) => !b.resolu)
                .map((b) => ({
                  msg: `⚠️ Blocage: ${b.type} · ${c.nom}`,
                  color: "#fb923c",
                  date: b.date,
                })),
            ),
            ...facturesRetard.map((f) => ({
              msg: `💰 Retard: ${f.numero} · ${f.clientNom}`,
              color: "#f87171",
              date: f.dateEcheance,
            })),
            ...alertesStock.map((e) => ({
              msg: `📦 Stock faible: ${e.nom}`,
              color: "#fbbf24",
              date: todayStr(),
            })),
          ]
            .slice(0, 7)
            .map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 8, marginBottom: 10 }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: item.color,
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, color: "#c8deca" }}>
                    {item.msg}
                  </div>
                  <div style={{ fontSize: 10, color: "#3a5a3d" }}>
                    {item.date}
                  </div>
                </div>
              </div>
            ))}
          {chantiers.reduce(
            (s, c) => s + (c.blocages || []).filter((b) => !b.resolu).length,
            0,
          ) === 0 &&
            facturesRetard.length === 0 &&
            alertesStock.length === 0 && (
              <div
                style={{
                  fontSize: 13,
                  color: "#3a5a3d",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                ✅ Tout est en ordre
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── CHANTIERS ────────────────────────────────────────────────
function AdminChantiers({ chantiers, setChantiers, equipes, user, factures }) {
  function getDepense(chantierId) {
    return (factures || [])
      .filter(f => f.project_id === chantierId || f.chantierId === chantierId)
      .reduce((s, f) => s + (f.amount_paid || 0), 0);
  }

  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState("infos");
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(null);
  const [showAssign, setShowAssign] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    client: "Orange CI",
    statut: "Planifié",
    equipe: "",
    budget: "",
    localisation: "",
    type: "Pylône Greenfield",
    dateDebut: "",
    dateFin: "",
  });
  const [upForm, setUpForm] = useState({
    avancement: 0,
    depense: 0,
    statut: "En cours",
  });
  const photoRef = useRef();

  function upd(id, patch) {
    setChantiers((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (selected?.id === id) setSelected((p) => ({ ...p, ...patch }));
  }
  function resoudre(cId, bId) {
    const c = chantiers.find((x) => x.id === cId);
    upd(cId, {
      blocages: c.blocages.map((b) =>
        b.id === bId ? { ...b, resolu: true } : b,
      ),
    });
  }
  function handlePhoto(e) {
    if (!selected) return;
    Array.from(e.target.files).forEach((file) => {
      const r = new FileReader();
      r.onload = (ev) =>
        upd(selected.id, {
          photos: [
            ...(selected.photos || []),
            {
              url: ev.target.result,
              nom: file.name,
              date: todayStr(),
              technicien: "Direction",
            },
          ],
        });
      r.readAsDataURL(file);
    });
  }

  return (
    <div>
      <SectionTitle
        title="Chantiers"
        sub={`${chantiers.length} chantiers`}
        action={
          !selected && (
            <button className="btn-a" onClick={() => setShowAdd(true)}>
              + Nouveau chantier
            </button>
          )
        }
      />

      {!selected ? (
        chantiers.map((c) => {
          const d = statutDelai(c.dateFin, c.statut);
          return (
            <div
              key={c.id}
              className="row"
              onClick={() => {
                setSelected(c);
                setDetailTab("infos");
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {c.nom}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: SC(c.statut).bg,
                        color: SC(c.statut).t,
                      }}
                    >
                      {c.statut}
                    </span>
                    {d && (
                      <span
                        className="badge"
                        style={{ background: d.bg, color: d.color }}
                      >
                        {d.label}
                      </span>
                    )}
                    {(c.blocages || []).filter((b) => !b.resolu).length > 0 && (
                      <span
                        className="badge"
                        style={{ background: "#3a2a1a", color: "#fb923c" }}
                      >
                        ⚠️ {(c.blocages || []).filter((b) => !b.resolu).length}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                    {c.client} · {c.localisation} · {fmt(c.budget)}
                  </div>
                  <div style={{ fontSize: 11, color: "#2a4a2d", marginTop: 3 }}>
                    📝{(c.rapports || []).length} · 📷{(c.photos || []).length}{" "}
                    · ✅{(c.taches || []).filter((t) => t.done).length}/
                    {(c.taches || []).length}
                  </div>
                </div>
                <div style={{ width: 80 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#4ade80",
                      textAlign: "right",
                      marginBottom: 3,
                    }}
                  >
                    {c.avancement}%
                  </div>
                  <div className="pbar">
                    <div
                      className="pfill"
                      style={{
                        width: `${c.avancement}%`,
                        background: "linear-gradient(90deg,#166534,#4ade80)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <>
          <Back onClick={() => setSelected(null)} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#d4e8d6",
                  marginBottom: 6,
                }}
              >
                {selected.nom}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span
                  className="badge"
                  style={{
                    background: SC(selected.statut).bg,
                    color: SC(selected.statut).t,
                  }}
                >
                  {selected.statut}
                </span>
                <DelaiTag dateFin={selected.dateFin} statut={selected.statut} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-a" onClick={() => setShowAssign(selected)}>
                👥 Équipe
              </button>
              <button
                className="btn-b"
                onClick={() => {
                  setUpForm({
                  avancement: selected.avancement || selected.progress || 0,
                  depense: getDepense(selected.id) || selected.spent_amount || 0,
                  statut: selected.statut || selected.status || 'En cours',
                });
                  setShowUpdate(selected);
                }}
              >
                Modifier
              </button>
              <button
                className="btn-r"
                onClick={() => {
                  setChantiers((p) => p.filter((c) => c.id !== selected.id));
                  setSelected(null);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="nav-pill">
            {[
              { id: "infos", label: "Infos" },
              { id: "finances", label: "Finances" },
              {
                id: "taches",
                label: `Tâches (${(selected.taches || []).filter((t) => t.done).length}/${(selected.taches || []).length})`,
              },
              {
                id: "equipe_det",
                label: `Équipe (${(selected.equipe || []).length})`,
              },
              {
                id: "photos",
                label: `Photos (${(selected.photos || []).length})`,
              },
              {
                id: "rapports",
                label: `Rapports (${(selected.rapports || []).length})`,
              },
              {
                id: "blocages",
                label: `Blocages (${(selected.blocages || []).filter((b) => !b.resolu).length})`,
              },
              { id: "presences", label: "Pointages" },
            ].map((t) => (
              <button
                key={t.id}
                className={`np-btn ${detailTab === t.id ? "active" : ""}`}
                onClick={() => setDetailTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {detailTab === "infos" && (
            <div>
              <InfoRow label="Client" value={selected.client} />
              <InfoRow label="Type" value={selected.type} />
              <InfoRow label="Localisation" value={selected.localisation} />
              <InfoRow label="Début" value={selected.dateDebut} />
              <InfoRow label="Fin prévue" value={selected.dateFin} />
              <InfoRow
                label="Équipe"
                value={(selected.equipe || []).join(", ")}
              />
            </div>
          )}

          {detailTab === "finances" && (
            <div>
              {[
                ["Budget total", selected.budget, "#60a5fa"],
                ["Dépensé", getDepense(selected.id), "#fb923c"],
                ["Restant", selected.budget - getDepense(selected.id), "#4ade80"],
              ].map(([k, v, col]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "#0d1610",
                    borderRadius: 10,
                    border: "1px solid #1a2e1d",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#4a6a4d" }}>{k}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: col }}>
                    {fmt(v)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  background: "#0d1610",
                  borderRadius: 10,
                  padding: 14,
                  border: "1px solid #1a2e1d",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#4a6a4d" }}>
                    Taux de consommation
                  </span>
                  <span
                    style={{ fontSize: 14, color: "#4ade80", fontWeight: 700 }}
                  >
                    {selected.budget > 0
                      ? Math.round((getDepense(selected.id) / selected.budget) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="pbar" style={{ height: 8 }}>
                  <div
                    className="pfill"
                    style={{
                      width: `${selected.budget > 0 ? Math.round((getDepense(selected.id) / selected.budget) * 100) : 0}%`,
                      background: "linear-gradient(90deg,#166534,#4ade80)",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {detailTab === "taches" && (
            <div>
              <button
                className="btn-a"
                style={{ marginBottom: 12 }}
                onClick={() => {
                  const t = prompt("Nom de la tâche :");
                  if (t)
                    upd(selected.id, {
                      taches: [
                        ...(selected.taches || []),
                        { id: Date.now(), label: t, done: false },
                      ],
                    });
                }}
              >
                + Tâche
              </button>
              {(selected.taches || []).map((t) => (
                <div
                  key={t.id}
                  className="trow"
                  onClick={() => {
                    const taches = selected.taches.map((x) =>
                      x.id === t.id ? { ...x, done: !x.done } : x,
                    );
                    const av = Math.round(
                      (taches.filter((x) => x.done).length / taches.length) *
                        100,
                    );
                    upd(selected.id, { taches, avancement: av });
                  }}
                >
                  <div className={`tcheck ${t.done ? "done" : ""}`}>
                    {t.done && (
                      <span
                        style={{
                          color: "#0a0f0d",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: t.done ? "#4a6a4d" : "#d4e8d6",
                      textDecoration: t.done ? "line-through" : "none",
                      flex: 1,
                    }}
                  >
                    {t.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      upd(selected.id, {
                        taches: selected.taches.filter((x) => x.id !== t.id),
                      });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: 15,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {detailTab === "equipe_det" && (
            <div>
              <button
                className="btn-a"
                style={{ marginBottom: 12 }}
                onClick={() => setShowAssign(selected)}
              >
                👥 Modifier l'équipe
              </button>
              {(selected.equipe || []).map((nom, i) => {
                const e = equipes.find((x) => x.nom === nom);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      background: "#0d1610",
                      borderRadius: 10,
                      border: "1px solid #1a2e1d",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#1a3a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: e ? ROLE_COLORS[e.role] : "#4ade80",
                      }}
                    >
                      {nom.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#d4e8d6",
                        }}
                      >
                        {nom}
                      </div>
                      {e && (
                        <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                          {e.poste} · {e.tel}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        upd(selected.id, {
                          equipe: selected.equipe.filter((n) => n !== nom),
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: 15,
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {detailTab === "photos" && (
            <div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhoto}
              />
              <div
                className="pzone"
                onClick={() => photoRef.current.click()}
                style={{ marginBottom: 14 }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
                <div style={{ fontSize: 13, color: "#4a6a4d" }}>
                  Ajouter des photos
                </div>
              </div>
              {(selected.photos || []).length === 0 ? (
                <div
                  style={{
                    color: "#3a5a3d",
                    textAlign: "center",
                    padding: "16px 0",
                    fontSize: 13,
                  }}
                >
                  Aucune photo
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))",
                    gap: 8,
                  }}
                >
                  {selected.photos.map((p, i) => (
                    <div key={i}>
                      <img
                        src={p.url}
                        alt=""
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #1e301f",
                        }}
                      />
                      <div
                        style={{ fontSize: 10, color: "#3a5a3d", marginTop: 2 }}
                      >
                        {p.technicien} · {p.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {detailTab === "rapports" && (
            <div>
              {(selected.rapports || []).length === 0 ? (
                <div
                  style={{
                    color: "#3a5a3d",
                    textAlign: "center",
                    padding: "16px 0",
                    fontSize: 13,
                  }}
                >
                  Aucun rapport
                </div>
              ) : (
                [...selected.rapports].reverse().map((r) => (
                  <div key={r.id} className="rpt-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4ade80",
                        }}
                      >
                        {r.technicien}
                      </span>
                      <span style={{ fontSize: 11, color: "#3a5a3d" }}>
                        {r.date}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c8deca",
                        marginBottom: 3,
                      }}
                    >
                      <strong style={{ color: "#6b8a6e" }}>Travaux: </strong>
                      {r.travaux}
                    </div>
                    {r.problemes && (
                      <div style={{ fontSize: 13, color: "#c8deca" }}>
                        <strong style={{ color: "#6b8a6e" }}>
                          Problèmes:{" "}
                        </strong>
                        {r.problemes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {detailTab === "blocages" && (
            <div>
              {(selected.blocages || []).length === 0 ? (
                <div
                  style={{
                    color: "#3a5a3d",
                    textAlign: "center",
                    padding: "16px 0",
                    fontSize: 13,
                  }}
                >
                  Aucun blocage
                </div>
              ) : (
                [...selected.blocages].reverse().map((b) => (
                  <div key={b.id} className="bloc-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <span
                          className="badge"
                          style={{
                            background: b.resolu ? "#1a2a3a" : "#3a2a1a",
                            color: b.resolu ? "#60a5fa" : "#fb923c",
                          }}
                        >
                          {b.resolu ? "Résolu" : "Actif"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#fb923c",
                          }}
                        >
                          {b.type}
                        </span>
                      </div>
                      {!b.resolu && (
                        <button
                          className="btn-a"
                          style={{ fontSize: 11, padding: "4px 10px" }}
                          onClick={() => resoudre(selected.id, b.id)}
                        >
                          ✓ Résoudre
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c8deca",
                        marginBottom: 4,
                      }}
                    >
                      {b.description}
                    </div>
                    <div style={{ fontSize: 11, color: "#5a4a3a" }}>
                      Signalé par {b.technicien} · {b.date}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {detailTab === "presences" && (
            <div>
              {(selected.presences || []).length === 0 ? (
                <div
                  style={{
                    color: "#3a5a3d",
                    textAlign: "center",
                    padding: "16px 0",
                    fontSize: 13,
                  }}
                >
                  Aucun pointage
                </div>
              ) : (
                [...selected.presences].reverse().map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "9px 13px",
                      background: "#0d1610",
                      borderRadius: 9,
                      border: "1px solid #1a2e1d",
                      marginBottom: 5,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#d4e8d6" }}>
                      {p.technicien}
                    </span>
                    <span style={{ color: "#4a6a4d" }}>{p.date}</span>
                    <span style={{ color: "#4ade80" }}>↑ {p.arrivee}</span>
                    {p.depart ? (
                      <span style={{ color: "#60a5fa" }}>↓ {p.depart}</span>
                    ) : (
                      <span style={{ color: "#3a5a3d" }}>En cours</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {showAssign && (
        <AssignModal
          chantier={showAssign}
          equipes={equipes}
          onSave={(m) => upd(showAssign.id, { equipe: m })}
          onClose={() => setShowAssign(null)}
        />
      )}

      {showUpdate && (
        <Modal
          title="Mettre à jour"
          onClose={() => setShowUpdate(null)}
          width={400}
        >
          <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
            {showUpdate.nom}
          </div>
          <div className="fg">
            <label className="lbl">Statut</label>
            <select
              className="field"
              value={upForm.statut}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, statut: e.target.value }))
              }
            >
              {["Planifié", "En attente", "En cours", "Terminé"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Avancement (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="field"
              value={upForm.avancement}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, avancement: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Dépenses (FCFA)</label>
            <input
              type="number"
              className="field"
              value={upForm.depense}
              onChange={(e) =>
                setUpForm((f) => ({ ...f, depense: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={async () => {
                try {
                  await updateChantier(showUpdate.id, {
                    avancement: parseInt(upForm.avancement),
                    depense: parseInt(upForm.depense),
                    statut: upForm.statut,
                  });
                  // Recharger depuis Supabase pour avoir les vraies données
                  const data = await import('./services/chantiers').then(m => m.loadChantiers());
                  setChantiers(data);
                  setSelected(data.find(c => c.id === showUpdate.id) || null);
                  setShowUpdate(null);
                } catch (err) {
                  alert('Erreur: ' + err.message);
                }
              }}
            >
              Enregistrer
            </button>
            <button className="btn-b" onClick={() => setShowUpdate(null)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Nouveau chantier" onClose={() => setShowAdd(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Nom *</label>
              <input
                className="field"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Client</label>
              <select
                className="field"
                value={form.client}
                onChange={(e) =>
                  setForm((f) => ({ ...f, client: e.target.value }))
                }
              >
                {["Orange CI", "MTN CI", "Moov Africa", "Autre"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Type</label>
              <select
                className="field"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {[
                  "Pylône Greenfield",
                  "Fibre Optique",
                  "Maintenance",
                  "Déploiement 4G",
                  "Cabinet & Shelter",
                  "Audit Réseau",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Statut</label>
              <select
                className="field"
                value={form.statut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, statut: e.target.value }))
                }
              >
                {["Planifié", "En attente", "En cours"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Localisation</label>
              <input
                className="field"
                value={form.localisation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, localisation: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Budget (FCFA) *</label>
              <input
                type="number"
                className="field"
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Date début</label>
              <input
                className="field"
                placeholder="JJ/MM/AAAA"
                value={form.dateDebut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateDebut: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Date fin *</label>
              <input
                className="field"
                placeholder="JJ/MM/AAAA"
                value={form.dateFin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateFin: e.target.value }))
                }
              />
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Équipe (noms séparés par virgule)</label>
              <input
                className="field"
                placeholder="Ex: Konan A., Traoré B."
                value={form.equipe}
                onChange={(e) =>
                  setForm((f) => ({ ...f, equipe: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={async () => {
  if (!form.nom || !form.budget) return;
  try {
    const nouveau = await createChantier({
      nom: form.nom,
      localisation: form.localisation,
      budget: form.budget,
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
    }, user.id);
    setChantiers(p => [nouveau, ...p]);
    setForm({ nom: "", client: "Orange CI", statut: "Planifié", equipe: "", budget: "", localisation: "", type: "Pylône Greenfield", dateDebut: "", dateFin: "" });
    setShowAdd(false);
  } catch (err) {
    alert('Erreur: ' + err.message);
  }
}}
              disabled={!form.nom || !form.budget}
            >
              Créer
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}


// ─── ÉQUIPES ──────────────────────────────────────────────────
function AdminEquipes({ equipes, setEquipes, chantiers }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    role: "technicien",
    poste: "Technicien RF",
    tel: "",
    statut: "Actif",
  });
  return (
    <div>
      <SectionTitle
        title="Équipes"
        sub={`${equipes.length} membres`}
        action={
          <button className="btn-a" onClick={() => setShowAdd(true)}>
            + Ajouter
          </button>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: 12,
        }}
      >
        {equipes.map((e) => (
          <div key={e.id} className="card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#1a3a2a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: ROLE_COLORS[e.role],
                  }}
                >
                  {e.nom.charAt(0)}
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#d4e8d6" }}
                  >
                    {e.nom}
                  </div>
                  <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                    {e.poste}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  setEquipes((p) => p.filter((x) => x.id !== e.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#3a5a3d", marginBottom: 8 }}>
              📞 {e.tel}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, color: "#3a5a3d" }}>
                {chantiers.filter((c) => (c.equipe || []).includes(e.nom)).length}{" "}
                chantier(s)
              </span>
              <span
                className="badge"
                style={{
                  background: "#1a3a2a",
                  color: "#4ade80",
                  fontSize: 10,
                }}
              >
                {e.statut}
              </span>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <Modal
          title="Ajouter un membre"
          onClose={() => setShowAdd(false)}
          width={400}
        >
          <div className="fg">
            <label className="lbl">Nom complet *</label>
            <input
              className="field"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            />
          </div>
          <div className="fg">
            <label className="lbl">Rôle</label>
            <select
              className="field"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="chef">Chef de chantier</option>
              <option value="technicien">Technicien</option>
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Poste</label>
            <select
              className="field"
              value={form.poste}
              onChange={(e) =>
                setForm((f) => ({ ...f, poste: e.target.value }))
              }
            >
              {[
                "Chef de chantier",
                "Technicien RF",
                "Technicien Civil",
                "Ingénieur Fibre",
                "Technicien Réseau",
                "Auditeur Réseau",
              ].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Téléphone</label>
            <input
              className="field"
              placeholder="07 00 00 00"
              value={form.tel}
              onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!form.nom) return;
                setEquipes((p) => [...p, { ...form, id: Date.now() }]);
                setForm({
                  nom: "",
                  role: "technicien",
                  poste: "Technicien RF",
                  tel: "",
                  statut: "Actif",
                });
                setShowAdd(false);
              }}
              disabled={!form.nom}
            >
              Ajouter
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────
function AdminClients({ clients, setClients, devis, factures }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    secteur: "Télécom",
    statut: "Actif",
    contact: "",
    email: "",
    tel: "",
    adresse: "",
    ville: "Abidjan",
    notes: "",
  });

  return (
    <div>
      <SectionTitle
        title="Clients"
        sub={`${(clients || []).length} clients`}
        action={
          !selected && (
            <button className="btn-a" onClick={() => setShowAdd(true)}>
              + Nouveau client
            </button>
          )
        }
      />
      {!selected ? (
        (clients || []).map((c) => (
          <div key={c.id} className="row" onClick={() => setSelected(c)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "#1a3a2a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#4ade80",
                }}
              >
                {(c.nom || c.name || '?').charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}
                  >
                    {c.nom || c.name}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: c.statut === "Actif" ? "#1a3a2a" : "#3a2a1a",
                      color: c.statut === "Actif" ? "#4ade80" : "#fb923c",
                    }}
                  >
                    {c.statut || c.statut}
                  </span>
                </div>
               <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                {c.contact || c.contact_name} · {c.tel || c.contact_phone} · {c.ville || c.city}
              </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>
                  {((factures || [])
  .filter(f => (f.clientId === c.id || f.client_id === c.id) && (f.statut === 'paid' || f.statut === 'Payée'))
  .reduce((s, f) => s + (f.montantTTC || f.amount_ttc || 0), 0) / 1000000).toFixed(1)}M FCFA
                </div>
                <div style={{ fontSize: 11, color: "#3a5a3d" }}>
                  {(devis || []).filter((d) => d.clientId === c.id || d.client_id === c.id).length}{" "}
                  devis ·{" "}
                  {(factures || []).filter((f) => f.clientId === c.id || f.client_id === c.id).length}{" "}
                  factures
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>
          <Back onClick={() => setSelected(null)} />
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: "#d4e8d6" }}>
                {selected.nom}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() =>
                    whatsapp(
                      selected.tel,
                      `Bonjour ${selected.contact},\n\nJe vous contacte de la part de DIGINETS CI.`,
                    )
                  }
                  className="btn-a"
                  style={{ fontSize: 12 }}
                >
                  💬 WhatsApp
                </button>
                <a
                  href={`mailto:${selected.email}`}
                  className="btn-b"
                  style={{ fontSize: 12, textDecoration: "none" }}
                >
                  ✉️ Email
                </a>
                <button
                  className="btn-r"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    setClients((p) => p.filter((c) => c.id !== selected.id));
                    setSelected(null);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <InfoRow label="Contact" value={selected.contact} />
            <InfoRow label="Email" value={selected.email} />
            <InfoRow label="Téléphone" value={selected.tel} />
            <InfoRow label="Adresse" value={selected.adresse} />
            {selected.notes && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#0d1610",
                  borderRadius: 8,
                  border: "1px solid #1a2e1d",
                  fontSize: 13,
                  color: "#a0c8a2",
                }}
              >
                {selected.notes}
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              {[
                ["CA total", fmt(selected.chiffreAffaires), "#4ade80"],
                [
                  "Devis",
                  (devis || []).filter((d) => d.clientId === selected.id)
                    .length,
                  "#60a5fa",
                ],
                [
                  "Factures",
                  (factures || []).filter((f) => f.clientId === selected.id)
                    .length,
                  "#c084fc",
                ],
              ].map(([k, v, col]) => (
                <div
                  key={k}
                  style={{
                    background: "#0d1610",
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: "1px solid #1a2e1d",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#4a6a4d",
                      fontWeight: 600,
                      marginBottom: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <Modal title="Nouveau client" onClose={() => setShowAdd(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Nom *</label>
              <input
                className="field"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Contact</label>
              <input
                className="field"
                value={form.contact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Téléphone</label>
              <input
                className="field"
                value={form.tel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tel: e.target.value }))
                }
              />
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Email</label>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Adresse</label>
              <input
                className="field"
                value={form.adresse}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adresse: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Ville</label>
              <input
                className="field"
                value={form.ville}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ville: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Statut</label>
              <select
                className="field"
                value={form.statut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, statut: e.target.value }))
                }
              >
                <option>Actif</option>
                <option>Inactif</option>
                <option>Prospect</option>
              </select>
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Notes</label>
              <textarea
                className="field"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!form.nom) return;
                setClients((p) => [
                  ...p,
                  {
                    ...form,
                    id: Date.now(),
                    chiffreAffaires: 0,
                    dateCreation: todayStr(),
                  },
                ]);
                setForm({
                  nom: "",
                  secteur: "Télécom",
                  statut: "Actif",
                  contact: "",
                  email: "",
                  tel: "",
                  adresse: "",
                  ville: "Abidjan",
                  notes: "",
                });
                setShowAdd(false);
              }}
              disabled={!form.nom}
            >
              Créer
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DEVIS ────────────────────────────────────────────────────
function AdminDevis({ devis, setDevis, clients, factures, setFactures }) {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatut, setFilterStatut] = useState("Tout");
  const [form, setForm] = useState({
    clientId: (clients || [])[0]?.id || 1,
    clientNom: (clients || [])[0]?.nom || "",
    objet: "",
    tva: 18,
    remise: 0,
    notes: "",
    lignes: [{ id: 1, description: "", quantite: 1, prixUnit: 0, total: 0 }],
  });

  const filtered =
    filterStatut === "Tout"
      ? devis || []
      : (devis || []).filter((d) => d.statut === filterStatut);

  function updateStatut(id, statut) {
    setDevis((p) =>
      p.map((d) =>
        d.id === id
          ? {
              ...d,
              statut,
              dateAcceptation:
                statut === "Accepté" ? todayStr() : d.dateAcceptation,
            }
          : d,
      ),
    );
    if (selected?.id === id) setSelected((p) => ({ ...p, statut }));
  }

  function creerFacture(d) {
    const ht = Math.round(d.montantTTC / (1 + d.tva / 100));
    const num = `FAC-2025-${String((factures || []).length + 1).padStart(3, "0")}`;
    setFactures((p) => [
      ...(p || []),
      {
        id: Date.now(),
        numero: num,
        devisId: d.id,
        clientId: d.clientId,
        clientNom: d.clientNom,
        chantierId: d.chantierId || null,
        objet: d.objet,
        montantHT: ht,
        tva: d.tva,
        montantTTC: d.montantTTC,
        statut: "En attente",
        dateEmission: todayStr(),
        dateEcheance: "",
        datePaiement: null,
        paiements: [],
      },
    ]);
    updateStatut(d.id, "Facturé");
    setSelected(null);
    alert(`✅ Facture ${num} créée !`);
  }

  function addDevis() {
    if (!form.objet) return;
    const ht = form.lignes.reduce((s, l) => s + (l.total || 0), 0);
    const apresRemise = ht * (1 - form.remise / 100);
    const ttc = Math.round(apresRemise * (1 + form.tva / 100));
    const num = `DEV-2025-${String((devis || []).length + 1).padStart(3, "0")}`;
    setDevis((p) => [
      ...(p || []),
      {
        ...form,
        id: Date.now(),
        numero: num,
        montantHT: Math.round(apresRemise),
        montantTTC: ttc,
        statut: "Brouillon",
        dateCreation: todayStr(),
        dateExpiration: "",
        dateAcceptation: null,
        chantierId: null,
      },
    ]);
    setForm({
      clientId: (clients || [])[0]?.id || 1,
      clientNom: (clients || [])[0]?.nom || "",
      objet: "",
      tva: 18,
      remise: 0,
      notes: "",
      lignes: [{ id: 1, description: "", quantite: 1, prixUnit: 0, total: 0 }],
    });
    setShowAdd(false);
  }

  return (
    <div>
      <SectionTitle
        title="Devis"
        sub={`${(devis || []).length} devis`}
        action={
          !selected && (
            <button className="btn-a" onClick={() => setShowAdd(true)}>
              + Nouveau devis
            </button>
          )
        }
      />

      {!selected && (
        <>
          <div className="tab-group">
            {["Tout", "Brouillon", "Envoyé", "Accepté", "Refusé"].map((s) => (
              <button
                key={s}
                className={`tg-btn ${filterStatut === s ? "active" : ""}`}
                onClick={() => setFilterStatut(s)}
              >
                {s} (
                {s === "Tout"
                  ? (devis || []).length
                  : (devis || []).filter((d) => d.statut === s).length}
                )
              </button>
            ))}
          </div>
          <KpiGrid
            items={[
              { label: "Total", value: (devis || []).length, color: "#4ade80" },
              {
                label: "Envoyés",
                value: (devis || []).filter((d) => d.statut === "Envoyé")
                  .length,
                sub: "en attente réponse",
                color: "#60a5fa",
              },
              {
                label: "Acceptés",
                value: (devis || []).filter((d) => d.statut === "Accepté")
                  .length,
                color: "#4ade80",
              },
              {
                label: "Valeur totale",
                value:
                  (
                    (devis || []).reduce((s, d) => s + d.montantTTC, 0) /
                    1000000
                  ).toFixed(1) + "M FCFA",
                color: "#c084fc",
              },
            ]}
          />
        </>
      )}

      {!selected ? (
        filtered.map((d) => (
          <div key={d.id} className="row" onClick={() => setSelected(d)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}
                  >
                    {d.numero}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: DEVIS_SC(d.statut).bg,
                      color: DEVIS_SC(d.statut).t,
                    }}
                  >
                    {d.statut}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                  {d.clientNom} · {d.objet}
                </div>
                <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 2 }}>
                  Créé {d.dateCreation} · Expire {d.dateExpiration || "N/A"}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
                {(d.montantTTC / 1000000).toFixed(1)}M FCFA
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>
          <Back onClick={() => setSelected(null)} />
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}
                >
                  {selected.numero}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#d4e8d6",
                    marginBottom: 6,
                  }}
                >
                  {selected.objet}
                </div>
                <div style={{ fontSize: 13, color: "#4a6a4d" }}>
                  {selected.clientNom} · Créé le {selected.dateCreation}
                </div>
              </div>
              <span
                className="badge"
                style={{
                  background: DEVIS_SC(selected.statut).bg,
                  color: DEVIS_SC(selected.statut).t,
                  fontSize: 12,
                  padding: "4px 12px",
                }}
              >
                {selected.statut}
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="lbl">Lignes du devis</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 70px 120px 120px",
                  gap: 8,
                  padding: "6px 8px",
                }}
              >
                {["Description", "Qté", "Prix unit.", "Total"].map((h) => (
                  <span
                    key={h}
                    style={{ fontSize: 11, color: "#4a6a4d", fontWeight: 600 }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {(selected.lignes || []).map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 120px 120px",
                    gap: 8,
                    padding: 8,
                    background: "#0d1610",
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#c8deca" }}>
                    {l.description}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#a0c8a2",
                      textAlign: "center",
                    }}
                  >
                    {l.quantite}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#a0c8a2",
                      textAlign: "right",
                    }}
                  >
                    {fmt(l.prixUnit)}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#4ade80",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {fmt(l.total)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #1e301f",
                paddingTop: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#4a6a4d" }}>
                  Montant HT
                </span>
                <span style={{ fontSize: 13, color: "#c8deca" }}>
                  {fmt(selected.montantHT)}
                </span>
              </div>
              {selected.remise > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#4a6a4d" }}>
                    Remise {selected.remise}%
                  </span>
                  <span style={{ fontSize: 13, color: "#fb923c" }}>
                    - {fmt((selected.montantHT * selected.remise) / 100)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: "#4a6a4d" }}>
                  TVA {selected.tva}%
                </span>
                <span style={{ fontSize: 13, color: "#c8deca" }}>
                  {fmt((selected.montantHT * selected.tva) / 100)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid #1e301f",
                }}
              >
                <span
                  style={{ fontSize: 15, fontWeight: 700, color: "#d4e8d6" }}
                >
                  TOTAL TTC
                </span>
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: "#4ade80" }}
                >
                  {fmt(selected.montantTTC)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.statut === "Brouillon" && (
                <>
                  <button
                    className="btn-b"
                    onClick={() => updateStatut(selected.id, "Envoyé")}
                  >
                    📤 Marquer envoyé
                  </button>
                  <button
                    className="btn-r"
                    onClick={() => {
                      setDevis((p) => p.filter((d) => d.id !== selected.id));
                      setSelected(null);
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </>
              )}
              {selected.statut === "Envoyé" && (
                <>
                  <button
                    className="btn-a"
                    onClick={() => updateStatut(selected.id, "Accepté")}
                  >
                    ✅ Accepté
                  </button>
                  <button
                    className="btn-r"
                    onClick={() => updateStatut(selected.id, "Refusé")}
                  >
                    ❌ Refusé
                  </button>
                  <button
                    className="btn-o"
                    onClick={() => {
                      const c = (clients || []).find(
                        (x) => x.id === selected.clientId,
                      );
                      if (c)
                        whatsapp(
                          c.tel,
                          `Bonjour ${c.contact},\n\nVeuillez trouver notre devis ${selected.numero} d'un montant de ${fmt(selected.montantTTC)} pour : ${selected.objet}.\n\nCordialement, DIGINETS CI`,
                        );
                    }}
                  >
                    💬 WA
                  </button>
                </>
              )}
              {selected.statut === "Accepté" && (
                <button
                  className="btn-b"
                  onClick={() => creerFacture(selected)}
                >
                  🧾 Créer la facture
                </button>
              )}
              {selected.statut === "Refusé" && (
                <>
                  <button
                    className="btn-b"
                    onClick={() => updateStatut(selected.id, "Brouillon")}
                  >
                    ↩️ Remettre brouillon
                  </button>
                  <button
                    className="btn-r"
                    onClick={() => {
                      setDevis((p) => p.filter((d) => d.id !== selected.id));
                      setSelected(null);
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Nouveau devis" onClose={() => setShowAdd(false)}>
          <div className="fg">
            <label className="lbl">Client *</label>
            <select
              className="field"
              value={form.clientId}
              onChange={(e) => {
                const c = (clients || []).find(
                  (x) => x.id === parseInt(e.target.value),
                );
                setForm((f) => ({
                  ...f,
                  clientId: parseInt(e.target.value),
                  clientNom: c?.nom || "",
                }));
              }}
            >
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Objet *</label>
            <input
              className="field"
              placeholder="Description des travaux"
              value={form.objet}
              onChange={(e) =>
                setForm((f) => ({ ...f, objet: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg">
              <label className="lbl">TVA (%)</label>
              <input
                type="number"
                className="field"
                value={form.tva}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tva: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Remise (%)</label>
              <input
                type="number"
                className="field"
                value={form.remise}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    remise: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Lignes</label>
            {form.lignes.map((l, i) => (
              <div
                key={l.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 100px 30px",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <input
                  className="field"
                  style={{ fontSize: 12 }}
                  placeholder="Description"
                  value={l.description}
                  onChange={(e) => {
                    const lg = [...form.lignes];
                    lg[i] = { ...l, description: e.target.value };
                    setForm((f) => ({ ...f, lignes: lg }));
                  }}
                />
                <input
                  type="number"
                  className="field"
                  style={{ fontSize: 12 }}
                  value={l.quantite}
                  onChange={(e) => {
                    const lg = [...form.lignes];
                    const q = parseInt(e.target.value) || 1;
                    lg[i] = { ...l, quantite: q, total: q * l.prixUnit };
                    setForm((f) => ({ ...f, lignes: lg }));
                  }}
                />
                <input
                  type="number"
                  className="field"
                  style={{ fontSize: 12 }}
                  placeholder="Prix"
                  value={l.prixUnit}
                  onChange={(e) => {
                    const lg = [...form.lignes];
                    const p = parseInt(e.target.value) || 0;
                    lg[i] = { ...l, prixUnit: p, total: l.quantite * p };
                    setForm((f) => ({ ...f, lignes: lg }));
                  }}
                />
                <button
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      lignes: f.lignes.filter((x) => x.id !== l.id),
                    }))
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="btn-b"
              style={{ fontSize: 12, padding: "6px 12px" }}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  lignes: [
                    ...f.lignes,
                    {
                      id: Date.now(),
                      description: "",
                      quantite: 1,
                      prixUnit: 0,
                      total: 0,
                    },
                  ],
                }))
              }
            >
              + Ligne
            </button>
            {form.lignes.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  textAlign: "right",
                  fontSize: 13,
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                TTC estimé :{" "}
                {fmt(
                  form.lignes.reduce((s, l) => s + l.total, 0) *
                    (1 - form.remise / 100) *
                    (1 + form.tva / 100),
                )}
              </div>
            )}
          </div>
          <div className="fg">
            <label className="lbl">Notes</label>
            <textarea
              className="field"
              style={{ minHeight: 60 }}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={addDevis}
              disabled={!form.objet}
            >
              Créer le devis
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FACTURES ─────────────────────────────────────────────────
function AdminFactures({ factures, setFactures, clients }) {
  const [selected, setSelected] = useState(null);
  const [showPaiement, setShowPaiement] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pForm, setPForm] = useState({
    montant: "",
    mode: "Virement bancaire",
    ref: "",
    date: todayStr(),
  });
  const [form, setForm] = useState({
    clientId: (clients || [])[0]?.id || 1,
    clientNom: (clients || [])[0]?.nom || "",
    objet: "",
    montantHT: "",
    tva: 18,
    dateEcheance: "",
  });

  const retards = (factures || []).filter(
    (f) => f.statut !== "Payée" && joursRestants(f.dateEcheance) < 0,
  );
  const totalPayees = (factures || [])
    .filter((f) => f.statut === "Payée" || f.statut === "paid")
    .reduce((s, f) => s + f.montantTTC, 0);
  const totalAttente = (factures || [])
    .filter((f) => f.statut !== "Payée" && f.statut !== "paid")
    .reduce((s, f) => s + f.montantTTC, 0);

  function ajouterPaiement() {
    if (!pForm.montant || !showPaiement) return;
    const montant = parseInt(pForm.montant);
    const facture = (factures || []).find((f) => f.id === showPaiement.id);
    const totalPaye =
      (facture.paiements || []).reduce((s, p) => s + p.montant, 0) + montant;
    const statut = totalPaye >= facture.montantTTC ? "Payée" : "Partielle";
    const newP = { ...pForm, id: Date.now(), montant };
    setFactures((p) =>
      (p || []).map((f) =>
        f.id === showPaiement.id
          ? {
              ...f,
              paiements: [...(f.paiements || []), newP],
              statut,
              datePaiement: statut === "Payée" ? todayStr() : null,
            }
          : f,
      ),
    );
    if (selected?.id === showPaiement.id)
      setSelected((p) => ({
        ...p,
        paiements: [...(p.paiements || []), newP],
        statut,
      }));
    setPForm({
      montant: "",
      mode: "Virement bancaire",
      ref: "",
      date: todayStr(),
    });
    setShowPaiement(null);
  }

  function relancer(f) {
    const c = (clients || []).find((x) => x.id === f.clientId);
    const msg = `Madame, Monsieur,\n\nNous vous relançons au sujet de la facture ${f.numero} d'un montant de ${fmt(f.montantTTC)}, échue le ${f.dateEcheance}.\n\nMerci de procéder au règlement dans les meilleurs délais.\n\nCordialement, DIGINETS CI`;
    if (c?.tel) whatsapp(c.tel, msg);
  }

  return (
    <div>
      <SectionTitle
        title="Facturation"
        sub={`${(factures || []).length} factures`}
        action={
          !selected && (
            <button className="btn-a" onClick={() => setShowAdd(true)}>
              + Nouvelle facture
            </button>
          )
        }
      />
      {!selected && retards.length > 0 && (
        <div className="alert-bar">
          🔴 {retards.length} facture(s) en retard ·{" "}
          {fmt(retards.reduce((s, f) => s + f.montantTTC, 0))}
        </div>
      )}
      {!selected && (
        <KpiGrid
          items={[
            {
              label: "Encaissé",
              value: (totalPayees / 1000000).toFixed(1) + "M FCFA",
              color: "#4ade80",
            },
            {
              label: "En attente",
              value: (totalAttente / 1000000).toFixed(1) + "M FCFA",
              color: "#60a5fa",
            },
            {
              label: "En retard",
              value: retards.length + " facture(s)",
              color: retards.length > 0 ? "#f87171" : "#4ade80",
            },
            {
              label: "Total",
              value: (factures || []).length,
              color: "#c084fc",
            },
          ]}
        />
      )}

      {!selected ? (
        (factures || []).map((f) => {
          const j = joursRestants(f.dateEcheance);
          return (
            <div key={f.id} className="row" onClick={() => setSelected(f)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {f.numero}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: FAC_SC(f.statut).bg,
                        color: FAC_SC(f.statut).t,
                      }}
                    >
                      {{
                        paid: "Payée",
                        sent: "En attente",
                        overdue: "En retard",
                        partial: "Partielle",
                        draft: "Brouillon",
                        cancelled: "Annulée",
                      }[f.statut] || f.statut}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                    {f.clientNom} · {f.objet}
                  </div>
                  <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 2 }}>
                    Émise {f.dateEmission} · Échéance {f.dateEcheance || "N/A"}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}
                  >
                    {fmt(f.montantTTC)}
                  </div>
                  {f.statut !== "Payée" && f.statut !== "paid" && (
                    <button
                      className="btn-o"
                      style={{ fontSize: 11 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        relancer(f);
                      }}
                    >
                      📤 Relancer
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div>
          <Back onClick={() => setSelected(null)} />
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 4 }}
                >
                  {selected.numero}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#d4e8d6",
                    marginBottom: 4,
                  }}
                >
                  {selected.objet}
                </div>
                <div style={{ fontSize: 13, color: "#4a6a4d" }}>
                  {selected.clientNom}
                </div>
              </div>
              <span
                className="badge"
                style={{
                  background: FAC_SC(selected.statut).bg,
                  color: FAC_SC(selected.statut).t,
                  fontSize: 12,
                  padding: "4px 12px",
                }}
              >
                {selected.statut}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                ["Date émission", selected.dateEmission],
                ["Date échéance", selected.dateEcheance || "N/A"],
                ["Montant HT", fmt(selected.montantHT)],
                [
                  `TVA ${selected.tva}%`,
                  fmt((selected.montantHT * selected.tva) / 100),
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: "#0d1610",
                    borderRadius: 9,
                    padding: "10px 13px",
                    border: "1px solid #1a2e1d",
                  }}
                >
                  <div
                    style={{ fontSize: 11, color: "#4a6a4d", marginBottom: 3 }}
                  >
                    {k}
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: "#c8deca" }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#0a1a0d",
                borderRadius: 10,
                padding: "14px 16px",
                border: "1px solid #1e301f",
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#d4e8d6" }}>
                TOTAL TTC
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#4ade80" }}>
                {fmt(selected.montantTTC)}
              </span>
            </div>
            {(selected.paiements || []).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label className="lbl">Paiements reçus</label>
                {selected.paiements.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#0d1610",
                      borderRadius: 8,
                      marginBottom: 4,
                      border: "1px solid #1a3a2a",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#a0c8a2" }}>
                      {p.date} · {p.mode} {p.ref ? `· ${p.ref}` : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#4ade80",
                      }}
                    >
                      {fmt(p.montant)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 12,
                    color: "#4a6a4d",
                    marginTop: 6,
                  }}
                >
                  Restant :{" "}
                  {fmt(
                    selected.montantTTC -
                      (selected.paiements || []).reduce(
                        (s, p) => s + p.montant,
                        0,
                      ),
                  )}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selected.statut !== "Payée" && (
                <>
                  <button
                    className="btn-a"
                    onClick={() => {
                      setPForm({
                        montant: "",
                        mode: "Virement bancaire",
                        ref: "",
                        date: todayStr(),
                      });
                      setShowPaiement(selected);
                    }}
                  >
                    💳 Enregistrer paiement
                  </button>
                  <button className="btn-o" onClick={() => relancer(selected)}>
                    📤 Relancer WhatsApp
                  </button>
                </>
              )}
              <button
                className="btn-r"
                onClick={() => {
                  setFactures((p) =>
                    (p || []).filter((f) => f.id !== selected.id),
                  );
                  setSelected(null);
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaiement && (
        <Modal
          title="💳 Enregistrer un paiement"
          onClose={() => setShowPaiement(null)}
          width={420}
        >
          <div style={{ fontSize: 12, color: "#4a6a4d", marginBottom: 14 }}>
            {showPaiement.numero} · Restant :{" "}
            {fmt(
              showPaiement.montantTTC -
                (showPaiement.paiements || []).reduce(
                  (s, p) => s + p.montant,
                  0,
                ),
            )}
          </div>
          <div className="fg">
            <label className="lbl">Montant (FCFA) *</label>
            <input
              type="number"
              className="field"
              value={pForm.montant}
              onChange={(e) =>
                setPForm((f) => ({ ...f, montant: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Mode de paiement</label>
            <select
              className="field"
              value={pForm.mode}
              onChange={(e) =>
                setPForm((f) => ({ ...f, mode: e.target.value }))
              }
            >
              {[
                "Virement bancaire",
                "Chèque",
                "Espèces",
                "Mobile Money",
                "Orange Money",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Référence</label>
            <input
              className="field"
              placeholder="N° virement, chèque..."
              value={pForm.ref}
              onChange={(e) => setPForm((f) => ({ ...f, ref: e.target.value }))}
            />
          </div>
          <div className="fg">
            <label className="lbl">Date</label>
            <input
              className="field"
              value={pForm.date}
              onChange={(e) =>
                setPForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={ajouterPaiement}
              disabled={!pForm.montant}
            >
              Enregistrer
            </button>
            <button className="btn-b" onClick={() => setShowPaiement(null)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal
          title="Nouvelle facture"
          onClose={() => setShowAdd(false)}
          width={440}
        >
          <div className="fg">
            <label className="lbl">Client *</label>
            <select
              className="field"
              value={form.clientId}
              onChange={(e) => {
                const c = (clients || []).find(
                  (x) => x.id === parseInt(e.target.value),
                );
                setForm((f) => ({
                  ...f,
                  clientId: parseInt(e.target.value),
                  clientNom: c?.nom || "",
                }));
              }}
            >
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Objet *</label>
            <input
              className="field"
              value={form.objet}
              onChange={(e) =>
                setForm((f) => ({ ...f, objet: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg">
              <label className="lbl">Montant HT (FCFA) *</label>
              <input
                type="number"
                className="field"
                value={form.montantHT}
                onChange={(e) =>
                  setForm((f) => ({ ...f, montantHT: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">TVA (%)</label>
              <input
                type="number"
                className="field"
                value={form.tva}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tva: parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
          <div className="fg">
            <label className="lbl">Date d'échéance</label>
            <input
              className="field"
              placeholder="JJ/MM/AAAA"
              value={form.dateEcheance}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateEcheance: e.target.value }))
              }
            />
          </div>
          {form.montantHT && (
            <div
              style={{
                padding: "10px 14px",
                background: "#0a1a0d",
                borderRadius: 10,
                marginBottom: 14,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#4a6a4d", fontSize: 13 }}>Total TTC</span>
              <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 15 }}>
                {fmt(parseInt(form.montantHT || 0) * (1 + form.tva / 100))}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!form.objet || !form.montantHT) return;
                const ht = parseInt(form.montantHT);
                const ttc = Math.round(ht * (1 + form.tva / 100));
                const num = `FAC-2025-${String((factures || []).length + 1).padStart(3, "0")}`;
                setFactures((p) => [
                  ...(p || []),
                  {
                    ...form,
                    id: Date.now(),
                    numero: num,
                    montantHT: ht,
                    montantTTC: ttc,
                    statut: "En attente",
                    dateEmission: todayStr(),
                    datePaiement: null,
                    paiements: [],
                    devisId: null,
                    chantierId: null,
                  },
                ]);
                setForm({
                  clientId: (clients || [])[0]?.id || 1,
                  clientNom: (clients || [])[0]?.nom || "",
                  objet: "",
                  montantHT: "",
                  tva: 18,
                  dateEcheance: "",
                });
                setShowAdd(false);
              }}
              disabled={!form.objet || !form.montantHT}
            >
              Créer
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CONTRATS ─────────────────────────────────────────────────
function AdminContrats({ contrats, setContrats, clients }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    clientId: (clients || [])[0]?.id || 1,
    clientNom: (clients || [])[0]?.nom || "",
    type: "Contrat cadre",
    objet: "",
    valeur: "",
    dateDebut: "",
    dateFin: "",
    renouvellement: "Manuel",
    periodicite: "Annuel",
    notes: "",
  });

  return (
    <div>
      <SectionTitle
        title="Contrats & Abonnements"
        sub={`${(contrats || []).length} contrats`}
        action={
          <button className="btn-a" onClick={() => setShowAdd(true)}>
            + Nouveau contrat
          </button>
        }
      />
      <KpiGrid
        items={[
          {
            label: "Actifs",
            value: (contrats || []).filter((c) => c.statut === "Actif").length,
            color: "#4ade80",
          },
          {
            label: "Valeur totale",
            value:
              (
                (contrats || []).reduce((s, c) => s + c.valeur, 0) / 1000000
              ).toFixed(1) + "M FCFA",
            color: "#60a5fa",
          },
          {
            label: "Expirent bientôt",
            value: (contrats || []).filter((c) => {
              const j = joursRestants(c.dateFin);
              return j !== null && j <= 30 && j >= 0;
            }).length,
            color: "#fb923c",
          },
          {
            label: "Renouvellement auto",
            value: (contrats || []).filter(
              (c) => c.renouvellement === "Automatique",
            ).length,
            color: "#c084fc",
          },
        ]}
      />
      {(contrats || []).map((c) => {
        const j = joursRestants(c.dateFin);
        return (
          <div key={c.id} className="row">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: "#d4e8d6" }}
                  >
                    {c.numero} · {c.clientNom}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background: c.statut === "Actif" ? "#1a3a2a" : "#3a1a1a",
                      color: c.statut === "Actif" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {c.statut}
                  </span>
                  {j !== null && j <= 30 && j >= 0 && (
                    <span style={{ fontSize: 11, color: "#fb923c" }}>
                      ⚠️ Expire dans {j}j
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                  {c.type} · {c.objet}
                </div>
                <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 2 }}>
                  {c.dateDebut} → {c.dateFin} · {c.renouvellement} ·{" "}
                  {c.periodicite}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}
                >
                  {(c.valeur / 1000000).toFixed(1)}M FCFA
                </div>
                <button
                  className="btn-r"
                  style={{ fontSize: 11, marginTop: 6 }}
                  onClick={() =>
                    setContrats((p) => (p || []).filter((x) => x.id !== c.id))
                  }
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {showAdd && (
        <Modal title="Nouveau contrat" onClose={() => setShowAdd(false)}>
          <div className="fg">
            <label className="lbl">Client *</label>
            <select
              className="field"
              value={form.clientId}
              onChange={(e) => {
                const c = (clients || []).find(
                  (x) => x.id === parseInt(e.target.value),
                );
                setForm((f) => ({
                  ...f,
                  clientId: parseInt(e.target.value),
                  clientNom: c?.nom || "",
                }));
              }}
            >
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Objet *</label>
            <input
              className="field"
              value={form.objet}
              onChange={(e) =>
                setForm((f) => ({ ...f, objet: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg">
              <label className="lbl">Type</label>
              <select
                className="field"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {[
                  "Contrat cadre",
                  "Contrat de prestation",
                  "Maintenance",
                  "Abonnement",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Valeur (FCFA) *</label>
              <input
                type="number"
                className="field"
                value={form.valeur}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valeur: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Date début</label>
              <input
                className="field"
                placeholder="JJ/MM/AAAA"
                value={form.dateDebut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateDebut: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Date fin</label>
              <input
                className="field"
                placeholder="JJ/MM/AAAA"
                value={form.dateFin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateFin: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Renouvellement</label>
              <select
                className="field"
                value={form.renouvellement}
                onChange={(e) =>
                  setForm((f) => ({ ...f, renouvellement: e.target.value }))
                }
              >
                <option>Automatique</option>
                <option>Manuel</option>
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Périodicité</label>
              <select
                className="field"
                value={form.periodicite}
                onChange={(e) =>
                  setForm((f) => ({ ...f, periodicite: e.target.value }))
                }
              >
                {["Annuel", "Mensuel", "Trimestriel", "Ponctuel"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="fg">
            <label className="lbl">Notes</label>
            <textarea
              className="field"
              style={{ minHeight: 60 }}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={() => {
                if (!form.objet || !form.valeur) return;
                const num = `CTR-2025-${String((contrats || []).length + 1).padStart(3, "0")}`;
                setContrats((p) => [
                  ...(p || []),
                  {
                    ...form,
                    id: Date.now(),
                    numero: num,
                    valeur: parseInt(form.valeur) || 0,
                    statut: "Actif",
                  },
                ]);
                setForm({
                  clientId: (clients || [])[0]?.id || 1,
                  clientNom: (clients || [])[0]?.nom || "",
                  type: "Contrat cadre",
                  objet: "",
                  valeur: "",
                  dateDebut: "",
                  dateFin: "",
                  renouvellement: "Manuel",
                  periodicite: "Annuel",
                  notes: "",
                });
                setShowAdd(false);
              }}
              disabled={!form.objet || !form.valeur}
            >
              Créer
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
// ─── STOCKS ADMIN ─────────────────────────────────────────────
function AdminStocks({
  equipements,
  setEquipements,
  attributions,
  setAttributions,
  chantiers,
  equipes,
}) {
  const [stockTab, setStockTab] = useState("inventaire");
  const [showAddEq, setShowAddEq] = useState(false);
  const [showAttribuer, setShowAttribuer] = useState(false);
  const [showRestituer, setShowRestituer] = useState(null);
  const [eqForm, setEqForm] = useState({
    reference: "",
    nom: "",
    categorie: "Mesure",
    marque: "",
    modele: "",
    quantiteTotal: 1,
    quantiteDisponible: 1,
    etat: "Bon",
    valeur: "",
    notes: "",
  });
  const [attrForm, setAttrForm] = useState({
    equipementId: (equipements || [])[0]?.id || 1,
    quantite: 1,
    technicien: (equipes || [])[0]?.nom || "",
    chantierId: (chantiers || [])[0]?.id || 1,
    dateRetourPrevue: "",
    notes: "",
  });
  const [restForm, setRestForm] = useState({ etatRetour: "Bon", notes: "" });

  const CATS = [
    "Mesure",
    "Câblage",
    "Antenne",
    "Energie",
    "Sécurité",
    "Consommable",
    "Infrastructure",
    "Outillage",
    "Autre",
  ];
  const alertes = (equipements || []).filter(
    (e) =>
      e.quantiteDisponible === 0 ||
      (e.categorie === "Consommable" && e.quantiteDisponible < 30),
  );
  const actives = (attributions || []).filter((a) => !a.dateRetour);
  const valeurTotale = (equipements || []).reduce(
    (s, e) => s + e.valeur * e.quantiteTotal,
    0,
  );
  const catIcon = (c) =>
    ({
      Mesure: "📡",
      Câblage: "🔌",
      Antenne: "📶",
      Energie: "⚡",
      Sécurité: "🦺",
      Consommable: "📦",
      Infrastructure: "🏗️",
    })[c] || "🔧";

  function addEq() {
    if (!eqForm.nom) return;
    setEquipements((p) => [
      ...(p || []),
      {
        ...eqForm,
        id: Date.now(),
        quantiteTotal: parseInt(eqForm.quantiteTotal) || 1,
        quantiteDisponible:
          parseInt(eqForm.quantiteDisponible || eqForm.quantiteTotal) || 1,
        valeur: parseInt(eqForm.valeur) || 0,
      },
    ]);
    setEqForm({
      reference: "",
      nom: "",
      categorie: "Mesure",
      marque: "",
      modele: "",
      quantiteTotal: 1,
      quantiteDisponible: 1,
      etat: "Bon",
      valeur: "",
      notes: "",
    });
    setShowAddEq(false);
  }

  function attribuer() {
    const eq = (equipements || []).find(
      (e) => e.id === parseInt(attrForm.equipementId),
    );
    const qte = parseInt(attrForm.quantite) || 1;
    if (!eq || eq.quantiteDisponible < qte || !attrForm.technicien) return;
    const chantier = (chantiers || []).find(
      (c) => c.id === parseInt(attrForm.chantierId),
    );
    setAttributions((p) => [
      ...(p || []),
      {
        ...attrForm,
        id: Date.now(),
        equipementId: parseInt(attrForm.equipementId),
        equipementNom: eq.nom,
        chantierId: parseInt(attrForm.chantierId),
        chantierNom: chantier?.nom || "",
        quantite: qte,
        dateAttribution: todayStr(),
        dateRetour: null,
        etatDepart: "Bon",
        etatRetour: null,
      },
    ]);
    setEquipements((p) =>
      (p || []).map((e) =>
        e.id === eq.id
          ? { ...e, quantiteDisponible: e.quantiteDisponible - qte }
          : e,
      ),
    );
    setShowAttribuer(false);
  }

  function restituer() {
    if (!showRestituer) return;
    const attr = showRestituer;
    setAttributions((p) =>
      (p || []).map((a) =>
        a.id === attr.id
          ? {
              ...a,
              dateRetour: todayStr(),
              etatRetour: restForm.etatRetour,
              notes: restForm.notes,
            }
          : a,
      ),
    );
    setEquipements((p) =>
      (p || []).map((e) =>
        e.id === attr.equipementId
          ? { ...e, quantiteDisponible: e.quantiteDisponible + attr.quantite }
          : e,
      ),
    );
    setRestForm({ etatRetour: "Bon", notes: "" });
    setShowRestituer(null);
  }

  return (
    <div>
      <SectionTitle title="Stocks & Matériels" />

      {alertes.length > 0 && (
        <div
          style={{
            background: "#2a1a1a",
            border: "1px solid #5a2a2a",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f87171",
              marginBottom: 8,
            }}
          >
            ⚠️ Alertes stock
          </div>
          {alertes.map((e) => (
            <div
              key={e.id}
              style={{ fontSize: 13, color: "#fb923c", marginBottom: 3 }}
            >
              {e.nom} · {e.quantiteDisponible} dispo
              {e.quantiteDisponible === 0 ? " · RUPTURE" : " · stock faible"}
            </div>
          ))}
        </div>
      )}

      <KpiGrid
        items={[
          {
            label: "Références",
            value: (equipements || []).length,
            color: "#4ade80",
          },
          {
            label: "Valeur stock",
            value: (valeurTotale / 1000000).toFixed(1) + "M FCFA",
            color: "#60a5fa",
          },
          { label: "En déploiement", value: actives.length, color: "#c084fc" },
          {
            label: "Alertes",
            value: alertes.length,
            color: alertes.length > 0 ? "#f87171" : "#4ade80",
          },
        ]}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div className="tab-group" style={{ margin: 0 }}>
          {[
            { id: "inventaire", label: "📦 Inventaire" },
            { id: "deployes", label: `🔧 Déployés (${actives.length})` },
            { id: "historique", label: "📋 Historique" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tg-btn ${stockTab === t.id ? "active" : ""}`}
              onClick={() => setStockTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-a" onClick={() => setShowAddEq(true)}>
            + Équipement
          </button>
          <button className="btn-b" onClick={() => setShowAttribuer(true)}>
            🔧 Attribuer
          </button>
        </div>
      </div>

      {/* INVENTAIRE */}
      {stockTab === "inventaire" &&
        (equipements || []).map((e) => {
          const taux =
            e.quantiteTotal > 0
              ? Math.round((e.quantiteDisponible / e.quantiteTotal) * 100)
              : 0;
          return (
            <div
              key={e.id}
              style={{
                background: "#0d1610",
                border: "1px solid #1e301f",
                borderRadius: 12,
                padding: "13px 18px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#1a2a3a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {catIcon(e.categorie)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {e.nom}
                    </span>
                    <span
                      className="badge"
                      style={{ background: "#1a2a3a", color: "#60a5fa" }}
                    >
                      {e.categorie}
                    </span>
                    {e.quantiteDisponible === 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#f87171",
                          fontWeight: 600,
                        }}
                      >
                        RUPTURE
                      </span>
                    )}
                    {e.categorie === "Consommable" &&
                      e.quantiteDisponible < 30 &&
                      e.quantiteDisponible > 0 && (
                        <span style={{ fontSize: 11, color: "#fbbf24" }}>
                          Stock faible
                        </span>
                      )}
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                    {e.reference} · {e.marque} {e.modele}
                  </div>
                  {e.notes && (
                    <div
                      style={{ fontSize: 11, color: "#fb923c", marginTop: 2 }}
                    >
                      ⚠️ {e.notes}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", minWidth: 110 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: e.quantiteDisponible === 0 ? "#f87171" : "#4ade80",
                    }}
                  >
                    {e.quantiteDisponible}/{e.quantiteTotal}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#3a5a3d", marginBottom: 6 }}
                  >
                    {fmt(e.valeur)}/u
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      className="btn-b"
                      style={{ fontSize: 10, padding: "3px 8px" }}
                      onClick={() => {
                        setAttrForm((f) => ({ ...f, equipementId: e.id }));
                        setShowAttribuer(true);
                      }}
                    >
                      Attribuer
                    </button>
                    <button
                      className="btn-r"
                      style={{ fontSize: 10, padding: "3px 8px" }}
                      onClick={() =>
                        setEquipements((p) =>
                          (p || []).filter((x) => x.id !== e.id),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 4,
                  background: "#1e301f",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${taux}%`,
                    background:
                      taux > 50 ? "#4ade80" : taux > 20 ? "#fbbf24" : "#f87171",
                    borderRadius: 2,
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          );
        })}

      {/* DÉPLOYÉS */}
      {stockTab === "deployes" &&
        (actives.length === 0 ? (
          <div
            style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0" }}
          >
            Aucun équipement déployé
          </div>
        ) : (
          actives.map((a) => (
            <div
              key={a.id}
              style={{
                background: "#0d1610",
                border: "1px solid #1e301f",
                borderRadius: 12,
                padding: "13px 18px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {a.equipementNom}
                    </span>
                    <span
                      className="badge"
                      style={{ background: "#2a1a3a", color: "#c084fc" }}
                    >
                      ×{a.quantite}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                    👤 {a.technicien} · 📍 {a.chantierNom}
                  </div>
                  <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>
                    Depuis {a.dateAttribution} · Retour prévu :{" "}
                    {a.dateRetourPrevue || "N/A"}
                  </div>
                </div>
                <button
                  className="btn-b"
                  onClick={() => {
                    setRestForm({ etatRetour: "Bon", notes: "" });
                    setShowRestituer(a);
                  }}
                >
                  ✅ Restituer
                </button>
              </div>
            </div>
          ))
        ))}

      {/* HISTORIQUE */}
      {stockTab === "historique" &&
        ((attributions || []).length === 0 ? (
          <div
            style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0" }}
          >
            Aucun mouvement
          </div>
        ) : (
          [...(attributions || [])].reverse().map((a) => (
            <div
              key={a.id}
              style={{
                background: "#0d1610",
                border: "1px solid #1e301f",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: a.dateRetour ? "#4ade80" : "#c084fc",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#d4e8d6",
                      marginBottom: 3,
                    }}
                  >
                    {a.equipementNom}{" "}
                    <span style={{ color: "#c084fc" }}>×{a.quantite}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6a4d" }}>
                    👤 {a.technicien} · 📍 {a.chantierNom}
                  </div>
                  <div style={{ fontSize: 11, color: "#3a5a3d", marginTop: 3 }}>
                    Sortie: {a.dateAttribution}
                    {a.dateRetour
                      ? ` · Retour: ${a.dateRetour} · État: ${a.etatRetour}`
                      : " · En cours"}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: a.dateRetour ? "#1a3a2a" : "#2a1a3a",
                    color: a.dateRetour ? "#4ade80" : "#c084fc",
                  }}
                >
                  {a.dateRetour ? "Restitué" : "Déployé"}
                </span>
              </div>
            </div>
          ))
        ))}

      {/* Modal ajout équipement */}
      {showAddEq && (
        <Modal title="Nouvel équipement" onClose={() => setShowAddEq(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Nom *</label>
              <input
                className="field"
                value={eqForm.nom}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, nom: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Référence</label>
              <input
                className="field"
                value={eqForm.reference}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, reference: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Catégorie</label>
              <select
                className="field"
                value={eqForm.categorie}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, categorie: e.target.value }))
                }
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Marque</label>
              <input
                className="field"
                value={eqForm.marque}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, marque: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Modèle</label>
              <input
                className="field"
                value={eqForm.modele}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, modele: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Quantité totale</label>
              <input
                type="number"
                min="1"
                className="field"
                value={eqForm.quantiteTotal}
                onChange={(e) =>
                  setEqForm((f) => ({
                    ...f,
                    quantiteTotal: e.target.value,
                    quantiteDisponible: e.target.value,
                  }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Valeur unitaire (FCFA)</label>
              <input
                type="number"
                className="field"
                value={eqForm.valeur}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, valeur: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">État</label>
              <select
                className="field"
                value={eqForm.etat}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, etat: e.target.value }))
                }
              >
                {["Bon", "Usagé", "En maintenance", "Hors service"].map(
                  (et) => (
                    <option key={et}>{et}</option>
                  ),
                )}
              </select>
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Notes</label>
              <textarea
                className="field"
                style={{ minHeight: 60 }}
                value={eqForm.notes}
                onChange={(e) =>
                  setEqForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={addEq}
              disabled={!eqForm.nom}
            >
              Ajouter
            </button>
            <button className="btn-b" onClick={() => setShowAddEq(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {/* Modal attribution */}
      {showAttribuer && (
        <Modal
          title="🔧 Attribuer un équipement"
          onClose={() => setShowAttribuer(false)}
          width={460}
        >
          <div className="fg">
            <label className="lbl">Équipement *</label>
            <select
              className="field"
              value={attrForm.equipementId}
              onChange={(e) =>
                setAttrForm((f) => ({
                  ...f,
                  equipementId: parseInt(e.target.value),
                }))
              }
            >
              {(equipements || [])
                .filter((e) => e.quantiteDisponible > 0)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} ({e.quantiteDisponible} dispo)
                  </option>
                ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Quantité</label>
            <input
              type="number"
              min="1"
              className="field"
              value={attrForm.quantite}
              onChange={(e) =>
                setAttrForm((f) => ({ ...f, quantite: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Technicien *</label>
            <select
              className="field"
              value={attrForm.technicien}
              onChange={(e) =>
                setAttrForm((f) => ({ ...f, technicien: e.target.value }))
              }
            >
              {(equipes || []).map((e) => (
                <option key={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Chantier *</label>
            <select
              className="field"
              value={attrForm.chantierId}
              onChange={(e) =>
                setAttrForm((f) => ({
                  ...f,
                  chantierId: parseInt(e.target.value),
                }))
              }
            >
              {(chantiers || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Date de retour prévue</label>
            <input
              className="field"
              placeholder="JJ/MM/AAAA"
              value={attrForm.dateRetourPrevue}
              onChange={(e) =>
                setAttrForm((f) => ({ ...f, dateRetourPrevue: e.target.value }))
              }
            />
          </div>
          <div className="fg">
            <label className="lbl">Notes</label>
            <input
              className="field"
              value={attrForm.notes}
              onChange={(e) =>
                setAttrForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={attribuer}
              disabled={!attrForm.technicien}
            >
              Attribuer
            </button>
            <button className="btn-b" onClick={() => setShowAttribuer(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}

      {/* Modal restitution */}
      {showRestituer && (
        <Modal
          title="✅ Restitution d'équipement"
          onClose={() => setShowRestituer(null)}
          width={420}
        >
          <div style={{ fontSize: 13, color: "#4a6a4d", marginBottom: 16 }}>
            {showRestituer.equipementNom} · ×{showRestituer.quantite} ·{" "}
            {showRestituer.technicien}
          </div>
          <div className="fg">
            <label className="lbl">État au retour</label>
            <select
              className="field"
              value={restForm.etatRetour}
              onChange={(e) =>
                setRestForm((f) => ({ ...f, etatRetour: e.target.value }))
              }
            >
              {["Bon", "Usagé", "En maintenance", "Hors service"].map((et) => (
                <option key={et}>{et}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label className="lbl">Observations</label>
            <textarea
              className="field"
              style={{ minHeight: 80 }}
              placeholder="Dommages, pièces manquantes..."
              value={restForm.notes}
              onChange={(e) =>
                setRestForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-g" style={{ flex: 1 }} onClick={restituer}>
              Confirmer restitution
            </button>
            <button className="btn-b" onClick={() => setShowRestituer(null)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DOCUMENTS ADMIN ──────────────────────────────────────────
function AdminDocuments({ documents, setDocuments, chantiers, user }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tout");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    type: "pdf",
    categorie: "Plan technique",
    chantierId: "",
    description: "",
    tags: "",
    version: "v1.0",
  });

  const CATS = [
    "Plan technique",
    "PV / Rapport",
    "Contrat",
    "Procédure",
    "Rapport",
    "Devis",
    "Facture",
    "Autre",
  ];
  const typeIcon = (t) =>
    ({ pdf: "📄", doc: "📝", xlsx: "📊", dwg: "📐" })[t] || "📎";
  const typeBg = (t) =>
    ({ pdf: "#2a1a1a", doc: "#1a2a3a", xlsx: "#1a3a2a", dwg: "#2a2a1a" })[t] ||
    "#1a2a3a";

  const filtered = (documents || []).filter((d) => {
    const matchSearch =
      !search ||
      d.nom.toLowerCase().includes(search.toLowerCase()) ||
      (d.tags || []).some((t) =>
        t.toLowerCase().includes(search.toLowerCase()),
      );
    const matchCat = filterCat === "Tout" || d.categorie === filterCat;
    return matchSearch && matchCat;
  });

  function addDoc() {
    if (!form.nom) return;
    const chantier = (chantiers || []).find(
      (c) => c.id === parseInt(form.chantierId),
    );
    setDocuments((p) => [
      ...(p || []),
      {
        ...form,
        id: Date.now(),
        chantierId: form.chantierId ? parseInt(form.chantierId) : null,
        chantierNom: chantier?.nom || null,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        uploadePar: user.nom,
        dateUpload: todayStr(),
        taille: "—",
        accesRoles: ["admin", "chef", "technicien"],
      },
    ]);
    setForm({
      nom: "",
      type: "pdf",
      categorie: "Plan technique",
      chantierId: "",
      description: "",
      tags: "",
      version: "v1.0",
    });
    setShowAdd(false);
  }

  return (
    <div>
      <SectionTitle
        title="Documents"
        sub={`${(documents || []).length} documents`}
        action={
          !selected && (
            <button className="btn-a" onClick={() => setShowAdd(true)}>
              + Ajouter
            </button>
          )
        }
      />

      {!selected && (
        <>
          <KpiGrid
            items={[
              {
                label: "Total",
                value: (documents || []).length,
                color: "#4ade80",
              },
              {
                label: "Plans techniques",
                value: (documents || []).filter(
                  (d) => d.categorie === "Plan technique",
                ).length,
                color: "#60a5fa",
              },
              {
                label: "Rapports / PV",
                value: (documents || []).filter(
                  (d) =>
                    d.categorie === "Rapport" || d.categorie === "PV / Rapport",
                ).length,
                color: "#c084fc",
              },
              {
                label: "Contrats",
                value: (documents || []).filter(
                  (d) => d.categorie === "Contrat",
                ).length,
                color: "#fb923c",
              },
            ]}
          />
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <input
              className="field"
              style={{ width: 240 }}
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="field"
              style={{ width: 180 }}
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option>Tout</option>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {!selected ? (
        filtered.length === 0 ? (
          <div
            style={{ color: "#3a5a3d", textAlign: "center", padding: "30px 0" }}
          >
            Aucun document trouvé
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="row" onClick={() => setSelected(d)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: typeBg(d.type),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {typeIcon(d.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#d4e8d6",
                      }}
                    >
                      {d.nom}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        background: "#1a2a3a",
                        color: "#60a5fa",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      {d.version}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#4a6a4d" }}>
                    {d.categorie} · {d.chantierNom || "Document général"} ·{" "}
                    {d.dateUpload}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(d.tags || []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "#1a2a3a",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "#60a5fa",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )
      ) : (
        <div>
          <Back onClick={() => setSelected(null)} />
          <div className="card">
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: typeBg(selected.type),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {typeIcon(selected.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#d4e8d6",
                    marginBottom: 6,
                  }}
                >
                  {selected.nom}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11,
                      background: "#1a2a3a",
                      color: "#60a5fa",
                      padding: "3px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {selected.version}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: "#1a3a2a",
                      color: "#4ade80",
                      padding: "3px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {selected.categorie}
                  </span>
                </div>
              </div>
            </div>
            <InfoRow
              label="Chantier"
              value={selected.chantierNom || "Document général"}
            />
            <InfoRow label="Uploadé par" value={selected.uploadePar} />
            <InfoRow label="Date" value={selected.dateUpload} />
            <InfoRow label="Taille" value={selected.taille} />
            {selected.description && (
              <InfoRow label="Description" value={selected.description} />
            )}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 12,
                marginBottom: 20,
              }}
            >
              {(selected.tags || []).map((t) => (
                <span
                  key={t}
                  style={{
                    background: "#1a2a3a",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#60a5fa",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-a">⬇️ Télécharger</button>
              <button
                className="btn-r"
                onClick={() => {
                  setDocuments((p) =>
                    (p || []).filter((d) => d.id !== selected.id),
                  );
                  setSelected(null);
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Ajouter un document" onClose={() => setShowAdd(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Nom du fichier *</label>
              <input
                className="field"
                placeholder="Ex: Plan installation BTS.pdf"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Type</label>
              <select
                className="field"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {["pdf", "doc", "xlsx", "dwg", "img", "zip"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Catégorie</label>
              <select
                className="field"
                value={form.categorie}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categorie: e.target.value }))
                }
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Version</label>
              <input
                className="field"
                value={form.version}
                onChange={(e) =>
                  setForm((f) => ({ ...f, version: e.target.value }))
                }
              />
            </div>
            <div className="fg">
              <label className="lbl">Chantier (optionnel)</label>
              <select
                className="field"
                value={form.chantierId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, chantierId: e.target.value }))
                }
              >
                <option value="">Document général</option>
                {(chantiers || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Description</label>
              <textarea
                className="field"
                style={{ minHeight: 60 }}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="fg" style={{ gridColumn: "1/-1" }}>
              <label className="lbl">Tags (séparés par virgule)</label>
              <input
                className="field"
                placeholder="Ex: plan, BTS, Orange CI"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-g"
              style={{ flex: 1 }}
              onClick={addDoc}
              disabled={!form.nom}
            >
              Ajouter
            </button>
            <button className="btn-b" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MESSAGERIE ADMIN ─────────────────────────────────────────
function AdminMessagerie({ user, conversations, setConversations, equipes }) {
  const mesConvs = conversations || [];
  return (
    <div>
      <SectionTitle
        title="Messagerie"
        sub="Communications internes et urgentes"
      />
      <MsgPanel
        user={user}
        conversations={conversations}
        setConversations={setConversations}
        equipes={equipes}
        mesConvs={mesConvs}
      />
    </div>
  );
}

// ─── AGENT IA ADMIN ───────────────────────────────────────────
function AdminIA({
  user,
  chantiers,
  clients,
  factures,
  equipements,
  totalBudget,
  totalDepense,
  totalCA,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre agent IA DIGINETS. Interrogez toutes vos données : chantiers, finances, stocks, clients, équipes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = { role: "user", content: input };
    const next = [...messages, msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es l'agent IA de DIGINETS CI, ERP de gestion de chantiers télécom en Côte d'Ivoire. Directeur : ${user.nom}.

CHANTIERS (${chantiers.length}) :
${chantiers.map((c) => `- ${c.nom} | Client: ${c.client} | Statut: ${c.statut} | Avancement: ${c.avancement}% | Budget: ${c.budget.toLocaleString()} FCFA | Dépensé: ${getDepense(c.id).toLocaleString()} FCFA | Fin: ${c.dateFin} | Blocages actifs: ${(c.blocages || []).filter((b) => !b.resolu).length}`).join("\n")}

FINANCES :
- CA encaissé : ${totalCA.toLocaleString()} FCFA
- Budget total chantiers : ${totalBudget.toLocaleString()} FCFA
- Dépensé : ${totalDepense.toLocaleString()} FCFA
- Taux consommation : ${totalBudget > 0 ? Math.round((totalDepense / totalBudget) * 100) : 0}%

CLIENTS (${(clients || []).length}) :
${(clients || []).map((c) => `- ${c.nom} | ${c.statut} | CA: ${c.chiffreAffaires.toLocaleString()} FCFA`).join("\n")}

FACTURES :
- Payées : ${(factures || []).filter((f) => f.statut === "Payée").length}
- En attente : ${(factures || []).filter((f) => f.statut === "En attente").length}
- En retard : ${(factures || []).filter((f) => f.statut === "En retard").length}

STOCKS :
- Références : ${(equipements || []).length}
- Ruptures : ${(equipements || []).filter((e) => e.quantiteDisponible === 0).length}
- Stock faible : ${(equipements || []).filter((e) => e.categorie === "Consommable" && e.quantiteDisponible < 30).length}

Réponds en français, de façon concise et professionnelle. Structure tes réponses avec des points clés.`,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: data.content?.[0]?.text || "Erreur de réponse.",
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Erreur de connexion à l'API." },
      ]);
    }
    setLoading(false);
  }

  const SUGGESTIONS = [
    "Rapport global complet",
    "Chantiers en retard",
    "Factures impayées",
    "Alertes stock",
    "Blocages actifs",
    "Analyse budget",
    "Clients à relancer",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 100px)",
      }}
    >
      <SectionTitle
        title="Agent IA"
        sub="Interrogez toutes vos données en langage naturel"
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 12,
          paddingRight: 6,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {m.role === "assistant" && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#1a3a2a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ✦
              </div>
            )}
            <div
              style={{
                maxWidth: "72%",
                padding: "11px 15px",
                borderRadius:
                  m.role === "user"
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                background: m.role === "user" ? "#1a3a2a" : "#111a13",
                border: m.role === "user" ? "none" : "1px solid #1e301f",
                fontSize: 13,
                lineHeight: 1.6,
                color: m.role === "user" ? "#d4f5d8" : "#c8deca",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1a3a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
              }}
            >
              ✦
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "11px 15px",
                background: "#111a13",
                borderRadius: "14px 14px 14px 4px",
                border: "1px solid #1e301f",
              }}
            >
              {[0, 1, 2].map((j) => (
                <span
                  key={j}
                  className="dp"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "block",
                    animationDelay: `${j * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}
      >
        {SUGGESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => setInput(q)}
            style={{
              background: "#0d1610",
              border: "1px solid #1e301f",
              borderRadius: 20,
              padding: "5px 12px",
              fontSize: 12,
              color: "#4a6a4d",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#4ade80";
              e.target.style.color = "#4ade80";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#1e301f";
              e.target.style.color = "#4a6a4d";
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Posez votre question..."
          style={{ borderRadius: 12 }}
        />
        <button
          className="btn-g"
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ padding: "0 20px", borderRadius: 12 }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
