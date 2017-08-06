(function() {
  'use strict';

  function ga() {
    (ga.q = ga.q || []).push(arguments);
  }

  ga.l = 1 * new Date();

  ga('create', 'UA-6676765-4', 'auto');
  ga('send', 'pageview');

  window.GoogleAnalyticsObject = 'ga';
  window.ga = window.ga || ga;

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.google-analytics.com/analytics.js';
  document.body.appendChild(script);

})();
