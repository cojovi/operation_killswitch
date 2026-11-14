# Showcase verification

Date: **November 14, 2026**. Application baseline: `5885f251f6e0dd1c1e2ac85a7146de3073416d72`.

## Checks performed

| Check | Result |
| :--- | :--- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed |
| `npx tsc -b --pretty false` | Passed; checks the referenced application and tooling projects |
| `npx tsc -p docs/tsconfig.preview.json --pretty false` | Passed; explicitly includes the documentation preview |
| `npm run lint` | Exit 0; one existing `react-refresh/only-export-components` warning at `src/components/Countdown.tsx:8` |
| `npm run build` | Passed; TypeScript command and Vite production bundle |
| Console preview | Real components rendered against fictional fixtures with inert controls and loopback-only placeholder configuration |

The root build script uses `tsc && vite build`. The separate `tsc -b` invocation matters because the root TypeScript configuration uses project references. The preview has its own check because it is outside the normal application include path.

There is no `npm test` script or automated regression suite in this revision. The frontend checks do not execute the Deno functions, apply migrations, test RLS, verify deployed configuration, invoke cron, send mail, or establish recipient delivery. The existing network security probe was not run.

The README was also reviewed in a browser at desktop and 390-pixel mobile widths. All seven images loaded; the mobile cover selected correctly and reduced-motion emulation selected its still variant. Local documentation links were checked for missing files, and all SVGs parsed successfully.

## Change scope

Original amber/graphite SVG art; new README; engineering and operations documentation; a development-only disconnected console preview; a screenshot containing fictional sample metadata. Application components, API handlers, database migrations, and scheduler behavior are unchanged.

The published README makes no uptime, user-count, benchmark, exactly-once delivery, or security-certification claim. Remaining concurrency and retry work is documented in [ENGINEERING.md](ENGINEERING.md#delivery-and-concurrency).

## Asset notes

The mechanical switch and diagrams are original vector artwork. The cover has desktop/mobile layouts, still alternatives, and reduced-motion handling. Font notices are retained in [`FONT-LICENSES.txt`](../readme-assets/FONT-LICENSES.txt). The console capture is from the local documentation fixture, not a live account.
