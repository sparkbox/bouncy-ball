function sourceDump(url, dumpLocation) {

  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        const dumpElement = (typeof dumpLocation === 'string' || dumpLocation instanceof String)
                              ? document.querySelector(dumpLocation)
                              : dumpLocation;

        dumpElement.textContent = request.responseText;
        resolve(request.response);
      } else {
        reject(Error(request.statusText));
      }
    };

    request.onerror = function() {
      reject(Error('Network Error'));
    };

    request.send();
  });
}

module.exports = sourceDump;
