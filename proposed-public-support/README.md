# Proposed public support publication — not applied

These files are staged only in the website repository. Do not copy them into juno-beta until DeepSeek has completed release preparation and the owner has approved the public wording. No draft release or public support document has been modified. The v0.5 list is deliberately partial: three confirmed general limitations, with no machine-specific/private findings. Reconcile it against the final corrected build before approval.

## One-time migration

1. Preserve the existing published v0.4.2 KNOWN_ISSUES.md at support/v0.4.2/KNOWN_ISSUES.md. The proposed snapshot comes from the public repository, not a private report.
2. Review the proposed v0.5 issue records and public guides. Remove the PROPOSED notices only after approval, and confirm their wording against the final build. Add any other approved release-specific issues.
3. Commit the versioned files and support/index.json to the public repository after release preparation. Change approved to true only for approved public support material. The website additionally requires that the referenced GitHub release be published, so an approved document for an unpublished draft cannot become public website support.

## Data contract

The manifest has schemaVersion: 1 and versions[]. Each record has releaseTag, approved, issuesPath, and optional documents.install/privacy/feedback paths. Paths are restricted to public support/*.json or *.md (or the four root support filenames); traversal, external URLs and encoded paths are refused. A version must match a published public release.

An issue JSON document has schemaVersion: 1, releaseTag and issues[]. Each issue has a stable id, title, description and explicit affectedVersions. Optional fields are status (open, limitation, resolved), workaround, severity (low, medium, high, critical), fixedIn and resolvedAt (ISO date). Supply optional values only when known and approved. Description and workaround are safely rendered Markdown; HTML is sanitized and unsafe elements/attributes are removed. Do not include internal paths, credentials, personal profile findings or unapproved engineering reports.

When resolving an issue, retain its id and record with status: resolved; add fixedIn/resolvedAt only with supporting evidence. The website removes it from the default active list but retains it under Resolved issues. Older version records and release notes stay intact. Do not silently repurpose an old issue record for a new version.

Normal changes in the public repository are fetched without a website edit or deployment, with five-minute caches plus GitHub’s own public-content cache. A cached successful document may be retained up to 24 hours during an outage and is visibly labelled stale. If there is no safe cache, the UI reports unavailability.

## Legacy fallback

Until the manifest exists, the public root KNOWN_ISSUES.md is read directly. Its own declared version is matched exactly to a published release. It is never assumed to describe a newer release. Other public root guides retain their declared version and are labelled historical when they differ.
