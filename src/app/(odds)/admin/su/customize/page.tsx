'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  locale: string;
  body: string;
  version: number;
  createdAt: string;
}

interface PageItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  type: string;
  contents: ContentItem[];
}

interface FooterItem {
  id: string;
  text: string;
  link: string | null;
  iconClass: string | null;
  order: number;
  isActive: boolean;
}

interface TrackItem {
  title: string;
  src?: string;
  software?: string[];
}

interface AlbumItem {
  id?: string;
  title: string;
  year: number;
  genre: string;
  composer: string;
  coverImage: string;
  tracks: TrackItem[];
}

export default function CustomizePage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [footerText, setFooterText] = useState<string>('');
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pages' | 'content' | 'footer' | 'albums'>('pages');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New footer item form state
  const [newFooterText, setNewFooterText] = useState('');
  const [newFooterLink, setNewFooterLink] = useState('');
  const [newFooterIcon, setNewFooterIcon] = useState('');
  const [newFooterOrder, setNewFooterOrder] = useState<number>(0);

  // Editable contents state { [locale]: body }
  const [whoamiContent, setWhoamiContent] = useState<{ [locale: string]: string }>({ en: '', pt: '' });

  // Album Form State
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCustom, resAlbums] = await Promise.all([
        fetch('/api/admin/customize'),
        fetch('/api/admin/albums')
      ]);

      if (!resCustom.ok) throw new Error('Falha ao carregar dados de customização');
      const dataCustom = await resCustom.json();
      setPages(dataCustom.pages || []);
      setFooterItems(dataCustom.footerItems || []);
      setFooterText(dataCustom.footerText || '');
      setNewFooterOrder((dataCustom.footerItems?.length || 0) + 1);

      const whoami = dataCustom.pages?.find((p: PageItem) => p.name === 'whoami');
      if (whoami) {
        const en = whoami.contents.find((c: ContentItem) => c.locale === 'en');
        const pt = whoami.contents.find((c: ContentItem) => c.locale === 'pt');
        setWhoamiContent({
          en: en?.body || '',
          pt: pt?.body || '',
        });
      }

      if (resAlbums.ok) {
        const dataAlbums = await resAlbums.json();
        setAlbums(dataAlbums || []);
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePage = async (page: PageItem) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page',
          id: page.id,
          data: {
            ...page,
            isActive: !page.isActive,
          },
        }),
      });

      if (!res.ok) throw new Error('Erro ao alterar status da página');
      showNotification(`Página ${page.name} ${!page.isActive ? 'ativada' : 'desativada'} com sucesso!`);
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar alteração', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async (pageId: string, locale: string) => {
    try {
      setSaving(true);
      const bodyToSave = whoamiContent[locale];
      const res = await fetch('/api/admin/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          data: {
            pageId,
            locale,
            body: bodyToSave,
          },
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar nova versão do conteúdo');
      const saved = await res.json();
      showNotification(`Nova versão (v${saved.version}) do conteúdo (${locale.toUpperCase()}) criada no banco com sucesso!`);
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar conteúdo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooterItem = async (item: Partial<FooterItem>) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'footerItem',
          id: item.id,
          data: {
            text: item.text,
            link: item.link,
            iconClass: item.iconClass,
            order: item.order,
            isActive: item.isActive,
          },
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar item do rodapé');
      showNotification('Item do rodapé salvo com sucesso!');
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewFooterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFooterText.trim()) {
      showNotification('O texto/título do item é obrigatório.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'footerItem',
          data: {
            text: newFooterText,
            link: newFooterLink || null,
            iconClass: newFooterIcon || null,
            order: Number(newFooterOrder) || 1,
            isActive: true,
          },
        }),
      });

      if (!res.ok) throw new Error('Erro ao adicionar novo item');
      showNotification('Novo item adicionado ao rodapé!');
      setNewFooterText('');
      setNewFooterLink('');
      setNewFooterIcon('');
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao criar item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFooterItem = async (id: string) => {
    if (!confirm('Deseja realmente remover este item do rodapé?')) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/customize?type=footerItem&id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover item do rodapé');
      showNotification('Item removido com sucesso!');
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao excluir item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooterText = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'footerText',
          data: {
            text: footerText,
          },
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar texto do rodapé');
      showNotification('Texto geral do rodapé atualizado e versionado no banco!');
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar texto', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Album CRUD handlers
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum || !editingAlbum.title) {
      showNotification('O título do álbum é obrigatório.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAlbum),
      });

      if (!res.ok) throw new Error('Erro ao salvar álbum');
      showNotification('Álbum salvo com sucesso!');
      setEditingAlbum(null);
      setIsCreatingAlbum(false);
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar álbum', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Deseja realmente excluir este álbum e suas faixas?')) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/albums?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao excluir álbum');
      showNotification('Álbum excluído com sucesso!');
      await fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao excluir álbum', 'error');
    } finally {
      setSaving(false);
    }
  };

  const whoamiPage = pages.find((p) => p.name === 'whoami');

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customização Geral do App</h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle de visibilidade nos menus, edição versionada de conteúdo, rodapé e gerenciamento de álbuns musicais.
          </p>
        </div>
        <Link
          href="/admin/su"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold transition-colors"
        >
          ← Voltar para a Dashboard
        </Link>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium transition-all ${
            feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pages')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'pages'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ativação de Páginas & Header
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Conteúdo de Texto (Whoami)
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'footer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Customização do Footer
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'albums'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Gerenciamento de Álbuns
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Carregando dados de customização...</div>
      ) : (
        <>
          {/* TAB 1: PÁGINAS & HEADER */}
          {activeTab === 'pages' && (
            <div className="bg-white shadow rounded-2xl p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Controle de Páginas e Menus do Header</h2>
                <p className="text-sm text-gray-500">
                  Desativar uma página oculta seu respectivo ícone/link no <strong>Header</strong> e impede o acesso direto à rota através do <strong>Middleware</strong> (redirecionando para a Home).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Página</th>
                      <th className="py-3 px-4">Rota (Slug)</th>
                      <th className="py-3 px-4">Local no Header</th>
                      <th className="py-3 px-4">Ordem</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {pages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-800 capitalize">{page.name}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">{page.slug}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              page.type === 'main'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-gray-800 text-gray-100'
                            }`}
                          >
                            {page.type === 'main' ? 'Navbar Principal' : 'Navbar Secundária'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{page.order}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              page.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {page.isActive ? 'Ativa' : 'Desativada'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleTogglePage(page)}
                            disabled={saving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                              page.isActive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {page.isActive ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CONTEÚDO DE TEXTO (WHOAMI) */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-2xl p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Edição de Conteúdo: Página /whoami</h2>
                  <p className="text-sm text-gray-500">
                    O conteúdo abaixo é servido dinamicamente do banco de dados PostgreSQL. Quando salvo, <strong>uma nova linha é adicionada ao banco</strong> com versão incrementada.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-gray-700 text-sm">Versão em Inglês (EN)</label>
                        {whoamiPage?.contents.find((c) => c.locale === 'en') && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                            v{whoamiPage.contents.find((c) => c.locale === 'en')?.version}
                          </span>
                        )}
                      </div>
                      <textarea
                        value={whoamiContent.en}
                        onChange={(e) => setWhoamiContent({ ...whoamiContent, en: e.target.value })}
                        className="w-full h-80 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => whoamiPage && handleSaveContent(whoamiPage.id, 'en')}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                      >
                        Salvar Nova Linha (EN)
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-bold text-gray-700 text-sm">Versão em Português (PT)</label>
                        {whoamiPage?.contents.find((c) => c.locale === 'pt') && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                            v{whoamiPage.contents.find((c) => c.locale === 'pt')?.version}
                          </span>
                        )}
                      </div>
                      <textarea
                        value={whoamiContent.pt}
                        onChange={(e) => setWhoamiContent({ ...whoamiContent, pt: e.target.value })}
                        className="w-full h-80 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => whoamiPage && handleSaveContent(whoamiPage.id, 'pt')}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                      >
                        Salvar Nova Linha (PT)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMIZAÇÃO DO FOOTER */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Texto e Abordagem do Rodapé</h2>
                <div className="flex flex-col sm:flex-row gap-3 items-end mt-4">
                  <div className="flex-grow w-full">
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveFooterText}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold whitespace-nowrap"
                  >
                    Salvar Texto
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ícones e Links do Rodapé</h2>
                <div className="space-y-4 mb-8">
                  {footerItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-3">
                        <input type="text" defaultValue={item.text} id={`footer-text-${item.id}`} className="w-full p-1.5 border rounded text-sm bg-white" />
                      </div>
                      <div className="md:col-span-3">
                        <input type="text" defaultValue={item.link || ''} id={`footer-link-${item.id}`} className="w-full p-1.5 border rounded text-sm bg-white" />
                      </div>
                      <div className="md:col-span-2">
                        <input type="text" defaultValue={item.iconClass || ''} id={`footer-icon-${item.id}`} className="w-full p-1.5 border rounded text-sm bg-white font-mono text-xs" />
                      </div>
                      <div className="md:col-span-1">
                        <input type="number" defaultValue={item.order} id={`footer-order-${item.id}`} className="w-full p-1.5 border rounded text-sm bg-white" />
                      </div>
                      <div className="md:col-span-1 flex items-center">
                        <label className="flex items-center gap-1.5 text-xs text-gray-700">
                          <input type="checkbox" defaultChecked={item.isActive} id={`footer-active-${item.id}`} /> Ativo
                        </label>
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            const textVal = (document.getElementById(`footer-text-${item.id}`) as HTMLInputElement)?.value;
                            const linkVal = (document.getElementById(`footer-link-${item.id}`) as HTMLInputElement)?.value;
                            const iconVal = (document.getElementById(`footer-icon-${item.id}`) as HTMLInputElement)?.value;
                            const orderVal = (document.getElementById(`footer-order-${item.id}`) as HTMLInputElement)?.value;
                            const activeVal = (document.getElementById(`footer-active-${item.id}`) as HTMLInputElement)?.checked;
                            handleSaveFooterItem({ id: item.id, text: textVal, link: linkVal || null, iconClass: iconVal || null, order: Number(orderVal) || 0, isActive: activeVal });
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                        >Salvar</button>
                        <button onClick={() => handleDeleteFooterItem(item.id)} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold">Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNewFooterItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-dashed">
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">Rótulo / Rede</label>
                    <input type="text" placeholder="Ex: Instagram" value={newFooterText} onChange={(e) => setNewFooterText(e.target.value)} className="w-full p-2 border rounded text-sm bg-white" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">URL Completa</label>
                    <input type="url" placeholder="https://..." value={newFooterLink} onChange={(e) => setNewFooterLink(e.target.value)} className="w-full p-2 border rounded text-sm bg-white" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">Classe CSS do Ícone</label>
                    <input type="text" placeholder="bi bi-instagram" value={newFooterIcon} onChange={(e) => setNewFooterIcon(e.target.value)} className="w-full p-2 border rounded text-sm bg-white font-mono text-xs" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">Ordem</label>
                    <input type="number" value={newFooterOrder} onChange={(e) => setNewFooterOrder(Number(e.target.value))} className="w-full p-2 border rounded text-sm bg-white" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-2 bg-green-600 text-white rounded text-sm font-semibold">+ Adicionar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: GERENCIAMENTO DE ÁLBUNS (CRUD) */}
          {activeTab === 'albums' && (
            <div className="bg-white shadow rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Álbuns Musicais</h2>
                  <p className="text-sm text-gray-500">Crie, edite ou remova álbuns e suas respectivas faixas (tracks) do banco de dados.</p>
                </div>
                {!editingAlbum && !isCreatingAlbum && (
                  <button
                    onClick={() => {
                      setIsCreatingAlbum(true);
                      setEditingAlbum({
                        title: '',
                        year: 2026,
                        genre: '',
                        composer: 'Ivan Cilento',
                        coverImage: 'images/',
                        tracks: [{ title: '', src: '', software: ['MuseScore'] }]
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow"
                  >
                    + Novo Álbum
                  </button>
                )}
              </div>

              {/* Editing / Creating Form Modal or Inline View */}
              {(editingAlbum || isCreatingAlbum) ? (
                <form onSubmit={handleSaveAlbum} className="border border-blue-200 bg-blue-50/50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {editingAlbum?.id ? 'Editar Álbum' : 'Criar Novo Álbum'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Título do Álbum *</label>
                      <input
                        type="text"
                        value={editingAlbum?.title || ''}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum!, title: e.target.value })}
                        className="w-full p-2 border rounded text-sm bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ano</label>
                      <input
                        type="number"
                        value={editingAlbum?.year || 2026}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum!, year: Number(e.target.value) })}
                        className="w-full p-2 border rounded text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Gênero</label>
                      <input
                        type="text"
                        value={editingAlbum?.genre || ''}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum!, genre: e.target.value })}
                        className="w-full p-2 border rounded text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Compositor</label>
                      <input
                        type="text"
                        value={editingAlbum?.composer || ''}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum!, composer: e.target.value })}
                        className="w-full p-2 border rounded text-sm bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Capa (Caminho da Imagem, ex: images/fingerprints.png)</label>
                      <input
                        type="text"
                        value={editingAlbum?.coverImage || ''}
                        onChange={(e) => setEditingAlbum({ ...editingAlbum!, coverImage: e.target.value })}
                        className="w-full p-2 border rounded text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Tracks Editor */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm text-gray-700">Faixas (Tracks)</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const tracks = editingAlbum?.tracks || [];
                          setEditingAlbum({
                            ...editingAlbum!,
                            tracks: [...tracks, { title: '', src: '', software: ['MuseScore'] }]
                          });
                        }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold"
                      >
                        + Adicionar Faixa
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editingAlbum?.tracks || []).map((track, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded border">
                          <span className="text-xs font-mono font-bold text-gray-400 w-6">#{idx + 1}</span>
                          <input
                            type="text"
                            placeholder="Título da Faixa"
                            value={track.title}
                            onChange={(e) => {
                              const newTracks = [...(editingAlbum?.tracks || [])];
                              newTracks[idx].title = e.target.value;
                              setEditingAlbum({ ...editingAlbum!, tracks: newTracks });
                            }}
                            className="flex-1 p-1.5 border rounded text-xs"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Áudio SRC (ex: media/redencion_preview.mp3)"
                            value={track.src || ''}
                            onChange={(e) => {
                              const newTracks = [...(editingAlbum?.tracks || [])];
                              newTracks[idx].src = e.target.value;
                              setEditingAlbum({ ...editingAlbum!, tracks: newTracks });
                            }}
                            className="flex-1 p-1.5 border rounded text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Software (vírgula): MuseScore, LMMS"
                            value={Array.isArray(track.software) ? track.software.join(', ') : (track.software || '')}
                            onChange={(e) => {
                              const newTracks = [...(editingAlbum?.tracks || [])];
                              newTracks[idx].software = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setEditingAlbum({ ...editingAlbum!, tracks: newTracks });
                            }}
                            className="w-48 p-1.5 border rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTracks = (editingAlbum?.tracks || []).filter((_, i) => i !== idx);
                              setEditingAlbum({ ...editingAlbum!, tracks: newTracks });
                            }}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAlbum(null);
                        setIsCreatingAlbum(false);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow"
                    >
                      Salvar Álbum
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <div key={album.id} className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-gray-50/50 shadow-sm">
                      <div>
                        {album.coverImage && (
                          <img
                            src={`/${album.coverImage.startsWith('/') ? album.coverImage.slice(1) : album.coverImage}`}
                            alt={album.title}
                            className="w-full h-40 object-cover rounded-lg mb-3 shadow"
                          />
                        )}
                        <h3 className="font-bold text-lg text-gray-800">{album.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">{album.year} • {album.genre} • {album.composer}</p>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Faixas: {album.tracks?.length || 0}</p>
                        <ul className="text-xs text-gray-600 max-h-32 overflow-y-auto space-y-1 mb-4 bg-white p-2 rounded border">
                          {(album.tracks || []).map((t, i) => (
                            <li key={i} className="truncate">
                              {i + 1}. {t.title} {t.src ? '🎵' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                          onClick={() => {
                            setIsCreatingAlbum(false);
                            setEditingAlbum(album);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => album.id && handleDeleteAlbum(album.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
