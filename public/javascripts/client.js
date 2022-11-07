(() => {
  'use strict'
  feather.replace()
})()

const filterOptions = (needle, optionItems) => {
  let pat = new RegExp(needle, 'i');
  for (let i = 0; i < optionItems.length; i++) {
    var item = optionItems[i];
    if (pat.test(item.innerText)) {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    };
  };
}; // end function filterOptions

const sleep = m => new Promise(r => setTimeout(r, m));
