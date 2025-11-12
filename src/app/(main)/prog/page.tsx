// app/prog/page.js (Next 13+ com App Router)
async function getRepos() {
  const res = await fetch("https://api.github.com/users/izanoth/repos", {
    headers: { "Accept": "application/vnd.github.v3+json" },
    next: { revalidate: 3600 } // cache 1h
  });
  if (!res.ok) throw new Error("Erro ao buscar repositórios");
  return res.json();
}

async function getRepoLanguages(url) {
    const res = await fetch(url, {
        headers: { "Accept": "application/vnd.github.v3+json" },
        next: { revalidate: 3600 } // cache 1h
    });
    if (!res.ok) return []; // Don't throw, just return empty array on error
    const data = await res.json();
    return Object.keys(data);
}

export default async function Home() {
  let repos = await getRepos();

  // Sort repos by last push date
  repos.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());

  // Fetch languages for each repo
  const reposWithLanguages = await Promise.all(repos.map(async (repo) => {
      const languages = await getRepoLanguages(repo.languages_url);
      return { ...repo, languages };
  }));


  return (
    <main className="container p-8">
      <h1 className="text-2xl font-bold mb-4">Meus Projetos</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reposWithLanguages.map(repo => (
          <li key={repo.id} className="border p-4 rounded-xl shadow flex flex-col">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-semibold">{repo.name}</h2>
            </a>
            <p className="flex-grow my-2">{repo.description}</p>
            {repo.languages && repo.languages.length > 0 && (
                <div className="my-2">
                    <div className="flex flex-wrap gap-2 mt-1">
                        {repo.languages.map(lang => (
                            <span key={lang} className="bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="mt-auto pt-2">
                <span className="text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
                </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
