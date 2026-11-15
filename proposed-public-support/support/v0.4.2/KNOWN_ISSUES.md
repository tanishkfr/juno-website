# Known issues and limitations — Juno v0.4.2 Beta

Release `0.4.2` · 2026-11-11 · Windows 11 x64

This is the current limitation list for **Juno v0.4.2 Beta — Performance &
Polish**. A listed limitation is a known boundary, not a claim that the area is
production-ready.

## Release and installation

1. **Windows 11 x64 only.** Windows 10, macOS, Linux, ARM64 and 32-bit Windows
   are not qualified for this Beta.
2. **Unsigned installer.** The installer has no Authenticode signature. Windows
   may show Unknown Publisher or SmartScreen, and some managed PCs may block
   it. Verify the published SHA-256 before running it. Do not disable Windows
   security controls.
3. **Manual updates.** Juno does not download or run installers. Installation
   and updates are manual for this Beta. The signed automatic-installer upgrade
   path is not qualified.
4. **In-place upgrade only.** Juno uses the same application identity as earlier
   Beta builds. It upgrades an existing installation in place; it does not
   install side by side.
5. **Compact vs full.** The compact installer omits the browser engine and
   Whisper weights; both are optional, verified downloads. The full/offline
   variant includes the browser engine, Whisper model, Android tools and
   cloudflared. External model providers still need internet access.
6. **Disk space.** About 1.05 GB installed for the compact build, about 1.50 GB
   for the full build, plus optional assets, projects and backups.
7. **No clean-room Windows VM for this closure.** The production v0.4.1 →
   v0.4.2 upgrade, rollback and re-upgrade ran on the owner's Windows 11 host
   with a complete verified backup and exact rollback installers. The rebuilt
   full/offline installer was identity-verified and smoke-tested from the same
   qualified source on the isolated test identity; a fresh production-identity
   full NSIS registration was not repeated because no disposable Windows
   profile or VM was available.

## Updates and signing

8. **No Authenticode publisher identity and no SmartScreen reputation.** SHA-256
   proves integrity, not who built the file.
9. **The signed automatic-installer upgrade path is not qualified.** Do not wait
   for an automatic update. Download the installer manually.
10. **Signed metadata is announcement-only.** Juno may check Ed25519-signed
    release metadata and show release notes. `electron-updater` has no live
    automatic-install feed, and Juno never downloads or runs an installer for
    you. The packaged `app-update.yml` uses the reserved host `updates.invalid`.
11. **No general downgrade support.** Running an older installer manually is
    possible, but data written by a newer build may not be understood by the
    older one. Back up local data before rolling back.
12. **Rollback compatibility is bounded.** The public v0.4.1 installer can
    restore v0.4.1 after a backup. Unrestricted rollback compatibility with
    future schema versions is not promised.

## Spending controls

13. **No enforceable workspace-wide spending hard cap.** A hard cap remains
    unenforceable across some external provider routes. Do not treat Juno as an
    absolute spending guarantee.
14. **Boreal internal worker iterations are not all bounded by Juno's
    model-call ceiling.** Juno authorizes and verifies the worker model and
    policy. Boreal's internal loop count is outside Juno's interception.
15. **Unpriced usage remains unknown.** Subscription-backed usage is often
    unpriced and is recorded as unknown, not zero. Unpriced external workers
    under a task ceiling remain refused unless explicitly allowed.

## Provider and network

16. **Provider accounts, subscriptions, quotas and network access are
    required** for external models. Juno does not supply provider capacity.
    Each provider has independent account, subscription, quota and network
    requirements.
17. **Model availability can change independently of Juno.** A provider may
    retire, rename or restrict a model. An explicit stale pin is refused rather
    than silently replaced.
18. **External provider errors are outside Juno's control.** An expired or
    rejected provider credential is reported honestly; Juno does not substitute
    another model or provider silently.

## Capability qualification

19. **Speech acceptance is partial.** Installed speech components and local
    Whisper transcription passed. The bundled Whisper engine transcribed a
    synthetic WAV exactly. **Live microphone recording was not exercised during
    final qualification**, so a human recording and cancellation-cleanup pass
    remain owner acceptance items.
20. **Android device control is hardware-bound.** The Android runtime, pinned
    `adb.exe`, install/verify/remove paths and version probe passed. No physical
    USB device was attached for a live device-control test.
21. **Remote-access tunneling is account-bound.** cloudflared was installed,
    hash- and size-verified and version-probed. No Cloud-authorized public
    tunnel was started, and no public listener was left running.
22. **Computer control was qualified with real observation and bounded input.**
    The final candidate observed the active desktop and performed a safe
    Calculator input. It was not a full multi-application automation suite.
23. **Council is bounded evidence.** Planner, executor and reviewer roles were
    exercised live on the qualified route, with the mandatory reviewer settling
    the parent task. Not every provider or custom role combination was re-run.
24. **Code Mode uses the bundled Boreal/OMP runtime.** It needs provider
    authentication configured there; Juno cannot reuse every desktop provider
    login for it.
25. **No automatic safe idle retirement.** Boreal/OMP and CUA remain resident
    while Juno runs. Juno does not terminate them on an idle timer because
    ownership coverage across runs, terminals, approvals, reviews and sessions
    is not yet sufficient to do so safely.
26. **Screen-reader acceptance is partial.** Keyboard navigation, visible focus,
    contrast, zoom, forced colours and reduced motion were checked. A real
    NVDA/Narrator speech-output session was not completed.
27. **Some inherited surfaces are visible but not qualified for this Beta.**
    Teams, organization, Cloud, mobile pairing, backups and routines exist in
    the codebase from earlier work. Do not treat every visible control as a
    tested public-beta capability.

## Performance

28. **Reply time is provider-bound.** Warm short replies measured about
    2.29–2.92 seconds on the tested route. These are measurements, not
    guarantees, and they do not imply that the underlying models became faster
    or smarter.
29. **The 80.5% token reduction is benchmark-specific.** It comes from the
    matched Phase 1 short-turn benchmark and task-aware tool exposure. It is not
    a universal per-task or per-provider claim.
