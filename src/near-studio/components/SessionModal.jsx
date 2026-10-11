import styles from './SessionModal.module.css';

export default function SessionModal({
  isOpen,
  loading,
  sessionForm,
  setSessionForm,
  onClose,
  onSubmit,
  supportedNetworks = ['testnet', 'mainnet'],
}) {
  if (!isOpen) return null;

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-title"
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 id="session-title">Abrir sessão NEAR</h2>
            <p>
              As credenciais são usadas somente no navegador e não são enviadas para
              uma API própria.
            </p>
          </div>
          <button
            type="button"
            className={`${styles.secondaryButton} ${styles.closeButton}`}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Rede</span>
            <select
              className={styles.fieldInput}
              value={sessionForm.network}
              onChange={(event) =>
                setSessionForm({ ...sessionForm, network: event.target.value })
              }
            >
              {supportedNetworks.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Account ID</span>
            <input
              className={styles.fieldInput}
              autoFocus
              autoComplete="off"
              placeholder="seu-account.testnet"
              value={sessionForm.accountId}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  accountId: event.target.value,
                })
              }
              required
            />
          </label>

          <label className={styles.field}>
            <span>Chave privada de assinatura</span>
            <input
              className={styles.fieldInput}
              type="password"
              autoComplete="off"
              placeholder="ed25519:..."
              value={sessionForm.privateKey}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  privateKey: event.target.value,
                })
              }
              required
            />
          </label>

          <p className={styles.securityNote}>
            A aplicação consulta a access key diretamente via RPC para confirmar que a
            chave pertence à conta. A chave privada não é registrada no log nem
            persistida no localStorage.
          </p>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Processando...' : 'Abrir sessão'}
          </button>
        </form>
      </section>
    </div>
  );
}
