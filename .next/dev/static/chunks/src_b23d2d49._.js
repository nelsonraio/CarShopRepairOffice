(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/data/mockData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Coherent mock data for Car Repair Shop Management System
// This data is designed to be consistent across all pages and suitable for database seeding
__turbopack_context__.s([
    "getAppointmentsByClientId",
    ()=>getAppointmentsByClientId,
    "getClientById",
    ()=>getClientById,
    "getClientStats",
    ()=>getClientStats,
    "getMechanicByName",
    ()=>getMechanicByName,
    "getServiceHistoryByVehicleId",
    ()=>getServiceHistoryByVehicleId,
    "getVehicleById",
    ()=>getVehicleById,
    "getVehiclesByClientId",
    ()=>getVehiclesByClientId,
    "mockAppointments",
    ()=>mockAppointments,
    "mockClients",
    ()=>mockClients,
    "mockMechanics",
    ()=>mockMechanics,
    "mockParts",
    ()=>mockParts,
    "mockServiceHistory",
    ()=>mockServiceHistory,
    "mockVehicles",
    ()=>mockVehicles
]);
const mockClients = [
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
const mockVehicles = [
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
const mockServiceHistory = [
    {
        id: "1",
        vehicleId: "1",
        vehicle: "Peugeot 308",
        date: "15/10/2024",
        service: "Mudança Óleo + Filtros",
        description: "Substituição de óleo do motor, filtro de óleo e filtro de ar",
        value: 120.00,
        mechanic: "Carlos P.",
        partsUsed: [
            "BOS-0986452058",
            "CAS-EDGE-5W30"
        ]
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
        partsUsed: [
            "BRE-P85020"
        ]
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
        partsUsed: [
            "BOS-0986452058",
            "CAS-EDGE-5W30",
            "NGK-96588"
        ]
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
        partsUsed: [
            "BAT-12V-70AH"
        ]
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
        partsUsed: [
            "CAS-EDGE-5W30"
        ]
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
        partsUsed: [
            "ALT-12V-120A",
            "COR-V-RIBBED"
        ]
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
        partsUsed: [
            "VAL-574623"
        ]
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
        partsUsed: [
            "BOS-0986452058",
            "FIL-AIR-308",
            "FIL-FUEL-308"
        ]
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
        partsUsed: [
            "CAS-EDGE-5W30",
            "BOS-0986452058"
        ]
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
const mockParts = [
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
const mockAppointments = [
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
const mockMechanics = [
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
const getClientById = (id)=>{
    return mockClients.find((client)=>client.id === id);
};
const getVehiclesByClientId = (clientId)=>{
    return mockVehicles.filter((vehicle)=>vehicle.clientId === clientId);
};
const getVehicleById = (id)=>{
    return mockVehicles.find((vehicle)=>vehicle.id === id);
};
const getServiceHistoryByVehicleId = (vehicleId)=>{
    return mockServiceHistory.filter((service)=>service.vehicleId === vehicleId);
};
const getAppointmentsByClientId = (clientId)=>{
    return mockAppointments.filter((appointment)=>appointment.clientId === clientId);
};
const getMechanicByName = (name)=>{
    return mockMechanics.find((mechanic)=>mechanic.name === name);
};
const getClientStats = (clientId)=>{
    const client = getClientById(clientId);
    if (!client) return null;
    const services = getVehiclesByClientId(clientId).flatMap((vehicle)=>getServiceHistoryByVehicleId(vehicle.id));
    const monthlyExpenses = [
        80,
        120,
        45,
        200,
        150,
        120,
        180,
        95,
        220,
        165,
        140,
        190
    ];
    return {
        visits: client.visitas,
        totalSpent: client.totalGasto,
        monthlyExpenses
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/VehiclesTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VehiclesTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-client] (ecmascript)");
"use client";
;
;
function VehiclesTable({ vehicles, onViewHistory }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-700 border border-gray-600 rounded-none overflow-hidden shadow-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "overflow-x-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full text-sm text-left text-gray-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "text-xs text-gray-300 uppercase bg-gray-800 border-b border-gray-600",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3",
                                    children: "Matrícula"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 17,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3",
                                    children: "Marca / Modelo"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 18,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3",
                                    children: "Cliente"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 19,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3",
                                    children: "Ano"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 20,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3",
                                    children: "Última Intervenção"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 21,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    scope: "col",
                                    className: "px-6 py-3 text-center",
                                    children: "Ações"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                    lineNumber: 22,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/VehiclesTable.tsx",
                            lineNumber: 16,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/VehiclesTable.tsx",
                        lineNumber: 15,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        className: "divide-y divide-gray-600",
                        children: vehicles.map((vehicle)=>{
                            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClientById"])(vehicle.clientId);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "hover:bg-gray-600 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 font-medium text-gray-100 font-mono",
                                        children: vehicle.licensePlate
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 30,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 text-gray-200",
                                        children: `${vehicle.make} ${vehicle.model}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 31,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 text-gray-300",
                                        children: client?.nome || 'Cliente não encontrado'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 32,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 text-gray-400",
                                        children: vehicle.year
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 33,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 text-gray-300",
                                        children: vehicle.lastIntervention
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 34,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-6 py-4 text-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onViewHistory(vehicle),
                                            className: "text-brand-yellow hover:text-brand-yellow-light font-medium transition-colors flex items-center justify-center mx-auto",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-5 h-5 mr-1",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    viewBox: "0 0 24 24",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: "2",
                                                        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                                        lineNumber: 41,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/VehiclesTable.tsx",
                                                    lineNumber: 40,
                                                    columnNumber: 23
                                                }, this),
                                                "Histórico"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/VehiclesTable.tsx",
                                            lineNumber: 36,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/VehiclesTable.tsx",
                                        lineNumber: 35,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, vehicle.id, true, {
                                fileName: "[project]/src/components/VehiclesTable.tsx",
                                lineNumber: 29,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/VehiclesTable.tsx",
                        lineNumber: 25,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/VehiclesTable.tsx",
                lineNumber: 14,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/VehiclesTable.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/VehiclesTable.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = VehiclesTable;
var _c;
__turbopack_context__.k.register(_c, "VehiclesTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/NewVehicleModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewVehicleModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function NewVehicleModal({ isOpen, onClose }) {
    _s();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        licensePlate: "",
        vin: "",
        make: "",
        model: "",
        year: "",
        color: "",
        mileage: "",
        clientProfile: "normal",
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        serviceType: "",
        priority: "normal",
        description: "",
        mechanic: "",
        estimatedTime: ""
    });
    const handleInputChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log("New vehicle data:", formData);
        alert("Veículo registado com sucesso!");
        onClose();
        setFormData({
            licensePlate: "",
            vin: "",
            make: "",
            model: "",
            year: "",
            color: "",
            mileage: "",
            clientProfile: "normal",
            clientName: "",
            clientPhone: "",
            clientEmail: "",
            serviceType: "",
            priority: "normal",
            description: "",
            mechanic: "",
            estimatedTime: ""
        });
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-800 border border-gray-600 w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-start mb-6 border-b border-gray-700 pb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-bold text-gray-100",
                                    children: "Novo Veículo"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-brand-yellow font-mono mt-1",
                                    children: "Registe um novo veículo na oficina"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "text-gray-400 hover:text-white",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-6 h-6",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: "2",
                                    d: "M6 18L18 6M6 6l12 12"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 80,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/NewVehicleModal.tsx",
                                lineNumber: 79,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-b border-gray-600 pb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-lg font-semibold text-gray-100 mb-4",
                                    children: "Dados do Veículo"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "licensePlate",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Matrícula *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "licensePlate",
                                                    name: "licensePlate",
                                                    value: formData.licensePlate,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "AA-11-BB",
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 92,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 90,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "vin",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Número do Quadro (VIN)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "vin",
                                                    name: "vin",
                                                    value: formData.vin,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "1HGCM82633A123456"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 89,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "make",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Marca *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 119,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "make",
                                                    name: "make",
                                                    value: formData.make,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    required: true,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Selecionar marca"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 128,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "audi",
                                                            children: "Audi"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 129,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "bmw",
                                                            children: "BMW"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 130,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "mercedes",
                                                            children: "Mercedes-Benz"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 131,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "volkswagen",
                                                            children: "Volkswagen"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 132,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "peugeot",
                                                            children: "Peugeot"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 133,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "renault",
                                                            children: "Renault"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "ferrari",
                                                            children: "Ferrari"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 135,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "other",
                                                            children: "Outra"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 136,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 120,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 118,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "model",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Modelo *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "model",
                                                    name: "model",
                                                    value: formData.model,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "Golf",
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 139,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "year",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Ano"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    id: "year",
                                                    name: "year",
                                                    value: formData.year,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "2020",
                                                    min: "1900",
                                                    max: "2024"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 154,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 152,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "color",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Cor"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "color",
                                                    name: "color",
                                                    value: formData.color,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "Branco"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 169,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "mileage",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Quilometragem"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 182,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    id: "mileage",
                                                    name: "mileage",
                                                    value: formData.mileage,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "50000",
                                                    min: "0"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 181,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "clientProfile",
                                            className: "block text-sm font-medium text-gray-300",
                                            children: "Perfil de Cliente"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 197,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            id: "clientProfile",
                                            name: "clientProfile",
                                            value: formData.clientProfile,
                                            onChange: handleInputChange,
                                            className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "normal",
                                                    children: "Normal"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "tvde-interno",
                                                    children: "TVDE Interno"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 206,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "tvde-externo",
                                                    children: "TVDE Externo"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 207,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "outro",
                                                    children: "Outro"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 208,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 198,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 196,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-b border-gray-600 pb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-lg font-semibold text-gray-100 mb-4",
                                    children: "Dados do Cliente"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 215,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "clientName",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Nome do Cliente *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 218,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "clientName",
                                                    name: "clientName",
                                                    value: formData.clientName,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "João Silva",
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 219,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 217,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "clientPhone",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Telefone *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "tel",
                                                    id: "clientPhone",
                                                    name: "clientPhone",
                                                    value: formData.clientPhone,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "+351 912 345 678",
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 230,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "clientEmail",
                                            className: "block text-sm font-medium text-gray-300",
                                            children: "Email"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 245,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "email",
                                            id: "clientEmail",
                                            name: "clientEmail",
                                            value: formData.clientEmail,
                                            onChange: handleInputChange,
                                            className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                            placeholder: "joao.silva@email.com"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 244,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 214,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-b border-gray-600 pb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-lg font-semibold text-gray-100 mb-4",
                                    children: "Informações do Serviço"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 260,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "serviceType",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Tipo de Serviço *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "serviceType",
                                                    name: "serviceType",
                                                    value: formData.serviceType,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    required: true,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Selecionar tipo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 272,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "maintenance",
                                                            children: "Manutenção"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 273,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "repair",
                                                            children: "Reparação"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 274,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "inspection",
                                                            children: "Inspeção"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 275,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "emergency",
                                                            children: "Emergência"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 276,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "other",
                                                            children: "Outro"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 264,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 262,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "priority",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Prioridade"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 281,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "priority",
                                                    name: "priority",
                                                    value: formData.priority,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "normal",
                                                            children: "Normal"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 289,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "urgent",
                                                            children: "Urgente"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 290,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "low",
                                                            children: "Baixa"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 291,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 280,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 261,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "description",
                                            className: "block text-sm font-medium text-gray-300",
                                            children: "Descrição do Problema *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 296,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            id: "description",
                                            name: "description",
                                            rows: 4,
                                            value: formData.description,
                                            onChange: handleInputChange,
                                            className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                            placeholder: "Descreva o problema ou serviço necessário...",
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 297,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 295,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-lg font-semibold text-gray-100 mb-4",
                                    children: "Atribuição"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 312,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "mechanic",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Mecânico Responsável"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    id: "mechanic",
                                                    name: "mechanic",
                                                    value: formData.mechanic,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Selecionar mecânico"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 323,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "carlos",
                                                            children: "Carlos P."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 324,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "rui",
                                                            children: "Rui Alves"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 325,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "joaquim",
                                                            children: "Joaquim F."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 326,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "auto",
                                                            children: "Atribuição automática"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                            lineNumber: 327,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 314,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "estimatedTime",
                                                    className: "block text-sm font-medium text-gray-300",
                                                    children: "Tempo Estimado (horas)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    id: "estimatedTime",
                                                    name: "estimatedTime",
                                                    value: formData.estimatedTime,
                                                    onChange: handleInputChange,
                                                    className: "mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-none shadow-sm focus:ring-brand-yellow focus:border-brand-yellow",
                                                    placeholder: "2",
                                                    min: "0.5",
                                                    step: "0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                                            lineNumber: 330,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 313,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 311,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end space-x-4 pt-6 border-t border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-none hover:bg-gray-600",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 349,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "px-4 py-2 text-sm font-medium text-gray-900 bg-brand-yellow border border-transparent rounded-none hover:bg-brand-yellow-dark",
                                    children: "Registar Veículo"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/NewVehicleModal.tsx",
                            lineNumber: 348,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/NewVehicleModal.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/NewVehicleModal.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/NewVehicleModal.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_s(NewVehicleModal, "P7UOBOKfRjBc8Wu0Yic1unr2+Tc=");
_c = NewVehicleModal;
var _c;
__turbopack_context__.k.register(_c, "NewVehicleModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/VehicleHistoryModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VehicleHistoryModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const mockHistory = [
    {
        id: "1",
        proc: "C2045",
        date: "28/10/2024",
        description: "Revisão Geral + Mudança de Óleo",
        km: 125000,
        cost: 250.00
    },
    {
        id: "2",
        proc: "C1980",
        date: "15/05/2024",
        description: "Substituição Pastilhas Travão (Frente)",
        km: 118000,
        cost: 120.50
    },
    {
        id: "3",
        proc: "TVDE055",
        date: "10/01/2024",
        description: "Bateria Nova",
        km: 112000,
        cost: 95.00
    }
];
function VehicleHistoryModal({ isOpen, onClose, vehicle }) {
    if (!isOpen || !vehicle) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-gray-800 border border-gray-600 w-full max-w-3xl p-6 shadow-2xl relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-start mb-6 border-b border-gray-700 pb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-bold text-gray-100",
                                    children: "Histórico de Reparações"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-brand-yellow font-mono mt-1",
                                    children: [
                                        vehicle.plate,
                                        " - ",
                                        vehicle.makeModel
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            className: "text-gray-400 hover:text-white",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-6 h-6",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: "2",
                                    d: "M6 18L18 6M6 6l12 12"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "overflow-y-auto max-h-96",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full text-sm text-left text-gray-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "text-xs text-gray-500 uppercase bg-gray-900 sticky top-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3",
                                            children: "N. Proc."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                            lineNumber: 82,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3",
                                            children: "Data"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3",
                                            children: "Descrição"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                            lineNumber: 84,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3",
                                            children: "Km"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                            lineNumber: 85,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 text-right",
                                            children: "Custo"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                            lineNumber: 86,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                    lineNumber: 81,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                className: "divide-y divide-gray-700",
                                children: mockHistory.map((repair)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 font-mono text-brand-yellow",
                                                children: repair.proc
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                                lineNumber: 92,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: repair.date
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                                lineNumber: 93,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-gray-200",
                                                children: repair.description
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                                lineNumber: 94,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: repair.km.toLocaleString()
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                                lineNumber: 95,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-right font-medium text-gray-200",
                                                children: [
                                                    "€",
                                                    repair.cost.toFixed(2)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                                lineNumber: 96,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, repair.id, true, {
                                        fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                        lineNumber: 91,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end mt-6 pt-4 border-t border-gray-700",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onClose,
                        className: "px-4 py-2 bg-brand-yellow text-gray-900 font-bold hover:bg-brand-yellow-dark transition-colors rounded-none",
                        children: "Fechar"
                    }, void 0, false, {
                        fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/VehicleHistoryModal.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/VehicleHistoryModal.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/VehicleHistoryModal.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c = VehicleHistoryModal;
var _c;
__turbopack_context__.k.register(_c, "VehicleHistoryModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/veiculos/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VeiculosPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VehiclesTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/VehiclesTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NewVehicleModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/NewVehicleModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VehicleHistoryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/VehicleHistoryModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function VeiculosPage() {
    _s();
    const [vehicles, setVehicles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedVehicle, setSelectedVehicle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VeiculosPage.useEffect": ()=>{
            const fetchVehicles = {
                "VeiculosPage.useEffect.fetchVehicles": async ()=>{
                    try {
                        const response = await fetch('/api/veiculos');
                        if (!response.ok) {
                            throw new Error('Failed to fetch vehicles');
                        }
                        const data = await response.json();
                        setVehicles(data);
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'An error occurred');
                    } finally{
                        setLoading(false);
                    }
                }
            }["VeiculosPage.useEffect.fetchVehicles"];
            fetchVehicles();
        }
    }["VeiculosPage.useEffect"], []);
    const filteredVehicles = vehicles;
    const handleViewHistory = (vehicle)=>{
        const vehicleForModal = {
            id: vehicle.id,
            plate: vehicle.licensePlate,
            makeModel: `${vehicle.make} ${vehicle.model}`,
            client: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClientById"])(vehicle.clientId)?.nome || 'Cliente não encontrado',
            year: vehicle.year,
            lastIntervention: vehicle.lastIntervention
        };
        setSelectedVehicle(vehicleForModal);
        setIsHistoryModalOpen(true);
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading..."
    }, void 0, false, {
        fileName: "[project]/src/app/veiculos/page.tsx",
        lineNumber: 60,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            "Error: ",
            error
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/veiculos/page.tsx",
        lineNumber: 61,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: "Veículos"
            }, void 0, false, {
                fileName: "[project]/src/app/veiculos/page.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsNewVehicleModalOpen(true),
                children: "Novo Veículo"
            }, void 0, false, {
                fileName: "[project]/src/app/veiculos/page.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VehiclesTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                vehicles: filteredVehicles,
                onViewHistory: handleViewHistory
            }, void 0, false, {
                fileName: "[project]/src/app/veiculos/page.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$NewVehicleModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isNewVehicleModalOpen,
                onClose: ()=>setIsNewVehicleModalOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/veiculos/page.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$VehicleHistoryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isHistoryModalOpen,
                onClose: ()=>setIsHistoryModalOpen(false),
                vehicle: selectedVehicle
            }, void 0, false, {
                fileName: "[project]/src/app/veiculos/page.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/veiculos/page.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(VeiculosPage, "akPI8zoRafrGwUMhz6Eq8aUl8Go=");
_c = VeiculosPage;
var _c;
__turbopack_context__.k.register(_c, "VeiculosPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b23d2d49._.js.map