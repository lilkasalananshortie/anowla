import { Deck, Folder, StudyDocument } from '@/types';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'f-pharma', name: 'Pharmacology', icon: 'Pill', color: 'teal', created_at: new Date().toISOString() },
  { id: 'f-medsurg', name: 'Medical-Surgical', icon: 'Stethoscope', color: 'blue', created_at: new Date().toISOString() },
  { id: 'f-nclex', name: 'NCLEX-RN Prep', icon: 'ClipboardCheck', color: 'amber', created_at: new Date().toISOString() },
  { id: 'f-maternal', name: 'Maternal & Pediatrics', icon: 'Baby', color: 'rose', created_at: new Date().toISOString() },
];

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-pharma-1',
    title: 'Cardiac Pharmacology & High-Alert Meds',
    description: 'Antihypertensives, antiarrhythmics, Digoxin safety, and critical antidotes.',
    category: 'Pharmacology',
    folder_id: 'f-pharma',
    cards_count: 4,
    due_count: 4,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-pharma-1',
        deck_id: 'deck-pharma-1',
        card_type: 'flashcard',
        front: 'What mandatory assessment must the nurse perform prior to administering Digoxin?',
        back: 'Auscultate the apical pulse for 1 full minute; withhold the dose if heart rate is < 60 bpm in adults.',
        explanation: 'Digoxin exerts negative chronotropic effects. Administering it to a bradycardic patient can precipitate complete AV heart block.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-pharma-2',
        deck_id: 'deck-pharma-1',
        card_type: 'multiple_choice',
        front: 'Which adverse reaction to ACE inhibitors represents a life-threatening airway emergency requiring immediate drug cessation?',
        back: 'Angioedema (swelling of lips, tongue, and glottis due to bradykinin buildup)',
        distractors: [
          'Dry, hacking, non-productive cough',
          'Mild postural hypotension upon rising',
          'Transient hyperkalemia of 5.1 mEq/L'
        ],
        explanation: 'Angioedema can cause acute laryngeal edema and asphyxiation. It is an absolute contraindication to re-prescribing ACE inhibitors.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-pharma-3',
        deck_id: 'deck-pharma-1',
        card_type: 'fill_blank',
        front: 'The specific antidote for acute unfractionated heparin toxicity with severe hemorrhage is ________ sulfate.',
        back: 'protamine',
        explanation: 'Protamine sulfate is a strongly basic peptide that combines with strongly acidic heparin to form a stable, inactive salt.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-pharma-4',
        deck_id: 'deck-pharma-1',
        card_type: 'flashcard',
        front: 'Why does hypokalemia (serum potassium < 3.5 mEq/L) dangerously amplify Digoxin toxicity?',
        back: 'Potassium and digoxin compete for identical binding sites on myocardial Na+/K+ ATPase; low potassium allows excessive digoxin binding.',
        explanation: 'Even normal therapeutic digoxin levels can cause fatal arrhythmias when the patient is hypokalemic (e.g. from furosemide diuresis).',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-medsurg-1',
    title: 'Fluid, Electrolyte & Acid-Base Imbalances',
    description: 'Electrolyte shifts, ECG signs, ABG interpretation, and acute nursing interventions.',
    category: 'Medical-Surgical',
    folder_id: 'f-medsurg',
    cards_count: 3,
    due_count: 3,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-ms-1',
        deck_id: 'deck-medsurg-1',
        card_type: 'multiple_choice',
        front: 'A post-thyroidectomy patient exhibits carpopedal spasm when their blood pressure cuff is inflated for 3 minutes. What sign does this indicate?',
        back: "Trousseau's sign of latent hypocalcemia",
        distractors: [
          "Chvostek's sign of facial nerve hyperirritability",
          "Cullen's sign of retroperitoneal hemorrhage",
          "Kernig's sign of meningeal irritation"
        ],
        explanation: 'Accidental trauma to or removal of the parathyroid glands causes acute hypocalcemia (Ca2+ < 8.5 mg/dL), provoking neuromuscular tetany.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-ms-2',
        deck_id: 'deck-medsurg-1',
        card_type: 'flashcard',
        front: 'What is the earliest and most classic electrocardiogram (ECG) finding of Hyperkalemia?',
        back: 'Tall, narrow, peaked T waves across precordial leads.',
        explanation: 'Elevated extracellular potassium accelerates cardiac repolarization; severe progression leads to PR prolongation, widened QRS, and sine waves.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-ms-3',
        deck_id: 'deck-medsurg-1',
        card_type: 'fill_blank',
        front: 'In uncompensated respiratory acidosis, the arterial blood gas shows pH < 7.35 and an elevated PaCO2 exceeding ________ mmHg.',
        back: '45',
        explanation: 'Hypoventilation causes carbon dioxide retention, driving carbonic acid accumulation and dropping arterial pH below 7.35.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-nclex-1',
    title: 'NCLEX-RN Prioritization, Delegation & Safety',
    description: 'Triage decision-making, UAP/LPN scope of practice, and acute instability recognition.',
    category: 'NCLEX-RN Prep',
    folder_id: 'f-nclex',
    cards_count: 2,
    due_count: 2,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-nclex-1',
        deck_id: 'deck-nclex-1',
        card_type: 'flashcard',
        front: 'What core clinical responsibilities must NEVER be delegated by an RN to an Unlicensed Assistive Personnel (UAP)?',
        back: 'The "EAT" responsibilities: Evaluation, Assessment, and Teaching.',
        explanation: 'UAPs can perform routine tasks on stable patients (vital signs, ambulation, hygiene, intake/output), but cannot analyze clinical data or educate.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-nclex-2',
        deck_id: 'deck-nclex-1',
        card_type: 'multiple_choice',
        front: 'Which newly admitted patient should the emergency nurse prioritize and assess FIRST?',
        back: 'A 28-year-old with acute severe asthma whose wheezing has abruptly stopped, with silent breath sounds',
        distractors: [
          'A 55-year-old with chronic emphysema and an SpO2 of 89% on room air',
          'A 40-year-old with a fractured tibia reporting 8/10 pain with strong distal pulses',
          'A 70-year-old with diabetes and a fasting blood glucose of 240 mg/dL'
        ],
        explanation: 'A "silent chest" in asthma signals critical airflow obstruction, respiratory muscle exhaustion, and impending asphyxial arrest.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'deck-maternal-1',
    title: 'Obstetrics & Neonatal Nursing Emergencies',
    description: 'Fetal heart tracings, postpartum hemorrhage, APGAR scoring, and preeclampsia care.',
    category: 'Maternal & Pediatrics',
    folder_id: 'f-maternal',
    cards_count: 2,
    due_count: 2,
    created_at: new Date().toISOString(),
    cards: [
      {
        id: 'c-mat-1',
        deck_id: 'deck-maternal-1',
        card_type: 'flashcard',
        front: 'In electronic fetal monitoring, what is the clinical etiology of Variable Decelerations, and what is the first nursing action?',
        back: 'Etiology: Umbilical Cord Compression (VEAL CHOP). First action: Reposition mother to left lateral side, discontinue oxytocin, give O2.',
        explanation: 'Variable decelerations drop abruptly with no uniform relationship to contractions; lateral repositioning relieves vena cava and cord compression.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'c-mat-2',
        deck_id: 'deck-maternal-1',
        card_type: 'multiple_choice',
        front: 'What is the immediate priority nursing intervention for a postpartum patient experiencing heavy vaginal bleeding with a boggy, displaced uterus?',
        back: 'Perform vigorous fundal massage until the uterus contracts and firms up.',
        distractors: [
          'Administer IV oxytocin as an immediate bolus push',
          'Insert an indwelling urinary catheter before examining the fundus',
          'Place the patient in Trendelenburg position and notify the provider'
        ],
        explanation: 'Uterine atony is the primary cause of early postpartum hemorrhage. Immediate fundal massage stimulates uterine contraction to compress open sinusoids.',
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export const INITIAL_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-pharma-1',
    title: 'Cardiac Glycosides & Digoxin Protocol',
    file_name: 'Cardiac_Glycosides_Digoxin_Protocol.pdf',
    folder_id: 'f-pharma',
    total_pages: 3,
    pages: [
      {
        pageNumber: 1,
        text: `CLINICAL PROTOCOL: CARDIAC GLYCOSIDES & INOTROPIC THERAPY\n\n1. Overview & Mechanism of Action\nDigoxin is a cardiac glycoside derived from Digitalis purpurea. It inhibits the myocardial cell membrane Na+/K+-ATPase pump. This increases intracellular sodium, which in turn reduces calcium efflux via the Na+/Ca2+ exchanger. The resulting intracellular calcium accumulation produces a marked positive inotropic effect (increased myocardial contractility) and negative chronotropic effect (decreased heart rate through vagal stimulation).\n\n2. Indications\n• Symptomatic Heart Failure with reduced ejection fraction (HFrEF, NYHA Class II-IV)\n• Rate control in chronic Atrial Fibrillation or Atrial Flutter with rapid ventricular response.`
      },
      {
        pageNumber: 2,
        text: `HIGH-ALERT ADMINISTRATION RULES & SAFETY PARAMETERS\n\n1. Mandatory Pre-Administration Assessment\n• The nurse MUST auscultate the apical pulse for 1 full minute prior to administering every dose.\n• Withhold dose and immediately notify the provider if:\n  - Heart rate is < 60 bpm in adults\n  - Heart rate is < 70 bpm in children (1-6 years)\n  - Heart rate is < 90 bpm in infants (< 1 year)\n\n2. Therapeutic Serum Range\n• Normal therapeutic target: 0.5 to 2.0 ng/mL.\n• Serum levels > 2.0 ng/mL represent acute toxicity.\n• High-alert warning: Hypokalemia (serum K+ < 3.5 mEq/L) dramatically potentiates Digoxin toxicity, even when serum Digoxin levels are within target range.`
      },
      {
        pageNumber: 3,
        text: `SIGNS OF TOXICITY & EMERGENCY ANTIDOTE MANAGEMENT\n\n1. Clinical Presentation of Digoxin Toxicity\n• Early Gastrointestinal Signs: Anorexia (often the earliest symptom), nausea, persistent vomiting, abdominal discomfort.\n• Central Nervous System: Lethargy, confusion, headaches, visual disturbances.\n• Classic Visual Hallmarks: Xanthopsia (yellow-green halos or colored chromatopsia around lights), blurred vision, photophobia.\n• Cardiac Dysrhythmias: Sinus bradycardia, premature ventricular contractions (PVCs), bi-directional ventricular tachycardia, complete AV block.\n\n2. Emergency Neutralization\n• Specific Antidote: Digoxin Immune Fab (DigiFab).\n• DigiFab consists of antigen-binding fragments that bind free serum Digoxin molecules, forming an inactive complex excreted renally.\n• Mandatory telemetry monitoring during and after infusion.`
      }
    ],
    highlights: [
      {
        id: 'hl-1',
        pageNumber: 2,
        text: 'The nurse MUST auscultate the apical pulse for 1 full minute prior to administering every dose.',
        color: 'yellow',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-2',
        pageNumber: 2,
        text: 'Hypokalemia (serum K+ < 3.5 mEq/L) dramatically potentiates Digoxin toxicity',
        color: 'rose',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-3',
        pageNumber: 3,
        text: 'Classic Visual Hallmarks: Xanthopsia (yellow-green halos or colored chromatopsia around lights)',
        color: 'blue',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-4',
        pageNumber: 3,
        text: 'Specific Antidote: Digoxin Immune Fab (DigiFab).',
        color: 'green',
        created_at: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: 'n-1',
        pageNumber: 2,
        text: 'NCLEX Priority: Never administer without checking current serum potassium and apical pulse.',
        color: 'rose',
        created_at: new Date().toISOString()
      },
      {
        id: 'n-2',
        pageNumber: 3,
        text: 'Telemetry is mandatory during DigiFab infusion.',
        color: 'green',
        created_at: new Date().toISOString()
      }
    ],
    content: 'Full protocol text for Cardiac Glycosides & Digoxin Protocol',
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-medsurg-1',
    title: 'Acute Coronary Syndrome & STEMI Clinical Guidelines',
    file_name: 'ACS_STEMI_Clinical_Guidelines.pdf',
    folder_id: 'f-medsurg',
    total_pages: 2,
    pages: [
      {
        pageNumber: 1,
        text: `ACUTE CORONARY SYNDROME (ACS) RAPID TRIAGE & INTERVENTION\n\n1. Immediate MONA Protocol\nUpon presentation with suspected acute myocardial infarction:\n• Morphine: IV 2-4 mg for refractory chest pain (reduces preload and myocardial O2 demand).\n• Oxygen: Administer only if SpO2 < 90% (hyperoxia can cause coronary vasoconstriction).\n• Nitroglycerin: Sublingual 0.4 mg every 5 min up to 3 doses. Contraindicated if SBP < 90 mmHg or recent phosphodiesterase-5 inhibitor use.\n• Aspirin: 162-325 mg non-enteric chewable given immediately for antiplatelet aggregation.`
      },
      {
        pageNumber: 2,
        text: `DIAGNOSTIC BIOMARKERS & TIMELINES\n\n1. Cardiac Troponin I and T\n• Most specific and sensitive biomarkers for myocardial necrosis.\n• Elevates within 2 to 4 hours of onset, peaks at 12 to 24 hours, and remains elevated for up to 10 to 14 days.\n\n2. STEMI Time Thresholds\n• Door-to-ECG Time: Must obtain 12-lead ECG within 10 minutes of arrival.\n• Door-to-Balloon (PCI) Time: < 90 minutes for primary percutaneous coronary intervention.\n• Door-to-Needle (Fibrinolytics): < 30 minutes if PCI is unavailable.`
      }
    ],
    highlights: [
      {
        id: 'hl-201',
        pageNumber: 1,
        text: 'Aspirin: 162-325 mg non-enteric chewable given immediately',
        color: 'green',
        created_at: new Date().toISOString()
      },
      {
        id: 'hl-202',
        pageNumber: 2,
        text: 'Door-to-Balloon (PCI) Time: < 90 minutes for primary percutaneous coronary intervention.',
        color: 'yellow',
        created_at: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: 'n-201',
        pageNumber: 1,
        text: 'Check right ventricular infarction (V4R lead) before giving Nitroglycerin.',
        color: 'rose',
        created_at: new Date().toISOString()
      }
    ],
    content: 'ACS and STEMI clinical guidelines',
    created_at: new Date().toISOString(),
  }
];

