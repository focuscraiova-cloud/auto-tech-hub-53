export type ServiceCategory = 'key-programming' | 'ecu-cloning' | 'dashboard' | 'immo-off';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface Tool {
  name: string;
  required: boolean;
}

export interface Procedure {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  timeMinutes: number;
  difficulty: DifficultyLevel;
  cost: { min: number; max: number };
  tools: Tool[];
  steps: string[];
  notes?: string[];
  pinCode?: string;
  chipType?: string;
}

export interface VehicleModel {
  model: string;
  years: string;
  procedures: Procedure[];
}

export interface VehicleMake {
  make: string;
  logo?: string;
  models: VehicleModel[];
}

export const vehicleDatabase: VehicleMake[] = [
  {
    make: "BMW",
    models: [
      {
        model: "3 Series (E90)",
        years: "2005-2012",
        procedures: [
          {
            id: "bmw-e90-key-add",
            category: "key-programming",
            title: "All Keys Lost - Key Programming",
            description: "Program new key when all keys are lost using CAS3 module",
            timeMinutes: 45,
            difficulty: "hard",
            cost: { min: 150, max: 300 },
            tools: [
              { name: "VVDI2", required: true },
              { name: "EWS/CAS Cable", required: true },
              { name: "Blank Key", required: true },
            ],
            chipType: "PCF7945",
            steps: [
              "Remove CAS3 module from vehicle",
              "Connect CAS3 to VVDI2 using EWS/CAS cable",
              "Read CAS3 dump data",
              "Generate dealer key using ISN",
              "Program new key to CAS3",
              "Reinstall CAS3 module",
              "Test key functionality"
            ],
            notes: [
              "Always backup CAS3 data before programming",
              "ISN is required from DME for all keys lost",
              "Key must be programmed with correct frequency"
            ]
          },
          {
            id: "bmw-e90-ecu-clone",
            category: "ecu-cloning",
            title: "DME/DDE Clone",
            description: "Clone ECU data to replacement unit",
            timeMinutes: 60,
            difficulty: "expert",
            cost: { min: 200, max: 400 },
            tools: [
              { name: "KTAG/KESS", required: true },
              { name: "BDM Frame", required: true },
              { name: "Wiring Harness", required: false },
            ],
            steps: [
              "Read ISN from original DME",
              "Read full dump from original DME via BDM",
              "Write dump to new DME",
              "Align ISN with CAS3 module",
              "Perform EWS alignment if needed"
            ],
            notes: [
              "DME must match exact hardware version",
              "Keep original as backup"
            ]
          }
        ]
      },
      {
        model: "5 Series (F10)",
        years: "2010-2017",
        procedures: [
          {
            id: "bmw-f10-key-add",
            category: "key-programming",
            title: "Add Spare Key",
            description: "Add additional key to FEM/BDC module",
            timeMinutes: 30,
            difficulty: "medium",
            cost: { min: 100, max: 200 },
            tools: [
              { name: "VVDI2 BMW", required: true },
              { name: "OBD Cable", required: true },
              { name: "Blank Key with Chip", required: true },
            ],
            chipType: "PCF7953",
            steps: [
              "Connect VVDI2 via OBD port",
              "Read FEM/BDC module",
              "Add key slot in module",
              "Program key chip",
              "Synchronize key with vehicle"
            ]
          },
          {
            id: "bmw-f10-dash",
            category: "dashboard",
            title: "Mileage Correction",
            description: "Dashboard cluster mileage adjustment",
            timeMinutes: 25,
            difficulty: "medium",
            cost: { min: 80, max: 150 },
            tools: [
              { name: "VVDI PROG", required: true },
              { name: "Dash Cable Set", required: true },
            ],
            steps: [
              "Remove instrument cluster",
              "Connect to VVDI PROG",
              "Read cluster data",
              "Modify mileage value",
              "Write back to cluster",
              "Reinstall and verify"
            ],
            notes: [
              "Mileage stored in multiple locations",
              "Must also update FEM/BDC"
            ]
          }
        ]
      }
    ]
  },
  {
    make: "Mercedes-Benz",
    models: [
      {
        model: "C-Class (W204)",
        years: "2007-2014",
        procedures: [
          {
            id: "mb-w204-key-add",
            category: "key-programming",
            title: "All Keys Lost",
            description: "Program new key via EIS/EZS module",
            timeMinutes: 60,
            difficulty: "expert",
            cost: { min: 250, max: 450 },
            tools: [
              { name: "VVDI MB Tool", required: true },
              { name: "IR Cable", required: true },
              { name: "EIS Cable", required: true },
              { name: "BE Key", required: true },
            ],
            chipType: "NEC+ESL",
            steps: [
              "Remove EIS module from steering column",
              "Connect EIS to VVDI MB Tool",
              "Read EIS data and password",
              "Calculate key file",
              "Write key data to BE key",
              "Install key and test"
            ],
            notes: [
              "ESL may need emulator if damaged",
              "Some EIS require password calculation"
            ]
          },
          {
            id: "mb-w204-ecu-renew",
            category: "ecu-cloning",
            title: "ECU Renew/Virgin",
            description: "Reset ECU to virgin state for new vehicle",
            timeMinutes: 45,
            difficulty: "hard",
            cost: { min: 180, max: 350 },
            tools: [
              { name: "KTAG", required: true },
              { name: "Bench Cables", required: true },
            ],
            steps: [
              "Remove ECU from vehicle",
              "Open ECU case carefully",
              "Connect via boot mode",
              "Read full flash",
              "Write virgin data",
              "Perform ME/SIM alignment"
            ]
          }
        ]
      },
      {
        model: "E-Class (W212)",
        years: "2009-2016",
        procedures: [
          {
            id: "mb-w212-key",
            category: "key-programming",
            title: "Add Spare Key",
            description: "Add key via OBD with working key",
            timeMinutes: 20,
            difficulty: "easy",
            cost: { min: 80, max: 150 },
            tools: [
              { name: "VVDI MB BGA Tool", required: true },
              { name: "OBD Cable", required: true },
            ],
            steps: [
              "Insert working key",
              "Connect via OBD",
              "Add new key slot",
              "Program new key",
              "Test all functions"
            ]
          }
        ]
      }
    ]
  },
  {
    make: "Audi",
    models: [
      {
        model: "A4 (B8)",
        years: "2008-2016",
        procedures: [
          {
            id: "audi-b8-key",
            category: "key-programming",
            title: "All Keys Lost - 5th IMMO",
            description: "Program key on 5th gen immobilizer system",
            timeMinutes: 90,
            difficulty: "expert",
            cost: { min: 300, max: 500 },
            tools: [
              { name: "VVDI2", required: true },
              { name: "AVDI/FVDI", required: false },
              { name: "Key Chip MQB", required: true },
            ],
            chipType: "MQB48",
            steps: [
              "Read BCM2 component security",
              "Extract key data from BCM2",
              "Generate dealer key",
              "Program key chip",
              "Perform adaptation via OBD"
            ],
            notes: [
              "BCM2 reading may require dump",
              "Component protection must be defeated"
            ]
          },
          {
            id: "audi-b8-dash",
            category: "dashboard",
            title: "Cluster Mileage Correction",
            description: "Adjust odometer in cluster module",
            timeMinutes: 40,
            difficulty: "hard",
            cost: { min: 100, max: 200 },
            tools: [
              { name: "VVDI PROG", required: true },
              { name: "Cluster Adapter", required: true },
            ],
            steps: [
              "Remove instrument cluster",
              "Read EEPROM data",
              "Locate and modify mileage bytes",
              "Recalculate checksum",
              "Write modified data",
              "Test in vehicle"
            ]
          }
        ]
      }
    ]
  },
  {
    make: "Volkswagen",
    models: [
      {
        model: "Golf MK7",
        years: "2013-2020",
        procedures: [
          {
            id: "vw-mk7-key",
            category: "key-programming",
            title: "Add Key via OBD",
            description: "Program additional key with MQB system",
            timeMinutes: 25,
            difficulty: "medium",
            cost: { min: 100, max: 180 },
            tools: [
              { name: "VVDI2", required: true },
              { name: "OBD Cable", required: true },
              { name: "MQB Key Blade", required: true },
            ],
            chipType: "MQB48",
            steps: [
              "Connect via OBD with working key",
              "Read IMMO data from cluster",
              "Add key slot",
              "Program MQB chip",
              "Test remote and start"
            ]
          },
          {
            id: "vw-mk7-immo",
            category: "immo-off",
            title: "IMMO OFF - ECU",
            description: "Disable immobilizer in engine ECU",
            timeMinutes: 50,
            difficulty: "hard",
            cost: { min: 150, max: 280 },
            tools: [
              { name: "KTAG", required: true },
              { name: "Bench Cables", required: true },
            ],
            steps: [
              "Remove ECU from vehicle",
              "Open and locate flash chip",
              "Read original flash",
              "Modify IMMO bytes",
              "Write modified flash",
              "Reinstall and test"
            ],
            notes: [
              "Keep backup of original flash",
              "Some ECUs require boot mode"
            ]
          }
        ]
      },
      {
        model: "Passat B8",
        years: "2015-2022",
        procedures: [
          {
            id: "vw-b8-key-akl",
            category: "key-programming",
            title: "All Keys Lost",
            description: "Complete key programming from scratch",
            timeMinutes: 75,
            difficulty: "expert",
            cost: { min: 280, max: 450 },
            tools: [
              { name: "VVDI2", required: true },
              { name: "VVDI Key Tool Plus", required: false },
              { name: "MQB Key", required: true },
            ],
            steps: [
              "Read dashboard module",
              "Extract CS bytes",
              "Calculate dealer key",
              "Program key via OBD",
              "Perform all adaptation channels"
            ]
          }
        ]
      }
    ]
  },
  {
    make: "Ford",
    models: [
      {
        model: "Focus MK3",
        years: "2011-2018",
        procedures: [
          {
            id: "ford-focus-key",
            category: "key-programming",
            title: "Add Key via OBD",
            description: "Program PATS key with outcode/incode",
            timeMinutes: 15,
            difficulty: "easy",
            cost: { min: 60, max: 120 },
            tools: [
              { name: "Ford IDS/UCDS", required: true },
              { name: "OBD Cable", required: true },
            ],
            chipType: "4D63 80bit",
            steps: [
              "Connect via OBD",
              "Enter security access",
              "Program new key transponder",
              "Test key functions"
            ]
          },
          {
            id: "ford-focus-cluster",
            category: "dashboard",
            title: "Cluster Replacement",
            description: "Program new cluster to vehicle",
            timeMinutes: 35,
            difficulty: "medium",
            cost: { min: 90, max: 160 },
            tools: [
              { name: "Ford IDS", required: true },
              { name: "UCDS", required: false },
            ],
            steps: [
              "Install new cluster",
              "Connect Ford IDS",
              "Perform as-built programming",
              "Set correct mileage",
              "Calibrate gauges"
            ]
          }
        ]
      }
    ]
  },
  {
    make: "Toyota",
    models: [
      {
        model: "Camry (XV50)",
        years: "2012-2017",
        procedures: [
          {
            id: "toyota-camry-key",
            category: "key-programming",
            title: "Smart Key Programming",
            description: "Add or replace smart key fob",
            timeMinutes: 20,
            difficulty: "easy",
            cost: { min: 70, max: 140 },
            tools: [
              { name: "Toyota Techstream", required: true },
              { name: "Mini VCI Cable", required: true },
            ],
            chipType: "Toyota H",
            steps: [
              "Connect Techstream via OBD",
              "Access immobilizer menu",
              "Register new smart key",
              "Test push start and doors"
            ]
          },
          {
            id: "toyota-camry-immo",
            category: "immo-off",
            title: "IMMO Delete",
            description: "Remove immobilizer function from ECU",
            timeMinutes: 60,
            difficulty: "hard",
            cost: { min: 180, max: 300 },
            tools: [
              { name: "K-TAG", required: true },
              { name: "Toyota ECU Pinout", required: true },
            ],
            steps: [
              "Remove ECU",
              "Read via boot/bench",
              "Modify IMMO data",
              "Clear DTC memory",
              "Reinstall and verify"
            ]
          }
        ]
      }
    ]
  }
];

export const categoryLabels: Record<ServiceCategory, string> = {
  'key-programming': 'Key Programming',
  'ecu-cloning': 'ECU Cloning',
  'dashboard': 'Dashboard',
  'immo-off': 'IMMO Off'
};

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  hard: 'bg-accent/20 text-accent border-accent/30',
  expert: 'bg-destructive/20 text-destructive border-destructive/30'
};
