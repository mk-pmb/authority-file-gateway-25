

Definitions
-----------

In other API docs, unless they say otherwise, these definitions apply:

* __Whitespace__ is `[\r\n \t]+`, i.e. any combination of
  U+0009 character tabulation, U+000A line feed,
  U+000D carriage return (cr), and/or U+0020 space.



Error reply
-----------

Errors are reported via HTTP status code, and/or the JSON body
having a non-empty string as the top-level `error` property.
If details are available, they are sent as the top-level `details` property.


