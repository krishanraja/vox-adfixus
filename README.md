# vox-adfixus — RETIRED ⚰️

**This repository has been retired and is no longer maintained.** Please archive
it (make it read-only) on GitHub.

## Why

`vox-adfixus` was originally built as an extension of the AdFixus ID Simulator to
model a single customer engagement (Vox Media). In the process it became the most
mathematically robust of the AdFixus tools — a full three-benefit ROI engine (ID
Infrastructure, CAPI, Media Performance) with risk scenarios, business-readiness
modelling, ROI, and commercial deal modelling.

During the consolidation/handover, **all of that intelligence was generalized and
migrated into the shared "AdFixus core"** that now lives in the three surviving
repositories, with the Vox-Media-specific data (real domains, that customer's
negotiated pricing, that customer's December-2024 browser mix) stripped out. There
is nothing left to take from here — it is already in the tools below.

## Where the work lives now

| Repo | Purpose |
|------|---------|
| **adfixus-id-simulator** | Public lead magnet — ID durability benefits |
| **adfixus-capi-calculator** | Public lead magnet — CAPI (Conversions API) benefits |
| **adfixus-sales** | Internal — target-business intelligence + full proposal engine |

The canonical design system, calculation engine (formulas + assumptions), golden
values, embedding protocol, and adapters are documented in
**`docs/ADFIXUS_CORE_SPEC.md`**, which is vendored identically into each of the
three repos above. The generalized engine is verified against golden values that
were derived from this repo's original math.

## Do not

- Do not resurrect or develop this repo.
- Do not copy code from here into the live tools — use the shared `src/core/`
  instead (it is the generalized, de-Vox'd version of this repo's engine).

The original source and the rich `docs/` folder remain in git history for
reference only.
