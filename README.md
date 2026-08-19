# ProofMint

ProofMint is a digital image authenticity and provenance platform that uses **cryptographic hashing and blockchain technology** to register and verify images.

The system allows users to:

- Register an image and create a tamper-evident blockchain record.
- Verify whether an image has previously been registered.
- Store image files securely using Cloudinary.
- Store image metadata using MongoDB.
- Store the image's cryptographic hash on the Ethereum Sepolia testnet.

---

## 🎯 Problem

Digital images can easily be copied, modified, and redistributed, making it difficult to determine whether an image is the same as one that was previously registered.

ProofMint addresses this by creating a unique cryptographic fingerprint of an image.

Instead of storing the image itself on the blockchain, ProofMint stores its **SHA-256 hash**.

If the image is modified, even slightly, its hash changes.

Therefore, the system can determine whether the exact image has previously been registered.

---

## 💡 How ProofMint Works

### Image Registration

When a user wants to register an image:

```text
Image
  ↓
SHA-256 Hash
  ↓
Cloudinary
  ↓
MongoDB
  ↓
Ethereum Sepolia
  ↓
Transaction Hash