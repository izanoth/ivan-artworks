import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSessionSecretKey } from '../src/near-studio/services/sessionAuth.mjs';

test('resolves private key from seed phrase', () => {
  const secretKey = resolveSessionSecretKey({
    authMethod: 'seedPhrase',
    seedPhrase: 'shop melt permit regular symbol visit hero rich budget garbage person select',
  });

  assert.match(secretKey, /^ed25519:/);
  assert.equal(secretKey.length > 40, true);
});

test('accepts a private key as-is', () => {
  const secretKey = resolveSessionSecretKey({
    authMethod: 'privateKey',
    privateKey: 'ed25519:5rRiTgAbWKX7yceUknusbvUb6MMaT1qxbK5WmtAMFvPef31YTbeAbJ5B8dBeNgkPddeqzXDd9Lj8Aj29jcudRpUE',
  });

  assert.equal(secretKey, 'ed25519:5rRiTgAbWKX7yceUknusbvUb6MMaT1qxbK5WmtAMFvPef31YTbeAbJ5B8dBeNgkPddeqzXDd9Lj8Aj29jcudRpUE');
});
