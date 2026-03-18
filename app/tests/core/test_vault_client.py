import pytest
from app.core.vault_client import VaultClient

@pytest.fixture
async def vault_client():
    """Fixture providing a vault client"""
    client = VaultClient(
        vault_url="http://127.0.0.1:8200",
        vault_token="dev-root-token"
    )
    await client.initialize()
    return client

@pytest.mark.asyncio
async def test_encrypt_decrypt_roundtrip(vault_client):
    """Test that encryption and decryption work correctly"""
    plaintext = "John Doe"
    
    # Encrypt
    ciphertext = await vault_client.encrypt(plaintext)
    assert ciphertext != plaintext
    assert ciphertext.startswith("vault:v1:")
    
    # Decrypt
    decrypted = await vault_client.decrypt(ciphertext)
    assert decrypted == plaintext

@pytest.mark.asyncio
async def test_deterministic_encryption(vault_client):
    """Test that same input produces same ciphertext (deterministic)"""
    plaintext = "sensitive@email.com"
    
    ciphertext1 = await vault_client.encrypt(plaintext)
    ciphertext2 = await vault_client.encrypt(plaintext)
    
    assert ciphertext1 == ciphertext2
