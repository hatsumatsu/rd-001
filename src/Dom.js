function getNodeFromString(string) {
  var element = document.createElement('div');
  element.innerHTML = string.trim();

  return element.firstChild;
}

export { getNodeFromString };
