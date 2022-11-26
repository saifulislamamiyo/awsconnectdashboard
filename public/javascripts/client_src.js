(() => {
  'use strict'
  feather.replace()
})()

const filterOptions = (needle, optionItems) => {
  let cleanNeedle = needle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  let pat = new RegExp(cleanNeedle, 'i');
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

const clearSelectOptions = (selectBox) => {
  for (let i = selectBox.options.length - 1; i >= 0; i--) {
    selectBox.remove(i);
  };
} // end clearSelectOptions()

const populateSelectOptions = (selectBox, newItems, except = []) => {
  newItems.forEach(function (item) {
    let skip = false;
    if (except.length>0) skip = -1 < except.findIndex(exceptItem => exceptItem.agentId == item.agentId)
    if (!skip) {
      selectBox.options[selectBox.options.length] = new Option(
        item.agentName,
        item.agentId
      );
    }
  });
} // end populateSelectOptions()


