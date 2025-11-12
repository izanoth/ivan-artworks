// app/prog/page.js (Next 13+ com App Router)
async function getRepos() {
  const res = await fetch("https://api.github.com/users/izanoth/repos", {
    headers: { "Accept": "application/vnd.github.v3+json" },
    next: { revalidate: 3600 } // cache 1h
  });
  if (!res.ok) throw new Error("Erro ao buscar repositórios");
  return res.json();
}

export default async function Home() {
  const repos = await getRepos();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meus Projetos</h1>
      <ul className="grid gap-4">
        {repos.map(repo => (
          <li key={repo.id} className="border p-4 rounded-xl shadow">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <h2 className="text-lg font-semibold">{repo.name}</h2>
            </a>
            <p>{repo.description}</p>
            <span className="text-sm text-gray-500">
              ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
