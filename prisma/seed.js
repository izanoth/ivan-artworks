// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
console.log('💬 Criando comentários...');
await prisma.comment.createMany({
  data: [
    {
      id: 'cmt_salompas_1',
      postId: '5',
      guestName: 'Salompas',
      text: 'Cada vez mais me pergunto se estamos mesmo no controle dessas máquinas.',
      createdAt: new Date('2025-07-08T16:15:04.000Z'),
    },
    {
      id: 'cmt_goziba_1',
      postId: '5',
      guestName: 'Goziba',
      text: 'Ou se elas só estão devolvendo a bagunça que entregamos a elas.',
      createdAt: new Date('2025-07-08T16:21:37.000Z'),
    },
    {
      id: 'cmt_neusa_1',
      postId: '5',
      guestName: 'Neusa',
      text: 'A alma, pra mim, ainda é esse detalhe que nenhuma equação explica.',
      createdAt: new Date('2025-07-08T16:33:12.000Z'),
    },
  ],
});


  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
