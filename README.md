# CQU-Science-Site
Science and principle of technology in our side.

## Database Part
Chooise Monogdb, the database name is `science-in-our-side`.

Two collections:
+ `catalog` contains the _chapters_ and theirs _sections_ of this book
+ `content` contains every sections detail, such as: _section_title_ and _section_content_

Collections' detail:
    
`catalog`
``` json
{
  "chapter_id": "0",  // use to locate
  "chapter_tilte": "first chapter",
  "sections": [
    { "section_id": "0.0", "section_title": "first section of chapter 0" },
    { "section_id": "0.1", "section_title": "second section of chapter 0" },
    ...
  ]
}
{
  "chapter_id": "1",  // use to locate
  "chapter_tilte": "second chapter",
  "sections": [
    { "section_id": "1.0", "section_title": "first section of chapter 1" },
    { "section_id": "1.1", "section_title": "second section of chapter 1" },
    ...
  ]
}
...
```

`content`
``` json
{
  "section_id": "0.0",  // use to locate
  "section_title": "first section of chapter 0",
  "section_content": ["some text", "or img", "or vidio", ...]
}
{
  "section_id": "0.1",  // use to locate
  "section_title": "second section of chapter 0",
  "section_content": ["some text", "or img", "or vidio", ...]
}
...
```