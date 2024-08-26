import Image from 'next/image';

export default function Whoami() {
    return (
        <div className="flex items-center justify-center h-full flex-wrap">
            <div className="w-[600px] p-8 bg-white text-left" style={{ fontFamily: '"Courier Prime", monospace' }}>
                <Image 
                    src="/images/me.png"
                    alt="Me"
                    className="float-right shadow-bottom-left rounded-md ml-4 mb-4"
                    width={144} 
                    height={214}
                    //style={{ boxShadow: '8px 8px 8px rgba(0, 0, 0, 0.3), 8px -8px 8px rgba(0, 0, 0, 0)' }}
                />
                <h2 className="text-3xl font-bold mb-4">Who am I</h2>
                <p>
                    My name is Ivan, also known as <a href="https://github.com/izanoth">@izanoth</a>, <a href="https://instagram.com/_zanoth_">@_zanoth_</a>, or <a href="https://youtube.com/@i.zanoth">@i.zanoth</a> on social media. I&apos;m from São Paulo capital, and I started creating static HTML pages in the 90&apos;s, when frameworks didn&apos;t yet exist.
                </p>
                <p>
                    Since then, I&apos;ve worked as an administrative assistant twice, among other experiences. I got involved in the contemporary alternative art scene during a period between 2000 and 2010, where I attended parties and festivals.
                </p>
                <p>
                    These artistic endeavors helped me develop some auditory sensitivity, which I sought to explore in producing some works published here.
                </p>
                <p>
                    I started studying programming and developing full-stack web systems around 2015, which now allows me to combine these two skills in this modest application, developed with Next.js, Node, React, and Tailwind.
                </p>
                
                <p>
                    I&apos;ll be satisfied if I can make someone&apos;s day a little better.
                </p>
     
                <hr className="my-8" />

                <p>
                    Me chamo Ivan, também conhecido como <a href="https://github.com/izanoth">@izanoth</a>, <a href="https://instagram.com/_zanoth_">@_zanoth_</a> ou <a href="https://youtube.com/@i.zanoth">@i.zanoth</a> nas redes sociais. Natural de São Paulo capital, comecei a criar páginas estáticas em HTML nos 90, quando ainda não haviam frameworks.
                </p>
                <p>
                    De lá pra cá, trabalhei como auxiliar administrativo em duas oportunidades, além de outras experiências. Envolvi-me na cena artística alternativa contemporânea durante um período entre 00 e 10, no qual frequentei festas e festivais.
                </p>
                <p>
                    Tais incursões artísticas fizeram-me desenvolver alguma sensibilidade auditiva, que procurei explorar na produção de alguns trabalhos aqui publicados.
                </p>
                <p>
                    Comecei a estudar programação e a desenvolver sistemas web full stack em meados de 2015, o que me possibilitou unir essas duas coisas nessa modesta aplicação, desenvolvida com Next.js, Node, React e Tailwind.
                </p>
                <p>
                    Estarei satisfeito se puder fazer do dia de alguém um pouco melhor.
                </p>                
            </div>
        </div>
    );
}
