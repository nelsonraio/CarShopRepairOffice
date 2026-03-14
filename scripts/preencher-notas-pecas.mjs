// Script para preencher o campo notas das peças com base na referência
// NOTA: Este script faz um preenchimento simples e genérico. Para resultados mais precisos, seria necessário integrar uma base de dados de aplicações de peças.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para gerar notas detalhadas com base nas referências fornecidas
function gerarNotas(referencia, nome) {
  const ref = referencia.trim().toUpperCase();
  switch (ref) {
    case 'ATE020536':
      return "Bombitos de travão. Aplicação: Renault Clio IV, Renault Captur, Dacia Sandero II, Dacia Logan.";
    case 'FMK425':
      return "Maxilas de travão. Aplicação: Fiat Punto, Opel Corsa C/D, Ford Fiesta.";
    case 'DBP1217':
      return "Pastilhas dianteiras. Aplicação: VW Golf IV, Audi A3 (8L), SEAT Leon (1M).";
    case 'P14603':
      return "Pastilhas dianteiras. Aplicação: Alfa Romeo 147, 156, Fiat diversos.";
    case '2355406':
      return "Pastilhas traseiras. Aplicação: Audi A4, VW Passat, Volvo diversos.";
    case 'PA1487':
      return "Bomba de água. Aplicação: Peugeot 208, Citroën C3, Toyota Aygo 1.0 (Grupo PSA).";
    case 'WA9770':
      return "Filtro de ar. Aplicação: Ford Focus II, Ford C-Max, Mazda 3.";
    case 'WL7506':
      return "Filtro de óleo. Aplicação: Motores 1.9 TDI e 2.0 TDI do Grupo VW (VW Golf, Audi A4, SEAT Ibiza).";
    case 'OX1237D':
      return "Filtro de óleo. Aplicação: Mercedes-Benz Diesel (Classes C, E, S).";
    case 'WF8520':
      return "Filtro de combustível (gasóleo). Aplicação: Ford 1.6 TDCi, Peugeot/Citroën 1.6 HDi.";
    case 'ZKR7A-0':
      return "Vela de ignição. Aplicação: Fiat 1.2/1.4 Fire (Fiat 500, Panda, Grande Punto).";
    case '6PK1200':
      return "Correia de acessórios. Aplicação: BMW Série 1/3, Mercedes diversos.";
    case '7PK1035':
      return "Correia de acessórios. Aplicação: Toyota Hilux, Honda Accord/CR-V.";
    case 'RE-WB-11476':
      return "Rolamento de roda. Aplicação: Renault Megane II/III, Renault Scenic.";
    case '5W30 ELF':
      return "Óleo sintético. Aplicação: Renault e Dacia com filtro de partículas (norma ELF).";
    case '702103001':
      return "Interruptor de janela. Aplicação: Mercedes Sprinter, VW Crafter.";
    case '750296':
    case '750298':
      return "Terminal de bateria universal. Aplicação: Qualquer veículo ligeiro.";
    default:
      return nome ? `${nome}. Aplicação: Informação não disponível.` : 'Aplicação: Informação não disponível.';
  }
}

async function main() {
  const pecas = await prisma.pecas.findMany();
  let count = 0;
  for (const peca of pecas) {
    const notas = gerarNotas(peca.referencia, peca.nome);
    await prisma.pecas.update({
      where: { id: peca.id },
      data: { notas }
    });
    count++;
    console.log(`Peça ${peca.nome} (${peca.referencia}) atualizada.`);
  }
  console.log(`Total de peças atualizadas: ${count}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
