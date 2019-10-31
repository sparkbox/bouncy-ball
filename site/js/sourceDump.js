function sourceDump(url, dumpLocation, options) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const dumpElement = (typeof dumpLocation === 'string' || dumpLocation instanceof String)
        ? document.querySelector(dumpLocation)
        : dumpLocation;

      // If no dumpLocation value is provided, it won't dump the text,
      // and will defer to the successCallback to handle the response.
      if (dumpElement) {
        dumpElement.textContent = request.responseText;
      }

      if (options.successCallback) {
        options.successCallback(request.response);
      }
    } else {
      console.error(request.statusText, Error(request.statusText));
    }
  };

  request.onerror = () => {
    console.error('Request Failed :(', Error('Network Error'));

    if (options.failureCallback) {
      options.failureCallback();
    }
  };

  request.send();
}

module.exports = sourceDump;
