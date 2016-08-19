# Quest Design Utilities

## High-level Spec

See [quest_spec.md](quest_spec.md).

## Markdown to XML Conversion Script

To build an individual quest from a markdown file:

```shell
node markdown/export.js src/infile.md build/outfile.md
```

## Quest XML Schema

The `quest_schema.xml` file contains an XML schema for the quest design language (QDL).

One program for validating xml files is called `xmllint` and may be downloaded on ubuntu via:

```shell
sudo apt-get install libxml2-utils
```

To validate your XML file against the schema using xmllint, run:

```shell
xmllint --noout --noblanks --schema quest_schema.xml oust_albanus.xml
```

