// Coherent mock data for Car Repair Shop Management System
// This data is designed to be consistent across all pages and suitable for database seeding

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  endereco: string;
  perfil: 'Normal' | 'TVDE Interno' | 'TVDE Externo' | 'Empresa';
  veiculos: number;
  dataRegistro: string;
  totalGasto: number;
  visitas: number;
}

export interface Vehicle {
  id: string;
  clientId: string;
  make: string;
  model: string;
  licensePlate: string;
  year: number;
  status: 'na_oficina' | 'disponivel';
  lastIntervention: string;
  mileage: number;
}

export interface ServiceHistory {
  id: string;
  vehicleId: string;
  vehicle: string;
  date: string;
  service: string;
  description: string;
  value: number;
  mechanic: string;
  partsUsed: string[];
}

export interface Part {
  id: string;
  reference: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  price: number;
  stockStatus: 'em_stock' | 'baixo_stock' | 'esgotado';
  minStock: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  vehicleId: string;
  title: string;
  date: string;
  time: string;
  mechanic: string;
  tipoServico: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
}

export interface ModalVehicle {
  id: string;
  plate: string;
  makeModel: string;
  client: string;
  year: number;
  lastIntervention: string;
}

export interface ClientStats {
  visits: number;
  totalSpent: number;
  monthlyExpenses: number[];
}

// Alias for compatibility
export type Client = Cliente;

// Clients Data
export const mockClients: Cliente[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao.silva@email.pt",
    telefone: "+351 912 345 678",
    nif: "234 567 890",
    endereco: "Rua das Flores, 123, Porto",
    perfil: "Normal",
    veiculos: 2,
    dataRegistro: "2021",
    totalGasto: 1250.50,
    visitas: 8
  },
  {
    id: "2",
    nome: "Ana Costa",
    email: "ana.costa@email.pt",
    telefone: "+351 966 555 444",
    nif: "198 765 432",
    endereco: "Avenida da Liberdade, 456, Lisboa",
    perfil: "TVDE Interno",
    veiculos: 1,
    dataRegistro: "2022",
    totalGasto: 890.75,
    visitas: 5
  },
  {
    id: "3",
    nome: "Pedro Martins",
    email: "pedro.martins@email.pt",
    telefone: "+351 927 123 456",
    nif: "145 678 901",
    endereco: "Rua do Comércio, 78, Coimbra",
    perfil: "Normal",
    veiculos: 1,
    dataRegistro: "2020",
    totalGasto: 2100.25,
    visitas: 12
  },
  {
    id: "4",
    nome: "Maria Santos",
    email: "maria.santos@email.pt",
    telefone: "+351 934 567 890",
    nif: "267 890 123",
    endereco: "Praça da República, 45, Faro",
    perfil: "Normal",
    veiculos: 1,
    dataRegistro: "2023",
    totalGasto: 450.00,
    visitas: 3
  },
  {
    id: "5",
    nome: "Carlos Ferreira",
    email: "carlos.ferreira@email.pt",
    telefone: "+351 918 234 567",
    nif: "378 901 234",
    endereco: "Avenida dos Aliados, 234, Porto",
    perfil: "Empresa",
    veiculos: 3,
    dataRegistro: "2019",
    totalGasto: 3200.80,
    visitas: 18
  },
  {
    id: "6",
    nome: "Sofia Rodrigues",
    email: "sofia.rodrigues@email.pt",
    telefone: "+351 965 678 901",
    nif: "489 012 345",
    endereco: "Rua Augusta, 67, Lisboa",
    perfil: "Normal",
    veiculos: 1,
    dataRegistro: "2022",
    totalGasto: 675.30,
    visitas: 4
  },
  {
    id: "7",
    nome: "Miguel Pereira",
    email: "miguel.pereira@email.pt",
    telefone: "+351 922 345 678",
    nif: "590 123 456",
    endereco: "Rua de Santa Catarina, 89, Porto",
    perfil: "TVDE Interno",
    veiculos: 2,
    dataRegistro: "2021",
    totalGasto: 1580.90,
    visitas: 9
  },
  {
    id: "8",
    nome: "Isabel Oliveira",
    email: "isabel.oliveira@email.pt",
    telefone: "+351 936 789 012",
    nif: "601 234 567",
    endereco: "Avenida Almirante Reis, 123, Lisboa",
    perfil: "Normal",
    veiculos: 1,
    dataRegistro: "2023",
    totalGasto: 320.50,
    visitas: 2
  }
];

