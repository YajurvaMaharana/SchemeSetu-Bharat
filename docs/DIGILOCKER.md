# 🏛️ DigiLocker & MeriPehchan Integration Guide (docs/DIGILOCKER.md)

SchemeSetu Bharat features an enterprise adapter architecture for national digital identity and credential verification through **DigiLocker / MeriPehchan (National Single Sign-On)**.

This document details the adapter architecture, configuration modes, security guarantees, environment variables, and the statutory onboarding procedure via **API Setu**.

---

## 1. Adapter Architecture & Dual Operating Modes

The integration is implemented under `src/digilocker/` utilizing the Provider pattern (`DigiLockerProvider`). A single configuration flag (`DIGILOCKER_MODE`) governs the runtime mode:

| Dimension | Simulated Mode (`DIGILOCKER_MODE="simulated"`) | Live Mode (`DIGILOCKER_MODE="live"`) |
| :--- | :--- | :--- |
| **Default** | **Yes (Active default)** | No (Requires API Setu provisioning) |
| **Provider** | `SimulatedProvider` (`simulatedProvider.ts`) | `LiveProvider` (`liveProvider.ts`) |
| **UI Badge** | Visible **`Simulated`** banner & status chips | **`Connected to DigiLocker`** verification badge |
| **Identity Profile** | Deterministic citizen profile (**Ramesh Patil**, Nashik, MH) | Real citizen identity returned by DigiLocker / MeriPehchan |
| **Issued Documents** | 5 statutory demo credentials (Aadhaar, Income, Caste, 7/12, Class XII) | Live digital certificates fetched from issuing government repositories |
| **Network Dependency** | Zero external network calls; unbreakable offline demo | Direct connection to DigiLocker Requester API & API Setu |

---

## 2. Configuration & Environment Variables

### Frontend Variables (Vite / Client-Side)

Create or update `.env` in the root directory:

```bash
# Toggle adapter mode: "simulated" (default) or "live"
VITE_DIGILOCKER_MODE=simulated

# DigiLocker Requester Application Client ID (from API Setu portal)
VITE_DIGILOCKER_CLIENT_ID=your_digilocker_client_id_here

# Whitelisted OAuth 2.0 Redirect URI registered in DigiLocker partner portal
VITE_DIGILOCKER_REDIRECT_URI=https://your-domain.gov.in/#/digilocker/callback

# Authorization Endpoint URL (MeriPehchan / DigiLocker Requester Gateway)
# TODO: Update with exact endpoint from your API Setu onboarding documents
VITE_DIGILOCKER_AUTH_URL=https://api.digitallocker.gov.in/public/oauth2/1/authorize

# Base API URL
VITE_DIGILOCKER_API_BASE_URL=https://api.digitallocker.gov.in/public/oauth2/1
```

### Backend Variables (Express Server / `server.ts`)

> **Critical Security Invariant:** The `DIGILOCKER_CLIENT_SECRET` is strictly read on the Node.js backend. It is **never** sent to or accessible within the browser client.

```bash
# Server-side DigiLocker Client ID
DIGILOCKER_CLIENT_ID=your_digilocker_client_id_here

# DigiLocker Client Secret (Confidential - Server-side only)
DIGILOCKER_CLIENT_SECRET=your_confidential_client_secret_here

# Token Exchange Endpoint URL
# TODO: Verify against API Setu Requester documentation
DIGILOCKER_TOKEN_URL=https://api.digitallocker.gov.in/public/oauth2/1/token

# Documents & Profile API Base URL
DIGILOCKER_API_BASE_URL=https://api.digitallocker.gov.in/public/oauth2/1
```

---

## 3. Redirect URI & Partner Portal Registration

When onboarding with the National Digital Locker System:

1. **Partner Portal**: Access the official [DigiLocker Partner Portal](https://partners.digitallocker.gov.in/).
2. **Requester Service**: Register SchemeSetu Bharat as an authorized **Requester Organization** (Jan Seva Kendra / Civic Welfare Aggregator).
3. **Redirect URI Whitelisting**:
   - In your DigiLocker Partner Portal settings under *OAuth Redirect URIs*, add your exact application callback URL:
     ```
     https://<your-app-domain>/#/digilocker/callback
     ```
   - For local development:
     ```
     http://localhost:3000/#/digilocker/callback
     ```
4. **Scope Registration**:
   - Request statutory read permissions for `openid`, `profile`, and specific document issuers (e.g., UIDAI, Mahabhulekh, Revenue Departments).

---

## 4. Production Onboarding via API Setu

Real-world onboarding for Indian public sector and statutory welfare systems must be routed through **API Setu** (Ministry of Electronics and Information Technology - MeitY):

1. **Organization Registration**: Sign up your administrative department or authorized civic technology entity at [apisetu.gov.in](https://apisetu.gov.in/).
2. **Select API**: Subscribe to the *DigiLocker Requester Integration API*.
3. **MOU & Compliance**: Complete statutory compliance for Digital Personal Data Protection (DPDP) Act 2023.
4. **Credential Issuance**: Upon verification, API Setu provides:
   - `Client ID`
   - `Client Secret`
   - Production API Gateway Endpoints & SSL Mutual Authentication (mTLS) certificates if required.
5. **Activation**: Populate the issued credentials into your backend `.env` file and switch `VITE_DIGILOCKER_MODE=live`.

---

## 5. Security & Privacy Guarantees

- **PKCE (Proof Key for Code Exchange)**: Live flow uses RFC 7636 PKCE with `S256` code challenges. The cryptographic `code_verifier` is stored temporarily in browser `sessionStorage` and immediately purged upon token exchange.
- **Server-Side Token Exchange**: Frontend communicates with `/api/digilocker/token` and `/api/digilocker/documents`. Client secrets and raw authorization exchanges never execute in client javascript.
- **Aadhaar Privacy Guardrail**: Raw 12-digit Aadhaar numbers are **never stored or logged**. All profile snapshots mask the first 8 digits, retaining only `XXXX XXXX 4821`.
- **Zero Token Persistence**: Access tokens are kept in ephemeral memory and never persisted into browser `localStorage`.
- **Consent Enforcement**: Citizens can select individual documents on the consent screen or click **Deny**, which gracefully terminates the session without storing metadata.
- **Revocation & Disconnection**: Citizens can click **Disconnect DigiLocker** from the Document Vault or Profile modal at any time to purge cached credentials and notify the gateway.
