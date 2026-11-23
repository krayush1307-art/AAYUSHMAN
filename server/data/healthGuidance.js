
const healthGuidance = {
  fever: {
    name: "Fever",
    hindiName: "बुखार",

    localTerms: [
      "bukhar",
      "tez bukhar",
      "jwar",
      "fever",
      "garam sharir",
      "बुखार",
      "ज्वर",
      "शरीर गर्म"
    ],

    commonSymptoms: [
      "Elevated body temperature",
      "Headache",
      "Body aches",
      "Weakness",
      "Chills or sweating"
    ],

    redFlags: [
      "Fever lasting more than 3 days",
      "Stiff neck",
      "Confusion or extreme drowsiness",
      "Difficulty breathing",
      "Severe dehydration",
      "Seizures",
      "Fever in an infant under 3 months"
    ],

    otcMedicineInformation: {
      name: "Paracetamol",
      purpose: "Commonly used to reduce fever and relieve pain.",
      precautions: [
        "Follow the product label and consult a pharmacist or doctor.",
        "Avoid taking multiple products containing paracetamol.",
        "People with liver disease should seek medical advice before use.",
        "Children require age- and weight-appropriate professional guidance."
      ]
    },

    homeCare: [
      "Drink plenty of clean water.",
      "Use ORS if there are signs of fluid loss.",
      "Rest in a comfortable, well-ventilated room.",
      "Wear light and comfortable clothing.",
      "Monitor body temperature."
    ]
  },

  stomach_pain: {
    name: "Stomach Pain",
    hindiName: "पेट दर्द",

    localTerms: [
      "pet dard",
      "gas",
      "acidity",
      "pet mein dard",
      "jalan",
      "stomach ache",
      "पेट दर्द",
      "पेट में जलन",
      "गैस"
    ],

    commonSymptoms: [
      "Abdominal discomfort",
      "Bloating",
      "Gas",
      "Acidity",
      "Mild stomach cramps"
    ],

    redFlags: [
      "Sudden or severe abdominal pain",
      "Sharp pain in the lower right abdomen",
      "Blood in vomit",
      "Black or bloody stools",
      "Hard or rigid abdomen",
      "Persistent vomiting",
      "Severe abdominal pain during pregnancy"
    ],

    otcMedicineInformation: {
      name: "Antacid products",
      purpose: "Some antacids may provide temporary relief from acidity or heartburn.",
      precautions: [
        "Not all stomach pain is caused by acidity.",
        "Consult a pharmacist before choosing an antacid.",
        "People with kidney disease or those taking other medicines should seek professional advice.",
        "Do not use antacids to delay evaluation of severe or persistent pain."
      ]
    },

    homeCare: [
      "Eat light and easily digestible food.",
      "Avoid spicy, oily and heavy meals.",
      "Drink clean water in small amounts.",
      "Avoid foods that appear to trigger discomfort.",
      "Seek medical advice if symptoms persist or worsen."
    ]
  },

  headache: {
    name: "Headache",
    hindiName: "सिरदर्द",

    localTerms: [
      "sir dard",
      "sar dard",
      "matha dard",
      "headache",
      "chakkar",
      "सिर दर्द",
      "सर दर्द",
      "माथा दर्द",
      "चक्कर"
    ],

    commonSymptoms: [
      "Pain in the head",
      "Pressure around the forehead",
      "Sensitivity to light",
      "Neck discomfort",
      "Fatigue"
    ],

    redFlags: [
      "Sudden extremely severe headache",
      "Blurred or double vision",
      "Slurred speech",
      "Weakness on one side of the body",
      "Headache after a head injury",
      "High fever with stiff neck",
      "Confusion or loss of consciousness"
    ],

    otcMedicineInformation: {
      name: "Paracetamol",
      purpose: "Commonly used for temporary relief of mild pain.",
      precautions: [
        "Follow the product label and seek pharmacist guidance.",
        "Avoid combining multiple medicines containing paracetamol.",
        "People with liver disease should consult a doctor before use.",
        "Frequent or persistent headaches need medical evaluation."
      ]
    },

    homeCare: [
      "Rest in a quiet and comfortable room.",
      "Drink sufficient clean water.",
      "Take breaks from screens.",
      "Try a cool damp cloth on the forehead.",
      "Maintain regular meals and sleep."
    ]
  },

  diarrhea: {
    name: "Diarrhea",
    hindiName: "दस्त",

    localTerms: [
      "dast",
      "loose motion",
      "patli tatti",
      "diarrhea",
      "ulti dast",
      "दस्त",
      "पतला मल",
      "लूज मोशन"
    ],

    commonSymptoms: [
      "Frequent loose stools",
      "Abdominal cramps",
      "Nausea",
      "Weakness",
      "Increased thirst"
    ],

    redFlags: [
      "Blood in stool",
      "Sunken eyes or very dry mouth",
      "Very little or no urination",
      "Inability to drink fluids",
      "Persistent vomiting",
      "High fever",
      "Severe weakness or confusion"
    ],

    otcMedicineInformation: {
      name: "ORS (Oral Rehydration Salts)",
      purpose: "Helps replace water and electrolytes lost through diarrhea.",
      precautions: [
        "Use a genuine ORS packet and follow its exact mixing instructions.",
        "Never guess the amount of water needed for a packet.",
        "Prepare fresh solution as directed on the packet.",
        "Seek medical advice for infants, young children and vulnerable patients.",
        "Do not use anti-diarrheal medicines without professional guidance, especially for children or bloody diarrhea."
      ]
    },

    homeCare: [
      "Drink ORS regularly in small sips.",
      "Continue breastfeeding for infants.",
      "Continue eating simple, nutritious food as tolerated.",
      "Wash hands with soap and clean water.",
      "Avoid unsafe drinking water and unhygienic food."
    ]
  },

  cold_cough: {
    name: "Common Cold and Cough",
    hindiName: "सर्दी और खांसी",

    localTerms: [
      "sardi",
      "khansi",
      "zukam",
      "gala kharab",
      "cold",
      "cough",
      "naak behna",
      "सर्दी",
      "खांसी",
      "जुकाम",
      "गला खराब"
    ],

    commonSymptoms: [
      "Runny or blocked nose",
      "Sneezing",
      "Mild sore throat",
      "Cough",
      "Mild body aches"
    ],

    redFlags: [
      "Difficulty breathing",
      "Fast breathing or chest indrawing in children",
      "Chest pain",
      "Coughing up blood",
      "Severe dehydration",
      "Persistent or worsening fever",
      "Confusion or extreme drowsiness"
    ],

    otcMedicineInformation: {
      name: "Saline nasal drops",
      purpose: "May help relieve nasal dryness and congestion.",
      precautions: [
        "Use products according to their labels.",
        "Ask a pharmacist before using additional cold or cough medicines.",
        "Some antihistamines can cause drowsiness.",
        "Children should not be given adult cold medicines.",
        "Antibiotics do not treat ordinary viral colds."
      ]
    },

    homeCare: [
      "Drink sufficient warm or room-temperature fluids.",
      "Gargle with warm salt water if comfortable.",
      "Get adequate rest.",
      "Use saline nasal drops for nasal congestion.",
      "Avoid smoke, dust and other respiratory irritants.",
      "Avoid direct exposure to boiling-water steam because of burn risk."
    ]
  }
};

// Export the health guidance database for use in backend routes.
export default healthGuidance;
