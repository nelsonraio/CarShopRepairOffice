import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const marcasModelos = [
  {
    marca: { nome: 'Audi', pais_origem: 'Alemanha' },
    modelos: [
      { nome: 'A1', tipo_veiculo: 'Hatchback' },
      { nome: 'A3', tipo_veiculo: 'Hatchback' },
      { nome: 'A4', tipo_veiculo: 'Sedan' },
      { nome: 'A5', tipo_veiculo: 'Coupe' },
      { nome: 'A6', tipo_veiculo: 'Sedan' },
      { nome: 'A7', tipo_veiculo: 'Sedan' },
      { nome: 'A8', tipo_veiculo: 'Sedan' },
      { nome: 'Q3', tipo_veiculo: 'SUV' },
      { nome: 'Q5', tipo_veiculo: 'SUV' },
      { nome: 'Q7', tipo_veiculo: 'SUV' },
      { nome: 'Q8', tipo_veiculo: 'SUV' },
      { nome: 'TT', tipo_veiculo: 'Coupe' },
      { nome: 'R8', tipo_veiculo: 'Coupe' }
    ]
  },
  {
    marca: { nome: 'BMW', pais_origem: 'Alemanha' },
    modelos: [
      { nome: '1 Series', tipo_veiculo: 'Hatchback' },
      { nome: '2 Series', tipo_veiculo: 'Coupe' },
      { nome: '3 Series', tipo_veiculo: 'Sedan' },
      { nome: '4 Series', tipo_veiculo: 'Coupe' },
      { nome: '5 Series', tipo_veiculo: 'Sedan' },
      { nome: '6 Series', tipo_veiculo: 'Coupe' },
      { nome: '7 Series', tipo_veiculo: 'Sedan' },
      { nome: '8 Series', tipo_veiculo: 'Coupe' },
      { nome: 'X1', tipo_veiculo: 'SUV' },
      { nome: 'X2', tipo_veiculo: 'SUV' },
      { nome: 'X3', tipo_veiculo: 'SUV' },
      { nome: 'X4', tipo_veiculo: 'SUV' },
      { nome: 'X5', tipo_veiculo: 'SUV' },
      { nome: 'X6', tipo_veiculo: 'SUV' },
      { nome: 'X7', tipo_veiculo: 'SUV' },
      { nome: 'Z4', tipo_veiculo: 'Roadster' },
      { nome: 'i3', tipo_veiculo: 'Hatchback' },
      { nome: 'i8', tipo_veiculo: 'Coupe' }
    ]
  },
  {
    marca: { nome: 'Mercedes-Benz', pais_origem: 'Alemanha' },
    modelos: [
      { nome: 'A-Class', tipo_veiculo: 'Hatchback' },
      { nome: 'B-Class', tipo_veiculo: 'MPV' },
      { nome: 'C-Class', tipo_veiculo: 'Sedan' },
      { nome: 'E-Class', tipo_veiculo: 'Sedan' },
      { nome: 'S-Class', tipo_veiculo: 'Sedan' },
      { nome: 'CLA', tipo_veiculo: 'Coupe' },
      { nome: 'CLS', tipo_veiculo: 'Coupe' },
      { nome: 'GLA', tipo_veiculo: 'SUV' },
      { nome: 'GLB', tipo_veiculo: 'SUV' },
      { nome: 'GLC', tipo_veiculo: 'SUV' },
      { nome: 'GLE', tipo_veiculo: 'SUV' },
      { nome: 'GLS', tipo_veiculo: 'SUV' },
      { nome: 'G-Class', tipo_veiculo: 'SUV' },
      { nome: 'SL', tipo_veiculo: 'Roadster' },
      { nome: 'SLC', tipo_veiculo: 'Roadster' }
    ]
  },
  {
    marca: { nome: 'Volkswagen', pais_origem: 'Alemanha' },
    modelos: [
      { nome: 'Polo', tipo_veiculo: 'Hatchback' },
      { nome: 'Golf', tipo_veiculo: 'Hatchback' },
      { nome: 'Jetta', tipo_veiculo: 'Sedan' },
      { nome: 'Passat', tipo_veiculo: 'Sedan' },
      { nome: 'Arteon', tipo_veiculo: 'Sedan' },
      { nome: 'Tiguan', tipo_veiculo: 'SUV' },
      { nome: 'Touareg', tipo_veiculo: 'SUV' },
      { nome: 'T-Roc', tipo_veiculo: 'SUV' },
      { nome: 'Taos', tipo_veiculo: 'SUV' },
      { nome: 'ID.3', tipo_veiculo: 'Hatchback' },
      { nome: 'ID.4', tipo_veiculo: 'SUV' },
      { nome: 'Scirocco', tipo_veiculo: 'Coupe' },
      { nome: 'Beetle', tipo_veiculo: 'Hatchback' }
    ]
  },
  {
    marca: { nome: 'Ford', pais_origem: 'Estados Unidos' },
    modelos: [
      { nome: 'Fiesta', tipo_veiculo: 'Hatchback' },
      { nome: 'Focus', tipo_veiculo: 'Hatchback' },
      { nome: 'Mondeo', tipo_veiculo: 'Sedan' },
      { nome: 'Mustang', tipo_veiculo: 'Coupe' },
      { nome: 'Explorer', tipo_veiculo: 'SUV' },
      { nome: 'Kuga', tipo_veiculo: 'SUV' },
      { nome: 'Puma', tipo_veiculo: 'SUV' },
      { nome: 'Ranger', tipo_veiculo: 'Pickup' },
      { nome: 'Transit', tipo_veiculo: 'Van' },
      { nome: 'F-150', tipo_veiculo: 'Pickup' }
    ]
  },
  {
    marca: { nome: 'Toyota', pais_origem: 'Japão' },
    modelos: [
      { nome: 'Yaris', tipo_veiculo: 'Hatchback' },
      { nome: 'Corolla', tipo_veiculo: 'Sedan' },
      { nome: 'Camry', tipo_veiculo: 'Sedan' },
      { nome: 'Prius', tipo_veiculo: 'Hatchback' },
      { nome: 'RAV4', tipo_veiculo: 'SUV' },
      { nome: 'C-HR', tipo_veiculo: 'SUV' },
      { nome: 'Highlander', tipo_veiculo: 'SUV' },
      { nome: 'Land Cruiser', tipo_veiculo: 'SUV' },
      { nome: 'Hilux', tipo_veiculo: 'Pickup' },
      { nome: 'Proace', tipo_veiculo: 'Van' },
      { nome: 'Supra', tipo_veiculo: 'Coupe' }
    ]
  },
  {
    marca: { nome: 'Honda', pais_origem: 'Japão' },
    modelos: [
      { nome: 'Jazz', tipo_veiculo: 'Hatchback' },
      { nome: 'Civic', tipo_veiculo: 'Sedan' },
      { nome: 'Accord', tipo_veiculo: 'Sedan' },
      { nome: 'HR-V', tipo_veiculo: 'SUV' },
      { nome: 'CR-V', tipo_veiculo: 'SUV' },
      { nome: 'Pilot', tipo_veiculo: 'SUV' },
      { nome: 'City', tipo_veiculo: 'Sedan' },
      { nome: 'NSX', tipo_veiculo: 'Coupe' }
    ]
  },
  {
    marca: { nome: 'Nissan', pais_origem: 'Japão' },
    modelos: [
      { nome: 'Micra', tipo_veiculo: 'Hatchback' },
      { nome: 'Pulsar', tipo_veiculo: 'Sedan' },
      { nome: 'Qashqai', tipo_veiculo: 'SUV' },
      { nome: 'X-Trail', tipo_veiculo: 'SUV' },
      { nome: 'Juke', tipo_veiculo: 'SUV' },
      { nome: 'Navara', tipo_veiculo: 'Pickup' },
      { nome: 'Leaf', tipo_veiculo: 'Hatchback' },
      { nome: '370Z', tipo_veiculo: 'Coupe' },
      { nome: 'GT-R', tipo_veiculo: 'Coupe' }
    ]
  },
  {
    marca: { nome: 'Peugeot', pais_origem: 'França' },
    modelos: [
      { nome: '108', tipo_veiculo: 'Hatchback' },
      { nome: '208', tipo_veiculo: 'Hatchback' },
      { nome: '308', tipo_veiculo: 'Hatchback' },
      { nome: '508', tipo_veiculo: 'Sedan' },
      { nome: '2008', tipo_veiculo: 'SUV' },
      { nome: '3008', tipo_veiculo: 'SUV' },
      { nome: '5008', tipo_veiculo: 'SUV' },
      { nome: 'Partner', tipo_veiculo: 'Van' },
      { nome: 'Expert', tipo_veiculo: 'Van' },
      { nome: 'Boxer', tipo_veiculo: 'Van' }
    ]
  },
  {
    marca: { nome: 'Renault', pais_origem: 'França' },
    modelos: [
      { nome: 'Twingo', tipo_veiculo: 'Hatchback' },
      { nome: 'Clio', tipo_veiculo: 'Hatchback' },
      { nome: 'Megane', tipo_veiculo: 'Hatchback' },
      { nome: 'Talisman', tipo_veiculo: 'Sedan' },
      { nome: 'Captur', tipo_veiculo: 'SUV' },
      { nome: 'Kadjar', tipo_veiculo: 'SUV' },
      { nome: 'Koleos', tipo_veiculo: 'SUV' },
      { nome: 'Master', tipo_veiculo: 'Van' },
      { nome: 'Trafic', tipo_veiculo: 'Van' },
      { nome: 'Zoe', tipo_veiculo: 'Hatchback' }
    ]
  },
  {
    marca: { nome: 'Citroën', pais_origem: 'França' },
    modelos: [
      { nome: 'C1', tipo_veiculo: 'Hatchback' },
      { nome: 'C3', tipo_veiculo: 'Hatchback' },
      { nome: 'C4', tipo_veiculo: 'Hatchback' },
      { nome: 'C5', tipo_veiculo: 'Sedan' },
      { nome: 'C3 Aircross', tipo_veiculo: 'SUV' },
      { nome: 'C5 Aircross', tipo_veiculo: 'SUV' },
      { nome: 'Berlingo', tipo_veiculo: 'MPV' },
      { nome: 'Jumpy', tipo_veiculo: 'Van' },
      { nome: 'Jumper', tipo_veiculo: 'Van' }
    ]
  },
  {
    marca: { nome: 'Fiat', pais_origem: 'Itália' },
    modelos: [
      { nome: '500', tipo_veiculo: 'Hatchback' },
      { nome: 'Panda', tipo_veiculo: 'Hatchback' },
      { nome: 'Tipo', tipo_veiculo: 'Sedan' },
      { nome: '500X', tipo_veiculo: 'SUV' },
      { nome: '500L', tipo_veiculo: 'MPV' },
      { nome: 'Ducato', tipo_veiculo: 'Van' },
      { nome: 'Fiorino', tipo_veiculo: 'Van' },
      { nome: 'Talento', tipo_veiculo: 'Van' }
    ]
  },
  {
    marca: { nome: 'Opel', pais_origem: 'Alemanha' },
    modelos: [
      { nome: 'Corsa', tipo_veiculo: 'Hatchback' },
      { nome: 'Astra', tipo_veiculo: 'Hatchback' },
      { nome: 'Insignia', tipo_veiculo: 'Sedan' },
      { nome: 'Crossland', tipo_veiculo: 'SUV' },
      { nome: 'Grandland', tipo_veiculo: 'SUV' },
      { nome: 'Mokka', tipo_veiculo: 'SUV' },
      { nome: 'Vivaro', tipo_veiculo: 'Van' },
      { nome: 'Movano', tipo_veiculo: 'Van' }
    ]
  },
  {
    marca: { nome: 'Seat', pais_origem: 'Espanha' },
    modelos: [
      { nome: 'Ibiza', tipo_veiculo: 'Hatchback' },
      { nome: 'Leon', tipo_veiculo: 'Hatchback' },
      { nome: 'Arona', tipo_veiculo: 'SUV' },
      { nome: 'Ateca', tipo_veiculo: 'SUV' },
      { nome: 'Tarraco', tipo_veiculo: 'SUV' },
      { nome: 'Alhambra', tipo_veiculo: 'MPV' }
    ]
  },
  {
    marca: { nome: 'Skoda', pais_origem: 'República Checa' },
    modelos: [
      { nome: 'Fabia', tipo_veiculo: 'Hatchback' },
      { nome: 'Scala', tipo_veiculo: 'Sedan' },
      { nome: 'Octavia', tipo_veiculo: 'Sedan' },
      { nome: 'Superb', tipo_veiculo: 'Sedan' },
      { nome: 'Kamiq', tipo_veiculo: 'SUV' },
      { nome: 'Karoq', tipo_veiculo: 'SUV' },
      { nome: 'Kodiaq', tipo_veiculo: 'SUV' },
      { nome: 'Enyaq', tipo_veiculo: 'SUV' }
    ]
  },
  {
    marca: { nome: 'Volvo', pais_origem: 'Suécia' },
    modelos: [
      { nome: 'S60', tipo_veiculo: 'Sedan' },
      { nome: 'S90', tipo_veiculo: 'Sedan' },
      { nome: 'V60', tipo_veiculo: 'Wagon' },
      { nome: 'V90', tipo_veiculo: 'Wagon' },
      { nome: 'XC40', tipo_veiculo: 'SUV' },
      { nome: 'XC60', tipo_veiculo: 'SUV' },
      { nome: 'XC90', tipo_veiculo: 'SUV' },
      { nome: 'C40', tipo_veiculo: 'SUV' }
    ]
  },
  {
    marca: { nome: 'Mazda', pais_origem: 'Japão' },
    modelos: [
      { nome: 'Mazda2', tipo_veiculo: 'Hatchback' },
      { nome: 'Mazda3', tipo_veiculo: 'Sedan' },
      { nome: 'Mazda6', tipo_veiculo: 'Sedan' },
      { nome: 'CX-3', tipo_veiculo: 'SUV' },
      { nome: 'CX-30', tipo_veiculo: 'SUV' },
      { nome: 'CX-5', tipo_veiculo: 'SUV' },
      { nome: 'CX-9', tipo_veiculo: 'SUV' },
      { nome: 'MX-5', tipo_veiculo: 'Roadster' }
    ]
  },
  {
    marca: { nome: 'Kia', pais_origem: 'Coreia do Sul' },
    modelos: [
      { nome: 'Picanto', tipo_veiculo: 'Hatchback' },
      { nome: 'Rio', tipo_veiculo: 'Hatchback' },
      { nome: 'Ceed', tipo_veiculo: 'Hatchback' },
      { nome: 'Optima', tipo_veiculo: 'Sedan' },
      { nome: 'Stinger', tipo_veiculo: 'Sedan' },
      { nome: 'Sportage', tipo_veiculo: 'SUV' },
      { nome: 'Sorento', tipo_veiculo: 'SUV' },
      { nome: 'Carnival', tipo_veiculo: 'MPV' },
      { nome: 'EV6', tipo_veiculo: 'SUV' }
    ]
  },
  {
    marca: { nome: 'Hyundai', pais_origem: 'Coreia do Sul' },
    modelos: [
      { nome: 'i10', tipo_veiculo: 'Hatchback' },
      { nome: 'i20', tipo_veiculo: 'Hatchback' },
      { nome: 'i30', tipo_veiculo: 'Hatchback' },
      { nome: 'Elantra', tipo_veiculo: 'Sedan' },
      { nome: 'Sonata', tipo_veiculo: 'Sedan' },
      { nome: 'Kona', tipo_veiculo: 'SUV' },
      { nome: 'Tucson', tipo_veiculo: 'SUV' },
      { nome: 'Santa Fe', tipo_veiculo: 'SUV' },
      { nome: 'Palisade', tipo_veiculo: 'SUV' },
      { nome: 'Ioniq 5', tipo_veiculo: 'SUV' }
    ]
  },
  {
    marca: { nome: 'Tesla', pais_origem: 'Estados Unidos' },
    modelos: [
      { nome: 'Model 3', tipo_veiculo: 'Sedan' },
      { nome: 'Model S', tipo_veiculo: 'Sedan' },
      { nome: 'Model X', tipo_veiculo: 'SUV' },
      { nome: 'Model Y', tipo_veiculo: 'SUV' },
      { nome: 'Cybertruck', tipo_veiculo: 'Pickup' }
    ]
  },
  {
    marca: { nome: 'Porsche', pais_origem: 'Alemanha' },
    modelos: [
      { nome: '718 Boxster', tipo_veiculo: 'Roadster' },
      { nome: '718 Cayman', tipo_veiculo: 'Coupe' },
      { nome: '911', tipo_veiculo: 'Coupe' },
      { nome: 'Panamera', tipo_veiculo: 'Sedan' },
      { nome: 'Macan', tipo_veiculo: 'SUV' },
      { nome: 'Cayenne', tipo_veiculo: 'SUV' },
      { nome: 'Taycan', tipo_veiculo: 'Sedan' }
    ]
  },
  {
    marca: { nome: 'Land Rover', pais_origem: 'Reino Unido' },
    modelos: [
      { nome: 'Defender', tipo_veiculo: 'SUV' },
      { nome: 'Discovery', tipo_veiculo: 'SUV' },
      { nome: 'Discovery Sport', tipo_veiculo: 'SUV' },
      { nome: 'Range Rover', tipo_veiculo: 'SUV' },
      { nome: 'Range Rover Sport', tipo_veiculo: 'SUV' },
      { nome: 'Range Rover Velar', tipo_veiculo: 'SUV' },
      { nome: 'Range Rover Evoque', tipo_veiculo: 'SUV' }
    ]
  },
  {
    marca: { nome: 'Jeep', pais_origem: 'Estados Unidos' },
    modelos: [
      { nome: 'Renegade', tipo_veiculo: 'SUV' },
      { nome: 'Compass', tipo_veiculo: 'SUV' },
      { nome: 'Cherokee', tipo_veiculo: 'SUV' },
      { nome: 'Grand Cherokee', tipo_veiculo: 'SUV' },
      { nome: 'Wrangler', tipo_veiculo: 'SUV' },
      { nome: 'Gladiator', tipo_veiculo: 'Pickup' }
    ]
  }
];

