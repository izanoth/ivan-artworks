import styles from "./CheckoutModal.module.css";
import { yoctoToNear, nearToYocto } from "@/near-studio/controllers/nearController";

function formatRoyalties(rawRoyalties) {
  if (!rawRoyalties) return [];

  try {
    const parsed = typeof rawRoyalties === "string" ? JSON.parse(rawRoyalties) : rawRoyalties;
    return Object.entries(parsed || {});
  } catch {
    return [];
  }
}

export default function CheckoutModal({
  selected,
  sessionInfo,
  buying,
  message,
  transactionResult,
  coverImage,
  onClose,
  onEndSession,
  onPurchase,
  gas,
}) {
  const royalties = formatRoyalties(selected?.royalties);
  const displayPrice = yoctoToNear(selected?.priceYocto || "0");
  const normalizedPriceYocto = nearToYocto(displayPrice);

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={`${styles.marketplaceModal} ${styles.checkoutModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <button
          className={styles.modalClose}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

        <div className={styles.modalHeader}>
          <span className={styles.modalIcon}>✓</span>

          <div>
            <span className={styles.eyebrow}>Etapa 2 de 2</span>
            <h2 id="checkout-title">Confirmar compra</h2>
          </div>
        </div>

        <div className={styles.checkoutProduct}>
          <div className={styles.checkoutProductMedia}>
            {coverImage ? <img src={coverImage} alt="" /> : <span>NFT</span>}
          </div>

          <div className="text-left">
            <span className={styles.checkoutProductLabel}>NFT</span>
            <strong>{selected.title || `NFT #${selected.tokenId}`}</strong>
            <span>#{selected.tokenId}</span>
          </div>

          <div className={styles.checkoutProductPrice}>
            <span>Total</span>
            <strong>{displayPrice}</strong>
            <small title={normalizedPriceYocto}>NEAR</small>
          </div>
        </div>

        <div className={styles.checkoutSession}>
          <span className={styles.sessionStatusDot} />

          <div className="text-left">
            <span>Sessão ativa</span>
            <strong>{sessionInfo.accountId}</strong>
          </div>

          <button type="button" onClick={onEndSession}>
            Trocar conta
          </button>
        </div>

        <dl className={styles.checkoutDetails}>
          <div>
            <dt>Token</dt>
            <dd>{selected.tokenId}</dd>
          </div>

          <div>
            <dt>Vendedor</dt>
            <dd>{selected.ownerId}</dd>
          </div>

          <div>
            <dt>Contrato NFT</dt>
            <dd>{selected.contractId}</dd>
          </div>

          <div>
            <dt>Rede</dt>
            <dd>{selected.network}</dd>
          </div>

          <div>
            <dt>Método</dt>
            <dd>nft_buy</dd>
          </div>

          <div>
            <dt>Receiver</dt>
            <dd>{sessionInfo.accountId}</dd>
          </div>

          <div>
            <dt>Gas máximo</dt>
            <dd>{gas}</dd>
          </div>

          {royalties.length > 0 && (
            <div>
              <dt>Royalties</dt>
              <dd>
                {royalties.map(([accountId, amount]) => (
                  <span key={accountId}>
                    {accountId}: {Number(amount) / 100}%
                  </span>
                ))}
              </dd>
            </div>
          )}

          <div className={styles.checkoutTotal}>
            <dt>Valor da compra</dt>
            <dd>{displayPrice} NEAR</dd>
          </div>
        </dl>

        <p className={styles.checkoutConsent}>
          Confira cuidadosamente o receiver, método, token, vendedor e valor antes
          de autorizar a assinatura.
        </p>

        <button
          className={styles.primaryButton}
          type="button"
          onClick={onPurchase}
          disabled={buying}
        >
          {buying ? "Enviando transação…" : `Assinar compra · ${displayPrice} NEAR`}
        </button>

        <button className={styles.secondaryButton} type="button" onClick={onEndSession} disabled={buying}>
          Encerrar sessão
        </button>

        {message && (
          <p className={styles.checkoutMessage} role="status">
            {message}
          </p>
        )}

        {transactionResult && (
          <details className={styles.txResult}>
            <summary>Ver resposta da transação</summary>
            <pre>{JSON.stringify(transactionResult, null, 2)}</pre>
          </details>
        )}

        <p className={styles.modalSecurity}>
          A assinatura é realizada localmente e enviada diretamente ao RPC da rede
          NEAR.
        </p>
      </section>
    </div>
  );
}
