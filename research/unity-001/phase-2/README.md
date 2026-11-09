# UNITY-001 — Phase 2: source-attested typed equation compilation

**Date:** 2026-11-09 · **Status:** BOUNDED STATIC TYPECHECK PASS; COMPLETE MATHEMATICAL COMPILATION UNRESOLVED

This directory is the executable companion to the [Phase 1 frozen source ledger](https://github.com/enuminous/papers/blob/main/research/unity-001/phase-1/README.md). It uses the *exact* Phase 1 ledger and source-lock files, pinned by Git blob IDs. It never silently edits original equation strings, infers a physical law from a compatible type, or claims that the source's candidate correction is equivalent to its historical form.

## Run and reproduce

Requires Node 22+ (no third-party dependencies).

~~~sh
node research/unity-001/phase-2/compiler.mjs --write
node research/unity-001/phase-2/compiler.mjs --check
node --test research/unity-001/phase-2/tests/compilation.test.mjs
~~~

Generated outputs (included in the deployed GitHub Pages artifact and regenerated locally, not necessarily committed to Git):
- [typed-registry.json](compiled/typed-registry.json)
- [compile-report.json](compiled/compile-report.json)
- [conflicts.json](compiled/conflicts.json)
- [type-usage-graph.json](compiled/type-usage-graph.json)

## Coverage and what a PASS means

- **717/717** preserved, pinned source records ingested as source-backed entries.
- **14/717** have strictly source-matched, manually curated AST representations and *static* shape/dimension checks.
- **703/717** stay **UNRESOLVED / unparsed**, not silently normalized or discarded.
- **10 conflicts or nontrivial convention bridges** are registered, none adjudicated by this compiler.
- **0 Lean theorems freshly proved**; **0 experimentally validated EFMW-specific predictions**.

These figures are *new Phase 2 source-translation counts*. They do **not** replace the historical MOC-001 5/40 structural snapshot or the 4/22 illustrative equation dimensions.

Source lifts are **manual AST skeletons**, checked for source-string identity, tensor rank and declared units. They do *not* parse arbitrary mathematical notation, prove conservation, solve GR+SM, establish physical existence or certify Lean proofs. All lifted physical statuses remain UNRESOLVED, including C1 and EFMW candidates.

The input lock uses Git SHA-1 *blob-object* IDs to authenticate exact bytes; it does not claim fresh SHA-256 digests of all original upstream sources. The original upstream source commits and archived transcriptions were addressed in Phase 1.

## Scientific safeguards

1. Identical Greek letters in different sources are namespaced; the wave-field phi and the golden-ratio phi are intentionally distinct.
2. Incompatible metric signatures remain explicit; the C1 and classical SM sectors are not automatically joined.
3. The WITD residual named R_ab is **not** Ricci curvature.
4. Tensor multiplication is rejected unless it is scalar–tensor. No implicit contraction is invented.
5. The C1 scalar wave operator is represented in one curated AST only by a dimension-equivalent second-derivative *proxy*. This is not mathematical equality to its covariant operator.
6. The C1 source audit's literal FAIL_SIGN and gauge-current problems are retained unchanged, even if a simplified AST is type-compatible.
7. No mass/field dimensions are calibrated across unrelated physical domains. WITD's Q dimension is abstract.
8. Immutable origin paths and original statements remain inspectable in the 717-row input.

## Proposed next step

Extend the parser to explicit indexed/tensor notation with rigorous source-to-AST proof obligations. Ask independent reviewers to adjudicate the 14 templates before any external claim of formal equivalence. Import equations iteratively and compare precise, limited physical reduction maps. Source pinning has been completed for the priority corpus, but *all 22 ontologies* and their true interfaces are not closed.

**UNITY status remains UNRESOLVED.**