// Vehicles Data
export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    clientId: "1",
    make: "Peugeot",
    model: "308",
    licensePlate: "45-GH-23",
    year: 2018,
    status: "disponivel",
    lastIntervention: "15/10/2024",
    mileage: 125000
  },
  {
    id: "2",
    clientId: "1",
    make: "Fiat",
    model: "Punto",
    licensePlate: "12-AB-34",
    year: 2010,
    status: "na_oficina",
    lastIntervention: "02/11/2024",
    mileage: 180000
  },
  {
    id: "3",
    clientId: "2",
    make: "Audi",
    model: "A4",
    licensePlate: "20-XX-45",
    year: 2019,
    status: "disponivel",
    lastIntervention: "28/10/2024",
    mileage: 95000
  },
  {
    id: "4",
    clientId: "3",
    make: "BMW",
    model: "X5",
    licensePlate: "78-AB-91",
    year: 2020,
    status: "disponivel",
    lastIntervention: "15/09/2024",
    mileage: 78000
  },
  {
    id: "5",
    clientId: "4",
    make: "Renault",
    model: "Clio",
    licensePlate: "34-CD-56",
    year: 2017,
    status: "disponivel",
    lastIntervention: "10/08/2024",
    mileage: 110000
  },
  {
    id: "6",
    clientId: "5",
    make: "Mercedes-Benz",
    model: "C-Class",
    licensePlate: "56-EF-78",
    year: 2021,
    status: "disponivel",
    lastIntervention: "05/11/2024",
    mileage: 45000
  },
  {
    id: "7",
    clientId: "5",
    make: "Volkswagen",
    model: "Golf",
    licensePlate: "89-GH-12",
    year: 2016,
    status: "na_oficina",
    lastIntervention: "20/10/2024",
    mileage: 135000
  },
  {
    id: "8",
    clientId: "5",
    make: "Opel",
    model: "Astra",
    licensePlate: "67-IJ-34",
    year: 2019,
    status: "disponivel",
    lastIntervention: "12/09/2024",
    mileage: 92000
  },
  {
    id: "9",
    clientId: "6",
    make: "Seat",
    model: "Leon",
    licensePlate: "23-KL-56",
    year: 2022,
    status: "disponivel",
    lastIntervention: "18/10/2024",
    mileage: 35000
  },
  {
    id: "10",
    clientId: "7",
    make: "Citroën",
    model: "C4",
    licensePlate: "45-MN-78",
    year: 2015,
    status: "disponivel",
    lastIntervention: "25/09/2024",
    mileage: 145000
  },
  {
    id: "11",
    clientId: "7",
    make: "Nissan",
    model: "Qashqai",
    licensePlate: "12-OP-90",
    year: 2018,
    status: "disponivel",
    lastIntervention: "08/11/2024",
    mileage: 98000
  },
  {
    id: "12",
    clientId: "8",
    make: "Toyota",
    model: "Corolla",
    licensePlate: "78-QR-12",
    year: 2023,
    status: "disponivel",
    lastIntervention: "30/10/2024",
    mileage: 15000
  }
];

