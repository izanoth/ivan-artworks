import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Pages
  const pages = [
    { name: 'music', slug: '/music', type: 'main', order: 1 },
    { name: 'prog', slug: '/prog', type: 'main', order: 2 },
    { name: 'marketplace', slug: '/marketplace', type: 'main', order: 3 },
    { name: 'guestbook', slug: '/guestbook', type: 'secondary', order: 1 },
    { name: 'whoami', slug: '/whoami', type: 'secondary', order: 2 },
    { name: 'contact', slug: '/contact', type: 'secondary', order: 3 },
  ];

  for (const pageData of pages) {
    await prisma.page.upsert({
      where: { name: pageData.name },
      update: { type: pageData.type, order: pageData.order },
      create: {
        name: pageData.name,
        slug: pageData.slug,
        isActive: true,
        order: pageData.order,
        type: pageData.type,
      },
    });
  }

  const whoamiPage = await prisma.page.findUnique({ where: { name: 'whoami' } });
  if (whoamiPage) {
    // Whoami content (English)
    await prisma.content.upsert({
      where: {
        pageId_locale_version: {
          pageId: whoamiPage.id,
          locale: 'en',
          version: 1,
        },
      },
      update: {},
      create: {
        pageId: whoamiPage.id,
        locale: 'en',
        version: 1,
        body: `
          <p>My name is Ivan, also known as <a href="https://github.com/izanoth">@izanoth</a>, <a href="https://instagram.com/_zanoth_">@_zanoth_</a>, or <a href="https://youtube.com/@i.zanoth">@i.zanoth</a> on social media. I&apos;m from São Paulo capital, and I started creating static HTML pages in the 90&apos;s, when frameworks didn&apos;t yet exist.</p>
          <p>Since then, I&apos;ve worked as an administrative assistant twice, among other experiences. I got involved in the contemporary alternative art scene during a period between 2000 and 2010, where I attended parties and festivals.</p>
          <p>These artistic endeavors helped me develop some auditory sensitivity, which I sought to explore in producing some works published here.</p>
          <p>I started studying programming and developing full-stack web systems around 2015, which now allows me to combine these two skills in this modest application, developed with Next.js, Node, React, and Tailwind.</p>
          <p>I&apos;ll be satisfied if I can make someone&apos;s day a little better.</p>
        `,
      },
    });

    // Whoami content (Portuguese)
    await prisma.content.upsert({
      where: {
        pageId_locale_version: {
          pageId: whoamiPage.id,
          locale: 'pt',
          version: 1,
        },
      },
      update: {},
      create: {
        pageId: whoamiPage.id,
        locale: 'pt',
        version: 1,
        body: `
          <p>Me chamo Ivan, também conhecido como <a href="https://github.com/izanoth">@izanoth</a>, <a href="https://instagram.com/_zanoth_">@_zanoth_</a> ou <a href="https://youtube.com/@i.zanoth">@i.zanoth</a> nas redes sociais. Natural de São Paulo capital, comecei a criar páginas estáticas em HTML nos 90, quando ainda não haviam frameworks.</p>
          <p>De lá pra cá, trabalhei como auxiliar administrativo em duas oportunidades, além de outras experiências. Envolvi-me na cena artística alternativa contemporânea durante um período entre 00 e 10, no qual frequentei festas e festivais.</p>
          <p>Tais incursões artísticas fizeram-me desenvolver alguma sensibilidade auditiva, que procurei explorar na produção de alguns trabalhos aqui publicados.</p>
          <p>Comecei a estudar programação e a desenvolver sistemas web full stack em meados de 2015, o que me possibilitou unir essas duas coisas nessa modesta aplicação, desenvolvida com Next.js, Node, React e Tailwind.</p>
          <p>Estarei satisfeito se puder fazer do dia de alguém um pouco melhor.</p>
        `,
      },
    });
  }

  // Create or update Footer items
  await prisma.footerItem.upsert({
    where: { id: 'github-link' },
    update: {},
    create: {
      id: 'github-link',
      text: 'GitHub',
      link: 'https://github.com/izanoth',
      iconClass: 'bi bi-github',
      order: 1,
      isActive: true,
    },
  });

  await prisma.footerItem.upsert({
    where: { id: 'mastodon-link' },
    update: {},
    create: {
      id: 'mastodon-link',
      text: 'Mastodon',
      link: 'https://mas.to/@izanoth',
      iconClass: 'bi bi-mastodon',
      order: 2,
      isActive: true,
    },
  });

  // Footer page & copyright text
  const footerPage = await prisma.page.upsert({
    where: { name: 'footer' },
    update: {},
    create: {
      name: 'footer',
      slug: '/footer',
      isActive: true,
      order: 99,
      type: 'footer',
    },
  });

  await prisma.content.upsert({
    where: {
      pageId_locale_version: {
        pageId: footerPage.id,
        locale: 'pt',
        version: 1,
      },
    },
    update: {},
    create: {
      pageId: footerPage.id,
      locale: 'pt',
      version: 1,
      body: 'Zanoth \u00A9 Independent Artworks 2023-25. All Rights Reserved.',
    },
  });

  // Comments
  const post5 = await prisma.post.findUnique({ where: { id: '5' } });
  if (post5) {
    const comments = [
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
    ];
    for (const c of comments) {
      await prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: c,
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
