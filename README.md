# Inventory Game ROP

A Streamlit inventory planning game for learning reorder points (ROP), EOQ ordering, lead-time shocks, backlog, fill rate, and inventory cost tradeoffs.

## What the Game Covers

- Slow mover and fast mover inventory scenarios
- Constant lead time and changing lead time versions
- Monthly ROP decisions
- Automatic EOQ purchase orders
- Inventory position logic: stock on hand + on order - backlog
- End-of-scenario performance reports
- Comparison against fixed ROP baselines of 4 and 12

## Run Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the app:

```bash
streamlit run Inventory_game_ROP.py
```
