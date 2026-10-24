import styles from "./SessionModal.module.css";
import { yoctoToNear, nearToYocto } from "@/near-studio/controllers/nearController";

export default function SessionModal({
  selected,
  accountId,
  setAccountId,
  privateKey,
  setPrivateKey,
  message,
  authenticating,
  onSubmit,
  onClose,
}) {
  const displayPrice = yoctoToNear(selected?.priceYocto || "0");
  const normalizedPriceYocto = nearToYocto(displayPrice);

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={`${styles.marketplaceModal} ${styles.sessionModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-title"
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
          <span className={styles.modalIcon}>↗</span>

          <div>
            <span className={styles.eyebrow}>Etapa 1 de 2</span>
            <h2 id="session-title">Abrir sessão</h2>
          </div>
        </div>

        <p className={styles.modalLead}>
          Para continuar a compra de{" "}
          <strong>{selected.title || `NFT #${selected.tokenId}`}</strong>,
          abra uma sessão temporária com sua conta NEAR.
        </p>

        <div className={styles.sessionSummary}>
          <div>
            <span>NFT</span>
            <strong>{selected.title || `#${selected.tokenId}`}</strong>
          </div>

          <div>
            <span>Valor</span>
            <strong title={normalizedPriceYocto}>{displayPrice} NEAR</strong>
          </div>
        </div>

        <form className={styles.sessionForm} onSubmit={onSubmit}>
          <div className={styles.checkoutWarning}>
            <strong>Sessão somente em memória</strong>

            <p>
              A chave privada é usada apenas para criar o assinador local da
              sessão. Ela não é persistida nem enviada ao backend.
            </p>
          </div>

          <label>
            <span>Account ID</span>

            <input
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              placeholder="alice.testnet"
              autoComplete="off"
              required
            />
          </label>

          <label>
            <span>Private Key</span>

            <input
              type="password"
              value={privateKey}
              onChange={(event) => setPrivateKey(event.target.value)}
              placeholder="ed25519:…"
              autoComplete="off"
              spellCheck="false"
              required
            />
          </label>

          {message && (
            <p className={`${styles.checkoutMessage} ${styles.checkoutMessageError}`} role="alert">
              {message}
            </p>
          )}

          <button className={styles.primaryButton} type="submit" disabled={authenticating}>
            {authenticating ? "Validando sessão…" : "Abrir sessão e continuar"}
          </button>
        </form>

        <p className={styles.modalSecurity}>
          Use somente uma chave apropriada para este ambiente. Nunca informe uma
          chave de uma conta com fundos relevantes em um site experimental.
        </p>
      </section>
    </div>
  );
}
