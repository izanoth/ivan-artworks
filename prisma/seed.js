// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {


  console.log('💬 Criando comentários...');
    await prisma.comment.createMany({
      data: [
        {
          postId: "3",
          guestName: 'Ana Clara',
          guestEmail: 'ana@example.com',
          text: 'Gostei muito do artigo!',
        },
        {
          postId: "3",
          guestName: 'Carlos',
          text: 'Muito bom! Parabéns!',
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
