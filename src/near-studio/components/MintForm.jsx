import React, { useEffect, useMemo, useState } from "react";

const emptyMint = {
  token_id: "",
  owner_id: "",
  title: "",
  description: "",
  media: "",
  copies: 1,
  priceNear: "",
  illustrations: [],
};

export default function MintForm({ collections = [], account, onMintToken, isMinting, mintMsg, mintError }) {
  const [form, setForm] = useState(emptyMint);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [royalties, setRoyalties] = useState([{ accountId: "", basisPoints: "" }]);

  const selectedCollection = useMemo(
    () => collections.find((collection) => String(collection.id) === String(selectedCollectionId)) || null,
    [collections, selectedCollectionId],
  );

  useEffect(() => {
    if (!selectedCollection) return;

    const metadata = selectedCollection.metadata ?? selectedCollection.metadataJson ?? {};
    const nextValues = {
      title: metadata.title ?? selectedCollection.name ?? "",
      description: metadata.description ?? selectedCollection.description ?? "",
      media: metadata.media ?? selectedCollection.media ?? "",
      copies: Number(metadata.copies ?? selectedCollection.maxCopies ?? form.copies ?? 1) || 1,
    };

    setForm((current) => ({
      ...current,
      title: current.title || nextValues.title,
      description: current.description || nextValues.description,
      media: current.media || nextValues.media,
      copies: Number(current.copies) > 0 ? Number(current.copies) : nextValues.copies,
    }));
  }, [selectedCollection, form.copies]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onMintToken?.({
      mint: form,
      royalties,
      selectedCollectionId,
      remintTokenRecord: null,
    });
  };

  return (
    <section className="studio-card flex flex-col justify-between min-h-[460px]">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800 m-0">Mint / Sale</h2>
          <p className="text-xs text-slate-500 mt-1 m-0">Crie novos NFTs e prepare a listagem para venda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <label className="block text-xs font-medium text-slate-700">
              Token ID
              <input className="studio-input mt-1" name="token_id" value={form.token_id} onChange={handleChange} placeholder="token-001" required />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Owner ID
              <input className="studio-input mt-1" name="owner_id" value={form.owner_id} onChange={handleChange} placeholder={account || "owner.testnet"} />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Título
              <input className="studio-input mt-1" name="title" value={form.title} onChange={handleChange} placeholder="Título do NFT" />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Descrição
              <input className="studio-input mt-1" name="description" value={form.description} onChange={handleChange} placeholder="Descrição" />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Media URL
              <input className="studio-input mt-1" name="media" value={form.media} onChange={handleChange} placeholder="https://..." />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-700">
                Copies
                <input className="studio-input mt-1" type="number" min="1" name="copies" value={form.copies} onChange={handleChange} />
              </label>
              <label className="block text-xs font-medium text-slate-700">
                Price (NEAR)
                <input className="studio-input mt-1" name="priceNear" value={form.priceNear} onChange={handleChange} placeholder="1.5" required />
              </label>
            </div>
            <label className="block text-xs font-medium text-slate-700">
              Coleção
              <select className="studio-input mt-1" value={selectedCollectionId} onChange={(event) => setSelectedCollectionId(event.target.value)}>
                <option value="">Sem coleção</option>
                {collections.map((collection) => (
                  <option key={collection.id || collection.name} value={collection.id}>{collection.name}</option>
                ))}
              </select>
            </label>
          </div>

          {mintMsg && <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded mt-2">{mintMsg}</p>}
          {mintError && <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded mt-2">{mintError}</p>}

          <button type="submit" className="btn-primary text-sm py-2.5 mt-2 w-full" disabled={isMinting}>
            {isMinting ? "Mintando..." : "Executar mint"}
          </button>
        </form>
      </div>
    </section>
  );
}
