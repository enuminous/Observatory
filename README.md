# Observe Unity

**An interactive, evidence-bounded research observatory for the MOC-001 Master Ontology Compiler.**

> Scientific status: **UNRESOLVED**. Observe Unity is neither a completed Theory of Everything nor experimental validation of EFMW. All advertised PASS results are limited structural/compiler checks.

Research: Matthew Chenoweth Wright / Monolithic LLC · Original snapshot: 8 November 2026.

## Website and deployment

**Intended Pages URL:** https://enuminous.github.io/Observatory/

The repository is public, but the website will not be publicly served until GitHub Pages is enabled and a deployment succeeds. The included workflow deploys after running static tests. For an empty/new repository, visit [Settings → Pages](https://github.com/enuminous/Observatory/settings/pages) and set the build source to **GitHub Actions**, then run or rerun the deployment workflow. The default GitHub Actions token cannot create repository Pages settings.

To preview locally:

~~~bash
python3 -m http.server 8000
# http://localhost:8000/
~~~

The site needs no package installation, external JavaScript, login, fonts, API keys or analytics. Use HTTP, not `file://`, because the data is loaded with `fetch`.

## Contents

- Searchable ontology atlas: 22 registered sectors, evidence classes, accessible detail dialogs.
- Equation index: 22 records, 4 dimension-compatible examples, exportable CSV.
- Typed quantity registry: 17 quantities with SI dimensions.
- Selectable diagram of 4 **unresolved** ontology interfaces. It is a schematic, not a proof graph.
- 40 finding ledger with outcome filters, 9 unresolved research obligations, and 12 source entries.
- Scientific status dashboard: **5 / 40 gate findings PASS**; **4 / 22 equation records** have dimensional PASS (2 established reference examples, 2 illustrative expressions), plus 1 registry PASS; **0 EFMW-specific PASS**, 0 FAIL and 35 UNRESOLVED.
- Unity conditions U1–U3, canonical paper and Unity appendix links.
- Downloadable browser snapshot in `data/catalog.json` and source/provenance notes.
- Responsive, keyboard-accessible static HTML/CSS/JavaScript; no external runtime dependencies.

## Claim scope

| Observed in local MOC-001 scaffold | Result | Limitation |
|---|---|---|
| Python unit tests | 16/16 PASS | Local software checks; not a physical result |
| Static compiler findings | 5 / 40 PASS | Four SI-dimensional agreements (2 established reference, 2 illustrative) and one registry check; 0 EFMW-specific PASS |
| Static FAIL | 0 | Zero only for the checks executed |
| Equation records | 4 / 22 dimensional PASS | 18 other equation records UNRESOLVED; none of these four is an EFMW-specific physical validation |
| UNRESOLVED | 35 | 18 equation checks, 4 bridges, 9 obligations, 4 source pins |
| Lean kernel replay | Not executed | No formal theorem replay claimed |
| Upstream original source equations | Not fully imported | Current browser registry is a curated snapshot |
| External physical experiment | None | No unified physical mechanism established |

**Next required action is `ob_pin_sources` (priority 01):** freeze exact commits and original file hashes before importing equations or resolving interfaces. The queue opens on this obligation.

The four README-inspected sources are Geometry, Information-Tensor, EFMW-Lagrangian, and Standard-Model-Reduction. The other eight source URLs are queued, not ingested. No source commit is frozen in this browser snapshot.

## Primary research

- [MOC-001 research paper](https://github.com/enuminous/papers/blob/main/MOC-001-Compiling-Ontologies-Toward-Testable-Unity-of-Physics-2026-11-08.md)
- [Canonical Unity appendix](https://github.com/enuminous/papers/blob/main/research/moc-001/UNITY_APPENDIX.md)
- [Local Unity primer](UNITY.md)
- [Scientific boundaries](SCIENTIFIC_BOUNDARIES.md)

## Verification

~~~bash
node --check assets/app.js
node --test tests/site.test.mjs
python3 -m http.server 8000
~~~

GitHub Actions checks syntax and data invariants before attempting deployment. The site supports relative paths for both the root and the `/Observatory/` Pages prefix.

## Publication and reuse

AI-assisted implementation. Publication of this research site does not imply peer review or transfer ownership of the upstream scientific work. No new open-source redistribution license is asserted here.