// Service History Data
export const mockServiceHistory: ServiceHistory[] = [
  {
    id: "1",
    vehicleId: "1",
    vehicle: "Peugeot 308",
    date: "15/10/2024",
    service: "Mudança Óleo + Filtros",
    description: "Substituição de óleo do motor, filtro de óleo e filtro de ar",
    value: 120.00,
    mechanic: "Carlos P.",
    partsUsed: ["BOS-0986452058", "CAS-EDGE-5W30"]
  },
  {
    id: "2",
    vehicleId: "2",
    vehicle: "Fiat Punto",
    date: "02/11/2024",
    service: "Inspeção Periódica",
    description: "Revisão completa com inspeção de todos os sistemas",
    value: 85.00,
    mechanic: "Rui Alves",
    partsUsed: []
  },
  {
    id: "3",
    vehicleId: "3",
    vehicle: "Audi A4",
    date: "28/10/2024",
    service: "Substituição Pastilhas Travão",
    description: "Substituição de pastilhas de travão dianteiras",
    value: 95.00,
    mechanic: "Carlos P.",
    partsUsed: ["BRE-P85020"]
  },
  {
    id: "4",
    vehicleId: "4",
    vehicle: "BMW X5",
    date: "15/09/2024",
    service: "Revisão Geral",
    description: "Revisão completa de 60.000km",
    value: 180.00,
    mechanic: "Joaquim F.",
    partsUsed: ["BOS-0986452058", "CAS-EDGE-5W30", "NGK-96588"]
  },
  {
    id: "5",
    vehicleId: "5",
    vehicle: "Renault Clio",
    date: "10/08/2024",
    service: "Substituição Bateria",
    description: "Substituição de bateria descarregada",
    value: 120.00,
    mechanic: "Carlos P.",
    partsUsed: ["BAT-12V-70AH"]
  },
  {
    id: "6",
    vehicleId: "6",
    vehicle: "Mercedes-Benz C-Class",
    date: "05/11/2024",
    service: "Mudança Óleo",
    description: "Substituição de óleo do motor",
    value: 75.00,
    mechanic: "Rui Alves",
    partsUsed: ["CAS-EDGE-5W30"]
  },
  {
    id: "7",
    vehicleId: "7",
    vehicle: "Volkswagen Golf",
    date: "20/10/2024",
    service: "Reparação Sistema Elétrico",
    description: "Reparação de alternador e correia",
    value: 350.00,
    mechanic: "Joaquim F.",
    partsUsed: ["ALT-12V-120A", "COR-V-RIBBED"]
  },
  {
    id: "8",
    vehicleId: "8",
    vehicle: "Opel Astra",
    date: "12/09/2024",
    service: "Substituição Escovas Limpa-Vidros",
    description: "Substituição de escovas dianteiras e traseiras",
    value: 45.00,
    mechanic: "Carlos P.",
    partsUsed: ["VAL-574623"]
  },
  {
    id: "9",
    vehicleId: "9",
    vehicle: "Seat Leon",
    date: "18/10/2024",
    service: "Inspeção Pós-Compra",
    description: "Inspeção completa do veículo recém-adquirido",
    value: 65.00,
    mechanic: "Rui Alves",
    partsUsed: []
  },
  {
    id: "10",
    vehicleId: "10",
    vehicle: "Citroën C4",
    date: "25/09/2024",
    service: "Substituição Filtros",
    description: "Substituição de todos os filtros",
    value: 95.00,
    mechanic: "Carlos P.",
    partsUsed: ["BOS-0986452058", "FIL-AIR-308", "FIL-FUEL-308"]
  },
  {
    id: "11",
    vehicleId: "11",
    vehicle: "Nissan Qashqai",
    date: "08/11/2024",
    service: "Revisão 40.000km",
    description: "Revisão intermédia com substituição de óleo",
    value: 140.00,
    mechanic: "Joaquim F.",
    partsUsed: ["CAS-EDGE-5W30", "BOS-0986452058"]
  },
  {
    id: "12",
    vehicleId: "12",
    vehicle: "Toyota Corolla",
    date: "30/10/2024",
    service: "Inspeção Garantia",
    description: "Inspeção de garantia do veículo novo",
    value: 0.00,
    mechanic: "Carlos P.",
    partsUsed: []
  }
];

// Parts Data
export const mockParts: Part[] = [
  {
    id: "1",
    reference: "BOS-0986452058",
    name: "Filtro de Óleo Bosch",
    category: "filtros",
    supplier: "Bosch Portugal",
    stock: 45,
    price: 12.50,
    stockStatus: "em_stock",
    minStock: 10
  },
  {
    id: "2",
    reference: "BRE-P85020",
    name: "Pastilhas Travão Brembo (Frente)",
    category: "travoes",
    supplier: "AutoParts SA",
    stock: 4,
    price: 45.90,
    stockStatus: "baixo_stock",
    minStock: 8
  },
  {
    id: "3",
    reference: "CAS-EDGE-5W30",
    name: "Óleo Castrol Edge 5W30 (5L)",
    category: "lubrificantes",
    supplier: "LubriNorte",
    stock: 12,
    price: 55.00,
    stockStatus: "em_stock",
    minStock: 5
  },
  {
    id: "4",
    reference: "NGK-96588",
    name: "Vela de Ignição NGK Laser Iridium",
    category: "motor",
    supplier: "NGK Spark Plugs",
    stock: 0,
    price: 18.20,
    stockStatus: "esgotado",
    minStock: 6
  },
  {
    id: "5",
    reference: "VAL-574623",
    name: "Escovas Limpa-Vidros Valeo Silencio",
    category: "acessorios",
    supplier: "Valeo Service",
    stock: 20,
    price: 28.50,
    stockStatus: "em_stock",
    minStock: 4
  },
  {
    id: "6",
    reference: "BAT-12V-70AH",
    name: "Bateria Centra 12V 70Ah",
    category: "sistema-eletrico",
    supplier: "Baterias Portugal",
    stock: 8,
    price: 95.00,
    stockStatus: "em_stock",
    minStock: 3
  },
  {
    id: "7",
    reference: "ALT-12V-120A",
    name: "Alternador 12V 120A",
    category: "sistema-eletrico",
    supplier: "AutoParts SA",
    stock: 3,
    price: 280.00,
    stockStatus: "baixo_stock",
    minStock: 2
  },
  {
    id: "8",
    reference: "COR-V-RIBBED",
    name: "Correia de acessórios",
    category: "motor",
    supplier: "Dayco Portugal",
    stock: 15,
    price: 45.00,
    stockStatus: "em_stock",
    minStock: 5
  },
  {
    id: "9",
    reference: "FIL-AIR-308",
    name: "Filtro de Ar Peugeot 308",
    category: "filtros",
    supplier: "Bosch Portugal",
    stock: 22,
    price: 15.80,
    stockStatus: "em_stock",
    minStock: 6
  },
  {
    id: "10",
    reference: "FIL-FUEL-308",
    name: "Filtro de Combustível Peugeot 308",
    category: "filtros",
    supplier: "Bosch Portugal",
    stock: 18,
    price: 22.30,
    stockStatus: "em_stock",
    minStock: 4
  },
  {
    id: "11",
    reference: "AMB-123456",
    name: "Amortecedor Dianteiro (Par)",
    category: "suspensao",
    supplier: "Monroe Portugal",
    stock: 6,
    price: 180.00,
    stockStatus: "em_stock",
    minStock: 2
  },
  {
    id: "12",
    reference: "DIS-789012",
    name: "Disco de Travão Dianteiro (Par)",
    category: "travoes",
    supplier: "Brembo Portugal",
    stock: 12,
    price: 85.00,
    stockStatus: "em_stock",
    minStock: 4
  }
];

