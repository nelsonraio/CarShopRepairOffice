import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const veiculos = [
  {
    cliente_id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    matricula: 'AA-12-BB',
    ano: 2020,
    tipo_motor: 'Gasolina',
    tipo_combustivel: 'Gasolina',
    estado: 'disponivel'
  },
  {
    cliente_id: 2,
    marca: 'Honda',
    modelo: 'Civic',
    matricula: 'BB-34-CC',
    ano: 2019,
    tipo_motor: 'Gasolina',
    tipo_combustivel: 'Gasolina',
    estado: 'disponivel'
  },
  {
    cliente_id: 3,
    marca: 'Ford',
    modelo: 'Focus',
    matricula: 'CC-56-DD',
    ano: 2018,
    tipo_motor: 'Diesel',
    tipo_combustivel: 'Diesel',
    estado: 'disponivel'
  },
  {
    cliente_id: 4,
    marca: 'Volkswagen',
    modelo: 'Golf',
    matricula: 'DD-78-EE',
    ano: 2021,
    tipo_motor: 'Gasolina',
    tipo_combustivel: 'Gasolina',
    estado: 'disponivel'
  },
  {
    cliente_id: 5,
    marca: 'BMW',
    modelo: 'X3',
    matricula: 'EE-90-FF',
    ano: 2022,
    tipo_motor: 'Diesel',
    tipo_combustivel: 'Diesel',
    estado: 'disponivel'
  },
  {
    cliente_id: 6,
    marca: 'Mercedes-Benz',
    modelo: 'C-Class',
    matricula: 'FF-12-GG',
    ano: 2020,
    tipo_motor: 'Gasolina',
    tipo_combustivel: 'Gasolina',
    estado: 'disponivel'
  },
  {
    cliente_id: 7,
    marca: 'Audi',
    modelo: 'A4',
    matricula: 'GG-34-HH',
    ano: 2019,
    tipo_motor: 'Diesel',
    tipo_combustivel: 'Diesel',
    estado: 'disponivel'
  },
  {
    cliente_id: 8,
    marca: 'Nissan',
    modelo: 'Qashqai',
    matricula: 'HH-56-II',
    ano: 2021,
    tipo_motor: 'Gasolina',
    tipo_combustivel: 'Gasolina',
    estado: 'disponivel'
  }
];

async function main() {
  console.log('🌱 Seeding vehicles...');

  for (const veiculo of veiculos) {
    try {
      await prisma.veiculos.create({
        data: veiculo
      });
      console.log(`✅ Created vehicle: ${veiculo.marca} ${veiculo.modelo} - ${veiculo.matricula}`);
    } catch (error) {
      console.error(`❌ Error creating vehicle ${veiculo.matricula}:`, error.message);
    }
  }

  console.log('🎉 Vehicle seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding vehicles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
