# Payout Market — How to use

This is a **reverse-store** intake system:
- Sellers submit an **offer** (what they want to sell + price + payout wallet).
- You (admin) review it.
- If you accept, you **pay manually** from your own wallet (Option A) and paste the tx hash.

## Links (tunnel)
The tunnel URL changes when restarted. Check `README_TUNNEL.md` or ask Jarvis for the current link.

## Seller flow
1) Open the main page
2) Fill:
   - Category / Game (optional)
   - Item / service
   - Amount
   - Price (USD)
   - Payout chain: **Solana** or **Ethereum**
   - Payout address
3) Tap **Submit offer**
4) You’ll see an **Offer ID**. (Seller can send it to you as a reference.)

## Admin flow
Open:
`/admin?token=<ADMIN_TOKEN>`

On the admin page:
- Tap **Load offers** to refresh.
- Each offer shows:
  - payout chain + payout address
  - status
  - price
- Change **Status**:
  - submitted → accepted (you intend to pay)
  - accepted → paid (after you paid)
  - rejected (not paying)
- Paste **Tx hash** after you pay.

### Manual payout checklist (Option A)
For each accepted offer:
1) Copy payout address
2) Send payout from your wallet (Solana/Ethereum)
3) Copy transaction hash
4) Paste tx hash in admin
5) Set status to **paid**

## Data storage
Offers are stored locally on the laptop in:
- `data/offers.json` (primary)

This means:
- If the laptop shuts down, the tunnel dies.
- For real production, deploy to a server and use a real database.
