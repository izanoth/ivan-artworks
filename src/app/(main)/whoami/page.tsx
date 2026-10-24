import prisma from 'lib/prisma';
import Image from 'next/image';

export default async function Whoami() {
    const whoamiPage = await prisma.page.findUnique({
        where: { name: 'whoami' },
        include: {
            contents: {
                where: { deletedAt: null }, // Only fetch non-deleted content
                orderBy: { version: 'desc' },
            },
        },
    });

    const enContent = whoamiPage?.contents.find(c => c.locale === 'en');
    const ptContent = whoamiPage?.contents.find(c => c.locale === 'pt');

    return (
        <div className="flex items-center justify-center h-full flex-wrap">
            <div className="w-[600px] p-8 bg-white text-left" style={{ fontFamily: '"Courier Prime", monospace' }}>
                <Image
                    src="/images/me.png"
                    alt="Me"
                    className="float-right shadow-bottom-left rounded-md ml-4 mb-4"
                    width={144}
                    height={214}
                />
                <h2 className="text-3xl font-bold mb-4">Who am I</h2>
                <div dangerouslySetInnerHTML={{ __html: enContent?.body || '<p>Content not found.</p>' }} />

                <hr className="my-8" />

                <div dangerouslySetInnerHTML={{ __html: ptContent?.body || '<p>Conteúdo não encontrado.</p>' }} />
            </div>
        </div>
    );
}