async function main() {
  console.log('🌱 Inserindo marcas e modelos na base de dados...');

  for (const item of marcasModelos) {
    try {
      // Create or update marca
      const marca = await prisma.marcas.upsert({
        where: { nome: item.marca.nome },
        update: {
          pais_origem: item.marca.pais_origem,
          ativo: true
        },
        create: {
          nome: item.marca.nome,
          pais_origem: item.marca.pais_origem,
          ativo: true
        }
      });

      console.log(`✅ Inserida/Atualizada marca: ${marca.nome}`);

      // Create modelos for this marca
      for (const modelo of item.modelos) {
        try {
          await prisma.modelos.upsert({
            where: {
              id: (await prisma.modelos.findFirst({
                where: {
                  marca_id: marca.id,
                  nome: modelo.nome
                }
              }))?.id || 0
            },
            update: {
              tipo_veiculo: modelo.tipo_veiculo,
              ativo: true
            },
            create: {
              marca_id: marca.id,
              nome: modelo.nome,
              tipo_veiculo: modelo.tipo_veiculo,
              ativo: true
            }
          });
        } catch (error) {
          console.log(`❌ Erro ao inserir modelo ${modelo.nome} da marca ${marca.nome}:`, error.message);
        }
      }

      console.log(`✅ Inseridos ${item.modelos.length} modelos para ${marca.nome}`);

    } catch (error) {
      console.log(`❌ Erro ao inserir marca ${item.marca.nome}:`, error.message);
    }
  }

  console.log('🎉 Seed de marcas e modelos concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
