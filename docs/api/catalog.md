
Catalog API
===========

`GET|POST /<dataSourceType>/[?…]`
---------------------------------

Provide search results for the criteria given as query arguments.

* If the POST method is used, a form-encoded body is expected.
* If an argument is provided in the query string and the body,
  the value from the body will win, even if it is an empty string.


### Path components

* `<dataSourceType>`: Which data provider module can access the catalog.
  Supported values:
  * `memcat`: Holds the data in memory.
  * `proxycat`: Delegates the search effort to another server.


### Query arguments

* `c`: Catalog ID. Required.
* `s`: Search keyword(s), separated by whitespace.
  Behavior for multiple keywords is "and", i.e. entries must include all words.
* `n`: Number of results to deliver.
  May be ignored if unsupported.
* `o`: Offset: How many results to omit from the top of the list.
  May be ignored if unsupported.


### Success response

A JSON body that is a list.
The first list item is metadata, the remainder are the catalog items.
Usual metadata fields:

* `subject`: Meta data about the catalog itself.
* `nFound`: How many catalog items were found, i.e. match the criteria.
  In catalogs that support pagination, this number may exceed the amount
  of results reported in this reply.
* `nTotal`: How many catalog items have been considered.
* `offset`: How many results have been omitted from the top of the list.
  If a number, it indicates that the catalog supports pagination.

Each catalog item usually contains at least these keys:

* `dc:title`: Human-readable name.
* `dc:identifier`: URI.




