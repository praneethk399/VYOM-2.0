# PRD: VYOM Digital Twin AI Enhancements

## Introduction

Enhance the VYOM 3D Aero Propulsion Digital Twin with an advanced AI layer. This includes integrating live telemetry AI analysis, enriching 3D model interaction with real-time stat overlays, improving the predictive maintenance alerts system with actionable insights, and introducing a natural language chat interface for querying engine status.

## Goals

- Provide real-time AI-driven analysis of telemetry data streams.
- Overlay real-time engine statistics interactively on the 3D model.
- Elevate predictive maintenance alerts from simple thresholds to contextual, AI-predicted anomalies.
- Introduce an LLM-powered natural language interface for users to query engine health and telemetry.

## User Stories

### US-001: Live Telemetry AI Analysis Dashboard
**Description:** As an operator, I want an AI dashboard to analyze telemetry streams so that I can immediately identify subtle performance degradations.

**Acceptance Criteria:**
- [ ] Add an AI Analysis panel to the dashboard UI.
- [ ] Integrate a mock or real LLM/AI service to generate insights based on current `FadecTelemetryStep` data.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-002: Real-time Stats on 3D Model Interaction
**Description:** As a technician, I want to click on 3D engine components and see their real-time telemetry stats overlaid directly so that I can visually correlate physical parts with data.

**Acceptance Criteria:**
- [ ] Raycasting on 3D components displays floating tooltip with component-specific telemetry.
- [ ] Stats update in real-time as the simulation runs.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-003: Improved Predictive Maintenance Alerts
**Description:** As a maintenance planner, I want alerts to include predicted time-to-failure and recommended actions so that I can schedule maintenance proactively.

**Acceptance Criteria:**
- [ ] Enhance the existing alert system to display AI-generated maintenance recommendations.
- [ ] Compute mock Prognostics/RUL (Remaining Useful Life) dynamically based on current fault injections.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-004: Natural Language Chat Interface
**Description:** As a system administrator, I want to query the engine status using natural language so that I can quickly extract specific telemetry without navigating complex menus.

**Acceptance Criteria:**
- [ ] Add a chat UI component (e.g., floating chat widget or dedicated tab).
- [ ] Connect chat input to a Gemini AI service to answer questions based on the current engine state context.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Functional Requirements

- FR-1: The system must parse current telemetry data and feed it to the AI analysis module.
- FR-2: The 3D view must support pointer events to identify `EngineComponent` and map it to `TelemetryItem`.
- FR-3: The predictive maintenance system must calculate RUL penalties when fault injections are active.
- FR-4: The chat interface must maintain a sliding window of recent telemetry context to ground the LLM responses.

## Non-Goals

- Full backend cloud integration for telemetry (keep it simulated/local for now).
- Training custom machine learning models (use heuristic simulation or general LLM API).
- Multi-engine fleet management.

## Technical Considerations

- Use `@google/genai` (already in `package.json`) for the natural language chat and AI analysis.
- Extend `ThreeEngineCanvas` for 3D interaction.
- Ensure the React state updates don't degrade 3D rendering performance (use refs or memoization where necessary).

## Success Metrics

- Users can retrieve engine status via chat within 3 seconds.
- 3D framerate remains above 30fps while showing real-time stat overlays.
- Maintenance alerts provide clear, actionable steps instead of just raw values.

## Open Questions

- Should the chat interface be floating or a separate tab?
- How frequently should we poll the AI for telemetry analysis to avoid API rate limits?
