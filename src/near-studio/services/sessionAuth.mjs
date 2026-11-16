import { parseSeedPhrase } from 'near-seed-phrase';

export function resolveSessionSecretKey({
  authMethod = 'privateKey',
  privateKey = '',
  seedPhrase = '',
} = {}) {
  const method = String(authMethod || 'privateKey').trim();

  if (method === 'seedPhrase') {
    const normalizedSeedPhrase = String(seedPhrase || '').trim();

    if (!normalizedSeedPhrase) {
      throw new Error('Informe a seed phrase para autenticar a sessão.');
    }

    const parsed = parseSeedPhrase(normalizedSeedPhrase);

    if (!parsed?.secretKey) {
      throw new Error('A seed phrase informada não gerou uma chave válida para NEAR.');
    }

    return parsed.secretKey;
  }

  const normalizedPrivateKey = String(privateKey || '').trim();

  if (!normalizedPrivateKey) {
    throw new Error('Informe a chave privada para assinar as operações.');
  }

  return normalizedPrivateKey;
}
