# Well this is awkward.

One day we might have tests here, but the bouncy-ball site is pretty simple right now. So lets just collect a list of functionality that would benefit from test coverage, and if the list gets long enough, we'll actually set up some test infrastructure. 😅

*URL hash update functionality:*
  - When the page is first loaded without a hash:
    - Keep the default selected item.
    - Don't update the URL.
  - When the page is first loaded with a hash:
    - DON'T keep the default selected item (preselect the item based on what's in the hash).
    - Don't update the URL.
  - For additional selections on the page (after initial page load):
    - DO update the URL.
