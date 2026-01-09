## [1.7.0](https://github.com/dreamiurg/claude-session-topics/compare/v1.6.0...v1.7.0) (2026-01-09)

### Features

* increase context depth for better topic accuracy ([#33](https://github.com/dreamiurg/claude-session-topics/issues/33)) ([a9fb75b](https://github.com/dreamiurg/claude-session-topics/commit/a9fb75b))

### Bug Fixes

* auto-discover session ID from recent state files ([#32](https://github.com/dreamiurg/claude-session-topics/issues/32)) ([70e1d3c](https://github.com/dreamiurg/claude-session-topics/commit/70e1d3c))
* use rough age estimates instead of precise counts ([#34](https://github.com/dreamiurg/claude-session-topics/issues/34)) ([0da01b5](https://github.com/dreamiurg/claude-session-topics/commit/0da01b5))

## [1.6.0](https://github.com/dreamiurg/claude-session-topics/compare/v1.5.4...v1.6.0) (2026-01-09)

### Features

* add regenerate-topic command for on-demand topic generation ([#28](https://github.com/dreamiurg/claude-session-topics/issues/28)) ([be5fb6c](https://github.com/dreamiurg/claude-session-topics/commit/be5fb6c))

## [1.2.0](https://github.com/dreamiurg/claude-session-topics/compare/v1.1.0...v1.2.0) (2026-01-09)

### Features

* add setup-statusline command for easy status line configuration ([33985de](https://github.com/dreamiurg/claude-session-topics/commit/33985de14995bbff7e2bb83c9a661ae760d6e222))
* improve setup-statusline to be interactive and respect existing config ([085e69e](https://github.com/dreamiurg/claude-session-topics/commit/085e69ea71a18f19cd82db51134456a9b69ad0cc))

## [1.5.4](https://github.com/dreamiurg/claude-session-topics/compare/v1.5.3...v1.5.4) (2026-01-09)


### Bug Fixes

* support ccstatusline stdin JSON for session ID ([#25](https://github.com/dreamiurg/claude-session-topics/issues/25)) ([b1390f3](https://github.com/dreamiurg/claude-session-topics/commit/b1390f356f4bd890befc4bb1423983b5127f8430))

## [1.5.3](https://github.com/dreamiurg/claude-session-topics/compare/v1.5.2...v1.5.3) (2026-01-09)


### Bug Fixes

* show placeholder topic immediately for new sessions ([#23](https://github.com/dreamiurg/claude-session-topics/issues/23)) ([02c58b1](https://github.com/dreamiurg/claude-session-topics/commit/02c58b1595c0f51ec53d048c4cd0c79059244401))

## [1.5.2](https://github.com/dreamiurg/claude-session-topics/compare/v1.5.1...v1.5.2) (2026-01-09)


### Bug Fixes

* setup command now configures ccstatusline instead of replacing statusLine ([#21](https://github.com/dreamiurg/claude-session-topics/issues/21)) ([ba63e8f](https://github.com/dreamiurg/claude-session-topics/commit/ba63e8f414f070265531bbfc83e1aac4aa11db50))

## [1.5.1](https://github.com/dreamiurg/claude-session-topics/compare/v1.5.0...v1.5.1) (2026-01-09)


### Bug Fixes

* use jsonpath for marketplace.json version updates ([#18](https://github.com/dreamiurg/claude-session-topics/issues/18)) ([4c00f17](https://github.com/dreamiurg/claude-session-topics/commit/4c00f1712be690c2e1386dce80407e2b6ec43e2e))

## [1.4.0](https://github.com/dreamiurg/claude-session-topics/compare/v1.3.0...v1.4.0) (2026-01-09)


### Features

* add auto-install hooks for zero-config setup ([c24398a](https://github.com/dreamiurg/claude-session-topics/commit/c24398aa9fec5663670503626264aa9f8625f0df))
* add setup-statusline command for easy status line configuration ([33985de](https://github.com/dreamiurg/claude-session-topics/commit/33985de14995bbff7e2bb83c9a661ae760d6e222))
* improve setup-statusline to be interactive and respect existing config ([085e69e](https://github.com/dreamiurg/claude-session-topics/commit/085e69ea71a18f19cd82db51134456a9b69ad0cc))
* improve setup-statusline to prioritize integration over replacement ([4159dbd](https://github.com/dreamiurg/claude-session-topics/commit/4159dbda763d55b3467a9fdd9e6640b2f4b6ebef))
* initial release of claude-session-topics plugin ([ea8e602](https://github.com/dreamiurg/claude-session-topics/commit/ea8e6028dfe5bffcf77da09b92b066546816cdd0))


### Bug Fixes

* address code quality and documentation issues from review ([#3](https://github.com/dreamiurg/claude-session-topics/issues/3)) ([5ae1f51](https://github.com/dreamiurg/claude-session-topics/commit/5ae1f51744173ad186f2f8577c3d64b2bad0351b))
* address second review round findings ([#4](https://github.com/dreamiurg/claude-session-topics/issues/4)) ([e2cca15](https://github.com/dreamiurg/claude-session-topics/commit/e2cca157ef83069f9645c44e2cf79099333b73ca))
* correct plugin installation commands in README ([#6](https://github.com/dreamiurg/claude-session-topics/issues/6)) ([75d155c](https://github.com/dreamiurg/claude-session-topics/commit/75d155c64ea9f80a7963bd91955ffcf733b3bd88))
* disable MD060 table alignment rule ([#2](https://github.com/dreamiurg/claude-session-topics/issues/2)) ([4ccd2a1](https://github.com/dreamiurg/claude-session-topics/commit/4ccd2a14de1705d0e80617990dd593d8ddb9dfd0))
* markdown linting issues in setup-statusline command ([1aaac93](https://github.com/dreamiurg/claude-session-topics/commit/1aaac934306f38353474c634b40564669b3e976f))
* remove detect-secrets hook (gitleaks is sufficient) ([#1](https://github.com/dreamiurg/claude-session-topics/issues/1)) ([3c7700f](https://github.com/dreamiurg/claude-session-topics/commit/3c7700f1c2bceb6e5c775d749e13667b9f1bf569))

## [1.3.0](https://github.com/dreamiurg/claude-session-topics/compare/claude-session-topics-v1.2.0...claude-session-topics-v1.3.0) (2026-01-09)


### Features

* add auto-install hooks for zero-config setup ([c24398a](https://github.com/dreamiurg/claude-session-topics/commit/c24398aa9fec5663670503626264aa9f8625f0df))
* add setup-statusline command for easy status line configuration ([33985de](https://github.com/dreamiurg/claude-session-topics/commit/33985de14995bbff7e2bb83c9a661ae760d6e222))
* improve setup-statusline to be interactive and respect existing config ([085e69e](https://github.com/dreamiurg/claude-session-topics/commit/085e69ea71a18f19cd82db51134456a9b69ad0cc))
* improve setup-statusline to prioritize integration over replacement ([4159dbd](https://github.com/dreamiurg/claude-session-topics/commit/4159dbda763d55b3467a9fdd9e6640b2f4b6ebef))
* initial release of claude-session-topics plugin ([ea8e602](https://github.com/dreamiurg/claude-session-topics/commit/ea8e6028dfe5bffcf77da09b92b066546816cdd0))


### Bug Fixes

* address code quality and documentation issues from review ([#3](https://github.com/dreamiurg/claude-session-topics/issues/3)) ([5ae1f51](https://github.com/dreamiurg/claude-session-topics/commit/5ae1f51744173ad186f2f8577c3d64b2bad0351b))
* address second review round findings ([#4](https://github.com/dreamiurg/claude-session-topics/issues/4)) ([e2cca15](https://github.com/dreamiurg/claude-session-topics/commit/e2cca157ef83069f9645c44e2cf79099333b73ca))
* correct plugin installation commands in README ([#6](https://github.com/dreamiurg/claude-session-topics/issues/6)) ([75d155c](https://github.com/dreamiurg/claude-session-topics/commit/75d155c64ea9f80a7963bd91955ffcf733b3bd88))
* disable MD060 table alignment rule ([#2](https://github.com/dreamiurg/claude-session-topics/issues/2)) ([4ccd2a1](https://github.com/dreamiurg/claude-session-topics/commit/4ccd2a14de1705d0e80617990dd593d8ddb9dfd0))
* markdown linting issues in setup-statusline command ([1aaac93](https://github.com/dreamiurg/claude-session-topics/commit/1aaac934306f38353474c634b40564669b3e976f))
* remove detect-secrets hook (gitleaks is sufficient) ([#1](https://github.com/dreamiurg/claude-session-topics/issues/1)) ([3c7700f](https://github.com/dreamiurg/claude-session-topics/commit/3c7700f1c2bceb6e5c775d749e13667b9f1bf569))

## [1.1.0](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.5...v1.1.0) (2026-01-09)

### Features

* add auto-install hooks for zero-config setup ([c24398a](https://github.com/dreamiurg/claude-session-topics/commit/c24398aa9fec5663670503626264aa9f8625f0df))

## [1.0.5](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.4...v1.0.5) (2026-01-09)

### Bug Fixes

* correct plugin installation commands in README ([#6](https://github.com/dreamiurg/claude-session-topics/issues/6)) ([75d155c](https://github.com/dreamiurg/claude-session-topics/commit/75d155c64ea9f80a7963bd91955ffcf733b3bd88))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.3...v1.0.4) (2026-01-09)

### Bug Fixes

* address second review round findings ([#4](https://github.com/dreamiurg/claude-session-topics/issues/4)) ([e2cca15](https://github.com/dreamiurg/claude-session-topics/commit/e2cca157ef83069f9645c44e2cf79099333b73ca))

## [1.0.3](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.2...v1.0.3) (2026-01-09)

### Bug Fixes

* address code quality and documentation issues from review ([#3](https://github.com/dreamiurg/claude-session-topics/issues/3)) ([5ae1f51](https://github.com/dreamiurg/claude-session-topics/commit/5ae1f51744173ad186f2f8577c3d64b2bad0351b))

## [1.0.2](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.1...v1.0.2) (2026-01-09)

### Bug Fixes

* disable MD060 table alignment rule ([#2](https://github.com/dreamiurg/claude-session-topics/issues/2)) ([4ccd2a1](https://github.com/dreamiurg/claude-session-topics/commit/4ccd2a14de1705d0e80617990dd593d8ddb9dfd0))

## [1.0.1](https://github.com/dreamiurg/claude-session-topics/compare/v1.0.0...v1.0.1) (2026-01-09)

### Bug Fixes

* remove detect-secrets hook (gitleaks is sufficient) ([#1](https://github.com/dreamiurg/claude-session-topics/issues/1)) ([3c7700f](https://github.com/dreamiurg/claude-session-topics/commit/3c7700f1c2bceb6e5c775d749e13667b9f1bf569))

## 1.0.0 (2026-01-09)

### Features

* initial release of claude-session-topics plugin ([ea8e602](https://github.com/dreamiurg/claude-session-topics/commit/ea8e6028dfe5bffcf77da09b92b066546816cdd0))
