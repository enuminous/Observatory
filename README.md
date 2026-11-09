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


## UNITY-001 Phase 1 source-provenance addendum — 9 November 2026

The [published Phase 1 report](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-1/PHASE1_REPORT.md) freezes all four priority repository commits and 209 Git-tracked blob objects. Three additional original upstream commits are pinned; 4/4 archived upstream blob IDs match, 585/585 FieldSpace source statements match their original lines, and all 102 canonical formula blocks match across archival representations. The [full 717-record extraction ledger](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-1/source-equations.csv) preserves source statements and candidate-audit statuses separately.

**Versioning rule:** these provenance observations postdate the original 8 November MOC-001 static snapshot. Its five PASS and 35 UNRESOLVED *structural* findings have **not** been recomputed or silently promoted. The broader all-sector source-pinning obligation, independently replayed proofs, typed compilation, and physical unification remain open.

## UNITY-001 Phase 2 typed-compiler addendum — 9 November 2026

The [Phase 2 executed report](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-2/PHASE2_REPORT.md) documents a conservative source-linked typed-AST compiler: **9/9 declared interpretations pass**, **708/717 original source records remain uncompiled**, **eight scientific conflicts remain unresolved**, and **20 adversarial software tests passed** in [GitHub CI](https://github.com/enuminous/papers/actions/runs/42619525163). These checks are about source anchors, manually declared dimensions and mathematical shapes, not independently proved equations or physical validation. No original MOC-001 scorecard finding was rewritten.

## UNITY-001 Phase 3 correspondence addendum — 9 November 2026

[The executed Phase 3 report](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-3/PHASE3_REPORT.md) documents a limited algebraic correspondence of the C1 action to a conventional Einstein–Maxwell bulk action **only after setting all extra fields and pair/triple couplings to zero**. Its comparison with the SM is restricted to an Abelian gauge kinetic expression under opposite metric-signature conventions and retains the Higgs vacuum-energy offset. Geometry component algebra shows source-only non-identifiability of (T+κI) when (T) is unrestricted; separately fixed matter breaks that ambiguity in constructed controls.

**Denominator:** 3 PASS, 2 explicit-counterexample FAIL, 3 UNRESOLVED across eight bounded Phase 3 findings. **27/27 software tests** passed in [GitHub CI](https://github.com/enuminous/papers/actions/runs/42622880582). **Zero EFMW-specific physical PASS**, no full Standard Model mapping or coupled Einstein–Maxwell PDE proof. The original four broad Observatory interfaces remain unresolved. Earlier MOC-001, Phase 1 and Phase 2 metrics are untouched.

## UNITY-001 Phase 4 dynamical-consistency addendum — 9 November 2026

The [published Phase 4 executed report](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-4/PHASE4_REPORT.md) and [unchanged exact-rational checker](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-4/dynamics.py) document **4/12 bounded PASS, 3/12 explicit-counterexample FAIL and 5/12 UNRESOLVED**. The passing results concern conventional flat-space Abelian Maxwell identities and a conditional 1+1-dimensional manufactured WITD energy balance; they are **not** EFMW-specific physical confirmations. The three failures are an allowed unstable C1 cubic scalar potential, a nonconserved unconstrained neutral-scalar current, and the inability of one constant coefficient to equate the displayed WITD tensor component with smooth storage energy for all examined states.

**Execution:** [29/29 software tests, successful GitHub CI](https://github.com/enuminous/papers/actions/runs/42626896120). **Zero EFMW-specific physical PASS.** Full curved Einstein–gauge–scalar dynamics, covariant informational stress, quantum/causal consistency, independent experimental evidence and physical Unity remain **UNRESOLVED**. This addendum retrospectively indexes already executed Phase 4 work; it does not rerun the checker, change original MOC-001 metrics, resolve the eight prior Phase 2 conflicts, or alter Phase 5's confirmatory **NOT READY** decision.

## UNITY-001 Phase 5 synthetic identifiability screen — 9 November 2026

The [executed Phase 5 audit](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-5/PHASE5_REPORT.md) and [pre-execution frozen simulation protocol](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-5/PROTOCOL.json) examine a hypothetical informational gravitational source. They report **4/11 bounded PASS, 1/11 counterexample FAIL, 6/11 UNRESOLVED**, with **25/25 Python tests passed** in [CI](https://github.com/enuminous/papers/actions/runs/42633977283). The signal is exactly confounded by an unconstrained conventional co-located mass profile; nearly confounded alternatives worsen hypothetical sensitivity by **567.2×**. These are deliberately dimensionless synthetic scenarios—not real observations, EFMW-specific predictions or empirical significance.

**Physical disposition: NOT READY FOR CONFIRMATORY PHYSICAL PREDICTION.** The original MOC-001 5/40 scorecard, four unresolved bridge sockets and prior phase results are preserved unchanged.
