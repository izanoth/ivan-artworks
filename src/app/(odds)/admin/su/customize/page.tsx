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

export default function CustomizePage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [footerText, setFooterText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pages' | 'content' | 'footer'>('pages');
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

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customize');
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const data = await res.json();
      setPages(data.pages || []);
      setFooterItems(data.footerItems || []);
      setFooterText(data.footerText || '');
      setNewFooterOrder((data.footerItems?.length || 0) + 1);

      // Initialize whoami content
      const whoami = data.pages?.find((p: PageItem) => p.name === 'whoami');
      if (whoami) {
        const en = whoami.contents.find((c: ContentItem) => c.locale === 'en');
        const pt = whoami.contents.find((c: ContentItem) => c.locale === 'pt');
        setWhoamiContent({
          en: en?.body || '',
          pt: pt?.body || '',
        });
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

  // 1. Alternar ativação de página (reflete no Header e Middleware)
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

  // 2. Salvar nova versão do conteúdo de texto (adiciona nova linha no banco)
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

  // 3. Salvar item do footer (edição ou novo)
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

  // Adicionar novo item no footer
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

  // 4. Excluir item do footer (soft-delete)
  const handleDeleteFooterItem = async (id: string) => {
    if (!confirm('Deseja realmente remover este item do rodapé? (Ele será mantido no banco por histórico).')) {
      return;
    }

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

  // 5. Salvar texto/abordagem geral do footer (gera nova versão no banco)
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

  const whoamiPage = pages.find((p) => p.name === 'whoami');

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customização Geral do App</h1>
          <p className="text-sm text-gray-500 mt-1">
            Controle de visibilidade nos menus, edição versionada de conteúdo e customização do rodapé.
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
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('pages')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'pages'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ativação de Páginas & Header
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Conteúdo de Texto (Whoami)
        </button>
        <button
          onClick={() => setActiveTab('footer')}
          className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'footer'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Customização do Footer
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

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                <strong>Exemplos de funcionamento:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Se <strong>marketplace</strong> for desativado, o link na aba &apos;Navbar Principal&apos; do Header não aparece e a rota <code>/marketplace</code> é barrada no middleware.</li>
                  <li>Se <strong>contact</strong> for desativado, o ícone na aba &apos;Navbar Secundária&apos; do Header não aparece e a rota <code>/contact</code> é barrada no middleware.</li>
                </ul>
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
                    O conteúdo abaixo é servido dinamicamente do banco de dados PostgreSQL. Quando salvo, <strong>uma nova linha é adicionada ao banco</strong> com versão incrementada, preservando integralmente o histórico sem excluir dados anteriores.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English version */}
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
                        placeholder="Insira o HTML/texto em inglês..."
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Suporta tags HTML (&lt;p&gt;, &lt;a&gt;, etc.)</span>
                      <button
                        onClick={() => whoamiPage && handleSaveContent(whoamiPage.id, 'en')}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                      >
                        Salvar Nova Linha (EN)
                      </button>
                    </div>
                  </div>

                  {/* Portuguese version */}
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
                        placeholder="Insira o HTML/texto em português..."
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Suporta tags HTML (&lt;p&gt;, &lt;a&gt;, etc.)</span>
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

                {/* Version History preview */}
                {whoamiPage && whoamiPage.contents.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Histórico de Versões Preservadas no PostgreSQL</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b text-gray-400">
                            <th className="py-2">Versão</th>
                            <th className="py-2">Idioma</th>
                            <th className="py-2">Data de Criação</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {whoamiPage.contents.map((c) => (
                            <tr key={c.id}>
                              <td className="py-2 font-mono font-bold">v{c.version}</td>
                              <td className="py-2 uppercase font-semibold">{c.locale}</td>
                              <td className="py-2 text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                              <td className="py-2">
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                                  Preservada (Regra Postgres)
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMIZAÇÃO DO FOOTER */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              {/* Texto de Direitos / Abordagem */}
              <div className="bg-white shadow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Texto e Abordagem do Rodapé</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Edição do texto de copyright e abordagem do rodapé. As alterações são gravadas no banco de dados.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-grow w-full">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Texto de Copyright / Rodapé</label>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ex: Zanoth © Independent Artworks 2023-25. All Rights Reserved."
                    />
                  </div>
                  <button
                    onClick={handleSaveFooterText}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition-colors whitespace-nowrap"
                  >
                    Salvar Texto
                  </button>
                </div>
              </div>

              {/* Ícones e Links Sociais */}
              <div className="bg-white shadow rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Ícones e Links do Rodapé</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Gerencie as redes sociais, repositórios e links exibidos no Footer.
                </p>

                <div className="space-y-4 mb-8">
                  {footerItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                    >
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Texto / Rótulo</label>
                        <input
                          type="text"
                          defaultValue={item.text}
                          id={`footer-text-${item.id}`}
                          className="w-full p-1.5 border border-gray-300 rounded text-sm bg-white"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">URL do Link</label>
                        <input
                          type="text"
                          defaultValue={item.link || ''}
                          id={`footer-link-${item.id}`}
                          className="w-full p-1.5 border border-gray-300 rounded text-sm bg-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Classe do Ícone</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue={item.iconClass || ''}
                            id={`footer-icon-${item.id}`}
                            className="w-full p-1.5 border border-gray-300 rounded text-sm bg-white font-mono text-xs"
                          />
                          {item.iconClass && <i className={`${item.iconClass} text-xl text-gray-700`}></i>}
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Ordem</label>
                        <input
                          type="number"
                          defaultValue={item.order}
                          id={`footer-order-${item.id}`}
                          className="w-full p-1.5 border border-gray-300 rounded text-sm bg-white"
                        />
                      </div>

                      <div className="md:col-span-1 flex items-center pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={item.isActive}
                            id={`footer-active-${item.id}`}
                            className="rounded text-blue-600"
                          />
                          Ativo
                        </label>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2 md:pt-0">
                        <button
                          onClick={() => {
                            const textVal = (document.getElementById(`footer-text-${item.id}`) as HTMLInputElement)?.value;
                            const linkVal = (document.getElementById(`footer-link-${item.id}`) as HTMLInputElement)?.value;
                            const iconVal = (document.getElementById(`footer-icon-${item.id}`) as HTMLInputElement)?.value;
                            const orderVal = (document.getElementById(`footer-order-${item.id}`) as HTMLInputElement)?.value;
                            const activeVal = (document.getElementById(`footer-active-${item.id}`) as HTMLInputElement)?.checked;

                            handleSaveFooterItem({
                              id: item.id,
                              text: textVal,
                              link: linkVal || null,
                              iconClass: iconVal || null,
                              order: Number(orderVal) || 0,
                              isActive: activeVal,
                            });
                          }}
                          disabled={saving}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => handleDeleteFooterItem(item.id)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulário para Adicionar Novo Item */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Adicionar Novo Link / Ícone</h3>
                  <form onSubmit={handleAddNewFooterItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Rótulo / Rede</label>
                      <input
                        type="text"
                        placeholder="Ex: Instagram"
                        value={newFooterText}
                        onChange={(e) => setNewFooterText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">URL Completa</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={newFooterLink}
                        onChange={(e) => setNewFooterLink(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Classe CSS do Ícone</label>
                      <input
                        type="text"
                        placeholder="Ex: bi bi-instagram"
                        value={newFooterIcon}
                        onChange={(e) => setNewFooterIcon(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white font-mono text-xs"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-600 mb-1">Ordem</label>
                      <input
                        type="number"
                        value={newFooterOrder}
                        onChange={(e) => setNewFooterOrder(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold shadow transition-colors"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
