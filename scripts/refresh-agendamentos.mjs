import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomFrom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function addDays(date, days){ const d = new Date(date); d.setDate(d.getDate()+days); return d; }
function pad(n){ return n.toString().padStart(2,'0'); }

async function main(){
  console.log('🔄 Refreshing agendamentos: deleting existing...');
  await prisma.agendamentos.deleteMany();

  // Ensure there are some clientes
  let clientes = await prisma.clientes.findMany({ take: 5 });
  if (clientes.length === 0){
    console.log('ℹ️  No clients found — creating sample clients');
    const names = ['João Silva','Ana Costa','Pedro Martins','Maria Joana','Marco Polo'];
    const created = [];
    for (let i=0;i<names.length;i++){
      const c = await prisma.clientes.create({ data: { nome: names[i], telefone: '90000000', ativo: true } });
      created.push(c);
    }
    clientes = created;
  }

  // Ensure there are some veiculos
  let veiculos = await prisma.veiculos.findMany({ take: 10 });
  if (veiculos.length === 0){
    console.log('ℹ️  No vehicles found — creating sample vehicles');
    const makes = ['BMW','Audi','Peugeot','Mercedes','Fiat','Ford'];
    const models = ['X5','A4','308','C-Class','500','Focus'];
    const created = [];
    for (let i=0;i<clientes.length;i++){
      const plate = `${pad(10+i)}-AB-${pad(20+i)}`;
      const v = await prisma.veiculos.create({ data: { cliente_id: clientes[i].id, marca: randomFrom(makes), modelo: randomFrom(models), matricula: plate } });
      created.push(v);
    }
    veiculos = created;
  }

  // Ensure there are some mecanicos
  let mecanicos = await prisma.mecanicos.findMany({ take: 5 });
  if (mecanicos.length === 0){
    console.log('ℹ️  No mechanics found — creating sample mechanics');
    const names = ['Rui Pereira','Carlos Lopes','Sofia Alves','Miguel Sousa'];
    const created = [];
    for (let i=0;i<names.length;i++){
      const m = await prisma.mecanicos.create({ data: { nome: names[i] } });
      created.push(m);
    }
    mecanicos = created;
  }

  // Create agendamentos for next 60 days + some monthly ones
  const today = new Date();
  const slots = [];

  // create 20 appointments in coming days
  for (let i=1;i<=20;i++){
    const date = addDays(today, i); // next days
    const hour = 9 + (i % 8); // 9..16
    const minute = (i % 2) * 30; // 0 or 30
    const horaInicio = new Date(date);
    horaInicio.setHours(hour, minute, 0, 0);

    const cliente = randomFrom(clientes);
    // pick a vehicle of that client if exists
    let vehicle = veiculos.find(v => v.cliente_id === cliente.id);
    if (!vehicle) vehicle = randomFrom(veiculos);

    slots.push({
      cliente_id: cliente.id,
      veiculo_id: Number(vehicle.id),
      mecanico_id: randomFrom(mecanicos).id,
      titulo: `Revisão - ${cliente.nome}`,
      descricao: 'Serviço programado',
      data_agendamento: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      hora_inicio: horaInicio,
      estado: 'agendado'
    });
  }

  // create a few monthly future ones (30,60,90 days)
  [30,60,90].forEach((d, idx) => {
    const date = addDays(today, d);
    const hour = 10 + idx;
    const horaInicio = new Date(date);
    horaInicio.setHours(hour, 0, 0, 0);
    const cliente = randomFrom(clientes);
    let vehicle = veiculos.find(v => v.cliente_id === cliente.id) || randomFrom(veiculos);
    slots.push({
      cliente_id: cliente.id,
      veiculo_id: Number(vehicle.id),
      mecanico_id: randomFrom(mecanicos).id,
      titulo: `Manutenção programada - ${cliente.nome}`,
      descricao: 'Manutenção periódica',
      data_agendamento: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      hora_inicio: horaInicio,
      estado: 'agendado'
    });
  });

  console.log(`🔁 Creating ${slots.length} new agendamentos...`);
  for (const s of slots){
    await prisma.agendamentos.create({ data: s });
  }

  console.log('✅ Done. New agendamentos inserted.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async ()=>{ await prisma.$disconnect(); });
