# Eaton's URL Tools

A light wrapper around assorted URL parsing, matching, and manipulation tools.

- A `ParsedURL` class that uses the `tstld` project to parse out and expose more granular domain elements like the TLD, true subdomain, etc. It also exposes explicit properties representing the filename and file extension of a given URL, if they're present.
- A `NormalizedURL` class that applies globally-configurable normalization rules in addition to basic parsing when an instance is created.
- A collection of granular normalizer functions, and a catch-all default normalizer for the NormalizedURL class that applies common rules.
- Top-level `canParse()`, `parse()`, `normalize()`, `test()`, and `extract()` functions that leverage the aforementioned utilities.

## Future stuff to do

- A nice wrapper around the WHATWG URLPattern standard would be super handy. Puttin' that one on the TODO list.
