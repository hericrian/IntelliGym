# ADR-002: Mobile Platform Decision

Date: 2026-07-22

## Status

Accepted

## Context

The first IntelliGym bootstrap was created with Expo + React Native + TypeScript.
Later product direction requested a more production-oriented foundation, with focus on:

- Android and iOS support
- long-term maintainability
- future AI integrations
- camera-based exercise analysis
- authentication and subscriptions
- scalable code organization

One possible option was to restart the mobile app in Flutter.

## Decision

IntelliGym will continue with Expo + React Native + TypeScript for the mobile client.

## Rationale

This choice gives the best technical cost-benefit at the current stage:

1. The project already has a working React Native baseline, shared TypeScript contracts, CI, and a Python API.
2. Rewriting immediately in Flutter would create schedule cost without solving a current product bottleneck.
3. Expo and the React Native ecosystem are mature enough for camera, auth, payments, notifications, and AI-assisted UX.
4. TypeScript improves consistency across mobile, backend contracts, validation helpers, and future tooling.
5. The current team environment does not yet have Flutter installed or validated, which would slow delivery before product assumptions are tested.

## Consequences

- The mobile app should be organized with clear app, domain, data, feature, and UI layers.
- Product behavior should rely on deterministic safety rules before future AI-generated adjustments are accepted.
- New native capabilities should be introduced incrementally, only when their platform requirements are validated.
- If future product constraints prove React Native insufficient, migration can be revisited with concrete evidence rather than assumption.
