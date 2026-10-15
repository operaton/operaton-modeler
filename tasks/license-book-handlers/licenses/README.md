# Supplemental license sources

These files reproduce the upstream license texts omitted from the published npm packages. Source revisions are the `gitHead` values published in the npm metadata for the installed versions.

| Package | Published revision | Official license source |
| --- | --- | --- |
| `formik@2.4.9` | `91475adbf33579561e580eceea0c031f4ec2e992` | [LICENSE](https://github.com/jaredpalmer/formik/blob/91475adbf33579561e580eceea0c031f4ec2e992/LICENSE) |
| `@nodable/entities@3.0.0` | `d2070d76a8ba07e6c7fa142caeb51ffd756e47eb` | [LICENSE](https://github.com/nodable/val-parsers/blob/d2070d76a8ba07e6c7fa142caeb51ffd756e47eb/LICENSE) |

Recheck these sources when upgrading the corresponding packages. The generator removes trailing horizontal whitespace from the output without changing the license wording.

`@sentry/server-utils@10.76.2` declares MIT and depends on exactly `@sentry/core@10.76.2` from the same Sentry JavaScript monorepo. Its override uses the MIT license shipped in that installed dependency. `dmn-js-boxed-expression` uses its own installed `LICENSE` file and the same bpmn.io license classification as the other DMN modules.

The published revisions of `@bpmn-io/semver-compat@0.1.0` and `bpmn-js-copy-as-image@0.4.1` declare MIT in their package metadata and README, but do not contain a license text. Their existing warnings remain visible rather than supplying an inferred copyright notice.