// Appointments Data
export const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientId: "1",
    vehicleId: "2",
    title: "Reparação Fiat Punto",
    date: "Hoje, 14:00",
    time: "14:00",
    mechanic: "Carlos P.",
    tipoServico: "Reparação Motor",
    status: "em_andamento",
    notes: "Cliente relatou barulho estranho no motor"
  },
  {
    id: "2",
    clientId: "5",
    vehicleId: "7",
    title: "Revisão VW Golf",
    date: "Amanhã, 10:30",
    time: "10:30",
    mechanic: "Rui Alves",
    tipoServico: "Revisão Geral",
    status: "agendado",
    notes: "Revisão de 120.000km"
  },
  {
    id: "3",
    clientId: "3",
    vehicleId: "4",
    title: "Inspeção BMW X5",
    date: "Quarta, 16:00",
    time: "16:00",
    mechanic: "Joaquim F.",
    tipoServico: "Inspeção Periódica",
    status: "agendado"
  },
  {
    id: "4",
    clientId: "6",
    vehicleId: "9",
    title: "Mudança Óleo Seat Leon",
    date: "Sexta, 09:00",
    time: "09:00",
    mechanic: "Carlos P.",
    tipoServico: "Mudança Óleo",
    status: "agendado"
  },
  {
    id: "5",
    clientId: "7",
    vehicleId: "10",
    title: "Substituição Amortecedores",
    date: "Sábado, 11:00",
    time: "11:00",
    mechanic: "Rui Alves",
    tipoServico: "Reparação Suspensão",
    status: "agendado",
    notes: "Cliente queixou-se de conforto na suspensão"
  }
];

// Mechanics Data
export const mockMechanics: Mechanic[] = [
  {
    id: "1",
    name: "Carlos P.",
    specialty: "Motor e Eletrónica",
    phone: "+351 912 345 678",
    email: "carlos@oficina.pt"
  },
  {
    id: "2",
    name: "Rui Alves",
    specialty: "Travões e Suspensão",
    phone: "+351 927 123 456",
    email: "rui@oficina.pt"
  },
  {
    id: "3",
    name: "Joaquim F.",
    specialty: "Transmissão e Direção",
    phone: "+351 934 567 890",
    email: "joaquim@oficina.pt"
  }
];

// Helper functions to get related data
export const getClientById = (id: string): Cliente | undefined => {
  return mockClients.find(client => client.id === id);
};

export const getVehiclesByClientId = (clientId: string): Vehicle[] => {
  return mockVehicles.filter(vehicle => vehicle.clientId === clientId);
};

export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find(vehicle => vehicle.id === id);
};

export const getServiceHistoryByVehicleId = (vehicleId: string): ServiceHistory[] => {
  return mockServiceHistory.filter(service => service.vehicleId === vehicleId);
};

export const getAppointmentsByClientId = (clientId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.clientId === clientId);
};

export const getMechanicByName = (name: string): Mechanic | undefined => {
  return mockMechanics.find(mechanic => mechanic.name === name);
};

export const getClientStats = (clientId: string) => {
  const client = getClientById(clientId);
  if (!client) return null;

  const services = getVehiclesByClientId(clientId)
    .flatMap(vehicle => getServiceHistoryByVehicleId(vehicle.id));

  const monthlyExpenses = [80, 120, 45, 200, 150, 120, 180, 95, 220, 165, 140, 190];

  return {
    visits: client.visitas,
    totalSpent: client.totalGasto,
    monthlyExpenses
  };
};
